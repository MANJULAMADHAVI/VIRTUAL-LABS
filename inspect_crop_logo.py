from PIL import Image
import os
path = "logo1.webp"
if not os.path.exists(path):
    raise FileNotFoundError(path)
img = Image.open(path).convert("RGBA")
w, h = img.size
pixels = img.load()
minx, miny = w, h
maxx = maxy = 0
found = False
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if a != 0 and not (r > 245 and g > 245 and b > 245):
            found = True
            minx = min(minx, x)
            miny = min(miny, y)
            maxx = max(maxx, x)
            maxy = max(maxy, y)
if not found:
    raise ValueError('Logo appears blank or fully white')
cropped = img.crop((minx, miny, maxx + 1, maxy + 1))
cropped.save('logo1_cropped.webp')
print('original', (w, h), 'cropped', cropped.size, 'bbox', (minx, miny, maxx, maxy))
