"""
SkillPips Cinematic Intro – Blender 4.0 headless render script
Run: blender -b -P scripts/blender_skillpips_intro.py

Scene (10.5 s / 315 frames @ 30 fps):
  0–90   : Gold particles swirl in dark emerald space
  70–160 : Particles spiral inward toward center
  140–200: Logo plane springs in with gold flash
  195–255: SKILLPIPS text rises from below
  255–315: Final hold – soft glow pulse
"""

import bpy
import math
import random
import os
import subprocess
import sys

random.seed(42)

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
LOGO_PATH   = os.path.join(PROJECT_DIR, "public", "logo.png")
FRAMES_DIR  = "/tmp/blender_frames"
OUTPUT_MP4  = os.path.join(PROJECT_DIR, "public", "skillpips-blender-intro.mp4")

os.makedirs(FRAMES_DIR, exist_ok=True)

# ── Scene ─────────────────────────────────────────────────────────────────────
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end   = 315
scene.render.fps  = 30
scene.render.resolution_x = 1080
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100

scene.render.engine = "BLENDER_EEVEE"
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = os.path.join(FRAMES_DIR, "frame_")

eevee = scene.eevee
eevee.taa_render_samples    = 8     # fast CPU render (~2s/frame)
eevee.use_bloom             = True
eevee.bloom_threshold       = 0.35
eevee.bloom_intensity       = 0.6
eevee.bloom_radius          = 5.0
eevee.bloom_knee            = 0.5
eevee.use_soft_shadows      = False  # skip for speed
eevee.shadow_cube_size      = "512"
eevee.shadow_cascade_size   = "512"
eevee.use_ssr               = False  # skip for speed

# ── Wipe existing objects ─────────────────────────────────────────────────────
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()
for block in list(bpy.data.meshes) + list(bpy.data.materials) + list(bpy.data.images):
    try:
        (bpy.data.meshes if hasattr(block, 'vertices') else
         bpy.data.materials if hasattr(block, 'use_nodes') else
         bpy.data.images).remove(block)
    except Exception:
        pass

# ── World ─────────────────────────────────────────────────────────────────────
world = scene.world or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background") or world.node_tree.nodes.new("ShaderNodeBackground")
bg.inputs[0].default_value = (0.003, 0.008, 0.004, 1.0)   # near-black emerald
bg.inputs[1].default_value = 0.4

# ── Camera ────────────────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 55
cam_data.dof.use_dof = True
cam_data.dof.focus_distance = 9.5
cam_data.dof.aperture_fstop = 3.5
cam_obj = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

cam_obj.location = (0.0, -11.0, 0.0)
cam_obj.rotation_euler = (math.pi / 2, 0.0, 0.0)
cam_obj.keyframe_insert("location", frame=1)
cam_obj.location = (0.0, -9.4, 0.0)      # slow push-in
cam_obj.keyframe_insert("location", frame=315)
for fc in cam_obj.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = "BEZIER"

# ── Helpers ───────────────────────────────────────────────────────────────────
def link(obj):
    scene.collection.objects.link(obj)

def add_area_light(name, loc, energy, color, size=4.0):
    d = bpy.data.lights.new(name, "AREA")
    d.energy, d.color, d.size = energy, color[:3], size
    o = bpy.data.objects.new(name, d)
    o.location = loc
    link(o)
    return o

def smooth_interp(fcurves):
    for fc in fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"

def insert_loc(obj, frame):
    obj.keyframe_insert("location", frame=frame)

def insert_scale(obj, frame):
    obj.keyframe_insert("scale", frame=frame)

# ── Lights ────────────────────────────────────────────────────────────────────
key  = add_area_light("Key",  ( 3.5, -7.0,  6.0), 320, (1.0, 0.88, 0.45))
fill = add_area_light("Fill", (-4.0, -5.0,  2.5), 90,  (0.4, 0.72, 0.48), 7)
rim  = add_area_light("Rim",  ( 0.0,  5.5,  2.0), 450, (1.0, 0.92, 0.5))

# Flash point light – bursts on logo reveal
flash_d = bpy.data.lights.new("Flash", "POINT")
flash_d.energy         = 0
flash_d.color          = (1.0, 0.88, 0.4)
flash_d.shadow_soft_size = 4.0
flash_o = bpy.data.objects.new("Flash", flash_d)
flash_o.location = (0.0, -1.5, 0.0)
link(flash_o)

flash_d.energy = 0;     flash_d.keyframe_insert("energy", frame=1)
flash_d.energy = 0;     flash_d.keyframe_insert("energy", frame=142)
flash_d.energy = 3500;  flash_d.keyframe_insert("energy", frame=152)
flash_d.energy = 800;   flash_d.keyframe_insert("energy", frame=162)
flash_d.energy = 0;     flash_d.keyframe_insert("energy", frame=180)
for fc in flash_d.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = "BEZIER"

# ── Gold emissive material ────────────────────────────────────────────────────
def make_gold_mat(name, base=(0.83, 0.68, 0.21), emit_str=5.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    pbs  = nodes.new("ShaderNodeBsdfPrincipled")
    pbs.inputs["Base Color"].default_value  = (*base, 1)
    pbs.inputs["Metallic"].default_value    = 1.0
    pbs.inputs["Roughness"].default_value   = 0.10
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value    = (1.0, 0.84, 0.28, 1)
    emit.inputs["Strength"].default_value = emit_str
    add  = nodes.new("ShaderNodeAddShader")
    out  = nodes.new("ShaderNodeOutputMaterial")
    links.new(pbs.outputs[0],  add.inputs[0])
    links.new(emit.outputs[0], add.inputs[1])
    links.new(add.outputs[0],  out.inputs[0])
    return mat

gold_mat  = make_gold_mat("GoldParticle", emit_str=7.0)
gold_ring = make_gold_mat("GoldRing",     base=(1.0, 0.9, 0.4), emit_str=12.0)

# ── Particle sphere (instanced object) ───────────────────────────────────────
bpy.ops.mesh.primitive_ico_sphere_add(radius=0.045, subdivisions=2)
psphere = bpy.context.active_object
psphere.name = "ParticleSphere"
psphere.data.materials.append(gold_mat)

# ── Animated particles (explicit keyframes, no bake needed) ──────────────────
N_PARTICLES = 70
SWIRL_END   = 75     # pure swirl ends
CONVERGE_END = 162   # fully converged / hidden

def smoothstep(lo, hi, x):
    t = max(0.0, min(1.0, (x - lo) / (hi - lo)))
    return t * t * (3 - 2 * t)

particle_objs = []
for i in range(N_PARTICLES):
    r0    = random.uniform(3.2, 5.5)
    theta = random.uniform(0, 2 * math.pi)
    phi   = random.uniform(0.15 * math.pi, 0.85 * math.pi)
    omega = random.uniform(0.6, 1.8) * (1 if random.random() > 0.3 else -1)
    wobble_amp   = random.uniform(0.05, 0.18)
    wobble_freq  = random.uniform(1.5, 4.0)
    wobble_phase = random.uniform(0, 2 * math.pi)

    # Shared mesh, per-object transform
    obj = psphere.copy()
    obj.data = psphere.data  # share mesh
    link(obj)
    obj.name = f"P_{i:03d}"
    particle_objs.append(obj)

    # Keyframe every 4 frames
    for f in range(1, 320, 4):
        t = f / 30.0

        conv = smoothstep(SWIRL_END, CONVERGE_END, f)

        # Spiraling position
        th = theta + omega * t * 0.55
        r  = r0 * (1.0 - conv * 0.97)
        ph = phi + conv * 0.4 * math.pi

        x = r * math.sin(ph) * math.cos(th)
        y = r * math.sin(ph) * math.sin(th)
        z = r * math.cos(ph) * (1.0 - conv * 0.6)

        # Organic wobble (decreases as they converge)
        w = wobble_amp * (1 - conv)
        x += w * math.cos(wobble_freq * t + wobble_phase)
        z += w * math.sin(wobble_freq * t + wobble_phase)

        # Scale: 1 → 0 as they arrive
        fade_start = CONVERGE_END - 30
        sc = max(0.0, 1.0 - smoothstep(fade_start, CONVERGE_END, f))

        obj.location = (x, y, z)
        obj.scale    = (sc, sc, sc)
        obj.keyframe_insert("location", frame=f)
        obj.keyframe_insert("scale",    frame=f)

    # Linear interpolation for position (smooth motion without overshooting)
    for fc in obj.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"

# ── Gold energy ring that appears just before logo ────────────────────────────
bpy.ops.mesh.primitive_torus_add(
    major_radius=2.8, minor_radius=0.06,
    major_segments=64, minor_segments=12,
    location=(0, 0, 0),
    rotation=(math.pi / 2, 0, 0),
)
ring = bpy.context.active_object
ring.name = "GoldRing"
ring.data.materials.append(gold_ring)

ring.scale = (0, 0, 0); insert_scale(ring, 1)
ring.scale = (0, 0, 0); insert_scale(ring, 130)
ring.scale = (1.3, 1.3, 1.3); insert_scale(ring, 148)  # expand outward
ring.scale = (0, 0, 0); insert_scale(ring, 168)         # contract / gone
smooth_interp(ring.animation_data.action.fcurves)

# ── Logo plane ────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(
    size=1.0,
    location=(0.0, 0.0, 0.0),
    rotation=(math.pi / 2, 0.0, 0.0),
)
logo_plane = bpy.context.active_object
logo_plane.name = "LogoPlane"

# Logo is square-ish but taller; scale to match
logo_plane.scale = (3.0, 1.0, 3.6)     # (width, depth, height)

# Material: image texture + transparent black removal + emission glow
logo_mat = bpy.data.materials.new("LogoMaterial")
logo_mat.use_nodes    = True
logo_mat.blend_method = "HASHED"
logo_mat.shadow_method = "CLIP"
nodes = logo_mat.node_tree.nodes
links = logo_mat.node_tree.links
nodes.clear()

tex   = nodes.new("ShaderNodeTexImage")
rgb2bw = nodes.new("ShaderNodeRGBToBW")    # luma → alpha mask (remove black bg)
clamp = nodes.new("ShaderNodeMapRange")
pbs   = nodes.new("ShaderNodeBsdfPrincipled")
emit  = nodes.new("ShaderNodeEmission")
add   = nodes.new("ShaderNodeAddShader")
transp = nodes.new("ShaderNodeBsdfTransparent")
mix   = nodes.new("ShaderNodeMixShader")
out   = nodes.new("ShaderNodeOutputMaterial")

# Load logo image
if os.path.exists(LOGO_PATH):
    img = bpy.data.images.load(LOGO_PATH)
    print(f"[blender] Logo loaded: {LOGO_PATH}")
else:
    print(f"[blender] WARNING: {LOGO_PATH} not found — using gold placeholder")
    img = bpy.data.images.new("PlaceholderLogo", 512, 512)
    # fill gold
    img.pixels = [0.83, 0.68, 0.21, 1.0] * (512 * 512)

tex.image = img
tex.extension = "CLIP"

# Use luminance of the image to drive alpha (makes black background transparent)
clamp.inputs["From Min"].default_value = 0.05
clamp.inputs["From Max"].default_value = 0.45
clamp.inputs["To Min"].default_value   = 0.0
clamp.inputs["To Max"].default_value   = 1.0

pbs.inputs["Roughness"].default_value  = 0.08
pbs.inputs["Metallic"].default_value   = 0.15

emit.inputs["Strength"].default_value  = 1.8

links.new(tex.outputs["Color"],   pbs.inputs["Base Color"])
links.new(tex.outputs["Color"],   emit.inputs["Color"])
links.new(tex.outputs["Color"],   rgb2bw.inputs["Color"])
links.new(rgb2bw.outputs["Val"], clamp.inputs["Value"])
links.new(pbs.outputs[0],  add.inputs[0])
links.new(emit.outputs[0], add.inputs[1])
links.new(clamp.outputs["Result"], mix.inputs["Fac"])
links.new(transp.outputs[0], mix.inputs[1])
links.new(add.outputs[0],    mix.inputs[2])
links.new(mix.outputs[0],    out.inputs[0])

logo_plane.data.materials.append(logo_mat)

# ── Logo animation: spring in at frame 145 ────────────────────────────────────
logo_plane.scale = (0, 0, 0); insert_scale(logo_plane, 1)
logo_plane.scale = (0, 0, 0); insert_scale(logo_plane, 143)
logo_plane.scale = (3.3, 1.1, 3.96);  insert_scale(logo_plane, 163)   # overshoot
logo_plane.scale = (2.82, 0.94, 3.38); insert_scale(logo_plane, 177)  # undershoot
logo_plane.scale = (3.0, 1.0, 3.6);   insert_scale(logo_plane, 192)   # settle

# Gentle breathing after settle
logo_plane.scale = (3.03, 1.01, 3.63); insert_scale(logo_plane, 250)
logo_plane.scale = (3.0, 1.0, 3.6);   insert_scale(logo_plane, 315)

smooth_interp(logo_plane.animation_data.action.fcurves)

# ── SKILLPIPS text ────────────────────────────────────────────────────────────
bpy.ops.object.text_add(location=(0.0, -0.01, -2.2), rotation=(math.pi / 2, 0.0, 0.0))
txt_obj = bpy.context.active_object
txt_obj.name = "BrandText"
td = txt_obj.data
td.body        = "SKILLPIPS"
td.align_x     = "CENTER"
td.size        = 0.38
td.space_character = 0.08
td.extrude     = 0.02

# Try to load a serif font
font_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf",
]
for fp in font_candidates:
    if os.path.exists(fp):
        td.font = bpy.data.fonts.load(fp)
        print(f"[blender] Font: {fp}")
        break

gold_txt_mat = make_gold_mat("GoldText", base=(0.95, 0.78, 0.22), emit_str=4.0)
txt_obj.data.materials.append(gold_txt_mat)

# Animate: rise from below + scale in
txt_obj.location.z = -4.0; txt_obj.keyframe_insert("location", frame=1)
txt_obj.location.z = -4.0; txt_obj.keyframe_insert("location", frame=193)
txt_obj.location.z = -2.2; txt_obj.keyframe_insert("location", frame=228)

txt_obj.scale = (0, 0, 0); insert_scale(txt_obj, 193)
txt_obj.scale = (1.05, 1.05, 1.05); insert_scale(txt_obj, 218)
txt_obj.scale = (1.0, 1.0, 1.0);   insert_scale(txt_obj, 230)

smooth_interp(txt_obj.animation_data.action.fcurves)

# ── Thin tagline (optional) ───────────────────────────────────────────────────
bpy.ops.object.text_add(location=(0.0, -0.01, -2.75), rotation=(math.pi / 2, 0.0, 0.0))
tag_obj = bpy.context.active_object
tag_obj.name = "Tagline"
tag_obj.data.body       = "PREMIUM FOREX TRADING"
tag_obj.data.align_x    = "CENTER"
tag_obj.data.size       = 0.14
tag_obj.data.space_character = 0.12
if font_candidates and os.path.exists(font_candidates[0]):
    tag_obj.data.font = td.font

tag_mat = make_gold_mat("GoldTag", base=(0.72, 0.58, 0.18), emit_str=2.0)
tag_obj.data.materials.append(tag_mat)

tag_obj.scale = (0, 0, 0); insert_scale(tag_obj, 230)
tag_obj.scale = (1, 1, 1);  insert_scale(tag_obj, 252)
smooth_interp(tag_obj.animation_data.action.fcurves)

# ── Render ────────────────────────────────────────────────────────────────────
print(f"\n[blender] Rendering {scene.frame_end - scene.frame_start + 1} frames → {FRAMES_DIR}")
bpy.ops.render.render(animation=True)

# ── Encode with ffmpeg ────────────────────────────────────────────────────────
print(f"\n[blender] Encoding → {OUTPUT_MP4}")
ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-framerate", "30",
    "-i", os.path.join(FRAMES_DIR, "frame_%04d.png"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "medium",
    "-crf", "17",
    "-movflags", "+faststart",
    OUTPUT_MP4,
]
subprocess.run(ffmpeg_cmd, check=True)
print(f"\n[blender] Done → {OUTPUT_MP4}")
