/* ZERO-BUILDER local product server — dependency-free by design. */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const { EngineExecutor } = require('./engine/executor');
const jarvis = require('./jarvis/server');

const root = __dirname;
const engine = new EngineExecutor(root);
const dataDir = path.join(root, 'data');
const projectsFile = path.join(dataDir, 'projects.json');
const workspacesDir = path.join(dataDir, 'local-workspaces');
const port = Number(process.env.PORT || 4173);
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.hdr': 'image/vnd.radiance', '.ktx2': 'image/ktx2', '.wasm': 'application/wasm', '.bin': 'application/octet-stream' };

async function readProjects() {
  try { return JSON.parse(await fs.readFile(projectsFile, 'utf8')); } catch { return {}; }
}

async function writeProjects(projects) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(projectsFile, JSON.stringify(projects, null, 2), 'utf8');
}

function safeWorkspaceName(name) {
  const value = String(name || 'zero-project').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
  return value.slice(0, 60) || 'zero-project';
}

async function writeWorkspaceFiles(workspace, files) {
  const target = path.resolve(workspacesDir, workspace);
  if (!target.startsWith(workspacesDir + path.sep)) throw new Error('Invalid workspace path');
  for (const [relativePath, content] of Object.entries(files || {})) {
    if (typeof content !== 'string' || !relativePath || relativePath.includes('..') || path.isAbsolute(relativePath) || /^\.env(?:$|\.)/i.test(relativePath)) throw new Error(`Unsafe file path: ${relativePath}`);
    const destination = path.resolve(target, relativePath);
    if (!destination.startsWith(target + path.sep)) throw new Error(`Unsafe file path: ${relativePath}`);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, content, 'utf8');
  }
  return target;
}

function send(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > 1_500_000) reject(new Error('Project payload exceeds 1.5 MB'));
    });
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON body')); } });
    req.on('error', reject);
  });
}

/* The LLM proxy is the only place this server talks to a third party. It exists
   because browser fetch is blocked by CORS for providers that do not send
   Access-Control-Allow-Origin (NVIDIA, most self-hosted OpenAI-compatible
   endpoints). Refuse private/loopback targets so it cannot be used as an SSRF
   pivot against the local network. */
function isPrivateHost(hostname) {
  const h = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal')) return true;
  if (h === '::1' || h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^0\./.test(h)) return true;
  return false;
}

async function proxyLLM(req, res) {
  let payload;
  try { payload = await readJson(req); } catch (e) { return send(res, 400, { error: e.message }); }

  const target = String(payload.target || '');
  if (!/^https?:\/\//i.test(target)) return send(res, 400, { error: 'A valid http(s) target URL is required' });
  let parsed;
  try { parsed = new URL(target); } catch { return send(res, 400, { error: 'Invalid target URL' }); }
  if (isPrivateHost(parsed.hostname)) return send(res, 403, { error: 'Refusing to proxy to a private address' });

  const headers = {};
  const incoming = payload.headers && typeof payload.headers === 'object' ? payload.headers : {};
  for (const [k, v] of Object.entries(incoming)) {
    if (typeof v !== 'string') continue;
    const key = k.toLowerCase();
    if (['host', 'content-length', 'connection', 'accept-encoding', 'transfer-encoding'].includes(key)) continue;
    headers[k] = v;
  }
  if (!Object.keys(headers).some(k => k.toLowerCase() === 'content-type')) headers['Content-Type'] = 'application/json';

  const upstreamBody = typeof payload.body === 'string' ? payload.body : JSON.stringify(payload.body || {});
  const controller = new AbortController();
  req.on('close', () => controller.abort());

  let upstream;
  try {
    upstream = await fetch(target, { method: 'POST', headers, body: upstreamBody, signal: controller.signal });
  } catch (e) {
    if (controller.signal.aborted) return;
    return send(res, 502, { error: `Upstream request failed: ${e.message}` });
  }

  const contentType = upstream.headers.get('content-type') || 'application/json';
  if (/text\/event-stream/i.test(contentType) && upstream.body) {
    res.writeHead(upstream.status, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' });
    try {
      for await (const chunk of upstream.body) res.write(chunk);
    } catch { /* client disconnected or upstream aborted mid-stream */ }
    return res.end();
  }

  const text = await upstream.text();
  res.writeHead(upstream.status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
  return res.end(text);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/health' && req.method === 'GET') return send(res, 200, { ok: true, service: 'zero-builder-max', version: '5.0.0-engine', capabilities: ['local-device-bridge', 'project-sync', 'workspace-export', 'zip-project-intake', 'domparser-preview', 'google-auth-ready', 'project-intelligence-agents', 'agent-recovery-supervisor', 'project-repository-memory', 'motion-studio', 'execution-engine', 'real-verify-loop', 'git-workspaces', 'repo-intake', 'repo-aware-context', 'coordinator-swarm', 'jarvis-agent', 'llm-proxy'] });

    /* ── LLM PROXY (CORS workaround for providers that block browser fetch) ── */
    if (url.pathname === '/api/llm/proxy' && req.method === 'POST') return proxyLLM(req, res);

    /* ── JARVIS ── */
    if (url.pathname === '/api/jarvis/session' && req.method === 'POST') {
      const payload = await readJson(req);
      const session = jarvis.createSession(engine, payload);
      return send(res, 200, { ok: true, ...session });
    }
    if (url.pathname === '/api/jarvis/stream' && req.method === 'GET') {
      const ok = jarvis.attachStream(url.searchParams.get('id'), res);
      if (!ok) return send(res, 404, { error: 'Unknown session' });
      return; // stream owns the response now
    }
    if (url.pathname === '/api/jarvis/message' && req.method === 'POST') {
      const payload = await readJson(req);
      // Answer the stream immediately; the work continues in the background.
      send(res, 200, { ok: true });
      jarvis.sendMessage(payload.id, String(payload.text || '')).catch((error) => {
        console.error('Jarvis error:', error.message);
      });
      return;
    }
    if (url.pathname === '/api/jarvis/answer' && req.method === 'POST') {
      const payload = await readJson(req);
      const ok = jarvis.answer(payload.id, payload.value);
      return send(res, 200, { ok });
    }
    if (url.pathname === '/api/jarvis/close' && req.method === 'POST') {
      const payload = await readJson(req);
      jarvis.closeSession(payload.id);
      return send(res, 200, { ok: true });
    }
    if (url.pathname === '/api/device/status' && req.method === 'GET') return send(res, 200, { ok: true, platform: `${os.platform()} ${os.release()}`, workspaceRoot: workspacesDir, mode: 'local-device-bridge' });
    if (url.pathname === '/api/device/workspaces' && req.method === 'POST') {
      const payload = await readJson(req);
      if (!payload.name || !payload.files || typeof payload.files !== 'object') return send(res, 400, { error: 'A project name and files are required' });
      const workspace = safeWorkspaceName(payload.name);
      const size = Buffer.byteLength(JSON.stringify(payload.files));
      if (size > 2_500_000) return send(res, 413, { error: 'Project is too large for the local bridge' });
      const location = await writeWorkspaceFiles(workspace, payload.files);
      return send(res, 200, { ok: true, workspace, location, fileCount: Object.keys(payload.files).length, next: 'Run npm install and npm run dev inside this local workspace.' });
    }
    if (url.pathname === '/api/projects' && req.method === 'GET') {
      const projects = await readProjects();
      return send(res, 200, Object.values(projects).map(({ files, ...project }) => ({ ...project, fileCount: Object.keys(files || {}).length })));
    }
    if (url.pathname === '/api/projects' && req.method === 'POST') {
      const project = await readJson(req);
      if (!project.id || !/^[a-zA-Z0-9_-]{8,80}$/.test(project.id)) return send(res, 400, { error: 'Invalid project id' });
      if (!project.name || String(project.name).length > 60 || typeof project.files !== 'object') return send(res, 400, { error: 'Invalid project payload' });
      const projects = await readProjects();
      projects[project.id] = { id: project.id, name: String(project.name), files: project.files, prompt: String(project.prompt || ''), requirements: Array.isArray(project.requirements) ? project.requirements.slice(0, 8) : [], quality: ['fast', 'production', 'autonomous', 'motion-studio', 'power'].includes(project.quality) ? project.quality : 'production', artDirection: String(project.artDirection || 'editorial'), framework: String(project.framework || 'vanilla'), updatedAt: Date.now(), checksum: crypto.createHash('sha256').update(JSON.stringify(project.files)).digest('hex').slice(0, 12) };
      await writeProjects(projects);
      return send(res, 200, { ok: true, updatedAt: projects[project.id].updatedAt });
    }
    /* ---------- ZERO ENGINE: real execution endpoints ---------- */
    if (url.pathname === '/api/engine/workspaces' && req.method === 'GET') {
      return send(res, 200, { ok: true, workspaces: await engine.listWorkspaces() });
    }
    if (url.pathname === '/api/engine/scaffold' && req.method === 'POST') {
      const payload = await readJson(req);
      if (!payload.name || !payload.files || typeof payload.files !== 'object') return send(res, 400, { error: 'A workspace name and files are required' });
      const result = await engine.scaffold(payload.name, payload.files);
      return send(res, 200, { ok: true, ...result });
    }
    if (url.pathname === '/api/engine/run' && req.method === 'POST') {
      const payload = await readJson(req);
      if (!payload.name || !payload.command) return send(res, 400, { error: 'A workspace name and command are required' });
      const cwd = engine.resolveWorkspace(payload.name);
      const result = await engine.runCommand(payload.command, { cwd, timeoutMs: payload.timeoutMs });
      return send(res, result.ok ? 200 : 422, result);
    }
    if (url.pathname === '/api/engine/verify' && req.method === 'POST') {
      const payload = await readJson(req);
      if (!payload.name) return send(res, 400, { error: 'A workspace name is required' });
      const result = await engine.verify(payload.name, payload.options || {});
      return send(res, result.ok ? 200 : 422, result);
    }
    if (url.pathname === '/api/engine/tree' && req.method === 'GET') {
      const name = url.searchParams.get('name');
      if (!name) return send(res, 400, { error: 'A workspace name is required' });
      return send(res, 200, { ok: true, tree: await engine.tree(name, Number(url.searchParams.get('depth')) || 3) });
    }
    if (url.pathname === '/api/engine/file' && req.method === 'GET') {
      const name = url.searchParams.get('name');
      const file = url.searchParams.get('path');
      if (!name || !file) return send(res, 400, { error: 'A workspace name and file path are required' });
      return send(res, 200, { ok: true, ...(await engine.readFile(name, file)) });
    }
    if (url.pathname === '/api/engine/file' && req.method === 'POST') {
      const payload = await readJson(req);
      if (!payload.name || !payload.path) return send(res, 400, { error: 'A workspace name and file path are required' });
      return send(res, 200, { ok: true, ...(await engine.writeFile(payload.name, payload.path, payload.content)) });
    }
    if (url.pathname === '/api/engine/git' && req.method === 'POST') {
      const payload = await readJson(req);
      if (!payload.name || !payload.action) return send(res, 400, { error: 'A workspace name and git action are required' });
      return send(res, 200, await engine.git(payload.name, payload.action, payload.message));
    }
    if (url.pathname === '/api/engine/clone' && req.method === 'POST') {
      const payload = await readJson(req);
      if (!payload.url) return send(res, 400, { error: 'A repository url is required' });
      return send(res, 200, { ok: true, ...(await engine.cloneRepo(payload.url, { branch: payload.branch })) });
    }
    if (url.pathname === '/api/engine/context' && req.method === 'GET') {
      const name = url.searchParams.get('name');
      if (!name) return send(res, 400, { error: 'A workspace name is required' });
      return send(res, 200, { ok: true, ...(await engine.repoContext(name, url.searchParams.get('task') || '')) });
    }

    if (url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Not found' });

    const relativePath = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    let filePath = path.resolve(root, relativePath);
    if (!filePath.startsWith(root + path.sep)) return send(res, 403, { error: 'Forbidden' });
    // Directory URLs ("/jarvis/") should serve the index inside them, not EISDIR.
    if (relativePath.endsWith('/')) filePath = path.join(filePath, 'index.html');
    const file = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(file);
  } catch (error) {
    if (error.code === 'ENOENT') return send(res, 404, { error: 'Not found' });
    send(res, 400, { error: error.message || 'Request failed' });
  }
});

server.listen(port, () => console.log(`ZERO-BUILDER running at http://localhost:${port}`));
