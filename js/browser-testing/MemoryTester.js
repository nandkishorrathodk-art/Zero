export class MemoryTester {
    constructor() {
        this.warnings = [];
    }

    inject(win) {
        if (!win) return;
        // In a real environment, we'd monkey-patch addEventListener to track counts,
        // setTimeout/setInterval to track uncleared timers, etc.
        // For this baseline, we track timers.
        
        try {
            const originalSetInterval = win.setInterval;
            const originalClearInterval = win.clearInterval;
            this.intervals = new Set();
            
            win.setInterval = (...args) => {
                const id = originalSetInterval.apply(win, args);
                this.intervals.add(id);
                return id;
            };
            win.clearInterval = (id) => {
                this.intervals.delete(id);
                return originalClearInterval.call(win, id);
            };
        } catch {}
    }

    testMemory(win) {
        if (!win) return;
        try {
            if (this.intervals && this.intervals.size > 10) {
                this.warnings.push({ type: 'memory', severity: 'warning', message: `High number of active intervals detected: ${this.intervals.size}` });
            }
        } catch (error) {
            this.warnings.push({ type: 'memory', severity: 'minor', message: `Memory tester failed: ${error.message}` });
        }
    }

    getResults() {
        return { warnings: this.warnings };
    }
}
