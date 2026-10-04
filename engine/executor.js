/* ============================================================
   ZERO ENGINE — Local Execution Engine
   Runs real commands (install / build / test / git / node) inside
   confined workspaces so Zero can verify the software it writes
   instead of only generating code.

   Security model:
   - Commands are restricted to a binary allow-list.
   - All work happens inside data/engine-workspaces/<name>.
   - No shell is used (spawn with an argument array), so shell
     metacharacters cannot be injected.
   - Every run is time-boxed and output-capped.
   ============================================================ */

const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const fssync = require('node:fs');
const path = require('node:path');

const ALLOWED_BINARIES = new Set([
  'npm', 'npx', 'pnpm', 'yarn',
  'node', 'tsc', 'vite', 'next',
  'jest', 'vitest', 'eslint', 'prettier',
  'git',
  'python3', 'python', 'pip3', 'pytest',
  'cargo', 'go', 'make',
]);

const DEFAULT_TIMEOUT_MS = 180_000;
const MAX_TIMEOUT_MS = 600_000;
const MAX_OUTPUT_BYTES = 400_000;

class EngineExecutor {
  constructor(rootDir) {
    this.root = rootDir;
    this.workspacesDir = path.join(rootDir, 'data', 'engine-workspaces');
  }

  /* ---------- path safety ---------- */
  safeName(name) {
    const value = String(name || 'zero-workspace')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return value.slice(0, 60) || 'zero-workspace';
  }

  resolveWorkspace(name) {
    const target = path.resolve(this.workspacesDir, this.safeName(name));
    if (!target.startsWith(this.workspacesDir + path.sep)) {
      throw new Error('Invalid workspace path');
    }
    return target;
  }

  async resolveWorkspaceFile(name, relativePath) {
    const target = this.resolveWorkspace(name);
    const realBase = await fs.realpath(this.workspacesDir);
    const realTarget = await fs.realpath(target);
    if (realTarget !== realBase && !realTarget.startsWith(realBase + path.sep)) {
      throw new Error('Workspace path escapes the workspace root');
    }
    const filePath = path.resolve(realTarget, String(relativePath || ''));
    if (!filePath.startsWith(realTarget + path.sep)) throw new Error('Unsafe file path');

    let currentPath = realTarget;
    for (const segment of path.relative(realTarget, filePath).split(path.sep)) {
      if (!segment) continue;
      currentPath = path.join(currentPath, segment);
      try {
        const stat = await fs.lstat(currentPath);
        if (stat.isSymbolicLink()) throw new Error('Symlink paths are not allowed');
      } catch (error) {
        if (error.code === 'ENOENT') break;
        throw error;
      }
    }
    return { target: realTarget, filePath };
  }

  /* ---------- scaffold ---------- */
  async scaffold(name, files) {
    if (!files || typeof files !== 'object') throw new Error('A files map is required');
    const target = this.resolveWorkspace(name);
    let written = 0;
    for (const [relativePath, content] of Object.entries(files)) {
      if (typeof content !== 'string') continue;
      if (!relativePath || relativePath.includes('..') || path.isAbsolute(relativePath)) {
        throw new Error(`Unsafe file path: ${relativePath}`);
      }
      if (/^\.env(?:$|\.)/i.test(relativePath)) continue; // never persist secrets
      const destination = path.resolve(target, relativePath);
      if (!destination.startsWith(target + path.sep)) {
        throw new Error(`Unsafe file path: ${relativePath}`);
      }
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, content, 'utf8');
      written++;
    }
    return { workspace: this.safeName(name), location: target, fileCount: written };
  }

  async listWorkspaces() {
    try {
      const entries = await fs.readdir(this.workspacesDir, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  }

  async readFile(name, relativePath) {
    const { filePath } = await this.resolveWorkspaceFile(name, relativePath);
    const content = await fs.readFile(filePath, 'utf8');
    return { path: relativePath, content: content.slice(0, 200_000), truncated: content.length > 200_000 };
  }

  async writeFile(name, relativePath, content) {
    const target = this.resolveWorkspace(name);
    if (!relativePath || relativePath.includes('..') || path.isAbsolute(relativePath)) throw new Error('Unsafe file path');
    if (/^\.env(?:$|\.)/i.test(relativePath)) throw new Error('Refusing to write secret files');
    const { filePath } = await this.resolveWorkspaceFile(name, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, String(content ?? ''), 'utf8');
    return { path: relativePath, bytes: Buffer.byteLength(String(content ?? '')) };
  }

  async tree(name, depth = 3) {
    const target = this.resolveWorkspace(name);
    const ignore = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.cache']);
    const walk = async (dir, level) => {
      if (level > depth) return [];
      const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
      const out = [];
      for (const entry of entries) {
        if (ignore.has(entry.name)) continue;
        const rel = path.relative(target, path.join(dir, entry.name));
        if (entry.isDirectory()) {
          out.push({ path: rel, type: 'dir', children: await walk(path.join(dir, entry.name), level + 1) });
        } else {
          out.push({ path: rel, type: 'file' });
        }
      }
      return out;
    };
    return walk(target, 1);
  }

  /* ---------- repository intake ---------- */
  parseRepoUrl(url) {
    const value = String(url || '').trim();
    let match = value.match(/^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i);
    if (match) return { owner: match[1], repo: match[2], cloneUrl: `https://github.com/${match[1]}/${match[2]}.git` };
    match = value.match(/^([\w.-]+)\/([\w.-]+)$/);
    if (match) return { owner: match[1], repo: match[2], cloneUrl: `https://github.com/${match[1]}/${match[2]}.git` };
    throw new Error('Provide a GitHub URL or "owner/repo"');
  }

  async cloneRepo(url, options = {}) {
    const { owner, repo, cloneUrl } = this.parseRepoUrl(url);
    const branch = String(options.branch || 'main').replace(/[^\w./-]/g, '');
    const workspace = this.safeName(`${owner}-${repo}-${branch}`);
    const target = this.resolveWorkspace(workspace);
    const token = options.token || process.env.GITHUB_TOKEN || '';

    if (fssync.existsSync(path.join(target, '.git'))) {
      const pull = await this.runArgs('git', ['-C', target, 'pull', '--ff-only'], { timeoutMs: 120_000 });
      return { workspace, location: target, owner, repo, branch, reused: true, pull: pull.ok, pullOutput: (pull.stdout + pull.stderr).trim() };
    }

    await fs.mkdir(target, { recursive: true });
    // Authenticate via -c http.extraheader so the token never lands in
    // .git/config or the process command line. GitHub expects Basic auth
    // (x-access-token:<token>) for git-over-HTTPS.
    const authArgs = token
      ? ['-c', `http.extraheader=Authorization: Basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`]
      : [];
    const clone = await this.runArgs('git', [...authArgs, 'clone', '--depth', '1', '--branch', branch, cloneUrl, '.'], { cwd: target, timeoutMs: 300_000 });
    if (!clone.ok) {
      await fs.rm(target, { recursive: true, force: true }).catch(() => {});
      throw new Error(`Clone failed for ${owner}/${repo}@${branch}: ${(clone.stderr || clone.stdout || '').slice(0, 400)}`);
    }
    return { workspace, location: target, owner, repo, branch, reused: false, cloned: true };
  }

  /* Compact, repo-aware context so agents can modify an existing codebase
     instead of regenerating it: manifest, tree and the files most likely
     relevant to the task. */
  async repoContext(name, task = '', options = {}) {
    const target = this.resolveWorkspace(name);
    if (!fssync.existsSync(target)) throw new Error(`Workspace "${name}" does not exist`);
    const depth = options.depth || 4;
    const tree = await this.tree(name, depth);

    const flatten = (nodes, acc = []) => {
      for (const node of nodes || []) {
        if (node.type === 'file') acc.push(node.path);
        else if (node.children) flatten(node.children, acc);
      }
      return acc;
    };
    const allFiles = flatten(tree);
    const sourceFiles = allFiles.filter((f) => /\.(js|jsx|ts|tsx|mjs|cjs|vue|svelte|py|rb|go|rs|java|php|cs|css|scss|html|sql|json|md|yml|yaml)$/i.test(f));

    const manifestRaw = await this.readFile(name, 'package.json').catch(() => null);
    let manifest = null;
    if (manifestRaw?.content) {
      try { manifest = JSON.parse(manifestRaw.content); } catch { manifest = null; }
    }

    const keywords = String(task || '').toLowerCase().match(/[a-z0-9_-]{3,}/g) || [];
    const scored = sourceFiles
      .map((file) => {
        const lower = file.toLowerCase();
        let score = 0;
        for (const kw of keywords) if (lower.includes(kw)) score += 2;
        if (/^(src|app|lib|pages|components|server|api)\//i.test(file)) score += 1;
        if (/\.(test|spec)\./i.test(file)) score += 1;
        if (/(^|\/)(server|app|main|index)\.(js|ts|jsx|tsx|html)$/i.test(file)) score += 1;
        // Generated/bundled artefacts are poor edit targets — the source is.
        if (/\.(bundle|min)\.(js|css)$/i.test(file) || /^(dist|build)\//i.test(file)) score -= 3;
        return { file, score };
      })
      .sort((a, b) => b.score - a.score);

    const picked = scored.filter((s) => s.score > 0).slice(0, 12);
    const fallback = sourceFiles.filter((f) => !/\.(bundle|min)\.(js|css)$/i.test(f));
    const selected = picked.length ? picked.map((s) => s.file) : (fallback.length ? fallback : sourceFiles).slice(0, 12);
    const snippets = [];
    for (const file of selected) {
      const read = await this.readFile(name, file).catch(() => null);
      if (read?.content) snippets.push(`--- ${file} ---\n${read.content.slice(0, 6000)}`);
    }

    return {
      workspace: this.safeName(name),
      fileCount: allFiles.length,
      sourceFileCount: sourceFiles.length,
      files: allFiles.slice(0, 400),
      manifest: manifest ? { name: manifest.name, scripts: manifest.scripts, dependencies: manifest.dependencies, devDependencies: manifest.devDependencies } : null,
      selected,
      snippets,
      contextText: [
        `Repository ${this.safeName(name)} (${allFiles.length} files).`,
        manifest ? `Scripts: ${Object.keys(manifest.scripts || {}).join(', ') || 'none'}` : 'No package.json.',
        'Relevant files for this task:',
        ...snippets,
      ].join('\n'),
    };
  }

  /* ---------- command execution ---------- */
  parseCommand(command) {
    const parts = String(command || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) throw new Error('Empty command');
    const binary = parts[0];
    if (!ALLOWED_BINARIES.has(binary)) {
      throw new Error(`Command "${binary}" is not allowed by the execution engine.`);
    }
    return { binary, args: parts.slice(1) };
  }

  runCommand(command, options = {}) {
    let parsed;
    try {
      parsed = this.parseCommand(command);
    } catch (error) {
      return Promise.resolve({ ok: false, error: error.message, command, stdout: '', stderr: error.message, exitCode: -1 });
    }
    return this.spawnProcess(parsed.binary, parsed.args, { ...options, command });
  }

  runArgs(binary, args, options = {}) {
    if (!ALLOWED_BINARIES.has(binary)) {
      return Promise.resolve({ ok: false, error: `Command "${binary}" is not allowed by the execution engine.`, command: binary, stdout: '', stderr: '', exitCode: -1 });
    }
    return this.spawnProcess(binary, args, { ...options, command: [binary, ...args].join(' ') });
  }

  spawnProcess(binary, args, { cwd, timeoutMs, command } = {}) {
    return new Promise((resolve) => {
      const timeout = Math.min(Number(timeoutMs) || DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS);
      const started = Date.now();
      let stdout = '';
      let stderr = '';
      let truncated = false;
      let finished = false;

      const child = spawn(binary, args, {
        cwd: cwd || this.root,
        shell: false,
        env: { ...process.env, CI: '1', NO_COLOR: '1', npm_config_yes: 'true', GIT_TERMINAL_PROMPT: '0' },
      });

      const timer = setTimeout(() => {
        if (!finished) {
          try { child.kill('SIGKILL'); } catch { /* noop */ }
          stderr += `\n[engine] Command timed out after ${timeout}ms and was killed.`;
        }
      }, timeout);

      const append = (buf, isErr) => {
        const text = buf.toString('utf8');
        if (isErr) {
          if (stderr.length < MAX_OUTPUT_BYTES) stderr += text;
          else truncated = true;
        } else {
          if (stdout.length < MAX_OUTPUT_BYTES) stdout += text;
          else truncated = true;
        }
      };

      child.stdout.on('data', (b) => append(b, false));
      child.stderr.on('data', (b) => append(b, true));

      child.on('error', (error) => {
        finished = true;
        clearTimeout(timer);
        resolve({
          ok: false,
          command,
          stdout,
          stderr: `${stderr}\n${error.message}`.trim(),
          exitCode: -1,
          durationMs: Date.now() - started,
        });
      });

      child.on('close', (code) => {
        finished = true;
        clearTimeout(timer);
        resolve({
          ok: code === 0,
          command,
          stdout: stdout.slice(0, MAX_OUTPUT_BYTES),
          stderr: stderr.slice(0, MAX_OUTPUT_BYTES),
          exitCode: code,
          durationMs: Date.now() - started,
          truncated,
        });
      });
    });
  }

  async readPackageJson(target) {
    try {
      const raw = await fs.readFile(path.join(target, 'package.json'), 'utf8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /* ---------- high level verify pipeline ---------- */
  async verify(name, options = {}) {
    const target = this.resolveWorkspace(name);
    if (!fssync.existsSync(target)) throw new Error(`Workspace "${name}" does not exist`);
    const timeoutMs = options.timeoutMs;
    const steps = [];
    const pkg = await this.readPackageJson(target);

    if (pkg) {
      const hasModules = fssync.existsSync(path.join(target, 'node_modules'));
      if (!hasModules || options.forceInstall) {
        const install = await this.runCommand('npm install --no-audit --no-fund', { cwd: target, timeoutMs });
        steps.push({ name: 'install', ...install });
        if (!install.ok) return { ok: false, workspace: this.safeName(name), steps, failedAt: 'install' };
      }

      const scripts = pkg.scripts || {};
      if (options.runBuild !== false && scripts.build) {
        const build = await this.runCommand('npm run build', { cwd: target, timeoutMs });
        steps.push({ name: 'build', ...build });
        if (!build.ok) return { ok: false, workspace: this.safeName(name), steps, failedAt: 'build' };
      }

      if (options.runTests !== false && scripts.test && !/no test specified/i.test(scripts.test)) {
        const test = await this.runCommand('npm test', { cwd: target, timeoutMs });
        steps.push({ name: 'test', ...test });
        if (!test.ok) return { ok: false, workspace: this.safeName(name), steps, failedAt: 'test' };
      }
    } else {
      // No package.json: best-effort syntax check of JS entry points.
      const candidates = ['script.js', 'index.js', 'server.js', 'main.js'];
      for (const candidate of candidates) {
        if (fssync.existsSync(path.join(target, candidate))) {
          const check = await this.runCommand(`node --check ${candidate}`, { cwd: target, timeoutMs });
          steps.push({ name: `syntax:${candidate}`, ...check });
          if (!check.ok) return { ok: false, workspace: this.safeName(name), steps, failedAt: `syntax:${candidate}` };
        }
      }
    }

    return { ok: true, workspace: this.safeName(name), steps, failedAt: null };
  }

  /* ---------- git ---------- */
  async git(name, action, message) {
    const target = this.resolveWorkspace(name);
    if (!fssync.existsSync(target)) throw new Error(`Workspace "${name}" does not exist`);

    const runGit = (args) => this.runArgs('git', args, { cwd: target, timeoutMs: 60_000 });
    const ensureIdentity = async () => {
      await runGit(['config', 'user.email', 'zero-engine@local']);
      await runGit(['config', 'user.name', 'Zero Engine']);
    };
    // A workspace nested inside another repository must never commit into it.
    const ensureOwnRepo = async () => {
      const top = await runGit(['rev-parse', '--show-toplevel']);
      const resolvedTop = top.ok ? top.stdout.trim() : '';
      if (resolvedTop !== target) {
        await runGit(['init']);
      }
    };

    if (action === 'status') {
      const inside = await runGit(['rev-parse', '--is-inside-work-tree']);
      if (!inside.ok) return { ok: true, initialized: false };
      const status = await runGit(['status', '--porcelain']);
      return { ok: true, initialized: true, dirty: status.stdout.trim().split('\n').filter(Boolean) };
    }
    if (action === 'init') {
      await ensureOwnRepo();
      await ensureIdentity();
      await runGit(['add', '-A']);
      const commit = await runGit(['commit', '-m', message || 'Zero Engine: initial commit']);
      return { ok: true, initialized: true, commit: (commit.stdout + commit.stderr).trim() };
    }
    if (action === 'commit') {
      await ensureOwnRepo();
      await ensureIdentity();
      await runGit(['add', '-A']);
      const commit = await runGit(['commit', '-m', message || 'Zero Engine: update']);
      return { ok: true, commit: (commit.stdout + commit.stderr).trim() };
    }
    if (action === 'log') {
      const log = await runGit(['log', '--oneline', '-10']);
      return { ok: true, log: log.stdout };
    }
    throw new Error(`Unsupported git action: ${action}`);
  }
}

module.exports = { EngineExecutor, ALLOWED_BINARIES };
