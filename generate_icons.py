"""Generate icon.png (44x44) and icon@2x.png (88x88) for Colorisation PLAI OnlyOffice plugin."""

from PIL import Image, ImageDraw, ImageFont
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ICONS_DIR = os.path.join(SCRIPT_DIR, "resources", "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

PRIMARY = "#4a90d9"
BG = "#f0f4fa"
WHITE = "#ffffff"


def create_icon(size: int, filename: str):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle background
    margin = max(1, size // 22)
    radius = size // 5
    draw.rounded_rectangle(
        [margin, margin, size - margin - 1, size - margin - 1],
        radius=radius,
        fill=BG,
        outline=PRIMARY,
        width=max(1, size // 22),
    )

    # Draw "Cƨ" text centered
    # Try to find a suitable font; fall back to default
    font_size = int(size * 0.48)
    font = None
    # Try common Windows fonts - use bold for better readability at small sizes
    font_candidates = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
    ]
    for fp in font_candidates:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except Exception:
                continue
    if font is None:
        font = ImageFont.load_default()

    text = "C\u01A8"  # C + reversed S (ƨ)
    # Measure text
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]

    # Draw text with slight shadow for depth
    shadow_offset = max(1, size // 44)
    draw.text((x + shadow_offset, y + shadow_offset), text, fill="#2a5a8a", font=font)
    draw.text((x, y), text, fill=PRIMARY, font=font)

    # Add a small colorful accent bar at bottom to hint at "colorization"
    bar_h = max(2, size // 14)
    bar_y = size - margin - bar_h - max(1, size // 11)
    bar_x_start = size // 4
    bar_x_end = size - size // 4
    bar_w = bar_x_end - bar_x_start
    colors = ["#e74c3c", "#f39c12", "#27ae60", "#4a90d9"]
    seg_w = bar_w / len(colors)
    for i, c in enumerate(colors):
        x0 = bar_x_start + int(i * seg_w)
        x1 = bar_x_start + int((i + 1) * seg_w)
        draw.rounded_rectangle([x0, bar_y, x1, bar_y + bar_h], radius=max(1, bar_h // 2), fill=c)

    out_path = os.path.join(ICONS_DIR, filename)
    img.save(out_path, "PNG")
    print(f"Created {out_path} ({size}x{size})")


create_icon(44, "icon.png")
create_icon(88, "icon@2x.png")
print("Done.")
