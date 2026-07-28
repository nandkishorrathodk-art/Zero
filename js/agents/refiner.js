/* ============================================================
   REFINER AGENT — Premium, multi-page, full-stack aware edits
   ============================================================ */

class RefinerAgent extends BaseAgent {
    constructor() {
        super('Refiner', 'Makes targeted complex modifications without full regeneration');
        this.systemPrompt = `You are a principal engineer refining production web code. You handle static HTML/CSS/JS, React+Vite, and Next.js full-stack projects.

CAPABILITIES:
- Visual polish to Awwwards-level craft (type, spacing, hero composition, motion)
- Multi-page / multi-route expansions
- Dashboard shells, tables, filters, empty/loading/error states
- Auth/session UI wiring, API route fixes, Prisma model fixes
- Accessibility, SEO, reduced-motion, responsive breakpoints
- Real working interactions — never placeholders or recovery shells

RULES:
1. Change only what the request needs, but every changed file must be COMPLETE.
2. CRITICAL: Do NOT output JSON. Output each changed file as a Markdown code block preceded by its exact path in bold.
3. Preserve working features unless the request removes them.
4. Match existing stack conventions (vanilla vs React vs Next App Router).
5. No Lorem Ipsum, fake vanity metrics, purple SaaS filler, or "ZERO Recovery Build".
6. Prefer complete production structure over tiny stubs.
7. Keep secrets out of client code; use .env.example only.

OUTPUT FORMAT:
**File: index.html**
\`\`\`html
...complete file...
\`\`\`

**File: app/dashboard/page.tsx**
\`\`\`tsx
...complete file...
\`\`\``;
    }

    async execute(currentFiles, modificationPrompt, specification, designSystem) {
        this.log('info', `Refining: ${String(modificationPrompt || '').slice(0, 120)}`);

        const isComplexMod = this._detectComplexity(modificationPrompt);
        const stack = this._detectStack(currentFiles);
        const projectContext = this.framework?.getProjectContext?.(modificationPrompt, currentFiles);
        const filesSummary = projectContext?.source || this._summarizeFiles(currentFiles, modificationPrompt);
        const repositoryPlan = projectContext ? `
REPOSITORY BRAIN PLAN:
${projectContext.executionPlan.summary}
Steps: ${projectContext.executionPlan.steps.map((step, index) => `${index + 1}. ${step}`).join(' ')}
Focused files: ${projectContext.files.map(item => `${item.path} (${item.reason})`).join(', ')}` : '';

        const midFlight = Array.isArray(specification?.midFlightNotes) && specification.midFlightNotes.length
            ? `\nMID-FLIGHT USER NOTES (must honor):\n${specification.midFlightNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`
            : '';

        const message = `Modify this ${stack} project.

MODIFICATION REQUEST:
"${modificationPrompt}"
${midFlight}
MODIFICATION COMPLEXITY: ${isComplexMod ? 'COMPLEX — structural / multi-file / product-level' : 'TARGETED — style/content/interaction polish'}

SPEC CONTEXT:
- Title: ${specification?.title || 'Project'}
- Framework: ${specification?.framework || stack}
- Complexity: ${specification?.complexity || 'premium'}
- Site type: ${specification?.siteType || 'website'}
- Pages: ${JSON.stringify(specification?.pages || [])}
- Architecture: ${JSON.stringify(specification?.appArchitecture || {})}
- Art direction: ${JSON.stringify(specification?.artDirection || {})}
- Quality contract: ${JSON.stringify(specification?.qualityContract || {})}

DESIGN TOKENS (if available):
${designSystem?.css ? String(designSystem.css).slice(0, 2500) : 'n/a'}

CURRENT FILES:
${filesSummary}
${repositoryPlan}

${isComplexMod ? `COMPLEX RULES:
- If adding routes/pages, create complete page files and wire navigation
- If adding dashboard features, include realistic sample data + empty states
- If fixing full-stack issues, keep Prisma/API/page contracts aligned
- New interactions must be fully functional` : `TARGETED RULES:
- Preserve architecture
- Raise visual/premium quality without breaking layout`}

Return ONLY changed files in Markdown file blocks. Complete file contents only.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.4,
            maxTokens: 32768,
        });

        try {
            const updatedFiles = this.extractFiles(response);
            const changedCount = Object.keys(updatedFiles).length;
            if (!changedCount) {
                throw new Error('Refiner returned no file changes');
            }

            for (const [name, content] of Object.entries(updatedFiles)) {
                const oldSize = currentFiles[name]?.length || 0;
                const newSize = String(content || '').length;
                const diff = newSize - oldSize;
                this.log('info', `${name}: ${diff > 0 ? '+' : ''}${diff} chars (${oldSize} → ${newSize})`);
            }

            this.log('success', `Refined ${changedCount} file(s) [${isComplexMod ? 'complex' : 'targeted'} / ${stack}]`);
            return updatedFiles;
        } catch (e) {
            this.log('error', `Refinement parsing failed: ${e.message}`);
            throw new Error('Failed to parse refinement changes. Try a more specific request.');
        }
    }

    async executeFromReview(currentFiles, reviewReport, specification, designSystem) {
        const issues = reviewReport.issues || [];
        if (!issues.length) return {};

        const critical = issues.filter(i => i.severity === 'critical');
        const warnings = issues.filter(i => i.severity === 'warning');
        const ranked = [...critical, ...warnings].slice(0, 12);

        const issuesSummary = ranked
            .map((issue, i) => `${i + 1}. [${issue.severity}] ${issue.category || 'general'} @ ${issue.file || 'general'}: ${issue.description}\n   → Fix: ${issue.fix || 'Improve to production premium quality'}`)
            .join('\n');

        if (!issuesSummary) return {};

        const score = reviewReport.score ?? '?';
        const motionStudio = specification?.motionStudio
            || specification?.qualityContract?.tier === 'motion-studio-awwwards';
        const threshold = motionStudio ? 92 : 90;
        const prompt = `AUTO-FIX REVIEW FAILURES (current score ${score}/100; pass needs >= ${threshold}).

Raise this build to ${motionStudio ? 'Motionsites / Awwwards cinematic website' : 'Awwwards + production'} quality.
Fix all listed issues. Expand thin structure if needed. Remove placeholders/recovery shells/generic SaaS filler/fake metrics.

ISSUES:
${issuesSummary}

Also enforce:
- Complete multi-section scroll scenes for complexity=${specification?.complexity || 'premium'}
- Hero treatment: ${specification?.heroTreatment || 'cinematic media scene'} (video/WebGL/full-bleed — NOT gradient orbs)
- Motion systems to implement: ${(specification?.motionSystems || specification?.animations || []).join(', ')}
- Working ScrollTrigger / GSAP interactions from the motion plan
- Reduced-motion support
- Distinctive art direction (no generic purple template)`;

        return this.execute(currentFiles, prompt, specification, designSystem);
    }

    /* Expand an undersized large project without full regen */
    async expandToProductionScale(currentFiles, specification, designSystem) {
        const pages = specification?.pages || [];
        const framework = specification?.framework || this._detectStack(currentFiles);
        const prompt = `This project is under-scoped for a ${specification?.complexity || 'complex'} ${framework} product.

EXPAND it into a production-scale codebase while preserving what already works:
- Implement missing pages/routes: ${JSON.stringify(pages)}
- Architecture: ${JSON.stringify(specification?.appArchitecture || {})}
- Sections: ${(specification?.sections || []).join(', ')}
- Interactive: ${(specification?.interactiveComponents || []).join(', ')}
- For fullstack: ensure Prisma models, API routes, dashboard, marketing home, README/.env.example
- For React: component split + router pages when multi-page
- For static: multi-section Awwwards craft + working JS interactions
- No recovery shells, no Lorem, no fake vanity metrics

Return all files that need to be created or substantially upgraded.`;

        return this.execute(currentFiles, prompt, specification, designSystem);
    }

    _detectStack(files = {}) {
        const names = Object.keys(files || {});
        if (names.some(n => n.startsWith('app/') || n.includes('prisma/')) || /"next"/.test(String(files['package.json'] || ''))) {
            return 'next-fullstack';
        }
        if (names.some(n => n.startsWith('src/') || /\.(jsx|tsx)$/.test(n))) return 'react-vite';
        return 'static';
    }

    _summarizeFiles(currentFiles, modificationPrompt) {
        const keywords = String(modificationPrompt || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
        return Object.entries(currentFiles || {}).slice(0, 40)
            .map(([name, content]) => {
                const text = String(content || '');
                const lines = text.split('\n');
                if (lines.length <= 160) {
                    return `=== ${name} (${text.length} chars, ${lines.length} lines) ===\n${text}`;
                }
                const head = lines.slice(0, 70).join('\n');
                const tail = lines.slice(-45).join('\n');
                const relevantChunks = [];
                for (let i = 70; i < lines.length - 45; i++) {
                    const line = lines[i].toLowerCase();
                    if (keywords.some(kw => line.includes(kw)) || /section|footer|hero|nav|modal|route|prisma|api|dashboard|sidebar/i.test(lines[i])) {
                        const start = Math.max(70, i - 3);
                        const end = Math.min(lines.length - 45, i + 10);
                        relevantChunks.push(`[Lines ${start + 1}-${end + 1}]\n` + lines.slice(start, end).join('\n'));
                        i = end;
                    }
                }
                const middle = relevantChunks.length
                    ? `\n... (relevant sections) ...\n${relevantChunks.slice(0, 8).join('\n...\n')}\n...`
                    : `\n... (${lines.length - 115} middle lines omitted) ...\n`;
                return `=== ${name} (${text.length} chars, ${lines.length} lines) ===\n${head}${middle}${tail}`;
            })
            .join('\n\n');
    }

    _detectComplexity(prompt) {
        const complexKeywords = [
            'add', 'create', 'build', 'implement', 'new section', 'new component',
            'dashboard', 'chart', 'graph', 'table', 'form', 'modal', 'tabs',
            'filter', 'search', 'sort', 'drag', 'drop', 'upload', 'carousel',
            'slider', 'accordion', 'notification', 'toast', 'sidebar',
            'authentication', 'login', 'signup', 'api', 'fetch', 'data',
            'kanban', 'calendar', 'timeline', 'gallery', 'lightbox',
            'navigation', 'breadcrumb', 'pagination', 'infinite scroll',
            'state management', 'local storage', 'real-time', 'prisma',
            'route', 'page', 'auth', 'expand', 'production', 'multi-page',
            'awwwards', 'premium', 'review', 'critical'
        ];
        const lower = String(prompt || '').toLowerCase();
        return complexKeywords.filter(k => lower.includes(k)).length >= 2 || lower.length > 280;
    }
}

window.RefinerAgent = RefinerAgent;
