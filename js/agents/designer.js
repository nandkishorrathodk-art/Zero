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
