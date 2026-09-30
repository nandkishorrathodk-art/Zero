/* ============================================================
   DESIGN SYSTEM — the deterministic scaffolding under an Awwwards-grade page.

   Why this exists: the design pass used to be "describe a mood and let the
   model pick sizes". That produces centred layouts, arbitrary font sizes,
   and no rhythm — the exact tells of a generic template. Sites that win
   awards are built on a system: a modular type scale, a real grid, a
   spacing rhythm, and optical corrections per size.

   Everything here is computed from a ratio, so it is reproducible and can
   be emitted as CSS custom properties the coder agent must consume rather
   than invent.
   ============================================================ */

const VIEWPORT_MIN = 360;
const VIEWPORT_MAX = 1240;

class DesignSystem {
  /* Modular type scale, fluid between a min and max viewport.

     Two ratios rather than one: a tighter ratio on small screens keeps
     headings from swallowing the layout, a wider ratio on desktop gives
     the display sizes their drama. This is the "utopia" approach and it
     is what makes type feel intentional at every width. */
  static typeScale({ base = 16, baseMax = 18, ratio = 1.2, ratioMax = 1.25, steps = 7 } = {}) {
    const out = {};
    for (let n = -1; n <= steps; n += 1) {
      const minPx = base * Math.pow(ratio, n);
      const maxPx = baseMax * Math.pow(ratioMax, n);
      const slope = ((maxPx - minPx) / (VIEWPORT_MAX - VIEWPORT_MIN)) * 100;
      const intercept = minPx - (slope / 100) * VIEWPORT_MIN;
      const minRem = +(minPx / 16).toFixed(3);
      const maxRem = +(maxPx / 16).toFixed(3);
      const interceptRem = +(intercept / 16).toFixed(3);
      const clamped = Math.abs(maxPx - minPx) < 0.5;
      out[`step-${n}`] = {
        px: Math.round(minPx),
        pxMax: Math.round(maxPx),
        rem: minRem,
        value: clamped
          ? `${minRem}rem`
          : `clamp(${minRem}rem, ${interceptRem}rem + ${slope.toFixed(2)}vw, ${maxRem}rem)`,
      };
    }
    return out;
  }

  /* Fluid spacing rhythm. Every gap on the page is one of these, which is
     what stops the "each section invented its own padding" look. */
  static spaceScale() {
    const steps = {
      '3xs': [4, 6],
      '2xs': [8, 10],
      xs: [12, 16],
      sm: [16, 24],
      md: [24, 32],
      lg: [32, 48],
      xl: [48, 72],
      '2xl': [64, 104],
      '3xl': [96, 160],
      '4xl': [128, 224],
    };
    const out = {};
    for (const [name, [minPx, maxPx]] of Object.entries(steps)) {
      const slope = ((maxPx - minPx) / (VIEWPORT_MAX - VIEWPORT_MIN)) * 100;
      const intercept = minPx - (slope / 100) * VIEWPORT_MIN;
      out[`space-${name}`] = `clamp(${(minPx / 16).toFixed(3)}rem, ${(intercept / 16).toFixed(3)}rem + ${slope.toFixed(2)}vw, ${(maxPx / 16).toFixed(3)}rem)`;
    }
    return out;
  }

  /* Optical corrections. Large type needs negative tracking and tighter
     leading; body copy needs the opposite. Applying the same values at
     every size is the single most common reason display type looks
     amateur. */
  static opticalRules(scale) {
    const rules = [];
    const step = (n) => scale[`step-${n}`]?.pxMax || 16;
    for (let n = -1; n <= 7; n += 1) {
      const size = step(n);
      let tracking;
      let leading;
      let measure;
      if (size >= 96) { tracking = '-0.045em'; leading = 0.9; measure = '9ch'; }
      else if (size >= 64) { tracking = '-0.035em'; leading = 0.95; measure = '12ch'; }
      else if (size >= 40) { tracking = '-0.025em'; leading = 1.05; measure = '18ch'; }
      else if (size >= 28) { tracking = '-0.015em'; leading = 1.15; measure = '26ch'; }
      else if (size >= 20) { tracking = '-0.005em'; leading = 1.35; measure = '38ch'; }
      else { tracking = '0em'; leading = 1.6; measure = '68ch'; }
      rules.push({ step: n, sizePx: size, letterSpacing: tracking, lineHeight: leading, maxWidth: measure });
    }
    return rules;
  }

  /* A real 12-column grid with a gutter that scales. Published as vars so
     the layout is consistent instead of per-section guesswork. */
  static grid() {
    return {
      columns: 12,
      maxWidth: '1440px',
      gutter: 'clamp(1rem, 2.5vw, 2.5rem)',
      margin: 'clamp(1.25rem, 5vw, 5rem)',
      css: [
        '--grid-columns: 12;',
        '--grid-max: 1440px;',
        '--grid-gutter: clamp(1rem, 2.5vw, 2.5rem);',
        '--grid-margin: clamp(1.25rem, 5vw, 5rem);',
      ],
      utility: `.container{width:100%;max-width:var(--grid-max);margin-inline:auto;padding-inline:var(--grid-margin)}` +
        `.grid-12{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--grid-gutter)}` +
        `@media(max-width:768px){.grid-12{grid-template-columns:repeat(4,minmax(0,1fr))}}`,
    };
  }

  /* The composition rules that actually separate an award-winning page
     from a tidy template. These are constraints, not suggestions. */
  static layoutPrinciples() {
    return [
      'Break the centre. At least two sections must be asymmetric — offset columns (4/7, 3/8), an element bleeding off the edge, or a deliberate imbalance. A page of centred blocks reads as a template.',
      'Whitespace is the design. Section padding uses --space-2xl or larger; never less than --space-xl between major blocks. When in doubt, add space, not another element.',
      'One idea per viewport. Each scroll position should communicate a single thing. If two elements compete for the same beat, move one to the next section.',
      'Type does the heavy lifting. Use --step-6/--step-7 for a single display line per page. Everything else steps down decisively — no two adjacent sizes within one step of each other.',
      'Establish a dominant element per section: one thing at --step-4 or larger, the rest small. Equal weighting flattens hierarchy.',
      'Align to the grid, then break it once, on purpose. Optical alignment beats mathematical alignment for edges and punctuation.',
      'Contrast in scale, not just colour. A 6:1 size jump between a label and its heading is more premium than any gradient.',
      'Give the eye a path: enter top-left, travel through the section, exit toward the next. Use alignment and scale to steer, not arrows.',
      'Never ship more than three type sizes visible at once in a single section.',
      'Full-bleed is a tool, not a default. Use it for media and one statement section; keep the rest inside the container so the bleed lands.',
    ];
  }

  /* Emit the whole system as CSS custom properties. This is the block the
     coder agent must paste and then only ever reference by var(). */
  static toCSS(options = {}) {
    const scale = DesignSystem.typeScale(options);
    const space = DesignSystem.spaceScale();
    const grid = DesignSystem.grid();
    const optical = DesignSystem.opticalRules(scale);

    const lines = [':root{', '  /* fluid type scale — modular ratio, computed not guessed */'];
    for (const [name, s] of Object.entries(scale)) lines.push(`  --${name}: ${s.value};`);
    lines.push('', '  /* spacing rhythm — every gap comes from here */');
    for (const [name, v] of Object.entries(space)) lines.push(`  --${name}: ${v};`);
    lines.push('', '  /* grid */');
    for (const l of grid.css) lines.push(`  ${l}`);
    lines.push('', '  /* optical corrections per step (tracking / leading / measure) */');
    for (const r of optical) {
      if (r.step < 0) continue;
      lines.push(`  --leading-${r.step}: ${r.lineHeight};`);
      lines.push(`  --tracking-${r.step}: ${r.letterSpacing};`);
      lines.push(`  --measure-${r.step}: ${r.maxWidth};`);
    }
    lines.push('}');

    // Utility classes that pair a step with its optical corrections, so the
    // agent cannot accidentally apply display tracking to body copy.
    lines.push('', '/* type roles — size, tracking, leading and measure applied together */');
    for (let n = 0; n <= 7; n += 1) {
      lines.push(`.type-${n}{font-size:var(--step-${n});line-height:var(--leading-${n});letter-spacing:var(--tracking-${n});max-width:var(--measure-${n})}`);
    }
    lines.push('', grid.utility);
    return lines.join('\n');
  }

  /* The prompt block. Values are concrete so the model has nothing to
     invent, and the principles are framed as hard constraints. */
  static toPromptBlock(options = {}) {
    const scale = DesignSystem.typeScale(options);
    const grid = DesignSystem.grid();
    const display = scale['step-6'];
    const hero = scale['step-7'];
    return [
      'DESIGN SYSTEM (computed — use these vars, do NOT invent sizes)',
      `* Display type: var(--step-6) ≈ ${display.px}–${display.pxMax}px. Hero statement: var(--step-7) ≈ ${hero.px}–${hero.pxMax}px.`,
      `* Body: var(--step-0). Labels/eyebrows: var(--step--1) with uppercase and 0.18em tracking.`,
      `* Spacing: var(--space-3xl) between sections, var(--space-lg) inside a group, var(--space-xs) between a label and its value.`,
      `* Grid: ${grid.columns} columns, max ${grid.maxWidth}, gutter var(--grid-gutter), page margin var(--grid-margin). Use .grid-12 or .container.`,
      '* Apply .type-N classes so tracking and leading match the size automatically.',
      '',
      'LAYOUT PRINCIPLES (hard constraints, not advice)',
      ...DesignSystem.layoutPrinciples().map((p) => `* ${p}`),
    ].join('\n');
  }
}

if (typeof window !== 'undefined') window.DesignSystem = DesignSystem;
if (typeof module !== 'undefined' && module.exports) module.exports = { DesignSystem, VIEWPORT_MIN, VIEWPORT_MAX };
