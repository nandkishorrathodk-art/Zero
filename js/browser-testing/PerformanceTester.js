export class PerformanceTester {
    constructor() {
        this.metrics = {};
        this.errors = [];
        this.warnings = [];
    }

    async gatherMetrics(win) {
        if (!win || !win.performance) return;

        try {
            // Gathering FCP, LCP, Navigation timings
            const paintEntries = win.performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
            if (fcpEntry) this.metrics.fcp = fcpEntry.startTime;

            const navEntries = win.performance.getEntriesByType('navigation');
            if (navEntries.length > 0) {
                const nav = navEntries[0];
                this.metrics.ttfb = nav.responseStart - nav.requestStart;
                this.metrics.domInteractive = nav.domInteractive;
                this.metrics.domComplete = nav.domComplete;
            }

            // Estimate memory if available
            if (win.performance.memory) {
                this.metrics.memoryUsedMB = win.performance.memory.usedJSHeapSize / (1024 * 1024);
                if (this.metrics.memoryUsedMB > 150) {
                    this.warnings.push({ type: 'performance', severity: 'warning', message: `High memory usage: ${Math.round(this.metrics.memoryUsedMB)}MB` });
                }
            }

            // Detect Long Tasks (blocking main thread)
            const longTasks = win.performance.getEntriesByType?.('longtask') || [];
            if (longTasks.length > 5) {
                this.warnings.push({ type: 'performance', severity: 'warning', message: `Detected ${longTasks.length} long tasks. Main thread might be blocked.` });
            }

        } catch (e) {
            this.errors.push({ type: 'performance', severity: 'minor', message: `Failed to gather performance metrics: ${e.message}` });
        }
    }

    getResults() {
        return { metrics: this.metrics, errors: this.errors, warnings: this.warnings };
    }
}
