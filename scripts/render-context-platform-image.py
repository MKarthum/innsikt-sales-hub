#!/usr/bin/env python3
"""Offline authoring recipe: ONE finished image from canonical slide data.
This is not a browser/CSS renderer. It can be replaced by a designer's image
through the normal import/approval pipeline without changing the slide model.
"""
import json, math, os, pathlib, random, re, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs/data/slides.json"
OUT = ROOT / "media/illustrations/input-rich-image.png"
slide = next(s for s in json.loads(SOURCE.read_text())["items"] if s["id"] == "ai-context-platforms-2027")
v = slide["visual"]
# A changed canonical graph must not silently produce a beautiful but incorrect image.
assert all(len(v[k])==3 for k in ("consumers", "facets", "sources", "cycle", "outcomes"))
edge_pattern = re.compile(r"^([a-z0-9:-]+)\s+-->\s+([a-z0-9:-]+)\s+:\s+([a-z-]+)\s+\[([a-z0-9-]+)\]$")
actual = set()
for line in v["graph"]["source"].splitlines():
    line=line.strip()
    if not line or line.startswith("#"):continue
    match = edge_pattern.match(line)
    if not match:raise ValueError("Ukjent relasjonsformat: " + line)
    actual.add((match.group(1), match.group(2)))
required = {(f"sources:{i}", "context") for i in range(3)} | {( "context",f"consumers:{i}") for i in range(3)} | {("context","cycle:0"),("cycle:0","cycle:1"),("cycle:1","cycle:2"),("cycle:2","context")}
if actual != required:raise ValueError("Endret faglig graf krever ny visuell kvalitetssikring")
W,H = 1600,900
def font(size,bold=False):
    paths = [os.environ.get("PRESENTATION_FONT_BOLD" if bold else "PRESENTATION_FONT_REGULAR",""),
             "/root/pw-libs/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/root/pw-libs/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
             "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
             "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"]
    for p in paths:
        try:return ImageFont.truetype(p,size)
        except OSError: pass
    raise FileNotFoundError("DejaVu Sans-font mangler. Angi PRESENTATION_FONT_REGULAR og PRESENTATION_FONT_BOLD")
NAVY=(4,19,38); LIGHT=(243,249,255); MINT=(163,255,246); CYAN=(83,235,244); LAV=(208,158,255)
image=Image.new("RGBA",(W,H),NAVY+(255,))
# One genuinely produced mountain landscape: existing licensed original master.
landscape=Image.open(ROOT/"media/masters/context-rich-background.webp").convert("RGB")
landscape=landscape.resize((W,H),Image.Resampling.LANCZOS)
image.alpha_composite(landscape.convert("RGBA"))
shade=Image.new("RGBA",(W,H));sd=ImageDraw.Draw(shade)
for y in range(H):
    s=(y/H)**1.7
    sd.line((0,y,W,y),fill=(5,12,35,round(16+70*s)),width=1)
for x in range(1150):
    sd.line((x,0,x,H),fill=(2,13,34,round(35*(1-x/1150))),width=1)
image.alpha_composite(shade)
# Magenta evening atmosphere; distant top right landscape deliberately remains visible.
aura=Image.new("RGBA",(W,H))
ad=ImageDraw.Draw(aura)
for radius in range(370,0,-3):
    strength=int(17*(1-radius/370)**1.5)
    ad.ellipse((1440-radius,110-radius*.55,1440+radius,110+radius*.55),fill=(184,82,224,strength))
image.alpha_composite(aura)
def layer():return Image.new("RGBA",(W,H),(0,0,0,0))
def rgba(color,alpha):return tuple(color[:3])+(alpha,)
def txt(draw,x,y,value,size=20,bold=False,color=LIGHT,anchor=None,spacing=5):
    draw.text((x,y),str(value),font=font(size,bold),fill=rgba(color,255),anchor=anchor,spacing=spacing,
              stroke_width=0)
def wrapped(draw,x,y,text,width,size,color=LIGHT,bold=False,max_lines=2,line=1.22):
    words=str(text).split();lines=[];buf=""
    for word in words:
        check=(buf+" "+word).strip()
        if buf and draw.textbbox((0,0),check,font=font(size,bold))[2]>width:
            lines.append(buf);buf=word
        else:buf=check
    if buf:lines.append(buf)
    for n,l in enumerate(lines[:max_lines]):txt(draw,x,y+n*int(size*line),l,size,bold,color)
def soft_glow(visual,blur=20,opacity=1):
    global image
    halo=visual.filter(ImageFilter.GaussianBlur(blur))
    if opacity<1:
        halo.putalpha(halo.getchannel("A").point(lambda n:int(n*opacity)))
    image.alpha_composite(halo)
    image.alpha_composite(visual)
def rounded(x0,y0,x1,y1,outline=(174,227,249),fill=(16,45,70),opacity=210,r=24,width=2,glow=None):
    if glow:
        glowlayer=layer();g=ImageDraw.Draw(glowlayer)
        g.rounded_rectangle((x0,y0,x1,y1),radius=r,outline=rgba(glow,95),width=5)
        image.alpha_composite(glowlayer.filter(ImageFilter.GaussianBlur(14)))
    n=layer();d=ImageDraw.Draw(n)
    d.rounded_rectangle((x0,y0,x1,y1),radius=r,fill=rgba(fill,opacity),outline=rgba(outline,195),width=width)
    image.alpha_composite(n)
def arrow(points,color=CYAN,width=6,glow=True,alpha=235):
    p=[(float(x),float(y)) for x,y in points]
    if glow:
        n=layer();d=ImageDraw.Draw(n)
        d.line(p,fill=rgba(color,110),width=width+8,joint="curve")
        image.alpha_composite(n.filter(ImageFilter.GaussianBlur(13)))
    n=layer();d=ImageDraw.Draw(n)
    d.line(p,fill=rgba(color,alpha),width=width,joint="curve")
    x,y=p[-1];px,py=p[-2]
    theta=math.atan2(y-py,x-px)
    dl=18;wing=8
    u=(math.cos(theta),math.sin(theta));side=(-u[1],u[0])
    left=(x-u[0]*dl+side[0]*wing,y-u[1]*dl+side[1]*wing)
    right=(x-u[0]*dl-side[0]*wing,y-u[1]*dl-side[1]*wing)
    d.polygon([left,(x,y),right],fill=rgba(color,alpha))
    image.alpha_composite(n)
def bezier(a,b,c,d,n=35):
    return [((1-t)**3*a[0]+3*(1-t)**2*t*b[0]+3*(1-t)*t*t*c[0]+t**3*d[0],
             (1-t)**3*a[1]+3*(1-t)**2*t*b[1]+3*(1-t)*t*t*c[1]+t**3*d[1]) for t in (i/n for i in range(n+1))]
def icon(draw,name,x,y,color=(230,248,255)):
    C=rgba(color,245)
    if name=="people":
        for cx,cy,r in [(x+17,y+12,9),(x+36,y+17,7),(x-2,y+17,7)]:
            draw.ellipse((cx-r,cy-r,cx+r,cy+r),outline=C,width=3)
        draw.arc((x+1,y+20,x+35,y+60),180,360,fill=C,width=3)
        draw.arc((x-14,y+29,x+12,y+60),180,350,fill=C,width=3)
        draw.arc((x+24,y+29,x+50,y+60),190,360,fill=C,width=3)
    elif name=="apps":
        for dx,dy in [(0,0),(6,10),(0,20)]:
            draw.line([(x+4+dx,y+12+dy),(x+22+dx,y+2+dy),(x+41+dx,y+12+dy),(x+22+dx,y+23+dy),(x+4+dx,y+12+dy)],fill=C,width=3)
    elif name=="agent":
        draw.rounded_rectangle((x+1,y+12,x+45,y+46),radius=10,outline=C,width=3)
        draw.line((x+23,y+12,x+23,y+4),fill=C,width=3)
        draw.ellipse((x+20,y+1,x+26,y+7),fill=C)
        draw.ellipse((x+13,y+27,x+17,y+31),fill=C)
        draw.ellipse((x+30,y+27,x+34,y+31),fill=C)
        draw.arc((x+14,y+27,x+34,y+39),0,180,fill=C,width=2)
    elif name=="meaning":
        for dx,dy in [(4,32),(20,8),(42,35)]:
            draw.ellipse((x+dx,y+dy,x+dx+8,y+dy+8),outline=C,width=3)
        draw.line((x+10,y+33,x+23,y+14),fill=C,width=3)
        draw.line((x+28,y+14,x+44,y+36),fill=C,width=3)
        draw.line((x+13,y+39,x+42,y+39),fill=C,width=3)
    elif name=="situation":
        draw.line((x+2,y+25,x+11,y+25,x+17,y+12,x+25,y+40,x+31,y+18,x+37,y+25,x+48,y+25),fill=C,width=3)
    elif name=="shield":
        draw.polygon([(x+23,y+3),(x+46,y+12),(x+40,y+36),(x+23,y+47),(x+6,y+36),(x+1,y+12)],outline=C)
        draw.line((x+13,y+25,x+21,y+33,x+36,y+17),fill=C,width=4)
    elif name=="database":
        for i in (4,18,32):draw.arc((x+3,y+i,x+46,y+i+12),0,180,fill=C,width=3)
        draw.ellipse((x+3,y+4,x+46,y+18),outline=C,width=3)
        draw.line((x+3,y+11,x+3,y+41),fill=C,width=3)
        draw.line((x+46,y+11,x+46,y+41),fill=C,width=3)
    elif name=="systems":
        draw.ellipse((x+9,y+9,x+39,y+39),outline=C,width=3)
        draw.ellipse((x+18,y+18,x+30,y+30),outline=C,width=3)
        for q in range(8):
            a=q*math.pi/4;draw.line((x+24+16*math.cos(a),y+24+16*math.sin(a),x+24+24*math.cos(a),y+24+24*math.sin(a)),fill=C,width=3)
    elif name=="cloud":
        draw.arc((x+4,y+18,x+29,y+41),130,285,fill=C,width=3)
        draw.arc((x+13,y+4,x+43,y+35),155,350,fill=C,width=3)
        draw.arc((x+34,y+21,x+51,y+40),240,415,fill=C,width=3)
        draw.line((x+6,y+40,x+47,y+40),fill=C,width=3)
    elif name=="target":
        draw.ellipse((x+7,y+8,x+41,y+42),outline=C,width=3)
        draw.ellipse((x+17,y+18,x+31,y+32),outline=C,width=3)
        draw.line((x+23,y+25,x+50,y+1),fill=C,width=3)
    elif name=="action":
        draw.rounded_rectangle((x+5,y+6,x+42,y+44),radius=9,outline=C,width=3)
        draw.polygon([(x+20,y+16),(x+34,y+25),(x+20,y+34)],outline=C)
    elif name=="refresh":
        draw.arc((x+5,y+5,x+43,y+43),35,205,fill=C,width=4)
        draw.arc((x+5,y+5,x+43,y+43),215,385,fill=C,width=4)
        draw.polygon([(x+40,y+9),(x+45,y+20),(x+32,y+20)],fill=C)
    elif name=="star":
        draw.line((x+23,y+1,x+23,y+43),fill=C,width=3)
        draw.line((x+2,y+22,x+44,y+22),fill=C,width=3)
# Typography, restrained in content, art direction in atmosphere
head=layer();d=ImageDraw.Draw(head)
d.rounded_rectangle((65,49,111,56),radius=4,fill=rgba(LAV,255))
txt(d,130,41,slide["cue"].upper(),19,True,(234,233,255))
txt(d,65,82,slide["title"],57,True)
txt(d,846,105,v["period"],33,True,LAV)
txt(d,66,155,slide["body"],21,False,(225,227,244))
image.alpha_composite(head)
# Shared consumers rail
rounded(112,206,1130,301,outline=(214,182,250),fill=(24,43,79),opacity=206,r=27,glow=LAV)
for k in (454,790):
    n=layer();d=ImageDraw.Draw(n);d.line((k,226,k,283),fill=(188,205,244,138),width=2);image.alpha_composite(n)
cons=[("people",170),("apps",510),("agent",846)]
for i,(ic,x) in enumerate(cons):
    n=layer();d=ImageDraw.Draw(n);icon(d,ic,x,223)
    txt(d,x+68,223,v["consumers"][i]["label"],22,True)
    wrapped(d,x+68,253,v["consumers"][i]["detail"],238,15,(220,227,251))
    image.alpha_composite(n)
    arrow([(x+90,337),(x+90,309)],LAV,5)
# Context glass halo, layered gradient ellipse
gl=layer();gd=ImageDraw.Draw(gl);gd.ellipse((70,325,1140,582),fill=(173,67,238,130))
image.alpha_composite(gl.filter(ImageFilter.GaussianBlur(26)))
n=layer();d=ImageDraw.Draw(n)
d.ellipse((77,340,1142,567),fill=(44,29,102,225),outline=(206,144,255,248),width=4)
d.ellipse((86,351,1133,553),outline=(117,189,248,120),width=2)
image.alpha_composite(n)
# A meaningful dotted information surface rather than expensive SVG geometry.
n=layer();d=ImageDraw.Draw(n);rng=random.Random(6)
for i in range(780):
    xx=rng.uniform(115,1095); yy=rng.uniform(463,550)
    t=(xx-610)/535
    cap=531+20*(1-t*t)+8*math.sin(xx*.032)
    if yy<cap and ((xx-610)/535)**2+((yy-454)/107)**2<1:
        d.ellipse((xx,yy,xx+1.2,yy+1.2),fill=(155,184,252,rng.randint(25,95)))
image.alpha_composite(n)
n=layer();d=ImageDraw.Draw(n)
txt(d,609,362,v["contextLabel"],37,True,anchor="mt")
txt(d,609,412,v["contextLead"],20,False,anchor="mt",color=(224,220,247))
image.alpha_composite(n)
# Semantic facets
for i,ic in enumerate(("meaning","situation","shield")):
    x=146+i*328
    rounded(x,455,x+303,539,outline=(171,182,255),fill=(18,41,86),opacity=231,r=18,width=2)
    n=layer();d=ImageDraw.Draw(n);icon(d,ic,x+15,469,LAV)
    txt(d,x+71,468,v["facets"][i]["label"],22,True)
    wrapped(d,x+71,497,v["facets"][i]["detail"],218,15,(230,230,247))
    image.alpha_composite(n)
# Source connectors, avoid implying direct one-to-one mapping of sources to consumers.
for i in range(3):
    cx=273+i*337;arrow([(cx,596),(cx,558)],CYAN,5)
for i,ic in enumerate(("database","systems","cloud")):
    x=113+i*337
    rounded(x,601,x+320,688,outline=(129,219,237),fill=(13,55,77),opacity=225,r=18,glow=(56,153,193))
    n=layer();d=ImageDraw.Draw(n);icon(d,ic,x+19,620,CYAN)
    txt(d,x+80,614,v["sources"][i]["label"],20,True)
    wrapped(d,x+80,645,v["sources"][i]["detail"],229,15,(229,240,247))
    image.alpha_composite(n)
# Decision/action/results example loop, visibly a separate business flow
p=bezier((97,515),(13,570),(70,740),(156,778))
arrow(p,CYAN,5)
p=bezier((1124,780),(1225,725),(1174,550),(1126,528))
arrow(p,CYAN,5)
rounded(171,735,1120,822,outline=(204,176,248),fill=(24,43,80),opacity=236,r=26,glow=LAV)
for i,ic in enumerate(("target","action","refresh")):
    x=204+i*309
    n=layer();d=ImageDraw.Draw(n);icon(d,ic,x,757)
    txt(d,x+66,758,v["cycle"][i]["label"],17,True)
    wrapped(d,x+66,785,v["cycle"][i]["detail"],222,14,(227,230,250))
    image.alpha_composite(n)
for x in (460,791):arrow([(x,778),(x+23,778)],LAV,3,glow=False)
# Right value column floats over landscape
rounded(1186,334,1548,777,outline=(218,204,248),fill=(10,26,56),opacity=221,r=25,glow=LAV)
n=layer();d=ImageDraw.Draw(n);txt(d,1218,358,v.get("outcomesTitle","Mulig verdi"),29,True)
d.line((1218,408,1518,408),fill=(198,212,243,140),width=2)
image.alpha_composite(n)
for i,ic in enumerate(("target","action","refresh")):
    y=430+i*111
    n=layer();d=ImageDraw.Draw(n)
    icon(d,ic,1211,y,CYAN if i<2 else LAV)
    txt(d,1277,y+4,v["outcomes"][i]["label"],19,True)
    wrapped(d,1277,y+34,v["outcomes"][i]["detail"],226,15,(226,236,249))
    if i<2:d.line((1218,y+93,1518,y+93),fill=(180,205,237,120),width=1)
    image.alpha_composite(n)
# Governance, always visually cross-cutting, not one stage in the pipeline.
rounded(70,841,1538,888,outline=(161,206,233),fill=(6,24,51),opacity=224,r=17,width=1)
n=layer();d=ImageDraw.Draw(n)
txt(d,92,849,v["governanceLabel"],18,True)
txt(d,353,852,"    •    ".join(v["governance"]),16,False,(211,228,245))
image.alpha_composite(n)
OUT.parent.mkdir(parents=True,exist_ok=True)
image.convert("RGB").save(OUT,"PNG",optimize=True)
print(OUT)
