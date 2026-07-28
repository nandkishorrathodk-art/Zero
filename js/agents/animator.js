/* ============================================================
   MOTION DIRECTOR AGENT — Cinematic motion for React AND static
   ============================================================ */

class AnimatorAgent extends BaseAgent {
    constructor() {
        super(
            'MotionDirector',
            'Injects advanced cinematic animations into React and static builds'
        );

        this.config = {
            maxSourceFiles: 12,
            fallbackSourceFiles: 8,
            maxFileChars: 14000,
            headChars: 9000,
            tailChars: 3000,
            temperature: 0.45,
            maxTokens: 32768,
        };

        this.systemPrompt = `
You are an elite motion director for an Awwwards-caliber digital studio.

Your job is to inject purposeful, expensive-feeling motion into existing code without breaking layout, routing, data fetching, accessibility, or performance.

SUPPORTED STACKS
1. React / Next.js — Framer Motion + GSAP ScrollTrigger
2. Static HTML/CSS/JS — GSAP timelines, ScrollTrigger, refined micro-interactions

DESIGN PHILOSOPHIES YOU UNDERSTAND:
- Skeuomorphism: Realistic press/depth, embossed text shadows
- Neomorphism: Soft shadow morph on hover, pressed states
- Glassmorphism: Shimmer sweeps, blur transitions, glow pulses
- Claymorphism: Bouncy squish, playful wobble, clay press
- Minimalism: Subtle fade, text weight transitions, minimal hovers
- Maximalism: Explosive color shifts, layered parallax, blob morphing
- Brutalism: Hard snap transitions, glitch effects, raw reveals
- Liquid Glass: Apple-style specular shifts, refraction on scroll
- Spatial UI: 3D perspective shifts, z-layer transitions, depth-aware parallax

ADVANCED EFFECTS YOU INJECT:
- Hover: data-hover="tilt|glow|lift|spotlight|perspective" with appropriate JS
- 3D Motion: data-3d="tilt|float|flip" with perspective and mouse tracking
- 3D Scroll: data-scroll-3d="rotate|zoom|flip|spiral" with scroll progress
- Entrance Reveals: data-reveal with IntersectionObserver → .revealed class
- Micro Interactions: data-micro="ripple|bounce|magnetic|counter" 
- Parallax: data-parallax-scroll, data-parallax-depth, data-parallax-mouse
- 3D Windows: .window-3d with interactive mouse tilt
- Smooth Loader: .page-loader with progress animation
- Custom Cursor: Mix-blend-mode cursor follower

PRIMARY OBJECTIVE
- Make the motion feel intentional, premium, and art-directed.
- Match motion style to the design philosophy (e.g., bouncy for clay, snappy for brutalism).
- Prefer a few signature moments over animating everything.
- Keep the implementation robust and minimal.

RULES
1. Think through the motion plan before making changes.
2. Do not output JSON.
3. Output only the files you changed.
4. Preserve existing logic, structure, and semantics.
5. Respect prefers-reduced-motion.
6. Use custom easings and springs where appropriate.
7. For hero headlines, use word/line stagger blur-reveal when it fits.
8. For static sites, enhance script.js and only lightly annotate HTML when needed.
9. Do not invent fake metrics or change brand copy.
10. When the design philosophy is specified, match animation feel to it.

OUTPUT FORMAT
**File: src/components/Hero.jsx**
\`\`\`jsx
// updated code
\`\`\`

**File: script.js**
\`\`\`js
// updated code
\`\`\`
        `.trim();
    }

    detectProjectType(files = {}) {
        const entries = Object.entries(files);
        const isReact = entries.some(([name]) => /^(src\/|app\/)/.test(name) || /\.(jsx|tsx)$/.test(name));
        const isStatic = !!(files['index.html'] || files['script.js'] || files['styles.css']);
        return { isReact, isStatic };
    }

    scoreFile(name, isReact) {
        if (isReact) {
            const weights = [
                [/^(src\/|app\/).*\/?(page|layout|App)\.(jsx|tsx)$/, 100],
                [/components\//, 90],
                [/globals\.css$/, 70],
                [/index\.css$/, 70],
                [/\.(jsx|tsx)$/, 60],
                [/\.(css)$/, 45],
            ];

            return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
        }

        const weights = [
            [/^index\.html$/, 100],
            [/^script\.js$/, 95],
            [/^styles\.css$/, 90],
            [/\.(html|js|css)$/, 60],
        ];

        return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
    }

    selectSourceFiles(files = {}) {
        const entries = Object.entries(files);
        if (!entries.length) return {};

        const { isReact } = this.detectProjectType(files);

        const ranked = entries
            .map(([name, content]) => ({
                name,
                content,
                score: this.scoreFile(name, isReact),
                length: String(content ?? '').length,
            }))
            .sort((a, b) => b.score - a.score || b.length - a.length);

        const selected = ranked
            .filter(item => item.score > 0)
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
            '\n/* ... truncated for motion pass ... */\n' +
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

    buildMotionBrief(specification = {}, isReact = false) {
        const artDirection = specification.artDirection || {};
        const qualityContract = specification.qualityContract || {};
        const motionPlan = artDirection.motionPlan || specification.animations || [];
        const systems = (specification.motionSystems || motionPlan || []).slice(0, 5);
        const scrollChoreography = specification.scrollChoreography || [];

        const hardRules = [
            '- Do not break existing logic, routing, data fetching, or accessibility.',
            '- Keep reduced-motion support intact.',
            '- Prefer premium motion moments over constant movement.',
            '- Use real implementation, not pseudo-code.',
            '- Return only the updated files, no extra commentary.',
        ];

        const implementationContracts = [
            '- masked-title-reveal → split words/lines + clip/blur intro',
            '- scroll-scrub-camera → ScrollTrigger scrub on WebGL camera or CSS depth layers',
            '- sticky-stacking-scenes → pin sections + scale previous scene',
            '- video-hero-crossfade → rAF-friendly video handling, poster fallback',
            '- magnetic-quickto-cta → GSAP quickTo on [data-magnet]',
            '- parallax-media-layers → multi-layer yPercent scrub',
            '- horizontal-gallery-pin → horizontal pin gallery',
            '- blend-mode-type → mix-blend-mode with contrast-safe fallback',
            '- grain-vignette-grade → keep/ensure grain + vignette overlays',
            '- Prefer GSAP ScrollTrigger + Lenis for static; Framer Motion for React.',
        ];

        const midFlight = Array.isArray(specification.midFlightNotes) && specification.midFlightNotes.length
            ? `\nMID-FLIGHT USER NOTES (must honor)\n${specification.midFlightNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`
            : '';

        return `
Inject cinematic, production-safe motion into this ${isReact ? 'React/Next' : 'static'} project.
${midFlight}
ART DIRECTION
${JSON.stringify(artDirection, null, 2)}

MOTION SYSTEMS (implement these for real — max 5)
${JSON.stringify(systems, null, 2)}

SCROLL CHOREOGRAPHY
${JSON.stringify(scrollChoreography, null, 2)}

HERO TREATMENT
${specification.heroTreatment || 'n/a'}

QUALITY CONTRACT
${JSON.stringify(qualityContract, null, 2)}

IMPLEMENTATION GUIDELINES
${implementationContracts.join('\n')}

HARD RULES
${hardRules.join('\n')}

FILES TO ENHANCE
${Object.entries(specification.sourceFiles || {})
                .map(([name, body]) => `\n**File: ${name}**\n\`\`\`\n${body}\n\`\`\``)
                .join('\n')}

Return only updated files in the required Markdown format.
        `.trim();
    }

    buildPrompt({ isReact, specification, sourceFiles }) {
        return this.buildMotionBrief(
            {
                ...(specification || {}),
                sourceFiles,
            },
            isReact
        );
    }

    extractFilesFromMarkdown(responseText) {
        const text = String(responseText ?? '');
        const files = {};
        const sectionRegex = /\*\*File:\s*([^\n*]+)\*\*\s*```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g;

        let match;
        while ((match = sectionRegex.exec(text)) !== null) {
            const fileName = match[1].trim();
            const fileBody = match[2].replace(/\s+$/, '');
            files[fileName] = fileBody;
        }

        return files;
    }

    extractParsedFiles(responseText) {
        if (typeof this.extractFiles === 'function') {
            const parsed = this.extractFiles(responseText);
            if (parsed && Object.keys(parsed).length) return parsed;
        }

        return this.extractFilesFromMarkdown(responseText);
    }

    validateUpdateSet(parsedFiles = {}, originalFiles = {}) {
        const safe = {};

        for (const [name, content] of Object.entries(parsedFiles)) {
            const allowed =
                Object.prototype.hasOwnProperty.call(originalFiles, name) ||
                /components\//.test(name) ||
                /^(index\.html|styles\.css|script\.js)$/.test(name);

            const body = String(content ?? '').trim();

            if (!allowed) continue;
            if (body.length < 40) continue;

            safe[name] = body;
        }

        return safe;
    }

    async execute(specification, designSystem, previousCode = {}) {
        this.log('info', 'Motion Director analyzing project for cinematic polish...');

        const files = previousCode || {};
        const entries = Object.entries(files);

        if (!entries.length) {
            this.log('warning', 'No files to animate');
            return {};
        }

        const { isReact } = this.detectProjectType(files);
        const sourceFiles = this.compactFileContents(this.selectSourceFiles(files));

        const prompt = this.buildPrompt({
            isReact,
            specification,
            sourceFiles,
        });

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Motion Director LLM call failed: ${error.message}`);
            return {};
        }

        try {
            const parsed = this.extractParsedFiles(response);
            const safe = this.validateUpdateSet(parsed, files);

            this.log('success', `Motion Director updated ${Object.keys(safe).length} file(s)`);
            return safe;
        } catch (error) {
            this.log('warning', `Motion Director could not parse updates: ${error.message}`);
            return {};
        }
    }
}

window.AnimatorAgent = AnimatorAgent;