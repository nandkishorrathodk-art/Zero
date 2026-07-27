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
document.querySelectorAll('[data-count]').forEach(counter=>{const target=parseInt(counter.dataset.count);if(isNaN(target))return;const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){gsap.to(counter,{innerHTML:target,duration:2,ease:'power2.out',snap:{innerHTML:1},onUpdate:function(){counter.textContent=Math.round(parseFloat(counter.textContent)).toLocaleString()}});observer.unobserve(entry.target)}})},{threshold:0.5});observer.observe(counter)});`
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
            }
        };

        this.systemPrompt = `You are a principal frontend engineer + Awwwards creative developer. You ship complete, production-ready cinematic websites that feel like $100K studio work.

YOUR QUALITY STANDARDS (NON-NEGOTIABLE):
1. Every site is a FILM, not a template - create scroll-driven narratives
2. Hero sections must be IMMERSIVE - fullscreen video, WebGL, or dramatic media
3. Typography is the hero - use dramatic scale contrasts (clamp-based fluid type)
4. Motion must be PURPOSEFUL - GSAP ScrollTrigger, Lenis smooth scroll, magnetic interactions
5. Glass morphism must be REFINED - subtle, not overdone
6. Mobile-first responsive design (375px → 1440px+)
7. Semantic HTML5, ARIA, proper heading hierarchy
8. Real working JavaScript - no placeholders

CINEMATIC COMPONENTS YOU IMPLEMENT:
- FadingVideo: Crossfading background videos with smooth transitions
- BlurText: Word-by-word blur reveal on scroll
- LiquidGlass: Refined glassmorphism with gradient border masks
- MagneticButtons: Cursor-following button interactions
- ParallaxLayers: Mouse-driven depth effects
- ScrollScenes: Pin/scrub choreographed sections
- GrainVignette: Film grain and vignette overlays
- StatsCards: Animated counters with glass styling
- CapabilityCards: Feature cards with tags
- TrustBar: Logo parade with badges

GSAP PATTERNS YOU USE:
- gsap.registerPlugin(ScrollTrigger)
- ScrollTrigger with scrub for smooth scroll animations
- gsap.quickTo for magnetic button performance
- Staggered reveals with delay calculations
- Pin/scrub for sticky sections
- Timeline chaining for complex sequences

RULES:
1. THINK before coding - plan the visual narrative
2. Output files as markdown code blocks with **File: filename** headers
3. Include all CDN links (GSAP, ScrollTrigger, Lenis, fonts)
4. Use design system CSS variables throughout
5. Implement ALL motion systems from the specification
6. Hero must be a SCENE - video, WebGL, or dramatic media
7. No generic SaaS templates - every site must feel bespoke
8. JavaScript must ACTUALLY WORK - test your logic mentally
9. Include prefers-reduced-motion fallbacks
10. Generate substantial content - minimum 5 scenes/sections`;
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

        const contextBlock = `═══════════════════════════════════════════════════════
CINEMATIC WEBSITE BUILD — THIS IS YOUR CREATIVE MANDATE
═══════════════════════════════════════════════════════

SITE TYPE: ${enhanced.siteType}
TITLE: ${specification.title || 'Premium Website'}
DESCRIPTION: ${specification.description || ''}

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

COMPONENTS TO BUILD:
${(enhanced.components || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}

SECTIONS/SCENES:
${(enhanced.sections || ['hero', 'capabilities', 'about', 'testimonials', 'cta', 'footer']).join(' → ')}

THREE.JS: ${hasThreeJS ? 'Yes - include #three-canvas in hero' : 'No'}

═══════════════════════════════════════════════════════
BUILD A SCROLL FILM — NOT A SAAS TEMPLATE
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

            const jsPrompt = `${contextBlock}

MOTION SYSTEMS TO IMPLEMENT:
${motionSystems.join(', ')}

COMPONENT JS TO INCLUDE:
${componentJS}

MOTION SYSTEM JS TO INCLUDE:
${motionJS}

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
6. Any other motion systems specified
7. ${hasThreeJS ? 'Three.js scene initialization' : ''}
8. Form validation if forms exist
9. Any interactive components needed

CRITICAL: Everything must ACTUALLY WORK. Test your logic mentally.

Output ONLY the JS file:
**File: script.js**
\`\`\`js
// Cinematic JavaScript
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
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        counter.textContent = Math.round(parseFloat(counter.textContent)).toLocaleString();
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
