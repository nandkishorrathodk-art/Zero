/* ============================================================
   ZERO-BUILDER — Main Application Controller
   Orchestrates all modules: UI, agents, editor, preview, etc.
   ============================================================ */

(function () {
    'use strict';

    /* ===== WAIT FOR DOM ===== */
    document.addEventListener('DOMContentLoaded', initApp);

    /* ===== GLOBAL REFERENCES ===== */
    let framework, editor, preview, fileSystem, sandbox, deploy, projectIntake, projectRepository;
    let isGenerating = false;
    let chatHistory = [];
    const WORKSPACE_KEY = 'zb_project_workspace_v1';
    const HISTORY_KEY = 'zb_project_versions_v1';
    let selectedRequirements = new Set();
    let buildQuality = 'production';
    let artDirectionPreset = 'cinematic';
    let workspaceSaveTimer = null;
    let workspaceProjectId = createProjectId();

    /* ===== INITIALIZE APP ===== */
    function initApp() {
        try {
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Initialize modules safely
            sandbox = typeof SandboxManager !== 'undefined' ? new SandboxManager() : null;
            deploy = typeof DeployManager !== 'undefined' ? new DeployManager() : null;
            projectIntake = typeof ProjectIntakeManager !== 'undefined' ? new ProjectIntakeManager() : null;
            projectRepository = typeof ProjectRepositoryManager !== 'undefined' ? new ProjectRepositoryManager() : null;

            const fileTreeEl = document.getElementById('file-tree');
            fileSystem = typeof FileSystem !== 'undefined' ? new FileSystem(fileTreeEl) : null;

            editor = typeof CodeEditor !== 'undefined' ? new CodeEditor(
                document.getElementById('editor-container'),
                document.getElementById('editor-tabs')
            ) : null;

            preview = typeof PreviewEngine !== 'undefined' ? new PreviewEngine(
                document.getElementById('preview-iframe'),
                document.getElementById('preview-empty'),
                sandbox
            ) : null;
            if (preview) {
                preview.onAudit = (report) => {
                    framework?.recordBrowserAudit?.(report);
                    (report.issues || []).slice(0, 4).forEach(issue => addConsoleLog(issue.severity === 'critical' ? 'error' : 'warning', `Browser QA: ${issue.message}`));
                };
            }

            // Initialize agent framework
            framework = typeof AgentFramework !== 'undefined' ? new AgentFramework(window.llmProvider) : null;

            if (framework) {
                // Register all agents safely
                if (typeof PromptEngineerAgent !== 'undefined') framework.registerAgent('prompt-engineer', new PromptEngineerAgent());
                if (typeof PlannerAgent !== 'undefined') framework.registerAgent('planner', new PlannerAgent());
                if (typeof ResearcherAgent !== 'undefined') framework.registerAgent('researcher', new ResearcherAgent());
                if (typeof BrandStrategistAgent !== 'undefined') framework.registerAgent('brand-strategist', new BrandStrategistAgent());
                if (typeof DesignerAgent !== 'undefined') framework.registerAgent('designer', new DesignerAgent());
                if (typeof Coder3DAgent !== 'undefined') framework.registerAgent('coder-3d', new Coder3DAgent());
                if (typeof CoderUIAgent !== 'undefined') framework.registerAgent('coder-ui', new CoderUIAgent());
                if (typeof CoderReactAgent !== 'undefined') framework.registerAgent('coder-react', new CoderReactAgent());
                if (typeof CoderShaderAgent !== 'undefined') framework.registerAgent('coder-shader', new CoderShaderAgent());
                if (typeof CoderGPGPUAgent !== 'undefined') framework.registerAgent('coder-gpgpu', new CoderGPGPUAgent());
                if (typeof CoderWebGPUAgent !== 'undefined') framework.registerAgent('coder-webgpu', new CoderWebGPUAgent());
                if (typeof CoderPhysicsAgent !== 'undefined') framework.registerAgent('coder-physics', new CoderPhysicsAgent());
                if (typeof CoderAudioAgent !== 'undefined') framework.registerAgent('coder-audio', new CoderAudioAgent());
                if (typeof AnimatorAgent !== 'undefined') framework.registerAgent('animator', new AnimatorAgent());
                if (typeof ArchitectAgent !== 'undefined') framework.registerAgent('architect', new ArchitectAgent());
                if (typeof CoderFullstackAgent !== 'undefined') framework.registerAgent('coder-fullstack', new CoderFullstackAgent());
                if (typeof HealerAgent !== 'undefined') framework.registerAgent('healer', new HealerAgent());
                if (typeof PreflightGuard !== 'undefined') framework.setPreflightGuard(new PreflightGuard());
                if (typeof ReviewerAgent !== 'undefined') framework.registerAgent('reviewer', new ReviewerAgent());
                if (typeof RefinerAgent !== 'undefined') framework.registerAgent('refiner', new RefinerAgent());
                if (typeof AgentRecoveryAgent !== 'undefined') framework.registerAgent('fallback-recovery', new AgentRecoveryAgent());
                if (typeof BugFinderAgent !== 'undefined') framework.registerAgent('bug-finder', new BugFinderAgent());
                if (typeof registerProjectIntelligenceAgents !== 'undefined') registerProjectIntelligenceAgents();

                if (typeof MediaGenerator !== 'undefined') {
                    const mediaGen = new MediaGenerator(window.llmProvider);
                    framework.setMediaGenerator(mediaGen);
                }
                if (sandbox) framework.setSandbox(sandbox);

                // Expose framework globally for ReasoningWallHUD and other HUDs
                window.agentFramework = framework;
            }

            // Bridge sandbox ↔ preview iframe for LiveBrowserAgent
            if (sandbox && preview && preview.iframe) {
                sandbox.iframe = preview.iframe;
            }

            // Capture global runtime errors and display them in the terminal
            window.addEventListener('error', (e) => {
                const errText = `Runtime Error: ${e.message} at ${e.filename}:${e.lineno}`;
                addConsoleLog('error', errText);
                saveErrorToLog(errText);
            });
            window.addEventListener('unhandledrejection', (e) => {
                const errText = `Unhandled Promise Rejection: ${e.reason}`;
                addConsoleLog('error', errText);
                saveErrorToLog(errText);
            });

            // Wire up event listeners
            setupAgentEvents();
            setupUIEvents();
            setupConversionLab();
            loadSavedSettings();
            loadWorkspace();
            renderRecentProjects();

            // Connect file system to editor
            if (fileSystem && editor) {
                fileSystem.onFileSelect = (filename) => {
                    editor.openFile(filename);
                };
            }

            // Connect editor changes to preview
            if (editor && fileSystem && preview) {
                editor.onChange((files) => {
                    fileSystem.setFiles(files);
                    preview.render(files);
                    scheduleWorkspaceSave();
                });
            }

            console.log('ZERO-BUILDER initialized successfully');
        } catch (err) {
            console.error('Initialization error in ZERO-BUILDER:', err);
        } finally {
            // Guaranteed: Hide loading screen and restore correct view (Welcome vs Workspace)
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                const welcomeScreen = document.getElementById('welcome-screen');
                const app = document.getElementById('app');
                const activeView = localStorage.getItem('zb_active_view');
                const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY) || 'null');
                const hasSavedData = saved && (saved.prompt || (saved.files && Object.keys(saved.files).length > 0));

                if (activeView === 'workspace' || hasSavedData) {
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

                if (app) app.classList.remove('hidden');
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => loadingScreen.remove(), 600);
                }
                if (editor) editor.refresh();
            }, 500);
        }
    }

    /* ===== AGENT FRAMEWORK EVENTS ===== */
    function setupAgentEvents() {
        if (!framework) {
            console.error('AgentFramework failed to load — generation is unavailable');
            return;
        }

        framework.on('stateChange', ({ from, to }) => {
            updateStepIndicators(to);
        });

        framework.on('progress', ({ step, percent, message }) => {
            updateProgress(percent, message);
        });

        framework.on('log', ({ type, message }) => {
            addConsoleLog(type, message);
        });

        framework.on('filesReady', (files) => {
            if (editor) editor.setFiles(files);
            if (fileSystem) fileSystem.setFiles(files);
            if (preview) {
                preview.render(files);
                preview.runInteractionAudit?.();
            }
            persistWorkspace();
        });

        framework.on('livePreview', ({ files, partial }) => {
            if (editor) editor.setFiles(files);
            if (fileSystem) fileSystem.setFiles(files);
            if (preview) preview.render(files);
            persistWorkspace();
        });

        framework.on('complete', (files) => {
            isGenerating = false;
            updateGenerateButton(false);
            if (files && Object.keys(files).length > 0) {
                if (editor) editor.setFiles(files);
                if (fileSystem) fileSystem.setFiles(files);
                if (preview) preview.render(files);
            }
            createSnapshot('Completed build');
            showToast('success', 'Website generated successfully!');

            // Open chat panel for refinements
            showChatPanel();

            // Render bug report if there are unfixable bugs
            if (framework.memory && framework.memory.bugReport) {
                const report = framework.memory.bugReport;
                const fixableSet = new Set((report.fixable || []).map(b => b?.message || b));
                const unfixable = (report.bugs || []).filter(b => !fixableSet.has(b?.message || b));
                if (unfixable.length > 0) {
                    let html = `<div class="ws-bug-report">
                        <div class="ws-bug-report-title">
                            <i data-lucide="alert-triangle"></i>
                            Action Required: ${unfixable.length} Unresolved Bug(s)
                        </div>
                        <ul>`;

                    for (const bug of unfixable) {
                        html += `<li><strong>${escapeHtml(bug.file || 'file')}:</strong> ${escapeHtml(bug.message || '')}</li>`;
                    }
                    html += `</ul></div>`;

                    addChatMessage('system', html, true);
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            }
        });

        framework.on('error', ({ message }) => {
            isGenerating = false;
            updateGenerateButton(false);
            showToast('error', `Generation failed: ${message}`);
        });
    }

    /* ===== UI EVENT HANDLERS ===== */
    function setupUIEvents() {
        // Welcome Screen Prompt submission
        const welcomePromptInput = document.getElementById('welcome-prompt-input');
        const welcomeSendBtn = document.getElementById('welcome-send-btn');

        welcomeSendBtn?.addEventListener('click', () => handleWelcomeGenerate());
        document.getElementById('welcome-enhance-btn')?.addEventListener('click', () => handleEnhancePrompt());
        welcomePromptInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleWelcomeGenerate();
            }
        });

        // Suggestion Chips — use data-template for Motion Studio prompts
        document.querySelectorAll('.welcome-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const template = chip.dataset.template;
                if (template) {
                    applyTemplate(template);
                } else if (welcomePromptInput) {
                    welcomePromptInput.value = chip.textContent.trim();
                    welcomePromptInput.focus();
                }
            });
        });

        // Welcome screen options
        document.querySelectorAll('.welcome-fw-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.welcome-fw-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const fw = btn.dataset.framework;
                if (!framework) return;
                if (fw === 'react-vite') {
                    framework.frameworkOverride = 'react-vite';
                    showToast('info', 'Target: React + Vite');
                } else if (fw === 'fullstack-nextjs') {
                    framework.frameworkOverride = 'fullstack-nextjs';
                    showToast('info', 'Target: Next.js Full-Stack');
                } else {
                    framework.frameworkOverride = 'vanilla';
                    showToast('info', 'Target: HTML/CSS/JS');
                }
            });
        });

        document.querySelectorAll('.welcome-quality-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                buildQuality = btn.dataset.quality || 'production';
                if (framework) framework.aiMode = buildQuality;
                document.querySelectorAll('.welcome-quality-btn').forEach(item => item.classList.toggle('active', item === btn));
            });
        });

        // Workspace View Toggles
        document.querySelectorAll('.ws-view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ws-view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const view = btn.dataset.view; // 'preview', 'code', 'split'
                const contentArea = document.getElementById('ws-content-area');
                if (contentArea) contentArea.dataset.view = view;

                // Refresh CodeMirror if it becomes visible
                if (view === 'code' || view === 'split') {
                    setTimeout(() => { if (editor) editor.refresh(); }, 50);
                }
            });
        });

        // Settings modal handlers
        const openSettingsModal = () => {
            loadSavedSettings();
            toggleModal('settings-modal', true);
        };
        document.getElementById('btn-settings')?.addEventListener('click', openSettingsModal);
        document.getElementById('welcome-settings-btn')?.addEventListener('click', openSettingsModal);
        document.querySelectorAll('.btn-open-settings, [data-action="settings"]').forEach(btn => {
            btn.addEventListener('click', openSettingsModal);
        });
        document.getElementById('settings-close')?.addEventListener('click', () => toggleModal('settings-modal', false));
        document.getElementById('btn-save-settings')?.addEventListener('click', saveSettings);

        // Provider dropdown
        document.getElementById('provider-btn')?.addEventListener('click', toggleProviderDropdown);
        document.getElementById('welcome-model-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProviderDropdown();
        });
        document.querySelectorAll('.provider-option').forEach(btn => {
            btn.addEventListener('click', () => selectProvider(btn.dataset.provider));
        });

        // Provider settings change — show/hide custom fields & update API key input
        document.getElementById('settings-provider')?.addEventListener('change', (e) => {
            const selectedProv = e.target.value;
            const isCustom = selectedProv === 'custom' || selectedProv === 'ollama';
            const customFields = document.getElementById('custom-provider-fields');
            if (customFields) customFields.style.display = isCustom ? 'block' : 'none';
            updateModelDropdown(selectedProv);

            const settingsKey = document.getElementById('settings-api-key');
            if (settingsKey) settingsKey.value = window.llmProvider.getApiKey(selectedProv) || '';
        });

        // Test connection
        document.getElementById('btn-test-connection')?.addEventListener('click', testConnection);

        // Toggle API key visibility
        document.getElementById('btn-toggle-key')?.addEventListener('click', () => {
            const input = document.getElementById('settings-api-key');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
        document.getElementById('btn-toggle-tavily')?.addEventListener('click', () => {
            const input = document.getElementById('settings-tavily-key');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
        document.getElementById('btn-test-local-bridge')?.addEventListener('click', testLocalBridge);
        document.getElementById('cli-close')?.addEventListener('click', () => {
            const cliModal = document.getElementById('cli-modal');
            if (cliModal) cliModal.style.display = 'none';
        });
        document.getElementById('btn-copy-cli')?.addEventListener('click', () => {
            const code = document.getElementById('cli-command-code')?.textContent;
            if (code) {
                navigator.clipboard.writeText(code);
                showToast('success', 'CLI command copied!');
            }
        });

        // Device switcher
        document.querySelectorAll('.ws-device-btn, .device-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ws-device-btn, .device-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                preview?.setDevice(btn.dataset.device);
            });
        });

        // Preview controls
        document.getElementById('btn-refresh-preview')?.addEventListener('click', () => preview?.refresh());
        document.getElementById('btn-fullscreen')?.addEventListener('click', () => preview?.toggleFullscreen());

        // Visual Inspector
        const visualInspector = typeof VisualInspector !== 'undefined'
            ? new VisualInspector(document.getElementById('preview-iframe'), {
                editor,
                syncCurrentFrameToEditor() {
                    // Extract current iframe HTML and sync back to editor/filesystem
                    try {
                        const iframeDoc = document.getElementById('preview-iframe')?.contentDocument;
                        if (!iframeDoc) return;
                        const html = iframeDoc.documentElement.outerHTML;
                        const fullHtml = '<!DOCTYPE html>\n<html>' + html.slice(html.indexOf('>') + 1);
                        if (editor) {
                            const files = editor.getFiles ? editor.getFiles() : (fileSystem ? fileSystem.getFilesMap() : {});
                            files['index.html'] = fullHtml;
                            editor.setFiles(files);
                            if (fileSystem) fileSystem.setFiles(files);
                            scheduleWorkspaceSave();
                            showToast('success', 'Text saved to editor');
                        }
                    } catch (e) {
                        console.warn('syncCurrentFrameToEditor failed:', e);
                        showToast('warning', 'Could not sync — cross-origin frame');
                    }
                }
            })
            : null;
        document.getElementById('btn-visual-inspector')?.addEventListener('click', () => {
            if (!visualInspector) {
                showToast('warning', 'Visual Inspector is not available');
                return;
            }
            const active = visualInspector.toggle();
            const btn = document.getElementById('btn-visual-inspector');
            if (!btn) return;
            if (active) {
                btn.classList.add('active');
                btn.style.background = 'rgba(56, 189, 248, 0.2)';
                showToast('info', 'Visual Inspector ON: Hover & click any element in preview!');
            } else {
                btn.classList.remove('active');
                btn.style.background = 'transparent';
                showToast('info', 'Visual Inspector OFF');
            }
        });

        // Frame Error Relay
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'ZERO_PREVIEW_ERROR') {
                if (!event.data.message || event.data.message === 'Script error.') return;
                const errText = `Preview Error: ${event.data.message}`;
                addConsoleLog('error', errText);
            }
        });

        // Export
        document.getElementById('btn-import-zip')?.addEventListener('click', () => document.getElementById('zip-import-input')?.click());
        document.getElementById('btn-import-zip-small')?.addEventListener('click', () => document.getElementById('zip-import-input')?.click());
        document.getElementById('zip-import-input')?.addEventListener('change', handleZipImport);
        document.getElementById('btn-export')?.addEventListener('click', handleExport);
        document.getElementById('btn-export-local')?.addEventListener('click', exportToLocalWorkspace);

        // Deploy
        document.getElementById('btn-deploy')?.addEventListener('click', handleDeploy);

        // Templates
        document.getElementById('btn-templates')?.addEventListener('click', () => toggleModal('templates-modal', true));
        document.getElementById('templates-close')?.addEventListener('click', () => toggleModal('templates-modal', false));
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = card.dataset.template;
                applyTemplate(template);
                toggleModal('templates-modal', false);
            });
        });

        // Project controls and version history
        document.getElementById('btn-history')?.addEventListener('click', () => {
            renderHistory();
            toggleModal('history-modal', true);
        });
        document.getElementById('history-close')?.addEventListener('click', () => toggleModal('history-modal', false));
        document.getElementById('btn-save-snapshot')?.addEventListener('click', () => createSnapshot('Manual snapshot'));
        document.getElementById('btn-clear-history')?.addEventListener('click', () => {
            if (confirm('Clear every saved project version? Your current workspace will remain untouched.')) {
                localStorage.removeItem(HISTORY_KEY);
                renderHistory();
                showToast('info', 'Project versions cleared');
            }
        });
        // Back to Home logo button
        document.getElementById('ws-back-home')?.addEventListener('click', () => {
            localStorage.setItem('zb_active_view', 'welcome');
            const welcomeScreen = document.getElementById('welcome-screen');
            if (welcomeScreen) {
                welcomeScreen.style.display = 'flex';
                welcomeScreen.classList.remove('hidden');
            }
            renderRecentProjects();
            showToast('info', 'Returned to Home screen');
        });

        document.getElementById('project-name')?.addEventListener('input', scheduleWorkspaceSave);
        document.querySelectorAll('.build-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const requirement = chip.dataset.requirement;
                chip.classList.toggle('active');
                chip.classList.contains('active') ? selectedRequirements.add(requirement) : selectedRequirements.delete(requirement);
                if (chip.classList.contains('active') && ['auth', 'database', 'api', 'payments'].includes(requirement)) {
                    if (framework) framework.frameworkOverride = 'fullstack-nextjs';
                    document.querySelectorAll('.fw-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.framework === 'fullstack-nextjs'));
                    showToast('info', 'Full-Stack target selected for backend capabilities');
                }
                scheduleWorkspaceSave();
            });
        });
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                buildQuality = btn.dataset.quality || 'production';
                if (framework) framework.aiMode = buildQuality;
                document.querySelectorAll('.quality-btn').forEach(item => item.classList.toggle('active', item === btn));
                scheduleWorkspaceSave();
            });
        });
        document.getElementById('art-direction')?.addEventListener('change', (event) => {
            artDirectionPreset = event.target.value || 'editorial';
            scheduleWorkspaceSave();
        });

        // Console toggle
        document.getElementById('console-header')?.addEventListener('click', () => {
            document.getElementById('console-panel')?.classList.toggle('collapsed');
        });
        document.getElementById('btn-clear-console')?.addEventListener('click', () => {
            const output = document.getElementById('console-output');
            if (output) output.innerHTML = '';
        });

        // Chat panel
        document.getElementById('chat-send')?.addEventListener('click', handleChatSend);
        document.getElementById('btn-stop-generation')?.addEventListener('click', handleStopGeneration);
        document.getElementById('btn-new-chat')?.addEventListener('click', handleNewChat);
        document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSend();
            }
        });

        // New file
        document.getElementById('btn-new-file')?.addEventListener('click', () => {
            const name = prompt('Enter file name:');
            if (name) {
                editor?.addFile(name, '');
                fileSystem?.addFile(name, '');
            }
        });

        // Copy code
        document.getElementById('btn-copy-code')?.addEventListener('click', () => {
            if (!editor) return;
            navigator.clipboard?.writeText(editor.getValue());
            showToast('success', 'Code copied to clipboard!');
        });

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.style.display = 'none';
            });
        });

        // Close provider dropdown on outside click
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('provider-dropdown');
            const btn = document.getElementById('provider-btn');
            if (dropdown?.style.display !== 'none' && !dropdown?.contains(e.target) && !btn?.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const files = editor?.getAllFiles() || {};
                preview?.render(files);
                showToast('info', 'Preview refreshed');
            }
            if (e.key === 'F11') {
                e.preventDefault();
                preview?.toggleFullscreen();
            }
        });

        // Resize handles
        setupResizeHandles();
    }

    /* ===== GENERATE WEBSITE ===== */
    let generationStartTime = 0;

    /* ===== CLARIFICATION QUESTIONNAIRE (v0-style) ===== */
    async function fetchClarificationQuestions(prompt) {
        if (prompt.length > 250) return [];

        const systemPrompt = `You are an AI Web Architect. The user wants to build a website with prompt: "${prompt}".
Analyze the prompt. If it lacks details, generate 1-3 specific multiple-choice clarification questions to help tailor the website.
Generate questions dynamically based on the exact domain (e.g. portfolio, e-commerce, landing page, agency, blog, SaaS).

CRITICAL: Return ONLY raw JSON array, no markdown wrappers, no commentary.
Format:
[
  {
    "id": "sections",
    "question": "What primary sections should we include?",
    "isMultiSelect": true,
    "options": ["About Me", "Portfolio Grid", "Client Testimonials", "Contact Form"]
  }
]`;

        try {
            const raw = await window.llmProvider.chat([{ role: 'user', content: prompt }], { systemPrompt, maxTokens: 400, temperature: 0.4 });
            const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            const questions = JSON.parse(cleaned);
            if (Array.isArray(questions) && questions.length > 0 && questions[0].question && Array.isArray(questions[0].options)) {
                return questions.slice(0, 3);
            }
        } catch (e) {
            console.warn('Clarification questions skipped:', e);
        }
        return [];
    }

    function renderQuestionnaire(questions, originalPrompt) {
        let currentStep = 0;
        const completedAnswers = [];

        const messages = document.getElementById('chat-messages');
        if (!messages) {
            executeGeneration(originalPrompt);
            return;
        }

        const card = document.createElement('div');
        card.className = 'ws-questionnaire-card';
        messages.appendChild(card);

        function updateCardUI() {
            const q = questions[currentStep];
            let html = '';

            completedAnswers.forEach((ans, idx) => {
                html += `
                    <div class="ws-q-completed-step">
                        <span class="ws-q-completed-num">${idx + 1}</span>
                        <span><strong>${escapeHtml(ans.title)}:</strong></span>
                        <span class="ws-q-completed-val">${escapeHtml(ans.values.join(', '))}</span>
                    </div>
                `;
            });

            html += `<div class="ws-q-question-title">${escapeHtml(q.question)}</div>`;
            html += `<div class="ws-q-options-list">`;
            const inputType = q.isMultiSelect ? 'checkbox' : 'radio';
            q.options.forEach((opt, i) => {
                html += `
                    <label class="ws-q-option" data-opt-idx="${i}">
                        <input type="${inputType}" name="ws_q_opt" value="${escapeHtml(opt)}" />
                        <span class="ws-q-option-label">${escapeHtml(opt)}</span>
                    </label>
                `;
            });
            html += `</div>`;

            const isLast = currentStep === questions.length - 1;
            html += `
                <div class="ws-q-footer">
                    <div class="ws-q-counter">${currentStep + 1} of ${questions.length}</div>
                    <div class="ws-q-actions">
                        <button type="button" class="btn-q-skip" id="btn-q-skip">Skip</button>
                        <button type="button" class="btn-q-next" id="btn-q-next">${isLast ? 'Submit' : 'Next'}</button>
                    </div>
                </div>
            `;

            card.innerHTML = html;
            messages.scrollTop = messages.scrollHeight;

            card.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', () => {
                    if (!q.isMultiSelect) {
                        card.querySelectorAll('.ws-q-option').forEach(optEl => {
                            optEl.style.borderColor = 'var(--border-subtle)';
                            optEl.style.background = 'var(--bg-tertiary)';
                        });
                    }
                    const parent = input.closest('.ws-q-option');
                    if (parent) {
                        parent.style.borderColor = input.checked ? 'var(--accent-purple)' : 'var(--border-subtle)';
                        parent.style.background = input.checked ? 'var(--bg-hover)' : 'var(--bg-tertiary)';
                    }
                });
            });

            document.getElementById('btn-q-skip').onclick = () => advanceStep([]);
            document.getElementById('btn-q-next').onclick = () => {
                const selected = Array.from(card.querySelectorAll('input:checked')).map(el => el.value);
                advanceStep(selected);
            };
        }

        function advanceStep(selectedValues) {
            const q = questions[currentStep];
            if (selectedValues.length > 0) {
                let shortTitle = q.question.split('?')[0].replace(/What|Which|How|do you want to|should we/gi, '').trim();
                if (shortTitle.length > 20) shortTitle = shortTitle.slice(0, 20) + '...';
                completedAnswers.push({ title: shortTitle || `Step ${currentStep + 1}`, values: selectedValues });
            }

            currentStep++;

            if (currentStep < questions.length) {
                updateCardUI();
            } else {
                let summaryText = 'Requirements confirmed!';
                if (completedAnswers.length > 0) {
                    summaryText += ' (' + completedAnswers.map(a => a.values.join(', ')).join(' | ') + ')';
                }
                card.innerHTML = `<div style="color:var(--accent-green); font-size:0.82rem; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="check-circle" style="width:14px;height:14px;"></i>
                    <span>${escapeHtml(summaryText)}</span>
                </div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();

                let enrichedPrompt = originalPrompt;
                if (completedAnswers.length > 0) {
                    enrichedPrompt += '\n\nUser Preferences:\n';
                    completedAnswers.forEach(a => {
                        enrichedPrompt += `- ${a.title}: ${a.values.join(', ')}\n`;
                    });
                }

                executeGeneration(enrichedPrompt);
            }
        }

        updateCardUI();
    }

    async function handleWelcomeGenerate() {
        const promptInput = document.getElementById('welcome-prompt-input');
        const prompt = promptInput?.value?.trim();
        if (!prompt) {
            showToast('warning', 'Please enter a prompt first');
            promptInput?.focus();
            return;
        }

        // Transition UI to workspace
        localStorage.setItem('zb_active_view', 'workspace');
        const welcomeScreen = document.getElementById('welcome-screen');
        const app = document.getElementById('app');

        if (welcomeScreen) welcomeScreen.classList.add('fade-out');
        if (app) {
            app.classList.remove('hidden');
            setTimeout(() => { if (editor) editor.refresh(); }, 50);
        }

        setTimeout(() => {
            if (welcomeScreen) welcomeScreen.style.display = 'none';
        }, 500);

        // Put the prompt in the chat history
        addChatMessage('user', prompt);
        addChatMessage('ai', 'Thinking...');

        // Fetch a conversational reply & clarification questions
        try {
            const systemPrompt = "You are the Zero-Builder AI Assistant. The user just asked you to create a website. Give a brief, friendly, conversational reply (1-2 sentences) acknowledging their request. Speak in the same language as the user (e.g., Hinglish if they use it).";
            const reply = await window.llmProvider.chat([{ role: 'user', content: prompt }], { systemPrompt, maxTokens: 100, temperature: 0.7 });
            const messages = document.getElementById('chat-messages');
            if (messages && messages.lastElementChild && messages.lastElementChild.classList.contains('ai')) {
                const bubble = messages.lastElementChild.querySelector('.ws-msg-bubble');
                if (bubble) bubble.textContent = reply;
            }
        } catch (err) {
            console.error("Chat reply failed:", err);
            const messages = document.getElementById('chat-messages');
            if (messages && messages.lastElementChild && messages.lastElementChild.classList.contains('ai')) {
                const bubble = messages.lastElementChild.querySelector('.ws-msg-bubble');
                if (bubble) bubble.textContent = "I'm on it! Building your website now...";
            }
        }

        // Check for clarification questions
        const questions = await fetchClarificationQuestions(prompt);
        if (questions && questions.length > 0) {
            renderQuestionnaire(questions, prompt);
            return; // Stops here! Generation triggers after questionnaire completes.
        }

        // Now run the standard generation
        await executeGeneration(prompt);
    }

    function handleStopGeneration() {
        if (!isGenerating) return;
        if (framework) {
            try { framework.cancel(); } catch (e) { console.warn('Cancel failed:', e); }
        }
        isGenerating = false;
        updateGenerateButton(false);
        const progressBarContainer = document.getElementById('ws-agent-progress');
        if (progressBarContainer) progressBarContainer.style.display = 'none';
        showToast('info', 'Generation stopped');
        addChatMessage('system', '⏹️ Generation stopped by user.', true);
    }

    function handleNewChat() {
        const files = editor?.getAllFiles() || {};
        if (Object.keys(files).length > 0) {
            createSnapshot('Before starting new chat');
        }

        // 1. Clear in-memory chat history
        chatHistory = [];

        // 2. Clear chat message bubbles
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) chatMessages.innerHTML = '';

        // 3. Clear input fields
        const chatInput = document.getElementById('chat-input');
        if (chatInput) chatInput.value = '';
        const welcomeInput = document.getElementById('welcome-prompt-input');
        if (welcomeInput) welcomeInput.value = '';

        // 4. Clear current files, editor, and preview
        if (editor) editor.setFiles({});
        if (fileSystem) fileSystem.setFiles({});
        if (preview) preview.render({});

        // 5. Reset framework memory and status
        if (framework) {
            framework.memory = { generatedFiles: {} };
            framework.isCancelled = false;
        }

        // 6. Reset project name
        const projectNameInput = document.getElementById('project-name');
        if (projectNameInput) projectNameInput.value = 'Untitled project';

        // 7. Generate a new project ID for the fresh workspace
        workspaceProjectId = createProjectId();

        // 8. Clear saved workspace key so fresh start is clean
        localStorage.removeItem(WORKSPACE_KEY);

        // 9. Show Welcome Screen
        localStorage.setItem('zb_active_view', 'welcome');
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
            welcomeScreen.classList.remove('hidden');
        }
        renderRecentProjects();
        showToast('success', 'New chat started! Ready for your next project.');
    }

    async function executeGeneration(prompt) {
        if (!framework) {
            showToast('error', 'Agent framework failed to load. Refresh the page.');
            return;
        }

        if (isGenerating) {
            handleStopGeneration();
            return;
        }

        // Check API key
        if (!window.llmProvider) {
            showToast('error', 'LLM provider failed to load. Refresh the page.');
            return;
        }
        const apiKey = window.llmProvider.getApiKey();
        if (!apiKey && !window.llmProvider.providers[window.llmProvider.currentProvider]?.noApiKey) {
            showToast('error', 'Please set your API key in Settings first');
            toggleModal('settings-modal', true);
            return;
        }

        isGenerating = true;
        generationStartTime = Date.now();
        updateGenerateButton(true);

        // Ensure workspace is active and welcome screen hidden immediately
        localStorage.setItem('zb_active_view', 'workspace');
        const welcomeScreen = document.getElementById('welcome-screen');
        const appEl = document.getElementById('app');
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (appEl) appEl.classList.remove('hidden');

        // Ensure an AI message bubble exists in chat for streaming live progress
        addChatMessage('ai', 'Architecting and building your website...');

        if (fileSystem && Object.keys(fileSystem.files || {}).length > 0) {
            createSnapshot(`Auto-save: Before ${prompt.substring(0, 20)}...`);
            fileSystem.setFiles({});
            if (editor) editor.setFiles({});
            if (preview) preview.render({});
        }
        workspaceProjectId = createProjectId();
        if (editor) editor.setValue('// Initiating deep generation sequence...\n');

        try {
            // Pass art direction as generate() options so it survives the memory reset
            if (framework) framework.aiMode = buildQuality;
            const res = await framework.generate(buildGenerationBrief(prompt), {
                artDirection: artDirectionPreset,
            });

            if (framework?.isCancelled || res === null) {
                // Was stopped/cancelled by user
                isGenerating = false;
                updateGenerateButton(false);
                return;
            }

            // Add success message in chat instead of replacing
            addChatMessage('system', '✅ Generation complete! Check the preview.', true);
        } catch (e) {
            console.error('Generation error:', e);
            isGenerating = false;
            updateGenerateButton(false);

            if (e?.message === 'ABORTED' || framework?.isCancelled) {
                return;
            }

            const msg = e?.message || String(e);

            // Add error message instead of replacing
            addChatMessage('system', `❌ Error: ${msg}`, true);

            // Surface engineer-grade failure guidance (no silent fail, no weak shell)
            if (/too thin|no weak|failed permanently|could not finish|extract ANY code|is not a function/i.test(msg)) {
                showToast('error', 'Generation failed quality bar. Retry with Production/Autonomous + a stronger model (Pro/Opus/GPT-4o).');
                addConsoleLog('error', `Engineer mode rejected thin/failed output: ${msg}`);
            } else {
                showToast('error', `Generation failed: ${msg.slice(0, 160)}`);
                addConsoleLog('error', msg);
            }
        }
    }

    /* ===== CHAT / REFINEMENT ===== */
    function handleStopGeneration() {
        if (!isGenerating) return;
        framework?.cancel();
        isGenerating = false;
        updateGenerateButton(false);
        showToast('info', 'Generation stopped');
        addChatMessage('system', '⏹️ Generation stopped by user.', true);
    }

    async function handleChatSend() {
        const chatInput = document.getElementById('chat-input');
        const prompt = chatInput?.value?.trim();

        // IF GENERATION IS CURRENTLY IN PROGRESS:
        if (isGenerating) {
            if (!prompt) {
                // Red Stop button clicked without typing text -> Stop generation immediately!
                handleStopGeneration();
                return;
            }

            chatInput.value = '';
            addChatMessage('user', prompt);

            if (framework) {
                framework.memory = framework.memory || {};
                framework.memory.midFlightNotes = framework.memory.midFlightNotes || [];
                framework.memory.midFlightNotes.push(prompt);
            }

            try {
                const systemPrompt = "You are the Zero-Builder AI Assistant. The user sent a message WHILE a website build is running in the background. Briefly acknowledge their message in 1 short friendly sentence and confirm that your instructions/note have been saved for the build. Speak in the user's language (e.g. Hinglish if they use it).";
                const reply = await window.llmProvider.chat([
                    { role: 'user', content: prompt }
                ], { systemPrompt, maxTokens: 100, temperature: 0.7 });
                addChatMessage('ai', reply);
            } catch(e) {
                addChatMessage('ai', "Got it! Saved your instructions for the active build. 🚀");
            }
            showToast('info', 'Note added to active build!');
            return;
        }

        if (!prompt) return;
        chatInput.value = '';
        addChatMessage('user', prompt);

        // IF NO GENERATION IS RUNNING:
        const currentFiles = editor ? editor.getAllFiles() : {};
        const hasFiles = Object.keys(currentFiles || {}).length > 0;

        isGenerating = true;
        updateGenerateButton(true);
        addChatMessage('ai', 'Thinking...');

        try {
            const isGreeting = /^(hi|hello|hey|hola|namaste|greetings|thanks|thank you|who are you|what can you do)(\s|\!|\.|\?)*$/i.test(prompt);

            let reply = "I'm on it!";
            try {
                const systemPrompt = "You are the Zero-Builder AI Assistant. Respond concisely (1-2 sentences) in a friendly manner. If the user asks a question or greets you, reply naturally. Speak in the same language as the user (e.g. English/Hinglish).";
                reply = await window.llmProvider.chat([
                    { role: 'user', content: prompt }
                ], { systemPrompt, maxTokens: 200, temperature: 0.7 });
            } catch (err) {
                console.error("Chat reply failed:", err);
            }

            // Replace 'Thinking...' with conversational reply
            const messages = document.getElementById('chat-messages');
            if (messages && messages.lastElementChild) {
                const bubble = messages.lastElementChild.querySelector('.ws-msg-bubble');
                if (bubble) bubble.textContent = reply;
            }

            // If it's a simple greeting or general inquiry, stop here. Do NOT throw error or refine code.
            if (isGreeting) {
                return;
            }

            // If no website exists yet, handle initial generation
            if (!hasFiles) {
                const questions = await fetchClarificationQuestions(prompt);
                if (questions && questions.length > 0) {
                    renderQuestionnaire(questions, prompt);
                    return;
                }
                // executeGeneration manages its own isGenerating flag
                isGenerating = false;
                updateGenerateButton(false);
                await executeGeneration(prompt);
                return;
            }

            if (!framework) throw new Error('Agent framework is not available');

            // Apply actual code changes if files already exist
            const refRes = await framework.refine(prompt);

            if (framework?.isCancelled || refRes === null) {
                return;
            }

            // Add final completion message
            addChatMessage('system', '✅ Changes applied! Check the preview.', true);
        } catch (e) {
            if (e?.message === 'ABORTED' || framework?.isCancelled) {
                return;
            }
            addChatMessage('system', `❌ Error: ${e.message}`, true);
            showToast('error', `Chat failed: ${e.message}`);
        } finally {
            isGenerating = false;
            updateGenerateButton(false);
        }
    }

    /* ===== EXPORT ===== */
    async function handleExport() {
        const files = editor?.getAllFiles() || {};
        if (Object.keys(files).length === 0) {
            showToast('warning', 'No files to export. Generate a website first.');
            return;
        }
        if (!deploy) {
            showToast('error', 'Export manager is not available');
            return;
        }
        try {
            await deploy.exportZip(files, slugifyProjectName());
            showToast('success', 'ZIP downloaded successfully!');
        } catch (e) {
            showToast('error', `Export failed: ${e.message}`);
        }
    }

    async function handleZipImport(event) {
        const input = event.target;
        const zipFile = input?.files?.[0];
        if (!zipFile) return;

        if (!projectIntake) {
            showToast('error', 'Project intake is not available');
            input.value = '';
            return;
        }

        try {
            const currentFiles = editor?.getAllFiles() || {};
            if (Object.keys(currentFiles).length && !confirm('Import this ZIP and replace the current editor workspace? Save/export first if needed.')) {
                input.value = '';
                return;
            }

            showToast('info', `Importing ${zipFile.name}...`);
            addConsoleLog('info', `Project Intake reading ZIP: ${zipFile.name}`);
            const { files, analysis, skipped } = await projectIntake.importZip(zipFile);
            if (!Object.keys(files).length) throw new Error('No supported website files found in the ZIP.');

            const projectName = zipFile.name.replace(/\.zip$/i, '').slice(0, 60);
            const nameInput = document.getElementById('project-name');
            if (nameInput) nameInput.value = projectName || 'Imported project';

            editor?.setFiles(files);
            fileSystem?.setFiles(files);
            preview?.render(files);
            if (framework) {
                framework.memory = framework.memory || {};
                framework.memory.generatedFiles = { ...files };
                framework.memory.importAnalysis = analysis;
                framework.memory.specification = buildImportedSpecification(analysis);
                framework.memory.designSystem = buildImportedDesignSystem();
            }
            applyFrameworkFromAnalysis(analysis);
            persistWorkspace();
            const intelligence = framework
                ? await framework.analyzeImportedProject(files, analysis, {
                    projectName: getProjectName(),
                    importedAt: Date.now()
                })
                : {};
            logProjectIntelligence(intelligence);
            if (projectRepository) {
                const repoEntry = projectRepository.record({
                    name: getProjectName(),
                    source: analysis.sourceName,
                    framework: analysis.framework,
                    fileCount: analysis.fileCount,
                    warnings: [...(analysis.warnings || []), ...(intelligence.upgradePlan?.priority || []).slice(0, 5)],
                    agents: Object.keys(intelligence).filter(key => !['context', 'analysis'].includes(key))
                });
                addConsoleLog('success', `Project Repository saved: ${repoEntry.organization} / ${repoEntry.name}`);
            }

            addConsoleLog('success', `Imported ${analysis.fileCount} files (${formatBytes(analysis.size)}) as ${analysis.framework}.`);
            if (analysis.pages?.length) addConsoleLog('info', `Detected pages: ${analysis.pages.slice(0, 6).join(', ')}`);
            if (analysis.dependencies?.length) addConsoleLog('info', `Dependencies: ${analysis.dependencies.slice(0, 10).join(', ')}`);
            (analysis.warnings || []).forEach(warning => addConsoleLog('warning', warning));
            if (skipped?.length) addConsoleLog('warning', `Skipped sample: ${skipped.slice(0, 5).map(item => `${item.path} (${item.reason})`).join('; ')}`);

            showToast('success', `Imported ${analysis.fileCount} files from ZIP`);
            if (analysis.size > 4 * 1024 * 1024) showToast('warning', 'Large project imported. Use Local export if browser storage gets full.');
        } catch (error) {
            showToast('error', `Import failed: ${error.message}`);
            addConsoleLog('error', `ZIP import failed: ${error.message}`);
        } finally {
            if (input) input.value = '';
        }
    }

    function registerProjectIntelligenceAgents() {
        const registrations = [
            ['zip-intake', 'ZipIntakeAgent'],
            ['project-architect', 'ProjectArchitectAgent'],
            ['creative-director', 'CreativeDirectorAgent'],
            ['copy-chief', 'CopyChiefAgent'],
            ['visual-critic', 'VisualCriticAgent'],
            ['responsive-qa', 'ResponsiveQAAgent'],
            ['performance', 'PerformanceAgent'],
            ['security', 'SecurityAgent'],
            ['upgrade-planner', 'UpgradePlannerAgent'],
            ['patch-agent', 'PatchAgent'],
            ['deploy-readiness', 'DeployReadinessAgent'],
        ];
        registrations.forEach(([name, className]) => {
            if (typeof window[className] === 'function') framework.registerAgent(name, new window[className]());
        });
    }

    function logProjectIntelligence(report = {}) {
        const plan = report.upgradePlan?.priority || [];
        const securityIssues = report.security?.issues || [];
        const responsiveIssues = report.responsive?.issues || [];
        const patchCount = report.patchPlan?.patches?.length || 0;
        if (report.creative?.direction) addConsoleLog('success', `Creative Director: ${report.creative.direction}`);
        if (securityIssues.length) addConsoleLog('warning', `Security Agent found ${securityIssues.length} issue(s).`);
        if (responsiveIssues.length) addConsoleLog('warning', `Responsive QA found ${responsiveIssues.length} issue(s).`);
        if (patchCount) addConsoleLog('info', `Patch Agent proposed ${patchCount} safe/AI-assisted patch(es).`);
        plan.slice(0, 6).forEach((item, index) => addConsoleLog('info', `Upgrade Plan ${index + 1}: ${item}`));
        if (report.deploy?.commands?.length) addConsoleLog('success', `Deploy readiness: ${report.deploy.commands.join(' -> ')}`);
    }

    function applyFrameworkFromAnalysis(analysis) {
        const target = analysis.framework === 'nextjs' ? 'fullstack-nextjs' : analysis.framework === 'react' ? 'react-vite' : 'vanilla';
        if (framework) framework.frameworkOverride = target;
        document.querySelectorAll('.fw-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.framework === target));
    }

    function buildImportedSpecification(analysis) {
        const frameworkMap = { nextjs: 'fullstack-nextjs', react: 'react-vite', static: 'vanilla' };
        return {
            title: getProjectName(),
            description: `Imported website ZIP: ${analysis.sourceName}`,
            framework: frameworkMap[analysis.framework] || 'vanilla',
            siteType: 'imported-website',
            complexity: analysis.fileCount > 80 ? 'large' : 'medium',
            features: analysis.pages.slice(0, 8),
            requirements: analysis.warnings,
            dependencies: analysis.dependencies,
            qualityContract: {
                tier: 'signature-digital-studio',
                northStar: 'Upgrade the imported project into a premium, production-ready website while preserving its working architecture.',
                proof: ['Retain useful existing pages and components', 'Remove generic copy and fragile implementation details', 'Improve responsiveness, accessibility, and deploy readiness'],
                signatureMoments: ['First viewport with clear brand/product signal', 'Purposeful transitions only where they clarify the experience', 'Credible content and polished interaction states'],
                nonNegotiables: ['Do not invent fake testimonials or metrics', 'Do not expose secrets', 'Preserve file paths unless a rename is necessary']
            }
        };
    }

    function buildImportedDesignSystem() {
        return {
            css: '',
            colors: {
                primary: '#2563eb',
                secondary: '#111827',
                accent: '#f59e0b',
                background: '#ffffff',
                text: '#111827'
            },
            typography: {
                heading: 'Inter',
                body: 'Inter'
            }
        };
    }

    async function exportToLocalWorkspace() {
        const files = editor?.getAllFiles() || {};
        if (!Object.keys(files).length) {
            showToast('warning', 'Generate a project before exporting to your device');
            return;
        }
        if (!window.cliConnectionToken) {
            showToast('warning', 'Please connect your Local CLI first');
            testLocalBridge();
            return;
        }
        try {
            const endpoints = [
                `${window.location.origin}/api/device/workspaces`,
                'http://localhost:4173/api/device/workspaces',
                'http://localhost:3001/api/device/workspaces'
            ];
            let response = null;
            let lastErr = null;
            for (const ep of endpoints) {
                try {
                    const res = await fetch(ep, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${window.cliConnectionToken}`
                        },
                        body: JSON.stringify({ name: slugifyProjectName(), files }),
                    });
                    if (res.status !== 404) { response = res; break; }
                } catch (err) { lastErr = err; }
            }
            if (!response) throw lastErr || new Error('Device bridge unavailable');
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Local export failed');
            showToast('success', `Exported ${result.fileCount} files via Local CLI`);
            addConsoleLog('success', `Local device workspace: ${result.location}`);
        } catch (error) {
            showToast('warning', 'CLI offline. Run the npx command in your terminal.');
            addConsoleLog('warning', `CLI export unavailable: ${error.message}`);
        }
    }

    /* ===== DEPLOY ===== */
    async function handleDeploy() {
        const files = editor?.getAllFiles() || {};
        if (Object.keys(files).length === 0) {
            showToast('warning', 'No files to deploy. Generate a website first.');
            return;
        }
        if (!deploy) {
            showToast('error', 'Deploy manager is not available');
            return;
        }

        if (deploy.netlifyToken) {
            showToast('info', 'Deploying to Netlify...');
            const result = await deploy.deployToNetlify(files, slugifyProjectName());
            if (result.success) {
                showToast('success', `Deployed! URL: ${result.url}`);
                window.open(result.url, '_blank');
            } else {
                showToast('error', `Deploy failed: ${result.error}`);
            }
        } else if (deploy.vercelToken) {
            showToast('info', 'Deploying to Vercel...');
            const result = await deploy.deployToVercel(files, slugifyProjectName());
            if (result.success) {
                showToast('success', `Deployed! URL: ${result.url}`);
                window.open(result.url, '_blank');
            } else {
                showToast('error', `Deploy failed: ${result.error}`);
            }
        } else {
            showToast('warning', 'No deploy token configured. Downloading as ZIP instead.');
            handleExport();
        }
    }

    /* ===== PREMIUM PROMPT LIBRARY (Motion Studio) ===== */
    function applyTemplate(template) {
        const prompts = {
            realestate: 'Build an Awwwards-level luxury real estate website for “Maison Vale”, a private residences broker in Lisbon. Art direction: near-black field, chalk-white Instrument Serif headlines, Manrope UI, warm stone/brass accent, architectural photography, soft film grain and vignette. Hero is a full-bleed cinematic video loop of a modern villa facade with oversized type using a masked word reveal and a quiet magnetic CTA “View residences”. Scroll film: pin/scrub “camera” through property atmospheres, stacked residence scenes with parallax media layers, horizontal gallery of interiors, provenance/story section, and a refined inquiry form. Motion systems only: masked-title-reveal, scroll-scrub-camera or parallax-media-layers, sticky-stacking-scenes, magnetic-quickto-cta, grain-vignette-grade. Optional subtle WebGL grade if it elevates the hero — never random particles. Avoid purple SaaS gradients, feature-card bento, fake metrics, glassmorphism spam, and template icon grids. Vanilla HTML/CSS/JS + GSAP ScrollTrigger + Lenis. Mobile + prefers-reduced-motion fallbacks.',
            agency: 'Create a cinematic single-page website for “Luma”, a high-end digital studio. Art direction: inky black background, silver-white typography, a single electric-lime accent, floating frosted navigation pill, and one immersive moving-media canvas. Use an expressive serif headline, compact sans copy, editorial case-study strips, capability rows, selected client wordmark line, and a focused CTA. Motion: word blur reveal, gentle media parallax, sticky case strips, magnetic CTAs. Tech: vanilla + GSAP + optional video hero. No bento-grid overload, no random 3D orbs, no generic purple gradients, no fake stats.',
            fashion: 'Build a fashion editorial site for “Atelier Nori”, a quiet luxury womenswear label. Art direction: bone paper and ink black, oversized serif titles, hairline rules, full-bleed lookbook photography, restrained mix-blend-mode type over imagery where contrast allows. Hero is a photo-mask statement with slow gallery drift. Scroll: lookbook horizontal pin gallery, fabric story, campaign stills, and a minimal contact. Motion: masked-title-reveal, horizontal-gallery-pin, parallax-media-layers, magnetic-quickto-cta. No ecommerce bento clutter, no neon, no 3D particles unless asked. Vanilla + GSAP.',
            architecture: 'Design a monochrome architecture studio site for “Studio Havel”. Art direction: concrete greys, pure black type, thin technical captions, facade photography, generous negative space. Hero is a full-bleed facade still or subtle video with a short manifesto. Scroll film walks through selected projects with sticky stacking project scenes, plan-detail captions, and a quiet commission CTA. Motion: parallax-media-layers, sticky-stacking-scenes, masked-title-reveal, grain-vignette-grade. Avoid colorful SaaS UI, fake awards counters, and blob backgrounds. Vanilla HTML/CSS/JS + GSAP ScrollTrigger.',
            restaurant: 'Create an elegant dining website for “Nomae”, a contemporary Kyoto-inspired restaurant. Art direction: charcoal, rice-paper white, quiet brass accent, vertical typography details, close-up food photography, and generous negative space. The hero should feel like a printed menu cover or soft cinematic food film; the menu is a beautifully typeset seasonal list; reservations are a focused accessible form. Add chef story and location. Motion: subtle text fade, image crop transitions, small parallax on photography, magnetic reserve button. Avoid generic gold luxury cliches, cards, particles, and busy animations.',
            portfolio: 'Create an editorial portfolio for “Mara Okafor”, an independent art director. Art direction: gallery catalogue, near-white paper background, black type, vermilion index marks, oversized serif titles, and tightly cropped photography. Hero has a simple statement and a full-bleed image. Projects appear as an asymmetric numbered index with captions; opening a project is a refined image-led overlay. Include selected clients and a minimal contact footer. Motion: masked title reveal, image scale on hover, and slow gallery drift. Avoid dashboards, feature cards, gradients, particles, and generic agency language.',
            product: 'Create a cinematic product launch site for “Halo Lens”, a precision optics brand. Art direction: deep navy-black, chalk type, single amber accent, macro product photography, film grain. Hero is a product film loop with oversized type and one clear CTA. Scroll story: craft process, materials, technical proof without fake enterprise metrics, and a request-demo form. Motion: video-hero-crossfade or parallax-media-layers, masked-title-reveal, magnetic-quickto-cta, grain-vignette-grade. Not a purple SaaS bento landing. Vanilla + GSAP.',
            saas: 'Create a premium editorial landing page for “Aster”, an AI operations workspace for design teams. Art direction: quiet software campaign; warm ivory canvas, midnight ink typography, muted cobalt as the single accent; Instrument Serif headlines and Manrope UI. Hero is a large, believable product workflow with a concise statement — not gradient orbs. Use hairline dividers, numbered proof points, one customer quote, and a clean product walkthrough. Motion: word-by-word headline reveal, gentle product depth on scroll, precise button hover. Avoid purple/cyan SaaS visuals, floating blobs, fake counters, and filler copy.',
            ecommerce: 'Create a tactile product-led store for “Serein Objects”, a design-led fragrance house. Art direction: stone background, soft black typography, macro product photography, refined cream labels, and subtle grain. Make a single bottle the hero, with scent notes and purchase controls beside it. Add a scrollable collection, ingredient story, and a working cart drawer with realistic product data. Motion: product image crossfade, restrained reveal, cart feedback. Avoid a SaaS layout, neon gradients, and unnecessary carousels.',
            startup: 'Create a bold launch site for “Orbit”, an AI research infrastructure company. Art direction: deep navy field, chalk-white type, electric signal-orange accent, technical diagrams, and a clean product interface—not decorative particles. Distinctive command-centre hero, short protocol story, integration proof, request-access form. Motion: precise line drawing, restrained section reveal. Avoid generic glowing blobs, faux 3D spam, glass-card grids, and empty metrics.',
        };

        const prompt = prompts[template] || prompts.realestate;
        // Prefer welcome prompt when on landing, otherwise workspace prompt
        const promptInput = document.getElementById('welcome-prompt-input')
            || document.getElementById('prompt-input');
        if (promptInput) {
            promptInput.value = prompt;
            promptInput.focus();
        }
        // Prefer Motion Studio for cinematic library cards
        if (['realestate', 'agency', 'fashion', 'architecture', 'product'].includes(template)) {
            buildQuality = 'motion-studio';
            if (framework) {
                framework.aiMode = 'motion-studio';
                framework.frameworkOverride = 'vanilla';
            }
            artDirectionPreset = 'cinematic';
            document.querySelectorAll('.quality-btn, .welcome-quality-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.quality === 'motion-studio'));
            const art = document.getElementById('art-direction');
            if (art) art.value = 'cinematic';
            document.querySelectorAll('.fw-btn, .welcome-fw-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.framework === 'vanilla'));
        }
        showToast('success', 'Studio prompt loaded — Generate or Enhance first');
        scheduleWorkspaceSave();
    }

    /* ===== PROVIDER MANAGEMENT ===== */
    function toggleProviderDropdown() {
        const dropdown = document.getElementById('provider-dropdown');
        if (!dropdown) return;

        if (dropdown.style.display === 'none' || !dropdown.style.display) {
            const btn = document.getElementById('provider-btn') || document.getElementById('welcome-model-btn');
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 8) + 'px';
            dropdown.style.left = Math.max(10, rect.left) + 'px';
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    }

    function selectProvider(providerId) {
        window.llmProvider.setProvider(providerId);
        updateProviderUI();
        const dropdown = document.getElementById('provider-dropdown');
        if (dropdown) dropdown.style.display = 'none';

        // Update settings modal too
        const settingsProvider = document.getElementById('settings-provider');
        if (settingsProvider) settingsProvider.value = providerId;
        updateModelDropdown(providerId);

        const customFields = document.getElementById('custom-provider-fields');
        if (customFields) customFields.style.display = (providerId === 'custom' || providerId === 'ollama') ? 'block' : 'none';

        const customUrl = document.getElementById('settings-custom-url');
        const customModel = document.getElementById('settings-custom-model');
        if (customUrl) customUrl.value = window.llmProvider.customBaseUrl || '';
        if (customModel) customModel.value = window.llmProvider.customModelName || '';

        const settingsKey = document.getElementById('settings-api-key');
        if (settingsKey) settingsKey.value = window.llmProvider.getApiKey(providerId) || '';

        if (providerId === 'custom') {
            const hasKey = window.llmProvider.getApiKey('custom');
            const url = window.llmProvider.customBaseUrl || '';
            if (!hasKey && !url.includes('localhost') && !url.includes('127.0.0.1')) {
                toggleModal('settings-modal', true);
                showToast('warning', 'OpenRouter / Custom Cloud API requires an API key. Get your key from https://openrouter.ai/keys and enter it in Settings → API Key.');
            } else if (!url) {
                toggleModal('settings-modal', true);
                showToast('warning', 'Please enter your Custom Base URL and Model Name in Settings.');
            } else {
                showToast('info', `Switched to Custom Endpoint (${url})`);
            }
        } else {
            showToast('info', `Switched to ${window.llmProvider.providers[providerId]?.name || providerId}`);
        }
    }

    function updateProviderUI() {
        const provider = window.llmProvider.getProviderInfo();
        const provName = document.getElementById('current-provider-name');
        const modelName = document.getElementById('current-model-name');
        const welcomeLabel = document.getElementById('welcome-model-label');
        if (provName) provName.textContent = provider.name;
        if (modelName) {
            modelName.textContent = window.llmProvider.currentProvider === 'custom'
                ? (window.llmProvider.customModelName || 'custom')
                : window.llmProvider.currentModel;
        }
        if (welcomeLabel) {
            welcomeLabel.textContent = provider.name;
        }

        // Update dropdown active states
        document.querySelectorAll('.provider-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.provider === window.llmProvider.currentProvider);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function updateModelDropdown(providerId) {
        const models = window.llmProvider.getModels(providerId);
        const select = document.getElementById('settings-model');
        if (!select) return;
        select.innerHTML = '';
        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            select.appendChild(opt);
        });
        const hasCurrentModel = models.some(m => m.id === window.llmProvider.currentModel);
        select.value = hasCurrentModel ? window.llmProvider.currentModel : (models[0] ? models[0].id : '');
    }

    /* ===== SETTINGS ===== */
    function saveSettings() {
        const providerId = document.getElementById('settings-provider')?.value;
        const modelId = document.getElementById('settings-model')?.value;
        const apiKey = document.getElementById('settings-api-key')?.value;
        const tavilyKey = document.getElementById('settings-tavily-key')?.value;
        const customUrl = document.getElementById('settings-custom-url')?.value;
        const customModel = document.getElementById('settings-custom-model')?.value;
        const netlifyToken = document.getElementById('settings-netlify-token')?.value;
        const vercelToken = document.getElementById('settings-vercel-token')?.value;
        const googleClientId = document.getElementById('settings-google-client-id')?.value;
        const googleAuthEnabled = document.getElementById('settings-google-auth-enabled')?.checked;
        const paidReady = document.getElementById('settings-paid-ready')?.checked;

        // Media keys
        const pexelsKey = document.getElementById('settings-pexels-key')?.value;
        const stabilityKey = document.getElementById('settings-stability-key')?.value;

        // Save LLM settings
        if (providerId) window.llmProvider.setProvider(providerId, modelId);
        if (providerId && typeof apiKey === 'string') {
            window.llmProvider.setApiKey(providerId, apiKey.trim());
        }
        window.llmProvider.customBaseUrl = customUrl || '';
        window.llmProvider.customModelName = customModel || '';
        window.llmProvider.saveSettings();

        // Save Tavily research key locally; it is only used when Autonomous mode is selected.
        localStorage.setItem('zb_tavily_key', tavilyKey || '');
        localStorage.setItem('zb_google_auth_settings', JSON.stringify({
            clientId: googleClientId || '',
            enabled: !!googleAuthEnabled,
            paidReady: !!paidReady
        }));

        // Save deploy settings
        if (deploy) {
            deploy.netlifyToken = netlifyToken || '';
            deploy.vercelToken = vercelToken || '';
            deploy.saveSettings();
        }

        // Save Media keys
        if (framework && framework.mediaGenerator) {
            framework.mediaGenerator.pexelsApiKey = pexelsKey || '';
            framework.mediaGenerator.stabilityApiKey = stabilityKey || '';
            framework.mediaGenerator.saveSettings();
        }

        updateProviderUI();
        toggleModal('settings-modal', false);
        showToast('success', 'Settings saved!');
    }

    function loadSavedSettings() {
        // Load LLM settings into UI
        const provider = window.llmProvider.currentProvider;
        const settingsProvider = document.getElementById('settings-provider');
        if (settingsProvider) settingsProvider.value = provider;

        updateModelDropdown(provider);
        updateProviderUI();

        const apiKey = window.llmProvider.getApiKey();
        const settingsKey = document.getElementById('settings-api-key');
        if (settingsKey) settingsKey.value = apiKey || '';

        // Load Tavily research key
        const tavilyKey = document.getElementById('settings-tavily-key');
        if (tavilyKey) tavilyKey.value = localStorage.getItem('zb_tavily_key') || '';

        try {
            const auth = JSON.parse(localStorage.getItem('zb_google_auth_settings') || '{}');
            const googleClient = document.getElementById('settings-google-client-id');
            const authEnabled = document.getElementById('settings-google-auth-enabled');
            const paidReady = document.getElementById('settings-paid-ready');
            if (googleClient) googleClient.value = auth.clientId || '';
            if (authEnabled) authEnabled.checked = !!auth.enabled;
            if (paidReady) paidReady.checked = !!auth.paidReady;
        } catch { }

        // Load deploy settings
        const netlify = document.getElementById('settings-netlify-token');
        if (netlify && deploy && deploy.netlifyToken) netlify.value = deploy.netlifyToken;
        const vercel = document.getElementById('settings-vercel-token');
        if (vercel && deploy && deploy.vercelToken) vercel.value = deploy.vercelToken;

        // Load Media keys
        const pexels = document.getElementById('settings-pexels-key');
        if (pexels && framework && framework.mediaGenerator) pexels.value = framework.mediaGenerator.pexelsApiKey || '';
        const stability = document.getElementById('settings-stability-key');
        if (stability && framework && framework.mediaGenerator) stability.value = framework.mediaGenerator.stabilityApiKey || '';

        // Custom provider fields
        const customUrl = document.getElementById('settings-custom-url');
        const customModel = document.getElementById('settings-custom-model');
        if (customUrl) customUrl.value = window.llmProvider.customBaseUrl || '';
        if (customModel) customModel.value = window.llmProvider.customModelName || '';

        if (provider === 'custom' || provider === 'ollama') {
            const customFields = document.getElementById('custom-provider-fields');
            if (customFields) customFields.style.display = 'block';
        }

        updateProviderUI();
    }

    async function testConnection() {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.textContent = '⏳ Testing...';
            statusEl.style.color = '#eab308';
        }

        // Temporarily save current settings for the test
        const providerId = document.getElementById('settings-provider')?.value;
        const apiKey = document.getElementById('settings-api-key')?.value;
        const customUrl = document.getElementById('settings-custom-url')?.value;
        const customModel = document.getElementById('settings-custom-model')?.value;

        if (apiKey) window.llmProvider.setApiKey(providerId, apiKey);
        if (providerId) window.llmProvider.setProvider(providerId);
        if (customUrl) window.llmProvider.customBaseUrl = customUrl;
        if (customModel) window.llmProvider.customModelName = customModel;

        const result = await window.llmProvider.testConnection();

        if (statusEl) {
            statusEl.textContent = result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
            statusEl.style.color = result.success ? '#22c55e' : '#ef4444';
        }
    }

    function generateUUID() {
        return 'xxxx-xxxx-xxxx'.replace(/[x]/g, function (c) {
            var r = Math.random() * 16 | 0; return r.toString(16);
        });
    }

    async function testLocalBridge() {
        const modal = document.getElementById('cli-modal');
        if (!modal) return;
        if (!window.cliConnectionToken) {
            window.cliConnectionToken = generateUUID();
        }
        const codeEl = document.getElementById('cli-command-code');
        if (codeEl) codeEl.textContent = `npx @zero-builder/local@latest --token ${window.cliConnectionToken}`;
        modal.style.display = 'flex';

        const status = document.getElementById('local-bridge-status');
        if (status) { status.textContent = 'Waiting for CLI...'; status.style.color = '#eab308'; }

        // Start pinging local CLI server
        if (window.cliPingInterval) clearInterval(window.cliPingInterval);
        window.cliPingInterval = setInterval(async () => {
            try {
                const endpoints = [
                    `${window.location.origin}/api/device/status`,
                    'http://localhost:4173/api/device/status',
                    'http://localhost:3001/api/device/status'
                ];
                let response = null;
                for (const ep of endpoints) {
                    try {
                        const res = await fetch(ep, {
                            headers: { 'Authorization': `Bearer ${window.cliConnectionToken}` }
                        });
                        if (res.ok) { response = res; break; }
                    } catch (e) { }
                }
                if (response && response.ok) {
                    if (status) { status.textContent = 'Connected (Secure)'; status.style.color = '#22c55e'; }
                    const saveState = document.getElementById('save-state');
                    if (saveState) saveState.style.color = '#22c55e';
                    clearInterval(window.cliPingInterval);
                    setTimeout(() => modal.style.display = 'none', 1000);
                    showToast('success', 'Local CLI Connected!');
                }
            } catch (e) {
                // CLI not running yet
            }
        }, 2000);
    }

    /* ===== PROJECT MEMORY & BUILD INTELLIGENCE ===== */
    function buildGenerationBrief(prompt) {
        const requirements = Array.from(selectedRequirements);
        const qualityInstruction = buildQuality === 'fast'
            ? 'Ship a focused first cut, but still Awwwards-caliber: distinctive hero, real content, working nav/forms, and no thin recovery shells. Prefer completeness of the core experience over decorative extras.'
            : buildQuality === 'autonomous'
                ? 'Run the Autonomous Motion Studio brain: Prompt Engineer → research → brand → cinematic media → WebGL when needed → GSAP scroll film → self-correct to score ≥ 92. Prefer showcase websites; only build full-stack when auth/DB are explicit.'
                : buildQuality === 'motion-studio' || buildQuality === 'power'
                    ? 'MOTION STUDIO MODE: Prompt Engineer expands the brief. Build a Motionsites/Layers-class cinematic website: hero scene (video and/or WebGL), named scroll scenes, GSAP ScrollTrigger pin/scrub, magnetic CTAs, film grain/vignette when planned, reduced-motion fallbacks. Default stack vanilla HTML/CSS/JS + GSAP + optional Three.js. NO purple SaaS templates, NO fake metrics, NO gradient-orb-only heroes. Review bar ≥ 92.'
                    : 'Ship a production-ready, premium website: Awwwards-level visual craft, scroll storytelling, and real interactions. Use full-stack only when auth/DB/API are required. Never expose secrets. Never output a weak template shell.';
        const backendInstruction = requirements.length
            ? `Required product capabilities: ${requirements.join(', ')}. If backend capabilities are selected, FORCE Full-Stack (Next.js + Prisma): secure route handlers, .env.example, input validation, authorization boundaries, protected dashboards, and graceful API errors. Model real entities and multi-page routes.`
            : 'WEBSITE-FIRST: default to premium static (vanilla + GSAP + optional WebGL/video) for marketing/cinematic sites. Use React only for SPA/R3F needs. Use Full-Stack only when auth, DB, payments, or server APIs are implied. Do NOT turn a luxury real-estate or agency brief into a dashboard.';
        const authSettings = getGoogleAuthSettings();
        const authInstruction = authSettings.enabled
            ? `Authentication requirement: use Google sign-in for full-stack builds. Scaffold Auth.js/NextAuth style server-side auth with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET, protected dashboard routes, session-aware UI, and logout. Never expose the client secret in client code. Provided public Google Client ID: ${authSettings.clientId || 'not configured yet; use .env.example placeholder only'}.`
            : 'Authentication: when the brief implies accounts, roles, or private data, scaffold real auth flows (login/session/protected routes). Otherwise omit auth.';
        const paidInstruction = authSettings.paidReady
            ? 'Monetization readiness: structure the product for future paid plans with plan-aware data models, pricing placeholders, entitlement checks, and Stripe-ready env placeholders, but do not create real charges unless payments is selected.'
            : 'Monetization: keep billing out unless payments or paid SaaS readiness is enabled.';
        const directionInstruction = {
            editorial: 'Creative direction: editorial. Use confident typography, intentional whitespace, asymmetric composition, image captions or index details where appropriate, and a refined print-like hierarchy.',
            cinematic: 'Creative direction: cinematic. Build a single immersive hero/media moment, high contrast composition, controlled overlays, and a paced scene-by-scene scroll narrative.',
            minimal: 'Creative direction: minimal. Strip away decorative effects, use a quiet palette, disciplined grid, few components, and let the product/content carry the page.',
            product: 'Creative direction: product-led. Make a believable product UI, physical product, or workflow the main visual proof; retain a clear conversion path and useful interactions.',
            experimental: 'Creative direction: experimental. Use one technically coherent visual device or material treatment with precise typography—never a random collection of effects.'
        }[artDirectionPreset] || 'Creative direction: editorial.';
        const engineerMandate = `STUDIO MANDATE: You are a Motionsites-grade creative technologist + principal engineer. For websites: cinematic hero scenes, scroll choreography, GSAP systems that actually run, credible category content. For apps: real architecture. Reject generic purple SaaS templates, fake metrics, gradient-orb shells, and recovery layouts.`;
        return `${prompt}\n\n--- ZERO-BUILDER PRODUCT BRIEF ---\nProject: ${getProjectName()}\nQuality preset: ${buildQuality}\n${directionInstruction}\n${backendInstruction}\n${authInstruction}\n${paidInstruction}\n${qualityInstruction}\n${engineerMandate}\n--- END PRODUCT BRIEF ---`;
    }

    async function handleEnhancePrompt() {
        const promptInput = document.getElementById('welcome-prompt-input') || document.getElementById('prompt-input');
        const btn = document.getElementById('welcome-enhance-btn') || document.getElementById('prompt-enhance');
        const prompt = promptInput?.value?.trim();
        if (!prompt) {
            showToast('warning', 'Type a short idea first, then Enhance');
            promptInput?.focus();
            return;
        }
        const apiKey = window.llmProvider.getApiKey();
        if (!apiKey && !window.llmProvider.providers[window.llmProvider.currentProvider]?.noApiKey) {
            showToast('error', 'Set your API key in Settings first');
            toggleModal('settings-modal', true);
            return;
        }
        if (!framework?.agents?.['prompt-engineer']) {
            showToast('error', 'Prompt Engineer agent not loaded');
            return;
        }
        try {
            if (btn) btn.disabled = true;
            showToast('info', 'Prompt Engineer expanding to studio brief...');
            addConsoleLog('info', '[PromptEngineer] Enhancing prompt...');
            const result = await framework.agents['prompt-engineer'].enhancePromptText(prompt, {
                mode: buildQuality,
                artDirection: artDirectionPreset,
            });
            if (promptInput && result?.enhancedPrompt) {
                promptInput.value = result.enhancedPrompt;
                promptInput.focus();
            }
            if (result?.brief) {
                addConsoleLog('success', `Enhanced: ${result.brief.siteArchetype} · ${result.brief.heroTreatment} · ${(result.brief.motionSystems || []).join(', ')}`);
            }
            showToast('success', 'Studio-grade prompt ready — review, then Generate');
            scheduleWorkspaceSave();
        } catch (e) {
            console.error(e);
            showToast('error', `Enhance failed: ${e.message || e}`);
            addConsoleLog('error', String(e.message || e));
        } finally {
            if (btn) btn.disabled = false;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function getGoogleAuthSettings() {
        try {
            return JSON.parse(localStorage.getItem('zb_google_auth_settings') || '{}');
        } catch {
            return {};
        }
    }

    function getProjectName() {
        return document.getElementById('project-name')?.value?.trim() || 'Untitled project';
    }

    function slugifyProjectName() {
        return getProjectName().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'zero-builder-site';
    }

    function scheduleWorkspaceSave() {
        clearTimeout(workspaceSaveTimer);
        workspaceSaveTimer = setTimeout(() => persistWorkspace(), 700);
    }

    function persistWorkspace() {
        try {
            const editorFiles = editor ? (editor.getAllFiles ? editor.getAllFiles() : {}) : {};
            const fsFiles = fileSystem ? (fileSystem.getFilesMap ? fileSystem.getFilesMap() : (fileSystem.files || {})) : {};
            const combinedFiles = { ...fsFiles, ...editorFiles };

            const payload = {
                id: workspaceProjectId,
                name: getProjectName(),
                prompt: document.getElementById('prompt-input')?.value || document.getElementById('welcome-prompt-input')?.value || '',
                requirements: Array.from(selectedRequirements),
                quality: buildQuality,
                artDirection: artDirectionPreset,
                framework: framework?.frameworkOverride || 'vanilla',
                files: combinedFiles,
                chatHistory: chatHistory.slice(-100), // persist last 100 chat messages
                updatedAt: Date.now(),
            };
            localStorage.setItem(WORKSPACE_KEY, JSON.stringify(payload));
            localStorage.setItem('zb_active_view', 'workspace');
            setSaveState(`Saved ${new Date(payload.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
            syncWorkspaceToServer(payload);
        } catch (error) {
            setSaveState('Storage full — export ZIP');
            console.warn('Workspace save failed:', error);
        }
    }

    function loadWorkspace() {
        try {
            const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY) || 'null');
            if (!saved) return;
            if (saved.id) workspaceProjectId = saved.id;
            const name = document.getElementById('project-name');
            if (name && saved.name) name.value = saved.name;
            const prompt = document.getElementById('prompt-input');
            if (prompt && saved.prompt) prompt.value = saved.prompt;
            selectedRequirements = new Set(Array.isArray(saved.requirements) ? saved.requirements : []);
            document.querySelectorAll('.build-chip').forEach(chip => chip.classList.toggle('active', selectedRequirements.has(chip.dataset.requirement)));
            buildQuality = ['fast', 'production', 'autonomous', 'motion-studio', 'power'].includes(saved.quality) ? saved.quality : 'production';
            if (framework) framework.aiMode = buildQuality;
            document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.quality === buildQuality));
            artDirectionPreset = saved.artDirection || 'editorial';
            const artDirection = document.getElementById('art-direction');
            if (artDirection) artDirection.value = artDirectionPreset;
            if (saved.framework && framework) {
                framework.frameworkOverride = saved.framework;
                document.querySelectorAll('.fw-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.framework === saved.framework));
            }
            if (saved.files && Object.keys(saved.files).length) {
                editor?.setFiles(saved.files);
                fileSystem?.setFiles(saved.files);
                preview?.render(saved.files);
            }

            // Restore chat history from saved workspace
            if (Array.isArray(saved.chatHistory) && saved.chatHistory.length > 0) {
                chatHistory = saved.chatHistory;
                const chatContainer = document.getElementById('chat-messages');
                if (chatContainer) {
                    chatContainer.innerHTML = ''; // clear any default content
                    for (const msg of chatHistory) {
                        const div = document.createElement('div');
                        div.className = `ws-chat-msg ${msg.role}`;
                        if (msg.role === 'system' && msg.isHtml) {
                            div.innerHTML = msg.text;
                        } else {
                            div.innerHTML = `<div class="ws-msg-bubble">${escapeHtml(msg.text)}</div>`;
                        }
                        chatContainer.appendChild(div);
                    }
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }

            // Auto-restore workspace view on F5 page refresh
            const activeView = localStorage.getItem('zb_active_view');
            const hasFiles = saved && saved.files && Object.keys(saved.files).length > 0;
            if (activeView === 'workspace' || hasFiles || (saved && saved.prompt)) {
                const welcomeScreen = document.getElementById('welcome-screen');
                const app = document.getElementById('app');
                if (welcomeScreen) welcomeScreen.style.display = 'none';
                if (app) {
                    app.classList.remove('hidden');
                    setTimeout(() => { if (editor) editor.refresh(); }, 100);
                }
            }
            setSaveState(saved.updatedAt ? `Restored ${new Date(saved.updatedAt).toLocaleDateString()}` : 'Workspace restored');
        } catch (error) {
            console.warn('Workspace restore failed:', error);
            setSaveState('New workspace');
        }
    }

    // Protect active generation & save state before unload
    window.addEventListener('beforeunload', (e) => {
        try {
            persistWorkspace();
        } catch(err) { /* noop */ }
        if (isGenerating) {
            e.preventDefault();
            e.returnValue = 'Generation is currently in progress. Refreshing will pause the active build stream.';
            return e.returnValue;
        }
    });

    function setSaveState(text) {
        const status = document.getElementById('save-state');
        if (status) status.textContent = text;
    }

    function createProjectId() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        return `project-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    async function syncWorkspaceToServer(payload) {
        try {
            if (new Blob([JSON.stringify(payload)]).size > 1_400_000) return;
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) setSaveState('Saved locally + synced');
        } catch {
            // Opening index.html directly is fully supported; local workspace remains the fallback.
        }
    }

    function getSnapshots() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
    }

    function createSnapshot(label) {
        const files = editor?.getAllFiles() || {};
        if (!Object.keys(files).length) {
            showToast('warning', 'Generate or create files before saving a version');
            return;
        }
        const snapshot = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            label,
            project: getProjectName(),
            createdAt: Date.now(),
            framework: framework?.frameworkOverride || 'vanilla',
            files,
        };
        try {
            if (framework?.versionControl) {
                framework.versionControl.createSnapshot({
                    label,
                    prompt: framework.memory?.userPrompt || label,
                    files,
                    reviewScore: framework.memory?.reviewReport?.score || 0
                });
            }
            const snapshots = [snapshot, ...getSnapshots()].slice(0, 12);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(snapshots));
            persistWorkspace();
            renderHistory();
            showToast('success', 'Project version saved');
        } catch (error) {
            showToast('error', 'Version is too large for browser storage. Export a ZIP instead.');
        }
    }

    function restoreSnapshot(id) {
        const snapshot = getSnapshots().find(item => item.id === id);
        if (!snapshot || !snapshot.files) return;
        if (!confirm(`Restore “${snapshot.label}”? Your current workspace will be kept as a local draft.`)) return;
        editor?.setFiles(snapshot.files);
        fileSystem?.setFiles(snapshot.files);
        preview?.render(snapshot.files);
        if (framework) {
            framework.memory = framework.memory || {};
            framework.memory.generatedFiles = { ...snapshot.files };
            framework.frameworkOverride = snapshot.framework || 'vanilla';
        }
        const name = document.getElementById('project-name');
        if (name && snapshot.project) name.value = snapshot.project;
        document.querySelectorAll('.fw-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.framework === (framework?.frameworkOverride || 'vanilla')));
        persistWorkspace();
        toggleModal('history-modal', false);
        showToast('success', 'Version restored');
    }

    function renderHistory() {
        const files = editor?.getAllFiles() || {};
        const snapshots = getSnapshots();
        const metrics = document.getElementById('project-metrics');
        const list = document.getElementById('history-list');
        if (metrics) {
            const bytes = Object.values(files).reduce((total, content) => total + new Blob([content]).size, 0);
            metrics.innerHTML = `
                <div class="metric-card"><span class="metric-label">Files</span><span class="metric-value">${Object.keys(files).length}</span></div>
                <div class="metric-card"><span class="metric-label">Workspace size</span><span class="metric-value">${formatBytes(bytes)}</span></div>
                <div class="metric-card"><span class="metric-label">Versions</span><span class="metric-value">${snapshots.length}</span></div>
                <div class="metric-card"><span class="metric-label">Target</span><span class="metric-value">${framework?.frameworkOverride === 'fullstack-nextjs' ? 'Next.js' : framework?.frameworkOverride === 'react-vite' ? 'React' : 'Static'}</span></div>`;
        }
        if (!list) return;
        list.innerHTML = snapshots.length ? snapshots.map(snapshot => `
            <div class="version-row">
                <i data-lucide="git-commit-horizontal"></i>
                <div class="version-main"><span class="version-title">${escapeHtml(snapshot.label)} · ${escapeHtml(snapshot.project || 'Untitled project')}</span><span class="version-meta">${new Date(snapshot.createdAt).toLocaleString()} · ${Object.keys(snapshot.files || {}).length} files · ${escapeHtml(snapshot.framework || 'vanilla')}</span></div>
                <button class="btn btn-secondary" data-restore-version="${snapshot.id}"><i data-lucide="rotate-ccw"></i> Restore</button>
            </div>`).join('') : '<div class="history-empty">No versions yet. Save a snapshot before a risky change, or build a site to create one automatically.</div>';
        list.querySelectorAll('[data-restore-version]').forEach(btn => btn.addEventListener('click', () => restoreSnapshot(btn.dataset.restoreVersion)));
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderRecentProjects() {
        const grid = document.getElementById('welcome-recent-grid');
        const recent = document.getElementById('welcome-recent');
        if (!grid || !recent) return;
        const snapshots = getSnapshots().slice(0, 4); // Only show top 4 recent projects
        if (snapshots.length === 0) {
            recent.style.display = 'none';
            return;
        }
        recent.style.display = 'flex';
        grid.innerHTML = snapshots.map(snapshot => `
            <div class="welcome-recent-card" data-restore-version="${snapshot.id}">
                <div class="recent-icon"><i data-lucide="box"></i></div>
                <div class="recent-info">
                    <div class="recent-title">${escapeHtml(snapshot.project || 'Untitled Project')}</div>
                    <div class="recent-time">${new Date(snapshot.createdAt).toLocaleDateString()}</div>
                </div>
            </div>`).join('');
        grid.querySelectorAll('.welcome-recent-card').forEach(card => {
            card.addEventListener('click', () => {
                restoreSnapshot(card.dataset.restoreVersion);
                // Switch to workspace view
                const welcomeScreen = document.getElementById('welcome-screen');
                const app = document.getElementById('app');
                if (welcomeScreen) welcomeScreen.style.display = 'none';
                if (app) {
                    app.classList.remove('hidden');
                    setTimeout(() => { if (editor) editor.refresh(); }, 50);
                }
            });
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    /* ===== UI HELPERS ===== */
    function updateStepIndicators(currentStep) {
        const stepMap = {
            'planning': 'step-planning',
            'designing': 'step-designing',
            'generating-media': 'step-generating-media',
            'coding-3d': 'step-coding-3d',
            'coding-ui': 'step-coding-ui',
            'reviewing': 'step-reviewing',
            'refining': 'step-reviewing',
            'complete': 'step-complete',
        };

        const stepOrder = ['planning', 'designing', 'generating-media', 'coding-3d', 'coding-ui', 'reviewing', 'complete'];
        const currentIdx = stepOrder.indexOf(currentStep);

        document.querySelectorAll('.agent-step').forEach(el => {
            el.classList.remove('active', 'complete');
        });

        stepOrder.forEach((step, idx) => {
            const el = document.getElementById(`step-${step}`);
            if (!el) return;
            if (idx < currentIdx) {
                el.classList.add('complete');
            } else if (idx === currentIdx) {
                el.classList.add('active');
            }
        });
    }

    function updateProgress(percent, message) {
        const fill = document.getElementById('agent-progress-fill');
        const msg = document.getElementById('agent-message-text');
        if (fill) fill.style.width = `${percent}%`;
        if (msg) msg.textContent = message;

        const progressBarContainer = document.getElementById('ws-agent-progress');
        if (progressBarContainer) progressBarContainer.style.display = isGenerating ? 'block' : 'none';

        if (isGenerating) {
            const messages = document.getElementById('chat-messages');
            if (messages) {
                const aiMsgs = messages.querySelectorAll('.ws-chat-msg.ai');
                const lastAi = aiMsgs.length > 0 ? aiMsgs[aiMsgs.length - 1] : null;
                if (lastAi) {
                    let statusEl = lastAi.querySelector('.ws-ai-status');
                    if (!statusEl) {
                        statusEl = document.createElement('div');
                        statusEl.className = 'ws-ai-status';
                        statusEl.style.fontSize = '12px';
                        statusEl.style.color = 'var(--text-secondary)';
                        statusEl.style.marginTop = '8px';
                        statusEl.style.paddingTop = '8px';
                        statusEl.style.borderTop = '1px solid var(--border-subtle)';
                        const bubble = lastAi.querySelector('.ws-msg-bubble');
                        if (bubble) bubble.appendChild(statusEl);
                    }
                    if (statusEl) {
                        statusEl.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:12px;height:12px;margin-right:6px;vertical-align:middle;animation:spin 2s linear infinite;"></i>${escapeHtml(message)} <span style="opacity:0.6;margin-left:6px;font-weight:600;color:var(--accent-purple);">${percent}%</span>`;
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                    }
                    messages.scrollTop = messages.scrollHeight;
                }
            }
        }
    }

    function updateGenerateButton(generating) {
        const welcomeBtn = document.getElementById('prompt-send');
        const chatSendBtn = document.getElementById('chat-send');

        if (welcomeBtn) {
            if (generating) {
                welcomeBtn.innerHTML = '<div class="spinner"></div>';
                welcomeBtn.title = 'Cancel Generation';
            } else {
                welcomeBtn.innerHTML = '<i data-lucide="arrow-up" class="send-icon"></i>';
                welcomeBtn.title = 'Generate Website (Enter)';
            }
        }

        if (chatSendBtn) {
            if (generating) {
                chatSendBtn.innerHTML = '<div style="width:10px;height:10px;background:#ef4444;border-radius:2px;margin:auto;"></div>';
                chatSendBtn.title = 'Stop Generation';
                chatSendBtn.style.background = 'rgba(239, 68, 68, 0.2)';
                chatSendBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            } else {
                chatSendBtn.innerHTML = '<i data-lucide="arrow-up" style="width:16px;height:16px"></i>';
                chatSendBtn.title = 'Send';
                chatSendBtn.style.background = '';
                chatSendBtn.style.borderColor = '';
            }
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function addConsoleLog(type, message) {
        const output = document.getElementById('console-output');
        if (!output) return;
        const line = document.createElement('div');
        const badgeClass = { info: 'console-info', error: 'console-error', success: 'console-success', warning: 'console-warning' };
        const badgeText = { info: 'INFO', error: 'ERROR', success: 'OK', warning: 'WARN' };
        line.className = `console-line ${badgeClass[type] || 'console-info'}`;
        line.innerHTML = `<span class="console-badge">${badgeText[type] || 'LOG'}</span><span>${escapeHtml(message)}</span>`;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function saveErrorToLog(message) {
        try {
            const logs = JSON.parse(localStorage.getItem('zb_runtime_errors') || '[]');
            logs.push({
                timestamp: new Date().toISOString(),
                message: message,
                userAgent: navigator.userAgent
            });
            localStorage.setItem('zb_runtime_errors', JSON.stringify(logs.slice(-100)));
        } catch (e) { }
    }

    function showChatPanel() {
        // Chat sidebar is always visible in the new workspace layout, so no action needed.
    }

    function addChatMessage(role, text, isHtml = false) {
        const container = document.getElementById('chat-messages');
        if (!container) return null;
        const div = document.createElement('div');
        div.className = `ws-chat-msg ${role}`;

        if (role === 'system' && isHtml) {
            div.innerHTML = text;
        } else {
            div.innerHTML = `<div class="ws-msg-bubble">${escapeHtml(text)}</div>`;
        }

        container.appendChild(div);
        container.scrollTop = container.scrollHeight;

        // Persist chat message to in-memory history (skip transient 'Thinking...' placeholders)
        if (text !== 'Thinking...') {
            chatHistory.push({ role, text, isHtml });
            // Keep history bounded to prevent localStorage bloat
            if (chatHistory.length > 200) chatHistory.splice(0, chatHistory.length - 200);
            scheduleWorkspaceSave();
        }
        return div;
    }

    function toggleModal(id, show) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = show ? 'flex' : 'none';
    }

    function showToast(type, message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const icons = { success: 'check-circle', error: 'x-circle', info: 'info', warning: 'alert-triangle' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${escapeHtml(message)}</span>`;
        container.appendChild(toast);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ===== RESIZE HANDLES ===== */
    function setupResizeHandles() {
        const handle1 = document.getElementById('resize-file-editor');
        const handle2 = document.getElementById('resize-editor-preview');
        const filePanel = document.getElementById('file-panel');
        const editorPanel = document.getElementById('editor-panel');
        const previewPanel = document.getElementById('preview-panel');

        if (handle1 && filePanel) {
            makeDraggable(handle1, (dx) => {
                const newWidth = filePanel.offsetWidth + dx;
                if (newWidth >= 180 && newWidth <= 400) {
                    filePanel.style.width = newWidth + 'px';
                    filePanel.style.flexShrink = '0';
                    filePanel.style.flexGrow = '0';
                    editor?.refresh();
                }
            });
        }

        if (handle2 && editorPanel && previewPanel) {
            makeDraggable(handle2, (dx) => {
                const editorRect = editorPanel.getBoundingClientRect();
                const previewRect = previewPanel.getBoundingClientRect();
                const newEditorWidth = editorRect.width + dx;
                const newPreviewWidth = previewRect.width - dx;
                if (newEditorWidth >= 300 && newPreviewWidth >= 300) {
                    editorPanel.style.flex = `0 0 ${newEditorWidth}px`;
                    editor?.refresh();
                }
            });
        }
    }

    function makeDraggable(handle, onDrag) {
        let startX;
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startX = e.clientX;
            handle.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            function onMove(e) {
                const dx = e.clientX - startX;
                startX = e.clientX;
                onDrag(dx);
            }
            function onUp() {
                handle.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    /* ===== CONVERSION LAB & LIVE AGENT ===== */
    function updateFileTree(files) {
        const next = files || framework?.memory?.generatedFiles || editor?.getAllFiles() || {};
        if (fileSystem) fileSystem.setFiles(next);
        if (editor) editor.setFiles(next);
    }

    function updatePreview(files) {
        const next = files || framework?.memory?.generatedFiles || editor?.getAllFiles() || {};
        if (preview) preview.render(next);
        scheduleWorkspaceSave();
    }

    function setupConversionLab() {
        const labUI = document.getElementById('conversion-lab-ui');
        const variantBtns = document.querySelectorAll('.lab-variant-btn');
        const btnLiveTest = document.getElementById('btn-live-test');

        // Listen for studio intelligence to show UI
        if (framework) {
            framework.on('studioReady', (intelligence) => {
                if (intelligence && intelligence.conversionLab) {
                    if (labUI) labUI.style.display = 'flex';
                }
            });

            framework.on('stateChange', ({ to }) => {
                if (to === 'idle' || to === 'complete') {
                    // Do nothing, keep it visible if it was
                } else if (to === 'planning' && labUI) {
                    labUI.style.display = 'none'; // hide on new generation
                }
            });
        }

        variantBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                variantBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const variantId = btn.getAttribute('data-variant');
                const lab = framework?.memory?.studioIntelligence?.conversionLab;
                if (framework && lab?.variants) {
                    const variant = lab.variants.find(v => v.id === variantId);
                    if (variant) {
                        addChatMessage('system', `<strong>Conversion Lab:</strong> Switched to ${escapeHtml(variant.id)} strategy.<br><small>${escapeHtml(variant.hypothesis || '')}</small>`, true);

                        // Queue a refine request for the selected conversion strategy.
                        const promptInput = document.getElementById('chat-input');
                        if (promptInput) {
                            promptInput.value = `Update the hero section to match the ${variant.id} strategy: ${variant.uiStrategy || variant.hypothesis || ''}`;
                            document.getElementById('chat-send')?.click();
                        }
                    }
                }
            });
        });

        if (btnLiveTest) {
            btnLiveTest.addEventListener('click', async () => {
                if (!framework || !framework.liveBrowserAgent) {
                    showToast('error', 'Live Browser Agent is not initialized.');
                    return;
                }

                addChatMessage('system', 'Starting Live Browser Agent autonomous audit...', true);
                try {
                    const fixedFiles = await framework.liveBrowserAgent.runAutonomousAudit(
                        framework.agents['healer'],
                        framework.memory.generatedFiles
                    );

                    if (fixedFiles && Object.keys(fixedFiles).length) {
                        addChatMessage('system', 'Live Agent found errors and Healer patched them. Updating preview...', true);
                        framework.memory.generatedFiles = { ...framework.memory.generatedFiles, ...fixedFiles };
                        updateFileTree(framework.memory.generatedFiles);
                        updatePreview(framework.memory.generatedFiles);
                    } else {
                        addChatMessage('system', 'Live Agent audit completed successfully with no runtime errors.', true);
                    }
                } catch (error) {
                    addChatMessage('system', `Live Agent failed: ${escapeHtml(error.message || String(error))}`, true);
                    showToast('error', 'Live Browser audit failed');
                }
            });
        }
    }

})();
