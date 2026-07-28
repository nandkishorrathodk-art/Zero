/* ============================================================
   ZERO-BUILDER — Advanced Agentic Framework
   State Machine-based orchestrator with Plan→Design→Media→
   Code(Vanilla/React/Fullstack)→Review→Refine loop
   Now with: React routing + AI media generation
   ============================================================ */

class BaseAgent {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.framework = null;
        this.llm = null;
    }

    async execute() {
        throw new Error(`Agent "${this.name}" must implement execute()`);
    }

    async callLLM(userMessage, systemPrompt, options = {}) {
        if (!this.llm || typeof this.llm.chat !== 'function') {
            throw new Error(`LLM provider is not available for ${this.name}`);
        }

        const messages = [
            { role: 'system', content: systemPrompt || '' },
            { role: 'user', content: userMessage || '' },
        ];

        // Preferred modern path: system + user messages.
        try {
            return await this.llm.chat(messages, options);
        } catch (primaryError) {
            // Compatibility fallback for older providers that expect systemPrompt in options.
            try {
                return await this.llm.chat([{ role: 'user', content: userMessage || '' }], {
                    systemPrompt: systemPrompt || '',
                    ...options,
                });
            } catch (fallbackError) {
                primaryError.cause = fallbackError;
                throw primaryError;
            }
        }
    }

    async streamLLM(userMessage, systemPrompt, onChunk, options = {}) {
        if (!this.llm || typeof this.llm.stream !== 'function') {
            throw new Error(`Streaming LLM provider is not available for ${this.name}`);
        }

        const messages = [
            { role: 'system', content: systemPrompt || '' },
            { role: 'user', content: userMessage || '' },
        ];

        try {
            return await this.llm.stream(messages, options, onChunk);
        } catch (primaryError) {
            try {
                return await this.llm.stream([{ role: 'user', content: userMessage || '' }], {
                    systemPrompt: systemPrompt || '',
                    ...options,
                }, onChunk);
            } catch (fallbackError) {
                primaryError.cause = fallbackError;
                throw primaryError;
            }
        }
    }

    async streamLLMFiles(userMessage, systemPrompt, options = {}) {
        let fullText = '';
        let lastEmit = 0;

        const response = await this.streamLLM(
            userMessage,
            systemPrompt,
            (chunk) => {
                fullText += chunk;
                const now = Date.now();
                if (now - lastEmit < 100 || !this.framework) return;
                lastEmit = now;

                try {
                    const partialFiles = this.extractFiles(fullText);
                    if (Object.keys(partialFiles).length) {
                        const merged = { ...(this.framework.memory?.generatedFiles || {}), ...partialFiles };
                        this.framework.memory.generatedFiles = merged;
                        this.framework.emit('filesReady', merged);
                        this.framework.emit('livePreview', { files: merged, partial: true });
                    }
                } catch {
                    // Ignore partial parse noise.
                }
            },
            options
        );

        if (this.framework) {
            try {
                const finalFiles = this.extractFiles(response);
                if (Object.keys(finalFiles).length) {
                    const merged = { ...(this.framework.memory?.generatedFiles || {}), ...finalFiles };
                    this.framework.memory.generatedFiles = merged;
                    this.framework.emit('filesReady', merged);
                    this.framework.emit('livePreview', { files: merged, partial: false });
                }
            } catch {
                // ignore final parse noise
            }
        }

        return response;
    }

    log(type, message) {
        if (this.framework) {
            this.framework.emit('log', { type, message: `[${this.name}] ${message}` });
        }
    }

    extractCode(text, language = '') {
        const src = String(text || '');
        const lang = String(language || '').trim();
        const blocks = [];

        if (lang) {
            const regex = new RegExp('```' + lang + '\\s*\\n([\\s\\S]*?)\\n```', 'gi');
            let match;
            while ((match = regex.exec(src)) !== null) {
                blocks.push(match[1].trim());
            }
        }

        if (!blocks.length) {
            const genericRegex = /```\s*\n([\s\S]*?)\n```/g;
            let match;
            while ((match = genericRegex.exec(src)) !== null) {
                blocks.push(match[1].trim());
            }
        }

        return blocks.length ? blocks.join('\n\n') : src.trim();
    }

    parseJSON(text) {
        if (!text || typeof text !== 'string') throw new Error('Empty response for JSON parsing');

        const stripNoise = (str) =>
            String(str || '')
                .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/,\s*([\}\]])/g, '$1')
                .trim();

        const cleanText = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();

        try { return JSON.parse(cleanText); } catch { /* noop */ }
        try { return JSON.parse(stripNoise(cleanText)); } catch { /* noop */ }

        const jsonBlock = this.extractCode(cleanText, 'json');
        try { return JSON.parse(jsonBlock); } catch { /* noop */ }
        try { return JSON.parse(stripNoise(jsonBlock)); } catch { /* noop */ }

        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { return JSON.parse(stripNoise(jsonMatch[0])); } catch { /* noop */ }
        }

        throw new Error('Failed to parse JSON from LLM response');
    }

    extractFiles(text) {
        // 1) JSON file dictionary
        try {
            const obj = this.parseJSON(text);
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                const isFileDict = Object.values(obj).every((val) => typeof val === 'string');
                if (isFileDict) return obj;
            }
        } catch {
            // ignore
        }

        // 2) Explicit file blocks
        const files = {};
        const fileRegex = /(?:^|\n)(?:#+\s*|\*\*|__)?(?:File:\s*)?\*?\*?\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)\s*\*?\*?(?:\*\*|__)?\s*\n\s*```[a-zA-Z0-9-]*\n([\s\S]*?)\n```/gi;
        let match;
        let foundAny = false;

        while ((match = fileRegex.exec(text)) !== null) {
            const filePath = match[1].trim();
            const fileContent = match[2].trim();
            if (filePath && fileContent) {
                files[filePath] = fileContent;
                foundAny = true;
            }
        }
        if (foundAny) return files;

        // 3) Fallback: every code block
        const codeBlockRegex = /```([a-zA-Z0-9-]*)\n([\s\S]*?)\n```/gi;
        let blockIndex = 1;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            const lang = (match[1] || 'js').toLowerCase();
            const content = (match[2] || '').trim();

            if (lang === 'json' && !content.includes('"dependencies"') && !content.includes('"name"')) continue;

            const firstLineMatch = content.match(/^(?:\/\/|\/\*|<!--)\s*(?:file:?\s*)?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/i);
            const fileName = firstLineMatch
                ? firstLineMatch[1]
                : `generated_component_${blockIndex}.${lang === 'tsx' || lang === 'ts' ? lang : 'js'}`;

            files[fileName] = content;
            foundAny = true;
            blockIndex++;
        }

        if (foundAny) return files;

        throw new Error(`Failed to extract any code blocks from LLM response. Raw output: ${String(text).slice(0, 500)}`);
    }
}

class AgentFramework {
    constructor(llmProvider) {
        this.llm = llmProvider;

        this.states = {
            IDLE: 'idle',
            PLANNING: 'planning',
            DESIGNING: 'designing',
            DEBATING: 'debating',
            GENERATING_MEDIA: 'generating-media',
            CODING_3D: 'coding-3d',
            CODING_UI: 'coding-ui',
            HEALING: 'healing',
            REVIEWING: 'reviewing',
            REFINING: 'refining',
            COMPLETE: 'complete',
            ERROR: 'error',
        };

        this.currentState = this.states.IDLE;
        this.stateHistory = [];
        this.errorCount = 0;
        this.maxRetries = 4;

        this.memory = this._createEmptyMemory();

        this.mediaGenerator = null;
        this.sandbox = null;
        this.frameworkOverride = null;
        this.aiMode = 'production';
        this.preflightGuard = null;

        this.projectBrain = typeof ProjectBrain !== 'undefined' ? new ProjectBrain() : null;
        this.buildWorkflow = typeof BuildWorkflow !== 'undefined' ? new BuildWorkflow() : null;
        this.autonomousStudio = typeof AutonomousStudio !== 'undefined' ? new AutonomousStudio() : null;
        this.autonomousBatcher = typeof AutonomousBatcher !== 'undefined' ? new AutonomousBatcher() : null;
        this.conversationMemory = typeof ConversationMemory !== 'undefined' ? new ConversationMemory() : null;
        this.versionControl = typeof VersionControlManager !== 'undefined' ? new VersionControlManager() : null;
        this.componentLibrary = typeof ComponentLibrary !== 'undefined' ? new ComponentLibrary() : null;

        this.agents = {};
        this._listeners = {};
        this.abortController = null;
        this._generationLock = false;
    }

    _createEmptyMemory() {
        return {
            userPrompt: '',
            engineeredBrief: null,
            specification: null,
            researchReport: null,
            brandStrategy: null,
            designSystem: null,
            generatedMedia: {},
            generatedFiles: {},
            reviewReport: null,
            refinementHistory: [],
            errors: [],
            studioIntelligence: null,
            workflow: null,
            buildJournal: [],
            projectContext: null,
            browserAudit: null,
            preflightReport: null,
            bugReport: null,
            projectIntelligence: null,
            midFlightNotes: [],
            _artDirectionPreset: 'editorial',
        };
    }

    /* ===== AGENT REGISTRATION ===== */
    registerAgent(name, agent) {
        this.agents[name] = agent;
        agent.framework = this;
        agent.llm = this.llm;

        this._wrapAgentMethod(name, agent, 'execute');
        this._wrapAgentMethod(name, agent, 'executeFromReview');
        this._wrapAgentMethod(name, agent, 'critiqueDesign');
        this._wrapAgentMethod(name, agent, 'revise');
        this._wrapAgentMethod(name, agent, 'recover');
        this._wrapAgentMethod(name, agent, 'expandToProductionScale');
    }

    _wrapAgentMethod(agentName, agent, methodName) {
        if (typeof agent?.[methodName] !== 'function') return;
        const marker = `__zeroWrapped_${methodName}`;
        if (agent[marker]) return;

        const original = agent[methodName].bind(agent);
        agent[methodName] = async (...args) =>
            this._superviseAgentCall(agentName, methodName, original, args);

        agent[marker] = true;
    }

    async _superviseAgentCall(agentName, methodName, original, args) {
        const label = `${agentName}.${methodName}`;
        const criticalCoders = new Set(['coder-ui', 'coder-react', 'coder-fullstack', 'architect', 'refiner']);
        const maxAttempts = (methodName === 'execute' || methodName === 'executeFromReview' || methodName === 'expandToProductionScale')
            ? (criticalCoders.has(agentName) ? 3 : 2)
            : 1;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                this._checkAbort();
                // Smart Retry: on attempt > 1, inject error context cleanly without mutating original caller args
                let callArgs = args;
                if (attempt > 1) {
                    const lastErr = this.memory.errors[this.memory.errors.length - 1];
                    const errorMsg = lastErr?.message || 'Unknown execution error';
                    callArgs = args.map((arg, idx) => {
                        if (idx === 0 && typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                            return {
                                ...arg,
                                _retryContext: {
                                    attempt,
                                    previousError: errorMsg,
                                    instruction: `PREVIOUS ATTEMPT FAILED with error: "${errorMsg}". Please fix this issue and output complete, working code.`
                                }
                            };
                        }
                        if (idx === 0 && typeof arg === 'string') {
                            return arg + `\n\n[RETRY ATTEMPT ${attempt} WARNING: Previous attempt failed with error: "${errorMsg}". Please correct your output and address this failure directly.]`;
                        }
                        return arg;
                    });
                }
                return await original(...callArgs);
            } catch (error) {
                if (error?.message === 'ABORTED') throw error;

                this.memory.errors.push({
                    agent: agentName,
                    method: methodName,
                    attempt,
                    message: error?.message || String(error),
                    timestamp: Date.now(),
                });

                const canRetry = attempt < maxAttempts;
                this.emit('log', {
                    type: canRetry ? 'warning' : 'error',
                    message: canRetry
                        ? `${label} failed (attempt ${attempt}/${maxAttempts}): ${error.message}. Retrying...`
                        : `${label} failed permanently: ${error.message}`,
                });

                if (!canRetry) {
                    if (!criticalCoders.has(agentName)) {
                        const recovered = await this._tryFallbackRecovery(agentName, methodName, args, error);
                        if (recovered.handled) {
                            this.emit('log', {
                                type: 'warning',
                                message: `Fallback recovery used for ${label}: ${recovered.message}`,
                            });
                            return recovered.value;
                        }
                    }
                    throw this._readableAgentError(agentName, methodName, error);
                }

                this.emit('progress', {
                    step: this.currentState,
                    percent: 50,
                    message: `Hardening ${agentName} (retry ${attempt + 1}/${maxAttempts})...`,
                });
            }
        }
    }

    async _tryFallbackRecovery(agentName, methodName, args, error) {
        if (agentName === 'fallback-recovery') return { handled: false };
        const recovery = this.agents['fallback-recovery'];
        if (!recovery || typeof recovery.recover !== 'function') return { handled: false };

        try {
            return await recovery.recover(agentName, methodName, args, error);
        } catch (fallbackError) {
            this.emit('log', {
                type: 'error',
                message: `Fallback recovery failed for ${agentName}.${methodName}: ${fallbackError.message}`,
            });
            return { handled: false };
        }
    }

    _readableAgentError(agentName, methodName, error) {
        const readable = new Error(
            `Agent "${agentName}" could not finish ${methodName}. ${error.message || error}. ZERO has returned to idle; retry, switch model, or inspect the console for the exact failed phase.`
        );
        readable.cause = error;
        readable.stack = error?.stack || readable.stack;
        return readable;
    }

    /* ===== EVENT SYSTEM ===== */
    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
        return () => this.off(event, callback);
    }

    once(event, callback) {
        const off = this.on(event, (data) => {
            off();
            callback(data);
        });
        return off;
    }

    off(event, callback) {
        const list = this._listeners[event];
        if (!list) return;
        this._listeners[event] = list.filter((cb) => cb !== callback);
    }

    emit(event, data) {
        const list = this._listeners[event];
        if (!list || !list.length) return;
        list.forEach((cb) => {
            try {
                cb(data);
            } catch (error) {
                console.error(`[AgentFramework:${event}] listener error`, error);
            }
        });
    }

    /* ===== STATE TRANSITIONS ===== */
    _transition(newState, data = {}) {
        const oldState = this.currentState;
        if (oldState === newState) return;

        this.currentState = newState;
        this.stateHistory.push({
            from: oldState,
            to: newState,
            timestamp: Date.now(),
            data,
        });

        this.emit('stateChange', { from: oldState, to: newState, data });
        this.emit('log', { type: 'info', message: `State: ${oldState} → ${newState}` });
    }

    /* ===== SETTERS ===== */
    setMediaGenerator(mediaGen) {
        this.mediaGenerator = mediaGen;
    }

    setSandbox(sandbox) {
        this.sandbox = sandbox;
        this.liveBrowserAgent =
            typeof LiveBrowserAgent !== 'undefined'
                ? new LiveBrowserAgent(this.sandbox, (lvl, msg) => this.emit('log', { type: lvl, message: msg }))
                : null;
    }

    setPreflightGuard(guard) {
        this.preflightGuard = guard;
    }

    setFrameworkOverride(value) {
        this.frameworkOverride = value || null;
    }

    setAIMode(mode) {
        this.aiMode = mode || 'production';
    }

    _recordWorkflowCheckpoint(stageId) {
        if (!this.buildWorkflow || !this.memory.workflow) return;
        const checkpoint = this.buildWorkflow.checkpoint(this.memory.workflow, stageId, this.memory.generatedFiles);
        if (!checkpoint) return;

        this.memory.buildJournal = [
            ...(this.memory.buildJournal || []).filter((item) => item.stage !== stageId),
            checkpoint,
        ];
        this.emit('log', {
            type: 'info',
            message: `Workflow checkpoint: ${checkpoint.name} complete (${checkpoint.fileCount} files)`,
        });
    }

    getProjectContext(request = '', files = this.memory.generatedFiles) {
        if (!this.projectBrain) return null;
        const context = this.projectBrain.getTaskContext(files || {}, request);
        this.memory.projectContext = context;
        return context;
    }

    recordBrowserAudit(report = {}) {
        this.memory.browserAudit = report;
        const issues = report.issues || [];
        this.emit('log', {
            type: issues.some((item) => item.severity === 'critical') ? 'error' : issues.length ? 'warning' : 'success',
            message: `Live Browser audit: ${report.score ?? '?'} / 100, ${report.controls || 0} controls, ${issues.length} issue(s)`,
        });
    }

    /* ===== MAIN EXECUTION — GENERATE WEBSITE ===== */
    async generate(userPrompt, options = {}) {
        if (this._generationLock) {
            throw new Error('Generation already in progress. Wait for completion or cancel.');
        }
        if (this.currentState !== this.states.IDLE && this.currentState !== this.states.COMPLETE && this.currentState !== this.states.ERROR) {
            throw new Error('Generation already in progress. Wait for completion or cancel.');
        }

        // Preserve caller options that must survive the memory reset below.
        const artDirectionPreset = options.artDirection
            || this.memory?._artDirectionPreset
            || 'editorial';

        this._generationLock = true;
        this.memory = this._createEmptyMemory();
        this.memory.userPrompt = userPrompt;
        this.memory._artDirectionPreset = artDirectionPreset;
        this.memory.midFlightNotes = [];
        this.errorCount = 0;
        this.abortController = new AbortController();

        try {
            /* ── PHASE 0: PROMPT ENGINEER ── */
            this._transition(this.states.PLANNING);
            this.emit('progress', { step: 'planning', percent: 4, message: 'Prompt Engineer crafting studio-grade brief...' });

            let planningPrompt = userPrompt;
            const promptEngineer = this.agents['prompt-engineer'];

            if (promptEngineer) {
                try {
                    this.memory.engineeredBrief = await promptEngineer.execute(userPrompt, {
                        mode: this.aiMode || 'production',
                        artDirection: this.memory._artDirectionPreset || 'editorial',
                    });
                    planningPrompt = this.memory.engineeredBrief.studioBrief || userPrompt;
                    this.emit('log', {
                        type: 'success',
                        message: `Prompt engineered: ${this.memory.engineeredBrief.siteArchetype} · ${this.memory.engineeredBrief.heroTreatment} · ${(this.memory.engineeredBrief.motionSystems || []).join(', ')}`,
                    });
                } catch (peError) {
                    this.emit('log', { type: 'warning', message: `Prompt Engineer skipped: ${peError.message}` });
                }
            }

            /* ── PHASE 1: PLANNING ── */
            this.emit('progress', { step: 'planning', percent: 10, message: 'Planning cinematic website architecture...' });

            const planner = this.agents['planner'];
            if (!planner) throw new Error('Planner agent not registered');

            this.memory.specification = await planner.execute(planningPrompt, this.frameworkOverride, this.memory.engineeredBrief);
            this.memory.specification = this._enforcePremiumSpec(this.memory.specification, planningPrompt);
            this.memory.specification = this._applyEngineeredBrief(this.memory.specification, this.memory.engineeredBrief);

            if (this.autonomousStudio) {
                this.memory.studioIntelligence = this.autonomousStudio.prepare(this.memory.specification, userPrompt);
                this.memory.specification.studioIntelligence = this.memory.studioIntelligence;
                const forecast = this.memory.studioIntelligence.architectureForecast;
                this.emit('log', {
                    type: 'success',
                    message: `Autonomous Studio: ${this.memory.studioIntelligence.intent.primaryOutcome} / ~${forecast.estimatedFiles} files / ${forecast.scale} scale`,
                });
                this.emit('log', { type: 'info', message: `Recommended stack: ${forecast.recommendedStack}` });
                (forecast.risks || []).forEach((risk) => this.emit('log', { type: 'warning', message: `Architecture risk: ${risk}` }));
                this.emit('studioReady', this.memory.studioIntelligence);
            }

            if (this.buildWorkflow) {
                this.memory.workflow = this.buildWorkflow.create(this.memory.specification, userPrompt);
                this.memory.specification.buildWorkflow = this.memory.workflow;
                this._recordWorkflowCheckpoint('contract');
                this.emit('log', {
                    type: 'success',
                    message: `Build workflow locked: ${this.memory.workflow.mode} mode / ${this.memory.workflow.stages.length} stages / ${this.memory.workflow.routes.length || 1} route(s)`,
                });
                this.emit('workflowReady', this.memory.workflow);
            }

            const fw = this.memory.specification.framework || 'vanilla';
            const mediaCount =
                (this.memory.specification.mediaNeeds?.images?.length || 0) +
                (this.memory.specification.mediaNeeds?.videos?.length || 0) +
                (this.memory.specification.mediaNeeds?.svgs?.length || 0);

            const pageCount = (this.memory.specification.pages || []).length;
            const motionCount = (this.memory.specification.motionSystems || this.memory.specification.animations || []).length;

            this.emit('log', {
                type: 'success',
                message: `Spec: ${fw} / ${this.memory.specification.complexity} — ${pageCount} page(s), ${mediaCount} media, ${motionCount} motion systems`,
            });
            this.emit('specReady', this.memory.specification);

            this._checkAbort();

            /* ── PHASE 1.5: BRAND INTELLIGENCE ── */
            this.emit('progress', { step: 'planning', percent: 13, message: 'Brand Intelligence: researching market and brand signals...' });

            const researcher = this.agents['researcher'];
            const strategist = this.agents['brand-strategist'];

            if (researcher) {
                try {
                    this.memory.researchReport = await researcher.execute(this.memory.specification, userPrompt, this);
                    if (this.memory.researchReport) this.emit('log', { type: 'success', message: 'Research report added to AI Brain' });
                } catch (error) {
                    this.emit('log', { type: 'warning', message: `Research skipped: ${error.message}` });
                }
            }

            if (strategist) {
                this.emit('progress', { step: 'planning', percent: 16, message: 'Brand Strategist defining positioning and hero direction...' });
                try {
                    this.memory.brandStrategy = await strategist.execute(userPrompt, this.memory.specification, this.memory.researchReport);
                    const strategy = this.memory.brandStrategy;

                    this.memory.specification.brandStrategy = strategy;
                    this.memory.specification.artDirection = {
                        ...(this.memory.specification.artDirection || {}),
                        ...(strategy.artDirection || {}),
                    };
                    this.memory.specification.title = strategy.brand?.name || this.memory.specification.title;

                    this.emit('log', { type: 'success', message: 'Brand strategy and art direction locked in' });
                    this.emit('specReady', this.memory.specification);
                } catch (error) {
                    this.emit('log', { type: 'warning', message: `Brand strategy skipped: ${error.message}` });
                }
            }

            this._checkAbort();

            /* ── PHASE 2: DESIGNING ── */
            this._transition(this.states.DESIGNING);
            this.emit('progress', { step: 'designing', percent: 18, message: 'Creating design system...' });

            const designer = this.agents['designer'];
            if (!designer) throw new Error('Designer agent not registered');

            this.memory.designSystem = await designer.execute(this.memory.specification);
            this._recordWorkflowCheckpoint('system');
            this.emit('log', { type: 'success', message: 'Design system generated' });

            this._checkAbort();

            /* ── PHASE 2.2: DEBATING ── */
            this._transition(this.states.DEBATING);
            this.emit('progress', { step: 'debating', percent: 23, message: 'Reviewer critiquing design...' });

            const reviewer = this.agents['reviewer'];
            if (reviewer && designer) {
                const critique = await reviewer.critiqueDesign(this.memory.specification, this.memory.designSystem.css);
                this.emit('log', { type: 'info', message: 'Design critique received. Revising design system...' });

                this.memory.designSystem = await designer.revise(this.memory.designSystem, critique);
                this.emit('log', { type: 'success', message: 'Design system revised after debate' });
            }

            this._checkAbort();

            /* ── PHASE 2.5: MEDIA GENERATION ── */
            if (this.mediaGenerator && mediaCount > 0) {
                this._transition(this.states.GENERATING_MEDIA);
                this.emit('progress', { step: 'generating-media', percent: 28, message: `Generating ${mediaCount} media assets...` });

                this.memory.generatedMedia = await this.mediaGenerator.generateMedia(
                    this.memory.specification.mediaNeeds,
                    (msg) => this.emit('log', { type: 'info', message: msg })
                );

                this.emit('log', { type: 'success', message: `Generated ${Object.keys(this.memory.generatedMedia).length} media assets` });
            }

            this._checkAbort();

            /* ── PHASE 3: ARCHITECTURE & SHADERS ── */
            const isReact = fw === 'react-vite';
            const isFullstack = fw === 'fullstack-nextjs';
            let architectFiles = {};
            let shaderFiles = {};

            if (isFullstack) {
                this.emit('progress', { step: 'coding-3d', percent: 35, message: 'Architecting backend (DB/API)...' });
                const architect = this.agents['architect'];
                if (architect) {
                    architectFiles = await architect.execute(this.memory.specification);
                    Object.assign(this.memory.generatedFiles, architectFiles);
                    this._recordWorkflowCheckpoint('foundation');
                    this.emit('log', { type: 'success', message: 'Backend architecture generated' });
                }
            }

            const heroNeedsWebGL = this._heroNeedsWebGL(this.memory.specification);
            if (this.memory.specification.has3D || heroNeedsWebGL) {
                this.memory.specification.has3D = true;
                this.emit('progress', { step: 'coding-3d', percent: 38, message: 'Building WebGL / 3D cinematic engine...' });

                if (!isReact && !isFullstack) {
                    const coder3d = this.agents['coder-3d'];
                    if (coder3d) {
                        this.memory.generatedFiles['three-scene.js'] = await coder3d.execute(this.memory.specification, this.memory.designSystem);
                        this.emit('log', { type: 'success', message: 'Vanilla WebGL/3D scene generated' });
                    }
                } else {
                    const shaderWizard = this.agents['coder-shader'];
                    if (shaderWizard) {
                        shaderFiles = await shaderWizard.execute(this.memory.specification, this.memory.designSystem);
                        this.emit('log', { type: 'success', message: 'GLSL shaders generated' });
                    }
                }
            }

            this._checkAbort();

            /* ── PHASE 4: CODING UI ── */
            this._transition(this.states.CODING_UI);
            this.emit('progress', {
                step: 'coding-ui',
                percent: 50,
                message: isFullstack
                    ? 'Generating full-stack Next.js app...'
                    : isReact
                        ? 'Generating React + R3F project...'
                        : 'Generating cinematic scroll scenes (HTML/CSS/JS)...',
            });

            // Fold any chat notes received during plan/design into the coder brief.
            this._applyMidFlightNotesToSpec();

            let uiFiles = {};

            if (isFullstack) {
                const coderFullstack = this.agents['coder-fullstack'];
                if (!coderFullstack) throw new Error('Full-stack coder agent not registered');
                uiFiles = await coderFullstack.execute(this.memory.specification, this.memory.designSystem, null);
            } else if (isReact) {
                const coderReact = this.agents['coder-react'];
                if (!coderReact) throw new Error('React coder agent not registered');
                uiFiles = await coderReact.execute(this.memory.specification, this.memory.designSystem, null);
            } else {
                const coderUI = this.agents['coder-ui'];
                if (!coderUI) throw new Error('UI coder agent not registered');
                uiFiles = await coderUI.execute(
                    this.memory.specification,
                    this.memory.designSystem,
                    this.memory.generatedFiles['three-scene.js'] || null
                );
            }

            if (!uiFiles || typeof uiFiles !== 'object') {
                throw new Error('Coder agent returned no file map — generation cannot continue.');
            }

            // Re-apply notes that arrived while the coder was running (for animator/review).
            this._applyMidFlightNotesToSpec();

            Object.assign(this.memory.generatedFiles, architectFiles, shaderFiles, uiFiles);
            this._recordWorkflowCheckpoint('surfaces');
            this.emit('log', { type: 'success', message: `Base UI generated (${Object.keys(uiFiles).length} files)` });

            this._checkAbort();

            /* ── PHASE 4.05: PRODUCTION-SCALE EXPANSION ── */
            await this._ensureProductionScale();

            this._checkAbort();

            /* ── PHASE 4.1: MOTION DIRECTOR ── */
            this.emit('progress', { step: 'coding-ui', percent: 60, message: 'Motion Director polishing cinematic motion...' });
            const animator = this.agents['animator'];

            if (animator) {
                try {
                    const animatedFiles = await animator.execute(
                        this.memory.specification,
                        this.memory.designSystem,
                        this.memory.generatedFiles
                    );
                    if (animatedFiles && Object.keys(animatedFiles).length) {
                        Object.assign(this.memory.generatedFiles, animatedFiles);
                        this.emit('log', { type: 'success', message: 'Cinematic animations injected' });
                    }
                } catch (motionError) {
                    this.emit('log', { type: 'warning', message: `Motion Director skipped: ${motionError.message}` });
                }
            }

            if (Object.keys(this.memory.generatedMedia).length && this.mediaGenerator) {
                this.memory.generatedFiles = this.mediaGenerator.injectMediaIntoFiles(
                    this.memory.generatedFiles,
                    this.memory.generatedMedia
                );
                this.emit('log', { type: 'info', message: 'Media assets injected into code' });
            }

            this._recordWorkflowCheckpoint('integration');
            this.emit('filesReady', this.memory.generatedFiles);

            this._checkAbort();

            /* ── PHASE 4.5: LOCAL PREFLIGHT & AUTO-FIXES ── */
            if (this.preflightGuard) {
                this._transition(this.states.HEALING);
                this.emit('progress', { step: 'healing', percent: 68, message: 'Running local dependency and boundary checks...' });

                const report = this.preflightGuard.inspect(this.memory.generatedFiles, fw);
                this.memory.preflightReport = report;
                this.memory.generatedFiles = report.files;

                (report.fixes || []).forEach((item) =>
                    this.emit('log', { type: 'success', message: `Pre-flight fixed ${item.file}: ${item.description}` })
                );
                (report.issues || []).forEach((item) =>
                    this.emit('log', {
                        type: item.severity === 'critical' ? 'error' : 'warning',
                        message: `Pre-flight: ${item.description}`,
                    })
                );

                this.emit('filesReady', this.memory.generatedFiles);
            }

            this._checkAbort();

            /* ── PHASE 4.75: BUG FINDER ── */
            const bugFinder = this.agents['bug-finder'];
            if (bugFinder && (isReact || isFullstack)) {
                this._transition(this.states.HEALING);
                this.emit('progress', { step: 'healing', percent: 72, message: 'Running static bug analysis...' });

                const { files: fixedFiles, report } = await bugFinder.execute(this.memory.generatedFiles);

                if (report.fixable && report.fixable.length > 0) {
                    this.memory.generatedFiles = fixedFiles;
                    this.emit('filesReady', this.memory.generatedFiles);
                }

                const fixableSet = new Set((report.fixable || []).map((b) => b?.message || b));
                const unfixable = (report.bugs || []).filter((b) => !fixableSet.has(b?.message || b));
                if (unfixable.length > 0) this.memory.bugReport = report;
            }

            this._checkAbort();

            /* ── PHASE 5: REVIEWING ── */
            await this._reviewLoop();
            this._recordWorkflowCheckpoint('verification');

            this._transition(this.states.COMPLETE);
            const targetLabel = isFullstack ? 'Next.js full-stack' : isReact ? 'React' : 'static website';
            this.emit('progress', { step: 'complete', percent: 100, message: `${targetLabel} generation complete!` });

            // Record snapshot & conversation memory
            if (this.versionControl) {
                this.versionControl.createSnapshot({
                    label: `Initial Build: ${this.memory.specification?.title || 'Build'}`,
                    prompt: userPrompt,
                    files: this.memory.generatedFiles,
                    reviewScore: this.memory.reviewReport?.score || 0
                });
            }
            if (this.conversationMemory) {
                this.conversationMemory.recordBuild({
                    prompt: userPrompt,
                    framework: fw,
                    designSystem: this.memory.designSystem,
                    reviewResult: this.memory.reviewReport,
                    generatedFiles: this.memory.generatedFiles
                });
            }

            this.emit('complete', this.memory.generatedFiles);

            return this.memory.generatedFiles;
        } catch (error) {
            if (error.message === 'ABORTED') {
                this._transition(this.states.IDLE);
                this.emit('log', { type: 'warning', message: 'Generation cancelled by user' });
                return null;
            }

            this._transition(this.states.ERROR);
            this.emit('error', { message: error.message, stack: error.stack });
            this.emit('log', { type: 'error', message: `Error: ${error.message}` });
            this._transition(this.states.IDLE);
            throw error;
        } finally {
            this._generationLock = false;
        }
    }

    /* ===== REVIEW + SELF-CORRECTION LOOP ===== */
    async _reviewLoop() {
        const reviewer = this.agents['reviewer'];
        const refiner = this.agents['refiner'];

        if (!reviewer) {
            this.emit('log', { type: 'warning', message: 'No reviewer agent — skipping review' });
            return;
        }

        let attempts = 0;

        while (attempts < this.maxRetries) {
            this._transition(this.states.REVIEWING);
            this.emit('progress', {
                step: 'reviewing',
                percent: 75 + (attempts * 8),
                message: `Reviewing code quality (attempt ${attempts + 1})...`,
            });

            const preflight = this._runStaticQualityGate(this.memory.generatedFiles);
            if (preflight.issues.length) {
                this.emit('log', {
                    type: preflight.critical ? 'warning' : 'info',
                    message: `Quality preflight: ${preflight.issues.length} issue(s) found`,
                });
            } else {
                this.emit('log', {
                    type: 'success',
                    message: 'Quality preflight passed: structure, metadata, motion fallback present',
                });
            }

            this.memory.reviewReport = await reviewer.execute(this.memory.generatedFiles, this.memory.specification);

            if (preflight.issues.length) {
                this.memory.reviewReport.issues = [...preflight.issues, ...(this.memory.reviewReport.issues || [])];
                if (preflight.critical) {
                    this.memory.reviewReport.score = Math.min(this.memory.reviewReport.score || 0, 72);
                    this.memory.reviewReport.passed = false;
                }
                if (preflight.issues.some((issue) => issue.category === 'premium-feel')) {
                    this.memory.reviewReport.score = Math.min(this.memory.reviewReport.score || 0, 81);
                    this.memory.reviewReport.passed = false;
                }
            }

            const threshold = this._reviewPassThreshold();
            if (typeof this.memory.reviewReport.score === 'number' && this.memory.reviewReport.score < threshold) {
                this.memory.reviewReport.passed = false;
            }

            if (this.memory.reviewReport.passed && this.memory.reviewReport.score >= threshold) {
                this.emit('log', {
                    type: 'success',
                    message: `Review passed! Quality score: ${this.memory.reviewReport.score}/100 (threshold ${threshold})`,
                });
                return;
            }

            this.memory.reviewReport.passed = false;

            attempts++;
            this.emit('log', {
                type: 'warning',
                message: `Review found ${this.memory.reviewReport.issues.length} issues. Fixing... (attempt ${attempts}/${this.maxRetries})`,
            });

            if (!refiner) {
                this.emit('log', { type: 'warning', message: 'No refiner agent — cannot auto-fix' });
                return;
            }

            this._transition(this.states.REFINING);
            this.emit('progress', {
                step: 'reviewing',
                percent: 75 + (attempts * 8) + 4,
                message: 'Auto-fixing issues...',
            });

            const fixedFiles = await refiner.executeFromReview(
                this.memory.generatedFiles,
                this.memory.reviewReport,
                this.memory.specification,
                this.memory.designSystem
            );

            Object.assign(this.memory.generatedFiles, fixedFiles);
            this.emit('filesReady', this.memory.generatedFiles);

            this._checkAbort();
        }

        this.emit('log', {
            type: 'warning',
            message: `Review loop exhausted after ${this.maxRetries} attempts. Proceeding with current code.`,
        });
    }

    /* ===== IMPORTED PROJECT INTELLIGENCE PIPELINE ===== */
    async analyzeImportedProject(files = {}, analysis = {}, context = {}) {
        const required = [
            'zip-intake',
            'project-architect',
            'creative-director',
            'copy-chief',
            'visual-critic',
            'responsive-qa',
            'performance',
            'security',
            'upgrade-planner',
            'patch-agent',
            'deploy-readiness',
        ];

        const missing = required.filter((name) => !this.agents[name]);
        if (missing.length) {
            this.emit('log', { type: 'warning', message: `Project intelligence missing agents: ${missing.join(', ')}` });
        }

        this.emit('progress', { step: 'planning', percent: 18, message: 'Project Intelligence agents reading imported ZIP...' });
        const report = { context, analysis };

        if (this.agents['zip-intake']) report.intake = await this.agents['zip-intake'].execute(files, analysis);
        if (this.agents['project-architect']) report.architecture = await this.agents['project-architect'].execute(files, report.intake || analysis);
        if (this.agents['creative-director']) report.creative = await this.agents['creative-director'].execute(files, report.architecture || {});
        if (this.agents['copy-chief']) report.copy = await this.agents['copy-chief'].execute(files, report.creative || {});
        if (this.agents['visual-critic']) report.visual = await this.agents['visual-critic'].execute(files, report.creative || {});
        if (this.agents['responsive-qa']) report.responsive = await this.agents['responsive-qa'].execute(files, report.architecture || {});
        if (this.agents['performance']) report.performance = await this.agents['performance'].execute(files, report.architecture || {});
        if (this.agents['security']) report.security = await this.agents['security'].execute(files, report.architecture || {});
        if (this.agents['upgrade-planner']) report.upgradePlan = await this.agents['upgrade-planner'].execute(report);
        if (this.agents['patch-agent']) report.patchPlan = await this.agents['patch-agent'].execute(files, report);
        if (this.agents['deploy-readiness']) report.deploy = await this.agents['deploy-readiness'].execute(files, report.architecture || {});

        this.memory.projectIntelligence = report;
        const issueCount = this._countProjectIssues(report);
        this.emit('log', {
            type: issueCount ? 'warning' : 'success',
            message: `Project Intelligence complete: ${issueCount} issue(s) or upgrade opportunities found`,
        });
        this.emit('progress', { step: 'complete', percent: 100, message: 'Imported project intelligence complete' });
        return report;
    }

    _countProjectIssues(report = {}) {
        return [
            ...(report.copy?.issues || []),
            ...(report.visual?.issues || []),
            ...(report.responsive?.issues || []),
            ...(report.security?.issues || []),
            ...(report.architecture?.architectureRisks || []),
            ...(report.deploy?.missing || []),
        ].length;
    }

    async _ensureProductionScale() {
        const files = this.memory.generatedFiles || {};
        const spec = this.memory.specification || {};
        const allCode = Object.values(files).map((v) => String(v || '')).join('');
        const fileCount = Object.keys(files).length;
        const complexity = spec.complexity || 'medium';
        const fw = spec.framework || 'vanilla';
        const isLarge = complexity === 'complex' || complexity === 'ultra-complex' || fw !== 'vanilla';

        if (!isLarge) return;

        const minChars = complexity === 'ultra-complex' || fw === 'fullstack-nextjs' ? 10000 : 7000;
        const minFiles = fw === 'fullstack-nextjs' ? 8 : (fw === 'react-vite' ? 6 : 3);
        const tooThin = allCode.length < minChars || fileCount < minFiles;
        const missingPages = Array.isArray(spec.pages) && spec.pages.length > 1 && fw !== 'vanilla'
            && !Object.keys(files).some((n) => /page\.(tsx|jsx|js)$/.test(n) || /App\.(tsx|jsx)$/.test(n));

        if (!tooThin && !missingPages) {
            this.emit('log', { type: 'success', message: `Production scale check passed (${fileCount} files, ${allCode.length} chars)` });
            return;
        }

        const refiner = this.agents['refiner'];
        if (!refiner || typeof refiner.expandToProductionScale !== 'function') {
            this.emit('log', { type: 'warning', message: 'Production scale expansion skipped — refiner unavailable' });
            return;
        }

        this.emit('progress', {
            step: 'coding-ui',
            percent: 56,
            message: 'Expanding thin build into production-scale product structure...',
        });
        this.emit('log', {
            type: 'warning',
            message: `Build under-scoped (${fileCount} files / ${allCode.length} chars). Running production expansion...`,
        });

        try {
            const expanded = await refiner.expandToProductionScale(files, spec, this.memory.designSystem);
            if (expanded && Object.keys(expanded).length) {
                Object.assign(this.memory.generatedFiles, expanded);
                this.emit('filesReady', this.memory.generatedFiles);
                this.emit('log', {
                    type: 'success',
                    message: `Production expansion added/updated ${Object.keys(expanded).length} file(s)`,
                });
            }
        } catch (error) {
            this.emit('log', { type: 'warning', message: `Production expansion failed: ${error.message}` });
        }
    }

    _applyEngineeredBrief(spec = {}, brief = null) {
        if (!brief || typeof brief !== 'object') return spec;

        const next = { ...(spec || {}) };
        next.engineeredBrief = brief;
        next.siteArchetype = brief.siteArchetype || next.siteArchetype;
        next.heroTreatment = brief.heroTreatment || next.heroTreatment || 'photo-mask';
        next.motionSystems = Array.isArray(brief.motionSystems) && brief.motionSystems.length
            ? brief.motionSystems.slice(0, 5)
            : (next.motionSystems || next.animations || []).slice(0, 5);
        next.animations = next.motionSystems;
        next.scrollChoreography = Array.isArray(brief.scrollChoreography) ? brief.scrollChoreography : (next.scrollChoreography || []);
        next.antiPatterns = Array.isArray(brief.antiPatterns) ? brief.antiPatterns : (next.antiPatterns || []);
        next.qualityBar = brief.qualityBar || next.qualityBar || 'awwwords-site-of-the-day';

        if (!this.frameworkOverride && brief.techStackBias) {
            if (brief.techStackBias === 'vanilla-gsap-webgl') next.framework = 'vanilla';
            else if (brief.techStackBias === 'react-r3f') next.framework = 'react-vite';
            else if (brief.techStackBias === 'fullstack-nextjs') next.framework = 'fullstack-nextjs';
        }

        const cinematic = this._isCinematicWebsite(next, brief);
        if (cinematic) {
            if (!this.frameworkOverride && next.framework !== 'fullstack-nextjs' && !/webapp|dashboard|admin/i.test(brief.siteArchetype || '')) {
                next.framework = next.framework === 'react-vite' && /react/i.test(brief.techStackBias || '') ? 'react-vite' : 'vanilla';
            }
            if (!next.complexity || next.complexity === 'simple') next.complexity = 'complex';
            next.has3D = next.has3D === true || this._heroNeedsWebGL(next);

            if (Array.isArray(brief.mediaPlan?.images) || Array.isArray(brief.mediaPlan?.videos)) {
                next.mediaNeeds = next.mediaNeeds || { images: [], videos: [], svgs: [] };
                if (!next.mediaNeeds.images?.length && brief.mediaPlan.images?.length) next.mediaNeeds.images = brief.mediaPlan.images;
                if (!next.mediaNeeds.videos?.length && brief.mediaPlan.videos?.length) next.mediaNeeds.videos = brief.mediaPlan.videos;
            }

            if (!Array.isArray(next.sections) || next.sections.length < 5) {
                next.sections = ['hero', 'atmosphere', 'story', 'work', 'gallery', 'cta', 'footer'];
            }

            next.artDirection = {
                ...(next.artDirection || {}),
                concept: next.artDirection?.concept || brief.visualSystem?.palette || 'Cinematic editorial website',
                motionPlan: next.motionSystems,
                avoid: Array.from(new Set([...(next.artDirection?.avoid || []), ...(brief.antiPatterns || [])])),
            };

            if (brief.visualSystem?.typography) {
                const parts = String(brief.visualSystem.typography).split('+').map((s) => s.trim());
                next.typography = next.typography || {};
                if (parts[0]) next.typography.heading = parts[0].replace(/display/i, '').trim() || next.typography.heading;
                if (parts[1]) next.typography.body = parts[1].replace(/body/i, '').trim() || next.typography.body;
            }

            next.qualityContract = next.qualityContract || {};
            next.qualityContract.tier = 'motion-studio-awwwards';
            next.qualityContract.signatureMoments = next.motionSystems.slice(0, 3);
            next.qualityContract.nonNegotiables = Array.from(new Set([
                ...(next.qualityContract.nonNegotiables || []),
                'Hero is a cinematic scene (video, WebGL, or full-bleed media) — not gradient orbs',
                'At least one scroll-linked GSAP/ScrollTrigger system works',
                'Named scroll scenes / story beats',
                'No purple SaaS filler or fake vanity metrics',
            ]));
        }

        if (brief.shortTitle && (!next.title || next.title === 'Premium Website')) {
            next.title = brief.shortTitle;
        }

        return next;
    }

    _isMotionStudioMode() {
        const mode = String(this.aiMode || 'production').toLowerCase();
        return mode === 'motion-studio' || mode === 'power' || mode === 'autonomous';
    }

    _isCinematicWebsite(spec = {}, brief = null) {
        if (this._isMotionStudioMode()) return true;

        const arch = String(brief?.siteArchetype || spec.siteArchetype || spec.siteType || '').toLowerCase();
        if (/real-estate|architecture|agency|fashion|hospitality|portfolio|cinematic|editorial|luxury/.test(arch)) return true;
        if (/webapp|dashboard|admin-panel|saas-app/.test(arch)) return false;

        const hero = String(spec.heroTreatment || brief?.heroTreatment || '');
        return /video|webgl|hybrid|photo-mask/i.test(hero);
    }

    _heroNeedsWebGL(spec = {}) {
        const treatment = String(spec.heroTreatment || spec.engineeredBrief?.heroTreatment || '').toLowerCase();
        if (treatment === 'webgl-scene' || treatment === 'hybrid') return true;
        if (spec.has3D === true) return true;
        const motions = [...(spec.motionSystems || []), ...(spec.animations || [])].join(' ').toLowerCase();
        return /scroll-scrub-camera|webgl|three|particle/.test(motions);
    }

    _reviewPassThreshold() {
        if (this.aiMode === 'fast') return 85;
        if (this._isMotionStudioMode()) return 92;
        return 90;
    }

    _applyMidFlightNotesToSpec() {
        const notes = Array.isArray(this.memory?.midFlightNotes)
            ? this.memory.midFlightNotes.map((n) => String(n).trim()).filter(Boolean)
            : [];
        if (!notes.length || !this.memory.specification) return;

        const existing = Array.isArray(this.memory.specification.midFlightNotes)
            ? this.memory.specification.midFlightNotes
            : [];
        const merged = Array.from(new Set([...existing, ...notes]));
        const added = merged.length - existing.length;
        if (!added) return;

        this.memory.specification.midFlightNotes = merged;
        this.memory.specification.userPreferences = Array.from(new Set([
            ...(this.memory.specification.userPreferences || []),
            ...merged,
        ]));
        this.emit('log', {
            type: 'info',
            message: `Applied ${added} mid-flight note(s) from chat into the build context`,
        });
    }

    _enforcePremiumSpec(spec = {}, userPrompt = '') {
        const next = { ...(spec || {}) };
        const lower = String(userPrompt || next.description || '').toLowerCase();
        const product = /\b(dashboard|admin|auth|login|signup|database|api\b|crm|portal|payment)\b/.test(lower)
            && !/\b(landing|website|real.?estate|portfolio|agency|restaurant|architecture)\b/.test(lower);
        const full = /\b(database|prisma|auth|full-?stack|next\.?js|payment|stripe|oauth)\b/.test(lower);
        const cinematicHint = /\b(cinematic|awwwards|webgl|3d|video hero|scroll|luxury|real.?estate|motionsites|gsap)\b/.test(lower)
            || this._isMotionStudioMode();

        if (!next.complexity || next.complexity === 'simple') {
            next.complexity = product ? 'complex' : (cinematicHint ? 'complex' : 'medium');
        }
        if (full && next.complexity !== 'ultra-complex') next.complexity = 'ultra-complex';

        if (full && next.framework === 'vanilla' && !this.frameworkOverride) next.framework = 'fullstack-nextjs';
        else if (product && next.framework === 'vanilla' && !this.frameworkOverride) next.framework = 'react-vite';

        if (!Array.isArray(next.sections) || next.sections.length < 5) {
            next.sections = product
                ? ['header', 'sidebar', 'main-dashboard', 'stats-cards', 'data-table', 'activity-feed', 'cta', 'footer']
                : ['hero', 'atmosphere', 'story', 'work', 'gallery', 'cta', 'footer'];
        }

        if (!Array.isArray(next.pages) || !next.pages.length) {
            next.pages = [{ id: 'home', path: '/', purpose: 'Primary cinematic experience', sections: next.sections }];
        }

        if (!Array.isArray(next.motionSystems) || !next.motionSystems.length) {
            next.motionSystems = cinematicHint
                ? ['masked-title-reveal', 'parallax-media-layers', 'magnetic-quickto-cta', 'grain-vignette-grade']
                : (next.animations || ['scroll-reveal', 'smooth-scroll', 'hover-effects']).slice(0, 4);
        }

        next.qualityContract = next.qualityContract || {};
        next.qualityContract.tier = next.qualityContract.tier || (cinematicHint ? 'motion-studio-awwwards' : 'signature-digital-studio');
        next.qualityContract.nonNegotiables = Array.from(new Set([
            ...(next.qualityContract.nonNegotiables || []),
            'Awwwards-level craft on public surfaces',
            'No thin recovery shells',
            'Working interactions for listed components',
            'Hero scene + scroll storytelling for marketing websites',
            'Complete multi-section structure for the product scope',
        ]));

        next.engineerMode = true;
        next.motionStudio = cinematicHint;
        next.aiMode = this.aiMode || 'production';
        return next;
    }

    _runStaticQualityGate(files) {
        const entries = Object.entries(files || {});
        const allCode = entries.map(([, content]) => String(content || '')).join('\n');
        const html = String(files['index.html'] || '');
        const isComponentBuild = entries.some(([name]) => /(?:app\/page|src\/App|app\/.+\/page)\.(?:tsx|jsx)$/.test(name));
        const isFullstack = entries.some(([name]) => /^app\//.test(name) || name === 'prisma/schema.prisma');
        const isReact = entries.some(([name]) => /^src\//.test(name));
        const issues = [];
        const add = (severity, category, file, description, fix) => issues.push({ severity, category, file, description, fix });

        if (!html && !isComponentBuild) add('critical', 'html', 'index.html', 'No page entry file was generated.', 'Generate a complete index.html or framework page entry.');
        if (html && !/<meta[^>]+name=["']viewport["']/i.test(html)) add('critical', 'accessibility', 'index.html', 'Viewport metadata is missing.', 'Add a responsive viewport meta tag.');
        if (html && !/<main[\s>]/i.test(html)) add('warning', 'html', 'index.html', 'The page has no semantic main landmark.', 'Wrap primary content in a main element.');

        if (/\b(lorem ipsum|todo:|coming soon|your company|zero recovery build|recovery shell|replace this recovery)\b/i.test(allCode)) {
            add('critical', 'premium-feel', 'generated files', 'Placeholder or recovery-shell content remains in the build.', 'Regenerate with complete brand-specific content and real sections — never ship recovery shells.');
        }

        if (/\b(10,?000\+? active users|99% satisfaction|250\+? integrations|trusted by leading)\b/i.test(allCode)) {
            add('warning', 'premium-feel', 'generated files', 'Unsupported, template-like social proof or vanity metrics were detected.', 'Replace invented claims with category-specific proof, or remove them.');
        }

        if (/\b(the future of|everything you need to|build, scale, and succeed|powerful features for)\b/i.test(allCode)) {
            add('warning', 'premium-feel', 'generated files', 'Generic marketing language weakens the art direction.', 'Replace with specific, brand-owned copy from the strategy.');
        }

        if (/\b(gradient-orb|floating-orb|particle-field)\b/i.test(allCode) && (this.memory.specification?.artDirection?.avoid || []).some((item) => /gradient|blob|particle/i.test(item))) {
            add('warning', 'premium-feel', 'generated files', 'The build uses a visual pattern that the art direction explicitly rejects.', 'Remove the generic decorative effect and reinforce the chosen visual motif.');
        }

        if (!/@media\s*\(prefers-reduced-motion/i.test(allCode)) {
            add('warning', 'accessibility', 'styles', 'No reduced-motion fallback was found.', 'Add a prefers-reduced-motion media query that disables nonessential motion.');
        }

        const minBytes = (this.memory.specification?.complexity === 'ultra-complex' || isFullstack) ? 12000
            : (this.memory.specification?.complexity === 'complex' || isReact) ? 8000
                : 5000;

        if (allCode.length < minBytes) {
            add('critical', 'html', 'generated files', `The generated site is too small (${allCode.length} chars) for a production ${this.memory.specification?.complexity || 'premium'} build.`, 'Generate complete page structure, styles, interactions, and multi-section content.');
        }

        if (html && (html.match(/<section[\s>]/gi) || []).length < 3) {
            add('warning', 'premium-feel', 'index.html', 'Fewer than three sections found — the build may feel thin.', 'Add complete art-directed sections matching the specification.');
        }

        const cinematic = this._isCinematicWebsite(this.memory.specification || {}, this.memory.engineeredBrief);
        if (cinematic && html) {
            const hasHeroScene = /data-scene|hero-video|three-canvas|webgl|video[\s\S]{0,120}autoplay|<video[\s>]/i.test(allCode);
            if (!hasHeroScene) {
                add('critical', 'hero-scene', 'index.html', 'Cinematic site is missing a real hero scene (video, WebGL canvas, or data-scene media hero).', 'Build a full-bleed hero with video loop, WebGL, or editorial media mask — not gradient orbs.');
            }

            if (/\bgradient-orb\b/i.test(allCode) && !/webgl|three-canvas|hero-video/i.test(allCode)) {
                add('critical', 'premium-feel', 'generated files', 'Gradient-orb hero detected without cinematic media/WebGL — feels like a generic AI template.', 'Replace orbs with video/WebGL/photo hero matching the art direction.');
            }

            const hasScrollMotion = /ScrollTrigger|scrollTrigger|data-animate|scrub\s*:/i.test(allCode);
            if (!hasScrollMotion) {
                add('critical', 'scroll-story', 'script.js', 'No scroll-linked motion system found for a cinematic website.', 'Implement GSAP ScrollTrigger pin/scrub or data-animate scroll reveals from the motion plan.');
            }

            if (this.memory.specification?.has3D && !/three|WebGLRenderer|THREE\./i.test(allCode)) {
                add('critical', 'hero-scene', 'three-scene.js', 'Brief requires WebGL/3D but no Three.js scene code was found.', 'Generate a working three-scene.js and mount canvas in the hero.');
            }

            if ((this.memory.specification?.heroTreatment === 'video-loop' || this.memory.specification?.heroTreatment === 'hybrid')
                && !/<video[\s>]/i.test(allCode)
                && !this.memory.specification?.has3D) {
                add('warning', 'hero-scene', 'index.html', 'Video hero treatment planned but no <video> element found.', 'Add a muted autoplay loop hero video with poster fallback.');
            }
        }

        if (isFullstack) {
            if (!entries.some(([name]) => /prisma\/schema\.prisma/.test(name))) {
                add('warning', 'architecture', 'prisma/schema.prisma', 'Full-stack build is missing a Prisma schema.', 'Add prisma/schema.prisma with real models.');
            }
            if (!entries.some(([name]) => /app\/api\/.+\/route\.(ts|js)$/.test(name))) {
                add('warning', 'architecture', 'app/api', 'No API route handlers found for a full-stack product.', 'Add validated App Router API routes for core entities.');
            }
        }

        if (isReact && !entries.some(([name]) => /src\/components\//.test(name))) {
            add('warning', 'architecture', 'src/components', 'React project has no component split — likely a thin single-file app.', 'Split UI into reusable components under src/components/.');
        }

        // ─── Design Philosophy & Advanced Effects Checks ───
        const spec = this.memory.specification || {};
        const designPhilosophy = spec.designPhilosophy || this.memory.designSystem?.designPhilosophy || '';
        const advancedEffects = spec.advancedEffects || this.memory.designSystem?.advancedEffects || [];

        // Check design philosophy CSS classes are present
        if (designPhilosophy && allCode) {
            const philosophyChecks = {
                skeuomorphism: /\.skeu-|skeu-surface|skeu-button|skeu-card/i,
                neomorphism: /\.neo-|neo-flat|neo-pressed|neo-button|neo-card/i,
                glassmorphism: /\.glass|glass-card|glass-button|glass-navbar|backdrop-filter/i,
                claymorphism: /\.clay|clay-card|clay-button|clay-bubble/i,
                minimalism: /\.min-|min-card|min-button|min-divider|min-surface/i,
                maximalism: /\.max-|max-card|max-button|max-surface|max-blob/i,
                brutalism: /\.brutal-|brutal-card|brutal-button|brutal-surface/i,
                liquidglass: /liquid-glass|liquid.glass|backdrop-filter.*blur/i,
                spatialui: /spatial-|perspective:|transform-style.*preserve-3d|spatial-card|spatial-window/i
            };
            const regex = philosophyChecks[designPhilosophy];
            if (regex && !regex.test(allCode)) {
                add('warning', 'design-philosophy', 'styles.css', `Design philosophy "${designPhilosophy}" was specified but its CSS classes/patterns were not found.`, `Apply ${designPhilosophy} design system classes throughout the generated code.`);
            }
        }

        // Check advanced effects implementation
        if (advancedEffects.length > 0 && allCode) {
            const hasHover = /data-hover|hover="(lift|glow|tilt|spotlight|perspective)"/i.test(allCode);
            const has3D = /data-3d|data-scroll-3d|perspective\(|rotateX\(|rotateY\(/i.test(allCode);
            const hasReveal = /data-reveal|\.revealed/i.test(allCode);
            const hasMicro = /data-micro|\.ripple|micro.*bounce|micro.*magnetic/i.test(allCode);
            const hasLoader = /page-loader|loader-spinner|loader-bar/i.test(allCode);
            const hasParallax = /data-parallax|parallax-scroll|parallax-depth/i.test(allCode);

            if (advancedEffects.some(e => e.startsWith('hover')) && !hasHover) {
                add('suggestion', 'advanced-effects', 'index.html', 'Hover effects were specified but no data-hover attributes found.', 'Add data-hover="tilt" or data-hover="glow" on cards and interactive elements.');
            }
            if (advancedEffects.some(e => e.startsWith('3d')) && !has3D) {
                add('warning', 'advanced-effects', 'generated files', '3D effects specified but no perspective/rotate transforms or data-3d attributes found.', 'Add data-3d="tilt" on cards, data-scroll-3d on sections, or .window-3d mockups.');
            }
            if (advancedEffects.some(e => e.startsWith('entrance')) && !hasReveal) {
                add('suggestion', 'advanced-effects', 'index.html', 'Entrance reveals specified but no data-reveal attributes found.', 'Add data-reveal="blur" or data-reveal="slide-up" on section elements.');
            }
            if (advancedEffects.includes('smooth-loader') && !hasLoader) {
                add('suggestion', 'advanced-effects', 'index.html', 'Smooth loader effect specified but no .page-loader element found.', 'Add a page loader with .page-loader class and entrance transition.');
            }
        }

        return { issues, critical: issues.some((issue) => issue.severity === 'critical') };
    }

    /* ===== REFINE EXISTING CODE ===== */
    async refine(modificationPrompt) {
        if (Object.keys(this.memory.generatedFiles || {}).length === 0) {
            throw new Error('No website generated yet. Generate one first.');
        }

        const refiner = this.agents['refiner'];
        if (!refiner) throw new Error('Refiner agent not registered');

        if (this._generationLock) {
            throw new Error('Generation already in progress. Wait for completion or cancel.');
        }

        this._generationLock = true;
        this._transition(this.states.REFINING);
        this.abortController = new AbortController();
        const projectContext = this.getProjectContext(modificationPrompt);

        if (projectContext) {
            this.emit('log', {
                type: 'info',
                message: `Project Brain indexed ${projectContext.repository.fileCount} files; focused ${projectContext.files.length} relevant files for this task.`,
            });
            this.emit('log', { type: 'info', message: projectContext.executionPlan.summary });
        }

        this.emit('progress', { step: 'reviewing', percent: 50, message: `Applying changes: "${modificationPrompt}"` });
        this.emit('log', { type: 'info', message: `Refining: ${modificationPrompt}` });

        try {
            this._checkAbort();
            const updatedFiles = await refiner.execute(
                this.memory.generatedFiles,
                modificationPrompt,
                this.memory.specification,
                this.memory.designSystem
            );

            if (updatedFiles && typeof updatedFiles === 'object') {
                Object.assign(this.memory.generatedFiles, updatedFiles);
            }
            this.memory.refinementHistory.push({
                prompt: modificationPrompt,
                timestamp: Date.now(),
                filesChanged: Object.keys(updatedFiles || {}),
            });

            this._transition(this.states.COMPLETE);
            this.emit('progress', { step: 'complete', percent: 100, message: 'Refinement complete!' });
            this.emit('filesReady', this.memory.generatedFiles);
            this.emit('complete', this.memory.generatedFiles);

            return this.memory.generatedFiles;
        } catch (error) {
            if (error?.message === 'ABORTED') {
                this._transition(this.states.IDLE);
                this.emit('log', { type: 'warning', message: 'Refinement cancelled by user' });
                return null;
            }
            this._transition(this.states.ERROR);
            this.emit('error', { message: error.message });
            this._transition(this.states.IDLE);
            throw error;
        } finally {
            this._generationLock = false;
        }
    }

    /* ===== CANCELLATION ===== */
    cancel() {
        if (this.abortController) {
            this.abortController.abort();
        }
        // Allow a fresh generate/refine after cancel even if a long LLM call
        // is still unwinding — the finally blocks still clear the lock safely.
        this._generationLock = false;
    }

    _checkAbort() {
        if (this.abortController?.signal?.aborted) {
            throw new Error('ABORTED');
        }
    }

    /* ===== UTILITY ===== */
    getState() {
        return this.currentState;
    }

    getMemory() {
        return { ...this.memory };
    }

    getHistory() {
        return [...this.stateHistory];
    }

    getStatus() {
        return {
            state: this.currentState,
            retries: this.maxRetries,
            errors: this.memory.errors.length,
            files: Object.keys(this.memory.generatedFiles || {}).length,
            hasSpec: !!this.memory.specification,
            hasDesign: !!this.memory.designSystem,
            hasReview: !!this.memory.reviewReport,
        };
    }

    reset() {
        this.currentState = this.states.IDLE;
        this.stateHistory = [];
        this.errorCount = 0;
        this.memory = this._createEmptyMemory();
        this.emit('stateChange', { from: 'any', to: this.states.IDLE });
    }
}

/* ============================================================
   EXPORTS
   ============================================================ */
window.AgentFramework = AgentFramework;
window.BaseAgent = BaseAgent;