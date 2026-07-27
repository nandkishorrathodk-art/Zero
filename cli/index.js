#!/usr/bin/env node

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

// Parse --token
const args = process.argv.slice(2);
let token = null;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token') {
        token = args[i + 1];
        break;
    }
}

if (!token) {
    console.error('\x1b[31m[ERROR]\x1b[0m Missing --token argument.');
    console.log('Usage: npx @zero-builder/local --token <YOUR_TOKEN>');
    process.exit(1);
}

const port = 3001;

function safeWorkspaceName(name) {
  const value = String(name || 'zero-project').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
  return value || 'zero-project';
}

function send(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return send(res, 204, {});
  }

  // Token Verification
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.replace('Bearer ', '').trim();
  
  if (bearerToken !== token) {
      console.log(`\x1b[33m[WARNING]\x1b[0m Unauthorized connection attempt rejected.`);
      return send(res, 401, { error: 'Unauthorized: Invalid CLI Token' });
  }

  if (req.url === '/api/device/status' && req.method === 'GET') {
      return send(res, 200, { ok: true, platform: os.platform(), cpus: os.cpus().length, memory: os.totalmem() });
  }

  if (req.url === '/api/device/workspaces' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
          body += chunk;
          if (body.length > 50_000_000) return send(res, 413, { error: 'Payload too large' });
      }
      try {
          const payload = JSON.parse(body);
          if (!payload.files || typeof payload.files !== 'object') return send(res, 400, { error: 'Invalid payload' });

          const slug = safeWorkspaceName(payload.name);
          const workspace = path.join(process.cwd(), slug);
          
          let counter = 1;
          let finalWorkspace = workspace;
          while (true) {
              try { await fs.access(finalWorkspace); finalWorkspace = `${workspace}-${counter++}`; }
              catch { break; }
          }
          await fs.mkdir(finalWorkspace, { recursive: true });

          for (const [filename, content] of Object.entries(payload.files)) {
              if (filename.includes('..') || filename.startsWith('/')) continue;
              const fullPath = path.join(finalWorkspace, filename);
              await fs.mkdir(path.dirname(fullPath), { recursive: true });
              await fs.writeFile(fullPath, content, 'utf8');
          }

          console.log(`\x1b[32m[SUCCESS]\x1b[0m Received project. Saved to: ${finalWorkspace}`);
          return send(res, 200, { ok: true, workspace: path.basename(finalWorkspace), location: finalWorkspace, fileCount: Object.keys(payload.files).length });
      } catch (e) {
          console.error(e);
          return send(res, 500, { error: 'Failed to write workspace files' });
      }
  }

  return send(res, 404, { error: 'Not found' });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\x1b[31m[ERROR]\x1b[0m Port ${port} is already in use.`);
        console.error(`Please stop any existing Zero-Builder instances and try again.`);
        process.exit(1);
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log('\x1b[36m============================================\x1b[0m');
    console.log('🚀 Zero-Builder Remote CLI is running!');
    console.log(`📡 Secure Token: ${token}`);
    console.log(`🌐 Waiting for commands from zero-ai.surge.sh...`);
    console.log('\x1b[36m============================================\x1b[0m');
});
