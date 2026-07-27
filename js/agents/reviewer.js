/* ============================================================
   REVIEWER AGENT — Reviews generated code for quality,
   performance, accessibility, premium feel, and 
   COMPLEX FEATURE CORRECTNESS
   ============================================================ */

class ReviewerAgent extends BaseAgent {
    constructor() {
        super('Reviewer', 'Reviews code quality, complexity correctness, and premium feel');
        this.systemPrompt = `You are a senior code reviewer specializing in premium website quality assessment. You check both SIMPLE sites and COMPLEX web applications for quality, correctness, and premium feel.

REVIEW CRITERIA:

1. HTML Quality:
   - Semantic structure with proper heading hierarchy
   - Valid, accessible markup (ARIA labels, alt tags)
   - Proper meta tags, viewport, and SEO elements
   - External resources loaded correctly (CDN links, fonts)

2. CSS Quality:
   - Uses CSS custom properties consistently
   - Responsive at 375px, 768px, 1024px, 1440px
   - No layout overflow or broken layouts
   - Premium feel: visual choices precisely match the art direction; do not reward generic gradients, glass cards, visual noise, or effects that do not serve the brand
   - Proper use of grid/flexbox
   - Animation performance (transform/opacity, not layout properties)
   - Dark/light mode support if applicable

3. JavaScript Quality:
   - No syntax errors or runtime issues
   - Clean patterns (no var, proper scoping)
   - Event delegation where appropriate
   - Proper error handling
   - No memory leaks (event listeners cleaned up)
   - State management is consistent

4. Interactive Components:
   - Do tabs/modals/dropdowns actually WORK?
   - Does form validation give visual feedback?
   - Do counters animate correctly?
   - Does the pricing toggle switch values?
   - Does the mobile menu open/close?
   - Does the dark mode toggle persist?
   - Do hover effects feel premium?

5. Performance:
   - Animations use transform/opacity (GPU accelerated)
   - Images optimized / lazy loaded
   - Scripts defer or placed at bottom
   - No blocking resources
   - No excessive DOM manipulation

6. Premium Feel (CRITICAL):
   - Is there a clear, specific creative concept visible in the first viewport?
   - Does the hero follow the specified composition instead of defaulting to generic SaaS UI?
   - Do typography, media, spacing, and motion reinforce the same concept?
   - Are there only a few purposeful motion systems, with reduced-motion support?
   - Reject generic stock phrases, visual clutter, fake counters, repetitive feature-card grids, and unrelated 3D/particles.
   - Verify the Quality Contract: a real category-specific narrative, credible proof, memorable signature moments, and no unsupported claims.

OUTPUT FORMAT (JSON):
{
  "passed": true/false,
  "score": 0-100,
  "issues": [
    {
      "severity": "critical | warning | suggestion",
      "category": "html | css | js | accessibility | performance | premium-feel | interactivity",
      "file": "filename",
      "description": "what's wrong",
      "fix": "specific code change to fix it"
    }
  ],
  "summary": "Overall assessment",
  "strengths": ["list of things done well"],
  "complexityVerified": true/false
}

SCORING:
- 94-100: Stunning, next-gen, Awwwards-worthy — ship it
- 90-93: Strong execution with clear art direction — passes with minor polish
- 78-89: Functional but generic, templated, thin, or missing real product structure — MUST refine
- 0-77: Major problems / recovery-shell quality — must regenerate

PASS THRESHOLD: score >= 90 = passed (Motion Studio / cinematic sites: score >= 92)

FAIL AUTOMATICALLY (score <= 75, passed=false) IF:
- Recovery shell / placeholder / Lorem Ipsum copy
- Single thin page when complexity is complex/ultra-complex
- Missing working interactions for listed components
- Full-stack without API routes or Prisma when required
- Generic purple SaaS template with fake metrics
- Cinematic brief but hero is only gradient orbs (no video/WebGL/media scene)
- Motion plan requires ScrollTrigger but no scroll-linked code exists

CINEMATIC WEBSITE CHECKS (categories: hero-scene | scroll-story | motion-performance | material-grade):
- Is the hero a real scene (video, WebGL canvas, or full-bleed editorial media)?
- Are sections structured as story beats / data-scene, not feature-card spam?
- Do listed motionSystems appear implemented (GSAP pin/scrub/reveal/magnetic)?
- Is there film-grade restraint (grain/vignette/type) without visual noise?
- Would this sit next to motionsites.ai craft without looking like Bootstrap AI?

AESTHETIC CHECKPOINTS (each worth up to 5 points):
- Does the hero have a SPECIFIC, memorable visual composition (not generic gradient orbs)?
- Is the typography hierarchy dramatic (hero text >> section titles >> body)?
- Are there deliberate whitespace rhythms (not just padding: 20px everywhere)?
- Do animations serve the concept (not animation on everything)?
- Would this site look distinctive next to 10 other AI-generated sites?`;
    }

    async execute(files, specification) {
        this.log('info', `Reviewing ${specification.complexity || 'premium'} website code against Awwwards + product bar...`);

        const isComplex = ['complex', 'ultra-complex'].includes(specification.complexity);

        const filesSummary = Object.entries(files)
            .map(([name, content]) => {
                const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2) || '';
                const lines = textContent.split('\n');
                // Smart truncation: first 60 lines + last 30 lines + any interactive sections
                if (lines.length > 120) {
                    const head = lines.slice(0, 60).join('\n');
                    const tail = lines.slice(-30).join('\n');
                    // Find interactive component blocks (sections with onclick, addEventListener, modal, tab, etc.)
                    const interactivePatterns = /(?:addEventListener|onclick|modal|tab-|accordion|carousel|pricing|toggle|hamburger|dropdown)/i;
                    const interactiveLines = [];
                    for (let i = 60; i < lines.length - 30; i++) {
                        if (interactivePatterns.test(lines[i])) {
                            const start = Math.max(60, i - 3);
                            const end = Math.min(lines.length - 30, i + 8);
                            interactiveLines.push(lines.slice(start, end).join('\n'));
                            i = end; // skip ahead
                        }
                    }
                    const middle = interactiveLines.length > 0 ? `\n... (${lines.length - 90} lines skipped — key interactive blocks shown) ...\n${interactiveLines.join('\n...\n')}\n...` : `\n... (${lines.length - 90} middle lines omitted) ...\n`;
                    return `=== FILE: ${name} (${textContent.length} chars, ${lines.length} lines) ===\n${head}${middle}${tail}`;
                }
                return `=== FILE: ${name} (${textContent.length} chars, ${lines.length} lines) ===\n${textContent}`;
            })
            .join('\n\n');

        const fileNames = Object.keys(files || {});
        const looksFullstack = fileNames.some(n => n.includes('prisma/') || n.startsWith('app/api/'));
        const looksReact = fileNames.some(n => n.startsWith('src/') || /\.(jsx|tsx)$/.test(n));

        const message = `Review this ${specification.complexity || 'premium'} ${specification.siteType} build against an Awwwards + production product bar.

EXPECTED:
- Framework: ${specification.framework || 'unknown'}
- Sections: ${(specification.sections || []).join(', ')}
- Pages: ${JSON.stringify(specification.pages || [])}
- App architecture: ${JSON.stringify(specification.appArchitecture || {})}
- Animations: ${(specification.artDirection?.motionPlan || specification.animations || []).join(', ')}
- 3D: ${specification.has3D ? 'Yes' : 'No'}
- Mood: ${specification.mood || 'premium'}
- Complexity: ${specification.complexity || 'premium'}
- Art direction: ${JSON.stringify(specification.artDirection || {})}
- Quality contract: ${JSON.stringify(specification.qualityContract || {})}
- Customer outcome / conversion / motion policy: ${JSON.stringify(specification.studioIntelligence || {})}
${isComplex ? `- Interactive Components: ${(specification.interactiveComponents || []).join(', ')}
- JS Features: ${(specification.jsFeatures || []).join(', ')}
- VERIFY ALL INTERACTIVE COMPONENTS ACTUALLY WORK` : ''}
${looksFullstack ? '- Full-stack: require Prisma schema, API routes, multi-page App Router structure, no secret leakage' : ''}
${looksReact ? '- React: require component split, real routing if multi-page, no single-file thin demo' : ''}

HARD FAIL if recovery shell / placeholder / Lorem / fake vanity metrics / too thin for complexity.

FILES:
${filesSummary}

Output review JSON. Pass only if score >= 90 and product is genuinely premium/complete.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.25,
            maxTokens: 32768,
        });

        try {
            const review = this.parseJSON(response);
            review.score = Number(review.score) || 80;
            review.issues = review.issues || [];
            review.summary = review.summary || 'Review complete';
            review.strengths = review.strengths || [];
            review.complexityVerified = review.complexityVerified !== false;

            // Enforce hard fail signals even if model is lenient
            const joined = fileNames.map(n => String(files[n] || '')).join('\n');
            if (/\b(zero recovery build|lorem ipsum|replace this recovery)\b/i.test(joined)) {
                review.score = Math.min(review.score, 60);
                review.issues.push({
                    severity: 'critical',
                    category: 'premium-feel',
                    file: 'generated files',
                    description: 'Recovery shell or placeholder content detected.',
                    fix: 'Regenerate a complete premium product without recovery shells.'
                });
            }
            if (joined.length < 5000) {
                review.score = Math.min(review.score, 72);
                review.issues.push({
                    severity: 'critical',
                    category: 'html',
                    file: 'generated files',
                    description: 'Build is too thin for production premium quality.',
                    fix: 'Expand structure, content, styles, and interactions.'
                });
            }

            const motionStudio = specification?.motionStudio
                || specification?.qualityContract?.tier === 'motion-studio-awwwards'
                || /cinematic|luxury|real-estate|agency|architecture|fashion/i.test(String(specification?.siteArchetype || specification?.siteType || ''));
            const threshold = motionStudio ? 92 : 90;
            review.passed = review.score >= threshold && !review.issues.some(i => i.severity === 'critical');

            this.log(review.passed ? 'success' : 'warning',
                `Review: ${review.score}/100 — ${review.issues.length} issues, ${review.strengths.length} strengths`);

            return review;
        } catch (e) {
            this.log('error', `Review parsing failed: ${e.message}`);
            throw e;
        }
    }

    async critiqueDesign(specification, designSystem) {
        this.log('info', 'Critiquing design system...');
        
        const message = `Critique this design system before we start coding. We want a $100K premium aesthetic.

SPECIFICATION:
${JSON.stringify(specification, null, 2)}

PROPOSED DESIGN SYSTEM:
${designSystem}

Analyze if the colors, fonts, spacing, and animations fit the requested mood and complexity. Are the colors too generic? Is the typography pairing modern?
Output a 2-3 paragraph critique pointing out specific improvements. If it's already perfect, say "The design system looks great." Do not output JSON, just text.`;

        const response = await this.callLLM(message, this.systemPrompt, {
            temperature: 0.7,
            maxTokens: 32768,
        });
        
        this.log('success', 'Critique generated');
        return response;
    }
}

window.ReviewerAgent = ReviewerAgent;
