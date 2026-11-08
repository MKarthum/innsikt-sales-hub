#!/usr/bin/env python3
"""Reusable raster figure primitives, independent of slide content and theme.

Draw semantic diagrams as an RGBA 16:9 composition. The content and layout
belong to the calling recipe; this module owns line quality, panel painting,
arrows and geometry, not labels, colors or business assumptions.
"""
from __future__ import annotations

import math
from PIL import Image, ImageDraw, ImageFilter

QUALITY_SCALE = 4


def rgba(color, alpha=255):
    return tuple(color[:3]) + (int(alpha),)


def bezier(a, b, c, d, steps=64):
    if steps < 2:
        raise ValueError("A curve needs at least two segments")
    return [(
        (1-t)**3*a[0] + 3*(1-t)**2*t*b[0] + 3*(1-t)*t*t*c[0] + t**3*d[0],
        (1-t)**3*a[1] + 3*(1-t)**2*t*b[1] + 3*(1-t)*t*t*c[1] + t**3*d[1],
    ) for t in (i/steps for i in range(steps+1))]


def superellipse(cx, cy, rx, ry, power=4, inset=0, steps=720):
    if min(rx-inset, ry-inset) <= 0 or power <= 0:
        raise ValueError("Invalid superellipse geometry")
    return [(
        cx + (rx-inset) * math.copysign(abs(math.cos(t))**(2/power), math.cos(t)),
        cy + (ry-inset) * math.copysign(abs(math.sin(t))**(2/power), math.sin(t)),
    ) for t in (2*math.pi*i/steps for i in range(steps))]


def contains_superellipse(cx, cy, rx, ry, power, x, y, margin=0):
    return (abs((x-cx)/(rx-margin))**power +
            abs((y-cy)/(ry-margin))**power) <= 1


def stroke(canvas, points, color, width=3.5, alpha=230, arrow=False,
           glow=False, scale=QUALITY_SCALE):
    """Antialiased polyline and optional geometric arrowhead.

    The final segment defines the arrow direction. We draw head and track in
    the same supersampled layer, preventing doubled junctions.
    """
    points = [(float(x), float(y)) for x,y in points]
    if len(points) < 2:
        raise ValueError("A connector requires at least two points")
    tip = None
    if arrow:
        (x,y),(px,py) = points[-1],points[-2]
        dist = math.hypot(x-px,y-py)
        if dist < 0.001:
            raise ValueError("Undefined arrow direction")
        ux,uy = (x-px)/dist,(y-py)/dist
        length,half_width = max(8.0,width*3),max(3.5,width*1.18)
        tip = [(x-ux*length-uy*half_width,y-uy*length+ux*half_width),
               (x,y),
               (x-ux*length+uy*half_width,y-uy*length-ux*half_width)]
    vertices = points + (tip or [])
    padding = math.ceil(max(6,width*3))
    x0=max(0,math.floor(min(x for x,y in vertices)-padding))
    y0=max(0,math.floor(min(y for x,y in vertices)-padding))
    x1=min(canvas.width,math.ceil(max(x for x,y in vertices)+padding+1))
    y1=min(canvas.height,math.ceil(max(y for x,y in vertices)+padding+1))
    if x1<=x0 or y1<=y0:
        return
    if glow:
        layer=Image.new("RGBA",canvas.size,(0,0,0,0))
        ImageDraw.Draw(layer).line(points,fill=rgba(color,53),width=max(3,round(width+4)),joint="curve")
        canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(9)))
    hi=Image.new("RGBA",((x1-x0)*scale,(y1-y0)*scale),(0,0,0,0))
    painter=ImageDraw.Draw(hi)
    to_hi=lambda pts:[((x-x0)*scale,(y-y0)*scale) for x,y in pts]
    painter.line(to_hi(points),fill=rgba(color,alpha),width=round(width*scale),joint="curve")
    if tip:
        painter.polygon(to_hi(tip),fill=rgba(color,alpha))
    canvas.alpha_composite(hi.resize((x1-x0,y1-y0),Image.Resampling.LANCZOS),(x0,y0))


def panel(canvas, box, *, fill, outline, alpha=220, radius=20,
          stroke_width=1.5, shadow=None):
    if shadow:
        glow=Image.new("RGBA",canvas.size,(0,0,0,0))
        ImageDraw.Draw(glow).rounded_rectangle(box,radius=radius,outline=rgba(shadow,54),width=3)
        canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(11)))
    n=Image.new("RGBA",canvas.size,(0,0,0,0))
    ImageDraw.Draw(n).rounded_rectangle(box,radius=radius,fill=rgba(fill,alpha),
        outline=rgba(outline,186),width=max(1,round(stroke_width)))
    canvas.alpha_composite(n)


def superellipse_panel(canvas, bounds, *, fill, outline, alpha=226,
                       power=4, line_width=2, halo=None, second_line=None):
    """Smooth, properly clipped silhouette at 4x, with optional faint inner line."""
    cx,cy,rx,ry=bounds
    pts=superellipse(cx,cy,rx,ry,power=power)
    if halo:
        layer=Image.new("RGBA",canvas.size,(0,0,0,0))
        ImageDraw.Draw(layer).polygon(pts,fill=rgba(halo,74))
        canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(17)))
    pad=math.ceil(max(12,line_width*4))
    left=max(0,math.floor(cx-rx-pad))
    top=max(0,math.floor(cy-ry-pad))
    right=min(canvas.width,math.ceil(cx+rx+pad))
    bottom=min(canvas.height,math.ceil(cy+ry+pad))
    scale=QUALITY_SCALE
    high=Image.new("RGBA",((right-left)*scale,(bottom-top)*scale),(0,0,0,0))
    d=ImageDraw.Draw(high)
    at=lambda items:[((x-left)*scale,(y-top)*scale) for x,y in items]
    d.polygon(at(pts),fill=rgba(fill,alpha))
    d.line(at(pts)+[at(pts)[0]],fill=rgba(outline,234),width=max(1,round(line_width*scale)),joint="curve")
    if second_line:
        inner=at(superellipse(cx,cy,rx,ry,power=power,inset=5))
        d.line(inner+[inner[0]],fill=rgba(second_line,70),width=scale,joint="curve")
    canvas.alpha_composite(high.resize((right-left,bottom-top),Image.Resampling.LANCZOS),(left,top))


def wrap(draw, text, font, max_width, max_lines=2):
    words=str(text).split()
    result=[]
    line=""
    for word in words:
        candidate=(line+" "+word).strip()
        if line and draw.textbbox((0,0),candidate,font=font)[2]>max_width:
            result.append(line)
            line=word
        else:
            line=candidate
    if line:
        result.append(line)
    if len(result)>max_lines:
        raise ValueError("Illustration text exceeds available width: "+str(text))
    return result
