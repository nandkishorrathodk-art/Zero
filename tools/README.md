# Local toolchain

## Blender 4.2 LTS (headless)

Blender is not vendored — it is a ~1.3GB download, so `tools/blender-*/` is
gitignored and installed on demand. `js/blender-bridge.js` finds it via
`BLENDER_BIN`, then PATH, then `tools/blender-4.2.0-linux-x64/blender`.

Install:

```sh
cd tools
curl -L -o blender.tar.xz \
  https://download.blender.org/release/Blender4.2/blender-4.2.0-linux-x64.tar.xz
tar -xf blender.tar.xz && rm blender.tar.xz
```

Verify the install (builds geometry, bakes a lightmap, exports a .glb):

```sh
./blender-4.2.0-linux-x64/blender --background --factory-startup \
  --python probe_blender.py -- /tmp/probe-out
```

Expect `BLENDER_OK tris=... glb_bytes=...` and a `scene.glb` in the output
directory. `probe_bake.py` does the same for the lighting bake and prints
`BAKE_OK files=... bytes=...`.

No display or GPU is required — Blender runs as a plain background process, so
the same command works in CI and in a container.
