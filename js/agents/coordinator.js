/* ============================================================
   COORDINATOR — planner / worker swarm orchestrator
   Turns any software task into a task graph, dispatches each task
   to a role-specialised worker, then lets the Judge decide whether
   to accept, revise or replan based on real execution feedback.
   ============================================================ */

const WORKER_ROLES = {
    planner: 'You break software work into precise, buildable tasks.',
    frontend: 'You are a senior frontend engineer. Build accessible, responsive UI with clean components and real states.',
    backend: 'You are a senior backend engineer. Build robust APIs, data access and error handling.',
    fullstack: 'You are a senior full-stack engineer. Build coherent apps across client, server and data layers.',
    database: 'You are a senior database engineer. Design schemas, migrations and queries that fit the domain.',
    test: 'You are a senior test engineer. Write real, runnable tests that assert actual behaviour.',
    security: 'You are an application security engineer. Harden inputs, auth, secrets and dependencies.',
    devops: 'You are a DevOps engineer. Add build, CI and deployment configuration that actually runs.',
    docs: 'You are a technical writer. Produce accurate README and usage docs for the code as written.',
    refactor: 'You are a refactoring specialist. Improve structure without changing behaviour.',
    general: 'You are a senior software engineer. Implement the task with complete, working code.',
};

class CoordinatorAgent extends BaseAgent {
    constructor() {
        super('coordinator', 'Planner/Worker/Judge swarm orchestrator for any software task');
    }

    get maxCycles() {
        return Math.max(1, Math.min(this.framework?.maxRetries || 3, 5));
    }

    /* ---------- planning ---------- */
    async planTask(userPrompt, context, feedback = '') {
        const systemPrompt = `${WORKER_ROLES.planner}
Return ONLY JSON: {"tasks":[{"id":"t1","title":"...","role":"frontend|backend|fullstack|database|test|security|devops|docs|refactor|general","description":"what to build, concretely","files":["path/to/file.ext"]}]}.
Keep it to 3-7 tasks. Each task must be independently implementable and produce real files. Order matters: later tasks may depend on earlier ones.`;
        const prompt = [
            `Task: ${userPrompt}`,
            context?.contextText ? `\nRepository context:\n${context.contextText.slice(0, 8000)}` : '',
            feedback ? `\nThe previous plan failed. Judge feedback:\n${feedback}\nProduce a corrected plan.` : '',
        ].join('\n');

        const response = await this.callLLM(prompt, systemPrompt, { temperature: 0.3, maxTokens: 2000 });
        const parsed = this.parseJSON(response) || {};
        const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        return tasks
            .filter((t) => t && t.title)
            .map((t, i) => ({
                id: t.id || `t${i + 1}`,
                title: String(t.title).slice(0, 120),
                role: WORKER_ROLES[t.role] ? t.role : 'general',
                description: String(t.description || t.title).slice(0, 1200),
                files: Array.isArray(t.files) ? t.files.slice(0, 20) : [],
            }));
    }

    /* ---------- worker ---------- */
    async runWorker(task, files, context) {
        const systemPrompt = `${WORKER_ROLES[task.role] || WORKER_ROLES.general}
Return ONLY a JSON object mapping file paths to complete file contents: {"path/to/file.ext":"full contents"}.
Include only files this task creates or changes. Never truncate a file or leave placeholders.`;
        const existing = this._existingSnippets(task, files);
        const prompt = [
            `Task: ${task.title}`,
            task.description,
            task.files?.length ? `Target files: ${task.files.join(', ')}` : '',
            context?.contextText ? `\nRepository context:\n${context.contextText.slice(0, 6000)}` : '',
            existing ? `\nCurrent contents of related files:\n${existing}` : '',
        ].join('\n');

        this.framework?.emit('log', { type: 'info', message: `Worker[${task.role}] → ${task.title}` });
        const response = await this.streamLLMFiles(prompt, systemPrompt, { temperature: 0.3 });
        return this.extractFiles(response);
    }

    _existingSnippets(task, files) {
        const wanted = new Set(task.files || []);
        const names = Object.keys(files || {}).filter((name) => {
            if (wanted.has(name)) return true;
            const base = name.split('/').pop().toLowerCase();
            return (task.title + ' ' + task.description).toLowerCase().includes(base.replace(/\.\w+$/, ''));
        });
        return names.slice(0, 6).map((name) => `--- ${name} ---\n${String(files[name]).slice(0, 5000)}`).join('\n\n');
    }

    /* ---------- orchestration ---------- */
    async execute(userPrompt, options = {}) {
        const engine = this.framework?.engine;
        const judge = this.framework?.agents['judge'];
        let files = { ...(options.files || {}) };
        const workspaceName = options.workspaceName || `zero-${Date.now().toString(36)}`;
        let context = { contextText: '' };

        if (engine && options.workspace) {
            context = await engine.context(options.workspace, userPrompt).catch(() => ({ contextText: '' }));
        }

        let feedback = '';
        const journal = [];

        for (let cycle = 1; cycle <= this.maxCycles; cycle++) {
            this.framework?.emit('progress', {
                step: 'planning',
                percent: 12 + cycle * 4,
                message: `Coordinator planning (cycle ${cycle}/${this.maxCycles})...`,
            });

            const tasks = await this.planTask(userPrompt, context, feedback);
            if (!tasks.length) {
                throw new Error('Coordinator could not derive a task plan from the request.');
            }
            this.framework?.emit('log', { type: 'success', message: `Plan: ${tasks.length} task(s) — ${tasks.map((t) => t.role).join(' → ')}` });
            this.framework?.emit('taskPlan', { cycle, tasks });

            for (const task of tasks) {
                this.framework?._checkAbort?.();
                try {
                    const produced = await this.runWorker(task, files, context);
                    if (produced && Object.keys(produced).length) {
                        Object.assign(files, produced);
                        this.framework.memory.generatedFiles = { ...files };
                        this.framework.emit('filesReady', { ...files });
                        this.framework?.emit('log', { type: 'success', message: `Worker[${task.role}] wrote ${Object.keys(produced).length} file(s).` });
                    } else {
                        this.framework?.emit('log', { type: 'warning', message: `Worker[${task.role}] produced no files for "${task.title}".` });
                    }
                    journal.push({ cycle, task: task.id, role: task.role, ok: true });
                } catch (error) {
                    if (error?.message === 'ABORTED') throw error;
                    journal.push({ cycle, task: task.id, role: task.role, ok: false, error: error.message });
                    this.framework?.emit('log', { type: 'warning', message: `Worker[${task.role}] failed: ${error.message}` });
                }
            }

            if (!engine || !this.framework?.agents['engineer']) break;

            this.framework?.emit('progress', { step: 'healing', percent: 88, message: 'Running the project and judging the result...' });
            const engineer = this.framework.agents['engineer'];
            const run = await engineer.execute(files, { workspaceName });
            files = run.files;

            const verdict = judge
                ? await judge.evaluate({ files, task: userPrompt, executionReport: run.report, cycle })
                : { passed: run.report?.ok, verdict: run.report?.ok ? 'accept' : 'revise', notes: '' };

            this.framework?.emit('log', {
                type: verdict.passed ? 'success' : 'warning',
                message: `Judge (cycle ${cycle}): ${verdict.verdict}${typeof verdict.score === 'number' ? ` · score ${verdict.score}` : ''}`,
            });
            journal.push({ cycle, judge: verdict.verdict, passed: verdict.passed });

            if (verdict.passed) {
                return { files, report: { ok: true, cycles: cycle, journal, workspace: workspaceName, executionReport: run.report } };
            }

            feedback = [
                `Verdict: ${verdict.verdict}`,
                verdict.notes || '',
                (verdict.issues || []).map((i) => `- ${typeof i === 'string' ? i : i.message || JSON.stringify(i)}`).join('\n'),
                run.report?.attempts ? `Execution: ${JSON.stringify(run.report.attempts).slice(0, 600)}` : '',
            ].filter(Boolean).join('\n');
        }

        return {
            files,
            report: {
                ok: false,
                cycles: this.maxCycles,
                journal,
                workspace: workspaceName,
                reason: `Coordinator exhausted ${this.maxCycles} cycle(s) without the Judge accepting the result.`,
            },
        };
    }
}

window.CoordinatorAgent = CoordinatorAgent;
window.WORKER_ROLES = WORKER_ROLES;
