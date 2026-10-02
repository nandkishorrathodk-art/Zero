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
            },
            'marquee-text': {
                html: `<div class="marquee" aria-hidden="true"><div class="marquee-track">{{items}}</div></div>`,
                css: `.marquee{overflow:hidden;white-space:nowrap;border-block:1px solid currentColor;padding:18px 0}
.marquee-track{display:inline-flex;gap:48px;animation:marquee-scroll 22s linear infinite;will-change:transform}
.marquee:hover .marquee-track{animation-play-state:paused}
@keyframes marquee-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`,
                js: `// Marquee is CSS-driven; duplicate the track content once so the loop is seamless.`
            },
            'raw-grid': {
                html: `<div class="raw-grid">
  <div class="raw-grid-cell">{{a}}</div>
  <div class="raw-grid-cell">{{b}}</div>
  <div class="raw-grid-cell">{{c}}</div>
  <div class="raw-grid-cell">{{d}}</div>
</div>`,
                css: `.raw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));border:3px solid currentColor}
.raw-grid-cell{padding:32px;border:1.5px solid currentColor;font-family:var(--font-mono,monospace);text-transform:uppercase}
.raw-grid-cell:nth-child(odd){background:rgba(0,0,0,0.03)}`,
                js: `// Exposed grid — borders carry the structure, no shadows.`
            },
            'stamp-badge': {
                html: `<span class="stamp-badge" data-micro="bounce">{{label}}</span>`,
                css: `.stamp-badge{display:inline-block;border:3px solid currentColor;padding:6px 16px;font-family:var(--font-mono,monospace);text-transform:uppercase;letter-spacing:0.12em;transform:rotate(-3deg);background:transparent}`,
                js: `// Rotated stamp badge for raw editorial accents.`
            },
            'spatial-cards': {
                html: `<div class="spatial-stack">
  <div class="spatial-card" data-hover="perspective" data-scroll-3d="rotate">
    <h3>{{title}}</h3>
    <p>{{description}}</p>
  </div>
</div>`,
                css: `.spatial-stack{perspective:1200px;display:grid;gap:28px}
.spatial-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:28px;transform-style:preserve-3d;transition:transform 0.5s cubic-bezier(0.23,1,0.32,1);backdrop-filter:blur(20px)}`,
                js: `// Each card tracks the pointer to tilt in z-space.`
            },
            'hud-elements': {
                html: `<div class="hud" aria-hidden="true">
  <span class="hud-corner hud-tl"></span><span class="hud-corner hud-tr"></span>
  <span class="hud-corner hud-bl"></span><span class="hud-corner hud-br"></span>
  <span class="hud-label">{{label}}</span>
</div>`,
                css: `.hud{position:absolute;inset:0;pointer-events:none}
.hud-corner{position:absolute;width:28px;height:28px;border:1.5px solid rgba(255,255,255,0.5)}
.hud-tl{top:0;left:0;border-right:0;border-bottom:0}.hud-tr{top:0;right:0;border-left:0;border-bottom:0}
.hud-bl{bottom:0;left:0;border-right:0;border-top:0}.hud-br{bottom:0;right:0;border-left:0;border-top:0}
.hud-label{position:absolute;top:12px;left:40px;font-size:0.7rem;letter-spacing:0.24em;text-transform:uppercase;opacity:0.7}`,
                js: `// Instrument-panel framing for spatial sections.`
            },
            'orbital-rings': {
                html: `<div class="orbital" aria-hidden="true"><span class="orbit orbit-1"></span><span class="orbit orbit-2"></span><span class="orbit orbit-3"></span></div>`,
                css: `.orbital{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.orbit{position:absolute;border:1px solid rgba(255,255,255,0.14);border-radius:50%}
.orbit-1{width:38vmin;height:38vmin;animation:orbit-spin 26s linear infinite}
.orbit-2{width:56vmin;height:56vmin;animation:orbit-spin 40s linear infinite reverse}
.orbit-3{width:74vmin;height:74vmin;animation:orbit-spin 58s linear infinite}
@keyframes orbit-spin{to{transform:rotate(360deg)}}`,
                js: `// Concentric rings orbit at different speeds to imply depth.`
            },
            'hologram-window': {
                html: `<div class="holo-window" data-3d="float">
  <div class="holo-titlebar">{{title}}</div>
  <div class="holo-body">{{description}}</div>
</div>`,
                css: `.holo-window{position:relative;border:1px solid rgba(120,200,255,0.5);border-radius:14px;background:linear-gradient(160deg,rgba(80,160,255,0.12),rgba(160,80,255,0.08));backdrop-filter:blur(18px);overflow:hidden}
.holo-titlebar{padding:10px 16px;border-bottom:1px solid rgba(120,200,255,0.35);font-size:0.75rem;letter-spacing:0.18em;text-transform:uppercase}
.holo-body{padding:22px}
.holo-window::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(120,200,255,0.06) 0 1px,transparent 1px 3px);pointer-events:none}`,
                js: `// Scanline overlay plus a slow float gives the projection feel.`
            },
            'clay-cards': {
                html: `<div class="clay-cards">
  <div class="clay-card" data-micro="bounce"><h3>{{title}}</h3><p>{{description}}</p></div>
</div>`,
                css: `.clay-cards{display:grid;gap:26px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.clay-card{background:linear-gradient(145deg,#fef3f3,#ffe8e8);border-radius:28px;box-shadow:15px 15px 30px rgba(0,0,0,0.08),-8px -8px 16px rgba(255,255,255,0.9),inset -3px -3px 6px rgba(0,0,0,0.03),inset 3px 3px 6px rgba(255,255,255,0.7);padding:28px;border:2px solid rgba(255,255,255,0.6)}`,
                js: `// Soft inflated cards; bounce on tap.`
            },
            'bubble-buttons': {
                html: `<button class="bubble-button" data-micro="bounce">{{label}}</button>`,
                css: `.bubble-button{border:0;cursor:pointer;padding:16px 34px;border-radius:999px;font-weight:700;background:linear-gradient(145deg,#ffe8e8,#ffd3d3);box-shadow:10px 10px 20px rgba(0,0,0,0.1),-6px -6px 14px rgba(255,255,255,0.9);transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1)}
.bubble-button:active{transform:scale(0.94)}`,
                js: `// Overshoot easing makes the press feel bouncy.`
            },
            'interactive-grid': {
                html: `<div class="interactive-grid" data-interactive-grid>
  <span class="grid-cell"></span><span class="grid-cell"></span><span class="grid-cell"></span>
  <span class="grid-cell"></span><span class="grid-cell"></span><span class="grid-cell"></span>
</div>`,
                css: `.interactive-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.grid-cell{aspect-ratio:1;border-radius:12px;background:rgba(255,255,255,0.06);transition:transform 0.25s ease,background 0.25s ease}
.grid-cell.is-active{background:var(--accent,#ff6b6b);transform:scale(1.08)}`,
                js: `// Pointer proximity lights up neighbouring cells.`
            },
            'stacked-cards': {
                html: `<div class="stacked-cards">
  <div class="stack-card" data-scroll-3d="rotate"><h3>{{title}}</h3><p>{{description}}</p></div>
</div>`,
                css: `.stacked-cards{display:grid;gap:22px;perspective:1000px}
.stack-card{border-radius:20px;padding:26px;background:var(--surface,rgba(255,255,255,0.05));border:1px solid rgba(255,255,255,0.1);transition:transform 0.45s cubic-bezier(0.23,1,0.32,1)}
.stack-card:hover{transform:translateZ(40px) rotateX(3deg)}`,
                js: `// Cards lift toward the viewer on hover.`
            },
            'image-reveal': {
                html: `<figure class="image-reveal" data-reveal="clip">
  <img src="{{src}}" alt="{{alt}}" loading="lazy" decoding="async" />
  <figcaption>{{caption}}</figcaption>
</figure>`,
                css: `.image-reveal{position:relative;overflow:hidden;border-radius:18px;margin:0}
.image-reveal img{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.06);transition:transform 0.9s cubic-bezier(0.23,1,0.32,1)}
.image-reveal.revealed img{transform:scale(1)}
.image-reveal figcaption{position:absolute;left:18px;bottom:14px;font-size:0.78rem;letter-spacing:0.16em;text-transform:uppercase;opacity:0.85}`,
                js: `// Clip reveal plus a slow counter-zoom as the image enters.`
            },
            'bubble-menu': {
                html: `<nav class="bubble-menu" aria-label="Primary">
  <a class="bubble-item" href="#work">Work</a>
  <a class="bubble-item" href="#studio">Studio</a>
  <a class="bubble-item" href="#contact">Contact</a>
</nav>`,
                css: `.bubble-menu{display:inline-flex;gap:.4rem;padding:.4rem;border-radius:999px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1)}
.bubble-item{color:inherit;text-decoration:none;font-size:.82rem;padding:.5rem 1.1rem;border-radius:999px;transition:background .3s ease}
.bubble-item:hover{background:rgba(255,255,255,0.12)}`,
                js: `// Pill navigation; collapses into the shared hamburger menu on mobile.`
            },
            'stats-grid': {
                html: `<div class="stats-grid" data-animate="stagger">
  {{#each stats}}
  <div class="stat-card" data-reveal="slide-up">
    <div class="stat-value" data-count="{{value}}">0</div>
    <div class="stat-label">{{label}}</div>
  </div>
  {{/each}}
</div>`,
                css: `.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--grid-gutter,1.5rem)}
.stat-card{padding:var(--space-lg,2rem);border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)}
.stat-value{font-family:var(--font-heading);font-size:clamp(2rem,5vw,3.5rem);line-height:1;font-weight:700}
.stat-label{margin-top:.5rem;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6}`,
                js: `// Counter animation is handled by the shared [data-count] boilerplate.`
            },
            'pricing-toggle': {
                html: `<div class="pricing" data-pricing>
  <div class="pricing-switch" role="tablist">
    <button class="pricing-option active" data-plan="monthly" role="tab">Monthly</button>
    <button class="pricing-option" data-plan="yearly" role="tab">Yearly</button>
  </div>
  <div class="pricing-grid">
    {{#each tiers}}
    <div class="price-card" data-reveal="slide-up">
      <h3 class="price-name">{{name}}</h3>
      <div class="price-value"><span data-monthly="{{monthly}}" data-yearly="{{yearly}}">{{monthly}}</span><small>/mo</small></div>
      <ul class="price-features">{{#each features}}<li>{{this}}</li>{{/each}}</ul>
      <button class="btn btn-primary" data-magnet>{{cta}}</button>
    </div>
    {{/each}}
  </div>
</div>`,
                css: `.pricing-switch{display:inline-flex;gap:.25rem;padding:.3rem;border-radius:999px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1)}
.pricing-option{background:none;border:0;color:inherit;padding:.5rem 1.2rem;border-radius:999px;cursor:pointer;opacity:.6}
.pricing-option.active{background:rgba(255,255,255,0.12);opacity:1}
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--grid-gutter,1.5rem);margin-top:2rem}
.price-card{padding:2rem;border-radius:22px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03)}
.price-value{font-size:2.5rem;font-weight:700;line-height:1}.price-value small{font-size:.9rem;opacity:.6}
.price-features{list-style:none;padding:0;margin:1.25rem 0;display:grid;gap:.6rem;font-size:.9rem}`,
                js: `function initPricingToggle(){document.querySelectorAll('[data-pricing]').forEach(root=>{const opts=root.querySelectorAll('.pricing-option');const values=root.querySelectorAll('[data-monthly]');opts.forEach(opt=>opt.addEventListener('click',()=>{opts.forEach(o=>o.classList.remove('active'));opt.classList.add('active');const plan=opt.dataset.plan;values.forEach(v=>{v.textContent=v.dataset[plan]||v.textContent})}))})}
document.addEventListener('DOMContentLoaded',initPricingToggle);`
            },
            'feature-grid': {
                html: `<div class="feature-grid">
  {{#each features}}
  <article class="feature-card" data-hover="lift" data-reveal="slide-up">
    <div class="feature-icon">{{icon}}</div>
    <h3 class="feature-title">{{title}}</h3>
    <p class="feature-copy">{{description}}</p>
  </article>
  {{/each}}
</div>`,
                css: `.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--grid-gutter,1.5rem)}
.feature-card{padding:2rem;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08)}
.feature-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:rgba(255,255,255,0.06);margin-bottom:1rem}
.feature-title{font-size:1.25rem;margin:0 0 .5rem}.feature-copy{font-size:.92rem;line-height:1.6;opacity:.75;margin:0}`,
                js: `// Feature cards lift on hover via [data-hover] and reveal on scroll.`
            },
            'testimonial-carousel': {
                html: `<div class="testimonials" data-carousel>
  <div class="testimonial-track">
    {{#each testimonials}}
    <figure class="testimonial" data-slide>
      <blockquote class="testimonial-quote">{{quote}}</blockquote>
      <figcaption class="testimonial-author">{{author}} — {{role}}</figcaption>
    </figure>
    {{/each}}
  </div>
  <div class="testimonial-dots" data-dots></div>
</div>`,
                css: `.testimonials{position:relative;overflow:hidden}
.testimonial-track{display:flex;transition:transform .6s cubic-bezier(.23,1,.32,1)}
.testimonial{min-width:100%;margin:0;padding:2rem}
.testimonial-quote{font-family:var(--font-heading);font-size:clamp(1.4rem,3vw,2.2rem);line-height:1.35;font-style:italic;margin:0 0 1rem}
.testimonial-author{font-size:.85rem;letter-spacing:.12em;text-transform:uppercase;opacity:.6}
.testimonial-dots{display:flex;gap:.5rem;justify-content:center;margin-top:1.5rem}
.testimonial-dot{width:8px;height:8px;border-radius:50%;border:0;background:rgba(255,255,255,0.25);cursor:pointer}
.testimonial-dot.active{background:currentColor}`,
                js: `function initTestimonials(){document.querySelectorAll('[data-carousel]').forEach(root=>{const track=root.querySelector('.testimonial-track');const slides=root.querySelectorAll('[data-slide]');const dotsWrap=root.querySelector('[data-dots]');if(!track||!slides.length)return;let index=0;slides.forEach((_,i)=>{const d=document.createElement('button');d.className='testimonial-dot'+(i===0?' active':'');d.addEventListener('click',()=>go(i));dotsWrap&&dotsWrap.appendChild(d)});function go(i){index=i;track.style.transform='translateX('+(-i*100)+'%)';dotsWrap&&dotsWrap.querySelectorAll('.testimonial-dot').forEach((d,di)=>d.classList.toggle('active',di===i))}setInterval(()=>go((index+1)%slides.length),6000)})}
document.addEventListener('DOMContentLoaded',initTestimonials);`
            },
            'cta-glow': {
                html: `<section class="cta-glow" data-reveal="blur">
  <h2 class="cta-glow-title">{{title}}</h2>
  <p class="cta-glow-copy">{{description}}</p>
  <button class="btn btn-primary cta-glow-button" data-magnet data-micro="ripple">{{cta}}</button>
</section>`,
                css: `.cta-glow{position:relative;text-align:center;padding:var(--space-3xl,6rem) var(--grid-margin,5vw);border-radius:32px;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.08),transparent 70%);border:1px solid rgba(255,255,255,0.08);overflow:hidden}
.cta-glow-title{font-size:clamp(2rem,6vw,4rem);line-height:1.02;margin:0 0 1rem}
.cta-glow-copy{max-width:52ch;margin:0 auto 2rem;opacity:.75}
.cta-glow-button{position:relative;z-index:1}`,
                js: `// Glow is a CSS radial gradient; the CTA keeps the shared magnetic/ripple behaviour.`
            },
            'project-grid': {
                html: `<div class="project-grid">
  {{#each projects}}
  <a class="project-card" href="{{href}}" data-reveal="clip" data-hover="tilt">
    <div class="project-media"><img src="{{image}}" alt="{{title}}" loading="lazy" decoding="async" /></div>
    <div class="project-meta"><span class="project-title">{{title}}</span><span class="project-tag">{{tag}}</span></div>
  </a>
  {{/each}}
</div>`,
                css: `.project-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--grid-gutter,1.5rem)}
.project-card{display:block;text-decoration:none;color:inherit;border-radius:20px;overflow:hidden}
.project-media{aspect-ratio:4/3;overflow:hidden;border-radius:20px}
.project-media img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.23,1,.32,1)}
.project-card:hover .project-media img{transform:scale(1.05)}
.project-meta{display:flex;justify-content:space-between;gap:1rem;padding:1rem 0;font-size:.9rem}
.project-tag{opacity:.55;text-transform:uppercase;letter-spacing:.12em;font-size:.72rem}`,
                js: `// Media zooms slowly on hover; the card itself tilts via [data-hover="tilt"].`
            },
            'case-study-cards': {
                html: `<div class="case-studies">
  {{#each studies}}
  <article class="case-study" data-reveal="slide-up">
    <span class="case-study-index">{{index}}</span>
    <h3 class="case-study-title">{{title}}</h3>
    <p class="case-study-copy">{{description}}</p>
    <a class="case-study-link" href="{{href}}">{{cta}}</a>
  </article>
  {{/each}}
</div>`,
                css: `.case-studies{display:grid;gap:1px;background:rgba(255,255,255,0.08);border-radius:24px;overflow:hidden}
.case-study{background:var(--color-bg,#0a0a0f);padding:2.5rem;display:grid;gap:.75rem;grid-template-columns:auto 1fr;align-items:start}
.case-study-index{grid-row:span 3;font-size:.8rem;letter-spacing:.2em;opacity:.45;padding-top:.4rem}
.case-study-title{margin:0;font-size:clamp(1.5rem,3vw,2.2rem)}
.case-study-copy{margin:0;max-width:60ch;opacity:.75}
.case-study-link{color:inherit;text-decoration:none;border-bottom:1px solid currentColor;justify-self:start;padding-bottom:2px}`,
                js: `// Index numbers and copy form a print-like list; reveal on scroll.`
            },
            'contact-form': {
                html: `<form class="contact-form" data-contact-form novalidate>
  <div class="field"><label for="cf-name">Name</label><input id="cf-name" name="name" type="text" required /></div>
  <div class="field"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" required /></div>
  <div class="field"><label for="cf-message">Message</label><textarea id="cf-message" name="message" rows="4" required></textarea></div>
  <button class="btn btn-primary" type="submit" data-magnet>Send</button>
  <p class="form-status" role="status" aria-live="polite"></p>
</form>`,
                css: `.contact-form{display:grid;gap:1.25rem;max-width:560px}
.field{display:grid;gap:.4rem}
.field label{font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;opacity:.6}
.field input,.field textarea{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:.85rem 1rem;color:inherit;font:inherit;outline:none;transition:border-color .3s ease}
.field input:focus,.field textarea:focus{border-color:rgba(255,255,255,0.35)}
.field input.invalid,.field textarea.invalid{border-color:#f87171}
.form-status{font-size:.85rem;opacity:.75;min-height:1.2em}`,
                js: `function initContactForms(){document.querySelectorAll('[data-contact-form]').forEach(form=>{form.addEventListener('submit',e=>{e.preventDefault();let valid=true;form.querySelectorAll('[required]').forEach(field=>{const bad=!field.value.trim()||(field.type==='email'&&!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(field.value));field.classList.toggle('invalid',bad);if(bad)valid=false});const status=form.querySelector('.form-status');if(status)status.textContent=valid?'Thanks — we will be in touch.':'Please complete the highlighted fields.'})})}
document.addEventListener('DOMContentLoaded',initContactForms);`
            },
            'social-links': {
                html: `<ul class="social-links">
  {{#each links}}<li><a class="social-link" href="{{href}}" rel="noopener">{{label}}</a></li>{{/each}}
</ul>`,
                css: `.social-links{list-style:none;display:flex;flex-wrap:wrap;gap:1.5rem;padding:0;margin:0}
.social-link{color:inherit;text-decoration:none;font-size:.82rem;letter-spacing:.14em;text-transform:uppercase;position:relative}
.social-link::after{content:'';position:absolute;left:0;bottom:-3px;width:100%;height:1px;background:currentColor;transform:scaleX(0);transform-origin:right;transition:transform .4s cubic-bezier(.65,0,.35,1)}
.social-link:hover::after{transform:scaleX(1);transform-origin:left}`,
                js: `// Underline sweep on hover, matching [data-hover="underline"].`
            },
            'product-carousel': {
                html: `<div class="product-carousel" data-carousel>
  <div class="product-track">
    {{#each products}}
    <article class="product-card" data-slide data-hover="lift">
      <div class="product-media"><img src="{{image}}" alt="{{name}}" loading="lazy" decoding="async" /></div>
      <h3 class="product-name">{{name}}</h3>
      <span class="product-price">{{price}}</span>
    </article>
    {{/each}}
  </div>
  <div class="product-nav">
    <button class="product-prev" data-carousel-prev aria-label="Previous">Prev</button>
    <button class="product-next" data-carousel-next aria-label="Next">Next</button>
  </div>
</div>`,
                css: `.product-carousel{overflow:hidden}
.product-track{display:flex;gap:var(--grid-gutter,1.5rem);transition:transform .6s cubic-bezier(.23,1,.32,1)}
.product-card{min-width:min(320px,80vw);border-radius:20px;border:1px solid rgba(255,255,255,0.08);padding:1rem;background:rgba(255,255,255,0.03)}
.product-media{aspect-ratio:1;border-radius:14px;overflow:hidden;margin-bottom:.75rem}
.product-media img{width:100%;height:100%;object-fit:cover}
.product-name{margin:0;font-size:1.05rem}.product-price{font-size:.9rem;opacity:.7}
.product-nav{display:flex;gap:.75rem;margin-top:1.25rem}
.product-nav button{background:none;border:1px solid rgba(255,255,255,0.2);color:inherit;border-radius:999px;padding:.5rem 1.2rem;cursor:pointer}`,
                js: `function initProductCarousels(){document.querySelectorAll('[data-carousel]').forEach(root=>{const track=root.querySelector('.product-track');if(!track)return;const cards=track.children;let index=0;const max=Math.max(0,cards.length-1);const step=()=>cards[0]?cards[0].getBoundingClientRect().width+24:0;root.querySelector('[data-carousel-next]')?.addEventListener('click',()=>{index=Math.min(max,index+1);track.style.transform='translateX('+(-index*step())+'px)'});root.querySelector('[data-carousel-prev]')?.addEventListener('click',()=>{index=Math.max(0,index-1);track.style.transform='translateX('+(-index*step())+'px)'})})}
document.addEventListener('DOMContentLoaded',initProductCarousels);`
            },
            'size-selector': {
                html: `<div class="size-selector" data-size-selector role="radiogroup" aria-label="Size">
  {{#each sizes}}<button class="size-option" data-size="{{this}}" role="radio" aria-checked="false">{{this}}</button>{{/each}}
</div>`,
                css: `.size-selector{display:flex;flex-wrap:wrap;gap:.6rem}
.size-option{min-width:48px;padding:.6rem 1rem;border-radius:12px;border:1px solid rgba(255,255,255,0.18);background:none;color:inherit;cursor:pointer;transition:all .2s ease}
.size-option[aria-checked="true"]{background:currentColor;color:var(--color-bg,#0a0a0f);border-color:currentColor}`,
                js: `function initSizeSelectors(){document.querySelectorAll('[data-size-selector]').forEach(root=>{root.querySelectorAll('.size-option').forEach(opt=>opt.addEventListener('click',()=>{root.querySelectorAll('.size-option').forEach(o=>o.setAttribute('aria-checked','false'));opt.setAttribute('aria-checked','true')}))})}
document.addEventListener('DOMContentLoaded',initSizeSelectors);`
            },
            'add-to-cart': {
                html: `<div class="cart-control">
  <div class="qty" data-qty>
    <button class="qty-btn" data-qty-down aria-label="Decrease">-</button>
    <span class="qty-value" data-qty-value>1</span>
    <button class="qty-btn" data-qty-up aria-label="Increase">+</button>
  </div>
  <button class="btn btn-primary add-to-cart" data-magnet data-micro="ripple">{{cta}}</button>
</div>`,
                css: `.cart-control{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.qty{display:inline-flex;align-items:center;gap:.5rem;border:1px solid rgba(255,255,255,0.16);border-radius:999px;padding:.3rem .6rem}
.qty-btn{width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,0.08);color:inherit;cursor:pointer;font-size:1.1rem;line-height:1}
.qty-value{min-width:1.5rem;text-align:center}`,
                js: `function initAddToCart(){document.querySelectorAll('[data-qty]').forEach(qty=>{const out=qty.querySelector('[data-qty-value]');let value=1;const set=v=>{value=Math.max(1,v);if(out)out.textContent=value};qty.querySelector('[data-qty-up]')?.addEventListener('click',()=>set(value+1));qty.querySelector('[data-qty-down]')?.addEventListener('click',()=>set(value-1))})}
document.addEventListener('DOMContentLoaded',initAddToCart);`
            },
            'reviews-slider': {
                html: `<div class="reviews" data-carousel>
  <div class="reviews-track">
    {{#each reviews}}<blockquote class="review" data-slide><p>{{quote}}</p><cite>{{author}}</cite></blockquote>{{/each}}
  </div>
</div>`,
                css: `.reviews{overflow:hidden}
.reviews-track{display:flex;transition:transform .6s cubic-bezier(.23,1,.32,1)}
.review{min-width:100%;margin:0;padding:1.5rem;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08)}
.review p{margin:0 0 .75rem;line-height:1.6}.review cite{font-size:.8rem;opacity:.6;font-style:normal}`,
                js: `function initReviews(){document.querySelectorAll('[data-carousel]').forEach(root=>{const track=root.querySelector('.reviews-track');const slides=root.querySelectorAll('.review');if(!track||slides.length<2)return;let i=0;setInterval(()=>{i=(i+1)%slides.length;track.style.transform='translateX('+(-i*100)+'%)'},5000)})}
document.addEventListener('DOMContentLoaded',initReviews);`
            },
            'video-background': {
                html: `<div class="video-background" aria-hidden="true">
  <video class="bg-video" autoplay muted playsinline loop preload="auto" poster="{{poster}}">
    <source src="{{videoUrl}}" type="video/mp4" />
  </video>
  <div class="bg-video-scrim"></div>
</div>`,
                css: `.video-background{position:absolute;inset:0;overflow:hidden;z-index:0}
.bg-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bg-video-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.65))}
@media (prefers-reduced-motion: reduce){.bg-video{display:none}}`,
                js: `// Background video is muted and decorative; it hides under reduced-motion.`
            },
            'feature-showcase': {
                html: `<div class="showcase">
  <div class="showcase-copy">
    <h2 class="showcase-title">{{title}}</h2>
    <p class="showcase-text">{{description}}</p>
    <ul class="showcase-list">{{#each points}}<li>{{this}}</li>{{/each}}</ul>
  </div>
  <div class="showcase-media" data-scroll-3d="rotate"><img src="{{image}}" alt="{{title}}" loading="lazy" decoding="async" /></div>
</div>`,
                css: `.showcase{display:grid;grid-template-columns:1fr 1fr;gap:var(--grid-gutter,2rem);align-items:center}
@media(max-width:768px){.showcase{grid-template-columns:1fr}}
.showcase-title{font-size:clamp(1.8rem,4vw,3rem);line-height:1.05;margin:0 0 1rem}
.showcase-text{opacity:.75;line-height:1.6}
.showcase-list{list-style:none;padding:0;margin:1.25rem 0 0;display:grid;gap:.6rem}
.showcase-list li{padding-left:1.4rem;position:relative}
.showcase-list li::before{content:'';position:absolute;left:0;top:.55em;width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.5}
.showcase-media{border-radius:24px;overflow:hidden}
.showcase-media img{display:block;width:100%;height:100%;object-fit:cover}`,
                js: `// Media panel carries a subtle 3D scroll rotation via [data-scroll-3d].`
            },
            'social-proof': {
                html: `<div class="social-proof" data-animate="stagger">
  <span class="social-proof-label">{{label}}</span>
  <div class="social-proof-logos">
    {{#each logos}}<span class="proof-logo">{{this}}</span>{{/each}}
  </div>
</div>`,
                css: `.social-proof{display:flex;flex-direction:column;gap:1rem;align-items:center;text-align:center}
.social-proof-label{font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;opacity:.5}
.social-proof-logos{display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;align-items:center}
.proof-logo{font-size:1.05rem;font-weight:600;opacity:.55;transition:opacity .3s ease}
.proof-logo:hover{opacity:.9}`,
                js: `// Credible proof only — never invent metrics; the logos reveal with the stagger group.`
            },
            'newsletter-capture': {
                html: `<form class="newsletter" data-newsletter novalidate>
  <label class="newsletter-label" for="nl-email">{{label}}</label>
  <div class="newsletter-row">
    <input id="nl-email" name="email" type="email" class="newsletter-input" placeholder="you@studio.com" required />
    <button class="btn btn-primary newsletter-submit" type="submit" data-magnet>{{cta}}</button>
  </div>
  <p class="newsletter-status" role="status" aria-live="polite"></p>
</form>`,
                css: `.newsletter{display:grid;gap:.6rem;max-width:520px}
.newsletter-label{font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;opacity:.6}
.newsletter-row{display:flex;gap:.6rem;flex-wrap:wrap}
.newsletter-input{flex:1 1 240px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:.85rem 1.2rem;color:inherit;font:inherit;outline:none;transition:border-color .3s ease}
.newsletter-input:focus{border-color:rgba(255,255,255,0.4)}
.newsletter-input.invalid{border-color:#f87171}
.newsletter-status{font-size:.82rem;opacity:.75;min-height:1.2em}`,
                js: `function initNewsletter(){document.querySelectorAll('[data-newsletter]').forEach(form=>{form.addEventListener('submit',e=>{e.preventDefault();const input=form.querySelector('.newsletter-input');const status=form.querySelector('.newsletter-status');const bad=!input||!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(input.value.trim());input&&input.classList.toggle('invalid',bad);if(status)status.textContent=bad?'Enter a valid email address.':'You are on the list.'})})}
document.addEventListener('DOMContentLoaded',initNewsletter);`
            },
            'data-tables': {
                html: `<div class="data-table-wrap">
  <table class="data-table">
    <thead><tr>{{#each columns}}<th scope="col">{{this}}</th>{{/each}}</tr></thead>
    <tbody>
      {{#each rows}}
      <tr>{{#each this}}<td>{{this}}</td>{{/each}}</tr>
      {{/each}}
    </tbody>
  </table>
</div>`,
                css: `.data-table-wrap{overflow-x:auto;border:1px solid rgba(255,255,255,0.08);border-radius:18px}
.data-table{width:100%;border-collapse:collapse;font-size:.9rem}
.data-table th,.data-table td{text-align:left;padding:.85rem 1.1rem;border-bottom:1px solid rgba(255,255,255,0.06)}
.data-table th{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;opacity:.55}
.data-table tbody tr:hover{background:rgba(255,255,255,0.03)}
.data-table tbody tr:last-child td{border-bottom:0}`,
                js: `// Dense, scannable table with hover row highlight.`
            },
            'charts': {
                html: `<div class="chart-card">
  <div class="chart-head"><span class="chart-title">{{title}}</span><span class="chart-legend">{{legend}}</span></div>
  <div class="chart-bars">
    {{#each bars}}<span class="chart-bar" data-value="{{value}}" style="--bar:{{percent}}%"></span>{{/each}}
  </div>
</div>`,
                css: `.chart-card{padding:1.5rem;border-radius:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08)}
.chart-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:1.25rem}
.chart-title{font-weight:600}.chart-legend{font-size:.75rem;opacity:.55}
.chart-bars{display:flex;align-items:flex-end;gap:.5rem;height:160px}
.chart-bar{flex:1;height:var(--bar,20%);border-radius:6px 6px 0 0;background:linear-gradient(180deg,currentColor,transparent);opacity:.55;transition:height .6s cubic-bezier(.23,1,.32,1),opacity .3s ease}
.chart-bar:hover{opacity:.9}`,
                js: `// Bars grow on load; values come from data-value, never invented copy.`
            },
            'activity-feed': {
                html: `<ul class="activity-feed">
  {{#each items}}
  <li class="activity-item" data-reveal="slide-up">
    <span class="activity-dot" aria-hidden="true"></span>
    <div class="activity-body"><span class="activity-text">{{text}}</span><time class="activity-time">{{time}}</time></div>
  </li>
  {{/each}}
</ul>`,
                css: `.activity-feed{list-style:none;padding:0;margin:0;display:grid;gap:.25rem}
.activity-item{display:flex;gap:1rem;padding:1rem;border-radius:14px;transition:background .3s ease}
.activity-item:hover{background:rgba(255,255,255,0.03)}
.activity-dot{width:8px;height:8px;border-radius:50%;margin-top:.5rem;background:currentColor;opacity:.5;flex:none}
.activity-body{display:flex;justify-content:space-between;gap:1rem;width:100%}
.activity-text{font-size:.9rem}.activity-time{font-size:.75rem;opacity:.5;white-space:nowrap}`,
                js: `// Chronological list with a timeline dot per entry.`
            },
            'quick-actions': {
                html: `<div class="quick-actions" role="group" aria-label="Quick actions">
  {{#each actions}}<button class="quick-action" data-micro="ripple"><span class="quick-action-icon">{{icon}}</span>{{label}}</button>{{/each}}
</div>`,
                css: `.quick-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.quick-action{display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.2rem;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:inherit;cursor:pointer;transition:all .25s ease}
.quick-action:hover{background:rgba(255,255,255,0.09);transform:translateY(-2px)}
.quick-action-icon{opacity:.7}`,
                js: `// Compact action buttons with ripple feedback.`
            },
            'text-blocks': {
                html: `<div class="text-blocks">
  {{#each blocks}}
  <section class="text-block" data-reveal="slide-up">
    <span class="text-block-eyebrow">{{eyebrow}}</span>
    <h2 class="text-block-title">{{title}}</h2>
    <p class="text-block-body">{{body}}</p>
  </section>
  {{/each}}
</div>`,
                css: `.text-blocks{display:grid;gap:var(--space-2xl,4rem)}
.text-block{max-width:68ch}
.text-block-eyebrow{font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;opacity:.5}
.text-block-title{font-size:clamp(1.5rem,3vw,2.4rem);line-height:1.1;margin:.75rem 0 1rem}
.text-block-body{line-height:1.7;opacity:.8;margin:0}`,
                js: `// Editorial copy blocks; measure is capped so lines stay readable.`
            },
            'image-grid': {
                html: `<div class="image-grid">
  {{#each images}}<figure class="image-grid-item" data-reveal="clip"><img src="{{src}}" alt="{{alt}}" loading="lazy" decoding="async" /></figure>{{/each}}
</div>`,
                css: `.image-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--grid-gutter,1rem)}
.image-grid-item{margin:0;aspect-ratio:4/5;border-radius:18px;overflow:hidden;background:rgba(255,255,255,0.03)}
.image-grid-item img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.23,1,.32,1)}
.image-grid-item:hover img{transform:scale(1.04)}`,
                js: `// Masonry-like media grid with clip reveals.`
            },
            'contact-minimal': {
                html: `<div class="contact-minimal">
  <a class="contact-minimal-mail" href="mailto:{{email}}">{{email}}</a>
  <span class="contact-minimal-location">{{location}}</span>
</div>`,
                css: `.contact-minimal{display:flex;flex-direction:column;gap:.5rem}
.contact-minimal-mail{color:inherit;font-size:clamp(1.4rem,3vw,2.2rem);text-decoration:none;border-bottom:1px solid currentColor;align-self:flex-start;padding-bottom:2px}
.contact-minimal-location{font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;opacity:.55}`,
                js: `// Minimal contact block: an oversized mail link and a location line.`
            },
            'avatar-circles': {
                html: `<div class="avatar-circles">{{#each avatars}}<span class="avatar-circle" data-micro="bounce">{{initials}}</span>{{/each}}</div>`,
                css: `.avatar-circles{display:flex}
.avatar-circle{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-weight:700;background:linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04));border:2px solid rgba(255,255,255,0.15);margin-left:-12px;transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
.avatar-circle:first-child{margin-left:0}
.avatar-circle:hover{transform:translateY(-4px) scale(1.06)}`,
                js: `// Overlapping avatar stack; each circle bounces on hover.`
            },
            'progress-bar': {
                html: `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{value}}">
  <span class="progress-label">{{label}}</span>
  <span class="progress-track"><span class="progress-fill" style="--value:{{value}}%"></span></span>
</div>`,
                css: `.progress{display:grid;gap:.5rem}
.progress-label{font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;opacity:.6}
.progress-track{display:block;height:10px;border-radius:999px;background:rgba(255,255,255,0.08);overflow:hidden}
.progress-fill{display:block;height:100%;width:var(--value,0%);border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,0.9),rgba(255,255,255,0.5));transition:width .8s cubic-bezier(.23,1,.32,1)}`,
                js: `// Width animates from the --value custom property set inline.`
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
15. Generate substantial content - minimum 5 scenes/sections

2026 MOTION STANDARD (this is what separates premium from generic):
- Choreograph a real timeline, do not sprinkle independent tweens. Name it,
  set explicit durations (0.4-1.2s UI, 1.5-3s cinematic), and use non-linear
  eases (power3.out, expo.out, circ.inOut). A default "power2.out" on
  everything reads as cheap.
- Stage entrances: hero copy, then media, then nav/CTA — staggered by 0.08-0.15s,
  never everything at once.
- Scroll-link motion with scrub (pin + scrub: 1 for cinematic sections), so the
  page responds continuously to the scroll position instead of firing once.
- Give depth: layered parallax at different speeds (foreground 1.0, mid 0.6,
  background 0.3) rather than a single moving layer.
- Every hover/interaction needs a state change in under 200ms or it feels laggy;
  use transform/opacity only.
- Respect prefers-reduced-motion everywhere, and keep 60fps on mid-range mobile:
  avoid animating layout properties, blur radii, or box-shadow.

DESIGN SYSTEM DISCIPLINE (this is what makes it read as studio work):
- Sizes come from the computed scale. Use var(--step-N) for type and
  var(--space-N) for every margin/padding/gap. Do not type raw px for either.
- Apply the .type-N classes (or the same tracking/leading values) so optical
  spacing matches the size. Display type is tight; body copy is loose.
- Break the centre. At least two sections must be asymmetric — offset grid
  spans, an edge bleed, or deliberate imbalance. A page of centred blocks is
  the single clearest tell of a generated template.
- One dominant element per section. If two things compete, one is too big.
- Never show more than three type sizes in one section.
- Whitespace is the design: when a section feels empty, add space, not a card.`;
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
        const philosophyClasses = this._philosophyClasses(designPhilosophy);
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

THREE.JS: ${hasThreeJS ? `Yes — include <div id="three-canvas"></div> in the hero, and load the scene as a module at the end of <body>:
  <script type="module" src="three-scene.js"></script>
The scene attaches itself as window.initThreeScene once loaded. Do NOT call it from script.js (that file is a classic script and runs before the module). Let three-scene.js boot itself.` : 'No'}

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
═══════════════════════════════════════════════════════

${typeof DesignSystem !== 'undefined' ? DesignSystem.toPromptBlock() : ''}

${typeof LibraryRegistry !== 'undefined' ? LibraryRegistry.runtimeRules(LibraryRegistry.plan(enhanced)).map((r) => `* ${r}`).join('\n') : ''}`;

        // Gather component templates
        const componentCSS = (enhanced.components || [])
            .filter(c => this.componentTemplates[c]?.css)
            .map(c => `/* ${c} */\n${this.componentTemplates[c].css}`)
            .join('\n\n');

        // The markup snippets were never handed to the HTML pass, so components
        // only contributed CSS/JS and no component was ever placed on the page.
        const componentHTML = (enhanced.components || [])
            .filter(c => this.componentTemplates[c]?.html)
            .map(c => `<!-- ${c} -->\n${this.componentTemplates[c].html}`)
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

            const hasThreeJS = !!threejsCode;

        const libraryBlock = typeof LibraryRegistry !== 'undefined'
            ? LibraryRegistry.htmlInstructions({ ...specification, heroTreatment: specification.heroTreatment, has3D: hasThreeJS })
            : 'Include GSAP, ScrollTrigger and Lenis.';

        const htmlPrompt = `${contextBlock}

DESIGN SYSTEM CSS (authoritative tokens + philosophy classes — use these, do not invent):
${designSystem.css}

COMPONENT MARKUP LIBRARY (use these structures, fill in {{placeholders}} with real copy):
${componentHTML || '(none specified — build components from the design system classes)'}

YOUR TASK: Generate a complete, cinematic index.html file.

REQUIREMENTS:
1. Include EXACTLY these CDN script tags, verbatim — do not invent or substitute URLs:
${libraryBlock}
2. Link to styles.css and script.js as external files
3. Structure as SCENES with data-scene attributes
4. Hero MUST be immersive: fullscreen video or dramatic media
5. Surface classes MUST come from the ${designPhilosophy} system:
   nav → .${philosophyClasses.nav} | cards → .${philosophyClasses.card} | buttons → .${philosophyClasses.button} | panels → .${philosophyClasses.surface}
   Do NOT use another philosophy's classes (e.g. no .liquid-glass in a ${designPhilosophy} build).
6. Use data-blur-text on hero headline
7. Use data-magnet on CTA buttons
8. Use data-animate on reveal elements
9. Use data-parallax on layered elements
10. Include film grain and vignette overlays if motion system requires
11. Minimum 5 substantial scenes with real content
12. Use brand strategy copy, not placeholder text
13. Semantic HTML5 with proper heading hierarchy
14. Mobile hamburger nav structure
15. Give each scene a unique, descriptive class (e.g. .scene-hero, .scene-proof)
    so it can be styled individually — do not reuse one generic section class.

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

            // Truncating the HTML here left the middle of the page invisible to the
            // CSS pass, so those sections shipped unstyled. Send a complete
            // structural digest instead: every class, id and data-attribute, plus
            // the section skeleton — full coverage without the body text.
            const htmlContext = html.length > 8000 ? this._htmlStructureDigest(html) : html;

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
11. MANDATORY: write a rule for EVERY class in the CLASS INVENTORY above.
    A class used in the markup but absent from the CSS ships unstyled — the
    single most common reason a generated page looks broken. Do not skip
    section-specific classes; give each one real, art-directed styling.
12. Style each section in the SKELETON distinctly — no two sections should
    look identical.

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
            const designTokens = typeof DesignSystem !== 'undefined'
                ? DesignSystem.toCSS({ fonts: enhanced.typography || designSystem.fonts || {} })
                : '';
            const llmCSS = css || this._getDefaultCSS(designSystem);
            // The computed scale/grid/spacing/font tokens are prepended
            // unconditionally. If the model dropped them the page would silently
            // fall back to invented sizes and Times, which is exactly the generic
            // look we are removing.
            files['styles.css'] = this._ensureDesignTokens(designTokens, this._ensureBaseStyles(llmCSS));
            files['script.js'] = this._injectGSAPBoilerplate() + '\n\n' + userJS;
            // Fonts only render if the stylesheet is actually linked. A model that
            // forgets the <link> ships a serif-less page, so guarantee it here.
            files['index.html'] = this._ensureFontSetup(html, designSystem.googleFontsUrl);

            // Guarantee the deterministic classes the markup relies on. The prompt
            // asks the model to include the philosophy and component CSS/JS, but a
            // model that drops it ships markup with no rule behind it — the section
            // collapses to an unstyled column. Each block is checked independently
            // so a partially-compliant model still gets what it omitted.
            files['styles.css'] = this._appendAllIfAbsent(files['styles.css'], [
                designSystem.designPhilosophyCSS || '',
                componentCSS,
            ]);

            files['script.js'] = this._appendAllIfAbsent(files['script.js'], [
                componentJS,
                motionJS,
                typeof advancedJS !== 'undefined' ? advancedJS : '',
            ]);

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

    /* The surface class a build should reach for, per design philosophy. The
       HTML prompt used to hardcode liquid-glass no matter the philosophy, which
       is why brutalist/minimal builds still shipped glassy cards. */
    _philosophyClasses(name) {
        const n = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
        const map = {
            skeuomorphism: { surface: 'skeu-surface', card: 'skeu-card', button: 'skeu-button', nav: 'skeu-surface' },
            neomorphism: { surface: 'neo-flat', card: 'neo-card', button: 'neo-button', nav: 'neo-flat' },
            glassmorphism: { surface: 'glass', card: 'glass-card', button: 'glass-button', nav: 'glass-navbar' },
            claymorphism: { surface: 'clay', card: 'clay-card', button: 'clay-button', nav: 'clay' },
            minimalism: { surface: 'min-surface', card: 'min-card', button: 'min-button', nav: 'min-surface' },
            maximalism: { surface: 'max-surface', card: 'max-card', button: 'max-button', nav: 'max-surface' },
            brutalism: { surface: 'brutal-surface', card: 'brutal-card', button: 'brutal-button', nav: 'brutal-surface' },
            liquidglass: { surface: 'liquid-glass', card: 'liquid-glass-tint', button: 'liquid-glass-button', nav: 'liquid-glass-nav' },
            spatialui: { surface: 'spatial-scene', card: 'spatial-card', button: 'spatial-button', nav: 'spatial-scene' },
        };
        return map[n] || map.liquidglass;
    }

    _checkFrameworkAbort() {
        if (this.framework?.abortController?.signal?.aborted) {
            throw new Error('ABORTED');
        }
    }

    /* A complete structural view of the HTML for the CSS pass. Sending the raw
       markup truncated to a byte budget hid whole sections from the styler, so
       instead we hand over every class/id/data-attribute plus a tag skeleton. */
    _htmlStructureDigest(html) {
        const tags = html.match(/<[a-zA-Z][^>]*>/g) || [];
        const skeleton = tags
            .filter((t) => /^<(section|header|footer|nav|main|aside|article|div|h[1-6]|p|a|button|ul|li|form|input|video|canvas|img|span|svg)\b/i.test(t))
            .map((t) => {
                const name = (t.match(/^<([a-zA-Z0-9-]+)/) || [])[1] || '';
                const id = (t.match(/\sid=["']([^"']+)["']/) || [])[1];
                const cls = (t.match(/\sclass=["']([^"']+)["']/) || [])[1];
                const data = (t.match(/\s(data-[a-z0-9-]+)/gi) || []).map((d) => d.trim());
                const parts = [name];
                if (id) parts.push(`#${id}`);
                if (cls) parts.push(`.${cls.trim().split(/\s+/).join('.')}`);
                if (data.length) parts.push(`[${data.join(' ')}]`);
                return parts.join('');
            });

        const classes = new Set();
        for (const m of html.matchAll(/\sclass=["']([^"']+)["']/g)) {
            m[1].trim().split(/\s+/).forEach((c) => c && classes.add(c));
        }

        return `STRUCTURE SKELETON (${tags.length} tags — style ALL of these):
${skeleton.join('\n')}

COMPLETE CLASS INVENTORY (${classes.size} classes — every one must have a rule):
${[...classes].join(', ')}`;
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

    /* Guarantee the computed tokens are present. If the model already emitted
       --step-0 (i.e. it followed the brief) we leave its CSS alone; otherwise
       the tokens are prepended so nothing can reference an undefined var. */
    _ensureDesignTokens(tokens, css) {
        if (!tokens) return css;
        if (/--step-0\s*:/.test(css)) return css;
        return `${tokens}\n\n${css}`;
    }

    /* Guarantee base font roles exist. Without them a var(--font-heading) in the
       component library resolves to nothing and the page renders in Times. */
    _ensureBaseStyles(css) {
        let out = String(css || '');
        if (!/font-family\s*:\s*var\(--font-body/.test(out)) {
            out += `\n\nbody{font-family:var(--font-body,'Manrope',system-ui,sans-serif);}`;
        }
        if (!/font-family\s*:\s*var\(--font-heading/.test(out)) {
            out += `\nh1,h2,h3,h4,.type-4,.type-5,.type-6,.type-7{font-family:var(--font-heading,'Instrument Serif',Georgia,serif);}`;
        }
        return out;
    }

    /* A Google Fonts <link> only helps if it reaches the HTML. A model that
       forgets it ships a serif-less page, so inject it when absent. */
    _ensureFontSetup(html, url) {
        const out = String(html || '');
        if (!url || /fonts\.googleapis\.com/.test(out)) return out;
        const tag = `<link rel="preconnect" href="https://fonts.googleapis.com">\n` +
            `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n` +
            `<link rel="stylesheet" href="${url}">`;
        if (/<head[^>]*>/i.test(out)) return out.replace(/<head([^>]*)>/i, `<head$1>\n${tag}`);
        return `${tag}\n${out}`;
    }

    /* Append a deterministic block only when it is absent, so the model's own
       output is not duplicated when it followed the brief. */
    _appendIfAbsent(source, block) {
        if (!block) return source;
        const probe = String(block).trim().slice(0, 120);
        if (probe && String(source).includes(probe)) return source;
        return `${source}\n\n${block}`;
    }

    /* Same as _appendIfAbsent but checks each block independently, so a model
       that included one deterministic block still gets the ones it dropped. */
    _appendAllIfAbsent(source, blocks) {
        return (blocks || []).filter(Boolean).reduce((acc, block) => this._appendIfAbsent(acc, block), source);
    }
}

window.CoderUIAgent = CoderUIAgent;
