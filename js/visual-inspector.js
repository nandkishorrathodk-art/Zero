/* ============================================================
   ZERO-BUILDER — Click-to-Edit Visual Preview Inspector
   Allows clicking elements in the iframe preview to inspect,
   edit text, tweak styles, or send targeted AI micro-prompts
   ============================================================ */

class VisualInspector {
    constructor(iframeEl, appController) {
        this.iframe = iframeEl;
        this.app = appController;
        this.isActive = false;
        this.selectedElementInfo = null;
        this.overlayEl = null;
        this.toolbarEl = null;
    }

    toggle() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.enableInspector();
        } else {
            this.disableInspector();
        }
        return this.isActive;
    }

    enableInspector() {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
            if (!doc) return;

            this.injectInspectorStyles(doc);

            doc.addEventListener('mouseover', this.handleMouseOver, true);
            doc.addEventListener('mouseout', this.handleMouseOut, true);
            doc.addEventListener('click', this.handleClick, true);
        } catch (e) {
            console.warn('Unable to attach visual inspector to iframe:', e);
        }
    }

    disableInspector() {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
            if (!doc) return;

            doc.removeEventListener('mouseover', this.handleMouseOver, true);
            doc.removeEventListener('mouseout', this.handleMouseOut, true);
            doc.removeEventListener('click', this.handleClick, true);

            this.removeInspectorStyles(doc);
            this.closeToolbar();
        } catch (e) {
            console.warn('Unable to detach visual inspector:', e);
        }
    }

    injectInspectorStyles(doc) {
        if (doc.getElementById('zero-inspector-css')) return;
        const style = doc.createElement('style');
        style.id = 'zero-inspector-css';
        style.textContent = `
            .zero-hover-highlight {
                outline: 2px dashed #8b5cf6 !important;
                outline-offset: -2px !important;
                cursor: pointer !important;
            }
            .zero-selected-highlight {
                outline: 2px solid #38bdf8 !important;
                outline-offset: -2px !important;
                box-shadow: 0 0 15px rgba(56, 189, 248, 0.4) !important;
            }
        `;
        doc.head.appendChild(style);
    }

    removeInspectorStyles(doc) {
        const el = doc.getElementById('zero-inspector-css');
        if (el) el.remove();
        doc.querySelectorAll('.zero-hover-highlight, .zero-selected-highlight').forEach(node => {
            node.classList.remove('zero-hover-highlight', 'zero-selected-highlight');
        });
    }

    handleMouseOver = (e) => {
        if (!this.isActive) return;
        e.stopPropagation();
        const target = e.target;
        if (target && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
            target.classList.add('zero-hover-highlight');
        }
    };

    handleMouseOut = (e) => {
        if (!this.isActive) return;
        e.stopPropagation();
        if (e.target) {
            e.target.classList.remove('zero-hover-highlight');
        }
    };

    handleClick = (e) => {
        if (!this.isActive) return;
        e.preventDefault();
        e.stopPropagation();

        const target = e.target;
        if (!target) return;

        const doc = this.iframe.contentDocument;
        doc.querySelectorAll('.zero-selected-highlight').forEach(n => n.classList.remove('zero-selected-highlight'));
        target.classList.add('zero-selected-highlight');

        const tag = target.tagName.toLowerCase();
        const text = target.innerText || target.textContent || '';
        const classes = target.className || '';

        this.selectedElementInfo = { target, tag, text, classes };

        this.openInspectorPopup(target, text, classes);
    };

    openInspectorPopup(target, text, classes) {
        this.closeToolbar();

        const popup = document.createElement('div');
        popup.id = 'zero-inspector-toolbar';
        popup.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            border-radius: 12px;
            padding: 12px 16px;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #fafafa;
            font-family: system-ui, sans-serif;
            font-size: 13px;
        `;

        popup.innerHTML = `
            <span style="font-weight:600; color:#8b5cf6;">[${target.tagName.toLowerCase()}]</span>
            <input type="text" id="zero-edit-text" value="${text.substring(0, 40).replace(/"/g, '&quot;')}" 
                   placeholder="Edit text..." style="background:#09090b; border:1px solid #3f3f46; color:#fff; padding:6px 10px; border-radius:6px; width:180px;">
            <button id="zero-btn-apply-text" style="background:#7c3aed; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:500;">Save Text</button>
            <button id="zero-btn-ai-tweak" style="background:#27272a; border:1px solid #3f3f46; color:#38bdf8; padding:6px 12px; border-radius:6px; cursor:pointer;">✨ AI Edit</button>
            <button id="zero-btn-close" style="background:transparent; border:none; color:#a1a1aa; cursor:pointer;">✕</button>
        `;

        document.body.appendChild(popup);
        this.toolbarEl = popup;

        document.getElementById('zero-btn-apply-text')?.addEventListener('click', () => {
            const editInput = document.getElementById('zero-edit-text');
            const newText = editInput ? editInput.value : '';
            target.innerText = newText;
            if (this.app && this.app.editor) {
                // Update workspace editor files
                this.app.syncCurrentFrameToEditor();
            }
            this.closeToolbar();
        });

        document.getElementById('zero-btn-ai-tweak')?.addEventListener('click', () => {
            const promptInput = document.getElementById('welcome-prompt-input') || document.getElementById('prompt-input');
            if (promptInput) {
                promptInput.value = `Modify the <${target.tagName.toLowerCase()}> element "${text.substring(0, 30)}": `;
                promptInput.focus();
            }
            this.closeToolbar();
        });

        document.getElementById('zero-btn-close')?.addEventListener('click', () => {
            this.closeToolbar();
        });
    }

    closeToolbar() {
        if (this.toolbarEl) {
            this.toolbarEl.remove();
            this.toolbarEl = null;
        }
    }
}

window.VisualInspector = VisualInspector;
