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
* Noise-based distortion (simplex, perlin)
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
* Ray marching effects

LEVEL 5 — Post-Processing

* UnrealBloomPass for glow
* EffectComposer pipeline
* Custom render passes
* Depth of field

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
13. Dispose resources properly.
14. Add inline noise functions if needed.

PERFORMANCE GUIDELINES

* Prefer Points for particles.
* Prefer InstancedMesh for repeated geometry.
* Use Float32Array for buffer attributes.
* Minimize draw calls.
* Use Math.min(window.devicePixelRatio, 2) for pixel ratio.
* Throttle resize handling.
* Keep shader code compact and readable.
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
