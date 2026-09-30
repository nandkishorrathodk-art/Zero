/* Headless build harness.
   Drives the real AgentFramework pipeline against a live LLM provider so a
   prompt can be judged by the site it produces, not by reading the code.

   Usage: node scripts/build-site.js "your prompt" [--provider groq] [--out DIR]
   Key comes from the environment (GROQ_API_KEY / GEMINI_API_KEY / ...). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const prompt = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2]
  : arg('prompt', '');
const provider = arg('provider', 'groq');
const outDir = arg('out', path.join('/tmp', 'sonic-site'));

if (!prompt) {
  console.error('Usage: node scripts/build-site.js "prompt" [--provider groq] [--out DIR]');
  process.exit(1);
}

const KEY_ENV = {
  groq: 'GROQ_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  mistral: 'MISTRAL_API_KEY',
};
const key = process.env[KEY_ENV[provider]];
if (!key) {
  console.error(`Missing ${KEY_ENV[provider]} in the environment.`);
  process.exit(1);
}

/* ---- Minimal DOM/browser surface the pipeline touches ---- */
const store = new Map([
  ['zb_current_provider', provider],
  ['zb_key_' + provider, key],
]);
const noop = () => {};
const makeEl = () => ({
  style: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  setAttribute: noop, appendChild: noop, removeChild: noop, addEventListener: noop,
  querySelector: () => null, querySelectorAll: () => [], innerHTML: '', textContent: '',
});

const sandbox = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  fetch: (...a) => fetch(...a),
  TextEncoder, TextDecoder, URL, URLSearchParams, AbortController,
  crypto: { randomUUID: () => require('crypto').randomUUID() },
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  },
  document: {
    addEventListener: noop, removeEventListener: noop,
    createElement: makeEl, createElementNS: makeEl,
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    body: makeEl(), head: makeEl(), documentElement: makeEl(),
  },
  navigator: { userAgent: 'node', clipboard: { writeText: async () => {} } },
  location: { href: 'http://localhost/', origin: 'http://localhost' },
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 0),
  cancelAnimationFrame: clearTimeout,
  performance: { now: () => Date.now() },
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const FILES = [
  'js/conversation-memory.js', 'js/component-library.js', 'js/version-control.js',
  'js/llm-provider.js', 'js/project-brain.js', 'js/build-workflow.js',
  'js/autonomous-studio.js', 'js/autonomous-batcher.js', 'js/live-browser-agent.js',
  'js/engine-client.js', 'js/library-registry.js', 'js/design-system.js',
  'js/asset-sources.js', 'js/asset-pipeline.js', 'js/blender-bridge.js',
  'js/agent-framework.js', 'js/media-generator.js',
  'js/agents/prompt-engineer.js', 'js/agents/planner.js', 'js/agents/researcher.js',
  'js/agents/brand-strategist.js', 'js/agents/designer.js', 'js/agents/coder-ui.js',
  'js/agents/coder-react.js', 'js/agents/coder-fullstack.js', 'js/agents/coder-3d.js',
  'js/agents/coder-shader.js', 'js/agents/coder-gpgpu.js', 'js/agents/coder-webgpu.js',
  'js/agents/coder-physics.js', 'js/agents/coder-audio.js', 'js/agents/animator.js',
  'js/agents/architect.js', 'js/agents/reviewer.js', 'js/agents/refiner.js',
  'js/agents/healer.js', 'js/agents/preflight-guard.js', 'js/agents/recovery-agent.js',
  'js/agents/bug-finder.js', 'js/agents/engineer.js', 'js/agents/judge.js',
  'js/agents/coordinator.js', 'js/agents/project-intelligence.js', 'js/sandbox.js',
];

for (const f of FILES) {
  try {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    console.error(`load failed: ${f}: ${e.message}`);
    process.exit(1);
  }
}

/* ---- Wire the agents the way app.js does ---- */
const AGENTS = {
  'prompt-engineer': 'PromptEngineerAgent', planner: 'PlannerAgent', researcher: 'ResearcherAgent',
  'brand-strategist': 'BrandStrategistAgent', designer: 'DesignerAgent', 'coder-ui': 'CoderUIAgent',
  'coder-react': 'CoderReactAgent', 'coder-fullstack': 'CoderFullstackAgent', 'coder-3d': 'Coder3DAgent',
  'coder-shader': 'CoderShaderAgent', 'coder-gpgpu': 'CoderGPGPUAgent', 'coder-webgpu': 'CoderWebGPUAgent',
  'coder-physics': 'CoderPhysicsAgent', 'coder-audio': 'CoderAudioAgent', animator: 'AnimatorAgent',
  architect: 'ArchitectAgent', reviewer: 'ReviewerAgent', refiner: 'RefinerAgent',
  healer: 'HealerAgent', 'fallback-recovery': 'AgentRecoveryAgent', 'bug-finder': 'BugFinderAgent',
  engineer: 'EngineerAgent', coordinator: 'CoordinatorAgent', judge: 'JudgeAgent',
};

(async () => {
  const llm = sandbox.llmProvider;
  llm.currentProvider = provider;
  llm.currentModel = arg('model', 'openai/gpt-oss-120b');
  llm.apiKeys = { ...(llm.apiKeys || {}), [provider]: key };

  console.log(`provider=${llm.currentProvider} model=${llm.currentModel}`);

  const framework = new sandbox.AgentFramework(llm);
  for (const [name, cls] of Object.entries(AGENTS)) {
    const Ctor = sandbox[cls];
    if (Ctor) framework.registerAgent(name, new Ctor());
  }
  if (sandbox.PreflightGuard) framework.setPreflightGuard(new sandbox.PreflightGuard());
  if (sandbox.registerProjectIntelligenceAgents) sandbox.registerProjectIntelligenceAgents();

  const logs = [];
  framework.on('log', (e) => { logs.push(e); console.log(`  [${e.type}] ${e.message}`); });
  framework.on('progress', (e) => console.log(`  (${e.percent}%) ${e.message}`));
  framework.on('error', (e) => console.error(`  [error] ${e.message}`));

  const t0 = Date.now();
  await framework.generate(prompt, { artDirection: arg('art', 'editorial') });
  const files = framework.memory.generatedFiles || {};

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    const target = path.join(outDir, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, typeof body === 'string' ? body : JSON.stringify(body, null, 2));
  }

  console.log(`\n=== done in ${((Date.now() - t0) / 1000).toFixed(1)}s ===`);
  console.log(`files (${Object.keys(files).length}):`);
  for (const [name, body] of Object.entries(files)) {
    console.log(`  ${name}  ${(typeof body === 'string' ? body.length : 0)} bytes`);
  }
  console.log(`written to ${outDir}`);
  console.log(`tokens: ${JSON.stringify(llm.tokenUsage)}`);
  process.exit(0);
})().catch((e) => { console.error('BUILD FAILED:', e.message); process.exit(1); });
