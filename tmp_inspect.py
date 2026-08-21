from PIL import Image
import os
path = "logo1.webp"
print("exists", os.path.exists(path))
img = Image.open(path).convert("RGBA")
print("size", img.size)
pixels = img.load()
w,h = img.size
minx=w; miny=h; maxx=0; maxy=0; found=False
for y in range(h):
    for x in range(w):
        r,g,b,a = pixels[x,y]
        if a!=0 and not (r>245 and g>245 and b>245):
            found=True
            minx=min(minx,x)
            miny=min(miny,y)
            maxx=max(maxx,x)
            maxy=max(maxy,y)
if found:
    print("bbox", minx, miny, maxx, maxy, "cropped", (maxx-minx+1, maxy-miny+1))
else:
    print("nothing but white")
