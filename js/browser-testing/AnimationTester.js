export class AnimationTester {
    constructor() {
        this.warnings = [];
    }

    testAnimations(win) {
        if (!win) return;

        try {
            // GSAP Check
            if (win.gsap) {
                const activeTweens = win.gsap.globalTimeline?.getChildren(false, true, true) || [];
                if (activeTweens.length > 50) {
                    this.warnings.push({ type: 'animation', severity: 'warning', message: `High number of GSAP tweens/timelines active: ${activeTweens.length}` });
                }
            }

            // ScrollTrigger Check
            if (win.ScrollTrigger) {
                const activeTriggers = win.ScrollTrigger.getAll?.() || [];
                if (activeTriggers.length > 30) {
                    this.warnings.push({ type: 'animation', severity: 'warning', message: `High number of ScrollTriggers: ${activeTriggers.length}` });
                }
            }

            // Potential RAF loops check (heuristic: monkey patch rAF briefly to see if it's called excessively without clear reason, though hard to do safely here. We skip for now and rely on performance metrics.)
        } catch (error) {
            this.warnings.push({ type: 'animation', severity: 'minor', message: `Animation tester failed: ${error.message}` });
        }
    }

    getResults() {
        return { warnings: this.warnings };
    }
}
