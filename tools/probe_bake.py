"""Prove Blender can bake lighting into a texture headlessly (Cycles)."""
import bpy, sys, os, math

out_dir = sys.argv[-1]
os.makedirs(out_dir, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 8
scene.cycles.device = "CPU"

bpy.ops.mesh.primitive_plane_add(size=2)
floor = bpy.context.active_object
floor.name = "Floor"

bpy.ops.mesh.primitive_cube_add(size=0.6, location=(0, 0, 0.3))
box = bpy.context.active_object
box.name = "Box"

bpy.ops.object.light_add(type="AREA", location=(2, -2, 3))
bpy.context.active_object.data.energy = 500

# Bake requires an image node on each material
for ob in (floor, box):
    mat = bpy.data.materials.new(ob.name + "Mat")
    mat.use_nodes = True
    nt = mat.node_tree
    img = bpy.data.images.new(ob.name + "_bake", 256, 256)
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    nt.nodes.active = tex
    ob.data.materials.append(mat)

bpy.ops.object.select_all(action="DESELECT")
for ob in (floor, box):
    ob.select_set(True)
bpy.context.view_layer.objects.active = box

bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=4)

saved = 0
for ob in (floor, box):
    img = ob.data.materials[0].node_tree.nodes["Image Texture"].image
    p = os.path.join(out_dir, ob.name + "_lightmap.png")
    img.filepath_raw = p
    img.file_format = "PNG"
    img.save()
    saved += os.path.getsize(p)

print("BAKE_OK files=2 bytes=%d" % saved)
