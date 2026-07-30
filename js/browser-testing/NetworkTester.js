export class NetworkTester {
    constructor() {
        this.errors = [];
    }

    inject(win) {
        if (!win) return;
        
        try {
            // Monitor failed resource loads (images, scripts, etc.)
            win.addEventListener('error', (e) => {
                // If it's a resource load error (not a script execution error)
                if (e.target && (e.target.src || e.target.href)) {
                    this.errors.push({
                        type: 'network',
                        severity: 'major',
                        message: `Failed to load resource: ${e.target.src || e.target.href}`,
                        timestamp: Date.now()
                    });
                }
            }, true);

            // Wrap fetch to catch 404/500/CORS
            const originalFetch = win.fetch;
            win.fetch = async (...args) => {
                try {
                    const response = await originalFetch.apply(win, args);
                    if (!response.ok) {
                        this.errors.push({
                            type: 'network',
                            severity: response.status >= 500 ? 'critical' : 'major',
                            message: `Fetch failed with status ${response.status}: ${args[0]}`,
                            timestamp: Date.now()
                        });
                    }
                    return response;
                } catch (err) {
                    this.errors.push({
                        type: 'network',
                        severity: 'critical',
                        message: `Fetch error (CORS/Network): ${err.message}`,
                        timestamp: Date.now()
                    });
                    throw err;
                }
            };
            
            // Wrap XHR if needed, though fetch is standard modern way.
        } catch {}
    }

    getResults() {
        return { errors: this.errors };
    }
}
