/* Does the generation pipeline actually produce a website without the
   execution engine? Uses a stub LLM that emits the file blocks the real
   model would, so the pipeline itself (parsing, assembly, quality gate) is
   exercised for real. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const store = new Map();
const localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const sandbox = {
  console, setTimeout, clearTimeout, setInterval, clearInterval,
  fetch: () => Promise.reject(new Error('no net')),
  localStorage,
  document: {
    addEventListener() {},
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, getContext: () => null }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
  },
  navigator: { userAgent: 'node' },
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.requestAnimationFrame = () => 0;
sandbox.cancelAnimationFrame = () => {};
vm.createContext(sandbox);

// Load the dependencies of the agent under test, in load order, then the agent.
for (const f of [
  'js/design-system.js',
  'js/agent-framework.js',
  'js/agents/coder-ui.js',
]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
}

const { CoderUIAgent, DesignSystem } = sandbox;

// A stub LLM that answers each pass with plausible, complete output.
const STUB = {
  'html': `**File: index.html**
\`\`\`html
<!doctype html><html><head><meta charset="utf-8"><title>Atelier</title>
<link rel="stylesheet" href="styles.css"></head><body>
<main>
<section class="hero"><p class="eyebrow">Studio</p><h1 class="type-7">We shape matter</h1>
<a class="btn" data-magnet>Start</a></section>
<section class="work grid-12"><article class="card" data-reveal="blur">Project one</article></section>
</main><script src="script.js"></script></body></html>
\`\`\``,
  'css': `**File: styles.css**
\`\`\`css
body{margin:0;background:#0a0a0f;color:#fff;font-family:var(--font-body)}
.hero{padding:var(--space-3xl) var(--grid-margin);min-height:100svh}
.eyebrow{font-size:var(--step--1);letter-spacing:.18em;text-transform:uppercase}
.card{padding:var(--space-lg);border-radius:16px;background:#141420}
.btn{padding:var(--space-xs) var(--space-md);border-radius:999px}
\`\`\``,
  'js': `**File: script.js**
\`\`\`js
const tl = gsap.timeline({scrollTrigger:{trigger:'.hero',scrub:1}});
tl.from('.type-7',{y:60,opacity:0,duration:1.1,ease:'expo.out'})
  .from('.eyebrow',{opacity:0,duration:.6,ease:'power3.out'},'-=0.7');
\`\`\``,
};

let calls = 0;
const stubLLM = {
  // BaseAgent.callLLM routes through llm.chat(messages, options).
  async chat(messages = [], options = {}) {
    calls += 1;
    const u = String(messages.map((m) => m?.content || '').join('\n'));
    if (/generate a complete, cinematic index\.html/i.test(u)) return STUB.html;
    if (/generate a complete, cinematic styles\.css/i.test(u)) return STUB.css;
    if (/script\.js/i.test(u)) return STUB.js;
    return '**File: notes.md**\n```md\nok\n```';
  },
  async stream() { return 'ok'; },
  async callLLMForJSON() { return {}; },
  isConfigured() { return true; },
  get currentProvider() { return 'stub'; },
  set currentProvider(v) {},
};

(async () => {
  const results = {};
  const ui = new CoderUIAgent();
  ui.llm = stubLLM;

  const designSystem = {
    css: ':root{--font-body:Inter,sans-serif}',
    motionImplementations: {},
    advancedAnimations: {},
  };
  const spec = {
    title: 'Atelier',
    description: 'A studio site',
    complexity: 'complex',
    siteType: 'agency-cinematic',
    designPhilosophyName: 'Liquid Glass',
    colorPalette: { primary: '#fff', secondary: '#888', accent: '#f6c85f', background: '#0a0a0f', surface: '#141420' },
    typography: { heading: 'Instrument Serif', body: 'Barlow' },
    motionSystems: ['ScrollReveal', 'ParallaxLayers'],
    advancedEffects: ['magnetic-buttons'],
    components: [],
    artDirection: {},
  };

  const files = await ui.execute(spec, designSystem, null);
  results.filesProduced = Object.keys(files);
  results.hasHTML = !!files['index.html'];
  results.hasCSS = !!files['styles.css'];
  results.hasJS = !!files['script.js'];
  results.tokensInjected = /--step-0/.test(files['styles.css']);
  results.gsapBoilerplate = /gsap/.test(files['script.js']);
  results.totalKB = Math.round(Object.values(files).join('').length / 1024);

  // Does the generated HTML actually reference the generated CSS/JS?
  results.htmlLinksCSS = /styles\.css/.test(files['index.html']);
  results.htmlLinksJS = /script\.js/.test(files['index.html']);

  console.log(JSON.stringify(results, null, 2));

  // Write the generated site out so it can be rendered for real.
  const outDir = path.join('/tmp', 'gen-out');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(outDir, name), body);
  }
  results.writtenTo = outDir;

  const ok = results.hasHTML && results.hasCSS && results.hasJS && results.tokensInjected && results.htmlLinksCSS;
  console.log(ok ? '\nGENERATION_OK (no engine needed)' : '\nGENERATION_FAIL');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
