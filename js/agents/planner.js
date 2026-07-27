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
