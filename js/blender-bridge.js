/* ============================================================
   BLENDER BRIDGE — turn a scene spec into a headless Blender run.

   Blender is the only free tool that can take a description, build real
   geometry, bake lighting into textures, and export a Draco-compressed
   .glb — all without a GUI. That last part is what makes it usable by an
   agent: `blender --background --python script.py` is a deterministic
   build step, not an interactive app.

   This module never shells out by itself. It produces the script and the
   argument list; the execution engine runs them so the existing binary
   allow-list and timeout still apply.
   ============================================================ */

const PRIMITIVES = new Set(['cube', 'sphere', 'ico_sphere', 'cylinder', 'cone', 'torus', 'plane']);

/* Escape a value for embedding in generated Python source. */
function py(value) {
  return JSON.stringify(String(value));
}

function pyNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : String(fallback);
}

class BlenderBridge {
  constructor({ binary = null, engine = null, workspaceRoot = null } = {}) {
    this.binary = binary || BlenderBridge.findBinary();
    this.engine = engine;
    this.workspaceRoot = workspaceRoot;
  }

  static findBinary() {
    const candidates = [
      process.env.BLENDER_BIN,
      'blender',
      `${process.cwd()}/tools/blender-4.2.0-linux-x64/blender`,
      '/usr/local/bin/blender',
      '/usr/bin/blender',
    ].filter(Boolean);
    const fs = require('fs');
    for (const c of candidates) {
      if (c === 'blender') return c; // resolved via PATH at exec time
      try { if (fs.existsSync(c)) return c; } catch { /* keep looking */ }
    }
    return 'blender';
  }

  available() {
    const fs = require('fs');
    if (this.binary === 'blender') return true;
    try { return fs.existsSync(this.binary); } catch { return false; }
  }

  /* Build a complete, self-contained bpy script. Deterministic: the same
     spec always produces the same script, which is what makes a bake
     reproducible. */
  buildScript(spec = {}) {
    const objects = Array.isArray(spec.objects) && spec.objects.length
      ? spec.objects
      : [{ type: 'ico_sphere', name: 'Hero', radius: 1 }];

    const lines = [];
    lines.push('import bpy, os, sys, math, json');
    lines.push('out_dir = sys.argv[-1]');
    lines.push('os.makedirs(out_dir, exist_ok=True)');
    lines.push('bpy.ops.wm.read_factory_settings(use_empty=True)');
    lines.push('scene = bpy.context.scene');
    lines.push('');

    // Geometry
    lines.push('# --- geometry ---');
    const names = [];
    for (const raw of objects) {
      const type = PRIMITIVES.has(raw.type) ? raw.type : 'ico_sphere';
      const name = String(raw.name || type).replace(/[^A-Za-z0-9_]/g, '_');
      names.push(name);
      const loc = Array.isArray(raw.location) ? raw.location : [0, 0, 0];
      const op = type === 'ico_sphere' ? 'primitive_ico_sphere_add' : `primitive_${type}_add`;
      // Each Blender primitive operator names its size argument differently,
      // so the mapping has to be explicit rather than a generic `radius`.
      const parts = [];
      const radius = pyNumber(raw.radius, 1);
      switch (type) {
        case 'cube':
        case 'plane':
          parts.push(`size=${pyNumber(raw.size, 1)}`);
          break;
        case 'torus':
          parts.push(`major_radius=${radius}`);
          parts.push(`minor_radius=${pyNumber(raw.minorRadius, 0.35)}`);
          break;
        case 'cylinder':
        case 'cone':
          parts.push(`radius1=${radius}`);
          if (type === 'cone') parts.push(`radius2=${pyNumber(raw.radius2, 0)}`);
          parts.push(`depth=${pyNumber(raw.depth, 2)}`);
          break;
        default:
          parts.push(`radius=${radius}`);
      }
      if (type === 'ico_sphere' && raw.subdivisions) parts.push(`subdivisions=${pyNumber(raw.subdivisions, 2)}`);
      parts.push(`location=(${loc.map((v) => pyNumber(v)).join(', ')})`);
      lines.push(`bpy.ops.mesh.${op}(${parts.join(', ')})`);
      lines.push(`_o = bpy.context.active_object; _o.name = ${py(name)}`);
      if (raw.shadeSmooth) lines.push('bpy.ops.object.shade_smooth()');
      // Material
      const color = Array.isArray(raw.color) ? raw.color : [0.98, 0.81, 0.90, 1];
      lines.push(`_m = bpy.data.materials.new(${py(name + 'Mat')}); _m.use_nodes = True`);
      lines.push(`_b = _m.node_tree.nodes["Principled BSDF"]`);
      lines.push(`_b.inputs["Base Color"].default_value = (${color.map((c) => pyNumber(c, 1)).join(', ')})`);
      lines.push(`_b.inputs["Metallic"].default_value = ${pyNumber(raw.metallic, 0.2)}`);
      lines.push(`_b.inputs["Roughness"].default_value = ${pyNumber(raw.roughness, 0.35)}`);
      lines.push(`_o.data.materials.append(_m)`);
      lines.push('');
    }

    // Lighting
    lines.push('# --- lighting ---');
    if (spec.bake) {
      lines.push('bpy.ops.object.light_add(type="AREA", location=(2.5, -2.5, 3.5))');
      lines.push('bpy.context.active_object.data.energy = 800');
      lines.push('bpy.ops.object.light_add(type="POINT", location=(-2, 1.5, 1.5))');
      lines.push('bpy.context.active_object.data.energy = 200');
    } else {
      lines.push('bpy.ops.object.light_add(type="AREA", location=(3, -3, 5))');
      lines.push('bpy.context.active_object.data.energy = 500');
    }
    lines.push('bpy.ops.object.camera_add(location=(0, -4.2, 1.6), rotation=(math.radians(80), 0, 0))');
    lines.push('');
    lines.push(`_names = ${JSON.stringify(names)}`);
    lines.push('');

    // Bake
    if (spec.bake) {
      lines.push('# --- bake lighting into a lightmap ---');
      lines.push('scene.render.engine = "CYCLES"');
      lines.push(`scene.cycles.samples = ${pyNumber(spec.bakeSamples, 16)}`);
      lines.push('scene.cycles.device = "CPU"');
      lines.push(`_res = ${pyNumber(spec.bakeResolution, 512)}`);
      lines.push('for _n in _names:');
      lines.push('    _ob = bpy.data.objects[_n]');
      lines.push('    _mat = _ob.data.materials[0]');
      lines.push('    _img = bpy.data.images.new(_n + "_lightmap", _res, _res)');
      lines.push('    _tex = _mat.node_tree.nodes.new("ShaderNodeTexImage")');
      lines.push('    _tex.image = _img');
      lines.push('    _mat.node_tree.nodes.active = _tex');
      lines.push('bpy.ops.object.select_all(action="DESELECT")');
      lines.push('for _n in _names: bpy.data.objects[_n].select_set(True)');
      lines.push('bpy.context.view_layer.objects.active = bpy.data.objects[_names[-1]]');
      lines.push('bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=4)');
      lines.push('_baked = 0');
      lines.push('for _n in _names:');
      lines.push('    _img = bpy.data.images[_n + "_lightmap"]');
      lines.push('    _p = os.path.join(out_dir, _n + "_lightmap.png")');
      lines.push('    _img.filepath_raw = _p; _img.file_format = "PNG"; _img.save()');
      lines.push('    _baked += os.path.getsize(_p)');
      lines.push('print("BAKE_BYTES=%d" % _baked)');
      lines.push('');
    }

    // Export. Draco only pays off on dense meshes — on a low-poly scene it
    // adds decoder weight and can make the file larger, so it is chosen from
    // the real triangle count rather than defaulted on.
    lines.push('# --- export ---');
    lines.push(`_glb = os.path.join(out_dir, ${py(spec.exportName || 'scene.glb')})`);
    lines.push('_tris = sum(len(bpy.data.objects[_n].data.polygons) for _n in _names)');
    if (spec.draco === 'auto') {
      lines.push('_use_draco = _tris > 20000');
    } else {
      lines.push(`_use_draco = ${spec.draco === false ? 'False' : 'True'}`);
    }
    lines.push('bpy.ops.export_scene.gltf(');
    lines.push('    filepath=_glb,');
    lines.push('    export_format="GLB",');
    lines.push('    use_selection=False,');
    lines.push('    export_draco_mesh_compression_enable=_use_draco,');
    lines.push(`    export_draco_mesh_compression_level=${pyNumber(spec.dracoLevel, 6)},`);
    lines.push(')');
    lines.push('print("BLENDER_OK tris=%d glb_bytes=%d draco=%s" % (_tris, os.path.getsize(_glb), _use_draco))');

    return lines.join('\n') + '\n';
  }

  /* The exact argv the engine should run. Keeping this separate from
     buildScript means the script can be written to disk, inspected, or
     re-run by hand. */
  buildArgs(scriptPath, outDir) {
    return ['--background', '--factory-startup', '--python', scriptPath, '--', outDir];
  }

  /* Run a spec through Blender via the execution engine. Returns the
     artifact paths and the parsed stdout markers. */
  async render(spec, { workspace, scriptPath, outDir } = {}) {
    if (!this.engine) throw new Error('BlenderBridge needs an execution engine to run.');
    const fs = require('fs');
    const path = require('path');

    const script = this.buildScript(spec);
    const targetScript = scriptPath || path.join(workspace, 'build_blender.py');
    fs.mkdirSync(path.dirname(targetScript), { recursive: true });
    fs.writeFileSync(targetScript, script);

    const result = await this.engine.runArgs(this.binary, this.buildArgs(targetScript, outDir), {
      cwd: workspace,
      timeoutMs: spec.timeoutMs || 300_000,
    });

    const stdout = result.stdout || '';
    const ok = result.ok && /BLENDER_OK/.test(stdout);
    const glbMatch = stdout.match(/glb_bytes=(\d+)/);
    const triMatch = stdout.match(/tris=(\d+)/);
    const bakeMatch = stdout.match(/BAKE_BYTES=(\d+)/);

    return {
      ok,
      error: ok ? null : (result.error || result.stderr || 'Blender did not report BLENDER_OK'),
      scriptPath: targetScript,
      glbPath: path.join(outDir, spec.exportName || 'scene.glb'),
      glbBytes: glbMatch ? Number(glbMatch[1]) : 0,
      triangles: triMatch ? Number(triMatch[1]) : 0,
      bakeBytes: bakeMatch ? Number(bakeMatch[1]) : 0,
      stdout,
      stderr: result.stderr || '',
    };
  }

  /* Render the capability as prompt text for the coder agents. */
  static toPromptBlock() {
    return [
      'BLENDER (installed, headless)',
      '* Blender 4.2 runs as `blender --background --python <script>`; no GUI, no display.',
      '* Use it to BUILD geometry, BAKE lighting into lightmaps, and EXPORT Draco .glb.',
      '* Baking is the reason to reach for Blender: a baked lightmap removes per-frame',
      '  lighting cost, which is what keeps a WebGL scene at 60fps on mid-range hardware.',
      '* Do not ask Blender for textures — pull those from the CC0 asset sources.',
      '* Blender output is deterministic: same spec, same bytes. Good for repeatable builds.',
    ].join('\n');
  }
}

if (typeof window !== 'undefined') window.BlenderBridge = BlenderBridge;
if (typeof module !== 'undefined' && module.exports) module.exports = { BlenderBridge };
