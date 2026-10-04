/* ============================================================
   ZERO ENGINE CLIENT — browser bridge to the local execution engine
   Lets agents scaffold real projects, run install/build/test,
   inspect failures, write fixes and commit with git.
   Degrades gracefully when the local server engine is unavailable.
   ============================================================ */

class EngineClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.available = null;
        this.lastCheck = 0;
    }

    async _post(path, body) {
        try {
            const res = await fetch(`${this.baseUrl}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body || {}),
            });
            return await res.json().catch(() => ({ ok: false, error: 'Invalid engine response' }));
        } catch (err) {
            return { ok: false, error: err.message, networkError: true };
        }
    }

    async _get(path) {
        try {
            const res = await fetch(`${this.baseUrl}${path}`);
            return await res.json().catch(() => ({ ok: false, error: 'Invalid engine response' }));
        } catch (err) {
            return { ok: false, error: err.message, networkError: true };
        }
    }

    async isAvailable(force = false) {
        const now = Date.now();
        if (!force && this.available !== null && now - this.lastCheck < 15_000) return this.available;
        try {
            const health = await this._get('/api/health');
            this.available = Array.isArray(health.capabilities) && health.capabilities.includes('execution-engine');
        } catch {
            this.available = false;
        }
        this.lastCheck = now;
        return this.available;
    }

    async scaffold(name, files) {
        return this._post('/api/engine/scaffold', { name, files });
    }

    async run(name, command, timeoutMs) {
        return this._post('/api/engine/run', { name, command, timeoutMs });
    }

    async verify(name, options = {}) {
        return this._post('/api/engine/verify', { name, options });
    }

    async writeFile(name, filePath, content) {
        return this._post('/api/engine/file', { name, path: filePath, content });
    }

    async readFile(name, filePath) {
        return this._get(`/api/engine/file?name=${encodeURIComponent(name)}&path=${encodeURIComponent(filePath)}`);
    }

    async tree(name, depth = 3) {
        return this._get(`/api/engine/tree?name=${encodeURIComponent(name)}&depth=${depth}`);
    }

    async git(name, action, message) {
        return this._post('/api/engine/git', { name, action, message });
    }

    async clone(url, branch = 'main') {
        return this._post('/api/engine/clone', { url, branch });
    }

    async context(name, task = '') {
        return this._get(`/api/engine/context?name=${encodeURIComponent(name)}&task=${encodeURIComponent(task)}`);
    }

    /* Distill a failed verify run into a compact, actionable error brief
       the coder agent can consume on the next attempt. */
    static summarizeFailure(verifyResult) {
        if (!verifyResult || verifyResult.ok) return null;
        const failed = (verifyResult.steps || []).find((s) => !s.ok) || {};
        const text = `${failed.stdout || ''}\n${failed.stderr || ''}`;
        const errorLines = text
            .split('\n')
            .filter((line) => /error|fail|assert|cannot|unexpected|undefined|is not|expected|not a function|SyntaxError|TypeError|ReferenceError/i.test(line))
            .slice(0, 12)
            .join('\n');
        return {
            failedAt: verifyResult.failedAt || failed.name || 'unknown',
            command: failed.command || '',
            exitCode: failed.exitCode,
            errorLines: errorLines || text.slice(-1200),
        };
    }
}

window.EngineClient = EngineClient;
