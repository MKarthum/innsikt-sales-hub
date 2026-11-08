#!/usr/bin/env python3
"""Independent second recipe proving the reusable illustration production path.

Input: the existing insight-value-chain slide in docs/data/slides.json.
Layout: four-stage value flow, deliberately not a clone of context-platforms.
Shared panel, stroke, arrow and text geometry: illustration_kit.py.
"""
import json
import math
import os
import pathlib
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from illustration_kit import panel, stroke, bezier, rgba, wrap

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.getenv("PRESENTATION_IMAGE_OUTPUT",str(ROOT/"media/illustrations/input-rich-image.png")))
slide=next(x for x in json.loads((ROOT/"docs/data/slides.json").read_text())["items"]
           if x["id"]=="insight-value-chain")
v=slide["visual"]
assert len(v["stages"])==4 and len(v["guardrails"])==3
assert all(x.get("title") and x.get("detail") and x.get("assetId") for x in v["stages"])
W,H=1600,900
BG=(7,21,39)
WHITE=(243,249,253)
MUTED=(190,209,225)
CYAN=(86,220,222)
BLUE=(115,184,251)
PURPLE=(173,151,253)
MINT=(158,245,204)
COLORS=[CYAN,BLUE,PURPLE,MINT]

def font(size,bold=False):
    env="PRESENTATION_FONT_BOLD" if bold else "PRESENTATION_FONT_REGULAR"
    fallbacks=[
      os.environ.get(env,""),
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
      "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
      "/root/pw-libs/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/root/pw-libs/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in fallbacks:
        try:
            return ImageFont.truetype(p,size)
        except OSError:pass
    raise FileNotFoundError("Set presentation fonts before building images")

image=Image.new("RGBA",(W,H),rgba(BG))
bd=ImageDraw.Draw(image)
for y in range(H):
    t=y/H
    bd.line((0,y,W,y),fill=(round(7+8*t),round(21+19*t),round(39+28*t),255),width=1)
# Low-contrast luminous fields support the process, not the factual labels.
ambient=Image.new("RGBA",(W,H),(0,0,0,0))
ad=ImageDraw.Draw(ambient)
for x,y,r,color in [(310,462,280,CYAN),(1110,388,340,PURPLE),(1470,728,250,MINT)]:
    ad.ellipse((x-r,y-r,x+r,y+r),fill=rgba(color,36))
image.alpha_composite(ambient.filter(ImageFilter.GaussianBlur(125)))
stars=Image.new("RGBA",(W,H),(0,0,0,0))
sd=ImageDraw.Draw(stars)
rng=random.Random(1707)
for _ in range(95):
    x,y=rng.randrange(45,W-50),rng.randrange(250,840)
    sd.ellipse((x,y,x+2,y+2),fill=rgba((155,209,240),rng.randint(25,70)))
image.alpha_composite(stars)
draw=ImageDraw.Draw(image)
def label(x,y,value,size=22,bold=False,color=WHITE,anchor=None):
    draw.text((x,y),str(value),font=font(size,bold),fill=rgba(color),anchor=anchor)
def paragraph(x,y,value,width,size=18,color=MUTED,limit=2,leading=1.38,bold=False):
    f=font(size,bold)
    parts=wrap(draw,value,f,width,limit)
    for j,line in enumerate(parts):
        label(x,y+int(j*size*leading),line,size,bold=bold,color=color)
def icon(asset_id,x,y,color):
    # Meaningful glyphs are selected by registered assetId, never index.
    ink=rgba(color,240)
    def line(coords,w=3):draw.line(coords,fill=ink,width=w,joint="curve")
    def circle(box,w=3):draw.ellipse(box,outline=ink,width=w)
    if asset_id=="core-storage":
        for h in (0,15,30):
            draw.ellipse((x,y+h,x+48,y+h+16),outline=ink,width=3)
        line([(x,y+8),(x,y+40)])
        line([(x+48,y+8),(x+48,y+40)])
    elif asset_id=="core-transform":
        for yy in (10,34):
            circle((x,y+yy,x+12,y+yy+12))
            circle((x+37,y+yy,x+49,y+yy+12))
        line([(x+12,y+16),(x+26,y+16),(x+26,y+40),(x+37,y+40)])
        line([(x+12,y+40),(x+19,y+40),(x+19,y+16),(x+37,y+16)])
    elif asset_id=="verified-analysis":
        for j,height in enumerate((22,38,29)):
            draw.rounded_rectangle((x+j*16,y+46-height,x+11+j*16,y+46),radius=3,outline=ink,width=3)
        line([(x,y+49),(x+49,y+49)],2)
        line([(x+2,y+16),(x+22,y+5),(x+38,y+11)],2)
    elif asset_id=="ai-agent":
        draw.rounded_rectangle((x+5,y+10,x+45,y+43),radius=9,outline=ink,width=3)
        line([(x+25,y+10),(x+25,y+2)],3)
        circle((x+21,y-1,x+29,y+7),2)
        for xx in (17,33):
            draw.ellipse((x+xx-3,y+23,x+xx+3,y+29),fill=ink)
        draw.arc((x+16,y+24,x+34,y+38),0,180,fill=ink,width=2)
    else:
        raise ValueError("Missing visual glyph for canonical assetId "+asset_id)

# Header
draw.rounded_rectangle((70,51,124,58),radius=3,fill=rgba(CYAN))
label(144,42,slide["cue"].upper(),19,True,(172,237,233))
label(70,87,slide["title"],45,True)
paragraph(73,160,v["subtitle"],1410,21,(208,227,240),limit=1)

# Start -> outcome; the main directional relationship is unambiguous.
panel(image,(85,235,694,333),fill=(20,53,77),outline=(124,197,215),alpha=228,radius=20)
panel(image,(906,235,1515,333),fill=(32,53,80),outline=(188,172,242),alpha=230,radius=20)
draw=ImageDraw.Draw(image)
label(110,251,v["inputLabel"],15,True,CYAN)
label(110,278,v["input"],23,True)
label(931,251,v["outputLabel"],15,True,PURPLE)
paragraph(931,276,v["output"],550,23,WHITE,limit=2,leading=1.2)
stroke(image,[(694,286),(906,286)],CYAN,3.2,arrow=True,glow=True)

# A single directional process: four visually distinct stages with two-line
# descriptions. No fabricated mapping from a specific source to a specific use.
xs=(83,450,817,1184)
cy=383
stroke(image,[(166,cy),(1455,cy)],(112,181,213),2.2,alpha=155)
for i,stage in enumerate(v["stages"]):
    x=xs[i]
    accent=COLORS[i]
    panel(image,(x,415,x+333,684),fill=(17,39,65),outline=accent,alpha=242,
          radius=20,stroke_width=1.35,shadow=accent)
    draw=ImageDraw.Draw(image)
    label(x+22,445,str(i+1).zfill(2),23,True,accent)
    icon(stage["assetId"],x+254,442,accent)
    # Meaningful title and detail are not duplicated outside canonical JSON.
    paragraph(x+22,522,stage["title"],287,19,WHITE,limit=2,leading=1.28,bold=True)
    paragraph(x+22,591,stage["detail"],287,17,(209,225,240),limit=2)
    draw.ellipse((x+162-8,cy-8,x+162+8,cy+8),fill=rgba(accent))
    stroke(image,[(x+162,cy+9),(x+162,415)],accent,2.3,alpha=216)
    if i<3:
        stroke(image,[(x+333,554),(xs[i+1]-4,554)],(146,222,228),3.0,arrow=True,glow=False)
draw=ImageDraw.Draw(image)

# Cross-cutting capabilities are a foundation, not a fifth process step.
panel(image,(83,728,1517,813),fill=(11,35,57),outline=(121,178,204),alpha=237,
      radius=18,stroke_width=1.2)
draw=ImageDraw.Draw(image)
label(107,743,v["foundationLabel"],15,True,CYAN)
for i,name in enumerate(v["guardrails"]):
    x=320+i*393
    draw.ellipse((x,762,x+13,775),fill=rgba(COLORS[min(i,3)]))
    label(x+26,754,name,18,True)
paragraph(92,840,v["conclusion"],1420,17,(208,225,238),limit=2)
OUT.parent.mkdir(parents=True,exist_ok=True)
image.convert("RGB").save(OUT,"PNG",optimize=True)
print(OUT)
