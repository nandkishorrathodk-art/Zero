/* ============================================================
   PHYSICS AGENT — Generates Rapier3D physics integration
   for Three.js scenes: rigid bodies, colliders, constraints
   ============================================================ */

class CoderPhysicsAgent extends BaseAgent {
    constructor() {
        super(
            'CoderPhysics',
            'Generates Rapier3D physics for Three.js scenes'
        );

        this.config = {
            temperature: 0.6,
            maxTokens: 24576,
        };

        this.systemPrompt = `
You are an expert physics simulation developer using Rapier3D with Three.js.

CORE TECHNIQUE — Rapier3D Physics Integration

Rapier is a fast, deterministic physics engine compiled to WebAssembly.
CDN: loaded via importmap or global RAPIER from @dimforge/rapier3d-compat.

ARCHITECTURE

1. INITIALIZATION (async)
   - Import RAPIER from CDN or global
   - await RAPIER.init() — must be async, WASM needs to load
   - const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })

2. RIGID BODIES
   - RigidBodyDesc.dynamic() — affected by forces/gravity
   - RigidBodyDesc.fixed() — static, immovable (floors, walls)
   - RigidBodyDesc.kinematicPositionBased() — user-controlled movement
   - body.setTranslation({ x, y, z }, true)
   - body.setRotation({ x, y, z, w }, true) — quaternion

3. COLLIDERS
   - ColliderDesc.cuboid(hx, hy, hz) — box half-extents
   - ColliderDesc.ball(radius) — sphere
   - ColliderDesc.cylinder(halfHeight, radius)
   - ColliderDesc.capsule(halfHeight, radius)
   - ColliderDesc.trimesh(vertices, indices) — custom mesh
   - Attach to body: world.createCollider(colliderDesc, body)

4. SIMULATION LOOP
   - world.step() — advance simulation by one timestep
   - For each body: read position and rotation
   - Apply to corresponding Three.js mesh:
     mesh.position.copy(body.translation())
     mesh.quaternion.copy(body.rotation())

5. FORCES & IMPULSES
   - body.applyImpulse({ x, y, z }, true) — instant force
   - body.applyForce({ x, y, z }, true) — continuous force
   - body.setLinvel({ x, y, z }, true) — set velocity directly

6. CONSTRAINTS (joints)
   - RevoluteJoint — hinge
   - BallJoint — ball-and-socket
   - PrismaticJoint — slider
   - FixedJoint — weld

TEMPLATE PATTERN

async function initThreeScene(container) {
    // Three.js setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 100);
    
    // Rapier setup
    await RAPIER.init();
    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    
    // Ground (fixed)
    const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.1, 50), groundBody);
    const groundMesh = new THREE.Mesh(
        new THREE.BoxGeometry(100, 0.2, 100),
        new THREE.MeshStandardMaterial({ color: '#333' })
    );
    scene.add(groundMesh);
    
    // Dynamic objects
    const bodies = [];
    const meshes = [];
    for (let i = 0; i < 50; i++) {
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(Math.random()*10-5, 10+i*2, Math.random()*10-5);
        const body = world.createRigidBody(bodyDesc);
        world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), body);
        bodies.push(body);
        
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5) })
        );
        scene.add(mesh);
        meshes.push(mesh);
    }
    
    // Animation loop
    function animate() {
        world.step();
        for (let i = 0; i < bodies.length; i++) {
            const pos = bodies[i].translation();
            const rot = bodies[i].rotation();
            meshes[i].position.set(pos.x, pos.y, pos.z);
            meshes[i].quaternion.set(rot.x, rot.y, rot.z, rot.w);
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

CDN LOADING
Option 1 (script tag): <script src="https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.14.0/rapier.js"></script>
Then: const RAPIER = window.RAPIER;

Option 2 (dynamic import): const RAPIER = await import('https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.14.0/+esm');

RULES

1. Use THREE from global scope.
2. RAPIER from global scope (CDN loaded).
3. Function: initThreeScene(container) — must be async for RAPIER.init().
4. Always create a ground plane (fixed body).
5. Sync Three.js meshes with Rapier bodies every frame.
6. Add lighting (ambient + directional) for visible meshes.
7. Handle resize.
8. Dispose world, renderer, geometries, materials on cleanup.
9. Keep body count reasonable (50-200 for real-time).
10. Use BufferGeometry, not legacy Geometry.

PERFORMANCE
* 50-100 dynamic bodies is smooth on most devices
* Use simple colliders (cuboid, ball) over trimesh when possible
* world.step() with default timestep (1/60)
* Reuse materials and geometries via instancing when >20 identical shapes
`.trim();
    }

    buildPrompt(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();
        const wantsDominos = /domino|chain|cascade/i.test(blob);
        const wantsRagdoll = /ragdoll|character|body/i.test(blob);
        const wantsVehicle = /car|vehicle|wheel/i.test(blob);
        const wantsDestruction = /destruct|break|shatter|explode/i.test(blob);

        return `
Create a Three.js scene with Rapier3D physics.

CONTEXT
${JSON.stringify(specification.artDirection || {}, null, 2)}

PHYSICS TYPE
${wantsDominos ? '- Domino cascade / chain reaction' : ''}
${wantsRagdoll ? '- Ragdoll character with joints' : ''}
${wantsVehicle ? '- Vehicle with wheel constraints' : ''}
${wantsDestruction ? '- Destructible objects / shattering' : ''}
${!wantsDominos && !wantsRagdoll && !wantsVehicle && !wantsDestruction ? '- Falling objects onto ground plane with mouse interaction' : ''}

PALETTE
${JSON.stringify(specification.colorPalette || { primary: '#C84B31', secondary: '#173F5F' }, null, 2)}

REQUIREMENTS
* async function initThreeScene(container)
* await RAPIER.init() — RAPIER from global scope (CDN)
* Fixed ground body + dynamic objects (50-100)
* Sync mesh position/rotation from body.translation()/rotation() each frame
* Add ambient + directional lighting
* Mouse click to spawn new objects or apply impulses
* Transparent background (alpha: true)
* Handle resize
* Dispose everything on cleanup

OUTPUT: Only JavaScript code.
`.trim();
    }

    buildFallback(specification = {}) {
        const colors = specification.colorPalette || {};
        const primary = colors.primary || '#C84B31';
        const secondary = colors.secondary || '#173F5F';

        return `
async function initThreeScene(container) {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.set(0, 12, 20);
    camera.lookAt(0, 2, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    // Rapier init
    await RAPIER.init();
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    const world = new RAPIER.World(gravity);

    // Ground
    const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    world.createCollider(RAPIER.ColliderDesc.cuboid(25, 0.1, 25), groundBody);
    const groundMesh = new THREE.Mesh(
        new THREE.BoxGeometry(50, 0.2, 50),
        new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.9 })
    );
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Dynamic cubes
    const bodies = [];
    const meshes = [];
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const colors = [new THREE.Color('${primary}'), new THREE.Color('${secondary}'), new THREE.Color('#F6C85F')];

    function spawnBox(x, y, z) {
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(x, y, z)
            .setRotation({ x: Math.random()*0.5, y: Math.random()*0.5, z: Math.random()*0.5, w: 1 });
        const body = world.createRigidBody(bodyDesc);
        world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setRestitution(0.3).setFriction(0.7),
            body
        );

        const mat = new THREE.MeshStandardMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            roughness: 0.5,
            metalness: 0.3,
        });
        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        bodies.push(body);
        meshes.push(mesh);
    }

    // Initial spawn
    for (let i = 0; i < 60; i++) {
        spawnBox(
            (Math.random() - 0.5) * 8,
            5 + i * 1.5,
            (Math.random() - 0.5) * 8
        );
    }

    // Mouse click to spawn
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    container.addEventListener('click', function(e) {
        const rect = container.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const dir = raycaster.ray.direction;
        spawnBox(dir.x * 5, 15, dir.z * 5);
    });

    // Animation
    const clock = new THREE.Clock();
    function animate() {
        world.step();

        for (let i = 0; i < bodies.length; i++) {
            const pos = bodies[i].translation();
            const rot = bodies[i].rotation();
            meshes[i].position.set(pos.x, pos.y, pos.z);
            meshes[i].quaternion.set(rot.x, rot.y, rot.z, rot.w);

            // Remove fallen objects
            if (pos.y < -20) {
                scene.remove(meshes[i]);
                meshes[i].material.dispose();
                world.removeRigidBody(bodies[i]);
                bodies.splice(i, 1);
                meshes.splice(i, 1);
                i--;
            }
        }

        const t = clock.getElapsedTime();
        camera.position.x = Math.sin(t * 0.15) * 20;
        camera.position.z = Math.cos(t * 0.15) * 20;
        camera.lookAt(0, 3, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // Resize
    function onResize() {
        const nw = container.clientWidth || window.innerWidth;
        const nh = container.clientHeight || window.innerHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', onResize);

    // Cleanup
    return function dispose() {
        window.removeEventListener('resize', onResize);
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].material.dispose();
        }
        boxGeo.dispose();
        world.free();
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
            hasRapierInit: /RAPIER\.init\(\)|rapier.*init/i.test(text),
            hasWorld: /new\s+RAPIER\.World/i.test(text),
            hasRigidBody: /RigidBodyDesc/i.test(text),
            hasCollider: /ColliderDesc/i.test(text),
            hasStep: /world\.step\(\)/i.test(text),
            hasSync: /translation\(\)|rotation\(\)/i.test(text),
        };
    }

    async execute(specification = {}, designSystem = null) {
        this.log('info', 'Generating Rapier3D physics scene...');

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Physics LLM call failed: ${error.message} — using fallback`);
            return this.buildFallback(specification);
        }

        let code = this.extractCode(response, 'javascript');
        code = String(code || '').trim()
            .replace(/^```(?:javascript|js)?\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        const validation = this.validateCode(code);

        if (!validation.hasEntryPoint || !validation.hasRapierInit || !validation.hasWorld || !validation.hasStep) {
            this.log('warning', 'Generated physics code incomplete — using fallback');
            return this.buildFallback(specification);
        }

        this.log('success', 'Rapier3D physics scene generated');
        return code;
    }
}

if (typeof window !== 'undefined') {
    window.CoderPhysicsAgent = CoderPhysicsAgent;
}
