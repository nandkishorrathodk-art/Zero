/* ============================================================
   REACT CODER AGENT — Generates React 18 + Vite + R3F + Drei
   + Tailwind CSS v3 + GSAP + Framer Motion projects
   ============================================================ */

class CoderReactAgent extends BaseAgent {
    constructor() {
        super('CoderReact', 'Generates React + Vite + React Three Fiber projects');

        /* Hardcoded known-good versions — NEVER let the LLM pick these */
        this.packageVersions = {
            'react': '^18.3.1',
            'react-dom': '^18.3.1',
            '@react-three/fiber': '^8.17.10',
            '@react-three/drei': '^9.114.3',
            'three': '^0.165.0',
            'gsap': '^3.12.5',
            'framer-motion': '^11.11.17',
            '@emailjs/browser': '^4.4.1',
            'react-router-dom': '^6.26.2',
        };

        this.devVersions = {
            '@vitejs/plugin-react': '^4.3.4',
            'vite': '^5.4.11',
            'tailwindcss': '^3.4.13',
            'autoprefixer': '^10.4.20',
            'postcss': '^8.4.47',
        };

        this.systemPrompt = `You are a principal React engineer who ships production SPAs and dashboards using React 18, Vite, Tailwind CSS v3, GSAP, and Framer Motion. Output complete multi-file projects — never thin single-file demos or recovery shells. Use React Three Fiber only when the brief explicitly needs 3D.

TECH STACK (FIXED — do NOT change versions):
- React 18.3.1 + ReactDOM
- Vite 5 with @vitejs/plugin-react
- React Three Fiber (R3F) 8.x + Drei 9.x + Three.js 0.165 (optional; only for a purposeful 3D scene)
- Tailwind CSS 3.4 with PostCSS + Autoprefixer
- GSAP 3.12 (useGSAP hook pattern)
- Framer Motion 11 for page transitions and micro-animations
- @emailjs/browser for contact forms (no backend needed)
- react-router-dom 6 (optional, for multi-page)

YOUR QUALITY STANDARDS:
- Modern functional components with React Hooks (useState, useEffect, useRef, useMemo)
- Clean component architecture (components in logical files)
- Tailwind CSS for ALL styling (never use plain CSS files)
- Framer Motion for advanced animations and page transitions
- Lucide React for modern, beautiful icons
- Clean code with helpful comments explaining WHY, not just WHAT
- Premium, art-directed aesthetics chosen for the actual category. Do not default to bento boxes, glassmorphism, gradients, or 3D.
- Huge Typography and generous whitespace/padding (never cramped)
- Premium interactions (hover effects, micro-animations, transitions)
- Responsive design (mobile-first, works at 375px to 1440px+)
- Component architecture: small, focused, reusable components
- Performance: React.memo, useMemo for expensive 3D computations
- Accessibility: proper ARIA labels, keyboard navigation

COMPONENT PATTERNS:
\`\`\`jsx
// R3F Scene Component
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, OrbitControls } from '@react-three/drei'

function Scene() {
  const meshRef = useRef()
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5
  })
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <Float speed={2} rotationIntensity={1}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1, 4]} />
          <meshStandardMaterial color="#8B5CF6" wireframe />
        </mesh>
      </Float>
      <Stars radius={100} depth={50} count={1000} />
      <OrbitControls enableZoom={false} autoRotate />
    </Canvas>
  )
}
\`\`\`

\`\`\`jsx
// GSAP Animation Hook
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

function AnimatedSection({ children }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current.children, {
        y: 60, opacity: 0, duration: 1, stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' }
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return <div ref={ref}>{children}</div>
}
\`\`\`

\`\`\`jsx
// Magnet Component (Framer Motion)
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function Magnet({ children, padding = 100, disabled = false }) {
  const [isActive, setIsActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    if (disabled || !ref.current) return
    const { clientX, clientY } = e
    const { width, height, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 })
  }

  const reset = () => { setIsActive(false); setPosition({ x: 0, y: 0 }) }
  const handleMouseEnter = () => setIsActive(true)

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  )
}
\`\`\`

\`\`\`jsx
// Scroll-Driven Animated Text
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

function AnimatedText({ text }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] })
  const characters = text.split("")
  
  return (
    <p ref={ref}>
      {characters.map((char, i) => {
        const start = i / characters.length
        const end = start + (1 / characters.length)
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1])
        return <motion.span style={{ opacity }} key={i}>{char}</motion.span>
      })}
    </p>
  )
}
\`\`\`

RULES:
1. BEFORE outputting code, write out your step-by-step reasoning inside <thinking>...</thinking> tags. Plan the components, tailwind classes, animations, and architecture.
2. CRITICAL: You MUST NOT output JSON. Instead, output each file as a Markdown code block preceded by its exact file path in bold.
3. ALL styling must use Tailwind CSS utility classes. DO NOT output plain .css files except index.css for Tailwind directives.
4. If Three.js code is provided, integrate it using React Three Fiber.
5. The website must follow the provided art direction and feel intentionally designed, not like a generic AI landing-page template.
6. Use advanced components only when the art direction calls for them. Do not automatically add Magnet buttons, marquees, 3D scenes, glass cards, or sticky cards.
7. Use fluid typography exclusively for large text (e.g. text-[clamp(2rem,8vw,8rem)]).
8. Use HUGE padding and whitespace (e.g., py-24, gap-12). Websites must breathe.
9. Animate only the supplied motion plan and provide reduced-motion behavior.
10. Create reusable UI components (e.g., Button, Card, Section, Magnet, FadeIn) in a /src/components folder.
11. NEVER use generic borders; use border-white/10 or subtle gradients for borders (glassmorphism).
12. GSAP must use context + revert pattern for cleanup.
13. All interactive elements must be FULLY WORKING with proper error boundaries for 3D scenes.
14. Use CSS custom properties in tailwind.config.js for the design system colors.

OUTPUT FORMAT:
**File: package.json**
\`\`\`json
{
  "name": "project",
  "dependencies": { ... }
}
\`\`\`

**File: src/App.jsx**
\`\`\`jsx
export default function App() { return <div>Home</div> }
\`\`\`
`;
    }

    async execute(specification, designSystem, threejsCode = null) {
        this.log('info', `Generating React + Vite + R3F project [${specification.complexity || 'premium'}]...`);

        const sections = specification.sections || ['hero', 'features', 'about', 'projects', 'contact', 'footer'];
        const interactiveComponents = specification.interactiveComponents || [];
        const isComplex = ['complex', 'ultra-complex'].includes(specification.complexity);
        const colors = specification.colorPalette || {};

        const pages = Array.isArray(specification.pages) ? specification.pages : [];
        const architecture = specification.appArchitecture || {};
        const needsRouter = pages.length > 1 || isComplex || ['webapp', 'dashboard', 'saas-app', 'admin-panel'].includes(specification.siteType);

        const midFlight = Array.isArray(specification.midFlightNotes) && specification.midFlightNotes.length
            ? `\nMID-FLIGHT USER NOTES (must honor):\n${specification.midFlightNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`
            : '';

        const message = `Build a COMPLETE production React + Vite project (multi-file, large enough for real products):

SITE TYPE: ${specification.siteType}
COMPLEXITY: ${specification.complexity || 'complex'}
TITLE: ${specification.title || 'Premium Website'}
DESCRIPTION: ${specification.description || ''}
MOOD: ${specification.mood || 'editorial'}
${midFlight}
ART DIRECTION (follow this exactly):
${JSON.stringify(specification.artDirection || {}, null, 2)}

BRAND STRATEGY + APPROVED COPY:
${JSON.stringify(specification.brandStrategy || {}, null, 2)}

SIGNATURE QUALITY CONTRACT (non-negotiable):
${JSON.stringify(specification.qualityContract || {}, null, 2)}

AUTONOMOUS STUDIO INTELLIGENCE (implement the primary outcome and obey the motion policy):
${JSON.stringify(specification.studioIntelligence || {}, null, 2)}

APP ARCHITECTURE:
${JSON.stringify(architecture, null, 2)}

PAGES / ROUTES:
${JSON.stringify(pages, null, 2)}

SECTIONS (create a component for each where relevant):
${sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

INTERACTIVE COMPONENTS:
${interactiveComponents.map((c, i) => `${i + 1}. ${c}`).join('\n')}

COLOR PALETTE (use in tailwind.config.js extend.colors):
- Primary: ${colors.primary || '#C84B31'}
- Secondary: ${colors.secondary || '#173F5F'}
- Accent: ${colors.accent || '#F6C85F'}
- Background: ${colors.background || '#0B0B0C'}
- Surface: ${colors.surface || '#141416'}

TYPOGRAPHY:
- Heading: ${specification.typography?.heading || 'Instrument Serif'}
- Body: ${specification.typography?.body || 'Manrope'}

3D EFFECTS: ${specification.has3D ? 'YES — include a purposeful React Three Fiber <Canvas> scene with ' + (specification.threeDEffects || ['particles', 'floating-geometry']).join(', ') : 'NO — skip R3F'}

ANIMATIONS: ${(specification.artDirection?.motionPlan || specification.animations || []).slice(0, 3).join(', ')}

PACKAGE.JSON — use EXACTLY these versions (do NOT change):
${JSON.stringify({ dependencies: this.packageVersions, devDependencies: this.devVersions }, null, 2)}

CRITICAL INSTRUCTIONS:
- Split UI into multiple files under src/components/ (minimum 5 components for complex builds)
- ${needsRouter ? 'Use react-router-dom with real routes matching PAGES/ROUTES (Home + App/Dashboard at minimum)' : 'Single-page marketing layout is OK if pages length is 1'}
- For dashboards/apps: sidebar layout, stats, table/list, empty/loading states, local state or context
- Tailwind for ALL styling; Framer Motion + GSAP only where the motion plan requires
- Contact form with EmailJS placeholders when marketing pages exist
- Responsive, accessible, SEO meta in index.html
- Awwwards-level marketing surfaces; product surfaces must feel real (not fake SaaS metrics)
- NEVER output recovery shells, Lorem Ipsum, or single 20-line App.jsx as the whole product

Return each file as a Markdown code block preceded by its exact path. Do not return JSON.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.55,
            maxTokens: 32768,
        });

        try {
            const files = this.extractFiles(response);

            // Ensure package.json has correct versions
            if (files['package.json']) {
                files['package.json'] = this._fixPackageJson(files['package.json'], specification);
            } else {
                files['package.json'] = this._generatePackageJson(specification);
            }

            // Ensure critical config files exist
            if (!files['vite.config.js']) files['vite.config.js'] = this._defaultViteConfig();
            if (!files['postcss.config.js']) files['postcss.config.js'] = this._defaultPostCSSConfig();
            if (!files['tailwind.config.js']) files['tailwind.config.js'] = this._defaultTailwindConfig(colors);
            if (!files['index.html']) files['index.html'] = this._defaultIndexHtml(specification);
            if (!files['src/main.jsx']) files['src/main.jsx'] = this._defaultMainJsx();
            if (!files['src/index.css']) files['src/index.css'] = this._defaultIndexCss();

            const componentCount = Object.keys(files).filter(f => f.includes('components/')).length;
            const total = Object.values(files).join('').length;
            if (total < 6000) {
                throw new Error(`React project too thin (${total} chars). Need multi-file production output.`);
            }
            if (isComplex && componentCount < 3) {
                throw new Error(`Complex React build only produced ${componentCount} components — insufficient structure.`);
            }

            this.log('success', `React project generated: ${Object.keys(files).length} files, ${componentCount} components`);
            return files;
        } catch (e) {
            if (e?.message === 'ABORTED') throw e;
            this.log('error', `React generation failed (no weak fallback): ${e.message}`);
            throw e;
        }
    }

    /* ===== FIX PACKAGE.JSON WITH KNOWN-GOOD VERSIONS ===== */
    _fixPackageJson(pkgJsonStr, spec) {
        try {
            const pkg = typeof pkgJsonStr === 'string' ? JSON.parse(pkgJsonStr) : pkgJsonStr;

            // Force correct versions
            pkg.dependencies = pkg.dependencies || {};
            Object.assign(pkg.dependencies, this.packageVersions);

            // Only include R3F if 3D is needed
            if (!spec.has3D) {
                delete pkg.dependencies['@react-three/fiber'];
                delete pkg.dependencies['@react-three/drei'];
                delete pkg.dependencies['three'];
            }

            pkg.devDependencies = pkg.devDependencies || {};
            Object.assign(pkg.devDependencies, this.devVersions);

            return JSON.stringify(pkg, null, 2);
        } catch (e) {
            return this._generatePackageJson(spec);
        }
    }

    _generatePackageJson(spec) {
        const deps = { ...this.packageVersions };
        if (!spec.has3D) {
            delete deps['@react-three/fiber'];
            delete deps['@react-three/drei'];
            delete deps['three'];
        }

        return JSON.stringify({
            name: (spec.title || 'premium-website').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            private: true,
            version: '1.0.0',
            type: 'module',
            scripts: {
                dev: 'vite',
                build: 'vite build',
                preview: 'vite preview',
            },
            dependencies: deps,
            devDependencies: this.devVersions,
        }, null, 2);
    }

    _defaultViteConfig() {
        return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;
    }

    _defaultPostCSSConfig() {
        return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    }

    _defaultTailwindConfig(colors) {
        return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '${colors.primary || '#8B5CF6'}',
        secondary: '${colors.secondary || '#06D6A0'}',
        accent: '${colors.accent || '#F59E0B'}',
        dark: {
          DEFAULT: '${colors.background || '#0A0A0F'}',
          surface: '${colors.surface || '#1A1A2E'}',
          hover: '#22223A',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
`;
    }

    _defaultIndexHtml(spec) {
        return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${spec.title || 'Premium Website'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-dark text-white antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
    }

    _defaultMainJsx() {
        return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`;
    }

    _defaultIndexCss() {
        return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
  }
  body {
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
}
`;
    }

    /* ===== FALLBACK: Generate a complete React project from scratch ===== */
    _generateFallback(spec, design) {
        const title = spec.title || 'Premium Website';
        const colors = spec.colorPalette || {};
        const primary = colors.primary || '#8B5CF6';
        const secondary = colors.secondary || '#06D6A0';

        const files = {};

        files['package.json'] = this._generatePackageJson(spec);
        files['vite.config.js'] = this._defaultViteConfig();
        files['postcss.config.js'] = this._defaultPostCSSConfig();
        files['tailwind.config.js'] = this._defaultTailwindConfig(colors);
        files['index.html'] = this._defaultIndexHtml(spec);
        files['src/main.jsx'] = this._defaultMainJsx();
        files['src/index.css'] = this._defaultIndexCss();

        files['src/App.jsx'] = `import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </div>
  )
}
`;

        files['src/components/Navbar.jsx'] = `import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['About', 'Projects', 'Contact']

  return (
    <nav className={\`fixed top-0 w-full z-50 transition-all duration-500 \${scrolled ? 'bg-dark/80 backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'}\`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="text-xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          ${title}
        </a>
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <a key={link} href={\`#\${link.toLowerCase()}\`}
               className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              {link}
            </a>
          ))}
          <a href="#contact" className="ml-3 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
            Get in Touch
          </a>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
          <span className={\`w-5 h-0.5 bg-white transition-all \${mobileOpen ? 'rotate-45 translate-y-2' : ''}\`} />
          <span className={\`w-5 h-0.5 bg-white transition-all \${mobileOpen ? 'opacity-0' : ''}\`} />
          <span className={\`w-5 h-0.5 bg-white transition-all \${mobileOpen ? '-rotate-45 -translate-y-2' : ''}\`} />
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-dark/95 backdrop-blur-xl border-b border-white/5 p-6 flex flex-col gap-4">
          {links.map(link => (
            <a key={link} href={\`#\${link.toLowerCase()}\`}
               onClick={() => setMobileOpen(false)}
               className="text-lg text-white/70 hover:text-white">{link}</a>
          ))}
        </div>
      )}
    </nav>
  )
}
`;

        files['src/components/Hero.jsx'] = `import { motion } from 'framer-motion'
import Scene from './Scene'

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-8">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Welcome to the future
        </motion.div>
        <motion.h1 initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-none mb-6 bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
          ${title}
        </motion.h1>
        <motion.p initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
          ${spec.description || 'A premium digital experience built with cutting-edge technology.'}
        </motion.p>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex gap-4 justify-center flex-wrap">
          <a href="#projects" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
            View Projects
          </a>
          <a href="#about" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:-translate-y-1">
            Learn More
          </a>
        </motion.div>
      </div>
    </section>
  )
}
`;

        files['src/components/Scene.jsx'] = `import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function Particles({ count = 800 }) {
  const mesh = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  useFrame((state) => {
    mesh.current.rotation.y = state.clock.elapsedTime * 0.05
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#8B5CF6" sizeAttenuation transparent opacity={0.8} />
    </points>
  )
}

function FloatingShape() {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 0.2
    ref.current.rotation.y += delta * 0.3
  })
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.2, 4]} />
        <meshStandardMaterial color="#8B5CF6" wireframe transparent opacity={0.3} />
      </mesh>
    </Float>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#8B5CF6" />
      <Particles />
      <FloatingShape />
      <Stars radius={100} depth={60} count={1500} factor={3} saturation={0} fade speed={1} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  )
}
`;

        files['src/components/About.jsx'] = `import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function About() {
  const stats = [
    { value: 500, suffix: '+', label: 'Projects' },
    { value: 99, suffix: '%', label: 'Satisfaction' },
    { value: 50, suffix: '+', label: 'Awards' },
    { value: 10, suffix: 'K+', label: 'Users' },
  ]

  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">About</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              Built for Teams That <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Demand Excellence</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-10">
              We combine cutting-edge technology with timeless design principles to create digital experiences that inspire and perform.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-3xl font-display font-bold text-white">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }} transition={{ duration: 0.8 }}
                      className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5 relative overflow-hidden">
            <div className="absolute w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/30 rounded-full blur-[80px] animate-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
`;

        files['src/components/Projects.jsx'] = `import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const projects = [
  { id: 1, title: 'Aurora Dashboard', desc: 'AI-powered analytics platform with real-time data visualization', tags: ['React', 'Three.js', 'AI'], color: 'from-violet-600 to-indigo-600' },
  { id: 2, title: 'NeoCommerce', desc: 'Next-gen e-commerce with 3D product previews and AR try-on', tags: ['Next.js', 'R3F', 'Stripe'], color: 'from-emerald-600 to-teal-600' },
  { id: 3, title: 'SynthWave OS', desc: 'Retro-futuristic desktop environment for the browser', tags: ['React', 'WebGL', 'WASM'], color: 'from-pink-600 to-rose-600' },
  { id: 4, title: 'DataForge', desc: 'Visual data pipeline builder with drag-and-drop nodes', tags: ['React Flow', 'D3.js', 'Python'], color: 'from-amber-600 to-orange-600' },
]

function ProjectCard({ project, index }) {
  const [hover, setHover] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -15, y: x * 15 })
  }

  return (
    <motion.div initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseMove={handleMouse} onMouseEnter={() => setHover(true)}
                onMouseLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }); }}
                style={{ transform: \`perspective(1000px) rotateX(\${tilt.x}deg) rotateY(\${tilt.y}deg)\` }}
                className="group relative rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className={\`h-48 bg-gradient-to-br \${project.color} opacity-80 group-hover:opacity-100 transition-opacity\`} />
      <div className="p-6">
        <h3 className="text-xl font-display font-bold mb-2">{project.title}</h3>
        <p className="text-white/50 text-sm mb-4 leading-relaxed">{project.desc}</p>
        <div className="flex gap-2 flex-wrap">
          {project.tags.map(tag => (
            <span key={tag} className="px-3 py-1 text-xs rounded-full bg-white/5 text-white/60 border border-white/10">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">Projects</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Featured <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Work</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
`;

        files['src/components/Contact.jsx'] = `import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function Contact() {
  const formRef = useRef()
  const [status, setStatus] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    // EmailJS integration placeholder
    // import emailjs from '@emailjs/browser'
    // await emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formRef.current, 'YOUR_PUBLIC_KEY')
    setTimeout(() => {
      setStatus('sent')
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setStatus(''), 3000)
    }, 1000)
  }

  return (
    <section id="contact" className="py-32">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">Contact</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            Let's <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Connect</span>
          </h2>
          <p className="text-white/50">Have a project in mind? Let's build something extraordinary together.</p>
        </motion.div>
        <motion.form ref={formRef} onSubmit={handleSubmit}
                     initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                     viewport={{ once: true }} transition={{ delay: 0.2 }}
                     className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="Your Name"
                   className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Your Email"
                   className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors" />
          </div>
          <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Your Message" rows={5}
                    className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors resize-none" />
          <button type="submit" disabled={status === 'sending'}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-50">
            {status === 'sending' ? 'Sending...' : status === 'sent' ? '✓ Sent!' : 'Send Message'}
          </button>
        </motion.form>
      </div>
    </section>
  )
}
`;

        files['src/components/Footer.jsx'] = `export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-white/30">
            &copy; ${new Date().getFullYear()} ${title}. All rights reserved.
          </span>
          <span className="text-sm text-white/30">
            Built with ZERO-BUILDER AI
          </span>
        </div>
      </div>
    </footer>
  )
}
`;

        return files;
    }
}

window.CoderReactAgent = CoderReactAgent;
