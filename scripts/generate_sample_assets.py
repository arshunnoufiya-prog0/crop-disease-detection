import os
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLES_DIR = BASE_DIR / "data" / "sample_images"
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

def generate_clear_leaf_early_blight():
    """Generates a realistic synthetic tomato leaf with concentric dark brown target spots."""
    img = Image.new("RGB", (400, 400), color=(34, 120, 45))
    draw = ImageDraw.Draw(img)
    
    # Draw leaf veins
    for i in range(50, 360, 30):
        draw.line([(200, 40), (i, 350)], fill=(20, 95, 35), width=3)
        draw.line([(200, 200), (i, 200 + (i - 200) // 2)], fill=(28, 105, 40), width=2)
    
    # Draw concentric early blight lesion (target rings)
    # Outer yellow halo
    draw.ellipse([140, 140, 270, 270], fill=(185, 175, 45))
    # Outer dark brown necrotic ring
    draw.ellipse([155, 155, 255, 255], fill=(70, 38, 18))
    # Mid ring
    draw.ellipse([170, 170, 240, 240], fill=(110, 65, 30))
    # Inner dark ring
    draw.ellipse([185, 185, 225, 225], fill=(50, 28, 12))
    # Center pinpoint necrosis
    draw.ellipse([200, 200, 210, 210], fill=(30, 15, 8))
    
    # Smaller secondary lesion
    draw.ellipse([260, 90, 310, 140], fill=(170, 160, 40))
    draw.ellipse([270, 100, 300, 130], fill=(65, 35, 15))
    draw.ellipse([280, 110, 290, 120], fill=(40, 20, 10))

    out_path = SAMPLES_DIR / "sample_tomato_early_blight.jpg"
    img.save(out_path, "JPEG", quality=95)
    print(f"Generated {out_path}")

def generate_blurry_leaf():
    """Generates a blurred out-of-focus leaf that triggers the quality gate rejection."""
    img = Image.new("RGB", (400, 400), color=(45, 130, 50))
    draw = ImageDraw.Draw(img)
    draw.ellipse([120, 120, 280, 280], fill=(85, 60, 25))
    
    # Apply severe Gaussian blur multiple times
    for _ in range(5):
        img = img.filter(ImageFilter.GaussianBlur(radius=18))
        
    out_path = SAMPLES_DIR / "sample_blurry_leaf.jpg"
    img.save(out_path, "JPEG", quality=85)
    print(f"Generated {out_path}")

def generate_healthy_leaf():
    """Generates a clean, healthy green leaf."""
    img = Image.new("RGB", (400, 400), color=(40, 145, 52))
    draw = ImageDraw.Draw(img)
    # Leaf venation
    for i in range(60, 350, 25):
        draw.line([(200, 30), (i, 360)], fill=(30, 120, 40), width=3)
        draw.line([(200, 180), (i, 200)], fill=(32, 128, 42), width=2)
        
    out_path = SAMPLES_DIR / "sample_healthy_tomato.jpg"
    img.save(out_path, "JPEG", quality=95)
    print(f"Generated {out_path}")

def generate_corn_rust():
    """Generates a maize leaf with cinnamon-brown rust pustules."""
    img = Image.new("RGB", (400, 400), color=(85, 155, 60))
    draw = ImageDraw.Draw(img)
    # Parallel veins of monocot
    for x in range(20, 380, 15):
        draw.line([(x, 0), (x, 400)], fill=(75, 140, 50), width=1)
        
    # Scattered cinnamon-brown pustules
    np.random.seed(42)
    for _ in range(60):
        rx = np.random.randint(40, 360)
        ry = np.random.randint(40, 360)
        rw = np.random.randint(6, 14)
        rh = np.random.randint(10, 24)
        draw.ellipse([rx, ry, rx + rw, ry + rh], fill=(168, 65, 20), outline=(120, 40, 12))
        
    out_path = SAMPLES_DIR / "sample_corn_common_rust.jpg"
    img.save(out_path, "JPEG", quality=95)
    print(f"Generated {out_path}")

if __name__ == "__main__":
    generate_clear_leaf_early_blight()
    generate_blurry_leaf()
    generate_healthy_leaf()
    generate_corn_rust()
    print("All sample demo images created successfully in data/sample_images/.")
