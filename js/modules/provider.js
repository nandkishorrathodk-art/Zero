export class ProviderModule {
    constructor(container) {
        this.container = container;
        this.ui = container.get('ui');
        this.llmProvider = window.llmProvider; // Assuming this is instantiated elsewhere or loaded globally
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Toggle provider dropdown
        document.getElementById('provider-btn')?.addEventListener('click', () => this.toggleProviderDropdown());
        document.getElementById('welcome-model-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleProviderDropdown();
        });

        // Provider Options
        document.querySelectorAll('.provider-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectProvider(btn.dataset.provider);
            });
        });
        
        // Hide on outside click
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('provider-dropdown');
            const btn = document.getElementById('provider-btn');
            if (dropdown?.style.display !== 'none' && !dropdown?.contains(e.target) && !btn?.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    toggleProviderDropdown() {
        const dropdown = document.getElementById('provider-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }

    selectProvider(providerId) {
        if (!this.llmProvider) return;
        
        try {
            this.llmProvider.setProvider(providerId);
            this.ui.showToast('info', `Provider switched to ${providerId}`);
            
            // Update UI elements showing current provider
            document.querySelectorAll('.current-provider-name').forEach(el => {
                el.textContent = providerId.toUpperCase();
            });
            
            this.toggleProviderDropdown();
        } catch (e) {
            this.ui.showToast('error', `Failed to switch provider: ${e.message}`);
        }
    }
}
