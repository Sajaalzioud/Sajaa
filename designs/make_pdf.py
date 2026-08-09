from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from PIL import Image
import os

OUT_DIR = "/home/user/Sajaa/designs"
PDF_PATH = "/home/user/Sajaa/Sajaa-Luxury-Scrub-Collection.pdf"

files = [
    "00-cover.png",
    "01-onyx-prestige.png",
    "02-sage-serenity.png",
    "03-rose-quartz.png",
    "04-midnight-aviator.png",
    "05-ivory-prestige.png",
]

# Match PDF page aspect ratio to the source images (3400 x 4160) for edge-to-edge, full-bleed pages.
img_w, img_h = Image.open(os.path.join(OUT_DIR, files[0])).size
page_w = 1224  # points, ~17in wide at 72dpi equivalent scaled down; keeps file size reasonable
page_h = page_w * img_h / img_w

c = canvas.Canvas(PDF_PATH, pagesize=(page_w, page_h))
for fname in files:
    path = os.path.join(OUT_DIR, fname)
    c.drawImage(path, 0, 0, width=page_w, height=page_h)
    c.showPage()
c.save()

print("Wrote", PDF_PATH)
print("Pages:", len(files))
print("Page size (pt):", page_w, page_h)
