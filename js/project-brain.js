/* ============================================================
   PROJECT BRAIN — repository-scale memory and context retrieval
   Keeps large projects understandable without sending every file
   to the model on every request.
   Upgraded: better fingerprinting, aliases, symbol graph, scoring,
   context packing, and request-aware retrieval.
   ============================================================ */

class ProjectBrain {
    constructor(options = {}) {
        this.index = null;
        this.lastFingerprint = '';
        this.maxContextChars = options.maxContextChars || 76000;
        this.maxFilesPerTask = options.maxFilesPerTask || 16;

        this.stopWords = new Set([
            'this', 'that', 'with', 'from', 'have', 'will', 'your', 'const', 'return',
            'import', 'export', 'function', 'class', 'true', 'false', 'null', 'undefined',
            'the', 'and', 'for', 'are', 'you', 'our', 'use', 'used', 'using', 'into', 'than',
            'then', 'been', 'was', 'were', 'can', 'may', 'should', 'could', 'would', 'there',
            'their', 'them', 'they', 'what', 'when', 'where', 'which', 'also', 'than'
        ]);
    }

    /* ============================================================
       INDEX BUILDING
       ============================================================ */
    buildIndex(files = {}) {
        const entries = Object.entries(files || {});
        const fingerprint = this._fingerprint(entries);

        if (this.index && fingerprint === this.lastFingerprint) {
            return this.index;
        }

        const records = {};
        const symbolOwners = new Map();

        for (const [path, source] of entries) {
            const text = String(source || '');

            const record = {
                path,
                chars: text.length,
                lines: text.split('\n').length,
                kind: this._kind(path),
                imports: this._imports(text),
                exports: this._exports(text),
                terms: this._terms(`${path}\n${text}`),
                route: this._route(path),
                importance: this._importance(path, text),
                isContract: this._isContract(path),
            };

            records[path] = record;

            for (const symbol of record.exports) {
                if (!symbolOwners.has(symbol)) symbolOwners.set(symbol, new Set());
                symbolOwners.get(symbol).add(path);
            }
        }

        const reverse = {};
        Object.keys(records).forEach((path) => {
            reverse[path] = new Set();
        });

        for (const record of Object.values(records)) {
            record.resolvedImports = record.imports
                .map((item) => this._resolveImport(record.path, item, records, symbolOwners))
                .filter(Boolean);

            record.resolvedImports.forEach((target) => {
                if (reverse[target]) reverse[target].add(record.path);
            });
        }

        this.lastFingerprint = fingerprint;
        this.index = {
            fileCount: entries.length,
            totalChars: entries.reduce((sum, [, value]) => sum + String(value || '').length, 0),
            records,
            reverse,
            symbolOwners,
            builtAt: Date.now(),
        };

        return this.index;
    }

    /* ============================================================
       TASK CONTEXT SELECTION
       ============================================================ */
    getTaskContext(files = {}, request = '') {
        const index = this.buildIndex(files);
        const query = this._terms(request);
        const querySet = new Set(query);

        const scored = Object.values(index.records).map((record) => {
            const lexical = query.reduce((score, term) => score + (record.terms.includes(term) ? 7 : 0), 0);
            const direct = query.some((term) => record.path.toLowerCase().includes(term)) ? 10 : 0;
            const routeBoost = record.route ? 3 : 0;
            const contractBoost = record.isContract ? 6 : 0;
            const importance = record.importance;

            const symbolMatch = record.exports.some((sym) => querySet.has(String(sym || '').toLowerCase()))
                ? 8
                : 0;

            return {
                path: record.path,
                score: lexical + direct + routeBoost + contractBoost + importance + symbolMatch,
                record,
            };
        }).sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

        const seedCount = Math.max(5, Math.ceil(this.maxFilesPerTask / 2));
        const seeds = scored.filter((item) => item.score > 0).slice(0, seedCount);

        const selected = new Map();

        const add = (path, reason, score = 0) => {
            if (!path || !index.records[path] || selected.has(path) || selected.size >= this.maxFilesPerTask) return;
            selected.set(path, {
                path,
                reason,
                score,
                record: index.records[path],
            });
        };

        // 1) request matches first
        seeds.forEach((item) => add(item.path, 'request match', item.score));

        // 2) always retain project contracts / entrypoints
        Object.values(index.records)
            .filter((r) => r.isContract)
            .slice(0, 8)
            .forEach((r) => add(r.path, 'project contract', r.importance));

        // 3) if request mentions a filename or symbol, capture it
        for (const item of scored.slice(0, 24)) {
            if (selected.size >= this.maxFilesPerTask) break;
            const p = item.path.toLowerCase();
            if (query.some((term) => p.includes(term))) {
                add(item.path, 'path match', item.score + 2);
            }
            if (item.record.exports.some((sym) => querySet.has(String(sym || '').toLowerCase()))) {
                add(item.path, 'symbol match', item.score + 3);
            }
        }

        // 4) pull direct dependencies and callers for every selected file
        [...selected.values()].forEach((item) => {
            const deps = item.record.resolvedImports || [];
            const callers = [...(index.reverse[item.path] || [])];

            deps.slice(0, 6).forEach((path) => add(path, `dependency of ${item.path}`));
            callers.slice(0, 4).forEach((path) => add(path, `used by ${item.path}`));
        });

        // 5) if still empty, default to core files
        if (!selected.size) {
            scored.slice(0, 10).forEach((item) => add(item.path, 'core project file', item.score));
        }

        const filesChosen = [...selected.values()].sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
        const executionPlan = this._plan(request, filesChosen, index);

        return {
            repository: {
                fileCount: index.fileCount,
                totalChars: index.totalChars,
                indexedAt: index.builtAt,
            },
            queryTerms: query.slice(0, 18),
            files: filesChosen,
            executionPlan,
            source: this._compactSources(files, filesChosen, request),
        };
    }

    getRepositorySummary(files = {}) {
        const index = this.buildIndex(files);
        const contracts = Object.values(index.records).filter((r) => r.isContract).map((r) => r.path).slice(0, 20);
        const routes = Object.values(index.records).filter((r) => r.route).map((r) => r.path).slice(0, 30);
        const components = Object.values(index.records).filter((r) => /component|ui|widget|card/i.test(r.path)).map((r) => r.path).slice(0, 30);

        return {
            fileCount: index.fileCount,
            totalChars: index.totalChars,
            contracts,
            routes,
            components,
        };
    }

    /* ============================================================
       PLANNING / PACKING
       ============================================================ */
    _plan(request, files, index) {
        const large = index.fileCount > 45 || index.totalChars > 180000;
        const changed = files.filter((item) => item.reason === 'request match').map((item) => item.path);

        return {
            mode: large ? 'repository-scale' : 'standard',
            steps: [
                'Read project contracts and affected feature surface.',
                `Implement the requested change in the focused set (${files.length} files maximum).`,
                'Preserve imported APIs, routes, types, and component contracts.',
                'Return only complete files that actually changed.',
            ],
            likelyFiles: changed.slice(0, 10),
            summary: `Repository map: ${index.fileCount} files. ${large ? 'Selective context mode is active.' : 'Focused context mode is active.'} Request: ${String(request).slice(0, 180)}`,
        };
    }

    _compactSources(files, chosen, request) {
        let remaining = this.maxContextChars;
        const keywords = this._terms(request);
        const blocks = [];

        for (const item of chosen) {
            if (remaining < 800) break;

            const text = String(files[item.path] || '');
            const content = this._excerpt(text, keywords, Math.min(remaining - 220, 12500));

            blocks.push(`=== ${item.path} | ${item.reason} | ${text.length} chars ===\n${content}`);
            remaining -= content.length + 260;
        }

        return blocks.join('\n\n');
    }

    _excerpt(text, keywords, limit) {
        if (text.length <= limit) return text;

        const lines = text.split('\n');
        const head = lines.slice(0, 55).join('\n');
        const tail = lines.slice(-35).join('\n');
        const chunks = [];
        const lowerKeywords = keywords.map((k) => k.toLowerCase());

        for (let i = 55; i < lines.length - 35 && chunks.join('\n').length < limit * 0.45; i++) {
            const line = lines[i].toLowerCase();
            if (lowerKeywords.some((term) => line.includes(term)) || /export |function |class |interface |type |route|schema|api\//i.test(lines[i])) {
                const start = Math.max(55, i - 3);
                const end = Math.min(lines.length - 35, i + 12);
                chunks.push(`[lines ${start + 1}-${end}]\n${lines.slice(start, end).join('\n')}`);
                i = end;
            }
        }

        const excerpt = `${head}\n\n/* repository excerpt: relevant implementation blocks */\n${chunks.slice(0, 8).join('\n\n')}\n\n/* end of file */\n${tail}`;
        return excerpt.slice(0, limit);
    }

    /* ============================================================
       HELPERS
       ============================================================ */
    _fingerprint(entries) {
        // Lightweight content-aware fingerprint so same-length edits still invalidate cache.
        let acc = `count:${entries.length}|`;
        for (const [name, value] of entries) {
            const text = String(value || '');
            const len = text.length;
            const sampleA = text.slice(0, 120);
            const sampleB = text.slice(-120);
            acc += `${name}:${len}:${this._hash(sampleA + '|' + sampleB)}|`;
        }
        return acc;
    }

    _hash(text) {
        // Fast non-cryptographic hash.
        let h = 2166136261;
        for (let i = 0; i < text.length; i++) {
            h ^= text.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(36);
    }

    _kind(path) {
        return String(path).split('.').pop()?.toLowerCase() || 'file';
    }

    _terms(text) {
        const raw = String(text || '')
            .toLowerCase()
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[^a-z0-9_./-]+/g, ' ')
            .match(/[a-z][a-z0-9_-]{2,}/g) || [];

        return [...new Set(raw)]
            .filter((word) => !this.stopWords.has(word));
    }

    _imports(text) {
        const values = [];
        const src = String(text || '');

        // import ... from 'x'
        const esImport = /import\s+(?:type\s+)?(?:[\w*\s{},]+?\s+from\s+)?['"]([^'"]+)['"]/g;
        // import('x')
        const dynamicImport = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
        // require('x')
        const requireCall = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
        // export ... from 'x'
        const exportFrom = /export\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;

        for (const regex of [esImport, dynamicImport, requireCall, exportFrom]) {
            let match;
            while ((match = regex.exec(src))) {
                values.push(match[1]);
            }
        }

        return [...new Set(values)];
    }

    _exports(text) {
        const values = [];
        const src = String(text || '');

        const patterns = [
            /export\s+default\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z0-9_$]+)/g,
            /export\s+(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z0-9_$]+)/g,
            /export\s*\{\s*([^}]+)\s*\}/g,
        ];

        for (const regex of patterns) {
            let match;
            while ((match = regex.exec(src))) {
                if (regex.source.includes('\\{\\s*([^}]+)\\s*\\}')) {
                    const names = String(match[1] || '')
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((s) => s.split(/\s+as\s+/i).pop().trim());
                    values.push(...names);
                } else {
                    values.push(match[1]);
                }
            }
        }

        return [...new Set(values)].filter(Boolean);
    }

    _route(path) {
        return /^app\/.+\/(page|route)\./.test(path) || /^src\/app\/.+\/(page|route)\./.test(path) ? path : '';
    }

    _isContract(path) {
        return /^(package\.json|tsconfig\.json|next\.config|vite\.config|prisma\/schema\.prisma|app\/layout\.|app\/globals\.|src\/main\.|src\/App\.|index\.html)/i.test(path);
    }

    _importance(path, text) {
        let score = 0;
        const p = String(path);
        const t = String(text || '');

        if (/^(package\.json|tsconfig\.json|app\/layout|src\/main|src\/App|index\.html)/i.test(p)) score += 12;
        if (/\/(api|components|lib|store|hooks|prisma)\//i.test(p)) score += 4;
        if (/route\.(ts|js|tsx|jsx)$|schema\.prisma$/i.test(p)) score += 8;
        if (/export default|createContext|Router|prisma|middleware/i.test(t)) score += 3;
        if (/use client/i.test(t)) score += 2;
        if (/tailwind|postcss|css/i.test(p)) score += 2;
        return score;
    }

    _resolveImport(from, target, records, symbolOwners) {
        if (!target) return null;
        const cleanedTarget = String(target).trim();

        // Alias imports
        if (cleanedTarget.startsWith('@/') || cleanedTarget.startsWith('~/')) {
            const alias = cleanedTarget.replace(/^@\/|^~\//, '');
            const resolved = this._resolvePathLike(alias, records);
            if (resolved) return resolved;
        }

        // Package imports (only resolve if exactly one file defines the symbol)
        if (!cleanedTarget.startsWith('.')) {
            const owners = symbolOwners.get(cleanedTarget);
            return owners?.size === 1 ? [...owners][0] : null;
        }

        // Relative imports
        const base = this._resolveRelativeBase(from, cleanedTarget);
        const resolved = this._resolvePathLike(base, records);
        return resolved;
    }

    _resolveRelativeBase(from, target) {
        const parts = String(from).split('/');
        parts.pop();

        String(target).split('/').forEach((part) => {
            if (part === '..') parts.pop();
            else if (part !== '.' && part !== '') parts.push(part);
        });

        return parts.join('/').replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '');
    }

    _resolvePathLike(base, records) {
        const candidates = [
            base,
            `${base}.ts`,
            `${base}.tsx`,
            `${base}.js`,
            `${base}.jsx`,
            `${base}.mjs`,
            `${base}.cjs`,
            `${base}/index.ts`,
            `${base}/index.tsx`,
            `${base}/index.js`,
            `${base}/index.jsx`,
            `${base}/index.mjs`,
            `${base}/index.cjs`,
        ];

        return candidates.find((path) => records[path]) || null;
    }
}

window.ProjectBrain = ProjectBrain;