/* ============================================================
   ZERO-BUILDER — Autonomous Batcher (100+ Files Scale Engine)
   Breaks down large projects into context-pruned file batches 
   to prevent LLM context saturation and hallucination.
   ============================================================ */

class AutonomousBatcher {
    constructor() {
        this.batches = [];
        this.currentBatchIndex = 0;
    }

    createBatches(forecast, specification, intent) {
        // If forecast says > 30 files, we need batching.
        this.batches = [];
        
        // Batch 1: Core System & Tokens
        this.batches.push({
            id: 'core-system',
            description: 'Generate global styles, design tokens, and core configurations.',
            filesTarget: ['styles.css', 'globals.css', 'tailwind.config.js', 'package.json']
        });

        // Batch 2: Shared UI Components
        this.batches.push({
            id: 'shared-components',
            description: 'Generate reusable layout, buttons, inputs, and navigation elements.',
            filesTarget: ['components/Button.jsx', 'components/Header.jsx', 'components/Footer.jsx', 'components/Input.jsx']
        });

        // Batch 3: Integrations & Data
        if (forecast.integrations && forecast.integrations.length > 0) {
            this.batches.push({
                id: 'data-integrations',
                description: 'Generate server endpoints, database connections, and auth hooks.',
                filesTarget: ['lib/supabase.js', 'lib/stripe.js', 'api/webhook.js']
            });
        }

        // Batch 4: Primary Page Views
        this.batches.push({
            id: 'primary-views',
            description: 'Generate the hero, main landing page, and primary journey.',
            filesTarget: ['index.html', 'app.js', 'pages/index.jsx']
        });

        // Batch 5: Secondary Views
        this.batches.push({
            id: 'secondary-views',
            description: 'Generate secondary pages, success/error states, and dashboard views.',
            filesTarget: ['pages/success.jsx', 'pages/dashboard.jsx', '404.html']
        });

        return this.batches;
    }

    getNextBatch() {
        if (this.currentBatchIndex < this.batches.length) {
            const batch = this.batches[this.currentBatchIndex];
            this.currentBatchIndex++;
            return batch;
        }
        return null;
    }

    hasMoreBatches() {
        return this.currentBatchIndex < this.batches.length;
    }

    reset() {
        this.currentBatchIndex = 0;
    }

    // Prune context by keeping only files that are dependencies for the current batch
    pruneContext(allFiles, currentBatch) {
        const prunedFiles = {};
        
        // Always include core config files as context
        const globalFiles = ['package.json', 'tailwind.config.js', 'styles.css', 'globals.css'];
        
        for (const [filename, content] of Object.entries(allFiles)) {
            // Keep it if it's a global file, or if it's explicitly part of the target
            if (globalFiles.includes(filename) || currentBatch.filesTarget.some(target => filename.includes(target))) {
                prunedFiles[filename] = content;
            } else {
                // For other files, just include the signatures/exports (mocked here as truncated)
                prunedFiles[filename] = `// [TRUNCATED] Content of ${filename} omitted for context size.\n// Exists in project.`;
            }
        }
        
        return prunedFiles;
    }
}

window.AutonomousBatcher = AutonomousBatcher;
