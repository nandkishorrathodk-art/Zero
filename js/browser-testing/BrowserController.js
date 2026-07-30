import { ConsoleSniffer } from './ConsoleSniffer.js';
import { NetworkTester } from './NetworkTester.js';
import { ViewportTester } from './ViewportTester.js';
import { InteractionTester } from './InteractionTester.js';
import { PerformanceTester } from './PerformanceTester.js';
import { AccessibilityTester } from './AccessibilityTester.js';
import { AnimationTester } from './AnimationTester.js';
import { MemoryTester } from './MemoryTester.js';
import { ScreenshotEngine } from './ScreenshotEngine.js';
import { VisualDiff } from './VisualDiff.js';
import { ReportBuilder } from './ReportBuilder.js';

export class BrowserController {
    constructor(sandboxInstance, logCallback = console.log) {
        this.sandbox = sandboxInstance;
        this.log = typeof logCallback === 'function' ? logCallback : console.log;
        
        this.modules = {
            consoleSniffer: new ConsoleSniffer(),
            networkTester: new NetworkTester(),
            viewportTester: new ViewportTester(),
            interactionTester: new InteractionTester(),
            performanceTester: new PerformanceTester(),
            accessibilityTester: new AccessibilityTester(),
            animationTester: new AnimationTester(),
            memoryTester: new MemoryTester(),
            screenshotEngine: new ScreenshotEngine(),
            visualDiff: new VisualDiff()
        };
        this.reportBuilder = new ReportBuilder();
    }

    async runFullAudit() {
        const win = this._getWindow();
        const doc = this._getDocument();
        if (!win || !doc) throw new Error('Cannot access iframe window/document');

        // 1. Inject Sniffers & Testers immediately
        this.modules.consoleSniffer.inject(win);
        this.modules.networkTester.inject(win);
        this.modules.memoryTester.inject(win);

        // 2. Wait for DOM Idle
        await this.waitForDOMIdle(doc);
        await this.waitForAssets(doc);

        // 3. Viewport Tests
        await this.modules.viewportTester.testViewports(this.sandbox, this);

        // 4. Interactions
        await this.modules.interactionTester.testInteractions(doc, this);

        // 5. Performance, Accessibility, Animation, Memory
        await this.modules.performanceTester.gatherMetrics(win);
        this.modules.accessibilityTester.testAccessibility(doc);
        this.modules.animationTester.testAnimations(win);
        this.modules.memoryTester.testMemory(win);

        // 6. Visual captures
        await this.modules.screenshotEngine.capture(win, 'final_state');

        // Generate Report
        return this.reportBuilder.build(this.modules);
    }

    cleanup() {
        this.modules.consoleSniffer.cleanup();
    }

    // --- Utilities ---
    _getWindow() {
        try { return this.sandbox?.iframe?.contentWindow || null; } catch { return null; }
    }

    _getDocument() {
        try {
            const win = this._getWindow();
            const doc = this.sandbox?.iframe?.contentDocument || win?.document || null;
            if (doc) void doc.body; 
            return doc;
        } catch { return null; }
    }

    waitForNextFrame() {
        return new Promise(resolve => {
            const win = this._getWindow();
            if (win && win.requestAnimationFrame) win.requestAnimationFrame(resolve);
            else setTimeout(resolve, 16);
        });
    }

    waitForLayoutSettle(ms = 50) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    waitForDOMIdle(doc) {
        return new Promise(resolve => {
            const win = doc.defaultView;
            if (win && win.requestIdleCallback) {
                win.requestIdleCallback(() => resolve(), { timeout: 2000 });
            } else {
                setTimeout(resolve, 500); // Fallback
            }
        });
    }

    waitForAssets(doc) {
        return new Promise(resolve => {
            if (doc.readyState === 'complete') resolve();
            else doc.defaultView.addEventListener('load', resolve, { once: true });
        });
    }
}
