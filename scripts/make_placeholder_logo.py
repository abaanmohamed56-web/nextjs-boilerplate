#!/usr/bin/env python3
"""
Creates a placeholder SkillPips logo PNG that matches the real design's
colour palette and rough layout. Replace public/logo.png with the real
PNG at any time and re-run the Blender render.
"""
from PIL import Image, ImageDraw
import math, os

W, H = 1080, 1080
img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
draw = ImageDraw.Draw(img)

GOLD   = (212, 175, 55, 255)
GOLD_L = (248, 231, 161, 255)
DARK_G = (11, 45, 30, 255)
DARK_R = (90, 20, 20, 255)
BLACK  = (0, 0, 0, 255)

cx, cy = W // 2, H // 2

# ── Shield outline ────────────────────────────────────────────────────────────
shield_pts = []
sw, sh = 380, 460  # half-widths
top_y = cy - 260
bot_y = cy + 200

# left side, right side, bottom point
shield_outline = [
    (cx - sw,     top_y),
    (cx + sw,     top_y),
    (cx + sw,     cy + 60),
    (cx,          bot_y),
    (cx - sw,     cy + 60),
]

# Gold border (thick)
draw.polygon(shield_outline, fill=GOLD)

# Inner shield (slightly smaller)
inset = 14
inner = [
    (cx - sw + inset,  top_y + inset),
    (cx + sw - inset,  top_y + inset),
    (cx + sw - inset,  cy + 55),
    (cx,               bot_y - inset * 1.5),
    (cx - sw + inset,  cy + 55),
]

# Quadrant fill: top-left dark-red, top-right dark-green, bottom-left dark-green, bottom-right dark-red
# Top-left
draw.polygon([
    inner[0],
    (cx, top_y + inset),
    (cx, cy),
    (cx - sw + inset, cy),
    (cx - sw + inset, cy + 55),
    inner[0],  # dummy - just draw two halves
], fill=DARK_R)
draw.polygon([
    inner[0],
    (cx, top_y + inset),
    (cx, cy),
    (cx - sw + inset, cy),
], fill=DARK_R)
# Top-right
draw.polygon([
    (cx, top_y + inset),
    inner[1],
    (cx + sw - inset, cy),
    (cx, cy),
], fill=DARK_G)
# Bottom-left
draw.polygon([
    (cx - sw + inset, cy),
    (cx, cy),
    (cx, cy + 55),
    (cx - sw + inset, cy + 55),
    (cx, int(bot_y - inset * 1.5)),
], fill=DARK_G)
draw.polygon([
    (cx - sw + inset, cy),
    (cx, cy),
    (cx, cy + 55),
    (cx - sw + inset, cy + 55),
], fill=DARK_G)
# Bottom-right
draw.polygon([
    (cx, cy),
    (cx + sw - inset, cy),
    (cx + sw - inset, cy + 55),
    (cx, cy + 55),
], fill=DARK_R)

# Gold cross divider
lw = 6
draw.line([(cx, top_y + inset), (cx, cy + 55)], fill=GOLD, width=lw)
draw.line([(cx - sw + inset, cy), (cx + sw - inset, cy)], fill=GOLD, width=lw)

# ── "S" monogram ─────────────────────────────────────────────────────────────
# Draw a chunky S using arcs
s_cx, s_cy = cx - 14, cy + 5
sr = 90

# Top arc
draw.arc([s_cx - sr, s_cy - sr * 1.2, s_cx + sr, s_cy - sr * 0.1],
          start=180, end=360, fill=GOLD_L, width=28)
# Bottom arc
draw.arc([s_cx - sr, s_cy + sr * 0.1, s_cx + sr, s_cy + sr * 1.2],
          start=0, end=180, fill=GOLD_L, width=28)

# ── Up-arrow (bottom-left quadrant) ──────────────────────────────────────────
ax, ay = cx - 140, cy + 100
draw.line([(ax - 30, ay + 60), (ax + 30, ay - 60)], fill=GOLD, width=7)
draw.polygon([(ax + 30, ay - 60), (ax + 14, ay - 35), (ax + 46, ay - 35)], fill=GOLD)

# ── Candlesticks (bottom-right quadrant) ──────────────────────────────────────
for i, (bully, xoff, bh) in enumerate([
    (False, 100, 55),
    (True,  140, 75),
    (False, 180, 50),
]):
    bx = cx + xoff
    by = cy + 80
    wick_color = GOLD
    body_color = (160, 30, 30, 255)
    draw.line([(bx, by - 30), (bx, by + bh + 20)], fill=wick_color, width=3)
    draw.rectangle([bx - 8, by, bx + 8, by + bh], fill=body_color, outline=GOLD, width=2)

# ── Bear silhouette (top-left) ────────────────────────────────────────────────
# Simplified bear using ellipses
bx, by = cx - 160, top_y + 95
draw.ellipse([bx - 60, by - 20, bx + 60, by + 30], fill=GOLD)   # body
draw.ellipse([bx + 35, by - 52, bx + 80, by - 10], fill=GOLD)    # head
draw.ellipse([bx + 30, by - 72, bx + 50, by - 50], fill=GOLD)    # ear l
draw.ellipse([bx + 58, by - 70, bx + 78, by - 48], fill=GOLD)    # ear r
for lx in [bx - 40, bx - 20, bx + 5, bx + 25]:
    draw.rectangle([lx - 5, by + 28, lx + 5, by + 50], fill=GOLD)

# ── Bull silhouette (top-right) ───────────────────────────────────────────────
bx2, by2 = cx + 145, top_y + 95
draw.ellipse([bx2 - 65, by2 - 20, bx2 + 65, by2 + 30], fill=GOLD)  # body
draw.ellipse([bx2 - 80, by2 - 55, bx2 - 30, by2 - 5], fill=GOLD)   # head
# Horns
draw.line([(bx2 - 75, by2 - 65), (bx2 - 100, by2 - 95)], fill=GOLD, width=7)
draw.line([(bx2 - 45, by2 - 65), (bx2 - 25, by2 - 95)], fill=GOLD, width=7)
for lx in [bx2 - 40, bx2 - 20, bx2 + 5, bx2 + 30]:
    draw.rectangle([lx - 5, by2 + 28, lx + 5, by2 + 50], fill=GOLD)

# ── Ribbon banner ─────────────────────────────────────────────────────────────
rb_y = cy + 165
rb_h = 80
ribbon_pts = [
    (cx - sw + 30, rb_y),
    (cx + sw - 30, rb_y),
    (cx + sw + 10, rb_y + rb_h // 2),
    (cx + sw - 30, rb_y + rb_h),
    (cx - sw + 30, rb_y + rb_h),
    (cx - sw - 10, rb_y + rb_h // 2),
]
draw.polygon(ribbon_pts, fill=DARK_G, outline=GOLD)
draw.line([(cx - sw + 30, rb_y), (cx + sw - 30, rb_y)], fill=GOLD, width=3)
draw.line([(cx - sw + 30, rb_y + rb_h), (cx + sw - 30, rb_y + rb_h)], fill=GOLD, width=3)

# SKILLPIPS text in ribbon  (use default font, large enough)
try:
    from PIL import ImageFont
    fnt = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 58)
except Exception:
    fnt = ImageFont.load_default()

txt = "SKILLPIPS"
bbox = draw.textbbox((0, 0), txt, font=fnt)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
draw.text((cx - tw // 2, rb_y + (rb_h - th) // 2 - 3), txt, fill=GOLD_L, font=fnt)

# Save
out = os.path.join(os.path.dirname(__file__), "..", "public", "logo.png")
img.save(out, "PNG")
print(f"Placeholder logo saved → {out}")
