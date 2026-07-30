export class AccessibilityTester {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    testAccessibility(doc) {
        if (!doc) return;

        try {
            // Check alt text on images
            const images = Array.from(doc.querySelectorAll('img'));
            images.forEach(img => {
                if (!img.hasAttribute('alt')) {
                    this.errors.push({ type: 'a11y', severity: 'major', message: `Missing alt attribute on <img>: ${img.src}` });
                }
            });

            // Check input labels
            const inputs = Array.from(doc.querySelectorAll('input:not([type="submit"]):not([type="hidden"])'));
            inputs.forEach(input => {
                const id = input.id;
                const hasLabel = (id && doc.querySelector(`label[for="${id}"]`)) || input.closest('label') || input.hasAttribute('aria-label');
                if (!hasLabel) {
                    this.warnings.push({ type: 'a11y', severity: 'warning', message: `Input missing associated label or aria-label: ${input.name || input.type}` });
                }
            });

            // Check heading hierarchy (basic check)
            const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            let previousLevel = 0;
            headings.forEach(h => {
                const level = parseInt(h.tagName.substring(1));
                if (previousLevel > 0 && level - previousLevel > 1) {
                    this.warnings.push({ type: 'a11y', severity: 'warning', message: `Skipped heading level: H${previousLevel} to H${level}` });
                }
                previousLevel = level;
            });

            // Check if H1 exists
            if (!doc.querySelector('h1')) {
                this.warnings.push({ type: 'a11y', severity: 'warning', message: 'Page is missing an H1 heading.' });
            }

        } catch (error) {
            this.errors.push({ type: 'a11y', severity: 'minor', message: `Accessibility tester failed: ${error.message}` });
        }
    }

    getResults() {
        return { errors: this.errors, warnings: this.warnings };
    }
}
