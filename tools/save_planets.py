import os
from PIL import Image

images = os.listdir("celestial")
save_path = os.path.join(os.path.dirname(__file__), "..", "assets", "celestial")

for image in images:
    img = Image.open(os.path.join("celestial", image))
    img = img.convert("RGB")
    for i, pixel in enumerate(img.get_flattened_data()):
        luminance = sum(pixel[:3]) / 3  # type: ignore # Calculate the average of R, G, B channels

        lum_thresh = image == "moon.png" and 70 or 128  # type: ignore # Use a higher threshold for the moon image

        if luminance < lum_thresh:  # If the pixel is dark
            img.putpixel((i % img.width, i // img.width), (0, 0, 0))
    img = img.convert("1")
    img.save(os.path.join(save_path, image.replace(".png", ".webp")), "WEBP", quality=80)

