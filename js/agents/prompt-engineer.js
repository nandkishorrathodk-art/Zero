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
                json: true
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
            this.log('warning', `Parse failed, attempting smart fallback extraction: ${error.message}`);
            
            // Phase 2: Smart fallback - extract partial JSON fields from string
            let partialMerge = { ...fallback };
            
            try {
                const titleMatch = response.match(/"shortTitle"\s*:\s*"([^"]+)"/i);
                if (titleMatch) partialMerge.shortTitle = titleMatch[1];
                
                const archetypeMatch = response.match(/"siteArchetype"\s*:\s*"([^"]+)"/i);
                if (archetypeMatch) partialMerge.siteArchetype = archetypeMatch[1];
                
                const heroMatch = response.match(/"heroTreatment"\s*:\s*"([^"]+)"/i);
                if (heroMatch) partialMerge.heroTreatment = heroMatch[1];
                
                const qualityMatch = response.match(/"qualityBar"\s*:\s*"([^"]+)"/i);
                if (qualityMatch) partialMerge.qualityBar = qualityMatch[1];
                
                const normalized = this._normalize(partialMerge, cleanedPrompt, options);
                this.log('success', `Recovered prompt pack via smart fallback: ${normalized.shortTitle}`);
                return normalized;
            } catch (mergeError) {
                this.log('warning', `Smart fallback failed, using defaults: ${mergeError.message}`);
                return fallback;
            }
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