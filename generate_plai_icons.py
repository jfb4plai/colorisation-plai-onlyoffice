"""Generate PLAI plugin icons for OnlyOffice."""
from PIL import Image, ImageDraw, ImageFont
import os

DST = os.path.join(os.path.dirname(__file__), "resources", "icons")

def create_icon(size, path):
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    margin = max(1, size // 20)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 6,
        fill=(255, 255, 255, 245),
        outline=(200, 200, 200, 255),
        width=max(1, size // 40)
    )

    pink = (233, 30, 144)
    black = (30, 30, 30)
    grey = (120, 120, 120)

    font_size = int(size * 0.34)
    font_small = int(size * 0.16)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", font_size)
        font_s = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", font_small)
    except Exception:
        font = ImageFont.load_default()
        font_s = font

    # Colored bars at top (mini colorization preview)
    bar_h = max(2, size // 12)
    bar_y = int(size * 0.14)
    bar_w = int(size * 0.14)
    gap = max(1, size // 30)
    start_x = int(size * 0.16)
    for i, c in enumerate([pink, black, pink, black]):
        x = start_x + i * (bar_w + gap)
        draw.rounded_rectangle(
            [x, bar_y, x + bar_w, bar_y + bar_h],
            radius=max(1, bar_h // 3),
            fill=c
        )

    # 'PLAI' text: P=black, L=black, A=pink, I=black (matching the logo)
    text = "PLAI"
    letter_colors = [black, black, pink, black]

    # Calculate total width for centering
    total_w = 0
    spacing = max(0, size // 60)
    for ch in text:
        bb = draw.textbbox((0, 0), ch, font=font)
        total_w += bb[2] - bb[0] + spacing
    total_w -= spacing

    tx = (size - total_w) // 2
    ty = int(size * 0.30)

    for i, ch in enumerate(text):
        bb = draw.textbbox((0, 0), ch, font=font)
        draw.text((tx, ty), ch, fill=letter_colors[i], font=font)
        tx += bb[2] - bb[0] + spacing

    # Small "Color" at bottom
    sub = "Color"
    sbbox = draw.textbbox((0, 0), sub, font=font_s)
    sw = sbbox[2] - sbbox[0]
    sx = (size - sw) // 2
    sy = int(size * 0.73)
    draw.text((sx, sy), sub, fill=grey, font=font_s)

    img.save(path, "PNG")
    print(f"Created {path} ({size}x{size})")


os.makedirs(DST, exist_ok=True)
create_icon(40, os.path.join(DST, "icon.png"))
create_icon(80, os.path.join(DST, "icon@2x.png"))
print("Done!")
