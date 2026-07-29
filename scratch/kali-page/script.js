/* ============================================================
   ZERO-BUILDER V2 — Cinematic GSAP + Lenis Boilerplate
   ============================================================ */
'use strict';

/* ============================================================
   1. Lenis Smooth Scroll
   ============================================================ */
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

/* ============================================================
   2. GSAP + ScrollTrigger
   ============================================================ */
if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    /* 2.1. Scroll‑reveal for [data-animate] elements */
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

/* ============================================================
   3. Page Loader & UI Interactions
   ============================================================ */
function initUIInteractions() {
    // Hide Loader
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }, 300);
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            menu.classList.toggle('active');
        });
    }

    // Tab Switcher
    const tabs = document.querySelectorAll('.tabs .tab');
    const panels = document.querySelectorAll('.tab-panels .panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.dataset.panel;
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // Accordion Toggle
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.accordion-item');
            const panel = item?.querySelector('.accordion-panel');
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
            if (panel) {
                panel.hidden = isExpanded;
                panel.style.display = isExpanded ? 'none' : 'block';
            }
        });
    });

    // Pricing Tier Toggle
    const tierToggle = document.getElementById('tier-toggle');
    const tierLabel = document.getElementById('tier-label');
    if (tierToggle) {
        tierToggle.addEventListener('change', () => {
            const isAnnual = tierToggle.checked;
            if (tierLabel) tierLabel.textContent = isAnnual ? 'Annual Billing (20% OFF)' : 'Monthly Billing';
            const studioPrice = document.querySelector('#tier-studio .tier-price');
            if (studioPrice) {
                studioPrice.textContent = isAnnual ? '$23 / mo' : '$29 / mo';
            }
        });
    }
}

/* ============================================================
   4. Scroll‑Scrub‑Camera
   ============================================================ */
function initScrollScrubCamera() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hero = document.querySelector('[data-scene="hero"]');
    if (!hero) return;
    const canvas = hero.querySelector('#three-canvas');
    if (!canvas || !canvas.__threeCamera) return;
    const camera = canvas.__threeCamera;
    const startZ = canvas.__threeInitialCameraZ;
    const endZ = 200; // closer on scroll

    ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: self => {
            const progress = self.progress;
            camera.position.z = startZ - (startZ - endZ) * progress;
            camera.rotation.y = progress * 0.2;
        }
    });
}

/* ============================================================
   5. Magnetic‑Quickto‑CTA
   ============================================================ */
function initMagneticButtons() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('[data-magnet]').forEach(btn => {
        const strength = parseFloat(btn.dataset.magnet) || 0.3;
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.3, ease: "power2.out" });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.3, ease: "power2.out" });
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            xTo(x * strength);
            yTo(y * strength);
        });
        btn.addEventListener('mouseleave', () => {
            xTo(0);
            yTo(0);
        });
    });
}

/* ============================================================
   6. Parallax‑Media‑Layers
   ============================================================ */
function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layers = document.querySelectorAll('[data-parallax]');
    let mouse = { x: 0, y: 0 }, current = { x: 0, y: 0 };
    document.addEventListener('mousemove', e => {
        mouse.x = (e.clientX / window.innerWidth) - 0.5;
        mouse.y = (e.clientY / window.innerHeight) - 0.5;
    });
    function animate() {
        current.x += (mouse.x - current.x) * 0.05;
        current.y += (mouse.y - current.y) * 0.05;
        layers.forEach(layer => {
            const depth = parseFloat(layer.dataset.parallax) || 1;
            layer.style.transform = `translate(${current.x * depth * 60}px, ${current.y * depth * 60}px)`;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ============================================================
   7. Grain‑Vignette‑Grade
   ============================================================ */
function initGrainVignette() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const grain = document.querySelector('.film-grain');
    const vignette = document.querySelector('.vignette');
    if (!grain || !vignette) return;

    ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: self => {
            const progress = self.progress;
            grain.style.opacity = 0.02 + 0.08 * progress;
            vignette.style.opacity = 0.1 + 0.4 * progress;
        }
    });
}

/* ============================================================
   8. Counter Micro‑Interaction
   ============================================================ */
function initCounters() {
    document.querySelectorAll('[data-micro="counter"]').forEach(counter => {
        const target = parseInt(counter.dataset.target);
        if (isNaN(target)) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: () => {
                            counter.textContent = Math.round(obj.val).toLocaleString();
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(counter);
    });
}

/* ============================================================
   9. Reduced‑Motion Respect
   ============================================================ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (typeof lenis !== 'undefined' && lenis) lenis.destroy();
    document.documentElement.style.setProperty('--duration-fast', '0.01ms');
    document.documentElement.style.setProperty('--duration-base', '0.01ms');
    document.documentElement.style.setProperty('--duration-slow', '0.01ms');
}

/* ============================================================
   10. Init All on DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initUIInteractions();
    initScrollScrubCamera();
    initMagneticButtons();
    initParallax();
    initGrainVignette();
    initCounters();
});