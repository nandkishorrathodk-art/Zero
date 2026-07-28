/* ZERO-BUILDER local product server — dependency-free by design. */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');

const root = __dirname;
const dataDir = path.join(root, 'data');
const projectsFile = path.join(dataDir, 'projects.json');
const workspacesDir = path.join(dataDir, 'local-workspaces');
const port = Number(process.env.PORT || 4173);
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };

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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/health' && req.method === 'GET') return send(res, 200, { ok: true, service: 'zero-builder-max', version: '4.4.0', capabilities: ['local-device-bridge', 'project-sync', 'workspace-export', 'zip-project-intake', 'domparser-preview', 'google-auth-ready', 'project-intelligence-agents', 'agent-recovery-supervisor', 'project-repository-memory', 'motion-studio'] });
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
    if (url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Not found' });

    const relativePath = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const filePath = path.resolve(root, relativePath);
    if (!filePath.startsWith(root + path.sep)) return send(res, 403, { error: 'Forbidden' });
    const file = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(file);
  } catch (error) {
    if (error.code === 'ENOENT') return send(res, 404, { error: 'Not found' });
    send(res, 400, { error: error.message || 'Request failed' });
  }
});

if (require.main === module) {
  server.listen(port, () => console.log(`ZERO-BUILDER running at http://localhost:${port}`));
}

module.exports = (req, res) => {
  server.emit('request', req, res);
};
