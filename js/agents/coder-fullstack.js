/* ============================================================
   FULLSTACK CODER AGENT — Generates Next.js 14 App Router +
   Prisma + Tailwind CSS v3 projects
   ============================================================ */

class CoderFullstackAgent extends BaseAgent {
    constructor() {
        super('CoderFullstack', 'Generates Full-Stack Next.js + Prisma projects');

        this.config = {
            maxSourceFiles: 14,
            fallbackSourceFiles: 8,
            maxFileChars: 18000,
            headChars: 11000,
            tailChars: 3500,
            temperatureFoundation: 0.28,
            temperatureBuild: 0.42,
            temperatureRepair: 0.25,
            maxTokens: 32768,
        };

        /* Hardcoded known-good versions */
        this.packageVersions = {
            next: '14.2.3',
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            '@prisma/client': '^5.14.0',
            'lucide-react': '^0.379.0',
            'framer-motion': '^11.2.6',
            clsx: '^2.1.1',
            'tailwind-merge': '^2.3.0',
        };

        this.devVersions = {
            prisma: '^5.14.0',
            tailwindcss: '^3.4.3',
            postcss: '^8.4.38',
            autoprefixer: '^10.4.19',
            typescript: '^5.4.5',
            '@types/node': '^20.12.12',
            '@types/react': '^18.3.2',
            '@types/react-dom': '^18.3.0',
        };

        this.systemPrompt = `
You are a principal full-stack engineer who ships complete Next.js 14 products (App Router + Prisma + Tailwind + Framer Motion).

You handle large multi-page apps with auth boundaries, real database models, API validation, dashboards, and premium marketing surfaces. Never ship thin recovery shells.

TECH STACK (FIXED — do NOT change versions)
- Next.js 14 (App Router)
- React 18.3.1 + ReactDOM
- Prisma ORM 5.14 (SQLite by default for easy sandbox testing)
- Tailwind CSS 3.4 with PostCSS + Autoprefixer
- Framer Motion 11 for page transitions and micro-animations
- Lucide React for modern icons

QUALITY STANDARDS
- Modern Next.js App Router conventions (app/layout.tsx, app/page.tsx, app/api/.../route.ts).
- Clean Server Components by default; Client Components only where interactivity is needed.
- Tailwind CSS for all styling.
- Prisma schema must match the requested dbModels.
- Generate valid Next.js Route Handlers for requested apiEndpoints.
- Premium Awwwards-level aesthetics: Bento layouts, asymmetric grids, thin borders, generous whitespace.
- Follow the supplied art direction precisely.
- Do not default to purple gradients, generic dashboard cards, random 3D, or ornamental motion when the brief does not call for them.

COMPONENT PATTERNS

\`\`\`tsx
// Magnet Component (Framer Motion)
"use client"
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function Magnet({ children, disabled = false }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: any) => {
    if (disabled || !ref.current) return
    const { clientX, clientY } = e
    const { width, height, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  )
}
\`\`\`

\`\`\`tsx
// Scroll-Driven Animated Text
"use client"
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function AnimatedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
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

RULES
1. Think through the architecture before outputting code.
2. Do not output JSON.
3. Output each file as a Markdown code block preceded by its exact file path in bold.
4. Tailwind CSS must be used for all styling.
5. Create reusable UI components in components/ when they earn their place.
6. Use CSS custom properties in globals.css for the design system colors, and extend tailwind.config.ts to use them.
7. Use fluid typography for large text.
8. Avoid generic borders; prefer border-white/10 or subtle gradients.
9. If auth or dashboard flows are implied, include the supporting routes and guard structure.
10. Return only files you changed.

OUTPUT FORMAT
**File: package.json**
\`\`\`json
{
  "name": "project",
  "dependencies": { ... }
}
\`\`\`

**File: app/page.tsx**
\`\`\`tsx
export default function Page() { return <div>Home</div> }
\`\`\`
        `.trim();
    }

    detectProjectType(files = {}) {
        const names = Object.keys(files);
        const isNextAppRouter = names.some((name) =>
            /^(app|src\/app)\//.test(name) || /route\.ts$/.test(name)
        );
        const isReactOnly = names.some((name) => /\.(tsx|jsx)$/.test(name));
        const isBackendExisting = names.some((name) =>
            /prisma\/schema\.prisma|lib\/prisma\.ts|middleware\.ts|auth\./.test(name)
        );

        return { isNextAppRouter, isReactOnly, isBackendExisting };
    }

    inferRequirements(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();

        const hasAuth = /auth|login|signup|session|token|jwt|oauth|sso|magic link|password/.test(blob);
        const hasRoles = /role|permission|rbac|admin|staff|owner|member|team/.test(blob);
        const hasOrgs = /organization|workspace|tenant|multi-tenant|company|team/.test(blob);
        const hasBilling = /billing|subscription|plan|stripe|invoice|payment|checkout/.test(blob);
        const hasContent = /post|comment|message|chat|feed|article|blog|cms|note/.test(blob);
        const hasFiles = /upload|file|asset|image|media|storage/.test(blob);
        const hasAudit = /audit|log|history|activity/.test(blob);
        const hasAnalytics = /analytics|metric|event|tracking|dashboard/.test(blob);
        const hasRealtime = /realtime|live|websocket|presence|notification/.test(blob);
        const hasApiHeavy = /api|route|endpoint|crud|rest/.test(blob);
        const hasDashboard = /dashboard|admin|workspace|portal|backoffice/.test(blob);
        const isMarketing = /landing|marketing|website|hero|agency|brand|portfolio/.test(blob);

        return {
            hasAuth,
            hasRoles,
            hasOrgs,
            hasBilling,
            hasContent,
            hasFiles,
            hasAudit,
            hasAnalytics,
            hasRealtime,
            hasApiHeavy,
            hasDashboard,
            isMarketing,
        };
    }

    scoreFile(name, isNextAppRouter) {
        if (isNextAppRouter) {
            const weights = [
                [/^app\/api\/.+\/route\.ts$/, 100],
                [/^src\/app\/api\/.+\/route\.ts$/, 100],
                [/^prisma\/schema\.prisma$/, 95],
                [/^lib\/prisma\.ts$/, 90],
                [/^lib\/auth\.(ts|tsx)$/, 85],
                [/^middleware\.ts$/, 82],
                [/^tailwind\.config\.(ts|js|mjs)$/, 80],
                [/^app\/layout\.(ts|tsx)$/, 78],
                [/^app\/globals\.css$/, 76],
                [/^app\/page\.(ts|tsx)$/, 72],
                [/components\//, 60],
                [/^types\//, 50],
                [/^lib\//, 45],
                [/\.(ts|tsx)$/, 30],
            ];

            return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
        }

        const weights = [
            [/^prisma\/schema\.prisma$/, 100],
            [/^lib\/prisma\.ts$/, 90],
            [/^app\/api\/.+\/route\.ts$/, 85],
            [/^app\/layout\.(ts|tsx)$/, 70],
            [/^app\/page\.(ts|tsx)$/, 68],
            [/\.(ts|tsx|js|jsx)$/, 35],
        ];

        return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
    }

    selectSourceFiles(files = {}) {
        const entries = Object.entries(files);
        if (!entries.length) return {};

        const { isNextAppRouter } = this.detectProjectType(files);

        const ranked = entries
            .map(([name, content]) => ({
                name,
                content,
                score: this.scoreFile(name, isNextAppRouter),
                length: String(content ?? '').length,
            }))
            .sort((a, b) => b.score - a.score || b.length - a.length);

        const selected = ranked
            .filter((item) => item.score > 0)
            .slice(0, this.config.maxSourceFiles);

        if (selected.length) {
            return Object.fromEntries(selected.map(({ name, content }) => [name, content]));
        }

        return Object.fromEntries(entries.slice(0, this.config.fallbackSourceFiles));
    }

    smartTruncate(text) {
        const source = String(text ?? '');
        if (source.length <= this.config.maxFileChars) return source;

        return (
            source.slice(0, this.config.headChars) +
            '\n/* ... truncated for full-stack pass ... */\n' +
            source.slice(-this.config.tailChars)
        );
    }

    compactFileContents(source = {}) {
        const compactSource = {};
        for (const [name, content] of Object.entries(source)) {
            compactSource[name] = this.smartTruncate(content);
        }
        return compactSource;
    }

    buildProjectBrief({
        specification = {},
        sourceFiles = {},
        isNextAppRouter = true,
        requirements = {},
    }) {
        const sections = Array.isArray(specification.sections) && specification.sections.length
            ? specification.sections
            : ['hero', 'features', 'about', 'cta', 'footer'];

        const interactiveComponents = Array.isArray(specification.interactiveComponents)
            ? specification.interactiveComponents
            : [];

        const dbModels = Array.isArray(specification.dbModels) && specification.dbModels.length
            ? specification.dbModels
            : [
                { name: 'User', fields: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'] },
                { name: 'Item', fields: ['id', 'title', 'status', 'ownerId', 'createdAt', 'updatedAt'] },
            ];

        const apiEndpoints = Array.isArray(specification.apiEndpoints) && specification.apiEndpoints.length
            ? specification.apiEndpoints
            : [
                { method: 'GET', path: '/api/health', purpose: 'Health check' },
                { method: 'GET', path: '/api/items', purpose: 'List items' },
                { method: 'POST', path: '/api/items', purpose: 'Create item' },
            ];

        const pages = Array.isArray(specification.pages) && specification.pages.length
            ? specification.pages
            : [
                { id: 'home', path: '/', purpose: 'Marketing' },
                { id: 'login', path: '/login', purpose: 'Auth' },
                { id: 'dashboard', path: '/dashboard', purpose: 'Authenticated workspace' },
            ];

        const architecture = specification.appArchitecture || {};
        const colors = specification.colorPalette || {};
        const title = specification.title || 'Premium Web App';
        const description = specification.description || '';
        const needsAuth = !!(architecture.auth && architecture.auth !== 'none' || requirements.hasAuth);

        const requiredFiles = [
            'package.json',
            'tsconfig.json',
            'next.config.mjs',
            'postcss.config.mjs',
            'tailwind.config.ts',
            'prisma/schema.prisma',
            'lib/prisma.ts',
            'app/layout.tsx',
            'app/globals.css',
        ];

        if (needsAuth) {
            requiredFiles.push('lib/auth.ts', 'middleware.ts');
        }

        if (requirements.hasApi || requirements.hasDashboard || requirements.hasContent || requirements.hasBilling || requirements.hasAnalytics) {
            requiredFiles.push('app/api/.../route.ts');
        }

        const fileBlocks = Object.entries(sourceFiles)
            .map(([name, body]) => `\n**File: ${name}**\n\`\`\`\n${body}\n\`\`\``)
            .join('\n');

        return `
Build a complete Next.js 14 full-stack product.

SITE TYPE
${specification.siteType || 'premium web app'}

TITLE
${title}

DESCRIPTION
${description}

COMPLEXITY
${specification.complexity || 'ultra-complex'}

ART DIRECTION
${JSON.stringify(specification.artDirection || {}, null, 2)}

BRAND STRATEGY + APPROVED COPY
${JSON.stringify(specification.brandStrategy || {}, null, 2)}

QUALITY CONTRACT
${JSON.stringify(specification.qualityContract || {}, null, 2)}

AUTONOMOUS STUDIO INTELLIGENCE
${JSON.stringify(specification.studioIntelligence || {}, null, 2)}

APP ARCHITECTURE
${JSON.stringify(architecture, null, 2)}

PAGES / ROUTES
${JSON.stringify(pages, null, 2)}

DATABASE MODELS
${JSON.stringify(dbModels, null, 2)}

API ENDPOINTS
${JSON.stringify(apiEndpoints, null, 2)}

SECTIONS / UI
${sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

INTERACTIVE COMPONENTS
${interactiveComponents.map((c, i) => `${i + 1}. ${c}`).join('\n') || 'n/a'}

COLORS
- Primary: ${colors.primary || '#C84B31'}
- Secondary: ${colors.secondary || '#173F5F'}
- Accent: ${colors.accent || '#F6C85F'}
- Background: ${colors.background || '#0B0B0C'}
- Surface: ${colors.surface || '#141416'}

DETECTED REQUIREMENTS
${JSON.stringify(requirements, null, 2)}

REQUIRED OUTPUT FILES
${requiredFiles.map((f) => `- ${f}`).join('\n')}

PACKAGE VERSIONS
${JSON.stringify({ dependencies: this.packageVersions, devDependencies: this.devVersions }, null, 2)}

FILES TO CONSIDER
${fileBlocks}

GUIDELINES
- Use the App Router.
- Use Prisma properly with a real schema and timestamps.
- Build route handlers with validation and robust status codes.
- Add auth/guard structure when implied.
- Include shared utilities like lib/prisma.ts and lib/utils.ts.
- Use Tailwind for all styling.
- Keep the experience premium, spacious, and deliberate.
- Do not ship a recovery shell.
- Return only updated files in Markdown code blocks.
        `.trim();
    }

    buildFoundationPrompt(sharedContext) {
        return `${sharedContext}

PASS 1 TASK — FOUNDATION ONLY
Generate ONLY foundation and infrastructure files:
- package.json
- tsconfig.json
- next.config.mjs
- postcss.config.mjs
- tailwind.config.ts
- prisma/schema.prisma
- lib/prisma.ts
- lib/utils.ts
- app/layout.tsx
- app/globals.css
- .env.example
- .gitignore
- README.md
- components/ui basics only if needed

Do not generate full marketing pages or complete dashboard pages yet. Markdown file blocks only.`;
    }

    buildPagesPrompt(sharedContext, existingFiles) {
        return `${sharedContext}

PASS 2 TASK — PRODUCT SURFACES
Existing files already created:
${Object.keys(existingFiles).join('\n')}

Generate or replace:
- app/page.tsx
- app/login/page.tsx or equivalent auth page if needed
- dashboard/admin/workspace routes from the brief
- reusable components in components/
- navigation, footer, cards, tables, filters, and shared UI

Use Tailwind and the approved art direction. Do not output JSON. Markdown file blocks only.`;
    }

    buildApiPrompt(sharedContext, existingFiles) {
        return `${sharedContext}

PASS 3 TASK — BACKEND API SURFACE
Existing files already created:
${Object.keys(existingFiles).join('\n')}

Generate or complete:
- app/api/**/route.ts for all API endpoints
- validation helpers if needed
- auth guards and tenant scoping if relevant
- data fetching paths aligned to prisma/schema.prisma

Use production-ready TypeScript. Markdown file blocks only.`;
    }

    buildRepairPrompt(sharedContext, missingFiles, existingFiles) {
        return `${sharedContext}

REPAIR TASK — FILL THE MISSING PIECES
Existing files:
${Object.keys(existingFiles).join('\n')}

Missing / incomplete files to add or repair:
${missingFiles.map((f) => `- ${f}`).join('\n')}

Return only the files necessary to complete the project. Markdown file blocks only.`;
    }

    normalizeProjectFiles(files = {}, specification = {}) {
        if (files['package.json']) {
            try {
                const pkg = JSON.parse(files['package.json']);
                pkg.scripts = {
                    dev: 'next dev',
                    build: 'prisma generate && next build',
                    start: 'next start',
                    lint: 'next lint',
                    'db:push': 'prisma db push',
                    'db:studio': 'prisma studio',
                };
                pkg.dependencies = { ...(pkg.dependencies || {}), ...this.packageVersions };
                pkg.devDependencies = { ...(pkg.devDependencies || {}), ...this.devVersions };
                files['package.json'] = JSON.stringify(pkg, null, 2);
            } catch (_) {
                // keep original if malformed
            }
        }

        if (!files['tsconfig.json'] || !String(files['tsconfig.json']).includes('"paths"')) {
            files['tsconfig.json'] = JSON.stringify({
                compilerOptions: {
                    target: 'es2022',
                    lib: ['dom', 'dom.iterable', 'esnext'],
                    allowJs: true,
                    skipLibCheck: true,
                    strict: false,
                    forceConsistentCasingInFileNames: true,
                    noEmit: true,
                    esModuleInterop: true,
                    module: 'esnext',
                    moduleResolution: 'node',
                    resolveJsonModule: true,
                    isolatedModules: true,
                    jsx: 'preserve',
                    incremental: true,
                    baseUrl: '.',
                    paths: {
                        '@/*': ['./*'],
                    },
                    plugins: [{ name: 'next' }],
                },
                include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
                exclude: ['node_modules'],
            }, null, 2);
        }

        if (!files['next.config.mjs']) {
            files['next.config.mjs'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
`;
        }

        if (!files['postcss.config.mjs']) {
            files['postcss.config.mjs'] = `const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;
        }

        if (!files['tailwind.config.ts']) {
            files['tailwind.config.ts'] = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        card: 'hsl(var(--card))',
        border: 'hsl(var(--border))',
      },
    },
  },
  plugins: [],
};

export default config;
`;
        }

        if (!files['.env.example']) {
            files['.env.example'] = `# Copy to .env for local development
DATABASE_URL="file:./dev.db"
AUTH_SECRET="generate-a-long-random-string"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
`;
        }

        if (!files['.gitignore']) {
            files['.gitignore'] = `node_modules
.next
.env
*.db
*.db-journal
`;
        }

        if (!files['README.md']) {
            files['README.md'] = `# ${specification.title || 'ZERO Full-Stack App'}

## Setup

\`\`\`bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
\`\`\`
`;
        }

        if (!files['lib/utils.ts']) {
            files['lib/utils.ts'] = `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
        }

        return files;
    }

    extractParsedFiles(responseText) {
        if (typeof this.extractFiles === 'function') {
            const parsed = this.extractFiles(responseText);
            if (parsed && Object.keys(parsed).length) return parsed;
        }
        return this._extractFilesFromMarkdown(responseText);
    }

    _extractFilesFromMarkdown(responseText) {
        const text = String(responseText ?? '');
        const files = {};
        const sectionRegex = /\*\*File:\s*([^\n*]+)\*\*\s*```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g;
        let match;
        while ((match = sectionRegex.exec(text)) !== null) {
            files[match[1].trim()] = match[2].replace(/\s+$/, '');
        }
        return files;
    }

    validateOutputFiles(parsedFiles = {}, sourceFiles = {}, requirements = {}) {
        const safe = {};
        const allowedLoose = new Set([
            'package.json',
            'tsconfig.json',
            'next.config.mjs',
            'postcss.config.mjs',
            'tailwind.config.ts',
            'prisma/schema.prisma',
            'lib/prisma.ts',
            'lib/utils.ts',
            'lib/auth.ts',
            'middleware.ts',
            '.env.example',
            '.gitignore',
            'README.md',
        ]);

        for (const [name, content] of Object.entries(parsedFiles)) {
            const isAllowed =
                Object.prototype.hasOwnProperty.call(sourceFiles, name) ||
                allowedLoose.has(name) ||
                /^app\/api\/.+\/route\.(ts|tsx|js|jsx|mjs)$/.test(name) ||
                /^app\/.+\/page\.(ts|tsx|js|jsx)$/.test(name) ||
                /^app\/layout\.(ts|tsx|js|jsx)$/.test(name) ||
                /^components\/.+\.(ts|tsx|js|jsx)$/.test(name) ||
                /^src\/app\/api\/.+\/route\.(ts|tsx|js|jsx|mjs)$/.test(name) ||
                /^src\/app\/.+\/page\.(ts|tsx|js|jsx)$/.test(name);

            const body = String(content ?? '').trim();
            if (!isAllowed || body.length < 40) continue;
            safe[name] = body;
        }

        const shouldHaveAuth = !!requirements.hasAuth;
        if (shouldHaveAuth && !Object.keys(safe).some((k) => /login|auth|signin/i.test(k))) {
            safe.__missingAuth__ = 'auth';
        }

        return safe;
    }

    summarizeMissing(requiredFiles = [], files = {}) {
        return requiredFiles.filter((f) => !files[f] && !Object.keys(files).some((k) => k === f || k.startsWith(f.replace('/...', ''))));
    }

    async runPass(prompt, temperature) {
        return this.callLLM(prompt, this.systemPrompt, {
            temperature,
            maxTokens: this.config.maxTokens,
        });
    }

    async execute(specification, designSystem, threejsCode = null) {
        this.log(
            'info',
            `Generating Next.js full-stack project [${specification.complexity || 'premium'}] via multi-pass engineer pipeline...`
        );

        const requirements = this.inferRequirements(specification);
        const { isNextAppRouter } = this.detectProjectType(threejsCode || {});
        const sourceFiles = this.compactFileContents(this.selectSourceFiles(threejsCode || {}));

        const sharedContext = this.buildProjectBrief({
            specification,
            sourceFiles,
            isNextAppRouter,
            requirements,
        });

        try {
            // PASS 1 — foundation
            this.log('info', 'Full-stack pass 1/3: foundation (config, prisma, layout)...');
            const foundationRes = await this.runPass(
                this.buildFoundationPrompt(sharedContext),
                this.config.temperatureFoundation
            );
            const files = this.extractParsedFiles(foundationRes);
            this.normalizeProjectFiles(files, specification);

            // PASS 2 — pages + components
            this.log('info', 'Full-stack pass 2/3: product pages + components...');
            const pagesRes = await this.runPass(
                this.buildPagesPrompt(sharedContext, files),
                this.config.temperatureBuild
            );
            Object.assign(files, this.extractParsedFiles(pagesRes));
            this.normalizeProjectFiles(files, specification);

            // PASS 3 — API surface
            this.log('info', 'Full-stack pass 3/3: API routes + data validation...');
            const apiRes = await this.runPass(
                this.buildApiPrompt(sharedContext, files),
                this.config.temperatureFoundation
            );
            Object.assign(files, this.extractParsedFiles(apiRes));
            this.normalizeProjectFiles(files, specification);

            let validated = this.validateOutputFiles(files, files, requirements);
            delete validated.__missingAuth__;

            const requiredFiles = [
                'package.json',
                'tsconfig.json',
                'next.config.mjs',
                'postcss.config.mjs',
                'tailwind.config.ts',
                'prisma/schema.prisma',
                'lib/prisma.ts',
                'app/layout.tsx',
                'app/globals.css',
                'README.md',
            ];

            const missing = this.summarizeMissing(requiredFiles, validated);

            if (missing.length) {
                this.log('info', `Repair pass for missing files: ${missing.join(', ')}`);
                const repairRes = await this.runPass(
                    this.buildRepairPrompt(sharedContext, missing, validated),
                    this.config.temperatureRepair
                );
                Object.assign(validated, this.extractParsedFiles(repairRes));
                this.normalizeProjectFiles(validated, specification);
                validated = this.validateOutputFiles(validated, validated, requirements);
                delete validated.__missingAuth__;
            }

            const totalChars = Object.values(validated).join('').length;
            const hasPrisma = Object.keys(validated).some((k) => /prisma\/schema\.prisma/.test(k));
            const hasApi = Object.keys(validated).some((k) => /app\/api\/.+\/route\.(ts|tsx|js|jsx|mjs)$/.test(k));
            const hasDashboard = Object.keys(validated).some((k) => /app\/(dashboard|admin|workspace|portal)\//.test(k));

            if (totalChars < 9000) {
                throw new Error(`Full-stack project too thin (${totalChars} chars).`);
            }
            if (!hasPrisma) {
                throw new Error('Missing prisma/schema.prisma in full-stack output.');
            }
            if (!hasApi) {
                throw new Error('Missing app/api route handlers in full-stack output.');
            }

            if (requirements.hasDashboard && !hasDashboard) {
                this.log('warning', 'Dashboard requested but no dashboard route detected — review loop may be needed.');
            }

            if (requirements.hasAuth && !Object.keys(validated).some((k) => /login|auth|signin/i.test(k))) {
                this.log('warning', 'Auth requested but no login/auth route detected.');
            }

            this.log(
                'success',
                `Generated ${Object.keys(validated).length} full-stack files via 3-pass pipeline (prisma=${hasPrisma}, api=${hasApi})`
            );

            return validated;
        } catch (e) {
            if (e?.message === 'ABORTED') throw e;
            this.log('error', `Failed full-stack generation: ${e.message}`);
            throw e;
        }
    }
}

window.CoderFullstackAgent = CoderFullstackAgent;