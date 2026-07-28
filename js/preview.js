/* ============================================================
   LIVE PREVIEW — Renders generated code in sandboxed iframe
   Supports local srcdoc preview and local-workspace handoff
   ============================================================ */

class PreviewEngine {
    constructor(iframeEl, emptyStateEl, sandboxManager) {
        this.iframe = iframeEl;
        this.emptyState = emptyStateEl;
        this.sandbox = sandboxManager;
        this.currentDevice = 'desktop';
        this.frameWrapper = iframeEl?.parentElement;
        this.previewErrors = [];
        this.onAudit = null;
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'ZERO_PREVIEW_ERROR' && event.data.message) {
                this.previewErrors.push({ message: event.data.message, timestamp: Date.now() });
            }
        });
    }

    /* ===== RENDER PREVIEW ===== */
    async render(files) {
        if (!files || Object.keys(files).length === 0) {
            this.showEmpty();
            return;
        }

        if (!this.iframe) {
            console.warn('PreviewEngine: iframe element is missing');
            return;
        }

        this.hideEmpty();
        this.previewErrors = [];

        // Fallback when SandboxManager failed to load — still show static HTML if present.
        if (!this.sandbox) {
            const html = String(files['index.html'] || '');
            const css = String(files['styles.css'] || '');
            const js = String(files['script.js'] || '');
            this.iframe.srcdoc = html
                ? html
                    .replace('</head>', css ? `<style>${css}</style></head>` : '</head>')
                    .replace('</body>', js ? `<script>${js}<\/script></body>` : '</body>')
                : '<!doctype html><html><body><h1>Preview unavailable</h1><p>Sandbox manager failed to load.</p></body></html>';
            return;
        }

        const projectType = this.sandbox.getProjectType(files);

        // Local-device preview: static output is rendered directly. Framework
        // projects receive a clear local-workspace handoff instead of a cloud sandbox.
        const fullHtml = this.sandbox.generateLocalPreview(files, projectType);
        this.iframe.srcdoc = fullHtml;
    }

    /* Browser-style interaction audit for generated previews. It never submits
       a form or follows a navigation; it safely exercises editable controls. */
    async runInteractionAudit() {
        await new Promise(resolve => setTimeout(resolve, 250));
        const report = { testedAt: Date.now(), controls: 0, forms: 0, exercisedInputs: 0, errors: [...this.previewErrors], issues: [], devices: [this.currentDevice] };
        try {
            const doc = this.iframe?.contentDocument;
            const view = this.iframe?.contentWindow;
            if (!doc || !view) throw new Error('Preview document is unavailable.');
            const controls = [...doc.querySelectorAll('button, a[href], input, select, textarea')];
            const forms = [...doc.querySelectorAll('form')];
            report.controls = controls.length;
            report.forms = forms.length;

            if (!doc.querySelector('h1')) report.issues.push({ severity: 'warning', type: 'semantic', message: 'No H1 found in preview.' });
            if (!doc.querySelector('main')) report.issues.push({ severity: 'warning', type: 'semantic', message: 'No main landmark found in preview.' });
            if (doc.documentElement.scrollWidth > view.innerWidth + 4) report.issues.push({ severity: 'warning', type: 'responsive', message: 'Horizontal overflow detected at current device width.' });
            if (!controls.length) report.issues.push({ severity: 'warning', type: 'interaction', message: 'No interactive controls found.' });

            forms.forEach((form, index) => {
                if (!form.querySelector('button[type="submit"], input[type="submit"]')) {
                    report.issues.push({ severity: 'warning', type: 'form', message: `Form ${index + 1} has no visible submit control.` });
                }
            });
            controls.filter(node => /^(INPUT|SELECT|TEXTAREA)$/.test(node.tagName)).slice(0, 8).forEach(node => {
                const oldValue = node.value;
                const name = node.getAttribute('name') || node.getAttribute('id');
                const labelled = name && ([...doc.querySelectorAll('label')].some(label => label.htmlFor === name) || node.getAttribute('aria-label') || node.getAttribute('aria-labelledby'));
                if (!labelled) report.issues.push({ severity: 'warning', type: 'accessibility', message: `Input "${name || node.type || 'unnamed'}" needs a label or aria-label.` });
                try {
                    node.focus();
                    if (!['checkbox', 'radio', 'file', 'submit'].includes(node.type)) {
                        node.value = 'ZERO audit';
                        node.dispatchEvent(new Event('input', { bubbles: true }));
                        node.dispatchEvent(new Event('change', { bubbles: true }));
                        node.value = oldValue;
                        report.exercisedInputs++;
                    }
                } catch (error) {
                    report.issues.push({ severity: 'warning', type: 'interaction', message: `Could not exercise an input: ${error.message}` });
                }
            });
        } catch (error) {
            report.issues.push({ severity: 'warning', type: 'browser', message: error.message });
        }
        if (report.errors.length) report.issues.push({ severity: 'critical', type: 'console', message: `${report.errors.length} preview runtime error(s) detected.` });
        report.score = Math.max(0, 100 - report.issues.reduce((sum, issue) => sum + (issue.severity === 'critical' ? 25 : 6), 0));
        this.lastAudit = report;
        this.onAudit?.(report);
        return report;
    }

    /* ===== DEVICE SWITCHING ===== */
    setDevice(device) {
        this.currentDevice = device;
        if (!this.frameWrapper) return;
        
        this.frameWrapper.classList.remove('tablet', 'mobile');
        if (device === 'tablet') {
            this.frameWrapper.classList.add('tablet');
        } else if (device === 'mobile') {
            this.frameWrapper.classList.add('mobile');
        }
    }

    /* ===== REFRESH ===== */
    refresh() {
        if (this.iframe.src && this.iframe.src !== 'about:blank') {
            this.iframe.src = this.iframe.src;
        } else if (this.iframe.srcdoc) {
            const doc = this.iframe.srcdoc;
            this.iframe.srcdoc = '';
            setTimeout(() => { this.iframe.srcdoc = doc; }, 50);
        }
    }

    /* ===== FULLSCREEN ===== */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.iframe.requestFullscreen?.() || this.iframe.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
    }

    /* ===== EMPTY STATE ===== */
    showEmpty() {
        if (this.emptyState) this.emptyState.classList.remove('hidden');
    }

    hideEmpty() {
        if (this.emptyState) this.emptyState.classList.add('hidden');
    }

    /* ===== SCREENSHOT ===== */
    async captureScreenshot() {
        // Note: This only works for same-origin iframes
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.iframe.clientWidth;
            canvas.height = this.iframe.clientHeight;
            // This won't work cross-origin, but good for local preview
            const img = new Image();
            img.src = this.iframe.src;
            ctx.drawImage(img, 0, 0);
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.warn('Screenshot capture not available for cross-origin frames');
            return null;
        }
    }
}

window.PreviewEngine = PreviewEngine;
