/* Quick regression checks for preview ESM sanitization */
const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'sandbox.js'), 'utf8');
global.window = global;
eval(code);

const s = new SandboxManager();
let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL:', msg);
  } else {
    console.log('OK:', msg);
  }
}

const vanilla = {
  'index.html': '<html><body></body></html>',
  'script.js': "import gsap from 'gsap';\nexport default function init(){}",
};
assert(s._hasReactFiles(vanilla) === false, 'vanilla ESM is not treated as React');

const react = {
  'src/App.jsx': 'export default function App(){ return null }',
  'package.json': '{"dependencies":{"react":"18"}}',
};
assert(s._hasReactFiles(react) === true, 'jsx App is treated as React');

const sample = `
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import Lenis from '@studio-freight/lenis';
import './styles.css';

const x = 1;
export default function boot() { return x; }
`;

const stripped = s._stripEsmSyntax(sample);
assert(!/^\s*import\s+/m.test(stripped), 'stripEsm removes static imports');

const rewritten = s._rewriteStaticModules(sample);
assert(rewritten.cdnScripts.length >= 2, 'rewriteStaticModules collects CDN scripts');
assert(!/^\s*import\s+/m.test(rewritten.code), 'rewriteStaticModules removes imports');
assert(/window\.gsap|const gsap/.test(rewritten.code), 'gsap rewritten to global');

const fakeDoc = {
  createElement() {
    return { dataset: {}, textContent: '', type: '' };
  },
};
const el = s._createScript(fakeDoc, sample, 'script.js');
assert(el.type === 'text/javascript', 'createScript uses classic type');
assert(!/^\s*import\s+/m.test(el.textContent), 'createScript output has no static import');

// Multi-line brace import
const multi = `import {\n  gsap,\n  Power2\n} from "gsap";\nconsole.log(gsap);`;
assert(!/^\s*import\s+/m.test(s._stripEsmSyntax(multi)), 'multi-line brace import stripped');

// Three addons must become globals AND pull in the matching UMD example file,
// otherwise the preview throws "OrbitControls is not defined".
const addon = [
  "import * as THREE from 'three';",
  "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';",
  "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';",
  "new OrbitControls(); new GLTFLoader();",
].join('\n');
const addonOut = s._rewriteStaticModules(addon);
assert(/const THREE = window\.THREE/.test(addonOut.code), 'three namespace import becomes window.THREE');
assert(/const OrbitControls = window\.THREE\?\.OrbitControls/.test(addonOut.code), 'OrbitControls import becomes THREE global');
assert(
  addonOut.cdnScripts.some((u) => u.includes('three@0.128.0/examples/js/controls/OrbitControls.js')),
  'OrbitControls UMD example is registered as a CDN'
);
assert(
  addonOut.cdnScripts.some((u) => u.includes('three@0.128.0/examples/js/loaders/GLTFLoader.js')),
  'GLTFLoader UMD example is registered as a CDN'
);
assert(!/^\s*import\s+/m.test(addonOut.code), 'addon imports leave no static import behind');

// The dead UMD Three build must never be injected into a preview.
assert(!addonOut.cdnScripts.some((u) => /three@0\.165\.0\/build\/three\.min\.js/.test(u)), 'no dead three.min.js CDN injected');

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log('\nAll preview ESM tests passed');
