/* ============================================================
   ZERO-BUILDER — Main Application Controller
   Orchestrates all modules: UI, agents, editor, preview, etc.
   ============================================================ */

import { AppContainer } from './core/AppContainer.js';
import { StateManager } from './core/StateManager.js';
import { ErrorHandler } from './core/ErrorHandler.js';

import { UIModule } from './modules/ui.js';
import { WorkspaceModule } from './modules/workspace.js';
import { ChatModule } from './modules/chat.js';
import { HistoryModule } from './modules/history.js';
import { ProviderModule } from './modules/provider.js';
import { SettingsModule } from './modules/settings.js';
import { DeployModule } from './modules/deploy.js';

(async function bootstrap() {
    'use strict';
    console.log('Bootstrapping ZERO-BUILDER modular architecture...');

    const container = new AppContainer();

    // 1. Initialize Core Services
    const errorHandler = new ErrorHandler();
    errorHandler.init();
    container.register('errorHandler', errorHandler);

    const stateManager = new StateManager();
    container.register('stateManager', stateManager);

    // 2. Register External / Legacy Services Safely
    try {
        const sandbox = typeof SandboxManager !== 'undefined' ? new SandboxManager() : null;
        container.register('sandbox', sandbox);

        const fileTreeEl = document.getElementById('file-tree');
        const fileSystem = typeof FileSystem !== 'undefined' ? new FileSystem(fileTreeEl) : null;
        container.register('fileSystem', fileSystem);

        const editor = typeof CodeEditor !== 'undefined' ? new CodeEditor(
            document.getElementById('editor-container'),
            document.getElementById('editor-tabs')
        ) : null;
        container.register('editor', editor);

        const preview = typeof PreviewEngine !== 'undefined' ? new PreviewEngine(
            document.getElementById('preview-iframe'),
            document.getElementById('preview-empty'),
            sandbox
        ) : null;
        container.register('preview', preview);

        const framework = typeof AgentFramework !== 'undefined' ? new AgentFramework(window.llmProvider) : null;
        container.register('framework', framework);
        if (framework) {
            window.agentFramework = framework; // Expose for HUDs
        }
        
    } catch (e) {
        errorHandler.handle(e, 'Service Registration');
    }

    // 3. Initialize Domain Modules
    const modules = {
        ui: new UIModule(container),
        workspace: new WorkspaceModule(container),
        chat: new ChatModule(container),
        history: new HistoryModule(container),
        provider: new ProviderModule(container),
        settings: new SettingsModule(container),
        deploy: new DeployModule(container)
    };

    // Register modules in DI container just in case they need cross-communication
    for (const [name, mod] of Object.entries(modules)) {
        container.register(name, mod);
    }

    // 4. Wait for DOM and Boot
    document.addEventListener('DOMContentLoaded', () => {
        try {
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Initialize all modules
            for (const mod of Object.values(modules)) {
                if (typeof mod.init === 'function') {
                    mod.init();
                }
            }
            
            console.log('ZERO-BUILDER initialized successfully via AppContainer');
        } catch (err) {
            errorHandler.handle(err, 'Module Initialization');
        }
    });

})();
