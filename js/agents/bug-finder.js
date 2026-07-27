/* ============================================================
BUG FINDER AGENT — Static code analysis for generated projects
Detects: missing imports, extension mismatches, missing exports,
path alias issues, missing package dependencies, and common
Next.js / React integration problems.
============================================================ */

class BugFinderAgent extends BaseAgent {
    constructor() {
        super(
            'BugFinderAgent',
            'Static code analysis agent that detects bugs in generated code before preview'
        );

        ```
    this.config = {
        maxFilesToScan: 60,
        builtins: new Set([
            'react',
            'react-dom',
            'next',
            'fs',
            'path',
            'os',
            'http',
            'https',
            'url',
            'util',
            'stream',
            'events',
            'crypto',
            'buffer',
            'zlib',
            'net',
            'tls',
            'child_process',
            'timers',
            'timers/promises',
            'module',
            'dns',
            'assert',
        ]),
    };

    this.extensionCandidates = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
}

/**
 * Executes the bug finding and auto-fixing process.
 * @param {Object} files - The generated files
 * @returns {Object} { files: Object, report: Object }
 */
async execute(files = {}) {
    this.log('info', 'Analyzing generated code for common bugs...');

    const report = this.analyze(files);

    if (!report.bugs.length) {
        this.log('success', report.summary);
        return { files, report };
    }

    this.log(report.errorCount > 0 ? 'error' : 'warning', report.summary);

    let fixedFiles = { ...files };
    if (report.fixable.length) {
        this.log('info', `Attempting to auto - fix ${ report.fixable.length } issue(s)...`);
        const fixResult = this.autoFix(fixedFiles, report.fixable);
        fixedFiles = fixResult.files;

        for (const log of fixResult.fixLog) {
            this.log('success', `Fixed: ${ log } `);
        }
    }

    return { files: fixedFiles, report };
}

/**
 * Scan all generated files for common bugs.
 * @param {Object} files - { filename: content } map
 * @returns {Object} { bugs: Array, fixable: Array, summary: string }
 */
analyze(files = {}) {
    const bugs = [];
    const fixable = [];

    const packageJson = this._safeParseJSON(files['package.json']);
    const tsconfig = this._safeParseJSON(files['tsconfig.json']);
    const pathAliasEnabled = !!tsconfig?.compilerOptions?.paths?.['@/*'];

    const seenMessages = new Set();

    const pushBug = (bug, markFixable = false) => {
        if (!bug?.message || seenMessages.has(bug.message)) return;
        seenMessages.add(bug.message);
        bugs.push(bug);
        if (markFixable) fixable.push(bug);
    };

    const filenames = Object.keys(files).slice(0, this.config.maxFilesToScan);

    for (const filename of filenames) {
        const content = files[filename];
        if (typeof content !== 'string' || !content.trim()) continue;

        const imports = this._extractImports(content);
        const exports = this._extractExports(content);

        // 1) TS/JS extension mismatch — file contains JSX but is not .tsx/.jsx
        if (this._containsJSX(content) && filename.endsWith('.ts') && !filename.endsWith('.d.ts')) {
            pushBug(
                {
                    file: filename,
                    type: 'tsx-extension',
                    severity: 'error',
                    message: `File "${filename}" contains JSX but uses.ts extension.Rename to.tsx`,
                    fix: { rename: filename, to: filename.replace(/\.ts$/, '.tsx') },
                },
                true
            );
        }

        if (this._containsJSX(content) && filename.endsWith('.js') && !filename.endsWith('.jsx') && !filename.endsWith('.mjs')) {
            pushBug(
                {
                    file: filename,
                    type: 'jsx-extension',
                    severity: 'warning',
                    message: `File "${filename}" contains JSX but uses.js extension.Consider renaming to.jsx`,
                    fix: { rename: filename, to: filename.replace(/\.js$/, '.jsx') },
                },
                true
            );
        }

        // 2) Client component hook usage without "use client"
        if (this._looksLikeReactComponent(content) && this._usesClientOnlyHooks(content) && !this._hasUseClientDirective(content)) {
            pushBug({
                file: filename,
                type: 'missing-use-client',
                severity: 'error',
                message: `File "${filename}" uses client - only React hooks but is missing "use client"`,
            });
        }

        // 3) Missing imports / unresolved local imports
        for (const imp of imports) {
            if (this._isExternalImport(imp.source)) continue;

            const resolved = this._resolveImportPath(filename, imp.source, files);
            if (!resolved) {
                pushBug({
                    file: filename,
                    type: 'missing-import',
                    severity: 'error',
                    message: `Import "${imp.source}" in "${filename}" — file not found in project`,
                    importSource: imp.source,
                    importNames: imp.names,
                });
            }
        }

        // 4) Missing exports for local imports
        for (const imp of imports) {
            if (this._isExternalImport(imp.source)) continue;

            const resolvedPath = this._resolveImportPath(filename, imp.source, files);
            if (!resolvedPath || !files[resolvedPath]) continue;

            const targetContent = files[resolvedPath];
            for (const name of imp.names) {
                if (name === 'default' || name === '*') continue;

                if (!this._isExported(name, targetContent) && !this._isDefinitelyImportedAsTypeOnly(content, name, imp.source)) {
                    pushBug({
                        file: filename,
                        type: 'missing-export',
                        severity: 'warning',
                        message: `"${name}" imported from "${imp.source}" but not exported in "${resolvedPath}"`,
                        symbol: name,
                        targetFile: resolvedPath,
                    });
                }
            }
        }

        // 5) Package dependency checks
        for (const imp of imports) {
            if (!this._isExternalImport(imp.source)) continue;

            const pkgName = this._packageNameFromImport(imp.source);
            if (!pkgName || this.config.builtins.has(pkgName)) continue;

            if (packageJson) {
                const allDeps = {
                    ...(packageJson.dependencies || {}),
                    ...(packageJson.devDependencies || {}),
                    ...(packageJson.peerDependencies || {}),
                };

                if (!allDeps[pkgName] && !allDeps[imp.source]) {
                    pushBug({
                        file: filename,
                        type: 'missing-package',
                        severity: 'warning',
                        message: `Package "${pkgName}" imported in "${filename}" but not in package.json dependencies`,
                        package: pkgName,
                    });
                }
            }
        }

        // 6) Path alias usage without tsconfig paths
        if (this._usesPathAlias(content) && !pathAliasEnabled) {
            pushBug(
                {
                    file: filename,
                    type: 'missing-path-alias',
                    severity: 'error',
                    message: `"${filename}" uses @/ import alias but tsconfig.json is missing paths config`,
        fix: { file: 'tsconfig.json', action: 'add-path-alias' },
    },
    true
            );
}

// 7) Duplicate exports inside a single file
const duplicateExports = this._findDuplicateExports(exports);
for (const dup of duplicateExports) {
    pushBug({
        file: filename,
        type: 'duplicate-export',
        severity: 'warning',
        message: `File "${filename}" exports "${dup}" more than once`,
        symbol: dup,
    });
}

// 8) Suspicious default export + named export mismatch in route-like files
if (this._looksLikeNextRouteFile(filename) && this._containsDefaultExport(content)) {
    pushBug({
        file: filename,
        type: 'route-default-export',
        severity: 'warning',
        message: `Route file "${filename}" appears to use a default export. Next.js route handlers usually need named exports like GET/POST`,
    });
}
    }

const errorCount = bugs.filter((b) => b.severity === 'error').length;
const warnCount = bugs.filter((b) => b.severity === 'warning').length;

return {
    bugs,
    fixable,
    errorCount,
    warningCount: warnCount,
    summary:
        bugs.length === 0
            ? '✅ No bugs detected'
            : `🐞 Found ${errorCount} error(s), ${warnCount} warning(s)`,
};
}

/**
 * Auto-fix fixable bugs and return updated files.
 * @param {Object} files
 * @param {Array} bugs
 */
autoFix(files = {}, bugs = []) {
    const fixed = { ...files };
    const fixLog = [];
    const renameMap = new Map();

    for (const bug of bugs) {
        if (!bug.fix) continue;

        if (bug.type === 'tsx-extension' && bug.fix.rename && bug.fix.to) {
            if (fixed[bug.fix.rename]) {
                fixed[bug.fix.to] = fixed[bug.fix.rename];
                delete fixed[bug.fix.rename];
                renameMap.set(bug.fix.rename, bug.fix.to);

                fixLog.push(`Renamed ${bug.fix.rename} → ${bug.fix.to}`);
            }
        }

        if (bug.type === 'jsx-extension' && bug.fix.rename && bug.fix.to) {
            if (fixed[bug.fix.rename]) {
                fixed[bug.fix.to] = fixed[bug.fix.rename];
                delete fixed[bug.fix.rename];
                renameMap.set(bug.fix.rename, bug.fix.to);

                fixLog.push(`Renamed ${bug.fix.rename} → ${bug.fix.to}`);
            }
        }

        if (bug.type === 'missing-path-alias' && bug.fix.action === 'add-path-alias') {
            const tsconfig = this._safeParseJSON(fixed['tsconfig.json']);
            if (tsconfig) {
                if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
                tsconfig.compilerOptions.baseUrl = '.';

                const existingPaths = tsconfig.compilerOptions.paths || {};
                tsconfig.compilerOptions.paths = {
                    ...existingPaths,
                    '@/*': ['./*'],
                };

                fixed['tsconfig.json'] = JSON.stringify(tsconfig, null, 2);
                fixLog.push('Added @/* path alias to tsconfig.json');
            }
        }
    }

    // Update imports after renames
    if (renameMap.size) {
        for (const [filename, content] of Object.entries(fixed)) {
            if (typeof content !== 'string') continue;

            let updated = content;
            for (const [oldName, newName] of renameMap.entries()) {
                const oldBase = oldName.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, '');
                const newBase = newName.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, '');

                updated = updated.replace(
                    new RegExp(this._escapeRegex(oldBase), 'g'),
                    newBase
                );
            }

            fixed[filename] = updated;
        }
    }

    return { files: fixed, fixLog };
}

// ─────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────

_safeParseJSON(text) {
    if (typeof text !== 'string') return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

_containsJSX(content) {
    return /(<[A-Z][A-Za-z0-9_.:-]*[\s/>]|<\/[A-Z][A-Za-z0-9_.:-]*>|<>|<\/>|<[a-z][A-Za-z0-9_.:-]*[\s/>])/.test(content);
}

_hasUseClientDirective(content) {
    const firstChunk = String(content || '').trimStart().slice(0, 200);
    return /^['"]use client['"]\s*;?/m.test(firstChunk);
}

_looksLikeReactComponent(content) {
    return /\buse(State|Effect|Memo|Callback|Ref|Reducer)\b/.test(content) || /return\s*\(\s*</.test(content);
}

_usesClientOnlyHooks(content) {
    return /\buse(State|Effect|LayoutEffect|Ref|Reducer|Memo|Callback)\b/.test(content);
}

_usesPathAlias(content) {
    return /from\s+['"]@\/|import\s*\(\s*['"]@\/|require\(\s*['"]@\/|from\s+['"]~\//.test(content);
}

_isExternalImport(source) {
    return !source.startsWith('.') && !source.startsWith('@/') && !source.startsWith('~/');
}

_packageNameFromImport(source) {
    if (!source || source.startsWith('.') || source.startsWith('@/') || source.startsWith('~/')) return null;
    if (source.startsWith('@')) {
        const parts = source.split('/');
        return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : source;
    }
    return source.split('/')[0];
}

_extractImports(content) {
    const imports = [];

    // ES imports: import x from 'y'; import {a,b} from 'y'; import * as x from 'y'
    const importRegex = /import\s+(?:type\s+)?(?:(?:([\w*$\s,{}]+)\s+from\s+)?['"](.*?)['"]|['"](.*?)['"])/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const clause = (match[1] || '').trim();
        const source = (match[2] || match[3] || '').trim();
        if (!source) continue;

        const names = [];

        if (clause) {
            if (clause.startsWith('{')) {
                const inner = clause.replace(/^\{|\}$/g, '');
                for (const part of inner.split(',')) {
                    const clean = part.trim().split(/\s+as\s+/i)[0].trim();
                    if (clean) names.push(clean);
                }
            } else if (clause.startsWith('* as ')) {
                names.push('*');
            } else {
                // default import + maybe named imports
                const pieces = clause.split(',').map((s) => s.trim()).filter(Boolean);
                if (pieces[0]) names.push('default');
                if (pieces[1] && pieces[1].startsWith('{')) {
                    const inner = pieces[1].replace(/^\{|\}$/g, '');
                    for (const part of inner.split(',')) {
                        const clean = part.trim().split(/\s+as\s+/i)[0].trim();
                        if (clean) names.push(clean);
                    }
                }
            }
        }

        imports.push({
            names: names.length ? names : ['default'],
            source,
        });
    }

    // CommonJS requires: const x = require('y')
    const requireRegex = /require\(\s*['"](.*?)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
        const source = (match[1] || '').trim();
        if (!source) continue;
        imports.push({
            names: ['default'],
            source,
        });
    }

    return imports;
}

_extractExports(content) {
    const exports = [];

    const patterns = [
        /export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g,
        /export\s+class\s+([A-Za-z0-9_$]+)/g,
        /export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/g,
        /export\s+(?:type|interface|enum)\s+([A-Za-z0-9_$]+)/g,
        /export\s*\{([^}]*)\}/g,
        /export\s+default\s+([A-Za-z0-9_$]+)/g,
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (pattern.source.includes('\\{([^}]*)\\}')) {
                const names = String(match[1] || '')
                    .split(',')
                    .map((s) => s.trim().split(/\s+as\s+/i)[0].trim())
                    .filter(Boolean);
                exports.push(...names);
            } else {
                exports.push(match[1]);
            }
        }
    }

    return exports.filter(Boolean);
}

_findDuplicateExports(exports = []) {
    const counts = new Map();
    for (const name of exports) {
        counts.set(name, (counts.get(name) || 0) + 1);
    }
    return [...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name);
}

_resolveImportPath(fromFile, importSource, files) {
    if (!importSource) return null;

    let baseTarget = importSource;

    if (baseTarget.startsWith('@/')) {
        baseTarget = baseTarget.slice(2);
    } else if (baseTarget.startsWith('~/')) {
        baseTarget = baseTarget.slice(2);
    } else if (baseTarget.startsWith('./') || baseTarget.startsWith('../')) {
        const fromDir = fromFile.includes('/')
            ? fromFile.substring(0, fromFile.lastIndexOf('/'))
            : '';
        const dirParts = fromDir ? fromDir.split('/') : [];
        const importParts = baseTarget.split('/');

        for (const part of importParts) {
            if (part === '.' || !part) continue;
            if (part === '..') {
                dirParts.pop();
                continue;
            }
            dirParts.push(part);
        }
        baseTarget = dirParts.join('/');
    } else {
        return null;
    }

    const candidates = [
        baseTarget,
        ...this.extensionCandidates.map((ext) => `${baseTarget}${ext}`),
        `${baseTarget}/index.ts`,
        `${baseTarget}/index.tsx`,
        `${baseTarget}/index.js`,
        `${baseTarget}/index.jsx`,
        `${baseTarget}/index.mjs`,
        `${baseTarget}/index.cjs`,
    ];

    for (const candidate of candidates) {
        if (Object.prototype.hasOwnProperty.call(files, candidate)) return candidate;
    }

    return null;
}

_isExported(name, content) {
    const escaped = this._escapeRegex(name);

    const patterns = [
        new RegExp(`export\\s+(?:async\\s+)?(?:const|let|var|function|class|type|interface|enum)\\s+${escaped}\\b`),
        new RegExp(`export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`),
        new RegExp(`export\\s+default\\s+${escaped}\\b`),
    ];

    return patterns.some((p) => p.test(content));
}

_containsDefaultExport(content) {
    return /export\s+default\s+/.test(content);
}

_looksLikeNextRouteFile(filename) {
    return /(?:^|\/)route\.ts$/.test(filename) || /(?:^|\/)route\.tsx$/.test(filename);
}

_isDefinitelyImportedAsTypeOnly(content, name, source) {
    const typeImportRegex = new RegExp(
        String.raw`import\s+type\s+\{[^}]*\b${this._escapeRegex(name)}\b[^}]*\}\s+from\s+['"]${this._escapeRegex(source)}['"]`
    );
    return typeImportRegex.test(content);
}

_escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

}

// Export for browser
if (typeof window !== 'undefined') {
window.BugFinderAgent = BugFinderAgent;
}
