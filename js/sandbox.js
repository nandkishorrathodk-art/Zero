/* ============================================================
   LOCAL PREVIEW BRIDGE — upgraded & hardened
   Static projects render in-browser; framework projects are
   exported to the user's local workspace through server.js.
   ============================================================ */
class SandboxManager {
    getProjectType(files = {}) {
        const pkg = String(files['package.json'] || '');
        if (
            files['app/page.tsx'] || files['app/page.jsx'] ||
            files['next.config.js'] || files['next.config.mjs'] ||
            pkg.includes('"next"')
        ) return 'nextjs';
        if (
            files['src/main.jsx'] || files['src/main.tsx'] ||
            files['src/App.jsx'] || files['src/App.tsx'] ||
            pkg.includes('"react"')
        ) return 'react';
        return 'static';
    }

    generateLocalPreview(files = {}, projectType = this.getProjectType(files)) {
        // Only route true React/Next sources through the Babel/UMD preview.
        // Plain static script.js with ESM imports must stay on the DOM path.
        if (projectType === 'react' || this._hasReactFiles(files)) {
            return this._buildReactInBrowserPreview(files);
        }
        if (projectType === 'nextjs') {
            if (files['app/page.tsx'] || files['app/page.jsx'] || files['pages/index.js'] || files['pages/index.tsx']) {
                return this._buildReactInBrowserPreview(files);
            }
            return this._frameworkMessage(
                'Next.js Full-Stack Project',
                'This full-stack project is configured for your local workspace. Export to Local Workspace to run `npm run dev` with full API routes & Prisma DB.'
            );
        }

        let html = String(files['index.html'] || '<!doctype html><html><body><h1>No content generated</h1></body></html>');
        const css = String(files['styles.css'] || '');
        const js = String(files['script.js'] || '');
        const threeJs = String(files['three-scene.js'] || '');
        return this._buildDOMPreview(html, { ...files, 'styles.css': css, 'script.js': js, 'three-scene.js': threeJs });
    }

    _hasReactFiles(files = {}) {
        const names = Object.keys(files || {});
        // Explicit React/Next entrypoints only — do NOT treat vanilla ESM
        // (export default / import gsap) as a React project.
        if (names.some((f) => f.endsWith('.jsx') || f.endsWith('.tsx'))) return true;
        if (names.some((f) => /^(src\/)?(main|App|index)\.(jsx|tsx)$/i.test(f))) return true;
        if (names.some((f) => /^(app|src\/app)\/.*\.(jsx|tsx)$/i.test(f))) return true;
        if (files['package.json'] && /"react"\s*:/.test(String(files['package.json']))) {
            return names.some((f) =>
                /\.(jsx|tsx)$/.test(f) ||
                /^(src\/)?(main|App)\.(js|jsx|tsx)$/i.test(f) ||
                /^app\/.*page\.(js|jsx|tsx)$/i.test(f)
            );
        }
        return false;
    }

    /* ---------- React / Next in-browser preview ---------- */
    _buildReactInBrowserPreview(files) {
        let jsxCode = '';

        // Collect & sanitize every component file
        Object.keys(files).forEach(filename => {
            if (
                (filename.endsWith('.jsx') || filename.endsWith('.tsx') || filename.endsWith('.js')) &&
                !filename.includes('vite.config') &&
                !filename.includes('tailwind.config') &&
                !filename.includes('next.config')
            ) {
                let code = String(files[filename] || '');

                // Next.js layout → valid React tree
                if (filename.includes('layout.')) {
                    code = code
                        .replace(/<html[^>]*>/gi, '<div className="next-layout-shell">')
                        .replace(/<\/html>/gi, '</div>')
                        .replace(/<body[^>]*>/gi, '<div className="next-body-shell">')
                        .replace(/<\/body>/gi, '</div>');
                }

                // Clean import/export statements for in-browser concatenation
                code = this._sanitizeForBrowser(code);
                jsxCode += `\n/* ===== File: ${filename} ===== */\n${code}\n`;
            }
        });

        // Detect main component name
        let mainComponentName = 'App';
        if (!/function\s+App\b|const\s+App\b|class\s+App\b/.test(jsxCode)) {
            const match = jsxCode.match(/function\s+([A-Z][A-Za-z0-9_]*)/);
            if (match) mainComponentName = match[1];
        }

        const customCss = files['src/index.css'] || files['src/App.css'] || files['styles.css'] || files['app/globals.css'] || '';

        const rawAppCode = `
const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext, Fragment } = React;

// ---- Next.js mock helpers ----
const useRouter = () => ({
    push: (url) => console.log('[mock] router.push', url),
    replace: (url) => console.log('[mock] router.replace', url),
    back: () => {},
    prefetch: () => {},
    pathname: '/',
    query: {},
    asPath: '/'
});
const usePathname = () => '/';
const useSearchParams = () => new URLSearchParams();
const useParams = () => ({});
const Link = ({ href = '#', children, ...props }) =>
    React.createElement('a', { href, ...props }, children);
const Image = ({ src, alt = '', width, height, ...props }) =>
    React.createElement('img', { src, alt, width, height, ...props });

// ---- Lucide helper ----
const Icon = ({ name, className = 'w-5 h-5', ...props }) =>
    React.createElement('i', { 'data-lucide': name, className, ...props });

${jsxCode}

// ---- Error Boundary ----
class PreviewErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('Preview ErrorBoundary:', error, info);
        window.parent.postMessage({
            type: 'ZERO_PREVIEW_ERROR',
            message: error?.message || String(error),
            stack: error?.stack
        }, '*');
    }
    render() {
        if (this.state.hasError) {
            return React.createElement('div', {
                className: 'p-6 m-4 bg-red-950/90 border border-red-700 text-red-100 rounded-xl'
            },
                React.createElement('h3', { className: 'font-bold text-lg mb-2' }, 'Runtime Error'),
                React.createElement('pre', { className: 'font-mono text-sm whitespace-pre-wrap' },
                    this.state.error?.message || String(this.state.error)
                )
            );
        }
        return this.props.children;
    }
}

// ---- Mount ----
try {
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error('Root element #root not found');

    let ComponentToRender =
        (typeof App !== 'undefined' && App) ||
        (typeof Page !== 'undefined' && Page) ||
        (typeof Home !== 'undefined' && Home) ||
        (typeof RootLayout !== 'undefined' && RootLayout) ||
        (typeof ${mainComponentName} !== 'undefined' && ${mainComponentName}) ||
        null;

    if (!ComponentToRender) {
        rootElement.innerHTML = '<div class="p-8 text-center text-zinc-400"><h2 class="text-xl font-bold mb-2">No root component found</h2><p>Export a default App / Page / Home component.</p></div>';
    } else {
        const root = ReactDOM.createRoot(rootElement);
        const isLayout = ComponentToRender === (typeof RootLayout !== 'undefined' ? RootLayout : null);

        const content = isLayout
            ? React.createElement(ComponentToRender, null,
                React.createElement(
                    (typeof Page !== 'undefined' ? Page : (typeof App !== 'undefined' ? App : () => React.createElement('div', { className: 'p-4' }, 'App Active')))
                )
              )
            : React.createElement(ComponentToRender);

        root.render(
            React.createElement(PreviewErrorBoundary, null, content)
        );

        // Lucide icons after paint
        setTimeout(() => {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        }, 80);
    }
} catch (err) {
    const el = document.getElementById('root');
    if (el) {
        el.innerHTML = '<div class="p-6 bg-red-950/90 border border-red-700 text-red-100 rounded-xl m-4"><h3 class="font-bold text-lg mb-2">React Compilation / Mount Error</h3><pre class="font-mono text-sm whitespace-pre-wrap">' +
            (err.message || String(err)) + '</pre></div>';
    }
    window.parent.postMessage({ type: 'ZERO_PREVIEW_ERROR', message: err.message || String(err) }, '*');
}
`;

        const safeRawCodeJson = JSON.stringify(rawAppCode).replace(/<\/script/gi, '<\\/script');

        // Build the Babel transform script as a regular string (not template literal)
        // to avoid backslash escaping issues with regex patterns.
        const babelScript = this._buildBabelTransformScript(safeRawCodeJson);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Live Preview</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              border: "rgba(255,255,255,0.1)",
              input: "rgba(255,255,255,0.15)",
              ring: "#8b5cf6",
              background: "#09090b",
              foreground: "#fafafa",
              primary: { DEFAULT: "#7c3aed", foreground: "#ffffff" },
              secondary: { DEFAULT: "#27272a", foreground: "#fafafa" },
              muted: { DEFAULT: "#27272a", foreground: "#a1a1aa" },
              accent: { DEFAULT: "#3f3f46", foreground: "#fafafa" },
            }
          }
        }
      }
    <\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"><\/script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 0; }
        ${customCss}
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        // Quiet noisy CDN warnings
        ['warn', 'info'].forEach(method => {
            const orig = console[method];
            if (!orig) return;
            console[method] = function (...args) {
                const msg = args.map(a => (typeof a === 'string' ? a : (a?.message || ''))).join(' ');
                if (/tailwindcss|Babel|production|PostCSS|cdn\\.tailwindcss|deprecated with r150|removed with r160/i.test(msg)) return;
                orig.apply(console, args);
            };
        });

        window.addEventListener('error', function (e) {
            if (!e.message || e.message === 'Script error.') return;
            window.parent.postMessage({
                type: 'ZERO_PREVIEW_ERROR',
                message: e.message,
                filename: e.filename,
                lineno: e.lineno
            }, '*');
        });
        window.addEventListener('unhandledrejection', function (e) {
            window.parent.postMessage({
                type: 'ZERO_PREVIEW_ERROR',
                message: e.reason?.message || String(e.reason)
            }, '*');
        });
    <\/script>
    ` + babelScript + `
</body>
</html>`;
    }

    /**
     * Build the Babel transform + cleanup script as a plain string.
     * This avoids template-literal backslash escaping issues with regex patterns.
     */
    _buildBabelTransformScript(safeRawCodeJson) {
        // ESM stripper function (runs in browser iframe)
        const stripEsmFn = [
            'function zeroStripEsm(code) {',
            '  var src = String(code || "");',
            '  for (var i = 0; i < 8; i++) {',
            '    var next = src',
            '      .replace(/^\\s*import\\s+type\\s+[\\s\\S]*?from\\s*[\'"][^\'"]+[\'"]\\s*;?/gm, "")',
            '      .replace(/^\\s*import\\s*[\\s\\S]*?from\\s*[\'"][^\'"]+[\'"]\\s*;?/gm, "")',
            '      .replace(/^\\s*import\\s*[\'"][^\'"]+[\'"]\\s*;?/gm, "")',
            '      .replace(/^\\s*export\\s+\\{[\\s\\S]*?\\}\\s*;?/gm, "")',
            '      .replace(/^\\s*export\\s+\\*\\s+from\\s*[\'"][^\'"]+[\'"]\\s*;?/gm, "");',
            '    if (next === src) break;',
            '    src = next;',
            '  }',
            '  src = src.replace(/(^|[\\n;])\\s*import\\s+[^;]*;?/g, "$1");',
            '  return src;',
            '}',
        ].join('\n');

        // Babel transform + require replacement + ESM stripping
        const transformFn = [
            '(function () {',
            '  var rawCode = ' + safeRawCodeJson + ';',
            '  try {',
            '    var transpiled = Babel.transform(rawCode, {',
            '      presets: [',
            '        ["react", { runtime: "classic" }],',
            '        ["typescript", { ignoreExtensions: true }]',
            '      ],',
            '      plugins: [',
            '        ["transform-modules-commonjs", { strictMode: false }]',
            '      ],',
            '      filename: "preview.tsx"',
            '    }).code;',
            '',
            '    var clean = zeroStripEsm(transpiled)',
            '      .replace(/require\\([\'"]react\\/jsx-runtime[\'"]\\)/g, "({ jsx: React.createElement, jsxs: React.createElement, Fragment: React.Fragment })")',
            '      .replace(/require\\([\'"]react[\'"]\\)/g, "React")',
            '      .replace(/require\\([\'"]react-dom(?:\\/client)?[\'"]\\)/g, "ReactDOM")',
            '      .replace(/require\\([\'"]three[\'"]\\)/g, "(typeof THREE !== \\"undefined\\" ? THREE : {})")',
            '      .replace(/require\\([\'"][^\'"]+[\'"]\\)/g, "({})");',
            '',
            '    if (/\\bimport\\s+/.test(clean)) {',
            '      throw new Error("Preview still contains ESM import statements after sanitization.");',
            '    }',
            '',
            '    var scriptEl = document.createElement("script");',
            '    scriptEl.type = "text/javascript";',
            '    scriptEl.text = clean;',
            '    document.body.appendChild(scriptEl);',
            '  } catch (err) {',
            '    document.getElementById("root").innerHTML =',
            '      \'<div class="p-6 bg-red-950/90 border border-red-700 text-red-100 rounded-xl m-4">\' +',
            '      \'<h3 class="font-bold text-lg mb-2">Babel Compilation Error</h3>\' +',
            '      \'<pre class="font-mono text-sm whitespace-pre-wrap">\' + (err.message || String(err)) + \'</pre></div>\';',
            '    window.parent.postMessage({ type: "ZERO_PREVIEW_ERROR", message: err.message || String(err) }, "*");',
            '  }',
            '})();',
        ].join('\n');

        return '<script>\n' + stripEsmFn + '\n' + transformFn + '\n<\/script>';
    }

    /* ---------- Clean import/export statements for in-browser concatenation ---------- */
    _sanitizeForBrowser(code) {
        let src = String(code || '');

        // Map known library imports to their browser globals BEFORE stripping ESM
        // Three.js
        src = src.replace(/import\s+(\w+)\s+from\s*['"]three[^'"]*['"]\s*;?/g, 'const $1 = window.THREE;');
        src = src.replace(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]three[^'"]*['"]\s*;?/g, 'const $1 = window.THREE;');
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]three[^'"]*['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const [orig, alias] = n.split(/\s+as\s+/).map(s => s.trim());
                const local = alias || orig;
                return `const ${local} = typeof THREE !== 'undefined' ? THREE.${orig} : undefined;`;
            }).filter(Boolean).join('\n');
        });
        // @react-three/fiber & @react-three/drei → mock/noop (not available in UMD preview)
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@react-three\/(?:fiber|drei|postprocessing)['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const [orig, alias] = n.split(/\s+as\s+/).map(s => s.trim());
                const local = alias || orig;
                return `const ${local} = typeof ${orig} !== 'undefined' ? ${orig} : function(){return null;};`;
            }).filter(Boolean).join('\n');
        });
        // GSAP
        src = src.replace(/import\s+(\w+)\s+from\s*['"]gsap(?:\/dist\/gsap)?['"]\s*;?/g, 'const $1 = window.gsap;');
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]gsap(?:\/[^'"]*)?['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const [orig, alias] = n.split(/\s+as\s+/).map(s => s.trim());
                const local = alias || orig;
                if (orig === 'gsap' || orig === 'default') return `const ${local} = window.gsap;`;
                return `const ${local} = window.gsap?.${orig} || window.${orig};`;
            }).filter(Boolean).join('\n');
        });
        // Lenis
        src = src.replace(/import\s+(\w+)\s+from\s*['"][^'"]*lenis[^'"]*['"]\s*;?/g, 'const $1 = window.Lenis;');
        // framer-motion → mock
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]framer-motion['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const name = n.split(/\s+as\s+/).map(s => s.trim()).pop();
                if (/^motion$/.test(name)) return `const motion = new Proxy({}, { get: (_, tag) => (props) => React.createElement(tag, props) });`;
                if (/^AnimatePresence$/.test(name)) return `const AnimatePresence = ({children}) => React.createElement(React.Fragment, null, children);`;
                return `const ${name} = typeof ${name} !== 'undefined' ? ${name} : function(){return null;};`;
            }).filter(Boolean).join('\n');
        });
        // lucide-react → map to Icon helper
        src = src.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"]\s*;?/g, (m, names) => {
            return names.split(',').map(n => {
                const name = n.split(/\s+as\s+/).map(s => s.trim()).pop();
                const iconName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
                return `const ${name} = (props) => React.createElement('i', Object.assign({ 'data-lucide': '${iconName}' }, props));`;
            }).filter(Boolean).join('\n');
        });

        // Now strip remaining ESM syntax
        src = this._stripEsmSyntax(src);

        return src
            // remove "use client" / "use server"
            .replace(/["']use client["'];?/g, '')
            .replace(/["']use server["'];?/g, '')
            // default export → plain function / class
            .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1')
            .replace(/export\s+default\s+function\s*(?=\()/g, 'function DefaultApp')
            .replace(/export\s+default\s+class\s+([A-Za-z0-9_]+)/g, 'class $1')
            .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, 'var App = typeof $1 !== "undefined" ? $1 : App;')
            // named exports
            .replace(/export\s+(const|let|var|function|class|type|interface|enum)\s+/g, '$1 ')
            // Next.js metadata
            .replace(/export\s+const\s+metadata[\s\S]*?=[\s\S]*?;/g, '')
            .replace(/export\s+const\s+generateMetadata[\s\S]*?=[\s\S]*?;/g, '')
            // TypeScript non-null assertions & definite assignment
            .replace(/([a-zA-Z0-9_\)\]])!\./g, '$1.')
            .replace(/\(null!\)/g, '(null)')
            .replace(/!\s*([,;\)\]\n])/g, '$1')
            // framer-motion / gsap ease leftovers that sometimes appear
            .replace(/case:\s*(['"](?:none|power\d\.(?:in|out|inOut)|linear|expo|circ)['"])/g, 'ease: $1')
            // remove remaining export keywords that survived
            .replace(/\bexport\s+\{[^}]*\}\s*;?/g, '')
            .replace(/\bexport\s+/g, '');
    }

    /**
     * Aggressively strip static ESM import/export syntax so code can run as a
     * classic script. Dynamic import() calls are left alone (valid in classic JS).
     */
    _stripEsmSyntax(code) {
        let src = String(code || '');

        // Normalize line endings
        src = src.replace(/\r\n/g, '\n');

        for (let pass = 0; pass < 10; pass++) {
            const before = src;
            // import type ... from 'x'
            src = src.replace(/^\s*import\s+type\s+[\s\S]*?from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            // import ... from 'x'  (multi-line, including `import Foo, { a } from "x"`)
            src = src.replace(/^\s*import\s*(?:[\w*\s{},$]+)\s*from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            // Multi-line brace imports: import {\n  a,\n  b\n} from 'x'
            src = src.replace(/^\s*import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            // Side-effect: import 'x'
            src = src.replace(/^\s*import\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            // export * from 'x' / export { a } from 'x'
            src = src.replace(/^\s*export\s+\*\s+from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            src = src.replace(/^\s*export\s+\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;?\s*/gm, '');
            if (src === before) break;
        }

        // Final safety net for any leftover static import statements
        src = src.replace(/(^|[\n;])\s*import\s+(?![\s\S]{0,20}\()[^;\n]*(?:;|\n)/g, '$1\n');

        return src;
    }

    /**
     * Rewrite common ESM CDN imports in static sites to global UMD usage and
     * return { code, cdnScripts } so the preview can inject the right <script src>.
     */
    _rewriteStaticModules(js) {
        const cdnScripts = [];
        const seen = new Set();
        const addCdn = (url) => {
            if (!url || seen.has(url)) return;
            seen.add(url);
            cdnScripts.push(url);
        };

        let code = String(js || '');

        const catalog = [
            {
                test: /from\s*['"](?:gsap|gsap\/dist\/gsap)['"]|from\s*['"]https?:\/\/[^'"]*gsap[^'"]*['"]/i,
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
            },
            {
                test: /ScrollTrigger|from\s*['"]gsap\/ScrollTrigger['"]/i,
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
            },
            {
                test: /from\s*['"](?:three|three\/build\/three)['"]|from\s*['"]https?:\/\/[^'"]*three[^'"]*['"]/i,
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            },
            {
                test: /from\s*['"]@studio-freight\/lenis['"]|from\s*['"]lenis['"]|from\s*['"]https?:\/\/[^'"]*lenis[^'"]*['"]/i,
                cdn: 'https://unpkg.com/lenis@1.1.14/dist/lenis.min.js',
            },
        ];

        catalog.forEach((entry) => {
            if (entry.test.test(code)) addCdn(entry.cdn);
        });

        // Map named ESM imports of known libs onto window globals before stripping.
        code = code
            .replace(/import\s+(\w+)\s+from\s*['"]gsap(?:\/dist\/gsap)?['"]\s*;?/g, 'const $1 = window.gsap;')
            .replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]gsap(?:\/dist\/gsap)?['"]\s*;?/g, (m, names) => {
                const parts = names.split(',').map((n) => n.trim()).filter(Boolean);
                return parts.map((n) => {
                    const [orig, alias] = n.split(/\s+as\s+/).map((s) => s.trim());
                    const local = alias || orig;
                    if (orig === 'gsap' || orig === 'default') return `const ${local} = window.gsap;`;
                    return `const ${local} = window.gsap?.${orig} || window.${orig};`;
                }).join('\n');
            })
            .replace(/import\s*\{\s*ScrollTrigger\s*\}\s*from\s*['"][^'"]*ScrollTrigger[^'"]*['"]\s*;?/g, 'const ScrollTrigger = window.ScrollTrigger;')
            .replace(/import\s+(\w+)\s+from\s*['"]three[^'"]*['"]\s*;?/g, 'const $1 = window.THREE;')
            .replace(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]three[^'"]*['"]\s*;?/g, 'const $1 = window.THREE;')
            .replace(/import\s+(\w+)\s+from\s*['"][^'"]*lenis[^'"]*['"]\s*;?/g, 'const $1 = window.Lenis;');

        // Generic https ESM imports → try to keep as classic globals if possible, else strip
        code = code.replace(
            /import\s+(\w+)\s+from\s*['"](https?:\/\/[^'"]+)['"]\s*;?/g,
            (match, name, url) => {
                addCdn(url);
                return `/* ESM import of ${name} inlined via CDN ${url} */\nconst ${name} = window.${name} || window.gsap || window.THREE || window.Lenis;`;
            }
        );

        code = this._stripEsmSyntax(code);
        // Drop export keywords in static scripts
        code = code
            .replace(/export\s+default\s+/g, '')
            .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
            .replace(/export\s+\{[^}]*\}\s*;?/g, '')
            .replace(/\bexport\s+/g, '');

        return { code, cdnScripts };
    }

    /* ---------- Static DOM preview ---------- */
    _buildDOMPreview(html, files) {
        const parser = new DOMParser();
        const safeHtml = this._ensureDocumentShell(html);
        const doc = parser.parseFromString(safeHtml, 'text/html');

        this._inlineLinkedStyles(doc, files);
        this._inlineLinkedScripts(doc, files);
        this._inlineAssets(doc, files);
        this._patchCssUrls(doc, files);
        this._demoteModuleScripts(doc);

        if (!doc.querySelector('script[src*="tailwindcss"]')) {
            const s = doc.createElement('script');
            s.src = 'https://cdn.tailwindcss.com';
            doc.head.prepend(s);
        }
        if (!doc.querySelector('script[src*="lucide"]')) {
            const s = doc.createElement('script');
            s.src = 'https://unpkg.com/lucide@latest';
            doc.head.appendChild(s);
        }

        // Collect CDN deps from every local script before inlining.
        const pendingCdns = [];
        const collectAndRewrite = (sourceName) => {
            if (!files[sourceName]) return null;
            const rewritten = this._rewriteStaticModules(files[sourceName]);
            pendingCdns.push(...(rewritten.cdnScripts || []));
            return rewritten.code;
        };

        const threeCode = collectAndRewrite('three-scene.js');
        const scriptCode = collectAndRewrite('script.js');

        // Also scan already-inlined local scripts for remaining ESM + CDN needs
        doc.querySelectorAll('script:not([src])').forEach((node) => {
            const raw = node.textContent || '';
            if (!/\bimport\s+|from\s+['"]gsap|from\s+['"]three|ScrollTrigger|lenis/i.test(raw)) return;
            const rewritten = this._rewriteStaticModules(raw);
            pendingCdns.push(...(rewritten.cdnScripts || []));
            node.textContent = rewritten.code;
            node.removeAttribute('type'); // classic script after rewrite
        });

        // Inject required UMD CDNs (GSAP, Three, Lenis, …) once
        Array.from(new Set(pendingCdns)).forEach((url) => {
            if (doc.querySelector(`script[src="${url}"]`)) return;
            const s = doc.createElement('script');
            s.src = url;
            s.dataset.zeroCdn = '1';
            doc.head.appendChild(s);
        });

        const errorScript = doc.createElement('script');
        errorScript.textContent = `
            window.addEventListener('error', function(e) {
                if (!e.message || e.message === 'Script error.') return;
                window.parent.postMessage({ type: 'ZERO_PREVIEW_ERROR', message: e.message, filename: e.filename, lineno: e.lineno }, '*');
            });
            document.addEventListener('DOMContentLoaded', function() {
                if (window.lucide) lucide.createIcons();
            });
        `;
        doc.head.appendChild(errorScript);

        if (files['styles.css'] && !doc.querySelector('style[data-zero-source="styles.css"]')) {
            this._appendStyle(doc, files['styles.css'], 'styles.css', files);
        }
        if (threeCode && !doc.querySelector('script[data-zero-source="three-scene.js"]')) {
            this._appendScript(doc, threeCode, 'three-scene.js');
        }
        if (scriptCode && !doc.querySelector('script[data-zero-source="script.js"]')) {
            this._appendScript(doc, scriptCode, 'script.js');
        }

        if (!doc.querySelector('meta[name="viewport"]')) {
            const meta = doc.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width,initial-scale=1';
            doc.head.prepend(meta);
        }
        if (!doc.querySelector('meta[charset]')) {
            const meta = doc.createElement('meta');
            meta.setAttribute('charset', 'utf-8');
            doc.head.prepend(meta);
        }

        return `<!doctype html>\n${doc.documentElement.outerHTML}`;
    }

    /** Convert type=module inline scripts that we can classic-ify; drop bare module src we cannot resolve. */
    _demoteModuleScripts(doc) {
        doc.querySelectorAll('script[type="module"]').forEach((script) => {
            const src = script.getAttribute('src');
            // External module CDNs often fail in srcdoc — prefer leaving local inlined code only.
            if (src && /^(https?:)?\/\//i.test(src)) {
                // Keep skypack/esm.sh out of classic path; remove to avoid the import error spam.
                if (/skypack|esm\.sh|jspm\.dev|unpkg\.com\/\+esm/i.test(src)) {
                    script.remove();
                }
                return;
            }
            if (!src) {
                // Inline module: strip ESM and run as classic after rewrite later.
                script.removeAttribute('type');
            }
        });
    }

    _ensureDocumentShell(html) {
        const source = String(html || '').trim();
        if (/<html[\s>]/i.test(source)) return source;
        if (/<body[\s>]/i.test(source) || /<head[\s>]/i.test(source)) {
            return `<!doctype html><html>${source}</html>`;
        }
        return `<!doctype html><html><head></head><body>${source}</body></html>`;
    }

    _inlineLinkedStyles(doc, files) {
        doc.querySelectorAll('link[rel~="stylesheet"][href]').forEach(link => {
            const path = this._resolvePath(link.getAttribute('href'));
            const source = files[path];
            if (!source || this._isDataUrl(source)) return;
            const style = this._createStyle(doc, source, path, files);
            link.replaceWith(style);
        });
    }

    _inlineLinkedScripts(doc, files) {
        doc.querySelectorAll('script[src]').forEach(script => {
            const path = this._resolvePath(script.getAttribute('src'));
            const source = files[path];
            if (!source || this._isDataUrl(source)) return;
            // Always classic-ify local project scripts — ESM imports break srcdoc previews.
            const rewritten = this._rewriteStaticModules(source);
            const replacement = this._createScript(doc, rewritten.code, path);
            // Inject any CDN deps discovered on this file next to the script
            (rewritten.cdnScripts || []).forEach((url) => {
                if (doc.querySelector(`script[src="${url}"]`)) return;
                const cdn = doc.createElement('script');
                cdn.src = url;
                cdn.dataset.zeroCdn = '1';
                script.parentNode?.insertBefore(cdn, script);
            });
            script.replaceWith(replacement);
        });
    }

    _inlineAssets(doc, files) {
        const attrs = [
            ['img', 'src'], ['source', 'src'], ['video', 'src'], ['video', 'poster'],
            ['audio', 'src'], ['link[rel~="icon"]', 'href']
        ];
        attrs.forEach(([selector, attr]) => {
            doc.querySelectorAll(`${selector}[${attr}]`).forEach(node => {
                const path = this._resolvePath(node.getAttribute(attr));
                if (files[path] && this._isDataUrl(files[path])) {
                    node.setAttribute(attr, files[path]);
                }
            });
        });
    }

    _patchCssUrls(doc, files) {
        doc.querySelectorAll('style').forEach(style => {
            style.textContent = this._replaceCssUrls(style.textContent, files);
        });
    }

    _replaceCssUrls(css, files) {
        return String(css || '').replace(/url\((['"]?)([^'")\s]+)\1\)/g, (match, quote, rawPath) => {
            const path = this._resolvePath(rawPath);
            if (files[path] && this._isDataUrl(files[path])) return `url("${files[path]}")`;
            return match;
        });
    }

    _appendStyle(doc, css, source, files) {
        doc.head.appendChild(this._createStyle(doc, css, source, files));
    }

    _appendScript(doc, js, source) {
        doc.body.appendChild(this._createScript(doc, js, source));
    }

    _createStyle(doc, css, source, files = {}) {
        const style = doc.createElement('style');
        style.dataset.zeroSource = source;
        style.textContent = this._replaceCssUrls(css, files);
        return style;
    }

    _createScript(doc, js, source) {
        const script = doc.createElement('script');
        script.dataset.zeroSource = source;
        // Final pass: never leave static import/export in classic scripts.
        let cleanJs = this._stripEsmSyntax(js);
        cleanJs = cleanJs
            .replace(/export\s+default\s+/g, '')
            .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
            .replace(/export\s+\{[^}]*\}\s*;?/g, '')
            .replace(/\bexport\s+/g, '');
        // Nuke any remaining static import statements entirely (do not leave bare tokens).
        cleanJs = cleanJs.replace(/^\s*import\s+(?![\s\S]{0,40}\()[\s\S]*?(?:;|$)/gm, '/* zero-preview: stripped import */\n');
        // Last-resort: blank any line that still starts with import (static only).
        cleanJs = cleanJs.split('\n').map((line) => {
            if (/^\s*import\s+/.test(line) && !/import\s*\(/.test(line)) {
                return '/* zero-preview: stripped import line */';
            }
            return line;
        }).join('\n');
        script.type = 'text/javascript';
        script.textContent = cleanJs;
        return script;
    }

    _resolvePath(path) {
        if (!path || /^(?:https?:|data:|blob:|#)/i.test(path)) return path || '';
        return String(path).split('#')[0].split('?')[0].replace(/\\/g, '/').replace(/^\.?\//, '');
    }

    _isDataUrl(value) {
        return /^data:/i.test(String(value || ''));
    }

    _frameworkMessage(title, message) {
        return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090f;color:#f7f7fb;font-family:Inter,system-ui,sans-serif}.card{max-width:540px;margin:24px;padding:32px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:linear-gradient(145deg,#171725,#0d0d15);box-shadow:0 20px 60px rgba(0,0,0,.35)}.eyebrow{color:#7dd3fc;font:600 12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}.title{margin:12px 0;font-size:28px;letter-spacing:-.04em}.copy{color:#b5b5c9;line-height:1.65}.hint{margin-top:20px;padding:12px;border-radius:10px;background:rgba(125,211,252,.08);color:#d9f5ff;font-size:14px}</style></head><body><main class="card"><div class="eyebrow">Local device workspace</div><h1 class="title">${title}</h1><p class="copy">${message}</p><p class="hint">Static projects preview instantly in this panel.</p></main></body></html>`;
    }
}

window.SandboxManager = SandboxManager;
