/* ============================================================
HEALER AGENT — Build/runtime auto-fix for large projects
============================================================ */

class HealerAgent extends BaseAgent {
    constructor() {
        super('Healer', 'Analyzes terminal errors and automatically fixes broken code');

        this.config = {
            maxPriorityFiles: 12,
            maxAllFilesList: 80,
            maxFileChars: 16000,
            headChars: 10000,
            tailChars: 3000,
            temperature: 0.12,
            maxTokens: 32768,
        };

        this.systemPrompt = `
You are a principal engineer specializing in debugging React, Vite, Next.js App Router, Prisma, and static sites.

TASK

1. Read stdout and stderr carefully.
2. Identify the exact broken files and root cause.
3. Return complete fixed contents for only the files that must change.

RULES

1. Prefer minimal surgical fixes that restore a green build.
2. Fix missing imports, syntax, types, Prisma client usage, Next.js route exports, React hooks rules, Tailwind/PostCSS config, package scripts, and obvious runtime errors.
3. Do not invent features while healing.
4. Do not introduce secrets.
5. Output Markdown file blocks only.
6. Do not output JSON.
7. Keep unrelated files untouched.
8. If a file is mentioned by the logs, inspect it first.
9. When possible, preserve the existing style and architecture.

OUTPUT FORMAT
**File: path/to/file**
\`\`\`lang
complete fixed content
\`\`\`
`.trim();
    }

    normalizeText(text) {
        return String(text ?? '').replace(/\r\n/g, '\n');
    }

    truncateFile(content) {
        const text = this.normalizeText(content);
        if (text.length <= this.config.maxFileChars) return text;

        return (
            text.slice(0, this.config.headChars) +
            '\n/* ... truncated for heal pass ... */\n' +
            text.slice(-this.config.tailChars)
        );
    }

    detectProjectType(files = {}) {
        const names = Object.keys(files);
        return {
            isNext: names.some((n) => /^(app|src\/app)\//.test(n) || /next\.config\./.test(n) || /middleware\.ts$/.test(n)),
            isVite: names.some((n) => /vite\.config\./.test(n) || /src\/main\.(ts|tsx|js|jsx)$/.test(n)),
            isPrisma: names.some((n) => /prisma\/schema\.prisma$/.test(n) || /lib\/prisma\.(ts|js)$/.test(n)),
            isStatic: names.some((n) => /index\.html$/.test(n)) && !names.some((n) => /next\.config\./.test(n)),
        };
    }

    extractMentionedFiles(files, stdout = '', stderr = '') {
        const names = Object.keys(files || {});
        const logText = `${this.normalizeText(stdout)}\n${this.normalizeText(stderr)}`;

        const mentions = new Set();
        for (const name of names) {
            const base = name.split('/').pop();
            if (logText.includes(name) || logText.includes(base)) {
                mentions.add(name);
            }
        }

        // Add common route/error targets when logs mention them indirectly.
        for (const line of logText.split('\n')) {
            const m = line.match(/(?:in|from|at)\s+([A-Za-z0-9_\-./]+\.(?:ts|tsx|js|jsx|mjs|cjs|css|json|prisma))/);
            if (m?.[1] && names.includes(m[1])) {
                mentions.add(m[1]);
            }
        }

        return [...mentions];
    }

    rankFiles(files = {}, stdout = '', stderr = '') {
        const { isNext, isVite, isPrisma } = this.detectProjectType(files);
        const errorText = `${this.normalizeText(stdout)}\n${this.normalizeText(stderr)}`.toLowerCase();
        const mentions = new Set(this.extractMentionedFiles(files, stdout, stderr));

        const scored = Object.entries(files)
            .map(([name, content]) => {
                let score = 0;
                const base = name.split('/').pop().toLowerCase();
                const text = String(content ?? '');

                if (mentions.has(name)) score += 1000;
                if (errorText.includes(name.toLowerCase()) || errorText.includes(base)) score += 250;

                if (/package\.json$/.test(name)) score += 240;
                if (/tsconfig\.json$/.test(name)) score += 230;
                if (/next\.config\./.test(name)) score += isNext ? 220 : 40;
                if (/vite\.config\./.test(name)) score += isVite ? 220 : 40;
                if (/tailwind\.config\./.test(name)) score += 180;
                if (/postcss\.config\./.test(name)) score += 170;
                if (/prisma\/schema\.prisma$/.test(name)) score += isPrisma ? 240 : 120;
                if (/lib\/prisma\.(ts|js)$/.test(name)) score += 210;
                if (/middleware\.ts$/.test(name)) score += 200;
                if (/app\/layout\.(ts|tsx|js|jsx)$/.test(name)) score += 180;
                if (/app\/page\.(ts|tsx|js|jsx)$/.test(name)) score += 170;
                if (/app\/api\/.+\/route\.(ts|tsx|js|jsx)$/.test(name)) score += 190;
                if (/src\/main\.(ts|tsx|js|jsx)$/.test(name)) score += isVite ? 160 : 60;
                if (/index\.html$/.test(name)) score += 150;
                if (/globals\.css$/.test(name) || /index\.css$/.test(name) || /styles\.css$/.test(name)) score += 140;

                const body = text.toLowerCase();
                if (body.includes('error') || body.includes('throw new error')) score += 10;
                if (body.includes('import ') || body.includes('export ')) score += 8;
                if (body.includes('use client')) score += 6;

                return { name, content, score };
            })
            .sort((a, b) => b.score - a.score);

        return scored;
    }

    buildFilesSummary(files = {}, prioritizedNames = []) {
        const list = prioritizedNames.length
            ? prioritizedNames
            : Object.keys(files).slice(0, this.config.maxAllFilesList);

        return list
            .map((path) => {
                const content = this.truncateFile(files[path] || '');
                return `--- ${path} ---\n${content}\n`;
            })
            .join('\n');
    }

    buildPrompt(currentFiles, stdout, stderr) {
        const files = currentFiles || {};
        const ranked = this.rankFiles(files, stdout, stderr);
        const priorityNames = ranked.slice(0, this.config.maxPriorityFiles).map((x) => x.name);
        const summary = this.buildFilesSummary(files, priorityNames);
        const allPaths = Object.keys(files).slice(0, this.config.maxAllFilesList).join('\n');
        const projectType = this.detectProjectType(files);

        return `
The application failed to build or run. Fix the root cause with minimal surgical changes.

PROJECT TYPE
${JSON.stringify(projectType, null, 2)}

--- STDOUT ---
${this.normalizeText(stdout).slice(0, 8000)}

--- STDERR ---
${this.normalizeText(stderr).slice(0, 12000)}

--- PRIORITY FILES ---
${summary}

--- ALL FILE PATHS ---
${allPaths}

HEALING RULES

* Fix only the files that must change.
* Return complete fixed contents for changed files.
* Prefer the smallest working edit.
* Do not add features.
* Do not change unrelated files.
* Preserve existing architecture and styling.
* If the issue is caused by config, fix the config file directly.
* If the issue is caused by an import/export mismatch, fix both ends if needed.
* If Prisma is involved, keep schema/client usage consistent.
* If Next.js route handlers are involved, ensure correct named exports and runtime-safe code.
* If the log points to a single file, prioritize that file first.

Return only the files that need updates, as complete Markdown file blocks.
`.trim();
    }

    parseMarkdownFiles(responseText) {
        const text = this.normalizeText(responseText);
        const files = {};
        const regex = /\*\*File:\s*([^\n*]+)\*\*\s*```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g;

        let match;
        while ((match = regex.exec(text)) !== null) {
            const path = match[1].trim();
            const body = match[2].replace(/\s+$/, '');
            files[path] = body;
        }

        return files;
    }

    extractFilesSafely(responseText) {
        if (typeof this.extractFiles === 'function') {
            const parsed = this.extractFiles(responseText);
            if (parsed && Object.keys(parsed).length) return parsed;
        }
        return this.parseMarkdownFiles(responseText);
    }

    validateFixedFiles(fixedFiles = {}, originalFiles = {}) {
        const safe = {};

        for (const [name, content] of Object.entries(fixedFiles)) {
            const body = String(content ?? '').trim();
            if (body.length < 40) continue;

            const allowed =
                Object.prototype.hasOwnProperty.call(originalFiles, name) ||
                /^app\/api\/.+\/route\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name) ||
                /^app\/.+\/page\.(ts|tsx|js|jsx)$/.test(name) ||
                /^app\/layout\.(ts|tsx|js|jsx)$/.test(name) ||
                /^components\/.+\.(ts|tsx|js|jsx)$/.test(name) ||
                /^lib\/.+\.(ts|tsx|js|jsx)$/.test(name) ||
                /^prisma\/schema\.prisma$/.test(name) ||
                /^(package\.json|tsconfig\.json|next\.config\..+|vite\.config\..+|postcss\.config\..+|tailwind\.config\..+|middleware\.ts|README\.md|\.env\.example|\.gitignore)$/.test(name);

            if (!allowed) continue;
            safe[name] = body;
        }

        return safe;
    }

    buildRepairFallback(stdout, stderr, currentFiles) {
        const log = `${this.normalizeText(stdout)}\n${this.normalizeText(stderr)}`;
        const candidates = Object.keys(currentFiles || {}).filter((name) => {
            const base = name.split('/').pop();
            return log.includes(name) || log.includes(base);
        });

        return candidates.slice(0, this.config.maxPriorityFiles);
    }

    async execute(currentFiles = {}, stdout = '', stderr = '') {
        this.log('info', 'Analyzing build/runtime errors for auto-heal...');

        const files = currentFiles || {};
        const ranked = this.rankFiles(files, stdout, stderr);
        const mentioned = this.extractMentionedFiles(files, stdout, stderr);
        const priorityNames = (mentioned.length ? mentioned : ranked.slice(0, this.config.maxPriorityFiles).map((x) => x.name))
            .slice(0, this.config.maxPriorityFiles);

        const prompt = this.buildPrompt(files, stdout, stderr);

        let response;
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('error', `Healing failed to call LLM: ${error.message}`);
            throw error;
        }

        try {
            const parsed = this.extractFilesSafely(response);
            const fixedFiles = this.validateFixedFiles(parsed, files);

            if (!Object.keys(fixedFiles).length) {
                const fallbackCandidates = this.buildRepairFallback(stdout, stderr, files);
                throw new Error(
                    `Healer returned no usable fixed files. Priority candidates: ${fallbackCandidates.join(', ') || 'none'}`
                );
            }

            this.log('success', `Healed ${Object.keys(fixedFiles).length} file(s)`);
            return fixedFiles;
        } catch (error) {
            this.log('error', `Healing failed to parse: ${error.message}`);
            throw error;
        }
    }
}

if (typeof window !== 'undefined') {
    window.HealerAgent = HealerAgent;
}
