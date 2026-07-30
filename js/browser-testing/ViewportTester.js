export class ViewportTester {
    constructor() {
        this.errors = [];
        this.breakpoints = [
            { w: 320, h: 568, label: 'mobile-small' },
            { w: 375, h: 667, label: 'mobile-medium' },
            { w: 390, h: 844, label: 'mobile-large' },
            { w: 768, h: 1024, label: 'tablet' },
            { w: 1024, h: 768, label: 'desktop-small' },
            { w: 1280, h: 800, label: 'desktop-medium' },
            { w: 1440, h: 900, label: 'desktop-large' },
            { w: 1920, h: 1080, label: 'desktop-xlarge' }
        ];
    }

    async testViewports(sandbox, controller) {
        for (const bp of this.breakpoints) {
            await this._simulateViewport(sandbox, controller, bp.w, bp.h);
            this._checkOverflow(sandbox._getDocument(), bp.label);
        }
        await this._restoreViewport(sandbox, controller);
    }

    async _simulateViewport(sandbox, controller, width, height) {
        const iframe = sandbox?.iframe;
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

        if (typeof sandbox.setViewport === 'function') {
            try { await sandbox.setViewport(width, height); } catch {}
        }

        if (iframe.parentElement) {
            iframe.parentElement.style.width = `${width}px`;
            iframe.parentElement.style.height = `${height}px`;
        }

        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;

        await controller.waitForLayoutSettle();
    }

    async _restoreViewport(sandbox, controller) {
        const iframe = sandbox?.iframe;
        if (!iframe || !this._originalViewport) return;

        if (typeof sandbox.setViewport === 'function') {
            try {
                await sandbox.setViewport(
                    this._originalViewport.parentWidth || '100%',
                    this._originalViewport.parentHeight || '100%'
                );
            } catch {}
        }

        if (iframe.parentElement) {
            iframe.parentElement.style.width = this._originalViewport.parentWidth || '100%';
            iframe.parentElement.style.height = this._originalViewport.parentHeight || '100%';
        }

        iframe.style.width = this._originalViewport.iframeWidth || '100%';
        iframe.style.height = this._originalViewport.iframeHeight || '100%';

        this._originalViewport = null;
        await controller.waitForLayoutSettle();
    }

    _checkOverflow(doc, label) {
        if (!doc?.body || !doc?.documentElement) return;

        const bodyWidth = Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth);
        const viewportWidth = doc.documentElement.clientWidth;

        if (bodyWidth > viewportWidth + 10) {
            this.errors.push({
                type: 'layout',
                severity: 'major',
                message: `Horizontal overflow on ${label} (Body: ${bodyWidth}px, Window: ${viewportWidth}px)`,
                timestamp: Date.now(),
            });
        }
    }

    getResults() {
        return { errors: this.errors };
    }
}
