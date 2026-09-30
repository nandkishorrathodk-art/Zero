/* ============================================================
   JARVIS — a working, talking engineering assistant
   An agent loop that works on real code in a real workspace and
   holds a conversation while it does it.

   Design: the loop is LLM ⇄ tools. The model can run commands,
   read/write files and ask the human questions. Every action is
   emitted as an event so the UI can narrate what is happening.

   Safety: commands are classified. Anything destructive pauses and
   asks the human before it runs (unless auto-approve is on).
   ============================================================ */

const WORKSPACE_ROOT = 'data/jarvis-workspaces';
const MAX_STEPS = 40;

/* Commands that only read. Safe to run unattended. */
const READ_ONLY = /^(ls|pwd|cat|head|tail|wc|find|grep|rg|git (status|log|diff|show|branch)|npm (ls|view)|node -v|python3? -V|echo)\b/;
/* Commands that change the machine or the repo. Always ask first. */
const DESTRUCTIVE = /\b(rm|rmdir|mv|dd|mkfs|shutdown|reboot|kill|pkill|chmod|chown|sudo|curl|wget)\b|>\s*\S|git (push|reset --hard|clean -fd|checkout --)/;
class Jarvis {
  constructor({ provider, engine, emit, ask, autoApprove = false, workspace = 'default', maxSteps = MAX_STEPS }) {
    this.provider = provider;
    this.engine = engine;
    this.emit = emit || (() => {});
    this.ask = ask || (async () => true);
    this.autoApprove = autoApprove;
    this.workspace = engine.safeName(workspace);
    this.maxSteps = maxSteps;
    this.history = [];
  }

  systemPrompt() {
    return [
      'You are JARVIS, a calm, precise engineering assistant working alongside the user inside a real code workspace.',
      '',
      'You have tools. Use them instead of guessing. Never claim something works until you have run it.',
      '  - run_command({command, cwd?})  run a shell command in the workspace',
      '  - read_file({path})             read a file',
      '  - write_file({path, content})   create or overwrite a file',
      '  - list_files({depth?})          list the workspace tree',
      '  - ask_user({question, options?})  ask the human and wait for the answer',
      '  - finish({summary})             end the turn with a plain-language summary',
      '',
      'Rules:',
      '- Prefer many small, verified steps over one large blind edit.',
      '- Read a file before you change it.',
      '- After writing code, run it (or its tests) and report the real result.',
      '- If a task is ambiguous or risky, call ask_user instead of assuming.',
      '- Talk like a colleague: short, concrete, no filler.',
      '',
      'Reply with ONLY a JSON object, no prose outside it:',
      '{"thought":"brief reasoning","tool":"<tool name>","args":{...}}',
      'When the task is done, use the finish tool.',
    ].join('\n');
  }

  async toolSchemas() {
    return [
      { name: 'run_command', description: 'Run a shell command in the workspace', parameters: { command: 'string', cwd: 'string?' } },
      { name: 'read_file', description: 'Read a file', parameters: { path: 'string' } },
      { name: 'write_file', description: 'Create or overwrite a file', parameters: { path: 'string', content: 'string' } },
      { name: 'list_files', description: 'List workspace files', parameters: { depth: 'number?' } },
      { name: 'ask_user', description: 'Ask the human a question and wait', parameters: { question: 'string', options: 'string[]?' } },
      { name: 'finish', description: 'Finish with a summary', parameters: { summary: 'string' } },
    ];
  }

  /* ---------- one turn of the loop ---------- */
  async run(userMessage, { onToken } = {}) {
    this.history.push({ role: 'user', content: userMessage });
    this.emit({ type: 'status', state: 'thinking' });

    let finished = null;

    for (let step = 1; step <= this.maxSteps; step++) {
      const messages = [
        { role: 'system', content: this.systemPrompt() },
        { role: 'system', content: `Workspace root: ${WORKSPACE_ROOT}/${this.workspace}` },
        ...this.history.slice(-24),
      ];

      const raw = await this.provider.chat(messages, { temperature: 0.2, maxTokens: 1500 });
      const action = this._parseAction(raw);
      if (!action) {
        // Model spoke prose instead of JSON — treat it as the answer.
        this.history.push({ role: 'assistant', content: String(raw || '').trim() });
        this.emit({ type: 'message', role: 'jarvis', text: String(raw || '').trim() });
        finished = { summary: String(raw || '').trim(), ok: true };
        break;
      }

      if (action.thought) this.emit({ type: 'thought', text: action.thought });
      this.history.push({ role: 'assistant', content: JSON.stringify(action) });

      const result = await this._runTool(action, step);
      this.history.push({ role: 'user', content: `TOOL_RESULT ${action.tool}: ${JSON.stringify(result).slice(0, 4000)}` });

      if (action.tool === 'finish') {
        finished = { summary: result.summary, ok: true };
        break;
      }
    }

    if (!finished) {
      finished = { summary: 'I hit the step limit for this turn. Tell me how you want to continue.', ok: false };
    }

    this.emit({ type: 'status', state: 'idle' });
    this.emit({ type: 'message', role: 'jarvis', text: finished.summary });
    return finished;
  }

  _parseAction(raw) {
    const text = String(raw || '').trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      const parsed = JSON.parse(text.slice(start, end + 1));
      return parsed && typeof parsed.tool === 'string' ? parsed : null;
    } catch {
      return null;
    }
  }

  async _runTool(action, step) {
    const args = action.args || {};
    this.emit({ type: 'tool', step, tool: action.tool, args: this._redact(args) });

    try {
      switch (action.tool) {
        case 'list_files': {
          const tree = await this.engine.tree(this.workspace, Number(args.depth) || 3);
          const files = this._flatten(tree);
          this.emit({ type: 'result', step, ok: true, text: `${files.length} file(s)` });
          return { ok: true, files: files.slice(0, 200) };
        }
        case 'read_file': {
          const read = await this.engine.readFile(this.workspace, String(args.path || ''));
          this.emit({ type: 'result', step, ok: true, text: `${read.content.length} chars` });
          return { ok: true, content: read.content.slice(0, 20000) };
        }
        case 'write_file': {
          await this.engine.writeFile(this.workspace, String(args.path || ''), String(args.content ?? ''));
          this.emit({ type: 'result', step, ok: true, text: `wrote ${String(args.content ?? '').length} chars` });
          return { ok: true, path: args.path };
        }
        case 'run_command': {
          const command = String(args.command || '');
          const approved = await this._approve(command);
          if (!approved) {
            this.emit({ type: 'result', step, ok: false, text: 'declined by user' });
            return { ok: false, error: 'The user declined to run this command.' };
          }
          const run = await this.engine.runCommand(command, { cwd: this._cwd(args.cwd), timeoutMs: 120000 });
          this.emit({ type: 'result', step, ok: run.ok, text: run.ok ? 'exit 0' : `exit ${run.exitCode ?? 'error'}` });
          return { ok: run.ok, stdout: String(run.stdout || '').slice(-4000), stderr: String(run.stderr || '').slice(-2000) };
        }
        case 'ask_user': {
          const answer = await this.ask({ question: String(args.question || ''), options: args.options || [] });
          this.emit({ type: 'message', role: 'user', text: String(answer || '') });
          return { ok: true, answer: String(answer || '') };
        }
        case 'finish':
          return { ok: true, summary: String(args.summary || 'Done.') };
        default:
          return { ok: false, error: `Unknown tool: ${action.tool}` };
      }
    } catch (error) {
      this.emit({ type: 'result', step, ok: false, text: error.message });
      return { ok: false, error: error.message };
    }
  }

  async _approve(command) {
    if (this.autoApprove) return true;
    // A read-only verb only stays read-only while it is the whole command.
    // "echo hi > /etc/passwd" and "ls; rm -rf /" both start with a safe verb,
    // so the destructive test has to run first and any shell chaining
    // (;, &&, ||, |, $(), backticks, redirection) forfeits the fast path.
    const chained = /[;&|`$><\n]|\|\||&&/.test(command);
    if (!chained && !DESTRUCTIVE.test(command) && READ_ONLY.test(command.trim())) return true;
    const risky = DESTRUCTIVE.test(command);
    const answer = await this.ask({
      question: risky ? `This command can change things permanently. Run it?` : `Run this command?`,
      command,
      risk: risky ? 'high' : 'low',
    });
    return answer === true || /^(y|yes|ok|haan|ha|sure|run)/i.test(String(answer || ''));
  }

  /* Commands must run inside the session workspace, never the server cwd. */
  _cwd(sub) {
    const root = this.engine.resolveWorkspace(this.workspace);
    if (!sub) return root;
    const path = require('node:path');
    const target = path.resolve(root, String(sub));
    return target.startsWith(root + path.sep) || target === root ? target : root;
  }

  _flatten(nodes, acc = []) {
    for (const node of nodes || []) {
      if (node.type === 'file') acc.push(node.path);
      else if (node.children) this._flatten(node.children, acc);
    }
    return acc;
  }

  _redact(args) {
    const clean = { ...args };
    for (const key of Object.keys(clean)) {
      if (/token|key|secret|password/i.test(key)) clean[key] = '***';
    }
    if (typeof clean.content === 'string' && clean.content.length > 200) {
      clean.content = clean.content.slice(0, 200) + `… (${clean.content.length} chars)`;
    }
    return clean;
  }
}

module.exports = { Jarvis, WORKSPACE_ROOT };
