/* ============================================================
   CONVERSATION MEMORY — Multi-Turn Persistent Context Engine
   Remembers user style preferences, past prompts, agent decisions,
   and review scores to feed historical context into new builds.
   ============================================================ */

class ConversationMemory {
    constructor() {
        this.storageKey = 'zero_builder_conversation_memory_v1';
        this.maxEntries = 30;
        this.memory = this._load();
    }

    _load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return this._getDefaults();
            return JSON.parse(raw);
        } catch (e) {
            console.warn('ConversationMemory load failed:', e.message);
            return this._getDefaults();
        }
    }

    _save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
        } catch (e) {
            console.warn('ConversationMemory save failed:', e.message);
        }
    }

    _getDefaults() {
        return {
            conversations: [],
            stylePreferences: {
                preferredFramework: 'vanilla',
                preferredDesignPhilosophy: 'liquidglass',
                preferredTheme: 'dark',
                colorPreferences: [],
                fontPreferences: []
            },
            successfulBuilds: [], // builds with review score >= 90
            failedBuilds: []
        };
    }

    // Record a completed build or refine turn
    recordBuild({ prompt, framework, designSystem, reviewResult, generatedFiles }) {
        const timestamp = new Date().toISOString();
        const score = reviewResult?.score || 0;
        const entry = {
            id: 'build_' + Date.now(),
            timestamp,
            prompt,
            framework,
            designPhilosophy: designSystem?.designPhilosophy || 'liquidglass',
            score,
            summary: reviewResult?.summary || '',
            fileCount: Object.keys(generatedFiles || {}).length,
            keyComponents: designSystem?.components || []
        };

        this.memory.conversations.unshift(entry);
        if (this.memory.conversations.length > this.maxEntries) {
            this.memory.conversations.pop();
        }

        // Track successful vs failed patterns
        if (score >= 90) {
            this.memory.successfulBuilds.unshift({
                prompt,
                designPhilosophy: entry.designPhilosophy,
                score
            });
            if (this.memory.successfulBuilds.length > 15) this.memory.successfulBuilds.pop();

            // Auto-update learned preferences
            if (entry.designPhilosophy) {
                this.memory.stylePreferences.preferredDesignPhilosophy = entry.designPhilosophy;
            }
            if (framework) {
                this.memory.stylePreferences.preferredFramework = framework;
            }
        } else {
            this.memory.failedBuilds.unshift({
                prompt,
                score,
                issues: (reviewResult?.issues || []).map(i => i.description)
            });
            if (this.memory.failedBuilds.length > 10) this.memory.failedBuilds.pop();
        }

        this._save();
    }

    // Get context summary to feed into Prompt Engineer / Planner
    getMemoryPromptContext() {
        if (!this.memory.conversations.length) return '';

        const recent = this.memory.conversations.slice(0, 3);
        const successes = this.memory.successfulBuilds.slice(0, 3);
        const prefs = this.memory.stylePreferences;

        return `
═══ HISTORICAL CONVERSATION MEMORY (LEARNED USER PREFERENCES) ═══
Preferred Design Philosophy: ${prefs.preferredDesignPhilosophy}
Preferred Framework: ${prefs.preferredFramework}
Recent Successful Styles: ${successes.map(s => `${s.prompt} (${s.designPhilosophy}, score: ${s.score})`).join('; ')}
Recent Prompts: ${recent.map(r => `"${r.prompt}"`).join(', ')}
═════════════════════════════════════════════════════════════════`.trim();
    }

    // Explicitly update style preferences
    setPreference(key, value) {
        if (this.memory.stylePreferences[key] !== undefined) {
            this.memory.stylePreferences[key] = value;
            this._save();
        }
    }

    getPreferences() {
        return this.memory.stylePreferences;
    }

    clear() {
        this.memory = this._getDefaults();
        this._save();
    }
}

window.ConversationMemory = ConversationMemory;
