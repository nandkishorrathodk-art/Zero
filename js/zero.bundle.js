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

;
/* ============================================================
   COMPONENT LIBRARY — Curated Production Component System
   30+ pre-tested Awwwards-caliber component templates covering
   all 9 design philosophies and advanced animation systems.
   ============================================================ */

class ComponentLibrary {
    constructor() {
        this.storageKey = 'zero_builder_custom_components_v1';
        this.builtInComponents = this._initBuiltInComponents();
        this.customComponents = this._loadCustomComponents();
    }

    _initBuiltInComponents() {
        return {
            // ─── HERO VARIANTS ───
            'hero-liquid-glass-video': {
                id: 'hero-liquid-glass-video',
                name: 'Liquid Glass Cinematic Video Hero',
                category: 'hero',
                philosophy: 'liquidglass',
                html: `<section class="hero" id="hero" data-scene="hero">
  <div class="video-layer" data-fading-video data-sources='["https://assets.mixkit.co/videos/preview/mixkit-abstract-fast-lines-of-light-31772-large.mp4"]'>
    <video class="fading-video active" autoplay muted playsinline loop></video>
  </div>
  <div class="hero-overlay"></div>
  <div class="hero-content container">
    <div class="hero-badge liquid-glass" data-reveal="fade">
      <span class="badge-dot"></span>
      <span>Next Generation Motion Studio</span>
    </div>
    <h1 class="hero-title" data-blur-text>Crafting Digital Experiences Built to Outlast Trends</h1>
    <p class="hero-subtitle" data-reveal="slide-up" data-delay="0.3">We build high-performance web applications and cinematic motion systems for forward-thinking brands.</p>
    <div class="hero-cta" data-reveal="slide-up" data-delay="0.5">
      <a href="#work" class="btn btn-primary liquid-glass-button" data-magnet="0.3" data-micro="ripple">Explore Work</a>
      <a href="#contact" class="btn btn-secondary liquid-glass-button" data-magnet="0.2">Book a Call</a>
    </div>
  </div>
  <div class="hero-scroll-indicator" data-reveal="fade" data-delay="0.8">
    <div class="scroll-mouse"><div class="scroll-dot"></div></div>
    <span>Scroll to explore</span>
  </div>
</section>`,
                css: `.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:120px 0 60px}.hero-content{position:relative;z-index:2;text-align:center;max-width:900px;margin:0 auto}.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;font-size:0.8rem;margin-bottom:1.5rem}.badge-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e}.hero-title{font-family:var(--font-heading);font-size:clamp(2.5rem,6vw,5.5rem);font-weight:700;line-height:1.05;margin-bottom:1.5rem;letter-spacing:-0.02em}.hero-subtitle{font-size:clamp(1rem,1.5vw,1.25rem);color:rgba(255,255,255,0.7);max-width:640px;margin:0 auto 2.5rem;line-height:1.6}.hero-cta{display:flex;gap:1rem;justify-content:center;align-items:center}.hero-scroll-indicator{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;font-size:0.75rem;opacity:0.5;z-index:2}.scroll-mouse{width:20px;height:32px;border:1.5px solid currentColor;border-radius:10px;position:relative}.scroll-dot{width:3px;height:6px;background:currentColor;border-radius:2px;position:absolute;top:6px;left:50%;transform:translateX(-50%);animation:scrollDot 1.5s ease-in-out infinite}@keyframes scrollDot{0%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,12px)}}`
            },

            'hero-spatial-3d-window': {
                id: 'hero-spatial-3d-window',
                name: 'Spatial UI 3D Window Hero',
                category: 'hero',
                philosophy: 'spatialui',
                html: `<section class="hero spatial-scene" id="hero" data-scene="hero">
  <div class="bg-3d-grid"></div>
  <div class="container hero-spatial-layout">
    <div class="hero-text-col" data-reveal="slide-left">
      <div class="spatial-hud spatial-hud-tl">// SPATIAL OS V4.0</div>
      <h1 class="hero-title">Spatial Computing for the Web</h1>
      <p class="hero-subtitle">Immersive 3D perspective layers, spatial windows, and interactive depth choreography.</p>
      <button class="spatial-button" data-micro="ripple">Initialize Workspace</button>
    </div>
    <div class="hero-window-col" data-3d="tilt">
      <div class="window-3d spatial-window window-3d-float" data-3d-interactive>
        <div class="window-3d-titlebar">
          <span class="window-3d-dot window-3d-dot-red"></span>
          <span class="window-3d-dot window-3d-dot-yellow"></span>
          <span class="window-3d-dot window-3d-dot-green"></span>
          <span class="window-3d-title">spatial-canvas.app — 3D Viewport</span>
        </div>
        <div class="window-3d-body">
          <div class="spatial-card" data-hover="perspective">
            <h3>Interactive Perspective Card</h3>
            <p>Hover over this card to feel live z-space 3D perspective distortion.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
                css: `.hero-spatial-layout{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;min-height:100vh;position:relative;z-index:2}@media(max-width:968px){.hero-spatial-layout{grid-template-columns:1fr;text-align:center}}`
            },

            // ─── STACKING / SCROLL CARDS ───
            'stacking-cards-glass': {
                id: 'stacking-cards-glass',
                name: 'GSAP Sticky Stacking Cards Scene',
                category: 'content',
                philosophy: 'glassmorphism',
                html: `<section class="section stacking-cards-section" id="process" data-scene="stacking">
  <div class="container">
    <header class="section-header" data-reveal="fade">
      <span class="section-label">// OUR METHODOLOGY</span>
      <h2 class="section-title">How We Build Future Products</h2>
    </header>
    <div class="stacking-cards">
      <div class="stacking-card glass-card" data-scroll-3d="rotate">
        <span class="card-num">01</span>
        <h3>Strategic Discovery & Visioning</h3>
        <p>Deep-dive audit into brand identity, audience expectations, and motion choreography opportunities.</p>
      </div>
      <div class="stacking-card glass-card" data-scroll-3d="rotate">
        <span class="card-num">02</span>
        <h3>Design System Architecture</h3>
        <p>Crafting bespoke CSS design tokens, fluid typography formulas, and custom glass surface shaders.</p>
      </div>
      <div class="stacking-card glass-card" data-scroll-3d="rotate">
        <span class="card-num">03</span>
        <h3>High-Performance Execution</h3>
        <p>Writing clean, GPU-accelerated GSAP timelines, Lenis smooth scroll, and accessible DOM structures.</p>
      </div>
    </div>
  </div>
</section>`,
                css: `.stacking-cards{display:grid;gap:2rem;margin-top:3rem}.stacking-card{padding:3rem;border-radius:24px;position:relative}.card-num{font-family:var(--font-heading);font-size:3rem;opacity:0.2;position:absolute;top:2rem;right:2rem}`
            },

            // ─── PROOF / COUNTERS ───
            'stats-counters-neo': {
                id: 'stats-counters-neo',
                name: 'Neomorphic Stats Counter Grid',
                category: 'proof',
                philosophy: 'neomorphism',
                html: `<section class="section stats-section" id="impact" data-scene="proof">
  <div class="container">
    <div class="neo-card stats-grid" data-reveal="slide-up">
      <div class="stat-item neo-flat" data-hover="lift">
        <div class="stat-num" data-micro="counter" data-count="99">0</div>
        <div class="stat-label">Client Satisfaction %</div>
      </div>
      <div class="stat-item neo-flat" data-hover="lift">
        <div class="stat-num" data-micro="counter" data-count="140">0</div>
        <div class="stat-label">Awwwards & SiteOfTheDay</div>
      </div>
      <div class="stat-item neo-flat" data-hover="lift">
        <div class="stat-num" data-micro="counter" data-count="50">0</div>
        <div class="stat-label">Global Team Members</div>
      </div>
    </div>
  </div>
</section>`,
                css: `.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;padding:2rem}.stat-item{padding:2rem;text-align:center;border-radius:16px}.stat-num{font-family:var(--font-heading);font-size:3.5rem;font-weight:700;color:var(--color-primary,#fff);line-height:1}.stat-label{font-size:0.85rem;opacity:0.7;margin-top:0.5rem}`
            }
        };
    }

    _loadCustomComponents() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    getComponent(id) {
        return this.builtInComponents[id] || this.customComponents[id] || null;
    }

    getComponentsByPhilosophy(philosophyKey) {
        const all = { ...this.builtInComponents, ...this.customComponents };
        return Object.values(all).filter(c => c.philosophy === philosophyKey);
    }

    getComponentsByCategory(category) {
        const all = { ...this.builtInComponents, ...this.customComponents };
        return Object.values(all).filter(c => c.category === category);
    }

    saveCustomComponent(component) {
        if (!component.id) component.id = 'custom_' + Date.now();
        this.customComponents[component.id] = component;
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.customComponents));
        } catch (e) {
            console.warn('Save custom component failed:', e.message);
        }
        return component;
    }
}

window.ComponentLibrary = ComponentLibrary;

;
/* ============================================================
   VERSION CONTROL — Snapshots, Rollback & Code Diff Engine
   Tracks full-project version snapshots in IndexedDB / localStorage.
   Provides rollback, branch comparison, and file diffing.
   ============================================================ */

class VersionControlManager {
    constructor() {
        this.storageKey = 'zero_builder_version_snapshots_v1';
        this.maxSnapshots = 25;
        this.snapshots = this._loadSnapshots();
    }

    _loadSnapshots() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('VersionControl load failed:', e.message);
            return [];
        }
    }

    _saveSnapshots() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.snapshots));
        } catch (e) {
            console.warn('VersionControl save failed:', e.message);
        }
    }

    // Create a new snapshot of current project files
    createSnapshot({ label, prompt, files, reviewScore = null }) {
        if (!files || !Object.keys(files).length) return null;

        const versionId = 'v_' + Date.now();
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const snapshot = {
            id: versionId,
            versionNumber: this.snapshots.length + 1,
            label: label || `Version ${this.snapshots.length + 1}`,
            prompt: prompt || 'Manual Snapshot',
            timestamp,
            dateIso: new Date().toISOString(),
            files: JSON.parse(JSON.stringify(files)),
            reviewScore: reviewScore || 0,
            fileCount: Object.keys(files).length,
            totalChars: Object.values(files).join('').length
        };

        this.snapshots.unshift(snapshot);
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.pop();
        }

        this._saveSnapshots();
        console.log(`[VersionControl] Created snapshot ${snapshot.id} (${snapshot.label})`);
        return snapshot;
    }

    getSnapshots() {
        return this.snapshots;
    }

    getSnapshot(id) {
        return this.snapshots.find(s => s.id === id) || null;
    }

    // Compare two file versions line-by-line
    diffFiles(oldCode = '', newCode = '') {
        const oldLines = String(oldCode).split('\n');
        const newLines = String(newCode).split('\n');
        const diff = [];

        let i = 0, j = 0;
        while (i < oldLines.length || j < newLines.length) {
            if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
                diff.push({ type: 'same', line: oldLines[i] });
                i++; j++;
            } else if (j < newLines.length && (!oldLines[i] || !oldLines.includes(newLines[j]))) {
                diff.push({ type: 'add', line: newLines[j] });
                j++;
            } else if (i < oldLines.length) {
                diff.push({ type: 'remove', line: oldLines[i] });
                i++;
            }
        }

        return diff;
    }

    clearSnapshots() {
        this.snapshots = [];
        this._saveSnapshots();
    }
}

window.VersionControlManager = VersionControlManager;

;
/* ============================================================
   ZERO-BUILDER — Custom LLM Provider System
   Supports: Gemini, OpenAI, Anthropic, DeepSeek, Groq, 
             Mistral, Ollama, and any OpenAI-compatible API
   ============================================================ */

class LLMProvider {
    constructor() {
        this.providers = {
            gemini: {
                name: 'Google Gemini',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                models: [
                    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast & Free)' },
                    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Best Quality)' },
                    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
                ],
                format: 'gemini',
                color: '#22c55e',
            },
            openai: {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1',
                models: [
                    { id: 'gpt-4o', name: 'GPT-4o (Recommended)' },
                    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Cheaper)' },
                    { id: 'gpt-4.1', name: 'GPT-4.1' },
                    { id: 'o3-mini', name: 'o3-mini (Reasoning)' },
                ],
                format: 'openai',
                color: '#f97316',
            },
            anthropic: {
                name: 'Anthropic Claude',
                baseUrl: 'https://api.anthropic.com/v1',
                models: [
                    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Recommended)' },
                    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4 (Best Quality)' },
                    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast)' },
                ],
                format: 'anthropic',
                color: '#a855f7',
            },
            deepseek: {
                name: 'DeepSeek',
                baseUrl: 'https://api.deepseek.com/v1',
                models: [
                    { id: 'deepseek-chat', name: 'DeepSeek V3 (Recommended)' },
                    { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoning)' },
                ],
                format: 'openai-compatible',
                color: '#3b82f6',
            },
            groq: {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1',
                models: [
                    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Recommended)' },
                    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
                    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
                ],
                format: 'openai-compatible',
                color: '#eab308',
            },
            mistral: {
                name: 'Mistral',
                baseUrl: 'https://api.mistral.ai/v1',
                models: [
                    { id: 'mistral-large-latest', name: 'Mistral Large (Best)' },
                    { id: 'codestral-latest', name: 'Codestral (Code-optimized)' },
                    { id: 'mistral-small-latest', name: 'Mistral Small (Fast)' },
                ],
                format: 'openai-compatible',
                color: '#ef4444',
            },
            ollama: {
                name: 'Ollama (Local)',
                baseUrl: 'http://localhost:11434/v1',
                models: [
                    { id: 'llama3.1', name: 'Llama 3.1' },
                    { id: 'codellama', name: 'CodeLlama' },
                    { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2' },
                    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder' },
                ],
                format: 'openai-compatible',
                color: '#a78bfa',
                noApiKey: true,
            },
            custom: {
                name: 'Custom Endpoint',
                baseUrl: '',
                models: [{ id: 'custom', name: 'Custom Model' }],
                format: 'openai-compatible',
                color: '#6b7280',
            },
        };

        this.currentProvider = 'gemini';
        this.currentModel = 'gemini-2.5-flash';
        this.apiKeys = {};
        this.customBaseUrl = '';
        this.customModelName = '';
        this.tokenUsage = { total: 0, today: 0 };
        
        this._loadSettings();
    }

    /* ===== SETTINGS PERSISTENCE ===== */
    _loadSettings() {
        try {
            const saved = localStorage.getItem('zb_llm_settings');
            if (saved) {
                const s = JSON.parse(saved);
                this.currentProvider = s.currentProvider || 'gemini';
                this.currentModel = s.currentModel || 'gemini-2.5-flash';
                this.apiKeys = s.apiKeys || {};
                this.customBaseUrl = s.customBaseUrl || '';
                this.customModelName = s.customModelName || '';
                this.tokenUsage = s.tokenUsage || { total: 0, today: 0 };

                // Auto-sanitize broken content-safety / nemotron models
                if (typeof this.customModelName === 'string' && (this.customModelName.includes('content-safety') || this.customModelName.includes('nemotron'))) {
                    this.customModelName = '';
                    this.currentProvider = 'gemini';
                    this.currentModel = 'gemini-2.5-flash';
                }
            }
        } catch (e) {
            console.warn('Failed to load LLM settings:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('zb_llm_settings', JSON.stringify({
                currentProvider: this.currentProvider,
                currentModel: this.currentModel,
                apiKeys: this.apiKeys,
                customBaseUrl: this.customBaseUrl,
                customModelName: this.customModelName,
                tokenUsage: this.tokenUsage,
            }));
        } catch (e) {
            console.warn('Failed to save LLM settings:', e);
        }
    }

    /* ===== PROVIDER MANAGEMENT ===== */
    setProvider(providerId, modelId) {
        if (!this.providers[providerId]) throw new Error(`Unknown provider: ${providerId}`);
        this.currentProvider = providerId;
        this.currentModel = modelId || this.providers[providerId].models[0].id;
        this.saveSettings();
    }

    setApiKey(providerId, key) {
        this.apiKeys[providerId] = key;
        this.saveSettings();
    }

    getApiKey(providerId) {
        return this.apiKeys[providerId || this.currentProvider] || '';
    }

    getProviderInfo() {
        return this.providers[this.currentProvider];
    }

    getModels(providerId) {
        const p = this.providers[providerId || this.currentProvider];
        return p ? p.models : [];
    }

    /* ===== CORE CHAT METHOD ===== */
    async chat(messages, options = {}) {
        const provider = this.providers[this.currentProvider];
        const apiKey = this.apiKeys[this.currentProvider];
        const model = options.model || this.currentModel;
        
        if (!provider.noApiKey && this.currentProvider !== 'custom' && !apiKey) {
            throw new Error(`No API key configured for ${provider.name}. Go to Settings → AI Provider.`);
        }

        switch (provider.format) {
            case 'gemini':
                return this._chatGemini(messages, model, apiKey, options);
            case 'openai':
                return this._chatOpenAI(messages, model, apiKey, provider.baseUrl, options);
            case 'anthropic':
                return this._chatAnthropic(messages, model, apiKey, options);
            case 'openai-compatible':
                const baseUrl = this.currentProvider === 'custom' 
                    ? this.customBaseUrl 
                    : provider.baseUrl;
                if (!baseUrl) {
                    throw new Error(`No Base URL configured for ${provider.name}. Go to Settings → AI Provider and set the Custom Base URL.`);
                }
                const actualModel = this.currentProvider === 'custom'
                    ? this.customModelName || model
                    : model;
                return this._chatOpenAI(messages, actualModel, apiKey, baseUrl, options);
            default:
                throw new Error(`Unknown format: ${provider.format}`);
        }
    }

    /* ===== STREAMING CHAT ===== */
    async stream(messages, options = {}, onChunk) {
        const provider = this.providers[this.currentProvider];
        const apiKey = this.apiKeys[this.currentProvider];
        const model = options.model || this.currentModel;

        if (!provider.noApiKey && this.currentProvider !== 'custom' && !apiKey) {
            throw new Error(`No API key configured for ${provider.name}. Go to Settings → AI Provider.`);
        }

        switch (provider.format) {
            case 'gemini':
                return this._streamGemini(messages, model, apiKey, options, onChunk);
            case 'openai':
                return this._streamOpenAI(messages, model, apiKey, provider.baseUrl, options, onChunk);
            case 'anthropic':
                return this._streamAnthropic(messages, model, apiKey, options, onChunk);
            case 'openai-compatible':
                const baseUrl = this.currentProvider === 'custom' ? this.customBaseUrl : provider.baseUrl;
                if (!baseUrl) {
                    throw new Error(`No Base URL configured for ${provider.name}. Go to Settings → AI Provider and set the Custom Base URL.`);
                }
                const actualModel = this.currentProvider === 'custom' ? this.customModelName || model : model;
                return this._streamOpenAI(messages, actualModel, apiKey, baseUrl, options, onChunk);
            default:
                throw new Error(`Unknown format: ${provider.format}`);
        }
    }

    /* ===== GOOGLE GEMINI ADAPTER ===== */
    _extractSystemPrompt(messages = [], options = {}) {
        const fromMessages = (messages || [])
            .filter((m) => m && m.role === 'system' && m.content)
            .map((m) => String(m.content).trim())
            .filter(Boolean)
            .join('\n\n');
        const fromOptions = String(options.systemPrompt || '').trim();
        if (fromMessages && fromOptions) return `${fromOptions}\n\n${fromMessages}`;
        return fromOptions || fromMessages || '';
    }

    async _chatGemini(messages, model, apiKey, options) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const contents = this._convertToGeminiFormat(messages);
        const systemPrompt = this._extractSystemPrompt(messages, options);
        
        const body = {
            contents,
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 32768,
                topP: options.topP || 0.95,
            },
        };

        if (systemPrompt) {
            body.systemInstruction = { parts: [{ text: systemPrompt }] };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${err}`);
        }

        const data = await response.json();
        // Gemini may return multiple parts; join them. Also surface blocked responses.
        const parts = data.candidates?.[0]?.content?.parts || [];
        const text = parts.map((p) => p.text || '').join('') || '';
        if (!text && data.promptFeedback?.blockReason) {
            throw new Error(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
        }
        
        this._trackTokens(text.length / 4); // rough estimate
        return text;
    }

    async _streamGemini(messages, model, apiKey, options, onChunk) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        
        const contents = this._convertToGeminiFormat(messages);
        const systemPrompt = this._extractSystemPrompt(messages, options);
        const body = {
            contents,
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 32768,
            },
        };

        if (systemPrompt) {
            body.systemInstruction = { parts: [{ text: systemPrompt }] };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini stream error (${response.status}): ${err}`);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.slice(6));
                        const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        if (chunk) {
                            fullText += chunk;
                            if (onChunk) onChunk(chunk, fullText);
                        }
                    } catch (e) { /* skip malformed chunks */ }
                }
            }
        }

        this._trackTokens(fullText.length / 4);
        return fullText;
    }

    _convertToGeminiFormat(messages) {
        return messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));
    }

    /* ===== OPENAI / OPENAI-COMPATIBLE ADAPTER ===== */
    async _chatOpenAI(messages, model, apiKey, baseUrl, options) {
        const url = `${baseUrl}/chat/completions`;
        
        const allMessages = [];
        if (options.systemPrompt) {
            allMessages.push({ role: 'system', content: options.systemPrompt });
        }
        allMessages.push(...messages);

        const body = {
            model,
            messages: allMessages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 32768,
        };

        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
        } catch (e) {
            if (window.location.protocol === 'https:' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
                throw new Error(`Browser Security Blocked Local Connection: You are on HTTPS but trying to connect to local Ollama. Please open http://zero-ai.surge.sh (without the 's') or run Zero-Builder locally using 'node server.js'.`);
            }
            throw new Error(`Network Error: Failed to connect to ${url}. Please verify your Base URL (e.g. openrouter.ai instead of openrouter.io) and check your internet connection. (${e.message})`);
        }

        if (!response.ok) {
            const err = await response.text();
            if (response.status === 401) {
                throw new Error(`Authentication Error (401): Missing Authentication header. If your custom API requires an API key (e.g. OpenRouter, Together AI, Groq), please enter it in Settings → AI Provider → API Key.`);
            }
            throw new Error(`API error (${response.status}): ${err}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        this._trackTokens(data.usage?.total_tokens || text.length / 4);
        return text;
    }

    async _streamOpenAI(messages, model, apiKey, baseUrl, options, onChunk) {
        const url = `${baseUrl}/chat/completions`;
        
        const allMessages = [];
        if (options.systemPrompt) {
            allMessages.push({ role: 'system', content: options.systemPrompt });
        }
        allMessages.push(...messages);

        const body = {
            model,
            messages: allMessages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 32768,
            stream: true,
        };

        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
        } catch (e) {
            if (window.location.protocol === 'https:' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
                throw new Error(`Browser Security Blocked Local Connection: You are on HTTPS but trying to connect to local Ollama. Please open http://zero-ai.surge.sh (without the 's') or run Zero-Builder locally using 'node server.js'.`);
            }
            throw new Error(`Network Error: Failed to connect to ${url}. Please verify your Base URL (e.g. openrouter.ai instead of openrouter.io) and check your internet connection. (${e.message})`);
        }

        if (!response.ok) {
            const err = await response.text();
            if (response.status === 401) {
                throw new Error(`Authentication Error (401): Missing Authentication header. If your custom API requires an API key (e.g. OpenRouter, Together AI, Groq), please enter it in Settings → AI Provider → API Key.`);
            }
            throw new Error(`Stream error (${response.status}): ${err}`);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const json = JSON.parse(line.slice(6));
                        const chunk = json.choices?.[0]?.delta?.content || '';
                        if (chunk) {
                            fullText += chunk;
                            if (onChunk) onChunk(chunk, fullText);
                        }
                    } catch (e) { /* skip */ }
                }
            }
        }

        this._trackTokens(fullText.length / 4);
        return fullText;
    }

    /* ===== ANTHROPIC ADAPTER ===== */
    async _chatAnthropic(messages, model, apiKey, options) {
        const url = 'https://api.anthropic.com/v1/messages';
        const systemPrompt = this._extractSystemPrompt(messages, options);
        // Anthropic rejects role:"system" inside messages — keep only user/assistant turns.
        const conversation = (messages || [])
            .filter((m) => m && m.role !== 'system')
            .map((m) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            }));
        
        const body = {
            model,
            max_tokens: options.maxTokens || 32768,
            messages: conversation,
        };

        if (systemPrompt) {
            body.system = systemPrompt;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic error (${response.status}): ${err}`);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        this._trackTokens(data.usage?.input_tokens + data.usage?.output_tokens || text.length / 4);
        return text;
    }

    async _streamAnthropic(messages, model, apiKey, options, onChunk) {
        const url = 'https://api.anthropic.com/v1/messages';
        const systemPrompt = this._extractSystemPrompt(messages, options);
        const conversation = (messages || [])
            .filter((m) => m && m.role !== 'system')
            .map((m) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            }));
        
        const body = {
            model,
            max_tokens: options.maxTokens || 32768,
            stream: true,
            messages: conversation,
        };

        if (systemPrompt) {
            body.system = systemPrompt;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic stream error (${response.status}): ${err}`);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.slice(6));
                        if (json.type === 'content_block_delta') {
                            const chunk = json.delta?.text || '';
                            if (chunk) {
                                fullText += chunk;
                                if (onChunk) onChunk(chunk, fullText);
                            }
                        }
                    } catch (e) { /* skip */ }
                }
            }
        }

        this._trackTokens(fullText.length / 4);
        return fullText;
    }

    /* ===== TOKEN TRACKING ===== */
    _trackTokens(count) {
        this.tokenUsage.total += Math.round(count);
        this.tokenUsage.today += Math.round(count);
        this.saveSettings();
    }

    getTokenUsage() {
        return { ...this.tokenUsage };
    }

    /* ===== CONNECTION TEST ===== */
    async testConnection() {
        try {
            const result = await this.chat(
                [{ role: 'user', content: 'Say "OK" and nothing else.' }],
                { maxTokens: 10, temperature: 0 }
            );
            return { success: true, message: `Connected! Response: ${result.trim()}` };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }
}

// Global instance
window.llmProvider = new LLMProvider();

;
/* ============================================================
   PROJECT BRAIN — repository-scale memory and context retrieval
   Keeps large projects understandable without sending every file
   to the model on every request.
   Upgraded: better fingerprinting, aliases, symbol graph, scoring,
   context packing, and request-aware retrieval.
   ============================================================ */

class ProjectBrain {
    constructor(options = {}) {
        this.index = null;
        this.lastFingerprint = '';
        this.maxContextChars = options.maxContextChars || 76000;
        this.maxFilesPerTask = options.maxFilesPerTask || 16;

        this.stopWords = new Set([
            'this', 'that', 'with', 'from', 'have', 'will', 'your', 'const', 'return',
            'import', 'export', 'function', 'class', 'true', 'false', 'null', 'undefined',
            'the', 'and', 'for', 'are', 'you', 'our', 'use', 'used', 'using', 'into', 'than',
            'then', 'been', 'was', 'were', 'can', 'may', 'should', 'could', 'would', 'there',
            'their', 'them', 'they', 'what', 'when', 'where', 'which', 'also', 'than'
        ]);
    }

    /* ============================================================
       INDEX BUILDING
       ============================================================ */
    buildIndex(files = {}) {
        const entries = Object.entries(files || {});
        const fingerprint = this._fingerprint(entries);

        if (this.index && fingerprint === this.lastFingerprint) {
            return this.index;
        }

        const records = {};
        const symbolOwners = new Map();

        for (const [path, source] of entries) {
            const text = String(source || '');

            const record = {
                path,
                chars: text.length,
                lines: text.split('\n').length,
                kind: this._kind(path),
                imports: this._imports(text),
                exports: this._exports(text),
                terms: this._terms(`${path}\n${text}`),
                route: this._route(path),
                importance: this._importance(path, text),
                isContract: this._isContract(path),
            };

            records[path] = record;

            for (const symbol of record.exports) {
                if (!symbolOwners.has(symbol)) symbolOwners.set(symbol, new Set());
                symbolOwners.get(symbol).add(path);
            }
        }

        const reverse = {};
        Object.keys(records).forEach((path) => {
            reverse[path] = new Set();
        });

        for (const record of Object.values(records)) {
            record.resolvedImports = record.imports
                .map((item) => this._resolveImport(record.path, item, records, symbolOwners))
                .filter(Boolean);

            record.resolvedImports.forEach((target) => {
                if (reverse[target]) reverse[target].add(record.path);
            });
        }

        this.lastFingerprint = fingerprint;
        this.index = {
            fileCount: entries.length,
            totalChars: entries.reduce((sum, [, value]) => sum + String(value || '').length, 0),
            records,
            reverse,
            symbolOwners,
            builtAt: Date.now(),
        };

        return this.index;
    }

    /* ============================================================
       TASK CONTEXT SELECTION
       ============================================================ */
    getTaskContext(files = {}, request = '') {
        const index = this.buildIndex(files);
        const query = this._terms(request);
        const querySet = new Set(query);

        const scored = Object.values(index.records).map((record) => {
            const lexical = query.reduce((score, term) => score + (record.terms.includes(term) ? 7 : 0), 0);
            const direct = query.some((term) => record.path.toLowerCase().includes(term)) ? 10 : 0;
            const routeBoost = record.route ? 3 : 0;
            const contractBoost = record.isContract ? 6 : 0;
            const importance = record.importance;

            const symbolMatch = record.exports.some((sym) => querySet.has(String(sym || '').toLowerCase()))
                ? 8
                : 0;

            return {
                path: record.path,
                score: lexical + direct + routeBoost + contractBoost + importance + symbolMatch,
                record,
            };
        }).sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

        const seedCount = Math.max(5, Math.ceil(this.maxFilesPerTask / 2));
        const seeds = scored.filter((item) => item.score > 0).slice(0, seedCount);

        const selected = new Map();

        const add = (path, reason, score = 0) => {
            if (!path || !index.records[path] || selected.has(path) || selected.size >= this.maxFilesPerTask) return;
            selected.set(path, {
                path,
                reason,
                score,
                record: index.records[path],
            });
        };

        // 1) request matches first
        seeds.forEach((item) => add(item.path, 'request match', item.score));

        // 2) always retain project contracts / entrypoints
        Object.values(index.records)
            .filter((r) => r.isContract)
            .slice(0, 8)
            .forEach((r) => add(r.path, 'project contract', r.importance));

        // 3) if request mentions a filename or symbol, capture it
        for (const item of scored.slice(0, 24)) {
            if (selected.size >= this.maxFilesPerTask) break;
            const p = item.path.toLowerCase();
            if (query.some((term) => p.includes(term))) {
                add(item.path, 'path match', item.score + 2);
            }
            if (item.record.exports.some((sym) => querySet.has(String(sym || '').toLowerCase()))) {
                add(item.path, 'symbol match', item.score + 3);
            }
        }

        // 4) pull direct dependencies and callers for every selected file
        [...selected.values()].forEach((item) => {
            const deps = item.record.resolvedImports || [];
            const callers = [...(index.reverse[item.path] || [])];

            deps.slice(0, 6).forEach((path) => add(path, `dependency of ${item.path}`));
            callers.slice(0, 4).forEach((path) => add(path, `used by ${item.path}`));
        });

        // 5) if still empty, default to core files
        if (!selected.size) {
            scored.slice(0, 10).forEach((item) => add(item.path, 'core project file', item.score));
        }

        const filesChosen = [...selected.values()].sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
        const executionPlan = this._plan(request, filesChosen, index);

        return {
            repository: {
                fileCount: index.fileCount,
                totalChars: index.totalChars,
                indexedAt: index.builtAt,
            },
            queryTerms: query.slice(0, 18),
            files: filesChosen,
            executionPlan,
            source: this._compactSources(files, filesChosen, request),
        };
    }

    getRepositorySummary(files = {}) {
        const index = this.buildIndex(files);
        const contracts = Object.values(index.records).filter((r) => r.isContract).map((r) => r.path).slice(0, 20);
        const routes = Object.values(index.records).filter((r) => r.route).map((r) => r.path).slice(0, 30);
        const components = Object.values(index.records).filter((r) => /component|ui|widget|card/i.test(r.path)).map((r) => r.path).slice(0, 30);

        return {
            fileCount: index.fileCount,
            totalChars: index.totalChars,
            contracts,
            routes,
            components,
        };
    }

    /* ============================================================
       PLANNING / PACKING
       ============================================================ */
    _plan(request, files, index) {
        const large = index.fileCount > 45 || index.totalChars > 180000;
        const changed = files.filter((item) => item.reason === 'request match').map((item) => item.path);

        return {
            mode: large ? 'repository-scale' : 'standard',
            steps: [
                'Read project contracts and affected feature surface.',
                `Implement the requested change in the focused set (${files.length} files maximum).`,
                'Preserve imported APIs, routes, types, and component contracts.',
                'Return only complete files that actually changed.',
            ],
            likelyFiles: changed.slice(0, 10),
            summary: `Repository map: ${index.fileCount} files. ${large ? 'Selective context mode is active.' : 'Focused context mode is active.'} Request: ${String(request).slice(0, 180)}`,
        };
    }

    _compactSources(files, chosen, request) {
        let remaining = this.maxContextChars;
        const keywords = this._terms(request);
        const blocks = [];

        for (const item of chosen) {
            if (remaining < 800) break;

            const text = String(files[item.path] || '');
            const content = this._excerpt(text, keywords, Math.min(remaining - 220, 12500));

            blocks.push(`=== ${item.path} | ${item.reason} | ${text.length} chars ===\n${content}`);
            remaining -= content.length + 260;
        }

        return blocks.join('\n\n');
    }

    _excerpt(text, keywords, limit) {
        if (text.length <= limit) return text;

        const lines = text.split('\n');
        const head = lines.slice(0, 55).join('\n');
        const tail = lines.slice(-35).join('\n');
        const chunks = [];
        const lowerKeywords = keywords.map((k) => k.toLowerCase());

        for (let i = 55; i < lines.length - 35 && chunks.join('\n').length < limit * 0.45; i++) {
            const line = lines[i].toLowerCase();
            if (lowerKeywords.some((term) => line.includes(term)) || /export |function |class |interface |type |route|schema|api\//i.test(lines[i])) {
                const start = Math.max(55, i - 3);
                const end = Math.min(lines.length - 35, i + 12);
                chunks.push(`[lines ${start + 1}-${end}]\n${lines.slice(start, end).join('\n')}`);
                i = end;
            }
        }

        const excerpt = `${head}\n\n/* repository excerpt: relevant implementation blocks */\n${chunks.slice(0, 8).join('\n\n')}\n\n/* end of file */\n${tail}`;
        return excerpt.slice(0, limit);
    }

    /* ============================================================
       HELPERS
       ============================================================ */
    _fingerprint(entries) {
        // Lightweight content-aware fingerprint so same-length edits still invalidate cache.
        let acc = `count:${entries.length}|`;
        for (const [name, value] of entries) {
            const text = String(value || '');
            const len = text.length;
            const sampleA = text.slice(0, 120);
            const sampleB = text.slice(-120);
            acc += `${name}:${len}:${this._hash(sampleA + '|' + sampleB)}|`;
        }
        return acc;
    }

    _hash(text) {
        // Fast non-cryptographic hash.
        let h = 2166136261;
        for (let i = 0; i < text.length; i++) {
            h ^= text.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(36);
    }

    _kind(path) {
        return String(path).split('.').pop()?.toLowerCase() || 'file';
    }

    _terms(text) {
        const raw = String(text || '')
            .toLowerCase()
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[^a-z0-9_./-]+/g, ' ')
            .match(/[a-z][a-z0-9_-]{2,}/g) || [];

        return [...new Set(raw)]
            .filter((word) => !this.stopWords.has(word));
    }

    _imports(text) {
        const values = [];
        const src = String(text || '');

        // import ... from 'x'
        const esImport = /import\s+(?:type\s+)?(?:[\w*\s{},]+?\s+from\s+)?['"]([^'"]+)['"]/g;
        // import('x')
        const dynamicImport = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
        // require('x')
        const requireCall = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
        // export ... from 'x'
        const exportFrom = /export\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;

        for (const regex of [esImport, dynamicImport, requireCall, exportFrom]) {
            let match;
            while ((match = regex.exec(src))) {
                values.push(match[1]);
            }
        }

        return [...new Set(values)];
    }

    _exports(text) {
        const values = [];
        const src = String(text || '');

        const patterns = [
            /export\s+default\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z0-9_$]+)/g,
            /export\s+(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z0-9_$]+)/g,
            /export\s*\{\s*([^}]+)\s*\}/g,
        ];

        for (const regex of patterns) {
            let match;
            while ((match = regex.exec(src))) {
                if (regex.source.includes('\\{\\s*([^}]+)\\s*\\}')) {
                    const names = String(match[1] || '')
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((s) => s.split(/\s+as\s+/i).pop().trim());
                    values.push(...names);
                } else {
                    values.push(match[1]);
                }
            }
        }

        return [...new Set(values)].filter(Boolean);
    }

    _route(path) {
        return /^app\/.+\/(page|route)\./.test(path) || /^src\/app\/.+\/(page|route)\./.test(path) ? path : '';
    }

    _isContract(path) {
        return /^(package\.json|tsconfig\.json|next\.config|vite\.config|prisma\/schema\.prisma|app\/layout\.|app\/globals\.|src\/main\.|src\/App\.|index\.html)/i.test(path);
    }

    _importance(path, text) {
        let score = 0;
        const p = String(path);
        const t = String(text || '');

        if (/^(package\.json|tsconfig\.json|app\/layout|src\/main|src\/App|index\.html)/i.test(p)) score += 12;
        if (/\/(api|components|lib|store|hooks|prisma)\//i.test(p)) score += 4;
        if (/route\.(ts|js|tsx|jsx)$|schema\.prisma$/i.test(p)) score += 8;
        if (/export default|createContext|Router|prisma|middleware/i.test(t)) score += 3;
        if (/use client/i.test(t)) score += 2;
        if (/tailwind|postcss|css/i.test(p)) score += 2;
        return score;
    }

    _resolveImport(from, target, records, symbolOwners) {
        if (!target) return null;
        const cleanedTarget = String(target).trim();

        // Alias imports
        if (cleanedTarget.startsWith('@/') || cleanedTarget.startsWith('~/')) {
            const alias = cleanedTarget.replace(/^@\/|^~\//, '');
            const resolved = this._resolvePathLike(alias, records);
            if (resolved) return resolved;
        }

        // Package imports (only resolve if exactly one file defines the symbol)
        if (!cleanedTarget.startsWith('.')) {
            const owners = symbolOwners.get(cleanedTarget);
            return owners?.size === 1 ? [...owners][0] : null;
        }

        // Relative imports
        const base = this._resolveRelativeBase(from, cleanedTarget);
        const resolved = this._resolvePathLike(base, records);
        return resolved;
    }

    _resolveRelativeBase(from, target) {
        const parts = String(from).split('/');
        parts.pop();

        String(target).split('/').forEach((part) => {
            if (part === '..') parts.pop();
            else if (part !== '.' && part !== '') parts.push(part);
        });

        return parts.join('/').replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '');
    }

    _resolvePathLike(base, records) {
        const candidates = [
            base,
            `${base}.ts`,
            `${base}.tsx`,
            `${base}.js`,
            `${base}.jsx`,
            `${base}.mjs`,
            `${base}.cjs`,
            `${base}/index.ts`,
            `${base}/index.tsx`,
            `${base}/index.js`,
            `${base}/index.jsx`,
            `${base}/index.mjs`,
            `${base}/index.cjs`,
        ];

        return candidates.find((path) => records[path]) || null;
    }
}

window.ProjectBrain = ProjectBrain;
;
/* ============================================================
   BUILD WORKFLOW — executable product plan and quality gates
   ============================================================ */

class BuildWorkflow {
    create(specification = {}, userPrompt = '') {
        const framework = specification.framework || 'vanilla';
        const fullstack = framework === 'fullstack-nextjs';
        const product = /webapp|dashboard|admin|portal|saas|crm|marketplace/i.test(`${specification.siteType} ${specification.siteArchetype} ${userPrompt}`);
        const routes = (specification.pages || []).map(page => page.path || page.id).filter(Boolean);
        const stages = [
            { id: 'contract', name: 'Product contract', owner: 'planner', output: ['requirements', 'routes', 'states', 'quality bar'], gate: 'Every requested surface has a named route or section.' },
            { id: 'system', name: 'Design system', owner: 'designer', output: ['tokens', 'type scale', 'spacing', 'interaction rules'], gate: 'One coherent visual language covers every surface.' },
            ...(fullstack ? [{ id: 'foundation', name: 'Application foundation', owner: 'architect', output: ['package', 'database schema', 'API contracts', 'auth boundary'], gate: 'Data models and API endpoints agree.' }] : []),
            { id: 'surfaces', name: product ? 'Product surfaces' : 'Website narrative', owner: fullstack ? 'coder-fullstack' : framework === 'react-vite' ? 'coder-react' : 'coder-ui', output: product ? ['routes', 'navigation', 'core states', 'reusable components'] : ['hero', 'story sections', 'responsive layout', 'signature interaction'], gate: 'Primary user journey is complete, not just visually present.' },
            { id: 'integration', name: 'Integration pass', owner: 'animator + preflight', output: ['interactions', 'responsive behavior', 'media', 'reduced motion'], gate: 'No broken links, missing imports, or dead primary actions.' },
            { id: 'verification', name: 'Quality verification', owner: 'reviewer + bug-finder', output: ['review report', 'static fixes', 'remaining risks'], gate: 'Critical issues are fixed or explicitly surfaced.' }
        ];
        return {
            id: `build-${Date.now().toString(36)}`, mode: product || fullstack ? 'product' : 'experience', framework,
            objective: specification.title || String(userPrompt).slice(0, 120), routes,
            entities: (specification.dbModels || []).map(model => model.name).filter(Boolean), stages,
            constraints: { preserveContracts: true, noPlaceholderStates: true, responsive: true, accessible: true, completeFilesOnly: true },
            definitionOfDone: [
                'The requested primary journey works end-to-end.',
                'Every route has loading, empty, error, and success behavior where relevant.',
                'Shared components and tokens are reused instead of duplicated.',
                'The final build passes preflight and review gates.'
            ],
            createdAt: Date.now()
        };
    }

    checkpoint(workflow, stageId, files) {
        if (!workflow) return null;
        let targetWorkflow = workflow;
        let targetStageId = stageId;
        let targetFiles = files;

        if (typeof workflow === 'string') {
            targetStageId = workflow;
            targetFiles = typeof stageId === 'object' && stageId !== null ? stageId : {};
            targetWorkflow = null;
        }

        const stages = Array.isArray(targetWorkflow?.stages) ? targetWorkflow.stages : [];
        const stage = stages.find(item => item && item.id === targetStageId);
        const checkpoint = {
            stage: targetStageId,
            name: stage?.name || targetStageId,
            fileCount: Object.keys(targetFiles || {}).length,
            timestamp: Date.now(),
            status: 'completed'
        };
        if (targetWorkflow) {
            targetWorkflow.checkpoints = [...(targetWorkflow.checkpoints || []).filter(item => item && item.stage !== targetStageId), checkpoint];
        }
        return checkpoint;
    }
}

window.BuildWorkflow = BuildWorkflow;

;
/* ============================================================
   AUTONOMOUS STUDIO — outcome-first project intelligence
   Converts a vague brief into intent, forecast, task graph, motion
   policy, conversion experiments, and safe integration guidance.
   ============================================================ */

class AutonomousStudio {
    prepare(specification = {}, prompt = '') {
        const text = `${prompt} ${specification.siteType || ''} ${specification.description || ''}`.toLowerCase();
        const intent = this._intent(text, specification);
        const forecast = this._forecast(text, specification);
        const integrations = this._integrations(text, specification);
        const taskGraph = this._taskGraph(specification, forecast, integrations);
        return {
            version: '1.0',
            intent,
            architectureForecast: forecast,
            taskGraph,
            motionPolicy: this._motionPolicy(specification, intent),
            conversionLab: this._conversionLab(specification, intent),
            integrationPlan: integrations,
            browserTestPlan: this._browserTestPlan(specification, intent),
            createdAt: Date.now()
        };
    }

    _intent(text, spec) {
        const match = (patterns) => patterns.some(pattern => pattern.test(text));
        const goal = match([/buy|shop|cart|checkout|product|ecommerce|store/]) ? 'sales'
            : match([/book|appointment|consultation|contact|lead|enquiry|inquiry/]) ? 'qualified leads'
            : match([/portfolio|agency|studio|designer|artist|case study/]) ? 'credibility and portfolio impact'
            : match([/dashboard|admin|portal|crm|manage|workspace/]) ? 'task completion and retention'
            : 'trust and clear next action';
        const audience = spec.brandStrategy?.brand?.audience || (goal === 'sales' ? 'ready-to-buy visitors' : goal === 'qualified leads' ? 'high-intent prospects' : 'first-time visitors');
        const objections = goal === 'sales'
            ? ['Is this right for me?', 'Can I trust the quality?', 'What happens after purchase?']
            : goal === 'qualified leads'
                ? ['Is this credible?', 'Is the offer relevant?', 'Is it worth contacting them?']
                : goal.includes('task')
                    ? ['Where do I start?', 'Will I lose work?', 'Can I finish this quickly?']
                    : ['Why should I care?', 'Why this over alternatives?', 'What should I do next?'];
        return { primaryOutcome: goal, audience, objections, primaryAction: this._primaryAction(goal), proofPriority: this._proofPriority(goal) };
    }

    _forecast(text, spec) {
        const fullstack = spec.framework === 'fullstack-nextjs' || /auth|database|payment|api|dashboard|admin/.test(text);
        const complex = spec.complexity === 'ultra-complex' || fullstack;
        const pages = Math.max(1, (spec.pages || []).length);
        const integrations = (text.match(/stripe|supabase|firebase|resend|whatsapp|cms|analytics|prisma|postgres/g) || []).length;
        const estimatedFiles = Math.max(fullstack ? 28 : spec.framework === 'react-vite' ? 16 : 5, pages * (fullstack ? 7 : 4) + integrations * 4 + (complex ? 18 : 0));
        return {
            scale: estimatedFiles > 80 ? 'large' : estimatedFiles > 30 ? 'product' : 'focused',
            estimatedFiles, 
            phases: complex ? 6 : 5,
            requiresBatching: estimatedFiles > 30,
            recommendedStack: fullstack ? 'Next.js + typed API contracts + database boundary' : spec.framework === 'react-vite' ? 'React + reusable component system' : 'Semantic HTML/CSS/JS + progressive enhancement',
            risks: [
                ...(fullstack ? ['Data, auth, and API contracts must remain aligned.'] : []),
                ...(integrations ? ['External integrations require environment variables and server-side boundaries.'] : []),
                ...(spec.has3D ? ['WebGL must have a performant fallback for mobile and reduced motion.'] : []),
                ...(estimatedFiles > 60 ? ['Use task batches and dependency-aware context; avoid whole-repository rewrites.'] : [])
            ]
        };
    }

    _taskGraph(spec, forecast, integrations) {
        const tasks = [
            ['discovery', 'Lock audience, outcome, objections, proof, and primary action.', []],
            ['architecture', `Create ${forecast.recommendedStack}; define routes, component ownership, and data boundaries.`, ['discovery']],
            ['experience', 'Build the primary journey before secondary pages; include loading, empty, success, and error states.', ['architecture']],
            ['motion', 'Add only interactions that clarify hierarchy, state change, feedback, or spatial navigation.', ['experience']],
            ['verification', 'Run static checks, browser interaction audit, mobile overflow checks, and review/fix loop.', ['motion']]
        ];
        if (integrations.items.length) tasks.splice(3, 0, ['integrations', 'Create server-side adapters, environment contract, and failure states for approved integrations.', ['architecture']]);
        return tasks.map(([id, objective, dependsOn], index) => ({ id, order: index + 1, objective, dependsOn, status: 'pending' }));
    }

    _motionPolicy(spec, intent) {
        const systems = spec.motionSystems || spec.animations || [];
        return {
            allowed: systems.slice(0, 5),
            rule: 'Motion must communicate hierarchy, continuity, feedback, or progress. Decorative motion without a user purpose is rejected.',
            interactions: [
                'Use scroll only to reveal narrative progression; never trap essential content in scroll effects.',
                'Use drag only for direct manipulation such as reorder, compare, scrub, or explore.',
                'Respect prefers-reduced-motion and keep primary actions usable without animation.'
            ],
            primaryMoment: intent.primaryAction === 'complete the core task' ? 'clear task completion feedback' : 'hero-to-proof transition that reduces the main visitor objection'
        };
    }

    _conversionLab(spec, intent) {
        const action = intent.primaryAction;
        return {
            goal: intent.primaryOutcome,
            variants: [
                { id: 'proof-first', hypothesis: 'Lead with credible evidence for visitors who need trust before action.', hero: 'Specific outcome + visible proof + one direct CTA', cta: action, uiStrategy: 'Large typography headline, immediate logos/testimonials underneath, high contrast primary button.' },
                { id: 'problem-first', hypothesis: 'Lead with the customer pain for visitors actively seeking a solution.', hero: 'Recognizable problem + clear transformation + CTA', cta: action, uiStrategy: 'Question/Problem headline in dark tone, interactive slider/comparison, secondary CTA to learn more.' },
                { id: 'product-first', hypothesis: 'Lead with the actual interface/product for visitors who want to evaluate capability quickly.', hero: 'Product demonstration + capability proof + CTA', cta: action, uiStrategy: 'Minimal text, huge auto-playing video/product mockup centered, subtle sticky CTA.' }
            ],
            recommendation: intent.primaryOutcome === 'credibility and portfolio impact' ? 'proof-first' : intent.primaryOutcome === 'task completion and retention' ? 'product-first' : 'problem-first'
        };
    }

    _integrations(text) {
        const catalog = [
            ['stripe', 'payments', 'Server-side checkout/session creation; never expose secret keys.'],
            ['supabase', 'database/auth', 'Use server-side environment variables and row-level security policy review.'],
            ['firebase', 'auth/realtime data', 'Keep privileged admin operations off the client.'],
            ['resend', 'transactional email', 'Use a server route and an .env.example contract.'],
            ['whatsapp', 'lead/contact', 'Use click-to-chat with consent-aware lead capture.'],
            ['cms', 'content management', 'Define content model, preview state, and publishing fallback.'],
            ['analytics', 'measurement', 'Track consent-aware events for primary action and conversion steps.']
        ];
        const items = catalog.filter(([key]) => text.includes(key)).map(([key, purpose, safety]) => ({ key, purpose, safety, status: 'planned' }));
        return { items, envRequired: items.filter(item => !['whatsapp'].includes(item.key)).map(item => `${item.key.toUpperCase()}_API_KEY`), policy: 'Integrations are proposed as contracts first; credentials and irreversible external actions require explicit user configuration.' };
    }

    _browserTestPlan(spec, intent) {
        return {
            devices: ['mobile', 'tablet', 'desktop'],
            flows: [
                `Find and complete the primary action: ${intent.primaryAction}.`,
                'Open primary navigation and verify the destination/action is reachable.',
                'Exercise form validation, error feedback, and successful submission state.',
                'Check keyboard focus order, visible focus state, and reduced-motion fallback.'
            ],
            consoleErrorsAllowed: 0
        };
    }

    _primaryAction(goal) { return goal === 'sales' ? 'start checkout or add to cart' : goal === 'qualified leads' ? 'request a consultation' : goal.includes('task') ? 'complete the core task' : goal.includes('portfolio') ? 'view work or start a conversation' : 'take the next clear action'; }
    _proofPriority(goal) { return goal === 'sales' ? ['product detail', 'delivery/returns', 'real reviews'] : goal === 'qualified leads' ? ['work/examples', 'method', 'clear offer'] : ['specific capability', 'real context', 'clear next step']; }
}

window.AutonomousStudio = AutonomousStudio;

;
/* ============================================================
   ZERO-BUILDER — Autonomous Batcher (100+ Files Scale Engine)
   Breaks down large projects into context-pruned file batches 
   to prevent LLM context saturation and hallucination.
   ============================================================ */

class AutonomousBatcher {
    constructor() {
        this.batches = [];
        this.currentBatchIndex = 0;
    }

    createBatches(forecast, specification, intent) {
        // If forecast says > 30 files, we need batching.
        this.batches = [];
        
        // Batch 1: Core System & Tokens
        this.batches.push({
            id: 'core-system',
            description: 'Generate global styles, design tokens, and core configurations.',
            filesTarget: ['styles.css', 'globals.css', 'tailwind.config.js', 'package.json']
        });

        // Batch 2: Shared UI Components
        this.batches.push({
            id: 'shared-components',
            description: 'Generate reusable layout, buttons, inputs, and navigation elements.',
            filesTarget: ['components/Button.jsx', 'components/Header.jsx', 'components/Footer.jsx', 'components/Input.jsx']
        });

        // Batch 3: Integrations & Data
        if (forecast.integrations && forecast.integrations.length > 0) {
            this.batches.push({
                id: 'data-integrations',
                description: 'Generate server endpoints, database connections, and auth hooks.',
                filesTarget: ['lib/supabase.js', 'lib/stripe.js', 'api/webhook.js']
            });
        }

        // Batch 4: Primary Page Views
        this.batches.push({
            id: 'primary-views',
            description: 'Generate the hero, main landing page, and primary journey.',
            filesTarget: ['index.html', 'app.js', 'pages/index.jsx']
        });

        // Batch 5: Secondary Views
        this.batches.push({
            id: 'secondary-views',
            description: 'Generate secondary pages, success/error states, and dashboard views.',
            filesTarget: ['pages/success.jsx', 'pages/dashboard.jsx', '404.html']
        });

        return this.batches;
    }

    getNextBatch() {
        if (this.currentBatchIndex < this.batches.length) {
            const batch = this.batches[this.currentBatchIndex];
            this.currentBatchIndex++;
            return batch;
        }
        return null;
    }

    hasMoreBatches() {
        return this.currentBatchIndex < this.batches.length;
    }

    reset() {
        this.currentBatchIndex = 0;
    }

    // Prune context by keeping only files that are dependencies for the current batch
    pruneContext(allFiles, currentBatch) {
        const prunedFiles = {};
        
        // Always include core config files as context
        const globalFiles = ['package.json', 'tailwind.config.js', 'styles.css', 'globals.css'];
        
        for (const [filename, content] of Object.entries(allFiles)) {
            // Keep it if it's a global file, or if it's explicitly part of the target
            if (globalFiles.includes(filename) || currentBatch.filesTarget.some(target => filename.includes(target))) {
                prunedFiles[filename] = content;
            } else {
                // For other files, just include the signatures/exports (mocked here as truncated)
                prunedFiles[filename] = `// [TRUNCATED] Content of ${filename} omitted for context size.\n// Exists in project.`;
            }
        }
        
        return prunedFiles;
    }
}

window.AutonomousBatcher = AutonomousBatcher;

;
/* ============================================================
   ZERO-BUILDER — Live Browser Agent
   Runs automated DOM test scripts in the preview sandbox,
   interacts with forms/buttons, checks mobile views, and
   captures runtime console errors for HealerAgent.
   Upgraded: cleanup, safer error sniffer, better viewport
   restore, richer interaction checks, and resilient audit flow.
   ============================================================ */

class LiveBrowserAgent {
    constructor(sandboxInstance, logCallback = console.log) {
        this.sandbox = sandboxInstance;
        this.log = typeof logCallback === 'function' ? logCallback : console.log;

        this.errors = [];
        this.testResults = [];
        this.isTesting = false;

        this._snifferCleanup = null;
        this._originalViewport = null;
        this._rafToken = null;
    }

    /* ============================================================
       Public API
       ============================================================ */

    async runAutonomousAudit(healerAgent, projectFiles) {
        if (!this.sandbox || !this.sandbox.iframe) {
            this.log('error', 'LiveBrowserAgent: No iframe found.');
            return false;
        }

        if (this.isTesting) {
            this.log('warning', 'LiveBrowserAgent: Audit already in progress.');
            return null;
        }

        this.isTesting = true;
        this.errors = [];
        this.testResults = [];

        this.log('info', '[Agent Test] Starting Live Browser Audit...');

        try {
            const doc = this._getDocument();
            const win = this._getWindow();

            if (!doc) throw new Error('Cannot access iframe document');

            // 1. Inject error sniffer
            this._injectErrorSniffer(win);

            // 2. Mobile viewport check
            this.log('info', 'Running mobile overflow check...');
            await this._simulateViewport(375, 812);
            this._checkOverflow(doc, 'mobile');

            // 3. Desktop viewport check
            this.log('info', 'Running desktop check...');
            await this._simulateViewport(1440, 900);
            this._checkOverflow(doc, 'desktop');

            // 4. Basic accessibility / interaction checks
            this.log('info', 'Simulating user interactions...');
            await this._interactWithElements(doc);

            // 5. Wait for async errors and layout settle
            await this._delay(1000);

            // Restore original viewport
            await this._restoreViewport();

            if (this.errors.length > 0) {
                this.log('warning', `[Agent Test] Found ${this.errors.length} runtime errors.`);

                if (healerAgent && typeof healerAgent.execute === 'function') {
                    this.log('info', '[Agent Test] Dispatching to Healer Agent...');
                    const errStr = this.errors.map((e) => e.message).join('\n');
                    const fixedFiles = await healerAgent.execute(projectFiles || {}, '', errStr);
                    this.isTesting = false;
                    return fixedFiles;
                }
            } else {
                this.log('success', '[Agent Test] Passed 100%. No console errors or overflows.');
            }

            return null;
        } catch (e) {
            this.log('error', `LiveBrowserAgent failed: ${e.message}`);
            return null;
        } finally {
            this._cleanupSniffer();
            this.isTesting = false;
        }
    }

    dispose() {
        this._cleanupSniffer();
        this._restoreViewport();
        this.errors = [];
        this.testResults = [];
        this.isTesting = false;
    }

    /* ============================================================
       Window / document helpers
       ============================================================ */

    _getWindow() {
        return this.sandbox?.iframe?.contentWindow || null;
    }

    _getDocument() {
        return this.sandbox?.iframe?.contentDocument || this._getWindow()?.document || null;
    }

    /* ============================================================
       Error sniffer
       ============================================================ */

    _injectErrorSniffer(win) {
        if (!win) return;

        // Clean up any prior hooks before adding fresh ones.
        this._cleanupSniffer();

        const prevOnError = win.onerror;
        const prevConsoleError = win.console?.error;
        const prevUnhandledRejection = win.onunhandledrejection;

        const pushError = (type, message, meta = {}) => {
            this.errors.push({
                type,
                message: String(message || '').trim(),
                timestamp: Date.now(),
                ...meta,
            });
        };

        const onError = (message, source, lineno, colno, error) => {
            const msg = error?.stack || `${message} at ${lineno}:${colno}`;
            pushError('runtime', msg, { source, lineno, colno });
            if (typeof prevOnError === 'function') {
                try { return prevOnError(message, source, lineno, colno, error); } catch { /* ignore */ }
            }
            return false;
        };

        const onConsoleError = (...args) => {
            pushError('console', args.map((a) => this._stringify(a)).join(' '));
            if (typeof prevConsoleError === 'function') {
                try { prevConsoleError.apply(win.console, args); } catch { /* ignore */ }
            }
        };

        const onUnhandledRejection = (event) => {
            const reason = event?.reason;
            pushError('promise', `Unhandled Rejection: ${this._stringify(reason)}`);
            if (typeof prevUnhandledRejection === 'function') {
                try { return prevUnhandledRejection.call(win, event); } catch { /* ignore */ }
            }
            return undefined;
        };

        win.onerror = onError;
        if (win.console) win.console.error = onConsoleError;
        win.onunhandledrejection = onUnhandledRejection;

        // More robust event listener as a backup.
        const rejectionListener = (event) => {
            const reason = event?.reason;
            pushError('promise', `Unhandled Rejection: ${this._stringify(reason)}`);
        };
        win.addEventListener?.('unhandledrejection', rejectionListener);

        this._snifferCleanup = () => {
            try {
                if (win.onerror === onError) win.onerror = prevOnError || null;
                if (win.console && win.console.error === onConsoleError) win.console.error = prevConsoleError || console.error;
                if (win.onunhandledrejection === onUnhandledRejection) win.onunhandledrejection = prevUnhandledRejection || null;
                win.removeEventListener?.('unhandledrejection', rejectionListener);
            } catch {
                // ignore cleanup errors
            }
        };
    }

    _cleanupSniffer() {
        if (typeof this._snifferCleanup === 'function') {
            try {
                this._snifferCleanup();
            } catch {
                // ignore cleanup errors
            }
        }
        this._snifferCleanup = null;
    }

    /* ============================================================
       Viewport simulation
       ============================================================ */

    async _simulateViewport(width, height) {
        const iframe = this.sandbox?.iframe;
        if (!iframe) return;

        if (!this._originalViewport) {
            const parent = iframe.parentElement;
            this._originalViewport = {
                parentWidth: parent?.style?.width || '',
                parentHeight: parent?.style?.height || '',
                iframeWidth: iframe.style.width || '',
                iframeHeight: iframe.style.height || '',
            };
        }

        // Prefer sandbox-provided resizing if available.
        if (typeof this.sandbox.setViewport === 'function') {
            try {
                await this.sandbox.setViewport(width, height);
            } catch {
                // fall back to DOM sizing below
            }
        }

        if (iframe.parentElement) {
            iframe.parentElement.style.width = `${width}px`;
            iframe.parentElement.style.height = `${height}px`;
        }

        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;

        await this._delay(450);
        this._forceReflow();
    }

    async _restoreViewport() {
        const iframe = this.sandbox?.iframe;
        if (!iframe || !this._originalViewport) return;

        if (typeof this.sandbox.setViewport === 'function') {
            try {
                await this.sandbox.setViewport(
                    this._originalViewport.parentWidth || '100%',
                    this._originalViewport.parentHeight || '100%'
                );
            } catch {
                // ignore
            }
        }

        if (iframe.parentElement) {
            iframe.parentElement.style.width = this._originalViewport.parentWidth || '100%';
            iframe.parentElement.style.height = this._originalViewport.parentHeight || '100%';
        }

        iframe.style.width = this._originalViewport.iframeWidth || '100%';
        iframe.style.height = this._originalViewport.iframeHeight || '100%';

        this._originalViewport = null;
        await this._delay(250);
        this._forceReflow();
    }

    /* ============================================================
       Checks
       ============================================================ */

    _checkOverflow(doc, label = 'viewport') {
        if (!doc?.body || !doc?.documentElement) return;

        const bodyWidth = Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth);
        const viewportWidth = doc.documentElement.clientWidth;

        if (bodyWidth > viewportWidth + 10) {
            this.errors.push({
                type: 'layout',
                message: `Horizontal overflow detected on ${label} view (Body: ${bodyWidth}px, Window: ${viewportWidth}px)`,
                timestamp: Date.now(),
            });
        }

        const bodyHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
        const viewportHeight = doc.documentElement.clientHeight;

        if (bodyHeight <= 0 || viewportHeight <= 0) {
            this.errors.push({
                type: 'layout',
                message: `Invalid viewport metrics detected on ${label} view.`,
                timestamp: Date.now(),
            });
        }
    }

    async _interactWithElements(doc) {
        if (!doc) return;

        const clickableSelectors = [
            'button',
            'a[href]',
            'input[type="submit"]',
            '[role="button"]',
            '[data-clickable]',
        ].join(', ');

        const buttons = Array.from(doc.querySelectorAll(clickableSelectors))
            .filter((el) => this._isVisible(el))
            .slice(0, 8);

        for (const el of buttons) {
            try {
                this._focusAndClick(el);
                this.testResults.push({
                    type: 'interaction',
                    target: this._label(el),
                    ok: true,
                });
                await this._delay(180);
            } catch (error) {
                this.errors.push({
                    type: 'interaction',
                    message: `Failed interaction on ${this._label(el)}: ${error.message}`,
                    timestamp: Date.now(),
                });
            }
        }

        const textInputs = Array.from(
            doc.querySelectorAll('input[type="email"], input[type="text"], input:not([type]), textarea')
        )
            .filter((el) => this._isVisible(el))
            .slice(0, 5);

        for (const input of textInputs) {
            try {
                this._fillInput(input, 'test@zero-builder.ai');
                this.testResults.push({
                    type: 'input',
                    target: this._label(input),
                    ok: true,
                });
                await this._delay(80);
            } catch (error) {
                this.errors.push({
                    type: 'interaction',
                    message: `Failed to fill ${this._label(input)}: ${error.message}`,
                    timestamp: Date.now(),
                });
            }
        }

        const submits = Array.from(doc.querySelectorAll('form'))
            .filter((form) => this._isVisible(form))
            .slice(0, 3);

        for (const form of submits) {
            try {
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    this._focusAndClick(submitBtn);
                    await this._delay(150);
                } else {
                    const evt = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(evt);
                    await this._delay(150);
                }
                this.testResults.push({
                    type: 'form',
                    target: this._label(form),
                    ok: true,
                });
            } catch (error) {
                this.errors.push({
                    type: 'interaction',
                    message: `Form interaction failed: ${error.message}`,
                    timestamp: Date.now(),
                });
            }
        }
    }

    /* ============================================================
       DOM interaction utilities
       ============================================================ */

    _focusAndClick(el) {
        if (!el) return;
        try { el.focus?.(); } catch { /* ignore */ }
        try {
            el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            el.click?.();
        } catch (error) {
            // Fallback to synthetic click
            const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
            el.dispatchEvent(evt);
        }
    }

    _fillInput(input, value) {
        if (!input) return;

        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set
            || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
            || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

        if (setter) setter.call(input, value);
        else input.value = value;

        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
    }

    _isVisible(el) {
        if (!el) return false;
        const style = el.ownerDocument?.defaultView?.getComputedStyle(el);
        if (!style) return true;

        const rect = el.getBoundingClientRect?.();
        return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            parseFloat(style.opacity || '1') > 0 &&
            rect &&
            rect.width > 0 &&
            rect.height > 0
        );
    }

    _label(el) {
        if (!el) return 'unknown';
        return (
            el.getAttribute?.('aria-label') ||
            el.getAttribute?.('name') ||
            el.textContent?.trim()?.slice(0, 60) ||
            el.tagName?.toLowerCase() ||
            'unknown'
        );
    }

    _stringify(value) {
        if (typeof value === 'string') return value;
        try {
            if (value instanceof Error) return value.stack || value.message;
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    _forceReflow() {
        const iframe = this.sandbox?.iframe;
        if (!iframe?.contentWindow) return;
        try {
            void iframe.contentWindow.document.body.offsetHeight;
        } catch {
            // ignore
        }
    }

    _delay(ms) {
        return new Promise((resolve) => {
            const timer = setTimeout(() => resolve(), ms);
            this._rafToken = timer;
        });
    }
}

window.LiveBrowserAgent = LiveBrowserAgent;
;
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

                const advEffects = Array.isArray(this.memory.specification.advancedEffects)
                    ? this.memory.specification.advancedEffects
                    : [];

                if (!isReact && !isFullstack) {
                    // Dispatch to specialized 3D agent if requested, else fall back to Coder3D
                    if (advEffects.includes('gpgpu-particles') && this.agents['coder-gpgpu']) {
                        this.emit('log', { type: 'info', message: 'Dispatching to GPGPU Particle Agent...' });
                        this.memory.generatedFiles['three-scene.js'] = await this.agents['coder-gpgpu'].execute(this.memory.specification, this.memory.designSystem);
                    } else if (advEffects.includes('webgpu-tsl') && this.agents['coder-webgpu']) {
                        this.emit('log', { type: 'info', message: 'Dispatching to WebGPU/TSL Agent...' });
                        this.memory.generatedFiles['three-scene.js'] = await this.agents['coder-webgpu'].execute(this.memory.specification, this.memory.designSystem);
                    } else if (advEffects.includes('rapier-physics') && this.agents['coder-physics']) {
                        this.emit('log', { type: 'info', message: 'Dispatching to Rapier Physics Agent...' });
                        this.memory.generatedFiles['three-scene.js'] = await this.agents['coder-physics'].execute(this.memory.specification, this.memory.designSystem);
                    } else {
                        const coder3d = this.agents['coder-3d'];
                        if (coder3d) {
                            this.memory.generatedFiles['three-scene.js'] = await coder3d.execute(this.memory.specification, this.memory.designSystem);
                            this.emit('log', { type: 'success', message: 'Vanilla WebGL/3D scene generated' });
                        }
                    }

                    // Secondary helper: Audio bridge if requested
                    if (advEffects.includes('audio-reactive') && this.agents['coder-audio']) {
                        this.emit('log', { type: 'info', message: 'Generating Audio-Reactive Bridge...' });
                        this.memory.generatedFiles['audio-bridge.js'] = await this.agents['coder-audio'].execute(this.memory.specification, this.memory.designSystem);
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

            // ─── Advanced 3D Technique Verification ───
            if (advancedEffects.includes('gpgpu-particles')) {
                const hasGPGPU = /WebGLRenderTarget|FloatType|ping.?pong|data.?texture|positionTexture|velocityTexture/i.test(allCode);
                if (!hasGPGPU) {
                    add('warning', 'advanced-3d', 'three-scene.js', 'GPGPU particles requested but no WebGLRenderTarget / ping-pong FBO pattern found.', 'Implement GPGPU with two WebGLRenderTargets (FloatType) for position/velocity simulation.');
                }
            }

            if (advancedEffects.includes('raymarched-sdf')) {
                const hasRaymarch = /raymarch|sdSphere|sdBox|sdTorus|smin\s*\(|signed.?distance/i.test(allCode);
                if (!hasRaymarch) {
                    add('warning', 'advanced-3d', 'three-scene.js', 'Raymarching/SDF requested but no SDF functions or march loop found.', 'Implement raymarching with SDF primitives (sdSphere, sdBox) and smooth blending (smin).');
                }
            }

            if (advancedEffects.includes('audio-reactive')) {
                const hasAudio = /AudioContext|AnalyserNode|analyser|getByteFrequencyData|uBass|uMid|uHigh|uAudioBass/i.test(allCode);
                if (!hasAudio) {
                    add('warning', 'advanced-3d', 'three-scene.js', 'Audio-reactive effects requested but no Web Audio API setup found.', 'Implement AudioContext with AnalyserNode and pass frequency bands as shader uniforms.');
                }
            }

            if (advancedEffects.includes('full-postprocessing')) {
                const hasPostFX = /EffectComposer|UnrealBloomPass|RenderPass|ShaderPass|postprocessing/i.test(allCode);
                if (!hasPostFX) {
                    add('warning', 'advanced-3d', 'three-scene.js', 'Full post-processing requested but no EffectComposer pipeline found.', 'Set up EffectComposer with RenderPass + UnrealBloomPass + custom passes.');
                }
            }

            if (advancedEffects.includes('curl-noise-displacement')) {
                const hasCurl = /curl|curlNoise|curl_noise|turbulence|flowField/i.test(allCode);
                if (!hasCurl) {
                    add('suggestion', 'advanced-3d', 'three-scene.js', 'Curl noise displacement requested but no curl noise implementation found.', 'Add 3D curl noise from simplex derivatives for vertex displacement or particle forces.');
                }
            }

            // Particle count guard: >50k without GPGPU pattern
            const particleCountMatch = allCode.match(/(?:count|numParticles|particleCount|PARTICLE_COUNT)\s*=\s*(\d+)/i);
            if (particleCountMatch) {
                const count = parseInt(particleCountMatch[1], 10);
                if (count > 50000 && !/WebGLRenderTarget|FloatType|ping.?pong/i.test(allCode)) {
                    add('warning', 'performance', 'three-scene.js', `${count} particles requested without GPGPU pattern — will likely cause frame drops.`, 'Use GPGPU ping-pong FBO pattern for particle counts above 50,000.');
                }
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
;
/* ============================================================
   MEDIA GENERATOR — AI Image & Video Generation Module
   Supports: OpenAI DALL-E 3, Stability AI, Pexels (stock),
   Pixabay (stock), and AI video generation APIs
   ============================================================ */

class MediaGenerator {
    constructor(llmProvider) {
        this.llm = llmProvider;
        
        /* Generated assets stored as { id: { url, type, prompt } } */
        this.generatedAssets = {};

        /* Stock video/image API keys */
        this.pexelsApiKey = localStorage.getItem('zb_pexels_key') || '';
        this.stabilityApiKey = localStorage.getItem('zb_stability_key') || '';

        /* Providers that support image generation */
        this.imageProviders = {
            'openai': { endpoint: 'https://api.openai.com/v1/images/generations', model: 'dall-e-3' },
            'gemini': { endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', model: 'gemini-2.0-flash-exp' },
            'stability': { endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/sd3', model: 'sd3-large' },
        };
    }

    /* ===== MAIN: Generate all media from spec ===== */
    async generateMedia(mediaNeeds, onProgress) {
        const results = {};

        if (!mediaNeeds) return results;

        const allItems = [
            ...(mediaNeeds.images || []).map(i => ({ ...i, type: 'image' })),
            ...(mediaNeeds.videos || []).map(v => ({ ...v, type: 'video' })),
            ...(mediaNeeds.svgs || []).map(s => ({ ...s, type: 'svg' })),
        ];

        if (allItems.length === 0) return results;

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            onProgress?.(`Generating ${item.type}: ${item.id} (${i + 1}/${allItems.length})`);

            try {
                if (item.type === 'image') {
                    results[item.id] = await this._generateImage(item);
                } else if (item.type === 'video') {
                    results[item.id] = await this._getVideo(item);
                } else if (item.type === 'svg') {
                    results[item.id] = await this._generateSVG(item);
                }
            } catch (e) {
                console.warn(`Media generation failed for ${item.id}:`, e.message);
                // Fallback to placeholder
                results[item.id] = item.type === 'image'
                    ? this._getPlaceholderImage(item)
                    : item.type === 'svg' ? this._getPlaceholderSVG(item) : this._getPlaceholderVideo(item);
            }
        }

        this.generatedAssets = { ...this.generatedAssets, ...results };
        return results;
    }

    /* ===== IMAGE GENERATION ===== */
    async _generateImage(item) {
        const provider = this.llm.currentProvider;
        const apiKey = this.llm.getApiKey();

        // Try AI image generation first
        if (provider === 'openai' && apiKey) {
            return await this._generateWithOpenAI(item, apiKey);
        }

        if (this.stabilityApiKey) {
            return await this._generateWithStability(item);
        }

        // Fallback: try Pexels stock photos
        if (this.pexelsApiKey) {
            return await this._searchPexels(item, 'photos');
        }

        // Final fallback: generate a CSS gradient placeholder
        return this._getPlaceholderImage(item);
    }

    /* ===== OPENAI DALL-E 3 ===== */
    async _generateWithOpenAI(item, apiKey) {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: this._enhancePrompt(item.prompt, item.style),
                n: 1,
                size: item.usage?.includes('hero') ? '1792x1024' : '1024x1024',
                quality: 'hd',
                response_format: 'b64_json',
            }),
        });

        if (!response.ok) throw new Error(`OpenAI Image API error: ${response.status}`);
        const data = await response.json();
        const b64 = data.data[0].b64_json;

        return {
            type: 'image',
            url: `data:image/png;base64,${b64}`,
            format: 'base64',
            prompt: item.prompt,
            provider: 'openai-dalle3',
        };
    }

    /* ===== STABILITY AI ===== */
    async _generateWithStability(item) {
        const formData = new FormData();
        formData.append('prompt', this._enhancePrompt(item.prompt, item.style));
        formData.append('output_format', 'png');
        formData.append('aspect_ratio', item.usage?.includes('hero') ? '16:9' : '1:1');

        const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.stabilityApiKey}`,
                'Accept': 'image/*',
            },
            body: formData,
        });

        if (!response.ok) throw new Error(`Stability API error: ${response.status}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        return {
            type: 'image',
            url: url,
            format: 'blob',
            prompt: item.prompt,
            provider: 'stability-sd3',
        };
    }

    /* ===== SVG/VECTOR GENERATION (via LLM) ===== */
    async _generateSVG(item) {
        const prompt = `Return ONLY valid SVG XML code for this request: ${item.prompt}. 
Make it modern, minimalist, and use a viewBox. Do not include markdown formatting or explanation, just the raw <svg>...</svg> string.`;
        
        try {
            const response = await this.llm.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
            let svgStr = response; // chat returns the string directly
            if (svgStr.includes('<svg')) {
                svgStr = svgStr.substring(svgStr.indexOf('<svg'), svgStr.lastIndexOf('</svg>') + 6);
            } else {
                throw new Error("Invalid SVG generated");
            }
            
            const encodedSvg = encodeURIComponent(svgStr);
            const dataUri = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
            
            return {
                url: dataUri,
                type: 'svg',
                prompt: item.prompt,
                provider: 'llm-direct',
            };
        } catch (e) {
            console.warn('SVG generation failed:', e);
            throw e;
        }
    }

    _getPlaceholderSVG(item) {
        const svgStr = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#333">Logo</text></svg>`;
        return {
            url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`,
            type: 'svg',
            prompt: item.prompt,
            provider: 'placeholder',
        };
    }

    /* ===== PEXELS STOCK (Free) ===== */
    async _searchPexels(item, mediaType = 'photos') {
        const query = this._extractSearchQuery(item.prompt);
        const endpoint = mediaType === 'videos'
            ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`
            : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

        const response = await fetch(endpoint, {
            headers: { 'Authorization': this.pexelsApiKey },
        });

        if (!response.ok) throw new Error(`Pexels API error: ${response.status}`);
        const data = await response.json();

        if (mediaType === 'videos' && data.videos?.length > 0) {
            const video = data.videos[0];
            const file = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
            return {
                type: 'video',
                url: file.link,
                format: 'url',
                prompt: item.prompt,
                provider: 'pexels-stock',
                poster: video.image,
            };
        }

        if (data.photos?.length > 0) {
            return {
                type: 'image',
                url: data.photos[0].src.original,
                format: 'url',
                prompt: item.prompt,
                provider: 'pexels-stock',
            };
        }

        throw new Error('No results found on Pexels');
    }

    /* ===== VIDEO GENERATION / STOCK ===== */
    async _getVideo(item) {
        // Try Pexels stock video first (free, fast)
        if (this.pexelsApiKey) {
            try {
                return await this._searchPexels(item, 'videos');
            } catch (e) { /* continue to fallback */ }
        }

        // Fallback: generate a CSS animated background as a "video"
        return this._getPlaceholderVideo(item);
    }

    /* ===== PLACEHOLDERS ===== */
    _getPlaceholderImage(item) {
        // Generate a beautiful SVG placeholder with gradients
        const colors = this._getPlaceholderColors(item.style);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
                </linearGradient>
                <radialGradient id="g2" cx="30%" cy="40%" r="50%">
                    <stop offset="0%" style="stop-color:${colors[1]};stop-opacity:0.4" />
                    <stop offset="100%" style="stop-color:transparent;stop-opacity:0" />
                </radialGradient>
            </defs>
            <rect width="1920" height="1080" fill="url(#g1)" />
            <rect width="1920" height="1080" fill="url(#g2)" />
            <circle cx="600" cy="400" r="200" fill="${colors[1]}" opacity="0.15" />
            <circle cx="1400" cy="600" r="300" fill="${colors[2]}" opacity="0.1" />
        </svg>`;

        const b64 = btoa(unescape(encodeURIComponent(svg)));

        return {
            type: 'image',
            url: `data:image/svg+xml;base64,${b64}`,
            format: 'svg-base64',
            prompt: item.prompt,
            provider: 'placeholder',
            isPlaceholder: true,
        };
    }

    _getPlaceholderVideo(item) {
        // Return CSS animation instructions instead of actual video
        return {
            type: 'video',
            url: '',
            format: 'css-animation',
            prompt: item.prompt,
            provider: 'css-placeholder',
            isPlaceholder: true,
            cssCode: `
                background: linear-gradient(-45deg, #0a0a0f, #1a1a2e, #0a0a0f, #16213e);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
            `,
        };
    }

    _getPlaceholderColors(style) {
        const palettes = {
            'photorealistic': ['#0a0a1a', '#1a1a3e', '#0f0f2e'],
            'illustration': ['#1a0a2e', '#2d1b4e', '#0a1e3e'],
            'abstract': ['#0f0f1e', '#1e0a3e', '#0a2e1e'],
            '3d-render': ['#0a0a0f', '#1a0a2e', '#0a1a2e'],
            'cinematic': ['#0a0a0f', '#1a1a1a', '#0f0a1a'],
        };
        return palettes[style] || palettes['abstract'];
    }

    /* ===== HELPERS ===== */
    _enhancePrompt(prompt, style) {
        const styleInstructions = {
            'photorealistic': 'Ultra-realistic, 8K, cinematic lighting, professional photography, no text, no watermarks',
            'illustration': 'Modern digital illustration, clean lines, vibrant colors, professional quality',
            'abstract': 'Abstract, artistic, gradient colors, minimal, modern design, no text',
            '3d-render': '3D rendered, octane render, cinema 4D, photorealistic materials, studio lighting',
        };
        return `${prompt}. ${styleInstructions[style] || styleInstructions['abstract']}. Suitable for a premium website.`;
    }

    _extractSearchQuery(prompt) {
        // Extract key nouns for stock search
        const stopWords = ['a', 'an', 'the', 'with', 'for', 'and', 'or', 'in', 'on', 'at', 'to', 'of', 'is', 'premium', 'website', 'hero', 'background', 'matching', 'image', 'photo'];
        return prompt.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(' ')
            .filter(w => w.length > 2 && !stopWords.includes(w))
            .slice(0, 4)
            .join(' ');
    }

    /* ===== INJECT MEDIA INTO FILES ===== */
    injectMediaIntoFiles(files, assets) {
        if (!assets || Object.keys(assets).length === 0) return files;

        const updated = { ...files };

        for (const [id, asset] of Object.entries(assets)) {
            if ((asset.type === 'image' || asset.type === 'svg') && asset.url) {
                // Replace placeholder references in all files
                for (const filename of Object.keys(updated)) {
                    if (typeof updated[filename] !== 'string') continue;

                    // Replace {{media:id}} placeholders
                    updated[filename] = updated[filename].replace(
                        new RegExp(`\\{\\{media:${id}\\}\\}`, 'g'),
                        asset.url
                    );

                    // Replace generic image placeholders
                    updated[filename] = updated[filename].replace(
                        new RegExp(`PLACEHOLDER_IMAGE_${id.toUpperCase()}`, 'g'),
                        asset.url
                    );
                }
            }

            if (asset.type === 'video' && asset.format === 'url' && asset.url) {
                for (const filename of Object.keys(updated)) {
                    if (typeof updated[filename] !== 'string') continue;
                    updated[filename] = updated[filename].replace(
                        new RegExp(`\\{\\{media:${id}\\}\\}`, 'g'),
                        asset.url
                    );
                }
            }
        }

        return updated;
    }

    /* ===== SETTINGS ===== */
    saveSettings() {
        localStorage.setItem('zb_pexels_key', this.pexelsApiKey);
        localStorage.setItem('zb_stability_key', this.stabilityApiKey);
    }
}

window.MediaGenerator = MediaGenerator;

;
/* ============================================================
   PROMPT ENGINEER V3 — Turns short ideas into hyper-detailed
   cinematic studio briefs with search/research planning,
   exact specifications, and reusable prompt packs.
   ============================================================ */

class PromptEngineerAgent extends BaseAgent {
    constructor() {
        super('PromptEngineer', 'Expands short prompts into hyper-detailed cinematic studio briefs');

        this.config = {
            temperature: 0.48,
            maxTokens: 12000,
            maxMotionSystems: 5,
            maxComponents: 8,
            maxSearchQueries: 8,
            maxSections: 7,
            maxChecklistItems: 12,
        };

        this.signatureComponents = {
            FadingVideo: {
                description: 'Crossfading background video component',
                exactSpec: `A reusable <video> component that:
- Starts with opacity: 0
- On loadeddata, fades in over 500ms using requestAnimationFrame
- On timeupdate, when remaining time <= 0.55s, fades out over 550ms
- On ended: if single source, resets currentTime to 0 and replays; if array, advances to next index (cycling)
- Video attributes: autoPlay, muted, playsInline, preload="auto"
- Positioning: absolute inset-0 w-full h-full object-cover z-0`,
            },
            BlurText: {
                description: 'Word-by-word blur reveal animation',
                exactSpec: `Split heading text into individual word spans:
- Each word: display: inline-block, marginRight: 0.28em
- Container: display: flex, flexWrap: wrap, rowGap: 0.1em
- Triggers on IntersectionObserver (threshold 0.1)
- Each word animates: filter blur(10px) → blur(0px), opacity 0 → 1, y 50 → 0
- Duration: 0.7s per word, stagger delay: 100ms per word index
- Easing: power3.out or cubic-bezier(0.16, 1, 0.3, 1)`,
            },
            LiquidGlass: {
                description: 'Apple-style frosted glass with gradient border',
                exactSpec: `.liquid-glass {
    background: rgba(255, 255, 255, 0.01);
    background-blend-mode: luminosity;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: none;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
}
.liquid-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.4px;
    background: linear-gradient(180deg,
        rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
        rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
        rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
}
.liquid-glass-strong: same but backdrop-filter: blur(50px), stronger shadow`,
            },
            MagneticButton: {
                description: 'Cursor-following button with GSAP quickTo',
                exactSpec: `Uses gsap.quickTo for performant magnetic effect:
const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
On mousemove: calculate offset from center, multiply by strength (0.2-0.4)
On mouseleave: return to 0,0 with elastic.out(1, 0.3) easing`,
            },
            ModelViewer3D: {
                description: 'Google model-viewer with cursor tilt and pointer repulsion',
                exactSpec: `Use <model-viewer> web component:
- camera-orbit="0deg 90deg 380%"
- field-of-view="30deg"
- exposure="1.5"
- environment-image="neutral"
- camera-controls disable-zoom
- shadow-intensity="0"
- On mousemove, update cameraOrbit: (mouseX * 40)deg (90 + mouseY * 20)deg 380%
- Smooth with lerp factor 0.05
- Preload textures with modelViewer.createTexture() for instant swaps`,
            },
            ScrollScrubScene: {
                description: 'GSAP ScrollTrigger pin/scrub choreographed section',
                exactSpec: `gsap.to(element, {
    scrollTrigger: {
        trigger: scene,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: 1,
        anticipatePin: 1
    },
    // animation properties
});`,
            },
            BubbleMenu: {
                description: 'Pill-shaped floating nav with liquid glass',
                exactSpec: `Container: liquid-glass rounded-full pill
Padding: 0.4rem
Layout: flex with gap-1
Links: px-3 py-2 text-sm font-medium
Active state: bg-white text-black or accent color
Position: fixed or absolute, backdrop-filter blur(20px)`,
            },
        };

        this.heroTreatments = {
            'fullscreen-video-crossfade': {
                description: 'Multiple videos crossfading over 1000ms',
                implementation: 'Stack 2-4 videos absolutely positioned, opacity-based crossfade',
                assets: 'Need 1-4 cinematic video URLs (10-30s loops, muted, 1080p+)',
            },
            'webgl-scene-parallax': {
                description: 'Three.js scene with mouse parallax and scroll camera',
                implementation: 'canvas element, Three.js scene, cameraOrbit tied to mouse + scroll',
                assets: 'Need 3D models (.glb) or shader code',
            },
            'photo-mask-editorial': {
                description: 'Full-bleed photography with masked typography reveal',
                implementation: 'Large hero image, text with mix-blend-mode or clip-path reveal',
                assets: 'Need 1 hero editorial photograph (high-res, cinematic)',
            },
            'hybrid-video-3d': {
                description: 'Video background + floating 3D elements + parallax layers',
                implementation: 'Video base layer, model-viewer/Three.js overlay, mouse-driven parallax',
                assets: 'Need video + 3D models + overlay images',
            },
            typography_focused: {
                description: 'Oversized typography as the hero, minimal media',
                implementation: 'clamp(5rem, 12vw, 15rem) headline, subtle background, refined animations',
                assets: 'Minimal - maybe 1 accent image or none',
            },
        };

        this.motionCatalog = {
            'masked-title-reveal': 'clip-path or mask-image animated from inset(100% 0 0 0) to inset(0 0 0 0)',
            'word-blur-reveal': 'Split text into words, animate filter blur + opacity + y with stagger',
            'scroll-scrub-camera': 'ScrollTrigger scrub controls Three.js camera position/rotation',
            'sticky-stacking-scenes': 'position: sticky sections with scale/opacity transitions',
            'video-hero-crossfade': 'Multiple videos, opacity crossfade on timeupdate/ended',
            'magnetic-quickto-cta': 'gsap.quickTo for smooth cursor-following buttons',
            'parallax-media-layers': 'Mouse-driven translate with lerp smoothing (0.05 factor)',
            'horizontal-gallery-pin': 'ScrollTrigger pin + horizontal translate for gallery',
            'blend-mode-type': 'mix-blend-mode: difference/exclusion on text over media',
            'grain-vignette-grade': 'SVG noise overlay + radial gradient vignette (fixed, pointer-events none)',
            'section-pin-scrub': 'Pin section, scrub through internal animation timeline',
            'image-mask-wipe': 'clip-path reveal on scroll, often paired with text reveal',
            'liquid-glass-morphism': 'Backdrop-filter blur with gradient border mask',
            'cursor-follower': 'Custom cursor element with delayed follow using gsap.quickTo',
            'text-scramble': 'Character-by-character scramble effect on hover/reveal',
            'infinite-marquee': 'CSS animation or GSAP infinite scroll of logos/text',
        };

        this.archetypeStrategies = {
            'agency-cinematic': {
                sections: ['hero-film', 'capabilities', 'selected-work', 'process', 'clients', 'contact'],
                copyTone: 'Confident, editorial, first-person plural ("We shape...")',
                heroHeadline: 'Bold statement about craft/philosophy',
                heroSubtext: 'Studio positioning + capability summary',
                ctaLabels: ['Start a Project', 'View Work', 'Book a Call'],
            },
            'real-estate-luxury': {
                sections: ['hero-property', 'residence-tour', 'amenities', 'location', 'floor-plans', 'inquire'],
                copyTone: 'Aspirational, sensory, understated luxury',
                heroHeadline: 'Property name or evocative phrase',
                heroSubtext: 'Location + defining characteristic',
                ctaLabels: ['Schedule Private Tour', 'Request Details', 'Download Brochure'],
            },
            'architecture-studio': {
                sections: ['hero-manifesto', 'philosophy', 'projects-index', 'process', 'studio', 'journal'],
                copyTone: 'Thoughtful, material-focused, restrained',
                heroHeadline: 'Philosophical statement or project name',
                heroSubtext: 'Studio ethos in one sentence',
                ctaLabels: ['View Projects', 'Read Journal', 'Contact Studio'],
            },
            'fashion-editorial': {
                sections: ['hero-campaign', 'collection', 'lookbook', 'craftsmanship', 'stockists', 'newsletter'],
                copyTone: 'Poetic, sensory, cultural references',
                heroHeadline: 'Collection name or season',
                heroSubtext: 'Concept statement, 1-2 sentences',
                ctaLabels: ['Shop Collection', 'View Lookbook', 'Find Stockist'],
            },
            'hospitality-film': {
                sections: ['hero-atmosphere', 'experience', 'rooms-dining', 'location', 'reservations', 'stories'],
                copyTone: 'Sensory, place-based, hospitable',
                heroHeadline: 'Property name + evocative descriptor',
                heroSubtext: 'Location + defining experience',
                ctaLabels: ['Reserve', 'Plan Your Stay', 'Explore'],
            },
            'product-cinematic': {
                sections: ['hero-product', 'features-scenes', 'craftsmanship', 'specs', 'stories', 'shop'],
                copyTone: 'Confident, benefit-focused, poetic details',
                heroHeadline: 'Product name + defining claim',
                heroSubtext: 'Core benefit in one sentence',
                ctaLabels: ['Shop Now', 'Learn More', 'Watch Film'],
            },
            'portfolio-editorial': {
                sections: ['hero-intro', 'selected-work', 'about', 'process', 'contact'],
                copyTone: 'Personal, confident, craft-focused',
                heroHeadline: 'Name + discipline or philosophy',
                heroSubtext: 'What you do + who for',
                ctaLabels: ['View Work', 'Get in Touch', 'Download CV'],
            },
            'saas-editorial': {
                sections: ['hero-promise', 'how-it-works', 'features', 'customers', 'pricing', 'cta'],
                copyTone: 'Clear, benefit-driven, editorial polish',
                heroHeadline: 'Product promise in memorable phrase',
                heroSubtext: "Who it's for + core value",
                ctaLabels: ['Start Free Trial', 'See How It Works', 'Book Demo'],
            },
            webapp: {
                sections: ['dashboard', 'analytics', 'settings', 'team', 'billing'],
                copyTone: 'Functional, clear, action-oriented',
                heroHeadline: 'Dashboard/product name',
                heroSubtext: 'Quick status or welcome',
                ctaLabels: ['New Project', 'View Report', 'Invite Team'],
            },
        };

        this.questionBank = {
            vaguePrompt: [
                'What kind of site is this?',
                'What is the primary offer?',
                'What should the hero feel like?',
            ],
            missingBrand: [
                'What is the brand or project name?',
                'Who is this for?',
            ],
        };

        this.motionCatalog = {
            '3d-scroll-rotate': 'Perspective rotateX/translateZ on scroll using data-scroll-3d="rotate"',
            '3d-scroll-zoom': 'Perspective scale/translateZ zoom on scroll using data-scroll-3d="zoom"',
            '3d-window-interactive': 'macOS/Spatial style 3D window mockup with mouse tilt using .window-3d',
            '3d-background-grid': 'Perspective infinite animated grid background using .bg-3d-grid',
            '3d-background-particles': 'Floating 3D particle field using .bg-3d-particles',
            'hover-tilt-perspective': 'Mouse tracking 3D tilt transform using data-hover="tilt"',
            'hover-glow-pulse': 'Radial glow box-shadow animation on hover using data-hover="glow"',
            'smooth-page-loader': 'Full-screen entrance loader with spinner/bar using .page-loader',
            'entrance-clip-circle': 'Expanding circle clip-path reveal using data-reveal="clip-circle"',
            'micro-ripple-click': 'Material/fluid ripple effect on click using data-micro="ripple"',
            'spatial-depth-layers': '3D z-space layering with perspective transform using .spatial-card'
        };

        this.systemPrompt = `
You are a principal prompt engineer for an Awwwards / Motionsites / Layers / getlayers.ai-class digital studio.

Your job: turn a short user idea into a hyper-detailed studio brief AND a reusable prompt pack that a senior creative developer can execute immediately.

DESIGN PHILOSOPHIES YOU CAN SELECT FROM:
- skeuomorphism: Realistic textures, embossed surfaces, physical buttons, dual shadows
- neomorphism: Soft extruded UI, subtle dual-shadows, monochromatic depth
- glassmorphism: Frosted glass backdrop blur, transparency, gradient borders
- claymorphism: Soft rounded 3D clay surfaces, pastel palettes, inflated shapes
- minimalism: Maximum whitespace, essential elements, refined typography, subtle borders
- maximalism: Bold vibrant layers, mixed typography, expressive decorative energy
- brutalism: Raw chunky black borders, monospace type, high contrast, exposed grid
- liquidglass: Apple-style specular frosted glass with luminosity blending and gradient border masks
- spatialui: 3D depth layers, perspective transforms, z-space cards, AR/VR inspired spatial windows

ADVANCED EFFECTS YOU CAN SELECT FROM:
- Hover: hover-lift, hover-glow, hover-tilt, hover-spotlight, hover-underline, hover-perspective
- 3D: 3d-tilt, 3d-float, 3d-flip, 3d-scroll, 3d-background, 3d-window
- Reveals: entrance-fade, entrance-slide, entrance-clip, entrance-blur, entrance-split, entrance-pop, entrance-glitch
- Micro: micro-bounce, micro-ripple, micro-magnetic, micro-counter, micro-cursor
- Parallax: parallax-scroll, parallax-depth, parallax-mouse
- Loaders: smooth-loader

REFERENCE QUALITY
- Exact font names, weights, and Google Fonts URLs
- Specific pixel values, clamp() formulas, timing in ms
- Component-level behavior specs (FadingVideo fade timing, BlurText stagger delays)
- CSS class definitions with real values
- GSAP animation properties with exact durations and easings
- Real asset URL patterns or placeholders
- Choreographed scroll beats with exact triggers

OUTPUT MUST BE VALID JSON ONLY.

Return a JSON object with these fields:
{
  "shortTitle": "brand or project name",
  "siteArchetype": "agency-cinematic | real-estate-luxury | architecture-studio | fashion-editorial | hospitality-film | product-cinematic | portfolio-editorial | saas-editorial | webapp",
  "designPhilosophy": "skeuomorphism | neomorphism | glassmorphism | claymorphism | minimalism | maximalism | brutalism | liquidglass | spatialui",
  "heroTreatment": "fullscreen-video-crossfade | webgl-scene-parallax | photo-mask-editorial | hybrid-video-3d | typography-focused",
  "qualityBar": "awwwords-site-of-the-day | premium-studio-handoff",
  "studioBrief": "15-25 sentence hyper-detailed brief with exact specs",
  "exactPrompt": "A copy-pasteable build prompt for a code generator",
  "researchPlan": {
    "searchQueries": ["..."],
    "researchGoals": ["..."],
    "assetChecklist": ["..."]
  },
  "heroSpec": {
    "headline": "",
    "subtext": "",
    "ctaPrimary": "",
    "ctaSecondary": "",
    "backgroundBehavior": ""
  },
  "visualSystem": {
    "palette": "",
    "exactColors": {
      "background": "#000000",
      "text": "#ffffff",
      "textMuted": "rgba(255,255,255,0.7)",
      "accent": "#fbcfe8",
      "surface": "rgba(255,255,255,0.05)"
    },
    "typography": "",
    "exactFonts": {
      "heading": "Instrument Serif",
      "headingStyle": "italic",
      "body": "Barlow",
      "bodyWeights": [300, 400, 500, 600],
      "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap"
    },
    "materials": ["film grain", "hairline rules", "liquid glass", "backdrop blur"]
  },
  "motionSystems": ["masked-title-reveal", "word-blur-reveal", "magnetic-quickto-cta", "parallax-media-layers", "grain-vignette-grade"],
  "advancedEffects": ["hover-tilt", "smooth-loader", "3d-scroll", "3d-window", "3d-background", "entrance-blur", "micro-ripple"],
  "componentSpecs": [
    {
      "name": "FadingVideo",
      "usage": "Hero background video crossfade",
      "exactBehavior": "Fade in 500ms on loadeddata, crossfade at timeupdate when remaining <= 0.55s...",
      "props": { "sources": ["url1", "url2"], "className": "hero-video" }
    }
  ],
  "scrollChoreography": [
    { "scene": "hero", "trigger": "top top", "behavior": "Video crossfade, blur text reveal on load" }
  ],
  "sectionsPlan": [
    {
      "name": "hero",
      "layout": "Full viewport, video background, centered content",
      "components": ["FadingVideo", "LiquidGlassNav", "BlurText", "MagneticButton", "StatsCards"],
      "copy": {
        "eyebrow": "Booking Q3 2026 engagements",
        "headline": "Crafted Digital Experiences Built to Outlast Trends",
        "subtext": "We are a small studio of designers and engineers..."
      }
    }
  ],
  "mediaPlan": {
    "images": [
      { "id": "hero-still", "prompt": "Detailed image generation prompt", "usage": "hero-background", "style": "photorealistic" }
    ],
    "videos": [
      { "id": "hero-video-1", "prompt": "Detailed video prompt", "usage": "hero-background", "duration": "15s loop", "style": "cinematic" }
    ]
  },
  "techStackBias": "vanilla-gsap-webgl | react-r3f | fullstack-nextjs",
  "cdnLibraries": ["gsap", "gsap/ScrollTrigger", "lenis", "three@0.165.0"],
  "antiPatterns": ["purple/cyan gradients", "generic bento", "fake metrics", "floating orbs", "template icons"],
  "responsiveBreakpoints": { "mobile": "375px", "tablet": "768px", "desktop": "1024px", "wide": "1440px" }
}

Rules:
1. studioBrief must be 15-25 sentences and contain exact technical specifications.
2. Include exact hex colors, font URLs, timing values, easing curves.
3. Select an explicit designPhilosophy matching the brand mood.
4. Select 4-7 advancedEffects matching the brief (3D scroll, 3D windows, 3D backgrounds, hover effects, entrance reveals, micro interactions).
5. Reference signature components (FadingVideo, BlurText, LiquidGlass, MagneticButton, Window3D) with exact behaviors.
6. Never invent fake metrics or generic filler copy.
7. For each motion system, specify the exact GSAP implementation or effect behavior.
8. Include a componentSpecs array with detailed component definitions.
9. Include exactColors with hex codes and exactFonts with Google Fonts URLs.
10. Include scrollChoreography as timeline beats with exact triggers.
11. Return valid JSON only. No markdown. No commentary.
        `.trim();
    }

    async execute(userPrompt, options = {}) {
        const cleanedPrompt = String(userPrompt || '').trim();
        const mode = options.mode || 'production';
        const artDirection = options.artDirection || 'cinematic';

        this.log('info', `Engineering prompt pack [${mode}/${artDirection}]...`);

        const fallback = this._fallbackPack(cleanedPrompt, options);

        const message = `USER IDEA:
"""
${cleanedPrompt}
"""

MODE: ${mode}
PRESET: ${artDirection}

FALLBACK HINTS (for grounding only):
${JSON.stringify({
            shortTitle: fallback.shortTitle,
            siteArchetype: fallback.siteArchetype,
            heroTreatment: fallback.heroTreatment,
            motionSystems: fallback.motionSystems,
            searchQueries: fallback.researchPlan.searchQueries,
        }, null, 2)}

Generate a premium prompt pack now.`;

        let response = '';
        try {
            response = await this.callLLM(message, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Prompt engineering LLM call failed: ${error.message}`);
            return fallback;
        }

        try {
            const parsed = this.parseJSON(response);
            const normalized = this._normalize(parsed, cleanedPrompt, options);
            this.log('success', `Prompt pack ready: ${normalized.shortTitle} / ${normalized.siteArchetype}`);
            return normalized;
        } catch (error) {
            this.log('warning', `Parse failed, using intelligent fallback brief: ${error.message}`);
            return fallback;
        }
    }

    async enhancePromptText(userPrompt, options = {}) {
        const brief = await this.execute(userPrompt, options);
        return {
            enhancedPrompt: brief.exactPrompt || brief.studioBrief,
            brief,
            researchPlan: brief.researchPlan || { searchQueries: [], researchGoals: [], assetChecklist: [] },
            searchQueries: (brief.researchPlan && brief.researchPlan.searchQueries) || [],
        };
    }

    _normalize(raw, userPrompt, options) {
        const brief = raw && typeof raw === 'object' ? raw : {};
        const archetype = brief.siteArchetype || this._guessArchetype(userPrompt);
        const strategy = this.archetypeStrategies[archetype] || this.archetypeStrategies['agency-cinematic'];
        const cinematic = !/webapp|dashboard|admin/i.test(archetype);

        brief.shortTitle = brief.shortTitle || this._guessTitle(userPrompt);
        brief.siteArchetype = archetype;
        brief.heroTreatment = brief.heroTreatment || (cinematic ? 'fullscreen-video-crossfade' : 'photo-mask-editorial');
        brief.qualityBar = brief.qualityBar || 'premium-studio-handoff';
        brief.techStackBias = brief.techStackBias || (/\bnext|api|prisma|auth|dashboard\b/i.test(userPrompt) ? 'fullstack-nextjs' : 'vanilla-gsap-webgl');

        brief.visualSystem = brief.visualSystem || {};
        brief.visualSystem.exactColors = brief.visualSystem.exactColors || {
            background: '#000000',
            text: '#ffffff',
            textMuted: 'rgba(255,255,255,0.7)',
            accent: '#fbcfe8',
            surface: 'rgba(255,255,255,0.05)',
        };
        brief.visualSystem.palette =
            brief.visualSystem.palette ||
            `Pure black field (${brief.visualSystem.exactColors.background}), white typography (${brief.visualSystem.exactColors.text}), ${brief.visualSystem.exactColors.accent} accent, subtle film grain, liquid glass surfaces.`;
        brief.visualSystem.typography =
            brief.visualSystem.typography ||
            `Heading: Instrument Serif italic; Body: Barlow 300/400/500/600; Google Fonts URL: https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap`;
        brief.visualSystem.exactFonts = brief.visualSystem.exactFonts || {
            heading: 'Instrument Serif',
            headingStyle: 'italic',
            body: 'Barlow',
            bodyWeights: [300, 400, 500, 600],
            googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap',
        };
        brief.visualSystem.materials = Array.isArray(brief.visualSystem.materials) && brief.visualSystem.materials.length
            ? brief.visualSystem.materials.slice(0, 6)
            : ['film grain', 'hairline rules', 'liquid glass', 'backdrop blur'];

        let motions = Array.isArray(brief.motionSystems) ? brief.motionSystems : [];
        motions = motions
            .map((m) => String(m || '').toLowerCase().replace(/\s+/g, '-'))
            .filter((m) => this.motionCatalog[m])
            .slice(0, this.config.maxMotionSystems);

        if (motions.length < 3) {
            motions = cinematic
                ? ['word-blur-reveal', 'video-hero-crossfade', 'magnetic-quickto-cta', 'parallax-media-layers', 'grain-vignette-grade']
                : ['masked-title-reveal', 'parallax-media-layers', 'magnetic-quickto-cta', 'grain-vignette-grade'];
        }
        brief.motionSystems = motions;

        const defaultComponents = this._defaultComponentSpecs(brief.heroTreatment, motions);
        if (!Array.isArray(brief.componentSpecs) || brief.componentSpecs.length === 0) {
            brief.componentSpecs = defaultComponents;
        } else {
            brief.componentSpecs = brief.componentSpecs.slice(0, this.config.maxComponents);
        }

        const firstHeadline = strategy.heroHeadline;
        const firstSubtext = strategy.heroSubtext;

        brief.heroSpec = brief.heroSpec || {
            headline: strategy.heroHeadline === 'Bold statement about craft/philosophy'
                ? this._generateHeadline(brief.shortTitle, archetype)
                : firstHeadline,
            subtext: firstSubtext,
            ctaPrimary: strategy.ctaLabels[0],
            ctaSecondary: strategy.ctaLabels[1],
            backgroundBehavior: this._describeHeroBackground(brief.heroTreatment),
        };

        if (!brief.heroSpec.headline || /Bold statement about craft\/philosophy/i.test(brief.heroSpec.headline)) {
            brief.heroSpec.headline = this._generateHeadline(brief.shortTitle, archetype);
        }
        if (!brief.heroSpec.subtext) {
            brief.heroSpec.subtext = this._generateSubtext(brief.shortTitle, archetype);
        }

        brief.researchPlan = brief.researchPlan || {};
        brief.researchPlan.searchQueries = Array.isArray(brief.researchPlan.searchQueries) && brief.researchPlan.searchQueries.length
            ? brief.researchPlan.searchQueries.slice(0, this.config.maxSearchQueries)
            : this._buildSearchQueries(userPrompt, brief);
        brief.researchPlan.researchGoals = Array.isArray(brief.researchPlan.researchGoals) && brief.researchPlan.researchGoals.length
            ? brief.researchPlan.researchGoals
            : this._buildResearchGoals(brief, userPrompt);
        brief.researchPlan.assetChecklist = Array.isArray(brief.researchPlan.assetChecklist) && brief.researchPlan.assetChecklist.length
            ? brief.researchPlan.assetChecklist
            : this._buildAssetChecklist(brief);

        brief.scrollChoreography = Array.isArray(brief.scrollChoreography) && brief.scrollChoreography.length
            ? brief.scrollChoreography.slice(0, 8)
            : this._defaultChoreography(strategy.sections);

        brief.sectionsPlan = Array.isArray(brief.sectionsPlan) && brief.sectionsPlan.length
            ? brief.sectionsPlan.slice(0, this.config.maxSections)
            : strategy.sections.slice(0, this.config.maxSections).map((name) => ({
                name,
                layout: this._describeLayout(name),
                components: this._componentsForSection(name, motions),
                copy: this._copyForSection(name, brief.shortTitle, archetype),
            }));

        brief.cdnLibraries = Array.isArray(brief.cdnLibraries) && brief.cdnLibraries.length
            ? brief.cdnLibraries
            : this._defaultCDNs(brief.heroTreatment, brief.techStackBias);

        brief.antiPatterns = Array.isArray(brief.antiPatterns) && brief.antiPatterns.length
            ? brief.antiPatterns
            : [
                'purple/cyan SaaS gradients',
                'generic bento feature-card grids',
                'fake vanity metrics',
                'floating gradient orbs',
                'template icon grids',
                'Lorem Ipsum placeholder text',
            ];

        brief.responsiveBreakpoints = brief.responsiveBreakpoints || {
            mobile: '375px',
            tablet: '768px',
            desktop: '1024px',
            wide: '1440px',
        };

        brief.mediaPlan = brief.mediaPlan || { images: [], videos: [] };
        if (!Array.isArray(brief.mediaPlan.images)) brief.mediaPlan.images = [];
        if (!Array.isArray(brief.mediaPlan.videos)) brief.mediaPlan.videos = [];

        if (brief.mediaPlan.images.length === 0) {
            brief.mediaPlan.images.push({
                id: 'hero-still',
                prompt: `Editorial hero photograph for ${brief.shortTitle}: cinematic composition, premium art direction, category-specific, no generic stock look.`,
                usage: 'hero-background',
                style: 'photorealistic',
            });
        }

        if (brief.mediaPlan.videos.length === 0 && /video|film|cinematic/.test(brief.heroTreatment)) {
            brief.mediaPlan.videos.push({
                id: 'hero-video-1',
                prompt: `Cinematic loop for ${brief.shortTitle}: slow camera motion, atmospheric, premium color grade, seamless 15-30 second loop, 1080p+.`,
                usage: 'hero-background',
                duration: '15-30s loop',
                style: 'cinematic',
            });
        }

        brief.studioBrief = brief.studioBrief && String(brief.studioBrief).trim().length > 500
            ? brief.studioBrief
            : this._composeStudioBrief(userPrompt, brief, options);

        brief.exactPrompt = brief.exactPrompt && String(brief.exactPrompt).trim().length > 500
            ? brief.exactPrompt
            : this._composeExactPrompt(brief);

        return brief;
    }

    _composeExactPrompt(brief) {
        const colors = brief.visualSystem.exactColors;
        const fonts = brief.visualSystem.exactFonts;

        return [
            `Create a single-page ${brief.siteArchetype} website for "${brief.shortTitle}".`,
            `Art direction: ${brief.heroTreatment} with a premium ${brief.qualityBar} finish.`,
            `Color system: background ${colors.background}, text ${colors.text}, muted ${colors.textMuted}, accent ${colors.accent}, surface ${colors.surface}.`,
            `Typography: ${fonts.heading} (${fonts.headingStyle}) for headings and ${fonts.body} (300, 400, 500, 600) for body text. Use the Google Fonts URL ${fonts.googleFontsUrl}.`,
            `Motion systems to implement: ${brief.motionSystems.join(', ')}.`,
            `Required components: ${(brief.componentSpecs || []).map((c) => c.name).join(', ')}.`,
            `Hero copy: headline "${brief.heroSpec.headline}", subtext "${brief.heroSpec.subtext}", CTAs "${brief.heroSpec.ctaPrimary}" and "${brief.heroSpec.ctaSecondary}".`,
            `Add exact scroll choreography, responsive breakpoints, prefers-reduced-motion fallback, and a clear asset plan.`,
            `Avoid: ${(brief.antiPatterns || []).join(', ')}.`,
            `Build it like a hand-crafted Awwwards site, not a template.`,
        ].join(' ');
    }

    _composeStudioBrief(userPrompt, brief) {
        const colors = brief.visualSystem.exactColors;
        const fonts = brief.visualSystem.exactFonts;
        const motions = brief.motionSystems;

        return [
            `Build an Awwwards-level ${brief.siteArchetype} experience for "${brief.shortTitle}" — a cinematic, art-directed digital piece with a ${brief.qualityBar} finish.`,
            `The hero should feel like a scene, not a section: ${brief.heroTreatment} with exact timing, exact asset requirements, and deliberate composition.`,
            `Use ${fonts.heading} in italic for all major headlines and ${fonts.body} for body copy, with a Google Fonts URL of ${fonts.googleFontsUrl}.`,
            `The palette must stay disciplined: ${colors.background} background, ${colors.text} text, ${colors.textMuted} muted text, ${colors.accent} accent, and ${colors.surface} glass surfaces.`,
            `If the page uses motion, implement these systems: ${motions.join(', ')}.`,
            `Every motion must have a real behavior: GSAP durations, easing curves, stagger timings, and trigger points must be specified in code-ready detail.`,
            `The main hero headline should read "${brief.heroSpec.headline}", and the subtext should read "${brief.heroSpec.subtext}".`,
            `Primary and secondary CTAs should be "${brief.heroSpec.ctaPrimary}" and "${brief.heroSpec.ctaSecondary}".`,
            `Reference these components where relevant: ${(brief.componentSpecs || []).map((c) => c.name).join(', ')}.`,
            `For background treatment, use ${brief.heroSpec.backgroundBehavior}.`,
            `Section choreography should progress from hero to support proof, then features/case studies, then conversion, with exact scroll triggers.`,
            `The build should include a research plan with search queries, goals, and asset checklist so the search engine can feed the design system.`,
            `Responsive behavior must be explicit for 375px, 768px, 1024px, and 1440px+ breakpoints, and all non-essential motion must respect prefers-reduced-motion.`,
            `Avoid generic gradients, generic bento layouts, fake metrics, floating orbs, template icon grids, and placeholder copy.`,
            `The result should feel hand-authored by a senior design director and a senior creative developer working together.`,
        ].join(' ');
    }

    _defaultComponentSpecs(heroTreatment, motions) {
        const specs = [];

        if (heroTreatment.includes('video')) {
            specs.push({
                name: 'FadingVideo',
                usage: 'Hero background video with crossfade',
                exactBehavior: this.signatureComponents.FadingVideo.exactSpec,
                props: {
                    sources: ['[VIDEO_URL_1]', '[VIDEO_URL_2]'],
                    className: 'hero-video absolute inset-0 w-full h-full object-cover z-0',
                },
            });
        }

        if (motions.includes('word-blur-reveal')) {
            specs.push({
                name: 'BlurText',
                usage: 'Hero headline word-by-word reveal',
                exactBehavior: this.signatureComponents.BlurText.exactSpec,
                props: {
                    text: '[HERO_HEADLINE]',
                    className: 'hero-title font-heading italic text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.8] tracking-[-4px]',
                },
            });
        }

        specs.push({
            name: 'LiquidGlass',
            usage: 'Nav bar, badges, cards, pills',
            exactBehavior: this.signatureComponents.LiquidGlass.exactSpec,
            props: { variant: '.liquid-glass or .liquid-glass-strong' },
        });

        if (motions.includes('magnetic-quickto-cta')) {
            specs.push({
                name: 'MagneticButton',
                usage: 'Primary CTAs with cursor-following effect',
                exactBehavior: this.signatureComponents.MagneticButton.exactSpec,
                props: { strength: 0.3, ease: 'power3' },
            });
        }

        if (heroTreatment.includes('webgl') || heroTreatment.includes('3d')) {
            specs.push({
                name: 'ModelViewer3D',
                usage: 'Hero 3D product/scene with cursor tilt',
                exactBehavior: this.signatureComponents.ModelViewer3D.exactSpec,
                props: { src: '[MODEL_URL]', cameraOrbit: '0deg 90deg 380%' },
            });
        }

        return specs.slice(0, this.config.maxComponents);
    }

    _buildSearchQueries(userPrompt, brief) {
        const title = String(brief.shortTitle || '').toLowerCase();
        const archetype = String(brief.siteArchetype || '').toLowerCase();
        const idea = String(userPrompt || '').toLowerCase();

        const queries = [
            `${brief.shortTitle || 'brand'} visual reference`,
            `${archetype} website inspiration`,
            `${title} brand moodboard`,
            `${archetype} typography inspiration`,
        ];

        if (/video|film|cinematic/.test(brief.heroTreatment)) {
            queries.push(`${archetype} cinematic hero video`);
            queries.push(`premium looping background video ${title}`);
        }

        if (/webgl|3d/.test(brief.heroTreatment) || /3d|shader|model/.test(idea)) {
            queries.push(`${archetype} webgl hero reference`);
            queries.push(`react three fiber premium website reference`);
        }

        if (/luxury|real-estate|hospitality|fashion/.test(archetype)) {
            queries.push(`${archetype} editorial composition`);
        }

        return [...new Set(queries)].slice(0, this.config.maxSearchQueries);
    }

    _buildResearchGoals(brief) {
        return [
            `Find 3-5 visual references matching ${brief.shortTitle || 'the project'} and its ${brief.siteArchetype} archetype.`,
            `Confirm the right hero treatment for ${brief.heroTreatment}.`,
            `Source category-specific copy cues, not generic marketing language.`,
            `Identify media assets needed for the hero and supporting sections.`,
        ];
    }

    _buildAssetChecklist(brief) {
        const items = [
            'Hero image or hero video',
            'Typography references',
            'Logo or wordmark',
            'Section proof media',
        ];

        if (/video/.test(brief.heroTreatment)) items.push('Looping hero video sources');
        if (/3d|webgl/.test(brief.heroTreatment)) items.push('3D model or shader references');
        if (/photo/.test(brief.heroTreatment)) items.push('Editorial photography references');

        return items.slice(0, 8);
    }

    _defaultChoreography(sections) {
        return sections.slice(0, 5).map((name, i) => ({
            scene: name,
            trigger: i === 0 ? 'top top' : 'top 80%',
            behavior: i === 0
                ? 'Hero enters: video fades in 500ms, blur text reveal word-by-word (100ms stagger), CTA magnetic activation'
                : `${name} scene: staggered fade-up reveal (0.15s stagger) with scroll-triggered motion`,
        }));
    }

    _defaultCDNs(heroTreatment, techBias) {
        const cdns = [
            'https://unpkg.com/gsap@3/dist/gsap.min.js',
            'https://unpkg.com/gsap@3/dist/ScrollTrigger.min.js',
            'https://unpkg.com/lenis@1/dist/lenis.min.js',
        ];
        if (heroTreatment.includes('webgl') || heroTreatment.includes('3d') || techBias.includes('webgl')) {
            cdns.push('https://unpkg.com/three@0.165.0/build/three.min.js');
            cdns.push('https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js');
        }
        return cdns;
    }

    _describeHeroBackground(treatment) {
        const descriptions = {
            'fullscreen-video-crossfade': 'Full-viewport video(s) with crossfade transitions. Multiple video sources stacked absolutely, opacity-based crossfade over 1000ms when timeupdate detects remaining time <= 0.55s.',
            'webgl-scene-parallax': 'Three.js canvas covering the full viewport. Scene includes 3D models with mouse-driven camera tilt; cameraOrbit is updated on mousemove and smoothed with a lerp factor of 0.05.',
            'photo-mask-editorial': 'Full-bleed editorial photograph as the hero background. Typography is overlaid with mix-blend-mode: difference or a clip-path masked reveal.',
            'hybrid-video-3d': 'Base video layer plus floating 3D elements and parallax overlay images. Mouse-driven parallax uses different depth multipliers per layer.',
            'typography-focused': 'Minimal background. Oversized typography acts as the hero using clamp-based fluid scaling, with very subtle motion and refined spacing.',
        };
        return descriptions[treatment] || descriptions['fullscreen-video-crossfade'];
    }

    _describeLayout(sectionName) {
        const layouts = {
            hero: 'Full viewport (100vh), overflow-hidden, media background z-0, content overlay z-10 with flex column',
            'hero-film': 'Full viewport cinematic scene with video background and layered typography',
            'hero-property': 'Full viewport with property photography and minimal type overlay',
            'hero-manifesto': 'Full viewport with philosophical statement and subtle background treatment',
            capabilities: 'Min-height 100vh, grid layout (1 col mobile / 3 col desktop), liquid glass cards with icons and tags',
            'selected-work': 'Horizontal scroll gallery pinned with ScrollTrigger, or vertical case study cards',
            philosophy: 'Two-column editorial layout, large type left, supporting text right',
            gallery: 'Full-bleed image grid or horizontal pinned scroll',
            cta: 'Centered content, magnetic button, form or contact info',
            footer: 'Multi-column footer with links, social, brand info',
        };
        return layouts[sectionName] || 'Standard section with generous spacing and clear hierarchy';
    }

    _componentsForSection(sectionName, motions) {
        const componentMap = {
            hero: ['FadingVideo', 'LiquidGlassNav', 'BlurText', 'MagneticButton', 'StatsCards'],
            'hero-film': ['FadingVideo', 'LiquidGlassNav', 'BlurText', 'MagneticButton'],
            'hero-property': ['PropertyImage', 'LiquidGlassNav', 'BlurText', 'MagneticButton'],
            'hero-manifesto': ['HeroType', 'BlurText', 'LiquidGlass'],
            capabilities: ['LiquidGlass', 'CapabilityCard', 'TagPill', 'IconContainer'],
            'selected-work': ['ProjectCard', 'ImageMask', 'ScrollScrubScene'],
            gallery: ['ImageGrid', 'ScrollScrubScene', 'MaskReveal'],
            cta: ['MagneticButton', 'LiquidGlass', 'ContactForm'],
            footer: ['FooterGrid', 'SocialLinks', 'LiquidGlass'],
        };
        const components = componentMap[sectionName] || ['LiquidGlass', 'MagneticButton'];
        return components.slice(0, 5 + (motions.includes('scroll-scrub-camera') ? 1 : 0));
    }

    _copyForSection(sectionName, brandName, archetype) {
        const copyMap = {
            'agency-cinematic': {
                hero: {
                    eyebrow: 'Booking Q3 2026 engagements — limited capacity',
                    headline: 'Crafted Digital Experiences Built to Outlast Trends',
                    subtext: `${brandName} is a small studio of designers and engineers shaping brand-defining websites for ambitious companies.`,
                },
                capabilities: {
                    eyebrow: '// Capabilities',
                    headline: 'Studio craft,\nend to end',
                    subtext: 'From brand identity to production engineering, we ship complete digital experiences.',
                },
            },
            'real-estate-luxury': {
                hero: {
                    eyebrow: 'Now Available',
                    headline: `${brandName}\nA Private Residence`,
                    subtext: 'A collection of thoughtfully composed homes in a landscape shaped by light, water, and stone.',
                },
            },
        };
        return copyMap[archetype]?.[sectionName] || {
            eyebrow: '',
            headline: `${brandName}`,
            subtext: 'Category-specific copy to be refined during the design phase.',
        };
    }

    _generateHeadline(brandName, archetype) {
        const headlines = {
            'agency-cinematic': 'Crafted Digital Experiences Built to Outlast Trends',
            'real-estate-luxury': `${brandName}\nWhere Architecture Meets Landscape`,
            'architecture-studio': 'Buildings That Listen to Their Place',
            'fashion-editorial': 'Season Two — In Motion',
            'hospitality-film': `Stay at ${brandName}`,
            'product-cinematic': `${brandName}\nEngineered for Everyday`,
            'portfolio-editorial': `${brandName}\nSelected Works`,
            'saas-editorial': `${brandName}\nBuilt for Teams That Care About Craft`,
            webapp: `${brandName}\nWorkspace`,
        };
        return headlines[archetype] || `${brandName}\nCrafted with Intention`;
    }

    _generateSubtext(brandName, archetype) {
        const subtexts = {
            'agency-cinematic': `${brandName} is a small studio of designers and engineers shaping brand-defining websites for ambitious companies.`,
            'real-estate-luxury': 'A limited collection of private residences in a landscape shaped by light, water, and stone.',
            'architecture-studio': 'We design buildings and spaces that respond to context, climate, and the people who inhabit them.',
            'fashion-editorial': 'A study in movement, material, and the quiet confidence of considered design.',
            'hospitality-film': 'A retreat where hospitality is measured in details, not amenities.',
            'product-cinematic': 'Considered materials, refined engineering, and design that lasts beyond seasons.',
            'portfolio-editorial': 'A selection of work across brand, digital, and editorial disciplines.',
            'saas-editorial': 'Software for teams who believe the details compound.',
            webapp: 'Fast, focused, and built for daily use.',
        };
        return subtexts[archetype] || `${brandName} is committed to craft, clarity, and considered design.`;
    }

    _fallbackPack(userPrompt, options = {}) {
        const archetype = this._guessArchetype(userPrompt);
        const wants3d = /\b(3d|webgl|three|particle|shader|model)\b/i.test(userPrompt);
        const wantsVideo = /\b(video|cinematic|film|reel|motion)\b/i.test(userPrompt) || /real.?estate|architect|agency|luxury|hotel|fashion/i.test(userPrompt);
        const title = this._guessTitle(userPrompt);

        const siteArchetype = archetype;
        const heroTreatment = wants3d
            ? 'hybrid-video-3d'
            : (wantsVideo ? 'fullscreen-video-crossfade' : 'typography-focused');

        const motionSystems = wants3d
            ? ['word-blur-reveal', 'scroll-scrub-camera', 'magnetic-quickto-cta', 'parallax-media-layers', 'grain-vignette-grade']
            : ['word-blur-reveal', 'video-hero-crossfade', 'magnetic-quickto-cta', 'parallax-media-layers', 'grain-vignette-grade'];

        const brief = {
            shortTitle: title,
            siteArchetype,
            heroTreatment,
            qualityBar: options.mode === 'power' || options.mode === 'motion-studio' ? 'awwwards-site-of-the-day' : 'premium-studio-handoff',
            studioBrief: this._composeStudioBrief(userPrompt, {
                shortTitle: title,
                siteArchetype,
                heroTreatment,
                qualityBar: 'premium-studio-handoff',
                visualSystem: {
                    exactColors: {
                        background: '#000000',
                        text: '#ffffff',
                        textMuted: 'rgba(255,255,255,0.7)',
                        accent: '#fbcfe8',
                        surface: 'rgba(255,255,255,0.05)',
                    },
                    exactFonts: {
                        heading: 'Instrument Serif',
                        headingStyle: 'italic',
                        body: 'Barlow',
                        bodyWeights: [300, 400, 500, 600],
                        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap',
                    },
                    palette: 'Pure black background, white typography, pink accent, refined liquid glass surfaces.',
                    typography: 'Instrument Serif italic + Barlow',
                    materials: ['film grain', 'hairline rules', 'liquid glass', 'backdrop blur'],
                },
                motionSystems,
                componentSpecs: this._defaultComponentSpecs(heroTreatment, motionSystems),
                heroSpec: {
                    headline: this._generateHeadline(title, siteArchetype),
                    subtext: this._generateSubtext(title, siteArchetype),
                    ctaPrimary: this.archetypeStrategies[siteArchetype]?.ctaLabels?.[0] || 'Start a Project',
                    ctaSecondary: this.archetypeStrategies[siteArchetype]?.ctaLabels?.[1] || 'Learn More',
                    backgroundBehavior: this._describeHeroBackground(heroTreatment),
                },
                scrollChoreography: this._defaultChoreography(this.archetypeStrategies[siteArchetype]?.sections || ['hero', 'features', 'cta']),
                sectionsPlan: (this.archetypeStrategies[siteArchetype]?.sections || ['hero', 'features', 'cta']).map((name) => ({
                    name,
                    layout: this._describeLayout(name),
                    components: this._componentsForSection(name, motionSystems),
                    copy: this._copyForSection(name, title, siteArchetype),
                })),
                researchPlan: {
                    searchQueries: this._buildSearchQueries(userPrompt, { shortTitle: title, siteArchetype, heroTreatment }),
                    researchGoals: this._buildResearchGoals({ shortTitle: title, siteArchetype, heroTreatment }),
                    assetChecklist: this._buildAssetChecklist({ shortTitle: title, siteArchetype, heroTreatment }),
                },
            }),
            exactPrompt: '',
            researchPlan: {
                searchQueries: this._buildSearchQueries(userPrompt, { shortTitle: title, siteArchetype, heroTreatment }),
                researchGoals: this._buildResearchGoals({ shortTitle: title, siteArchetype, heroTreatment }),
                assetChecklist: this._buildAssetChecklist({ shortTitle: title, siteArchetype, heroTreatment }),
            },
            heroSpec: {
                headline: this._generateHeadline(title, siteArchetype),
                subtext: this._generateSubtext(title, siteArchetype),
                ctaPrimary: this.archetypeStrategies[siteArchetype]?.ctaLabels?.[0] || 'Start a Project',
                ctaSecondary: this.archetypeStrategies[siteArchetype]?.ctaLabels?.[1] || 'Learn More',
                backgroundBehavior: this._describeHeroBackground(heroTreatment),
            },
            visualSystem: {
                palette: 'Pure black background, white type, pink accent, liquid glass surfaces.',
                exactColors: {
                    background: '#000000',
                    text: '#ffffff',
                    textMuted: 'rgba(255,255,255,0.7)',
                    accent: '#fbcfe8',
                    surface: 'rgba(255,255,255,0.05)',
                },
                typography: 'Instrument Serif italic + Barlow',
                exactFonts: {
                    heading: 'Instrument Serif',
                    headingStyle: 'italic',
                    body: 'Barlow',
                    bodyWeights: [300, 400, 500, 600],
                    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap',
                },
                materials: ['film grain', 'hairline rules', 'liquid glass', 'backdrop blur'],
            },
            motionSystems,
            componentSpecs: this._defaultComponentSpecs(heroTreatment, motionSystems),
            scrollChoreography: this._defaultChoreography(this.archetypeStrategies[siteArchetype]?.sections || ['hero', 'features', 'cta']),
            sectionsPlan: (this.archetypeStrategies[siteArchetype]?.sections || ['hero', 'features', 'cta']).map((name) => ({
                name,
                layout: this._describeLayout(name),
                components: this._componentsForSection(name, motionSystems),
                copy: this._copyForSection(name, title, siteArchetype),
            })),
            mediaPlan: {
                images: [
                    {
                        id: 'hero-still',
                        prompt: `Editorial hero photograph for ${title}: cinematic composition, premium art direction, category-specific, no generic stock look.`,
                        usage: 'hero-background',
                        style: 'photorealistic',
                    },
                ],
                videos: wantsVideo
                    ? [
                        {
                            id: 'hero-video-1',
                            prompt: `Cinematic loop for ${title}: slow camera motion, atmospheric, premium color grade, seamless 15-30 second loop, 1080p+.`,
                            usage: 'hero-background',
                            duration: '15-30s loop',
                            style: 'cinematic',
                        },
                    ]
                    : [],
            },
            techStackBias: /\bnext|api|prisma|auth|dashboard\b/i.test(userPrompt)
                ? 'fullstack-nextjs'
                : (/\breact\b/i.test(userPrompt) ? 'react-r3f' : 'vanilla-gsap-webgl'),
            cdnLibraries: wants3d
                ? ['gsap', 'gsap/ScrollTrigger', 'lenis', 'three@0.165.0', '@google/model-viewer']
                : ['gsap', 'gsap/ScrollTrigger', 'lenis'],
            antiPatterns: [
                'purple/cyan gradients',
                'generic bento',
                'fake metrics',
                'floating orbs',
                'template icons',
            ],
            qualityBar: 'premium-studio-handoff',
            responsiveBreakpoints: {
                mobile: '375px',
                tablet: '768px',
                desktop: '1024px',
                wide: '1440px',
            },
        };

        brief.exactPrompt = this._composeExactPrompt(brief);
        return brief;
    }

    _buildSearchGoals(brief, userPrompt) {
        return [
            `Find 3-5 visual references matching ${brief.shortTitle || 'the project'} and its ${brief.siteArchetype} archetype.`,
            `Confirm the right hero treatment for ${brief.heroTreatment}.`,
            `Source category-specific copy cues, not generic marketing language.`,
            `Identify media assets needed for the hero and supporting sections.`,
            `Check if the prompt implies ${/\b(next|api|prisma|auth|dashboard)\b/i.test(userPrompt) ? 'a full-stack build' : 'a marketing site'} and adjust research accordingly.`,
        ];
    }

    _buildSearchQueries(userPrompt, brief) {
        const queries = [
            `${brief.shortTitle || 'brand'} visual reference`,
            `${brief.siteArchetype} website inspiration`,
            `${brief.shortTitle || 'project'} moodboard`,
            `${brief.siteArchetype} typography inspiration`,
        ];

        if (/video|film|cinematic/.test(brief.heroTreatment)) {
            queries.push(`${brief.siteArchetype} cinematic hero video`);
            queries.push(`premium looping background video ${brief.shortTitle || 'brand'}`);
        }

        if (/webgl|3d/.test(brief.heroTreatment) || /3d|shader|model/.test(userPrompt)) {
            queries.push(`${brief.siteArchetype} webgl hero reference`);
            queries.push('react three fiber premium website reference');
        }

        if (/luxury|real-estate|hospitality|fashion/.test(brief.siteArchetype)) {
            queries.push(`${brief.siteArchetype} editorial composition`);
        }

        if (/app|dashboard|saas|product/.test(userPrompt)) {
            queries.push('premium product UI dashboard inspiration');
            queries.push('SaaS editorial landing page inspiration');
        }

        return [...new Set(queries)].slice(0, this.config.maxSearchQueries);
    }

    _buildResearchGoals(brief) {
        return [
            `Find visual references that match ${brief.shortTitle || 'the project'} and its ${brief.siteArchetype} archetype.`,
            `Confirm the correct hero treatment for ${brief.heroTreatment}.`,
            `Source category-specific copy cues, not generic marketing language.`,
            `Identify the media assets needed for hero, proof, and support sections.`,
        ];
    }

    _buildAssetChecklist(brief) {
        const items = [
            'Hero image or hero video',
            'Typography references',
            'Logo or wordmark',
            'Section proof media',
        ];

        if (/video/.test(brief.heroTreatment)) items.push('Looping hero video sources');
        if (/3d|webgl/.test(brief.heroTreatment)) items.push('3D model or shader references');
        if (/photo/.test(brief.heroTreatment)) items.push('Editorial photography references');

        return items.slice(0, 8);
    }

    _describeLayout(sectionName) {
        const layouts = {
            hero: 'Full viewport (100vh), overflow-hidden, media background z-0, content overlay z-10 with flex column',
            'hero-film': 'Full viewport cinematic scene with video background and layered typography',
            'hero-property': 'Full viewport with property photography and minimal type overlay',
            'hero-manifesto': 'Full viewport with philosophical statement and subtle background treatment',
            capabilities: 'Min-height 100vh, grid layout (1 col mobile / 3 col desktop), liquid glass cards with icons and tags',
            'selected-work': 'Horizontal scroll gallery pinned with ScrollTrigger, or vertical case study cards',
            philosophy: 'Two-column editorial layout, large type left, supporting text right',
            gallery: 'Full-bleed image grid or horizontal pinned scroll',
            cta: 'Centered content, magnetic button, form or contact info',
            footer: 'Multi-column footer with links, social, brand info',
        };
        return layouts[sectionName] || 'Standard section with generous spacing and clear hierarchy';
    }

    _componentsForSection(sectionName, motions) {
        const componentMap = {
            hero: ['FadingVideo', 'LiquidGlassNav', 'BlurText', 'MagneticButton', 'StatsCards'],
            'hero-film': ['FadingVideo', 'LiquidGlassNav', 'BlurText', 'MagneticButton'],
            'hero-property': ['PropertyImage', 'LiquidGlassNav', 'BlurText', 'MagneticButton'],
            'hero-manifesto': ['HeroType', 'BlurText', 'LiquidGlass'],
            capabilities: ['LiquidGlass', 'CapabilityCard', 'TagPill', 'IconContainer'],
            'selected-work': ['ProjectCard', 'ImageMask', 'ScrollScrubScene'],
            gallery: ['ImageGrid', 'ScrollScrubScene', 'MaskReveal'],
            cta: ['MagneticButton', 'LiquidGlass', 'ContactForm'],
            footer: ['FooterGrid', 'SocialLinks', 'LiquidGlass'],
        };
        const components = componentMap[sectionName] || ['LiquidGlass', 'MagneticButton'];
        return components.slice(0, 5 + (motions.includes('scroll-scrub-camera') ? 1 : 0));
    }

    _copyForSection(sectionName, brandName, archetype) {
        const copyMap = {
            'agency-cinematic': {
                hero: {
                    eyebrow: 'Booking Q3 2026 engagements — limited capacity',
                    headline: 'Crafted Digital Experiences Built to Outlast Trends',
                    subtext: `${brandName} is a small studio of designers and engineers shaping brand-defining websites for ambitious companies.`,
                },
                capabilities: {
                    eyebrow: '// Capabilities',
                    headline: 'Studio craft,\nend to end',
                    subtext: 'From brand identity to production engineering, we ship complete digital experiences.',
                },
            },
            'real-estate-luxury': {
                hero: {
                    eyebrow: 'Now Available',
                    headline: `${brandName}\nA Private Residence`,
                    subtext: 'A collection of thoughtfully composed homes in a landscape shaped by light, water, and stone.',
                },
            },
        };
        return copyMap[archetype]?.[sectionName] || {
            eyebrow: '',
            headline: `${brandName}`,
            subtext: 'Category-specific copy to be refined during the design phase.',
        };
    }

    _generateHeadline(brandName, archetype) {
        const headlines = {
            'agency-cinematic': 'Crafted Digital Experiences Built to Outlast Trends',
            'real-estate-luxury': `${brandName}\nWhere Architecture Meets Landscape`,
            'architecture-studio': 'Buildings That Listen to Their Place',
            'fashion-editorial': 'Season Two — In Motion',
            'hospitality-film': `Stay at ${brandName}`,
            'product-cinematic': `${brandName}\nEngineered for Everyday`,
            'portfolio-editorial': `${brandName}\nSelected Works`,
            'saas-editorial': `${brandName}\nBuilt for Teams That Care About Craft`,
            webapp: `${brandName}\nWorkspace`,
        };
        return headlines[archetype] || `${brandName}\nCrafted with Intention`;
    }

    _generateSubtext(brandName, archetype) {
        const subtexts = {
            'agency-cinematic': `${brandName} is a small studio of designers and engineers shaping brand-defining websites for ambitious companies.`,
            'real-estate-luxury': 'A limited collection of private residences in a landscape shaped by light, water, and stone.',
            'architecture-studio': 'We design buildings and spaces that respond to context, climate, and the people who inhabit them.',
            'fashion-editorial': 'A study in movement, material, and the quiet confidence of considered design.',
            'hospitality-film': 'A retreat where hospitality is measured in details, not amenities.',
            'product-cinematic': 'Considered materials, refined engineering, and design that lasts beyond seasons.',
            'portfolio-editorial': 'A selection of work across brand, digital, and editorial disciplines.',
            'saas-editorial': 'Software for teams who believe the details compound.',
            webapp: 'Fast, focused, and built for daily use.',
        };
        return subtexts[archetype] || `${brandName} is committed to craft, clarity, and considered design.`;
    }

    _describeHeroBackground(treatment) {
        const descriptions = {
            'fullscreen-video-crossfade': 'Full-viewport video(s) with crossfade transitions. Multiple video sources stacked absolutely, opacity-based crossfade over 1000ms when timeupdate detects remaining time <= 0.55s.',
            'webgl-scene-parallax': 'Three.js canvas covering the full viewport. Scene includes 3D models with mouse-driven camera tilt; cameraOrbit is updated on mousemove and smoothed with a lerp factor of 0.05.',
            'photo-mask-editorial': 'Full-bleed editorial photograph as the hero background. Typography is overlaid with mix-blend-mode: difference or a clip-path masked reveal.',
            'hybrid-video-3d': 'Base video layer plus floating 3D elements and parallax overlay images. Mouse-driven parallax uses different depth multipliers per layer.',
            'typography-focused': 'Minimal background. Oversized typography acts as the hero using clamp-based fluid scaling, with very subtle motion and refined spacing.',
        };
        return descriptions[treatment] || descriptions['fullscreen-video-crossfade'];
    }

    _composeExactPrompt(brief) {
        const colors = brief.visualSystem.exactColors;
        const fonts = brief.visualSystem.exactFonts;
        const motionLine = (brief.motionSystems || []).join(', ');
        const componentsLine = (brief.componentSpecs || []).map((c) => c.name).join(', ');
        const queriesLine = (brief.researchPlan?.searchQueries || []).join('; ');

        return [
            `Create a single-page ${brief.siteArchetype} website for "${brief.shortTitle}".`,
            `Art direction: ${brief.heroTreatment} with a premium ${brief.qualityBar} finish.`,
            `Color system: background ${colors.background}, text ${colors.text}, muted ${colors.textMuted}, accent ${colors.accent}, surface ${colors.surface}.`,
            `Typography: ${fonts.heading} (${fonts.headingStyle}) for headings and ${fonts.body} (300, 400, 500, 600) for body text. Use the Google Fonts URL ${fonts.googleFontsUrl}.`,
            `Motion systems to implement: ${motionLine}.`,
            `Required components: ${componentsLine}.`,
            `Hero copy: headline "${brief.heroSpec.headline}", subtext "${brief.heroSpec.subtext}", CTAs "${brief.heroSpec.ctaPrimary}" and "${brief.heroSpec.ctaSecondary}".`,
            `Add exact scroll choreography, responsive breakpoints, prefers-reduced-motion fallback, and a clear asset plan.`,
            `Research queries to guide reference gathering: ${queriesLine}.`,
            `Avoid: ${(brief.antiPatterns || []).join(', ')}.`,
            `Build it like a hand-crafted Awwwards site, not a template.`,
        ].join(' ');
    }

    _guessArchetype(prompt) {
        const p = String(prompt || '').toLowerCase();
        if (/real.?estate|property|villa|penthouse|residence/.test(p)) return 'real-estate-luxury';
        if (/architect/.test(p)) return 'architecture-studio';
        if (/fashion|apparel|couture|clothing/.test(p)) return 'fashion-editorial';
        if (/restaurant|hotel|hospitality|dining|resort/.test(p)) return 'hospitality-film';
        if (/agency|studio|creative/.test(p)) return 'agency-cinematic';
        if (/portfolio|photographer|designer|artist/.test(p)) return 'portfolio-editorial';
        if (/dashboard|admin|saas app|crm|analytics/.test(p)) return 'webapp';
        if (/product|beverage|drink|soda|shoe|watch/.test(p)) return 'product-cinematic';
        if (/saas|startup|software|platform/.test(p)) return 'saas-editorial';
        return 'agency-cinematic';
    }

    _guessTitle(prompt) {
        const line = String(prompt || '').split(/[\n.]/)[0].trim();
        const quoted = line.match(/["“']([^"”']+)["”']/);
        if (quoted) return quoted[1].slice(0, 40);
        const words = line
            .replace(/build|create|make|a|an|the|website|for/gi, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        if (words.length >= 1 && words[0].length > 2) {
            return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 32);
        }
        return 'Atelier';
    }
}

window.PromptEngineerAgent = PromptEngineerAgent;
;
/* ============================================================
   PLANNER AGENT V3 — Creates hyper-detailed specifications
   with exact component blueprints, copy, and motion configs
   that downstream agents can implement verbatim
   ============================================================ */

class PlannerAgent extends BaseAgent {
    constructor() {
        super('Planner', 'Creates hyper-detailed specs with exact component blueprints');

        // Reference the same component library as PromptEngineer
        // This ensures consistency across the pipeline
        this.componentRegistry = {
            'FadingVideo': {
                category: 'hero',
                complexity: 'medium',
                dependencies: ['gsap'],
                dataAttributes: ['data-fading-video', 'data-sources'],
                cssClasses: ['video-layer', 'hero-video', 'active'],
                timing: { fadeIn: 500, crossfade: 550, triggerBefore: 0.55 }
            },
            'BlurText': {
                category: 'typography',
                complexity: 'medium',
                dependencies: ['gsap'],
                dataAttributes: ['data-blur-text'],
                cssClasses: ['blur-text', 'blur-text-word'],
                timing: { duration: 700, stagger: 100, ease: 'power3.out' }
            },
            'LiquidGlass': {
                category: 'surface',
                complexity: 'simple',
                dependencies: [],
                cssClasses: ['liquid-glass', 'liquid-glass-strong'],
                variants: ['subtle', 'strong']
            },
            'MagneticButton': {
                category: 'interaction',
                complexity: 'medium',
                dependencies: ['gsap'],
                dataAttributes: ['data-magnet'],
                cssClasses: ['btn', 'btn-primary'],
                timing: { duration: 400, ease: 'power3', strength: 0.3 }
            },
            'ParallaxLayers': {
                category: 'motion',
                complexity: 'medium',
                dependencies: ['gsap'],
                dataAttributes: ['data-parallax'],
                cssClasses: ['parallax-container', 'parallax-layer'],
                timing: { lerp: 0.05, multiplier: 60 }
            },
            'GrainVignette': {
                category: 'atmosphere',
                complexity: 'simple',
                dependencies: [],
                cssClasses: ['film-grain', 'vignette']
            },
            'ScrollScrubScene': {
                category: 'motion',
                complexity: 'complex',
                dependencies: ['gsap', 'ScrollTrigger'],
                dataAttributes: ['data-scene', 'data-scrub'],
                cssClasses: ['scroll-scene', 'scroll-scene-content']
            },
            'StatsCards': {
                category: 'content',
                complexity: 'medium',
                dependencies: ['gsap'],
                dataAttributes: ['data-count', 'data-animate'],
                cssClasses: ['stats-grid', 'stat-card', 'stat-value', 'stat-label']
            },
            'CapabilityCards': {
                category: 'content',
                complexity: 'medium',
                dependencies: [],
                dataAttributes: ['data-animate'],
                cssClasses: ['capabilities-grid', 'capability-card', 'capability-icon', 'capability-tags']
            },
            'TrustBar': {
                category: 'social-proof',
                complexity: 'simple',
                dependencies: [],
                dataAttributes: ['data-animate'],
                cssClasses: ['trust-bar', 'trust-badge', 'trust-logos', 'trust-logo']
            },
            'BubbleNav': {
                category: 'navigation',
                complexity: 'medium',
                dependencies: [],
                cssClasses: ['navbar', 'nav-container', 'nav-logo', 'nav-links', 'nav-link', 'hamburger']
            },
            'DataTable': {
                category: 'data',
                complexity: 'complex',
                dependencies: [],
                dataAttributes: ['data-sortable', 'data-filterable'],
                cssClasses: ['data-table', 'table-header', 'table-row', 'table-cell']
            },
            'ChartWidget': {
                category: 'data',
                complexity: 'complex',
                dependencies: ['Chart.js'],
                cssClasses: ['chart-container', 'chart-canvas']
            },
            'TabSystem': {
                category: 'interaction',
                complexity: 'medium',
                dependencies: [],
                dataAttributes: ['data-tab', 'data-tab-content'],
                cssClasses: ['tabs-container', 'tabs-nav', 'tab-btn', 'tab-panel']
            },
            'ModalSystem': {
                category: 'interaction',
                complexity: 'medium',
                dependencies: [],
                dataAttributes: ['data-modal-trigger', 'data-modal-target'],
                cssClasses: ['modal-overlay', 'modal-container', 'modal-content', 'modal-close']
            },
            'FormValidation': {
                category: 'interaction',
                complexity: 'medium',
                dependencies: [],
                dataAttributes: ['data-validate', 'data-rules'],
                cssClasses: ['form-group', 'form-input', 'form-error', 'form-success']
            }
        };

        // Motion system specifications with exact GSAP configs
        this.motionSpecs = {
            'masked-title-reveal': {
                gsapConfig: {
                    from: { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
                    to: { clipPath: 'inset(0% 0 0 0)', opacity: 1 },
                    duration: 1.2,
                    ease: 'power3.out',
                    stagger: 0.1
                },
                scrollTrigger: { start: 'top 80%', toggleActions: 'play none none none' }
            },
            'word-blur-reveal': {
                gsapConfig: {
                    from: { filter: 'blur(10px)', opacity: 0, y: 50 },
                    to: { filter: 'blur(0px)', opacity: 1, y: 0 },
                    duration: 0.7,
                    ease: 'power3.out',
                    stagger: 0.1
                },
                scrollTrigger: { start: 'top 85%', threshold: 0.1 }
            },
            'parallax-media-layers': {
                behavior: 'Mouse-driven translate with lerp smoothing',
                config: { lerp: 0.05, multiplier: 60, layers: [-0.5, 0, 0.3, 0.5] }
            },
            'magnetic-quickto-cta': {
                gsapConfig: { duration: 0.4, ease: 'power3' },
                strength: 0.3,
                resetEase: 'elastic.out(1, 0.3)'
            },
            'video-hero-crossfade': {
                timing: { fadeIn: 500, crossfade: 550, triggerBefore: 0.55 },
                behavior: 'Opacity crossfade when timeupdate detects remaining <= 0.55s'
            },
            'scroll-scrub-scenes': {
                scrollTrigger: { scrub: 1, pin: true, anticipatePin: 1 },
                behavior: 'Pin section and scrub through animation timeline'
            },
            'grain-vignette-grade': {
                grain: { opacity: 0.035, baseFrequency: 0.65, numOctaves: 3 },
                vignette: { innerRadius: '50%', outerRadius: '100%', opacity: 0.4 }
            },
            'stagger-fade-up': {
                gsapConfig: {
                    from: { y: 60, opacity: 0 },
                    to: { y: 0, opacity: 1 },
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.15
                },
                scrollTrigger: { start: 'top 85%' }
            }
        };

        // Section blueprints with exact structure
        this.sectionBlueprints = {
            'hero-cinematic': {
                layout: 'Full viewport (100vh), video/media background, centered or split content',
                structure: `
<section class="hero" id="hero" data-scene="hero">
  <div class="video-layer" data-fading-video data-sources='[VIDEOS]'>
    <video class="hero-video active" autoplay muted playsinline></video>
  </div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-badge liquid-glass" data-animate="fade-up">
      <span class="badge-dot"></span>
      <span>[BADGE_TEXT]</span>
    </div>
    <h1 class="hero-title" data-blur-text>[HEADLINE]</h1>
    <p class="hero-subtitle" data-animate="fade-up" data-delay="0.3">[SUBTEXT]</p>
    <div class="hero-cta" data-animate="fade-up" data-delay="0.5">
      <a href="#" class="btn btn-primary" data-magnet="0.3">[CTA_PRIMARY]</a>
      <a href="#" class="btn btn-secondary">[CTA_SECONDARY]</a>
    </div>
  </div>
  <div class="hero-scroll-indicator" data-animate="fade-up" data-delay="0.8">
    <div class="scroll-mouse"><div class="scroll-dot"></div></div>
    <span>Scroll to explore</span>
  </div>
</section>`,
                components: ['FadingVideo', 'BlurText', 'LiquidGlass', 'MagneticButton'],
                motionSystems: ['video-hero-crossfade', 'word-blur-reveal', 'magnetic-quickto-cta']
            },

            'hero-webgl': {
                layout: 'Full viewport with Three.js canvas behind content',
                structure: `
<section class="hero" id="hero" data-scene="hero">
  <div id="three-canvas" class="three-canvas"></div>
  <div class="hero-content">
    <h1 class="hero-title" data-blur-text>[HEADLINE]</h1>
    <p class="hero-subtitle" data-animate="fade-up">[SUBTEXT]</p>
    <div class="hero-cta" data-animate="fade-up" data-delay="0.3">
      <a href="#" class="btn btn-primary" data-magnet="0.3">[CTA_PRIMARY]</a>
    </div>
  </div>
</section>`,
                components: ['BlurText', 'MagneticButton'],
                motionSystems: ['word-blur-reveal', 'magnetic-quickto-cta'],
                requires3D: true
            },

            'capabilities': {
                layout: 'Min-height 100vh, 3-column grid on desktop',
                structure: `
<section class="section capabilities" id="capabilities" data-scene="capabilities">
  <div class="container">
    <header class="section-header" data-animate="fade-up">
      <span class="section-label">// [LABEL]</span>
      <h2 class="section-title">[TITLE]</h2>
    </header>
    <div class="capabilities-grid" data-animate="stagger">
      <!-- Repeat for each capability -->
      <div class="capability-card liquid-glass">
        <div class="capability-header">
          <div class="capability-icon liquid-glass">[ICON]</div>
          <div class="capability-tags">
            <span class="capability-tag liquid-glass">[TAG]</span>
          </div>
        </div>
        <div class="capability-content">
          <h3>[CAPABILITY_TITLE]</h3>
          <p>[CAPABILITY_DESC]</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
                components: ['LiquidGlass', 'CapabilityCards'],
                motionSystems: ['stagger-fade-up']
            },

            'stats-proof': {
                layout: 'Horizontal stats row or grid',
                structure: `
<section class="section stats" id="stats" data-scene="proof">
  <div class="container">
    <div class="stats-grid" data-animate="stagger">
      <!-- Repeat for each stat -->
      <div class="stat-card liquid-glass">
        <div class="stat-icon">[ICON]</div>
        <div class="stat-value" data-count="[VALUE]">0</div>
        <div class="stat-suffix">[SUFFIX]</div>
        <div class="stat-label">[LABEL]</div>
      </div>
    </div>
  </div>
</section>`,
                components: ['LiquidGlass', 'StatsCards'],
                motionSystems: ['stagger-fade-up']
            },

            'work-gallery': {
                layout: 'Project cards grid or horizontal scroll',
                structure: `
<section class="section work" id="work" data-scene="work">
  <div class="container">
    <header class="section-header" data-animate="fade-up">
      <span class="section-label">// [LABEL]</span>
      <h2 class="section-title">[TITLE]</h2>
    </header>
    <div class="work-grid">
      <!-- Repeat for each project -->
      <article class="work-card" data-animate="fade-up">
        <div class="work-image">
          <img src="[IMAGE]" alt="[ALT]" loading="lazy">
        </div>
        <div class="work-info">
          <span class="work-category">[CATEGORY]</span>
          <h3 class="work-title">[PROJECT_TITLE]</h3>
          <p class="work-excerpt">[EXCERPT]</p>
        </div>
      </article>
    </div>
  </div>
</section>`,
                components: [],
                motionSystems: ['stagger-fade-up']
            },

            'cta-final': {
                layout: 'Centered content with strong visual hierarchy',
                structure: `
<section class="section cta" id="cta" data-scene="cta">
  <div class="container">
    <div class="cta-content" data-animate="fade-up">
      <h2 class="cta-title">[TITLE]</h2>
      <p class="cta-subtitle">[SUBTITLE]</p>
      <div class="cta-actions">
        <a href="#" class="btn btn-primary btn-large" data-magnet="0.3">[CTA_PRIMARY]</a>
        <a href="#" class="btn btn-secondary btn-large">[CTA_SECONDARY]</a>
      </div>
    </div>
  </div>
</section>`,
                components: ['MagneticButton'],
                motionSystems: ['magnetic-quickto-cta']
            },

            'trust-bar': {
                layout: 'Centered badge + logo row',
                structure: `
<div class="trust-bar" data-animate="fade-up">
  <div class="trust-badge liquid-glass">
    <span>[BADGE_TEXT]</span>
  </div>
  <div class="trust-logos">
    <!-- Repeat for each logo -->
    <span class="trust-logo">[LOGO_NAME]</span>
  </div>
</div>`,
                components: ['LiquidGlass', 'TrustBar'],
                motionSystems: ['stagger-fade-up']
            },

            'dashboard-main': {
                layout: 'Sidebar + main content area with stats and data table',
                structure: `
<main class="dashboard-main">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-logo">[LOGO]</span>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="sidebar-link active">[LINK]</a>
    </nav>
  </aside>
  <div class="main-content">
    <header class="content-header">
      <h1>[PAGE_TITLE]</h1>
      <div class="header-actions">
        <button class="btn btn-primary">[ACTION]</button>
      </div>
    </header>
    <div class="stats-row">
      <!-- Stats cards -->
    </div>
    <div class="data-section">
      <div class="data-table-container">
        <!-- Data table -->
      </div>
    </div>
  </div>
</main>`,
                components: ['DataTable', 'StatsCards', 'TabSystem'],
                motionSystems: ['stagger-fade-up']
            }
        };

        this.systemPrompt = `You are a principal full-stack AI architect + Awwwards creative director. You create HYPER-DETAILED website specifications with exact component configurations, copy, and motion timing that downstream agents can implement verbatim.

CRITICAL RULES:
1. BEFORE outputting JSON, write detailed reasoning in <thinking>...</thinking> tags
2. After thinking, output ONLY valid JSON in a \`\`\`json\`\`\` block
3. Every section must include a "blueprint" field with exact HTML structure hints
4. Every component must include exact data attributes and CSS classes
5. Motion systems must include exact GSAP configurations (duration, ease, stagger)
6. Copy must be category-specific and production-ready (never Lorem Ipsum)
7. Color values must be exact hex codes
8. Font specifications must include exact Google Fonts names and weights
9. Timing values must be in milliseconds
10. Default to Awwwards/Motionsites quality - never generic templates

FRAMEWORK DETECTION:
- vanilla → cinematic marketing sites, editorial, portfolios, agencies (GSAP + Lenis + optional Three.js)
- react-vite → SPAs, dashboards without real backend, R3F heavy, complex client state
- fullstack-nextjs → auth, database, API routes, multi-tenant, payments

COMPONENT REGISTRY (use exact names):
${Object.keys(this.componentRegistry).map(name => `- ${name}: ${this.componentRegistry[name].category}`).join('\n')}

MOTION SYSTEMS (use exact names):
${Object.keys(this.motionSpecs).map(name => `- ${name}`).join('\n')}

OUTPUT FORMAT: Complete JSON with all fields filled, including exact blueprints for each section.`;
    }

    async execute(userPrompt, frameworkOverride = null, engineeredBrief = null) {
        this.log('info', 'Creating hyper-detailed specification with exact blueprints...');

        const briefContext = engineeredBrief
            ? `\n═══ ENGINEERED STUDIO BRIEF (authoritative) ═══\n${JSON.stringify(engineeredBrief, null, 2)}\n`
            : '';

        const message = `Create a HYPER-DETAILED website specification with exact component blueprints.

USER REQUEST:
"""
${userPrompt}
"""
${briefContext}
${frameworkOverride ? `FRAMEWORK OVERRIDE: "${frameworkOverride}"` : ''}

REQUIREMENTS:
1. Determine framework: vanilla for cinematic/marketing, react-vite for SPA/dashboard, fullstack-nextjs for auth/DB
2. For each section, provide exact HTML structure blueprint with data attributes
3. List exact components from registry with their configurations
4. Specify motion systems with exact GSAP timing (duration in ms, ease, stagger)
5. Write production-ready copy (headlines, subtext, CTAs, labels)
6. Provide exact hex colors and Google Fonts specifications
7. Include media needs with detailed generation prompts

Output the complete specification JSON now.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.5,
            maxTokens: 32768,
        });

        try {
            let spec = this.parseJSON(response);
            spec = this._normalizeSpec(spec, userPrompt, frameworkOverride, engineeredBrief);
            this.log('success', `Spec: ${spec.siteType} [${spec.framework}/${spec.complexity}] — ${spec.sections.length} sections with blueprints`);
            return spec;
        } catch (e) {
            this.log('warning', `Parse failed, using intelligent default: ${e.message}`);
            return this._getDefaultSpec(userPrompt, frameworkOverride, engineeredBrief);
        }
    }

    _normalizeSpec(spec, userPrompt, frameworkOverride = null, engineeredBrief = null) {
        const promptLower = String(userPrompt || '').toLowerCase();

        // Detect site type signals
        const cinematicSignals = /\b(cinematic|awwwards|webgl|video|luxury|real.?estate|architecture|agency|fashion|editorial|motionsites)\b/i.test(promptLower)
            || (engineeredBrief && !/webapp|dashboard/i.test(engineeredBrief.siteArchetype || ''));
        const productSignals = /\b(dashboard|admin|auth|login|database|api|crm|portal|panel|checkout)\b/i.test(promptLower) && !cinematicSignals;
        const fullstackSignals = /\b(database|prisma|postgres|auth|login|api|full-?stack|next\.?js|payment|stripe)\b/i.test(promptLower) && !cinematicSignals;

        // Basic fields
        spec.siteType = spec.siteType || (productSignals ? 'webapp' : 'agency');
        spec.title = spec.title || engineeredBrief?.shortTitle || 'Premium Website';
        spec.description = spec.description || String(userPrompt || '').slice(0, 400);

        // Framework detection
        if (frameworkOverride) {
            spec.framework = frameworkOverride;
        } else if (!spec.framework) {
            if (fullstackSignals) spec.framework = 'fullstack-nextjs';
            else if (productSignals) spec.framework = 'react-vite';
            else spec.framework = 'vanilla';
        }

        // Override weak framework choices
        if (!frameworkOverride && cinematicSignals && engineeredBrief?.techStackBias === 'vanilla-gsap-webgl') {
            spec.framework = 'vanilla';
        }

        // Complexity
        let complexity = String(spec.complexity || '').toLowerCase();
        if (!['simple', 'medium', 'complex', 'ultra-complex'].includes(complexity)) {
            complexity = cinematicSignals ? 'complex' : (productSignals ? 'complex' : 'medium');
        }
        if (productSignals && complexity === 'simple') complexity = 'medium';
        if (fullstackSignals && complexity !== 'ultra-complex') complexity = 'complex';
        spec.complexity = complexity;

        // Hero treatment
        spec.heroTreatment = spec.heroTreatment || engineeredBrief?.heroTreatment || (cinematicSignals ? 'hybrid' : 'photo-mask');

        // 3D detection
        spec.has3D = spec.has3D === true || /webgl|3d|three/i.test(spec.heroTreatment || '');
        if (cinematicSignals && (spec.heroTreatment === 'webgl-scene' || spec.heroTreatment === 'hybrid')) {
            spec.has3D = true;
        }

        // Advanced 3D effect auto-detection from prompt
        const advancedEffectRegistry = [
            { id: 'gpgpu-particles', pattern: /gpgpu|100k|million.?particle|fbo|ping.?pong|massive.?particle|data.?texture/i },
            { id: 'raymarched-sdf', pattern: /raymarch|sdf|signed.?distance|marching|volumetric.?render/i },
            { id: 'audio-reactive', pattern: /audio.?react|music.?visual|sound.?react|beat.?react|frequency.?visual|spectrum|audio.?driven/i },
            { id: 'full-postprocessing', pattern: /post.?process|effect.?composer|bloom.?chain|chromatic.?aberr|god.?ray|film.?grain/i },
            { id: 'curl-noise-displacement', pattern: /curl.?noise|turbulence|flow.?field|vector.?field/i },
            { id: 'rapier-physics', pattern: /rapier|cannon|physics.?sim|rigid.?body|collision.?detect/i },
        ];

        const detectedAdvanced = advancedEffectRegistry
            .filter(r => r.pattern.test(promptLower))
            .map(r => r.id);

        // Merge with any effects from engineered brief
        const briefEffects = engineeredBrief?.advancedEffects || spec.advancedEffects || [];
        spec.advancedEffects = [...new Set([...briefEffects, ...detectedAdvanced])];

        // Force has3D when any advanced 3D effect is requested
        if (spec.advancedEffects.some(e => ['gpgpu-particles', 'raymarched-sdf', 'audio-reactive', 'curl-noise-displacement'].includes(e))) {
            spec.has3D = true;
            if (!spec.heroTreatment || spec.heroTreatment === 'photo-mask') {
                spec.heroTreatment = 'webgl-scene';
            }
        }

        // Motion systems from brief or defaults
        spec.motionSystems = engineeredBrief?.motionSystems?.slice(0, 5)
            || spec.motionSystems
            || ['word-blur-reveal', 'parallax-media-layers', 'magnetic-quickto-cta', 'stagger-fade-up'];

        // Ensure motion systems are valid
        spec.motionSystems = spec.motionSystems.filter(m =>
            Object.keys(this.motionSpecs).includes(m) || m.length > 3
        );

        // Sections with blueprints
        spec.sections = this._normalizeSections(spec, engineeredBrief, cinematicSignals, productSignals);

        // Section blueprints - the key upgrade
        spec.sectionBlueprints = this._generateSectionBlueprints(spec, engineeredBrief);

        // Components needed
        spec.components = this._gatherComponents(spec.sectionBlueprints);

        // Motion configurations
        spec.motionConfigs = this._generateMotionConfigs(spec.motionSystems);

        // Color palette
        spec.colorPalette = this._normalizeColors(spec.colorPalette, engineeredBrief);

        // Typography
        spec.typography = this._normalizeTypography(spec.typography, engineeredBrief);

        // Copy deck
        spec.copyDeck = this._generateCopyDeck(spec, engineeredBrief, userPrompt);

        // Media needs
        spec.mediaNeeds = this._normalizeMediaNeeds(spec, engineeredBrief);

        // Art direction
        spec.artDirection = spec.artDirection || engineeredBrief?.visualSystem || this._getArtDirection(spec.siteType);

        // Quality contract
        spec.qualityContract = this._getQualityContract(spec);

        // Design philosophy (keep existing)
        spec.designPhilosophy = spec.designPhilosophy || engineeredBrief?.designPhilosophy || null;
        // advancedEffects already populated above via auto-detection

        // App architecture for fullstack
        if (spec.framework === 'fullstack-nextjs') {
            spec.appArchitecture = this._normalizeArchitecture(spec.appArchitecture, spec);
            spec.dbModels = spec.dbModels || this._getDefaultDbModels(spec);
            spec.apiEndpoints = spec.apiEndpoints || this._getDefaultApiEndpoints(spec);
            spec.pages = this._getFullstackPages(spec);
        } else {
            spec.pages = spec.pages || [{ id: 'home', path: '/', purpose: 'Primary brand story', sections: spec.sections.map(s => s.id || s) }];
        }

        // Anti-patterns
        spec.antiPatterns = engineeredBrief?.antiPatterns || [
            'purple/cyan SaaS gradients',
            'generic bento feature cards',
            'fake vanity metrics',
            'floating gradient orbs',
            'Lorem Ipsum placeholder text'
        ];

        return spec;
    }

    _normalizeSections(spec, engineeredBrief, cinematicSignals, productSignals) {
        if (Array.isArray(spec.sections) && spec.sections.length) {
            return spec.sections.map(s => typeof s === 'string' ? { id: s, type: s } : s);
        }

        if (productSignals) {
            return [
                { id: 'header', type: 'navigation' },
                { id: 'sidebar', type: 'dashboard-sidebar' },
                { id: 'main', type: 'dashboard-main' },
                { id: 'footer', type: 'footer' }
            ];
        }

        // Cinematic website sections
        return [
            { id: 'hero', type: spec.heroTreatment?.includes('webgl') ? 'hero-webgl' : 'hero-cinematic' },
            { id: 'proof', type: 'stats-proof' },
            { id: 'capabilities', type: 'capabilities' },
            { id: 'work', type: 'work-gallery' },
            { id: 'trust', type: 'trust-bar' },
            { id: 'cta', type: 'cta-final' },
            { id: 'footer', type: 'footer' }
        ];
    }

    _generateSectionBlueprints(spec, engineeredBrief) {
        const blueprints = {};
        const copyDeck = engineeredBrief?.heroSpec || {};

        for (const section of spec.sections) {
            const sectionId = section.id || section;
            const sectionType = section.type || sectionId;

            // Get base blueprint
            const baseBlueprint = this.sectionBlueprints[sectionType] || this.sectionBlueprints['cta-final'];

            // Customize with actual copy
            blueprints[sectionId] = {
                ...baseBlueprint,
                id: sectionId,
                type: sectionType,
                copy: this._getCopyForSection(sectionId, spec, engineeredBrief),
                motionSystems: baseBlueprint.motionSystems || [],
                components: baseBlueprint.components || []
            };
        }

        return blueprints;
    }

    _getCopyForSection(sectionId, spec, engineeredBrief) {
        const heroSpec = engineeredBrief?.heroSpec || {};
        const sectionsPlan = engineeredBrief?.sectionsPlan || [];

        // Find section in engineered brief
        const briefSection = sectionsPlan.find(s => s.name === sectionId);
        if (briefSection?.copy) return briefSection.copy;

        // Default copy based on section type
        const defaultCopy = {
            hero: {
                badge: 'Booking Q3 2026 engagements — limited capacity',
                headline: heroSpec.headline || `${spec.title} — Crafted Digital Experiences`,
                subtext: heroSpec.subtext || spec.description || 'A premium digital experience crafted with precision.',
                ctaPrimary: heroSpec.ctaPrimary || 'Start a Project',
                ctaSecondary: heroSpec.ctaSecondary || 'View Work'
            },
            capabilities: {
                label: 'Capabilities',
                title: 'Studio craft,\nend to end',
                items: [
                    { icon: '🎨', title: 'Design', tags: ['Brand', 'Motion', 'UI'], desc: 'We shape identities and interfaces that feel unmistakably yours.' },
                    { icon: '⚡', title: 'Engineering', tags: ['React', 'Next.js', 'Edge'], desc: 'Production-grade front-ends built on modern stacks.' },
                    { icon: '📈', title: 'Growth', tags: ['SEO', 'Analytics', 'CRO'], desc: 'Launch is the starting line. We partner on conversion and iteration.' }
                ]
            },
            proof: {
                stats: [
                    { icon: '⏱', value: 6, suffix: 'Weeks', label: 'Average Launch Time' },
                    { icon: '🌍', value: 140, suffix: '+', label: 'Brands Shipped' },
                    { icon: '⭐', value: 4.9, suffix: '', label: 'Client Satisfaction' }
                ]
            },
            cta: {
                title: `Ready to Transform\nYour Digital Presence?`,
                subtitle: 'Let\'s discuss your project and create something extraordinary together.',
                ctaPrimary: 'Start a Project',
                ctaSecondary: 'Schedule Call'
            },
            trust: {
                badge: 'Trusted by founders and creative directors worldwide',
                logos: ['Aeon', 'Vela', 'Apex', 'Orbit', 'Zeno']
            }
        };

        return defaultCopy[sectionId] || { title: sectionId, subtitle: '' };
    }

    _gatherComponents(blueprints) {
        const components = new Set();

        // Always include core components
        components.add('LiquidGlass');
        components.add('MagneticButton');

        // Gather from blueprints
        for (const blueprint of Object.values(blueprints)) {
            if (blueprint.components) {
                blueprint.components.forEach(c => components.add(c));
            }
        }

        return Array.from(components);
    }

    _generateMotionConfigs(motionSystems) {
        const configs = {};

        for (const system of motionSystems) {
            if (this.motionSpecs[system]) {
                configs[system] = this.motionSpecs[system];
            }
        }

        return configs;
    }

    _normalizeColors(colors, engineeredBrief) {
        const briefColors = engineeredBrief?.visualSystem?.exactColors || {};

        return {
            primary: colors?.primary || briefColors.accent || '#C84B31',
            secondary: colors?.secondary || '#173F5F',
            accent: colors?.accent || briefColors.accent || '#F6C85F',
            background: colors?.background || briefColors.background || '#000000',
            surface: colors?.surface || briefColors.surface || 'rgba(255,255,255,0.05)',
            text: colors?.text || briefColors.text || '#ffffff',
            textMuted: colors?.textMuted || briefColors.textMuted || 'rgba(255,255,255,0.7)'
        };
    }

    _normalizeTypography(typography, engineeredBrief) {
        const briefFonts = engineeredBrief?.visualSystem?.exactFonts || {};

        return {
            heading: typography?.heading || briefFonts.heading || 'Instrument Serif',
            headingStyle: briefFonts.headingStyle || 'italic',
            body: typography?.body || briefFonts.body || 'Barlow',
            bodyWeights: briefFonts.bodyWeights || [300, 400, 500, 600],
            googleFontsUrl: briefFonts.googleFontsUrl ||
                'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap'
        };
    }

    _generateCopyDeck(spec, engineeredBrief, userPrompt) {
        // Generate comprehensive copy deck that CoderUI can use directly
        return {
            brand: {
                name: spec.title,
                tagline: spec.description?.split('.')[0] || 'Crafted Digital Experiences',
                description: spec.description
            },
            navigation: {
                links: ['Work', 'Studio', 'Services', 'Journal', 'Contact'],
                cta: 'Start a Project'
            },
            hero: engineeredBrief?.heroSpec || {
                badge: 'Now Booking 2026',
                headline: `${spec.title}`,
                subtext: spec.description,
                ctaPrimary: 'Start a Project',
                ctaSecondary: 'View Work'
            },
            footer: {
                copyright: `© ${new Date().getFullYear()} ${spec.title}. All rights reserved.`,
                links: ['Privacy', 'Terms', 'Contact']
            }
        };
    }

    _normalizeMediaNeeds(spec, engineeredBrief) {
        const needs = spec.mediaNeeds || { images: [], videos: [], svgs: [] };

        if (!Array.isArray(needs.images)) needs.images = [];
        if (!Array.isArray(needs.videos)) needs.videos = [];
        if (!Array.isArray(needs.svgs)) needs.svgs = [];

        // Add media from engineered brief
        if (engineeredBrief?.mediaPlan) {
            needs.images = [...needs.images, ...(engineeredBrief.mediaPlan.images || [])];
            needs.videos = [...needs.videos, ...(engineeredBrief.mediaPlan.videos || [])];
        }

        // Ensure hero has media if needed
        if (spec.heroTreatment?.includes('video') && needs.videos.length === 0) {
            needs.videos.push({
                id: 'hero-video',
                prompt: `Cinematic ${spec.siteType} hero video: atmospheric, slow camera, luxury grade, no text, 15-30s loop`,
                usage: 'hero-background',
                style: 'cinematic'
            });
        }

        if (needs.images.length === 0 && !spec.has3D) {
            needs.images.push({
                id: 'hero-visual',
                prompt: `Editorial hero image for ${spec.title}: ${spec.artDirection?.concept || 'premium brand experience'}`,
                usage: 'hero-background',
                style: 'photorealistic'
            });
        }

        return needs;
    }

    _getArtDirection(siteType) {
        const directions = {
            agency: {
                concept: 'Cinematic design studio with bold editorial campaign feel',
                heroComposition: 'Full-bleed media with floating nav pill and large typographic lockup',
                visualMotifs: ['liquid glass surfaces', 'high-contrast type', 'film grain'],
                motionPlan: ['word-level blur reveal', 'media parallax', 'magnetic interactions'],
                avoid: ['feature-card overload', 'purple gradients', 'stock icon grids']
            },
            portfolio: {
                concept: 'Editorial portfolio with oversized asymmetric type',
                heroComposition: 'Statement on left, cropped feature image on right',
                visualMotifs: ['hairline rules', 'image captions', 'numbered index'],
                motionPlan: ['masked headline reveal', 'image scale on hover', 'gallery drift'],
                avoid: ['SaaS cards', 'gradient orbs', 'dashboard metrics']
            },
            ecommerce: {
                concept: 'Product-led retail where the product is the hero',
                heroComposition: 'Large product photography with compact purchase panel',
                visualMotifs: ['product close-ups', 'quiet labels', 'tactile swatches'],
                motionPlan: ['product crossfade', 'cart feedback', 'subtle scroll reveal'],
                avoid: ['generic bento', 'unrelated 3D', 'fake testimonials']
            },
            webapp: {
                concept: 'Calm, high-utility interface with editorial marketing layer',
                heroComposition: 'Real product screen dominates beside value statement',
                visualMotifs: ['realistic app states', 'data hierarchy', 'intentional space'],
                motionPlan: ['interface transitions', 'staggered data entry', 'page reveal'],
                avoid: ['ornamental blobs', 'meaningless counters', 'over-animated controls']
            }
        };
        return directions[siteType] || directions.agency;
    }

    _getQualityContract(spec) {
        return {
            tier: 'awwwards-site-of-the-day',
            northStar: spec.artDirection?.concept || 'A distinctive, editorial digital experience',
            proof: [
                'Show category-specific evidence, not generic claims',
                'Use concrete outcomes only when supported by brief',
                'Make every section earn its place in the story'
            ],
            signatureMoments: spec.artDirection?.motionPlan || [
                'Composed hero reveal',
                'One tactile interaction',
                'Memorable content transition'
            ],
            contentRules: [
                'Never use Lorem Ipsum or invented metrics',
                'Write precise headlines that name the actual offer',
                'Keep narrative anchored in the brief'
            ],
            nonNegotiables: [
                'One coherent visual concept hero to footer',
                'Responsive 375px through large desktop',
                'Keyboard-accessible + reduced-motion support',
                'Fast initial render',
                'No default gradient orbs or filler metrics'
            ]
        };
    }

    _normalizeArchitecture(arch, spec) {
        return {
            auth: arch?.auth || 'session',
            dataLayer: arch?.dataLayer || 'prisma-sqlite',
            roles: arch?.roles || ['guest', 'user', 'admin'],
            entities: arch?.entities || ['User', 'Item'],
            flows: arch?.flows || ['signup → onboard → core action → success']
        };
    }

    _getDefaultDbModels(spec) {
        return [
            { name: 'User', fields: ['id', 'email', 'name', 'role', 'createdAt'] },
            { name: 'Item', fields: ['id', 'title', 'status', 'ownerId', 'updatedAt'] }
        ];
    }

    _getDefaultApiEndpoints(spec) {
        return [
            { method: 'GET', path: '/api/health', purpose: 'Health check' },
            { method: 'GET', path: '/api/items', purpose: 'List items' },
            { method: 'POST', path: '/api/items', purpose: 'Create item' }
        ];
    }

    _getFullstackPages(spec) {
        return [
            { id: 'home', path: '/', purpose: 'Marketing landing', sections: ['hero', 'features', 'cta'] },
            { id: 'login', path: '/login', purpose: 'Authentication', sections: ['auth-form'] },
            { id: 'dashboard', path: '/dashboard', purpose: 'Main app surface', sections: ['sidebar', 'stats', 'table'] },
            { id: 'settings', path: '/settings', purpose: 'Account settings', sections: ['profile-form'] }
        ];
    }

    _getDefaultSpec(prompt, frameworkOverride = null, engineeredBrief = null) {
        const promptLower = String(prompt || '').toLowerCase();
        const cinematic = engineeredBrief && !/webapp|dashboard/i.test(engineeredBrief.siteArchetype || '')
            || /\b(cinematic|luxury|agency|awwwards|webgl|video)\b/i.test(promptLower);
        const isProduct = /\b(dashboard|admin|app|auth|database)\b/i.test(promptLower) && !cinematic;

        const raw = {
            framework: frameworkOverride || (isProduct ? 'react-vite' : 'vanilla'),
            siteType: isProduct ? 'webapp' : 'agency',
            title: engineeredBrief?.shortTitle || 'Premium Website',
            description: prompt,
            complexity: cinematic ? 'complex' : 'medium',
            heroTreatment: engineeredBrief?.heroTreatment || (cinematic ? 'hybrid' : 'photo-mask'),
            motionSystems: engineeredBrief?.motionSystems || ['word-blur-reveal', 'parallax-media-layers', 'magnetic-quickto-cta'],
            has3D: /\b(3d|webgl|three)\b/i.test(prompt),
            colorPalette: {
                primary: '#C84B31', secondary: '#173F5F', accent: '#F6C85F',
                background: '#000000', surface: 'rgba(255,255,255,0.05)', text: '#ffffff'
            },
            typography: { heading: 'Instrument Serif', body: 'Barlow' }
        };

        return this._normalizeSpec(raw, prompt, frameworkOverride, engineeredBrief);
    }
}

window.PlannerAgent = PlannerAgent;

;
class ResearcherAgent extends BaseAgent {
    constructor() {
        super('researcher', 'Autonomous R&D Swarm - Performs deep web research for complex technologies');
        
        this.queryPrompt = `You are the R&D Director for a $100K Website Build.
Analyze the project specification. If the project requires complex logic (like advanced WebGL shaders, R3F, 3D physics, GSAP ScrollTrigger, Web3 integrations, or complex APIs), you must formulate 2 distinct search queries to find the latest documentation and code patterns.

Output STRICT JSON:
{
    "needsResearch": true or false,
    "queries": ["query 1 (e.g., 'React Three Fiber realistic volumetric lighting code snippet 2026')", "query 2 (e.g., 'GSAP ScrollTrigger parallax pinning advanced tutorial')"],
    "reasoning": "Why this research is needed"
}`;

        this.synthesisPrompt = `You are a Senior Technical Researcher. You have performed multiple web searches for a complex project.
Read the search results below and extract the RAW CODE SNIPPETS and MODERN PATTERNS. 
Do not include marketing fluff. Throw away deprecated code.

Output a highly technical "Research Report" in Markdown format. This report will be injected directly into the Coder Agent's brain.
Structure:
# Key Discoveries
# Modern Approach / Best Practices
# Code Snippets (Highly important)
# Potential Pitfalls`;
    }

    async execute(specification, userPrompt, framework) {
        this.log('info', 'Activating Autonomous R&D Swarm...');
        const uiLog = (message, type = 'info') => {
            if (framework) framework.emit('log', { type, message });
        };
        
        let tavilyApiKey = '';
        try {
            tavilyApiKey = localStorage.getItem('zb_tavily_key') || '';
        } catch(e) {}

        if (!tavilyApiKey) {
            this.log('warning', 'Tavily API Key missing. Skipping Web Research. (Add in Settings for 1000 free requests).');
            return null;
        }

        const message = `USER PROMPT: ${userPrompt}\n\nSPECIFICATION:\n${JSON.stringify(specification, null, 2)}`;
        
        this.log('info', 'Decomposing project into research vectors...');
        uiLog('R&D Swarm: analyzing project specification...');

        const analysisResponse = await this.callLLM(message, this.queryPrompt, { temperature: 0.2, maxTokens: 8192 });
        let analysis;
        try {
            analysis = this.parseJSON(analysisResponse);
        } catch (e) {
            this.log('warning', 'Failed to parse research queries. Skipping research.');
            return null;
        }

        if (!analysis.needsResearch || !analysis.queries || analysis.queries.length === 0) {
            this.log('success', 'Standard technologies detected. No deep research required.');
            uiLog('R&D Swarm: standard stack detected. Bypassing web search.', 'success');
            return null;
        }

        this.log('info', `Swarm launched. Queries: ${analysis.queries.join(' | ')}`);
        uiLog('R&D Swarm: launching search threads...');
        
        const searchResults = [];
        for (const query of analysis.queries) {
            uiLog(`Research thread "${query}": searching Tavily...`);
            try {
                const result = await this._searchTavily(query, tavilyApiKey);
                searchResults.push({ query, data: result });
                uiLog(`Research thread "${query}": retrieved ${result.results?.length || 0} source(s).`, 'success');
            } catch (err) {
                this.log('error', `Search failed for "${query}": ${err.message}`);
                uiLog(`Research thread "${query}": ${err.message}`, 'error');
            }
        }

        if (searchResults.length === 0) {
            return null;
        }

        this.log('info', 'Synthesizing global data into Knowledge Base...');
        uiLog('R&D Swarm: synthesizing source data into a build brief...');

        const synthesisMessage = `SEARCH RESULTS:\n${JSON.stringify(searchResults, null, 2)}`;
        const report = await this.callLLM(synthesisMessage, this.synthesisPrompt, { temperature: 0.5, maxTokens: 16384 });
        
        this.log('success', 'Research Knowledge Base generated.');
        uiLog('R&D Swarm: knowledge base ready for coder agents.', 'success');
        
        return report;
    }

    async _searchTavily(query, apiKey) {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "advanced",
                include_answer: true,
                include_raw_content: true,
                max_results: 3
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    }
}

// Export globally
if (window.BaseAgent) {
    window.ResearcherAgent = ResearcherAgent;
}

;
/* Zero-Builder Max: autonomous brand strategy stage. */
class BrandStrategistAgent extends BaseAgent {
    constructor() {
        super('BrandStrategist', 'Creates brand positioning, copy, and art direction');

        this.config = {
            temperature: 0.38,
            maxTokens: 8192,
            researchMaxChars: 12000,
            maxMotifs: 3,
            maxMotionTreatments: 3,
            maxChecklistItems: 10,
        };

        this.systemPrompt = `You are a decisive brand strategist + creative director for Awwwards-level digital products.

Goal: prevent generic AI website output and give engineers a sharp brief for marketing pages AND product UI.

Never default to purple SaaS gradients, fake stats, random 3D, recovery shells, or filler like "The future of".

Return ONLY JSON:
{
  "brand": {"name":"","audience":"","positioning":"","category":""},
  "copy": {"eyebrow":"","headline":"","subhead":"","primaryCta":"","secondaryCta":"","proofLine":""},
  "voice": {"tone":"","wordsToUse":[],"wordsToAvoid":[]},
  "artDirection": {
    "concept":"",
    "heroComposition":"",
    "visualMotifs":[],
    "motionPlan":[],
    "avoid":[]
  },
  "sectionNarrative": ["ordered story beats for the site/app"],
  "productUX": {
    "primaryJobToBeDone":"",
    "keyScreens":[],
    "emptyStateCopy":"",
    "successStateCopy":""
  },
  "qualityChecklist": ["pass/fail checks for premium craft"]
}

Rules:
- At most 3 visual motifs and 3 motion treatments
- Copy must be specific to the category and offer
- productUX is required when the brief is an app/dashboard/SaaS
- qualityChecklist must include anti-template checks
- Avoid generic marketing phrasing, filler slogans, and fake proof
- Make assumptions only when needed, and keep them conservative`.trim();
    }

    detectBriefType(specification = {}, userPrompt = '') {
        const blob = `${userPrompt}\n${JSON.stringify(specification || {})}`.toLowerCase();

        const isProduct = /app|dashboard|saas|platform|workflow|tool|software|product/i.test(blob);
        const isMarketing = /landing|website|brand|campaign|site|homepage|hero|marketing/i.test(blob);

        const categoryHints = [
            ['fintech', /bank|finance|fintech|payment|wallet|card|invoice|billing|subscription/],
            ['health', /health|medical|wellness|fitness|clinic|therapy|mindfulness/],
            ['ecommerce', /shop|store|commerce|marketplace|catalog|checkout|product page/],
            ['ai', /ai|assistant|copilot|agent|automation|workflow intelligence/],
            ['creators', /creator|studio|design|content|portfolio|agency/],
            ['education', /course|learn|education|academy|student|teach/],
            ['developer', /devtools|developer|api|cli|sdk|docs|infrastructure/],
            ['real-estate', /real estate|property|listing|broker|home/],
            ['travel', /travel|trip|booking|hotel|flight|itinerary/],
        ];

        let category = 'general';
        for (const [name, pattern] of categoryHints) {
            if (pattern.test(blob)) {
                category = name;
                break;
            }
        }

        return {
            isProduct,
            isMarketing,
            category,
            briefMode: isProduct ? 'product' : isMarketing ? 'marketing' : 'hybrid',
        };
    }

    buildPrompt(userPrompt, specification, researchReport = null) {
        const research = researchReport
            ? `\n\nRESEARCH REPORT (use only relevant findings):\n${String(researchReport).slice(0, this.config.researchMaxChars)}`
            : '';

        const briefType = this.detectBriefType(specification, userPrompt);

        return `
USER REQUEST:
${userPrompt}

PLANNER SPEC:
${JSON.stringify(specification || {}, null, 2)}

BRIEF TYPE:
${JSON.stringify(briefType, null, 2)}
${research}

Create a premium, non-generic brand strategy now.

Return valid JSON only. No markdown. No commentary. No code fences.
        `.trim();
    }

    safeArray(value, max = Infinity) {
        if (!Array.isArray(value)) return [];
        return value
            .map(item => String(item ?? '').trim())
            .filter(Boolean)
            .slice(0, max);
    }

    safeString(value, fallback = '') {
        const text = String(value ?? '').trim();
        return text || fallback;
    }

    normalizeBrief(brief = {}, specification = {}, userPrompt = '') {
        const briefType = this.detectBriefType(specification, userPrompt);
        const category = this.safeString(brief?.brand?.category, briefType.category || 'general');

        const normalized = {
            brand: {
                name: this.safeString(brief?.brand?.name, specification?.title || specification?.name || ''),
                audience: this.safeString(brief?.brand?.audience, ''),
                positioning: this.safeString(brief?.brand?.positioning, ''),
                category,
            },
            copy: {
                eyebrow: this.safeString(brief?.copy?.eyebrow, ''),
                headline: this.safeString(brief?.copy?.headline, ''),
                subhead: this.safeString(brief?.copy?.subhead, ''),
                primaryCta: this.safeString(brief?.copy?.primaryCta, ''),
                secondaryCta: this.safeString(brief?.copy?.secondaryCta, ''),
                proofLine: this.safeString(brief?.copy?.proofLine, ''),
            },
            voice: {
                tone: this.safeString(brief?.voice?.tone, ''),
                wordsToUse: this.safeArray(brief?.voice?.wordsToUse, 10),
                wordsToAvoid: this.safeArray(brief?.voice?.wordsToAvoid, 10),
            },
            artDirection: {
                concept: this.safeString(brief?.artDirection?.concept, ''),
                heroComposition: this.safeString(brief?.artDirection?.heroComposition, ''),
                visualMotifs: this.safeArray(brief?.artDirection?.visualMotifs, this.config.maxMotifs),
                motionPlan: this.safeArray(brief?.artDirection?.motionPlan, this.config.maxMotionTreatments),
                avoid: this.safeArray(brief?.artDirection?.avoid, 10),
            },
            sectionNarrative: this.safeArray(brief?.sectionNarrative, 12),
            productUX: {
                primaryJobToBeDone: this.safeString(brief?.productUX?.primaryJobToBeDone, ''),
                keyScreens: this.safeArray(brief?.productUX?.keyScreens, 12),
                emptyStateCopy: this.safeString(brief?.productUX?.emptyStateCopy, ''),
                successStateCopy: this.safeString(brief?.productUX?.successStateCopy, ''),
            },
            qualityChecklist: this.safeArray(brief?.qualityChecklist, this.config.maxChecklistItems),
        };

        const isProductBrief = briefType.isProduct;
        const defaultAvoid = [
            'purple SaaS gradients',
            'fake metrics',
            'generic bento filler',
            'stock-like AI chrome',
            'vague futuristic copy',
        ];

        if (!normalized.artDirection.avoid.length) {
            normalized.artDirection.avoid = defaultAvoid;
        } else {
            normalized.artDirection.avoid = Array.from(new Set([...normalized.artDirection.avoid, ...defaultAvoid])).slice(0, 10);
        }

        if (!normalized.qualityChecklist.length) {
            normalized.qualityChecklist = [
                'Distinctive hero composition',
                'No fake vanity metrics',
                'Category-specific proof',
                'No recovery-shell layout',
                'No generic SaaS gradients',
                'Tight copy that matches the offer',
                'Visual system feels owned, not templated',
            ];
        } else {
            normalized.qualityChecklist = Array.from(new Set([
                ...normalized.qualityChecklist,
                'No fake vanity metrics',
                'No generic SaaS gradients',
                'No recovery-shell layout',
                'Category-specific proof',
            ])).slice(0, this.config.maxChecklistItems);
        }

        if (isProduct) {
            normalized.productUX = {
                primaryJobToBeDone: this.safeString(normalized.productUX.primaryJobToBeDone, this.safeString(specification?.goal, '')),
                keyScreens: normalized.productUX.keyScreens.length
                    ? normalized.productUX.keyScreens
                    : ['Onboarding', 'Core workflow', 'Empty state', 'Success state'],
                emptyStateCopy: this.safeString(
                    normalized.productUX.emptyStateCopy,
                    'Nothing here yet — start with your first action.'
                ),
                successStateCopy: this.safeString(
                    normalized.productUX.successStateCopy,
                    'Done. Your workspace is ready.'
                ),
            };
        } else if (!normalized.productUX.primaryJobToBeDone) {
            normalized.productUX = {
                primaryJobToBeDone: '',
                keyScreens: [],
                emptyStateCopy: '',
                successStateCopy: '',
            };
        }

        if (!normalized.copy.headline && normalized.brand.name) {
            normalized.copy.headline = normalized.brand.name;
        }

        return normalized;
    }

    validateBrief(brief = {}, specification = {}, userPrompt = '') {
        const fallback = this.normalizeBrief({}, specification, userPrompt);
        const merged = this.normalizeBrief(brief, specification, userPrompt);

        return {
            brand: { ...fallback.brand, ...merged.brand },
            copy: { ...fallback.copy, ...merged.copy },
            voice: { ...fallback.voice, ...merged.voice },
            artDirection: {
                ...fallback.artDirection,
                ...merged.artDirection,
                visualMotifs: merged.artDirection.visualMotifs.slice(0, this.config.maxMotifs),
                motionPlan: merged.artDirection.motionPlan.slice(0, this.config.maxMotionTreatments),
            },
            sectionNarrative: merged.sectionNarrative.length ? merged.sectionNarrative : fallback.sectionNarrative,
            productUX: { ...fallback.productUX, ...merged.productUX },
            qualityChecklist: merged.qualityChecklist.length ? merged.qualityChecklist : fallback.qualityChecklist,
        };
    }

    async execute(userPrompt, specification, researchReport = null) {
        this.log('info', 'Brand Strategist locking creative + product brief...');

        const prompt = this.buildPrompt(userPrompt, specification, researchReport);

        let response;
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Brand Strategist LLM call failed: ${error.message}`);
            return this.normalizeBrief({}, specification, userPrompt);
        }

        let parsed;
        try {
            parsed = this.parseJSON(response);
        } catch (error) {
            this.log('warning', `Brand Strategist JSON parse failed: ${error.message}`);
            parsed = {};
        }

        const brief = this.validateBrief(parsed, specification, userPrompt);
        this.log('success', `Brand locked: ${brief.brand.name || specification?.title || 'Untitled'}`);
        return brief;
    }
}

window.BrandStrategistAgent = BrandStrategistAgent;
;
/* ============================================================
   DESIGNER AGENT V3 — Advanced Design Philosophy Engine
   Supports: Skeuomorphism, Neomorphism, Glassmorphism, Claymorphism,
   Minimalism, Maximalism, Brutalism, Liquid Glass, Spatial UI
   With: 3D Scroll, 3D Backgrounds, 3D Windows, Advanced Animations,
   Hover Effects, Smooth Loaders, Entrance Reveals, Micro Interactions,
   Parallax Effects, and Cinematic Motion Systems
   ============================================================ */

class DesignerAgent extends BaseAgent {
  constructor() {
    super('Designer', 'Creates advanced design systems with 9 design philosophies, 3D effects, and cinematic motion');

    /* ════════════════════════════════════════════════════════════
       DESIGN PHILOSOPHIES — Complete CSS for each style
       ════════════════════════════════════════════════════════════ */
    this.designPhilosophies = {
      skeuomorphism: {
        name: 'Skeuomorphism',
        description: 'Realistic textures, embossed surfaces, physical material simulation',
        bestFor: ['music-app', 'calculator', 'notepad', 'vintage', 'retro', 'classic', 'realistic'],
        characteristics: ['textured-backgrounds', 'embossed-text', 'realistic-shadows', 'gradient-surfaces', 'physical-buttons'],
        css: `/* ═══ SKEUOMORPHISM DESIGN SYSTEM ═══ */
.skeu-surface{background:linear-gradient(145deg,#e6e9ef,#c3c8d0);border-radius:12px;box-shadow:8px 8px 16px rgba(0,0,0,0.25),-8px -8px 16px rgba(255,255,255,0.6),inset 0 1px 0 rgba(255,255,255,0.8),inset 0 -1px 0 rgba(0,0,0,0.1);border:1px solid rgba(255,255,255,0.4)}
.skeu-button{background:linear-gradient(180deg,#f7f8fa 0%,#d4d8de 50%,#c0c5cc 100%);border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.3),inset 0 2px 0 rgba(255,255,255,0.7),inset 0 -2px 4px rgba(0,0,0,0.1);border:1px solid rgba(0,0,0,0.15);text-shadow:0 1px 0 rgba(255,255,255,0.8);padding:12px 24px;cursor:pointer;transition:all 0.15s ease}
.skeu-button:active{box-shadow:0 1px 2px rgba(0,0,0,0.3),inset 0 2px 6px rgba(0,0,0,0.2);transform:translateY(1px)}
.skeu-input{background:linear-gradient(180deg,#d8dbe1 0%,#eef0f3 8%,#fff 100%);border-radius:8px;box-shadow:inset 0 2px 6px rgba(0,0,0,0.15),inset 0 1px 2px rgba(0,0,0,0.1),0 1px 0 rgba(255,255,255,0.8);border:1px solid rgba(0,0,0,0.2);padding:10px 14px}
.skeu-card{background:linear-gradient(145deg,#eceff3,#d4d8de);border-radius:16px;box-shadow:10px 10px 20px rgba(0,0,0,0.2),-5px -5px 15px rgba(255,255,255,0.5),inset 0 1px 0 rgba(255,255,255,0.6);padding:24px;border:1px solid rgba(255,255,255,0.3)}
.skeu-toggle{width:60px;height:30px;border-radius:15px;background:linear-gradient(180deg,#a8adb5,#c8cdd5);box-shadow:inset 0 2px 6px rgba(0,0,0,0.3),0 1px 0 rgba(255,255,255,0.5);position:relative;cursor:pointer}
.skeu-toggle::after{content:'';width:26px;height:26px;border-radius:50%;background:linear-gradient(180deg,#fff,#ddd);box-shadow:0 2px 4px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.8);position:absolute;top:2px;left:2px;transition:transform 0.3s ease}
.skeu-toggle.active{background:linear-gradient(180deg,#4a90d9,#357abd)}.skeu-toggle.active::after{transform:translateX(30px)}
.skeu-knob{width:80px;height:80px;border-radius:50%;background:conic-gradient(from 0deg,#ccc,#fff,#ccc,#999,#ccc);box-shadow:0 4px 12px rgba(0,0,0,0.3),inset 0 2px 4px rgba(255,255,255,0.5)}`,
        compatibleAnimations: ['hover-depth', 'press-feedback', 'smooth-loader', 'entrance-slide']
      },

      neomorphism: {
        name: 'Neomorphism',
        description: 'Soft, extruded UI with dual-shadow technique',
        bestFor: ['music', 'calculator', 'settings', 'controls', 'player', 'smart-home', 'neumorphic'],
        characteristics: ['soft-shadows', 'extruded-shapes', 'subtle-depth', 'monochromatic', 'minimal-borders'],
        css: `/* ═══ NEOMORPHISM DESIGN SYSTEM ═══ */
:root{--neo-bg:#e0e5ec;--neo-shadow-dark:rgba(163,177,198,0.6);--neo-shadow-light:rgba(255,255,255,0.8);--neo-radius:16px;--neo-distance:6px;--neo-blur:12px;--neo-dark-bg:#2d3436;--neo-dark-shadow-dark:rgba(0,0,0,0.5);--neo-dark-shadow-light:rgba(70,75,80,0.4)}
.neo-flat{background:var(--neo-bg);border-radius:var(--neo-radius);box-shadow:var(--neo-distance) var(--neo-distance) var(--neo-blur) var(--neo-shadow-dark),calc(-1 * var(--neo-distance)) calc(-1 * var(--neo-distance)) var(--neo-blur) var(--neo-shadow-light)}
.neo-pressed{background:var(--neo-bg);border-radius:var(--neo-radius);box-shadow:inset var(--neo-distance) var(--neo-distance) var(--neo-blur) var(--neo-shadow-dark),inset calc(-1 * var(--neo-distance)) calc(-1 * var(--neo-distance)) var(--neo-blur) var(--neo-shadow-light)}
.neo-concave{background:linear-gradient(145deg,rgba(0,0,0,0.05),rgba(255,255,255,0.1));border-radius:var(--neo-radius);box-shadow:var(--neo-distance) var(--neo-distance) var(--neo-blur) var(--neo-shadow-dark),calc(-1 * var(--neo-distance)) calc(-1 * var(--neo-distance)) var(--neo-blur) var(--neo-shadow-light)}
.neo-convex{background:linear-gradient(145deg,rgba(255,255,255,0.15),rgba(0,0,0,0.05));border-radius:var(--neo-radius);box-shadow:var(--neo-distance) var(--neo-distance) var(--neo-blur) var(--neo-shadow-dark),calc(-1 * var(--neo-distance)) calc(-1 * var(--neo-distance)) var(--neo-blur) var(--neo-shadow-light)}
.neo-button{background:var(--neo-bg);border:none;border-radius:var(--neo-radius);padding:14px 28px;box-shadow:var(--neo-distance) var(--neo-distance) var(--neo-blur) var(--neo-shadow-dark),calc(-1 * var(--neo-distance)) calc(-1 * var(--neo-distance)) var(--neo-blur) var(--neo-shadow-light);cursor:pointer;transition:all 0.2s ease;font-weight:600}
.neo-button:hover{box-shadow:calc(var(--neo-distance) + 2px) calc(var(--neo-distance) + 2px) calc(var(--neo-blur) + 4px) var(--neo-shadow-dark),calc(-1 * (var(--neo-distance) + 2px)) calc(-1 * (var(--neo-distance) + 2px)) calc(var(--neo-blur) + 4px) var(--neo-shadow-light)}
.neo-button:active,.neo-button.pressed{box-shadow:inset var(--neo-distance) var(--neo-distance) var(--neo-blur) var(--neo-shadow-dark),inset calc(-1 * var(--neo-distance)) calc(-1 * var(--neo-distance)) var(--neo-blur) var(--neo-shadow-light)}
.neo-circle{border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center}
.neo-input{background:var(--neo-bg);border:none;border-radius:var(--neo-radius);padding:12px 18px;box-shadow:inset 3px 3px 6px var(--neo-shadow-dark),inset -3px -3px 6px var(--neo-shadow-light);outline:none}
.neo-input:focus{box-shadow:inset 4px 4px 8px var(--neo-shadow-dark),inset -4px -4px 8px var(--neo-shadow-light)}
.neo-card{padding:24px;background:var(--neo-bg);border-radius:20px;box-shadow:8px 8px 16px var(--neo-shadow-dark),-8px -8px 16px var(--neo-shadow-light)}
.neo-progress{height:8px;border-radius:4px;box-shadow:inset 2px 2px 4px var(--neo-shadow-dark),inset -2px -2px 4px var(--neo-shadow-light);overflow:hidden}
.neo-progress-bar{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--color-primary),var(--color-accent));transition:width 0.6s ease}
.neo-slider{-webkit-appearance:none;width:100%;height:8px;border-radius:4px;background:var(--neo-bg);box-shadow:inset 2px 2px 4px var(--neo-shadow-dark),inset -2px -2px 4px var(--neo-shadow-light)}
.neo-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:var(--neo-bg);box-shadow:3px 3px 6px var(--neo-shadow-dark),-3px -3px 6px var(--neo-shadow-light);cursor:pointer}`,
        compatibleAnimations: ['hover-lift', 'press-morph', 'smooth-loader', 'entrance-fade']
      },

      glassmorphism: {
        name: 'Glassmorphism',
        description: 'Frosted glass panels with blur, transparency, and light refraction',
        bestFor: ['dashboard', 'saas', 'landing', 'fintech', 'crypto', 'modern', 'glass', 'transparent'],
        characteristics: ['backdrop-blur', 'transparency', 'gradient-borders', 'light-refraction', 'depth-layers'],
        css: `/* ═══ GLASSMORPHISM DESIGN SYSTEM ═══ */
.glass{background:rgba(255,255,255,0.08);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12)}
.glass-strong{background:rgba(255,255,255,0.15);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.2);border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,0.15)}
.glass-dark{background:rgba(0,0,0,0.3);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.08);border-radius:16px}
.glass-card{background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px;position:relative;overflow:hidden}
.glass-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)}
.glass-navbar{background:rgba(255,255,255,0.05);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border-bottom:1px solid rgba(255,255,255,0.06);position:fixed;top:0;left:0;right:0;z-index:1000}
.glass-button{background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:12px 28px;color:white;cursor:pointer;transition:all 0.3s ease}
.glass-button:hover{background:rgba(255,255,255,0.18);border-color:rgba(255,255,255,0.3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2)}
.glass-input{background:rgba(255,255,255,0.05);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 16px;color:white;outline:none;transition:border-color 0.3s ease}
.glass-input:focus{border-color:rgba(255,255,255,0.3);box-shadow:0 0 20px rgba(255,255,255,0.05)}
.glass-gradient-border{position:relative;border-radius:20px;overflow:hidden}
.glass-gradient-border::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:linear-gradient(135deg,rgba(255,255,255,0.4),rgba(255,255,255,0),rgba(255,255,255,0.15));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.glass-glow{box-shadow:0 0 40px rgba(var(--color-primary-rgb,99,102,241),0.15),0 0 80px rgba(var(--color-primary-rgb,99,102,241),0.05)}
.glass-shimmer{position:relative;overflow:hidden}.glass-shimmer::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 30%,rgba(255,255,255,0.05) 50%,transparent 70%);animation:glassShimmer 6s ease-in-out infinite}
@keyframes glassShimmer{0%,100%{transform:translateX(-100%) rotate(45deg)}50%{transform:translateX(100%) rotate(45deg)}}`,
        compatibleAnimations: ['hover-glow', 'entrance-blur', '3d-tilt', 'parallax-depth', 'smooth-loader']
      },

      claymorphism: {
        name: 'Claymorphism',
        description: 'Soft, rounded, 3D clay-like surfaces with playful depth',
        bestFor: ['kids', 'education', 'creative', 'toy', 'fun', 'playful', 'cartoon', 'clay', '3d-soft'],
        characteristics: ['rounded-shapes', 'pastel-colors', 'soft-3d-shadows', 'inflated-surfaces', 'playful-depth'],
        css: `/* ═══ CLAYMORPHISM DESIGN SYSTEM ═══ */
.clay{background:linear-gradient(145deg,rgba(255,255,255,0.5),rgba(255,255,255,0.1));border-radius:24px;box-shadow:12px 12px 24px rgba(0,0,0,0.08),-6px -6px 12px rgba(255,255,255,0.8),inset -4px -4px 8px rgba(0,0,0,0.04),inset 4px 4px 8px rgba(255,255,255,0.6);border:2px solid rgba(255,255,255,0.5)}
.clay-card{background:linear-gradient(145deg,#fef3f3,#ffe8e8);border-radius:28px;box-shadow:15px 15px 30px rgba(0,0,0,0.08),-8px -8px 16px rgba(255,255,255,0.9),inset -3px -3px 6px rgba(0,0,0,0.03),inset 3px 3px 6px rgba(255,255,255,0.7);padding:28px;border:2px solid rgba(255,255,255,0.6)}
.clay-button{background:linear-gradient(145deg,#a8e6cf,#88d8b0);border-radius:18px;box-shadow:8px 8px 16px rgba(0,0,0,0.1),-4px -4px 8px rgba(255,255,255,0.7),inset -2px -2px 4px rgba(0,0,0,0.05),inset 2px 2px 4px rgba(255,255,255,0.5);border:2px solid rgba(255,255,255,0.4);padding:14px 32px;cursor:pointer;font-weight:700;transition:all 0.3s ease}
.clay-button:hover{transform:translateY(-3px) scale(1.02);box-shadow:12px 12px 24px rgba(0,0,0,0.12),-6px -6px 12px rgba(255,255,255,0.8)}
.clay-button:active{transform:translateY(1px) scale(0.98);box-shadow:4px 4px 8px rgba(0,0,0,0.08),inset 3px 3px 6px rgba(0,0,0,0.08)}
.clay-bubble{border-radius:50%;background:linear-gradient(145deg,rgba(255,255,255,0.6),rgba(255,255,255,0.1));box-shadow:10px 10px 20px rgba(0,0,0,0.08),-5px -5px 10px rgba(255,255,255,0.9),inset -3px -3px 6px rgba(0,0,0,0.03),inset 3px 3px 6px rgba(255,255,255,0.6)}
.clay-input{background:linear-gradient(145deg,#fff,#f0f0f5);border-radius:16px;box-shadow:inset 4px 4px 8px rgba(0,0,0,0.06),inset -2px -2px 4px rgba(255,255,255,0.8);border:2px solid rgba(255,255,255,0.5);padding:14px 20px}
.clay-tag{display:inline-block;padding:6px 16px;border-radius:50px;background:linear-gradient(145deg,#ddd6fe,#c4b5fd);box-shadow:4px 4px 8px rgba(0,0,0,0.06),-2px -2px 4px rgba(255,255,255,0.8),inset -1px -1px 2px rgba(0,0,0,0.03),inset 1px 1px 2px rgba(255,255,255,0.5);font-size:0.8rem;font-weight:600}
.clay-avatar{width:64px;height:64px;border-radius:50%;background:linear-gradient(145deg,#fbbf24,#f59e0b);box-shadow:8px 8px 16px rgba(0,0,0,0.1),-4px -4px 8px rgba(255,255,255,0.7),inset -2px -2px 4px rgba(0,0,0,0.05),inset 2px 2px 4px rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.5rem}`,
        compatibleAnimations: ['hover-bounce', 'entrance-pop', 'micro-squish', '3d-wobble', 'smooth-loader']
      },

      minimalism: {
        name: 'Minimalism',
        description: 'Maximum whitespace, restrained palette, essential-only elements',
        bestFor: ['portfolio', 'agency', 'gallery', 'blog', 'minimal', 'clean', 'zen', 'simple', 'editorial'],
        characteristics: ['generous-whitespace', 'limited-palette', 'refined-typography', 'subtle-borders', 'essential-elements'],
        css: `/* ═══ MINIMALISM DESIGN SYSTEM ═══ */
.min-surface{background:transparent;border-bottom:1px solid rgba(0,0,0,0.06)}
.min-card{background:transparent;padding:40px 0;border-bottom:1px solid rgba(0,0,0,0.06);transition:padding 0.4s ease}
.min-card:hover{padding-left:12px}
.min-button{background:transparent;border:1.5px solid currentColor;border-radius:0;padding:14px 36px;font-size:0.85rem;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;position:relative;overflow:hidden;transition:color 0.4s ease}
.min-button::before{content:'';position:absolute;bottom:0;left:0;width:100%;height:0;background:currentColor;transition:height 0.4s cubic-bezier(0.65,0,0.35,1);z-index:-1}
.min-button:hover{color:white}.min-button:hover::before{height:100%}
.min-button-text{background:none;border:none;padding:0;font-size:0.9rem;cursor:pointer;position:relative;color:inherit}.min-button-text::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:1px;background:currentColor;transform:scaleX(0);transform-origin:right;transition:transform 0.4s cubic-bezier(0.65,0,0.35,1)}.min-button-text:hover::after{transform:scaleX(1);transform-origin:left}
.min-input{background:transparent;border:none;border-bottom:1px solid rgba(0,0,0,0.15);padding:12px 0;font-size:1rem;outline:none;transition:border-color 0.3s ease;width:100%}.min-input:focus{border-bottom-color:currentColor}
.min-divider{width:40px;height:1px;background:currentColor;opacity:0.3;margin:2rem 0}
.min-grid{display:grid;gap:1px;background:rgba(0,0,0,0.06)}.min-grid>*{background:var(--color-bg);padding:40px}
.min-tag{font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.5}
.min-quote{font-size:clamp(1.5rem,4vw,3rem);font-style:italic;line-height:1.4;max-width:28ch}`,
        compatibleAnimations: ['entrance-fade', 'hover-underline', 'micro-subtle', 'parallax-gentle']
      },

      maximalism: {
        name: 'Maximalism',
        description: 'Bold, layered, vibrant, decorative excess with purposeful energy',
        bestFor: ['fashion', 'art', 'music', 'festival', 'creative', 'bold', 'vibrant', 'colorful', 'maximal'],
        characteristics: ['bold-colors', 'layered-textures', 'mixed-typography', 'decorative-elements', 'visual-density'],
        css: `/* ═══ MAXIMALISM DESIGN SYSTEM ═══ */
.max-surface{background:linear-gradient(135deg,#ff006e,#8338ec,#3a86ff);position:relative;overflow:hidden}
.max-surface::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
.max-card{background:linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05));border:3px solid rgba(255,255,255,0.2);border-radius:24px;padding:32px;position:relative;overflow:hidden;backdrop-filter:blur(10px)}
.max-card::before{content:'';position:absolute;top:-50%;right:-50%;width:100%;height:100%;background:radial-gradient(circle,rgba(255,0,110,0.15) 0%,transparent 70%);pointer-events:none}
.max-button{background:linear-gradient(135deg,#ff006e,#fb5607);border:none;border-radius:100px;padding:16px 40px;color:white;font-weight:800;font-size:1.1rem;letter-spacing:0.02em;cursor:pointer;position:relative;overflow:hidden;transition:transform 0.3s ease,box-shadow 0.3s ease}
.max-button::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#fb5607,#ffbe0b);opacity:0;transition:opacity 0.3s ease}
.max-button:hover{transform:translateY(-3px) rotate(-1deg);box-shadow:0 12px 40px rgba(255,0,110,0.4)}.max-button:hover::before{opacity:1}
.max-button span{position:relative;z-index:1}
.max-text-gradient{background:linear-gradient(135deg,#ff006e,#fb5607,#ffbe0b,#8338ec,#3a86ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.max-sticker{display:inline-block;padding:8px 20px;border-radius:100px;background:#ffbe0b;color:#000;font-weight:800;transform:rotate(-3deg);box-shadow:4px 4px 0 #ff006e}
.max-blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.4;animation:maxBlobFloat 8s ease-in-out infinite alternate;pointer-events:none}
.max-blob-1{width:400px;height:400px;background:#ff006e;top:-10%;left:-10%}
.max-blob-2{width:350px;height:350px;background:#3a86ff;bottom:-10%;right:-10%;animation-delay:-4s}
.max-blob-3{width:300px;height:300px;background:#8338ec;top:40%;left:50%;animation-delay:-2s}
@keyframes maxBlobFloat{0%{transform:translate(0,0) scale(1)}100%{transform:translate(30px,-30px) scale(1.1)}}
.max-marquee{overflow:hidden;white-space:nowrap}.max-marquee-inner{display:inline-flex;animation:maxMarquee 20s linear infinite}
@keyframes maxMarquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`,
        compatibleAnimations: ['hover-explode', 'entrance-pop', '3d-flip', 'parallax-intense', 'micro-bounce']
      },

      brutalism: {
        name: 'Brutalism',
        description: 'Raw, chunky, high-contrast, exposed structure, anti-design',
        bestFor: ['art', 'punk', 'experimental', 'avant-garde', 'brutal', 'raw', 'grunge', 'underground'],
        characteristics: ['thick-borders', 'monospace-type', 'high-contrast', 'raw-surfaces', 'exposed-structure'],
        css: `/* ═══ BRUTALISM DESIGN SYSTEM ═══ */
.brutal-surface{background:#fff;border:3px solid #000;box-shadow:8px 8px 0 #000}
.brutal-card{background:#fff;border:3px solid #000;padding:24px;box-shadow:8px 8px 0 #000;position:relative;transition:all 0.2s ease}
.brutal-card:hover{transform:translate(-4px,-4px);box-shadow:12px 12px 0 #000}
.brutal-button{background:#000;color:#fff;border:3px solid #000;padding:14px 32px;font-family:'Space Mono','Courier New',monospace;font-weight:700;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;box-shadow:4px 4px 0 #000;transition:all 0.15s ease;position:relative}
.brutal-button:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #000}
.brutal-button:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #000}
.brutal-button-outline{background:#fff;color:#000;border:3px solid #000;padding:14px 32px;font-family:'Space Mono',monospace;font-weight:700;box-shadow:4px 4px 0 #000;cursor:pointer;transition:all 0.15s ease}
.brutal-button-outline:hover{background:#ff0;transform:translate(-2px,-2px);box-shadow:6px 6px 0 #000}
.brutal-input{background:#fff;border:3px solid #000;padding:12px 16px;font-family:'Space Mono',monospace;font-size:1rem;outline:none}
.brutal-input:focus{box-shadow:inset 0 0 0 2px #000;background:#ffd}
.brutal-tag{display:inline-block;padding:4px 12px;border:2px solid #000;font-family:'Space Mono',monospace;font-size:0.75rem;text-transform:uppercase;font-weight:700}
.brutal-divider{height:3px;background:#000;border:none;margin:2rem 0}
.brutal-marquee{overflow:hidden;border-top:3px solid #000;border-bottom:3px solid #000;padding:12px 0;font-family:'Space Mono',monospace;font-weight:700;font-size:1.5rem;text-transform:uppercase}
.brutal-grid{display:grid;gap:3px;background:#000}.brutal-grid>*{background:#fff;padding:24px}
.brutal-highlight{background:#ff0;padding:2px 6px;font-weight:700}
.brutal-stamp{display:inline-block;border:4px solid #ff0000;color:#ff0000;padding:8px 16px;font-weight:900;text-transform:uppercase;transform:rotate(-5deg);letter-spacing:0.1em}`,
        compatibleAnimations: ['hover-shake', 'entrance-glitch', 'micro-snap', '3d-shift']
      },

      liquidglass: {
        name: 'Liquid Glass',
        description: 'Apple-style premium frosted glass with specular highlights and refraction',
        bestFor: ['tech', 'apple', 'premium', 'luxury', 'fintech', 'startup', 'modern', 'sleek', 'ios', 'visionpro'],
        characteristics: ['deep-blur', 'specular-highlights', 'gradient-borders', 'refraction-effects', 'luminosity-blend'],
        css: `/* ═══ LIQUID GLASS DESIGN SYSTEM ═══ */
.liquid-glass{background:rgba(255,255,255,0.01);background-blend-mode:luminosity;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:none;box-shadow:inset 0 1px 1px rgba(255,255,255,0.1);position:relative;overflow:hidden;border-radius:16px}
.liquid-glass::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.4px;background:linear-gradient(180deg,rgba(255,255,255,0.45) 0%,rgba(255,255,255,0.15) 20%,rgba(255,255,255,0) 40%,rgba(255,255,255,0) 60%,rgba(255,255,255,0.15) 80%,rgba(255,255,255,0.45) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.liquid-glass-strong{background:rgba(255,255,255,0.03);backdrop-filter:blur(50px);-webkit-backdrop-filter:blur(50px);box-shadow:4px 4px 4px rgba(0,0,0,0.05),inset 0 1px 1px rgba(255,255,255,0.15);border-radius:20px;position:relative;overflow:hidden}
.liquid-glass-strong::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.4px;background:linear-gradient(180deg,rgba(255,255,255,0.5) 0%,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0) 50%,rgba(255,255,255,0.15) 75%,rgba(255,255,255,0.5) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.liquid-glass-tint{background:rgba(255,255,255,0.02);background-blend-mode:luminosity;backdrop-filter:blur(60px) saturate(1.8);-webkit-backdrop-filter:blur(60px) saturate(1.8);border-radius:24px;box-shadow:inset 0 1px 1px rgba(255,255,255,0.12),0 4px 24px rgba(0,0,0,0.08);position:relative;overflow:hidden}
.liquid-glass-button{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:none;border-radius:14px;padding:12px 28px;color:rgba(255,255,255,0.9);cursor:pointer;position:relative;overflow:hidden;transition:all 0.3s ease}
.liquid-glass-button::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.05));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.liquid-glass-button:hover{background:rgba(255,255,255,0.1);transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,0.1)}
.liquid-glass-nav{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.02);backdrop-filter:blur(40px) saturate(1.5);-webkit-backdrop-filter:blur(40px) saturate(1.5);border-radius:100px;padding:6px;z-index:1000;position:relative;overflow:hidden}
.liquid-glass-nav::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0.1));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.liquid-glass-specular{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(ellipse at 30% 20%,rgba(255,255,255,0.08),transparent 60%);pointer-events:none}`,
        compatibleAnimations: ['hover-glow', 'entrance-blur', 'parallax-depth', '3d-tilt', 'shimmer-sweep']
      },

      spatialui: {
        name: 'Spatial UI',
        description: '3D depth layers, perspective transforms, z-space navigation, AR/VR inspired',
        bestFor: ['vr', 'ar', 'metaverse', '3d', 'spatial', 'immersive', 'futuristic', 'sci-fi', 'gaming', 'tech-future'],
        characteristics: ['perspective-depth', 'z-layers', 'depth-cards', 'spatial-navigation', '3d-transforms'],
        css: `/* ═══ SPATIAL UI DESIGN SYSTEM ═══ */
.spatial-scene{perspective:1200px;perspective-origin:50% 50%;transform-style:preserve-3d}
.spatial-layer{transform-style:preserve-3d;will-change:transform}
.spatial-layer-back{transform:translateZ(-200px) scale(1.4)}
.spatial-layer-mid{transform:translateZ(-100px) scale(1.2)}
.spatial-layer-front{transform:translateZ(0px)}
.spatial-layer-float{transform:translateZ(60px)}
.spatial-card{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;transform-style:preserve-3d;transition:transform 0.5s cubic-bezier(0.23,1,0.32,1);will-change:transform;position:relative;overflow:hidden}
.spatial-card::before{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 50%,rgba(255,255,255,0.05) 100%);pointer-events:none}
.spatial-card:hover{transform:translateZ(30px) rotateX(-3deg) rotateY(5deg);box-shadow:0 20px 60px rgba(0,0,0,0.3),0 0 40px rgba(var(--color-primary-rgb,99,102,241),0.1)}
.spatial-window{background:rgba(10,10,20,0.7);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;transform-style:preserve-3d;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
.spatial-window-titlebar{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06)}
.spatial-window-dot{width:12px;height:12px;border-radius:50%}
.spatial-window-dot.red{background:#ff5f57}.spatial-window-dot.yellow{background:#febc2e}.spatial-window-dot.green{background:#28c840}
.spatial-window-body{padding:20px}
.spatial-button{background:linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3));backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);border-radius:14px;padding:12px 28px;color:white;cursor:pointer;transform-style:preserve-3d;transition:all 0.4s cubic-bezier(0.23,1,0.32,1)}
.spatial-button:hover{transform:translateZ(10px) scale(1.05);box-shadow:0 8px 32px rgba(99,102,241,0.3);border-color:rgba(255,255,255,0.3)}
.spatial-ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,0.05);transform-style:preserve-3d;animation:spatialOrbit 20s linear infinite}
.spatial-ring-1{width:400px;height:400px;animation-duration:20s;transform:rotateX(75deg)}.spatial-ring-2{width:600px;height:600px;animation-duration:30s;transform:rotateX(60deg) rotateZ(45deg)}.spatial-ring-3{width:800px;height:800px;animation-duration:40s;transform:rotateX(80deg) rotateZ(-30deg)}
@keyframes spatialOrbit{from{transform:rotateX(75deg) rotateZ(0deg)}to{transform:rotateX(75deg) rotateZ(360deg)}}
.spatial-grid{display:grid;gap:2px;transform-style:preserve-3d;perspective:800px}
.spatial-grid>*{transition:transform 0.4s ease;transform-style:preserve-3d}
.spatial-grid>*:hover{transform:translateZ(20px)}
.spatial-hud{position:fixed;pointer-events:none;z-index:100;font-family:'Space Mono',monospace;font-size:0.7rem;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.1em}
.spatial-hud-tl{top:20px;left:20px}.spatial-hud-tr{top:20px;right:20px}.spatial-hud-bl{bottom:20px;left:20px}.spatial-hud-br{bottom:20px;right:20px}`,
        compatibleAnimations: ['3d-tilt', '3d-scroll', '3d-float', '3d-flip', 'parallax-depth', 'hover-perspective']
      }
    };

    /* ════════════════════════════════════════════════════════════
       ADVANCED ANIMATIONS — CSS + JS implementations
       ════════════════════════════════════════════════════════════ */
    this.advancedAnimations = {
      // ─── HOVER EFFECTS ───
      'hover-lift': {
        css: `[data-hover="lift"]{transition:transform 0.4s cubic-bezier(0.23,1,0.32,1),box-shadow 0.4s ease}[data-hover="lift"]:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,0.15)}`,
        js: ``
      },
      'hover-glow': {
        css: `[data-hover="glow"]{transition:box-shadow 0.4s ease,border-color 0.4s ease;position:relative}[data-hover="glow"]:hover{box-shadow:0 0 30px rgba(var(--color-primary-rgb,99,102,241),0.3),0 0 60px rgba(var(--color-primary-rgb,99,102,241),0.1);border-color:rgba(var(--color-primary-rgb,99,102,241),0.4)}`,
        js: ``
      },
      'hover-tilt': {
        css: `[data-hover="tilt"]{transition:transform 0.3s ease;transform-style:preserve-3d}`,
        js: `function initHoverTilt(){document.querySelectorAll('[data-hover="tilt"]').forEach(el=>{el.addEventListener('mousemove',e=>{const rect=el.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;el.style.transform=\`perspective(600px) rotateY(\${x*15}deg) rotateX(\${-y*15}deg) scale(1.02)\`});el.addEventListener('mouseleave',()=>{el.style.transform='perspective(600px) rotateY(0) rotateX(0) scale(1)'})})}document.addEventListener('DOMContentLoaded',initHoverTilt);`
      },
      'hover-spotlight': {
        css: `[data-hover="spotlight"]{position:relative;overflow:hidden}[data-hover="spotlight"]::after{content:'';position:absolute;width:200px;height:200px;background:radial-gradient(circle,rgba(255,255,255,0.15),transparent 70%);border-radius:50%;pointer-events:none;opacity:0;transition:opacity 0.3s ease;transform:translate(-50%,-50%)}[data-hover="spotlight"]:hover::after{opacity:1}`,
        js: `function initSpotlight(){document.querySelectorAll('[data-hover="spotlight"]').forEach(el=>{const spot=el.querySelector('::after')||el;el.addEventListener('mousemove',e=>{const rect=el.getBoundingClientRect();el.style.setProperty('--spot-x',e.clientX-rect.left+'px');el.style.setProperty('--spot-y',e.clientY-rect.top+'px')})})}document.addEventListener('DOMContentLoaded',initSpotlight);`
      },
      'hover-underline': {
        css: `[data-hover="underline"]{position:relative;display:inline-block}[data-hover="underline"]::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:2px;background:currentColor;transform:scaleX(0);transform-origin:right;transition:transform 0.4s cubic-bezier(0.65,0,0.35,1)}[data-hover="underline"]:hover::after{transform:scaleX(1);transform-origin:left}`,
        js: ``
      },
      'hover-perspective': {
        css: `[data-hover="perspective"]{transition:transform 0.5s cubic-bezier(0.23,1,0.32,1);transform-style:preserve-3d}`,
        js: `function initPerspectiveHover(){document.querySelectorAll('[data-hover="perspective"]').forEach(el=>{el.addEventListener('mousemove',e=>{const rect=el.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width;const y=(e.clientY-rect.top)/rect.height;const rotX=(y-0.5)*20;const rotY=(x-0.5)*-20;el.style.transform=\`perspective(1000px) rotateX(\${rotX}deg) rotateY(\${rotY}deg) translateZ(10px)\`});el.addEventListener('mouseleave',()=>{el.style.transform=''})})}document.addEventListener('DOMContentLoaded',initPerspectiveHover);`
      },

      // ─── SMOOTH LOADER ───
      'smooth-loader': {
        css: `.page-loader{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:var(--color-bg,#000);transition:opacity 0.6s ease,visibility 0.6s ease}
.page-loader.loaded{opacity:0;visibility:hidden;pointer-events:none}
.loader-spinner{width:40px;height:40px;border-radius:50%;border:3px solid rgba(255,255,255,0.1);border-top-color:var(--color-primary,#fff);animation:loaderSpin 0.8s linear infinite}
@keyframes loaderSpin{to{transform:rotate(360deg)}}
.loader-bar{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--color-primary,#6366f1),var(--color-accent,#a855f7));z-index:10001;width:0;transition:width 0.4s ease}
.loader-counter{font-family:var(--font-heading);font-size:clamp(3rem,8vw,6rem);font-weight:700;opacity:0.1}
.loader-text{font-size:0.8rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.5;margin-top:1rem}`,
        js: `function initSmoothLoader(){const loader=document.querySelector('.page-loader');const bar=document.querySelector('.loader-bar');const counter=document.querySelector('.loader-counter');let progress=0;const interval=setInterval(()=>{progress+=Math.random()*15+5;if(progress>=100){progress=100;clearInterval(interval);if(bar)bar.style.width='100%';if(counter)counter.textContent='100';setTimeout(()=>{if(loader)loader.classList.add('loaded');document.body.classList.add('loaded')},300)}if(bar)bar.style.width=progress+'%';if(counter)counter.textContent=Math.round(progress)},100)}document.addEventListener('DOMContentLoaded',initSmoothLoader);`
      },

      // ─── 3D MOTION ───
      '3d-tilt': {
        css: `[data-3d="tilt"]{transform-style:preserve-3d;transition:transform 0.3s ease;will-change:transform}[data-3d="tilt"] *{transform:translateZ(20px)}`,
        js: `function init3DTilt(){document.querySelectorAll('[data-3d="tilt"]').forEach(el=>{const depth=parseFloat(el.dataset.tiltDepth)||15;el.addEventListener('mousemove',e=>{const rect=el.getBoundingClientRect();const x=((e.clientX-rect.left)/rect.width-0.5)*depth;const y=((e.clientY-rect.top)/rect.height-0.5)*-depth;el.style.transform=\`perspective(800px) rotateY(\${x}deg) rotateX(\${y}deg)\`});el.addEventListener('mouseleave',()=>{el.style.transform='perspective(800px) rotateY(0) rotateX(0)'})})}document.addEventListener('DOMContentLoaded',init3DTilt);`
      },
      '3d-float': {
        css: `[data-3d="float"]{animation:float3D 6s ease-in-out infinite;transform-style:preserve-3d}@keyframes float3D{0%,100%{transform:translateY(0) rotateX(0) rotateY(0)}25%{transform:translateY(-10px) rotateX(2deg) rotateY(-2deg)}50%{transform:translateY(-20px) rotateX(-1deg) rotateY(3deg)}75%{transform:translateY(-10px) rotateX(1deg) rotateY(-1deg)}}`,
        js: ``
      },
      '3d-flip': {
        css: `[data-3d="flip"]{perspective:1000px;cursor:pointer}.flip-inner{transition:transform 0.6s cubic-bezier(0.23,1,0.32,1);transform-style:preserve-3d;position:relative}.flip-front,.flip-back{backface-visibility:hidden;position:absolute;inset:0}.flip-back{transform:rotateY(180deg)}[data-3d="flip"]:hover .flip-inner,[data-3d="flip"].flipped .flip-inner{transform:rotateY(180deg)}`,
        js: ``
      },

      // ─── ENTRANCE REVEALS ───
      'entrance-fade': {
        css: `[data-reveal="fade"]{opacity:0;transition:opacity 0.8s ease}[data-reveal="fade"].revealed{opacity:1}`,
        js: ``
      },
      'entrance-slide': {
        css: `[data-reveal="slide-up"]{opacity:0;transform:translateY(60px);transition:all 0.8s cubic-bezier(0.23,1,0.32,1)}[data-reveal="slide-up"].revealed{opacity:1;transform:translateY(0)}
[data-reveal="slide-left"]{opacity:0;transform:translateX(-60px);transition:all 0.8s cubic-bezier(0.23,1,0.32,1)}[data-reveal="slide-left"].revealed{opacity:1;transform:translateX(0)}
[data-reveal="slide-right"]{opacity:0;transform:translateX(60px);transition:all 0.8s cubic-bezier(0.23,1,0.32,1)}[data-reveal="slide-right"].revealed{opacity:1;transform:translateX(0)}`,
        js: ``
      },
      'entrance-clip': {
        css: `[data-reveal="clip"]{clip-path:inset(100% 0 0 0);transition:clip-path 1s cubic-bezier(0.65,0,0.35,1)}[data-reveal="clip"].revealed{clip-path:inset(0 0 0 0)}
[data-reveal="clip-circle"]{clip-path:circle(0% at 50% 50%);transition:clip-path 1.2s cubic-bezier(0.65,0,0.35,1)}[data-reveal="clip-circle"].revealed{clip-path:circle(100% at 50% 50%)}`,
        js: ``
      },
      'entrance-blur': {
        css: `[data-reveal="blur"]{opacity:0;filter:blur(20px);transform:scale(0.95);transition:all 0.8s cubic-bezier(0.23,1,0.32,1)}[data-reveal="blur"].revealed{opacity:1;filter:blur(0);transform:scale(1)}`,
        js: ``
      },
      'entrance-split': {
        css: `[data-reveal="split"]{overflow:hidden}[data-reveal="split"] .split-line{display:block;transform:translateY(110%);transition:transform 0.8s cubic-bezier(0.65,0,0.35,1)}[data-reveal="split"].revealed .split-line{transform:translateY(0)}`,
        js: `function initSplitReveal(){document.querySelectorAll('[data-reveal="split"]').forEach(el=>{const text=el.innerHTML;const lines=text.split('<br>').length>1?text.split('<br>'):text.split('\\n');el.innerHTML=lines.map((line,i)=>\`<span class="split-line" style="transition-delay:\${i*0.1}s">\${line.trim()}</span>\`).join('')})}document.addEventListener('DOMContentLoaded',initSplitReveal);`
      },
      'entrance-pop': {
        css: `[data-reveal="pop"]{opacity:0;transform:scale(0.5);transition:all 0.6s cubic-bezier(0.34,1.56,0.64,1)}[data-reveal="pop"].revealed{opacity:1;transform:scale(1)}`,
        js: ``
      },
      'entrance-glitch': {
        css: `[data-reveal="glitch"]{position:relative}[data-reveal="glitch"]::before,[data-reveal="glitch"]::after{content:attr(data-text);position:absolute;inset:0;opacity:0}[data-reveal="glitch"].revealed::before{animation:glitchReveal1 0.3s ease forwards}[data-reveal="glitch"].revealed::after{animation:glitchReveal2 0.3s ease 0.1s forwards}
@keyframes glitchReveal1{0%{opacity:0.8;transform:translate(-3px,-2px);clip-path:inset(20% 0 60% 0)}50%{opacity:0.6;transform:translate(3px,1px);clip-path:inset(40% 0 20% 0)}100%{opacity:0;transform:translate(0)}}
@keyframes glitchReveal2{0%{opacity:0.6;transform:translate(2px,3px);clip-path:inset(60% 0 10% 0);color:#0ff}50%{opacity:0.4;transform:translate(-2px,-1px);clip-path:inset(10% 0 70% 0);color:#f0f}100%{opacity:0;transform:translate(0)}}`,
        js: ``
      },

      // ─── MICRO INTERACTIONS ───
      'micro-bounce': {
        css: `[data-micro="bounce"]{transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1)}[data-micro="bounce"]:hover{transform:scale(1.05)}[data-micro="bounce"]:active{transform:scale(0.95)}`,
        js: ``
      },
      'micro-ripple': {
        css: `[data-micro="ripple"]{position:relative;overflow:hidden}[data-micro="ripple"] .ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,0.3);transform:scale(0);animation:rippleEffect 0.6s ease-out forwards;pointer-events:none}@keyframes rippleEffect{to{transform:scale(4);opacity:0}}`,
        js: `function initRipple(){document.querySelectorAll('[data-micro="ripple"]').forEach(el=>{el.addEventListener('click',e=>{const ripple=document.createElement('span');ripple.className='ripple';const rect=el.getBoundingClientRect();const size=Math.max(rect.width,rect.height);ripple.style.width=ripple.style.height=size+'px';ripple.style.left=(e.clientX-rect.left-size/2)+'px';ripple.style.top=(e.clientY-rect.top-size/2)+'px';el.appendChild(ripple);setTimeout(()=>ripple.remove(),600)})})}document.addEventListener('DOMContentLoaded',initRipple);`
      },
      'micro-magnetic': {
        css: `[data-micro="magnetic"]{transition:transform 0.3s cubic-bezier(0.23,1,0.32,1)}`,
        js: `function initMicroMagnetic(){document.querySelectorAll('[data-micro="magnetic"]').forEach(el=>{const str=parseFloat(el.dataset.strength)||0.3;el.addEventListener('mousemove',e=>{const rect=el.getBoundingClientRect();const x=(e.clientX-rect.left-rect.width/2)*str;const y=(e.clientY-rect.top-rect.height/2)*str;el.style.transform=\`translate(\${x}px,\${y}px)\`});el.addEventListener('mouseleave',()=>{el.style.transform=''})})}document.addEventListener('DOMContentLoaded',initMicroMagnetic);`
      },
      'micro-counter': {
        css: `[data-micro="counter"]{font-variant-numeric:tabular-nums}`,
        js: `function initMicroCounter(){document.querySelectorAll('[data-micro="counter"]').forEach(el=>{const target=parseInt(el.dataset.target)||0;const duration=parseInt(el.dataset.duration)||2000;const obs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const start=performance.now();const animate=(now)=>{const elapsed=now-start;const progress=Math.min(elapsed/duration,1);const eased=1-Math.pow(1-progress,3);el.textContent=Math.round(eased*target).toLocaleString();if(progress<1)requestAnimationFrame(animate)};requestAnimationFrame(animate);obs.unobserve(el)}})},{threshold:0.3});obs.observe(el)})}document.addEventListener('DOMContentLoaded',initMicroCounter);`
      },
      'micro-cursor': {
        css: `.custom-cursor{position:fixed;width:20px;height:20px;border:2px solid var(--color-primary,#fff);border-radius:50%;pointer-events:none;z-index:9999;transition:width 0.3s,height 0.3s,border-color 0.3s;transform:translate(-50%,-50%);mix-blend-mode:difference}.custom-cursor.hover{width:50px;height:50px;border-color:var(--color-accent)}`,
        js: `function initCustomCursor(){const cursor=document.createElement('div');cursor.className='custom-cursor';document.body.appendChild(cursor);let cx=0,cy=0,mx=0,my=0;document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});function animate(){cx+=(mx-cx)*0.15;cy+=(my-cy)*0.15;cursor.style.left=cx+'px';cursor.style.top=cy+'px';requestAnimationFrame(animate)}animate();document.querySelectorAll('a,button,[data-hover]').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('hover'));el.addEventListener('mouseleave',()=>cursor.classList.remove('hover'))})}if(!matchMedia('(pointer:coarse)').matches)document.addEventListener('DOMContentLoaded',initCustomCursor);`
      },

      // ─── PARALLAX EFFECTS ───
      'parallax-scroll': {
        css: `[data-parallax-scroll]{will-change:transform}`,
        js: `function initParallaxScroll(){const els=document.querySelectorAll('[data-parallax-scroll]');if(!els.length)return;function update(){els.forEach(el=>{const speed=parseFloat(el.dataset.parallaxScroll)||0.5;const rect=el.getBoundingClientRect();const visible=rect.top<window.innerHeight&&rect.bottom>0;if(visible){const yPos=-(rect.top*speed);el.style.transform=\`translateY(\${yPos}px)\`}});requestAnimationFrame(update)}update()}document.addEventListener('DOMContentLoaded',initParallaxScroll);`
      },
      'parallax-depth': {
        css: `[data-parallax-depth]{transform-style:preserve-3d;perspective:1000px}[data-parallax-depth] [data-depth]{will-change:transform;transition:transform 0.1s linear}`,
        js: `function initParallaxDepth(){document.querySelectorAll('[data-parallax-depth]').forEach(container=>{const layers=container.querySelectorAll('[data-depth]');container.addEventListener('mousemove',e=>{const rect=container.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;layers.forEach(layer=>{const depth=parseFloat(layer.dataset.depth)||1;layer.style.transform=\`translate(\${x*depth*40}px,\${y*depth*40}px)\`})});container.addEventListener('mouseleave',()=>{layers.forEach(layer=>{layer.style.transform=''})})})}document.addEventListener('DOMContentLoaded',initParallaxDepth);`
      },
      'parallax-mouse': {
        css: `[data-parallax-mouse]{will-change:transform;transition:transform 0.15s ease-out}`,
        js: `function initParallaxMouse(){const els=document.querySelectorAll('[data-parallax-mouse]');let mx=0,my=0;document.addEventListener('mousemove',e=>{mx=(e.clientX/window.innerWidth-0.5)*2;my=(e.clientY/window.innerHeight-0.5)*2});function animate(){els.forEach(el=>{const speed=parseFloat(el.dataset.parallaxMouse)||30;el.style.transform=\`translate(\${mx*speed}px,\${my*speed}px)\`});requestAnimationFrame(animate)}animate()}document.addEventListener('DOMContentLoaded',initParallaxMouse);`
      },

      // ─── 3D SCROLL ───
      '3d-scroll': {
        css: `.scroll-3d-scene{perspective:1000px;perspective-origin:50% 50%;overflow:hidden}
.scroll-3d-card{transform-style:preserve-3d;will-change:transform}
[data-scroll-3d]{transform-style:preserve-3d;transition:transform 0.1s linear}
.scroll-rotate-x{transform-origin:center bottom}`,
        js: `function init3DScroll(){const els=document.querySelectorAll('[data-scroll-3d]');if(!els.length)return;function update(){els.forEach(el=>{const rect=el.getBoundingClientRect();const viewH=window.innerHeight;const progress=(viewH-rect.top)/(viewH+rect.height);const clamped=Math.max(0,Math.min(1,progress));const type=el.dataset.scroll3d||'rotate';if(type==='rotate'){const angle=(1-clamped)*30;el.style.transform=\`perspective(1000px) rotateX(\${angle}deg) translateZ(\${(1-clamped)*-50}px)\`}else if(type==='zoom'){const scale=0.7+clamped*0.3;const z=(1-clamped)*-200;el.style.transform=\`perspective(1000px) translateZ(\${z}px) scale(\${scale})\`;el.style.opacity=clamped}else if(type==='flip'){const angle=(1-clamped)*90;el.style.transform=\`perspective(1000px) rotateY(\${angle}deg)\`}else if(type==='spiral'){const angle=(1-clamped)*180;const z=(1-clamped)*-100;el.style.transform=\`perspective(1000px) rotateZ(\${angle}deg) translateZ(\${z}px) scale(\${0.5+clamped*0.5})\`}});requestAnimationFrame(update)}update()}document.addEventListener('DOMContentLoaded',init3DScroll);`
      },

      // ─── 3D BACKGROUNDS ───
      '3d-background': {
        css: `.bg-3d-grid{position:fixed;inset:0;pointer-events:none;z-index:0;perspective:500px;overflow:hidden}
.bg-3d-grid::before{content:'';position:absolute;width:200%;height:200%;top:50%;left:-50%;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 80px),repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 80px);transform:rotateX(60deg);transform-origin:center center;animation:gridScroll 20s linear infinite}
@keyframes gridScroll{0%{transform:rotateX(60deg) translateY(0)}100%{transform:rotateX(60deg) translateY(80px)}}
.bg-3d-particles{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.bg-particle{position:absolute;border-radius:50%;background:rgba(var(--color-primary-rgb,99,102,241),0.3);animation:particleFloat var(--duration,8s) ease-in-out infinite alternate}
@keyframes particleFloat{0%{transform:translateY(100vh) translateX(0) scale(0)}50%{transform:translateY(50vh) translateX(30px) scale(1)}100%{transform:translateY(-10vh) translateX(-20px) scale(0.5)}}
.bg-3d-waves{position:fixed;bottom:0;left:0;right:0;height:200px;pointer-events:none;z-index:0;overflow:hidden}
.bg-3d-aurora{position:fixed;inset:0;pointer-events:none;z-index:0;background:linear-gradient(135deg,rgba(99,102,241,0.05),rgba(139,92,246,0.05),rgba(236,72,153,0.03));filter:blur(100px);animation:auroraShift 15s ease-in-out infinite alternate}
@keyframes auroraShift{0%{opacity:0.3;transform:scale(1) translateX(0)}50%{opacity:0.5;transform:scale(1.2) translateX(5%)}100%{opacity:0.3;transform:scale(1) translateX(-5%)}}`,
        js: `function init3DBackground(){const container=document.querySelector('.bg-3d-particles');if(!container){return}for(let i=0;i<20;i++){const particle=document.createElement('div');particle.className='bg-particle';const size=Math.random()*6+2;particle.style.width=size+'px';particle.style.height=size+'px';particle.style.left=Math.random()*100+'%';particle.style.setProperty('--duration',(Math.random()*10+5)+'s');particle.style.animationDelay=Math.random()*5+'s';container.appendChild(particle)}}document.addEventListener('DOMContentLoaded',init3DBackground);`
      },

      // ─── 3D WINDOWS ───
      '3d-window': {
        css: `.window-3d{background:rgba(20,20,30,0.8);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;transform-style:preserve-3d;box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 1px rgba(255,255,255,0.1);transition:transform 0.5s cubic-bezier(0.23,1,0.32,1)}
.window-3d-titlebar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.06)}
.window-3d-dot{width:10px;height:10px;border-radius:50%;display:inline-block}
.window-3d-dot-red{background:#ff5f57}.window-3d-dot-yellow{background:#febc2e}.window-3d-dot-green{background:#28c840}
.window-3d-title{font-size:0.75rem;opacity:0.5;margin-left:8px;font-family:var(--font-body)}
.window-3d-body{padding:16px;min-height:100px}
.window-3d-stack{display:grid;gap:0;transform-style:preserve-3d;perspective:1500px}
.window-3d-stack .window-3d:nth-child(1){transform:translateZ(0) rotateX(5deg) translateY(0)}
.window-3d-stack .window-3d:nth-child(2){transform:translateZ(-40px) rotateX(5deg) translateY(-20px);opacity:0.8}
.window-3d-stack .window-3d:nth-child(3){transform:translateZ(-80px) rotateX(5deg) translateY(-40px);opacity:0.6}
.window-3d-float{animation:windowFloat 6s ease-in-out infinite}
@keyframes windowFloat{0%,100%{transform:translateY(0) rotateX(2deg) rotateY(-3deg)}50%{transform:translateY(-15px) rotateX(-2deg) rotateY(3deg)}}
.window-3d-browser{border-radius:12px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.4)}
.window-3d-browser .window-3d-titlebar{gap:8px;padding:8px 12px}
.window-3d-browser .window-url-bar{flex:1;background:rgba(255,255,255,0.05);border-radius:6px;padding:4px 12px;font-size:0.7rem;opacity:0.4;margin:0 8px}`,
        js: `function init3DWindows(){document.querySelectorAll('.window-3d[data-3d-interactive]').forEach(win=>{win.addEventListener('mousemove',e=>{const rect=win.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;win.style.transform=\`perspective(1000px) rotateY(\${x*10}deg) rotateX(\${-y*10}deg) translateZ(10px)\`});win.addEventListener('mouseleave',()=>{win.style.transform=''})})}document.addEventListener('DOMContentLoaded',init3DWindows);`
      },

      // ─── SHIMMER / SWEEP ───
      'shimmer-sweep': {
        css: `[data-shimmer]{position:relative;overflow:hidden}[data-shimmer]::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);animation:shimmerSweep 3s ease-in-out infinite}@keyframes shimmerSweep{0%{left:-100%}100%{left:200%}}`,
        js: ``
      },

      // ─── SCROLL REVEAL OBSERVER ───
      'scroll-reveal-observer': {
        css: ``,
        js: `function initScrollRevealObserver(){const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');const delay=parseFloat(entry.target.dataset.revealDelay)||0;if(delay){entry.target.style.transitionDelay=delay+'s'}observer.unobserve(entry.target)}})},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));document.querySelectorAll('[data-scroll-3d]').forEach(el=>observer.observe(el))}document.addEventListener('DOMContentLoaded',initScrollRevealObserver);`
      }
    };

    /* ════════════════════════════════════════════════════════════
       EXISTING MOTION IMPLEMENTATIONS (carried forward from V2)
       ════════════════════════════════════════════════════════════ */
    this.motionImplementations = {
      'liquid-glass-morphism': {
        css: `.liquid-glass{background:rgba(255,255,255,0.01);background-blend-mode:luminosity;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:none;box-shadow:inset 0 1px 1px rgba(255,255,255,0.1);position:relative;overflow:hidden}.liquid-glass::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.4px;background:linear-gradient(180deg,rgba(255,255,255,0.45) 0%,rgba(255,255,255,0.15) 20%,rgba(255,255,255,0) 40%,rgba(255,255,255,0) 60%,rgba(255,255,255,0.15) 80%,rgba(255,255,255,0.45) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}.liquid-glass-strong{background:rgba(255,255,255,0.03);backdrop-filter:blur(50px);-webkit-backdrop-filter:blur(50px);box-shadow:4px 4px 4px rgba(0,0,0,0.05),inset 0 1px 1px rgba(255,255,255,0.15)}`,
        js: `// Liquid glass is CSS-only`
      },
      'blur-text-reveal': {
        css: `.blur-text-word{display:inline-block;margin-right:0.28em;opacity:0;filter:blur(10px);transform:translateY(50px)}`,
        js: `function initBlurText(){document.querySelectorAll('[data-blur-text]').forEach(el=>{if(el.dataset.initialized)return;el.dataset.initialized='true';const words=el.textContent.trim().split(/\\s+/);el.innerHTML=words.map(w=>\`<span class="blur-text-word">\${w}</span>\`).join('');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){el.querySelectorAll('.blur-text-word').forEach((word,i)=>{gsap.to(word,{opacity:1,filter:'blur(0px)',y:0,duration:0.7,delay:i*0.1,ease:'power3.out'})});observer.unobserve(el)}})},{threshold:0.1});observer.observe(el)})}`
      },
      'fading-video-crossfade': {
        css: `.fading-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1s ease-in-out}.fading-video.active{opacity:1}`,
        js: `class FadingVideo{constructor(container,sources){this.container=container;this.sources=Array.isArray(sources)?sources:[sources];this.currentIndex=0;this.videos=[];this.init()}init(){this.sources.forEach((src,i)=>{const video=document.createElement('video');video.src=src;video.autoplay=true;video.muted=true;video.loop=this.sources.length===1;video.playsInline=true;video.className='fading-video'+(i===0?' active':'');this.container.appendChild(video);this.videos.push(video);video.addEventListener('loadeddata',()=>{if(i===0)gsap.to(video,{opacity:1,duration:0.5})});video.addEventListener('timeupdate',()=>{if(video.duration-video.currentTime<=0.55&&this.sources.length>1){this.crossfade()}})});if(this.sources.length>1){this.videos[0].loop=false}}crossfade(){const current=this.videos[this.currentIndex];this.currentIndex=(this.currentIndex+1)%this.videos.length;const next=this.videos[this.currentIndex];next.currentTime=0;next.play();gsap.to(current,{opacity:0,duration:0.55});gsap.to(next,{opacity:1,duration:0.55});current.classList.remove('active');next.classList.add('active')}}`
      },
      'magnetic-quickto-cta': {
        css: `[data-magnet]{transition:transform 0.1s ease-out}`,
        js: `function initMagneticButtons(){document.querySelectorAll('[data-magnet]').forEach(btn=>{const strength=parseFloat(btn.dataset.magnet)||0.3;btn.addEventListener('mousemove',e=>{const rect=btn.getBoundingClientRect();const x=e.clientX-rect.left-rect.width/2;const y=e.clientY-rect.top-rect.height/2;gsap.to(btn,{x:x*strength,y:y*strength,duration:0.3,ease:'power2.out'})});btn.addEventListener('mouseleave',()=>{gsap.to(btn,{x:0,y:0,duration:0.5,ease:'elastic.out(1,0.3)'})})})}`
      },
      'parallax-layers': {
        css: `.parallax-layer{will-change:transform;transition:transform 0.1s ease-out}`,
        js: `function initParallax(){const layers=document.querySelectorAll('[data-parallax]');let mouse={x:0,y:0},current={x:0,y:0};document.addEventListener('mousemove',e=>{mouse.x=(e.clientX/window.innerWidth)-0.5;mouse.y=(e.clientY/window.innerHeight)-0.5});function animate(){current.x+=(mouse.x-current.x)*0.05;current.y+=(mouse.y-current.y)*0.05;layers.forEach(layer=>{const depth=parseFloat(layer.dataset.parallax)||1;layer.style.transform=\`translate(\${current.x*depth*60}px,\${current.y*depth*60}px)\`});requestAnimationFrame(animate)}animate()}`
      },
      'scroll-scrub-scenes': {
        css: `[data-scene]{min-height:100vh;position:relative}`,
        js: `function initScrollScenes(){document.querySelectorAll('[data-scene]').forEach(scene=>{const elements=scene.querySelectorAll('[data-scrub]');elements.forEach(el=>{const scrubType=el.dataset.scrub;gsap.from(el,{scrollTrigger:{trigger:scene,start:'top bottom',end:'bottom top',scrub:1},...(scrubType==='fade'?{opacity:0,y:100}:scrubType==='scale'?{scale:0.8,opacity:0}:{y:50,opacity:0})})})})`
      },
      'grain-vignette-grade': {
        css: `.film-grain{position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")}.vignette{position:fixed;inset:0;pointer-events:none;z-index:9997;background:radial-gradient(ellipse at center,transparent 0%,transparent 50%,rgba(0,0,0,0.4) 100%)}`,
        js: `// Film grain and vignette are CSS-only`
      },
      'sticky-stacking-cards': {
        css: `.stacking-cards{position:relative}.stacking-card{position:sticky;top:10vh;transform-origin:center top}`,
        js: `function initStackingCards(){const container=document.querySelector('.stacking-cards');if(!container)return;const cards=container.querySelectorAll('.stacking-card');cards.forEach((card,i)=>{gsap.to(card,{scrollTrigger:{trigger:card,start:'top 10%',end:'bottom top',scrub:true},scale:1-((cards.length-i)*0.05),filter:\`brightness(\${1-((cards.length-i)*0.1)})\`})})}`
      }
    };

    /* ════════════════════════════════════════════════════════════
       TEMPLATE LIBRARY — with design philosophy assignments
       ════════════════════════════════════════════════════════════ */
    this.templateLibrary = {
      'agency': {
        heroTreatment: 'fullscreen-video-crossfade',
        designPhilosophy: 'liquidglass',
        motionSystems: ['liquid-glass-morphism', 'blur-text-reveal', 'magnetic-quickto-cta', 'parallax-layers', 'scroll-scrub-scenes'],
        advancedEffects: ['hover-tilt', 'smooth-loader', 'entrance-clip', 'micro-cursor', 'parallax-depth', '3d-scroll', '3d-window'],
        colorStrategy: 'dark-cinematic',
        typography: { heading: 'Instrument Serif', body: 'Barlow', style: 'editorial-italic' },
        spacing: 'generous-editorial',
        components: ['fading-video', 'blur-text', 'bubble-menu', 'stats-cards', 'trust-bar']
      },
      'saas': {
        heroTreatment: 'gradient-mesh-animated',
        designPhilosophy: 'glassmorphism',
        motionSystems: ['stagger-fade-up', 'magnetic-quickto-cta'],
        advancedEffects: ['hover-glow', 'smooth-loader', 'entrance-slide', 'micro-ripple', '3d-background', '3d-window'],
        colorStrategy: 'dark-modern',
        typography: { heading: 'Outfit', body: 'Inter', style: 'clean-geometric' },
        spacing: 'balanced-product',
        components: ['pricing-toggle', 'feature-grid', 'testimonial-carousel', 'cta-glow']
      },
      'portfolio': {
        heroTreatment: 'split-screen-media',
        designPhilosophy: 'minimalism',
        motionSystems: ['blur-text-reveal', 'parallax-layers'],
        advancedEffects: ['hover-underline', 'entrance-clip', 'micro-cursor', 'parallax-mouse', '3d-scroll'],
        colorStrategy: 'minimal-contrast',
        typography: { heading: 'Playfair Display', body: 'DM Sans', style: 'editorial-mixed' },
        spacing: 'asymmetric-editorial',
        components: ['project-grid', 'case-study-cards', 'contact-form', 'social-links']
      },
      'ecommerce': {
        heroTreatment: '3d-product-showcase',
        designPhilosophy: 'skeuomorphism',
        motionSystems: ['stagger-fade-up', 'magnetic-quickto-cta'],
        advancedEffects: ['hover-lift', 'smooth-loader', 'entrance-pop', 'micro-bounce', '3d-tilt', '3d-window'],
        colorStrategy: 'warm-luxury',
        typography: { heading: 'Cormorant Garamond', body: 'Jost', style: 'luxury-serif' },
        spacing: 'product-focused',
        components: ['product-carousel', 'size-selector', 'add-to-cart', 'reviews-slider']
      },
      'landing': {
        heroTreatment: 'cinematic-video-loop',
        designPhilosophy: 'glassmorphism',
        motionSystems: ['scroll-scrub-scenes', 'parallax-layers', 'magnetic-quickto-cta'],
        advancedEffects: ['hover-glow', 'smooth-loader', '3d-tilt', 'entrance-blur', 'micro-ripple', 'parallax-scroll', '3d-background'],
        colorStrategy: 'bold-gradient',
        typography: { heading: 'Space Grotesk', body: 'Inter', style: 'modern-bold' },
        spacing: 'immersive-fullscreen',
        components: ['video-background', 'feature-showcase', 'social-proof', 'newsletter-capture']
      },
      'dashboard': {
        heroTreatment: 'data-visualization-hero',
        designPhilosophy: 'neomorphism',
        motionSystems: ['stagger-fade-up'],
        advancedEffects: ['hover-lift', 'entrance-fade', 'micro-counter', 'micro-ripple', '3d-window'],
        colorStrategy: 'dark-productivity',
        typography: { heading: 'Plus Jakarta Sans', body: 'Inter', style: 'functional-clean' },
        spacing: 'dense-functional',
        components: ['stats-grid', 'data-tables', 'charts', 'activity-feed', 'quick-actions']
      },
      'minimal': {
        heroTreatment: 'typography-focused',
        designPhilosophy: 'minimalism',
        motionSystems: ['blur-text-reveal'],
        advancedEffects: ['hover-underline', 'entrance-fade', 'micro-subtle', 'parallax-scroll'],
        colorStrategy: 'monochrome-refined',
        typography: { heading: 'Instrument Serif', body: 'Inter', style: 'swiss-minimal' },
        spacing: 'breathing-whitespace',
        components: ['text-blocks', 'image-grid', 'contact-minimal']
      },
      'cinematic': {
        heroTreatment: 'fullscreen-video-crossfade',
        designPhilosophy: 'liquidglass',
        motionSystems: ['liquid-glass-morphism', 'blur-text-reveal', 'fading-video-crossfade', 'parallax-layers', 'magnetic-quickto-cta', 'scroll-scrub-scenes', 'grain-vignette-grade'],
        advancedEffects: ['hover-tilt', 'smooth-loader', '3d-tilt', 'entrance-clip', 'micro-cursor', 'parallax-depth', '3d-scroll', '3d-background', '3d-window'],
        colorStrategy: 'dark-atmospheric',
        typography: { heading: 'Instrument Serif', body: 'Barlow', style: 'editorial-italic' },
        spacing: 'immersive-fullscreen',
        components: ['fading-video', 'blur-text', 'liquid-glass-nav', 'stats-cards', 'capability-cards', 'trust-bar']
      },
      'creative': {
        heroTreatment: 'immersive-scroll-narrative',
        designPhilosophy: 'maximalism',
        motionSystems: ['blur-text-reveal', 'scroll-scrub-scenes', 'parallax-layers'],
        advancedEffects: ['hover-spotlight', 'smooth-loader', '3d-flip', 'entrance-glitch', 'micro-bounce', 'parallax-depth', '3d-scroll', '3d-background'],
        colorStrategy: 'vibrant-experimental',
        typography: { heading: 'Clash Display', body: 'Cabinet Grotesk', style: 'expressive-bold' },
        spacing: 'dynamic-asymmetric',
        components: ['marquee-text', 'stacked-cards', 'image-reveal', 'interactive-grid']
      },
      'brutalist': {
        heroTreatment: 'raw-typography-hero',
        designPhilosophy: 'brutalism',
        motionSystems: [],
        advancedEffects: ['hover-shake', 'entrance-glitch', 'micro-snap'],
        colorStrategy: 'high-contrast-raw',
        typography: { heading: 'Space Mono', body: 'Space Mono', style: 'mono-raw' },
        spacing: 'grid-exposed',
        components: ['marquee-text', 'raw-grid', 'stamp-badge']
      },
      'futuristic': {
        heroTreatment: 'webgl-spatial-hero',
        designPhilosophy: 'spatialui',
        motionSystems: ['scroll-scrub-scenes', 'parallax-layers'],
        advancedEffects: ['hover-perspective', 'smooth-loader', '3d-tilt', '3d-float', 'entrance-blur', 'micro-cursor', 'parallax-depth', '3d-scroll', '3d-background', '3d-window'],
        colorStrategy: 'deep-space-neon',
        typography: { heading: 'Orbitron', body: 'Exo 2', style: 'tech-futuristic' },
        spacing: 'spatial-depth',
        components: ['spatial-cards', 'hud-elements', 'orbital-rings', 'hologram-window']
      },
      'kids': {
        heroTreatment: 'playful-animated-hero',
        designPhilosophy: 'claymorphism',
        motionSystems: [],
        advancedEffects: ['hover-bounce', 'smooth-loader', 'entrance-pop', 'micro-bounce', '3d-wobble'],
        colorStrategy: 'pastel-playful',
        typography: { heading: 'Fredoka One', body: 'Nunito', style: 'rounded-friendly' },
        spacing: 'generous-playful',
        components: ['clay-cards', 'bubble-buttons', 'progress-bar', 'avatar-circles']
      }
    };

    /* ════════════════════════════════════════════════════════════
       SYSTEM PROMPT — V3 with all design philosophies
       ════════════════════════════════════════════════════════════ */
    this.systemPrompt = `You are a world-class design systems architect who masters ALL major design philosophies:

DESIGN PHILOSOPHIES YOU IMPLEMENT:
1. SKEUOMORPHISM — Realistic textures, embossed surfaces, physical buttons with real shadows
2. NEOMORPHISM — Soft extruded UI with dual-shadow technique, light/dark variants
3. GLASSMORPHISM — Frosted glass with backdrop-filter blur, transparent layers, gradient borders
4. CLAYMORPHISM — Soft rounded 3D clay surfaces, pastel palettes, playful inflated shapes
5. MINIMALISM — Maximum whitespace, essential elements only, refined typography, subtle transitions
6. MAXIMALISM — Bold layered textures, mixed typography, vibrant gradients, decorative energy
7. BRUTALISM — Raw chunky borders, monospace type, high contrast, exposed grid structure
8. LIQUID GLASS — Apple-style premium frosted glass with specular highlights and luminosity blending
9. SPATIAL UI — 3D depth layers, perspective transforms, z-space cards, AR/VR inspired depth

ADVANCED EFFECTS YOU IMPLEMENT:
- Hover Effects: lift, glow, tilt, spotlight, underline, perspective, shake, bounce
- Smooth Loaders: spinner, progress bar, counter, text-based loading screens
- 3D Motion: tilt cards, floating elements, flip animations, perspective scroll
- Entrance Reveals: fade, slide, clip-path, blur, split-text, pop, glitch
- Micro Interactions: bounce, ripple, magnetic, counters, custom cursor
- Parallax Effects: scroll-based, mouse-based, depth layers, gentle/intense
- 3D Scroll: rotateX reveal, zoom-in, flip-on-scroll, spiral entrance
- 3D Backgrounds: perspective grids, floating particles, aurora, gradient mesh
- 3D Windows: macOS-style windows, stacked windows, floating browser mockups
- Shimmer/Sweep: light reflections sweeping across glass surfaces

RULES:
1. DETECT the correct design philosophy from the specification and art direction
2. Output ONLY valid CSS inside a \`\`\`css\`\`\` block
3. Include design philosophy CSS utilities (e.g., .neo-flat, .glass-card, .brutal-button)
4. Include all animation keyframes and data-attribute selectors
5. Include advanced hover/entrance/micro-interaction CSS
6. Include 3D scroll, 3D background, and 3D window CSS when relevant
7. Include :root variables for ALL design tokens
8. Include fluid typography (clamp), spacing scale, shadow scale, z-index scale
9. Include responsive breakpoints (375px, 768px, 1024px, 1440px)
10. Include @media (prefers-reduced-motion: reduce) fallbacks
11. Make it feel like a $100K studio handoff — not a template
12. Follow the supplied art direction LITERALLY

OUTPUT FORMAT: Complete :root tokens + design philosophy CSS + animation CSS + component styles.`;
  }

  /* ════════════════════════════════════════════════════════════
     DESIGN PHILOSOPHY DETECTION from user prompt/spec
     ════════════════════════════════════════════════════════════ */
  detectDesignPhilosophy(specification = {}, userPrompt = '') {
    const text = `${userPrompt} ${specification.siteType || ''} ${specification.description || ''} ${specification.mood || ''} ${JSON.stringify(specification.artDirection || {})}`.toLowerCase();

    // Explicit mentions first
    for (const [key, philosophy] of Object.entries(this.designPhilosophies)) {
      const terms = [key, ...philosophy.bestFor];
      if (terms.some(term => new RegExp(`\\b${term}\\b`, 'i').test(text))) {
        return key;
      }
    }

    // Fuzzy matching on characteristics
    if (/realistic|texture|emboss|leather|wood|metal|knob/i.test(text)) return 'skeuomorphism';
    if (/neumorphi|soft.?shadow|extrud|soft.?ui/i.test(text)) return 'neomorphism';
    if (/glass|blur|transparent|frost|backdrop/i.test(text)) return 'glassmorphism';
    if (/clay|soft.?3d|puffy|inflat|pastel.*round/i.test(text)) return 'claymorphism';
    if (/minimal|zen|whitespace|simple.*clean|less.?is.?more/i.test(text)) return 'minimalism';
    if (/maximal|bold|vibrant|layer|dense|busy|colorful.*gradient/i.test(text)) return 'maximalism';
    if (/brutal|raw|punk|grunge|exposed|chunky|anti.?design/i.test(text)) return 'brutalism';
    if (/liquid.?glass|apple|vision.?pro|refract|specular|luminosity/i.test(text)) return 'liquidglass';
    if (/spatial|3d.?ui|depth.?layer|perspective|vr|ar|metaverse|hologram/i.test(text)) return 'spatialui';

    // Template matching
    const siteType = (specification.siteType || '').toLowerCase();
    for (const [key, tmpl] of Object.entries(this.templateLibrary)) {
      if (siteType.includes(key) || key.includes(siteType)) {
        return tmpl.designPhilosophy || 'liquidglass';
      }
    }

    // Default: liquid glass for premium feel
    return 'liquidglass';
  }

  /* ════════════════════════════════════════════════════════════
     DETECT ADVANCED EFFECTS needed from the specification
     ════════════════════════════════════════════════════════════ */
  detectAdvancedEffects(specification = {}, userPrompt = '') {
    const text = `${userPrompt} ${specification.description || ''} ${specification.mood || ''} ${JSON.stringify(specification.artDirection || {})}`.toLowerCase();
    const effects = new Set();

    // Always include these essentials
    effects.add('smooth-loader');
    effects.add('scroll-reveal-observer');

    // Detect from text
    if (/hover|mouse.?over|interactive/i.test(text)) {
      effects.add('hover-tilt');
      effects.add('hover-glow');
      effects.add('hover-lift');
    }
    if (/3d|three|spatial|perspective|depth/i.test(text)) {
      effects.add('3d-tilt');
      effects.add('3d-scroll');
      effects.add('3d-background');
      effects.add('3d-window');
      effects.add('3d-float');
    }
    if (/parallax|depth|layer/i.test(text)) {
      effects.add('parallax-scroll');
      effects.add('parallax-depth');
    }
    if (/entrance|reveal|appear|animate/i.test(text)) {
      effects.add('entrance-slide');
      effects.add('entrance-blur');
      effects.add('entrance-clip');
    }
    if (/micro|interact|ripple|magnet/i.test(text)) {
      effects.add('micro-ripple');
      effects.add('micro-magnetic');
      effects.add('micro-bounce');
    }
    if (/cursor|pointer/i.test(text)) {
      effects.add('micro-cursor');
    }
    if (/window|browser|mockup|mac|desktop/i.test(text)) {
      effects.add('3d-window');
    }
    if (/glitch|punk|cyber|hack/i.test(text)) {
      effects.add('entrance-glitch');
    }
    if (/counter|number|stat/i.test(text)) {
      effects.add('micro-counter');
    }
    if (/shimmer|shine|sweep|glow/i.test(text)) {
      effects.add('shimmer-sweep');
    }
    if (/loader|loading|preload/i.test(text)) {
      effects.add('smooth-loader');
    }
    if (/scroll.*3d|3d.*scroll|perspective.*scroll/i.test(text)) {
      effects.add('3d-scroll');
    }
    if (/background.*3d|3d.*background|particle|aurora|grid.*3d/i.test(text)) {
      effects.add('3d-background');
    }

    return Array.from(effects);
  }

  /* ════════════════════════════════════════════════════════════
     ENHANCE SPECIFICATION — enriches spec with philosophy + effects
     ════════════════════════════════════════════════════════════ */
  async enhanceSpecification(specification) {
    const siteType = (specification.siteType || '').toLowerCase();
    const userPrompt = specification.description || specification.userPrompt || '';

    // 1. Detect design philosophy
    const philosophyKey = this.detectDesignPhilosophy(specification, userPrompt);
    const philosophy = this.designPhilosophies[philosophyKey];

    // 2. Find best matching template
    let template = this.templateLibrary['cinematic'];
    for (const [key, tmpl] of Object.entries(this.templateLibrary)) {
      if (siteType.includes(key) || key.includes(siteType)) {
        template = tmpl;
        break;
      }
    }

    // 3. Detect advanced effects
    const advancedEffects = this.detectAdvancedEffects(specification, userPrompt);

    // 4. Merge template + philosophy + effects
    const enhanced = {
      ...specification,
      designPhilosophy: philosophyKey,
      designPhilosophyName: philosophy.name,
      heroTreatment: specification.heroTreatment || template.heroTreatment,
      motionSystems: [...new Set([
        ...(specification.motionSystems || []),
        ...(specification.animations || []),
        ...template.motionSystems
      ])],
      advancedEffects: [...new Set([
        ...advancedEffects,
        ...(template.advancedEffects || []),
        ...(philosophy.compatibleAnimations || [])
      ])],
      typography: {
        heading: specification.typography?.heading || template.typography.heading,
        body: specification.typography?.body || template.typography.body,
        style: template.typography.style
      },
      components: [...new Set([
        ...(specification.interactiveComponents || []),
        ...template.components
      ])],
      colorStrategy: template.colorStrategy,
      spacingStrategy: template.spacing
    };

    // 5. Generate art direction if not provided
    if (!specification.artDirection || Object.keys(specification.artDirection).length === 0) {
      enhanced.artDirection = await this._generateArtDirection(enhanced);
    }

    return enhanced;
  }

  async _generateArtDirection(spec) {
    const prompt = `Generate a brief but evocative art direction for a ${spec.siteType} website.
Title: ${spec.title || 'Premium Website'}
Mood: ${spec.mood || 'cinematic'}
Design Philosophy: ${spec.designPhilosophyName || 'Liquid Glass'}
Colors: Primary ${spec.colorPalette?.primary}, Background ${spec.colorPalette?.background}

Output a JSON object with:
- concept: One sentence visual concept incorporating the ${spec.designPhilosophyName} design philosophy
- atmosphere: Mood/feeling description
- heroVision: How the hero should feel
- motionLanguage: Movement style
- typographicVoice: Typography personality
- surfaceStyle: How surfaces and cards should look (using ${spec.designPhilosophyName} principles)
- depthStrategy: How depth and layering are achieved

Output ONLY valid JSON, no markdown.`;

    try {
      const response = await this.callLLM(prompt, 'You are a creative director who specializes in advanced design philosophies.', { temperature: 0.7, maxTokens: 600 });
      return JSON.parse(response.trim());
    } catch (e) {
      return {
        concept: `${spec.designPhilosophyName || 'Liquid Glass'} digital experience with atmospheric depth`,
        atmosphere: 'Dark, refined, immersive',
        heroVision: 'Full-bleed media with layered typography and depth',
        motionLanguage: 'Smooth, purposeful, choreographed with 3D depth',
        typographicVoice: 'Bold headlines, refined body text',
        surfaceStyle: `${spec.designPhilosophyName || 'Liquid Glass'} panels with subtle light interaction`,
        depthStrategy: 'Multi-layer parallax with perspective transforms'
      };
    }
  }

  /* ════════════════════════════════════════════════════════════
     MAIN EXECUTE — generates the complete design system
     ════════════════════════════════════════════════════════════ */
  async execute(specification) {
    this.log('info', `Creating advanced design system...`);

    // Enhance specification with philosophy + effects detection
    const enhanced = await this.enhanceSpecification(specification);
    const philosophyKey = enhanced.designPhilosophy || 'liquidglass';
    const philosophy = this.designPhilosophies[philosophyKey];

    this.log('info', `Design philosophy: ${philosophy?.name || 'Liquid Glass'}`);
    this.log('info', `Advanced effects: ${(enhanced.advancedEffects || []).join(', ')}`);

    // 1. Gather design philosophy CSS
    const philosophyCSS = philosophy?.css || '';

    // 2. Gather motion system CSS
    const motionCSS = (enhanced.motionSystems || [])
      .filter(m => this.motionImplementations[m]?.css)
      .map(m => this.motionImplementations[m].css)
      .join('\n\n');

    // 3. Gather advanced animation CSS
    const animationCSS = (enhanced.advancedEffects || [])
      .filter(e => this.advancedAnimations[e]?.css)
      .map(e => `/* ${e} */\n${this.advancedAnimations[e].css}`)
      .join('\n\n');

    // 4. Build the comprehensive LLM prompt
    const message = `Create a comprehensive CSS design system using the ${philosophy?.name || 'Liquid Glass'} design philosophy:

═══ SITE SPECIFICATION ═══
Site type: ${enhanced.siteType}
Title: ${enhanced.title || 'Premium Website'}
Complexity: ${enhanced.complexity || 'cinematic'}
Mood: ${enhanced.mood || 'atmospheric'}
Design Philosophy: ${philosophy?.name || 'Liquid Glass'} — ${philosophy?.description || 'Premium frosted glass with depth'}

═══ COLOR PALETTE ═══
Primary: ${enhanced.colorPalette?.primary || '#ffffff'}
Secondary: ${enhanced.colorPalette?.secondary || '#888888'}
Accent: ${enhanced.colorPalette?.accent || '#ff6b6b'}
Background: ${enhanced.colorPalette?.background || '#000000'}
Surface: ${enhanced.colorPalette?.surface || '#111111'}
Color Strategy: ${enhanced.colorStrategy}

═══ TYPOGRAPHY ═══
Heading: ${enhanced.typography?.heading || 'Instrument Serif'}
Body: ${enhanced.typography?.body || 'Barlow'}
Style: ${enhanced.typography?.style || 'editorial-italic'}

═══ ART DIRECTION (MANDATORY) ═══
${JSON.stringify(enhanced.artDirection, null, 2)}

═══ DESIGN PHILOSOPHY CSS (include and extend this) ═══
${philosophyCSS}

═══ MOTION SYSTEMS TO SUPPORT ═══
${(enhanced.motionSystems || []).join(', ')}

═══ ADVANCED EFFECTS ENABLED ═══
${(enhanced.advancedEffects || []).join(', ')}

═══ HERO TREATMENT ═══
${enhanced.heroTreatment}

═══ COMPONENTS NEEDED ═══
${(enhanced.components || []).join(', ')}

═══ PRE-BUILT MOTION CSS (include this) ═══
${motionCSS}

═══ PRE-BUILT ANIMATION CSS (include this) ═══
${animationCSS}

REQUIREMENTS:
1. Start with :root variables for ALL design tokens (colors, fonts, spacing, shadows, z-index, timing)
2. Include the design philosophy CSS (${philosophy?.name}) utilities
3. Include ALL pre-built motion and animation CSS provided above
4. Add fluid typography scale (clamp-based)
5. Add generous spacing scale (section-level spacing 120px+)
6. Add comprehensive shadow scale matching the ${philosophy?.name} aesthetic
7. Add z-index scale for layered compositions
8. Add transition/animation variables
9. Include base components (.container, .section, .btn variants, .navbar, .hero)
10. Include responsive breakpoints (375px, 768px, 1024px, 1440px)
11. Include @media (prefers-reduced-motion: reduce) that disables animations
12. Add 3D perspective and transform-style utilities if spatial/3D effects are used
13. Make surfaces feel authentically ${philosophy?.name}
14. The entire system must feel like a $100K studio handoff

Generate the complete CSS code. Output ONLY the CSS code inside a code block.`;

    try {
      const response = await this.callLLM(message, this.systemPrompt, {
        temperature: 0.5,
        maxTokens: 32768,
      });

      const css = this.extractCode(response, 'css');

      const designSystem = {
        css: css,
        colors: enhanced.colorPalette,
        fonts: enhanced.typography,
        googleFontsUrl: this._buildGoogleFontsUrl(enhanced.typography),
        complexity: enhanced.complexity,
        designPhilosophy: philosophyKey,
        designPhilosophyName: philosophy?.name || 'Liquid Glass',
        designPhilosophyCSS: philosophyCSS,
        motionSystems: enhanced.motionSystems,
        motionImplementations: this.motionImplementations,
        advancedEffects: enhanced.advancedEffects || [],
        advancedAnimations: this.advancedAnimations,
        enhancedSpec: enhanced
      };

      this.log('success', `${philosophy?.name} design system generated with ${(enhanced.advancedEffects || []).length} advanced effects`);
      return designSystem;
    } catch (e) {
      this.log('error', `Design generation failed: ${e.message}`);
      throw e;
    }
  }

  _buildGoogleFontsUrl(typography) {
    const heading = (typography?.heading || 'Instrument Serif').replace(/\s+/g, '+');
    const body = (typography?.body || 'Barlow').replace(/\s+/g, '+');
    const isSerif = /serif|playfair|fraunces|instrument|cormorant/i.test(typography?.heading || '');
    const isMono = /mono|courier|fira.?code/i.test(typography?.heading || '');
    const headingParam = isMono
      ? `family=${heading}:wght@400;500;600;700`
      : isSerif
        ? `family=${heading}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700`
        : `family=${heading}:wght@400;500;600;700;800;900`;
    return `https://fonts.googleapis.com/css2?${headingParam}&family=${body}:wght@300;400;500;600;700&display=swap`;
  }

  /* ════════════════════════════════════════════════════════════
     REVISE — updates design system based on review critique
     ════════════════════════════════════════════════════════════ */
  async revise(designSystem, critique) {
    this.log('info', 'Revising design system based on critique...');

    const philosophyName = designSystem.designPhilosophyName || 'Liquid Glass';

    const message = `The Reviewer has critiqued your ${philosophyName} design system. Revise it while maintaining the ${philosophyName} aesthetic.

DESIGN PHILOSOPHY: ${philosophyName}

ORIGINAL DESIGN SYSTEM:
${designSystem.css}

CRITIQUE:
${critique}

Output the completely revised design system. Include ALL design philosophy utilities, motion CSS, animation CSS, and component styles. Maintain the ${philosophyName} visual identity throughout.`;

    const response = await this.callLLM(message, this.systemPrompt, {
      temperature: 0.6,
      maxTokens: 32768,
    });

    const css = this.extractCode(response, 'css');

    return {
      ...designSystem,
      css: css,
    };
  }

  /* ════════════════════════════════════════════════════════════
     GETTERS — for motion JS and advanced animation JS
     ════════════════════════════════════════════════════════════ */
  getMotionJS(systemName) {
    return this.motionImplementations[systemName]?.js || '';
  }

  getAllMotionJS(motionSystems) {
    return (motionSystems || [])
      .filter(m => this.motionImplementations[m]?.js)
      .map(m => `// === ${m} ===\n${this.motionImplementations[m].js}`)
      .join('\n\n');
  }

  getAdvancedAnimationJS(effectName) {
    return this.advancedAnimations[effectName]?.js || '';
  }

  getAllAdvancedAnimationJS(effects) {
    return (effects || [])
      .filter(e => this.advancedAnimations[e]?.js && this.advancedAnimations[e].js.trim().length > 0)
      .map(e => `// === ${e} ===\n${this.advancedAnimations[e].js}`)
      .join('\n\n');
  }

  getDesignPhilosophy(key) {
    return this.designPhilosophies[key] || this.designPhilosophies['liquidglass'];
  }

  getAllDesignPhilosophies() {
    return Object.keys(this.designPhilosophies);
  }
}

window.DesignerAgent = DesignerAgent;

;
/* ============================================================
   UI CODER AGENT V2 — Generates CINEMATIC, AWWWARDS-LEVEL 
   websites with real GSAP animations, liquid glass, WebGL,
   and production-ready interactive components
   ============================================================ */

class CoderUIAgent extends BaseAgent {
    constructor() {
        super('CoderUI', 'Generates cinematic Awwwards-level websites with real motion systems');

        // Component templates for different site types
        this.componentTemplates = {
            'fading-video': {
                html: `<div class="video-container" data-fading-video>
  <video class="fading-video active" autoplay muted playsinline loop>
    <source src="{{videoUrl}}" type="video/mp4">
  </video>
</div>`,
                css: `.video-container{position:absolute;inset:0;overflow:hidden;z-index:0}.fading-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1s ease-in-out}.fading-video.active{opacity:1}`,
                js: `// Fading video with crossfade support
class FadingVideo{constructor(container,sources){this.container=container;this.sources=Array.isArray(sources)?sources:[sources];this.currentIndex=0;this.videos=[];this.init()}init(){this.sources.forEach((src,i)=>{const video=document.createElement('video');video.src=src;video.autoplay=true;video.muted=true;video.loop=this.sources.length===1;video.playsInline=true;video.preload='auto';video.className='fading-video'+(i===0?' active':'');this.container.appendChild(video);this.videos.push(video);video.addEventListener('loadeddata',()=>{if(i===0){gsap.fromTo(video,{opacity:0},{opacity:1,duration:0.5})}});if(this.sources.length>1){video.addEventListener('timeupdate',()=>{if(video.duration-video.currentTime<=0.55){this.crossfade()}})}});}crossfade(){const current=this.videos[this.currentIndex];this.currentIndex=(this.currentIndex+1)%this.videos.length;const next=this.videos[this.currentIndex];next.currentTime=0;next.play();gsap.to(current,{opacity:0,duration:0.55});gsap.to(next,{opacity:1,duration:0.55});current.classList.remove('active');next.classList.add('active')}}
document.querySelectorAll('[data-fading-video]').forEach(container=>{const sources=container.dataset.sources?JSON.parse(container.dataset.sources):[container.querySelector('video')?.src];if(sources.length)new FadingVideo(container,sources)});`
            },
            'blur-text': {
                html: `<h1 class="blur-text" data-blur-text>{{text}}</h1>`,
                css: `.blur-text{overflow:hidden}.blur-text-word{display:inline-block;margin-right:0.28em;opacity:0;filter:blur(10px);transform:translateY(50px);transition:all 0.7s cubic-bezier(0.16,1,0.3,1)}`,
                js: `// BlurText word-by-word reveal
function initBlurText(){document.querySelectorAll('[data-blur-text]').forEach(el=>{if(el.dataset.initialized)return;el.dataset.initialized='true';const text=el.textContent.trim();const words=text.split(/\\s+/);el.innerHTML=words.map(word=>\`<span class="blur-text-word">\${word}</span>\`).join('');const wordEls=el.querySelectorAll('.blur-text-word');const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){wordEls.forEach((word,i)=>{gsap.to(word,{opacity:1,filter:'blur(0px)',y:0,duration:0.7,delay:i*0.1,ease:'power3.out'})});observer.unobserve(el)}})},{threshold:0.1});observer.observe(el)})}
document.addEventListener('DOMContentLoaded',initBlurText);`
            },
            'liquid-glass-nav': {
                html: `<nav class="navbar liquid-glass" id="navbar">
  <div class="nav-container">
    <a href="#" class="nav-logo">
      <span class="logo-text">{{logoText}}</span>
    </a>
    <div class="nav-links liquid-glass" id="nav-links">
      {{navLinks}}
      <a href="#" class="btn btn-primary btn-nav" data-magnet="0.2">{{ctaText}}</a>
    </div>
    <button class="hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`,
                css: `.navbar{position:fixed;top:0;left:0;right:0;z-index:1000;padding:1rem 0}.navbar.scrolled{background:rgba(0,0,0,0.8);backdrop-filter:blur(20px)}.nav-container{max-width:1400px;margin:0 auto;padding:0 2rem;display:flex;align-items:center;justify-content:space-between}.nav-logo{font-family:var(--font-heading);font-style:italic;font-size:1.5rem;color:white;text-decoration:none}.nav-links{display:flex;align-items:center;gap:0.5rem;padding:0.4rem;border-radius:100px}.nav-link{color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.85rem;font-weight:500;padding:0.5rem 1.2rem;border-radius:100px;transition:all 0.3s ease}.nav-link:hover,.nav-link.active{color:white;background:rgba(255,255,255,0.1)}.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px}.hamburger span{width:24px;height:2px;background:white;transition:all 0.3s ease}.hamburger.active span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}.hamburger.active span:nth-child(2){opacity:0}.hamburger.active span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}@media(max-width:768px){.nav-links{position:fixed;top:0;left:0;right:0;bottom:0;flex-direction:column;justify-content:center;background:rgba(0,0,0,0.95);opacity:0;visibility:hidden;transition:all 0.4s ease}.nav-links.active{opacity:1;visibility:visible}.hamburger{display:flex}}`,
                js: `// Navbar scroll behavior
const navbar=document.getElementById('navbar');let lastScroll=0;window.addEventListener('scroll',()=>{const currentScroll=window.scrollY;navbar?.classList.toggle('scrolled',currentScroll>50);lastScroll=currentScroll},{passive:true});
// Mobile hamburger
const hamburger=document.getElementById('hamburger');const navLinks=document.getElementById('nav-links');hamburger?.addEventListener('click',()=>{hamburger.classList.toggle('active');navLinks?.classList.toggle('active');document.body.classList.toggle('menu-open')});
navLinks?.querySelectorAll('a').forEach(link=>{link.addEventListener('click',()=>{hamburger?.classList.remove('active');navLinks?.classList.remove('active');document.body.classList.remove('menu-open')})});`
            },
            'stats-cards': {
                html: `<div class="stats-grid" data-animate="stagger">
  {{#each stats}}
  <div class="stat-card liquid-glass">
    <div class="stat-icon">{{icon}}</div>
    <div class="stat-value" data-count="{{value}}">0</div>
    <div class="stat-label">{{label}}</div>
  </div>
  {{/each}}
</div>`,
                css: `.stats-grid{display:flex;gap:1rem;flex-wrap:wrap}.stat-card{padding:1.5rem;border-radius:1.25rem;min-width:200px;text-align:left}.stat-icon{font-size:1.5rem;margin-bottom:1rem}.stat-value{font-family:var(--font-heading);font-size:2.5rem;font-weight:700;line-height:1}.stat-label{font-size:0.85rem;color:rgba(255,255,255,0.6);margin-top:0.5rem}`,
                js: `// Animated counters
document.querySelectorAll('[data-count]').forEach(counter=>{const target=parseInt(counter.dataset.count);if(isNaN(target))return;const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const obj={val:0};gsap.to(obj,{val:target,duration:2,ease:'power2.out',onUpdate:function(){counter.textContent=Math.round(obj.val).toLocaleString()}});observer.unobserve(entry.target)}})},{threshold:0.5});observer.observe(counter)});`
            },
            'magnetic-buttons': {
                html: `<button class="btn btn-primary" data-magnet="0.3">{{text}}</button>`,
                css: `[data-magnet]{transition:transform 0.3s cubic-bezier(0.16,1,0.3,1)}`,
                js: `// Magnetic buttons with GSAP quickTo
function initMagneticButtons(){document.querySelectorAll('[data-magnet]').forEach(btn=>{const strength=parseFloat(btn.dataset.magnet)||0.3;const xTo=gsap.quickTo(btn,'x',{duration:0.4,ease:'power3'});const yTo=gsap.quickTo(btn,'y',{duration:0.4,ease:'power3'});btn.addEventListener('mousemove',e=>{const rect=btn.getBoundingClientRect();const x=e.clientX-rect.left-rect.width/2;const y=e.clientY-rect.top-rect.height/2;xTo(x*strength);yTo(y*strength)});btn.addEventListener('mouseleave',()=>{xTo(0);yTo(0)})})}
document.addEventListener('DOMContentLoaded',initMagneticButtons);`
            },
            'parallax-layers': {
                html: `<div class="parallax-container">
  <div class="parallax-layer" data-parallax="-0.5">{{layer1}}</div>
  <div class="parallax-layer" data-parallax="0.3">{{layer2}}</div>
  <div class="parallax-layer" data-parallax="1">{{layer3}}</div>
</div>`,
                css: `.parallax-container{position:relative;overflow:hidden}.parallax-layer{position:absolute;will-change:transform;transition:transform 0.1s ease-out}`,
                js: `// Parallax on mouse move
function initParallax(){const layers=document.querySelectorAll('[data-parallax]');if(!layers.length)return;let mouse={x:0,y:0},current={x:0,y:0};document.addEventListener('mousemove',e=>{mouse.x=(e.clientX/window.innerWidth)-0.5;mouse.y=(e.clientY/window.innerHeight)-0.5});function animate(){current.x+=(mouse.x-current.x)*0.05;current.y+=(mouse.y-current.y)*0.05;layers.forEach(layer=>{const depth=parseFloat(layer.dataset.parallax)||1;const x=current.x*depth*60;const y=current.y*depth*60;layer.style.transform=\`translate(\${x}px,\${y}px)\`});requestAnimationFrame(animate)}animate()}
document.addEventListener('DOMContentLoaded',initParallax);`
            },
            'scroll-scenes': {
                html: `<section class="scene" data-scene="{{sceneName}}">
  <div class="scene-content">{{content}}</div>
</section>`,
                css: `[data-scene]{min-height:100vh;position:relative;display:flex;align-items:center;justify-content:center}.scene-content{position:relative;z-index:1}`,
                js: `// Scroll-triggered scene animations
function initScrollScenes(){document.querySelectorAll('[data-scene]').forEach(scene=>{const elements=scene.querySelectorAll('[data-scrub]');elements.forEach(el=>{const scrubType=el.dataset.scrub||'fade';const props=scrubType==='fade'?{opacity:0,y:100}:scrubType==='scale'?{scale:0.8,opacity:0}:{y:50,opacity:0};gsap.from(el,{...props,scrollTrigger:{trigger:scene,start:'top bottom',end:'center center',scrub:1}})});gsap.from(scene,{opacity:0,scrollTrigger:{trigger:scene,start:'top bottom',end:'top center',scrub:1}})})}
document.addEventListener('DOMContentLoaded',initScrollScenes);`
            },
            'grain-overlay': {
                html: `<div class="film-grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>`,
                css: `.film-grain{position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0.035;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")}.vignette{position:fixed;inset:0;pointer-events:none;z-index:9997;background:radial-gradient(ellipse at center,transparent 0%,transparent 50%,rgba(0,0,0,0.4) 100%)}`,
                js: `// Grain and vignette are CSS-only`
            },
            'capability-cards': {
                html: `<div class="capabilities-grid">
  {{#each capabilities}}
  <div class="capability-card liquid-glass" data-animate="fade-up">
    <div class="capability-header">
      <div class="capability-icon liquid-glass">{{icon}}</div>
      <div class="capability-tags">
        {{#each tags}}
        <span class="capability-tag liquid-glass">{{this}}</span>
        {{/each}}
      </div>
    </div>
    <div class="capability-content">
      <h3>{{title}}</h3>
      <p>{{description}}</p>
    </div>
  </div>
  {{/each}}
</div>`,
                css: `.capabilities-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}.capability-card{padding:1.5rem;border-radius:1.25rem;min-height:360px;display:flex;flex-direction:column}.capability-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:auto}.capability-icon{width:44px;height:44px;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;font-size:1.25rem}.capability-tags{display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:flex-end}.capability-tag{padding:0.25rem 0.75rem;border-radius:100px;font-size:0.7rem;white-space:nowrap}.capability-content{margin-top:auto}.capability-content h3{font-family:var(--font-heading);font-style:italic;font-size:2rem;margin-bottom:0.5rem}.capability-content p{font-size:0.9rem;color:rgba(255,255,255,0.7);line-height:1.6}`,
                js: `// Capability cards use standard scroll reveal`
            },
            'trust-bar': {
                html: `<div class="trust-bar" data-animate="fade-up">
  <div class="trust-badge liquid-glass">
    <span>{{badgeText}}</span>
  </div>
  <div class="trust-logos">
    {{#each logos}}
    <span class="trust-logo">{{this}}</span>
    {{/each}}
  </div>
</div>`,
                css: `.trust-bar{display:flex;flex-direction:column;align-items:center;gap:1.5rem;padding:2rem 0}.trust-badge{padding:0.5rem 1.5rem;border-radius:100px;font-size:0.85rem}.trust-logos{display:flex;align-items:center;gap:3rem;flex-wrap:wrap;justify-content:center}.trust-logo{font-family:var(--font-heading);font-style:italic;font-size:1.75rem;opacity:0.8;transition:opacity 0.3s ease}.trust-logo:hover{opacity:1}`,
                js: `// Trust bar uses standard scroll reveal`
            },
            'window-3d': {
                html: `<div class="window-3d spatial-window" data-3d-interactive data-reveal="blur">
  <div class="window-3d-titlebar">
    <span class="window-3d-dot window-3d-dot-red"></span>
    <span class="window-3d-dot window-3d-dot-yellow"></span>
    <span class="window-3d-dot window-3d-dot-green"></span>
    <span class="window-3d-title">{{title}}</span>
  </div>
  <div class="window-3d-body">
    {{content}}
  </div>
</div>`,
                css: `.window-3d{background:rgba(20,20,30,0.8);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;transform-style:preserve-3d;box-shadow:0 20px 60px rgba(0,0,0,0.5)}.window-3d-titlebar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.06)}.window-3d-dot{width:10px;height:10px;border-radius:50%;display:inline-block}.window-3d-dot-red{background:#ff5f57}.window-3d-dot-yellow{background:#febc2e}.window-3d-dot-green{background:#28c840}.window-3d-title{font-size:0.75rem;opacity:0.5}.window-3d-body{padding:16px}`,
                js: `// 3D window interactive mouse tilt
function init3DWindows(){document.querySelectorAll('.window-3d[data-3d-interactive]').forEach(win=>{win.addEventListener('mousemove',e=>{const rect=win.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;win.style.transform=\`perspective(1000px) rotateY(\${x*10}deg) rotateX(\${-y*10}deg) translateZ(10px)\`});win.addEventListener('mouseleave',()=>{win.style.transform=''})})}document.addEventListener('DOMContentLoaded',init3DWindows);`
            },
            'spatial-card': {
                html: `<div class="spatial-card" data-hover="perspective" data-scroll-3d="rotate">
  <h3>{{title}}</h3>
  <p>{{description}}</p>
</div>`,
                css: `.spatial-card{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;transform-style:preserve-3d;transition:transform 0.5s cubic-bezier(0.23,1,0.32,1)}`,
                js: `// Spatial card perspective interaction`
            },
            'neo-card': {
                html: `<div class="neo-card neo-flat" data-hover="lift">
  <h3>{{title}}</h3>
  <p>{{description}}</p>
</div>`,
                css: `.neo-card{padding:24px;background:var(--neo-bg,#e0e5ec);border-radius:20px;box-shadow:8px 8px 16px rgba(163,177,198,0.6),-8px -8px 16px rgba(255,255,255,0.8)}`,
                js: `// Neomorphic card pressed interaction`
            },
            'clay-card': {
                html: `<div class="clay-card" data-micro="bounce">
  <h3>{{title}}</h3>
  <p>{{description}}</p>
</div>`,
                css: `.clay-card{background:linear-gradient(145deg,#fef3f3,#ffe8e8);border-radius:28px;box-shadow:15px 15px 30px rgba(0,0,0,0.08),-8px -8px 16px rgba(255,255,255,0.9);padding:28px;border:2px solid rgba(255,255,255,0.6)}`,
                js: `// Claymorphism card bounce`
            },
            'brutal-card': {
                html: `<div class="brutal-card" data-hover="lift">
  <h3>{{title}}</h3>
  <p>{{description}}</p>
</div>`,
                css: `.brutal-card{background:#fff;border:3px solid #000;padding:24px;box-shadow:8px 8px 0 #000;position:relative;transition:all 0.2s ease}.brutal-card:hover{transform:translate(-4px,-4px);box-shadow:12px 12px 0 #000}`,
                js: `// Brutalism card hover`
            }
        };

        this.systemPrompt = `You are a principal frontend engineer + Awwwards creative developer who masters ALL design philosophies. You ship complete, production-ready websites that feel like $100K studio work.

DESIGN PHILOSOPHIES YOU UNDERSTAND:
- SKEUOMORPHISM: Use .skeu-surface, .skeu-button, .skeu-card, .skeu-input classes. Realistic textures and embossed shadows.
- NEOMORPHISM: Use .neo-flat, .neo-pressed, .neo-convex, .neo-button, .neo-input, .neo-card classes. Soft dual-shadow technique.
- GLASSMORPHISM: Use .glass, .glass-strong, .glass-dark, .glass-card, .glass-button, .glass-navbar classes. Frosted glass with blur.
- CLAYMORPHISM: Use .clay, .clay-card, .clay-button, .clay-bubble, .clay-tag classes. Soft 3D clay with pastels.
- MINIMALISM: Use .min-surface, .min-card, .min-button, .min-button-text, .min-input, .min-divider classes. Maximum whitespace.
- MAXIMALISM: Use .max-surface, .max-card, .max-button, .max-text-gradient, .max-sticker, .max-blob classes. Bold layered energy.
- BRUTALISM: Use .brutal-surface, .brutal-card, .brutal-button, .brutal-input, .brutal-tag, .brutal-stamp classes. Raw chunky anti-design.
- LIQUID GLASS: Use .liquid-glass, .liquid-glass-strong, .liquid-glass-tint, .liquid-glass-button, .liquid-glass-nav classes. Apple-style premium.
- SPATIAL UI: Use .spatial-scene, .spatial-card, .spatial-window, .spatial-button, .spatial-layer-* classes. 3D depth with perspective.

ADVANCED EFFECTS YOU IMPLEMENT:
- Hover: data-hover="lift|glow|tilt|spotlight|underline|perspective"
- 3D: data-3d="tilt|float|flip", data-scroll-3d="rotate|zoom|flip|spiral"
- Reveals: data-reveal="fade|slide-up|slide-left|clip|clip-circle|blur|split|pop|glitch"
- Micro: data-micro="bounce|ripple|magnetic|counter", data-micro="counter" data-target="1000"
- Parallax: data-parallax-scroll, data-parallax-depth + data-depth, data-parallax-mouse
- 3D Windows: .window-3d with .window-3d-titlebar, .window-3d-body
- 3D Backgrounds: .bg-3d-grid, .bg-3d-particles, .bg-3d-aurora
- Smooth Loader: .page-loader with .loader-spinner or .loader-bar
- Shimmer: data-shimmer for glass surfaces

CINEMATIC COMPONENTS:
- FadingVideo, BlurText, LiquidGlass, MagneticButtons, ParallaxLayers
- ScrollScenes, GrainVignette, StatsCards, CapabilityCards, TrustBar

GSAP PATTERNS:
- gsap.registerPlugin(ScrollTrigger), ScrollTrigger scrub, gsap.quickTo
- Staggered reveals, Pin/scrub sticky sections, Timeline chaining

RULES:
1. THINK before coding - plan the visual narrative using the specified DESIGN PHILOSOPHY
2. Output files as markdown code blocks with **File: filename** headers
3. Include all CDN links (GSAP, ScrollTrigger, Lenis, fonts)
4. Use design system CSS variables AND the design philosophy CSS classes throughout
5. Implement ALL motion systems AND advanced effects from the specification
6. Hero must be a SCENE - video, WebGL, or dramatic media
7. Use the correct design philosophy classes (e.g., .neo-card for neomorphism, .brutal-card for brutalism)
8. JavaScript must ACTUALLY WORK - test your logic mentally
9. Include prefers-reduced-motion fallbacks
10. Include a smooth page loader when specified
11. Use data-hover, data-3d, data-reveal, data-micro attributes for advanced effects
12. Include 3D scroll effects (data-scroll-3d) for immersive depth
13. Include 3D windows (.window-3d) for mockup/demo sections
14. Include 3D backgrounds when the art direction calls for depth
15. Generate substantial content - minimum 5 scenes/sections`;
    }

    async execute(specification, designSystem, threejsCode = null) {
        this.log('info', `Generating cinematic ${specification.complexity || 'premium'} website...`);

        const enhanced = designSystem.enhancedSpec || specification;
        const motionSystems = enhanced.motionSystems || [];
        const hasThreeJS = !!threejsCode;
        const isComplex = ['complex', 'ultra-complex'].includes(enhanced.complexity);

        // Build comprehensive context
        const artDirection = enhanced.artDirection || {};
        const brandStrategy = specification.brandStrategy || {};
        const designPhilosophy = enhanced.designPhilosophyName || designSystem.designPhilosophyName || 'Liquid Glass';
        const advancedEffects = enhanced.advancedEffects || designSystem.advancedEffects || [];

        const midFlightNotes = Array.isArray(specification.midFlightNotes) ? specification.midFlightNotes.filter(Boolean) : [];
        const midFlightBlock = midFlightNotes.length
            ? `\nMID-FLIGHT USER NOTES (must honor):\n${midFlightNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`
            : '';

        const contextBlock = `═══════════════════════════════════════════════════════
CINEMATIC WEBSITE BUILD — THIS IS YOUR CREATIVE MANDATE
═══════════════════════════════════════════════════════

SITE TYPE: ${enhanced.siteType}
TITLE: ${specification.title || 'Premium Website'}
DESCRIPTION: ${specification.description || ''}
${midFlightBlock}
★★★ DESIGN PHILOSOPHY: ${designPhilosophy} ★★★
Use ${designPhilosophy} CSS classes and visual patterns throughout.

ART DIRECTION:
${JSON.stringify(artDirection, null, 2)}

BRAND STRATEGY:
${JSON.stringify(brandStrategy, null, 2)}

COLOR PALETTE:
- Primary: ${enhanced.colorPalette?.primary || '#ffffff'}
- Secondary: ${enhanced.colorPalette?.secondary || '#888888'}
- Accent: ${enhanced.colorPalette?.accent || '#ff6b6b'}
- Background: ${enhanced.colorPalette?.background || '#000000'}
- Surface: ${enhanced.colorPalette?.surface || '#111111'}

TYPOGRAPHY:
- Heading: ${enhanced.typography?.heading || 'Instrument Serif'} (italic for editorial)
- Body: ${enhanced.typography?.body || 'Barlow'}
- Style: ${enhanced.typography?.style || 'editorial-italic'}

HERO TREATMENT: ${enhanced.heroTreatment || 'fullscreen-video-crossfade'}

MOTION SYSTEMS TO IMPLEMENT:
${motionSystems.map((m, i) => `${i + 1}. ${m}`).join('\n')}

ADVANCED EFFECTS TO USE:
${advancedEffects.map((e, i) => `${i + 1}. ${e}`).join('\n')}

COMPONENTS TO BUILD:
${(enhanced.components || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}

SECTIONS/SCENES:
${(enhanced.sections || ['hero', 'capabilities', 'about', 'testimonials', 'cta', 'footer']).join(' → ')}

THREE.JS: ${hasThreeJS ? 'Yes - include #three-canvas in hero' : 'No'}

INCLUDE THESE ELEMENTS:
- Page loader (.page-loader) with smooth entrance transition
- 3D scroll effects (data-scroll-3d) on cards and sections
- 3D window mockups (.window-3d) in demo/product sections
- 3D background effects (.bg-3d-grid or .bg-3d-particles or .bg-3d-aurora)
- Hover effects (data-hover="tilt" or "glow" or "lift") on interactive elements
- Entrance reveals (data-reveal="blur" or "slide-up" or "clip") on sections
- Micro interactions (data-micro="ripple" or "bounce") on buttons
- Custom cursor (if cursor effect is in advanced effects list)
- Parallax depth layers (data-parallax-depth + data-depth) on hero elements
- Shimmer effects (data-shimmer) on glass surfaces

═══════════════════════════════════════════════════════
BUILD WITH ${designPhilosophy.toUpperCase()} PHILOSOPHY — NOT A GENERIC TEMPLATE
═══════════════════════════════════════════════════════`;

        // Gather component templates
        const componentCSS = (enhanced.components || [])
            .filter(c => this.componentTemplates[c]?.css)
            .map(c => `/* ${c} */\n${this.componentTemplates[c].css}`)
            .join('\n\n');

        const componentJS = (enhanced.components || [])
            .filter(c => this.componentTemplates[c]?.js)
            .map(c => `// === ${c} ===\n${this.componentTemplates[c].js}`)
            .join('\n\n');

        // Motion system JS from designer
        const motionJS = designSystem.motionImplementations
            ? motionSystems
                .filter(m => designSystem.motionImplementations[m]?.js)
                .map(m => `// === ${m} ===\n${designSystem.motionImplementations[m].js}`)
                .join('\n\n')
            : '';

        try {
            // PASS 1: Generate HTML
            this.log('info', 'Pass 1/3: Generating cinematic HTML structure...');

            const htmlPrompt = `${contextBlock}

DESIGN SYSTEM CSS (reference these variables):
${designSystem.css.substring(0, 3000)}...

YOUR TASK: Generate a complete, cinematic index.html file.

REQUIREMENTS:
1. Include all CDN links: GSAP, ScrollTrigger, Lenis, Google Fonts${hasThreeJS ? ', Three.js' : ''}
2. Link to styles.css and script.js as external files
3. Structure as SCENES with data-scene attributes
4. Hero MUST be immersive: fullscreen video or dramatic media
5. Use liquid-glass class on nav, cards, badges
6. Use data-blur-text on hero headline
7. Use data-magnet on CTA buttons
8. Use data-animate on reveal elements
9. Use data-parallax on layered elements
10. Include film grain and vignette overlays if motion system requires
11. Minimum 5 substantial scenes with real content
12. Use brand strategy copy, not placeholder text
13. Semantic HTML5 with proper heading hierarchy
14. Mobile hamburger nav structure

Output ONLY the HTML file:
**File: index.html**
\`\`\`html
<!DOCTYPE html>
...
\`\`\``;

            const htmlResponse = await this.callLLM(htmlPrompt, this.systemPrompt, {
                temperature: 0.65,
                maxTokens: 32768,
            });

            const htmlFiles = this.extractFiles(htmlResponse);
            let html = htmlFiles['index.html'];
            if (!html) throw new Error('Pass 1 failed: no index.html generated');
            this.log('success', `Pass 1 complete: HTML ${html.split('\n').length} lines`);

            this._checkFrameworkAbort();

            // PASS 2: Generate CSS
            this.log('info', 'Pass 2/3: Generating cinematic CSS styles...');

            const htmlContext = html.length > 8000
                ? html.substring(0, 4000) + '\n... (middle) ...\n' + html.substring(html.length - 2000)
                : html;

            const cssPrompt = `${contextBlock}

DESIGN SYSTEM TOKENS (extend these, don't redefine):
${designSystem.css}

COMPONENT CSS TO INCLUDE:
${componentCSS}

HTML STRUCTURE (style these elements):
${htmlContext}

YOUR TASK: Generate a complete, cinematic styles.css file.

REQUIREMENTS:
1. Import/extend design system tokens
2. Include all component CSS provided above
3. Premium typography: huge hero text with clamp(), dramatic hierarchy
4. Generous whitespace rhythms (section padding 120px+)
5. Liquid glass effects with gradient border masks
6. Responsive: mobile-first with breakpoints at 768px, 1024px, 1440px
7. All animations use transform/opacity (GPU accelerated)
8. Include @media (prefers-reduced-motion: reduce) fallback
9. Premium hover effects (scale, glow, magnetic feel)
10. Make every section feel hand-designed

Output ONLY the CSS file:
**File: styles.css**
\`\`\`css
/* Cinematic styles */
...
\`\`\``;

            const cssResponse = await this.callLLM(cssPrompt, this.systemPrompt, {
                temperature: 0.6,
                maxTokens: 32768,
            });

            const cssFiles = this.extractFiles(cssResponse);
            const css = cssFiles['styles.css'];
            this.log('success', `Pass 2 complete: CSS ${css ? css.split('\n').length : 0} lines`);

            this._checkFrameworkAbort();

            // PASS 3: Generate JavaScript
            this.log('info', 'Pass 3/3: Generating cinematic JavaScript...');

            // Gather advanced animation JS from design system
            const advancedJS = designSystem.advancedAnimations
                ? (enhanced.advancedEffects || designSystem.advancedEffects || [])
                    .filter(e => designSystem.advancedAnimations[e]?.js && designSystem.advancedAnimations[e].js.trim().length > 0)
                    .map(e => `// === ${e} ===\n${designSystem.advancedAnimations[e].js}`)
                    .join('\n\n')
                : '';

            const jsPrompt = `${contextBlock}

MOTION SYSTEMS TO IMPLEMENT:
${motionSystems.join(', ')}

ADVANCED EFFECTS ENABLED:
${(enhanced.advancedEffects || []).join(', ')}

COMPONENT JS TO INCLUDE:
${componentJS}

MOTION SYSTEM JS TO INCLUDE:
${motionJS}

ADVANCED ANIMATION JS TO INCLUDE:
${advancedJS}

HTML STRUCTURE (target these elements):
${htmlContext}

YOUR TASK: Generate a complete, working script.js file.

THE FOLLOWING BOILERPLATE IS ALREADY INCLUDED (DO NOT REPEAT):
- Lenis smooth scroll with GSAP ticker integration
- GSAP ScrollTrigger registration
- Basic scroll-reveal for [data-animate] elements
- Navbar scroll behavior
- Mobile hamburger toggle
- Animated counters for [data-count]
- Reduced motion respect

GENERATE THE REST:
1. BlurText word-by-word reveal for [data-blur-text]
2. Magnetic buttons for [data-magnet] using gsap.quickTo
3. Parallax layers for [data-parallax]
4. FadingVideo crossfade for [data-fading-video]
5. Scroll scenes with pin/scrub for [data-scene]
6. 3D tilt effect for [data-3d="tilt"] (mousemove perspective)
7. 3D scroll effects for [data-scroll-3d] (rotateX/zoom on scroll)
8. Hover effects for [data-hover] (tilt, glow, spotlight, perspective)
9. Entrance reveals for [data-reveal] (IntersectionObserver → add .revealed class)
10. Micro interactions for [data-micro] (ripple, bounce, magnetic, counter)
11. Smooth page loader (if .page-loader exists)
12. 3D window interactivity for [data-3d-interactive] 
13. Parallax scroll for [data-parallax-scroll]
14. Parallax depth for [data-parallax-depth]
15. Custom cursor (if micro-cursor effect is enabled)
16. Shimmer sweep (CSS-only, no JS needed)
17. ${hasThreeJS ? 'Three.js scene initialization' : ''}
18. Form validation if forms exist
19. Any interactive components needed

INCLUDE THE ADVANCED ANIMATION JS PROVIDED ABOVE.

CRITICAL: Everything must ACTUALLY WORK. Test your logic mentally.

Output ONLY the JS file:
**File: script.js**
\`\`\`js
// Cinematic JavaScript with ${designPhilosophy} design philosophy
...
\`\`\``;

            const jsResponse = await this.callLLM(jsPrompt, this.systemPrompt, {
                temperature: 0.55,
                maxTokens: 32768,
            });

            const jsFiles = this.extractFiles(jsResponse);
            let userJS = jsFiles['script.js'] || '';
            this.log('success', `Pass 3 complete: JS ${userJS.split('\n').length} lines`);

            // Assemble final files
            const files = {};
            files['index.html'] = html;
            files['styles.css'] = css || this._getDefaultCSS(designSystem);
            files['script.js'] = this._injectGSAPBoilerplate() + '\n\n' + userJS;

            if (threejsCode) {
                files['three-scene.js'] = threejsCode;
            }

            // Quality check
            const total = Object.values(files).join('').length;
            if (total < 8000 || !files['index.html'] || !files['styles.css']) {
                throw new Error(`Generated site too thin (${total} chars). Need complete cinematic output.`);
            }

            for (const [name, content] of Object.entries(files)) {
                const lines = content.split('\n').length;
                this.log('info', `${name}: ${lines} lines, ${(content.length / 1024).toFixed(1)} KB`);
            }

            this.log('success', `Generated ${Object.keys(files).length} cinematic files`);
            return files;

        } catch (e) {
            if (e?.message === 'ABORTED') throw e;
            this.log('error', `Generation failed: ${e.message}`);
            throw e;
        }
    }

    _checkFrameworkAbort() {
        if (this.framework?.abortController?.signal?.aborted) {
            throw new Error('ABORTED');
        }
    }

    _injectGSAPBoilerplate() {
        return `/* ============================================================
   ZERO-BUILDER V2 — Cinematic GSAP + Lenis Boilerplate
   ============================================================ */
'use strict';

// === Lenis Smooth Scroll ===
let lenis;
try {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
    });

    lenis.on('scroll', () => {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
} catch(e) {
    console.warn('Lenis not available, using native scroll');
}

// === GSAP + ScrollTrigger ===
if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    // Scroll-reveal for [data-animate] elements
    document.querySelectorAll('[data-animate]').forEach(el => {
        const type = el.dataset.animate || 'fade-up';
        const delay = parseFloat(el.dataset.delay) || 0;

        const animations = {
            'fade-up': { y: 60, opacity: 0 },
            'fade-down': { y: -60, opacity: 0 },
            'fade-left': { x: 80, opacity: 0 },
            'fade-right': { x: -80, opacity: 0 },
            'scale': { scale: 0.85, opacity: 0 },
            'blur': { filter: 'blur(10px)', opacity: 0 }
        };

        if (type === 'stagger') {
            gsap.from(el.children, {
                y: 40, opacity: 0, duration: 0.8, stagger: 0.1, delay,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
            });
            return;
        }

        gsap.from(el, {
            ...animations[type] || animations['fade-up'],
            duration: 1, delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        });
    });
}

// === Navbar Scroll Behavior ===
const navbar = document.getElementById('navbar') || document.querySelector('nav');
if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        navbar.classList.toggle('scrolled', currentScroll > 50);
        lastScroll = currentScroll;
    }, { passive: true });
}

// === Mobile Hamburger ===
const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
const navLinks = document.getElementById('nav-links') || document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

// === Animated Counters ===
document.querySelectorAll('[data-count]').forEach(counter => {
    const target = parseInt(counter.dataset.count);
    if (isNaN(target)) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: function() {
                        counter.textContent = Math.round(obj.val).toLocaleString();
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    observer.observe(counter);
});

// === Reduced Motion Respect ===
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (lenis) lenis.destroy();
    document.documentElement.style.setProperty('--duration-fast', '0.01ms');
    document.documentElement.style.setProperty('--duration-base', '0.01ms');
    document.documentElement.style.setProperty('--duration-slow', '0.01ms');
}

/* ============================================================
   END BOILERPLATE — Custom cinematic logic below
   ============================================================ */`;
    }

    _getDefaultCSS(designSystem) {
        return designSystem.css + '\n\nbody { font-family: var(--font-body); background: var(--color-bg); color: var(--color-text); }';
    }
}

window.CoderUIAgent = CoderUIAgent;

;
/* ============================================================
   REACT CODER AGENT — Generates React 18 + Vite + R3F + Drei
   + Tailwind CSS v3 + GSAP + Framer Motion projects
   ============================================================ */

class CoderReactAgent extends BaseAgent {
    constructor() {
        super('CoderReact', 'Generates React + Vite + React Three Fiber projects');

        /* Hardcoded known-good versions — NEVER let the LLM pick these */
        this.packageVersions = {
            'react': '^18.3.1',
            'react-dom': '^18.3.1',
            '@react-three/fiber': '^8.17.10',
            '@react-three/drei': '^9.114.3',
            'three': '^0.165.0',
            'gsap': '^3.12.5',
            'framer-motion': '^11.11.17',
            '@emailjs/browser': '^4.4.1',
            'react-router-dom': '^6.26.2',
        };

        this.devVersions = {
            '@vitejs/plugin-react': '^4.3.4',
            'vite': '^5.4.11',
            'tailwindcss': '^3.4.13',
            'autoprefixer': '^10.4.20',
            'postcss': '^8.4.47',
        };

        this.systemPrompt = `You are a principal React engineer who ships production SPAs and dashboards using React 18, Vite, Tailwind CSS v3, GSAP, and Framer Motion. Output complete multi-file projects — never thin single-file demos or recovery shells. Use React Three Fiber only when the brief explicitly needs 3D.

TECH STACK (FIXED — do NOT change versions):
- React 18.3.1 + ReactDOM
- Vite 5 with @vitejs/plugin-react
- React Three Fiber (R3F) 8.x + Drei 9.x + Three.js 0.165 (optional; only for a purposeful 3D scene)
- Tailwind CSS 3.4 with PostCSS + Autoprefixer
- GSAP 3.12 (useGSAP hook pattern)
- Framer Motion 11 for page transitions and micro-animations
- @emailjs/browser for contact forms (no backend needed)
- react-router-dom 6 (optional, for multi-page)

YOUR QUALITY STANDARDS:
- Modern functional components with React Hooks (useState, useEffect, useRef, useMemo)
- Clean component architecture (components in logical files)
- Tailwind CSS for ALL styling (never use plain CSS files)
- Framer Motion for advanced animations and page transitions
- Lucide React for modern, beautiful icons
- Clean code with helpful comments explaining WHY, not just WHAT
- Premium, art-directed aesthetics chosen for the actual category. Do not default to bento boxes, glassmorphism, gradients, or 3D.
- Huge Typography and generous whitespace/padding (never cramped)
- Premium interactions (hover effects, micro-animations, transitions)
- Responsive design (mobile-first, works at 375px to 1440px+)
- Component architecture: small, focused, reusable components
- Performance: React.memo, useMemo for expensive 3D computations
- Accessibility: proper ARIA labels, keyboard navigation

COMPONENT PATTERNS:
\`\`\`jsx
// R3F Scene Component
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, OrbitControls } from '@react-three/drei'

function Scene() {
  const meshRef = useRef()
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5
  })
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <Float speed={2} rotationIntensity={1}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1, 4]} />
          <meshStandardMaterial color="#8B5CF6" wireframe />
        </mesh>
      </Float>
      <Stars radius={100} depth={50} count={1000} />
      <OrbitControls enableZoom={false} autoRotate />
    </Canvas>
  )
}
\`\`\`

\`\`\`jsx
// GSAP Animation Hook
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

function AnimatedSection({ children }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current.children, {
        y: 60, opacity: 0, duration: 1, stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' }
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return <div ref={ref}>{children}</div>
}
\`\`\`

\`\`\`jsx
// Magnet Component (Framer Motion)
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function Magnet({ children, padding = 100, disabled = false }) {
  const [isActive, setIsActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    if (disabled || !ref.current) return
    const { clientX, clientY } = e
    const { width, height, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 })
  }

  const reset = () => { setIsActive(false); setPosition({ x: 0, y: 0 }) }
  const handleMouseEnter = () => setIsActive(true)

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  )
}
\`\`\`

\`\`\`jsx
// Scroll-Driven Animated Text
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

function AnimatedText({ text }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] })
  const characters = text.split("")
  
  return (
    <p ref={ref}>
      {characters.map((char, i) => {
        const start = i / characters.length
        const end = start + (1 / characters.length)
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1])
        return <motion.span style={{ opacity }} key={i}>{char}</motion.span>
      })}
    </p>
  )
}
\`\`\`

RULES:
1. BEFORE outputting code, write out your step-by-step reasoning inside <thinking>...</thinking> tags. Plan the components, tailwind classes, animations, and architecture.
2. CRITICAL: You MUST NOT output JSON. Instead, output each file as a Markdown code block preceded by its exact file path in bold.
3. ALL styling must use Tailwind CSS utility classes. DO NOT output plain .css files except index.css for Tailwind directives.
4. If Three.js code is provided, integrate it using React Three Fiber.
5. The website must follow the provided art direction and feel intentionally designed, not like a generic AI landing-page template.
6. Use advanced components only when the art direction calls for them. Do not automatically add Magnet buttons, marquees, 3D scenes, glass cards, or sticky cards.
7. Use fluid typography exclusively for large text (e.g. text-[clamp(2rem,8vw,8rem)]).
8. Use HUGE padding and whitespace (e.g., py-24, gap-12). Websites must breathe.
9. Animate only the supplied motion plan and provide reduced-motion behavior.
10. Create reusable UI components (e.g., Button, Card, Section, Magnet, FadeIn) in a /src/components folder.
11. NEVER use generic borders; use border-white/10 or subtle gradients for borders (glassmorphism).
12. GSAP must use context + revert pattern for cleanup.
13. All interactive elements must be FULLY WORKING with proper error boundaries for 3D scenes.
14. Use CSS custom properties in tailwind.config.js for the design system colors.

OUTPUT FORMAT:
**File: package.json**
\`\`\`json
{
  "name": "project",
  "dependencies": { ... }
}
\`\`\`

**File: src/App.jsx**
\`\`\`jsx
export default function App() { return <div>Home</div> }
\`\`\`
`;
    }

    async execute(specification, designSystem, threejsCode = null) {
        this.log('info', `Generating React + Vite + R3F project [${specification.complexity || 'premium'}]...`);

        const sections = specification.sections || ['hero', 'features', 'about', 'projects', 'contact', 'footer'];
        const interactiveComponents = specification.interactiveComponents || [];
        const isComplex = ['complex', 'ultra-complex'].includes(specification.complexity);
        const colors = specification.colorPalette || {};

        const pages = Array.isArray(specification.pages) ? specification.pages : [];
        const architecture = specification.appArchitecture || {};
        const needsRouter = pages.length > 1 || isComplex || ['webapp', 'dashboard', 'saas-app', 'admin-panel'].includes(specification.siteType);

        const midFlight = Array.isArray(specification.midFlightNotes) && specification.midFlightNotes.length
            ? `\nMID-FLIGHT USER NOTES (must honor):\n${specification.midFlightNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`
            : '';

        const message = `Build a COMPLETE production React + Vite project (multi-file, large enough for real products):

SITE TYPE: ${specification.siteType}
COMPLEXITY: ${specification.complexity || 'complex'}
TITLE: ${specification.title || 'Premium Website'}
DESCRIPTION: ${specification.description || ''}
MOOD: ${specification.mood || 'editorial'}
${midFlight}
ART DIRECTION (follow this exactly):
${JSON.stringify(specification.artDirection || {}, null, 2)}

BRAND STRATEGY + APPROVED COPY:
${JSON.stringify(specification.brandStrategy || {}, null, 2)}

SIGNATURE QUALITY CONTRACT (non-negotiable):
${JSON.stringify(specification.qualityContract || {}, null, 2)}

AUTONOMOUS STUDIO INTELLIGENCE (implement the primary outcome and obey the motion policy):
${JSON.stringify(specification.studioIntelligence || {}, null, 2)}

APP ARCHITECTURE:
${JSON.stringify(architecture, null, 2)}

PAGES / ROUTES:
${JSON.stringify(pages, null, 2)}

SECTIONS (create a component for each where relevant):
${sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

INTERACTIVE COMPONENTS:
${interactiveComponents.map((c, i) => `${i + 1}. ${c}`).join('\n')}

COLOR PALETTE (use in tailwind.config.js extend.colors):
- Primary: ${colors.primary || '#C84B31'}
- Secondary: ${colors.secondary || '#173F5F'}
- Accent: ${colors.accent || '#F6C85F'}
- Background: ${colors.background || '#0B0B0C'}
- Surface: ${colors.surface || '#141416'}

TYPOGRAPHY:
- Heading: ${specification.typography?.heading || 'Instrument Serif'}
- Body: ${specification.typography?.body || 'Manrope'}

3D EFFECTS: ${specification.has3D ? 'YES — include a purposeful React Three Fiber <Canvas> scene with ' + (specification.threeDEffects || ['particles', 'floating-geometry']).join(', ') : 'NO — skip R3F'}

ANIMATIONS: ${(specification.artDirection?.motionPlan || specification.animations || []).slice(0, 3).join(', ')}

PACKAGE.JSON — use EXACTLY these versions (do NOT change):
${JSON.stringify({ dependencies: this.packageVersions, devDependencies: this.devVersions }, null, 2)}

CRITICAL INSTRUCTIONS:
- Split UI into multiple files under src/components/ (minimum 5 components for complex builds)
- ${needsRouter ? 'Use react-router-dom with real routes matching PAGES/ROUTES (Home + App/Dashboard at minimum)' : 'Single-page marketing layout is OK if pages length is 1'}
- For dashboards/apps: sidebar layout, stats, table/list, empty/loading states, local state or context
- Tailwind for ALL styling; Framer Motion + GSAP only where the motion plan requires
- Contact form with EmailJS placeholders when marketing pages exist
- Responsive, accessible, SEO meta in index.html
- Awwwards-level marketing surfaces; product surfaces must feel real (not fake SaaS metrics)
- NEVER output recovery shells, Lorem Ipsum, or single 20-line App.jsx as the whole product

Return each file as a Markdown code block preceded by its exact path. Do not return JSON.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.55,
            maxTokens: 32768,
        });

        try {
            const files = this.extractFiles(response);

            // Ensure package.json has correct versions
            if (files['package.json']) {
                files['package.json'] = this._fixPackageJson(files['package.json'], specification);
            } else {
                files['package.json'] = this._generatePackageJson(specification);
            }

            // Ensure critical config files exist
            if (!files['vite.config.js']) files['vite.config.js'] = this._defaultViteConfig();
            if (!files['postcss.config.js']) files['postcss.config.js'] = this._defaultPostCSSConfig();
            if (!files['tailwind.config.js']) files['tailwind.config.js'] = this._defaultTailwindConfig(colors);
            if (!files['index.html']) files['index.html'] = this._defaultIndexHtml(specification);
            if (!files['src/main.jsx']) files['src/main.jsx'] = this._defaultMainJsx();
            if (!files['src/index.css']) files['src/index.css'] = this._defaultIndexCss();

            const componentCount = Object.keys(files).filter(f => f.includes('components/')).length;
            const total = Object.values(files).join('').length;
            if (total < 6000) {
                throw new Error(`React project too thin (${total} chars). Need multi-file production output.`);
            }
            if (isComplex && componentCount < 3) {
                throw new Error(`Complex React build only produced ${componentCount} components — insufficient structure.`);
            }

            this.log('success', `React project generated: ${Object.keys(files).length} files, ${componentCount} components`);
            return files;
        } catch (e) {
            if (e?.message === 'ABORTED') throw e;
            this.log('error', `React generation failed (no weak fallback): ${e.message}`);
            throw e;
        }
    }

    /* ===== FIX PACKAGE.JSON WITH KNOWN-GOOD VERSIONS ===== */
    _fixPackageJson(pkgJsonStr, spec) {
        try {
            const pkg = typeof pkgJsonStr === 'string' ? JSON.parse(pkgJsonStr) : pkgJsonStr;

            // Force correct versions
            pkg.dependencies = pkg.dependencies || {};
            Object.assign(pkg.dependencies, this.packageVersions);

            // Only include R3F if 3D is needed
            if (!spec.has3D) {
                delete pkg.dependencies['@react-three/fiber'];
                delete pkg.dependencies['@react-three/drei'];
                delete pkg.dependencies['three'];
            }

            pkg.devDependencies = pkg.devDependencies || {};
            Object.assign(pkg.devDependencies, this.devVersions);

            return JSON.stringify(pkg, null, 2);
        } catch (e) {
            return this._generatePackageJson(spec);
        }
    }

    _generatePackageJson(spec) {
        const deps = { ...this.packageVersions };
        if (!spec.has3D) {
            delete deps['@react-three/fiber'];
            delete deps['@react-three/drei'];
            delete deps['three'];
        }

        return JSON.stringify({
            name: (spec.title || 'premium-website').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            private: true,
            version: '1.0.0',
            type: 'module',
            scripts: {
                dev: 'vite',
                build: 'vite build',
                preview: 'vite preview',
            },
            dependencies: deps,
            devDependencies: this.devVersions,
        }, null, 2);
    }

    _defaultViteConfig() {
        return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;
    }

    _defaultPostCSSConfig() {
        return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    }

    _defaultTailwindConfig(colors) {
        return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '${colors.primary || '#8B5CF6'}',
        secondary: '${colors.secondary || '#06D6A0'}',
        accent: '${colors.accent || '#F59E0B'}',
        dark: {
          DEFAULT: '${colors.background || '#0A0A0F'}',
          surface: '${colors.surface || '#1A1A2E'}',
          hover: '#22223A',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
`;
    }

    _defaultIndexHtml(spec) {
        return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${spec.title || 'Premium Website'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-dark text-white antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
    }

    _defaultMainJsx() {
        return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`;
    }

    _defaultIndexCss() {
        return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
  }
  body {
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
}
`;
    }

    /* ===== FALLBACK: Generate a complete React project from scratch ===== */
    _generateFallback(spec, design) {
        const title = spec.title || 'Premium Website';
        const colors = spec.colorPalette || {};
        const primary = colors.primary || '#8B5CF6';
        const secondary = colors.secondary || '#06D6A0';

        const files = {};

        files['package.json'] = this._generatePackageJson(spec);
        files['vite.config.js'] = this._defaultViteConfig();
        files['postcss.config.js'] = this._defaultPostCSSConfig();
        files['tailwind.config.js'] = this._defaultTailwindConfig(colors);
        files['index.html'] = this._defaultIndexHtml(spec);
        files['src/main.jsx'] = this._defaultMainJsx();
        files['src/index.css'] = this._defaultIndexCss();

        files['src/App.jsx'] = `import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </div>
  )
}
`;

        files['src/components/Navbar.jsx'] = `import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['About', 'Projects', 'Contact']

  return (
    <nav className={\`fixed top-0 w-full z-50 transition-all duration-500 \${scrolled ? 'bg-dark/80 backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'}\`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="text-xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          ${title}
        </a>
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <a key={link} href={\`#\${link.toLowerCase()}\`}
               className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              {link}
            </a>
          ))}
          <a href="#contact" className="ml-3 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
            Get in Touch
          </a>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
          <span className={\`w-5 h-0.5 bg-white transition-all \${mobileOpen ? 'rotate-45 translate-y-2' : ''}\`} />
          <span className={\`w-5 h-0.5 bg-white transition-all \${mobileOpen ? 'opacity-0' : ''}\`} />
          <span className={\`w-5 h-0.5 bg-white transition-all \${mobileOpen ? '-rotate-45 -translate-y-2' : ''}\`} />
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-dark/95 backdrop-blur-xl border-b border-white/5 p-6 flex flex-col gap-4">
          {links.map(link => (
            <a key={link} href={\`#\${link.toLowerCase()}\`}
               onClick={() => setMobileOpen(false)}
               className="text-lg text-white/70 hover:text-white">{link}</a>
          ))}
        </div>
      )}
    </nav>
  )
}
`;

        files['src/components/Hero.jsx'] = `import { motion } from 'framer-motion'
import Scene from './Scene'

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-8">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Welcome to the future
        </motion.div>
        <motion.h1 initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-none mb-6 bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
          ${title}
        </motion.h1>
        <motion.p initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
          ${spec.description || 'A premium digital experience built with cutting-edge technology.'}
        </motion.p>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex gap-4 justify-center flex-wrap">
          <a href="#projects" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
            View Projects
          </a>
          <a href="#about" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:-translate-y-1">
            Learn More
          </a>
        </motion.div>
      </div>
    </section>
  )
}
`;

        files['src/components/Scene.jsx'] = `import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function Particles({ count = 800 }) {
  const mesh = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  useFrame((state) => {
    mesh.current.rotation.y = state.clock.elapsedTime * 0.05
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#8B5CF6" sizeAttenuation transparent opacity={0.8} />
    </points>
  )
}

function FloatingShape() {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 0.2
    ref.current.rotation.y += delta * 0.3
  })
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.2, 4]} />
        <meshStandardMaterial color="#8B5CF6" wireframe transparent opacity={0.3} />
      </mesh>
    </Float>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#8B5CF6" />
      <Particles />
      <FloatingShape />
      <Stars radius={100} depth={60} count={1500} factor={3} saturation={0} fade speed={1} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  )
}
`;

        files['src/components/About.jsx'] = `import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function About() {
  const stats = [
    { value: 500, suffix: '+', label: 'Projects' },
    { value: 99, suffix: '%', label: 'Satisfaction' },
    { value: 50, suffix: '+', label: 'Awards' },
    { value: 10, suffix: 'K+', label: 'Users' },
  ]

  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">About</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              Built for Teams That <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Demand Excellence</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-10">
              We combine cutting-edge technology with timeless design principles to create digital experiences that inspire and perform.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-3xl font-display font-bold text-white">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }} transition={{ duration: 0.8 }}
                      className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5 relative overflow-hidden">
            <div className="absolute w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/30 rounded-full blur-[80px] animate-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
`;

        files['src/components/Projects.jsx'] = `import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const projects = [
  { id: 1, title: 'Aurora Dashboard', desc: 'AI-powered analytics platform with real-time data visualization', tags: ['React', 'Three.js', 'AI'], color: 'from-violet-600 to-indigo-600' },
  { id: 2, title: 'NeoCommerce', desc: 'Next-gen e-commerce with 3D product previews and AR try-on', tags: ['Next.js', 'R3F', 'Stripe'], color: 'from-emerald-600 to-teal-600' },
  { id: 3, title: 'SynthWave OS', desc: 'Retro-futuristic desktop environment for the browser', tags: ['React', 'WebGL', 'WASM'], color: 'from-pink-600 to-rose-600' },
  { id: 4, title: 'DataForge', desc: 'Visual data pipeline builder with drag-and-drop nodes', tags: ['React Flow', 'D3.js', 'Python'], color: 'from-amber-600 to-orange-600' },
]

function ProjectCard({ project, index }) {
  const [hover, setHover] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -15, y: x * 15 })
  }

  return (
    <motion.div initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseMove={handleMouse} onMouseEnter={() => setHover(true)}
                onMouseLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }); }}
                style={{ transform: \`perspective(1000px) rotateX(\${tilt.x}deg) rotateY(\${tilt.y}deg)\` }}
                className="group relative rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className={\`h-48 bg-gradient-to-br \${project.color} opacity-80 group-hover:opacity-100 transition-opacity\`} />
      <div className="p-6">
        <h3 className="text-xl font-display font-bold mb-2">{project.title}</h3>
        <p className="text-white/50 text-sm mb-4 leading-relaxed">{project.desc}</p>
        <div className="flex gap-2 flex-wrap">
          {project.tags.map(tag => (
            <span key={tag} className="px-3 py-1 text-xs rounded-full bg-white/5 text-white/60 border border-white/10">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">Projects</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Featured <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Work</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
`;

        files['src/components/Contact.jsx'] = `import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function Contact() {
  const formRef = useRef()
  const [status, setStatus] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    // EmailJS integration placeholder
    // import emailjs from '@emailjs/browser'
    // await emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formRef.current, 'YOUR_PUBLIC_KEY')
    setTimeout(() => {
      setStatus('sent')
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setStatus(''), 3000)
    }, 1000)
  }

  return (
    <section id="contact" className="py-32">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">Contact</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            Let's <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Connect</span>
          </h2>
          <p className="text-white/50">Have a project in mind? Let's build something extraordinary together.</p>
        </motion.div>
        <motion.form ref={formRef} onSubmit={handleSubmit}
                     initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                     viewport={{ once: true }} transition={{ delay: 0.2 }}
                     className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="Your Name"
                   className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Your Email"
                   className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors" />
          </div>
          <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Your Message" rows={5}
                    className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors resize-none" />
          <button type="submit" disabled={status === 'sending'}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-50">
            {status === 'sending' ? 'Sending...' : status === 'sent' ? '✓ Sent!' : 'Send Message'}
          </button>
        </motion.form>
      </div>
    </section>
  )
}
`;

        files['src/components/Footer.jsx'] = `export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-white/30">
            &copy; ${new Date().getFullYear()} ${title}. All rights reserved.
          </span>
          <span className="text-sm text-white/30">
            Built with ZERO-BUILDER AI
          </span>
        </div>
      </div>
    </footer>
  )
}
`;

        return files;
    }
}

window.CoderReactAgent = CoderReactAgent;

;
/* ============================================================
   FULLSTACK CODER AGENT — Generates Next.js 14 App Router +
   Prisma + Tailwind CSS v3 projects
   ============================================================ */

class CoderFullstackAgent extends BaseAgent {
    constructor() {
        super('CoderFullstack', 'Generates Full-Stack Next.js + Prisma projects');

        this.config = {
            maxSourceFiles: 14,
            fallbackSourceFiles: 8,
            maxFileChars: 18000,
            headChars: 11000,
            tailChars: 3500,
            temperatureFoundation: 0.28,
            temperatureBuild: 0.42,
            temperatureRepair: 0.25,
            maxTokens: 32768,
        };

        /* Hardcoded known-good versions */
        this.packageVersions = {
            next: '14.2.3',
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            '@prisma/client': '^5.14.0',
            'lucide-react': '^0.379.0',
            'framer-motion': '^11.2.6',
            clsx: '^2.1.1',
            'tailwind-merge': '^2.3.0',
        };

        this.devVersions = {
            prisma: '^5.14.0',
            tailwindcss: '^3.4.3',
            postcss: '^8.4.38',
            autoprefixer: '^10.4.19',
            typescript: '^5.4.5',
            '@types/node': '^20.12.12',
            '@types/react': '^18.3.2',
            '@types/react-dom': '^18.3.0',
        };

        this.systemPrompt = `
You are a principal full-stack engineer who ships complete Next.js 14 products (App Router + Prisma + Tailwind + Framer Motion).

You handle large multi-page apps with auth boundaries, real database models, API validation, dashboards, and premium marketing surfaces. Never ship thin recovery shells.

TECH STACK (FIXED — do NOT change versions)
- Next.js 14 (App Router)
- React 18.3.1 + ReactDOM
- Prisma ORM 5.14 (SQLite by default for easy sandbox testing)
- Tailwind CSS 3.4 with PostCSS + Autoprefixer
- Framer Motion 11 for page transitions and micro-animations
- Lucide React for modern icons

QUALITY STANDARDS
- Modern Next.js App Router conventions (app/layout.tsx, app/page.tsx, app/api/.../route.ts).
- Clean Server Components by default; Client Components only where interactivity is needed.
- Tailwind CSS for all styling.
- Prisma schema must match the requested dbModels.
- Generate valid Next.js Route Handlers for requested apiEndpoints.
- Premium Awwwards-level aesthetics: Bento layouts, asymmetric grids, thin borders, generous whitespace.
- Follow the supplied art direction precisely.
- Do not default to purple gradients, generic dashboard cards, random 3D, or ornamental motion when the brief does not call for them.

COMPONENT PATTERNS

\`\`\`tsx
// Magnet Component (Framer Motion)
"use client"
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function Magnet({ children, disabled = false }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: any) => {
    if (disabled || !ref.current) return
    const { clientX, clientY } = e
    const { width, height, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  )
}
\`\`\`

\`\`\`tsx
// Scroll-Driven Animated Text
"use client"
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function AnimatedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] })
  const characters = text.split("")

  return (
    <p ref={ref}>
      {characters.map((char, i) => {
        const start = i / characters.length
        const end = start + (1 / characters.length)
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1])
        return <motion.span style={{ opacity }} key={i}>{char}</motion.span>
      })}
    </p>
  )
}
\`\`\`

RULES
1. Think through the architecture before outputting code.
2. Do not output JSON.
3. Output each file as a Markdown code block preceded by its exact file path in bold.
4. Tailwind CSS must be used for all styling.
5. Create reusable UI components in components/ when they earn their place.
6. Use CSS custom properties in globals.css for the design system colors, and extend tailwind.config.ts to use them.
7. Use fluid typography for large text.
8. Avoid generic borders; prefer border-white/10 or subtle gradients.
9. If auth or dashboard flows are implied, include the supporting routes and guard structure.
10. Return only files you changed.

OUTPUT FORMAT
**File: package.json**
\`\`\`json
{
  "name": "project",
  "dependencies": { ... }
}
\`\`\`

**File: app/page.tsx**
\`\`\`tsx
export default function Page() { return <div>Home</div> }
\`\`\`
        `.trim();
    }

    detectProjectType(files = {}) {
        const names = Object.keys(files);
        const isNextAppRouter = names.some((name) =>
            /^(app|src\/app)\//.test(name) || /route\.ts$/.test(name)
        );
        const isReactOnly = names.some((name) => /\.(tsx|jsx)$/.test(name));
        const isBackendExisting = names.some((name) =>
            /prisma\/schema\.prisma|lib\/prisma\.ts|middleware\.ts|auth\./.test(name)
        );

        return { isNextAppRouter, isReactOnly, isBackendExisting };
    }

    inferRequirements(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();

        const hasAuth = /auth|login|signup|session|token|jwt|oauth|sso|magic link|password/.test(blob);
        const hasRoles = /role|permission|rbac|admin|staff|owner|member|team/.test(blob);
        const hasOrgs = /organization|workspace|tenant|multi-tenant|company|team/.test(blob);
        const hasBilling = /billing|subscription|plan|stripe|invoice|payment|checkout/.test(blob);
        const hasContent = /post|comment|message|chat|feed|article|blog|cms|note/.test(blob);
        const hasFiles = /upload|file|asset|image|media|storage/.test(blob);
        const hasAudit = /audit|log|history|activity/.test(blob);
        const hasAnalytics = /analytics|metric|event|tracking|dashboard/.test(blob);
        const hasRealtime = /realtime|live|websocket|presence|notification/.test(blob);
        const hasApiHeavy = /api|route|endpoint|crud|rest/.test(blob);
        const hasDashboard = /dashboard|admin|workspace|portal|backoffice/.test(blob);
        const isMarketing = /landing|marketing|website|hero|agency|brand|portfolio/.test(blob);

        return {
            hasAuth,
            hasRoles,
            hasOrgs,
            hasBilling,
            hasContent,
            hasFiles,
            hasAudit,
            hasAnalytics,
            hasRealtime,
            hasApiHeavy,
            hasDashboard,
            isMarketing,
        };
    }

    scoreFile(name, isNextAppRouter) {
        if (isNextAppRouter) {
            const weights = [
                [/^app\/api\/.+\/route\.ts$/, 100],
                [/^src\/app\/api\/.+\/route\.ts$/, 100],
                [/^prisma\/schema\.prisma$/, 95],
                [/^lib\/prisma\.ts$/, 90],
                [/^lib\/auth\.(ts|tsx)$/, 85],
                [/^middleware\.ts$/, 82],
                [/^tailwind\.config\.(ts|js|mjs)$/, 80],
                [/^app\/layout\.(ts|tsx)$/, 78],
                [/^app\/globals\.css$/, 76],
                [/^app\/page\.(ts|tsx)$/, 72],
                [/components\//, 60],
                [/^types\//, 50],
                [/^lib\//, 45],
                [/\.(ts|tsx)$/, 30],
            ];

            return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
        }

        const weights = [
            [/^prisma\/schema\.prisma$/, 100],
            [/^lib\/prisma\.ts$/, 90],
            [/^app\/api\/.+\/route\.ts$/, 85],
            [/^app\/layout\.(ts|tsx)$/, 70],
            [/^app\/page\.(ts|tsx)$/, 68],
            [/\.(ts|tsx|js|jsx)$/, 35],
        ];

        return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
    }

    selectSourceFiles(files = {}) {
        const entries = Object.entries(files);
        if (!entries.length) return {};

        const { isNextAppRouter } = this.detectProjectType(files);

        const ranked = entries
            .map(([name, content]) => ({
                name,
                content,
                score: this.scoreFile(name, isNextAppRouter),
                length: String(content ?? '').length,
            }))
            .sort((a, b) => b.score - a.score || b.length - a.length);

        const selected = ranked
            .filter((item) => item.score > 0)
            .slice(0, this.config.maxSourceFiles);

        if (selected.length) {
            return Object.fromEntries(selected.map(({ name, content }) => [name, content]));
        }

        return Object.fromEntries(entries.slice(0, this.config.fallbackSourceFiles));
    }

    smartTruncate(text) {
        const source = String(text ?? '');
        if (source.length <= this.config.maxFileChars) return source;

        return (
            source.slice(0, this.config.headChars) +
            '\n/* ... truncated for full-stack pass ... */\n' +
            source.slice(-this.config.tailChars)
        );
    }

    compactFileContents(source = {}) {
        const compactSource = {};
        for (const [name, content] of Object.entries(source)) {
            compactSource[name] = this.smartTruncate(content);
        }
        return compactSource;
    }

    buildProjectBrief({
        specification = {},
        sourceFiles = {},
        isNextAppRouter = true,
        requirements = {},
    }) {
        const sections = Array.isArray(specification.sections) && specification.sections.length
            ? specification.sections
            : ['hero', 'features', 'about', 'cta', 'footer'];

        const interactiveComponents = Array.isArray(specification.interactiveComponents)
            ? specification.interactiveComponents
            : [];

        const dbModels = Array.isArray(specification.dbModels) && specification.dbModels.length
            ? specification.dbModels
            : [
                { name: 'User', fields: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'] },
                { name: 'Item', fields: ['id', 'title', 'status', 'ownerId', 'createdAt', 'updatedAt'] },
            ];

        const apiEndpoints = Array.isArray(specification.apiEndpoints) && specification.apiEndpoints.length
            ? specification.apiEndpoints
            : [
                { method: 'GET', path: '/api/health', purpose: 'Health check' },
                { method: 'GET', path: '/api/items', purpose: 'List items' },
                { method: 'POST', path: '/api/items', purpose: 'Create item' },
            ];

        const pages = Array.isArray(specification.pages) && specification.pages.length
            ? specification.pages
            : [
                { id: 'home', path: '/', purpose: 'Marketing' },
                { id: 'login', path: '/login', purpose: 'Auth' },
                { id: 'dashboard', path: '/dashboard', purpose: 'Authenticated workspace' },
            ];

        const architecture = specification.appArchitecture || {};
        const colors = specification.colorPalette || {};
        const title = specification.title || 'Premium Web App';
        const description = specification.description || '';
        const needsAuth = !!(architecture.auth && architecture.auth !== 'none' || requirements.hasAuth);

        const requiredFiles = [
            'package.json',
            'tsconfig.json',
            'next.config.mjs',
            'postcss.config.mjs',
            'tailwind.config.ts',
            'prisma/schema.prisma',
            'lib/prisma.ts',
            'app/layout.tsx',
            'app/globals.css',
        ];

        if (needsAuth) {
            requiredFiles.push('lib/auth.ts', 'middleware.ts');
        }

        if (requirements.hasApi || requirements.hasDashboard || requirements.hasContent || requirements.hasBilling || requirements.hasAnalytics) {
            requiredFiles.push('app/api/.../route.ts');
        }

        const fileBlocks = Object.entries(sourceFiles)
            .map(([name, body]) => `\n**File: ${name}**\n\`\`\`\n${body}\n\`\`\``)
            .join('\n');

        const midFlight = Array.isArray(specification.midFlightNotes) && specification.midFlightNotes.length
            ? `\nMID-FLIGHT USER NOTES (must honor)\n${specification.midFlightNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`
            : '';

        return `
Build a complete Next.js 14 full-stack product.

SITE TYPE
${specification.siteType || 'premium web app'}

TITLE
${title}

DESCRIPTION
${description}
${midFlight}
COMPLEXITY
${specification.complexity || 'ultra-complex'}

ART DIRECTION
${JSON.stringify(specification.artDirection || {}, null, 2)}

BRAND STRATEGY + APPROVED COPY
${JSON.stringify(specification.brandStrategy || {}, null, 2)}

QUALITY CONTRACT
${JSON.stringify(specification.qualityContract || {}, null, 2)}

AUTONOMOUS STUDIO INTELLIGENCE
${JSON.stringify(specification.studioIntelligence || {}, null, 2)}

APP ARCHITECTURE
${JSON.stringify(architecture, null, 2)}

PAGES / ROUTES
${JSON.stringify(pages, null, 2)}

DATABASE MODELS
${JSON.stringify(dbModels, null, 2)}

API ENDPOINTS
${JSON.stringify(apiEndpoints, null, 2)}

SECTIONS / UI
${sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

INTERACTIVE COMPONENTS
${interactiveComponents.map((c, i) => `${i + 1}. ${c}`).join('\n') || 'n/a'}

COLORS
- Primary: ${colors.primary || '#C84B31'}
- Secondary: ${colors.secondary || '#173F5F'}
- Accent: ${colors.accent || '#F6C85F'}
- Background: ${colors.background || '#0B0B0C'}
- Surface: ${colors.surface || '#141416'}

DETECTED REQUIREMENTS
${JSON.stringify(requirements, null, 2)}

REQUIRED OUTPUT FILES
${requiredFiles.map((f) => `- ${f}`).join('\n')}

PACKAGE VERSIONS
${JSON.stringify({ dependencies: this.packageVersions, devDependencies: this.devVersions }, null, 2)}

FILES TO CONSIDER
${fileBlocks}

GUIDELINES
- Use the App Router.
- Use Prisma properly with a real schema and timestamps.
- Build route handlers with validation and robust status codes.
- Add auth/guard structure when implied.
- Include shared utilities like lib/prisma.ts and lib/utils.ts.
- Use Tailwind for all styling.
- Keep the experience premium, spacious, and deliberate.
- Do not ship a recovery shell.
- Return only updated files in Markdown code blocks.
        `.trim();
    }

    buildFoundationPrompt(sharedContext) {
        return `${sharedContext}

PASS 1 TASK — FOUNDATION ONLY
Generate ONLY foundation and infrastructure files:
- package.json
- tsconfig.json
- next.config.mjs
- postcss.config.mjs
- tailwind.config.ts
- prisma/schema.prisma
- lib/prisma.ts
- lib/utils.ts
- app/layout.tsx
- app/globals.css
- .env.example
- .gitignore
- README.md
- components/ui basics only if needed

Do not generate full marketing pages or complete dashboard pages yet. Markdown file blocks only.`;
    }

    buildPagesPrompt(sharedContext, existingFiles) {
        return `${sharedContext}

PASS 2 TASK — PRODUCT SURFACES
Existing files already created:
${Object.keys(existingFiles).join('\n')}

Generate or replace:
- app/page.tsx
- app/login/page.tsx or equivalent auth page if needed
- dashboard/admin/workspace routes from the brief
- reusable components in components/
- navigation, footer, cards, tables, filters, and shared UI

Use Tailwind and the approved art direction. Do not output JSON. Markdown file blocks only.`;
    }

    buildApiPrompt(sharedContext, existingFiles) {
        return `${sharedContext}

PASS 3 TASK — BACKEND API SURFACE
Existing files already created:
${Object.keys(existingFiles).join('\n')}

Generate or complete:
- app/api/**/route.ts for all API endpoints
- validation helpers if needed
- auth guards and tenant scoping if relevant
- data fetching paths aligned to prisma/schema.prisma

Use production-ready TypeScript. Markdown file blocks only.`;
    }

    buildRepairPrompt(sharedContext, missingFiles, existingFiles) {
        return `${sharedContext}

REPAIR TASK — FILL THE MISSING PIECES
Existing files:
${Object.keys(existingFiles).join('\n')}

Missing / incomplete files to add or repair:
${missingFiles.map((f) => `- ${f}`).join('\n')}

Return only the files necessary to complete the project. Markdown file blocks only.`;
    }

    normalizeProjectFiles(files = {}, specification = {}) {
        if (files['package.json']) {
            try {
                const pkg = JSON.parse(files['package.json']);
                pkg.scripts = {
                    dev: 'next dev',
                    build: 'prisma generate && next build',
                    start: 'next start',
                    lint: 'next lint',
                    'db:push': 'prisma db push',
                    'db:studio': 'prisma studio',
                };
                pkg.dependencies = { ...(pkg.dependencies || {}), ...this.packageVersions };
                pkg.devDependencies = { ...(pkg.devDependencies || {}), ...this.devVersions };
                files['package.json'] = JSON.stringify(pkg, null, 2);
            } catch (_) {
                // keep original if malformed
            }
        }

        if (!files['tsconfig.json'] || !String(files['tsconfig.json']).includes('"paths"')) {
            files['tsconfig.json'] = JSON.stringify({
                compilerOptions: {
                    target: 'es2022',
                    lib: ['dom', 'dom.iterable', 'esnext'],
                    allowJs: true,
                    skipLibCheck: true,
                    strict: false,
                    forceConsistentCasingInFileNames: true,
                    noEmit: true,
                    esModuleInterop: true,
                    module: 'esnext',
                    moduleResolution: 'node',
                    resolveJsonModule: true,
                    isolatedModules: true,
                    jsx: 'preserve',
                    incremental: true,
                    baseUrl: '.',
                    paths: {
                        '@/*': ['./*'],
                    },
                    plugins: [{ name: 'next' }],
                },
                include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
                exclude: ['node_modules'],
            }, null, 2);
        }

        if (!files['next.config.mjs']) {
            files['next.config.mjs'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
`;
        }

        if (!files['postcss.config.mjs']) {
            files['postcss.config.mjs'] = `const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;
        }

        if (!files['tailwind.config.ts']) {
            files['tailwind.config.ts'] = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        card: 'hsl(var(--card))',
        border: 'hsl(var(--border))',
      },
    },
  },
  plugins: [],
};

export default config;
`;
        }

        if (!files['.env.example']) {
            files['.env.example'] = `# Copy to .env for local development
DATABASE_URL="file:./dev.db"
AUTH_SECRET="generate-a-long-random-string"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
`;
        }

        if (!files['.gitignore']) {
            files['.gitignore'] = `node_modules
.next
.env
*.db
*.db-journal
`;
        }

        if (!files['README.md']) {
            files['README.md'] = `# ${specification.title || 'ZERO Full-Stack App'}

## Setup

\`\`\`bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
\`\`\`
`;
        }

        if (!files['lib/utils.ts']) {
            files['lib/utils.ts'] = `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
        }

        return files;
    }

    extractParsedFiles(responseText) {
        if (typeof this.extractFiles === 'function') {
            const parsed = this.extractFiles(responseText);
            if (parsed && Object.keys(parsed).length) return parsed;
        }
        return this._extractFilesFromMarkdown(responseText);
    }

    _extractFilesFromMarkdown(responseText) {
        const text = String(responseText ?? '');
        const files = {};
        const sectionRegex = /\*\*File:\s*([^\n*]+)\*\*\s*```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g;
        let match;
        while ((match = sectionRegex.exec(text)) !== null) {
            files[match[1].trim()] = match[2].replace(/\s+$/, '');
        }
        return files;
    }

    validateOutputFiles(parsedFiles = {}, sourceFiles = {}, requirements = {}) {
        const safe = {};
        const allowedLoose = new Set([
            'package.json',
            'tsconfig.json',
            'next.config.mjs',
            'postcss.config.mjs',
            'tailwind.config.ts',
            'prisma/schema.prisma',
            'lib/prisma.ts',
            'lib/utils.ts',
            'lib/auth.ts',
            'middleware.ts',
            '.env.example',
            '.gitignore',
            'README.md',
        ]);

        for (const [name, content] of Object.entries(parsedFiles)) {
            const isAllowed =
                Object.prototype.hasOwnProperty.call(sourceFiles, name) ||
                allowedLoose.has(name) ||
                /^app\/api\/.+\/route\.(ts|tsx|js|jsx|mjs)$/.test(name) ||
                /^app\/.+\/page\.(ts|tsx|js|jsx)$/.test(name) ||
                /^app\/layout\.(ts|tsx|js|jsx)$/.test(name) ||
                /^components\/.+\.(ts|tsx|js|jsx)$/.test(name) ||
                /^src\/app\/api\/.+\/route\.(ts|tsx|js|jsx|mjs)$/.test(name) ||
                /^src\/app\/.+\/page\.(ts|tsx|js|jsx)$/.test(name);

            const body = String(content ?? '').trim();
            if (!isAllowed || body.length < 40) continue;
            safe[name] = body;
        }

        const shouldHaveAuth = !!requirements.hasAuth;
        if (shouldHaveAuth && !Object.keys(safe).some((k) => /login|auth|signin/i.test(k))) {
            safe.__missingAuth__ = 'auth';
        }

        return safe;
    }

    summarizeMissing(requiredFiles = [], files = {}) {
        return requiredFiles.filter((f) => !files[f] && !Object.keys(files).some((k) => k === f || k.startsWith(f.replace('/...', ''))));
    }

    async runPass(prompt, temperature) {
        return this.callLLM(prompt, this.systemPrompt, {
            temperature,
            maxTokens: this.config.maxTokens,
        });
    }

    async execute(specification, designSystem, threejsCode = null) {
        this.log(
            'info',
            `Generating Next.js full-stack project [${specification.complexity || 'premium'}] via multi-pass engineer pipeline...`
        );

        const requirements = this.inferRequirements(specification);
        const { isNextAppRouter } = this.detectProjectType(threejsCode || {});
        const sourceFiles = this.compactFileContents(this.selectSourceFiles(threejsCode || {}));

        const sharedContext = this.buildProjectBrief({
            specification,
            sourceFiles,
            isNextAppRouter,
            requirements,
        });

        try {
            // PASS 1 — foundation
            this.log('info', 'Full-stack pass 1/3: foundation (config, prisma, layout)...');
            const foundationRes = await this.runPass(
                this.buildFoundationPrompt(sharedContext),
                this.config.temperatureFoundation
            );
            const files = this.extractParsedFiles(foundationRes);
            this.normalizeProjectFiles(files, specification);

            // PASS 2 — pages + components
            this.log('info', 'Full-stack pass 2/3: product pages + components...');
            const pagesRes = await this.runPass(
                this.buildPagesPrompt(sharedContext, files),
                this.config.temperatureBuild
            );
            Object.assign(files, this.extractParsedFiles(pagesRes));
            this.normalizeProjectFiles(files, specification);

            // PASS 3 — API surface
            this.log('info', 'Full-stack pass 3/3: API routes + data validation...');
            const apiRes = await this.runPass(
                this.buildApiPrompt(sharedContext, files),
                this.config.temperatureFoundation
            );
            Object.assign(files, this.extractParsedFiles(apiRes));
            this.normalizeProjectFiles(files, specification);

            let validated = this.validateOutputFiles(files, files, requirements);
            delete validated.__missingAuth__;

            const requiredFiles = [
                'package.json',
                'tsconfig.json',
                'next.config.mjs',
                'postcss.config.mjs',
                'tailwind.config.ts',
                'prisma/schema.prisma',
                'lib/prisma.ts',
                'app/layout.tsx',
                'app/globals.css',
                'README.md',
            ];

            const missing = this.summarizeMissing(requiredFiles, validated);

            if (missing.length) {
                this.log('info', `Repair pass for missing files: ${missing.join(', ')}`);
                const repairRes = await this.runPass(
                    this.buildRepairPrompt(sharedContext, missing, validated),
                    this.config.temperatureRepair
                );
                Object.assign(validated, this.extractParsedFiles(repairRes));
                this.normalizeProjectFiles(validated, specification);
                validated = this.validateOutputFiles(validated, validated, requirements);
                delete validated.__missingAuth__;
            }

            const totalChars = Object.values(validated).join('').length;
            const hasPrisma = Object.keys(validated).some((k) => /prisma\/schema\.prisma/.test(k));
            const hasApi = Object.keys(validated).some((k) => /app\/api\/.+\/route\.(ts|tsx|js|jsx|mjs)$/.test(k));
            const hasDashboard = Object.keys(validated).some((k) => /app\/(dashboard|admin|workspace|portal)\//.test(k));

            if (totalChars < 9000) {
                throw new Error(`Full-stack project too thin (${totalChars} chars).`);
            }
            if (!hasPrisma) {
                throw new Error('Missing prisma/schema.prisma in full-stack output.');
            }
            if (!hasApi) {
                throw new Error('Missing app/api route handlers in full-stack output.');
            }

            if (requirements.hasDashboard && !hasDashboard) {
                this.log('warning', 'Dashboard requested but no dashboard route detected — review loop may be needed.');
            }

            if (requirements.hasAuth && !Object.keys(validated).some((k) => /login|auth|signin/i.test(k))) {
                this.log('warning', 'Auth requested but no login/auth route detected.');
            }

            this.log(
                'success',
                `Generated ${Object.keys(validated).length} full-stack files via 3-pass pipeline (prisma=${hasPrisma}, api=${hasApi})`
            );

            return validated;
        } catch (e) {
            if (e?.message === 'ABORTED') throw e;
            this.log('error', `Failed full-stack generation: ${e.message}`);
            throw e;
        }
    }
}

window.CoderFullstackAgent = CoderFullstackAgent;
;
/* ============================================================
3D CODER AGENT — Generates advanced Three.js scenes,
custom shaders, particle systems, interactive 3D,
morphing geometry, and post-processing effects
============================================================ */

class Coder3DAgent extends BaseAgent {
    constructor() {
        super(
            'Coder3D',
            'Generates advanced Three.js 3D scenes with custom shaders and post-processing'
        );

        this.config = {
            temperature: 0.68,
            maxTokens: 32768,
            maxEffects: 5,
            maxPaletteFallback: 3,
            pixelRatioCap: 2,
        };

        this.systemPrompt = `
You are a master Three.js / WebGL developer who creates breathtaking 3D visual effects for premium websites.

You write production-quality, performant 3D code.

CAPABILITIES
LEVEL 1 — Particles & Backgrounds

* Floating particle fields (stars, orbs, connections)
* Animated gradient mesh backgrounds
* Firefly / bokeh effects
* Snow / rain / confetti particles

LEVEL 2 — Geometric Effects

* Morphing geometries (sphere → torus → icosahedron)
* Wireframe rotating shapes
* Exploding / assembling meshes
* 3D card tilt effects
* Floating UI elements in 3D space

LEVEL 3 — Advanced Shaders (GLSL)

* Custom vertex/fragment shaders
* Noise-based distortion (simplex, perlin, curl)
* Chromatic aberration
* Glow / bloom effects
* Liquid / fluid simulation
* Aurora / nebula effects
* Heat haze distortion

LEVEL 4 — Interactive 3D

* Mouse-reactive particles (attract/repel)
* Scroll-linked 3D animations
* 3D globe with data points
* Interactive product viewers
* Terrain generation
* Volumetric lighting

LEVEL 5 — Post-Processing

* UnrealBloomPass for glow
* EffectComposer pipeline with multiple passes
* Custom render passes (chromatic aberration, film grain, vignette)
* Depth of field (BokehPass)
* God rays (volumetric scattering)
* Color grading / LUT passes

LEVEL 6 — GPGPU Particles (100k+)

* Use WebGLRenderTarget as data textures (position + velocity)
* Ping-pong framebuffer pattern: read from texture A, write to texture B, swap
* Simulation shader updates particle positions/velocities each frame
* Render shader reads position texture and draws Points or InstancedMesh
* Float32 RGBA textures (THREE.FloatType) for precision
* Grid layout: particles = textureWidth * textureHeight
* Template pattern:
  1. Create two WebGLRenderTargets (posA, posB) with FloatType
  2. Create simulation ShaderMaterial that reads posA, writes to posB
  3. Render a full-screen quad with simulation material to posB
  4. Swap posA ↔ posB
  5. Render Points mesh reading position from posA
* Forces: curl noise, attractors, mouse repulsion, gravity, turbulence
* Always dispose targets and materials on cleanup

LEVEL 7 — Raymarching / SDF Scenes

* Full-screen quad with fragment-only raymarching (no geometry)
* Signed Distance Functions: sphere, box, torus, cylinder, cone
* Smooth blending: smin(a, b, k) for organic shapes
* Domain repetition: mod(p, period) for infinite grids
* Soft shadows via sphere-tracing with penumbra
* Ambient occlusion from SDF step count
* Camera ray from UV + inverse projection
* Template pattern:
  1. Full-screen PlaneGeometry covering viewport
  2. Fragment shader: for each pixel, cast ray from camera
  3. March along ray, evaluate SDF scene
  4. On hit: compute normal via gradient, apply lighting
  5. Compose: fog, glow, color grading
* Keep max steps ≤ 128, max distance ≤ 100.0 for performance

LEVEL 8 — Audio-Reactive

* Web Audio API: AudioContext → AnalyserNode → getByteFrequencyData
* Split frequency bands: bass (0-4), mid (5-15), high (16-31)
* Normalize to 0.0-1.0 range
* Pass as uniforms: uBass, uMid, uHigh (smoothed with lerp)
* Drive: particle scale, vertex displacement, color intensity, bloom threshold
* Template pattern:
  1. navigator.mediaDevices.getUserMedia({ audio: true }) OR new Audio(url)
  2. AudioContext → createAnalyser() → fftSize = 64
  3. Each frame: getByteFrequencyData(dataArray)
  4. bass = avg(0..4)/255, mid = avg(5..15)/255, high = avg(16..31)/255
  5. Smooth: uBass += (bass - uBass) * 0.1
  6. Pass to shader uniforms

RULES

1. Output only valid JavaScript code.
2. Use THREE from global scope, not ES modules.
3. Create a function called initThreeScene(container) that receives a DOM element.
4. The scene must be responsive and handle resize.
5. Use requestAnimationFrame for smooth animation.
6. Use BufferGeometry for performance.
7. Particle counts should be optimized for the device.
8. Make it visually stunning, but not noisy or gimmicky.
9. Include mouse interaction.
10. Background must be transparent (alpha: true) so text can overlay.
11. Use smooth easing for natural movement.
12. Use THREE.Clock for delta-time based animation.
13. Dispose resources properly (geometries, materials, textures, render targets).
14. Add inline noise functions if needed (simplex, curl, Perlin).

PERFORMANCE GUIDELINES

* Prefer Points for particles under 10k.
* Use GPGPU (FBO ping-pong) for particles over 10k.
* Prefer InstancedMesh for repeated geometry.
* Use Float32Array for buffer attributes.
* Minimize draw calls.
* Use Math.min(window.devicePixelRatio, 2) for pixel ratio.
* Throttle resize handling.
* Keep shader code compact and readable.
* Raymarching: max 128 steps, max distance 100.0.
* GPGPU textures: prefer power-of-2 dimensions (256×256 = 65k particles).
* Always clean up: renderer.dispose(), geometry.dispose(), material.dispose(), renderTarget.dispose().
`.trim();
    }

    detectRuntimeHints(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();

        const effects = Array.isArray(specification.threeDEffects)
            ? specification.threeDEffects.slice(0, this.config.maxEffects)
            : ['gradient-mesh', 'subtle-particles'];

        const colors = specification.colorPalette || {};
        const complexity = specification.complexity || 'medium';
        const siteType = specification.siteType || specification.siteArchetype || 'luxury';
        const mood = specification.mood || 'editorial';

        const motions = Array.isArray(specification.motionSystems)
            ? specification.motionSystems
            : Array.isArray(specification.animations)
                ? specification.animations
                : [];

        const wantsScrub = motions.some((m) => /scroll-scrub|camera/i.test(String(m)));
        const isComplex = ['complex', 'ultra-complex'].includes(String(complexity));

        // Advanced technique detection
        const advEffects = Array.isArray(specification.advancedEffects) ? specification.advancedEffects : [];
        const advBlob = blob + ' ' + advEffects.join(' ');

        const needsGPGPU = /gpgpu|100k|million.?particle|fbo|ping.?pong|massive.?particle|data.?texture/i.test(advBlob);
        const needsRaymarch = /raymarch|sdf|signed.?distance|marching|volumetric.?render/i.test(advBlob);
        const needsAudio = /audio|music|sound|beat|reactive|frequency|spectrum|visuali[sz]/i.test(advBlob);
        const needsPostFX = /bloom|chromatic|dof|depth.?of.?field|grain|god.?ray|vignette|effect.?composer|post.?process/i.test(advBlob);
        const needsPhysics = /physics|rapier|cannon|gravity|collision|rigid.?body/i.test(advBlob);
        const needsCurlNoise = /curl.?noise|turbulence|flow.?field|vector.?field/i.test(advBlob);

        const visualDirection = {
            siteType,
            mood,
            complexity,
            wantsScrub,
            isComplex,
            primary: colors.primary || '#C84B31',
            secondary: colors.secondary || '#173F5F',
            accent: colors.accent || '#F6C85F',
            effects,
            motions,
            keywords: blob,
            needsGPGPU,
            needsRaymarch,
            needsAudio,
            needsPostFX,
            needsPhysics,
            needsCurlNoise,
        };

        return visualDirection;
    }

    buildPrompt(specification = {}) {
        const hints = this.detectRuntimeHints(specification);

        return `
Create a cinematic Three.js hero scene for a ${hints.siteType} website.

COMPLEXITY
${hints.complexity}

HERO TREATMENT
${specification.heroTreatment || 'webgl-scene'}

ART DIRECTION
${JSON.stringify(specification.artDirection || {}, null, 2)}

MOTION SYSTEMS
${hints.motions.length ? hints.motions.join(', ') : 'n/a'}

REQUIRED EFFECTS
Adapt to the art direction. Prefer restrained luxury over random particle spam.
${hints.effects.join(', ')}

PALETTE
PRIMARY: ${hints.primary}
SECONDARY: ${hints.secondary}
ACCENT: ${hints.accent}

MOOD
${hints.mood}

SCENE REQUIREMENTS

* Mount into a DOM container provided by initThreeScene(container)
* Transparent background (alpha: true)
* Responsive resize handling
* Smooth mouse parallax with natural easing
* Use BufferGeometry or InstancedMesh
* Keep draw calls low
* Use a Clock for delta-time animation
* Clean up all objects, textures, materials, renderers, and listeners
  ${hints.wantsScrub ? '- Expose window.__zeroScroll3D = (progress0to1) => {} for scroll-linked scrubbing' : '- Include gentle idle motion'}

VISUAL DIRECTION

* Prefer architectural planes, soft noise fields, or graded meshes over cliché particle fireworks
* Avoid noisy overbuilt scenes
* Make the composition feel expensive and deliberate

ADVANCED NOTES
${hints.isComplex ? `

* Inline simplex/perlin noise if needed
* Keep depth layers minimal
* Subtle color grading over time is allowed
* Use one strong focal point and supporting ambient motion
  ` : '- Keep the implementation lean and elegant'}
${hints.needsGPGPU ? `
GPGPU PARTICLE SYSTEM REQUIRED
* Use two WebGLRenderTargets (FloatType, RGBAFormat) as position/velocity data textures
* Ping-pong pattern: simulate into target B reading from A, then swap
* Render a full-screen quad with simulation ShaderMaterial to update particles
* Display particles using Points mesh reading from position texture
* Use texture dimensions like 256×256 = 65,536 particles or 512×512 = 262,144
* Add curl noise or attractor forces for organic motion
* Mouse position should repel or attract nearby particles
* MUST dispose all WebGLRenderTargets on cleanup
` : ''}
${hints.needsRaymarch ? `
RAYMARCHING / SDF SCENE REQUIRED
* Use a full-screen PlaneGeometry with a custom fragment shader
* Cast ray per pixel: ro = cameraPosition, rd = normalize(target - ro)
* Implement SDF primitives: sdSphere, sdBox, sdTorus, sdCylinder
* Use smin(a, b, k) for smooth blending between shapes
* March loop: max 128 steps, max distance 100.0
* On hit: compute normal via central differences, apply Phong/PBR lighting
* Add fog, glow, and subtle ambient occlusion
* Background color from ray direction for sky gradient
* Animate shapes with uTime for organic movement
` : ''}
${hints.needsAudio ? `
AUDIO-REACTIVE SYSTEM REQUIRED
* Set up AudioContext with AnalyserNode (fftSize = 64)
* Accept audio source: getUserMedia OR new Audio(url)
* Extract frequency bands each frame: bass(0-4), mid(5-15), high(16-31)
* Normalize to 0.0-1.0, smooth with lerp (factor 0.1)
* Pass as uniforms: material.uniforms.uBass, uMid, uHigh
* Drive visual parameters: particle scale, displacement amplitude, bloom intensity
* Provide graceful fallback if audio permission denied (use sine-wave simulation)
` : ''}
${hints.needsPostFX ? `
FULL POST-PROCESSING CHAIN REQUIRED
* Set up THREE.EffectComposer with WebGLRenderTarget
* RenderPass as first pass
* Add UnrealBloomPass (strength 0.8-1.5, radius 0.4, threshold 0.6)
* Add custom chromatic aberration pass if needed
* Add film grain pass (subtle, 0.03-0.08 intensity)
* Add vignette pass (smoothstep from edges)
* Use composer.render() instead of renderer.render()
* Resize composer on window resize
` : ''}
${hints.needsCurlNoise ? `
CURL NOISE / FLOW FIELD REQUIRED
* Implement 3D curl noise from simplex noise derivatives
* Use curl(x,y,z) = cross(dN/dy - dN/dz, dN/dz - dN/dx, dN/dx - dN/dy)
* Apply as vertex displacement or particle force field
* Animate noise offset with time for flowing motion
* Scale noise frequency (0.5-2.0) and amplitude (0.1-0.5) based on mood
` : ''}

CRITICAL FORMAT

* Regular script, not ES modules
* Global function name: initThreeScene(container)
* THREE from CDN global scope
* Output only JavaScript code
`.trim();
    }

    normalizeCode(code) {
        let output = String(code || '').trim();

        // Strip common markdown fences if the model returns them anyway.
        output = output.replace(/^```(?:javascript|js|ts|typescript)?\s*/i, '').replace(/```$/i, '').trim();

        // If the model forgot the required entry point, wrap the body in a function.
        if (!/\bfunction\s+initThreeScene\s*\(/.test(output) && !/\bconst\s+initThreeScene\s*=/.test(output)) {
            output = `function initThreeScene(container) {\n${output}\n}`;
        }

        return output;
    }

    validateCode(code) {
        const text = String(code || '');
        const checks = {
            hasEntryPoint: /\b(initThreeScene)\s*\(/.test(text),
            hasThreeUsage: /\bTHREE\b/.test(text),
            hasRequestAnimationFrame: /\brequestAnimationFrame\b/.test(text),
            hasResizeHandling: /\bresize\b|\baddEventListener\s*\(\s*['"]resize['"]/.test(text),
        };

        return checks;
    }

    addSafeWrapper(code) {
        const cleaned = this.normalizeCode(code);

        if (/^\s*function\s+initThreeScene\s*\(/.test(cleaned)) {
            return cleaned;
        }

        return `function initThreeScene(container) {\n${cleaned}\n}`;
    }

    async execute(specification = {}, designSystem = null) {
        this.log('info', 'Generating cinematic WebGL/Three.js scene...');

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `3D scene LLM call failed: ${error.message}`);
            return this.addSafeWrapper('');
        }

        let code = this.extractCode(response, 'javascript');
        code = this.normalizeCode(code);

        const validation = this.validateCode(code);

        if (!validation.hasEntryPoint) {
            this.log('warning', 'Generated 3D code missing initThreeScene function, wrapping it');
            code = this.addSafeWrapper(code);
        }

        if (!validation.hasThreeUsage) {
            this.log('warning', 'Generated 3D code does not reference THREE explicitly');
        }

        if (!validation.hasRequestAnimationFrame) {
            this.log('warning', 'Generated 3D code may be missing a render loop');
        }

        if (!validation.hasResizeHandling) {
            this.log('warning', 'Generated 3D code may be missing resize handling');
        }

        const hints = this.detectRuntimeHints(specification);
        this.log('success', `3D scene generated: ${hints.effects.join(', ')} [${hints.complexity}]`);

        return code;
    }
}

if (typeof window !== 'undefined') {
    window.Coder3DAgent = Coder3DAgent;
}

;
/* ============================================================
SHADER WIZARD AGENT — Writes raw GLSL fragment and vertex
shaders for React Three Fiber to create premium liquid,
distortion, and particle mesh effects.
============================================================ */

class CoderShaderAgent extends BaseAgent {
    constructor() {
        super('ShaderWizard', 'Generates hardcore mathematical GLSL WebGL shaders for R3F');

        this.config = {
            temperature: 0.62,
            maxTokens: 32768,
            maxEffects: 5,
            maxUniforms: 8,
            maxFileChars: 22000,
            headChars: 14000,
            tailChars: 3500,
        };

        this.systemPrompt = `
You are a master WebGL Shader Wizard who creates breathtaking, math-heavy visual effects for premium websites.

Write raw GLSL code wrapped in a React Three Fiber component.

SPECIALTY

* Mathematical distortion (Simplex/Perlin noise, Voronoi, curl noise)
* Liquid and fluid simulations in fragment shaders
* Custom glowing particle meshes using vertex shaders
* Melting glass / chromatic aberration effects
* Interactive shader fields with mouse trail distortions

ADVANCED SPECIALTY

* Raymarching / SDF scenes (signed distance fields)
  - SDF primitives: sdSphere, sdBox, sdTorus, sdCylinder, sdCone
  - Smooth blending: smin(a, b, k) for organic morphing
  - Domain repetition, twisting, bending operators
  - Soft shadows, ambient occlusion, fog
  - Camera ray from UV coordinates
  - Max 128 march steps, max distance 100.0

* Audio-reactive shaders
  - Uniforms: uAudioBass, uAudioMid, uAudioHigh (0.0-1.0)
  - Drive displacement, color intensity, bloom, scale
  - Parent component provides audio analysis via Web Audio API

* Full post-processing chains
  - EffectComposer with RenderPass base
  - UnrealBloomPass, custom chromatic aberration
  - Film grain, vignette, depth of field
  - Custom ShaderPass for unique effects

* Curl noise / vertex displacement
  - 3D curl noise from simplex derivatives
  - Vertex displacement in vertex shader
  - Flow fields for particle motion
  - Turbulence layering (multiple octaves)

RULES

1. Think through the mathematical approach before coding.
2. Only use shaderMaterial from @react-three/drei or standard THREE.ShaderMaterial.
3. Provide valid GLSL syntax for vertexShader and fragmentShader.
4. Expose uniforms for time, mouse, resolution, and colors.
5. Output a self-contained React component that can be dropped into an existing <Canvas>.
6. Keep it highly optimized and avoid heavy branching in fragments.
7. Output only code.
8. Do not output JSON.
9. For raymarching: use full-screen quad, max 128 steps, proper normal calculation.
10. For audio: accept uAudioBass, uAudioMid, uAudioHigh as props/uniforms.
11. For post-processing: use @react-three/postprocessing or manual EffectComposer.

OUTPUT FORMAT
**File: src/components/ShaderScene.tsx**
\`\`\`tsx
import { Canvas } from '@react-three/fiber'
// ... code here ...
\`\`\`
`.trim();
    }

    detectEffectNeeds(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();

        const effects = Array.isArray(specification.shaderEffects) && specification.shaderEffects.length
            ? specification.shaderEffects.slice(0, this.config.maxEffects)
            : Array.isArray(specification.threeDEffects) && specification.threeDEffects.length
                ? specification.threeDEffects.slice(0, this.config.maxEffects)
                : ['liquid-distortion', 'soft-particles'];

        const palette = specification.colorPalette || {};
        const complexity = String(specification.complexity || 'medium');
        const siteType = String(specification.siteType || specification.siteArchetype || 'premium');
        const mood = String(specification.mood || 'cinematic');

        const needsMouse = /interactive|mouse|cursor|parallax|reactive|trail/.test(blob);
        const needsParticles = /particle|bokeh|stars|firefly|mesh/.test(blob);
        const needsLiquid = /liquid|fluid|gel|glass|melt|distortion|refraction/.test(blob);
        const needsScroll = /scroll|scrub|camera|parallax/.test(blob);
        const needsRaymarch = /raymarch|sdf|signed.?distance|marching|volumetric/.test(blob);
        const needsAudio = /audio|music|sound|beat|frequency|spectrum|visuali[sz]/.test(blob);
        const needsPostFX = /bloom|chromatic|dof|depth.?of.?field|grain|god.?ray|vignette|effect.?composer|post.?process/.test(blob);
        const needsCurlNoise = /curl.?noise|turbulence|flow.?field|vector.?field/.test(blob);

        return {
            effects,
            complexity,
            siteType,
            mood,
            needsMouse,
            needsParticles,
            needsLiquid,
            needsScroll,
            needsRaymarch,
            needsAudio,
            needsPostFX,
            needsCurlNoise,
            primary: palette.primary || '#7C3AED',
            secondary: palette.secondary || '#0EA5E9',
            accent: palette.accent || '#FDE68A',
            background: palette.background || '#050816',
            blob,
        };
    }

    buildPrompt(specification = {}) {
        const hints = this.detectEffectNeeds(specification);
        const motionSystems = Array.isArray(specification.motionSystems) ? specification.motionSystems : [];
        const artDirection = specification.artDirection || {};
        const qualityContract = specification.qualityContract || {};

        return `
Create a cinematic React Three Fiber shader component for a ${hints.siteType} website.

PROJECT CONTEXT
${JSON.stringify(specification || {}, null, 2)}

ART DIRECTION
${JSON.stringify(artDirection, null, 2)}

QUALITY CONTRACT
${JSON.stringify(qualityContract, null, 2)}

MOTION SYSTEMS
${motionSystems.length ? motionSystems.join(', ') : 'n/a'}

REQUIRED EFFECTS
${hints.effects.join(', ')}

PALETTE
* Primary: ${hints.primary}
* Secondary: ${hints.secondary}
* Accent: ${hints.accent}
* Background: ${hints.background}

MOOD
${hints.mood}

SHADER REQUIREMENTS

* Build a single self-contained React component for R3F.
* Include a mesh using shaderMaterial or THREE.ShaderMaterial.
* Provide uniforms for uTime, uMouse, uResolution, uColorA, uColorB, uColorC.
* Add responsive handling and smooth mouse interaction.
* Support transparent background when appropriate.
* Keep the implementation efficient and production-safe.
* If the direction calls for it, include a subtle post-processing-ready composition style, but do not depend on unavailable imports unless they are standard R3F / drei.
* Avoid heavy branching, unnecessary loops, and overly expensive noise layers.
* Prefer elegant math and readable shader code over gimmicks.

ADVANCED NOTES
${hints.needsLiquid ? '- Favor refraction, Fresnel, turbulence, soft normal perturbation, and chromatic offset.' : ''}
${hints.needsParticles ? '- Use Points or lightweight instancing only if needed, and keep counts modest.' : ''}
${hints.needsMouse ? '- Mouse input should influence distortion, velocity, or parallax in a subtle way.' : ''}
${hints.needsScroll ? '- Expose a progress uniform or prop if the scene should support scroll-linked animation.' : ''}
${hints.needsRaymarch ? `
RAYMARCHING / SDF REQUIRED
- Use a full-screen mesh with raymarching in the fragment shader.
- Implement SDF primitives (sdSphere, sdBox, sdTorus) with smin smooth blending.
- March loop: max 128 steps, max dist 100.0.
- Compute normals via central differences. Apply Phong/PBR lighting.
- Add fog, glow, AO. Animate with uTime.
` : ''}
${hints.needsAudio ? `
AUDIO-REACTIVE REQUIRED
- Accept uniforms: uAudioBass, uAudioMid, uAudioHigh (0.0-1.0 normalized).
- Use bass to drive displacement amplitude or particle scale.
- Use mid for color mixing or glow intensity.
- Use high for detail frequency or sparkle effects.
- The parent component handles Web Audio API analysis.
` : ''}
${hints.needsPostFX ? `
POST-PROCESSING REQUIRED
- Use @react-three/postprocessing or manual EffectComposer.
- Include: Bloom (strength 1.0, radius 0.4), optional ChromaticAberration, optional Noise/Grain.
- Apply vignette effect.
` : ''}
${hints.needsCurlNoise ? `
CURL NOISE REQUIRED
- Implement 3D curl noise in the vertex shader for displacement.
- Use simplex noise derivatives to compute curl vector.
- Animate with uTime for flowing organic motion.
- Layer 2-3 octaves for turbulence.
` : ''}

CRITICAL FORMAT

* Output only code.
* Do not wrap in JSON.
* Do not include commentary.
* The result must be a React component that can be dropped into an existing <Canvas>.
`.trim();
    }

    normalizeCode(code) {
        let output = String(code || '').trim();

        output = output
            .replace(/^```(?:tsx|ts|javascript|js|jsx|tsx)?\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        return output;
    }

    ensureEntryPoint(code) {
        const text = String(code || '');

        if (/\bexport\s+default\s+function\s+ShaderScene\b/.test(text) || /\bfunction\s+ShaderScene\b/.test(text)) {
            return text;
        }

        if (/\bexport\s+default\s+/.test(text)) {
            return text;
        }

        // If the model only returned shader snippets, wrap them in a component shell.
        return `
import * as THREE from 'three'
import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

${text}
`.trim();
    }

    validateCode(code) {
        const text = String(code || '');
        const checks = {
            hasReact: /\bimport\s+React\b|\breact\b/i.test(text),
            hasR3F: /@react-three\/fiber/.test(text),
            hasShaderMaterial: /shaderMaterial|ShaderMaterial/.test(text),
            hasVertexShader: /vertexShader\s*:/.test(text) || /const\s+vertexShader\s*=/.test(text),
            hasFragmentShader: /fragmentShader\s*:/.test(text) || /const\s+fragmentShader\s*=/.test(text),
            hasUniforms: /uniforms\s*:|uTime|uMouse|uResolution/.test(text),
        };

        return checks;
    }

    buildFallbackComponent(specification = {}) {
        const hints = this.detectEffectNeeds(specification);

        return `
import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const ShaderMaterialImpl = shaderMaterial(
{
uTime: 0,
uMouse: new THREE.Vector2(0, 0),
uResolution: new THREE.Vector2(1, 1),
uColorA: new THREE.Color('${hints.primary}'),
uColorB: new THREE.Color('${hints.secondary}'),
uColorC: new THREE.Color('${hints.accent}')
},
/* glsl */\`
varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vUv = uv;
  vPosition = position;
  vec3 pos = position;

  float t = uTime * 0.35;
  float n = noise(pos.xy * 1.75 + t);
  pos.z += (n - 0.5) * 0.18;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
\`,
/* glsl */\`
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = vUv;
  vec2 mouse = uMouse;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);

  vec2 p = (uv - 0.5) * aspect;
  float len = length(p);
  float radial = smoothstep(0.75, 0.0, len);

  float n1 = noise(uv * 3.0 + uTime * 0.08);
  float n2 = noise(uv * 6.0 - uTime * 0.15);
  float ripple = sin((uv.y + uTime * 0.25) * 10.0 + n1 * 2.0) * 0.03;

  vec2 mouseOffset = (mouse - 0.5) * 0.35;
  float mouseField = smoothstep(0.5, 0.0, distance(uv, mouse));

  vec3 col = mix(uColorA, uColorB, uv.y + ripple + n1 * 0.15);
  col = mix(col, uColorC, radial * 0.55);
  col += n2 * 0.08;
  col += mouseField * vec3(0.18, 0.12, 0.25);

  float alpha = 0.92;
  alpha *= smoothstep(1.05, 0.25, len);
  alpha += mouseField * 0.08;

  gl_FragColor = vec4(col, alpha);
}
\`
);

extend({ ShaderMaterialImpl });

function ShaderPlane() {
const material = useRef();
const mesh = useRef();
const { size, viewport } = useThree();

useFrame((state, delta) => {
if (!material.current) return;
material.current.uTime = state.clock.getElapsedTime();
material.current.uMouse.lerp(
new THREE.Vector2(
(state.pointer.x + 1) * 0.5,
(state.pointer.y + 1) * 0.5
),
0.08
);
material.current.uResolution.set(size.width * Math.min(window.devicePixelRatio || 1, 2), size.height * Math.min(window.devicePixelRatio || 1, 2));
if (mesh.current) {
mesh.current.rotation.z += delta * 0.05;
mesh.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.03;
}
});

return (
<mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
<planeGeometry args={[1, 1, 128, 128]} /> <shaderMaterialImpl ref={material} transparent depthWrite={false} /> </mesh>
);
}

export default function ShaderScene() {
return <ShaderPlane />;
}
`.trim();
    }

    mergeWithFallbackIfNeeded(code, specification = {}) {
        const text = String(code || '');
        const validation = this.validateCode(text);

        if (
            validation.hasReact &&
            validation.hasR3F &&
            validation.hasShaderMaterial &&
            validation.hasVertexShader &&
            validation.hasFragmentShader &&
            validation.hasUniforms
        ) {
            return this.normalizeCode(text);
        }

        this.log('warning', 'Generated shader code is incomplete; using a safe fallback component.');
        return this.buildFallbackComponent(specification);
    }

    async execute(specification, designSystem, previousCode = {}) {
        this.log('info', 'Summoning the Shader Wizard...');

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Shader Wizard LLM call failed: ${error.message}`);
            return this.buildFallbackComponent(specification);
        }

        let code = this.extractCode(response, 'javascript');
        code = this.normalizeCode(code);
        code = this.ensureEntryPoint(code);
        code = this.mergeWithFallbackIfNeeded(code, specification);

        const finalValidation = this.validateCode(code);
        if (!finalValidation.hasShaderMaterial || !finalValidation.hasVertexShader || !finalValidation.hasFragmentShader) {
            this.log('warning', 'Shader code still looks incomplete after repair pass.');
        }

        this.log('success', `Shader scene generated: ${this.detectEffectNeeds(specification).effects.join(', ')}`);
        return code;
    }
}

if (typeof window !== 'undefined') {
    window.CoderShaderAgent = CoderShaderAgent;
}

;
/* ============================================================
   GPGPU PARTICLE AGENT — Generates massive particle systems
   using ping-pong FBO (Frame Buffer Object) technique with
   WebGLRenderTarget for 100k-500k+ particles
   ============================================================ */

class CoderGPGPUAgent extends BaseAgent {
    constructor() {
        super(
            'CoderGPGPU',
            'Generates GPGPU particle systems with ping-pong FBO for 100k+ particles'
        );

        this.config = {
            temperature: 0.65,
            maxTokens: 32768,
        };

        this.systemPrompt = `
You are an expert Three.js GPGPU particle system developer. You create massive, GPU-driven particle systems using the ping-pong FBO technique.

CORE TECHNIQUE — GPGPU Ping-Pong FBO

The key insight: store particle data (position, velocity) in textures, run simulation in fragment shaders, and read positions back when rendering particles.

ARCHITECTURE

1. DATA TEXTURES
   - Two pairs of WebGLRenderTargets: posA/posB and velA/velB
   - Format: RGBAFormat, type: FloatType
   - Dimensions: power-of-2 (256×256 = 65,536 particles, 512×512 = 262,144)
   - Initialize with random positions and zero/random velocities

2. SIMULATION PASS
   - Full-screen quad (PlaneGeometry 2×2) with OrthographicCamera
   - Position simulation shader:
     * Read current position from posA texture
     * Read current velocity from velA texture
     * Apply forces (curl noise, attractors, mouse repulsion, gravity)
     * Write new position to posB
   - Velocity simulation shader:
     * Read current velocity from velA
     * Apply damping, forces, curl noise
     * Write new velocity to velB
   - Render to WebGLRenderTarget (not screen)
   - Swap A ↔ B each frame

3. RENDER PASS
   - Points mesh with BufferGeometry
   - Vertex shader reads position from position texture using UV lookup
   - UV = particle index mapped to texture coordinates
   - Fragment shader: soft circle with glow, colored by velocity magnitude
   - Additive blending for glow effect

4. FORCES
   - Curl noise: divergence-free flow for organic swirling motion
   - Point attractors: pull particles toward mouse or fixed points
   - Mouse repulsion: push particles away from cursor position
   - Gravity: subtle downward pull with bounce
   - Turbulence: layered noise at different frequencies
   - Damping: velocity *= 0.98 per frame for stability

TEMPLATE STRUCTURE

function initThreeScene(container) {
    // Setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 100);
    
    // Simulation setup
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    simScene.add(simQuad);
    
    // Create render targets
    const SIZE = 256; // 256×256 = 65,536 particles
    const rtOptions = { format: THREE.RGBAFormat, type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter };
    let posA = new THREE.WebGLRenderTarget(SIZE, SIZE, rtOptions);
    let posB = new THREE.WebGLRenderTarget(SIZE, SIZE, rtOptions);
    
    // Initialize position data texture
    const posData = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        posData[i*4+0] = (Math.random() - 0.5) * 10; // x
        posData[i*4+1] = (Math.random() - 0.5) * 10; // y
        posData[i*4+2] = (Math.random() - 0.5) * 10; // z
        posData[i*4+3] = 1.0;
    }
    const posTex = new THREE.DataTexture(posData, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
    posTex.needsUpdate = true;
    // Initialize posA by rendering data texture to it
    
    // Simulation material
    const simMat = new THREE.ShaderMaterial({
        uniforms: {
            uPositions: { value: null },
            uTime: { value: 0 },
            uDelta: { value: 0 },
            uMouse: { value: new THREE.Vector3() },
        },
        vertexShader: '...', // passthrough
        fragmentShader: '...' // simulation logic
    });
    
    // Particle render
    const particleGeo = new THREE.BufferGeometry();
    const uvs = new Float32Array(SIZE * SIZE * 2);
    for (let i = 0; i < SIZE * SIZE; i++) {
        uvs[i*2+0] = (i % SIZE) / SIZE;
        uvs[i*2+1] = Math.floor(i / SIZE) / SIZE;
    }
    particleGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    // Also set position attribute (can be dummy, vertex shader overrides)
    
    // Animation loop
    function animate() {
        // 1. Run simulation: render simQuad with simMat to posB
        simMat.uniforms.uPositions.value = posA.texture;
        renderer.setRenderTarget(posB);
        renderer.render(simScene, simCamera);
        
        // 2. Swap
        [posA, posB] = [posB, posA];
        
        // 3. Render particles reading from posA
        particleMat.uniforms.uPositions.value = posA.texture;
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
        
        requestAnimationFrame(animate);
    }
    
    // Cleanup function
    return function dispose() {
        posA.dispose(); posB.dispose();
        // ... dispose all materials, geometries, renderer
    };
}

RULES

1. Use THREE from global scope (CDN), not ES modules.
2. Function name: initThreeScene(container)
3. Use WebGLRenderTarget with FloatType for data textures.
4. Always implement ping-pong swap pattern.
5. Include inline simplex/curl noise in GLSL.
6. Mouse interaction must affect particle forces.
7. Use additive blending for particles (THREE.AdditiveBlending).
8. Background transparent (alpha: true).
9. Dispose ALL resources (targets, materials, geometries, textures, renderer).
10. Use THREE.Clock for delta-time.
11. Particle UV lookup: map 1D index to 2D texture coordinate.
12. Keep GLSL compact and performant.

PERFORMANCE

* Texture size 256×256 = 65k particles (good default)
* 512×512 = 262k for "massive" requests
* Use NearestFilter on data textures (no interpolation)
* Math.min(devicePixelRatio, 2)
* No antialiasing needed for particles
* Keep simulation shader simple: position += velocity * delta
`.trim();
    }

    detectHints(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();
        const advEffects = Array.isArray(specification.advancedEffects) ? specification.advancedEffects : [];

        const wantsMassive = /million|500k|massive|huge|100k/i.test(blob);
        const texSize = wantsMassive ? 512 : 256;
        const particleCount = texSize * texSize;

        const colors = specification.colorPalette || {};
        const mood = specification.mood || 'cinematic';

        return {
            texSize,
            particleCount,
            wantsMassive,
            mood,
            primary: colors.primary || '#7C3AED',
            secondary: colors.secondary || '#0EA5E9',
            accent: colors.accent || '#FDE68A',
            background: colors.background || '#050816',
            wantsCurl: /curl|organic|flow|swirl/i.test(blob),
            wantsAttractor: /attract|orbit|gravit|pull/i.test(blob),
            wantsGalaxy: /galaxy|star|cosmos|space|nebula/i.test(blob),
        };
    }

    buildPrompt(specification = {}) {
        const hints = this.detectHints(specification);

        return `
Create a GPGPU particle system using Three.js with ${hints.particleCount.toLocaleString()} particles (${hints.texSize}×${hints.texSize} data textures).

CONTEXT
${JSON.stringify(specification.artDirection || {}, null, 2)}

PARTICLE STYLE
${hints.wantsGalaxy ? '- Galaxy/cosmos: spiral arm formation, warm core, cool edges, depth fog' : ''}
${hints.wantsCurl ? '- Organic curl noise flow: particles follow divergence-free field, swirling ribbons' : ''}
${hints.wantsAttractor ? '- Attractor orbits: particles orbit around mouse or fixed points, gravitational pull' : ''}
${!hints.wantsGalaxy && !hints.wantsCurl && !hints.wantsAttractor ? '- Elegant floating field: gentle noise drift, mouse repulsion, soft glow' : ''}

PALETTE
Primary: ${hints.primary}, Secondary: ${hints.secondary}, Accent: ${hints.accent}

MOOD: ${hints.mood}

REQUIREMENTS
* initThreeScene(container) function
* ${hints.texSize}×${hints.texSize} WebGLRenderTarget pair (FloatType, RGBAFormat, NearestFilter)
* Ping-pong simulation: read from A, write to B, swap
* Simulation fragment shader with inline simplex/curl noise
* Forces: noise drift + mouse interaction + damping
* Particle render: Points mesh, vertex shader reads position texture via UV
* Fragment shader: soft glowing circle with additive blending
* Color particles by velocity magnitude or position
* Transparent background (alpha: true)
* Dispose everything on cleanup
* Use THREE from global scope

OUTPUT: Only JavaScript code. No markdown. No JSON.
`.trim();
    }

    buildFallback(specification = {}) {
        const hints = this.detectHints(specification);
        const S = hints.texSize;

        return `
function initThreeScene(container) {
    const S = ${S};
    const COUNT = S * S;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    camera.position.z = 15;

    const clock = new THREE.Clock();
    const mouse = new THREE.Vector2(0, 0);
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    // --- Simulation setup ---
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    simScene.add(simQuad);

    const rtOpts = {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
    };

    let posA = new THREE.WebGLRenderTarget(S, S, rtOpts);
    let posB = new THREE.WebGLRenderTarget(S, S, rtOpts);
    let velA = new THREE.WebGLRenderTarget(S, S, rtOpts);
    let velB = new THREE.WebGLRenderTarget(S, S, rtOpts);

    // Initialize data textures
    const posData = new Float32Array(S * S * 4);
    const velData = new Float32Array(S * S * 4);
    for (let i = 0; i < S * S; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.pow(Math.random(), 0.33) * 8;
        posData[i*4+0] = r * Math.sin(phi) * Math.cos(theta);
        posData[i*4+1] = r * Math.sin(phi) * Math.sin(theta);
        posData[i*4+2] = r * Math.cos(phi);
        posData[i*4+3] = 1.0;
        velData[i*4+0] = (Math.random() - 0.5) * 0.02;
        velData[i*4+1] = (Math.random() - 0.5) * 0.02;
        velData[i*4+2] = (Math.random() - 0.5) * 0.02;
        velData[i*4+3] = 1.0;
    }

    // Render initial data into targets
    const initPosTex = new THREE.DataTexture(posData, S, S, THREE.RGBAFormat, THREE.FloatType);
    initPosTex.needsUpdate = true;
    const initVelTex = new THREE.DataTexture(velData, S, S, THREE.RGBAFormat, THREE.FloatType);
    initVelTex.needsUpdate = true;

    const copyMat = new THREE.MeshBasicMaterial({ map: initPosTex });
    simQuad.material = copyMat;
    renderer.setRenderTarget(posA);
    renderer.render(simScene, simCamera);
    copyMat.map = initVelTex;
    renderer.setRenderTarget(velA);
    renderer.render(simScene, simCamera);
    copyMat.dispose();
    initPosTex.dispose();
    initVelTex.dispose();

    // Simulation shader
    const simVert = \`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    \`;

    const simFrag = \`
        precision highp float;
        uniform sampler2D uPositions;
        uniform sampler2D uVelocities;
        uniform float uTime;
        uniform float uDelta;
        uniform vec2 uMouse;
        varying vec2 vUv;

        vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x / 289.0) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
        }

        vec3 curlNoise(vec3 p) {
            float e = 0.1;
            float n1 = snoise(p + vec3(e, 0, 0));
            float n2 = snoise(p - vec3(e, 0, 0));
            float n3 = snoise(p + vec3(0, e, 0));
            float n4 = snoise(p - vec3(0, e, 0));
            float n5 = snoise(p + vec3(0, 0, e));
            float n6 = snoise(p - vec3(0, 0, e));
            float x = (n3 - n4) - (n5 - n6);
            float y = (n5 - n6) - (n1 - n2);
            float z = (n1 - n2) - (n3 - n4);
            return normalize(vec3(x, y, z)) * 0.5;
        }

        void main() {
            vec4 pos = texture2D(uPositions, vUv);
            vec4 vel = texture2D(uVelocities, vUv);

            // Curl noise force
            vec3 curl = curlNoise(pos.xyz * 0.15 + uTime * 0.08);
            vel.xyz += curl * uDelta * 2.0;

            // Mouse repulsion
            vec3 mousePos = vec3(uMouse * 8.0, 0.0);
            vec3 toMouse = pos.xyz - mousePos;
            float dist = length(toMouse);
            if (dist < 3.0) {
                vel.xyz += normalize(toMouse) * (3.0 - dist) * uDelta * 4.0;
            }

            // Center attractor (gentle)
            vel.xyz -= pos.xyz * uDelta * 0.15;

            // Damping
            vel.xyz *= 0.985;

            // Update position
            pos.xyz += vel.xyz * uDelta * 60.0;

            gl_FragColor = pos;
        }
    \`;

    const posMat = new THREE.ShaderMaterial({
        uniforms: {
            uPositions: { value: posA.texture },
            uVelocities: { value: velA.texture },
            uTime: { value: 0 },
            uDelta: { value: 0 },
            uMouse: { value: new THREE.Vector2() },
        },
        vertexShader: simVert,
        fragmentShader: simFrag,
    });

    const velMat = new THREE.ShaderMaterial({
        uniforms: {
            uPositions: { value: posA.texture },
            uVelocities: { value: velA.texture },
            uTime: { value: 0 },
            uDelta: { value: 0 },
            uMouse: { value: new THREE.Vector2() },
        },
        vertexShader: simVert,
        fragmentShader: simFrag,
    });

    // --- Particle rendering ---
    const pGeo = new THREE.BufferGeometry();
    const refs = new Float32Array(COUNT * 2);
    const dummy = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
        refs[i*2+0] = (i % S + 0.5) / S;
        refs[i*2+1] = (Math.floor(i / S) + 0.5) / S;
        dummy[i*3] = dummy[i*3+1] = dummy[i*3+2] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(dummy, 3));
    pGeo.setAttribute('reference', new THREE.BufferAttribute(refs, 2));

    const pMat = new THREE.ShaderMaterial({
        uniforms: {
            uPositions: { value: posA.texture },
            uColor1: { value: new THREE.Color('${hints.primary}') },
            uColor2: { value: new THREE.Color('${hints.secondary}') },
            uColor3: { value: new THREE.Color('${hints.accent}') },
        },
        vertexShader: \`
            attribute vec2 reference;
            uniform sampler2D uPositions;
            varying float vSpeed;
            varying float vDepth;
            void main() {
                vec4 pos = texture2D(uPositions, reference);
                vec4 mvPos = modelViewMatrix * vec4(pos.xyz, 1.0);
                gl_Position = projectionMatrix * mvPos;
                gl_PointSize = max(1.5, 4.0 / -mvPos.z);
                vSpeed = length(pos.xyz) * 0.1;
                vDepth = smoothstep(-20.0, 5.0, mvPos.z);
            }
        \`,
        fragmentShader: \`
            precision highp float;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;
            varying float vSpeed;
            varying float vDepth;
            void main() {
                float d = length(gl_PointCoord - 0.5);
                if (d > 0.5) discard;
                float alpha = smoothstep(0.5, 0.1, d) * vDepth * 0.8;
                vec3 col = mix(uColor1, uColor2, vSpeed);
                col = mix(col, uColor3, smoothstep(0.3, 0.7, vSpeed));
                gl_FragColor = vec4(col, alpha);
            }
        \`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // --- Animation ---
    function animate() {
        const delta = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.getElapsedTime();

        // Update simulation uniforms
        posMat.uniforms.uPositions.value = posA.texture;
        posMat.uniforms.uVelocities.value = velA.texture;
        posMat.uniforms.uTime.value = elapsed;
        posMat.uniforms.uDelta.value = delta;
        posMat.uniforms.uMouse.value.set(mouse.x, mouse.y);

        // Simulate positions
        simQuad.material = posMat;
        renderer.setRenderTarget(posB);
        renderer.render(simScene, simCamera);

        // Simulate velocities (uses same shader, writes to velB)
        velMat.uniforms.uPositions.value = posA.texture;
        velMat.uniforms.uVelocities.value = velA.texture;
        velMat.uniforms.uTime.value = elapsed;
        velMat.uniforms.uDelta.value = delta;
        velMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
        simQuad.material = velMat;
        renderer.setRenderTarget(velB);
        renderer.render(simScene, simCamera);

        // Swap
        [posA, posB] = [posB, posA];
        [velA, velB] = [velB, velA];

        // Render particles
        pMat.uniforms.uPositions.value = posA.texture;
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);

        camera.position.x = Math.sin(elapsed * 0.1) * 2;
        camera.position.y = Math.cos(elapsed * 0.15) * 1;
        camera.lookAt(0, 0, 0);

        requestAnimationFrame(animate);
    }
    animate();

    // --- Resize ---
    function onResize() {
        const nw = container.clientWidth || window.innerWidth;
        const nh = container.clientHeight || window.innerHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', onResize);

    // --- Cleanup ---
    return function dispose() {
        window.removeEventListener('resize', onResize);
        posA.dispose(); posB.dispose();
        velA.dispose(); velB.dispose();
        posMat.dispose(); velMat.dispose(); pMat.dispose();
        pGeo.dispose();
        renderer.dispose();
        container.removeChild(renderer.domElement);
    };
}
`.trim();
    }

    normalizeCode(code) {
        let output = String(code || '').trim();
        output = output.replace(/^```(?:javascript|js)?\s*/i, '').replace(/```$/i, '').trim();
        if (!/\bfunction\s+initThreeScene\s*\(/.test(output) && !/\bconst\s+initThreeScene\s*=/.test(output)) {
            output = `function initThreeScene(container) {\n${output}\n}`;
        }
        return output;
    }

    validateCode(code) {
        const text = String(code || '');
        return {
            hasEntryPoint: /\b(initThreeScene)\s*\(/.test(text),
            hasRenderTarget: /WebGLRenderTarget/i.test(text),
            hasFloatType: /FloatType/.test(text),
            hasPingPong: /posA|posB|swap|ping.?pong/i.test(text),
            hasSimShader: /uPositions|uVelocities|simulation/i.test(text),
            hasDispose: /\.dispose\(\)/.test(text),
        };
    }

    async execute(specification = {}, designSystem = null) {
        this.log('info', `Generating GPGPU particle system (${this.detectHints(specification).particleCount.toLocaleString()} particles)...`);

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `GPGPU LLM call failed: ${error.message} — using fallback`);
            return this.buildFallback(specification);
        }

        let code = this.extractCode(response, 'javascript');
        code = this.normalizeCode(code);

        const validation = this.validateCode(code);

        if (!validation.hasEntryPoint || !validation.hasRenderTarget || !validation.hasPingPong) {
            this.log('warning', 'Generated GPGPU code incomplete — using fallback');
            return this.buildFallback(specification);
        }

        if (!validation.hasDispose) {
            this.log('warning', 'Generated GPGPU code missing dispose — appending cleanup reminder');
        }

        this.log('success', `GPGPU particle system generated (${this.detectHints(specification).particleCount.toLocaleString()} particles)`);
        return code;
    }
}

if (typeof window !== 'undefined') {
    window.CoderGPGPUAgent = CoderGPGPUAgent;
}

;
/* ============================================================
   WEBGPU AGENT — Generates Three.js WebGPURenderer scenes with
   TSL (Three Shading Language) node materials & WebGL fallback
   ============================================================ */

class CoderWebGPUAgent extends BaseAgent {
    constructor() {
        super(
            'CoderWebGPU',
            'Generates WebGPU + TSL node shader scenes with WebGL fallback'
        );

        this.config = {
            temperature: 0.62,
            maxTokens: 24576,
        };

        this.systemPrompt = `
You are a cutting-edge Three.js WebGPU developer utilizing WebGPURenderer and TSL (Three Shading Language) nodes.

CORE TECHNIQUE — WebGPU + TSL (Three Shading Language)

WebGPU brings high-performance compute shaders, storage buffers, and node-based materials to web graphics.

ARCHITECTURE & TSL CONCEPTS

1. DUAL RENDERER SETUP (WebGPU + WebGL Fallback)
   - Try WebGPURenderer first (async init required)
   - Fall back to standard WebGLRenderer if navigator.gpu is missing or fails:
   
   let renderer;
   if (navigator.gpu && typeof THREE.WebGPURenderer !== 'undefined') {
       try {
           renderer = new THREE.WebGPURenderer({ alpha: true, antialias: true });
           await renderer.init();
       } catch (e) {
           renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
       }
   } else {
       renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
   }

2. TSL NODE MATERIALS (when available)
   - TSL builds shader logic using node graphs instead of raw GLSL string parsing
   - Node imports: import { color, vec2, vec3, float, timerLocal, positionLocal, uv, sin, mix, texture } from 'three/nodes'
   - Material assignment:
     const material = new THREE.MeshBasicNodeMaterial();
     const time = timerLocal();
     material.colorNode = mix(color(0xff0000), color(0x0000ff), sin(time));
     material.positionNode = positionLocal.add(vec3(0, sin(time.mul(2.0)).mul(0.5), 0));

3. COMPUTE SHADERS
   - ComputeNode for parallel calculations on GPU
   - StorageBufferAttribute for GPU data storage
   - renderer.compute(computeNode) inside render loop

4. FALLBACK COMPATIBILITY
   - Three.js TSL nodes can run on WebGLRenderer in modern Three.js versions, but standard THREE.ShaderMaterial or standard materials MUST be provided as a 100% reliable fallback.

RULES
1. Output only valid JavaScript code.
2. Entry point: async function initThreeScene(container)
3. Check navigator.gpu explicitly before instantiating WebGPURenderer.
4. Always wrap WebGPU initialization in try...catch block with WebGL fallback.
5. Make sure the scene is visually compelling and responsive.
6. Provide proper cleanup function returning from initThreeScene.
`.trim();
    }

    detectHints(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();
        const colors = specification.colorPalette || {};
        return {
            primary: colors.primary || '#7C3AED',
            secondary: colors.secondary || '#0EA5E9',
            accent: colors.accent || '#FDE68A',
            wantsCompute: /compute|storage|particles|gpu/i.test(blob),
        };
    }

    buildPrompt(specification = {}) {
        const hints = this.detectHints(specification);
        return `
Create a futuristic Three.js scene utilizing WebGPURenderer with WebGL fallback.

PALETTE: Primary: ${hints.primary}, Secondary: ${hints.secondary}, Accent: ${hints.accent}

REQUIREMENTS:
- Entry point: async function initThreeScene(container)
- Dual renderer logic: try WebGPURenderer first, fallback to WebGLRenderer
- Node material / GLSL shader composition for dynamic surface or particles
- Animated, interactive, responsive, transparent background
- Complete resource cleanup on dispose return function
- Output ONLY raw JavaScript code.
`.trim();
    }

    buildFallback(specification = {}) {
        const hints = this.detectHints(specification);
        return `
async function initThreeScene(container) {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    let renderer;
    let isWebGPU = false;

    if (navigator.gpu && typeof THREE.WebGPURenderer !== 'undefined') {
        try {
            renderer = new THREE.WebGPURenderer({ alpha: true, antialias: true });
            await renderer.init();
            isWebGPU = true;
        } catch (e) {
            console.warn('WebGPU init failed, falling back to WebGL:', e.message);
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        }
    } else {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    }

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 8;

    // Glowing Torus Knot
    const geo = new THREE.TorusKnotGeometry(2, 0.6, 128, 32);
    const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('${hints.primary}'),
        roughness: 0.2,
        metalness: 0.8,
        wireframe: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Lights
    const light1 = new THREE.DirectionalLight('${hints.accent}', 2);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    const light2 = new THREE.PointLight('${hints.secondary}', 3, 20);
    light2.position.set(-5, -5, 2);
    scene.add(light2);

    const clock = new THREE.Clock();

    function animate() {
        const elapsed = clock.getElapsedTime();
        mesh.rotation.x = elapsed * 0.3;
        mesh.rotation.y = elapsed * 0.5;
        light2.position.x = Math.sin(elapsed * 2) * 6;
        light2.position.y = Math.cos(elapsed * 1.5) * 6;

        if (isWebGPU && typeof renderer.renderAsync === 'function') {
            renderer.renderAsync(scene, camera);
        } else {
            renderer.render(scene, camera);
        }
        requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
        const nw = container.clientWidth || window.innerWidth;
        const nh = container.clientHeight || window.innerHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', onResize);

    return function dispose() {
        window.removeEventListener('resize', onResize);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        container.removeChild(renderer.domElement);
    };
}
`.trim();
    }

    validateCode(code) {
        const text = String(code || '');
        return {
            hasEntryPoint: /initThreeScene\s*\(/.test(text),
            hasWebGPUCheck: /navigator\.gpu/i.test(text),
            hasRendererFallback: /WebGLRenderer/i.test(text),
        };
    }

    async execute(specification = {}, designSystem = null) {
        this.log('info', 'Generating WebGPU / TSL scene with WebGL fallback...');

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `WebGPU LLM call failed: ${error.message} — using fallback`);
            return this.buildFallback(specification);
        }

        let code = this.extractCode(response, 'javascript');
        code = String(code || '').trim()
            .replace(/^```(?:javascript|js)?\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        const validation = this.validateCode(code);

        if (!validation.hasEntryPoint || !validation.hasWebGPUCheck) {
            this.log('warning', 'Generated WebGPU code incomplete — using fallback');
            return this.buildFallback(specification);
        }

        this.log('success', 'WebGPU scene generated with WebGL fallback');
        return code;
    }
}

if (typeof window !== 'undefined') {
    window.CoderWebGPUAgent = CoderWebGPUAgent;
}

;
/* ============================================================
   PHYSICS AGENT — Generates Rapier3D physics integration
   for Three.js scenes: rigid bodies, colliders, constraints
   ============================================================ */

class CoderPhysicsAgent extends BaseAgent {
    constructor() {
        super(
            'CoderPhysics',
            'Generates Rapier3D physics for Three.js scenes'
        );

        this.config = {
            temperature: 0.6,
            maxTokens: 24576,
        };

        this.systemPrompt = `
You are an expert physics simulation developer using Rapier3D with Three.js.

CORE TECHNIQUE — Rapier3D Physics Integration

Rapier is a fast, deterministic physics engine compiled to WebAssembly.
CDN: loaded via importmap or global RAPIER from @dimforge/rapier3d-compat.

ARCHITECTURE

1. INITIALIZATION (async)
   - Import RAPIER from CDN or global
   - await RAPIER.init() — must be async, WASM needs to load
   - const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })

2. RIGID BODIES
   - RigidBodyDesc.dynamic() — affected by forces/gravity
   - RigidBodyDesc.fixed() — static, immovable (floors, walls)
   - RigidBodyDesc.kinematicPositionBased() — user-controlled movement
   - body.setTranslation({ x, y, z }, true)
   - body.setRotation({ x, y, z, w }, true) — quaternion

3. COLLIDERS
   - ColliderDesc.cuboid(hx, hy, hz) — box half-extents
   - ColliderDesc.ball(radius) — sphere
   - ColliderDesc.cylinder(halfHeight, radius)
   - ColliderDesc.capsule(halfHeight, radius)
   - ColliderDesc.trimesh(vertices, indices) — custom mesh
   - Attach to body: world.createCollider(colliderDesc, body)

4. SIMULATION LOOP
   - world.step() — advance simulation by one timestep
   - For each body: read position and rotation
   - Apply to corresponding Three.js mesh:
     mesh.position.copy(body.translation())
     mesh.quaternion.copy(body.rotation())

5. FORCES & IMPULSES
   - body.applyImpulse({ x, y, z }, true) — instant force
   - body.applyForce({ x, y, z }, true) — continuous force
   - body.setLinvel({ x, y, z }, true) — set velocity directly

6. CONSTRAINTS (joints)
   - RevoluteJoint — hinge
   - BallJoint — ball-and-socket
   - PrismaticJoint — slider
   - FixedJoint — weld

TEMPLATE PATTERN

async function initThreeScene(container) {
    // Three.js setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 100);
    
    // Rapier setup
    await RAPIER.init();
    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    
    // Ground (fixed)
    const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.1, 50), groundBody);
    const groundMesh = new THREE.Mesh(
        new THREE.BoxGeometry(100, 0.2, 100),
        new THREE.MeshStandardMaterial({ color: '#333' })
    );
    scene.add(groundMesh);
    
    // Dynamic objects
    const bodies = [];
    const meshes = [];
    for (let i = 0; i < 50; i++) {
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(Math.random()*10-5, 10+i*2, Math.random()*10-5);
        const body = world.createRigidBody(bodyDesc);
        world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), body);
        bodies.push(body);
        
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5) })
        );
        scene.add(mesh);
        meshes.push(mesh);
    }
    
    // Animation loop
    function animate() {
        world.step();
        for (let i = 0; i < bodies.length; i++) {
            const pos = bodies[i].translation();
            const rot = bodies[i].rotation();
            meshes[i].position.set(pos.x, pos.y, pos.z);
            meshes[i].quaternion.set(rot.x, rot.y, rot.z, rot.w);
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

CDN LOADING
Option 1 (script tag): <script src="https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.14.0/rapier.js"></script>
Then: const RAPIER = window.RAPIER;

Option 2 (dynamic import): const RAPIER = await import('https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.14.0/+esm');

RULES

1. Use THREE from global scope.
2. RAPIER from global scope (CDN loaded).
3. Function: initThreeScene(container) — must be async for RAPIER.init().
4. Always create a ground plane (fixed body).
5. Sync Three.js meshes with Rapier bodies every frame.
6. Add lighting (ambient + directional) for visible meshes.
7. Handle resize.
8. Dispose world, renderer, geometries, materials on cleanup.
9. Keep body count reasonable (50-200 for real-time).
10. Use BufferGeometry, not legacy Geometry.

PERFORMANCE
* 50-100 dynamic bodies is smooth on most devices
* Use simple colliders (cuboid, ball) over trimesh when possible
* world.step() with default timestep (1/60)
* Reuse materials and geometries via instancing when >20 identical shapes
`.trim();
    }

    buildPrompt(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();
        const wantsDominos = /domino|chain|cascade/i.test(blob);
        const wantsRagdoll = /ragdoll|character|body/i.test(blob);
        const wantsVehicle = /car|vehicle|wheel/i.test(blob);
        const wantsDestruction = /destruct|break|shatter|explode/i.test(blob);

        return `
Create a Three.js scene with Rapier3D physics.

CONTEXT
${JSON.stringify(specification.artDirection || {}, null, 2)}

PHYSICS TYPE
${wantsDominos ? '- Domino cascade / chain reaction' : ''}
${wantsRagdoll ? '- Ragdoll character with joints' : ''}
${wantsVehicle ? '- Vehicle with wheel constraints' : ''}
${wantsDestruction ? '- Destructible objects / shattering' : ''}
${!wantsDominos && !wantsRagdoll && !wantsVehicle && !wantsDestruction ? '- Falling objects onto ground plane with mouse interaction' : ''}

PALETTE
${JSON.stringify(specification.colorPalette || { primary: '#C84B31', secondary: '#173F5F' }, null, 2)}

REQUIREMENTS
* async function initThreeScene(container)
* await RAPIER.init() — RAPIER from global scope (CDN)
* Fixed ground body + dynamic objects (50-100)
* Sync mesh position/rotation from body.translation()/rotation() each frame
* Add ambient + directional lighting
* Mouse click to spawn new objects or apply impulses
* Transparent background (alpha: true)
* Handle resize
* Dispose everything on cleanup

OUTPUT: Only JavaScript code.
`.trim();
    }

    buildFallback(specification = {}) {
        const colors = specification.colorPalette || {};
        const primary = colors.primary || '#C84B31';
        const secondary = colors.secondary || '#173F5F';

        return `
async function initThreeScene(container) {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.set(0, 12, 20);
    camera.lookAt(0, 2, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    // Rapier init
    await RAPIER.init();
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    const world = new RAPIER.World(gravity);

    // Ground
    const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    world.createCollider(RAPIER.ColliderDesc.cuboid(25, 0.1, 25), groundBody);
    const groundMesh = new THREE.Mesh(
        new THREE.BoxGeometry(50, 0.2, 50),
        new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.9 })
    );
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Dynamic cubes
    const bodies = [];
    const meshes = [];
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const colors = [new THREE.Color('${primary}'), new THREE.Color('${secondary}'), new THREE.Color('#F6C85F')];

    function spawnBox(x, y, z) {
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(x, y, z)
            .setRotation({ x: Math.random()*0.5, y: Math.random()*0.5, z: Math.random()*0.5, w: 1 });
        const body = world.createRigidBody(bodyDesc);
        world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setRestitution(0.3).setFriction(0.7),
            body
        );

        const mat = new THREE.MeshStandardMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            roughness: 0.5,
            metalness: 0.3,
        });
        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        bodies.push(body);
        meshes.push(mesh);
    }

    // Initial spawn
    for (let i = 0; i < 60; i++) {
        spawnBox(
            (Math.random() - 0.5) * 8,
            5 + i * 1.5,
            (Math.random() - 0.5) * 8
        );
    }

    // Mouse click to spawn
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    container.addEventListener('click', function(e) {
        const rect = container.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const dir = raycaster.ray.direction;
        spawnBox(dir.x * 5, 15, dir.z * 5);
    });

    // Animation
    const clock = new THREE.Clock();
    function animate() {
        world.step();

        for (let i = 0; i < bodies.length; i++) {
            const pos = bodies[i].translation();
            const rot = bodies[i].rotation();
            meshes[i].position.set(pos.x, pos.y, pos.z);
            meshes[i].quaternion.set(rot.x, rot.y, rot.z, rot.w);

            // Remove fallen objects
            if (pos.y < -20) {
                scene.remove(meshes[i]);
                meshes[i].material.dispose();
                world.removeRigidBody(bodies[i]);
                bodies.splice(i, 1);
                meshes.splice(i, 1);
                i--;
            }
        }

        const t = clock.getElapsedTime();
        camera.position.x = Math.sin(t * 0.15) * 20;
        camera.position.z = Math.cos(t * 0.15) * 20;
        camera.lookAt(0, 3, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // Resize
    function onResize() {
        const nw = container.clientWidth || window.innerWidth;
        const nh = container.clientHeight || window.innerHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', onResize);

    // Cleanup
    return function dispose() {
        window.removeEventListener('resize', onResize);
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].material.dispose();
        }
        boxGeo.dispose();
        world.free();
        renderer.dispose();
        container.removeChild(renderer.domElement);
    };
}
`.trim();
    }

    validateCode(code) {
        const text = String(code || '');
        return {
            hasEntryPoint: /initThreeScene\s*\(/.test(text),
            hasRapierInit: /RAPIER\.init\(\)|rapier.*init/i.test(text),
            hasWorld: /new\s+RAPIER\.World/i.test(text),
            hasRigidBody: /RigidBodyDesc/i.test(text),
            hasCollider: /ColliderDesc/i.test(text),
            hasStep: /world\.step\(\)/i.test(text),
            hasSync: /translation\(\)|rotation\(\)/i.test(text),
        };
    }

    async execute(specification = {}, designSystem = null) {
        this.log('info', 'Generating Rapier3D physics scene...');

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Physics LLM call failed: ${error.message} — using fallback`);
            return this.buildFallback(specification);
        }

        let code = this.extractCode(response, 'javascript');
        code = String(code || '').trim()
            .replace(/^```(?:javascript|js)?\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        const validation = this.validateCode(code);

        if (!validation.hasEntryPoint || !validation.hasRapierInit || !validation.hasWorld || !validation.hasStep) {
            this.log('warning', 'Generated physics code incomplete — using fallback');
            return this.buildFallback(specification);
        }

        this.log('success', 'Rapier3D physics scene generated');
        return code;
    }
}

if (typeof window !== 'undefined') {
    window.CoderPhysicsAgent = CoderPhysicsAgent;
}

;
/* ============================================================
   AUDIO-REACTIVE AGENT — Generates Web Audio API analysis
   bridge that feeds frequency band uniforms to Three.js shaders
   ============================================================ */

class CoderAudioAgent extends BaseAgent {
    constructor() {
        super(
            'CoderAudio',
            'Generates audio-reactive bridge: Web Audio API → shader uniforms'
        );

        this.config = {
            temperature: 0.6,
            maxTokens: 16384,
        };

        this.systemPrompt = `
You are an expert Web Audio API developer who creates audio-reactive visual bridges for Three.js scenes.

CORE TECHNIQUE — Audio Analysis → Shader Uniforms

1. AUDIO SOURCE
   - Option A: Microphone via navigator.mediaDevices.getUserMedia({ audio: true })
   - Option B: Audio file via new Audio(url) + audioContext.createMediaElementSource()
   - Option C: Simulated sine-wave fallback when no audio permission

2. ANALYSIS PIPELINE
   - AudioContext → createAnalyser()
   - analyser.fftSize = 64 (gives 32 frequency bins)
   - Uint8Array(analyser.frequencyBinCount) for frequency data
   - Each frame: analyser.getByteFrequencyData(dataArray)

3. FREQUENCY BANDS
   - Bass: average of bins 0-4 (low frequencies: kick, sub-bass)
   - Mid: average of bins 5-15 (vocals, melody, snare)
   - High: average of bins 16-31 (hi-hats, cymbals, brightness)
   - Normalize each to 0.0-1.0: band = avgBins / 255.0

4. SMOOTHING
   - Smooth with exponential lerp to prevent jitter:
   - smoothBass += (rawBass - smoothBass) * 0.12
   - Use different rates for attack (fast, 0.15) vs release (slow, 0.05)

5. OUTPUT — Uniform Bridge Object
   The audio bridge returns an object with:
   - update(): call each animation frame
   - values: { bass: 0-1, mid: 0-1, high: 0-1, volume: 0-1 }
   - connectToMaterial(shaderMaterial): auto-sets uBass, uMid, uHigh, uVolume
   - dispose(): cleanup AudioContext and streams

TEMPLATE PATTERN

function createAudioBridge(options) {
    let audioContext, analyser, source, dataArray;
    const values = { bass: 0, mid: 0, high: 0, volume: 0 };
    let isActive = false;

    async function init() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            isActive = true;
        } catch (e) {
            console.warn('Audio permission denied, using simulated audio');
            isActive = false; // Will use fallback simulation
        }
    }

    function update(time) {
        if (isActive && analyser) {
            analyser.getByteFrequencyData(dataArray);
            let bassSum = 0, midSum = 0, highSum = 0;
            for (let i = 0; i < 5; i++) bassSum += dataArray[i];
            for (let i = 5; i < 16; i++) midSum += dataArray[i];
            for (let i = 16; i < 32; i++) highSum += dataArray[i];
            const rawBass = bassSum / (5 * 255);
            const rawMid = midSum / (11 * 255);
            const rawHigh = highSum / (16 * 255);
            values.bass += (rawBass - values.bass) * 0.12;
            values.mid += (rawMid - values.mid) * 0.1;
            values.high += (rawHigh - values.high) * 0.08;
            values.volume = (values.bass + values.mid + values.high) / 3;
        } else {
            // Simulated audio fallback
            values.bass = 0.3 + Math.sin(time * 2.0) * 0.3;
            values.mid = 0.2 + Math.sin(time * 3.5 + 1.0) * 0.2;
            values.high = 0.15 + Math.sin(time * 5.0 + 2.0) * 0.15;
            values.volume = (values.bass + values.mid + values.high) / 3;
        }
    }

    function connectToMaterial(material) {
        if (material.uniforms) {
            if (material.uniforms.uBass) material.uniforms.uBass.value = values.bass;
            if (material.uniforms.uMid) material.uniforms.uMid.value = values.mid;
            if (material.uniforms.uHigh) material.uniforms.uHigh.value = values.high;
            if (material.uniforms.uVolume) material.uniforms.uVolume.value = values.volume;
        }
    }

    function dispose() {
        if (source && source.mediaStream) {
            source.mediaStream.getTracks().forEach(t => t.stop());
        }
        if (audioContext) audioContext.close();
    }

    return { init, update, values, connectToMaterial, dispose };
}

RULES

1. Output only valid JavaScript code.
2. No ES modules — use global function pattern.
3. Always include microphone fallback (simulated sine-wave).
4. Smooth values with exponential lerp — never raw jumps.
5. Provide connectToMaterial() helper for easy shader integration.
6. Provide dispose() for cleanup.
7. The bridge must work standalone — not dependent on Three.js.
8. Audio analysis runs in the same animation frame as the 3D render.
`.trim();
    }

    buildPrompt(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();
        const wantsMic = /microphone|mic|live|realtime|voice/i.test(blob);
        const wantsFile = /file|mp3|song|track|playlist/i.test(blob);

        return `
Create an audio-reactive bridge for a Three.js scene.

CONTEXT
${JSON.stringify(specification.artDirection || {}, null, 2)}

AUDIO SOURCE
${wantsMic ? '- Primary: Microphone input (getUserMedia)' : ''}
${wantsFile ? '- Primary: Audio file playback' : ''}
${!wantsMic && !wantsFile ? '- Primary: Microphone with simulated fallback' : ''}
- Always include sine-wave simulation fallback if audio is unavailable.

OUTPUT REQUIREMENTS
* Global function: createAudioBridge(options) returning { init, update, values, connectToMaterial, dispose }
* Values object: { bass: 0-1, mid: 0-1, high: 0-1, volume: 0-1 }
* Smoothed with exponential lerp (attack 0.12-0.15, release 0.05-0.08)
* connectToMaterial(mat) sets uBass, uMid, uHigh, uVolume on shader uniforms
* Proper dispose of AudioContext and media streams
* No ES modules. Output only JavaScript code.
`.trim();
    }

    buildFallback() {
        return `
function createAudioBridge(options) {
    const opts = options || {};
    let audioContext = null;
    let analyser = null;
    let source = null;
    let dataArray = null;
    let isActive = false;

    const values = { bass: 0, mid: 0, high: 0, volume: 0 };

    async function init() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.8;
            dataArray = new Uint8Array(analyser.frequencyBinCount);

            if (opts.audioElement) {
                source = audioContext.createMediaElementSource(opts.audioElement);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                isActive = true;
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                isActive = true;
            }
        } catch (e) {
            console.warn('Audio unavailable, using simulation:', e.message);
            isActive = false;
        }
    }

    function update(time) {
        if (isActive && analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray);

            let bassSum = 0, midSum = 0, highSum = 0;
            for (let i = 0; i < 5; i++) bassSum += dataArray[i];
            for (let i = 5; i < 16; i++) midSum += dataArray[i];
            for (let i = 16; i < 32; i++) highSum += dataArray[i];

            const rawBass = bassSum / (5 * 255);
            const rawMid = midSum / (11 * 255);
            const rawHigh = highSum / (16 * 255);

            // Smooth with different attack/release
            const attackRate = 0.15;
            const releaseRate = 0.06;

            values.bass += ((rawBass > values.bass ? attackRate : releaseRate) * (rawBass - values.bass));
            values.mid += ((rawMid > values.mid ? attackRate : releaseRate) * (rawMid - values.mid));
            values.high += ((rawHigh > values.high ? attackRate : releaseRate) * (rawHigh - values.high));
        } else {
            // Simulated audio — organic sine-wave beats
            const t = time || 0;
            values.bass = 0.35 + Math.sin(t * 1.8) * 0.25 + Math.sin(t * 0.7) * 0.1;
            values.mid = 0.25 + Math.sin(t * 3.2 + 1.0) * 0.2 + Math.sin(t * 1.5 + 0.5) * 0.08;
            values.high = 0.15 + Math.sin(t * 5.5 + 2.0) * 0.12 + Math.sin(t * 2.3 + 1.2) * 0.06;
        }

        values.volume = (values.bass * 0.5 + values.mid * 0.3 + values.high * 0.2);
    }

    function connectToMaterial(material) {
        if (!material || !material.uniforms) return;
        if (material.uniforms.uBass !== undefined) material.uniforms.uBass.value = values.bass;
        if (material.uniforms.uMid !== undefined) material.uniforms.uMid.value = values.mid;
        if (material.uniforms.uHigh !== undefined) material.uniforms.uHigh.value = values.high;
        if (material.uniforms.uVolume !== undefined) material.uniforms.uVolume.value = values.volume;
    }

    function dispose() {
        if (source && source.mediaStream) {
            source.mediaStream.getTracks().forEach(function(t) { t.stop(); });
        }
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
        }
        audioContext = null;
        analyser = null;
        source = null;
        dataArray = null;
        isActive = false;
    }

    return { init: init, update: update, values: values, connectToMaterial: connectToMaterial, dispose: dispose, isActive: function() { return isActive; } };
}
`.trim();
    }

    validateCode(code) {
        const text = String(code || '');
        return {
            hasCreateBridge: /createAudioBridge/i.test(text),
            hasAudioContext: /AudioContext/i.test(text),
            hasAnalyser: /createAnalyser|AnalyserNode/i.test(text),
            hasFrequencyData: /getByteFrequencyData|frequencyBinCount/i.test(text),
            hasBands: /bass|mid|high/i.test(text),
            hasDispose: /dispose/i.test(text),
            hasFallback: /simulat|fallback|sine|Math\.sin/i.test(text),
        };
    }

    async execute(specification = {}, designSystem = null) {
        this.log('info', 'Creating audio-reactive bridge...');

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Audio bridge LLM call failed: ${error.message} — using fallback`);
            return this.buildFallback();
        }

        let code = this.extractCode(response, 'javascript');
        code = String(code || '').trim()
            .replace(/^```(?:javascript|js)?\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        const validation = this.validateCode(code);

        if (!validation.hasCreateBridge || !validation.hasAudioContext || !validation.hasBands) {
            this.log('warning', 'Generated audio code incomplete — using fallback');
            return this.buildFallback();
        }

        if (!validation.hasFallback) {
            this.log('warning', 'Audio code missing simulation fallback — user may get silence without mic');
        }

        this.log('success', 'Audio-reactive bridge generated');
        return code;
    }
}

if (typeof window !== 'undefined') {
    window.CoderAudioAgent = CoderAudioAgent;
}

;
/* ============================================================
   MOTION DIRECTOR AGENT — Cinematic motion for React AND static
   ============================================================ */

class AnimatorAgent extends BaseAgent {
    constructor() {
        super(
            'MotionDirector',
            'Injects advanced cinematic animations into React and static builds'
        );

        this.config = {
            maxSourceFiles: 12,
            fallbackSourceFiles: 8,
            maxFileChars: 14000,
            headChars: 9000,
            tailChars: 3000,
            temperature: 0.45,
            maxTokens: 32768,
        };

        this.systemPrompt = `
You are an elite motion director for an Awwwards-caliber digital studio.

Your job is to inject purposeful, expensive-feeling motion into existing code without breaking layout, routing, data fetching, accessibility, or performance.

SUPPORTED STACKS
1. React / Next.js — Framer Motion + GSAP ScrollTrigger
2. Static HTML/CSS/JS — GSAP timelines, ScrollTrigger, refined micro-interactions

DESIGN PHILOSOPHIES YOU UNDERSTAND:
- Skeuomorphism: Realistic press/depth, embossed text shadows
- Neomorphism: Soft shadow morph on hover, pressed states
- Glassmorphism: Shimmer sweeps, blur transitions, glow pulses
- Claymorphism: Bouncy squish, playful wobble, clay press
- Minimalism: Subtle fade, text weight transitions, minimal hovers
- Maximalism: Explosive color shifts, layered parallax, blob morphing
- Brutalism: Hard snap transitions, glitch effects, raw reveals
- Liquid Glass: Apple-style specular shifts, refraction on scroll
- Spatial UI: 3D perspective shifts, z-layer transitions, depth-aware parallax

ADVANCED EFFECTS YOU INJECT:
- Hover: data-hover="tilt|glow|lift|spotlight|perspective" with appropriate JS
- 3D Motion: data-3d="tilt|float|flip" with perspective and mouse tracking
- 3D Scroll: data-scroll-3d="rotate|zoom|flip|spiral" with scroll progress
- Entrance Reveals: data-reveal with IntersectionObserver → .revealed class
- Micro Interactions: data-micro="ripple|bounce|magnetic|counter" 
- Parallax: data-parallax-scroll, data-parallax-depth, data-parallax-mouse
- 3D Windows: .window-3d with interactive mouse tilt
- Smooth Loader: .page-loader with progress animation
- Custom Cursor: Mix-blend-mode cursor follower

PRIMARY OBJECTIVE
- Make the motion feel intentional, premium, and art-directed.
- Match motion style to the design philosophy (e.g., bouncy for clay, snappy for brutalism).
- Prefer a few signature moments over animating everything.
- Keep the implementation robust and minimal.

RULES
1. Think through the motion plan before making changes.
2. Do not output JSON.
3. Output only the files you changed.
4. Preserve existing logic, structure, and semantics.
5. Respect prefers-reduced-motion.
6. Use custom easings and springs where appropriate.
7. For hero headlines, use word/line stagger blur-reveal when it fits.
8. For static sites, enhance script.js and only lightly annotate HTML when needed.
9. Do not invent fake metrics or change brand copy.
10. When the design philosophy is specified, match animation feel to it.

OUTPUT FORMAT
**File: src/components/Hero.jsx**
\`\`\`jsx
// updated code
\`\`\`

**File: script.js**
\`\`\`js
// updated code
\`\`\`
        `.trim();
    }

    detectProjectType(files = {}) {
        const entries = Object.entries(files);
        const isReact = entries.some(([name]) => /^(src\/|app\/)/.test(name) || /\.(jsx|tsx)$/.test(name));
        const isStatic = !!(files['index.html'] || files['script.js'] || files['styles.css']);
        return { isReact, isStatic };
    }

    scoreFile(name, isReact) {
        if (isReact) {
            const weights = [
                [/^(src\/|app\/).*\/?(page|layout|App)\.(jsx|tsx)$/, 100],
                [/components\//, 90],
                [/globals\.css$/, 70],
                [/index\.css$/, 70],
                [/\.(jsx|tsx)$/, 60],
                [/\.(css)$/, 45],
            ];

            return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
        }

        const weights = [
            [/^index\.html$/, 100],
            [/^script\.js$/, 95],
            [/^styles\.css$/, 90],
            [/\.(html|js|css)$/, 60],
        ];

        return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
    }

    selectSourceFiles(files = {}) {
        const entries = Object.entries(files);
        if (!entries.length) return {};

        const { isReact } = this.detectProjectType(files);

        const ranked = entries
            .map(([name, content]) => ({
                name,
                content,
                score: this.scoreFile(name, isReact),
                length: String(content ?? '').length,
            }))
            .sort((a, b) => b.score - a.score || b.length - a.length);

        const selected = ranked
            .filter(item => item.score > 0)
            .slice(0, this.config.maxSourceFiles);

        if (selected.length) {
            return Object.fromEntries(selected.map(({ name, content }) => [name, content]));
        }

        return Object.fromEntries(entries.slice(0, this.config.fallbackSourceFiles));
    }

    smartTruncate(text) {
        const source = String(text ?? '');
        if (source.length <= this.config.maxFileChars) return source;

        return (
            source.slice(0, this.config.headChars) +
            '\n/* ... truncated for motion pass ... */\n' +
            source.slice(-this.config.tailChars)
        );
    }

    compactFileContents(source = {}) {
        const compactSource = {};
        for (const [name, content] of Object.entries(source)) {
            compactSource[name] = this.smartTruncate(content);
        }
        return compactSource;
    }

    buildMotionBrief(specification = {}, isReact = false) {
        const artDirection = specification.artDirection || {};
        const qualityContract = specification.qualityContract || {};
        const motionPlan = artDirection.motionPlan || specification.animations || [];
        const systems = (specification.motionSystems || motionPlan || []).slice(0, 5);
        const scrollChoreography = specification.scrollChoreography || [];

        const hardRules = [
            '- Do not break existing logic, routing, data fetching, or accessibility.',
            '- Keep reduced-motion support intact.',
            '- Prefer premium motion moments over constant movement.',
            '- Use real implementation, not pseudo-code.',
            '- Return only the updated files, no extra commentary.',
        ];

        const implementationContracts = [
            '- masked-title-reveal → split words/lines + clip/blur intro',
            '- scroll-scrub-camera → ScrollTrigger scrub on WebGL camera or CSS depth layers',
            '- sticky-stacking-scenes → pin sections + scale previous scene',
            '- video-hero-crossfade → rAF-friendly video handling, poster fallback',
            '- magnetic-quickto-cta → GSAP quickTo on [data-magnet]',
            '- parallax-media-layers → multi-layer yPercent scrub',
            '- horizontal-gallery-pin → horizontal pin gallery',
            '- blend-mode-type → mix-blend-mode with contrast-safe fallback',
            '- grain-vignette-grade → keep/ensure grain + vignette overlays',
            '- Prefer GSAP ScrollTrigger + Lenis for static; Framer Motion for React.',
        ];

        const midFlight = Array.isArray(specification.midFlightNotes) && specification.midFlightNotes.length
            ? `\nMID-FLIGHT USER NOTES (must honor)\n${specification.midFlightNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`
            : '';

        return `
Inject cinematic, production-safe motion into this ${isReact ? 'React/Next' : 'static'} project.
${midFlight}
ART DIRECTION
${JSON.stringify(artDirection, null, 2)}

MOTION SYSTEMS (implement these for real — max 5)
${JSON.stringify(systems, null, 2)}

SCROLL CHOREOGRAPHY
${JSON.stringify(scrollChoreography, null, 2)}

HERO TREATMENT
${specification.heroTreatment || 'n/a'}

QUALITY CONTRACT
${JSON.stringify(qualityContract, null, 2)}

IMPLEMENTATION GUIDELINES
${implementationContracts.join('\n')}

HARD RULES
${hardRules.join('\n')}

FILES TO ENHANCE
${Object.entries(specification.sourceFiles || {})
                .map(([name, body]) => `\n**File: ${name}**\n\`\`\`\n${body}\n\`\`\``)
                .join('\n')}

Return only updated files in the required Markdown format.
        `.trim();
    }

    buildPrompt({ isReact, specification, sourceFiles }) {
        return this.buildMotionBrief(
            {
                ...(specification || {}),
                sourceFiles,
            },
            isReact
        );
    }

    extractFilesFromMarkdown(responseText) {
        const text = String(responseText ?? '');
        const files = {};
        const sectionRegex = /\*\*File:\s*([^\n*]+)\*\*\s*```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g;

        let match;
        while ((match = sectionRegex.exec(text)) !== null) {
            const fileName = match[1].trim();
            const fileBody = match[2].replace(/\s+$/, '');
            files[fileName] = fileBody;
        }

        return files;
    }

    extractParsedFiles(responseText) {
        if (typeof this.extractFiles === 'function') {
            const parsed = this.extractFiles(responseText);
            if (parsed && Object.keys(parsed).length) return parsed;
        }

        return this.extractFilesFromMarkdown(responseText);
    }

    validateUpdateSet(parsedFiles = {}, originalFiles = {}) {
        const safe = {};

        for (const [name, content] of Object.entries(parsedFiles)) {
            const allowed =
                Object.prototype.hasOwnProperty.call(originalFiles, name) ||
                /components\//.test(name) ||
                /^(index\.html|styles\.css|script\.js)$/.test(name);

            const body = String(content ?? '').trim();

            if (!allowed) continue;
            if (body.length < 40) continue;

            safe[name] = body;
        }

        return safe;
    }

    async execute(specification, designSystem, previousCode = {}) {
        this.log('info', 'Motion Director analyzing project for cinematic polish...');

        const files = previousCode || {};
        const entries = Object.entries(files);

        if (!entries.length) {
            this.log('warning', 'No files to animate');
            return {};
        }

        const { isReact } = this.detectProjectType(files);
        const sourceFiles = this.compactFileContents(this.selectSourceFiles(files));

        const prompt = this.buildPrompt({
            isReact,
            specification,
            sourceFiles,
        });

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Motion Director LLM call failed: ${error.message}`);
            return {};
        }

        try {
            const parsed = this.extractParsedFiles(response);
            const safe = this.validateUpdateSet(parsed, files);

            this.log('success', `Motion Director updated ${Object.keys(safe).length} file(s)`);
            return safe;
        } catch (error) {
            this.log('warning', `Motion Director could not parse updates: ${error.message}`);
            return {};
        }
    }
}

window.AnimatorAgent = AnimatorAgent;
;
/* ============================================================
   ARCHITECT AGENT — Backend infrastructure, Prisma, API routes,
   authentication, and data modeling for Next.js / SaaS projects
   ============================================================ */

class ArchitectAgent extends BaseAgent {
  constructor() {
    super(
      'Architect',
      'Designs hardcore backend infrastructure, Prisma DB schemas, and Next.js API routes'
    );

    this.config = {
      maxSourceFiles: 14,
      fallbackSourceFiles: 8,
      maxFileChars: 16000,
      headChars: 10000,
      tailChars: 3500,
      temperature: 0.25,
      maxTokens: 32768,
    };

    this.systemPrompt = `
You are a Principal Backend Architect for a top-tier SaaS development agency.

Your job is to design the best possible backend architecture, data layer, and API surface for the user's requirement.

SPECIALTIES
- Prisma ORM schema design for PostgreSQL / SQLite
- Next.js 14+ App Router API design (Route Handlers)
- Authentication and authorization flows
- Relational data modeling: one-to-many, many-to-many, self-relations, polymorphism when justified
- Multi-tenant SaaS patterns
- Zustand store definitions when state contracts are needed

RULES
1. Before outputting code, think through the architecture decisions: tables, relations, API endpoints, auth, permissions, indexes, and data flows.
2. Output only the files you changed.
3. Always include a robust prisma/schema.prisma file with relations, indexes, timestamps, and sensible defaults.
4. Provide exact Next.js route handler files when APIs are needed.
5. Provide lib/prisma.ts.
6. Use production-ready TypeScript.
7. Use proper error handling, status codes, and type safety.
8. Do not break existing conventions if prior code is present.
9. Prefer clear, maintainable backend structure over overengineering.
10. If the spec implies auth, include the auth flow and the minimum supporting files needed.

OUTPUT FORMAT
**File: prisma/schema.prisma**
\`\`\`prisma
// code here
\`\`\`

**File: lib/prisma.ts**
\`\`\`typescript
// code here
\`\`\`

**File: app/api/.../route.ts**
\`\`\`typescript
// code here
\`\`\`
    `.trim();
  }

  detectProjectType(files = {}) {
    const names = Object.keys(files);
    const isNextAppRouter = names.some((name) =>
      /^(app|src\/app)\//.test(name) || /route\.ts$/.test(name)
    );
    const isReactOnly = names.some((name) => /\.(tsx|jsx)$/.test(name));
    const isBackendExisting = names.some((name) =>
      /prisma\/schema\.prisma|lib\/prisma\.ts|middleware\.ts|auth\./.test(name)
    );

    return { isNextAppRouter, isReactOnly, isBackendExisting };
  }

  inferRequirements(specification = {}) {
    const text = JSON.stringify(specification || {}).toLowerCase();

    const flags = {
      auth: /auth|login|signup|session|token|jwt|oauth|sso|magic link/.test(text),
      roles: /role|permission|rbac|admin|staff|owner|member|team/.test(text),
      orgs: /organization|workspace|tenant|multi-tenant|company|team/.test(text),
      billing: /billing|subscription|plan|stripe|invoice|payment|checkout/.test(text),
      content: /post|comment|message|chat|feed|article|blog|cms|note/.test(text),
      files: /upload|file|asset|image|media|storage/.test(text),
      audit: /audit|log|history|activity/.test(text),
      analytics: /analytics|metric|event|tracking|dashboard/.test(text),
      realtime: /realtime|live|websocket|presence|notification/.test(text),
      apiHeavy: /api|route|endpoint|crud|rest/.test(text),
    };

    return flags;
  }

  scoreFile(name, isNextAppRouter) {
    if (isNextAppRouter) {
      const weights = [
        [/^app\/api\/.+\/route\.ts$/, 100],
        [/^src\/app\/api\/.+\/route\.ts$/, 100],
        [/prisma\/schema\.prisma$/, 95],
        [/^lib\/prisma\.ts$/, 90],
        [/^lib\/auth\.(ts|tsx)$/, 85],
        [/^middleware\.ts$/, 80],
        [/^types\/.+\.(ts|tsx)$/, 60],
        [/^lib\/.+\.(ts|tsx)$/, 55],
        [/^app\/.+\.(ts|tsx)$/, 45],
        [/\.(ts|tsx)$/, 35],
      ];

      return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
    }

    const weights = [
      [/prisma\/schema\.prisma$/, 100],
      [/^lib\/prisma\.ts$/, 90],
      [/^app\/api\/.+\/route\.ts$/, 85],
      [/\.(ts|tsx|js|jsx)$/, 35],
    ];

    return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
  }

  selectSourceFiles(files = {}) {
    const entries = Object.entries(files);
    if (!entries.length) return {};

    const { isNextAppRouter } = this.detectProjectType(files);

    const ranked = entries
      .map(([name, content]) => ({
        name,
        content,
        score: this.scoreFile(name, isNextAppRouter),
        length: String(content ?? '').length,
      }))
      .sort((a, b) => b.score - a.score || b.length - a.length);

    const selected = ranked
      .filter((item) => item.score > 0)
      .slice(0, this.config.maxSourceFiles);

    if (selected.length) {
      return Object.fromEntries(selected.map(({ name, content }) => [name, content]));
    }

    return Object.fromEntries(entries.slice(0, this.config.fallbackSourceFiles));
  }

  smartTruncate(text) {
    const source = String(text ?? '');
    if (source.length <= this.config.maxFileChars) return source;

    return (
      source.slice(0, this.config.headChars) +
      '\n/* ... truncated for architecture pass ... */\n' +
      source.slice(-this.config.tailChars)
    );
  }

  compactFileContents(source = {}) {
    const compactSource = {};
    for (const [name, content] of Object.entries(source)) {
      compactSource[name] = this.smartTruncate(content);
    }
    return compactSource;
  }

  buildArchitectureBrief({ specification = {}, sourceFiles = {}, isNextAppRouter = true, flags = {} }) {
    const appSummary = specification?.summary || specification?.description || specification?.name || 'n/a';
    const dataModelHints = specification?.dataModel || specification?.entities || specification?.domain || {};
    const authHints = specification?.auth || specification?.authentication || {};
    const apiHints = specification?.api || specification?.routes || {};
    const qualityContract = specification?.qualityContract || {};

    const desiredOutputs = [
      'prisma/schema.prisma',
      'lib/prisma.ts',
    ];

    if (flags.auth || authHints || flags.roles || flags.orgs) {
      desiredOutputs.push('lib/auth.ts');
      desiredOutputs.push('middleware.ts');
    }

    if (flags.apiHeavy || apiHints || flags.content || flags.realtime || flags.billing || flags.analytics) {
      desiredOutputs.push('app/api/.../route.ts');
    }

    const implementationNotes = [
      '- Use Prisma models with explicit relations, indexes, unique constraints, cascading behavior only when justified, and createdAt/updatedAt timestamps.',
      '- Prefer route handlers for CRUD APIs with consistent JSON responses and correct HTTP status codes.',
      '- Include auth guards, ownership checks, and tenant scoping when the requirement implies multi-user SaaS.',
      '- If the project is multi-tenant, model workspace/organization membership and scope queries by tenant.',
      '- Keep the schema normalized, but do not over-normalize if it would hurt readability or performance.',
      '- Include helper code for shared Prisma client initialization.',
      '- When a route is ambiguous, choose the cleanest production SaaS default and state assumptions in code comments only if necessary.',
      '- Do not invent features unrelated to the requirement.',
    ];

    const fileBlocks = Object.entries(sourceFiles)
      .map(([name, body]) => `\n**File: ${name}**\n\`\`\`\n${body}\n\`\`\``)
      .join('\n');

    return `
Design the complete backend architecture, database schema, authentication strategy, and API routes for the following SaaS requirement.

PROJECT SUMMARY
${appSummary}

SPECIFICATION
${JSON.stringify(specification, null, 2)}

INFERRED NEEDS
${JSON.stringify(flags, null, 2)}

DATA MODEL HINTS
${JSON.stringify(dataModelHints, null, 2)}

AUTH HINTS
${JSON.stringify(authHints, null, 2)}

API HINTS
${JSON.stringify(apiHints, null, 2)}

QUALITY CONTRACT
${JSON.stringify(qualityContract, null, 2)}

REQUIRED OUTPUTS
${JSON.stringify(desiredOutputs, null, 2)}

ARCHITECTURE GUIDELINES
${implementationNotes.join('\n')}

FILES TO CONSIDER
${fileBlocks}

IMPORTANT
- Before code, think through tables, relations, endpoints, auth, permissions, and data flow.
- Return only updated files in the required Markdown format.
- Use production-ready TypeScript.
- Preserve any existing conventions already present in the source files.
    `.trim();
  }

  buildPrompt({ specification, sourceFiles, isNextAppRouter, flags }) {
    return this.buildArchitectureBrief({
      specification,
      sourceFiles,
      isNextAppRouter,
      flags,
    });
  }

  extractFilesFromMarkdown(responseText) {
    const text = String(responseText ?? '');
    const files = {};
    const sectionRegex = /\*\*File:\s*([^\n*]+)\*\*\s*```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g;

    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
      const fileName = match[1].trim();
      const fileBody = match[2].replace(/\s+$/, '');
      files[fileName] = fileBody;
    }

    return files;
  }

  extractParsedFiles(responseText) {
    if (typeof this.extractFiles === 'function') {
      const parsed = this.extractFiles(responseText);
      if (parsed && Object.keys(parsed).length) return parsed;
    }

    return this.extractFilesFromMarkdown(responseText);
  }

  validateUpdateSet(parsedFiles = {}, originalFiles = {}) {
    const safe = {};
    const allowedLooseFiles = [
      'prisma/schema.prisma',
      'lib/prisma.ts',
      'lib/auth.ts',
      'middleware.ts',
    ];

    for (const [name, content] of Object.entries(parsedFiles)) {
      const allowed =
        Object.prototype.hasOwnProperty.call(originalFiles, name) ||
        allowedLooseFiles.includes(name) ||
        /^app\/api\/.+\/route\.ts$/.test(name) ||
        /^src\/app\/api\/.+\/route\.ts$/.test(name) ||
        /^lib\/.+\.(ts|tsx)$/.test(name) ||
        /^types\/.+\.(ts|tsx)$/.test(name);

      const body = String(content ?? '').trim();

      if (!allowed) continue;
      if (body.length < 40) continue;

      safe[name] = body;
    }

    return safe;
  }

  async execute(specification, designSystem = null, previousCode = {}) {
    this.log('info', 'Consulting the Backend Architect...');

    const files = previousCode || {};
    const entries = Object.entries(files);

    if (!entries.length) {
      this.log('warning', 'No source files provided to architect');
    }

    const { isNextAppRouter } = this.detectProjectType(files);
    const flags = this.inferRequirements(specification);
    const sourceFiles = this.compactFileContents(this.selectSourceFiles(files));

    const prompt = this.buildPrompt({
      specification,
      sourceFiles,
      isNextAppRouter,
      flags,
    });

    let response = '';
    try {
      response = await window.llmProvider.chat([
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ]);
    } catch (error) {
      this.log('warning', `Architect LLM call failed: ${error.message}`);
      return {};
    }

    try {
      const parsed = this.extractParsedFiles(response);
      const safe = this.validateUpdateSet(parsed, files);

      this.log('success', `Architect updated ${Object.keys(safe).length} file(s)`);
      return safe;
    } catch (error) {
      this.log('warning', `Architect could not parse updates: ${error.message}`);
      return {};
    }
  }
}

window.ArchitectAgent = ArchitectAgent;
;
/* ============================================================
   REVIEWER AGENT — Reviews generated code for quality,
   performance, accessibility, premium feel, and 
   COMPLEX FEATURE CORRECTNESS
   ============================================================ */

class ReviewerAgent extends BaseAgent {
    constructor() {
        super('Reviewer', 'Reviews code quality, complexity correctness, and premium feel');
        this.systemPrompt = `You are a senior code reviewer specializing in premium website quality assessment. You check both SIMPLE sites and COMPLEX web applications for quality, correctness, and premium feel.

REVIEW CRITERIA:

1. HTML Quality:
   - Semantic structure with proper heading hierarchy
   - Valid, accessible markup (ARIA labels, alt tags)
   - Proper meta tags, viewport, and SEO elements
   - External resources loaded correctly (CDN links, fonts)

2. CSS Quality:
   - Uses CSS custom properties consistently
   - Responsive at 375px, 768px, 1024px, 1440px
   - No layout overflow or broken layouts
   - Premium feel: visual choices precisely match the art direction; do not reward generic gradients, glass cards, visual noise, or effects that do not serve the brand
   - Proper use of grid/flexbox
   - Animation performance (transform/opacity, not layout properties)
   - Dark/light mode support if applicable

3. JavaScript Quality:
   - No syntax errors or runtime issues
   - Clean patterns (no var, proper scoping)
   - Event delegation where appropriate
   - Proper error handling
   - No memory leaks (event listeners cleaned up)
   - State management is consistent

4. Interactive Components:
   - Do tabs/modals/dropdowns actually WORK?
   - Does form validation give visual feedback?
   - Do counters animate correctly?
   - Does the pricing toggle switch values?
   - Does the mobile menu open/close?
   - Does the dark mode toggle persist?
   - Do hover effects feel premium?

5. Performance:
   - Animations use transform/opacity (GPU accelerated)
   - Images optimized / lazy loaded
   - Scripts defer or placed at bottom
   - No blocking resources
   - No excessive DOM manipulation

6. Premium Feel (CRITICAL):
   - Is there a clear, specific creative concept visible in the first viewport?
   - Does the hero follow the specified composition instead of defaulting to generic SaaS UI?
   - Do typography, media, spacing, and motion reinforce the same concept?
   - Are there only a few purposeful motion systems, with reduced-motion support?
   - Reject generic stock phrases, visual clutter, fake counters, repetitive feature-card grids, and unrelated 3D/particles.
   - Verify the Quality Contract: a real category-specific narrative, credible proof, memorable signature moments, and no unsupported claims.

OUTPUT FORMAT (JSON):
{
  "passed": true/false,
  "score": 0-100,
  "issues": [
    {
      "severity": "critical | warning | suggestion",
      "category": "html | css | js | accessibility | performance | premium-feel | interactivity",
      "file": "filename",
      "description": "what's wrong",
      "fix": "specific code change to fix it"
    }
  ],
  "summary": "Overall assessment",
  "strengths": ["list of things done well"],
  "complexityVerified": true/false
}

SCORING:
- 94-100: Stunning, next-gen, Awwwards-worthy — ship it
- 90-93: Strong execution with clear art direction — passes with minor polish
- 78-89: Functional but generic, templated, thin, or missing real product structure — MUST refine
- 0-77: Major problems / recovery-shell quality — must regenerate

PASS THRESHOLD: score >= 90 = passed (Motion Studio / cinematic sites: score >= 92)

FAIL AUTOMATICALLY (score <= 75, passed=false) IF:
- Recovery shell / placeholder / Lorem Ipsum copy
- Single thin page when complexity is complex/ultra-complex
- Missing working interactions for listed components
- Full-stack without API routes or Prisma when required
- Generic purple SaaS template with fake metrics
- Cinematic brief but hero is only gradient orbs (no video/WebGL/media scene)
- Motion plan requires ScrollTrigger but no scroll-linked code exists

CINEMATIC WEBSITE CHECKS (categories: hero-scene | scroll-story | motion-performance | material-grade):
- Is the hero a real scene (video, WebGL canvas, or full-bleed editorial media)?
- Are sections structured as story beats / data-scene, not feature-card spam?
- Do listed motionSystems appear implemented (GSAP pin/scrub/reveal/magnetic)?
- Is there film-grade restraint (grain/vignette/type) without visual noise?
- Would this sit next to motionsites.ai craft without looking like Bootstrap AI?

DESIGN PHILOSOPHY CHECKS (each worth up to 5 points, category: design-philosophy):
- Is the specified design philosophy (skeuomorphism/neomorphism/glassmorphism/claymorphism/minimalism/maximalism/brutalism/liquid-glass/spatial-ui) consistently applied?
- Are philosophy-specific CSS classes used (e.g., .neo-flat, .glass-card, .brutal-button, .spatial-card)?
- Do surfaces, buttons, and cards match the design philosophy's visual language?
- Is the philosophy applied uniformly, or is it a random mix of styles?

ADVANCED EFFECTS CHECKS (category: advanced-effects):
- Are hover effects present (data-hover attributes on interactive elements)?
- Is there a smooth page loader (.page-loader with entrance transition)?
- Are 3D effects used where specified (data-3d, data-scroll-3d, perspective transforms)?
- Are entrance reveals implemented (data-reveal with IntersectionObserver triggering .revealed)?
- Are micro interactions present (data-micro for ripple/bounce/magnetic)?
- Are parallax effects working (data-parallax-scroll, data-parallax-depth)?
- Are 3D scroll effects present when spec calls for them (data-scroll-3d with rotateX/zoom)?
- Are 3D window mockups used in demo sections (.window-3d with titlebar)?
- Are 3D backgrounds present when spec calls for depth (.bg-3d-grid, .bg-3d-particles)?

AESTHETIC CHECKPOINTS (each worth up to 5 points):
- Does the hero have a SPECIFIC, memorable visual composition (not generic gradient orbs)?
- Is the typography hierarchy dramatic (hero text >> section titles >> body)?
- Are there deliberate whitespace rhythms (not just padding: 20px everywhere)?
- Do animations serve the concept (not animation on everything)?
- Would this site look distinctive next to 10 other AI-generated sites?
- Do the design philosophy, hover effects, 3D elements, and motion systems create a cohesive experience?`;
    }

    async execute(files, specification) {
        this.log('info', `Reviewing ${specification.complexity || 'premium'} website code against Awwwards + product bar...`);

        const isComplex = ['complex', 'ultra-complex'].includes(specification.complexity);

        const filesSummary = Object.entries(files)
            .map(([name, content]) => {
                const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2) || '';
                const lines = textContent.split('\n');
                // Smart truncation: first 60 lines + last 30 lines + any interactive sections
                if (lines.length > 120) {
                    const head = lines.slice(0, 60).join('\n');
                    const tail = lines.slice(-30).join('\n');
                    // Find interactive component blocks (sections with onclick, addEventListener, modal, tab, etc.)
                    const interactivePatterns = /(?:addEventListener|onclick|modal|tab-|accordion|carousel|pricing|toggle|hamburger|dropdown)/i;
                    const interactiveLines = [];
                    for (let i = 60; i < lines.length - 30; i++) {
                        if (interactivePatterns.test(lines[i])) {
                            const start = Math.max(60, i - 3);
                            const end = Math.min(lines.length - 30, i + 8);
                            interactiveLines.push(lines.slice(start, end).join('\n'));
                            i = end; // skip ahead
                        }
                    }
                    const middle = interactiveLines.length > 0 ? `\n... (${lines.length - 90} lines skipped — key interactive blocks shown) ...\n${interactiveLines.join('\n...\n')}\n...` : `\n... (${lines.length - 90} middle lines omitted) ...\n`;
                    return `=== FILE: ${name} (${textContent.length} chars, ${lines.length} lines) ===\n${head}${middle}${tail}`;
                }
                return `=== FILE: ${name} (${textContent.length} chars, ${lines.length} lines) ===\n${textContent}`;
            })
            .join('\n\n');

        const fileNames = Object.keys(files || {});
        const looksFullstack = fileNames.some(n => n.includes('prisma/') || n.startsWith('app/api/'));
        const looksReact = fileNames.some(n => n.startsWith('src/') || /\.(jsx|tsx)$/.test(n));

        const message = `Review this ${specification.complexity || 'premium'} ${specification.siteType} build against an Awwwards + production product bar.

EXPECTED:
- Framework: ${specification.framework || 'unknown'}
- Sections: ${(specification.sections || []).join(', ')}
- Pages: ${JSON.stringify(specification.pages || [])}
- App architecture: ${JSON.stringify(specification.appArchitecture || {})}
- Animations: ${(specification.artDirection?.motionPlan || specification.animations || []).join(', ')}
- 3D: ${specification.has3D ? 'Yes' : 'No'}
- Mood: ${specification.mood || 'premium'}
- Complexity: ${specification.complexity || 'premium'}
- Art direction: ${JSON.stringify(specification.artDirection || {})}
- Quality contract: ${JSON.stringify(specification.qualityContract || {})}
- Customer outcome / conversion / motion policy: ${JSON.stringify(specification.studioIntelligence || {})}
${isComplex ? `- Interactive Components: ${(specification.interactiveComponents || []).join(', ')}
- JS Features: ${(specification.jsFeatures || []).join(', ')}
- VERIFY ALL INTERACTIVE COMPONENTS ACTUALLY WORK` : ''}
${looksFullstack ? '- Full-stack: require Prisma schema, API routes, multi-page App Router structure, no secret leakage' : ''}
${looksReact ? '- React: require component split, real routing if multi-page, no single-file thin demo' : ''}

HARD FAIL if recovery shell / placeholder / Lorem / fake vanity metrics / too thin for complexity.

FILES:
${filesSummary}

Output review JSON. Pass only if score >= 90 and product is genuinely premium/complete.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.25,
            maxTokens: 32768,
        });

        try {
            const review = this.parseJSON(response);
            review.score = Number(review.score) || 80;
            review.issues = review.issues || [];
            review.summary = review.summary || 'Review complete';
            review.strengths = review.strengths || [];
            review.complexityVerified = review.complexityVerified !== false;

            // Enforce hard fail signals even if model is lenient
            const joined = fileNames.map(n => String(files[n] || '')).join('\n');
            if (/\b(zero recovery build|lorem ipsum|replace this recovery)\b/i.test(joined)) {
                review.score = Math.min(review.score, 60);
                review.issues.push({
                    severity: 'critical',
                    category: 'premium-feel',
                    file: 'generated files',
                    description: 'Recovery shell or placeholder content detected.',
                    fix: 'Regenerate a complete premium product without recovery shells.'
                });
            }
            if (joined.length < 5000) {
                review.score = Math.min(review.score, 72);
                review.issues.push({
                    severity: 'critical',
                    category: 'html',
                    file: 'generated files',
                    description: 'Build is too thin for production premium quality.',
                    fix: 'Expand structure, content, styles, and interactions.'
                });
            }

            const motionStudio = specification?.motionStudio
                || specification?.qualityContract?.tier === 'motion-studio-awwwards'
                || /cinematic|luxury|real-estate|agency|architecture|fashion/i.test(String(specification?.siteArchetype || specification?.siteType || ''));
            const threshold = motionStudio ? 92 : 90;
            review.passed = review.score >= threshold && !review.issues.some(i => i.severity === 'critical');

            this.log(review.passed ? 'success' : 'warning',
                `Review: ${review.score}/100 — ${review.issues.length} issues, ${review.strengths.length} strengths`);

            return review;
        } catch (e) {
            this.log('error', `Review parsing failed: ${e.message}`);
            throw e;
        }
    }

    async critiqueDesign(specification, designSystem) {
        this.log('info', 'Critiquing design system...');
        
        const message = `Critique this design system before we start coding. We want a $100K premium aesthetic.

SPECIFICATION:
${JSON.stringify(specification, null, 2)}

PROPOSED DESIGN SYSTEM:
${designSystem}

Analyze if the colors, fonts, spacing, and animations fit the requested mood and complexity. Are the colors too generic? Is the typography pairing modern?
Output a 2-3 paragraph critique pointing out specific improvements. If it's already perfect, say "The design system looks great." Do not output JSON, just text.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.7,
            maxTokens: 32768,
        });
        
        this.log('success', 'Critique generated');
        return response;
    }
}

window.ReviewerAgent = ReviewerAgent;

;
/* ============================================================
   REFINER AGENT — Premium, multi-page, full-stack aware edits
   ============================================================ */

class RefinerAgent extends BaseAgent {
    constructor() {
        super('Refiner', 'Makes targeted complex modifications without full regeneration');
        this.systemPrompt = `You are a principal engineer refining production web code. You handle static HTML/CSS/JS, React+Vite, and Next.js full-stack projects.

CAPABILITIES:
- Visual polish to Awwwards-level craft (type, spacing, hero composition, motion)
- Multi-page / multi-route expansions
- Dashboard shells, tables, filters, empty/loading/error states
- Auth/session UI wiring, API route fixes, Prisma model fixes
- Accessibility, SEO, reduced-motion, responsive breakpoints
- Real working interactions — never placeholders or recovery shells

RULES:
1. Change only what the request needs, but every changed file must be COMPLETE.
2. CRITICAL: Do NOT output JSON. Output each changed file as a Markdown code block preceded by its exact path in bold.
3. Preserve working features unless the request removes them.
4. Match existing stack conventions (vanilla vs React vs Next App Router).
5. No Lorem Ipsum, fake vanity metrics, purple SaaS filler, or "ZERO Recovery Build".
6. Prefer complete production structure over tiny stubs.
7. Keep secrets out of client code; use .env.example only.

OUTPUT FORMAT:
**File: index.html**
\`\`\`html
...complete file...
\`\`\`

**File: app/dashboard/page.tsx**
\`\`\`tsx
...complete file...
\`\`\``;
    }

    async execute(currentFiles, modificationPrompt, specification, designSystem) {
        this.log('info', `Refining: ${String(modificationPrompt || '').slice(0, 120)}`);

        const isComplexMod = this._detectComplexity(modificationPrompt);
        const stack = this._detectStack(currentFiles);
        const projectContext = this.framework?.getProjectContext?.(modificationPrompt, currentFiles);
        const filesSummary = projectContext?.source || this._summarizeFiles(currentFiles, modificationPrompt);
        const repositoryPlan = projectContext ? `
REPOSITORY BRAIN PLAN:
${projectContext.executionPlan.summary}
Steps: ${projectContext.executionPlan.steps.map((step, index) => `${index + 1}. ${step}`).join(' ')}
Focused files: ${projectContext.files.map(item => `${item.path} (${item.reason})`).join(', ')}` : '';

        const midFlight = Array.isArray(specification?.midFlightNotes) && specification.midFlightNotes.length
            ? `\nMID-FLIGHT USER NOTES (must honor):\n${specification.midFlightNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`
            : '';

        const message = `Modify this ${stack} project.

MODIFICATION REQUEST:
"${modificationPrompt}"
${midFlight}
MODIFICATION COMPLEXITY: ${isComplexMod ? 'COMPLEX — structural / multi-file / product-level' : 'TARGETED — style/content/interaction polish'}

SPEC CONTEXT:
- Title: ${specification?.title || 'Project'}
- Framework: ${specification?.framework || stack}
- Complexity: ${specification?.complexity || 'premium'}
- Site type: ${specification?.siteType || 'website'}
- Pages: ${JSON.stringify(specification?.pages || [])}
- Architecture: ${JSON.stringify(specification?.appArchitecture || {})}
- Art direction: ${JSON.stringify(specification?.artDirection || {})}
- Quality contract: ${JSON.stringify(specification?.qualityContract || {})}

DESIGN TOKENS (if available):
${designSystem?.css ? String(designSystem.css).slice(0, 2500) : 'n/a'}

CURRENT FILES:
${filesSummary}
${repositoryPlan}

${isComplexMod ? `COMPLEX RULES:
- If adding routes/pages, create complete page files and wire navigation
- If adding dashboard features, include realistic sample data + empty states
- If fixing full-stack issues, keep Prisma/API/page contracts aligned
- New interactions must be fully functional` : `TARGETED RULES:
- Preserve architecture
- Raise visual/premium quality without breaking layout`}

Return ONLY changed files in Markdown file blocks. Complete file contents only.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.4,
            maxTokens: 32768,
        });

        try {
            const updatedFiles = this.extractFiles(response);
            const changedCount = Object.keys(updatedFiles).length;
            if (!changedCount) {
                throw new Error('Refiner returned no file changes');
            }

            for (const [name, content] of Object.entries(updatedFiles)) {
                const oldSize = currentFiles[name]?.length || 0;
                const newSize = String(content || '').length;
                const diff = newSize - oldSize;
                this.log('info', `${name}: ${diff > 0 ? '+' : ''}${diff} chars (${oldSize} → ${newSize})`);
            }

            this.log('success', `Refined ${changedCount} file(s) [${isComplexMod ? 'complex' : 'targeted'} / ${stack}]`);
            return updatedFiles;
        } catch (e) {
            this.log('error', `Refinement parsing failed: ${e.message}`);
            throw new Error('Failed to parse refinement changes. Try a more specific request.');
        }
    }

    async executeFromReview(currentFiles, reviewReport, specification, designSystem) {
        const issues = reviewReport.issues || [];
        if (!issues.length) return {};

        const critical = issues.filter(i => i.severity === 'critical');
        const warnings = issues.filter(i => i.severity === 'warning');
        const ranked = [...critical, ...warnings].slice(0, 12);

        const issuesSummary = ranked
            .map((issue, i) => `${i + 1}. [${issue.severity}] ${issue.category || 'general'} @ ${issue.file || 'general'}: ${issue.description}\n   → Fix: ${issue.fix || 'Improve to production premium quality'}`)
            .join('\n');

        if (!issuesSummary) return {};

        const score = reviewReport.score ?? '?';
        const motionStudio = specification?.motionStudio
            || specification?.qualityContract?.tier === 'motion-studio-awwwards';
        const threshold = motionStudio ? 92 : 90;
        const prompt = `AUTO-FIX REVIEW FAILURES (current score ${score}/100; pass needs >= ${threshold}).

Raise this build to ${motionStudio ? 'Motionsites / Awwwards cinematic website' : 'Awwwards + production'} quality.
Fix all listed issues. Expand thin structure if needed. Remove placeholders/recovery shells/generic SaaS filler/fake metrics.

ISSUES:
${issuesSummary}

Also enforce:
- Complete multi-section scroll scenes for complexity=${specification?.complexity || 'premium'}
- Hero treatment: ${specification?.heroTreatment || 'cinematic media scene'} (video/WebGL/full-bleed — NOT gradient orbs)
- Motion systems to implement: ${(specification?.motionSystems || specification?.animations || []).join(', ')}
- Working ScrollTrigger / GSAP interactions from the motion plan
- Reduced-motion support
- Distinctive art direction (no generic purple template)`;

        return this.execute(currentFiles, prompt, specification, designSystem);
    }

    /* Expand an undersized large project without full regen */
    async expandToProductionScale(currentFiles, specification, designSystem) {
        const pages = specification?.pages || [];
        const framework = specification?.framework || this._detectStack(currentFiles);
        const prompt = `This project is under-scoped for a ${specification?.complexity || 'complex'} ${framework} product.

EXPAND it into a production-scale codebase while preserving what already works:
- Implement missing pages/routes: ${JSON.stringify(pages)}
- Architecture: ${JSON.stringify(specification?.appArchitecture || {})}
- Sections: ${(specification?.sections || []).join(', ')}
- Interactive: ${(specification?.interactiveComponents || []).join(', ')}
- For fullstack: ensure Prisma models, API routes, dashboard, marketing home, README/.env.example
- For React: component split + router pages when multi-page
- For static: multi-section Awwwards craft + working JS interactions
- No recovery shells, no Lorem, no fake vanity metrics

Return all files that need to be created or substantially upgraded.`;

        return this.execute(currentFiles, prompt, specification, designSystem);
    }

    _detectStack(files = {}) {
        const names = Object.keys(files || {});
        if (names.some(n => n.startsWith('app/') || n.includes('prisma/')) || /"next"/.test(String(files['package.json'] || ''))) {
            return 'next-fullstack';
        }
        if (names.some(n => n.startsWith('src/') || /\.(jsx|tsx)$/.test(n))) return 'react-vite';
        return 'static';
    }

    _summarizeFiles(currentFiles, modificationPrompt) {
        const keywords = String(modificationPrompt || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
        return Object.entries(currentFiles || {}).slice(0, 40)
            .map(([name, content]) => {
                const text = String(content || '');
                const lines = text.split('\n');
                if (lines.length <= 160) {
                    return `=== ${name} (${text.length} chars, ${lines.length} lines) ===\n${text}`;
                }
                const head = lines.slice(0, 70).join('\n');
                const tail = lines.slice(-45).join('\n');
                const relevantChunks = [];
                for (let i = 70; i < lines.length - 45; i++) {
                    const line = lines[i].toLowerCase();
                    if (keywords.some(kw => line.includes(kw)) || /section|footer|hero|nav|modal|route|prisma|api|dashboard|sidebar/i.test(lines[i])) {
                        const start = Math.max(70, i - 3);
                        const end = Math.min(lines.length - 45, i + 10);
                        relevantChunks.push(`[Lines ${start + 1}-${end + 1}]\n` + lines.slice(start, end).join('\n'));
                        i = end;
                    }
                }
                const middle = relevantChunks.length
                    ? `\n... (relevant sections) ...\n${relevantChunks.slice(0, 8).join('\n...\n')}\n...`
                    : `\n... (${lines.length - 115} middle lines omitted) ...\n`;
                return `=== ${name} (${text.length} chars, ${lines.length} lines) ===\n${head}${middle}${tail}`;
            })
            .join('\n\n');
    }

    _detectComplexity(prompt) {
        const complexKeywords = [
            'add', 'create', 'build', 'implement', 'new section', 'new component',
            'dashboard', 'chart', 'graph', 'table', 'form', 'modal', 'tabs',
            'filter', 'search', 'sort', 'drag', 'drop', 'upload', 'carousel',
            'slider', 'accordion', 'notification', 'toast', 'sidebar',
            'authentication', 'login', 'signup', 'api', 'fetch', 'data',
            'kanban', 'calendar', 'timeline', 'gallery', 'lightbox',
            'navigation', 'breadcrumb', 'pagination', 'infinite scroll',
            'state management', 'local storage', 'real-time', 'prisma',
            'route', 'page', 'auth', 'expand', 'production', 'multi-page',
            'awwwards', 'premium', 'review', 'critical'
        ];
        const lower = String(prompt || '').toLowerCase();
        return complexKeywords.filter(k => lower.includes(k)).length >= 2 || lower.length > 280;
    }
}

window.RefinerAgent = RefinerAgent;

;
/* ============================================================
HEALER AGENT — Build/runtime auto-fix for large projects
============================================================ */

class HealerAgent extends BaseAgent {
    constructor() {
        super('Healer', 'Analyzes terminal errors and automatically fixes broken code');

        this.config = {
            maxPriorityFiles: 12,
            maxAllFilesList: 80,
            maxFileChars: 16000,
            headChars: 10000,
            tailChars: 3000,
            temperature: 0.12,
            maxTokens: 32768,
        };

        this.systemPrompt = `
You are a principal engineer specializing in debugging React, Vite, Next.js App Router, Prisma, and static sites.

TASK

1. Read stdout and stderr carefully.
2. Identify the exact broken files and root cause.
3. Return complete fixed contents for only the files that must change.

RULES

1. Prefer minimal surgical fixes that restore a green build.
2. Fix missing imports, syntax, types, Prisma client usage, Next.js route exports, React hooks rules, Tailwind/PostCSS config, package scripts, and obvious runtime errors.
3. Do not invent features while healing.
4. Do not introduce secrets.
5. Output Markdown file blocks only.
6. Do not output JSON.
7. Keep unrelated files untouched.
8. If a file is mentioned by the logs, inspect it first.
9. When possible, preserve the existing style and architecture.

OUTPUT FORMAT
**File: path/to/file**
\`\`\`lang
complete fixed content
\`\`\`
`.trim();
    }

    normalizeText(text) {
        return String(text ?? '').replace(/\r\n/g, '\n');
    }

    truncateFile(content) {
        const text = this.normalizeText(content);
        if (text.length <= this.config.maxFileChars) return text;

        return (
            text.slice(0, this.config.headChars) +
            '\n/* ... truncated for heal pass ... */\n' +
            text.slice(-this.config.tailChars)
        );
    }

    detectProjectType(files = {}) {
        const names = Object.keys(files);
        return {
            isNext: names.some((n) => /^(app|src\/app)\//.test(n) || /next\.config\./.test(n) || /middleware\.ts$/.test(n)),
            isVite: names.some((n) => /vite\.config\./.test(n) || /src\/main\.(ts|tsx|js|jsx)$/.test(n)),
            isPrisma: names.some((n) => /prisma\/schema\.prisma$/.test(n) || /lib\/prisma\.(ts|js)$/.test(n)),
            isStatic: names.some((n) => /index\.html$/.test(n)) && !names.some((n) => /next\.config\./.test(n)),
        };
    }

    extractMentionedFiles(files, stdout = '', stderr = '') {
        const names = Object.keys(files || {});
        const logText = `${this.normalizeText(stdout)}\n${this.normalizeText(stderr)}`;

        const mentions = new Set();
        for (const name of names) {
            const base = name.split('/').pop();
            if (logText.includes(name) || logText.includes(base)) {
                mentions.add(name);
            }
        }

        // Add common route/error targets when logs mention them indirectly.
        for (const line of logText.split('\n')) {
            const m = line.match(/(?:in|from|at)\s+([A-Za-z0-9_\-./]+\.(?:ts|tsx|js|jsx|mjs|cjs|css|json|prisma))/);
            if (m?.[1] && names.includes(m[1])) {
                mentions.add(m[1]);
            }
        }

        return [...mentions];
    }

    rankFiles(files = {}, stdout = '', stderr = '') {
        const { isNext, isVite, isPrisma } = this.detectProjectType(files);
        const errorText = `${this.normalizeText(stdout)}\n${this.normalizeText(stderr)}`.toLowerCase();
        const mentions = new Set(this.extractMentionedFiles(files, stdout, stderr));

        const scored = Object.entries(files)
            .map(([name, content]) => {
                let score = 0;
                const base = name.split('/').pop().toLowerCase();
                const text = String(content ?? '');

                if (mentions.has(name)) score += 1000;
                if (errorText.includes(name.toLowerCase()) || errorText.includes(base)) score += 250;

                if (/package\.json$/.test(name)) score += 240;
                if (/tsconfig\.json$/.test(name)) score += 230;
                if (/next\.config\./.test(name)) score += isNext ? 220 : 40;
                if (/vite\.config\./.test(name)) score += isVite ? 220 : 40;
                if (/tailwind\.config\./.test(name)) score += 180;
                if (/postcss\.config\./.test(name)) score += 170;
                if (/prisma\/schema\.prisma$/.test(name)) score += isPrisma ? 240 : 120;
                if (/lib\/prisma\.(ts|js)$/.test(name)) score += 210;
                if (/middleware\.ts$/.test(name)) score += 200;
                if (/app\/layout\.(ts|tsx|js|jsx)$/.test(name)) score += 180;
                if (/app\/page\.(ts|tsx|js|jsx)$/.test(name)) score += 170;
                if (/app\/api\/.+\/route\.(ts|tsx|js|jsx)$/.test(name)) score += 190;
                if (/src\/main\.(ts|tsx|js|jsx)$/.test(name)) score += isVite ? 160 : 60;
                if (/index\.html$/.test(name)) score += 150;
                if (/globals\.css$/.test(name) || /index\.css$/.test(name) || /styles\.css$/.test(name)) score += 140;

                const body = text.toLowerCase();
                if (body.includes('error') || body.includes('throw new error')) score += 10;
                if (body.includes('import ') || body.includes('export ')) score += 8;
                if (body.includes('use client')) score += 6;

                return { name, content, score };
            })
            .sort((a, b) => b.score - a.score);

        return scored;
    }

    buildFilesSummary(files = {}, prioritizedNames = []) {
        const list = prioritizedNames.length
            ? prioritizedNames
            : Object.keys(files).slice(0, this.config.maxAllFilesList);

        return list
            .map((path) => {
                const content = this.truncateFile(files[path] || '');
                return `--- ${path} ---\n${content}\n`;
            })
            .join('\n');
    }

    buildPrompt(currentFiles, stdout, stderr) {
        const files = currentFiles || {};
        const ranked = this.rankFiles(files, stdout, stderr);
        const priorityNames = ranked.slice(0, this.config.maxPriorityFiles).map((x) => x.name);
        const summary = this.buildFilesSummary(files, priorityNames);
        const allPaths = Object.keys(files).slice(0, this.config.maxAllFilesList).join('\n');
        const projectType = this.detectProjectType(files);

        return `
The application failed to build or run. Fix the root cause with minimal surgical changes.

PROJECT TYPE
${JSON.stringify(projectType, null, 2)}

--- STDOUT ---
${this.normalizeText(stdout).slice(0, 8000)}

--- STDERR ---
${this.normalizeText(stderr).slice(0, 12000)}

--- PRIORITY FILES ---
${summary}

--- ALL FILE PATHS ---
${allPaths}

HEALING RULES

* Fix only the files that must change.
* Return complete fixed contents for changed files.
* Prefer the smallest working edit.
* Do not add features.
* Do not change unrelated files.
* Preserve existing architecture and styling.
* If the issue is caused by config, fix the config file directly.
* If the issue is caused by an import/export mismatch, fix both ends if needed.
* If Prisma is involved, keep schema/client usage consistent.
* If Next.js route handlers are involved, ensure correct named exports and runtime-safe code.
* If the log points to a single file, prioritize that file first.

Return only the files that need updates, as complete Markdown file blocks.
`.trim();
    }

    parseMarkdownFiles(responseText) {
        const text = this.normalizeText(responseText);
        const files = {};
        const regex = /\*\*File:\s*([^\n*]+)\*\*\s*```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g;

        let match;
        while ((match = regex.exec(text)) !== null) {
            const path = match[1].trim();
            const body = match[2].replace(/\s+$/, '');
            files[path] = body;
        }

        return files;
    }

    extractFilesSafely(responseText) {
        if (typeof this.extractFiles === 'function') {
            const parsed = this.extractFiles(responseText);
            if (parsed && Object.keys(parsed).length) return parsed;
        }
        return this.parseMarkdownFiles(responseText);
    }

    validateFixedFiles(fixedFiles = {}, originalFiles = {}) {
        const safe = {};

        for (const [name, content] of Object.entries(fixedFiles)) {
            const body = String(content ?? '').trim();
            if (body.length < 40) continue;

            const allowed =
                Object.prototype.hasOwnProperty.call(originalFiles, name) ||
                /^app\/api\/.+\/route\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name) ||
                /^app\/.+\/page\.(ts|tsx|js|jsx)$/.test(name) ||
                /^app\/layout\.(ts|tsx|js|jsx)$/.test(name) ||
                /^components\/.+\.(ts|tsx|js|jsx)$/.test(name) ||
                /^lib\/.+\.(ts|tsx|js|jsx)$/.test(name) ||
                /^prisma\/schema\.prisma$/.test(name) ||
                /^(package\.json|tsconfig\.json|next\.config\..+|vite\.config\..+|postcss\.config\..+|tailwind\.config\..+|middleware\.ts|README\.md|\.env\.example|\.gitignore)$/.test(name);

            if (!allowed) continue;
            safe[name] = body;
        }

        return safe;
    }

    buildRepairFallback(stdout, stderr, currentFiles) {
        const log = `${this.normalizeText(stdout)}\n${this.normalizeText(stderr)}`;
        const candidates = Object.keys(currentFiles || {}).filter((name) => {
            const base = name.split('/').pop();
            return log.includes(name) || log.includes(base);
        });

        return candidates.slice(0, this.config.maxPriorityFiles);
    }

    async execute(currentFiles = {}, stdout = '', stderr = '') {
        this.log('info', 'Analyzing build/runtime errors for auto-heal...');

        const files = currentFiles || {};
        const ranked = this.rankFiles(files, stdout, stderr);
        const mentioned = this.extractMentionedFiles(files, stdout, stderr);
        const priorityNames = (mentioned.length ? mentioned : ranked.slice(0, this.config.maxPriorityFiles).map((x) => x.name))
            .slice(0, this.config.maxPriorityFiles);

        const prompt = this.buildPrompt(files, stdout, stderr);

        let response;
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('error', `Healing failed to call LLM: ${error.message}`);
            throw error;
        }

        try {
            const parsed = this.extractFilesSafely(response);
            const fixedFiles = this.validateFixedFiles(parsed, files);

            if (!Object.keys(fixedFiles).length) {
                const fallbackCandidates = this.buildRepairFallback(stdout, stderr, files);
                throw new Error(
                    `Healer returned no usable fixed files. Priority candidates: ${fallbackCandidates.join(', ') || 'none'}`
                );
            }

            this.log('success', `Healed ${Object.keys(fixedFiles).length} file(s)`);
            return fixedFiles;
        } catch (error) {
            this.log('error', `Healing failed to parse: ${error.message}`);
            throw error;
        }
    }
}

if (typeof window !== 'undefined') {
    window.HealerAgent = HealerAgent;
}

;
/* Zero-Builder Max: dependency and framework-boundary verification. */
class PreflightGuard {
    constructor() {
        this.knownVersions = {
            'framer-motion': '^11.11.17',
            'lucide-react': '^0.468.0',
            'zustand': '^5.0.3',
            'zod': '^3.24.2',
            '@hookform/resolvers': '^3.10.0',
            'react-hook-form': '^7.54.2',
            '@prisma/client': '^5.14.0',
            'clsx': '^2.1.1',
            'tailwind-merge': '^2.6.0',
        };

        this.frameworkDefaults = {
            'fullstack-nextjs': {
                clientOnlyHint: 'Next.js component using hooks but missing "use client".',
                packageRequired: true,
            },
            'nextjs': {
                clientOnlyHint: 'Next.js component using hooks but missing "use client".',
                packageRequired: true,
            },
            'vite-react': {
                clientOnlyHint: 'React component using hooks but missing "use client" is usually fine in Vite.',
                packageRequired: true,
            },
            vanilla: {
                clientOnlyHint: null,
                packageRequired: false,
            },
        };
    }

    inspect(files = {}, framework = 'vanilla') {
        const result = {
            files: { ...files },
            issues: [],
            fixes: [],
        };

        const addIssue = (severity, file, description, fix = null, category = 'preflight') => {
            result.issues.push({ severity, category, file, description, fix });
        };

        const addFix = (file, description) => {
            result.fixes.push({ file, description });
        };

        const frameworkMode = this.normalizeFramework(framework);
        const fileEntries = Object.entries(result.files);

        for (const [path, source] of fileEntries) {
            if (!/\.(jsx|tsx|js|ts)$/.test(path) || typeof source !== 'string') continue;

            let code = source;

            // Normalize malformed alias imports.
            const normalizedAliasCode = this.normalizeAliasImports(code);
            if (normalizedAliasCode !== code) {
                code = normalizedAliasCode;
                result.files[path] = code;
                addFix(path, 'Normalized malformed @ alias imports.');
            }

            // Detect and fix obvious "use client" boundary issues for Next.js.
            const usesHooks = this.usesReactHooks(code);
            const isNextBoundaryFile = this.isNextBoundaryFile(path, frameworkMode);
            const isClient = this.hasUseClientDirective(code);

            if (isNextBoundaryFile && usesHooks && !isClient) {
                result.files[path] = `'use client';\n\n${code}`;
                addFix(path, 'Added use client directive for React hooks in a Next.js component.');
                code = result.files[path];
            }

            // Server-only Next.js files should not import client-only browser APIs.
            if (frameworkMode !== 'vanilla' && this.isLikelyServerFile(path) && this.usesBrowserOnlyApis(code)) {
                addIssue(
                    'warning',
                    path,
                    'This file appears to use browser-only APIs in a server-oriented Next.js file.',
                    null,
                    'boundary'
                );
            }

            // Common import sanity checks for the current file.
            const imports = this.extractImports(code);
            for (const imp of imports) {
                if (this.isExternalImport(imp.source)) continue;

                const resolved = this.resolveLocalImport(path, imp.source, result.files);
                if (!resolved) {
                    addIssue(
                        'error',
                        path,
                        `Unresolved local import "${imp.source}" in "${path}".`,
                        null,
                        'imports'
                    );
                }
            }
        }

        // Dependency verification based on imports.
        this.verifyPackageDependencies(result, frameworkMode);

        // Lightweight content warnings.
        const allSource = Object.values(result.files).join('\n');
        if (/\bTODO\b|Lorem ipsum/i.test(allSource)) {
            addIssue(
                'warning',
                'generated files',
                'Placeholder content remains.',
                'Replace it with brand-specific content.',
                'content'
            );
        }

        if (this.hasMultipleEntryPatterns(result.files, frameworkMode)) {
            addIssue(
                'warning',
                'project',
                'Project appears to mix multiple framework entry patterns.',
                'Consolidate to one runtime boundary if this is not intentional.',
                'framework'
            );
        }

        return result;
    }

    normalizeFramework(framework) {
        const value = String(framework || 'vanilla').toLowerCase();
        if (value.includes('fullstack') && value.includes('next')) return 'fullstack-nextjs';
        if (value.includes('next')) return 'nextjs';
        if (value.includes('vite')) return 'vite-react';
        return 'vanilla';
    }

    normalizeAliasImports(code) {
        // Convert malformed "@components/" → "@/components/" and similar cases.
        return String(code || '')
            .replace(/from\s+['"]@(components|lib|hooks|utils)\//g, "from '@/$1/")
            .replace(/import\(\s*['"]@(components|lib|hooks|utils)\//g, "import('@/$1/")
            .replace(/require\(\s*['"]@(components|lib|hooks|utils)\//g, "require('@/$1/");
    }

    hasUseClientDirective(code) {
        const firstChunk = String(code || '').trimStart().slice(0, 200);
        return /^['"]use client['"]\s*;?/m.test(firstChunk);
    }

    usesReactHooks(code) {
        return /\b(useState|useEffect|useMemo|useRef|useReducer|useLayoutEffect|useCallback|useForm|useQuery|useMutation)\s*\(/.test(
            String(code || '')
        );
    }

    usesBrowserOnlyApis(code) {
        return /\b(window|document|localStorage|sessionStorage|navigator|matchMedia|ResizeObserver|IntersectionObserver)\b/.test(
            String(code || '')
        );
    }

    isNextBoundaryFile(path, frameworkMode) {
        if (frameworkMode === 'vanilla') return false;
        return /^(app|components)\//.test(path) || /^src\/(app|components)\//.test(path) || /\.(tsx|jsx)$/.test(path);
    }

    isLikelyServerFile(path) {
        return /(?:^|\/)(layout|page|route|server|handler)\.(ts|tsx|js|jsx)$/.test(path) || /middleware\.ts$/.test(path);
    }

    isExternalImport(source) {
        return !source.startsWith('.') && !source.startsWith('@/') && !source.startsWith('~/');
    }

    extractImports(content) {
        const imports = [];
        const code = String(content || '');

        const importRegex = /import\s+(?:type\s+)?(?:(.+?)\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(code)) !== null) {
            const clause = String(match[1] || '').trim();
            const source = String(match[2] || '').trim();
            const names = [];

            if (clause) {
                const defaultPart = clause.match(/^[A-Za-z_$][\w$]*/);
                if (defaultPart) names.push('default');

                const namedMatch = clause.match(/\{([\s\S]*?)\}/);
                if (namedMatch?.[1]) {
                    for (const part of namedMatch[1].split(',')) {
                        const clean = part.trim().split(/\s+as\s+/i)[0].trim();
                        if (clean) names.push(clean);
                    }
                }

                if (/\*\s+as\s+[A-Za-z_$][\w$]*/.test(clause)) {
                    names.push('*');
                }
            } else {
                names.push('default');
            }

            imports.push({
                names: Array.from(new Set(names)),
                source,
            });
        }

        // CommonJS require support.
        const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
        while ((match = requireRegex.exec(code)) !== null) {
            const source = String(match[1] || '').trim();
            if (!source) continue;
            imports.push({
                names: ['default'],
                source,
            });
        }

        return imports;
    }

    resolveLocalImport(fromFile, importSource, files) {
        let target = String(importSource || '');

        if (target.startsWith('@/')) {
            target = target.slice(2);
        } else if (target.startsWith('~/')) {
            target = target.slice(2);
        } else if (target.startsWith('./') || target.startsWith('../')) {
            const fromDir = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/')) : '';
            const parts = fromDir ? fromDir.split('/') : [];
            for (const segment of target.split('/')) {
                if (!segment || segment === '.') continue;
                if (segment === '..') {
                    parts.pop();
                    continue;
                }
                parts.push(segment);
            }
            target = parts.join('/');
        } else {
            return null;
        }

        const candidates = [
            target,
            `${target}.ts`,
            `${target}.tsx`,
            `${target}.js`,
            `${target}.jsx`,
            `${target}/index.ts`,
            `${target}/index.tsx`,
            `${target}/index.js`,
            `${target}/index.jsx`,
        ];

        for (const candidate of candidates) {
            if (Object.prototype.hasOwnProperty.call(files, candidate)) return candidate;
        }

        return null;
    }

    verifyPackageDependencies(result, frameworkMode) {
        const pkgText = result.files['package.json'];
        if (!pkgText) {
            if (this.frameworkDefaults[frameworkMode]?.packageRequired) {
                result.issues.push({
                    severity: 'critical',
                    category: 'preflight',
                    file: 'package.json',
                    description: 'Framework project has no package.json.',
                    fix: 'Generate package.json with all required dependencies.',
                });
            }
            return;
        }

        let pkg;
        try {
            pkg = JSON.parse(pkgText);
        } catch {
            result.issues.push({
                severity: 'critical',
                category: 'preflight',
                file: 'package.json',
                description: 'package.json is not valid JSON.',
                fix: 'Regenerate a valid package manifest.',
            });
            return;
        }

        pkg.dependencies = pkg.dependencies || {};
        pkg.devDependencies = pkg.devDependencies || {};

        const sourceBlob = Object.values(result.files).join('\n');
        const imports = this.extractImports(sourceBlob);

        const added = new Set();

        for (const imp of imports) {
            if (this.isExternalImport(imp.source)) {
                const packageName = this.packageNameFromImport(imp.source);
                if (!packageName) continue;

                const knownVersion = this.knownVersions[packageName];
                const hasDependency =
                    pkg.dependencies[packageName] || pkg.devDependencies[packageName] || pkg.peerDependencies?.[packageName];

                if (knownVersion && !hasDependency && !added.has(packageName)) {
                    pkg.dependencies[packageName] = knownVersion;
                    added.add(packageName);
                    result.fixes.push({
                        file: 'package.json',
                        description: `Added missing dependency ${packageName}.`,
                    });
                }
            }
        }

        if (added.size) {
            result.files['package.json'] = JSON.stringify(pkg, null, 2);
        }

        // Basic framework boundary checks.
        if (frameworkMode !== 'vanilla') {
            const needsClientBoundary = Object.entries(result.files).some(([path, code]) => {
                if (!this.isNextBoundaryFile(path, frameworkMode)) return false;
                return this.usesReactHooks(String(code || '')) && !this.hasUseClientDirective(String(code || ''));
            });

            if (needsClientBoundary) {
                result.issues.push({
                    severity: 'warning',
                    category: 'boundary',
                    file: 'components',
                    description: this.frameworkDefaults[frameworkMode].clientOnlyHint,
                    fix: 'Add "use client" only where interactive hooks are used.',
                });
            }
        }
    }

    packageNameFromImport(source) {
        if (!source || source.startsWith('.') || source.startsWith('@/') || source.startsWith('~/')) return null;
        if (source.startsWith('@')) {
            const parts = source.split('/');
            return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : source;
        }
        return source.split('/')[0];
    }

    hasMultipleEntryPatterns(files = {}, frameworkMode = 'vanilla') {
        const names = Object.keys(files);

        const nextLike = names.some((n) => /^(app|src\/app)\//.test(n) || /next\.config\./.test(n));
        const viteLike = names.some((n) => /vite\.config\./.test(n) || /src\/main\.(ts|tsx|js|jsx)$/.test(n));
        const staticLike = names.some((n) => /index\.html$/.test(n));

        const count =
            (nextLike ? 1 : 0) +
            (viteLike ? 1 : 0) +
            (staticLike ? 1 : 0);

        // Only warn if there is actual overlap that looks accidental.
        if (count <= 1) return false;
        if (frameworkMode === 'vanilla' && staticLike && !nextLike && !viteLike) return false;

        return true;
    }
}

if (typeof window !== 'undefined') {
    window.PreflightGuard = PreflightGuard;
}

;
/* ============================================================
   AGENT RECOVERY - smart recovery without weak template shells
   Coding agents are NEVER replaced by thin recovery pages.
   ============================================================ */

class AgentRecoveryAgent extends BaseAgent {
    constructor() {
        super('AgentRecoveryAgent', 'Recovers non-critical agent failures without shipping weak template shells.');
    }

    async recover(agentName, methodName, args = [], error = null) {
        if (methodName !== 'execute' && methodName !== 'executeFromReview') return { handled: false };
        const reason = error?.message || 'Unknown agent error';

        // CRITICAL CODERS: never ship a weak shell — force retry / hard failure
        const noShellAgents = new Set([
            'coder-ui', 'coder-react', 'coder-fullstack', 'architect',
            'coder-3d', 'coder-shader', 'animator', 'refiner', 'healer'
        ]);
        if (noShellAgents.has(agentName)) {
            this.log('error', `${agentName} failed — refusing weak recovery shell. Reason: ${reason}`);
            return { handled: false };
        }

        if (agentName === 'planner') {
            const prompt = String(args[0] || 'Premium website');
            const frameworkOverride = args[1] || null;
            // Prefer planner's own intelligent default if available
            if (this.framework?.agents?.planner?._getDefaultSpec) {
                try {
                    const spec = this.framework.agents.planner._getDefaultSpec(prompt, frameworkOverride);
                    return this._handled('Planner recovered with engineer-grade default spec (not a thin shell).', spec);
                } catch (_) { /* fall through */ }
            }
            return this._handled('Planner fallback spec created.', this._fallbackSpec(prompt, reason, frameworkOverride));
        }
        if (agentName === 'designer') {
            return this._handled('Designer recovered with premium token system.', this._fallbackDesignSystem());
        }
        if (['researcher', 'brand-strategist'].includes(agentName)) {
            return this._handled(`${agentName} skipped with neutral fallback.`, null);
        }
        if (agentName === 'reviewer') {
            // Fail closed on quality — do not auto-pass weak builds
            return this._handled('Reviewer recovered with fail-closed report.', {
                score: 70,
                passed: false,
                summary: `AI reviewer failed; build must be refined. Reason: ${reason}`,
                issues: [{
                    severity: 'critical',
                    category: 'recovery',
                    file: 'generated files',
                    description: `Reviewer failed: ${reason}`,
                    fix: 'Re-run generation or refine until premium quality gates pass.'
                }],
                strengths: [],
                recommendations: ['Do not ship until a successful review pass completes.']
            });
        }

        return { handled: false };
    }

    _handled(message, value) {
        this.log('warning', message);
        return { handled: true, value, message };
    }

    _fallbackSpec(prompt, reason, frameworkOverride = null) {
        const lower = String(prompt || '').toLowerCase();
        const isApp = /\b(dashboard|admin|auth|login|api|database|saas|app|portal)\b/.test(lower);
        const isFull = /\b(database|prisma|auth|full-?stack|next\.?js|payment)\b/.test(lower);
        const framework = frameworkOverride
            || (isFull ? 'fullstack-nextjs' : (isApp ? 'react-vite' : 'vanilla'));
        return {
            title: prompt.split('\n')[0].slice(0, 60) || 'Premium Website',
            description: prompt,
            framework,
            siteType: isApp ? 'webapp' : 'saas-landing',
            complexity: isFull ? 'ultra-complex' : (isApp ? 'complex' : 'medium'),
            has3D: false,
            sections: isApp
                ? ['header', 'sidebar', 'main-dashboard', 'stats-cards', 'data-table', 'cta', 'footer']
                : ['hero', 'proof', 'features', 'process', 'work', 'cta', 'footer'],
            pages: isApp
                ? [
                    { id: 'home', path: '/', purpose: 'Marketing story' },
                    { id: 'app', path: isFull ? '/dashboard' : '/app', purpose: 'Primary product surface' }
                ]
                : [{ id: 'home', path: '/', purpose: 'Primary site' }],
            appArchitecture: {
                auth: isFull ? 'session' : 'none',
                dataLayer: isFull ? 'prisma-sqlite' : (isApp ? 'localStorage' : 'none'),
                roles: isApp ? ['guest', 'user', 'admin'] : ['guest'],
                entities: isApp ? ['User', 'Item'] : [],
                flows: isApp ? ['land → auth → core action'] : ['land → explore → convert']
            },
            interactiveComponents: isApp
                ? ['navigation-menu', 'sidebar-toggle', 'data-tables', 'modal-popup', 'form-validation', 'toast-notifications']
                : ['navigation-menu', 'mobile-hamburger', 'form-validation', 'modal-popup'],
            jsFeatures: ['state-management', 'local-storage', 'intersection-observer'],
            features: ['responsive', 'accessibility', 'seo-optimized', 'performance-optimized'],
            mediaNeeds: { images: [], videos: [], svgs: [] },
            dbModels: isFull ? [
                { name: 'User', fields: ['id', 'email', 'name', 'role'] },
                { name: 'Item', fields: ['id', 'title', 'status', 'ownerId'] }
            ] : [],
            apiEndpoints: isFull ? [
                { method: 'GET', path: '/api/health', purpose: 'Health check' },
                { method: 'GET', path: '/api/items', purpose: 'List items' }
            ] : [],
            artDirection: {
                concept: 'Editorial product-grade experience with restrained motion and credible proof.',
                heroComposition: 'Oversized type, intentional media block, generous negative space.',
                visualMotifs: ['hairline rules', 'editorial captions', 'one accent material'],
                motionPlan: ['masked headline reveal', 'scroll-linked section fade', 'premium hover'],
                avoid: ['fake logos', 'unsupported metrics', 'gradient blobs', 'generic SaaS sections', 'recovery shells']
            },
            qualityContract: {
                tier: 'recovery-signature-build',
                northStar: 'Recover planning without ever shipping a thin placeholder website.',
                proof: ['Complete architecture', 'Real page map', 'Working interaction plan'],
                signatureMoments: ['Specific first viewport', 'Clear product proof', 'Accessible conversion path'],
                nonNegotiables: ['No secrets', 'No fabricated metrics', 'No placeholder-only pages', 'No weak recovery shells'],
                recoveryReason: reason
            },
            colorPalette: {
                primary: '#C84B31', secondary: '#173F5F', accent: '#F6C85F',
                background: '#F4F1EA', surface: '#FFFFFF', text: '#17202A', textMuted: '#5D6873'
            },
            typography: { heading: 'Instrument Serif', body: 'Manrope' }
        };
    }

    _fallbackDesignSystem() {
        return {
            colors: {
                primary: '#C84B31',
                secondary: '#173F5F',
                accent: '#F6C85F',
                background: '#0B0B0C',
                surface: '#141416',
                text: '#F4F1EA',
                muted: '#9A9590'
            },
            typography: { heading: 'Instrument Serif', body: 'Manrope', mono: 'JetBrains Mono' },
            googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap',
            css: `:root {
  --color-primary: #C84B31;
  --color-secondary: #173F5F;
  --color-accent: #F6C85F;
  --color-bg: #0B0B0C;
  --color-surface: #141416;
  --color-text: #F4F1EA;
  --color-text-muted: #9A9590;
  --color-border: rgba(244,241,234,0.12);
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body: 'Manrope', system-ui, sans-serif;
  --font-size-hero: clamp(3rem, 9vw, 7rem);
  --space-section: clamp(4rem, 10vw, 9rem);
  --radius-lg: 20px;
  --shadow-elevated: 0 30px 80px rgba(0,0,0,0.35);
}`
        };
    }
}

window.AgentRecoveryAgent = AgentRecoveryAgent;

;
/* ============================================================
BUG FINDER AGENT — Static code analysis for generated projects
Detects: missing imports, extension mismatches, missing exports,
path alias issues, missing package dependencies, and common
Next.js / React integration problems.
============================================================ */

class BugFinderAgent extends BaseAgent {
    constructor() {
        super(
            'BugFinderAgent',
            'Static code analysis agent that detects bugs in generated code before preview'
        );

        this.config = {
        maxFilesToScan: 60,
        builtins: new Set([
            'react',
            'react-dom',
            'next',
            'fs',
            'path',
            'os',
            'http',
            'https',
            'url',
            'util',
            'stream',
            'events',
            'crypto',
            'buffer',
            'zlib',
            'net',
            'tls',
            'child_process',
            'timers',
            'timers/promises',
            'module',
            'dns',
            'assert',
        ]),
    };

    this.extensionCandidates = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
}

/**
 * Executes the bug finding and auto-fixing process.
 * @param {Object} files - The generated files
 * @returns {Object} { files: Object, report: Object }
 */
async execute(files = {}) {
    this.log('info', 'Analyzing generated code for common bugs...');

    const report = this.analyze(files);

    if (!report.bugs.length) {
        this.log('success', report.summary);
        return { files, report };
    }

    this.log(report.errorCount > 0 ? 'error' : 'warning', report.summary);

    let fixedFiles = { ...files };
    if (report.fixable.length) {
        this.log('info', `Attempting to auto - fix ${ report.fixable.length } issue(s)...`);
        const fixResult = this.autoFix(fixedFiles, report.fixable);
        fixedFiles = fixResult.files;

        for (const log of fixResult.fixLog) {
            this.log('success', `Fixed: ${ log } `);
        }
    }

    return { files: fixedFiles, report };
}

/**
 * Scan all generated files for common bugs.
 * @param {Object} files - { filename: content } map
 * @returns {Object} { bugs: Array, fixable: Array, summary: string }
 */
analyze(files = {}) {
    const bugs = [];
    const fixable = [];

    const packageJson = this._safeParseJSON(files['package.json']);
    const tsconfig = this._safeParseJSON(files['tsconfig.json']);
    const pathAliasEnabled = !!tsconfig?.compilerOptions?.paths?.['@/*'];

    const seenMessages = new Set();

    const pushBug = (bug, markFixable = false) => {
        if (!bug?.message || seenMessages.has(bug.message)) return;
        seenMessages.add(bug.message);
        bugs.push(bug);
        if (markFixable) fixable.push(bug);
    };

    const filenames = Object.keys(files).slice(0, this.config.maxFilesToScan);

    for (const filename of filenames) {
        const content = files[filename];
        if (typeof content !== 'string' || !content.trim()) continue;

        const imports = this._extractImports(content);
        const exports = this._extractExports(content);

        // 1) TS/JS extension mismatch — file contains JSX but is not .tsx/.jsx
        if (this._containsJSX(content) && filename.endsWith('.ts') && !filename.endsWith('.d.ts')) {
            pushBug(
                {
                    file: filename,
                    type: 'tsx-extension',
                    severity: 'error',
                    message: `File "${filename}" contains JSX but uses.ts extension.Rename to.tsx`,
                    fix: { rename: filename, to: filename.replace(/\.ts$/, '.tsx') },
                },
                true
            );
        }

        if (this._containsJSX(content) && filename.endsWith('.js') && !filename.endsWith('.jsx') && !filename.endsWith('.mjs')) {
            pushBug(
                {
                    file: filename,
                    type: 'jsx-extension',
                    severity: 'warning',
                    message: `File "${filename}" contains JSX but uses.js extension.Consider renaming to.jsx`,
                    fix: { rename: filename, to: filename.replace(/\.js$/, '.jsx') },
                },
                true
            );
        }

        // 2) Client component hook usage without "use client"
        if (this._looksLikeReactComponent(content) && this._usesClientOnlyHooks(content) && !this._hasUseClientDirective(content)) {
            pushBug({
                file: filename,
                type: 'missing-use-client',
                severity: 'error',
                message: `File "${filename}" uses client - only React hooks but is missing "use client"`,
            });
        }

        // 3) Missing imports / unresolved local imports
        for (const imp of imports) {
            if (this._isExternalImport(imp.source)) continue;

            const resolved = this._resolveImportPath(filename, imp.source, files);
            if (!resolved) {
                pushBug({
                    file: filename,
                    type: 'missing-import',
                    severity: 'error',
                    message: `Import "${imp.source}" in "${filename}" — file not found in project`,
                    importSource: imp.source,
                    importNames: imp.names,
                });
            }
        }

        // 4) Missing exports for local imports
        for (const imp of imports) {
            if (this._isExternalImport(imp.source)) continue;

            const resolvedPath = this._resolveImportPath(filename, imp.source, files);
            if (!resolvedPath || !files[resolvedPath]) continue;

            const targetContent = files[resolvedPath];
            for (const name of imp.names) {
                if (name === 'default' || name === '*') continue;

                if (!this._isExported(name, targetContent) && !this._isDefinitelyImportedAsTypeOnly(content, name, imp.source)) {
                    pushBug({
                        file: filename,
                        type: 'missing-export',
                        severity: 'warning',
                        message: `"${name}" imported from "${imp.source}" but not exported in "${resolvedPath}"`,
                        symbol: name,
                        targetFile: resolvedPath,
                    });
                }
            }
        }

        // 5) Package dependency checks
        for (const imp of imports) {
            if (!this._isExternalImport(imp.source)) continue;

            const pkgName = this._packageNameFromImport(imp.source);
            if (!pkgName || this.config.builtins.has(pkgName)) continue;

            if (packageJson) {
                const allDeps = {
                    ...(packageJson.dependencies || {}),
                    ...(packageJson.devDependencies || {}),
                    ...(packageJson.peerDependencies || {}),
                };

                if (!allDeps[pkgName] && !allDeps[imp.source]) {
                    pushBug({
                        file: filename,
                        type: 'missing-package',
                        severity: 'warning',
                        message: `Package "${pkgName}" imported in "${filename}" but not in package.json dependencies`,
                        package: pkgName,
                    });
                }
            }
        }

        // 6) Path alias usage without tsconfig paths
        if (this._usesPathAlias(content) && !pathAliasEnabled) {
            pushBug(
                {
                    file: filename,
                    type: 'missing-path-alias',
                    severity: 'error',
                    message: `"${filename}" uses @/ import alias but tsconfig.json is missing paths config`,
        fix: { file: 'tsconfig.json', action: 'add-path-alias' },
    },
    true
            );
}

// 7) Duplicate exports inside a single file
const duplicateExports = this._findDuplicateExports(exports);
for (const dup of duplicateExports) {
    pushBug({
        file: filename,
        type: 'duplicate-export',
        severity: 'warning',
        message: `File "${filename}" exports "${dup}" more than once`,
        symbol: dup,
    });
}

// 8) Suspicious default export + named export mismatch in route-like files
if (this._looksLikeNextRouteFile(filename) && this._containsDefaultExport(content)) {
    pushBug({
        file: filename,
        type: 'route-default-export',
        severity: 'warning',
        message: `Route file "${filename}" appears to use a default export. Next.js route handlers usually need named exports like GET/POST`,
    });
}
    }

const errorCount = bugs.filter((b) => b.severity === 'error').length;
const warnCount = bugs.filter((b) => b.severity === 'warning').length;

return {
    bugs,
    fixable,
    errorCount,
    warningCount: warnCount,
    summary:
        bugs.length === 0
            ? '✅ No bugs detected'
            : `🐞 Found ${errorCount} error(s), ${warnCount} warning(s)`,
};
}

/**
 * Auto-fix fixable bugs and return updated files.
 * @param {Object} files
 * @param {Array} bugs
 */
autoFix(files = {}, bugs = []) {
    const fixed = { ...files };
    const fixLog = [];
    const renameMap = new Map();

    for (const bug of bugs) {
        if (!bug.fix) continue;

        if (bug.type === 'tsx-extension' && bug.fix.rename && bug.fix.to) {
            if (fixed[bug.fix.rename]) {
                fixed[bug.fix.to] = fixed[bug.fix.rename];
                delete fixed[bug.fix.rename];
                renameMap.set(bug.fix.rename, bug.fix.to);

                fixLog.push(`Renamed ${bug.fix.rename} → ${bug.fix.to}`);
            }
        }

        if (bug.type === 'jsx-extension' && bug.fix.rename && bug.fix.to) {
            if (fixed[bug.fix.rename]) {
                fixed[bug.fix.to] = fixed[bug.fix.rename];
                delete fixed[bug.fix.rename];
                renameMap.set(bug.fix.rename, bug.fix.to);

                fixLog.push(`Renamed ${bug.fix.rename} → ${bug.fix.to}`);
            }
        }

        if (bug.type === 'missing-path-alias' && bug.fix.action === 'add-path-alias') {
            const tsconfig = this._safeParseJSON(fixed['tsconfig.json']);
            if (tsconfig) {
                if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
                tsconfig.compilerOptions.baseUrl = '.';

                const existingPaths = tsconfig.compilerOptions.paths || {};
                tsconfig.compilerOptions.paths = {
                    ...existingPaths,
                    '@/*': ['./*'],
                };

                fixed['tsconfig.json'] = JSON.stringify(tsconfig, null, 2);
                fixLog.push('Added @/* path alias to tsconfig.json');
            }
        }
    }

    // Update imports after renames
    if (renameMap.size) {
        for (const [filename, content] of Object.entries(fixed)) {
            if (typeof content !== 'string') continue;

            let updated = content;
            for (const [oldName, newName] of renameMap.entries()) {
                const oldBase = oldName.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, '');
                const newBase = newName.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, '');

                updated = updated.replace(
                    new RegExp(this._escapeRegex(oldBase), 'g'),
                    newBase
                );
            }

            fixed[filename] = updated;
        }
    }

    return { files: fixed, fixLog };
}

// ─────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────

_safeParseJSON(text) {
    if (typeof text !== 'string') return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

_containsJSX(content) {
    return /(<[A-Z][A-Za-z0-9_.:-]*[\s/>]|<\/[A-Z][A-Za-z0-9_.:-]*>|<>|<\/>|<[a-z][A-Za-z0-9_.:-]*[\s/>])/.test(content);
}

_hasUseClientDirective(content) {
    const firstChunk = String(content || '').trimStart().slice(0, 200);
    return /^['"]use client['"]\s*;?/m.test(firstChunk);
}

_looksLikeReactComponent(content) {
    return /\buse(State|Effect|Memo|Callback|Ref|Reducer)\b/.test(content) || /return\s*\(\s*</.test(content);
}

_usesClientOnlyHooks(content) {
    return /\buse(State|Effect|LayoutEffect|Ref|Reducer|Memo|Callback)\b/.test(content);
}

_usesPathAlias(content) {
    return /from\s+['"]@\/|import\s*\(\s*['"]@\/|require\(\s*['"]@\/|from\s+['"]~\//.test(content);
}

_isExternalImport(source) {
    return !source.startsWith('.') && !source.startsWith('@/') && !source.startsWith('~/');
}

_packageNameFromImport(source) {
    if (!source || source.startsWith('.') || source.startsWith('@/') || source.startsWith('~/')) return null;
    if (source.startsWith('@')) {
        const parts = source.split('/');
        return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : source;
    }
    return source.split('/')[0];
}

_extractImports(content) {
    const imports = [];

    // ES imports: import x from 'y'; import {a,b} from 'y'; import * as x from 'y'
    const importRegex = /import\s+(?:type\s+)?(?:(?:([\w*$\s,{}]+)\s+from\s+)?['"](.*?)['"]|['"](.*?)['"])/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const clause = (match[1] || '').trim();
        const source = (match[2] || match[3] || '').trim();
        if (!source) continue;

        const names = [];

        if (clause) {
            if (clause.startsWith('{')) {
                const inner = clause.replace(/^\{|\}$/g, '');
                for (const part of inner.split(',')) {
                    const clean = part.trim().split(/\s+as\s+/i)[0].trim();
                    if (clean) names.push(clean);
                }
            } else if (clause.startsWith('* as ')) {
                names.push('*');
            } else {
                // default import + maybe named imports
                const pieces = clause.split(',').map((s) => s.trim()).filter(Boolean);
                if (pieces[0]) names.push('default');
                if (pieces[1] && pieces[1].startsWith('{')) {
                    const inner = pieces[1].replace(/^\{|\}$/g, '');
                    for (const part of inner.split(',')) {
                        const clean = part.trim().split(/\s+as\s+/i)[0].trim();
                        if (clean) names.push(clean);
                    }
                }
            }
        }

        imports.push({
            names: names.length ? names : ['default'],
            source,
        });
    }

    // CommonJS requires: const x = require('y')
    const requireRegex = /require\(\s*['"](.*?)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
        const source = (match[1] || '').trim();
        if (!source) continue;
        imports.push({
            names: ['default'],
            source,
        });
    }

    return imports;
}

_extractExports(content) {
    const exports = [];

    const patterns = [
        /export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g,
        /export\s+class\s+([A-Za-z0-9_$]+)/g,
        /export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/g,
        /export\s+(?:type|interface|enum)\s+([A-Za-z0-9_$]+)/g,
        /export\s*\{([^}]*)\}/g,
        /export\s+default\s+([A-Za-z0-9_$]+)/g,
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (pattern.source.includes('\\{([^}]*)\\}')) {
                const names = String(match[1] || '')
                    .split(',')
                    .map((s) => s.trim().split(/\s+as\s+/i)[0].trim())
                    .filter(Boolean);
                exports.push(...names);
            } else {
                exports.push(match[1]);
            }
        }
    }

    return exports.filter(Boolean);
}

_findDuplicateExports(exports = []) {
    const counts = new Map();
    for (const name of exports) {
        counts.set(name, (counts.get(name) || 0) + 1);
    }
    return [...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name);
}

_resolveImportPath(fromFile, importSource, files) {
    if (!importSource) return null;

    let baseTarget = importSource;

    if (baseTarget.startsWith('@/')) {
        baseTarget = baseTarget.slice(2);
    } else if (baseTarget.startsWith('~/')) {
        baseTarget = baseTarget.slice(2);
    } else if (baseTarget.startsWith('./') || baseTarget.startsWith('../')) {
        const fromDir = fromFile.includes('/')
            ? fromFile.substring(0, fromFile.lastIndexOf('/'))
            : '';
        const dirParts = fromDir ? fromDir.split('/') : [];
        const importParts = baseTarget.split('/');

        for (const part of importParts) {
            if (part === '.' || !part) continue;
            if (part === '..') {
                dirParts.pop();
                continue;
            }
            dirParts.push(part);
        }
        baseTarget = dirParts.join('/');
    } else {
        return null;
    }

    const candidates = [
        baseTarget,
        ...this.extensionCandidates.map((ext) => `${baseTarget}${ext}`),
        `${baseTarget}/index.ts`,
        `${baseTarget}/index.tsx`,
        `${baseTarget}/index.js`,
        `${baseTarget}/index.jsx`,
        `${baseTarget}/index.mjs`,
        `${baseTarget}/index.cjs`,
    ];

    for (const candidate of candidates) {
        if (Object.prototype.hasOwnProperty.call(files, candidate)) return candidate;
    }

    return null;
}

_isExported(name, content) {
    const escaped = this._escapeRegex(name);

    const patterns = [
        new RegExp(`export\\s+(?:async\\s+)?(?:const|let|var|function|class|type|interface|enum)\\s+${escaped}\\b`),
        new RegExp(`export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`),
        new RegExp(`export\\s+default\\s+${escaped}\\b`),
    ];

    return patterns.some((p) => p.test(content));
}

_containsDefaultExport(content) {
    return /export\s+default\s+/.test(content);
}

_looksLikeNextRouteFile(filename) {
    return /(?:^|\/)route\.ts$/.test(filename) || /(?:^|\/)route\.tsx$/.test(filename);
}

_isDefinitelyImportedAsTypeOnly(content, name, source) {
    const typeImportRegex = new RegExp(
        String.raw`import\s+type\s+\{[^}]*\b${this._escapeRegex(name)}\b[^}]*\}\s+from\s+['"]${this._escapeRegex(source)}['"]`
    );
    return typeImportRegex.test(content);
}

_escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
}

// Export for browser
if (typeof window !== 'undefined') {
window.BugFinderAgent = BugFinderAgent;
}

;
/* ============================================================
   PROJECT INTELLIGENCE AGENTS - imported project analysis suite
   ============================================================ */

class ZipIntakeAgent extends BaseAgent {
    constructor() {
        super('ZipIntakeAgent', 'Summarizes imported ZIP structure and intake risks.');
    }

    async execute(files = {}, analysis = {}) {
        const report = {
            source: analysis.sourceName || 'imported project',
            framework: analysis.framework || 'unknown',
            fileCount: Object.keys(files || {}).length,
            size: analysis.size || 0,
            keyFiles: this._keyFiles(files),
            warnings: Array.isArray(analysis.warnings) ? analysis.warnings : [],
            inferredRisks: this._inferRisks(files, analysis),
        };

        this.log('success', `Mapped ${report.fileCount} files as ${report.framework}`);
        return report;
    }

    _keyFiles(files) {
        const names = Object.keys(files || {});
        const preferred = [
            'package.json',
            'index.html',
            'src/App.jsx',
            'src/App.tsx',
            'app/page.tsx',
            'app/page.jsx',
            'styles.css',
            'src/index.css',
        ];

        const important = [
            ...preferred.filter((name) => files?.[name]),
            ...names.filter((name) => /README|vite\.config|next\.config|tailwind\.config|tsconfig|postcss/i.test(name)),
        ];

        return [...new Set(important)].slice(0, 20);
    }

    _inferRisks(files, analysis) {
        const names = Object.keys(files || {});
        const risks = [];

        if (!names.length) risks.push('Empty archive or unreadable import.');
        if (!files?.['package.json']) risks.push('No package.json detected; dependency graph may be incomplete.');
        if (!names.some((n) => /^(app|src\/app|pages|src\/pages)\//.test(n) || /index\.html$/i.test(n))) {
            risks.push('No obvious app/page entrypoint found.');
        }
        if (analysis?.size && analysis.size > 50 * 1024 * 1024) {
            risks.push('Large import size; review for heavy assets or generated bundles.');
        }

        return risks;
    }
}

class ProjectArchitectAgent extends BaseAgent {
    constructor() {
        super('ProjectArchitectAgent', 'Understands architecture, routes, components, and dependencies.');
    }

    async execute(files = {}, intake = {}) {
        const names = Object.keys(files || {});
        const packageJson = this._parsePackage(files['package.json']);
        const framework = intake.framework || this._detectFramework(files, packageJson);

        const report = {
            framework,
            entrypoints: names
                .filter((name) => /(^|\/)(index|main|App|page)\.(html|jsx|tsx|js|ts)$/i.test(name))
                .slice(0, 30),
            routes: names
                .filter((name) => /(^app\/.+\/page|^pages\/|route\.(ts|js|tsx|jsx)$)/i.test(name))
                .slice(0, 50),
            components: names
                .filter((name) => /(^|\/)(components|ui)\//i.test(name))
                .slice(0, 80),
            styles: names.filter((name) => /\.(css|scss|sass)$/i.test(name)).slice(0, 50),
            dependencies: Object.keys({
                ...(packageJson.dependencies || {}),
                ...(packageJson.devDependencies || {}),
            }).sort(),
            architectureRisks: [],
            clientBoundaryHints: this._clientBoundaryHints(files, framework),
        };

        if (!report.entrypoints.length) report.architectureRisks.push('No obvious page or app entrypoint found.');
        if (report.components.length > 70) report.architectureRisks.push('Large component surface; upgrade should be planned in phases.');
        if (!files['package.json'] && report.framework !== 'static') {
            report.architectureRisks.push('Framework-like project without package.json.');
        }
        if (report.framework === 'nextjs' && !names.some((name) => /^app\/layout\.(tsx|ts|jsx|js)$/.test(name))) {
            report.architectureRisks.push('Next.js App Router project appears to be missing app/layout.*.');
        }

        this.log('success', `Found ${report.entrypoints.length} entrypoints and ${report.components.length} components`);
        return report;
    }

    _parsePackage(source) {
        try {
            return source ? JSON.parse(source) : {};
        } catch {
            return {};
        }
    }

    _detectFramework(files, pkg) {
        const names = Object.keys(files || {});

        if (pkg.dependencies?.next || names.some((name) => /^app\/.+page\.(tsx|jsx|js)$/.test(name))) return 'nextjs';
        if (pkg.dependencies?.react || names.some((name) => /^src\/main\.(jsx|tsx|js|ts)$/.test(name))) return 'react';
        if (names.some((name) => /(^|\/)index\.html$/i.test(name))) return 'static';
        return 'unknown';
    }

    _clientBoundaryHints(files, framework) {
        if (framework === 'static' || framework === 'unknown') return [];
        const hints = [];
        for (const [name, source] of Object.entries(files || {})) {
            const text = String(source || '');
            if (/\b(useState|useEffect|useMemo|useRef|useReducer|useLayoutEffect|useCallback|useForm)\s*\(/.test(text) && !/^\s*['"]use client['"]/.test(text)) {
                hints.push(`${name} likely needs "use client".`);
            }
        }
        return hints.slice(0, 20);
    }
}

class CreativeDirectorAgent extends BaseAgent {
    constructor() {
        super('CreativeDirectorAgent', 'Defines premium art direction and quality bar.');
    }

    async execute(files = {}, architecture = {}) {
        const allText = Object.values(files || {}).map((source) => String(source || '')).join('\n');
        const hasProductUi = /\b(dashboard|workspace|kanban|analytics|timeline|settings|table|chart|kanban board)\b/i.test(allText);
        const hasPortfolio = /\b(case study|portfolio|selected work|studio|agency|projects)\b/i.test(allText);
        const direction = hasProductUi
            ? 'product-led editorial software'
            : hasPortfolio
                ? 'case-study driven digital studio'
                : 'brand-first editorial experience';

        const report = {
            direction,
            northStar: 'Make the first viewport instantly specific, credible, and authored.',
            signatureMoments: [
                'A hero that shows the real product, place, person, or offer immediately',
                'One memorable interaction tied to the brand idea',
                'Proof section based on real capabilities, not fake counters',
            ],
            avoid: ['generic gradients', 'floating blobs', 'fake logos', 'unsupported metrics', 'card-heavy repetition'],
            notes: [],
        };

        if (architecture?.framework === 'nextjs') {
            report.notes.push('Use App Router composition and keep client boundaries minimal.');
        }
        if (architecture?.framework === 'static') {
            report.notes.push('Keep the experience performant with light DOM/CSS interactions.');
        }

        this.log('success', `Creative direction: ${direction}`);
        return report;
    }
}

class CopyChiefAgent extends BaseAgent {
    constructor() {
        super('CopyChiefAgent', 'Finds weak copy, placeholders, and fabricated proof.');
    }

    async execute(files = {}) {
        const issues = [];
        const scanTargets = [
            { regex: /\b(lorem ipsum|your company|coming soon|todo:|placeholder)\b/i, message: 'Placeholder copy remains.' },
            { regex: /\b(the future of|everything you need to|build, scale, and succeed|unlock your potential)\b/i, message: 'Generic marketing phrase detected.' },
            { regex: /\b(10,?000\+|99% satisfaction|trusted by leading|fortune 500|award-winning)\b/i, message: 'Possibly fabricated social proof or vanity metric.' },
        ];

        for (const target of scanTargets) {
            this._scan(files, target.regex, target.message, issues);
        }

        const report = {
            issues,
            rewriteRules: [
                'Use brand-owned nouns and category-specific verbs.',
                'Replace vague claims with visible proof from the product or service.',
                'Do not invent client logos, ratings, testimonials, or metrics.',
            ],
        };

        this.log(issues.length ? 'warning' : 'success', issues.length ? `${issues.length} copy issue(s) found` : 'Copy scan clean');
        return report;
    }

    _scan(files, regex, message, issues) {
        for (const [file, source] of Object.entries(files || {})) {
            if (regex.test(String(source || ''))) issues.push({ file, message });
        }
    }
}

class VisualCriticAgent extends BaseAgent {
    constructor() {
        super('VisualCriticAgent', 'Reviews visual system, typography, layout, and generic patterns.');
    }

    async execute(files = {}) {
        const css = Object.entries(files || {})
            .filter(([name]) => /\.(css|scss|sass)$/i.test(name))
            .map(([, source]) => String(source || ''))
            .join('\n');

        const all = Object.values(files || {}).map((source) => String(source || '')).join('\n');
        const issues = [];

        if (/\b(gradient-orb|floating-orb|blob|bokeh|particle-field)\b/i.test(all)) {
            issues.push('Decorative orb/blob/particle pattern detected.');
        }
        if (/border-radius:\s*(2[0-9]|[3-9][0-9])px/i.test(css)) {
            issues.push('Large rounded card style may feel template-like.');
        }
        if (/letter-spacing:\s*-\d/i.test(css)) {
            issues.push('Negative letter spacing detected; can hurt polish and fit.');
        }
        if ((css.match(/#[0-9a-f]{3,8}|rgba?\(/gi) || []).length < 4) {
            issues.push('Thin color system; visual identity may be underdeveloped.');
        }

        return {
            issues,
            recommendations: [
                'Make visual system category-specific.',
                'Use fewer stronger layout ideas.',
                'Prefer real product/media proof over decoration.',
            ],
        };
    }
}

class ResponsiveQAAgent extends BaseAgent {
    constructor() {
        super('ResponsiveQAAgent', 'Checks responsive readiness across mobile, tablet, and desktop.');
    }

    async execute(files = {}) {
        const all = Object.values(files || {}).map((source) => String(source || '')).join('\n');
        const issues = [];

        if (files['index.html'] && !/<meta[^>]+name=["']viewport["']/i.test(String(files['index.html']))) {
            issues.push('Viewport meta may be missing.');
        }
        if (!/@media\b/i.test(all)) issues.push('No media queries found.');
        if (/\bwidth:\s*(1[2-9]\d{2}|[2-9]\d{3})px\b/i.test(all)) issues.push('Large fixed width detected.');
        if (!/prefers-reduced-motion/i.test(all)) issues.push('Reduced-motion fallback missing.');
        if (!/clamp\(/i.test(all) && /text-|font-size/i.test(all)) issues.push('Fluid sizing may be missing for large type.');

        return {
            issues,
            breakpoints: ['375px mobile', '768px tablet', '1440px desktop'],
        };
    }
}

class PerformanceAgent extends BaseAgent {
    constructor() {
        super('PerformanceAgent', 'Finds heavy assets, dependency risk, and slow front-end patterns.');
    }

    async execute(files = {}, architecture = {}) {
        const heavyFiles = Object.entries(files || {})
            .map(([file, content]) => ({
                file,
                bytes: this._estimateBytes(content),
            }))
            .filter((item) => item.bytes > 250 * 1024)
            .sort((a, b) => b.bytes - a.bytes)
            .slice(0, 20);

        const deps = Array.isArray(architecture?.dependencies) ? architecture.dependencies : [];
        const heavyDeps = deps.filter((dep) => /three|gsap|framer-motion|mapbox|firebase|supabase|chart|monaco/i.test(dep));

        return {
            heavyFiles,
            heavyDeps,
            recommendations: [
                'Lazy-load large media and heavy interactive sections.',
                'Keep above-the-fold CSS small.',
                'Avoid shipping unused animation libraries.',
            ],
        };
    }

    _estimateBytes(content) {
        const text = String(content || '');
        if (typeof Blob !== 'undefined') {
            return new Blob([text]).size;
        }
        if (typeof TextEncoder !== 'undefined') {
            return new TextEncoder().encode(text).length;
        }
        return text.length * 2;
    }
}

class SecurityAgent extends BaseAgent {
    constructor() {
        super('SecurityAgent', 'Detects secrets, unsafe client code, and deployment security risk.');
    }

    async execute(files = {}) {
        const issues = [];
        const secretRegex = /\b(?:api[_-]?key|secret|private[_-]?key|password|token)\b\s*[:=]\s*['"]?[A-Za-z0-9_\-./+=]{12,}/i;

        for (const [file, source] of Object.entries(files || {})) {
            const text = String(source || '');
            if (secretRegex.test(text)) {
                issues.push({ severity: 'critical', file, message: 'Secret-like value may be exposed.' });
            }
            if (/\bdangerouslySetInnerHTML\b|\.innerHTML\s*=/i.test(text)) {
                issues.push({ severity: 'warning', file, message: 'Raw HTML injection pattern needs review.' });
            }
            if (/\beval\s*\(|new Function\s*\(/i.test(text)) {
                issues.push({ severity: 'critical', file, message: 'Dynamic code execution detected.' });
            }
            if (/process\.env\.(?!NEXT_PUBLIC_)[A-Z0-9_]+/i.test(text) && /use client|window|document/i.test(text)) {
                issues.push({ severity: 'warning', file, message: 'Server env reference may leak into client code.' });
            }
        }

        return {
            issues,
            rules: [
                'Move secrets to server-side env vars.',
                'Validate all inputs.',
                'Keep OAuth secrets out of client bundles.',
            ],
        };
    }
}

class UpgradePlannerAgent extends BaseAgent {
    constructor() {
        super('UpgradePlannerAgent', 'Creates a staged premium upgrade plan for imported projects.');
    }

    async execute(report = {}) {
        const highRisk = [
            ...((report.security?.issues || [])
                .filter((item) => item.severity === 'critical')
                .map((item) => `Fix security risk in ${item.file}: ${item.message}`)),
            ...((report.responsive?.issues || [])
                .map((item) => `Responsive QA: ${item}`)),
        ];

        const architectureRisks = Array.isArray(report.architecture?.architectureRisks)
            ? report.architecture.architectureRisks
            : [];

        const plan = [
            ...highRisk,
            ...architectureRisks.map((risk) => `Architecture: ${risk}`),
            'Rebuild the first viewport around one specific brand or product signal.',
            'Replace generic copy and fake proof with credible content.',
            'Refactor repeated card sections into purposeful narrative bands.',
            'Add deploy-ready README/env guidance and performance cleanup.',
        ];

        return {
            priority: plan.slice(0, 12),
            phases: ['Stabilize', 'Premium redesign', 'Responsive QA', 'Performance/security', 'Deploy readiness'],
        };
    }
}

class PatchAgent extends BaseAgent {
    constructor() {
        super('PatchAgent', 'Prepares safe, selectable patches for imported projects.');
    }

    async execute(files = {}, report = {}) {
        const patches = [];

        if (files['index.html'] && !/<meta[^>]+name=["']viewport["']/i.test(String(files['index.html']))) {
            patches.push({
                file: 'index.html',
                type: 'safe-fix',
                description: 'Add viewport meta tag for responsive preview.',
            });
        }

        const hasReducedMotion = Object.values(files || {}).some((source) => /prefers-reduced-motion/i.test(String(source || '')));
        if (!hasReducedMotion) {
            patches.push({
                file: 'styles.css',
                type: 'safe-fix',
                description: 'Add prefers-reduced-motion fallback.',
            });
        }

        if (Array.isArray(report.copy?.issues) && report.copy.issues.length) {
            patches.push({
                file: 'multiple',
                type: 'ai-assisted',
                description: 'Rewrite weak/fake marketing copy with CopyChief rules.',
            });
        }

        if (Array.isArray(report.security?.issues) && report.security.issues.some((item) => item.severity === 'critical')) {
            patches.push({
                file: 'multiple',
                type: 'security',
                description: 'Review critical security issues before deployment.',
            });
        }

        return {
            patches,
            mode: 'proposal-only',
        };
    }
}

class DeployReadinessAgent extends BaseAgent {
    constructor() {
        super('DeployReadinessAgent', 'Checks run/build/deploy readiness.');
    }

    async execute(files = {}, architecture = {}) {
        const pkg = this._parsePackage(files['package.json']);
        const scripts = pkg.scripts || {};
        const commands = [];

        if (files['package.json']) {
            commands.push('npm install');
            commands.push(scripts.dev ? 'npm run dev' : 'npm start');
            if (scripts.build) commands.push('npm run build');
        } else if (files['index.html']) {
            commands.push('Open index.html or run a static server.');
        }

        const missing = [];
        if (architecture.framework !== 'static' && !files['package.json']) missing.push('package.json');
        if (architecture.framework === 'nextjs' && !Object.keys(files || {}).some((name) => /^app\/|^pages\//.test(name))) {
            missing.push('Next.js app/pages route');
        }

        return {
            commands,
            missing,
            env: Object.keys(files || {}).filter((name) => /^\.env\.example$/i.test(name)),
        };
    }

    _parsePackage(source) {
        try {
            return source ? JSON.parse(source) : {};
        } catch {
            return {};
        }
    }
}

class ProjectRepositoryManager {
    constructor(storageKey = 'zb_project_repository_v1') {
        this.storageKey = storageKey;
    }

    record(project = {}) {
        const records = this.list();
        const entry = {
            id: project.id || this._id(),
            name: project.name || 'Untitled project',
            organization: project.organization || this._organization(project.name),
            source: project.source || 'zero-builder',
            framework: project.framework || 'unknown',
            fileCount: project.fileCount || 0,
            agents: project.agents || [],
            warnings: project.warnings || [],
            updatedAt: Date.now(),
        };
        const next = [entry, ...records.filter((item) => item.id !== entry.id)].slice(0, 50);

        if (this._canUseStorage()) {
            localStorage.setItem(this.storageKey, JSON.stringify(next));
        }

        return entry;
    }

    list() {
        if (!this._canUseStorage()) return [];
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch {
            return [];
        }
    }

    _canUseStorage() {
        try {
            return typeof localStorage !== 'undefined';
        } catch {
            return false;
        }
    }

    _id() {
        return window.crypto?.randomUUID
            ? window.crypto.randomUUID()
            : `repo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    _organization(name = '') {
        const clean = String(name)
            .replace(/\.(zip|com)$/i, '')
            .split(/[-_ ]+/)
            .filter(Boolean)[0];
        return clean || 'Personal Workspace';
    }
}

window.ZipIntakeAgent = ZipIntakeAgent;
window.ProjectArchitectAgent = ProjectArchitectAgent;
window.CreativeDirectorAgent = CreativeDirectorAgent;
window.CopyChiefAgent = CopyChiefAgent;
window.VisualCriticAgent = VisualCriticAgent;
window.ResponsiveQAAgent = ResponsiveQAAgent;
window.PerformanceAgent = PerformanceAgent;
window.SecurityAgent = SecurityAgent;
window.UpgradePlannerAgent = UpgradePlannerAgent;
window.PatchAgent = PatchAgent;
window.DeployReadinessAgent = DeployReadinessAgent;
window.ProjectRepositoryManager = ProjectRepositoryManager;
;
/* ============================================================
   LOCAL PREVIEW BRIDGE — upgraded & hardened
   Static projects render in-browser; framework projects are
   exported to the user's local workspace through server.js.
   ============================================================ */
class SandboxManager {
    getProjectType(files = {}) {
        const pkg = String(files['package.json'] || '');
        if (
            files['app/page.tsx'] || files['app/page.jsx'] ||
            files['next.config.js'] || files['next.config.mjs'] ||
            pkg.includes('"next"')
        ) return 'nextjs';
        if (
            files['src/main.jsx'] || files['src/main.tsx'] ||
            files['src/App.jsx'] || files['src/App.tsx'] ||
            pkg.includes('"react"')
        ) return 'react';
        return 'static';
    }

    generateLocalPreview(files = {}, projectType = this.getProjectType(files)) {
        // Only route true React/Next sources through the Babel/UMD preview.
        // Plain static script.js with ESM imports must stay on the DOM path.
        if (projectType === 'react' || this._hasReactFiles(files)) {
            return this._buildReactInBrowserPreview(files);
        }
        if (projectType === 'nextjs') {
            if (files['app/page.tsx'] || files['app/page.jsx'] || files['pages/index.js'] || files['pages/index.tsx']) {
                return this._buildReactInBrowserPreview(files);
            }
            return this._frameworkMessage(
                'Next.js Full-Stack Project',
                'This full-stack project is configured for your local workspace. Export to Local Workspace to run `npm run dev` with full API routes & Prisma DB.'
            );
        }

        let html = String(files['index.html'] || '<!doctype html><html><body><h1>No content generated</h1></body></html>');
        const css = String(files['styles.css'] || '');
        const js = String(files['script.js'] || '');
        const threeJs = String(files['three-scene.js'] || '');
        return this._buildDOMPreview(html, { ...files, 'styles.css': css, 'script.js': js, 'three-scene.js': threeJs });
    }

    _hasReactFiles(files = {}) {
        const names = Object.keys(files || {});
        // Explicit React/Next entrypoints only — do NOT treat vanilla ESM
        // (export default / import gsap) as a React project.
        if (names.some((f) => f.endsWith('.jsx') || f.endsWith('.tsx'))) return true;
        if (names.some((f) => /^(src\/)?(main|App|index)\.(jsx|tsx)$/i.test(f))) return true;
        if (names.some((f) => /^(app|src\/app)\/.*\.(jsx|tsx)$/i.test(f))) return true;
        if (files['package.json'] && /"react"\s*:/.test(String(files['package.json']))) {
            return names.some((f) =>
                /\.(jsx|tsx)$/.test(f) ||
                /^(src\/)?(main|App)\.(js|jsx|tsx)$/i.test(f) ||
                /^app\/.*page\.(js|jsx|tsx)$/i.test(f)
            );
        }
        return false;
    }

    /* ---------- React / Next in-browser preview ---------- */
    _buildReactInBrowserPreview(files) {
        let jsxCode = '';

        // Collect & sanitize every component file
        Object.keys(files).forEach(filename => {
            if (
                (filename.endsWith('.jsx') || filename.endsWith('.tsx') || filename.endsWith('.js')) &&
                !filename.includes('vite.config') &&
                !filename.includes('tailwind.config') &&
                !filename.includes('next.config')
            ) {
                let code = String(files[filename] || '');

                // Next.js layout → valid React tree
                if (filename.includes('layout.')) {
                    code = code
                        .replace(/<html[^>]*>/gi, '<div className="next-layout-shell">')
                        .replace(/<\/html>/gi, '</div>')
                        .replace(/<body[^>]*>/gi, '<div className="next-body-shell">')
                        .replace(/<\/body>/gi, '</div>');
                }

                // Clean import/export statements for in-browser concatenation
                code = this._sanitizeForBrowser(code);
                jsxCode += `\n/* ===== File: ${filename} ===== */\n${code}\n`;
            }
        });

        // Detect main component name
        let mainComponentName = 'App';
        if (!/function\s+App\b|const\s+App\b|class\s+App\b/.test(jsxCode)) {
            const match = jsxCode.match(/function\s+([A-Z][A-Za-z0-9_]*)/);
            if (match) mainComponentName = match[1];
        }

        const customCss = files['src/index.css'] || files['src/App.css'] || files['styles.css'] || files['app/globals.css'] || '';

        const rawAppCode = `
const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext, Fragment } = React;

// ---- Next.js mock helpers ----
const useRouter = () => ({
    push: (url) => console.log('[mock] router.push', url),
    replace: (url) => console.log('[mock] router.replace', url),
    back: () => {},
    prefetch: () => {},
    pathname: '/',
    query: {},
    asPath: '/'
});
const usePathname = () => '/';
const useSearchParams = () => new URLSearchParams();
const useParams = () => ({});
const Link = ({ href = '#', children, ...props }) =>
    React.createElement('a', { href, ...props }, children);
const Image = ({ src, alt = '', width, height, ...props }) =>
    React.createElement('img', { src, alt, width, height, ...props });

// ---- Lucide helper ----
const Icon = ({ name, className = 'w-5 h-5', ...props }) =>
    React.createElement('i', { 'data-lucide': name, className, ...props });

${jsxCode}

// ---- Error Boundary ----
class PreviewErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('Preview ErrorBoundary:', error, info);
        window.parent.postMessage({
            type: 'ZERO_PREVIEW_ERROR',
            message: error?.message || String(error),
            stack: error?.stack
        }, '*');
    }
    render() {
        if (this.state.hasError) {
            return React.createElement('div', {
                className: 'p-6 m-4 bg-red-950/90 border border-red-700 text-red-100 rounded-xl'
            },
                React.createElement('h3', { className: 'font-bold text-lg mb-2' }, 'Runtime Error'),
                React.createElement('pre', { className: 'font-mono text-sm whitespace-pre-wrap' },
                    this.state.error?.message || String(this.state.error)
                )
            );
        }
        return this.props.children;
    }
}

// ---- Mount ----
try {
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error('Root element #root not found');

    let ComponentToRender =
        (typeof App !== 'undefined' && App) ||
        (typeof Page !== 'undefined' && Page) ||
        (typeof Home !== 'undefined' && Home) ||
        (typeof RootLayout !== 'undefined' && RootLayout) ||
        (typeof ${mainComponentName} !== 'undefined' && ${mainComponentName}) ||
        null;

    if (!ComponentToRender) {
        rootElement.innerHTML = '<div class="p-8 text-center text-zinc-400"><h2 class="text-xl font-bold mb-2">No root component found</h2><p>Export a default App / Page / Home component.</p></div>';
    } else {
        const root = ReactDOM.createRoot(rootElement);
        const isLayout = ComponentToRender === (typeof RootLayout !== 'undefined' ? RootLayout : null);

        const content = isLayout
            ? React.createElement(ComponentToRender, null,
                React.createElement(
                    (typeof Page !== 'undefined' ? Page : (typeof App !== 'undefined' ? App : () => React.createElement('div', { className: 'p-4' }, 'App Active')))
                )
              )
            : React.createElement(ComponentToRender);

        root.render(
            React.createElement(PreviewErrorBoundary, null, content)
        );

        // Lucide icons after paint
        setTimeout(() => {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        }, 80);
    }
} catch (err) {
    const el = document.getElementById('root');
    if (el) {
        el.innerHTML = '<div class="p-6 bg-red-950/90 border border-red-700 text-red-100 rounded-xl m-4"><h3 class="font-bold text-lg mb-2">React Compilation / Mount Error</h3><pre class="font-mono text-sm whitespace-pre-wrap">' +
            (err.message || String(err)) + '</pre></div>';
    }
    window.parent.postMessage({ type: 'ZERO_PREVIEW_ERROR', message: err.message || String(err) }, '*');
}
`;

        const safeRawCodeJson = JSON.stringify(rawAppCode).replace(/<\/script/gi, '<\\/script');

        // Build the Babel transform script as a regular string (not template literal)
        // to avoid backslash escaping issues with regex patterns.
        const babelScript = this._buildBabelTransformScript(safeRawCodeJson);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Live Preview</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              border: "rgba(255,255,255,0.1)",
              input: "rgba(255,255,255,0.15)",
              ring: "#8b5cf6",
              background: "#09090b",
              foreground: "#fafafa",
              primary: { DEFAULT: "#7c3aed", foreground: "#ffffff" },
              secondary: { DEFAULT: "#27272a", foreground: "#fafafa" },
              muted: { DEFAULT: "#27272a", foreground: "#a1a1aa" },
              accent: { DEFAULT: "#3f3f46", foreground: "#fafafa" },
            }
          }
        }
      }
    <\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"><\/script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 0; }
        ${customCss}
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        // Quiet noisy CDN warnings
        ['warn', 'info'].forEach(method => {
            const orig = console[method];
            if (!orig) return;
            console[method] = function (...args) {
                const msg = args.map(a => (typeof a === 'string' ? a : (a?.message || ''))).join(' ');
                if (/tailwindcss|Babel|production|PostCSS|cdn\\.tailwindcss/i.test(msg)) return;
                orig.apply(console, args);
            };
        });

        window.addEventListener('error', function (e) {
            if (!e.message || e.message === 'Script error.') return;
            window.parent.postMessage({
                type: 'ZERO_PREVIEW_ERROR',
                message: e.message,
                filename: e.filename,
                lineno: e.lineno
            }, '*');
        });
        window.addEventListener('unhandledrejection', function (e) {
            window.parent.postMessage({
                type: 'ZERO_PREVIEW_ERROR',
                message: e.reason?.message || String(e.reason)
            }, '*');
        });
    <\/script>
    ` + babelScript + `
</body>
</html>`;
    }

    /**
     * Build the Babel transform + cleanup script as a plain string.
     * This avoids template-literal backslash escaping issues with regex patterns.
     */
    _buildBabelTransformScript(safeRawCodeJson) {
        // ESM stripper function (runs in browser iframe)
        const stripEsmFn = [
            'function zeroStripEsm(code) {',
            '  var src = String(code || "");',
            '  for (var i = 0; i < 8; i++) {',
            '    var next = src',
            '      .replace(/^\\s*import\\s+type\\s+[\\s\\S]*?from\\s*[\'"][^\'"]+[\'"]\\s*;?/gm, "")',
            '      .replace(/^\\s*import\\s*[\\s\\S]*?from\\s*[\'"][^\'"]+[\'"]\\s*;?/gm, "")',
            '      .replace(/^\\s*import\\s*[\'"][^\'"]+[\'"]\\s*;?/gm, "")',
            '      .replace(/^\\s*export\\s+\\{[\\s\\S]*?\\}\\s*;?/gm, "")',
            '      .replace(/^\\s*export\\s+\\*\\s+from\\s*[\'"][^\'"]+[\'"]\\s*;?/gm, "");',
            '    if (next === src) break;',
            '    src = next;',
            '  }',
            '  src = src.replace(/(^|[\\n;])\\s*import\\s+[^;]*;?/g, "$1");',
            '  return src;',
            '}',
        ].join('\n');

        // Babel transform + require replacement + ESM stripping
        const transformFn = [
            '(function () {',
            '  var rawCode = ' + safeRawCodeJson + ';',
            '  try {',
            '    var transpiled = Babel.transform(rawCode, {',
            '      presets: [',
            '        ["react", { runtime: "classic" }],',
            '        ["typescript", { ignoreExtensions: true }]',
            '      ],',
            '      plugins: [',
            '        ["transform-modules-commonjs", { strictMode: false }]',
            '      ],',
            '      filename: "preview.tsx"',
            '    }).code;',
            '',
            '    var clean = zeroStripEsm(transpiled)',
            '      .replace(/require\\([\'"]react\\/jsx-runtime[\'"]\\)/g, "({ jsx: React.createElement, jsxs: React.createElement, Fragment: React.Fragment })")',
            '      .replace(/require\\([\'"]react[\'"]\\)/g, "React")',
            '      .replace(/require\\([\'"]react-dom(?:\\/client)?[\'"]\\)/g, "ReactDOM")',
            '      .replace(/require\\([\'"]three[\'"]\\)/g, "(typeof THREE !== \\"undefined\\" ? THREE : {})")',
            '      .replace(/require\\([\'"][^\'"]+[\'"]\\)/g, "({})");',
            '',
            '    if (/\\bimport\\s+/.test(clean)) {',
            '      throw new Error("Preview still contains ESM import statements after sanitization.");',
            '    }',
            '',
            '    var scriptEl = document.createElement("script");',
            '    scriptEl.type = "text/javascript";',
            '    scriptEl.text = clean;',
            '    document.body.appendChild(scriptEl);',
            '  } catch (err) {',
            '    document.getElementById("root").innerHTML =',
            '      \'<div class="p-6 bg-red-950/90 border border-red-700 text-red-100 rounded-xl m-4">\' +',
            '      \'<h3 class="font-bold text-lg mb-2">Babel Compilation Error</h3>\' +',
            '      \'<pre class="font-mono text-sm whitespace-pre-wrap">\' + (err.message || String(err)) + \'</pre></div>\';',
            '    window.parent.postMessage({ type: "ZERO_PREVIEW_ERROR", message: err.message || String(err) }, "*");',
            '  }',
            '})();',
        ].join('\n');

        return '<script>\n' + stripEsmFn + '\n' + transformFn + '\n<\/script>';
    }

    /* ---------- Clean import/export statements for in-browser concatenation ---------- */
    _sanitizeForBrowser(code) {
        let src = String(code || '');

        // Map known library imports to their browser globals BEFORE stripping ESM
        // Three.js
        src = src.replace(/import\s+(\w+)\s+from\s*['"]three[^'"]*['"]\s*;?/g, 'const $1 = window.THREE;');
        src = src.replace(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]three[^'"]*['"]\s*;?/g, 'const $1 = window.THREE;');
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]three[^'"]*['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const [orig, alias] = n.split(/\s+as\s+/).map(s => s.trim());
                const local = alias || orig;
                return `const ${local} = typeof THREE !== 'undefined' ? THREE.${orig} : undefined;`;
            }).filter(Boolean).join('\n');
        });
        // @react-three/fiber & @react-three/drei → mock/noop (not available in UMD preview)
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@react-three\/(?:fiber|drei|postprocessing)['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const [orig, alias] = n.split(/\s+as\s+/).map(s => s.trim());
                const local = alias || orig;
                return `const ${local} = typeof ${orig} !== 'undefined' ? ${orig} : function(){return null;};`;
            }).filter(Boolean).join('\n');
        });
        // GSAP
        src = src.replace(/import\s+(\w+)\s+from\s*['"]gsap(?:\/dist\/gsap)?['"]\s*;?/g, 'const $1 = window.gsap;');
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]gsap(?:\/[^'"]*)?['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const [orig, alias] = n.split(/\s+as\s+/).map(s => s.trim());
                const local = alias || orig;
                if (orig === 'gsap' || orig === 'default') return `const ${local} = window.gsap;`;
                return `const ${local} = window.gsap?.${orig} || window.${orig};`;
            }).filter(Boolean).join('\n');
        });
        // Lenis
        src = src.replace(/import\s+(\w+)\s+from\s*['"][^'"]*lenis[^'"]*['"]\s*;?/g, 'const $1 = window.Lenis;');
        // framer-motion → mock
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]framer-motion['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const name = n.split(/\s+as\s+/).map(s => s.trim()).pop();
                if (/^motion$/.test(name)) return `const motion = new Proxy({}, { get: (_, tag) => (props) => React.createElement(tag, props) });`;
                if (/^AnimatePresence$/.test(name)) return `const AnimatePresence = ({children}) => React.createElement(React.Fragment, null, children);`;
                return `const ${name} = typeof ${name} !== 'undefined' ? ${name} : function(){return null;};`;
            }).filter(Boolean).join('\n');
        });
        // lucide-react → map to Icon helper
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const name = n.split(/\s+as\s+/).map(s => s.trim()).pop();
                const iconName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
                return `const ${name} = (props) => React.createElement('i', Object.assign({ 'data-lucide': '${iconName}' }, props));`;
            }).filter(Boolean).join('\n');
        });

        // Now strip remaining ESM syntax
        src = this._stripEsmSyntax(src);

        return src
            // remove "use client" / "use server"
            .replace(/["']use client["'];?/g, '')
            .replace(/["']use server["'];?/g, '')
            // default export → plain function / class
            .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1')
            .replace(/export\s+default\s+function\s*(?=\()/g, 'function DefaultApp')
            .replace(/export\s+default\s+class\s+([A-Za-z0-9_]+)/g, 'class $1')
            .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, 'var App = typeof $1 !== "undefined" ? $1 : App;')
            // named exports
            .replace(/export\s+(const|let|var|function|class|type|interface|enum)\s+/g, '$1 ')
            // Next.js metadata
            .replace(/export\s+const\s+metadata[\s\S]*?=[\s\S]*?;/g, '')
            .replace(/export\s+const\s+generateMetadata[\s\S]*?=[\s\S]*?;/g, '')
            // TypeScript non-null assertions & definite assignment
            .replace(/([a-zA-Z0-9_\)\]])!\./g, '$1.')
            .replace(/\(null!\)/g, '(null)')
            .replace(/!\s*([,;\)\]\n])/g, '$1')
            // framer-motion / gsap ease leftovers that sometimes appear
            .replace(/case:\s*(['"](?:none|power\d\.(?:in|out|inOut)|linear|expo|circ)['"])/g, 'ease: $1')
            // remove remaining export keywords that survived
            .replace(/\bexport\s+\{[^}]*\}\s*;?/g, '')
            .replace(/\bexport\s+/g, '');
    }

    /**
     * Aggressively strip static ESM import/export syntax so code can run as a
     * classic script. Dynamic import() calls are left alone (valid in classic JS).
     */
    _stripEsmSyntax(code) {
        let src = String(code || '');

        // Normalize line endings
        src = src.replace(/\r\n/g, '\n');

        for (let pass = 0; pass < 10; pass++) {
            const before = src;
            // import type ... from 'x'
            src = src.replace(/^\s*import\s+type\s+[\s\S]*?from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            // import ... from 'x'  (multi-line, including `import Foo, { a } from "x"`)
            src = src.replace(/^\s*import\s*(?:[\w*\s{},$]+)\s*from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            // Multi-line brace imports: import {\n  a,\n  b\n} from 'x'
            src = src.replace(/^\s*import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            // Side-effect: import 'x'
            src = src.replace(/^\s*import\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            // export * from 'x' / export { a } from 'x'
            src = src.replace(/^\s*export\s+\*\s+from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            src = src.replace(/^\s*export\s+\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            if (src === before) break;
        }

        // Final safety net for any leftover static import statements
        src = src.replace(/(^|[\n;])\s*import\s+(?![\s\S]{0,20}\()[^;\n]*(?:;|\n)/g, '$1\n');

        return src;
    }

    /**
     * Rewrite common ESM CDN imports in static sites to global UMD usage and
     * return { code, cdnScripts } so the preview can inject the right <script src>.
     */
    _rewriteStaticModules(js) {
        const cdnScripts = [];
        const seen = new Set();
        const addCdn = (url) => {
            if (!url || seen.has(url)) return;
            seen.add(url);
            cdnScripts.push(url);
        };

        let code = String(js || '');

        const catalog = [
            {
                test: /from\s*['"](?:gsap|gsap\/dist\/gsap)['"]|from\s*['"]https?:\/\/[^'"]*gsap[^'"]*['"]/i,
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
            },
            {
                test: /ScrollTrigger|from\s*['"]gsap\/ScrollTrigger['"]/i,
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
            },
            {
                test: /from\s*['"](?:three|three\/build\/three)['"]|from\s*['"]https?:\/\/[^'"]*three[^'"]*['"]/i,
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            },
            {
                test: /from\s*['"]@studio-freight\/lenis['"]|from\s*['"]lenis['"]|from\s*['"]https?:\/\/[^'"]*lenis[^'"]*['"]/i,
                cdn: 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js',
            },
        ];

        catalog.forEach((entry) => {
            if (entry.test.test(code)) addCdn(entry.cdn);
        });

        // Map named ESM imports of known libs onto window globals before stripping.
        code = code
            .replace(/import\s+(\w+)\s+from\s*['"]gsap(?:\/dist\/gsap)?['"]\s*;?/g, 'const $1 = window.gsap;')
            .replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]gsap(?:\/dist\/gsap)?['"]\s*;?/g, (m, names) => {
                const parts = names.split(',').map((n) => n.trim()).filter(Boolean);
                return parts.map((n) => {
                    const [orig, alias] = n.split(/\s+as\s+/).map((s) => s.trim());
                    const local = alias || orig;
                    if (orig === 'gsap' || orig === 'default') return `const ${local} = window.gsap;`;
                    return `const ${local} = window.gsap?.${orig} || window.${orig};`;
                }).join('\n');
            })
            .replace(/import\s*\{\s*ScrollTrigger\s*\}\s*from\s*['"][^'"]*ScrollTrigger[^'"]*['"]\s*;?/g, 'const ScrollTrigger = window.ScrollTrigger;')
            .replace(/import\s+(\w+)\s+from\s*['"]three[^'"]*['"]\s*;?/g, 'const $1 = window.THREE;')
            .replace(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]three[^'"]*['"]\s*;?/g, 'const $1 = window.THREE;')
            .replace(/import\s+(\w+)\s+from\s*['"][^'"]*lenis[^'"]*['"]\s*;?/g, 'const $1 = window.Lenis;');

        // Generic https ESM imports → try to keep as classic globals if possible, else strip
        code = code.replace(
            /import\s+(\w+)\s+from\s*['"](https?:\/\/[^'"]+)['"]\s*;?/g,
            (match, name, url) => {
                addCdn(url);
                return `/* ESM import of ${name} inlined via CDN ${url} */\nconst ${name} = window.${name} || window.gsap || window.THREE || window.Lenis;`;
            }
        );

        code = this._stripEsmSyntax(code);
        // Drop export keywords in static scripts
        code = code
            .replace(/export\s+default\s+/g, '')
            .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
            .replace(/export\s+\{[^}]*\}\s*;?/g, '')
            .replace(/\bexport\s+/g, '');

        return { code, cdnScripts };
    }

    /* ---------- Static DOM preview ---------- */
    _buildDOMPreview(html, files) {
        const parser = new DOMParser();
        const safeHtml = this._ensureDocumentShell(html);
        const doc = parser.parseFromString(safeHtml, 'text/html');

        this._inlineLinkedStyles(doc, files);
        this._inlineLinkedScripts(doc, files);
        this._inlineAssets(doc, files);
        this._patchCssUrls(doc, files);
        this._demoteModuleScripts(doc);

        if (!doc.querySelector('script[src*="tailwindcss"]')) {
            const s = doc.createElement('script');
            s.src = 'https://cdn.tailwindcss.com';
            doc.head.prepend(s);
        }
        if (!doc.querySelector('script[src*="lucide"]')) {
            const s = doc.createElement('script');
            s.src = 'https://unpkg.com/lucide@latest';
            doc.head.appendChild(s);
        }

        // Collect CDN deps from every local script before inlining.
        const pendingCdns = [];
        const collectAndRewrite = (sourceName) => {
            if (!files[sourceName]) return null;
            const rewritten = this._rewriteStaticModules(files[sourceName]);
            pendingCdns.push(...(rewritten.cdnScripts || []));
            return rewritten.code;
        };

        const threeCode = collectAndRewrite('three-scene.js');
        const scriptCode = collectAndRewrite('script.js');

        // Also scan already-inlined local scripts for remaining ESM + CDN needs
        doc.querySelectorAll('script:not([src])').forEach((node) => {
            const raw = node.textContent || '';
            if (!/\bimport\s+|from\s+['"]gsap|from\s+['"]three|ScrollTrigger|lenis/i.test(raw)) return;
            const rewritten = this._rewriteStaticModules(raw);
            pendingCdns.push(...(rewritten.cdnScripts || []));
            node.textContent = rewritten.code;
            node.removeAttribute('type'); // classic script after rewrite
        });

        // Inject required UMD CDNs (GSAP, Three, Lenis, …) once
        Array.from(new Set(pendingCdns)).forEach((url) => {
            if (doc.querySelector(`script[src="${url}"]`)) return;
            const s = doc.createElement('script');
            s.src = url;
            s.dataset.zeroCdn = '1';
            doc.head.appendChild(s);
        });

        const errorScript = doc.createElement('script');
        errorScript.textContent = `
            window.addEventListener('error', function(e) {
                if (!e.message || e.message === 'Script error.') return;
                window.parent.postMessage({ type: 'ZERO_PREVIEW_ERROR', message: e.message, filename: e.filename, lineno: e.lineno }, '*');
            });
            document.addEventListener('DOMContentLoaded', function() {
                if (window.lucide) lucide.createIcons();
            });
        `;
        doc.head.appendChild(errorScript);

        if (files['styles.css'] && !doc.querySelector('style[data-zero-source="styles.css"]')) {
            this._appendStyle(doc, files['styles.css'], 'styles.css', files);
        }
        if (threeCode && !doc.querySelector('script[data-zero-source="three-scene.js"]')) {
            this._appendScript(doc, threeCode, 'three-scene.js');
        }
        if (scriptCode && !doc.querySelector('script[data-zero-source="script.js"]')) {
            this._appendScript(doc, scriptCode, 'script.js');
        }

        if (!doc.querySelector('meta[name="viewport"]')) {
            const meta = doc.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width,initial-scale=1';
            doc.head.prepend(meta);
        }
        if (!doc.querySelector('meta[charset]')) {
            const meta = doc.createElement('meta');
            meta.setAttribute('charset', 'utf-8');
            doc.head.prepend(meta);
        }

        return `<!doctype html>\n${doc.documentElement.outerHTML}`;
    }

    /** Convert type=module inline scripts that we can classic-ify; drop bare module src we cannot resolve. */
    _demoteModuleScripts(doc) {
        doc.querySelectorAll('script[type="module"]').forEach((script) => {
            const src = script.getAttribute('src');
            // External module CDNs often fail in srcdoc — prefer leaving local inlined code only.
            if (src && /^(https?:)?\/\//i.test(src)) {
                // Keep skypack/esm.sh out of classic path; remove to avoid the import error spam.
                if (/skypack|esm\.sh|jspm\.dev|unpkg\.com\/\+esm/i.test(src)) {
                    script.remove();
                }
                return;
            }
            if (!src) {
                // Inline module: strip ESM and run as classic after rewrite later.
                script.removeAttribute('type');
            }
        });
    }

    _ensureDocumentShell(html) {
        const source = String(html || '').trim();
        if (/<html[\s>]/i.test(source)) return source;
        if (/<body[\s>]/i.test(source) || /<head[\s>]/i.test(source)) {
            return `<!doctype html><html>${source}</html>`;
        }
        return `<!doctype html><html><head></head><body>${source}</body></html>`;
    }

    _inlineLinkedStyles(doc, files) {
        doc.querySelectorAll('link[rel~="stylesheet"][href]').forEach(link => {
            const path = this._resolvePath(link.getAttribute('href'));
            const source = files[path];
            if (!source || this._isDataUrl(source)) return;
            const style = this._createStyle(doc, source, path, files);
            link.replaceWith(style);
        });
    }

    _inlineLinkedScripts(doc, files) {
        doc.querySelectorAll('script[src]').forEach(script => {
            const path = this._resolvePath(script.getAttribute('src'));
            const source = files[path];
            if (!source || this._isDataUrl(source)) return;
            // Always classic-ify local project scripts — ESM imports break srcdoc previews.
            const rewritten = this._rewriteStaticModules(source);
            const replacement = this._createScript(doc, rewritten.code, path);
            // Inject any CDN deps discovered on this file next to the script
            (rewritten.cdnScripts || []).forEach((url) => {
                if (doc.querySelector(`script[src="${url}"]`)) return;
                const cdn = doc.createElement('script');
                cdn.src = url;
                cdn.dataset.zeroCdn = '1';
                script.parentNode?.insertBefore(cdn, script);
            });
            script.replaceWith(replacement);
        });
    }

    _inlineAssets(doc, files) {
        const attrs = [
            ['img', 'src'], ['source', 'src'], ['video', 'src'], ['video', 'poster'],
            ['audio', 'src'], ['link[rel~="icon"]', 'href']
        ];
        attrs.forEach(([selector, attr]) => {
            doc.querySelectorAll(`${selector}[${attr}]`).forEach(node => {
                const path = this._resolvePath(node.getAttribute(attr));
                if (files[path] && this._isDataUrl(files[path])) {
                    node.setAttribute(attr, files[path]);
                }
            });
        });
    }

    _patchCssUrls(doc, files) {
        doc.querySelectorAll('style').forEach(style => {
            style.textContent = this._replaceCssUrls(style.textContent, files);
        });
    }

    _replaceCssUrls(css, files) {
        return String(css || '').replace(/url\((['"]?)([^'")\s]+)\1\)/g, (match, quote, rawPath) => {
            const path = this._resolvePath(rawPath);
            if (files[path] && this._isDataUrl(files[path])) return `url("${files[path]}")`;
            return match;
        });
    }

    _appendStyle(doc, css, source, files) {
        doc.head.appendChild(this._createStyle(doc, css, source, files));
    }

    _appendScript(doc, js, source) {
        doc.body.appendChild(this._createScript(doc, js, source));
    }

    _createStyle(doc, css, source, files = {}) {
        const style = doc.createElement('style');
        style.dataset.zeroSource = source;
        style.textContent = this._replaceCssUrls(css, files);
        return style;
    }

    _createScript(doc, js, source) {
        const script = doc.createElement('script');
        script.dataset.zeroSource = source;
        // Final pass: never leave static import/export in classic scripts.
        let cleanJs = this._stripEsmSyntax(js);
        cleanJs = cleanJs
            .replace(/export\s+default\s+/g, '')
            .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
            .replace(/export\s+\{[^}]*\}\s*;?/g, '')
            .replace(/\bexport\s+/g, '');
        // Nuke any remaining static import statements entirely (do not leave bare tokens).
        cleanJs = cleanJs.replace(/^\s*import\s+(?![\s\S]{0,40}\()[\s\S]*?(?:;|$)/gm, '/* zero-preview: stripped import */\n');
        // Last-resort: blank any line that still starts with import (static only).
        cleanJs = cleanJs.split('\n').map((line) => {
            if (/^\s*import\s+/.test(line) && !/import\s*\(/.test(line)) {
                return '/* zero-preview: stripped import line */';
            }
            return line;
        }).join('\n');
        script.type = 'text/javascript';
        script.textContent = cleanJs;
        return script;
    }

    _resolvePath(path) {
        if (!path || /^(?:https?:|data:|blob:|#)/i.test(path)) return path || '';
        return String(path).split('#')[0].split('?')[0].replace(/\\/g, '/').replace(/^\.?\//, '');
    }

    _isDataUrl(value) {
        return /^data:/i.test(String(value || ''));
    }

    _frameworkMessage(title, message) {
        return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090f;color:#f7f7fb;font-family:Inter,system-ui,sans-serif}.card{max-width:540px;margin:24px;padding:32px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:linear-gradient(145deg,#171725,#0d0d15);box-shadow:0 20px 60px rgba(0,0,0,.35)}.eyebrow{color:#7dd3fc;font:600 12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}.title{margin:12px 0;font-size:28px;letter-spacing:-.04em}.copy{color:#b5b5c9;line-height:1.65}.hint{margin-top:20px;padding:12px;border-radius:10px;background:rgba(125,211,252,.08);color:#d9f5ff;font-size:14px}</style></head><body><main class="card"><div class="eyebrow">Local device workspace</div><h1 class="title">${title}</h1><p class="copy">${message}</p><p class="hint">Static projects preview instantly in this panel.</p></main></body></html>`;
    }
}

window.SandboxManager = SandboxManager;

;
/* ============================================================
   PROJECT INTAKE - ZIP import, filtering, and project analysis
   ============================================================ */

class ProjectIntakeManager {
    constructor() {
        // Import can be large; Project Brain sends only relevant slices to agents.
        this.maxTextFileBytes = 2 * 1024 * 1024;
        this.maxAssetBytes = 8 * 1024 * 1024;
        this.maxTotalBytes = 45 * 1024 * 1024;
        this.maxFiles = 1200;
        this.textExtensions = new Set([
            'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'md', 'txt',
            'svg', 'xml', 'yml', 'yaml', 'toml', 'prisma', 'env.example',
            'mjs', 'cjs', 'config', 'gitignore'
        ]);
        this.assetExtensions = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'ico', 'avif', 'mp4', 'webm']);
        this.ignoredParts = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.turbo', '.cache']);
    }

    async importZip(file) {
        if (typeof JSZip === 'undefined') throw new Error('JSZip not loaded. Check internet or install offline assets.');
        if (!file || !/\.zip$/i.test(file.name)) throw new Error('Please choose a .zip file.');

        const zip = await JSZip.loadAsync(file);
        const entries = Object.values(zip.files).filter(entry => !entry.dir);
        let files = {};
        const skipped = [];
        let totalBytes = 0;

        for (const entry of entries) {
            const cleanPath = this._cleanPath(entry.name);
            if (!cleanPath || this._shouldIgnore(cleanPath)) {
                skipped.push({ path: entry.name, reason: 'ignored folder or unsafe path' });
                continue;
            }

            const ext = this._extension(cleanPath);
            const binary = await entry.async('uint8array');
            const bytes = binary.byteLength;

            if (Object.keys(files).length >= this.maxFiles) {
                skipped.push({ path: cleanPath, reason: `file limit ${this.maxFiles} reached` });
                continue;
            }
            if (totalBytes + bytes > this.maxTotalBytes) {
                skipped.push({ path: cleanPath, reason: `workspace limit ${this._formatBytes(this.maxTotalBytes)} reached` });
                continue;
            }

            if (this._isTextPath(cleanPath, ext)) {
                if (bytes > this.maxTextFileBytes) {
                    skipped.push({ path: cleanPath, reason: `large text file over ${this._formatBytes(this.maxTextFileBytes)}` });
                    continue;
                }
                files[cleanPath] = new TextDecoder('utf-8').decode(binary);
                totalBytes += bytes;
                continue;
            }

            if (this.assetExtensions.has(ext)) {
                if (bytes > this.maxAssetBytes) {
                    skipped.push({ path: cleanPath, reason: `large asset over ${this._formatBytes(this.maxAssetBytes)}` });
                    continue;
                }
                files[cleanPath] = this._toDataUrl(ext, binary);
                totalBytes += files[cleanPath].length;
                continue;
            }

            skipped.push({ path: cleanPath, reason: 'unsupported binary file' });
        }

        files = this._stripCommonRoot(files);
        const analysis = this.analyze(files, skipped, file.name, totalBytes);
        return { files, analysis, skipped };
    }

    analyze(files = {}, skipped = [], sourceName = 'project.zip', totalBytes = null) {
        const names = Object.keys(files);
        const pkg = this._parsePackage(files['package.json']);
        const hasNext = names.some(name => /^app\/.+\/page\.(tsx|jsx|js)$/.test(name) || /^pages\/.+\.(tsx|jsx|js)$/.test(name)) || !!pkg.dependencies?.next || !!pkg.devDependencies?.next;
        const hasReact = hasNext || names.some(name => /^src\/main\.(jsx|tsx)$/.test(name) || /^src\/App\.(jsx|tsx)$/.test(name)) || !!pkg.dependencies?.react || !!pkg.devDependencies?.react;
        const hasStatic = names.some(name => /(^|\/)index\.html$/i.test(name));
        const framework = hasNext ? 'nextjs' : hasReact ? 'react' : hasStatic ? 'static' : 'unknown';
        const pages = names.filter(name => /(^|\/)(index|page)\.(html|jsx|tsx|js)$/i.test(name) || /^app\/.+\/page\.(tsx|jsx|js)$/i.test(name));
        const styles = names.filter(name => /\.(css|scss|sass)$/i.test(name));
        const scripts = names.filter(name => /\.(js|jsx|ts|tsx)$/i.test(name));
        const assets = names.filter(name => this.assetExtensions.has(this._extension(name)));
        const size = totalBytes ?? Object.values(files).reduce((sum, value) => sum + new Blob([value]).size, 0);

        return {
            sourceName,
            framework,
            fileCount: names.length,
            skippedCount: skipped.length,
            size,
            pages: pages.slice(0, 20),
            styles: styles.slice(0, 20),
            scripts: scripts.slice(0, 20),
            assets: assets.slice(0, 20),
            dependencies: Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }).slice(0, 40),
            warnings: this._warnings(files, skipped, size, framework)
        };
    }

    _warnings(files, skipped, size, framework) {
        const warnings = [];
        const joined = Object.entries(files).map(([path, content]) => `${path}\n${content}`).join('\n');
        if (skipped.length) warnings.push(`${skipped.length} heavy or unsupported file(s) skipped.`);
        if (size > 4 * 1024 * 1024) warnings.push('Large workspace: browser auto-save may be limited. Export to Local Workspace after import.');
        if (framework !== 'static') warnings.push('Framework project detected: preview shows a handoff until dependencies are installed locally.');
        if (/\b(API_KEY|SECRET|PRIVATE_KEY|PASSWORD|TOKEN)\s*=/i.test(joined)) warnings.push('Possible secret-like values detected. Move secrets to server-side .env before deploy.');
        if (!files['package.json'] && framework !== 'static') warnings.push('No package.json found for a framework-style project.');
        return warnings;
    }

    _cleanPath(path) {
        return String(path || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter(Boolean).join('/');
    }

    _shouldIgnore(path) {
        if (!path || path.includes('..')) return true;
        return path.split('/').some(part => this.ignoredParts.has(part));
    }

    _stripCommonRoot(files) {
        const names = Object.keys(files);
        if (names.length < 2) return files;
        const firstParts = names[0].split('/');
        if (firstParts.length < 2) return files;
        const root = firstParts[0];
        if (!names.every(name => name.startsWith(`${root}/`))) return files;
        const stripped = {};
        for (const [name, content] of Object.entries(files)) {
            stripped[name.slice(root.length + 1)] = content;
        }
        return stripped;
    }

    _extension(path) {
        const base = path.split('/').pop() || '';
        if (base === '.gitignore') return 'gitignore';
        if (base === '.env.example') return 'env.example';
        const match = base.match(/\.([^.]+)$/);
        return match ? match[1].toLowerCase() : '';
    }

    _isTextPath(path, ext) {
        const base = path.split('/').pop() || '';
        return this.textExtensions.has(ext) || /^Dockerfile$/i.test(base) || /^README/i.test(base) || /^LICENSE/i.test(base);
    }

    _parsePackage(source) {
        try { return source ? JSON.parse(source) : {}; } catch { return {}; }
    }

    _toDataUrl(ext, bytes) {
        const mime = {
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
            gif: 'image/gif', ico: 'image/x-icon', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm'
        }[ext] || 'application/octet-stream';
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        return `data:${mime};base64,${btoa(binary)}`;
    }

    _formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}

window.ProjectIntakeManager = ProjectIntakeManager;

;
/* ============================================================
   CODE EDITOR — CodeMirror 5 integration with multi-file
   tabs, syntax highlighting, and live preview sync
   ============================================================ */

class CodeEditor {
    constructor(containerEl, tabsEl) {
        this.container = containerEl;
        this.tabsContainer = tabsEl;
        this.files = {};
        this.activeFile = null;
        this.editor = null;
        this.onChangeCallback = null;
        this._init();
    }

    _init() {
        if (typeof CodeMirror === 'undefined') {
            console.warn('CodeMirror CDN unavailable — using native textarea fallback');
            const textarea = document.createElement('textarea');
            textarea.className = 'fallback-editor-textarea';
            textarea.style.cssText = 'width:100%; height:100%; background:#09090b; color:#f4f4f5; font-family:monospace; border:none; padding:16px; outline:none; resize:none; font-size:14px; line-height:1.6;';
            textarea.placeholder = '<!-- Enter a prompt to generate code -->';
            if (this.container) {
                this.container.innerHTML = '';
                this.container.appendChild(textarea);
            }
            this.editor = {
                getValue: () => textarea.value,
                setValue: (v) => { textarea.value = v; },
                setOption: () => {},
                getHistory: () => null,
                setHistory: () => {},
                clearHistory: () => {},
                refresh: () => {},
                getCursor: () => ({ line: 0, ch: 0 }),
                setCursor: () => {},
                getScrollInfo: () => ({ left: 0, top: 0 }),
                scrollTo: () => {},
                focus: () => textarea.focus(),
                on: (evt, fn) => {
                    if (evt === 'change') {
                        textarea.addEventListener('input', fn);
                    }
                }
            };
            let debounceTimer = null;
            this.editor.on('change', () => {
                if (this.activeFile && this.files[this.activeFile]) {
                    this.files[this.activeFile].content = this.editor.getValue();
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => this._triggerChange(), 500);
                }
            });
            return;
        }

        // Initialize CodeMirror
        this.editor = CodeMirror(this.container, {
            value: '<!-- Enter a prompt to generate code -->',
            mode: 'htmlmixed',
            theme: 'material-darker',
            lineNumbers: true,
            lineWrapping: false,
            autoCloseBrackets: true,
            autoCloseTags: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            indentWithTabs: false,
            styleActiveLine: true,
            scrollbarStyle: 'native',
            extraKeys: {
                'Ctrl-S': () => this._triggerChange(),
                'Cmd-S': () => this._triggerChange(),
                'Ctrl-/': 'toggleComment',
                'Cmd-/': 'toggleComment',
            },
        });

        // Debounced change handler
        let debounceTimer = null;
        this.editor.on('change', () => {
            if (this.activeFile && this.files[this.activeFile]) {
                this.files[this.activeFile].content = this.editor.getValue();
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => this._triggerChange(), 500);
            }
        });
    }

    /* ===== FILE MANAGEMENT ===== */
    setFiles(filesMap) {
        this.files = {};
        for (const [name, content] of Object.entries(filesMap)) {
            this.files[name] = {
                content: content,
                mode: this._getMode(name),
                history: null,
            };
        }
        this._renderTabs();
        // Open the first file
        const firstFile = Object.keys(this.files)[0];
        if (firstFile) this.openFile(firstFile);
    }

    openFile(filename) {
        if (!this.files[filename]) return;

        // Save current file's history
        if (this.activeFile && this.files[this.activeFile]) {
            this.files[this.activeFile].history = this.editor.getHistory();
        }

        this.activeFile = filename;
        const file = this.files[filename];

        // Set content and mode
        this.editor.setValue(file.content);
        this.editor.setOption('mode', file.mode);

        // Restore history if available
        if (file.history) {
            this.editor.setHistory(file.history);
        } else {
            this.editor.clearHistory();
        }

        this.editor.refresh();
        this._updateTabs();
    }

    getFile(filename) {
        return this.files[filename]?.content || '';
    }

    getAllFiles() {
        const result = {};
        for (const [name, data] of Object.entries(this.files)) {
            result[name] = data.content;
        }
        return result;
    }

    addFile(filename, content = '') {
        this.files[filename] = {
            content,
            mode: this._getMode(filename),
            history: null,
        };
        this._renderTabs();
        this.openFile(filename);
    }

    removeFile(filename) {
        if (!this.files[filename]) return;
        delete this.files[filename];
        if (this.activeFile === filename) {
            const remaining = Object.keys(this.files);
            this.activeFile = remaining[0] || null;
            if (this.activeFile) this.openFile(this.activeFile);
        }
        this._renderTabs();
    }

    updateFile(filename, content) {
        if (this.files[filename]) {
            this.files[filename].content = content;
            if (this.activeFile === filename) {
                const cursor = this.editor.getCursor();
                const scroll = this.editor.getScrollInfo();
                this.editor.setValue(content);
                this.editor.setCursor(cursor);
                this.editor.scrollTo(scroll.left, scroll.top);
            }
        } else {
            this.addFile(filename, content);
        }
    }

    /* ===== TABS ===== */
    _renderTabs() {
        if (!this.tabsContainer) return;
        this.tabsContainer.innerHTML = '';

        for (const filename of Object.keys(this.files)) {
            const tab = document.createElement('div');
            tab.className = `tab ${filename === this.activeFile ? 'active' : ''}`;
            tab.dataset.file = filename;

            const icon = this._getFileIcon(filename);
            tab.innerHTML = `
                <i data-lucide="${icon}" class="tab-icon"></i>
                <span>${filename}</span>
            `;

            tab.addEventListener('click', () => this.openFile(filename));
            this.tabsContainer.appendChild(tab);
        }

        // Re-initialize lucide icons for new tabs
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    _updateTabs() {
        const tabs = this.tabsContainer?.querySelectorAll('.tab') || [];
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.file === this.activeFile);
        });
    }

    _getMode(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const modeMap = {
            'html': 'htmlmixed',
            'htm': 'htmlmixed',
            'css': 'css',
            'js': 'javascript',
            'json': 'application/json',
            'xml': 'xml',
            'svg': 'xml',
        };
        return modeMap[ext] || 'htmlmixed';
    }

    _getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'html': 'file-code',
            'htm': 'file-code',
            'css': 'palette',
            'js': 'file-json',
            'json': 'file-json',
            'svg': 'image',
            'png': 'image',
            'jpg': 'image',
        };
        return iconMap[ext] || 'file';
    }

    /* ===== CHANGE CALLBACK ===== */
    onChange(callback) {
        this.onChangeCallback = callback;
    }

    _triggerChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback(this.getAllFiles());
        }
    }

    /* ===== UTILITY ===== */
    refresh() {
        this.editor?.refresh();
    }

    getValue() {
        return this.editor?.getValue() || '';
    }

    setValue(val) {
        this.editor?.setValue(val);
    }

    focus() {
        this.editor?.focus();
    }
}

window.CodeEditor = CodeEditor;

;
/* ============================================================
   LIVE PREVIEW — Renders generated code in sandboxed iframe
   Supports local srcdoc preview and local-workspace handoff
   ============================================================ */

class PreviewEngine {
    constructor(iframeEl, emptyStateEl, sandboxManager) {
        this.iframe = iframeEl;
        this.emptyState = emptyStateEl;
        this.sandbox = sandboxManager;
        this.currentDevice = 'desktop';
        this.frameWrapper = iframeEl?.parentElement;
        this.previewErrors = [];
        this.onAudit = null;
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'ZERO_PREVIEW_ERROR' && event.data.message) {
                this.previewErrors.push({ message: event.data.message, timestamp: Date.now() });
            }
        });
    }

    /* ===== RENDER PREVIEW ===== */
    async render(files) {
        if (!files || Object.keys(files).length === 0) {
            this.showEmpty();
            return;
        }

        if (!this.iframe) {
            console.warn('PreviewEngine: iframe element is missing');
            return;
        }

        this.hideEmpty();
        this.previewErrors = [];

        // Fallback when SandboxManager failed to load — still show static HTML if present.
        if (!this.sandbox) {
            const html = String(files['index.html'] || '');
            const css = String(files['styles.css'] || '');
            const js = String(files['script.js'] || '');
            this.iframe.srcdoc = html
                ? html
                    .replace('</head>', css ? `<style>${css}</style></head>` : '</head>')
                    .replace('</body>', js ? `<script>${js}<\/script></body>` : '</body>')
                : '<!doctype html><html><body><h1>Preview unavailable</h1><p>Sandbox manager failed to load.</p></body></html>';
            return;
        }

        const projectType = this.sandbox.getProjectType(files);

        // Local-device preview: static output is rendered directly. Framework
        // projects receive a clear local-workspace handoff instead of a cloud sandbox.
        const fullHtml = this.sandbox.generateLocalPreview(files, projectType);
        this.iframe.srcdoc = fullHtml;
    }

    /* Browser-style interaction audit for generated previews. It never submits
       a form or follows a navigation; it safely exercises editable controls. */
    async runInteractionAudit() {
        await new Promise(resolve => setTimeout(resolve, 250));
        const report = { testedAt: Date.now(), controls: 0, forms: 0, exercisedInputs: 0, errors: [...this.previewErrors], issues: [], devices: [this.currentDevice] };
        try {
            const doc = this.iframe?.contentDocument;
            const view = this.iframe?.contentWindow;
            if (!doc || !view) throw new Error('Preview document is unavailable.');
            const controls = [...doc.querySelectorAll('button, a[href], input, select, textarea')];
            const forms = [...doc.querySelectorAll('form')];
            report.controls = controls.length;
            report.forms = forms.length;

            if (!doc.querySelector('h1')) report.issues.push({ severity: 'warning', type: 'semantic', message: 'No H1 found in preview.' });
            if (!doc.querySelector('main')) report.issues.push({ severity: 'warning', type: 'semantic', message: 'No main landmark found in preview.' });
            if (doc.documentElement.scrollWidth > view.innerWidth + 4) report.issues.push({ severity: 'warning', type: 'responsive', message: 'Horizontal overflow detected at current device width.' });
            if (!controls.length) report.issues.push({ severity: 'warning', type: 'interaction', message: 'No interactive controls found.' });

            forms.forEach((form, index) => {
                if (!form.querySelector('button[type="submit"], input[type="submit"]')) {
                    report.issues.push({ severity: 'warning', type: 'form', message: `Form ${index + 1} has no visible submit control.` });
                }
            });
            controls.filter(node => /^(INPUT|SELECT|TEXTAREA)$/.test(node.tagName)).slice(0, 8).forEach(node => {
                const oldValue = node.value;
                const name = node.getAttribute('name') || node.getAttribute('id');
                const labelled = name && ([...doc.querySelectorAll('label')].some(label => label.htmlFor === name) || node.getAttribute('aria-label') || node.getAttribute('aria-labelledby'));
                if (!labelled) report.issues.push({ severity: 'warning', type: 'accessibility', message: `Input "${name || node.type || 'unnamed'}" needs a label or aria-label.` });
                try {
                    node.focus();
                    if (!['checkbox', 'radio', 'file', 'submit'].includes(node.type)) {
                        node.value = 'ZERO audit';
                        node.dispatchEvent(new Event('input', { bubbles: true }));
                        node.dispatchEvent(new Event('change', { bubbles: true }));
                        node.value = oldValue;
                        report.exercisedInputs++;
                    }
                } catch (error) {
                    report.issues.push({ severity: 'warning', type: 'interaction', message: `Could not exercise an input: ${error.message}` });
                }
            });
        } catch (error) {
            report.issues.push({ severity: 'warning', type: 'browser', message: error.message });
        }
        if (report.errors.length) report.issues.push({ severity: 'critical', type: 'console', message: `${report.errors.length} preview runtime error(s) detected.` });
        report.score = Math.max(0, 100 - report.issues.reduce((sum, issue) => sum + (issue.severity === 'critical' ? 25 : 6), 0));
        this.lastAudit = report;
        this.onAudit?.(report);
        return report;
    }

    /* ===== DEVICE SWITCHING ===== */
    setDevice(device) {
        this.currentDevice = device;
        if (!this.frameWrapper) return;
        
        this.frameWrapper.classList.remove('tablet', 'mobile');
        if (device === 'tablet') {
            this.frameWrapper.classList.add('tablet');
        } else if (device === 'mobile') {
            this.frameWrapper.classList.add('mobile');
        }
    }

    /* ===== REFRESH ===== */
    refresh() {
        if (this.iframe.src && this.iframe.src !== 'about:blank') {
            this.iframe.src = this.iframe.src;
        } else if (this.iframe.srcdoc) {
            const doc = this.iframe.srcdoc;
            this.iframe.srcdoc = '';
            setTimeout(() => { this.iframe.srcdoc = doc; }, 50);
        }
    }

    /* ===== FULLSCREEN ===== */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.iframe.requestFullscreen?.() || this.iframe.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
    }

    /* ===== EMPTY STATE ===== */
    showEmpty() {
        if (this.emptyState) this.emptyState.classList.remove('hidden');
    }

    hideEmpty() {
        if (this.emptyState) this.emptyState.classList.add('hidden');
    }

    /* ===== SCREENSHOT ===== */
    async captureScreenshot() {
        // Note: This only works for same-origin iframes
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.iframe.clientWidth;
            canvas.height = this.iframe.clientHeight;
            // This won't work cross-origin, but good for local preview
            const img = new Image();
            img.src = this.iframe.src;
            ctx.drawImage(img, 0, 0);
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.warn('Screenshot capture not available for cross-origin frames');
            return null;
        }
    }
}

window.PreviewEngine = PreviewEngine;

;
/* ============================================================
VIRTUAL FILE SYSTEM — In-memory file management with
tree view, add/rename/delete, and version history
Upgraded: rename, duplicate, history, safer rendering,
directory grouping, events, and resilient size calculation
============================================================ */

class FileSystem {
    constructor(treeEl, options = {}) {
        this.treeContainer = treeEl;
        this.options = {
            maxHistory: 20,
            sortFoldersFirst: true,
            ...options,
        };

        // files[name] = { content, size, modified, history: [] }
    this.files = {};
    this.onFileSelect = null;
    this.onFilesChange = null;
    this.onFileRename = null;
    this.onFileDelete = null;
    this.onFileAdd = null;
    this.activeFile = null;
    this.suppressEvents = false;
}

/* =============================
   Public API
   ============================= */

setFiles(filesMap = {}) {
    this.files = {};
    for (const [name, content] of Object.entries(filesMap || {})) {
        this.files[name] = this._createFileRecord(content);
    }

    // Preserve active file if possible, otherwise select first file.
    if (!this.files[this.activeFile]) {
        this.activeFile = Object.keys(this.files)[0] || null;
    }

    this.render();
    this._emitFilesChange();
}

addFile(name, content = '', select = true) {
    const fileName = this._normalizePath(name);
    if (!fileName) return false;

    const exists = !!this.files[fileName];
    const record = this._createFileRecord(content);

    if (exists) {
        this._pushHistory(fileName, this.files[fileName].content);
    }

    this.files[fileName] = record;

    if (select) {
        this.activeFile = fileName;
        this._emitSelect(fileName);
    }

    this.render();
    this._emitFilesChange();
    if (this.onFileAdd) this.onFileAdd(fileName, record.content);

    return true;
}

deleteFile(name) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return false;

    const deleted = this.files[fileName];
    delete this.files[fileName];

    if (this.activeFile === fileName) {
        this.activeFile = Object.keys(this.files)[0] || null;
        if (this.activeFile) this._emitSelect(this.activeFile);
    }

    this.render();
    this._emitFilesChange();
    if (this.onFileDelete) this.onFileDelete(fileName, deleted.content);

    return true;
}

renameFile(oldName, newName) {
    const from = this._normalizePath(oldName);
    const to = this._normalizePath(newName);

    if (!from || !to || from === to || !this.files[from] || this.files[to]) return false;

    const record = this.files[from];
    delete this.files[from];
    this.files[to] = record;

    if (this.activeFile === from) this.activeFile = to;

    this.render();
    this._emitFilesChange();
    if (this.onFileRename) this.onFileRename(from, to);

    return true;
}

duplicateFile(name, newName = null) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return false;

    const base = this._basename(fileName);
    const ext = this._extension(fileName);
    const dupName = this._normalizePath(newName || this._nextDuplicateName(fileName, base, ext));

    if (!dupName || this.files[dupName]) return false;

    this.files[dupName] = this._createFileRecord(this.files[fileName].content);
    this.render();
    this._emitFilesChange();
    if (this.onFileAdd) this.onFileAdd(dupName, this.files[dupName].content);

    return dupName;
}

updateFile(name, content, { preserveHistory = true, silent = false } = {}) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return false;

    if (preserveHistory) {
        this._pushHistory(fileName, this.files[fileName].content);
    }

    this.files[fileName].content = String(content ?? '');
    this.files[fileName].size = this._measureSize(this.files[fileName].content);
    this.files[fileName].modified = Date.now();

    if (!silent) {
        this.render();
        this._emitFilesChange();
    }

    return true;
}

getFilesMap() {
    const result = {};
    for (const [name, data] of Object.entries(this.files)) {
        result[name] = data.content;
    }
    return result;
}

getActiveFile() {
    return this.activeFile && this.files[this.activeFile]
        ? { name: this.activeFile, ...this.files[this.activeFile] }
        : null;
}

setActiveFile(name) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return false;

    this.activeFile = fileName;
    this.render();
    this._emitSelect(fileName);
    return true;
}

getFile(name) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return null;
    return { name: fileName, ...this.files[fileName] };
}

getHistory(name) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return [];
    return [...(this.files[fileName].history || [])];
}

undo(name) {
    const fileName = this._normalizePath(name);
    const record = fileName ? this.files[fileName] : null;
    if (!record || !record.history || !record.history.length) return false;

    const prev = record.history.pop();
    record.content = prev.content;
    record.size = this._measureSize(record.content);
    record.modified = Date.now();

    this.render();
    this._emitFilesChange();
    return true;
}

clear() {
    this.files = {};
    this.activeFile = null;
    this.render();
    this._emitFilesChange();
}

/* =============================
   Rendering
   ============================= */

render() {
    if (!this.treeContainer) return;

    const fileNames = Object.keys(this.files);
    if (fileNames.length === 0) {
        this.treeContainer.innerHTML = `
            <div class="file-tree-empty">
                <i data-lucide="folder-open" class="empty-icon"></i>
                <p>No files yet</p>
                <p class="empty-hint">Enter a prompt to generate a website</p>
            </div> `;
        this._refreshIcons();
        return;
    }

    const fragment = document.createDocumentFragment();
    const sorted = this._sortFiles(fileNames);

    let currentDir = null;

    for (const name of sorted) {
        const dir = this._dirname(name);
        if (this.options.sortFoldersFirst && dir !== currentDir) {
            currentDir = dir;
            if (dir) {
                const folderRow = document.createElement('div');
                folderRow.className = 'file-folder-label';
                folderRow.textContent = dir;
                fragment.appendChild(folderRow);
            }
        }

        const data = this.files[name];
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `file-item ${name === this.activeFile ? 'active' : ''}`;
        item.dataset.file = name;
        item.setAttribute('aria-label', `Open ${name}`);

        const icon = this._getIcon(name);
        const sizeStr = this._formatSize(data.size);

        item.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span class="file-name">${this._escapeHTML(name)}</span>
            <span class="file-size">${sizeStr}</span>
        `;

        item.addEventListener('click', () => {
            this.activeFile = name;
            this.render();
            this._emitSelect(name);
        });

        fragment.appendChild(item);
    }

    this.treeContainer.innerHTML = '';
    this.treeContainer.appendChild(fragment);
    this._refreshIcons();
}

/* =============================
   Helpers
   ============================= */

_createFileRecord(content = '') {
    const text = String(content ?? '');
    return {
        content: text,
        size: this._measureSize(text),
        modified: Date.now(),
        history: [],
    };
}

_pushHistory(name, previousContent) {
    const record = this.files[name];
    if (!record) return;

    record.history = record.history || [];
    record.history.push({
        content: String(previousContent ?? ''),
        modified: record.modified || Date.now(),
        timestamp: Date.now(),
    });

    if (record.history.length > this.options.maxHistory) {
        record.history.splice(0, record.history.length - this.options.maxHistory);
    }
}

_measureSize(text) {
    const value = String(text ?? '');
    if (typeof Blob !== 'undefined') {
        try {
            return new Blob([value]).size;
        } catch {
            return value.length * 2;
        }
    }
    if (typeof TextEncoder !== 'undefined') {
        try {
            return new TextEncoder().encode(value).length;
        } catch {
            return value.length * 2;
        }
    }
    return value.length * 2;
}

_sortFiles(fileNames) {
    const sortOrder = {
        html: 0,
        htm: 0,
        css: 1,
        scss: 1,
        sass: 1,
        js: 2,
        jsx: 2,
        ts: 2,
        tsx: 2,
        json: 3,
        md: 4,
    };

    return [...fileNames].sort((a, b) => {
        const dirA = this._dirname(a);
        const dirB = this._dirname(b);

        if (this.options.sortFoldersFirst && dirA !== dirB) {
            if (!dirA) return -1;
            if (!dirB) return 1;
            return dirA.localeCompare(dirB);
        }

        const extA = this._extension(a);
        const extB = this._extension(b);
        const orderDiff = (sortOrder[extA] ?? 99) - (sortOrder[extB] ?? 99);
        if (orderDiff !== 0) return orderDiff;

        return a.localeCompare(b);
    });
}

_getIcon(filename) {
    const ext = this._extension(filename);
    const map = {
        html: 'file-code',
        htm: 'file-code',
        css: 'palette',
        scss: 'palette',
        sass: 'palette',
        js: 'file-json',
        jsx: 'file-json',
        ts: 'file-json',
        tsx: 'file-json',
        json: 'braces',
        svg: 'image',
        png: 'image',
        jpg: 'image',
        jpeg: 'image',
        webp: 'image',
        md: 'file-text',
        txt: 'file-text',
        yml: 'settings',
        yaml: 'settings',
        prisma: 'database',
    };
    return map[ext] || 'file';
}

_formatSize(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

_basename(path) {
    return String(path || '').split('/').pop() || '';
}

_dirname(path) {
    const p = String(path || '');
    const idx = p.lastIndexOf('/');
    return idx > 0 ? p.slice(0, idx) : '';
}

_extension(path) {
    const base = this._basename(path);
    const idx = base.lastIndexOf('.');
    return idx >= 0 ? base.slice(idx + 1).toLowerCase() : '';
}

_normalizePath(path) {
    return String(path || '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/+/g, '/')
        .trim();
}

_nextDuplicateName(originalPath, base, ext) {
    const dir = this._dirname(originalPath);
    let counter = 2;

    while (counter < 1000) {
        const candidateBase = `${base}-copy${counter > 2 ? `-${counter}` : ''}`;
        const candidate = dir
            ? `${dir}/${candidateBase}${ext ? `.${ext}` : ''}`
            : `${candidateBase}${ext ? `.${ext}` : ''}`;

        if (!this.files[candidate]) return candidate;
        counter++;
    }

    return `${base}-copy.${ext || 'txt'}`;
}

_escapeHTML(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

_refreshIcons() {
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

_emitFilesChange() {
    if (this.suppressEvents) return;
    if (typeof this.onFilesChange === 'function') {
        this.onFilesChange(this.getFilesMap());
    }
}

_emitSelect(name) {
    if (this.suppressEvents) return;
    if (typeof this.onFileSelect === 'function') {
        this.onFileSelect(name);
    }
}

/* =============================
   Batch mode
   ============================= */

beginBatch() {
    this.suppressEvents = true;
}

endBatch({ render = true } = {}) {
    this.suppressEvents = false;
    if (render) this.render();
    this._emitFilesChange();
}

}

window.FileSystem = FileSystem;

;
/* ============================================================
   ANIMATED CANVAS BACKGROUND — ZERO-BUILDER Studio
   Kinetic particle mesh + fluid glowing waves + interactive gravity
   Upgraded: cleanup, DPR handling, resize safety, smoother physics
   ============================================================ */

class StudioBackgroundCanvas {
    constructor(canvasId = 'studio-bg-canvas', options = {}) {
        this.canvasId = canvasId;
        this.options = {
            opacity: 0.6,
            zIndex: -1,
            particleCap: 90,
            lineDistance: 130,
            mouseRadius: 180,
            mouseForce: 2.4,
            nodeSpacing: 64,
            waveStrength: 18,
            dprCap: 2,
            colors: {
                glowA: 'rgba(124, 58, 237, 0.04)',
                glowB: 'rgba(14, 165, 233, 0.02)',
                particle: ['260', '200'],
                line: 'rgba(139, 92, 246, 0.20)',
            },
            ...options,
        };

        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.options.dprCap);

        this.particles = [];
        this.gridNodes = [];

        this.mouse = {
            x: -1000,
            y: -1000,
            vx: 0,
            vy: 0,
            radius: this.options.mouseRadius,
            active: false,
        };

        this.time = 0;
        this.lastFrame = 0;
        this.animId = null;
        this.running = false;

        this._boundResize = this.resize.bind(this);
        this._boundPointerMove = this._onPointerMove.bind(this);
        this._boundPointerLeave = this._onPointerLeave.bind(this);
        this._boundVisibility = this._onVisibilityChange.bind(this);

        this.init();
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);

        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = this.canvasId;
            this.canvas.setAttribute('aria-hidden', 'true');
            this.canvas.style.position = 'fixed';
            this.canvas.style.inset = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = String(this.options.zIndex);
            this.canvas.style.opacity = String(this.options.opacity);
            this.canvas.style.mixBlendMode = 'screen';
            this.canvas.style.filter = 'saturate(1.05) contrast(1.02)';
            this.canvas.style.transform = 'translateZ(0)';
            document.body.prepend(this.canvas);
        }

        const context = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        if (!context) {
            throw new Error('StudioBackgroundCanvas: 2D canvas context unavailable');
        }

        this.ctx = context;

        this.resize();
        this.createParticles();
        this.createGrid();

        window.addEventListener('resize', this._boundResize, { passive: true });
        window.addEventListener('mousemove', this._boundPointerMove, { passive: true });
        window.addEventListener('mouseleave', this._boundPointerLeave, { passive: true });
        window.addEventListener('blur', this._boundPointerLeave, { passive: true });
        document.addEventListener('visibilitychange', this._boundVisibility, { passive: true });

        this.running = true;
        this.lastFrame = performance.now();
        this.animate(this.lastFrame);
    }

    destroy() {
        this.running = false;

        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }

        window.removeEventListener('resize', this._boundResize);
        window.removeEventListener('mousemove', this._boundPointerMove);
        window.removeEventListener('mouseleave', this._boundPointerLeave);
        window.removeEventListener('blur', this._boundPointerLeave);
        document.removeEventListener('visibilitychange', this._boundVisibility);

        if (this.canvas?.parentNode && this.canvas.id === this.canvasId) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    resize() {
        if (!this.canvas) return;

        this.width = Math.max(1, window.innerWidth);
        this.height = Math.max(1, window.innerHeight);
        this.dpr = Math.min(window.devicePixelRatio || 1, this.options.dprCap);

        this.canvas.width = Math.round(this.width * this.dpr);
        this.canvas.height = Math.round(this.height * this.dpr);

        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.createParticles();
        this.createGrid();
    }

    createParticles() {
        this.particles = [];
        const density = Math.floor((this.width * this.height) / 18000);
        const count = Math.max(24, Math.min(this.options.particleCap, density));

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                radius: Math.random() * 1.8 + 0.8,
                alpha: Math.random() * 0.35 + 0.18,
                hue: Math.random() > 0.55 ? 260 : 200,
                phase: Math.random() * Math.PI * 2,
                drift: Math.random() * 0.6 + 0.2,
            });
        }
    }

    createGrid() {
        this.gridNodes = [];
        const spacing = this.options.nodeSpacing;
        const cols = Math.max(4, Math.ceil(this.width / spacing) + 1);
        const rows = Math.max(4, Math.ceil(this.height / spacing) + 1);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.gridNodes.push({
                    gx: x,
                    gy: y,
                    x: x * spacing,
                    y: y * spacing,
                    ox: x * spacing,
                    oy: y * spacing,
                    a: Math.random() * Math.PI * 2,
                    s: Math.random() * 0.6 + 0.4,
                });
            }
        }
    }

    _onPointerMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.active = true;
    }

    _onPointerLeave() {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        this.mouse.active = false;
    }

    _onVisibilityChange() {
        if (document.hidden) {
            this._onPointerLeave();
        }
    }

    _noise(x, y, t) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + t * 0.8) * 43758.5453;
        return n - Math.floor(n);
    }

    _easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    _drawBackground() {
        const { ctx, width: w, height: h } = this;
        const grad = ctx.createRadialGradient(
            w * 0.5,
            h * 0.3,
            Math.max(60, Math.min(w, h) * 0.08),
            w * 0.5,
            h * 0.5,
            Math.max(w, h)
        );

        grad.addColorStop(0, this.options.colors.glowA);
        grad.addColorStop(0.5, this.options.colors.glowB);
        grad.addColorStop(1, 'rgba(9, 9, 11, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    _updateGridNode(node, dt) {
        const t = this.time;
        const wave = Math.sin((node.ox * 0.008) + t * 0.9 + node.a) * this.options.waveStrength;
        const waveY = Math.cos((node.oy * 0.01) + t * 0.7 + node.a) * this.options.waveStrength * 0.7;

        let mx = 0;
        let my = 0;

        if (this.mouse.active) {
            const dx = this.mouse.x - node.ox;
            const dy = this.mouse.y - node.oy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
            const force = Math.max(0, 1 - dist / this.mouse.radius);
            const repel = force * force * 16;
            mx = -(dx / dist) * repel;
            my = -(dy / dist) * repel;
        }

        const targetX = node.ox + wave + mx;
        const targetY = node.oy + waveY + my;

        node.x += (targetX - node.x) * Math.min(1, dt * 7.5);
        node.y += (targetY - node.y) * Math.min(1, dt * 7.5);
    }

    _drawGrid() {
        const { ctx } = this;
        const cols = Math.max(4, Math.ceil(this.width / this.options.nodeSpacing) + 1);
        const rows = Math.max(4, Math.ceil(this.height / this.options.nodeSpacing) + 1);

        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';

        const getNode = (x, y) => this.gridNodes[y * cols + x];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const node = getNode(x, y);
                if (!node) continue;

                if (x < cols - 1) {
                    const right = getNode(x + 1, y);
                    if (right) {
                        const dx = node.x - right.x;
                        const dy = node.y - right.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const alpha = Math.max(0, 0.12 - dist / 900);
                        if (alpha > 0.01) {
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(right.x, right.y);
                            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                            ctx.stroke();
                        }
                    }
                }

                if (y < rows - 1) {
                    const below = getNode(x, y + 1);
                    if (below) {
                        const dx = node.x - below.x;
                        const dy = node.y - below.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const alpha = Math.max(0, 0.12 - dist / 900);
                        if (alpha > 0.01) {
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(below.x, below.y);
                            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        for (const node of this.gridNodes) {
            const alpha = Math.max(0, 0.12 - Math.abs(Math.sin(node.a + this.time * 0.5)) * 0.08);
            if (alpha <= 0.01) continue;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }
    }

    _drawParticles() {
        const { ctx } = this;
        const mouseRadius = this.mouse.radius;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Mild drift with time-based motion
            const wobble = Math.sin(this.time * 0.8 + p.phase) * 0.03;
            p.vx += wobble * p.drift * 0.005;
            p.vy += Math.cos(this.time * 0.7 + p.phase) * 0.005 * p.drift;

            p.x += p.vx;
            p.y += p.vy;

            // Soft bounds
            if (p.x < -20) p.x = this.width + 20;
            if (p.x > this.width + 20) p.x = -20;
            if (p.y < -20) p.y = this.height + 20;
            if (p.y > this.height + 20) p.y = -20;

            // Mouse gravity / repulsion
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq) || 0.0001;

            if (dist < mouseRadius) {
                const force = 1 - dist / mouseRadius;
                const repel = force * force * this.options.mouseForce;
                p.vx -= (dx / dist) * repel * 0.05;
                p.vy -= (dy / dist) * repel * 0.05;
            }

            // Damping
            p.vx *= 0.993;
            p.vy *= 0.993;

            // Particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
            ctx.fill();

            // Connection lines — lightweight with short distance only
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const pdx = p.x - p2.x;
                const pdy = p.y - p2.y;
                const pdistSq = pdx * pdx + pdy * pdy;

                if (pdistSq > this.options.lineDistance * this.options.lineDistance) continue;

                const pdist = Math.sqrt(pdistSq) || 0.0001;
                const lineAlpha = (1 - pdist / this.options.lineDistance) * 0.2;

                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }

    animate(now) {
        if (!this.running) return;

        const dt = Math.min(0.033, (now - this.lastFrame) / 1000 || 0.016);
        this.lastFrame = now;
        this.time += dt;

        const { ctx, width: w, height: h } = this;
        if (!ctx) {
            this.animId = requestAnimationFrame((t) => this.animate(t));
            return;
        }

        ctx.clearRect(0, 0, w, h);
        this._drawBackground();

        // Update and render grid
        for (const node of this.gridNodes) {
            this._updateGridNode(node, dt);
        }
        this._drawGrid();

        // Update and render particles
        this._drawParticles();

        this.animId = requestAnimationFrame((t) => this.animate(t));
    }
}

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.studioBg = new StudioBackgroundCanvas();
    });
} else {
    window.studioBg = new StudioBackgroundCanvas();
}
;
/* ============================================================
   WEB SEARCH SYSTEM — ZERO-BUILDER Studio v5
   Multi-Source Web Search System: Tavily + DuckDuckGo HTML +
   Wikipedia fallback, with events, dedupe, cancellation,
   result normalization, and safer offline behavior
   ============================================================ */

class WebSearchSystem {
    constructor(options = {}) {
        this.options = {
            historyLimit: 50,
            maxResults: 5,
            enableTavily: true,
            enableDuckDuckGo: true,
            enableWikipedia: true,
            ...options,
        };

        this.listeners = new Map();
        this.isSearching = false;
        this.activeSearchId = null;
        this.activeController = null;
        this.history = [];
    }

    /* =========================
       Event system
       ========================= */
    on(event, callback) {
        if (typeof callback !== 'function') return () => { };
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event).add(callback);
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
        const bucket = this.listeners.get(event);
        if (!bucket) return;
        bucket.delete(callback);
        if (bucket.size === 0) this.listeners.delete(event);
    }

    emit(event, data) {
        const bucket = this.listeners.get(event);
        if (!bucket || bucket.size === 0) return;

        for (const callback of bucket) {
            try {
                callback(data);
            } catch (error) {
                console.error(`[WebSearchSystem:${event}] listener error`, error);
            }
        }
    }

    /* =========================
       Public API
       ========================= */
    async search(query, options = {}) {
        const normalizedQuery = String(query || '').trim();
        if (!normalizedQuery) {
            throw new Error('Search query cannot be empty');
        }

        // Cancel any currently running search so the newest request wins.
        this.cancel();

        const searchId = `search_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        this.activeSearchId = searchId;
        this.activeController = new AbortController();
        this.isSearching = true;

        const startedAt = Date.now();
        const startedAtIso = new Date(startedAt).toISOString();

        this.emit('search:start', {
            id: searchId,
            query: normalizedQuery,
            timestamp: startedAtIso,
            source: 'system',
        });

        const providerOrder = this._resolveProviderOrder(options);
        const maxResults = Number.isFinite(options.maxResults) ? options.maxResults : this.options.maxResults;

        let results = [];
        let source = 'Offline fallback';

        try {
            for (const provider of providerOrder) {
                if (this._isCancelled(searchId)) break;

                try {
                    const providerResults = await provider.run(normalizedQuery, {
                        ...options,
                        maxResults,
                        signal: this.activeController.signal,
                    });

                    if (Array.isArray(providerResults) && providerResults.length) {
                        results = providerResults;
                        source = provider.name;
                        break;
                    }
                } catch (error) {
                    this.emit('search:provider-error', {
                        id: searchId,
                        provider: provider.name,
                        query: normalizedQuery,
                        message: error?.message || String(error),
                    });
                }
            }

            if (!results.length) {
                results = this._offlineFallback(normalizedQuery);
                source = 'Offline knowledge fallback';
            }

            results = this._normalizeResults(results, normalizedQuery, maxResults);
            results = this._dedupeResults(results);

            const entry = {
                id: searchId,
                query: normalizedQuery,
                source,
                count: results.length,
                results,
                timestamp: startedAtIso,
                durationMs: Date.now() - startedAt,
            };

            this._pushHistory(entry);

            this.emit('search:complete', entry);

            return entry;
        } finally {
            if (this.activeSearchId === searchId) {
                this.isSearching = false;
                this.activeSearchId = null;
                this.activeController = null;
            }
        }
    }

    cancel() {
        if (this.activeController) {
            try {
                this.activeController.abort();
            } catch {
                // ignore
            }
        }
        this.isSearching = false;
        this.activeSearchId = null;
        this.activeController = null;
        this.emit('search:cancel', {
            timestamp: new Date().toISOString(),
        });
    }

    clearHistory() {
        this.history = [];
        this.emit('history:clear', {
            timestamp: new Date().toISOString(),
        });
    }

    getHistory() {
        return [...this.history];
    }

    getLastSearch() {
        return this.history[0] || null;
    }

    /* =========================
       Provider resolution
       ========================= */
    _resolveProviderOrder(options) {
        const preferred = String(options.preferredSource || '').toLowerCase();
        const providers = [];

        const tavilyKey = this._getTavilyKey();
        const tavilyEnabled = this.options.enableTavily && tavilyKey && preferred !== 'duckduckgo' && preferred !== 'wikipedia';
        const ddgEnabled = this.options.enableDuckDuckGo && preferred !== 'wikipedia';
        const wikiEnabled = this.options.enableWikipedia;

        if (tavilyEnabled) {
            providers.push({
                name: 'Tavily API',
                run: (q, opts) => this._searchTavily(q, tavilyKey, opts),
            });
        }

        if (ddgEnabled) {
            providers.push({
                name: 'DuckDuckGo HTML',
                run: (q, opts) => this._searchDuckDuckGo(q, opts),
            });
        }

        if (wikiEnabled) {
            providers.push({
                name: 'Wikipedia',
                run: (q, opts) => this._searchWikipedia(q, opts),
            });
        }

        // Allow explicit preferred source to be first.
        if (preferred === 'tavily' && tavilyEnabled) {
            providers.sort((a, b) => (a.name === 'Tavily API' ? -1 : b.name === 'Tavily API' ? 1 : 0));
        } else if (preferred === 'duckduckgo' && ddgEnabled) {
            providers.sort((a, b) => (a.name === 'DuckDuckGo HTML' ? -1 : b.name === 'DuckDuckGo HTML' ? 1 : 0));
        } else if (preferred === 'wikipedia' && wikiEnabled) {
            providers.sort((a, b) => (a.name === 'Wikipedia' ? -1 : b.name === 'Wikipedia' ? 1 : 0));
        }

        return providers;
    }

    _getTavilyKey() {
        try {
            return localStorage.getItem('zb_tavily_key') || '';
        } catch {
            return '';
        }
    }

    _isCancelled(searchId) {
        return this.activeSearchId !== searchId || this.activeController?.signal?.aborted;
    }

    /* =========================
       Tavily
       ========================= */
    async _searchTavily(query, apiKey, options = {}) {
        const body = {
            api_key: apiKey,
            query,
            search_depth: options.searchDepth || 'advanced',
            include_answer: options.includeAnswer !== false,
            max_results: options.maxResults || this.options.maxResults,
            include_images: Boolean(options.includeImages),
        };

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: options.signal,
        });

        if (!response.ok) {
            throw new Error(`Tavily HTTP error ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data.results) ? data.results : [];

        return results.map((r, index) => ({
            title: r.title || `Result ${index + 1}`,
            url: r.url || '#',
            snippet: r.content || r.snippet || r.raw_content || '',
            score: typeof r.score === 'number' ? r.score : 0.9,
            source: 'tavily',
        }));
    }

    /* =========================
       DuckDuckGo HTML
       ========================= */
    async _searchDuckDuckGo(query, options = {}) {
        // Lite/HTML endpoint is more scrape-friendly than the standard page.
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            method: 'GET',
            signal: options.signal,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });

        if (!response.ok) {
            throw new Error(`DuckDuckGo HTTP error ${response.status}`);
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const items = [];

        const anchors = Array.from(doc.querySelectorAll('a.result__a'));
        for (const anchor of anchors.slice(0, options.maxResults || this.options.maxResults)) {
            const title = this._cleanText(anchor.textContent);
            const url = anchor.href || '#';
            const result = anchor.closest('.result');
            const snippetEl = result?.querySelector('.result__snippet');
            const snippet = this._cleanText(snippetEl?.textContent || '');

            items.push({
                title: title || 'Search Result',
                url,
                snippet,
                score: 0.82,
                source: 'duckduckgo',
            });
        }

        return items;
    }

    /* =========================
       Wikipedia
       ========================= */
    async _searchWikipedia(query, options = {}) {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        const response = await fetch(searchUrl, {
            method: 'GET',
            signal: options.signal,
        });

        if (!response.ok) {
            throw new Error(`Wikipedia HTTP error ${response.status}`);
        }

        const data = await response.json();
        const items = Array.isArray(data?.query?.search) ? data.query.search : [];

        if (!items.length) return [];

        const selected = items.slice(0, options.maxResults || this.options.maxResults);
        const results = [];

        for (const item of selected) {
            const title = item.title || 'Wikipedia Result';
            const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;

            results.push({
                title,
                url: pageUrl,
                snippet: this._cleanText(item.snippet || ''),
                score: 0.78,
                source: 'wikipedia',
            });
        }

        return results;
    }

    /* =========================
       Normalization / dedupe
       ========================= */
    _normalizeResults(results, query, maxResults) {
        const q = String(query || '').toLowerCase();
        const seen = new Set();
        const normalized = [];

        for (const result of results || []) {
            if (!result) continue;

            const title = this._cleanText(result.title || 'Search Result');
            const url = String(result.url || '#').trim();
            const snippet = this._cleanText(result.snippet || result.content || '');
            const source = String(result.source || 'unknown').toLowerCase();

            const signature = `${title.toLowerCase()}|${url}`;
            if (seen.has(signature)) continue;
            seen.add(signature);

            normalized.push({
                title,
                url,
                snippet,
                score: this._scoreResult({ title, snippet, source }, q, result.score),
                source,
            });
        }

        normalized.sort((a, b) => b.score - a.score);

        return normalized.slice(0, maxResults);
    }

    _dedupeResults(results) {
        const seen = new Set();
        const out = [];

        for (const result of results || []) {
            const sig = `${String(result.title || '').toLowerCase()}|${String(result.url || '').toLowerCase()}`;
            if (seen.has(sig)) continue;
            seen.add(sig);
            out.push(result);
        }

        return out;
    }

    _scoreResult(result, query, baseScore = 0) {
        const title = String(result.title || '').toLowerCase();
        const snippet = String(result.snippet || '').toLowerCase();
        const source = String(result.source || '').toLowerCase();

        let score = typeof baseScore === 'number' ? baseScore : 0.5;

        const terms = query.split(/\s+/).filter(Boolean);
        for (const term of terms) {
            if (title.includes(term)) score += 0.12;
            if (snippet.includes(term)) score += 0.06;
        }

        if (source === 'tavily') score += 0.08;
        if (source === 'duckduckgo') score += 0.04;
        if (source === 'wikipedia') score += 0.02;

        if (title.length < 80) score += 0.02;
        if (snippet.length > 20) score += 0.02;

        return score;
    }

    /* =========================
       Offline fallback
       ========================= */
    _offlineFallback(query) {
        const safeQuery = String(query || '').trim();
        return [
            {
                title: `Modern Best Practices: ${safeQuery}`,
                url: 'https://developer.mozilla.org',
                snippet: `Curated reference pattern for ${safeQuery}. Uses semantic markup, modern ESM, responsive layout, and performance-first CSS architecture.`,
                score: 0.95,
                source: 'knowledge-base',
            },
        ];
    }

    /* =========================
       History
       ========================= */
    _pushHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > this.options.historyLimit) {
            this.history.length = this.options.historyLimit;
        }
    }

    /* =========================
       Utils
       ========================= */
    _cleanText(text) {
        return String(text || '')
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

// Global Singleton
window.webSearchSystem = new WebSearchSystem();
;
/* ============================================================
   DEEP REASONING & WEB SEARCH WALL HUD — ZERO-BUILDER Studio v4
   Real-Time Visual Thinking Panel + Live Research Cards
   ============================================================ */

class ReasoningWallHUD {
    constructor() {
        this.wallEl = null;
        this.searchWallEl = null;
        this.isVisible = false;
        this.thoughts = [];
        this.searchResults = [];
        this.init();
    }

    init() {
        this.createWallElements();
        this.bindFrameworkEvents();
    }

    createWallElements() {
        // 1. Deep Reasoning Panel
        if (!document.getElementById('deep-reasoning-wall')) {
            const panel = document.createElement('div');
            panel.id = 'deep-reasoning-wall';
            panel.className = 'hud-panel reasoning-wall-panel hidden';
            panel.innerHTML = `
                <div class="hud-header">
                    <div class="hud-title">
                        <span class="hud-badge pulse">AI BRAIN</span>
                        <i data-lucide="brain-circuit"></i>
                        <span>Deep Reasoning Engine</span>
                    </div>
                    <div class="hud-actions">
                        <button class="hud-toggle-btn" id="btn-toggle-reasoning" title="Toggle Compact/Expanded">
                            <i data-lucide="minimize-2"></i>
                        </button>
                    </div>
                </div>
                <div class="hud-body" id="reasoning-wall-body">
                    <div class="reasoning-empty">
                        <i data-lucide="sparkles"></i>
                        <p>Waiting for prompt to initiate deep reasoning sequence...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
            this.wallEl = panel;
        }

        // 2. Web Search Wall Panel
        if (!document.getElementById('web-search-wall')) {
            const searchPanel = document.createElement('div');
            searchPanel.id = 'web-search-wall';
            searchPanel.className = 'hud-panel search-wall-panel hidden';
            searchPanel.innerHTML = `
                <div class="hud-header">
                    <div class="hud-title">
                        <span class="hud-badge search-badge">LIVE SEARCH</span>
                        <i data-lucide="globe"></i>
                        <span>Web Search Wall</span>
                    </div>
                    <div class="hud-actions">
                        <span class="search-status-tag" id="search-status-tag">Idle</span>
                    </div>
                </div>
                <div class="hud-body" id="search-wall-body">
                    <div class="search-empty">
                        <p>No active web queries executed yet</p>
                    </div>
                </div>
            `;
            document.body.appendChild(searchPanel);
            this.searchWallEl = searchPanel;
        }

        // Initialize lucide icons if available
        if (window.lucide) window.lucide.createIcons();
    }

    bindFrameworkEvents() {
        // Connect to AgentFramework instance if available
        const checkAndBind = () => {
            if (window.agentFramework) {
                window.agentFramework.on('progress', (data) => this.onProgress(data));
                window.agentFramework.on('log', (data) => this.onLog(data));
                window.agentFramework.on('specReady', (spec) => this.onSpecReady(spec));
                window.agentFramework.on('stateChange', (state) => this.onStateChange(state));
            }
        };

        checkAndBind();
        document.addEventListener('DOMContentLoaded', checkAndBind);

        // Connect WebSearchSystem events
        if (window.webSearchSystem) {
            window.webSearchSystem.on('search:start', (data) => this.onSearchStart(data));
            window.webSearchSystem.on('search:complete', (data) => this.onSearchComplete(data));
        }
    }

    onStateChange(state) {
        if (this.wallEl) {
            this.wallEl.classList.remove('hidden');
        }
        this.addThought('state', `Agent State Transition → <strong>${state}</strong>`);
    }

    onProgress(data) {
        if (this.wallEl) this.wallEl.classList.remove('hidden');
        this.addThought('progress', `[${data.step.toUpperCase()}] ${data.message} (${data.percent}%)`);
    }

    onLog(data) {
        if (this.wallEl) this.wallEl.classList.remove('hidden');
        this.addThought(data.type || 'info', data.message);
    }

    onSpecReady(spec) {
        if (spec.brandStrategy) {
            this.addThought('strategy', `🎯 <strong>Brand Positioning:</strong> ${spec.brandStrategy.brand?.tagline || 'Custom Positioning'}`);
        }
        if (spec.artDirection) {
            this.addThought('art', `🎨 <strong>Art Direction Locked:</strong> ${spec.artDirection.visualMood || spec.mood || 'Custom Theme'}`);
        }
    }

    addThought(type, text) {
        const body = document.getElementById('reasoning-wall-body');
        if (!body) return;

        // Remove empty state
        const empty = body.querySelector('.reasoning-empty');
        if (empty) empty.remove();

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const item = document.createElement('div');
        item.className = `thought-item thought-${type}`;
        item.innerHTML = `
            <span class="thought-time">${time}</span>
            <span class="thought-text">${text}</span>
        `;

        body.appendChild(item);
        body.scrollTop = body.scrollHeight;

        // Keep last 40 items max
        while (body.children.length > 40) {
            body.removeChild(body.firstChild);
        }
    }

    onSearchStart(data) {
        if (this.searchWallEl) this.searchWallEl.classList.remove('hidden');
        const tag = document.getElementById('search-status-tag');
        if (tag) {
            tag.textContent = 'Searching...';
            tag.className = 'search-status-tag searching';
        }
    }

    onSearchComplete(data) {
        if (this.searchWallEl) this.searchWallEl.classList.remove('hidden');
        const tag = document.getElementById('search-status-tag');
        if (tag) {
            tag.textContent = `${data.count} Results (${data.source})`;
            tag.className = 'search-status-tag complete';
        }

        const body = document.getElementById('search-wall-body');
        if (!body) return;

        const empty = body.querySelector('.search-empty');
        if (empty) empty.remove();

        const card = document.createElement('div');
        card.className = 'search-card';
        card.innerHTML = `
            <div class="search-card-header">
                <span class="search-card-query">🔍 "${data.query}"</span>
                <span class="search-card-source">${data.source}</span>
            </div>
            <div class="search-card-results">
                ${data.results.map(r => `
                    <div class="search-result-item">
                        <a href="${r.url}" target="_blank" rel="noopener" class="result-title">${r.title}</a>
                        <p class="result-snippet">${r.snippet}</p>
                    </div>
                `).join('')}
            </div>
        `;

        body.prepend(card);
    }
}

// Auto Instantiate
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.reasoningWall = new ReasoningWallHUD());
} else {
    window.reasoningWall = new ReasoningWallHUD();
}

;
/* ============================================================
   ZERO-BUILDER — Click-to-Edit Visual Preview Inspector
   Allows clicking elements in the iframe preview to inspect,
   edit text, tweak styles, or send targeted AI micro-prompts
   ============================================================ */

class VisualInspector {
    constructor(iframeEl, appController) {
        this.iframe = iframeEl;
        this.app = appController;
        this.isActive = false;
        this.selectedElementInfo = null;
        this.overlayEl = null;
        this.toolbarEl = null;
    }

    toggle() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.enableInspector();
        } else {
            this.disableInspector();
        }
        return this.isActive;
    }

    enableInspector() {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
            if (!doc) return;

            this.injectInspectorStyles(doc);

            doc.addEventListener('mouseover', this.handleMouseOver, true);
            doc.addEventListener('mouseout', this.handleMouseOut, true);
            doc.addEventListener('click', this.handleClick, true);
        } catch (e) {
            console.warn('Unable to attach visual inspector to iframe:', e);
        }
    }

    disableInspector() {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
            if (!doc) return;

            doc.removeEventListener('mouseover', this.handleMouseOver, true);
            doc.removeEventListener('mouseout', this.handleMouseOut, true);
            doc.removeEventListener('click', this.handleClick, true);

            this.removeInspectorStyles(doc);
            this.closeToolbar();
        } catch (e) {
            console.warn('Unable to detach visual inspector:', e);
        }
    }

    injectInspectorStyles(doc) {
        if (doc.getElementById('zero-inspector-css')) return;
        const style = doc.createElement('style');
        style.id = 'zero-inspector-css';
        style.textContent = `
            .zero-hover-highlight {
                outline: 2px dashed #8b5cf6 !important;
                outline-offset: -2px !important;
                cursor: pointer !important;
            }
            .zero-selected-highlight {
                outline: 2px solid #38bdf8 !important;
                outline-offset: -2px !important;
                box-shadow: 0 0 15px rgba(56, 189, 248, 0.4) !important;
            }
        `;
        doc.head.appendChild(style);
    }

    removeInspectorStyles(doc) {
        const el = doc.getElementById('zero-inspector-css');
        if (el) el.remove();
        doc.querySelectorAll('.zero-hover-highlight, .zero-selected-highlight').forEach(node => {
            node.classList.remove('zero-hover-highlight', 'zero-selected-highlight');
        });
    }

    handleMouseOver = (e) => {
        if (!this.isActive) return;
        e.stopPropagation();
        const target = e.target;
        if (target && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
            target.classList.add('zero-hover-highlight');
        }
    };

    handleMouseOut = (e) => {
        if (!this.isActive) return;
        e.stopPropagation();
        if (e.target) {
            e.target.classList.remove('zero-hover-highlight');
        }
    };

    handleClick = (e) => {
        if (!this.isActive) return;
        e.preventDefault();
        e.stopPropagation();

        const target = e.target;
        if (!target) return;

        const doc = this.iframe.contentDocument;
        doc.querySelectorAll('.zero-selected-highlight').forEach(n => n.classList.remove('zero-selected-highlight'));
        target.classList.add('zero-selected-highlight');

        const tag = target.tagName.toLowerCase();
        const text = target.innerText || target.textContent || '';
        const classes = target.className || '';

        this.selectedElementInfo = { target, tag, text, classes };

        this.openInspectorPopup(target, text, classes);
    };

    openInspectorPopup(target, text, classes) {
        this.closeToolbar();

        const popup = document.createElement('div');
        popup.id = 'zero-inspector-toolbar';
        popup.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            border-radius: 12px;
            padding: 12px 16px;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #fafafa;
            font-family: system-ui, sans-serif;
            font-size: 13px;
        `;

        popup.innerHTML = `
            <span style="font-weight:600; color:#8b5cf6;">[${target.tagName.toLowerCase()}]</span>
            <input type="text" id="zero-edit-text" value="${text.substring(0, 40).replace(/"/g, '&quot;')}" 
                   placeholder="Edit text..." style="background:#09090b; border:1px solid #3f3f46; color:#fff; padding:6px 10px; border-radius:6px; width:180px;">
            <button id="zero-btn-apply-text" style="background:#7c3aed; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:500;">Save Text</button>
            <button id="zero-btn-ai-tweak" style="background:#27272a; border:1px solid #3f3f46; color:#38bdf8; padding:6px 12px; border-radius:6px; cursor:pointer;">✨ AI Edit</button>
            <button id="zero-btn-close" style="background:transparent; border:none; color:#a1a1aa; cursor:pointer;">✕</button>
        `;

        document.body.appendChild(popup);
        this.toolbarEl = popup;

        document.getElementById('zero-btn-apply-text')?.addEventListener('click', () => {
            const editInput = document.getElementById('zero-edit-text');
            const newText = editInput ? editInput.value : '';
            target.innerText = newText;
            if (this.app && typeof this.app.syncCurrentFrameToEditor === 'function') {
                this.app.syncCurrentFrameToEditor();
            }
            this.closeToolbar();
        });

        document.getElementById('zero-btn-ai-tweak')?.addEventListener('click', () => {
            const promptInput = document.getElementById('welcome-prompt-input') || document.getElementById('prompt-input');
            if (promptInput) {
                promptInput.value = `Modify the <${target.tagName.toLowerCase()}> element "${text.substring(0, 30)}": `;
                promptInput.focus();
            }
            this.closeToolbar();
        });

        document.getElementById('zero-btn-close')?.addEventListener('click', () => {
            this.closeToolbar();
        });
    }

    closeToolbar() {
        if (this.toolbarEl) {
            this.toolbarEl.remove();
            this.toolbarEl = null;
        }
    }
}

window.VisualInspector = VisualInspector;

;
/* ============================================================
   ZERO-BUILDER — Multimodal AI Vision Analyzer (Screenshot to Code)
   Encodes uploaded design images to base64 and synthesizes
   structured prompts for design system & UI code generation
   ============================================================ */

class VisionAnalyzer {
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
    }

    async analyzeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result;
                try {
                    const analysisPrompt = `Analyze this UI design screenshot / wireframe image in detail. Extract:
1. Primary and secondary color palette (hex codes or Tailwind color equivalents).
2. Layout structure (Hero section, Bento grid, Sidebar, Card grids, Header/Footer).
3. Typography styles (Font weight, headings, hierarchy).
4. Key UI components (buttons, search inputs, badges, navigation links).

Synthesize a detailed web application prompt that instructs an AI developer to recreate this exact modern UI in React / HTML + Tailwind CSS.`;

                    // Generate structured description
                    const result = await this.llmProvider.chat([
                        { role: 'user', content: analysisPrompt }
                    ]);

                    resolve({
                        base64Data,
                        description: result || 'Modern landing page UI layout with dark glassmorphic cards and glowing hero section.'
                    });
                } catch (err) {
                    console.warn('Vision analysis fallback:', err);
                    resolve({
                        base64Data,
                        description: 'Recreate the UI screenshot with modern Tailwind CSS, dark zinc background, glassmorphism cards, and crisp typography.'
                    });
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

window.VisionAnalyzer = VisionAnalyzer;

;
/* ============================================================
   DEPLOY — Export as ZIP, deploy to Netlify/Vercel
   ============================================================ */

class DeployManager {
    constructor() {
        this.netlifyToken = '';
        this.vercelToken = '';
        this._loadSettings();
    }

    _loadSettings() {
        try {
            const saved = localStorage.getItem('zb_deploy_settings');
            if (saved) {
                const s = JSON.parse(saved);
                this.netlifyToken = s.netlifyToken || '';
                this.vercelToken = s.vercelToken || '';
            }
        } catch (e) {}
    }

    saveSettings() {
        localStorage.setItem('zb_deploy_settings', JSON.stringify({
            netlifyToken: this.netlifyToken,
            vercelToken: this.vercelToken,
        }));
    }

    /* ===== EXPORT AS ZIP ===== */
    async exportZip(files, projectName = 'zero-builder-site') {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip not loaded. Please check your internet connection.');
        }

        const zip = new JSZip();
        
        for (const [filename, content] of Object.entries(files || {})) {
            const cleanPath = String(filename || '').replace(/^[/\\]+/, '');
            if (!cleanPath) continue;
            if (typeof content === 'string' && /^data:[^;]+;base64,/i.test(content)) {
                const base64Data = content.replace(/^data:[^;]+;base64,/i, '');
                zip.file(cleanPath, base64Data, { base64: true });
            } else {
                zip.file(cleanPath, content);
            }
        }

        // Prefer generated README if present; otherwise create a strong deploy guide
        const isNext = !!files['next.config.js'] || !!files['next.config.mjs'] || !!files['app/page.tsx'] || !!files['app/page.jsx'] || (!!files['package.json'] && files['package.json'].includes('"next"'));
        const isReact = !isNext && (!!files['src/main.jsx'] || (!!files['package.json'] && files['package.json'].includes('"react"')));
        if (!files['README.md']) {
            let readme = `# ${projectName}\n\nGenerated by ZERO-BUILDER AI — principal full-stack engineer mode.\n\n`;
            if (isNext) {
                readme += `## Next.js Full-Stack\n\nApp Router + optional Prisma/API routes.\n\n### Local setup\n\`\`\`bash\nnpm install\ncp .env.example .env\nnpx prisma generate\nnpx prisma db push\nnpm run dev\n\`\`\`\n\n### Deploy (Vercel recommended)\n1. Push repo or import the project in Vercel\n2. Set env vars from \`.env.example\`\n3. Build command: \`prisma generate && next build\`\n4. Never commit real secrets\n\n### Quality checklist\n- Marketing home + product routes\n- API validation + error states\n- Auth boundaries if enabled\n`;
            } else if (isReact) {
                readme += `## React + Vite\n\n### Local setup\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n### Production build\n\`\`\`bash\nnpm run build\nnpm run preview\n\`\`\`\n\n### Deploy\n- Netlify/Vercel static deploy from \`dist/\` after \`npm run build\`\n- Set publish directory to \`dist\`\n`;
            } else {
                readme += `## Premium Static Site\n\nOpen \`index.html\` or serve locally:\n\n\`\`\`bash\nnpx serve .\n\`\`\`\n\n### Deploy\n- Netlify drag-and-drop or CLI ZIP deploy\n- Or any static host (Cloudflare Pages, GitHub Pages, S3)\n`;
            }
            zip.file('README.md', readme);
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        
        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    }

    /* ===== DEPLOY TO NETLIFY ===== */
    async deployToNetlify(files, siteName = 'zero-builder-site') {
        if (!this.netlifyToken) {
            throw new Error('Netlify token not configured. Go to Settings → Deploy.');
        }

        const isNext = !!files['app/page.tsx'] || !!files['app/page.jsx'] || !!files['package.json'] && files['package.json'].includes('"next"');
        const isReact = !!files['src/main.jsx'] || !!files['package.json'] && files['package.json'].includes('"react"');
        if (isReact || isNext) {
            throw new Error('Netlify direct ZIP upload only supports pre-built static websites. Download the project or deploy it through a Git-connected build pipeline.');
        }

        try {
            // Create a zip of all files
            const zip = new JSZip();
            for (const [filename, content] of Object.entries(files)) {
                zip.file(filename, content);
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            // Reuse existing site if we have one saved
            let siteId = localStorage.getItem('zb_netlify_site_id') || '';
            let siteUrl = '';

            if (siteId) {
                // Verify site still exists
                const checkResp = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
                    headers: { 'Authorization': `Bearer ${this.netlifyToken}` },
                });
                if (!checkResp.ok) {
                    // Site was deleted — clear and create new
                    siteId = '';
                    localStorage.removeItem('zb_netlify_site_id');
                } else {
                    const siteData = await checkResp.json();
                    siteUrl = siteData.ssl_url || siteData.url || '';
                }
            }

            if (!siteId) {
                // Create a new site
                const createResponse = await fetch('https://api.netlify.com/api/v1/sites', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.netlifyToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: siteName }),
                });

                if (!createResponse.ok) {
                    const err = await createResponse.text();
                    throw new Error(`Netlify site creation failed: ${err}`);
                }

                const site = await createResponse.json();
                siteId = site.id;
                siteUrl = site.ssl_url || site.url || `https://${site.subdomain}.netlify.app`;
                localStorage.setItem('zb_netlify_site_id', siteId);
            }

            // Deploy files via zip upload
            const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.netlifyToken}`,
                    'Content-Type': 'application/zip',
                },
                body: zipBlob,
            });

            if (!deployResponse.ok) {
                const err = await deployResponse.text();
                throw new Error(`Netlify deploy failed: ${err}`);
            }

            const deploy = await deployResponse.json();
            return {
                success: true,
                url: deploy.ssl_url || deploy.url || siteUrl,
                siteId: siteId,
                deployId: deploy.id,
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /* ===== DEPLOY TO VERCEL ===== */
    async deployToVercel(files, projectName = 'zero-builder-site') {
        if (!this.vercelToken) {
            throw new Error('Vercel token not configured. Go to Settings → Deploy.');
        }

        const isNext = !!files['app/page.tsx'] || !!files['app/page.jsx'] || !!files['package.json'] && files['package.json'].includes('"next"');
        const isReact = !!files['src/main.jsx'] || !!files['package.json'] && files['package.json'].includes('"react"');

        try {
            // Prepare files for Vercel API
            const vercelFiles = Object.entries(files).map(([name, content]) => ({
                file: name,
                data: btoa(unescape(encodeURIComponent(content))),
                encoding: 'base64',
            }));

            const response = await fetch('https://api.vercel.com/v13/deployments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.vercelToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: projectName,
                    files: vercelFiles,
                    projectSettings: {
                        framework: isNext ? 'nextjs' : isReact ? 'vite' : null,
                    },
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Vercel deploy failed: ${err}`);
            }

            const data = await response.json();
            return {
                success: true,
                url: `https://${data.url}`,
                deployId: data.id,
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /* ===== COPY ALL CODE ===== */
    copyAllCode(files) {
        const combined = Object.entries(files)
            .map(([name, content]) => `<!-- ===== ${name} ===== -->\n${content}`)
            .join('\n\n');
        navigator.clipboard?.writeText(combined);
        return true;
    }
}

window.DeployManager = DeployManager;

;
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
            // Guaranteed: Hide loading screen after delay no matter what
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                const app = document.getElementById('app');
                if (app) app.classList.remove('hidden');
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => loadingScreen.remove(), 600);
                }
                if (editor) editor.refresh();
            }, 800);
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
            scheduleWorkspaceSave();
        });

        framework.on('livePreview', ({ files, partial }) => {
            if (editor) editor.setFiles(files);
            if (fileSystem) fileSystem.setFiles(files);
            if (preview) preview.render(files);
        });

        framework.on('complete', (files) => {
            isGenerating = false;
            updateGenerateButton(false);
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

        // Settings modal
        document.getElementById('btn-settings')?.addEventListener('click', () => toggleModal('settings-modal', true));
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

    async function executeGeneration(prompt) {
        if (!framework) {
            showToast('error', 'Agent framework failed to load. Refresh the page.');
            return;
        }

        if (isGenerating) {
            // Prevent accidental double-click / Enter cancellation (require at least 4.5s delay)
            if (Date.now() - generationStartTime < 4500) {
                showToast('info', 'Generation in progress... Please wait for completion.');
                return;
            }

            framework.cancel();
            isGenerating = false;
            updateGenerateButton(false);
            showToast('info', 'Generation cancelled');
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
            await framework.generate(buildGenerationBrief(prompt), {
                artDirection: artDirectionPreset,
            });

            // Add success message in chat instead of replacing
            addChatMessage('system', '✅ Generation complete! Check the preview.', true);
        } catch (e) {
            console.error('Generation error:', e);
            isGenerating = false;
            updateGenerateButton(false);
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
        if (!prompt) return;

        chatInput.value = '';
        addChatMessage('user', prompt);

        // IF GENERATION IS CURRENTLY IN PROGRESS:
        if (isGenerating) {
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
            return; // DO NOT CANCEL GENERATION!
        }

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
            await framework.refine(prompt);

            // Add final completion message
            addChatMessage('system', '✅ Changes applied! Check the preview.', true);
        } catch (e) {
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

        if (providerId === 'custom' && (!window.llmProvider.customBaseUrl)) {
            toggleModal('settings-modal', true);
            showToast('warning', 'Please enter your Custom Base URL and Model Name in Settings.');
        } else {
            showToast('info', `Switched to ${window.llmProvider.providers[providerId].name}`);
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
        select.value = window.llmProvider.currentModel;
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
        if (apiKey !== undefined && providerId) window.llmProvider.setApiKey(providerId, apiKey);
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
        if (!editor) return;
        try {
            const payload = {
                id: workspaceProjectId,
                name: getProjectName(),
                prompt: document.getElementById('prompt-input')?.value || '',
                requirements: Array.from(selectedRequirements),
                quality: buildQuality,
                artDirection: artDirectionPreset,
                framework: framework?.frameworkOverride || 'vanilla',
                files: editor.getAllFiles(),
                updatedAt: Date.now(),
            };
            localStorage.setItem(WORKSPACE_KEY, JSON.stringify(payload));
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

            // Auto-restore workspace view on F5 page refresh
            const activeView = localStorage.getItem('zb_active_view');
            const hasFiles = saved.files && Object.keys(saved.files).length > 0;
            if (activeView === 'workspace' || hasFiles) {
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

    // Protect active generation from accidental F5 refresh
    window.addEventListener('beforeunload', (e) => {
        if (isGenerating) {
            e.preventDefault();
            e.returnValue = 'ZERO-BUILDER is currently generating your website. Are you sure you want to refresh?';
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
