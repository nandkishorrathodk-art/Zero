/* ============================================================
   ENGINEER AGENT — execution-backed self-correcting coder
   Unlike the one-shot coders, this agent does not stop after
   generating files. It scaffolds a real workspace, runs the
   project, reads the real failure, asks the LLM for a targeted
   fix, and repeats until tests/build pass or the budget is spent.
   ============================================================ */

class EngineerAgent extends BaseAgent {
    constructor() {
        super('engineer', 'Execution-backed self-correcting software engineer');
    }

    get budget() {
        return this.framework?.maxRetries || 4;
    }

    buildRepairPrompt(specification, files, failure, attempt) {
        const fileList = Object.keys(files).sort().join('\n');
        const relevant = this._relevantFiles(files, failure);
        return [
            `The project failed at "${failure.failedAt}" while running: ${failure.command || 'the project'}.`,
            `Attempt ${attempt}. Real error output:`,
            '```',
            failure.errorLines || '(no output captured)',
            '```',
            '',
            'Project files:',
            fileList,
            '',
            'Here are the current contents of the files most likely responsible:',
            relevant,
            '',
            'Return ONLY the complete corrected files as JSON: {"path/to/file.ext": "full file contents"}.',
            'Fix the root cause. Do not truncate files or use placeholders. If a test expectation is itself wrong, correct the implementation or the test so the real behaviour is consistent.',
        ].join('\n');
    }

    _relevantFiles(files, failure) {
        const hints = String(failure.errorLines || '')
            .split('\n')
            .flatMap((line) => line.match(/[\w./-]+\.(?:js|jsx|ts|tsx|mjs|cjs|json|py)/g) || []);
        const picked = new Set();
        for (const hint of hints) {
            const base = hint.replace(/^.*?([\w.-]+\.\w+)$/, '$1');
            for (const name of Object.keys(files)) {
                if (name === hint || name.endsWith('/' + base) || name === base) picked.add(name);
            }
        }
        if (!picked.size) {
            for (const name of Object.keys(files)) {
                if (/\.(js|jsx|ts|tsx|py)$/.test(name) && !/node_modules/.test(name)) picked.add(name);
            }
        }
        return [...picked].slice(0, 8).map((name) => `--- ${name} ---\n${files[name]}`).join('\n\n');
    }

    async execute(files = {}, options = {}) {
        if (!this.framework?.engine) {
            return { files, report: { executed: false, reason: 'execution engine unavailable', attempts: 0 } };
        }

        const workspaceName = options.workspaceName || `zero-${Date.now().toString(36)}`;
        const engine = this.framework.engine;
        const scaffold = await engine.scaffold(workspaceName, files);
        this.log('info', `Workspace scaffolded: ${scaffold.fileCount} files → ${scaffold.location}`);

        let currentFiles = { ...files };
        const attempts = [];

        for (let attempt = 1; attempt <= this.budget; attempt++) {
            this.framework.emit('progress', {
                step: 'healing',
                percent: 78 + Math.min(attempt * 4, 16),
                message: `Running project in real workspace (attempt ${attempt}/${this.budget})...`,
            });

            const verify = await engine.verify(workspaceName, options.verifyOptions || {});
            this._reportVerify(verify, attempt);

            if (verify.ok) {
                attempts.push({ attempt, ok: true });
                await engine.git(workspaceName, 'commit', `Zero Engineer: verified build (attempt ${attempt})`).catch(() => {});
                return {
                    files: currentFiles,
                    report: {
                        executed: true,
                        workspace: workspaceName,
                        location: scaffold.location,
                        ok: true,
                        attempts,
                        steps: verify.steps,
                    },
                };
            }

            const failure = EngineClient.summarizeFailure(verify);
            attempts.push({ attempt, ok: false, failedAt: failure.failedAt, errorLines: failure.errorLines });

            if (attempt === this.budget) break;

            this.log('warning', `Run failed at ${failure.failedAt}. Requesting fix (attempt ${attempt + 1})...`);
            const repairPrompt = this.buildRepairPrompt(this.framework.memory?.specification, currentFiles, failure, attempt + 1);
            const response = await this.streamLLMFiles(
                repairPrompt,
                'You are a senior software engineer. Return only complete, working files as a JSON object. No prose, no placeholders.',
                { temperature: 0.2 }
            );

            const patched = this.extractFiles(response);
            if (!patched || !Object.keys(patched).length) {
                this.log('warning', 'Engineer could not extract a fix from the model response.');
                continue;
            }

            Object.assign(currentFiles, patched);
            for (const [path, content] of Object.entries(patched)) {
                await engine.writeFile(workspaceName, path, content);
            }
            this.framework.memory.generatedFiles = { ...currentFiles };
            this.framework.emit('filesReady', { ...currentFiles });
        }

        return {
            files: currentFiles,
            report: {
                executed: true,
                workspace: workspaceName,
                location: scaffold.location,
                ok: false,
                attempts,
                reason: `Engineer exhausted ${this.budget} attempts without a passing run.`,
            },
        };
    }

    _reportVerify(verify, attempt) {
        if (verify.ok) {
            this.log('success', `Real run passed on attempt ${attempt}: ${(verify.steps || []).map((s) => s.name).join(' → ')}`);
            return;
        }
        const failed = (verify.steps || []).find((s) => !s.ok) || {};
        this.log('error', `Real run failed at "${verify.failedAt}" (attempt ${attempt}, exit ${failed.exitCode}).`);
        const brief = (failed.stderr || failed.stdout || '').split('\n').slice(0, 4).join(' | ');
        if (brief) this.log('warning', `  ↳ ${brief}`);
    }
}

window.EngineerAgent = EngineerAgent;
