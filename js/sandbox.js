/* ============================================================
   LOCAL PREVIEW BRIDGE — no cloud sandbox dependency.
   Static projects render in-browser; framework projects are
   exported to the user's local workspace through server.js.
   ============================================================ */
class SandboxManager {
    getProjectType(files = {}) {
        const pkg = String(files['package.json'] || '');
        if (files['app/page.tsx'] || files['app/page.jsx'] || files['next.config.js'] || files['next.config.mjs'] || pkg.includes('"next"')) return 'nextjs';
        if (files['src/main.jsx'] || files['src/main.tsx'] || pkg.includes('"react"')) return 'react';
        return 'static';
    }

    generateLocalPreview(files = {}, projectType = this.getProjectType(files)) {
        if (projectType === 'react' || this._hasReactFiles(files)) {
            return this._buildReactInBrowserPreview(files);
        }
        if (projectType === 'nextjs') {
            // If Next.js page exists, try to transpile main page in browser, fallback to framework info card if missing
            if (files['app/page.tsx'] || files['app/page.jsx'] || files['pages/index.js']) {
                return this._buildReactInBrowserPreview(files);
            }
            const title = 'Next.js Full-Stack Project';
            return this._frameworkMessage(title, 'This full-stack project is configured for your local workspace. Export to Local Workspace to run `npm run dev` with full API routes & Prisma DB.');
        }

        let html = String(files['index.html'] || '<!doctype html><html><body><h1>No content generated</h1></body></html>');
        const css = String(files['styles.css'] || '');
        const js = String(files['script.js'] || '');
        const threeJs = String(files['three-scene.js'] || '');
        return this._buildDOMPreview(html, { ...files, 'styles.css': css, 'script.js': js, 'three-scene.js': threeJs });
    }

    _hasReactFiles(files = {}) {
        return Object.keys(files).some(f => f.endsWith('.jsx') || f.endsWith('.tsx') || (f.endsWith('.js') && (files[f].includes('import React') || files[f].includes('export default'))));
    }

    _buildReactInBrowserPreview(files) {
        // Collect all JSX / JS components
        let jsxCode = '';
        let entryFile = files['src/App.jsx'] || files['src/App.tsx'] || files['App.jsx'] || files['App.js'] || files['src/main.jsx'] || '';

        // Combine code from component files
        Object.keys(files).forEach(filename => {
            if ((filename.endsWith('.jsx') || filename.endsWith('.tsx') || filename.endsWith('.js')) && !filename.includes('vite.config') && !filename.includes('tailwind.config')) {
                let code = files[filename];
                // Remove npm import/export syntax for standalone Babel execution in browser
                code = code.replace(/import\s+type\s+.*?;?/g, '')
                    .replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, '')
                    .replace(/import\s+['"][^'"]+['"];?/g, '')
                    .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1')
                    .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, '')
                    .replace(/export\s+const\s+/g, 'const ')
                    .replace(/export\s+type\s+.*?;?/g, '')
                    .replace(/export\s+interface\s+[\s\S]*?\{[\s\S]*?\}/g, '')
                    .replace(/([a-zA-Z0-9_\)\]])!\./g, '$1.') // non-null assertion meshRef.current!.rotation -> meshRef.current.rotation
                    .replace(/\(null!\)/g, '(null)') // null! -> null
                    .replace(/!\s*([,;\)\n])/g, '$1') // trailing non-null assertion
                    .replace(/case:\s*(['"](?:none|power\d\.(?:in|out|inOut)|linear|expo|circ)['"])/g, 'ease: $1');
                jsxCode += `\n/* File: ${filename} */\n` + code;
            }
        });

        // Determine main App root component name
        let mainComponentName = 'App';
        if (!jsxCode.includes('function App') && !jsxCode.includes('const App')) {
            const match = jsxCode.match(/function\s+([A-Z][A-Za-z0-9_]+)/);
            if (match) mainComponentName = match[1];
        }

        const customCss = files['src/index.css'] || files['src/App.css'] || files['styles.css'] || '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Live Preview</title>
    <!-- Tailwind CSS v3 CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
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
    </script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- React 18 & ReactDOM UMD -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <!-- Three.js UMD -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Babel Standalone for JSX & TypeScript -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 0; }
        ${customCss}
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        // Suppress benign CDN production warnings in preview iframe
        const origWarn = console.warn;
        console.warn = function(...args) {
            if (args[0] && typeof args[0] === 'string' && (args[0].includes('tailwindcss.com') || args[0].includes('Babel transformer'))) return;
            origWarn.apply(console, args);
        };
        // Error Handler Relay to parent Zero Studio window
        window.addEventListener('error', function(e) {
            if (!e.message || e.message === 'Script error.') return;
            window.parent.postMessage({ type: 'ZERO_PREVIEW_ERROR', message: e.message, filename: e.filename, lineno: e.lineno }, '*');
        });
    </script>
    <script type="text/babel" data-presets="react,typescript" data-file-name="app.tsx">
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        
        // Mock Lucide Icon helper for JSX components
        const Icon = ({ name, className = "w-5 h-5", ...props }) => {
            return <i data-lucide={name} class={className} {...props}></i>;
        };

        ${jsxCode}

        // Render Main Root Component
        try {
            const rootElement = document.getElementById('root');
            let ComponentToRender = typeof App !== 'undefined' ? App : (typeof RootLayout !== 'undefined' ? RootLayout : (typeof Page !== 'undefined' ? Page : null));
            if (!ComponentToRender && typeof ${mainComponentName} !== 'undefined') {
                ComponentToRender = ${mainComponentName};
            }
            if (ComponentToRender) {
                const root = ReactDOM.createRoot(rootElement);
                root.render(<ComponentToRender />);
                setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 100);
            } else {
                rootElement.innerHTML = '<div class="p-8 text-center text-zinc-400"><h2 class="text-xl font-bold mb-2">React Component Loaded</h2><p>React component active.</p></div>';
            }
        } catch(err) {
            document.getElementById('root').innerHTML = '<div class="p-6 bg-red-950/80 border border-red-800 text-red-200 rounded-xl m-4"><h3 class="font-bold text-lg mb-2">React Compilation Error</h3><pre class="font-mono text-sm whitespace-pre-wrap">' + err.message + '</pre></div>';
            window.parent.postMessage({ type: 'ZERO_PREVIEW_ERROR', message: err.message }, '*');
        }
    </script>
</body>
</html>`;
    }

    _buildDOMPreview(html, files) {
        const parser = new DOMParser();
        const safeHtml = this._ensureDocumentShell(html);
        const doc = parser.parseFromString(safeHtml, 'text/html');

        this._inlineLinkedStyles(doc, files);
        this._inlineLinkedScripts(doc, files);
        this._inlineAssets(doc, files);
        this._patchCssUrls(doc, files);

        // Auto-inject Tailwind CSS CDN & Lucide Icons if missing for instant ultra-modern rendering
        if (!doc.querySelector('script[src*="tailwindcss"]')) {
            const tailwindScript = doc.createElement('script');
            tailwindScript.src = 'https://cdn.tailwindcss.com';
            doc.head.prepend(tailwindScript);
        }
        if (!doc.querySelector('script[src*="lucide"]')) {
            const lucideScript = doc.createElement('script');
            lucideScript.src = 'https://unpkg.com/lucide@latest';
            doc.head.appendChild(lucideScript);
        }

        // Auto-inject error relay listener
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
        if (files['three-scene.js'] && !doc.querySelector('script[data-zero-source="three-scene.js"]')) {
            this._appendScript(doc, files['three-scene.js'], 'three-scene.js');
        }
        if (files['script.js'] && !doc.querySelector('script[data-zero-source="script.js"]')) {
            this._appendScript(doc, files['script.js'], 'script.js');
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

    _ensureDocumentShell(html) {
        const source = String(html || '').trim();
        if (/<html[\s>]/i.test(source)) return source;
        if (/<body[\s>]/i.test(source) || /<head[\s>]/i.test(source)) return `<!doctype html><html>${source}</html>`;
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
            const replacement = this._createScript(doc, source, path);
            if (script.type) replacement.type = script.type;
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
                if (files[path] && this._isDataUrl(files[path])) node.setAttribute(attr, files[path]);
            });
        });
    }

    _patchCssUrls(doc, files) {
        doc.querySelectorAll('style').forEach(style => {
            style.textContent = this._replaceCssUrls(style.textContent, files);
        });
    }

    _replaceCssUrls(css, files) {
        return String(css || '').replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, rawPath) => {
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
        script.textContent = String(js || '');
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
