import os
import requests
import pathlib
from PIL import Image
path = os.path.join(pathlib.Path(__file__).parent.resolve(), "..", "assets", "messier")

objects = range(1, 111)

total_filesize = 0

for object in objects:
    url = f"https://astronomy.tools/public/astro_images/messier/m{object}/m{object}_2deg.png"
    response = requests.get(url)
    if response.status_code == 200:
        with open(f"{path}/m{object}_2deg.png", "wb+") as f:
            f.write(response.content)

        image = Image.open(f"{path}/m{object}_2deg.png")
        for i, pixel in enumerate(image.get_flattened_data()):
            luminance = sum(pixel[:3]) / 3  # type: ignore # Calculate the average of R, G, B channels
            if luminance < 128:  # If the pixel is dark
                image.putpixel((i % image.width, i // image.width), (0, 0, 0))
        image = image.convert("1")
        image.save(f"{path}/m{object}_2deg.webp", "WEBP", quality=80)
        os.remove(f"{path}/m{object}_2deg.png")
        total_filesize += os.path.getsize(f"{path}/m{object}_2deg.webp")
    else:
        print(f"Failed to download m{object}_2deg.png: {response.status_code}")

print(f"Total filesize of all images: {total_filesize / (1024 * 1024):.2f} MB")
