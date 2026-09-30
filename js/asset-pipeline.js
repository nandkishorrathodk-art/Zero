/* ============================================================
   ASSET PIPELINE — validate and budget 3D assets before they ship.

   The failure this prevents: generated code references a .glb that does
   not exist, or exists at 8k/40MB, and the page dies at runtime with a
   blank canvas and a console error the user never sees. Checking here
   turns that into a build-time warning with a concrete fix.

   Parses the glTF container directly (GLB header + JSON chunk) so it
   works in Node and the browser without a 3D engine.
   ============================================================ */

const BUDGET = {
  glbKb: 2500,        // a hero model over ~2.5MB stalls first paint
  triangles: 300_000, // beyond this, mid-range GPUs drop frames
  textureKb: 2048,    // per texture, decoded
  totalKb: 6000,      // whole page's 3D payload
};

const DRACO_EXT = 'KHR_draco_mesh_compression';
const KTX2_EXT = 'KHR_texture_basisu';

class AssetPipeline {
  /* Read a .glb from disk and report what it contains. */
  static inspectGlb(buffer) {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    if (buf.length < 20) return { ok: false, error: 'File is too small to be a GLB.' };
    const magic = buf.toString('ascii', 0, 4);
    if (magic !== 'glTF') return { ok: false, error: `Not a GLB (magic "${magic}").` };

    const version = buf.readUInt32LE(4);
    const declaredLength = buf.readUInt32LE(8);
    const jsonLength = buf.readUInt32LE(12);
    const jsonType = buf.toString('ascii', 16, 20);
    if (jsonType !== 'JSON') return { ok: false, error: 'First GLB chunk is not JSON.' };
    if (20 + jsonLength > buf.length) return { ok: false, error: 'GLB JSON chunk is truncated.' };

    let gltf;
    try {
      gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLength));
    } catch (e) {
      return { ok: false, error: `GLB JSON chunk did not parse: ${e.message}` };
    }

    const extensions = gltf.extensionsUsed || [];
    const primitives = (gltf.meshes || []).flatMap((m) => m.primitives || []);
    const triangles = primitives.reduce((sum, p) => {
      const accessor = gltf.accessors?.[p.indices ?? p.attributes?.POSITION];
      return sum + (accessor?.count ? Math.floor(accessor.count / 3) : 0);
    }, 0);

    const images = gltf.images || [];
    const usesKTX2 = extensions.includes(KTX2_EXT) ||
      images.some((img) => (img.mimeType || '').includes('ktx2') || /\.ktx2$/i.test(img.uri || ''));

    return {
      ok: true,
      version,
      generator: gltf.asset?.generator || 'unknown',
      lengthMatches: declaredLength === buf.length,
      bytes: buf.length,
      sizeKb: Math.round(buf.length / 1024),
      meshes: (gltf.meshes || []).length,
      materials: (gltf.materials || []).length,
      images: images.length,
      triangles,
      draco: extensions.includes(DRACO_EXT),
      ktx2: usesKTX2,
      animations: (gltf.animations || []).length,
      extensionsUsed: extensions,
    };
  }

  static inspectFile(filePath) {
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return { ok: false, error: `Asset missing: ${filePath}. Generate it (Blender) or point the code at a real file.` };
    }
    try {
      return AssetPipeline.inspectGlb(fs.readFileSync(filePath));
    } catch (e) {
      return { ok: false, error: `Could not read ${filePath}: ${e.message}` };
    }
  }

  /* Decide whether a set of assets fits the page budget. Returns warnings
     phrased as fixes, not just numbers. */
  static checkBudget(assets = []) {
    const warnings = [];
    const items = [];
    let totalKb = 0;

    for (const asset of assets) {
      const sizeKb = asset.sizeKb || 0;
      totalKb += sizeKb;
      items.push({ name: asset.name || asset.url || 'asset', kind: asset.kind || 'binary', sizeKb });

      if (asset.kind === 'model') {
        if (sizeKb > BUDGET.glbKb) {
          warnings.push(`${asset.name}: ${sizeKb}KB exceeds the ${BUDGET.glbKb}KB model budget — enable Draco, or drop to a lower texture resolution.`);
        }
        if (asset.triangles > BUDGET.triangles) {
          warnings.push(`${asset.name}: ${asset.triangles} triangles exceeds ${BUDGET.triangles} — decimate in Blender before export.`);
        }
        if (!asset.draco) {
          warnings.push(`${asset.name}: geometry is uncompressed — export with Draco (export_draco_mesh_compression_enable=True).`);
        }
        if (asset.images > 0 && !asset.ktx2) {
          warnings.push(`${asset.name}: textures ship as PNG/JPEG — convert to KTX2 for GPU-native upload.`);
        }
      }
      if (asset.kind === 'hdri' && sizeKb > 2048) {
        warnings.push(`${asset.name}: HDRI is ${sizeKb}KB — 1k is usually enough for environment lighting; 2k+ only when the sky is visible.`);
      }
      if (asset.kind === 'texture' && sizeKb > BUDGET.textureKb) {
        warnings.push(`${asset.name}: texture is ${sizeKb}KB — downscale to 1k unless it is the hero surface.`);
      }
    }

    if (totalKb > BUDGET.totalKb) {
      warnings.push(`3D payload is ${totalKb}KB, over the ${BUDGET.totalKb}KB page budget — defer non-hero assets until after first paint.`);
    }

    return { ok: warnings.length === 0, totalKb, items, warnings, budget: BUDGET };
  }

  /* The rules a generated scene should follow so the assets above stay
     cheap at runtime. Fed straight into the coder prompt. */
  static runtimeRules() {
    return [
      'Preload only the hero asset; lazy-load the rest with IntersectionObserver.',
      'Dispose geometries, materials, and textures on teardown (no leaks across route changes).',
      'Cap devicePixelRatio at 2; render at 1x on low-end devices.',
      'Pause the render loop when the canvas is off-screen or the tab is hidden.',
      'Respect prefers-reduced-motion: swap to a static poster, do not just slow the animation.',
      'Use InstancedMesh for repeated geometry instead of cloning meshes.',
    ];
  }

  static toPromptBlock(report) {
    if (!report || !report.warnings?.length) return '';
    return ['ASSET BUDGET WARNINGS', ...report.warnings.map((w) => `* ${w}`)].join('\n');
  }
}

if (typeof window !== 'undefined') window.AssetPipeline = AssetPipeline;
if (typeof module !== 'undefined' && module.exports) module.exports = { AssetPipeline, BUDGET };
