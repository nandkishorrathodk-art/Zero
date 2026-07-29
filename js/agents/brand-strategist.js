/* Zero-Builder Max: autonomous brand strategy stage. */
class BrandStrategistAgent extends BaseAgent {
    constructor() {
        super('BrandStrategist', 'Creates brand positioning, copy, and art direction');

        this.config = {
            temperature: 0.38,
            maxTokens: 8192,
            researchMaxChars: 12000,
            maxMotifs: 3,
            maxMotionTreatments: 3,
            maxChecklistItems: 10,
        };

        this.systemPrompt = `You are a decisive brand strategist + creative director for Awwwards-level digital products.

Goal: prevent generic AI website output and give engineers a sharp brief for marketing pages AND product UI.

Never default to purple SaaS gradients, fake stats, random 3D, recovery shells, or filler like "The future of".

Return ONLY JSON:
{
  "brand": {"name":"","audience":"","positioning":"","category":""},
  "copy": {"eyebrow":"","headline":"","subhead":"","primaryCta":"","secondaryCta":"","proofLine":""},
  "voice": {"tone":"","wordsToUse":[],"wordsToAvoid":[]},
  "artDirection": {
    "concept":"",
    "heroComposition":"",
    "visualMotifs":[],
    "motionPlan":[],
    "avoid":[]
  },
  "sectionNarrative": ["ordered story beats for the site/app"],
  "productUX": {
    "primaryJobToBeDone":"",
    "keyScreens":[],
    "emptyStateCopy":"",
    "successStateCopy":""
  },
  "qualityChecklist": ["pass/fail checks for premium craft"]
}

Rules:
- At most 3 visual motifs and 3 motion treatments
- Copy must be specific to the category and offer
- productUX is required when the brief is an app/dashboard/SaaS
- qualityChecklist must include anti-template checks
- Avoid generic marketing phrasing, filler slogans, and fake proof
- Make assumptions only when needed, and keep them conservative`.trim();
    }

    detectBriefType(specification = {}, userPrompt = '') {
        const blob = `${userPrompt}\n${JSON.stringify(specification || {})}`.toLowerCase();

        const isProduct = /app|dashboard|saas|platform|workflow|tool|software|product/i.test(blob);
        const isMarketing = /landing|website|brand|campaign|site|homepage|hero|marketing/i.test(blob);

        const categoryHints = [
            ['fintech', /bank|finance|fintech|payment|wallet|card|invoice|billing|subscription/],
            ['health', /health|medical|wellness|fitness|clinic|therapy|mindfulness/],
            ['ecommerce', /shop|store|commerce|marketplace|catalog|checkout|product page/],
            ['ai', /ai|assistant|copilot|agent|automation|workflow intelligence/],
            ['creators', /creator|studio|design|content|portfolio|agency/],
            ['education', /course|learn|education|academy|student|teach/],
            ['developer', /devtools|developer|api|cli|sdk|docs|infrastructure/],
            ['real-estate', /real estate|property|listing|broker|home/],
            ['travel', /travel|trip|booking|hotel|flight|itinerary/],
        ];

        let category = 'general';
        for (const [name, pattern] of categoryHints) {
            if (pattern.test(blob)) {
                category = name;
                break;
            }
        }

        return {
            isProduct,
            isMarketing,
            category,
            briefMode: isProduct ? 'product' : isMarketing ? 'marketing' : 'hybrid',
        };
    }

    buildPrompt(userPrompt, specification, researchReport = null) {
        const research = researchReport
            ? `\n\nRESEARCH REPORT (use only relevant findings):\n${String(researchReport).slice(0, this.config.researchMaxChars)}`
            : '';

        const briefType = this.detectBriefType(specification, userPrompt);

        return `
USER REQUEST:
${userPrompt}

PLANNER SPEC:
${JSON.stringify(specification || {}, null, 2)}

BRIEF TYPE:
${JSON.stringify(briefType, null, 2)}
${research}

Create a premium, non-generic brand strategy now.

Return valid JSON only. No markdown. No commentary. No code fences.
        `.trim();
    }

    safeArray(value, max = Infinity) {
        if (!Array.isArray(value)) return [];
        return value
            .map(item => String(item ?? '').trim())
            .filter(Boolean)
            .slice(0, max);
    }

    safeString(value, fallback = '') {
        const text = String(value ?? '').trim();
        return text || fallback;
    }

    normalizeBrief(brief = {}, specification = {}, userPrompt = '') {
        const briefType = this.detectBriefType(specification, userPrompt);
        const category = this.safeString(brief?.brand?.category, briefType.category || 'general');

        const normalized = {
            brand: {
                name: this.safeString(brief?.brand?.name, specification?.title || specification?.name || ''),
                audience: this.safeString(brief?.brand?.audience, ''),
                positioning: this.safeString(brief?.brand?.positioning, ''),
                category,
            },
            copy: {
                eyebrow: this.safeString(brief?.copy?.eyebrow, ''),
                headline: this.safeString(brief?.copy?.headline, ''),
                subhead: this.safeString(brief?.copy?.subhead, ''),
                primaryCta: this.safeString(brief?.copy?.primaryCta, ''),
                secondaryCta: this.safeString(brief?.copy?.secondaryCta, ''),
                proofLine: this.safeString(brief?.copy?.proofLine, ''),
            },
            voice: {
                tone: this.safeString(brief?.voice?.tone, ''),
                wordsToUse: this.safeArray(brief?.voice?.wordsToUse, 10),
                wordsToAvoid: this.safeArray(brief?.voice?.wordsToAvoid, 10),
            },
            artDirection: {
                concept: this.safeString(brief?.artDirection?.concept, ''),
                heroComposition: this.safeString(brief?.artDirection?.heroComposition, ''),
                visualMotifs: this.safeArray(brief?.artDirection?.visualMotifs, this.config.maxMotifs),
                motionPlan: this.safeArray(brief?.artDirection?.motionPlan, this.config.maxMotionTreatments),
                avoid: this.safeArray(brief?.artDirection?.avoid, 10),
            },
            sectionNarrative: this.safeArray(brief?.sectionNarrative, 12),
            productUX: {
                primaryJobToBeDone: this.safeString(brief?.productUX?.primaryJobToBeDone, ''),
                keyScreens: this.safeArray(brief?.productUX?.keyScreens, 12),
                emptyStateCopy: this.safeString(brief?.productUX?.emptyStateCopy, ''),
                successStateCopy: this.safeString(brief?.productUX?.successStateCopy, ''),
            },
            qualityChecklist: this.safeArray(brief?.qualityChecklist, this.config.maxChecklistItems),
        };

        const isProductBrief = briefType.isProduct;
        const defaultAvoid = [
            'purple SaaS gradients',
            'fake metrics',
            'generic bento filler',
            'stock-like AI chrome',
            'vague futuristic copy',
        ];

        if (!normalized.artDirection.avoid.length) {
            normalized.artDirection.avoid = defaultAvoid;
        } else {
            normalized.artDirection.avoid = Array.from(new Set([...normalized.artDirection.avoid, ...defaultAvoid])).slice(0, 10);
        }

        if (!normalized.qualityChecklist.length) {
            normalized.qualityChecklist = [
                'Distinctive hero composition',
                'No fake vanity metrics',
                'Category-specific proof',
                'No recovery-shell layout',
                'No generic SaaS gradients',
                'Tight copy that matches the offer',
                'Visual system feels owned, not templated',
            ];
        } else {
            normalized.qualityChecklist = Array.from(new Set([
                ...normalized.qualityChecklist,
                'No fake vanity metrics',
                'No generic SaaS gradients',
                'No recovery-shell layout',
                'Category-specific proof',
            ])).slice(0, this.config.maxChecklistItems);
        }

        if (isProductBrief) {
            normalized.productUX = {
                primaryJobToBeDone: this.safeString(normalized.productUX.primaryJobToBeDone, this.safeString(specification?.goal, '')),
                keyScreens: normalized.productUX.keyScreens.length
                    ? normalized.productUX.keyScreens
                    : ['Onboarding', 'Core workflow', 'Empty state', 'Success state'],
                emptyStateCopy: this.safeString(
                    normalized.productUX.emptyStateCopy,
                    'Nothing here yet — start with your first action.'
                ),
                successStateCopy: this.safeString(
                    normalized.productUX.successStateCopy,
                    'Done. Your workspace is ready.'
                ),
            };
        } else if (!normalized.productUX.primaryJobToBeDone) {
            normalized.productUX = {
                primaryJobToBeDone: '',
                keyScreens: [],
                emptyStateCopy: '',
                successStateCopy: '',
            };
        }

        if (!normalized.copy.headline && normalized.brand.name) {
            normalized.copy.headline = normalized.brand.name;
        }

        return normalized;
    }

    validateBrief(brief = {}, specification = {}, userPrompt = '') {
        const fallback = this.normalizeBrief({}, specification, userPrompt);
        const merged = this.normalizeBrief(brief, specification, userPrompt);

        return {
            brand: { ...fallback.brand, ...merged.brand },
            copy: { ...fallback.copy, ...merged.copy },
            voice: { ...fallback.voice, ...merged.voice },
            artDirection: {
                ...fallback.artDirection,
                ...merged.artDirection,
                visualMotifs: merged.artDirection.visualMotifs.slice(0, this.config.maxMotifs),
                motionPlan: merged.artDirection.motionPlan.slice(0, this.config.maxMotionTreatments),
            },
            sectionNarrative: merged.sectionNarrative.length ? merged.sectionNarrative : fallback.sectionNarrative,
            productUX: { ...fallback.productUX, ...merged.productUX },
            qualityChecklist: merged.qualityChecklist.length ? merged.qualityChecklist : fallback.qualityChecklist,
        };
    }

    async execute(userPrompt, specification, researchReport = null) {
        this.log('info', 'Brand Strategist locking creative + product brief...');

        const prompt = this.buildPrompt(userPrompt, specification, researchReport);

        let response;
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Brand Strategist LLM call failed: ${error.message}`);
            return this.normalizeBrief({}, specification, userPrompt);
        }

        let parsed;
        try {
            parsed = this.parseJSON(response);
        } catch (error) {
            this.log('warning', `Brand Strategist JSON parse failed: ${error.message}`);
            parsed = {};
        }

        const brief = this.validateBrief(parsed, specification, userPrompt);
        this.log('success', `Brand locked: ${brief.brand.name || specification?.title || 'Untitled'}`);
        return brief;
    }
}

window.BrandStrategistAgent = BrandStrategistAgent;