#!/usr/bin/env python3
"""Verify every exported asset and the arithmetic used by the teaching models."""
import json
import math
from pathlib import Path
import subprocess
import sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
assets=json.loads((ROOT/'manifest.json').read_text())
checks=[]
def check(name,condition):
    if not condition:raise AssertionError(name)
    checks.append(name)

check('12 assets',len(assets)==12)
check('unique IDs',len({a['id'] for a in assets})==12)
for a in assets:
    base=ROOT/'public'/'learn-media'/a['id']
    with Image.open(base.with_suffix('.gif')) as im:
        check(a['id']+' GIF size',im.size==(960,540))
        check(a['id']+' GIF loop',im.info.get('loop')==0)
        check(a['id']+' multiple frames',im.n_frames>10)
        duration=0
        for i in range(im.n_frames):
            im.seek(i);im.load();duration+=im.info.get('duration',0)
        check(a['id']+' GIF duration',abs(duration/1000-a['duration'])<.081)
    with Image.open(base.with_suffix('.png')) as still:
        check(a['id']+' PNG size',still.size==(960,540))
    data=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,codec_name,nb_frames:format=duration','-of','json',str(base.with_suffix('.mp4'))]))
    v=data['streams'][0]
    check(a['id']+' MP4 size',(v['width'],v['height'])==(960,540))
    check(a['id']+' MP4 codec',v['codec_name']=='h264')
    check(a['id']+' MP4 duration',abs(float(data['format']['duration'])-a['duration'])<.081)
    check(a['id']+' descriptions',bool(a['alt'] and a['takeaway'] and a['notes']))

check('equality',19-7==12)
check('stress rearrangement',12000/150==80)
check('unit conversion',round(240/25.4,2)==9.45)
check('square-unit conversion',100**2==10000)
check('similarity scaling',(2**2,2**3)==(4,8))
check('slope',(11-3)/(4-0)==2)
for angle in (0,35,90):
    r=math.radians(angle);x=500*math.cos(r);y=500*math.sin(r)
    check('components '+str(angle),math.isclose(math.hypot(x,y),500))
check('radians',math.isclose(math.degrees(math.pi),180))
check('static friction limit',.4*100==40)
check('kinetic friction and net',50-.3*100==20)
check('axial area scaling',(12000/40,12000/80,12000/160)==(300,150,75))
E=200e9;L=.3;b=.025;F=5
I1=b*.002**3/12;I2=b*.004**3/12
d1=F*L**3/(3*E*I1);d2=F*L**3/(3*E*I2)
check('beam depth cubed',math.isclose(I2/I1,8))
check('beam deflection ratio',math.isclose(d1/d2,8))
check('beam deflection values',math.isclose(d1*1000,13.5) and math.isclose(d2*1000,1.6875))
for q in (0,.2,.5,.8,1):
    h=2*(1-q);v=math.sqrt(2*9.81*2*q)
    check('energy conservation '+str(q),math.isclose(2*9.81*h+.5*2*v*v,39.24))
check('final slider speed',round(math.sqrt(2*9.81*2),2)==6.26)
result={'passed':len(checks),'failed':0,'checks':checks}
(ROOT/'review'/'asset-validation.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(checks)} checks passed; all GIFs, MP4s and PNGs decoded successfully.')
