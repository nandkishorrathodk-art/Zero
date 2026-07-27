/* ============================================================
   PROJECT INTAKE - ZIP import, filtering, and project analysis
   ============================================================ */

class ProjectIntakeManager {
    constructor() {
        // Import can be large; Project Brain sends only relevant slices to agents.
        this.maxTextFileBytes = 2 * 1024 * 1024;
        this.maxAssetBytes = 8 * 1024 * 1024;
        this.maxTotalBytes = 45 * 1024 * 1024;
        this.maxFiles = 1200;
        this.textExtensions = new Set([
            'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'md', 'txt',
            'svg', 'xml', 'yml', 'yaml', 'toml', 'prisma', 'env.example',
            'mjs', 'cjs', 'config', 'gitignore'
        ]);
        this.assetExtensions = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'ico', 'avif', 'mp4', 'webm']);
        this.ignoredParts = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.turbo', '.cache']);
    }

    async importZip(file) {
        if (typeof JSZip === 'undefined') throw new Error('JSZip not loaded. Check internet or install offline assets.');
        if (!file || !/\.zip$/i.test(file.name)) throw new Error('Please choose a .zip file.');

        const zip = await JSZip.loadAsync(file);
        const entries = Object.values(zip.files).filter(entry => !entry.dir);
        let files = {};
        const skipped = [];
        let totalBytes = 0;

        for (const entry of entries) {
            const cleanPath = this._cleanPath(entry.name);
            if (!cleanPath || this._shouldIgnore(cleanPath)) {
                skipped.push({ path: entry.name, reason: 'ignored folder or unsafe path' });
                continue;
            }

            const ext = this._extension(cleanPath);
            const binary = await entry.async('uint8array');
            const bytes = binary.byteLength;

            if (Object.keys(files).length >= this.maxFiles) {
                skipped.push({ path: cleanPath, reason: `file limit ${this.maxFiles} reached` });
                continue;
            }
            if (totalBytes + bytes > this.maxTotalBytes) {
                skipped.push({ path: cleanPath, reason: `workspace limit ${this._formatBytes(this.maxTotalBytes)} reached` });
                continue;
            }

            if (this._isTextPath(cleanPath, ext)) {
                if (bytes > this.maxTextFileBytes) {
                    skipped.push({ path: cleanPath, reason: `large text file over ${this._formatBytes(this.maxTextFileBytes)}` });
                    continue;
                }
                files[cleanPath] = new TextDecoder('utf-8').decode(binary);
                totalBytes += bytes;
                continue;
            }

            if (this.assetExtensions.has(ext)) {
                if (bytes > this.maxAssetBytes) {
                    skipped.push({ path: cleanPath, reason: `large asset over ${this._formatBytes(this.maxAssetBytes)}` });
                    continue;
                }
                files[cleanPath] = this._toDataUrl(ext, binary);
                totalBytes += files[cleanPath].length;
                continue;
            }

            skipped.push({ path: cleanPath, reason: 'unsupported binary file' });
        }

        files = this._stripCommonRoot(files);
        const analysis = this.analyze(files, skipped, file.name, totalBytes);
        return { files, analysis, skipped };
    }

    analyze(files = {}, skipped = [], sourceName = 'project.zip', totalBytes = null) {
        const names = Object.keys(files);
        const pkg = this._parsePackage(files['package.json']);
        const hasNext = names.some(name => /^app\/.+\/page\.(tsx|jsx|js)$/.test(name) || /^pages\/.+\.(tsx|jsx|js)$/.test(name)) || !!pkg.dependencies?.next || !!pkg.devDependencies?.next;
        const hasReact = hasNext || names.some(name => /^src\/main\.(jsx|tsx)$/.test(name) || /^src\/App\.(jsx|tsx)$/.test(name)) || !!pkg.dependencies?.react || !!pkg.devDependencies?.react;
        const hasStatic = names.some(name => /(^|\/)index\.html$/i.test(name));
        const framework = hasNext ? 'nextjs' : hasReact ? 'react' : hasStatic ? 'static' : 'unknown';
        const pages = names.filter(name => /(^|\/)(index|page)\.(html|jsx|tsx|js)$/i.test(name) || /^app\/.+\/page\.(tsx|jsx|js)$/i.test(name));
        const styles = names.filter(name => /\.(css|scss|sass)$/i.test(name));
        const scripts = names.filter(name => /\.(js|jsx|ts|tsx)$/i.test(name));
        const assets = names.filter(name => this.assetExtensions.has(this._extension(name)));
        const size = totalBytes ?? Object.values(files).reduce((sum, value) => sum + new Blob([value]).size, 0);

        return {
            sourceName,
            framework,
            fileCount: names.length,
            skippedCount: skipped.length,
            size,
            pages: pages.slice(0, 20),
            styles: styles.slice(0, 20),
            scripts: scripts.slice(0, 20),
            assets: assets.slice(0, 20),
            dependencies: Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }).slice(0, 40),
            warnings: this._warnings(files, skipped, size, framework)
        };
    }

    _warnings(files, skipped, size, framework) {
        const warnings = [];
        const joined = Object.entries(files).map(([path, content]) => `${path}\n${content}`).join('\n');
        if (skipped.length) warnings.push(`${skipped.length} heavy or unsupported file(s) skipped.`);
        if (size > 4 * 1024 * 1024) warnings.push('Large workspace: browser auto-save may be limited. Export to Local Workspace after import.');
        if (framework !== 'static') warnings.push('Framework project detected: preview shows a handoff until dependencies are installed locally.');
        if (/\b(API_KEY|SECRET|PRIVATE_KEY|PASSWORD|TOKEN)\s*=/i.test(joined)) warnings.push('Possible secret-like values detected. Move secrets to server-side .env before deploy.');
        if (!files['package.json'] && framework !== 'static') warnings.push('No package.json found for a framework-style project.');
        return warnings;
    }

    _cleanPath(path) {
        return String(path || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter(Boolean).join('/');
    }

    _shouldIgnore(path) {
        if (!path || path.includes('..')) return true;
        return path.split('/').some(part => this.ignoredParts.has(part));
    }

    _stripCommonRoot(files) {
        const names = Object.keys(files);
        if (names.length < 2) return files;
        const firstParts = names[0].split('/');
        if (firstParts.length < 2) return files;
        const root = firstParts[0];
        if (!names.every(name => name.startsWith(`${root}/`))) return files;
        const stripped = {};
        for (const [name, content] of Object.entries(files)) {
            stripped[name.slice(root.length + 1)] = content;
        }
        return stripped;
    }

    _extension(path) {
        const base = path.split('/').pop() || '';
        if (base === '.gitignore') return 'gitignore';
        if (base === '.env.example') return 'env.example';
        const match = base.match(/\.([^.]+)$/);
        return match ? match[1].toLowerCase() : '';
    }

    _isTextPath(path, ext) {
        const base = path.split('/').pop() || '';
        return this.textExtensions.has(ext) || /^Dockerfile$/i.test(base) || /^README/i.test(base) || /^LICENSE/i.test(base);
    }

    _parsePackage(source) {
        try { return source ? JSON.parse(source) : {}; } catch { return {}; }
    }

    _toDataUrl(ext, bytes) {
        const mime = {
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
            gif: 'image/gif', ico: 'image/x-icon', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm'
        }[ext] || 'application/octet-stream';
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        return `data:${mime};base64,${btoa(binary)}`;
    }

    _formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}

window.ProjectIntakeManager = ProjectIntakeManager;
