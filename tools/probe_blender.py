"""Prove Blender can run headless, build geometry, and export Draco glTF."""
import bpy, sys, os, math

out_dir = sys.argv[-1]
os.makedirs(out_dir, exist_ok=True)

# clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# procedural geometry
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.0)
obj = bpy.context.active_object
obj.name = "Hero"

# a material so the export carries something real
mat = bpy.data.materials.new("HeroMat")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.98, 0.81, 0.90, 1.0)
bsdf.inputs["Metallic"].default_value = 0.4
bsdf.inputs["Roughness"].default_value = 0.25
obj.data.materials.append(mat)

# a light + camera so the .blend is meaningful
bpy.ops.object.light_add(type="AREA", location=(3, -3, 5))
bpy.ops.object.camera_add(location=(0, -4, 1.5), rotation=(math.radians(80), 0, 0))

glb = os.path.join(out_dir, "hero.glb")
bpy.ops.export_scene.gltf(
    filepath=glb,
    export_format="GLB",
    use_selection=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)

tris = len(obj.data.polygons)
print("BLENDER_OK tris=%d glb_bytes=%d" % (tris, os.path.getsize(glb)))
