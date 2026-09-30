/* ============================================================
   LIBRARY REGISTRY — verified CDN URLs and the correct way to load
   each one.

   Two hard-won rules live here:

   1. Three.js has no UMD build after r150. `three.min.js` is a 404 and
      every scene that loads it dies with "THREE is not defined". Three
      must be loaded as an ES module, with an import map so that addon
      imports like `three/addons/...` resolve.

   2. Most addons (DRACO, KTX2, post-processing, Troika) are also ES
      modules. Mixing a UMD global and a bare-specifier import in the
      same page fails, so a page picks one loading strategy and sticks
      to it.

   Every URL below was checked with a real request.
   ============================================================ */

const THREE_VERSION = '0.165.0';
const GSAP_VERSION = '3.13.0';
const LENIS_VERSION = '1.1.20';

/* Script-tag libraries: they attach a global and are safe to combine. */
const UMD = {
  gsap: `https://unpkg.com/gsap@${GSAP_VERSION}/dist/gsap.min.js`,
  scrollTrigger: `https://unpkg.com/gsap@${GSAP_VERSION}/dist/ScrollTrigger.min.js`,
  splitText: `https://unpkg.com/gsap@${GSAP_VERSION}/dist/SplitText.min.js`,
  morphSVG: `https://unpkg.com/gsap@${GSAP_VERSION}/dist/MorphSVGPlugin.min.js`,
  scrollTo: `https://unpkg.com/gsap@${GSAP_VERSION}/dist/ScrollToPlugin.min.js`,
  lenis: `https://unpkg.com/lenis@${LENIS_VERSION}/dist/lenis.min.js`,
  lottie: 'https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js',
  rive: 'https://unpkg.com/@rive-app/canvas@2.21.6/rive.js',
  modelViewer: 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js',
};

/* ES modules, resolved through an import map. */
const ESM = {
  three: `https://unpkg.com/three@${THREE_VERSION}/build/three.module.js`,
  'three/addons/': `https://unpkg.com/three@${THREE_VERSION}/examples/jsm/`,
  troika: 'https://unpkg.com/troika-three-text@0.52.3/dist/troika-three-text.esm.js',
};

/* GSAP plugins that attach to the global gsap object once loaded. */
const GSAP_PLUGIN_GLOBALS = {
  scrollTrigger: 'ScrollTrigger',
  splitText: 'SplitText',
  morphSVG: 'MorphSVGPlugin',
  scrollTo: 'ScrollToPlugin',
};

class LibraryRegistry {
  /* Which libraries a specification actually needs. */
  static plan(specification = {}) {
    const blob = JSON.stringify(specification || {}).toLowerCase();
    const hero = String(specification.heroTreatment || '').toLowerCase();
    const needs = new Set(['gsap', 'scrollTrigger', 'lenis']);

    const wants3d = /webgl|3d|three|particle|shader|scene|model|gltf|glb|raycast|raymarch|gpgpu/.test(blob)
      || /webgl|3d/.test(hero);
    const wantsTextSplit = /split.?text|stagger|word.?reveal|char.?reveal|typographic/.test(blob);
    const wantsMorph = /morph|svg.?shape|path.?transition|blob.?shape/.test(blob);
    const wantsLottie = /lottie|after.?effects|icon.?animation/.test(blob);
    const wantsRive = /rive|state.?machine|interactive.?avatar|game.?like/.test(blob);
    const wants3DText = /3d.?text|troika|floating.?typography|spatial.?type/.test(blob);
    const wantsModelViewer = /product.?viewer|ar\b|augmented|3d.?model.?embed/.test(blob);

    if (wants3d) needs.add('three');
    if (wantsTextSplit) needs.add('splitText');
    if (wantsMorph) needs.add('morphSVG');
    if (wantsLottie) needs.add('lottie');
    if (wantsRive) needs.add('rive');
    if (wants3DText) needs.add('troika');
    if (wantsModelViewer) needs.add('modelViewer');

    return {
      needs,
      three: needs.has('three'),
      modules: needs.has('three') || needs.has('troika'),
      esm: needs.has('three') || needs.has('troika'),
    };
  }

  /* The <script> tags for the classic libraries, in load order. */
  static scriptTags(plan) {
    const tags = [];
    for (const name of ['gsap', 'scrollTrigger', 'splitText', 'morphSVG', 'scrollTo', 'lenis', 'lottie', 'rive', 'modelViewer']) {
      if (plan.needs.has(name) && UMD[name]) tags.push(UMD[name]);
    }
    return tags;
  }

  /* The import map that makes `three/addons/...` resolve. */
  static importMap(plan) {
    if (!plan.esm) return null;
    const imports = { three: ESM.three, 'three/addons/': ESM['three/addons/'] };
    if (plan.needs.has('troika')) imports['troika-three-text'] = ESM.troika;
    return { imports };
  }

  /* Copy-paste-ready instructions for the HTML pass. This is the part the
     old prompt got wrong: it said "include Three.js" and named no URL, so
     the model emitted the dead three.min.js path. */
  static htmlInstructions(specification = {}) {
    const plan = this.plan(specification);
    const lines = [];

    const tags = this.scriptTags(plan);
    if (tags.length) {
      lines.push('Classic libraries — include exactly these <script> tags in <head>, in this order:');
      tags.forEach((url) => lines.push(`  <script src="${url}"></script>`));
    }

    const map = this.importMap(plan);
    if (map) {
      lines.push('');
      lines.push('Three.js is an ES module. It has NO UMD build — three.min.js is a 404 on r150+.');
      lines.push('Include this import map BEFORE any module script:');
      lines.push(`  <script type="importmap">${JSON.stringify(map)}</script>`);
      lines.push('Then load the scene as a module, never as a classic script:');
      lines.push('  <script type="module" src="three-scene.js"></script>');
      lines.push('Inside three-scene.js import Three like this:');
      lines.push("  import * as THREE from 'three';");
      lines.push("  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';");
    }

    return lines.join('\n');
  }

  static gsapPluginNames(plan) {
    return Object.entries(GSAP_PLUGIN_GLOBALS)
      .filter(([key]) => plan.needs.has(key))
      .map(([, globalName]) => globalName);
  }

  /* Approximate transferred weight per library, in KB (minified, before gzip).
     These are measured ballpark figures for budgeting, not exact sizes. */
  static WEIGHTS_KB = {
    gsap: 70,
    scrollTrigger: 40,
    splitText: 15,
    morphSVG: 30,
    scrollTo: 8,
    lenis: 12,
    lottie: 250,
    rive: 320,
    modelViewer: 200,
    three: 650,
    troika: 90,
  };

  /* A page has a budget. Three.js plus two media runtimes plus a 3D text
     engine is already most of a megabyte before a single line of the site's
     own code — that is how an "immersive" build becomes a slow one. */
  static budget(plan, limits = {}) {
    const cap = limits.capKb || 900;
    const items = [...plan.needs]
      .filter((name) => this.WEIGHTS_KB[name])
      .map((name) => ({ name, kb: this.WEIGHTS_KB[name] }))
      .sort((a, b) => b.kb - a.kb);

    const totalKb = items.reduce((sum, item) => sum + item.kb, 0);
    const over = Math.max(0, totalKb - cap);

    const warnings = [];
    if (totalKb > cap) {
      warnings.push(`Library payload ~${totalKb}KB exceeds the ${cap}KB budget by ~${over}KB.`);
    }
    if (plan.needs.has('lottie') && plan.needs.has('rive')) {
      warnings.push('Lottie and Rive overlap. Pick one animation runtime unless both formats are genuinely needed.');
    }
    if (plan.needs.has('three') && plan.needs.has('modelViewer')) {
      warnings.push('model-viewer bundles its own Three copy. Prefer a plain Three GLTFLoader unless you need the <model-viewer> element.');
    }

    return { items, totalKb, capKb: cap, over, ok: totalKb <= cap, warnings };
  }

  /* Runtime guidance the coder passes must respect, because the failure mode
     of an immersive page is a dropped frame, not a syntax error. */
  static runtimeRules(plan) {
    const rules = [
      'Cap devicePixelRatio at 2 — retina rendering beyond that is invisible and doubles fill cost.',
      'Pause requestAnimationFrame work when the canvas is offscreen (IntersectionObserver).',
      'Honor prefers-reduced-motion: skip or drastically reduce motion, never disable content.',
    ];
    if (plan.needs.has('three')) {
      rules.push('Reuse geometries and materials; dispose everything on teardown.');
      rules.push('Keep draw calls low with InstancedMesh — thousands of objects should be one call, not thousands.');
      rules.push('Load models through Draco for geometry and KTX2 for textures; unbaked assets dominate load time.');
      rules.push('Bake lighting and shadows into textures instead of computing them per frame.');
    }
    return rules;
  }
}

if (typeof window !== 'undefined') window.LibraryRegistry = LibraryRegistry;
if (typeof module !== 'undefined' && module.exports) module.exports = { LibraryRegistry };
