#!/usr/bin/env python3
"""Forge Flight explanatory animation pack.

Deterministic, equation-driven artwork: Pillow >=10, NumPy, and FFmpeg.
No network access, private assets, or bundled font files are required.
Render all: python source/render.py
Render one: python source/render.py --only 01-equality-balance
Optional font paths: FF_FONT, FF_BOLD, FF_MATH, FF_SERIF.
"""
from __future__ import annotations
import argparse
from functools import lru_cache
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from typing import Callable
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'learn-media'
W, H, SCALE = 960, 540, 2
FPS, FRAME_MS = 12.5, 80
BG='#efeae1'; PAPER='#f7f4ee'; INK='#1a1814'; MUTED='#534e47'; LINE='#ddd6c8'
TEAL='#0e5c56'; MINT='#d5ebe6'; BRASS='#b87927'; GOLD='#f0dfbf'; RED='#aa4634'; ROSE='#f3ddd4'
WHITE='#ffffff'; SOFT='#e7e1d6'

def pick_font(env: str, candidates: list[str]) -> str:
    value=os.getenv(env)
    if value:
        if not Path(value).is_file(): raise FileNotFoundError(f'{env} not found: {value}')
        return value
    for p in candidates:
        if Path(p).is_file(): return p
    raise FileNotFoundError(f'Set {env} to a local TrueType/OpenType font with Greek and maths glyphs.')

SANS=pick_font('FF_FONT', ['/usr/share/fonts/opentype/inter/Inter-Regular.otf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','C:/Windows/Fonts/arial.ttf','/System/Library/Fonts/Supplemental/Arial.ttf'])
BOLD=pick_font('FF_BOLD', ['/usr/share/fonts/opentype/inter/Inter-SemiBold.otf','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','C:/Windows/Fonts/arialbd.ttf','/System/Library/Fonts/Supplemental/Arial Bold.ttf'])
MATH=pick_font('FF_MATH', ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','C:/Windows/Fonts/arial.ttf','/System/Library/Fonts/Supplemental/Arial.ttf'])
SERIF=pick_font('FF_SERIF', ['/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf','C:/Windows/Fonts/georgia.ttf','/System/Library/Fonts/Supplemental/Georgia.ttf'])

@lru_cache(maxsize=200)
def font(size: int, kind: str='sans') -> ImageFont.FreeTypeFont:
    return ImageFont.truetype({'sans':SANS,'bold':BOLD,'math':MATH,'serif':SERIF}[kind],round(size*SCALE))

def clamp(t: float) -> float: return max(0.0,min(1.0,t))
def ease(t: float) -> float:
    t=clamp(t); return t*t*(3-2*t)
def tween(t: float,a: float,b: float,x: float,y: float) -> float:
    return x+(y-x)*ease((t-a)/(b-a))
def rgb(color: str) -> tuple[int,int,int]:
    return tuple(int(color[i:i+2],16) for i in (1,3,5))
def blend(a: str,b: str,p: float) -> str:
    return '#'+''.join(f'{round(x+(y-x)*clamp(p)):02x}' for x,y in zip(rgb(a),rgb(b)))

class Canvas:
    def __init__(self):
        self.im=Image.new('RGB',(W*SCALE,H*SCALE),BG)
        self.d=ImageDraw.Draw(self.im)
    def text(self,x:float,y:float,text:str,size:int=24,color:str=INK,kind:str='sans',anchor:str='la',maxw:float|None=None):
        if maxw:
            while self.d.textlength(text,font=font(size,kind))>maxw*SCALE and size>13: size-=1
        self.d.text((round(x*SCALE),round(y*SCALE)),text,font=font(size,kind),fill=color,anchor=anchor)
    def line(self,pts,fill=INK,width=2):
        self.d.line([(round(x*SCALE),round(y*SCALE)) for x,y in pts],fill=fill,width=max(1,round(width*SCALE)),joint='curve')
    def rect(self,box,fill=PAPER,outline=None,width=1,r=0):
        box=tuple(round(v*SCALE) for v in box)
        if r:self.d.rounded_rectangle(box,radius=round(r*SCALE),fill=fill,outline=outline,width=round(width*SCALE))
        else:self.d.rectangle(box,fill=fill,outline=outline,width=round(width*SCALE))
    def circle(self,x,y,r,fill=PAPER,outline=None,width=2):
        self.d.ellipse(tuple(round(v*SCALE) for v in (x-r,y-r,x+r,y+r)),fill=fill,outline=outline,width=round(width*SCALE))
    def poly(self,pts,fill,outline=None,width=1):
        coords=[(round(x*SCALE),round(y*SCALE)) for x,y in pts]
        self.d.polygon(coords,fill=fill)
        if outline:self.d.line(coords+[coords[0]],fill=outline,width=round(width*SCALE),joint='curve')
    def dash(self,p,q,color=LINE,width=2,dash=7,gap=5):
        dx=q[0]-p[0];dy=q[1]-p[1];l=math.hypot(dx,dy)
        if l<.1:return
        for start in np.arange(0,l,dash+gap):
            end=min(l,start+dash)
            self.line([(p[0]+dx*start/l,p[1]+dy*start/l),(p[0]+dx*end/l,p[1]+dy*end/l)],color,width)
    def arrow(self,p,q,color=TEAL,width=5,head=14):
        dx=q[0]-p[0];dy=q[1]-p[1];l=math.hypot(dx,dy)
        if l<2:return
        ux=dx/l;uy=dy/l;head=min(head,l*.5)
        base=(q[0]-head*ux,q[1]-head*uy)
        self.line([p,base],color,width)
        self.poly([q,(base[0]-uy*head*.44,base[1]+ux*head*.44),(base[0]+uy*head*.44,base[1]-ux*head*.44)],color)
    def arc(self,c,r,a,b,color=TEAL,width=4):
        pts=[(c[0]+r*math.cos(th),c[1]-r*math.sin(th)) for th in np.linspace(a,b,max(3,int(abs(b-a)*r/3)))]
        self.line(pts,color,width)
    def pill(self,x,y,text,fill=MINT,color=TEAL,size=20,pad=15):
        width=self.d.textlength(text,font=font(size,'bold'))/SCALE+2*pad
        self.rect((x,y,x+width,y+36),fill,r=18)
        self.text(x+width/2,y+18,text,size,color,'bold','mm')
        return width
    def label(self,x,y,text,size=23,color=INK,fill=PAPER,pad=10):
        tw=self.d.textlength(text,font=font(size,'math'))/SCALE
        self.rect((x-tw/2-pad,y-size*.75-4,x+tw/2+pad,y+size*.75+4),fill,r=7)
        self.text(x,y,text,size,color,'math','mm')
    def header(self,index,title,category='MATH RUNWAY'):
        self.text(36,20,'FORGE FLIGHT  /  '+category,15,TEAL,'bold')
        self.text(924,20,f'{index:02d} / 12',15,MUTED,'sans','ra')
        self.text(36,53,title,39,INK,'serif',maxw=885)
        self.line([(36,108),(924,108)],LINE,1)
    def footer(self,eyebrow,summary,t,duration):
        self.rect((24,444,936,520),PAPER,r=10)
        self.text(40,451,eyebrow.upper(),13,TEAL,'bold')
        self.text(40,475,summary,24,INK,'sans',maxw=879)
        self.rect((36,533,924,536),LINE,r=1)
        self.rect((36,533,36+888*clamp(t/duration),536),TEAL,r=1)
    def finish(self):return self.im.resize((W,H),Image.Resampling.LANCZOS)

def panel(c,x,y,w,h,title=None):
    c.rect((x,y,x+w,y+h),PAPER,LINE,r=12)
    if title:c.text(x+18,y+14,title,16,MUTED,'bold')

def equation(c,text,y=185,size=40,color=TEAL):
    c.text(480,y,text,size,color,'math','mm',maxw=852)

# 01: Apply the same addition to both sides; the balance never tilts.
def equality(t):
    c=Canvas();c.header(1,'Keep both sides balanced')
    arrived=ease((t-1.8)/1.4); simplified=ease((t-5.0)/.65)
    if t<1.8:eq='x − 7 = 12'
    elif t<5: eq='x − 7 + 7 = 12 + 7'
    else:eq='x = 19'
    equation(c,eq,151,37)
    c.line([(480,292),(480,405)],INK,7)
    c.poly([(447,418),(513,418),(493,404),(467,404)],INK)
    c.line([(260,281),(700,281)],INK,7);c.circle(480,281,9,TEAL)
    for x in (270,690):
        c.line([(x,283),(x-78,380)],MUTED,2);c.line([(x,283),(x+78,380)],MUTED,2)
        c.poly([(x-90,380),(x+90,380),(x+66,393),(x-66,393)],SOFT,INK,2)
    for x,label in ((270,'x − 7'),(690,'12')):
        if t>=5.65:label='x' if x==270 else '19'
        c.rect((x-54,325,x+54,376),MINT,TEAL,2,r=8)
        c.text(x,350,label,28,TEAL,'math','mm')
        if 1.8<=t<5.65:
            y=203+arrived*76
            col=blend(BG,GOLD,1-simplified)
            c.rect((x-40,y,x+40,y+46),col,BRASS,2,r=8)
            c.text(x,y+23,'+7',27,BRASS,'math','mm')
    if t<1.8:info=('Start equal','Both expressions represent the same value.')
    elif t<5:info=('Add the same amount','Add 7 to each side. The equation stays balanced.')
    else:info=('Simplify','−7 + 7 cancels on the left. The result is x = 19.')
    c.footer(*info,t,9.6);return c.finish()

# 02: Discrete algebra is animated by revealing legal operations, not morphing symbols.
def rearrange(t):
    c=Canvas();c.header(2,'Run the formula backward')
    stage=0 if t<2.4 else 1 if t<4.8 else 2 if t<7.2 else 3
    labels=['Known relationship','Multiply both sides by A','Divide both sides by σ','Substitute, then check']
    c.pill(36,124,labels[stage])
    panel(c,36,179,565,244)
    lines=['σ = F / A','σA = F','A = F / σ','A = 12,000 / 150 = 80 mm²']
    sizes=[49,49,49,31]
    c.text(319,260,lines[stage],sizes[stage],TEAL,'math','mm',maxw=526)
    sub=['Find A, not σ.','A is no longer in the denominator.','The unknown A is now alone.','150 MPa = 150 N/mm²']
    c.text(319,329,sub[stage],21,MUTED,'sans','mm',maxw=526)
    if stage in (1,2):
        c.pill(202,369,'×A on both sides' if stage==1 else '÷σ on both sides',GOLD,BRASS,19)
    elif stage==3:
        c.text(319,379,'Check: 12,000 N / 80 mm² = 150 MPa',20,TEAL,'math','mm',maxw=530)
    panel(c,623,179,301,244,'DESIGN INPUTS')
    c.text(643,237,'Load',19,MUTED);c.text(900,237,'12 kN',27,INK,'math','ra')
    c.text(643,291,'Allowable',19,MUTED);c.text(900,291,'150 MPa',26,INK,'math','ra')
    c.line([(643,336),(904,336)],LINE)
    c.text(643,361,'Required area',19,MUTED);c.text(900,363,'?' if stage<3 else '80 mm²',27,TEAL,'math','ra')
    info=[('Choose the unknown','Keep the quantities as symbols while rearranging.'),('Preserve equality','Apply each operation to the entire left and right sides.'),('Isolate the input','A = F/σ: a larger load needs a larger area.'),('Calculation, not a design approval','80 mm² reaches this assumed allowable; other checks still matter.')][stage]
    c.footer(*info,t,11.2);return c.finish()

# 03: Units stay with values. Cancellation is an explicit matching pair.
def cancellation(t):
    c=Canvas();c.header(3,'Let the units cancel')
    panel(c,36,128,888,282)
    c.text(480,158,'Convert 240 millimetres to inches',23,MUTED,'sans','mm')
    c.text(130,246,'240',47,INK,'math','mm');c.text(222,246,'mm',41,TEAL,'math','mm')
    c.text(301,246,'×',43,MUTED,'math','mm')
    c.text(460,210,'1 in',39,BRASS,'math','mm')
    c.line([(352,248),(568,248)],INK,2)
    c.text(421,286,'25.4',37,INK,'math','mm');c.text(522,286,'mm',37,TEAL,'math','mm')
    a=ease((t-2)/1.2)
    if a>0:
        c.line([(193,263),(193+60*a,263-36*a)],RED,4)
        c.line([(493,302),(493+57*a,302-34*a)],RED,4)
        c.dash((224,275),(512,319),TEAL,2,6,6)
    if t>4:
        c.text(617,246,'=',35,MUTED,'math','mm')
        c.text(764,246,'9.45 in',42,BRASS,'math','mm')
        c.pill(672,302,'inches remain',GOLD,BRASS,19)
    else:c.text(750,245,'?',54,MUTED,'math','mm')
    c.text(480,375,'1 inch and 25.4 mm are exactly the same length.',21,MUTED,'sans','mm',maxw=820)
    info=('Choose the factor','Put the unwanted unit on the opposite side of the fraction.') if t<2 else ('Cancel matching units','mm ÷ mm = 1. The physical length has not changed.') if t<4 else ('Check the size','240 mm is about 10 inches, not 100 inches.')
    c.footer(*info,t,8.8);return c.finish()

# 04: One square metre = a 100-by-100 grid of centimetre squares.
def powered_units(t):
    c=Canvas();c.header(4,'Square the conversion factor')
    x,y,side=83,162,226
    p=ease((t-1.4)/3.2)
    c.rect((x,y,x+side,y+side),MINT,TEAL,3)
    # Reveal a genuine 100 by 100 subdivision; major grid every 10 squares.
    lines=round(p*100)
    for n in range(1,lines):
        col=TEAL if n%10==0 else blend(MINT,TEAL,.27)
        c.line([(x+n*side/100,y),(x+n*side/100,y+side)],col,1 if n%10==0 else .45)
        c.line([(x,y+n*side/100),(x+side,y+n*side/100)],col,1 if n%10==0 else .45)
    c.text(196,139,'1 m = 100 cm',23,INK,'math','mm')
    c.text(196,412,'1 square metre',21,TEAL,'sans','mm')
    panel(c,379,148,545,263)
    c.text(651,187,'LENGTH',15,MUTED,'bold','mm')
    c.text(651,221,'1 m = 100 cm',31,INK,'math','mm')
    c.text(651,277,'AREA',15,TEAL,'bold','mm')
    c.text(651,312,'1 m² = 100 × 100 cm²',30,TEAL,'math','mm')
    if t>4.6:c.text(651,373,'1 m² = 10,000 cm²',34,TEAL,'math','mm')
    else:c.text(651,373,'Convert both side lengths.',22,MUTED,'sans','mm')
    c.footer('Two dimensions','A squared unit needs a squared conversion factor.',t,9.6)
    return c.finish()

# 05: Geometric similarity; mass scaling also needs unchanged density.
def scaling(t):
    c=Canvas();c.header(5,'Size changes faster than you think')
    k=tween(t,1.4,4.6,1,2)
    c.pill(36,125,f'Length scale  k = {k:.2f}')
    c.text(253,201,'AREA',16,MUTED,'bold','mm');c.text(696,201,'VOLUME',16,MUTED,'bold','mm')
    side=70*k; x=253-side/2; y=379-side
    c.rect((x,y,x+side,y+side),MINT,TEAL,3)
    if k>1.999:
        c.line([(x+70,y),(x+70,y+side)],TEAL,2);c.line([(x,y+70),(x+side,y+70)],TEAL,2)
    c.label(253,y+side/2,f'{k*k:.1f}A',26,TEAL,MINT,2)
    c.text(253,408,'Area × k²',25,TEAL,'math','mm')
    a=63*k; d=31*k; z=19*k; x=674-a/2;y=379-a
    c.poly([(x,y),(x+d,y-z),(x+a+d,y-z),(x+a,y)],GOLD,BRASS,2)
    c.poly([(x+a,y),(x+a+d,y-z),(x+a+d,y+a-z),(x+a,y+a)],'#d4b489',BRASS,2)
    c.poly([(x,y),(x+a,y),(x+a,y+a),(x,y+a)],PAPER,BRASS,2)
    if k>1.999:
        c.line([(x+a/2,y),(x+a/2,y+a)],BRASS,1.5)
        c.line([(x,y+a/2),(x+a,y+a/2)],BRASS,1.5)
        c.line([(x+a/2,y),(x+a/2+d,y-z)],BRASS,1.5)
        c.line([(x+d/2,y-z/2),(x+a+d/2,y-z/2)],BRASS,1.5)
        c.line([(x+a+d/2,y-z/2),(x+a+d/2,y+a-z/2)],BRASS,1.5)
        c.line([(x+a,y+a/2),(x+a+d,y+a/2-z)],BRASS,1.5)
    c.label(x+a/2,y+a/2,f'{k**3:.1f}V',22,BRASS,PAPER,3)
    c.text(696,408,'Volume × k³',25,BRASS,'math','mm')
    c.footer('Keep the shape the same','At 2× length: 4× area and 8× volume. Same density → 8× mass.',t,9.6)
    return c.finish()

# 06: Separate slope from vertical offset; graph values are in arbitrary units.
def slope(t):
    c=Canvas();c.header(6,'Slope changes the rate. Intercept shifts the line.')
    b=tween(t,5.3,6.8,3,5);x=tween(t,.9,3.5,0,4)
    ox,oy,sx,sy=104,414,75,20
    for xx in range(6):
        c.line([(ox+xx*sx,151),(ox+xx*sx,oy)],LINE,1)
        c.text(ox+xx*sx,429,str(xx),17,MUTED,'math','mm')
    for yy in (0,3,5,7,9,11,13):
        c.line([(ox,oy-yy*sy),(ox+375,oy-yy*sy)],LINE,1)
        c.text(ox-16,oy-yy*sy,str(yy),16,MUTED,'math','rm')
    c.arrow((ox,oy),(498,oy),MUTED,2,9);c.arrow((ox,oy),(ox,132),MUTED,2,9)
    c.text(513,422,'x',23,INK,'math','mm');c.text(85,132,'y',23,INK,'math','mm')
    pts=[(ox+q*sx,oy-(2*q+b)*sy) for q in np.linspace(0,(13-b)/2,60)]
    c.line(pts,TEAL,4)
    px=ox+x*sx;py=oy-(2*x+b)*sy
    c.dash((ox,oy-b*sy),(px,oy-b*sy),BRASS,3)
    c.dash((px,oy-b*sy),(px,py),BRASS,3)
    c.circle(ox,oy-b*sy,6,BRASS);c.circle(px,py,8,TEAL)
    if x>.7:
        c.label((ox+px)/2,oy-b*sy+23,f'run {x:.1f}',18,BRASS,BG,4)
        c.label(px+47,(oy-b*sy+py)/2,f'rise {2*x:.1f}',18,BRASS,BG,4)
    panel(c,561,147,363,267)
    c.text(741,192,f'y = 2x + {b:.1f}',33,TEAL,'math','mm')
    c.text(585,247,'Slope',22,MUTED);c.text(899,247,'2',29,TEAL,'math','ra')
    c.text(585,297,'Intercept',22,MUTED);c.text(899,297,f'{b:.1f}',29,BRASS,'math','ra')
    c.text(741,374,'rise / run = 2',26,INK,'math','mm')
    c.footer('Track the change','Each 1 step right gives 2 steps up.' if t<5.3 else 'Changing b shifts the line, but its slope stays 2.',t,9.6)
    return c.finish()

# 07: Angle measured from +x; projected components recombine to 500 N.
def vectors(t):
    c=Canvas();c.header(7,'Split the force without changing it','PHYSICS / VECTORS')
    theta=tween(t,1,3,0,35) if t<5 else tween(t,5,7,35,90)
    ang=math.radians(theta);ox,oy,r=132,402,254
    px,py=ox+r*math.cos(ang),oy-r*math.sin(ang)
    c.arrow((ox-35,oy),(439,oy),MUTED,2,10);c.arrow((ox,oy+10),(ox,131),MUTED,2,10)
    c.text(453,402,'+x',21,MUTED,'math','mm');c.text(107,129,'+y',21,MUTED,'math','mm')
    c.dash((px,py),(px,oy),BRASS,2);c.dash((px,py),(ox,py),TEAL,2)
    c.arrow((ox,oy),(px,oy),TEAL,6,15)
    c.arrow((ox,oy),(ox,py),BRASS,6,15)
    c.arrow((ox,oy),(px,py),INK,5,16)
    c.arc((ox,oy),62,0,ang,TEAL,3)
    c.text(222,372,f'{theta:.0f}°',24,TEAL,'math','mm')
    if theta>8 and theta<78:
        c.label((ox+px)/2+20,(oy+py)/2-28,'500 N',24,INK,BG,6)
    c.text(310,425,'Fx',22,TEAL,'math','mm');c.text(61,263,'Fy',22,BRASS,'math','mm')
    panel(c,530,136,394,291)
    c.text(727,172,'Same force: 500 N',22,INK,'bold','mm')
    c.text(552,214,'Fx = 500 cos θ',28,TEAL,'math')
    c.text(900,256,f'{500*math.cos(ang):.0f} N',32,TEAL,'math','ra')
    c.text(552,303,'Fy = 500 sin θ',28,BRASS,'math')
    c.text(900,345,f'{500*math.sin(ang):.0f} N',32,BRASS,'math','ra')
    c.text(727,402,'√(Fx² + Fy²) = 500 N',24,INK,'math','mm')
    c.footer('Angle measured from +x','At 0° it is all horizontal; at 90° it is all vertical.',t,10.4)
    return c.finish()

# 08: Arc length is the geometric definition of radians.
def radians(t):
    c=Canvas();c.header(8,'A radian is a radius of arc')
    if t<3:th=tween(t,.8,2,0,1)
    elif t<6:th=tween(t,3.5,5,1,math.pi)
    else:th=tween(t,6.3,8,math.pi,2*math.pi)
    cx,cy,r=232,278,123
    c.circle(cx,cy,r,PAPER,LINE,2)
    for q in np.arange(0,2*math.pi,.1):
        c.line([(cx+r*math.cos(q),cy-r*math.sin(q)),(cx+(r+4)*math.cos(q),cy-(r+4)*math.sin(q))],LINE,1)
    c.line([(cx,cy),(cx+r,cy)],MUTED,2)
    c.arc((cx,cy),r,0,th,BRASS,8)
    c.arrow((cx,cy),(cx+r*math.cos(th),cy-r*math.sin(th)),TEAL,4,11)
    c.arc((cx,cy),39,0,min(th,2*math.pi-.015),TEAL,3)
    c.circle(cx,cy,4,INK)
    c.text(290,295,'r',25,TEAL,'math','mm')
    c.text(232,421,'gold arc = s',23,BRASS,'math','mm')
    panel(c,460,141,464,282)
    c.text(692,194,'θ = s / r',43,TEAL,'math','mm')
    c.text(692,255,f'θ = {th:.2f} rad',32,INK,'math','mm')
    c.text(692,299,f'{math.degrees(th):.1f}°',25,MUTED,'math','mm')
    if t<3.5:caption='1 rad: arc length equals radius'
    elif t<6.3:caption='π rad = half a turn = 180°'
    else:caption='2π rad = one full turn = 360°'
    c.text(692,380,caption,23,BRASS,'math','mm',maxw=431)
    c.footer('Geometry sets the unit','Divide arc length by radius; the length units cancel.',t,11.2)
    return c.finish()

# 09: Ideal Coulomb model. N is prescribed; the motion is schematic, not timed data.
def friction(t):
    c=Canvas();c.header(9,'Static friction matches the push','PHYSICS / FORCES')
    sliding=t>=5.6
    push=tween(t,.8,4.3,0,40) if not sliding else 50
    fr=push if not sliding else 30
    shift=7*max(0,t-5.6)**2;shift=min(shift,85)
    bx=273+shift;by=296
    c.text(37,127,'N = 100 N    μs = 0.40    μk = 0.30',21,MUTED,'math')
    c.line([(48,345),(615,345)],INK,3)
    for x in range(48,610,18):c.line([(x,345),(x-10,357)],LINE,2)
    if sliding:
        for j in range(3):c.line([(bx-84-j*20,282),(bx-74-j*20,282)],LINE,2)
    c.rect((bx-57,248,bx+57,343),PAPER,TEAL,2,r=7)
    c.text(bx,280,'crate',23,TEAL,'bold','mm')
    c.arrow((bx+57,310),(bx+57+push*2.5,310),TEAL,5,12)
    c.arrow((bx-57,322),(bx-57-fr*2.5,322),BRASS,5,12)
    c.arrow((bx,248),(bx,181),MUTED,3,10)
    c.text(bx,165,'N',23,MUTED,'math','mm')
    c.arrow((bx,343),(bx,404),MUTED,3,10)
    c.text(bx+30,401,'mg',20,MUTED,'math','mm')
    if push>4:
        c.label(bx+57+push*1.25,285,f'{push:.0f} N',21,TEAL,BG,3)
        c.label(bx-57-fr*1.25,291,f'{fr:.0f} N',21,BRASS,BG,3)
    c.pill(47,378,'SLIDING →' if sliding else 'AT REST',GOLD if sliding else MINT,BRASS if sliding else TEAL,18)
    panel(c,651,172,273,251)
    c.text(788,207,'STATIC LIMIT',15,MUTED,'bold','mm')
    c.text(788,248,'μsN = 40 N',26,INK,'math','mm')
    c.line([(669,287),(906,287)],LINE)
    c.text(788,323,'Net horizontal force',17,MUTED,'sans','mm')
    c.text(788,368,'20 N →' if sliding else '0 N',31,TEAL,'math','mm')
    c.footer('Ideal friction model','Static friction rises with the push, up to 40 N.' if not sliding else 'After slipping: 50 N push − 30 N kinetic friction = 20 N.',t,9.6)
    return c.finish()

# 10: End-view cross section under the same axial tensile load.
def stress(t):
    c=Canvas();c.header(10,'Same load. More area. Less stress.','PHYSICS / MATERIALS')
    area=tween(t,1.2,3,40,80) if t<4.7 else tween(t,4.7,6.7,80,160)
    sig=12000/area
    c.pill(36,123,'Constant tensile load: 12,000 N')
    side=98*math.sqrt(area/40);cx,cy=268,291
    c.rect((cx-side/2,cy-side/2,cx+side/2,cy+side/2),MINT,TEAL,3)
    c.label(cx,cy,f'{area:.0f} mm²',22,TEAL,MINT,4)
    c.text(268,417,'Cross-section end view',19,MUTED,'sans','mm')
    panel(c,520,171,404,252)
    c.text(722,214,'σ = F / A',40,TEAL,'math','mm')
    c.text(544,267,'Area',23,MUTED);c.text(900,269,f'{area:.0f} mm²',29,INK,'math','ra')
    c.text(544,333,'Stress',23,MUTED);c.text(900,335,f'{sig:.0f} MPa',32,TEAL,'math','ra')
    c.text(722,396,'1 N/mm² = 1 MPa',22,MUTED,'math','mm')
    c.footer('Uniform axial stress','Doubling area halves stress. This alone is not a safety check.',t,10.4)
    return c.finish()

# 11: Small-deflection Euler-Bernoulli cantilever, tip load.
def beam(t):
    c=Canvas();c.header(11,'A little more depth makes a big difference','PHYSICS / BENDING')
    load=tween(t,.8,3.8,0,1)
    c.text(36,126,'Same length, width, material and tip load',21,MUTED)
    x0,x1=90,540
    for yy,h,ratio,title in [(216,10,1,'h = 2 mm'),(352,20,8,'h = 4 mm')]:
        c.rect((59,yy-44,88,yy+57),SOFT,MUTED,1)
        for j in range(8):c.line([(61,yy-40+j*12),(86,yy-25+j*12)],LINE,2)
        dp=47*load/ratio
        def shape(x):
            u=(x-x0)/(x1-x0);return yy+dp*u*u*(3-u)/2
        xx=np.linspace(x0,x1,85)
        c.poly([(x,shape(x)-h/2) for x in xx]+[(x,shape(x)+h/2) for x in xx[::-1]],MINT,TEAL,2)
        c.dash((x0,yy),(x1,yy),LINE,1,5,5)
        c.text(112,yy-58,title,25,INK,'math')
        if load>.06:c.arrow((x1,shape(x1)-h/2-57),(x1,shape(x1)-h/2),BRASS,4,11)
        c.text(x1+37,shape(x1)-h/2-40,f'{5*load:.1f} N',20,BRASS,'math','mm')
        c.text(382,shape(x1)+h/2+25,f'δ = {13.5*load/ratio:.2f} mm',21,TEAL,'math','mm')
    panel(c,671,173,253,250)
    c.text(797,206,'I = bh³ / 12',26,TEAL,'math','mm')
    c.text(797,259,'2× depth',27,INK,'math','mm')
    c.text(797,307,'8× I',33,TEAL,'math','mm')
    c.text(797,357,'⅛ deflection',27,TEAL,'math','mm')
    c.text(797,401,'Shape exaggerated',16,MUTED,'sans','mm')
    c.footer('Linear-elastic cantilever','δ = FL³/(3EI). More depth increases I much faster than width.',t,9.6)
    return c.finish()

# 12: A frictionless, non-rotating slider. q is fraction of the vertical drop.
def energy(t):
    c=Canvas();c.header(12,'Trade height for speed','PHYSICS / ENERGY')
    elapsed=clamp((t-1.1)/4.7);q=elapsed**2
    a=(126,208);b=(565,386);dx=b[0]-a[0];dy=b[1]-a[1];length=math.hypot(dx,dy)
    p=(a[0]+dx*q,a[1]+dy*q)
    n=(dy/length,-dx/length)
    cx,cy=p[0]+n[0]*19,p[1]+n[1]*19
    c.text(36,126,'Frictionless slider · no rotation · m = 2 kg',20,MUTED)
    c.poly([a,b,(b[0],421),(a[0],421)],SOFT)
    c.line([a,b],INK,3)
    c.circle(cx,cy,18,MINT,TEAL,3);c.text(cx,cy,'m',19,TEAL,'math','mm')
    c.dash((92,a[1]),(92,b[1]),MUTED,2)
    c.line([(84,a[1]),(100,a[1])],MUTED,2);c.line([(84,b[1]),(100,b[1])],MUTED,2)
    c.label(70,294,'2 m',20,MUTED,BG,3)
    height=2*(1-q);speed=math.sqrt(2*9.81*2*q);e=2*9.81*2
    c.label(342,414,f'h = {height:.2f} m    v = {speed:.2f} m/s',22,INK,BG,4)
    c.text(768,137,f'TOTAL = {e:.1f} J',24,INK,'bold','mm')
    for x,fraction,col,name in [(655,1-q,TEAL,'mgh'),(798,q,BRASS,'½mv²')]:
        c.rect((x,190,x+83,394),PAPER,LINE,1,r=5)
        if fraction>.005:c.rect((x,394-204*fraction,x+83,394),col,r=4)
        c.text(x+41,416,name,23,col,'math','mm')
        c.label(x+41,174,f'{e*fraction:.1f} J',20,col,BG,3)
    c.footer('Conservation of mechanical energy','Height falls and speed rises. Potential + kinetic stays constant.',t,9.6)
    return c.finish()

ASSETS = [
 dict(id='01-equality-balance',title='Keep both sides balanced',fn=equality,duration=9.6,poster=6.6,lesson='math/algebra',concept='equality-addition',
      takeaway='Adding 7 to both sides of x − 7 = 12 preserves equality and gives x = 19.',
      alt='A level balance carries x minus 7 on one pan and 12 on the other. Plus 7 is added equally to both pans. The balance stays level as the equation simplifies to x equals 19.',
      notes='The balance is an analogy for equality, not a dynamic scale simulation.'),
 dict(id='02-rearrange-stress',title='Run the formula backward',fn=rearrange,duration=11.2,poster=8.5,lesson='math/algebra',concept='rearrange-formula',
      takeaway='Multiply σ = F/A by A, then divide by σ. With F = 12,000 N and σ = 150 N/mm², A = 80 mm².',
      alt='Four stages rearrange the stress formula: sigma equals force over area; sigma times area equals force; area equals force over sigma; the substituted result is 80 square millimetres. A final substitution checks the original equation.',
      notes='Assumes nonzero area and a positive specified allowable stress. Reaching an allowable is not approval of a complete structural design.'),
 dict(id='03-unit-cancellation',title='Let the units cancel',fn=cancellation,duration=8.8,poster=6.4,lesson='math/ratios-units',concept='factor-label',
      takeaway='240 mm × (1 in / 25.4 mm) leaves inches; the rounded result is 9.45 in.',
      alt='The conversion factor has inches above millimetres. The millimetres in the original measurement and denominator are struck through together, leaving 9.45 inches.',
      notes='1 inch = 25.4 mm exactly. The display rounds 240/25.4 to two decimal places for teaching.'),
 dict(id='04-powered-units',title='Square the conversion factor',fn=powered_units,duration=9.6,poster=6.5,lesson='math/powers',concept='powers-of-ten',
      takeaway='A square 1 m on each side contains 100 × 100 square centimetres: 1 m² = 10,000 cm².',
      alt='A one-metre square is subdivided into a 100-by-100 grid. The equation changes from the length conversion to the squared conversion, showing 10,000 square centimetres.',
      notes='The fine grid represents 100 centimetres along each side; stronger grid lines mark every tenth division.'),
 dict(id='05-size-area-volume',title='Size changes faster than you think',fn=scaling,duration=9.6,poster=6.6,lesson='math/ratios-units',concept='powers-of-ten',
      takeaway='A geometrically similar object at twice every length has four times the area and eight times the volume.',
      alt='A square and cube grow from scale factor one to two. The final square is divided into four equal squares, and the visible cube faces into a two-by-two grid. Labels show area times four and volume times eight.',
      notes='Mass also scales by eight only when density remains unchanged.'),
 dict(id='06-slope-intercept',title='Slope and intercept',fn=slope,duration=9.6,poster=4.3,lesson='math/graphs',concept='slope-intercept',
      takeaway='For y = 2x + b, each unit of run adds two units of rise. Moving b shifts the line without changing the slope.',
      alt='A point travels along y equals 2x plus 3 while its rise and run are traced. Then the intercept increases to 5 and the whole line moves upward, retaining slope 2.',
      notes='The axes use arbitrary numerical units; the graph is a mathematical line, not measured sensor data.'),
 dict(id='07-vector-components',title='Split a force into components',fn=vectors,duration=10.4,poster=4.1,lesson='math/triangles-vectors',also=['physics/veccomp'],concept='component-resolution',
      takeaway='At 35° above +x, a 500 N force has Fx ≈ 410 N and Fy ≈ 287 N. Their vector sum is still the original force.',
      alt='A 500-newton arrow rotates from horizontal through 35 degrees to vertical. Its horizontal and vertical projections change, but the reconstructed magnitude stays at 500 newtons.',
      notes='Angle is measured counterclockwise from +x. Component values are rounded to whole newtons.'),
 dict(id='08-radians',title='A radian is a radius of arc',fn=radians,duration=11.2,poster=2.6,lesson='math/triangles-vectors',concept='radians',
      takeaway='Radians are arc length divided by radius. One radian has an arc as long as the radius; π radians is half a turn.',
      alt='A radius sweeps around a circle and highlights the intercepted arc. The animation pauses at one radian, pi radians, and two pi radians, showing the corresponding angles in degrees.',
      notes='The circle demonstrates angle geometry; the sweep timing is instructional.'),
 dict(id='09-static-friction',title='Static friction matches the push',fn=friction,duration=9.6,poster=3.15,lesson='physics/contact',concept='static-friction',
      takeaway='With N = 100 N and μs = 0.40, static friction can match a push up to 40 N. After slip, μk = 0.30 gives 30 N friction.',
      alt='A crate stays still as equal opposing push and static-friction arrows grow toward 40 newtons. A 50-newton push causes sliding; kinetic friction is 30 newtons, leaving 20 newtons net to the right.',
      notes='Ideal dry Coulomb friction with prescribed normal load and no other horizontal forces. Motion is schematic rather than a calibrated displacement-time plot.'),
 dict(id='10-stress-area',title='Same load, more area, less stress',fn=stress,duration=10.4,poster=7.2,lesson='physics/elastic',concept='stress-strain',
      takeaway='Under 12,000 N axial tension, areas of 40, 80 and 160 mm² give average stresses of 300, 150 and 75 MPa.',
      alt='An end-view cross-section grows while the axial load stays fixed. The displayed stress falls inversely with area: 300 to 150 to 75 megapascals.',
      notes='Uniform average axial stress, σ = F/A. Does not include stress concentrations, bending, buckling, or a material allowable.'),
 dict(id='11-beam-depth',title='Beam depth and bending stiffness',fn=beam,duration=9.6,poster=6.1,lesson='physics/bending',concept='second-moment-area',
      takeaway='For equal width, length, material and tip load, doubling rectangular beam depth gives 8× I and one-eighth of the deflection.',
      alt='Two cantilever beams receive equal growing tip loads. The 2-millimetre-deep beam deflects 13.50 millimetres; the 4-millimetre-deep beam deflects 1.69 millimetres. The visible bending is exaggerated.',
      notes='Linear elastic, slender, small-deflection cantilevers. E = 200 GPa, L = 300 mm, b = 25 mm, F = 5 N, h = 2 or 4 mm. Visual thickness and bending are enlarged for clarity.'),
 dict(id='12-energy-conversion',title='Trade height for speed',fn=energy,duration=9.6,poster=4.4234018716,lesson='physics/potential',concept=None,
      takeaway='For a 2 kg frictionless slider dropping 2 m from rest, 39.24 J of potential energy becomes kinetic energy; the final speed is about 6.26 m/s.',
      alt='A non-rotating slider moves down a straight ramp. Its potential-energy bar shrinks as its kinetic-energy bar grows by the same amount. Total mechanical energy stays at about 39.2 joules.',
      notes='No friction, drag, rolling energy or other losses. Uses g = 9.81 m/s². The playback timeline is slowed for teaching.'),
]

def render_one(spec,ffmpeg: str):
    OUT.mkdir(parents=True,exist_ok=True)
    path=OUT/spec['id']; duration=spec['duration']
    count=round(duration*FPS); first=spec['fn'](0)
    frames=[]
    for i in range(count):
        t=i/FPS
        im=spec['fn'](t)
        if t>duration-.64: im=Image.blend(im,first,ease((t-(duration-.64))/.64))
        frames.append(im)
    spec['fn'](spec['poster']).save(path.with_suffix('.png'),optimize=True)
    # One shared palette prevents per-frame colour flicker; no dithering.
    palette_image=Image.new('RGB',(W,8*H))
    for j,idx in enumerate(np.linspace(0,count-1,8,dtype=int)):
        palette_image.paste(frames[idx],(0,j*H))
    pal=palette_image.quantize(colors=128,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    quantized=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in frames]
    quantized[0].save(path.with_suffix('.gif'),save_all=True,append_images=quantized[1:],duration=FRAME_MS,
                      loop=0,disposal=1,optimize=True)
    cmd=[ffmpeg,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo',
         '-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','-',
         '-an','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',
         '-movflags','+faststart','-threads','2',str(path.with_suffix('.mp4'))]
    with subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE) as proc:
        try:
            for frame in frames: proc.stdin.write(frame.tobytes())
            proc.stdin.close();err=proc.stderr.read();rc=proc.wait()
        except BrokenPipeError:
            err=proc.stderr.read();rc=proc.wait();raise RuntimeError(err.decode())
        if rc:raise RuntimeError(f'FFmpeg failed: {err.decode()}')
    # Low-resolution multi-stage contact sheet for review; not part of media embeds.
    sheet=Image.new('RGB',(960,540),BG)
    samples=[0.7,2.5,4.7,min(duration-1,7.5)]
    for j,t in enumerate(samples):
        sample=spec['fn'](t).resize((480,270),Image.Resampling.LANCZOS)
        sheet.paste(sample,((j%2)*480,(j//2)*270))
    (ROOT/'review').mkdir(exist_ok=True)
    sheet.save(ROOT/'review'/f"{spec['id']}-stages.jpg",quality=90)
    print(f"{spec['id']}: {count} frames, {duration:.1f}s, GIF {path.with_suffix('.gif').stat().st_size/1024:.0f} KB / MP4 {path.with_suffix('.mp4').stat().st_size/1024:.0f} KB",flush=True)

def metadata():
    result=[]
    for a in ASSETS:
        d={k:v for k,v in a.items() if k not in ('fn','poster')}
        d.update(width=W,height=H,fps=FPS,loop=True,posterTime=a['poster'],
                 gif=f"/learn-media/{a['id']}.gif",mp4=f"/learn-media/{a['id']}.mp4",poster=f"/learn-media/{a['id']}.png")
        if (OUT/f"{a['id']}.gif").exists():
            d['bytes']={ext:(OUT/f"{a['id']}.{ext}").stat().st_size for ext in ('gif','mp4','png')}
        result.append(d)
    (ROOT/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--only',help='Comma-separated asset IDs to render')
    p.add_argument('--metadata-only',action='store_true')
    args=p.parse_args()
    if args.metadata_only:metadata();return
    ffmpeg=shutil.which('ffmpeg')
    if not ffmpeg:raise SystemExit('FFmpeg is required for MP4 export. Install it and put ffmpeg on PATH.')
    selected=set(args.only.split(',')) if args.only else {a['id'] for a in ASSETS}
    unknown=selected-{a['id'] for a in ASSETS}
    if unknown:raise SystemExit(f'Unknown asset IDs: {sorted(unknown)}')
    for spec in ASSETS:
        if spec['id'] in selected:render_one(spec,ffmpeg)
    metadata()

if __name__=='__main__':main()
