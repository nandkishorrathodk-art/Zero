export class SettingsModule {
    constructor(container) {
        this.container = container;
        this.ui = container.get('ui');
        this.llmProvider = window.llmProvider;
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const openSettingsModal = () => {
            this.loadSavedSettings();
            document.getElementById('settings-modal').style.display = 'flex';
        };

        document.getElementById('btn-settings')?.addEventListener('click', openSettingsModal);
        document.getElementById('welcome-settings-btn')?.addEventListener('click', openSettingsModal);
        document.querySelectorAll('.btn-open-settings, [data-action="settings"]').forEach(btn => {
            btn.addEventListener('click', openSettingsModal);
        });

        document.getElementById('settings-close')?.addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
        });

        document.getElementById('btn-save-settings')?.addEventListener('click', () => this.saveSettings());
    }

    loadSavedSettings() {
        if (!this.llmProvider) return;
        
        const currentProvider = this.llmProvider.currentProvider;
        const providerSelect = document.getElementById('settings-provider');
        if (providerSelect) providerSelect.value = currentProvider;

        const apiKeyInput = document.getElementById('settings-api-key');
        if (apiKeyInput) apiKeyInput.value = this.llmProvider.getApiKey(currentProvider) || '';
        
        // Additional configuration fields could be loaded here
    }

    saveSettings() {
        if (!this.llmProvider) return;

        const providerSelect = document.getElementById('settings-provider');
        const apiKeyInput = document.getElementById('settings-api-key');

        const provider = providerSelect?.value;
        const key = apiKeyInput?.value?.trim();

        if (provider && key) {
            this.llmProvider.setApiKey(provider, key);
            this.ui.showToast('success', 'Settings saved securely');
            document.getElementById('settings-modal').style.display = 'none';
        } else {
            this.ui.showToast('warning', 'Please provide a valid API key');
        }
    }
}
