#!/usr/bin/env python3
"""Offline authoring recipe: ONE finished image from canonical slide data.
This is not a browser/CSS renderer. It can be replaced by a designer's image
through the normal import/approval pipeline without changing the slide model.
"""
import json, math, os, pathlib, random, re, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from illustration_kit import (panel as paint_panel, stroke as paint_stroke, bezier as curve_points,
                              superellipse as ellipse_points, superellipse_panel as paint_superellipse,
                              contains_superellipse)

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
# Distinctive original illustration, separate from the scenic/mountain direction.
# The ambient data architecture is generated deterministically from vector primitives.
# All labels, business connections and process arrows are rendered below from slides.json.
bg=Image.new("RGBA",(W,H),NAVY+(255,))
bd=ImageDraw.Draw(bg)
for y in range(H):
    t=y/(H-1)
    r=round(5+8*t); g=round(19+16*t); b=round(37+25*t)
    bd.line((0,y,W,y),fill=(r,g,b,255))
image.alpha_composite(bg)

def ambient_glow(cx,cy,radius,color,alpha=125):
    global image
    glow=Image.new("RGBA",(W,H),(0,0,0,0))
    gd=ImageDraw.Draw(glow)
    for rad in range(radius,0,-5):
        intensity=round(alpha*(1-rad/radius)**1.65)
        gd.ellipse((cx-rad,cy-round(rad*.83),cx+rad,cy+round(rad*.83)),
                   fill=tuple(color)+(intensity,))
    image.alpha_composite(glow)
ambient_glow(1322,174,465,(71,105,225),66)
ambient_glow(990,420,425,(44,174,204),33)
ambient_glow(610,460,520,(113,60,196),48)

# A quiet perspectival grid gives the information space architectural depth.
grid=Image.new("RGBA",(W,H),(0,0,0,0))
gd=ImageDraw.Draw(grid)
horizon=450
for x in range(-400,2200,100):
    gd.line((780+(x-780)*.10,horizon,x,900),fill=(98,173,216,19),width=2)
for depth in (.12,.2,.3,.43,.59,.79,1):
    y=round(horizon+(900-horizon)*depth**1.5)
    gd.line((0,y,W,y),fill=(91,164,214,round(8+14*depth)),width=2)
image.alpha_composite(grid)

# Unique right-hand visual: translucent connected glass towers and an orbital
# knowledge structure. These are atmosphere, not additional semantic nodes.
city=Image.new("RGBA",(W,H),(0,0,0,0))
cd=ImageDraw.Draw(city)
city_rng=random.Random(2027)
towers=[(1015,340,1148,755),(1120,270,1240,760),(1215,305,1348,759),
        (1312,230,1446,753),(1440,285,1587,780)]
for index,(left,top,right,bottom) in enumerate(towers):
    roof=city_rng.randint(20,52);front=(left+roof,top-roof)
    cd.polygon([(left,top),(front[0],front[1]),(right+20,top-15),(right,bottom),(left,bottom)],
               fill=(29+index*4,68+index*4,122+index*5,49),
               outline=(108,209,253,64))
    cd.line((front[0],front[1],front[0],bottom-18),fill=(153,210,253,48),width=2)
    cd.line((right,top,right,bottom),fill=(104,231,247,43),width=2)
    for y in range(top+35,bottom-12,37):
        cd.line((left+18,y,right-14,y-7),fill=(122,209,247,27),width=2)
    for col in range(2):
        x=left+28+col*38
        for y in range(top+55,bottom-14,64):
            if city_rng.random()>.35:
                cd.rounded_rectangle((x,y,x+6,y+18),radius=2,
                     fill=(130,242,249,city_rng.randint(45,108)))
image.alpha_composite(city.filter(ImageFilter.GaussianBlur(2)))
image.alpha_composite(city)

# Graphic orbit encircles a luminous centre in the upper-right negative space.
orb=Image.new("RGBA",(W,H),(0,0,0,0))
od=ImageDraw.Draw(orb)
cx,cy=1378,162
for rad in (80,126,167):
    od.ellipse((cx-rad,cy-rad*.58,cx+rad,cy+rad*.58),
               outline=(141,190,255,round(100-rad*.30)),width=3)
od.arc((cx-154,cy-167,cx+154,cy+167),210,515,fill=(192,140,255,110),width=4)
od.arc((cx-187,cy-90,cx+187,cy+90),-20,170,fill=(91,242,246,118),width=4)
od.ellipse((cx-14,cy-14,cx+14,cy+14),fill=(204,228,255,200))
for angle in (25,81,147,211,274,329):
    a=math.radians(angle)
    x=round(cx+162*math.cos(a));y=round(cy+94*math.sin(a))
    od.line((cx,cy,x,y),fill=(119,199,246,35),width=2)
    od.ellipse((x-4,y-4,x+4,y+4),fill=(150,237,252,170))
image.alpha_composite(orb.filter(ImageFilter.GaussianBlur(12)))
image.alpha_composite(orb)

# Ambient structure remains well behind legible source panels and value callouts.
trace=Image.new("RGBA",(W,H),(0,0,0,0))
td=ImageDraw.Draw(trace)
def ambient_curve(a,b,c,d,n=60):
    return [((1-t)**3*a[0]+3*(1-t)**2*b[0]+3*(1-t)*t*t*c[0]+t**3*d[0],
             (1-t)**3*a[1]+3*(1-t)**2*b[1]+3*(1-t)*t*t*c[1]+t**3*d[1])
            for t in (i/n for i in range(n+1))]
for i in range(6):
    y=260+i*64
    p=ambient_curve((635,y),(940,y-60),(1145,y-130),(1460,80+i*24))
    td.line(p,fill=(102,193,247,28 if i%2 else 40),width=2)
    for k in (14,32,48):
        xx,yy=p[k]
        td.ellipse((xx-3,yy-3,xx+3,yy+3),fill=(176,225,253,70))
rng=random.Random(40)
for i in range(170):
    x=rng.randint(720,W-18);y=rng.randint(12,H-12)
    if rng.random()<.7:
        td.ellipse((x,y,x+1,y+1),fill=(146,205,242,rng.randint(18,72)))
image.alpha_composite(trace)

# The vignette protects typography and reinforces the context platform focal point.
shade=Image.new("RGBA",(W,H),(0,0,0,0))
sd=ImageDraw.Draw(shade)
for x in range(1180):
    sd.line((x,0,x,H),fill=(2,13,34,round(25*(1-x/1180))),width=1)
for y in range(H):
    t=y/(H-1)
    sd.line((0,y,W,y),fill=(2,8,24,round(6+34*t*t)),width=1)
image.alpha_composite(shade)

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
# Shared drawing API. The context recipe now describes *what* to draw,
# while illustration_kit owns high-quality drawing and arrowhead geometry.
def rounded(x0,y0,x1,y1,outline=(174,227,249),fill=(16,45,70),opacity=210,r=24,width=2,glow=None):
    paint_panel(image,(x0,y0,x1,y1),fill=fill,outline=outline,alpha=opacity,
                radius=r,stroke_width=width,shadow=glow)

def connector(points,color=CYAN,width=4,glow=True,alpha=228):
    paint_stroke(image,points,color,width=width,alpha=alpha,glow=glow)

def arrow(points,color=CYAN,width=4,glow=True,alpha=228):
    paint_stroke(image,points,color,width=width,alpha=alpha,glow=glow,arrow=True)

def bezier(a,b,c,d,n=35):
    return curve_points(a,b,c,d,steps=n)

# Superellipse: a compact, measured form with softly squared sides.
# Validate the 10px inner safety margin at every facet corner.
CONTEXT=(609.5,452.0,520.0,124.0,4)
FACET_BOXES=[(160+i*306,455,448+i*306,539) for i in range(3)]
def within_context(x,y,margin=0):
    cx,cy,rx,ry,n=CONTEXT
    return contains_superellipse(cx,cy,rx,ry,n,x,y,margin)
assert all(within_context(x,y,10) for x0,y0,x1,y1 in FACET_BOXES
           for x in (x0,x1) for y in (y0,y1)), "Kontekstbokser ligger utenfor glassflaten"
def context_outline(inset=0,steps=360):
    cx,cy,rx,ry,p=CONTEXT
    return ellipse_points(cx,cy,rx,ry,power=p,inset=inset,steps=steps)
def context_rim_y(x,top):
    cx,cy,rx,ry,p=CONTEXT
    f=(1-abs((x-cx)/rx)**p)**(1/p)
    return round(cy-ry*f if top else cy+ry*f)
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
        # Same four interconnected concepts as the source-owned semantic icon.
        for dx,dy in [(20,2),(2,20),(38,20),(20,38)]:
            draw.ellipse((x+dx,y+dy,x+dx+9,y+dy+9),outline=C,width=3)
        draw.line((x+24,y+11,x+11,y+24),fill=C,width=3)
        draw.line((x+29,y+11,x+42,y+24),fill=C,width=3)
        draw.line((x+11,y+29,x+24,y+42),fill=C,width=3)
        draw.line((x+42,y+29,x+29,y+42),fill=C,width=3)
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
    elif name=="timeline":
        draw.line((x+3,y+24,x+47,y+24),fill=C,width=3)
        for cx,cy in ((11,10),(25,38),(39,10)):
            draw.line((x+cx,y+24,x+cx,y+cy),fill=C,width=3)
            draw.ellipse((x+cx-5,y+cy-5,x+cx+5,y+cy+5),outline=C,width=3)
    elif name=="choice":
        draw.line((x+24,y+2,x+24,y+10),fill=C,width=3)
        draw.line((x+24,y+10,x+10,y+24,x+10,y+32),fill=C,width=3)
        draw.line((x+24,y+10,x+40,y+24,x+40,y+30),fill=C,width=3)
        draw.rounded_rectangle((x+4,y+32,x+16,y+44),radius=3,outline=C,width=3)
        draw.line((x+32,y+39,x+39,y+45,x+49,y+31),fill=C,width=3)
    elif name=="guarded-action":
        draw.rounded_rectangle((x+19,y+4,x+46,y+45),radius=7,outline=C,width=3)
        draw.line((x+3,y+25,x+27,y+25),fill=C,width=3)
        draw.line((x+19,y+17,x+27,y+25,x+19,y+33),fill=C,width=3)
        draw.line((x+31,y+34,x+36,y+39,x+43,y+27),fill=C,width=3)
    elif name=="state-update":
        draw.ellipse((x+4,y+5,x+32,y+17),outline=C,width=3)
        draw.line((x+4,y+11,x+4,y+39),fill=C,width=3)
        draw.line((x+32,y+11,x+32,y+39),fill=C,width=3)
        draw.arc((x+4,y+22,x+32,y+34),0,180,fill=C,width=3)
        draw.line((x+41,y+22,x+41,y+46),fill=C,width=3)
        draw.line((x+32,y+34,x+49,y+34),fill=C,width=3)
    elif name=="evidence":
        draw.rounded_rectangle((x+7,y+3,x+43,y+46),radius=5,outline=C,width=3)
        draw.line((x+13,y+16,x+27,y+16),fill=C,width=3)
        draw.line((x+13,y+38,x+20,y+30,x+28,y+35,x+36,y+22),fill=C,width=3)
    elif name=="external":
        draw.ellipse((x+3,y+4,x+42,y+44),outline=C,width=3)
        draw.line((x+3,y+24,x+42,y+24),fill=C,width=3)
        draw.arc((x+14,y+4,x+31,y+44),65,295,fill=C,width=3)
        draw.arc((x+14,y+4,x+31,y+44),245,115,fill=C,width=3)
        draw.line((x+37,y+13,x+48,y+3),fill=C,width=3)
        draw.line((x+43,y+3,x+48,y+3,x+48,y+9),fill=C,width=3)

# Every pictogram is chosen by the canonical slide assetId, not by row index.
ICON_BY_ASSET={
    "context-people":"people","consume-app":"apps","ai-agent":"agent",
    "data-semantic":"meaning","context-timeline":"timeline",
    "governance-shield":"shield","tabler-database":"database",
    "source-erp":"systems","context-external":"external",
    "context-choice":"choice","context-guarded-action":"guarded-action",
    "context-state-update":"state-update","verified-analysis":"target",
    "context-evidence":"evidence"
}
for group in ("consumers","facets","sources","cycle","outcomes"):
    for item in v[group]:
        assert item["assetId"] in ICON_BY_ASSET, ("Ukjent semantisk bildeikon", group,item["assetId"])
def semantic_icon(draw,item,x,y,color=LIGHT):
    icon(draw,ICON_BY_ASSET[item["assetId"]],x,y,color)

# Typography, restrained in content, art direction in atmosphere
head=layer();d=ImageDraw.Draw(head)
d.rounded_rectangle((65,49,111,56),radius=4,fill=rgba(LAV,255))
txt(d,130,41,slide["cue"].upper(),19,True,(234,233,255))
txt(d,65,82,slide["title"],57,True)
txt(d,846,105,v["period"],33,True,LAV)
txt(d,66,155,slide["body"],21,False,(225,227,244))
image.alpha_composite(head)
# Shared consumers rail
rounded(112,192,1130,286,outline=(214,182,250),fill=(24,43,79),opacity=206,r=22,glow=LAV)
for k in (454,790):
    n=layer();d=ImageDraw.Draw(n);d.line((k,210,k,269),fill=(188,205,244,138),width=2);image.alpha_composite(n)
cons=[170,510,846]
for i,x in enumerate(cons):
    n=layer();d=ImageDraw.Draw(n);semantic_icon(d,v["consumers"][i],x,209)
    txt(d,x+68,209,v["consumers"][i]["label"],22,True)
    wrapped(d,x+68,239,v["consumers"][i]["detail"],238,15,(220,227,251))
    image.alpha_composite(n)
    cx=x+90
    rim=context_rim_y(cx,True)
    arrow([(cx,rim),(cx,286)],LAV,4)
# The old ellipse clipped the left and right facet cards at their corners.
# A superellipse keeps the oval concept while giving every card real padding.
paint_superellipse(image,CONTEXT[:4],fill=(44,29,102),outline=(206,144,255),
                   alpha=225,power=CONTEXT[4],line_width=2,halo=(173,67,238),
                   second_line=(117,189,248))
# A meaningful dotted information surface rather than expensive SVG geometry.
n=layer();d=ImageDraw.Draw(n);rng=random.Random(6)
for i in range(170):
    xx=rng.uniform(115,1095); yy=rng.uniform(463,550)
    t=(xx-610)/535
    cap=531+20*(1-t*t)+8*math.sin(xx*.032)
    if yy<cap and within_context(xx,yy,15):
        d.ellipse((xx,yy,xx+1.2,yy+1.2),fill=(155,184,252,rng.randint(18,46)))
image.alpha_composite(n)
n=layer();d=ImageDraw.Draw(n)
txt(d,609,357,v["contextLabel"],37,True,anchor="mt")
txt(d,609,406,v["contextLead"],20,False,anchor="mt",color=(224,220,247))
image.alpha_composite(n)
# Semantic facets
for i in range(3):
    x=160+i*306
    rounded(x,455,x+288,539,outline=(171,182,255),fill=(18,41,86),opacity=231,r=16,width=2)
    n=layer();d=ImageDraw.Draw(n);semantic_icon(d,v["facets"][i],x+15,469,LAV)
    txt(d,x+71,468,v["facets"][i]["label"],22,True)
    wrapped(d,x+71,497,v["facets"][i]["detail"],203,15,(230,230,247))
    image.alpha_composite(n)
# All three sources connect to ONE inlet. The joint is visually shared,
# with only one arrowhead at the context boundary (no stacked arrows).
SOURCE_TOP=619
SOURCE_JOIN=603
connector([(273,SOURCE_TOP),(273,SOURCE_JOIN),(610,SOURCE_JOIN)],CYAN,4)
connector([(947,SOURCE_TOP),(947,SOURCE_JOIN),(610,SOURCE_JOIN)],CYAN,4)
arrow([(610,SOURCE_TOP),(610,context_rim_y(610,False))],CYAN,4)
for i in range(3):
    x=113+i*337
    rounded(x,SOURCE_TOP,x+320,SOURCE_TOP+82,outline=(129,219,237),fill=(13,55,77),opacity=225,r=16,glow=(56,153,193))
    n=layer();d=ImageDraw.Draw(n);semantic_icon(d,v["sources"][i],x+19,SOURCE_TOP+19,CYAN)
    txt(d,x+80,SOURCE_TOP+13,v["sources"][i]["label"],20,True)
    wrapped(d,x+80,SOURCE_TOP+44,v["sources"][i]["detail"],229,15,(229,240,247))
    image.alpha_composite(n)
# Decision/action/results example loop, visibly a separate business flow
p=bezier((90,483),(12,538),(29,738),(171,778))
arrow(p,CYAN,4)
p=bezier((1120,779),(1160,757),(1172,550),(1129,482))
arrow(p,CYAN,4)
rounded(171,735,1120,822,outline=(204,176,248),fill=(24,43,80),opacity=236,r=21,glow=LAV)
for i in range(3):
    x=204+i*309
    n=layer();d=ImageDraw.Draw(n);semantic_icon(d,v["cycle"][i],x,757)
    txt(d,x+66,758,v["cycle"][i]["label"],17,True)
    wrapped(d,x+66,785,v["cycle"][i]["detail"],222,14,(227,230,250))
    image.alpha_composite(n)
for x in (460,791):arrow([(x,778),(x+23,778)],LAV,2.8,glow=False)
# Right value column floats over landscape
rounded(1186,334,1548,777,outline=(218,204,248),fill=(10,26,56),opacity=221,r=21,glow=LAV)
n=layer();d=ImageDraw.Draw(n);txt(d,1218,358,v.get("outcomesTitle","Mulig verdi"),29,True)
d.line((1218,408,1518,408),fill=(198,212,243,140),width=2)
image.alpha_composite(n)
for i in range(3):
    y=430+i*111
    n=layer();d=ImageDraw.Draw(n)
    semantic_icon(d,v["outcomes"][i],1211,y,CYAN if i<2 else LAV)
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
