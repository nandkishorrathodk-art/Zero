/* ============================================================
   JARVIS SERVER — session + event stream + approval channel
   Wires the agent loop to the browser over SSE. The human-in-the-
   loop pause is a promise: when Jarvis calls ask(), the request
   blocks until the browser posts an answer.
   ============================================================ */

const crypto = require('node:crypto');
const { Jarvis } = require('./jarvis');
const { JarvisProvider } = require('./provider');

const sessions = new Map();

function sseWrite(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function createSession(engine, payload = {}) {
  const id = crypto.randomUUID();
  const provider = new JarvisProvider({
    provider: payload.provider || 'gemini',
    model: payload.model,
    apiKey: payload.apiKey,
    baseUrl: payload.baseUrl,
  });

  const session = { id, res: null, pending: null, busy: false };
  session.jarvis = new Jarvis({
    provider,
    engine,
    workspace: payload.workspace || 'default',
    autoApprove: !!payload.autoApprove,
    emit: (event) => {
      if (session.res) sseWrite(session.res, event);
    },
    ask: (question) =>
      new Promise((resolve) => {
        session.pending = { question, resolve };
        if (session.res) sseWrite(session.res, { type: 'ask', question });
      }),
  });

  sessions.set(id, session);
  return { id, workspace: session.jarvis.workspace };
}

function attachStream(id, res) {
  const session = sessions.get(id);
  if (!session) return false;
  session.res = res;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
  });
  res.write(': connected\n\n');
  sseWrite(res, { type: 'status', state: session.busy ? 'working' : 'idle' });
  return true;
}

async function sendMessage(id, text) {
  const session = sessions.get(id);
  if (!session) throw new Error('Unknown session');
  if (session.busy) throw new Error('Jarvis is still working on the previous request');
  session.busy = true;
  if (session.res) sseWrite(session.res, { type: 'status', state: 'working' });
  try {
    const result = await session.jarvis.run(text);
    return result;
  } catch (error) {
    // The human must see failures, not a silent return to idle.
    if (session.res) sseWrite(session.res, { type: 'error', message: error.message });
    throw error;
  } finally {
    session.busy = false;
    if (session.res) sseWrite(session.res, { type: 'status', state: 'idle' });
  }
}

function answer(id, value) {
  const session = sessions.get(id);
  if (!session || !session.pending) return false;
  const { resolve } = session.pending;
  session.pending = null;
  resolve(value);
  return true;
}

function closeSession(id) {
  const session = sessions.get(id);
  if (!session) return false;
  if (session.pending) session.pending.resolve('no');
  if (session.res) session.res.end();
  sessions.delete(id);
  return true;
}

module.exports = { createSession, attachStream, sendMessage, answer, closeSession, sessions };
