import os
import requests
import pathlib
from PIL import Image
path = os.path.join(pathlib.Path(__file__).parent.resolve(), "..", "assets", "messier")

objects = range(1, 111)

for object in objects:
    url = f"https://astronomy.tools/public/astro_images/messier/m{object}/m{object}_2deg.png"
    response = requests.get(url)
    if response.status_code == 200:
        with open(f"{path}/m{object}_2deg.png", "wb+") as f:
            f.write(response.content)

        image = Image.open(f"{path}/m{object}_2deg.png")
        image = image.convert("RGB")
        image.save(f"{path}/m{object}_2deg.webp", "WEBP", quality=80)
        os.remove(f"{path}/m{object}_2deg.png")
    else:
        print(f"Failed to download m{object}_2deg.png: {response.status_code}")