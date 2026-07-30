export class InteractionTester {
    constructor() {
        this.errors = [];
        this.testResults = [];
    }

    async testInteractions(doc, controller) {
        if (!doc) return;
        
        await this._testButtons(doc, controller);
        await this._testInputs(doc, controller);
        await this._testForms(doc, controller);
        await this._detectInfiniteScroll(doc);
    }

    async _testButtons(doc, controller) {
        const buttons = Array.from(doc.querySelectorAll('button, a[href], [role="button"], [data-clickable]'))
            .filter(el => this._isVisible(el)).slice(0, 8);
            
        for (const el of buttons) {
            try {
                // Focus, Hover, Down, Up, Click
                try { el.focus?.(); } catch {}
                this._dispatchMouseEvent(el, 'mouseenter');
                this._dispatchMouseEvent(el, 'mouseover');
                await controller.waitForNextFrame();
                this._dispatchMouseEvent(el, 'mousedown');
                this._dispatchMouseEvent(el, 'mouseup');
                el.click?.();
                
                this.testResults.push({ type: 'interaction', target: this._label(el), ok: true });
                await controller.waitForLayoutSettle(100);
            } catch (error) {
                this.errors.push({ type: 'interaction', severity: 'minor', message: `Failed on ${this._label(el)}: ${error.message}` });
            }
        }
    }

    async _testInputs(doc, controller) {
        const inputs = Array.from(doc.querySelectorAll('input[type="email"], input[type="text"], textarea'))
            .filter(el => this._isVisible(el)).slice(0, 5);
            
        for (const input of inputs) {
            try {
                this._fillInput(input, 'test@zero-builder.ai');
                this.testResults.push({ type: 'input', target: this._label(input), ok: true });
                await controller.waitForNextFrame();
            } catch (error) {
                this.errors.push({ type: 'interaction', severity: 'minor', message: `Failed input ${this._label(input)}: ${error.message}` });
            }
        }
    }

    async _testForms(doc, controller) {
        const forms = Array.from(doc.querySelectorAll('form'))
            .filter(form => this._isVisible(form)).slice(0, 3);
            
        for (const form of forms) {
            try {
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    submitBtn.click?.();
                } else {
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
                this.testResults.push({ type: 'form', target: this._label(form), ok: true });
                await controller.waitForLayoutSettle(100);
            } catch (error) {
                this.errors.push({ type: 'interaction', severity: 'major', message: `Form failed: ${error.message}` });
            }
        }
    }

    async _detectInfiniteScroll(doc) {
        // Just a detection mechanism to report it in findings
        const hasIntersectionObserver = typeof doc.defaultView?.IntersectionObserver !== 'undefined';
        if (hasIntersectionObserver) {
            this.testResults.push({ type: 'feature', target: 'IntersectionObserver', ok: true });
        }
    }

    _dispatchMouseEvent(el, type) {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: el.ownerDocument.defaultView }));
    }

    _fillInput(input, value) {
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set
            || Object.getOwnPropertyDescriptor(input.ownerDocument.defaultView.HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(input, value);
        else input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }

    _isVisible(el) {
        if (!el) return false;
        const style = el.ownerDocument?.defaultView?.getComputedStyle(el);
        if (!style) return true;
        const rect = el.getBoundingClientRect?.();
        return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0 && rect?.width > 0 && rect?.height > 0;
    }

    _label(el) {
        return el.getAttribute?.('aria-label') || el.getAttribute?.('name') || el.textContent?.trim()?.slice(0, 30) || el.tagName?.toLowerCase() || 'unknown';
    }

    getResults() {
        return { errors: this.errors, testResults: this.testResults };
    }
}
