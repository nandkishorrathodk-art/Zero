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
- **CORS proxy**: providers that do not send `Access-Control-Allow-Origin`
  (NVIDIA's `integrate.api.nvidia.com`, most self-hosted OpenAI-compatible
  servers) cannot be called from the browser at all — the fetch fails with
  "Failed to fetch". `_proxyFetch()` probes `/api/health` for the `llm-proxy`
  capability and, when present, relays the request through `server.js`
  (`POST /api/llm/proxy`). Local targets (Ollama, `localhost`) are called
  directly. On a static host without the server the call falls back to direct.
  The proxy refuses private/loopback targets (`isPrivateHost`) so it cannot be
  used as an SSRF pivot, and streams `text/event-stream` responses through.


## LLM output parsing (`js/agent-framework.js`)

Two invariants that are easy to regress:

- `extractFiles()` normalises CRLF before matching. Without it a `\r\n` response
  matches no file block and the raw markdown becomes the file body.
- `parseJSON()`'s noise stripping uses a string-aware scanner for line comments.
  A blanket line-comment regex truncates `"https://..."` values and fails the
  whole parse whenever the fallback path is taken.

## Generation quality pipeline (`js/agents/coder-ui.js`, `js/agent-framework.js`)

The site builder runs three sequential LLM passes (HTML, then CSS, then JS). Each pass
only sees what the previous pass hands it, so anything dropped between passes
silently degrades the output. Invariants:

- The CSS pass receives `_htmlStructureDigest(html)`, never a truncated excerpt.
  Truncating the HTML left the middle of the page unstyled.
- The HTML pass receives the full design-system CSS and the component markup
  library. It used to get only the first 3000 chars and no markup at all.
- Surface classes come from `_philosophyClasses(designPhilosophy)`; the HTML
  prompt must never hardcode one philosophy's classes (e.g. `liquid-glass`),
  or every brief renders the same regardless of art direction.
- Every component name in a designer template needs a `componentTemplates`
  entry in `coder-ui.js`. A missing key is silently filtered out of the build.
- `_runStaticQualityGate()` carries the cross-file checks that per-file checks
  cannot: css-coverage (markup classes with no rule), philosophy-bleed (a build
  using another philosophy's classes) and motion-craft (missing timeline, ease
  monoculture, unstaggered groups).
- Assembly-time guarantees (`coder-ui.js`) do not trust the model to copy the
  deterministic assets it was given. A model that ignores the brief otherwise
  ships markup with no rule behind it:
  - `_ensureDesignTokens()` prepends the computed scale when the model dropped it.
  - `_ensureBaseStyles()` guarantees `body`/heading `font-family: var(--font-*)`.
  - `_ensureFontSetup()` injects the Google Fonts `<link>` when the model forgot it.
  - `_appendIfAbsent()` re-appends the philosophy CSS, component CSS/JS and motion
    JS that the model omitted. All are idempotent — present content is not duplicated.
  `DesignSystem.toCSS({ fonts })` must emit `--font-heading/--font-body/--font-mono`
  and the base `body`/heading assignments; the component library references those
  vars, so omitting them silently renders the page in Times.

## Design system (`js/design-system.js`)

Awwwards-grade output needs a *system*, not per-section improvisation. This
module computes it deterministically and emits it as CSS custom properties:

- `typeScale()` is a modular ratio, fluid between 360px and 1240px. Two ratios
  (1.2 → 1.25) so headings stay controlled on mobile and get drama on desktop.
- `opticalRules()` is the part that actually sells it: tracking tightens and
  leading compresses as size grows, and measure narrows. Display type with
  body-copy tracking is the single clearest tell of amateur typography.
- `spaceScale()` and `grid()` give every gap and column a token, so sections
  cannot invent their own rhythm.
- `toCSS()` emits tokens plus `.type-N` role classes; `toPromptBlock()` states
  the values and the layout principles as hard constraints.
- `coder-ui.js` calls `_ensureDesignTokens()` at assembly time. If the model
  dropped the tokens the page would reference undefined vars and silently fall
  back to invented sizes, so they are prepended when absent.

## Free assets and Blender (`js/asset-sources.js`, `js/blender-bridge.js`, `js/asset-pipeline.js`)

- `asset-sources.js` resolves Poly Haven (CC0, CORS `*`) HDRIs, PBR texture
  sets and models at 1k. Never invent asset URLs — resolve them here.
- `blender-bridge.js` generates a self-contained bpy script and the argv to run
  it. It never shells out itself; the execution engine runs it so the binary
  allow-list and timeouts still apply. Details that bit us:
  - `subdivisions` is an `ico_sphere` *operator* argument, not a mesh attribute.
  - `torus` takes `major_radius`/`minor_radius`; `cylinder`/`cone` take
    `radius1`/`depth`. A generic `radius` is rejected by Blender.
  - `_names` must be defined before the bake/export block, or a `bake: false`
    run fails at the summary print even though the .glb was written.
  - Draco is chosen from the real triangle count (`draco: 'auto'`). On a
    low-poly scene it *increases* file size (15KB vs 9KB for 80 tris), so
    defaulting it on is a pessimisation.
- `asset-pipeline.js` parses the GLB header + JSON chunk directly (no 3D
  engine) to report triangles, Draco/KTX2, and budget overruns as concrete
  fixes. It exists because a referenced-but-missing or 40MB asset otherwise
  dies at runtime as a blank canvas.

Blender is not vendored: `tools/blender-*/` is gitignored (~1.3GB). See
`tools/README.md` for install and the `probe_*.py` verification scripts.

## Prompt engineering (`js/agents/prompt-engineer.js`)

The brief this agent produces is the contract every downstream coder agent
builds against, so drift here is invisible until the page renders wrong.

- `cdnLibraries` must use the library registry's canonical keys (`gsap`,
  `scrollTrigger`, `splitText`, `morphSVG`, `scrollTo`, `lenis`, `lottie`,
  `rive`, `three`, `troika`, `modelViewer`). Models reliably emit package
  specifiers instead (`gsap/ScrollTrigger`, `three@0.165.0`,
  `@google/model-viewer`), so `_canonicalLibraries()` normalises the model's
  output and drops anything unrecognised. The registry owns versions and URLs;
  a version string here would just be a second source of truth that goes stale.
- The system prompt carries asset sourcing (Poly Haven by slug, Blender for
  geometry/bakes) and typography rules (tracking and leading per size). Without
  the former the model invents CDN paths and placeholder image hosts; without
  the latter it applies one tracking value at every size, which is the clearest
  visual tell of an amateur build.
- `execute()` injects `DesignSystem.toPromptBlock()` into the LLM message, so
  the sizes stated in the brief are the same tokens the coder agents receive.
  A brief that disagrees with the design system produces a page whose
  typography is applied inconsistently.
- The file has duplicate method bodies (e.g. `_composeExactPrompt`,
  `_buildSearchQueries`, `_describeLayout` are each defined twice); the later
  definition wins and the earlier is dead. Edit the later one — an edit to the
  first looks applied but changes nothing.

## Testing

`npm test` runs `scripts/test-preview-esm.js` and `scripts/test-pipeline.js`
(the latter covers the library registry, motion vocabulary, safety gate,
design system, asset sources, asset pipeline, and Blender script generation).
For anything that only exists at runtime, exercise the real engine and verify
in real Chromium headless (`--headless=new --use-gl=swiftshader
--enable-unsafe-swiftshader --dump-dom`) — a green unit test does not prove a
WebGL scene renders. Rebuild bundles before considering a change done.

Note: the Draco decoder hangs under `--virtual-time-budget` in headless
Chromium. Verify Draco path handling with a non-Draco .glb, or drop the virtual
time budget and poll instead.
