/* ============================================================
   ZERO-BUILDER — Live Browser Agent
   Refactored to use the modular BrowserTestingSuite under
   js/browser-testing/ for enterprise-grade scalability.
   ============================================================ */
import { BrowserController } from './browser-testing/BrowserController.js';

class LiveBrowserAgent {
    constructor(sandboxInstance, logCallback = console.log) {
        this.sandbox = sandboxInstance;
        this.log = typeof logCallback === 'function' ? logCallback : console.log;
        
        this.controller = new BrowserController(sandboxInstance, this.log);
        this.isTesting = false;
        
        // Expose legacy properties for backward compatibility if accessed directly
        this.errors = [];
        this.testResults = [];
    }

    async runAutonomousAudit(healerAgent, projectFiles) {
        if (!this.sandbox || !this.sandbox.iframe) {
            this.log('error', 'LiveBrowserAgent: No iframe found.');
            return false;
        }

        if (this.isTesting) {
            this.log('warning', 'LiveBrowserAgent: Audit already in progress.');
            return null;
        }

        this.isTesting = true;
        this.log('info', '[Agent Test] Starting Modular Live Browser Audit...');

        try {
            const report = await this.controller.runFullAudit();
            
            // Map legacy properties
            this.errors = report.allErrors || [];
            this.testResults = report.details?.interactionTester?.testResults || [];

            if (report.status === 'failed' || this.errors.length > 0) {
                this.log('warning', `[Agent Test] Audit completed with issues. Critical/Major: ${report.criticalErrors + report.majorErrors}, Minor: ${report.minorErrors}, Warnings: ${report.warnings}`);

                if (healerAgent && typeof healerAgent.execute === 'function') {
                    this.log('info', '[Agent Test] Dispatching to Healer Agent...');
                    
                    // Filter out critical/major errors to send to Healer
                    const criticalErrors = this.errors.filter(e => e.severity === 'critical' || e.severity === 'major');
                    const errStr = (criticalErrors.length > 0 ? criticalErrors : this.errors).map((e) => `[${e.severity}] ${e.type}: ${e.message}`).join('\n');
                    
                    const fixedFiles = await healerAgent.execute(projectFiles || {}, '', errStr);
                    this.isTesting = false;
                    return fixedFiles;
                }
            } else if (report.status === 'passed_with_warnings') {
                this.log('success', `[Agent Test] Audit passed with ${report.warnings} warnings.`);
            } else {
                this.log('success', '[Agent Test] Passed 100%. No issues detected.');
            }

            return null;
        } catch (e) {
            const isCrossOrigin = /cross-origin|permission denied|securityerror/i.test(e.message || '');
            if (isCrossOrigin) {
                this.log('info', 'LiveBrowserAgent skipped: Preview iframe is hosted cross-origin.');
            } else {
                this.log('error', `LiveBrowserAgent failed: ${e.message}`);
            }
            return null;
        } finally {
            this.controller.cleanup();
            this.isTesting = false;
        }
    }

    dispose() {
        this.controller.cleanup();
        this.errors = [];
        this.testResults = [];
        this.isTesting = false;
    }
}

window.LiveBrowserAgent = LiveBrowserAgent;