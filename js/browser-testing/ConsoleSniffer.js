export class ConsoleSniffer {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this._cleanup = null;
    }

    inject(win) {
        if (!win) return;
        try {
            this.cleanup();
            
            const prevOnError = win.onerror;
            const prevConsoleError = win.console?.error;
            const prevConsoleWarn = win.console?.warn;
            const prevConsoleInfo = win.console?.info;
            const prevUnhandledRejection = win.onunhandledrejection;

            const pushLog = (type, severity, message, meta = {}) => {
                const entry = { type, severity, message: String(message || '').trim(), timestamp: Date.now(), ...meta };
                if (severity === 'critical' || severity === 'major' || severity === 'error') {
                    this.errors.push(entry);
                } else if (severity === 'warning') {
                    this.warnings.push(entry);
                }
            };

            win.onerror = (message, source, lineno, colno, error) => {
                const msg = error?.stack || `${message} at ${lineno}:${colno}`;
                pushLog('runtime', 'critical', msg, { source, lineno, colno });
                if (typeof prevOnError === 'function') try { return prevOnError(message, source, lineno, colno, error); } catch {}
                return false;
            };

            if (win.console) {
                win.console.error = (...args) => {
                    pushLog('console', 'error', args.map(a => this._stringify(a)).join(' '));
                    if (typeof prevConsoleError === 'function') try { prevConsoleError.apply(win.console, args); } catch {}
                };
                win.console.warn = (...args) => {
                    pushLog('console', 'warning', args.map(a => this._stringify(a)).join(' '));
                    if (typeof prevConsoleWarn === 'function') try { prevConsoleWarn.apply(win.console, args); } catch {}
                };
                win.console.info = (...args) => {
                    if (typeof prevConsoleInfo === 'function') try { prevConsoleInfo.apply(win.console, args); } catch {}
                };
            }

            win.onunhandledrejection = (event) => {
                pushLog('promise', 'critical', `Unhandled Rejection: ${this._stringify(event?.reason)}`);
                if (typeof prevUnhandledRejection === 'function') try { return prevUnhandledRejection.call(win, event); } catch {}
                return undefined;
            };

            const rejectionListener = (event) => pushLog('promise', 'critical', `Unhandled Rejection: ${this._stringify(event?.reason)}`);
            win.addEventListener?.('unhandledrejection', rejectionListener);

            this._cleanup = () => {
                try {
                    if (win.onerror === win.onerror) win.onerror = prevOnError || null;
                    if (win.console) {
                        if (win.console.error === win.console.error) win.console.error = prevConsoleError || console.error;
                        if (win.console.warn === win.console.warn) win.console.warn = prevConsoleWarn || console.warn;
                    }
                    if (win.onunhandledrejection === win.onunhandledrejection) win.onunhandledrejection = prevUnhandledRejection || null;
                    win.removeEventListener?.('unhandledrejection', rejectionListener);
                } catch {}
            };
        } catch {
            this._cleanup = null;
        }
    }

    cleanup() {
        if (typeof this._cleanup === 'function') {
            try { this._cleanup(); } catch {}
        }
        this._cleanup = null;
    }

    getResults() {
        return { errors: this.errors, warnings: this.warnings };
    }

    _stringify(value) {
        if (typeof value === 'string') return value;
        try { return value instanceof Error ? value.stack || value.message : JSON.stringify(value); } 
        catch { return String(value); }
    }
}
