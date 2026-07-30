export class HistoryModule {
    constructor(container) {
        this.container = container;
        this.HISTORY_KEY = 'zb_project_versions_v1';
        this.ui = container.get('ui');
    }

    init() {
        document.getElementById('btn-history')?.addEventListener('click', () => {
            this.renderHistory();
            document.getElementById('history-modal').style.display = 'flex';
        });
        
        document.getElementById('btn-save-snapshot')?.addEventListener('click', () => {
            this.createSnapshot('Manual snapshot');
        });
        
        document.getElementById('btn-clear-history')?.addEventListener('click', () => {
            if (confirm('Clear every saved project version? Your current workspace will remain untouched.')) {
                localStorage.removeItem(this.HISTORY_KEY);
                this.renderHistory();
                this.ui.showToast('info', 'Project versions cleared');
            }
        });
    }

    createSnapshot(label) {
        const editor = this.container.get('editor');
        if (!editor) return;
        
        const files = editor.getAllFiles();
        if (Object.keys(files).length === 0) return;

        const history = JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
        history.unshift({
            id: Date.now().toString(),
            timestamp: Date.now(),
            label: label,
            files: files
        });
        
        // Keep last 20 versions
        if (history.length > 20) history.pop();
        
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    }

    renderHistory() {
        const container = document.getElementById('history-list');
        if (!container) return;
        
        const history = JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
        container.innerHTML = '';
        
        if (history.length === 0) {
            container.innerHTML = '<div style="color:var(--text-secondary); text-align:center; padding: 2rem;">No history yet.</div>';
            return;
        }

        history.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            el.innerHTML = `
                <div>
                    <div style="font-weight: 500;">${this._escapeHtml(item.label)}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(item.timestamp).toLocaleString()}</div>
                </div>
                <button class="history-restore-btn" data-id="${item.id}">Restore</button>
            `;
            container.appendChild(el);
        });

        container.querySelectorAll('.history-restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.restoreSnapshot(id);
                document.getElementById('history-modal').style.display = 'none';
            });
        });
    }

    restoreSnapshot(id) {
        const history = JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
        const snapshot = history.find(h => h.id === id);
        if (snapshot && snapshot.files) {
            this.ui.syncFiles(snapshot.files);
            this.ui.showToast('success', 'Project restored to ' + snapshot.label);
            const workspace = this.container.get('workspace');
            if (workspace) workspace.scheduleWorkspaceSave();
        }
    }
    
    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
