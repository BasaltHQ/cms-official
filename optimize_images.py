import os
from PIL import Image

def optimize_images(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')) and 'member' in file:
                filepath = os.path.join(root, file)
                size_mb = os.path.getsize(filepath) / (1024 * 1024)
                
                if size_mb > 1:
                    print(f"Optimizing {file} ({size_mb:.2f} MB)...")
                    try:
                        with Image.open(filepath) as img:
                            # Resize if too large (max 1200px width for team members is plenty)
                            if img.width > 1200:
                                ratio = 1200 / img.width
                                new_height = int(img.height * ratio)
                                img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
                            
                            # Save as optimized PNG (or convert to WebP/JPG if preferred, but keeping PNG for transparency safety)
                            # Actually, for team members with potentially transparent backgrounds, PNG is needed.
                            # But we can optimize the PNG.
                            img.save(filepath, "PNG", optimize=True, quality=80)
                            
                            new_size = os.path.getsize(filepath) / (1024 * 1024)
                            print(f"  -> Reduced to {new_size:.2f} MB")
                    except Exception as e:
                        print(f"  Failed: {e}")

optimize_images("public/images/team")
