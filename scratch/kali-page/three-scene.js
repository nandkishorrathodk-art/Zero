// Global init function
function initThreeScene(container) {
    if (!container || container.__threeRenderer || typeof THREE === 'undefined') return;
    /* ---------- Basic Three.js Setup ---------- */
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 400);
    const initialCameraZ = camera.position.z;

    /* ---------- Resize Handling ---------- */
    const onResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    onResize();

    /* ---------- Simple Particle Background ---------- */
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    /* ---------- Animation Loop ---------- */
    const animate = () => {
        particles.rotation.y += 0.0005;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };
    animate();

    /* ---------- Expose for external control ---------- */
    container.__threeCamera = camera;
    container.__threeScene = scene;
    container.__threeRenderer = renderer;
    container.__threeInitialCameraZ = initialCameraZ;
}