/* ============================================================
   ANIMATED CANVAS BACKGROUND — ZERO-BUILDER Studio
   Kinetic particle mesh + fluid glowing waves + interactive gravity
   Upgraded: cleanup, DPR handling, resize safety, smoother physics
   ============================================================ */

class StudioBackgroundCanvas {
    constructor(canvasId = 'studio-bg-canvas', options = {}) {
        this.canvasId = canvasId;
        this.options = {
            opacity: 0.6,
            zIndex: -1,
            particleCap: 90,
            lineDistance: 130,
            mouseRadius: 180,
            mouseForce: 2.4,
            nodeSpacing: 64,
            waveStrength: 18,
            dprCap: 2,
            colors: {
                glowA: 'rgba(124, 58, 237, 0.04)',
                glowB: 'rgba(14, 165, 233, 0.02)',
                particle: ['260', '200'],
                line: 'rgba(139, 92, 246, 0.20)',
            },
            ...options,
        };

        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.options.dprCap);

        this.particles = [];
        this.gridNodes = [];

        this.mouse = {
            x: -1000,
            y: -1000,
            vx: 0,
            vy: 0,
            radius: this.options.mouseRadius,
            active: false,
        };

        this.time = 0;
        this.lastFrame = 0;
        this.animId = null;
        this.running = false;

        this._boundResize = this.resize.bind(this);
        this._boundPointerMove = this._onPointerMove.bind(this);
        this._boundPointerLeave = this._onPointerLeave.bind(this);
        this._boundVisibility = this._onVisibilityChange.bind(this);

        this.init();
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);

        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = this.canvasId;
            this.canvas.setAttribute('aria-hidden', 'true');
            this.canvas.style.position = 'fixed';
            this.canvas.style.inset = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = String(this.options.zIndex);
            this.canvas.style.opacity = String(this.options.opacity);
            this.canvas.style.mixBlendMode = 'screen';
            this.canvas.style.filter = 'saturate(1.05) contrast(1.02)';
            this.canvas.style.transform = 'translateZ(0)';
            document.body.prepend(this.canvas);
        }

        const context = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        if (!context) {
            throw new Error('StudioBackgroundCanvas: 2D canvas context unavailable');
        }

        this.ctx = context;

        this.resize();
        this.createParticles();
        this.createGrid();

        window.addEventListener('resize', this._boundResize, { passive: true });
        window.addEventListener('mousemove', this._boundPointerMove, { passive: true });
        window.addEventListener('mouseleave', this._boundPointerLeave, { passive: true });
        window.addEventListener('blur', this._boundPointerLeave, { passive: true });
        document.addEventListener('visibilitychange', this._boundVisibility, { passive: true });

        this.running = true;
        this.lastFrame = performance.now();
        this.animate(this.lastFrame);
    }

    destroy() {
        this.running = false;

        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }

        window.removeEventListener('resize', this._boundResize);
        window.removeEventListener('mousemove', this._boundPointerMove);
        window.removeEventListener('mouseleave', this._boundPointerLeave);
        window.removeEventListener('blur', this._boundPointerLeave);
        document.removeEventListener('visibilitychange', this._boundVisibility);

        if (this.canvas?.parentNode && this.canvas.id === this.canvasId) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    resize() {
        if (!this.canvas) return;

        this.width = Math.max(1, window.innerWidth);
        this.height = Math.max(1, window.innerHeight);
        this.dpr = Math.min(window.devicePixelRatio || 1, this.options.dprCap);

        this.canvas.width = Math.round(this.width * this.dpr);
        this.canvas.height = Math.round(this.height * this.dpr);

        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.createParticles();
        this.createGrid();
    }

    createParticles() {
        this.particles = [];
        const density = Math.floor((this.width * this.height) / 18000);
        const count = Math.max(24, Math.min(this.options.particleCap, density));

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                radius: Math.random() * 1.8 + 0.8,
                alpha: Math.random() * 0.35 + 0.18,
                hue: Math.random() > 0.55 ? 260 : 200,
                phase: Math.random() * Math.PI * 2,
                drift: Math.random() * 0.6 + 0.2,
            });
        }
    }

    createGrid() {
        this.gridNodes = [];
        const spacing = this.options.nodeSpacing;
        const cols = Math.max(4, Math.ceil(this.width / spacing) + 1);
        const rows = Math.max(4, Math.ceil(this.height / spacing) + 1);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.gridNodes.push({
                    gx: x,
                    gy: y,
                    x: x * spacing,
                    y: y * spacing,
                    ox: x * spacing,
                    oy: y * spacing,
                    a: Math.random() * Math.PI * 2,
                    s: Math.random() * 0.6 + 0.4,
                });
            }
        }
    }

    _onPointerMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.active = true;
    }

    _onPointerLeave() {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        this.mouse.active = false;
    }

    _onVisibilityChange() {
        if (document.hidden) {
            this._onPointerLeave();
        }
    }

    _noise(x, y, t) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + t * 0.8) * 43758.5453;
        return n - Math.floor(n);
    }

    _easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    _drawBackground() {
        const { ctx, width: w, height: h } = this;
        const grad = ctx.createRadialGradient(
            w * 0.5,
            h * 0.3,
            Math.max(60, Math.min(w, h) * 0.08),
            w * 0.5,
            h * 0.5,
            Math.max(w, h)
        );

        grad.addColorStop(0, this.options.colors.glowA);
        grad.addColorStop(0.5, this.options.colors.glowB);
        grad.addColorStop(1, 'rgba(9, 9, 11, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    _updateGridNode(node, dt) {
        const t = this.time;
        const wave = Math.sin((node.ox * 0.008) + t * 0.9 + node.a) * this.options.waveStrength;
        const waveY = Math.cos((node.oy * 0.01) + t * 0.7 + node.a) * this.options.waveStrength * 0.7;

        let mx = 0;
        let my = 0;

        if (this.mouse.active) {
            const dx = this.mouse.x - node.ox;
            const dy = this.mouse.y - node.oy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
            const force = Math.max(0, 1 - dist / this.mouse.radius);
            const repel = force * force * 16;
            mx = -(dx / dist) * repel;
            my = -(dy / dist) * repel;
        }

        const targetX = node.ox + wave + mx;
        const targetY = node.oy + waveY + my;

        node.x += (targetX - node.x) * Math.min(1, dt * 7.5);
        node.y += (targetY - node.y) * Math.min(1, dt * 7.5);
    }

    _drawGrid() {
        const { ctx } = this;
        const cols = Math.max(4, Math.ceil(this.width / this.options.nodeSpacing) + 1);
        const rows = Math.max(4, Math.ceil(this.height / this.options.nodeSpacing) + 1);

        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';

        const getNode = (x, y) => this.gridNodes[y * cols + x];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const node = getNode(x, y);
                if (!node) continue;

                if (x < cols - 1) {
                    const right = getNode(x + 1, y);
                    if (right) {
                        const dx = node.x - right.x;
                        const dy = node.y - right.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const alpha = Math.max(0, 0.12 - dist / 900);
                        if (alpha > 0.01) {
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(right.x, right.y);
                            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                            ctx.stroke();
                        }
                    }
                }

                if (y < rows - 1) {
                    const below = getNode(x, y + 1);
                    if (below) {
                        const dx = node.x - below.x;
                        const dy = node.y - below.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const alpha = Math.max(0, 0.12 - dist / 900);
                        if (alpha > 0.01) {
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(below.x, below.y);
                            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        for (const node of this.gridNodes) {
            const alpha = Math.max(0, 0.12 - Math.abs(Math.sin(node.a + this.time * 0.5)) * 0.08);
            if (alpha <= 0.01) continue;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }
    }

    _drawParticles() {
        const { ctx } = this;
        const mouseRadius = this.mouse.radius;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Mild drift with time-based motion
            const wobble = Math.sin(this.time * 0.8 + p.phase) * 0.03;
            p.vx += wobble * p.drift * 0.005;
            p.vy += Math.cos(this.time * 0.7 + p.phase) * 0.005 * p.drift;

            p.x += p.vx;
            p.y += p.vy;

            // Soft bounds
            if (p.x < -20) p.x = this.width + 20;
            if (p.x > this.width + 20) p.x = -20;
            if (p.y < -20) p.y = this.height + 20;
            if (p.y > this.height + 20) p.y = -20;

            // Mouse gravity / repulsion
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq) || 0.0001;

            if (dist < mouseRadius) {
                const force = 1 - dist / mouseRadius;
                const repel = force * force * this.options.mouseForce;
                p.vx -= (dx / dist) * repel * 0.05;
                p.vy -= (dy / dist) * repel * 0.05;
            }

            // Damping
            p.vx *= 0.993;
            p.vy *= 0.993;

            // Particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
            ctx.fill();

            // Connection lines — lightweight with short distance only
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const pdx = p.x - p2.x;
                const pdy = p.y - p2.y;
                const pdistSq = pdx * pdx + pdy * pdy;

                if (pdistSq > this.options.lineDistance * this.options.lineDistance) continue;

                const pdist = Math.sqrt(pdistSq) || 0.0001;
                const lineAlpha = (1 - pdist / this.options.lineDistance) * 0.2;

                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }

    animate(now) {
        if (!this.running) return;

        const dt = Math.min(0.033, (now - this.lastFrame) / 1000 || 0.016);
        this.lastFrame = now;
        this.time += dt;

        const { ctx, width: w, height: h } = this;
        if (!ctx) {
            this.animId = requestAnimationFrame((t) => this.animate(t));
            return;
        }

        ctx.clearRect(0, 0, w, h);
        this._drawBackground();

        // Update and render grid
        for (const node of this.gridNodes) {
            this._updateGridNode(node, dt);
        }
        this._drawGrid();

        // Update and render particles
        this._drawParticles();

        this.animId = requestAnimationFrame((t) => this.animate(t));
    }
}

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.studioBg = new StudioBackgroundCanvas();
    });
} else {
    window.studioBg = new StudioBackgroundCanvas();
}