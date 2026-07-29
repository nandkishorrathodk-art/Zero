/* ============================================================
   ZERO-BUILDER — Live Browser Agent
   Runs automated DOM test scripts in the preview sandbox,
   interacts with forms/buttons, checks mobile views, and
   captures runtime console errors for HealerAgent.
   Upgraded: cleanup, safer error sniffer, better viewport
   restore, richer interaction checks, and resilient audit flow.
   ============================================================ */

class LiveBrowserAgent {
    constructor(sandboxInstance, logCallback = console.log) {
        this.sandbox = sandboxInstance;
        this.log = typeof logCallback === 'function' ? logCallback : console.log;

        this.errors = [];
        this.testResults = [];
        this.isTesting = false;

        this._snifferCleanup = null;
        this._originalViewport = null;
        this._rafToken = null;
    }

    /* ============================================================
       Public API
       ============================================================ */

    async runAutonomousAudit(healerAgent, projectFiles) {
        if (!this.sandbox || !this.sandbox.iframe) {
            this.log('error', 'LiveBrowserAgent: No iframe found.');
            return false;
        }

        if (this.isTesting) {
            this.log('warning', 'LiveBrowserAgent: Audit already in progress.');
            return null;
        }

        this.isTesting = true;
        this.errors = [];
        this.testResults = [];

        this.log('info', '[Agent Test] Starting Live Browser Audit...');

        try {
            const doc = this._getDocument();
            const win = this._getWindow();

            if (!doc) throw new Error('Cannot access iframe document');

            // 1. Inject error sniffer
            this._injectErrorSniffer(win);

            // 2. Mobile viewport check
            this.log('info', 'Running mobile overflow check...');
            await this._simulateViewport(375, 812);
            this._checkOverflow(doc, 'mobile');

            // 3. Desktop viewport check
            this.log('info', 'Running desktop check...');
            await this._simulateViewport(1440, 900);
            this._checkOverflow(doc, 'desktop');

            // 4. Basic accessibility / interaction checks
            this.log('info', 'Simulating user interactions...');
            await this._interactWithElements(doc);

            // 5. Wait for async errors and layout settle
            await this._delay(1000);

            // Restore original viewport
            await this._restoreViewport();

            if (this.errors.length > 0) {
                this.log('warning', `[Agent Test] Found ${this.errors.length} runtime errors.`);

                if (healerAgent && typeof healerAgent.execute === 'function') {
                    this.log('info', '[Agent Test] Dispatching to Healer Agent...');
                    const errStr = this.errors.map((e) => e.message).join('\n');
                    const fixedFiles = await healerAgent.execute(projectFiles || {}, '', errStr);
                    this.isTesting = false;
                    return fixedFiles;
                }
            } else {
                this.log('success', '[Agent Test] Passed 100%. No console errors or overflows.');
            }

            return null;
        } catch (e) {
            const isCrossOrigin = /cross-origin|permission denied|securityerror/i.test(e.message || '');
            if (isCrossOrigin) {
                this.log('info', 'LiveBrowserAgent skipped: Preview iframe is hosted cross-origin.');
            } else {
                this.log('error', `LiveBrowserAgent failed: ${e.message}`);
            }
            return null;
        } finally {
            this._cleanupSniffer();
            this.isTesting = false;
        }
    }

    dispose() {
        this._cleanupSniffer();
        this._restoreViewport();
        this.errors = [];
        this.testResults = [];
        this.isTesting = false;
    }

    /* ============================================================
       Window / document helpers
       ============================================================ */

    _getWindow() {
        try {
            return this.sandbox?.iframe?.contentWindow || null;
        } catch {
            return null;
        }
    }

    _getDocument() {
        try {
            const win = this._getWindow();
            const doc = this.sandbox?.iframe?.contentDocument || win?.document || null;
            if (doc) void doc.body; // Probe property to catch cross-origin security errors
            return doc;
        } catch {
            return null;
        }
    }

    /* ============================================================
       Error sniffer
       ============================================================ */

    _injectErrorSniffer(win) {
        if (!win) return;

        try {
            // Clean up any prior hooks before adding fresh ones.
            this._cleanupSniffer();

            const prevOnError = win.onerror;
            const prevConsoleError = win.console?.error;
            const prevUnhandledRejection = win.onunhandledrejection;

        const pushError = (type, message, meta = {}) => {
            this.errors.push({
                type,
                message: String(message || '').trim(),
                timestamp: Date.now(),
                ...meta,
            });
        };

        const onError = (message, source, lineno, colno, error) => {
            const msg = error?.stack || `${message} at ${lineno}:${colno}`;
            pushError('runtime', msg, { source, lineno, colno });
            if (typeof prevOnError === 'function') {
                try { return prevOnError(message, source, lineno, colno, error); } catch { /* ignore */ }
            }
            return false;
        };

        const onConsoleError = (...args) => {
            pushError('console', args.map((a) => this._stringify(a)).join(' '));
            if (typeof prevConsoleError === 'function') {
                try { prevConsoleError.apply(win.console, args); } catch { /* ignore */ }
            }
        };

        const onUnhandledRejection = (event) => {
            const reason = event?.reason;
            pushError('promise', `Unhandled Rejection: ${this._stringify(reason)}`);
            if (typeof prevUnhandledRejection === 'function') {
                try { return prevUnhandledRejection.call(win, event); } catch { /* ignore */ }
            }
            return undefined;
        };

        win.onerror = onError;
        if (win.console) win.console.error = onConsoleError;
        win.onunhandledrejection = onUnhandledRejection;

        // More robust event listener as a backup.
        const rejectionListener = (event) => {
            const reason = event?.reason;
            pushError('promise', `Unhandled Rejection: ${this._stringify(reason)}`);
        };
        win.addEventListener?.('unhandledrejection', rejectionListener);

        this._snifferCleanup = () => {
            try {
                if (win.onerror === onError) win.onerror = prevOnError || null;
                if (win.console && win.console.error === onConsoleError) win.console.error = prevConsoleError || console.error;
                if (win.onunhandledrejection === onUnhandledRejection) win.onunhandledrejection = prevUnhandledRejection || null;
                win.removeEventListener?.('unhandledrejection', rejectionListener);
            } catch {
                // ignore cleanup errors
            }
        };
        } catch {
            // Accessing cross-origin window properties threw a SecurityError
            this._snifferCleanup = null;
        }
    }

    _cleanupSniffer() {
        if (typeof this._snifferCleanup === 'function') {
            try {
                this._snifferCleanup();
            } catch {
                // ignore cleanup errors
            }
        }
        this._snifferCleanup = null;
    }

    /* ============================================================
       Viewport simulation
       ============================================================ */

    async _simulateViewport(width, height) {
        const iframe = this.sandbox?.iframe;
        if (!iframe) return;

        if (!this._originalViewport) {
            const parent = iframe.parentElement;
            this._originalViewport = {
                parentWidth: parent?.style?.width || '',
                parentHeight: parent?.style?.height || '',
                iframeWidth: iframe.style.width || '',
                iframeHeight: iframe.style.height || '',
            };
        }

        // Prefer sandbox-provided resizing if available.
        if (typeof this.sandbox.setViewport === 'function') {
            try {
                await this.sandbox.setViewport(width, height);
            } catch {
                // fall back to DOM sizing below
            }
        }

        if (iframe.parentElement) {
            iframe.parentElement.style.width = `${width}px`;
            iframe.parentElement.style.height = `${height}px`;
        }

        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;

        await this._delay(450);
        this._forceReflow();
    }

    async _restoreViewport() {
        const iframe = this.sandbox?.iframe;
        if (!iframe || !this._originalViewport) return;

        if (typeof this.sandbox.setViewport === 'function') {
            try {
                await this.sandbox.setViewport(
                    this._originalViewport.parentWidth || '100%',
                    this._originalViewport.parentHeight || '100%'
                );
            } catch {
                // ignore
            }
        }

        if (iframe.parentElement) {
            iframe.parentElement.style.width = this._originalViewport.parentWidth || '100%';
            iframe.parentElement.style.height = this._originalViewport.parentHeight || '100%';
        }

        iframe.style.width = this._originalViewport.iframeWidth || '100%';
        iframe.style.height = this._originalViewport.iframeHeight || '100%';

        this._originalViewport = null;
        await this._delay(250);
        this._forceReflow();
    }

    /* ============================================================
       Checks
       ============================================================ */

    _checkOverflow(doc, label = 'viewport') {
        if (!doc?.body || !doc?.documentElement) return;

        const bodyWidth = Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth);
        const viewportWidth = doc.documentElement.clientWidth;

        if (bodyWidth > viewportWidth + 10) {
            this.errors.push({
                type: 'layout',
                message: `Horizontal overflow detected on ${label} view (Body: ${bodyWidth}px, Window: ${viewportWidth}px)`,
                timestamp: Date.now(),
            });
        }

        const bodyHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
        const viewportHeight = doc.documentElement.clientHeight;

        if (bodyHeight <= 0 || viewportHeight <= 0) {
            this.errors.push({
                type: 'layout',
                message: `Invalid viewport metrics detected on ${label} view.`,
                timestamp: Date.now(),
            });
        }
    }

    async _interactWithElements(doc) {
        if (!doc) return;

        const clickableSelectors = [
            'button',
            'a[href]',
            'input[type="submit"]',
            '[role="button"]',
            '[data-clickable]',
        ].join(', ');

        const buttons = Array.from(doc.querySelectorAll(clickableSelectors))
            .filter((el) => this._isVisible(el))
            .slice(0, 8);

        for (const el of buttons) {
            try {
                this._focusAndClick(el);
                this.testResults.push({
                    type: 'interaction',
                    target: this._label(el),
                    ok: true,
                });
                await this._delay(180);
            } catch (error) {
                this.errors.push({
                    type: 'interaction',
                    message: `Failed interaction on ${this._label(el)}: ${error.message}`,
                    timestamp: Date.now(),
                });
            }
        }

        const textInputs = Array.from(
            doc.querySelectorAll('input[type="email"], input[type="text"], input:not([type]), textarea')
        )
            .filter((el) => this._isVisible(el))
            .slice(0, 5);

        for (const input of textInputs) {
            try {
                this._fillInput(input, 'test@zero-builder.ai');
                this.testResults.push({
                    type: 'input',
                    target: this._label(input),
                    ok: true,
                });
                await this._delay(80);
            } catch (error) {
                this.errors.push({
                    type: 'interaction',
                    message: `Failed to fill ${this._label(input)}: ${error.message}`,
                    timestamp: Date.now(),
                });
            }
        }

        const submits = Array.from(doc.querySelectorAll('form'))
            .filter((form) => this._isVisible(form))
            .slice(0, 3);

        for (const form of submits) {
            try {
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    this._focusAndClick(submitBtn);
                    await this._delay(150);
                } else {
                    const evt = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(evt);
                    await this._delay(150);
                }
                this.testResults.push({
                    type: 'form',
                    target: this._label(form),
                    ok: true,
                });
            } catch (error) {
                this.errors.push({
                    type: 'interaction',
                    message: `Form interaction failed: ${error.message}`,
                    timestamp: Date.now(),
                });
            }
        }
    }

    /* ============================================================
       DOM interaction utilities
       ============================================================ */

    _focusAndClick(el) {
        if (!el) return;
        try { el.focus?.(); } catch { /* ignore */ }
        try {
            el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            el.click?.();
        } catch (error) {
            // Fallback to synthetic click
            const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
            el.dispatchEvent(evt);
        }
    }

    _fillInput(input, value) {
        if (!input) return;

        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set
            || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
            || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

        if (setter) setter.call(input, value);
        else input.value = value;

        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
    }

    _isVisible(el) {
        if (!el) return false;
        const style = el.ownerDocument?.defaultView?.getComputedStyle(el);
        if (!style) return true;

        const rect = el.getBoundingClientRect?.();
        return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            parseFloat(style.opacity || '1') > 0 &&
            rect &&
            rect.width > 0 &&
            rect.height > 0
        );
    }

    _label(el) {
        if (!el) return 'unknown';
        return (
            el.getAttribute?.('aria-label') ||
            el.getAttribute?.('name') ||
            el.textContent?.trim()?.slice(0, 60) ||
            el.tagName?.toLowerCase() ||
            'unknown'
        );
    }

    _stringify(value) {
        if (typeof value === 'string') return value;
        try {
            if (value instanceof Error) return value.stack || value.message;
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    _forceReflow() {
        const iframe = this.sandbox?.iframe;
        if (!iframe?.contentWindow) return;
        try {
            void iframe.contentWindow.document.body.offsetHeight;
        } catch {
            // ignore
        }
    }

    _delay(ms) {
        return new Promise((resolve) => {
            const timer = setTimeout(() => resolve(), ms);
            this._rafToken = timer;
        });
    }
}

window.LiveBrowserAgent = LiveBrowserAgent;