/* ============================================================
   AGENT RECOVERY - smart recovery without weak template shells
   Coding agents are NEVER replaced by thin recovery pages.
   ============================================================ */

class AgentRecoveryAgent extends BaseAgent {
    constructor() {
        super('AgentRecoveryAgent', 'Recovers non-critical agent failures without shipping weak template shells.');
    }

    async recover(agentName, methodName, args = [], error = null) {
        if (methodName !== 'execute' && methodName !== 'executeFromReview') return { handled: false };
        const reason = error?.message || 'Unknown agent error';

        // CRITICAL CODERS: never ship a weak shell — force retry / hard failure
        const noShellAgents = new Set([
            'coder-ui', 'coder-react', 'coder-fullstack', 'architect',
            'coder-3d', 'coder-shader', 'animator', 'refiner', 'healer'
        ]);
        if (noShellAgents.has(agentName)) {
            this.log('error', `${agentName} failed — refusing weak recovery shell. Reason: ${reason}`);
            return { handled: false };
        }

        if (agentName === 'planner') {
            const prompt = String(args[0] || 'Premium website');
            const frameworkOverride = args[1] || null;
            // Prefer planner's own intelligent default if available
            if (this.framework?.agents?.planner?._getDefaultSpec) {
                try {
                    const spec = this.framework.agents.planner._getDefaultSpec(prompt, frameworkOverride);
                    return this._handled('Planner recovered with engineer-grade default spec (not a thin shell).', spec);
                } catch (_) { /* fall through */ }
            }
            return this._handled('Planner fallback spec created.', this._fallbackSpec(prompt, reason, frameworkOverride));
        }
        if (agentName === 'designer') {
            return this._handled('Designer recovered with premium token system.', this._fallbackDesignSystem());
        }
        if (['researcher', 'brand-strategist'].includes(agentName)) {
            return this._handled(`${agentName} skipped with neutral fallback.`, null);
        }
        if (agentName === 'reviewer') {
            // Fail closed on quality — do not auto-pass weak builds
            return this._handled('Reviewer recovered with fail-closed report.', {
                score: 70,
                passed: false,
                summary: `AI reviewer failed; build must be refined. Reason: ${reason}`,
                issues: [{
                    severity: 'critical',
                    category: 'recovery',
                    file: 'generated files',
                    description: `Reviewer failed: ${reason}`,
                    fix: 'Re-run generation or refine until premium quality gates pass.'
                }],
                strengths: [],
                recommendations: ['Do not ship until a successful review pass completes.']
            });
        }

        return { handled: false };
    }

    _handled(message, value) {
        this.log('warning', message);
        return { handled: true, value, message };
    }

    _fallbackSpec(prompt, reason, frameworkOverride = null) {
        const lower = String(prompt || '').toLowerCase();
        const isApp = /\b(dashboard|admin|auth|login|api|database|saas|app|portal)\b/.test(lower);
        const isFull = /\b(database|prisma|auth|full-?stack|next\.?js|payment)\b/.test(lower);
        const framework = frameworkOverride
            || (isFull ? 'fullstack-nextjs' : (isApp ? 'react-vite' : 'vanilla'));
        return {
            title: prompt.split('\n')[0].slice(0, 60) || 'Premium Website',
            description: prompt,
            framework,
            siteType: isApp ? 'webapp' : 'saas-landing',
            complexity: isFull ? 'ultra-complex' : (isApp ? 'complex' : 'medium'),
            has3D: false,
            sections: isApp
                ? ['header', 'sidebar', 'main-dashboard', 'stats-cards', 'data-table', 'cta', 'footer']
                : ['hero', 'proof', 'features', 'process', 'work', 'cta', 'footer'],
            pages: isApp
                ? [
                    { id: 'home', path: '/', purpose: 'Marketing story' },
                    { id: 'app', path: isFull ? '/dashboard' : '/app', purpose: 'Primary product surface' }
                ]
                : [{ id: 'home', path: '/', purpose: 'Primary site' }],
            appArchitecture: {
                auth: isFull ? 'session' : 'none',
                dataLayer: isFull ? 'prisma-sqlite' : (isApp ? 'localStorage' : 'none'),
                roles: isApp ? ['guest', 'user', 'admin'] : ['guest'],
                entities: isApp ? ['User', 'Item'] : [],
                flows: isApp ? ['land → auth → core action'] : ['land → explore → convert']
            },
            interactiveComponents: isApp
                ? ['navigation-menu', 'sidebar-toggle', 'data-tables', 'modal-popup', 'form-validation', 'toast-notifications']
                : ['navigation-menu', 'mobile-hamburger', 'form-validation', 'modal-popup'],
            jsFeatures: ['state-management', 'local-storage', 'intersection-observer'],
            features: ['responsive', 'accessibility', 'seo-optimized', 'performance-optimized'],
            mediaNeeds: { images: [], videos: [], svgs: [] },
            dbModels: isFull ? [
                { name: 'User', fields: ['id', 'email', 'name', 'role'] },
                { name: 'Item', fields: ['id', 'title', 'status', 'ownerId'] }
            ] : [],
            apiEndpoints: isFull ? [
                { method: 'GET', path: '/api/health', purpose: 'Health check' },
                { method: 'GET', path: '/api/items', purpose: 'List items' }
            ] : [],
            artDirection: {
                concept: 'Editorial product-grade experience with restrained motion and credible proof.',
                heroComposition: 'Oversized type, intentional media block, generous negative space.',
                visualMotifs: ['hairline rules', 'editorial captions', 'one accent material'],
                motionPlan: ['masked headline reveal', 'scroll-linked section fade', 'premium hover'],
                avoid: ['fake logos', 'unsupported metrics', 'gradient blobs', 'generic SaaS sections', 'recovery shells']
            },
            qualityContract: {
                tier: 'recovery-signature-build',
                northStar: 'Recover planning without ever shipping a thin placeholder website.',
                proof: ['Complete architecture', 'Real page map', 'Working interaction plan'],
                signatureMoments: ['Specific first viewport', 'Clear product proof', 'Accessible conversion path'],
                nonNegotiables: ['No secrets', 'No fabricated metrics', 'No placeholder-only pages', 'No weak recovery shells'],
                recoveryReason: reason
            },
            colorPalette: {
                primary: '#C84B31', secondary: '#173F5F', accent: '#F6C85F',
                background: '#F4F1EA', surface: '#FFFFFF', text: '#17202A', textMuted: '#5D6873'
            },
            typography: { heading: 'Instrument Serif', body: 'Manrope' }
        };
    }

    _fallbackDesignSystem() {
        return {
            colors: {
                primary: '#C84B31',
                secondary: '#173F5F',
                accent: '#F6C85F',
                background: '#0B0B0C',
                surface: '#141416',
                text: '#F4F1EA',
                muted: '#9A9590'
            },
            typography: { heading: 'Instrument Serif', body: 'Manrope', mono: 'JetBrains Mono' },
            googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap',
            css: `:root {
  --color-primary: #C84B31;
  --color-secondary: #173F5F;
  --color-accent: #F6C85F;
  --color-bg: #0B0B0C;
  --color-surface: #141416;
  --color-text: #F4F1EA;
  --color-text-muted: #9A9590;
  --color-border: rgba(244,241,234,0.12);
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body: 'Manrope', system-ui, sans-serif;
  --font-size-hero: clamp(3rem, 9vw, 7rem);
  --space-section: clamp(4rem, 10vw, 9rem);
  --radius-lg: 20px;
  --shadow-elevated: 0 30px 80px rgba(0,0,0,0.35);
}`
        };
    }
}

window.AgentRecoveryAgent = AgentRecoveryAgent;
