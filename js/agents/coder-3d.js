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
