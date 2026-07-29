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
