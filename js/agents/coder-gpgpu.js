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
        output = output.replace(/^```(?:javascript|js)?\\s*/i, '').replace(/```$/i, '').trim();
        if (!/\\bfunction\\s+initThreeScene\\s*\\(/.test(output) && !/\\bconst\\s+initThreeScene\\s*=/.test(output)) {
            output = `function initThreeScene(container) {\\n${output}\\n}`;
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
