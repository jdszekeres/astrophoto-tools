import json
import os

assets_path = os.path.join(os.path.dirname(__file__), "..", "assets")

# remove unneeded keys from IAU-CSN.json

iau_csn = json.load(open(os.path.join(assets_path, "IAU-CSN.json"), "r", encoding="utf-8"))
new_obj = []
for obj in iau_csn:
    new_obj.append({
        "HD": obj["HD"],
        "Name/Diacritics": obj["Name/Diacritics"],
    })

with open(os.path.join(assets_path, "IAU-CSN.json"), "w") as f:
    json.dump(new_obj, f)

# remove unneeded keys from milky_way.json
milky_way = json.load(open(os.path.join(assets_path, "milkyway.json"), "r", encoding="utf-8"))
new_obj = {"features": []}

for feature in milky_way["features"]:
    geometry = feature["geometry"]
    new_geometry = {"coordinates": geometry["coordinates"]}
    new_obj["features"].append({
        "geometry": new_geometry,
    })

with open(os.path.join(assets_path, "milkyway.json"), "w") as f:
    json.dump(new_obj, f)


