/* Zero-Builder Max: dependency and framework-boundary verification. */
class PreflightGuard {
    constructor() {
        this.knownVersions = {
            'framer-motion': '^11.11.17',
            'lucide-react': '^0.468.0',
            'zustand': '^5.0.3',
            'zod': '^3.24.2',
            '@hookform/resolvers': '^3.10.0',
            'react-hook-form': '^7.54.2',
            '@prisma/client': '^5.14.0',
            'clsx': '^2.1.1',
            'tailwind-merge': '^2.6.0',
        };

        this.frameworkDefaults = {
            'fullstack-nextjs': {
                clientOnlyHint: 'Next.js component using hooks but missing "use client".',
                packageRequired: true,
            },
            'nextjs': {
                clientOnlyHint: 'Next.js component using hooks but missing "use client".',
                packageRequired: true,
            },
            'vite-react': {
                clientOnlyHint: 'React component using hooks but missing "use client" is usually fine in Vite.',
                packageRequired: true,
            },
            vanilla: {
                clientOnlyHint: null,
                packageRequired: false,
            },
        };
    }

    inspect(files = {}, framework = 'vanilla') {
        const result = {
            files: { ...files },
            issues: [],
            fixes: [],
        };

        const addIssue = (severity, file, description, fix = null, category = 'preflight') => {
            result.issues.push({ severity, category, file, description, fix });
        };

        const addFix = (file, description) => {
            result.fixes.push({ file, description });
        };

        const frameworkMode = this.normalizeFramework(framework);
        const fileEntries = Object.entries(result.files);

        for (const [path, source] of fileEntries) {
            if (!/\.(jsx|tsx|js|ts)$/.test(path) || typeof source !== 'string') continue;

            let code = source;

            // Normalize malformed alias imports.
            const normalizedAliasCode = this.normalizeAliasImports(code);
            if (normalizedAliasCode !== code) {
                code = normalizedAliasCode;
                result.files[path] = code;
                addFix(path, 'Normalized malformed @ alias imports.');
            }

            // Detect and fix obvious "use client" boundary issues for Next.js.
            const usesHooks = this.usesReactHooks(code);
            const isNextBoundaryFile = this.isNextBoundaryFile(path, frameworkMode);
            const isClient = this.hasUseClientDirective(code);

            if (isNextBoundaryFile && usesHooks && !isClient) {
                result.files[path] = `'use client';\n\n${code}`;
                addFix(path, 'Added use client directive for React hooks in a Next.js component.');
                code = result.files[path];
            }

            // Server-only Next.js files should not import client-only browser APIs.
            if (frameworkMode !== 'vanilla' && this.isLikelyServerFile(path) && this.usesBrowserOnlyApis(code)) {
                addIssue(
                    'warning',
                    path,
                    'This file appears to use browser-only APIs in a server-oriented Next.js file.',
                    null,
                    'boundary'
                );
            }

            // Common import sanity checks for the current file.
            const imports = this.extractImports(code);
            for (const imp of imports) {
                if (this.isExternalImport(imp.source)) continue;

                const resolved = this.resolveLocalImport(path, imp.source, result.files);
                if (!resolved) {
                    addIssue(
                        'error',
                        path,
                        `Unresolved local import "${imp.source}" in "${path}".`,
                        null,
                        'imports'
                    );
                }
            }
        }

        // Dependency verification based on imports.
        this.verifyPackageDependencies(result, frameworkMode);

        // Lightweight content warnings.
        const allSource = Object.values(result.files).join('\n');
        if (/\bTODO\b|Lorem ipsum/i.test(allSource)) {
            addIssue(
                'warning',
                'generated files',
                'Placeholder content remains.',
                'Replace it with brand-specific content.',
                'content'
            );
        }

        if (this.hasMultipleEntryPatterns(result.files, frameworkMode)) {
            addIssue(
                'warning',
                'project',
                'Project appears to mix multiple framework entry patterns.',
                'Consolidate to one runtime boundary if this is not intentional.',
                'framework'
            );
        }

        return result;
    }

    normalizeFramework(framework) {
        const value = String(framework || 'vanilla').toLowerCase();
        if (value.includes('fullstack') && value.includes('next')) return 'fullstack-nextjs';
        if (value.includes('next')) return 'nextjs';
        if (value.includes('vite')) return 'vite-react';
        return 'vanilla';
    }

    normalizeAliasImports(code) {
        // Convert malformed "@components/" → "@/components/" and similar cases.
        return String(code || '')
            .replace(/from\s+['"]@(components|lib|hooks|utils)\//g, "from '@/$1/")
            .replace(/import\(\s*['"]@(components|lib|hooks|utils)\//g, "import('@/$1/")
            .replace(/require\(\s*['"]@(components|lib|hooks|utils)\//g, "require('@/$1/");
    }

    hasUseClientDirective(code) {
        const firstChunk = String(code || '').trimStart().slice(0, 200);
        return /^['"]use client['"]\s*;?/m.test(firstChunk);
    }

    usesReactHooks(code) {
        return /\b(useState|useEffect|useMemo|useRef|useReducer|useLayoutEffect|useCallback|useForm|useQuery|useMutation)\s*\(/.test(
            String(code || '')
        );
    }

    usesBrowserOnlyApis(code) {
        return /\b(window|document|localStorage|sessionStorage|navigator|matchMedia|ResizeObserver|IntersectionObserver)\b/.test(
            String(code || '')
        );
    }

    isNextBoundaryFile(path, frameworkMode) {
        if (frameworkMode === 'vanilla') return false;
        return /^(app|components)\//.test(path) || /^src\/(app|components)\//.test(path) || /\.(tsx|jsx)$/.test(path);
    }

    isLikelyServerFile(path) {
        return /(?:^|\/)(layout|page|route|server|handler)\.(ts|tsx|js|jsx)$/.test(path) || /middleware\.ts$/.test(path);
    }

    isExternalImport(source) {
        return !source.startsWith('.') && !source.startsWith('@/') && !source.startsWith('~/');
    }

    extractImports(content) {
        const imports = [];
        const code = String(content || '');

        const importRegex = /import\s+(?:type\s+)?(?:(.+?)\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(code)) !== null) {
            const clause = String(match[1] || '').trim();
            const source = String(match[2] || '').trim();
            const names = [];

            if (clause) {
                const defaultPart = clause.match(/^[A-Za-z_$][\w$]*/);
                if (defaultPart) names.push('default');

                const namedMatch = clause.match(/\{([\s\S]*?)\}/);
                if (namedMatch?.[1]) {
                    for (const part of namedMatch[1].split(',')) {
                        const clean = part.trim().split(/\s+as\s+/i)[0].trim();
                        if (clean) names.push(clean);
                    }
                }

                if (/\*\s+as\s+[A-Za-z_$][\w$]*/.test(clause)) {
                    names.push('*');
                }
            } else {
                names.push('default');
            }

            imports.push({
                names: Array.from(new Set(names)),
                source,
            });
        }

        // CommonJS require support.
        const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
        while ((match = requireRegex.exec(code)) !== null) {
            const source = String(match[1] || '').trim();
            if (!source) continue;
            imports.push({
                names: ['default'],
                source,
            });
        }

        return imports;
    }

    resolveLocalImport(fromFile, importSource, files) {
        let target = String(importSource || '');

        if (target.startsWith('@/')) {
            target = target.slice(2);
        } else if (target.startsWith('~/')) {
            target = target.slice(2);
        } else if (target.startsWith('./') || target.startsWith('../')) {
            const fromDir = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/')) : '';
            const parts = fromDir ? fromDir.split('/') : [];
            for (const segment of target.split('/')) {
                if (!segment || segment === '.') continue;
                if (segment === '..') {
                    parts.pop();
                    continue;
                }
                parts.push(segment);
            }
            target = parts.join('/');
        } else {
            return null;
        }

        const candidates = [
            target,
            `${target}.ts`,
            `${target}.tsx`,
            `${target}.js`,
            `${target}.jsx`,
            `${target}/index.ts`,
            `${target}/index.tsx`,
            `${target}/index.js`,
            `${target}/index.jsx`,
        ];

        for (const candidate of candidates) {
            if (Object.prototype.hasOwnProperty.call(files, candidate)) return candidate;
        }

        return null;
    }

    verifyPackageDependencies(result, frameworkMode) {
        const pkgText = result.files['package.json'];
        if (!pkgText) {
            if (this.frameworkDefaults[frameworkMode]?.packageRequired) {
                result.issues.push({
                    severity: 'critical',
                    category: 'preflight',
                    file: 'package.json',
                    description: 'Framework project has no package.json.',
                    fix: 'Generate package.json with all required dependencies.',
                });
            }
            return;
        }

        let pkg;
        try {
            pkg = JSON.parse(pkgText);
        } catch {
            result.issues.push({
                severity: 'critical',
                category: 'preflight',
                file: 'package.json',
                description: 'package.json is not valid JSON.',
                fix: 'Regenerate a valid package manifest.',
            });
            return;
        }

        pkg.dependencies = pkg.dependencies || {};
        pkg.devDependencies = pkg.devDependencies || {};

        const sourceBlob = Object.values(result.files).join('\n');
        const imports = this.extractImports(sourceBlob);

        const added = new Set();

        for (const imp of imports) {
            if (this.isExternalImport(imp.source)) {
                const packageName = this.packageNameFromImport(imp.source);
                if (!packageName) continue;

                const knownVersion = this.knownVersions[packageName];
                const hasDependency =
                    pkg.dependencies[packageName] || pkg.devDependencies[packageName] || pkg.peerDependencies?.[packageName];

                if (knownVersion && !hasDependency && !added.has(packageName)) {
                    pkg.dependencies[packageName] = knownVersion;
                    added.add(packageName);
                    result.fixes.push({
                        file: 'package.json',
                        description: `Added missing dependency ${packageName}.`,
                    });
                }
            }
        }

        if (added.size) {
            result.files['package.json'] = JSON.stringify(pkg, null, 2);
        }

        // Basic framework boundary checks.
        if (frameworkMode !== 'vanilla') {
            const needsClientBoundary = Object.entries(result.files).some(([path, code]) => {
                if (!this.isNextBoundaryFile(path, frameworkMode)) return false;
                return this.usesReactHooks(String(code || '')) && !this.hasUseClientDirective(String(code || ''));
            });

            if (needsClientBoundary) {
                result.issues.push({
                    severity: 'warning',
                    category: 'boundary',
                    file: 'components',
                    description: this.frameworkDefaults[frameworkMode].clientOnlyHint,
                    fix: 'Add "use client" only where interactive hooks are used.',
                });
            }
        }
    }

    packageNameFromImport(source) {
        if (!source || source.startsWith('.') || source.startsWith('@/') || source.startsWith('~/')) return null;
        if (source.startsWith('@')) {
            const parts = source.split('/');
            return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : source;
        }
        return source.split('/')[0];
    }

    hasMultipleEntryPatterns(files = {}, frameworkMode = 'vanilla') {
        const names = Object.keys(files);

        const nextLike = names.some((n) => /^(app|src\/app)\//.test(n) || /next\.config\./.test(n));
        const viteLike = names.some((n) => /vite\.config\./.test(n) || /src\/main\.(ts|tsx|js|jsx)$/.test(n));
        const staticLike = names.some((n) => /index\.html$/.test(n));

        const count =
            (nextLike ? 1 : 0) +
            (viteLike ? 1 : 0) +
            (staticLike ? 1 : 0);

        // Only warn if there is actual overlap that looks accidental.
        if (count <= 1) return false;
        if (frameworkMode === 'vanilla' && staticLike && !nextLike && !viteLike) return false;

        return true;
    }
}

if (typeof window !== 'undefined') {
    window.PreflightGuard = PreflightGuard;
}
