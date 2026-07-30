export class StateManager {
    constructor() {
        this.state = {
            isGenerating: false,
            chatHistory: [],
            selectedRequirements: new Set(),
            buildQuality: 'production',
            artDirectionPreset: 'cinematic',
            workspaceProjectId: this._createProjectId(),
            activeView: localStorage.getItem('zb_active_view') || 'welcome'
        };
        this.listeners = new Set();
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        if (this.state[key] !== value) {
            this.state[key] = value;
            this.notify();
        }
    }
    
    update(updates) {
        let changed = false;
        for (const [key, value] of Object.entries(updates)) {
            if (this.state[key] !== value) {
                this.state[key] = value;
                changed = true;
            }
        }
        if (changed) {
            this.notify();
        }
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        for (const listener of this.listeners) {
            try {
                listener(this.state);
            } catch (err) {
                console.error('State listener error:', err);
            }
        }
    }

    _createProjectId() {
        return 'zb_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    }
}
