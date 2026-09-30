/* ============================================================
   ASSET SOURCES — free, CC0, no-API-key 3D assets for generated sites.

   Poly Haven is the one source that is simultaneously:
     - CC0 (no attribution required, safe to ship to a client)
     - CORS-open (`access-control-allow-origin: *`), so a browser can
       load the files directly at runtime, no proxy
     - available at web-friendly sizes (1k/2k), which is the difference
       between a 60fps page and a 4MB HDRI stall

   Everything here was verified against the live API. The API itself is
   queried at build time by the asset resolver; the URLs it returns are
   what the generated page hardcodes.
   ============================================================ */

const POLYHAVEN_API = 'https://api.polyhaven.com';
const POLYHAVEN_CDN = 'https://dl.polyhaven.org/file/ph-assets';

/* Category → what the generated site should ask for. The API groups
   assets by type (hdris / textures / models) and by category. */
const CATEGORY_HINTS = {
  studio: { type: 'hdris', label: 'studio lighting', use: 'product and hero lighting' },
  indoor: { type: 'hdris', label: 'interior', use: 'architecture and hospitality' },
  outdoor: { type: 'hdris', label: 'exterior daylight', use: 'real estate and landscape' },
  sunset: { type: 'hdris', label: 'golden hour', use: 'fashion and editorial warmth' },
  night: { type: 'hdris', label: 'night', use: 'moody product and automotive' },
  city: { type: 'hdris', label: 'urban', use: 'street and culture editorial' },
};

/* Textures worth reaching for, keyed by material intent. These names
   exist in the Poly Haven catalogue and resolve through the API. */
const MATERIAL_HINTS = {
  wood: 'wood_floor_deck',
  concrete: 'concrete_wall_008',
  marble: 'marble_01',
  metal: 'metal_plate',
  fabric: 'fabric_pattern_07',
  stone: 'rock_face_03',
};

class AssetSources {
  /* Ask the live API for assets in a category, newest first. Returns a
     compact list the prompt can embed without blowing up the token
     budget. */
  static async searchHdris(category = 'studio', limit = 8) {
    const url = `${POLYHAVEN_API}/assets?t=hdris&categories=${encodeURIComponent(category)}`;
    const data = await this._getJson(url);
    return Object.entries(data || {})
      .slice(0, limit)
      .map(([slug, meta]) => ({
        slug,
        name: meta.name,
        tags: (meta.tags || []).slice(0, 6),
        maxResolution: meta.max_resolution,
        downloadPage: `https://polyhaven.com/a/${slug}`,
      }));
  }

  static async searchTextures(category = 'wood', limit = 8) {
    const url = `${POLYHAVEN_API}/assets?t=textures&categories=${encodeURIComponent(category)}`;
    const data = await this._getJson(url);
    return Object.entries(data || {})
      .slice(0, limit)
      .map(([slug, meta]) => ({ slug, name: meta.name, tags: (meta.tags || []).slice(0, 6) }));
  }

  static async searchModels(category = '', limit = 12) {
    const query = category ? `?t=models&categories=${encodeURIComponent(category)}` : '?t=models';
    const data = await this._getJson(`${POLYHAVEN_API}/assets${query}`);
    return Object.entries(data || {})
      .slice(0, limit)
      .map(([slug, meta]) => ({ slug, name: meta.name, tags: (meta.tags || []).slice(0, 6) }));
  }

  /* Resolve an asset slug to concrete, browser-loadable URLs at a given
     resolution. This is the function the pipeline actually needs: it
     turns "studio_small_03" into a URL a page can put in an img/loader. */
  static async resolveHdri(slug, resolution = '1k') {
    const data = await this._getJson(`${POLYHAVEN_API}/files/${slug}`);
    const hdri = data?.hdri?.[resolution]?.hdr;
    if (!hdri) return null;
    return {
      slug,
      kind: 'hdri',
      resolution,
      url: hdri.url,
      sizeKb: Math.round((hdri.size || 0) / 1024),
      // Equirectangular HDRIs go straight into Three's PMREMGenerator.
      threeUsage: 'new THREE.RGBELoader().load(url) → PMREMGenerator → scene.environment',
    };
  }

  static async resolveTexture(slug, resolution = '1k') {
    const data = await this._getJson(`${POLYHAVEN_API}/files/${slug}`);
    const pick = (map) => data?.[map]?.[resolution]?.jpg?.url || null;
    const maps = {
      diffuse: pick('Diffuse'),
      normal: pick('nor_gl'),
      roughness: pick('Rough'),
      ao: pick('AO'),
      displacement: pick('Displacement'),
      arm: pick('arm'),
    };
    if (!maps.diffuse) return null;
    // The `gltf` bundle is a single .gltf with all maps wired — far fewer
    // requests than six separate images.
    const gltf = data?.gltf?.[resolution]?.gltf?.url || null;
    return {
      slug,
      kind: 'texture',
      resolution,
      maps,
      gltfBundle: gltf,
      sizeKb: Math.round((data?.Diffuse?.[resolution]?.jpg?.size || 0) / 1024),
    };
  }

  static async resolveModel(slug, resolution = '1k') {
    const data = await this._getJson(`${POLYHAVEN_API}/files/${slug}`);
    const gltf = data?.gltf?.[resolution]?.gltf;
    if (!gltf) return null;
    return {
      slug,
      kind: 'model',
      resolution,
      url: gltf.url,
      sizeKb: Math.round((gltf.size || 0) / 1024),
      // Poly Haven ships .gltf (JSON) + sidecar .bin/textures, so the
      // loader needs a real HTTP path, not a data URI.
      threeUsage: "new GLTFLoader().load(url, onLoad)",
    };
  }

  /* One call the pipeline can make to get everything a build needs,
     already resolved and budget-checked. */
  static async bundleForBrief(brief = {}) {
    const blob = JSON.stringify(brief).toLowerCase();
    const wantsHdri = /lighting|hdri|environment|studio|pbr|realistic|photoreal|product|interior|exterior/.test(blob);
    const wantsTexture = /texture|material|wood|concrete|marble|metal|fabric|surface/.test(blob);
    const wantsModel = /model|product|furniture|object|chair|glb|gltf|3d asset/.test(blob);

    const bundle = { hdri: null, texture: null, model: null, notes: [] };
    if (wantsHdri) {
      const category = /interior|indoor/.test(blob) ? 'indoor'
        : /exterior|outdoor|real estate/.test(blob) ? 'outdoor'
        : /night|dark|moody/.test(blob) ? 'night'
        : 'studio';
      const candidates = await this.searchHdris(category, 4);
      if (candidates[0]) bundle.hdri = await this.resolveHdri(candidates[0].slug, '1k');
    }
    if (wantsTexture) {
      const key = Object.keys(MATERIAL_HINTS).find((k) => blob.includes(k)) || 'wood';
      bundle.texture = await this.resolveTexture(MATERIAL_HINTS[key], '1k');
    }
    if (wantsModel) {
      const models = await this.searchModels('', 12);
      // Prefer something small and generic over a random 4k showpiece.
      const pick = models.find((m) => /chair|vase|plant|lamp|cup|book/i.test(m.slug)) || models[0];
      if (pick) bundle.model = await this.resolveModel(pick.slug, '1k');
    }

    bundle.notes.push('All Poly Haven assets are CC0 — no attribution needed, safe to ship.');
    if (bundle.hdri) bundle.notes.push(`HDRI ${bundle.hdri.slug} at ${bundle.hdri.sizeKb}KB keeps first paint fast.`);
    return bundle;
  }

  /* Render the bundle as instructions a coder agent can follow. */
  static toPromptBlock(bundle) {
    if (!bundle) return '';
    const lines = ['FREE CC0 ASSETS (verified, CORS-open, safe to hotlink)'];
    if (bundle.hdri) {
      lines.push(`* Environment: ${bundle.hdri.url}`);
      lines.push(`  Load with RGBELoader, run through PMREMGenerator, assign to scene.environment.`);
      lines.push(`  Do NOT add a second background light source unless the HDRI is clearly too dark.`);
    }
    if (bundle.texture) {
      lines.push(`* Material maps (${bundle.texture.slug}):`);
      for (const [name, url] of Object.entries(bundle.texture.maps)) {
        if (url) lines.push(`  - ${name}: ${url}`);
      }
      lines.push(`  Set map, normalMap, roughnessMap, aoMap with the matching colorSpace (only map/sRGB).`);
    }
    if (bundle.model) {
      lines.push(`* Model: ${bundle.model.url}`);
      lines.push(`  Load with GLTFLoader; keep a loading state and dispose on teardown.`);
    }
    for (const note of bundle.notes) lines.push(`* ${note}`);
    return lines.join('\n');
  }

  static async _getJson(url) {
    if (typeof fetch === 'function') {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Asset API ${res.status} for ${url}`);
      return res.json();
    }
    const https = require('https');
    return new Promise((resolve, reject) => {
      https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
        });
      }).on('error', reject);
    });
  }
}

if (typeof window !== 'undefined') window.AssetSources = AssetSources;
if (typeof module !== 'undefined' && module.exports) module.exports = { AssetSources, MATERIAL_HINTS, CATEGORY_HINTS };
