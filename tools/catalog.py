import json
import os

catalog_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'catalog')

catalog_content = open(catalog_path, 'r', encoding='utf-8').read()

star_catalog = []

for line in catalog_content.splitlines():
    if line.startswith('#') or not line.strip() or len(line) < 1:
        continue  # Skip comments and empty lines


    # star = {
    #         id: line.substring(0, 4).trim(),
    #         HD: parseInt(line.substring(25, 31).trim()),
    #         name: line.substring(4, 14).trim(),
    #         ra_hrs: parseFloat(line.substring(75, 77).trim()),
    #         ra_min: parseFloat(line.substring(77, 79).trim()),
    #         ra_sec: parseFloat(line.substring(79, 83).trim()),
    #         dec_sign: line.substring(83, 84).trim(),
    #         dec_deg: parseFloat(line.substring(84, 86).trim()),
    #         dec_min: parseFloat(line.substring(86, 88).trim()),
    #         dec_sec: parseFloat(line.substring(88, 90).trim()),
    #         mag: parseFloat(line.substring(102, 107).trim()),
    #     }

    try:

        ra_hrs = float(line[75:77].strip())
        ra_min = float(line[77:79].strip())
        ra_sec = float(line[79:83].strip())

        dec_sign = line[83:84].strip()
        dec_deg = float(line[84:86].strip())
        dec_min = float(line[86:88].strip())
        dec_sec = float(line[88:90].strip())


        star_catalog.append({
            'id': line[0:4].strip(),
            'HD': int(line[25:31].strip()),
            'name': line[4:14].strip(),
            'ra': ra_hrs + ra_min / 60 + ra_sec / 3600,
            'dec': (dec_deg + dec_min / 60 + dec_sec / 3600) * (-1 if dec_sign == '-' else 1),
            'mag': float(line[102:107].strip()),
        })

        
    except ValueError as e:
        print(f"Error parsing line: {line}")
        print(f"Error: {e}")
        continue


with open(os.path.join(os.path.dirname(__file__), '..', 'assets', 'star_catalog.json'), 'w', encoding='utf-8') as f:
    json.dump(star_catalog, f)
