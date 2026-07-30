export class ErrorHandler {
    constructor() {
        this.logger = console;
    }

    init() {
        window.addEventListener('error', (e) => {
            const errText = `Runtime Error: ${e.message} at ${e.filename}:${e.lineno}`;
            this.log('error', errText);
        });

        window.addEventListener('unhandledrejection', (e) => {
            const errText = `Unhandled Promise Rejection: ${e.reason}`;
            this.log('error', errText);
        });
    }

    log(severity, message, metadata = {}) {
        const entry = { severity, message, timestamp: Date.now(), metadata };
        
        // Console output
        if (severity === 'error' || severity === 'critical') {
            this.logger.error(message, metadata);
        } else if (severity === 'warning') {
            this.logger.warn(message, metadata);
        } else {
            this.logger.info(message, metadata);
        }

        // Dispatch custom event so UI can render toast or console message
        window.dispatchEvent(new CustomEvent('zero-error', { detail: entry }));
    }

    handle(error, context = '') {
        this.log('error', `${context ? `[${context}] ` : ''}${error.message || error}`, { error });
    }
}
