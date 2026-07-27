/* ============================================================
   DESIGNER AGENT V2 — Creates CINEMATIC premium design systems
   with auto-research, motion planning, and template intelligence
   ============================================================ */

class DesignerAgent extends BaseAgent {
  constructor() {
    super('Designer', 'Creates cinematic Awwwards-level CSS design systems with motion planning');

    // Premium template library for inspiration
    this.templateLibrary = {
      'agency': {
        heroTreatment: 'fullscreen-video-crossfade',
        motionSystems: ['liquid-glass-morphism', 'blur-text-reveal', 'magnetic-quickto-cta', 'parallax-layers', 'scroll-scrub-camera'],
        colorStrategy: 'dark-cinematic',
        typography: { heading: 'Instrument Serif', body: 'Barlow', style: 'editorial-italic' },
        spacing: 'generous-editorial',
        components: ['fading-video', 'blur-text', 'bubble-menu', 'stats-cards', 'trust-bar']
      },
      'saas': {
        heroTreatment: 'gradient-mesh-animated',
        motionSystems: ['stagger-reveals', 'hover-lift-cards', 'smooth-scroll', 'counter-animations'],
        colorStrategy: 'dark-modern',
        typography: { heading: 'Outfit', body: 'Inter', style: 'clean-geometric' },
        spacing: 'balanced-product',
        components: ['pricing-toggle', 'feature-grid', 'testimonial-carousel', 'cta-glow']
      },
      'portfolio': {
        heroTreatment: 'split-screen-media',
        motionSystems: ['image-reveal-masks', 'horizontal-scroll-gallery', 'cursor-follower', 'text-scramble'],
        colorStrategy: 'minimal-contrast',
        typography: { heading: 'Playfair Display', body: 'DM Sans', style: 'editorial-mixed' },
        spacing: 'asymmetric-editorial',
        components: ['project-grid', 'case-study-cards', 'contact-form', 'social-links']
      },
      'ecommerce': {
        heroTreatment: '3d-product-showcase',
        motionSystems: ['product-zoom', 'cart-animations', 'filter-transitions', 'quick-view-modal'],
        colorStrategy: 'warm-luxury',
        typography: { heading: 'Cormorant Garamond', body: 'Jost', style: 'luxury-serif' },
        spacing: 'product-focused',
        components: ['product-carousel', 'size-selector', 'add-to-cart', 'reviews-slider']
      },
      'landing': {
        heroTreatment: 'cinematic-video-loop',
        motionSystems: ['scroll-triggered-scenes', 'sticky-sections', 'parallax-depth', 'magnetic-buttons'],
        colorStrategy: 'bold-gradient',
        typography: { heading: 'Space Grotesk', body: 'Inter', style: 'modern-bold' },
        spacing: 'immersive-fullscreen',
        components: ['video-background', 'feature-showcase', 'social-proof', 'newsletter-capture']
      },
      'dashboard': {
        heroTreatment: 'data-visualization-hero',
        motionSystems: ['chart-animations', 'sidebar-transitions', 'table-sorting', 'notification-toasts'],
        colorStrategy: 'dark-productivity',
        typography: { heading: 'Plus Jakarta Sans', body: 'Inter', style: 'functional-clean' },
        spacing: 'dense-functional',
        components: ['stats-grid', 'data-tables', 'charts', 'activity-feed', 'quick-actions']
      },
      'minimal': {
        heroTreatment: 'typography-focused',
        motionSystems: ['subtle-fade-ins', 'text-weight-transitions', 'minimal-hovers'],
        colorStrategy: 'monochrome-refined',
        typography: { heading: 'Instrument Serif', body: 'Inter', style: 'swiss-minimal' },
        spacing: 'breathing-whitespace',
        components: ['text-blocks', 'image-grid', 'contact-minimal']
      },
      'cinematic': {
        heroTreatment: 'fullscreen-video-crossfade',
        motionSystems: ['liquid-glass-morphism', 'blur-text-reveal', 'fading-video-crossfade', 'parallax-layers', 'magnetic-quickto-cta', 'scroll-scrub-scenes', 'grain-vignette-grade'],
        colorStrategy: 'dark-atmospheric',
        typography: { heading: 'Instrument Serif', body: 'Barlow', style: 'editorial-italic' },
        spacing: 'immersive-fullscreen',
        components: ['fading-video', 'blur-text', 'liquid-glass-nav', 'stats-cards', 'capability-cards', 'trust-bar']
      }
    };

    // Motion system implementations
    this.motionImplementations = {
      'liquid-glass-morphism': {
        css: `.liquid-glass{background:rgba(255,255,255,0.01);background-blend-mode:luminosity;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:none;box-shadow:inset 0 1px 1px rgba(255,255,255,0.1);position:relative;overflow:hidden}.liquid-glass::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.4px;background:linear-gradient(180deg,rgba(255,255,255,0.45) 0%,rgba(255,255,255,0.15) 20%,rgba(255,255,255,0) 40%,rgba(255,255,255,0) 60%,rgba(255,255,255,0.15) 80%,rgba(255,255,255,0.45) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}.liquid-glass-strong{background:rgba(255,255,255,0.03);backdrop-filter:blur(50px);-webkit-backdrop-filter:blur(50px);box-shadow:4px 4px 4px rgba(0,0,0,0.05),inset 0 1px 1px rgba(255,255,255,0.15)}`,
        js: `// Liquid glass is CSS-only, no JS needed`
      },
      'blur-text-reveal': {
        css: `.blur-text-word{display:inline-block;margin-right:0.28em;opacity:0;filter:blur(10px);transform:translateY(50px)}`,
        js: `function initBlurText(){document.querySelectorAll('[data-blur-text]').forEach(el=>{const words=el.textContent.split(' ');el.innerHTML=words.map(w=>\`<span class="blur-text-word">\${w}</span>\`).join('');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){el.querySelectorAll('.blur-text-word').forEach((word,i)=>{gsap.to(word,{opacity:1,filter:'blur(0px)',y:0,duration:0.7,delay:i*0.1,ease:'power3.out'})});observer.unobserve(el)}})},{threshold:0.1});observer.observe(el)})}`
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

    this.systemPrompt = `You are a principal design-systems architect for Awwwards-level cinematic websites. You create comprehensive CSS design systems that feel like $100K studio handoffs.

YOUR EXPERTISE:
- Cinematic marketing sites with video backgrounds and scroll storytelling
- Editorial sites with distinctive typography and generous spacing
- Product launches with immersive hero experiences
- Dark mode interfaces with liquid glass morphism
- Motion-rich experiences with GSAP ScrollTrigger choreography

DESIGN PHILOSOPHY:
1. Every site should feel like a FILM, not a template
2. Typography is the hero - use dramatic scale contrasts
3. Motion should be purposeful, not decorative
4. Glass effects should be subtle and refined
5. Color should create atmosphere, not just branding

RULES:
1. BEFORE outputting CSS, reason in <thinking>...</thinking>: analyze the art direction, plan the visual hierarchy, define the motion language
2. Output ONLY valid CSS inside a \`\`\`css\`\`\` block
3. Follow the supplied art direction LITERALLY - do NOT default to purple/cyan SaaS aesthetics
4. Include fluid type (clamp), generous spacing, shadows, radii, z-index, motion tokens
5. Always include .liquid-glass and .liquid-glass-strong utilities with proper gradient border masks
6. Include prefers-reduced-motion fallbacks
7. Include comprehensive component foundations (.btn, .container, .section, .navbar, etc.)

OUTPUT FORMAT: Complete :root tokens PLUS base component styles in one CSS block.`;
  }

  // Auto-detect site archetype and enhance specification
  async enhanceSpecification(specification) {
    const siteType = (specification.siteType || '').toLowerCase();

    // Find best matching template
    let template = this.templateLibrary['cinematic']; // default
    for (const [key, tmpl] of Object.entries(this.templateLibrary)) {
      if (siteType.includes(key) || key.includes(siteType)) {
        template = tmpl;
        break;
      }
    }

    // Merge template intelligence with user specification
    const enhanced = {
      ...specification,
      heroTreatment: specification.heroTreatment || template.heroTreatment,
      motionSystems: [...new Set([
        ...(specification.motionSystems || []),
        ...(specification.animations || []),
        ...template.motionSystems
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

    // Generate art direction if not provided
    if (!specification.artDirection || Object.keys(specification.artDirection).length === 0) {
      enhanced.artDirection = await this._generateArtDirection(enhanced);
    }

    return enhanced;
  }

  async _generateArtDirection(spec) {
    const prompt = `Generate a brief but evocative art direction for a ${spec.siteType} website.
Title: ${spec.title || 'Premium Website'}
Mood: ${spec.mood || 'cinematic'}
Colors: Primary ${spec.colorPalette?.primary}, Background ${spec.colorPalette?.background}

Output a JSON object with:
- concept: One sentence visual concept
- atmosphere: Mood/feeling description
- heroVision: How the hero should feel
- motionLanguage: Movement style
- typographicVoice: Typography personality

Output ONLY valid JSON, no markdown.`;

    try {
      const response = await this.callLLM(prompt, 'You are a creative director.', { temperature: 0.7, maxTokens: 500 });
      return JSON.parse(response.trim());
    } catch (e) {
      return {
        concept: 'Cinematic digital experience with atmospheric depth',
        atmosphere: 'Dark, refined, immersive',
        heroVision: 'Full-bleed media with layered typography',
        motionLanguage: 'Smooth, purposeful, choreographed',
        typographicVoice: 'Bold headlines, refined body text'
      };
    }
  }

  async execute(specification) {
    this.log('info', `Creating ${specification.complexity || 'cinematic'} design system...`);

    // Enhance specification with template intelligence
    const enhanced = await this.enhanceSpecification(specification);

    const isComplex = ['complex', 'ultra-complex'].includes(enhanced.complexity);

    // Gather motion system CSS
    const motionCSS = enhanced.motionSystems
      .filter(m => this.motionImplementations[m]?.css)
      .map(m => this.motionImplementations[m].css)
      .join('\n\n');

    const message = `Create a comprehensive, cinematic CSS design system for this website:

═══ SITE SPECIFICATION ═══
Site type: ${enhanced.siteType}
Title: ${enhanced.title || 'Premium Website'}
Complexity: ${enhanced.complexity || 'cinematic'}
Mood: ${enhanced.mood || 'atmospheric'}

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

═══ MOTION SYSTEMS TO SUPPORT ═══
${enhanced.motionSystems.join(', ')}

═══ HERO TREATMENT ═══
${enhanced.heroTreatment}

═══ COMPONENTS NEEDED ═══
${enhanced.components.join(', ')}

═══ PRE-BUILT MOTION CSS (include this) ═══
${motionCSS}

REQUIREMENTS:
1. Start with :root variables for all design tokens
2. Include the motion CSS provided above
3. Add fluid typography scale (clamp-based)
4. Add generous spacing scale (section-level spacing 120px+)
5. Add comprehensive shadow scale (subtle to dramatic)
6. Add glass morphism variables and utilities
7. Add z-index scale for layered compositions
8. Add transition/animation variables
9. Include base components: .container, .section, .btn variants, .navbar, .hero
10. Include responsive breakpoints (768px, 1024px, 1440px)
11. Include @media (prefers-reduced-motion: reduce) fallbacks
12. Make it feel like a $100K studio handoff

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
        motionSystems: enhanced.motionSystems,
        motionImplementations: this.motionImplementations,
        enhancedSpec: enhanced
      };

      this.log('success', 'Cinematic design system generated');
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
    const headingParam = isSerif
      ? `family=${heading}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700`
      : `family=${heading}:wght@400;500;600;700;800;900`;
    return `https://fonts.googleapis.com/css2?${headingParam}&family=${body}:wght@300;400;500;600;700&display=swap`;
  }

  async revise(designSystem, critique) {
    this.log('info', 'Revising design system based on critique...');

    const message = `The Reviewer has critiqued your proposed design system. Please revise it to address the concerns while maintaining a cinematic aesthetic.

ORIGINAL DESIGN SYSTEM:
${designSystem.css}

CRITIQUE:
${critique}

Output the completely revised design system. Include all motion system CSS and component styles.`;

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

  // Get motion JS for a specific system
  getMotionJS(systemName) {
    return this.motionImplementations[systemName]?.js || '';
  }

  // Get all motion JS for the design system
  getAllMotionJS(motionSystems) {
    return motionSystems
      .filter(m => this.motionImplementations[m]?.js)
      .map(m => `// === ${m} ===\n${this.motionImplementations[m].js}`)
      .join('\n\n');
  }
}

window.DesignerAgent = DesignerAgent;
