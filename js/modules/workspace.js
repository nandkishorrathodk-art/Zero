export class WorkspaceModule {
    constructor(container) {
        this.container = container;
        this.stateManager = container.get('stateManager');
        this.editor = container.get('editor');
        this.ui = container.get('ui');
        this.WORKSPACE_KEY = 'zb_project_workspace_v1';
        this.saveTimer = null;
    }

    init() {
        this.loadWorkspace();

        // Bind editor changes to save
        if (this.editor) {
            this.editor.onChange((files) => {
                // Update UI without a full state loop
                if (this.container.get('fileSystem')) this.container.get('fileSystem').setFiles(files);
                if (this.container.get('preview')) this.container.get('preview').render(files);
                this.scheduleWorkspaceSave();
            });
        }
    }

    scheduleWorkspaceSave() {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.persistWorkspace(), 1000);
    }

    persistWorkspace() {
        const state = this.stateManager.state;
        const files = this.editor ? this.editor.getAllFiles() : {};
        
        const data = {
            projectId: state.workspaceProjectId,
            prompt: state.chatHistory.length > 0 ? state.chatHistory[0].text : '',
            chatHistory: state.chatHistory,
            files: files,
            timestamp: Date.now(),
            requirements: Array.from(state.selectedRequirements),
            buildQuality: state.buildQuality,
            artDirectionPreset: state.artDirectionPreset
        };
        
        try {
            localStorage.setItem(this.WORKSPACE_KEY, JSON.stringify(data));
        } catch (e) {
            this.container.get('errorHandler').handle(e, 'Workspace Save');
        }
    }

    loadWorkspace() {
        try {
            const saved = localStorage.getItem(this.WORKSPACE_KEY);
            if (!saved) return;
            const data = JSON.parse(saved);
            
            if (data.chatHistory) this.stateManager.set('chatHistory', data.chatHistory);
            if (data.requirements) this.stateManager.set('selectedRequirements', new Set(data.requirements));
            if (data.buildQuality) this.stateManager.set('buildQuality', data.buildQuality);
            if (data.artDirectionPreset) this.stateManager.set('artDirectionPreset', data.artDirectionPreset);
            if (data.projectId) this.stateManager.set('workspaceProjectId', data.projectId);
            
            if (data.files && Object.keys(data.files).length > 0) {
                this.ui.syncFiles(data.files);
            }
        } catch (e) {
            this.container.get('errorHandler').handle(e, 'Workspace Load');
        }
    }
}
