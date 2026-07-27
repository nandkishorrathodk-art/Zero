/* ============================================================
   AUTONOMOUS STUDIO — outcome-first project intelligence
   Converts a vague brief into intent, forecast, task graph, motion
   policy, conversion experiments, and safe integration guidance.
   ============================================================ */

class AutonomousStudio {
    prepare(specification = {}, prompt = '') {
        const text = `${prompt} ${specification.siteType || ''} ${specification.description || ''}`.toLowerCase();
        const intent = this._intent(text, specification);
        const forecast = this._forecast(text, specification);
        const integrations = this._integrations(text, specification);
        const taskGraph = this._taskGraph(specification, forecast, integrations);
        return {
            version: '1.0',
            intent,
            architectureForecast: forecast,
            taskGraph,
            motionPolicy: this._motionPolicy(specification, intent),
            conversionLab: this._conversionLab(specification, intent),
            integrationPlan: integrations,
            browserTestPlan: this._browserTestPlan(specification, intent),
            createdAt: Date.now()
        };
    }

    _intent(text, spec) {
        const match = (patterns) => patterns.some(pattern => pattern.test(text));
        const goal = match([/buy|shop|cart|checkout|product|ecommerce|store/]) ? 'sales'
            : match([/book|appointment|consultation|contact|lead|enquiry|inquiry/]) ? 'qualified leads'
            : match([/portfolio|agency|studio|designer|artist|case study/]) ? 'credibility and portfolio impact'
            : match([/dashboard|admin|portal|crm|manage|workspace/]) ? 'task completion and retention'
            : 'trust and clear next action';
        const audience = spec.brandStrategy?.brand?.audience || (goal === 'sales' ? 'ready-to-buy visitors' : goal === 'qualified leads' ? 'high-intent prospects' : 'first-time visitors');
        const objections = goal === 'sales'
            ? ['Is this right for me?', 'Can I trust the quality?', 'What happens after purchase?']
            : goal === 'qualified leads'
                ? ['Is this credible?', 'Is the offer relevant?', 'Is it worth contacting them?']
                : goal.includes('task')
                    ? ['Where do I start?', 'Will I lose work?', 'Can I finish this quickly?']
                    : ['Why should I care?', 'Why this over alternatives?', 'What should I do next?'];
        return { primaryOutcome: goal, audience, objections, primaryAction: this._primaryAction(goal), proofPriority: this._proofPriority(goal) };
    }

    _forecast(text, spec) {
        const fullstack = spec.framework === 'fullstack-nextjs' || /auth|database|payment|api|dashboard|admin/.test(text);
        const complex = spec.complexity === 'ultra-complex' || fullstack;
        const pages = Math.max(1, (spec.pages || []).length);
        const integrations = (text.match(/stripe|supabase|firebase|resend|whatsapp|cms|analytics|prisma|postgres/g) || []).length;
        const estimatedFiles = Math.max(fullstack ? 28 : spec.framework === 'react-vite' ? 16 : 5, pages * (fullstack ? 7 : 4) + integrations * 4 + (complex ? 18 : 0));
        return {
            scale: estimatedFiles > 80 ? 'large' : estimatedFiles > 30 ? 'product' : 'focused',
            estimatedFiles, 
            phases: complex ? 6 : 5,
            requiresBatching: estimatedFiles > 30,
            recommendedStack: fullstack ? 'Next.js + typed API contracts + database boundary' : spec.framework === 'react-vite' ? 'React + reusable component system' : 'Semantic HTML/CSS/JS + progressive enhancement',
            risks: [
                ...(fullstack ? ['Data, auth, and API contracts must remain aligned.'] : []),
                ...(integrations ? ['External integrations require environment variables and server-side boundaries.'] : []),
                ...(spec.has3D ? ['WebGL must have a performant fallback for mobile and reduced motion.'] : []),
                ...(estimatedFiles > 60 ? ['Use task batches and dependency-aware context; avoid whole-repository rewrites.'] : [])
            ]
        };
    }

    _taskGraph(spec, forecast, integrations) {
        const tasks = [
            ['discovery', 'Lock audience, outcome, objections, proof, and primary action.', []],
            ['architecture', `Create ${forecast.recommendedStack}; define routes, component ownership, and data boundaries.`, ['discovery']],
            ['experience', 'Build the primary journey before secondary pages; include loading, empty, success, and error states.', ['architecture']],
            ['motion', 'Add only interactions that clarify hierarchy, state change, feedback, or spatial navigation.', ['experience']],
            ['verification', 'Run static checks, browser interaction audit, mobile overflow checks, and review/fix loop.', ['motion']]
        ];
        if (integrations.items.length) tasks.splice(3, 0, ['integrations', 'Create server-side adapters, environment contract, and failure states for approved integrations.', ['architecture']]);
        return tasks.map(([id, objective, dependsOn], index) => ({ id, order: index + 1, objective, dependsOn, status: 'pending' }));
    }

    _motionPolicy(spec, intent) {
        const systems = spec.motionSystems || spec.animations || [];
        return {
            allowed: systems.slice(0, 5),
            rule: 'Motion must communicate hierarchy, continuity, feedback, or progress. Decorative motion without a user purpose is rejected.',
            interactions: [
                'Use scroll only to reveal narrative progression; never trap essential content in scroll effects.',
                'Use drag only for direct manipulation such as reorder, compare, scrub, or explore.',
                'Respect prefers-reduced-motion and keep primary actions usable without animation.'
            ],
            primaryMoment: intent.primaryAction === 'complete the core task' ? 'clear task completion feedback' : 'hero-to-proof transition that reduces the main visitor objection'
        };
    }

    _conversionLab(spec, intent) {
        const action = intent.primaryAction;
        return {
            goal: intent.primaryOutcome,
            variants: [
                { id: 'proof-first', hypothesis: 'Lead with credible evidence for visitors who need trust before action.', hero: 'Specific outcome + visible proof + one direct CTA', cta: action, uiStrategy: 'Large typography headline, immediate logos/testimonials underneath, high contrast primary button.' },
                { id: 'problem-first', hypothesis: 'Lead with the customer pain for visitors actively seeking a solution.', hero: 'Recognizable problem + clear transformation + CTA', cta: action, uiStrategy: 'Question/Problem headline in dark tone, interactive slider/comparison, secondary CTA to learn more.' },
                { id: 'product-first', hypothesis: 'Lead with the actual interface/product for visitors who want to evaluate capability quickly.', hero: 'Product demonstration + capability proof + CTA', cta: action, uiStrategy: 'Minimal text, huge auto-playing video/product mockup centered, subtle sticky CTA.' }
            ],
            recommendation: intent.primaryOutcome === 'credibility and portfolio impact' ? 'proof-first' : intent.primaryOutcome === 'task completion and retention' ? 'product-first' : 'problem-first'
        };
    }

    _integrations(text) {
        const catalog = [
            ['stripe', 'payments', 'Server-side checkout/session creation; never expose secret keys.'],
            ['supabase', 'database/auth', 'Use server-side environment variables and row-level security policy review.'],
            ['firebase', 'auth/realtime data', 'Keep privileged admin operations off the client.'],
            ['resend', 'transactional email', 'Use a server route and an .env.example contract.'],
            ['whatsapp', 'lead/contact', 'Use click-to-chat with consent-aware lead capture.'],
            ['cms', 'content management', 'Define content model, preview state, and publishing fallback.'],
            ['analytics', 'measurement', 'Track consent-aware events for primary action and conversion steps.']
        ];
        const items = catalog.filter(([key]) => text.includes(key)).map(([key, purpose, safety]) => ({ key, purpose, safety, status: 'planned' }));
        return { items, envRequired: items.filter(item => !['whatsapp'].includes(item.key)).map(item => `${item.key.toUpperCase()}_API_KEY`), policy: 'Integrations are proposed as contracts first; credentials and irreversible external actions require explicit user configuration.' };
    }

    _browserTestPlan(spec, intent) {
        return {
            devices: ['mobile', 'tablet', 'desktop'],
            flows: [
                `Find and complete the primary action: ${intent.primaryAction}.`,
                'Open primary navigation and verify the destination/action is reachable.',
                'Exercise form validation, error feedback, and successful submission state.',
                'Check keyboard focus order, visible focus state, and reduced-motion fallback.'
            ],
            consoleErrorsAllowed: 0
        };
    }

    _primaryAction(goal) { return goal === 'sales' ? 'start checkout or add to cart' : goal === 'qualified leads' ? 'request a consultation' : goal.includes('task') ? 'complete the core task' : goal.includes('portfolio') ? 'view work or start a conversation' : 'take the next clear action'; }
    _proofPriority(goal) { return goal === 'sales' ? ['product detail', 'delivery/returns', 'real reviews'] : goal === 'qualified leads' ? ['work/examples', 'method', 'clear offer'] : ['specific capability', 'real context', 'clear next step']; }
}

window.AutonomousStudio = AutonomousStudio;
