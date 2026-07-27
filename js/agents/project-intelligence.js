/* ============================================================
   PROJECT INTELLIGENCE AGENTS - imported project analysis suite
   ============================================================ */

class ZipIntakeAgent extends BaseAgent {
    constructor() {
        super('ZipIntakeAgent', 'Summarizes imported ZIP structure and intake risks.');
    }

    async execute(files = {}, analysis = {}) {
        const report = {
            source: analysis.sourceName || 'imported project',
            framework: analysis.framework || 'unknown',
            fileCount: Object.keys(files || {}).length,
            size: analysis.size || 0,
            keyFiles: this._keyFiles(files),
            warnings: Array.isArray(analysis.warnings) ? analysis.warnings : [],
            inferredRisks: this._inferRisks(files, analysis),
        };

        this.log('success', `Mapped ${report.fileCount} files as ${report.framework}`);
        return report;
    }

    _keyFiles(files) {
        const names = Object.keys(files || {});
        const preferred = [
            'package.json',
            'index.html',
            'src/App.jsx',
            'src/App.tsx',
            'app/page.tsx',
            'app/page.jsx',
            'styles.css',
            'src/index.css',
        ];

        const important = [
            ...preferred.filter((name) => files?.[name]),
            ...names.filter((name) => /README|vite\.config|next\.config|tailwind\.config|tsconfig|postcss/i.test(name)),
        ];

        return [...new Set(important)].slice(0, 20);
    }

    _inferRisks(files, analysis) {
        const names = Object.keys(files || {});
        const risks = [];

        if (!names.length) risks.push('Empty archive or unreadable import.');
        if (!files?.['package.json']) risks.push('No package.json detected; dependency graph may be incomplete.');
        if (!names.some((n) => /^(app|src\/app|pages|src\/pages)\//.test(n) || /index\.html$/i.test(n))) {
            risks.push('No obvious app/page entrypoint found.');
        }
        if (analysis?.size && analysis.size > 50 * 1024 * 1024) {
            risks.push('Large import size; review for heavy assets or generated bundles.');
        }

        return risks;
    }
}

class ProjectArchitectAgent extends BaseAgent {
    constructor() {
        super('ProjectArchitectAgent', 'Understands architecture, routes, components, and dependencies.');
    }

    async execute(files = {}, intake = {}) {
        const names = Object.keys(files || {});
        const packageJson = this._parsePackage(files['package.json']);
        const framework = intake.framework || this._detectFramework(files, packageJson);

        const report = {
            framework,
            entrypoints: names
                .filter((name) => /(^|\/)(index|main|App|page)\.(html|jsx|tsx|js|ts)$/i.test(name))
                .slice(0, 30),
            routes: names
                .filter((name) => /(^app\/.+\/page|^pages\/|route\.(ts|js|tsx|jsx)$)/i.test(name))
                .slice(0, 50),
            components: names
                .filter((name) => /(^|\/)(components|ui)\//i.test(name))
                .slice(0, 80),
            styles: names.filter((name) => /\.(css|scss|sass)$/i.test(name)).slice(0, 50),
            dependencies: Object.keys({
                ...(packageJson.dependencies || {}),
                ...(packageJson.devDependencies || {}),
            }).sort(),
            architectureRisks: [],
            clientBoundaryHints: this._clientBoundaryHints(files, framework),
        };

        if (!report.entrypoints.length) report.architectureRisks.push('No obvious page or app entrypoint found.');
        if (report.components.length > 70) report.architectureRisks.push('Large component surface; upgrade should be planned in phases.');
        if (!files['package.json'] && report.framework !== 'static') {
            report.architectureRisks.push('Framework-like project without package.json.');
        }
        if (report.framework === 'nextjs' && !names.some((name) => /^app\/layout\.(tsx|ts|jsx|js)$/.test(name))) {
            report.architectureRisks.push('Next.js App Router project appears to be missing app/layout.*.');
        }

        this.log('success', `Found ${report.entrypoints.length} entrypoints and ${report.components.length} components`);
        return report;
    }

    _parsePackage(source) {
        try {
            return source ? JSON.parse(source) : {};
        } catch {
            return {};
        }
    }

    _detectFramework(files, pkg) {
        const names = Object.keys(files || {});

        if (pkg.dependencies?.next || names.some((name) => /^app\/.+page\.(tsx|jsx|js)$/.test(name))) return 'nextjs';
        if (pkg.dependencies?.react || names.some((name) => /^src\/main\.(jsx|tsx|js|ts)$/.test(name))) return 'react';
        if (names.some((name) => /(^|\/)index\.html$/i.test(name))) return 'static';
        return 'unknown';
    }

    _clientBoundaryHints(files, framework) {
        if (framework === 'static' || framework === 'unknown') return [];
        const hints = [];
        for (const [name, source] of Object.entries(files || {})) {
            const text = String(source || '');
            if (/\b(useState|useEffect|useMemo|useRef|useReducer|useLayoutEffect|useCallback|useForm)\s*\(/.test(text) && !/^\s*['"]use client['"]/.test(text)) {
                hints.push(`${name} likely needs "use client".`);
            }
        }
        return hints.slice(0, 20);
    }
}

class CreativeDirectorAgent extends BaseAgent {
    constructor() {
        super('CreativeDirectorAgent', 'Defines premium art direction and quality bar.');
    }

    async execute(files = {}, architecture = {}) {
        const allText = Object.values(files || {}).map((source) => String(source || '')).join('\n');
        const hasProductUi = /\b(dashboard|workspace|kanban|analytics|timeline|settings|table|chart|kanban board)\b/i.test(allText);
        const hasPortfolio = /\b(case study|portfolio|selected work|studio|agency|projects)\b/i.test(allText);
        const direction = hasProductUi
            ? 'product-led editorial software'
            : hasPortfolio
                ? 'case-study driven digital studio'
                : 'brand-first editorial experience';

        const report = {
            direction,
            northStar: 'Make the first viewport instantly specific, credible, and authored.',
            signatureMoments: [
                'A hero that shows the real product, place, person, or offer immediately',
                'One memorable interaction tied to the brand idea',
                'Proof section based on real capabilities, not fake counters',
            ],
            avoid: ['generic gradients', 'floating blobs', 'fake logos', 'unsupported metrics', 'card-heavy repetition'],
            notes: [],
        };

        if (architecture?.framework === 'nextjs') {
            report.notes.push('Use App Router composition and keep client boundaries minimal.');
        }
        if (architecture?.framework === 'static') {
            report.notes.push('Keep the experience performant with light DOM/CSS interactions.');
        }

        this.log('success', `Creative direction: ${direction}`);
        return report;
    }
}

class CopyChiefAgent extends BaseAgent {
    constructor() {
        super('CopyChiefAgent', 'Finds weak copy, placeholders, and fabricated proof.');
    }

    async execute(files = {}) {
        const issues = [];
        const scanTargets = [
            { regex: /\b(lorem ipsum|your company|coming soon|todo:|placeholder)\b/i, message: 'Placeholder copy remains.' },
            { regex: /\b(the future of|everything you need to|build, scale, and succeed|unlock your potential)\b/i, message: 'Generic marketing phrase detected.' },
            { regex: /\b(10,?000\+|99% satisfaction|trusted by leading|fortune 500|award-winning)\b/i, message: 'Possibly fabricated social proof or vanity metric.' },
        ];

        for (const target of scanTargets) {
            this._scan(files, target.regex, target.message, issues);
        }

        const report = {
            issues,
            rewriteRules: [
                'Use brand-owned nouns and category-specific verbs.',
                'Replace vague claims with visible proof from the product or service.',
                'Do not invent client logos, ratings, testimonials, or metrics.',
            ],
        };

        this.log(issues.length ? 'warning' : 'success', issues.length ? `${issues.length} copy issue(s) found` : 'Copy scan clean');
        return report;
    }

    _scan(files, regex, message, issues) {
        for (const [file, source] of Object.entries(files || {})) {
            if (regex.test(String(source || ''))) issues.push({ file, message });
        }
    }
}

class VisualCriticAgent extends BaseAgent {
    constructor() {
        super('VisualCriticAgent', 'Reviews visual system, typography, layout, and generic patterns.');
    }

    async execute(files = {}) {
        const css = Object.entries(files || {})
            .filter(([name]) => /\.(css|scss|sass)$/i.test(name))
            .map(([, source]) => String(source || ''))
            .join('\n');

        const all = Object.values(files || {}).map((source) => String(source || '')).join('\n');
        const issues = [];

        if (/\b(gradient-orb|floating-orb|blob|bokeh|particle-field)\b/i.test(all)) {
            issues.push('Decorative orb/blob/particle pattern detected.');
        }
        if (/border-radius:\s*(2[0-9]|[3-9][0-9])px/i.test(css)) {
            issues.push('Large rounded card style may feel template-like.');
        }
        if (/letter-spacing:\s*-\d/i.test(css)) {
            issues.push('Negative letter spacing detected; can hurt polish and fit.');
        }
        if ((css.match(/#[0-9a-f]{3,8}|rgba?\(/gi) || []).length < 4) {
            issues.push('Thin color system; visual identity may be underdeveloped.');
        }

        return {
            issues,
            recommendations: [
                'Make visual system category-specific.',
                'Use fewer stronger layout ideas.',
                'Prefer real product/media proof over decoration.',
            ],
        };
    }
}

class ResponsiveQAAgent extends BaseAgent {
    constructor() {
        super('ResponsiveQAAgent', 'Checks responsive readiness across mobile, tablet, and desktop.');
    }

    async execute(files = {}) {
        const all = Object.values(files || {}).map((source) => String(source || '')).join('\n');
        const issues = [];

        if (files['index.html'] && !/<meta[^>]+name=["']viewport["']/i.test(String(files['index.html']))) {
            issues.push('Viewport meta may be missing.');
        }
        if (!/@media\b/i.test(all)) issues.push('No media queries found.');
        if (/\bwidth:\s*(1[2-9]\d{2}|[2-9]\d{3})px\b/i.test(all)) issues.push('Large fixed width detected.');
        if (!/prefers-reduced-motion/i.test(all)) issues.push('Reduced-motion fallback missing.');
        if (!/clamp\(/i.test(all) && /text-|font-size/i.test(all)) issues.push('Fluid sizing may be missing for large type.');

        return {
            issues,
            breakpoints: ['375px mobile', '768px tablet', '1440px desktop'],
        };
    }
}

class PerformanceAgent extends BaseAgent {
    constructor() {
        super('PerformanceAgent', 'Finds heavy assets, dependency risk, and slow front-end patterns.');
    }

    async execute(files = {}, architecture = {}) {
        const heavyFiles = Object.entries(files || {})
            .map(([file, content]) => ({
                file,
                bytes: this._estimateBytes(content),
            }))
            .filter((item) => item.bytes > 250 * 1024)
            .sort((a, b) => b.bytes - a.bytes)
            .slice(0, 20);

        const deps = Array.isArray(architecture?.dependencies) ? architecture.dependencies : [];
        const heavyDeps = deps.filter((dep) => /three|gsap|framer-motion|mapbox|firebase|supabase|chart|monaco/i.test(dep));

        return {
            heavyFiles,
            heavyDeps,
            recommendations: [
                'Lazy-load large media and heavy interactive sections.',
                'Keep above-the-fold CSS small.',
                'Avoid shipping unused animation libraries.',
            ],
        };
    }

    _estimateBytes(content) {
        const text = String(content || '');
        if (typeof Blob !== 'undefined') {
            return new Blob([text]).size;
        }
        if (typeof TextEncoder !== 'undefined') {
            return new TextEncoder().encode(text).length;
        }
        return text.length * 2;
    }
}

class SecurityAgent extends BaseAgent {
    constructor() {
        super('SecurityAgent', 'Detects secrets, unsafe client code, and deployment security risk.');
    }

    async execute(files = {}) {
        const issues = [];
        const secretRegex = /\b(?:api[_-]?key|secret|private[_-]?key|password|token)\b\s*[:=]\s*['"]?[A-Za-z0-9_\-./+=]{12,}/i;

        for (const [file, source] of Object.entries(files || {})) {
            const text = String(source || '');
            if (secretRegex.test(text)) {
                issues.push({ severity: 'critical', file, message: 'Secret-like value may be exposed.' });
            }
            if (/\bdangerouslySetInnerHTML\b|\.innerHTML\s*=/i.test(text)) {
                issues.push({ severity: 'warning', file, message: 'Raw HTML injection pattern needs review.' });
            }
            if (/\beval\s*\(|new Function\s*\(/i.test(text)) {
                issues.push({ severity: 'critical', file, message: 'Dynamic code execution detected.' });
            }
            if (/process\.env\.(?!NEXT_PUBLIC_)[A-Z0-9_]+/i.test(text) && /use client|window|document/i.test(text)) {
                issues.push({ severity: 'warning', file, message: 'Server env reference may leak into client code.' });
            }
        }

        return {
            issues,
            rules: [
                'Move secrets to server-side env vars.',
                'Validate all inputs.',
                'Keep OAuth secrets out of client bundles.',
            ],
        };
    }
}

class UpgradePlannerAgent extends BaseAgent {
    constructor() {
        super('UpgradePlannerAgent', 'Creates a staged premium upgrade plan for imported projects.');
    }

    async execute(report = {}) {
        const highRisk = [
            ...((report.security?.issues || [])
                .filter((item) => item.severity === 'critical')
                .map((item) => `Fix security risk in ${item.file}: ${item.message}`)),
            ...((report.responsive?.issues || [])
                .map((item) => `Responsive QA: ${item}`)),
        ];

        const architectureRisks = Array.isArray(report.architecture?.architectureRisks)
            ? report.architecture.architectureRisks
            : [];

        const plan = [
            ...highRisk,
            ...architectureRisks.map((risk) => `Architecture: ${risk}`),
            'Rebuild the first viewport around one specific brand or product signal.',
            'Replace generic copy and fake proof with credible content.',
            'Refactor repeated card sections into purposeful narrative bands.',
            'Add deploy-ready README/env guidance and performance cleanup.',
        ];

        return {
            priority: plan.slice(0, 12),
            phases: ['Stabilize', 'Premium redesign', 'Responsive QA', 'Performance/security', 'Deploy readiness'],
        };
    }
}

class PatchAgent extends BaseAgent {
    constructor() {
        super('PatchAgent', 'Prepares safe, selectable patches for imported projects.');
    }

    async execute(files = {}, report = {}) {
        const patches = [];

        if (files['index.html'] && !/<meta[^>]+name=["']viewport["']/i.test(String(files['index.html']))) {
            patches.push({
                file: 'index.html',
                type: 'safe-fix',
                description: 'Add viewport meta tag for responsive preview.',
            });
        }

        const hasReducedMotion = Object.values(files || {}).some((source) => /prefers-reduced-motion/i.test(String(source || '')));
        if (!hasReducedMotion) {
            patches.push({
                file: 'styles.css',
                type: 'safe-fix',
                description: 'Add prefers-reduced-motion fallback.',
            });
        }

        if (Array.isArray(report.copy?.issues) && report.copy.issues.length) {
            patches.push({
                file: 'multiple',
                type: 'ai-assisted',
                description: 'Rewrite weak/fake marketing copy with CopyChief rules.',
            });
        }

        if (Array.isArray(report.security?.issues) && report.security.issues.some((item) => item.severity === 'critical')) {
            patches.push({
                file: 'multiple',
                type: 'security',
                description: 'Review critical security issues before deployment.',
            });
        }

        return {
            patches,
            mode: 'proposal-only',
        };
    }
}

class DeployReadinessAgent extends BaseAgent {
    constructor() {
        super('DeployReadinessAgent', 'Checks run/build/deploy readiness.');
    }

    async execute(files = {}, architecture = {}) {
        const pkg = this._parsePackage(files['package.json']);
        const scripts = pkg.scripts || {};
        const commands = [];

        if (files['package.json']) {
            commands.push('npm install');
            commands.push(scripts.dev ? 'npm run dev' : 'npm start');
            if (scripts.build) commands.push('npm run build');
        } else if (files['index.html']) {
            commands.push('Open index.html or run a static server.');
        }

        const missing = [];
        if (architecture.framework !== 'static' && !files['package.json']) missing.push('package.json');
        if (architecture.framework === 'nextjs' && !Object.keys(files || {}).some((name) => /^app\/|^pages\//.test(name))) {
            missing.push('Next.js app/pages route');
        }

        return {
            commands,
            missing,
            env: Object.keys(files || {}).filter((name) => /^\.env\.example$/i.test(name)),
        };
    }

    _parsePackage(source) {
        try {
            return source ? JSON.parse(source) : {};
        } catch {
            return {};
        }
    }
}

class ProjectRepositoryManager {
    constructor(storageKey = 'zb_project_repository_v1') {
        this.storageKey = storageKey;
    }

    record(project = {}) {
        const records = this.list();
        const entry = {
            id: project.id || this._id(),
            name: project.name || 'Untitled project',
            organization: project.organization || this._organization(project.name),
            source: project.source || 'zero-builder',
            framework: project.framework || 'unknown',
            fileCount: project.fileCount || 0,
            agents: project.agents || [],
            warnings: project.warnings || [],
            updatedAt: Date.now(),
        };
        const next = [entry, ...records.filter((item) => item.id !== entry.id)].slice(0, 50);

        if (this._canUseStorage()) {
            localStorage.setItem(this.storageKey, JSON.stringify(next));
        }

        return entry;
    }

    list() {
        if (!this._canUseStorage()) return [];
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch {
            return [];
        }
    }

    _canUseStorage() {
        try {
            return typeof localStorage !== 'undefined';
        } catch {
            return false;
        }
    }

    _id() {
        return window.crypto?.randomUUID
            ? window.crypto.randomUUID()
            : `repo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    _organization(name = '') {
        const clean = String(name)
            .replace(/\.(zip|com)$/i, '')
            .split(/[-_ ]+/)
            .filter(Boolean)[0];
        return clean || 'Personal Workspace';
    }
}

window.ZipIntakeAgent = ZipIntakeAgent;
window.ProjectArchitectAgent = ProjectArchitectAgent;
window.CreativeDirectorAgent = CreativeDirectorAgent;
window.CopyChiefAgent = CopyChiefAgent;
window.VisualCriticAgent = VisualCriticAgent;
window.ResponsiveQAAgent = ResponsiveQAAgent;
window.PerformanceAgent = PerformanceAgent;
window.SecurityAgent = SecurityAgent;
window.UpgradePlannerAgent = UpgradePlannerAgent;
window.PatchAgent = PatchAgent;
window.DeployReadinessAgent = DeployReadinessAgent;
window.ProjectRepositoryManager = ProjectRepositoryManager;