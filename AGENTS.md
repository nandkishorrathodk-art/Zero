# AGENTS.md — Zero repository guide

Zero is a browser-based AI app builder: a static frontend (`index.html` + `js/`) talking
to a small Node server (`server.js`). The `js/` modules are concatenated into
`js/zero.bundle.js` and `js/zero-builder.bundle.js` by `build-bundle.js`.

## Commands

- Build bundles: `node build-bundle.js` (run this after editing any file in `js/`)
- Run locally: `node server.js` → http://localhost:4173
- Health: `GET /api/health` (reports `version` and `capabilities`)

## Architecture

- `js/agent-framework.js` — `AgentFramework` state machine (IDLE → PLANNING → GENERATING →
  REVIEWING → HEALING → COMPLETE), memory, event bus, and the LLM wrapper methods
  `callLLM` / `streamLLM` / `streamLLMFiles` / `extractFiles` / `parseJSON`.
- `js/agents/*.js` — agents extending `BaseAgent` (prompt-engineer, planner, researcher,
  coder variants, reviewer, refiner, healer, preflight-guard, recovery, bug-finder,
  project-intelligence, engineer, judge, coordinator).
- `js/engine-client.js` — browser bridge to the local execution engine.
- `engine/executor.js` — server-side `EngineExecutor`: workspace scaffold/read/write/tree,
  allow-listed no-shell command execution, `verify()` (install/build/test), git, and
  repository intake (`cloneRepo`, `repoContext`).
- `server.js` — static file server plus `/api/*` endpoints (device bridge, engine, health).
- `data/` — runtime workspaces (git-ignored).

## Conventions

- Agents extend `BaseAgent`; log with `this.log(level, message)` (level first).
- Register new agents in `js/app.js` **and** add the file to `build-bundle.js`, then rebuild.
- Keep generated bundles out of manual edits — always edit the source under `js/`.

## Execution engine (v5.0.0-engine)

`/api/engine/*` endpoints: `scaffold`, `run`, `verify`, `tree`, `file` (GET/POST),
`git`, `clone`, `context`.

Safety invariants — preserve these:

- Commands run via `spawn` with `shell: false` and an allow-listed binary, so shell
  injection is impossible. Keep new commands within the allow-list.
- A workspace nested inside another git repository must never commit into it
  (`ensureOwnRepo` in `executor.js`).
- GitHub auth uses `-c http.extraheader` (Basic, `x-access-token:<token>`); never write
  tokens into `.git/config` or the command line. `GIT_TERMINAL_PROMPT=0` prevents hangs.

## Agent loops

- `EngineerAgent.execute(files, { workspaceName })` — scaffold → run → read real failure →
  ask for a targeted fix → re-run, up to `maxRetries`.
- `JudgeAgent.evaluate({ files, task, executionReport })` — accepts only when the real run
  passed; a failing run can never be accepted regardless of the model's opinion.
- `CoordinatorAgent.execute(prompt, { files, workspace })` — plan (planner role) → dispatch
  role workers → engineer runs → judge decides accept/revise/replan, looping up to
  `maxRetries` cycles.
- `AgentFramework.executeTask(prompt, { repoUrl?, workspace?, files? })` — general entry
  point: optional repo clone + context, then the coordinator swarm.

## LLM provider (`js/llm-provider.js`)

- Default provider/model: `gemini` / `gemini-3.8-flash`. Google shuts Gemini
  endpoints down on a schedule, so **verify model IDs against
  https://ai.google.dev/gemini-api/docs/models before changing them** — a dead
  default makes every generation fail.
- `retiredModels` + `resolveModel()` migrate a saved dead model to a live one on
  load. Add an entry there when an endpoint is retired instead of only editing
  the list.
- `js/media-generator.js` generates images through the active provider. Gemini
  uses `gemini-2.5-flash-image` (`_generateWithGemini`); without a provider path
  it silently degrades to gradient placeholders.

## LLM output parsing (`js/agent-framework.js`)

Two invariants that are easy to regress:

- `extractFiles()` normalises CRLF before matching. Without it a `\r\n` response
  matches no file block and the raw markdown becomes the file body.
- `parseJSON()`'s noise stripping uses a string-aware scanner for line comments.
  A blanket line-comment regex truncates `"https://..."` values and fails the
  whole parse whenever the fallback path is taken.

## Testing

There is no test runner in-repo. Verify behaviour by exercising the real engine
(e.g. scaffold a workspace with a deliberate bug, run `verify()`, confirm the failure is
detected and a fix makes it pass). Rebuild bundles before considering a change done.
