export class UIModule {
    constructor(container) {
        this.container = container;
        this.stateManager = container.get('stateManager');
        this.editor = container.get('editor');
        this.preview = container.get('preview');
        this.fileSystem = container.get('fileSystem');
        
        this.syncPending = false;
        this.stateManager.subscribe(() => this.requestSync());
    }

    init() {
        this.bindEvents();
        this.requestSync();
    }

    bindEvents() {
        // Handle custom errors dispatched by ErrorHandler
        window.addEventListener('zero-error', (e) => {
            const { severity, message } = e.detail;
            this.showToast(severity, message);
        });

        // View Toggles
        document.querySelectorAll('.ws-view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ws-view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const view = btn.dataset.view;
                const contentArea = document.getElementById('ws-content-area');
                if (contentArea) contentArea.dataset.view = view;

                if (view === 'code' || view === 'split') {
                    setTimeout(() => { if (this.editor) this.editor.refresh(); }, 50);
                }
            });
        });

        // Modals
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.style.display = 'none';
            });
        });
    }

    requestSync() {
        if (!this.syncPending) {
            this.syncPending = true;
            // Debounce via requestAnimationFrame
            requestAnimationFrame(() => this.syncWorkspaceUI());
        }
    }

    syncWorkspaceUI() {
        this.syncPending = false;
        const state = this.stateManager.state;
        
        // Sync View Mode
        const loadingScreen = document.getElementById('loading-screen');
        const welcomeScreen = document.getElementById('welcome-screen');
        const app = document.getElementById('app');

        if (state.activeView === 'workspace') {
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
                welcomeScreen.classList.add('hidden');
            }
            if (app) app.classList.remove('hidden');
        } else {
            if (welcomeScreen) {
                welcomeScreen.style.display = 'flex';
                welcomeScreen.classList.remove('hidden');
            }
        }
    }

    syncFiles(files) {
        if (this.editor) this.editor.setFiles(files);
        if (this.fileSystem) this.fileSystem.setFiles(files);
        if (this.preview) this.preview.render(files);
    }

    showToast(type, message) {
        const toast = document.createElement('div');
        toast.className = `ws-toast ws-toast-${type}`;
        
        // Sanitize message using DOM-safe textNode mapping
        const textNode = document.createTextNode(message);
        toast.appendChild(textNode);
        
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}
