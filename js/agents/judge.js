/* ============================================================
   JUDGE AGENT — accepts, revises or replans based on real feedback
   Combines hard evidence (did the project actually run and pass?) with
   a focused LLM review of whether the requested work is truly done.
   ============================================================ */

class JudgeAgent extends BaseAgent {
    constructor() {
        super('judge', 'Evaluates worker output against the goal using real execution evidence');
    }

    async evaluate({ files = {}, task = '', executionReport = null, cycle = 1 }) {
        const ranOk = executionReport ? executionReport.ok === true : null;

        let review = { passed: false, score: 0, verdict: 'revise', issues: [], notes: '' };
        try {
            const systemPrompt = `You are a strict senior engineer acting as a Judge.
Given the task and the produced files, decide whether the work is complete and correct.
Return ONLY JSON: {"passed":boolean,"score":0-100,"verdict":"accept|revise|replan","issues":["..."],"notes":"one or two sentences"}.
Rules: accept only when the requested behaviour is actually implemented, not stubbed.
If the real run failed, verdict must be "revise" (fixable) or "replan" (wrong approach).`;
            const prompt = [
                `Task: ${task}`,
                executionReport ? `Real execution: ${executionReport.ok ? 'PASSED' : 'FAILED at ' + (executionReport.failedAt || executionReport.reason || 'unknown')}` : 'Real execution: not run',
                executionReport?.attempts ? `Attempts: ${JSON.stringify(executionReport.attempts).slice(0, 800)}` : '',
                `Files (${Object.keys(files).length}): ${Object.keys(files).slice(0, 40).join(', ')}`,
                'Key files:',
                Object.keys(files).filter((f) => /\.(js|jsx|ts|tsx|py|go|rb|java)$/.test(f)).slice(0, 6)
                    .map((f) => `--- ${f} ---\n${String(files[f]).slice(0, 2500)}`).join('\n'),
            ].filter(Boolean).join('\n');

            const response = await this.callLLM(prompt, systemPrompt, { temperature: 0.2, maxTokens: 1200 });
            const parsed = this.parseJSON(response);
            if (parsed && typeof parsed === 'object') review = { ...review, ...parsed };
        } catch (error) {
            this.log('warning', `Judge LLM review unavailable (${error.message}); using execution evidence only.`);
        }

        // Hard evidence overrides a lenient model: a failing run is never accepted.
        if (ranOk === false) {
            review.passed = false;
            if (!['revise', 'replan'].includes(review.verdict)) review.verdict = 'revise';
            if (typeof review.score === 'number') review.score = Math.min(review.score, 60);
        }
        if (ranOk === true && review.verdict === 'accept') review.passed = true;
        if (review.verdict === 'accept' && !ranOk && executionReport) review.passed = false;

        review.cycle = cycle;
        review.evidence = { ranOk };
        this.log(review.passed ? 'success' : 'warning', `Verdict ${review.verdict} (${review.score ?? '?'})${review.notes ? ' — ' + review.notes : ''}`);
        return review;
    }
}

window.JudgeAgent = JudgeAgent;
