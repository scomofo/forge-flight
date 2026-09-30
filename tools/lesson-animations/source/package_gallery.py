#!/usr/bin/env python3
"""Create the offline galleries and typed integration manifest after rendering."""
from __future__ import annotations
import base64
import html
import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
from render import ROOT, OUT, metadata

def data_url(p:Path,mime:str) -> str:
    return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()

def gallery(assets,standalone:bool) -> str:
    cards=[]
    for i,a in enumerate(assets):
        name=a['id'];e=html.escape
        src=data_url(OUT/(name+'.mp4'),'video/mp4') if standalone else 'public/learn-media/'+name+'.mp4'
        poster=data_url(OUT/(name+'.png'),'image/png') if standalone else 'public/learn-media/'+name+'.png'
        links='' if standalone else f'<a href="public/learn-media/{name}.gif" download>GIF</a><a href="public/learn-media/{name}.mp4" download>MP4</a><a href="public/learn-media/{name}.png" download>Still</a>'
        group='math' if a['lesson'].startswith('math/') else 'physics'
        cards.append(f'''<article class="card" data-group="{group}">
          <div class="media"><video controls muted loop playsinline preload="none" width="960" height="540" poster="{poster}" aria-label="{e(a['title'])}" aria-describedby="desc-{i}"><source src="{src}" type="video/mp4"></video><img class="still" hidden src="{poster}" width="960" height="540" alt="{e(a['alt'])}"></div>
          <div class="body"><div class="eyebrow">{e(a['lesson'])} <span>{a['duration']:.1f} seconds</span></div>
          <h2>{i+1:02d}. {e(a['title'])}</h2><p id="desc-{i}">{e(a['takeaway'])}</p>
          <div class="actions"><button type="button" class="mode" aria-pressed="false">Show still</button>{links}</div>
          <details><summary>Sequence and model limits</summary><p>{e(a['alt'])}</p><p>{e(a['notes'])}</p></details></div>
        </article>''')
    css='''
    :root{color-scheme:light;--bg:#efeae1;--paper:#f7f4ee;--ink:#1a1814;--muted:#534e47;--line:#ddd6c8;--teal:#0e5c56}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,sans-serif}
    header,main,footer{max-width:1280px;margin:auto;padding:32px}.brand{font-weight:700;color:var(--teal);letter-spacing:.14em;font-size:12px}h1{font:normal clamp(34px,5vw,64px)/1.1 Georgia,serif;margin:18px 0}header p{max-width:740px;color:var(--muted);font-size:18px}.tags{display:flex;gap:10px;flex-wrap:wrap}.tag{padding:6px 13px;border:1px solid var(--line);border-radius:30px;font-size:13px}
    .toolbar{position:sticky;top:0;z-index:5;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--bg);padding:14px 32px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}.toolbar-wrap{max-width:1216px;width:100%;margin:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center}.hint{font-size:13px;color:var(--muted);margin-left:auto}
    button,a{font:inherit}button{cursor:pointer;min-height:44px;padding:9px 15px;background:var(--paper);border:1px solid var(--line);border-radius:7px;color:var(--teal)}button[aria-pressed=true]{background:var(--teal);color:white;border-color:var(--teal)}a{color:var(--teal);text-underline-offset:3px;padding:8px}button:focus-visible,a:focus-visible,summary:focus-visible,video:focus-visible{outline:3px solid var(--teal);outline-offset:3px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.card{border:1px solid var(--line);border-radius:12px;background:var(--paper);overflow:hidden}.card[hidden]{display:none}.media{background:var(--bg)}video,img{display:block;max-width:100%;height:auto;width:100%;aspect-ratio:16/9}video[hidden],img[hidden]{display:none}.body{padding:20px}.eyebrow{display:flex;justify-content:space-between;gap:10px;color:var(--teal);font-size:12px;font-weight:600;flex-wrap:wrap}h2{font:normal 26px/1.2 Georgia,serif;margin:13px 0 10px}.body p{color:var(--muted);font-size:15px}.actions{display:flex;gap:8px;align-items:center;margin:17px 0;flex-wrap:wrap}details{border-top:1px solid var(--line);padding-top:8px;font-size:14px}summary{min-height:44px;padding:10px 0;cursor:pointer;color:var(--teal)}footer{border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
    @media(max-width:750px){header,main,footer{padding:22px 16px}.toolbar{padding:10px 16px}.grid{grid-template-columns:1fr;gap:20px}.hint{width:100%;margin-left:0}.body{padding:16px}h2{font-size:24px}}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
    '''
    js='''
    const videos=[...document.querySelectorAll('video')];
    videos.forEach(v=>v.addEventListener('play',()=>videos.forEach(other=>{if(other!==v)other.pause()})));
    document.querySelector('#stop').addEventListener('click',()=>videos.forEach(v=>v.pause()));
    document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>{
      const card=btn.closest('.card'),v=card.querySelector('video'),still=card.querySelector('img');
      const showStill=!v.hidden;v.pause();v.hidden=showStill;still.hidden=!showStill;
      btn.textContent=showStill?'Show video':'Show still';btn.setAttribute('aria-pressed',String(showStill));
    }));
    document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
      document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
      document.querySelectorAll('.card').forEach(card=>{
        const show=btn.dataset.filter==='all'||card.dataset.group===btn.dataset.filter;
        if(!show)card.querySelector('video').pause();card.hidden=!show;
      });
    }));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(v=>v.pause())});
    const m=window.matchMedia('(prefers-reduced-motion:reduce)');
    function reduced(){if(m.matches){videos.forEach(v=>v.pause());document.querySelector('#hint').textContent='Reduced motion: all playback remains opt-in.'}}
    m.addEventListener('change',reduced);reduced();
    '''
    note='The complete ZIP contains the GIFs, MP4s, stills, source and integration examples.' if standalone else 'Media files are local. This gallery also works by opening index.html directly, with no server.'
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Forge Flight — Animation Pack 01</title><style>'+css+'</style></head><body>'+'''<header><div class="brand">FORGE FLIGHT / ANIMATION PACK 01</div><h1>Twelve ideas, shown in motion.</h1><p>A visual refresher for the Math Runway and early Physics. Press play on one clip at a time, pause on a useful step, or switch to a still.</p><div class="tags"><span class="tag">12 explanatory loops</span><span class="tag">960 × 540</span><span class="tag">GIF + MP4 + PNG</span><span class="tag">No automatic playback</span></div></header><div class="toolbar"><div class="toolbar-wrap"><button class="filter" data-filter="all" aria-pressed="true">All 12</button><button class="filter" data-filter="math" aria-pressed="false">Math 8</button><button class="filter" data-filter="physics" aria-pressed="false">Physics 4</button><button id="stop">Pause all</button><span class="hint" id="hint">Only the clip you choose will play.</span></div></div><main><div class="grid">'''+''.join(cards)+'</div></main><footer>'+note+' Each animation is a teaching model, not an engineering design check. Consult the individual model notes.</footer><script>'+js+'</script></body></html>'

def main():
    assets=metadata()
    (ROOT/'index.html').write_text(gallery(assets,False))
    (ROOT.parent/'forge-flight-animation-gallery.html').write_text(gallery(assets,True))
    fields=('id','title','duration','width','height','gif','mp4','poster','takeaway','alt','notes','lesson','concept')
    data={a['id']:{k:a[k] for k in fields} for a in assets}
    ts='''/** Generated from manifest.json. Media URLs are relative to the app's public root. */\nexport const animationAssets = '''+json.dumps(data,ensure_ascii=False,indent=2)+''' as const;\n\nexport type AnimationId = keyof typeof animationAssets;\n'''
    (ROOT/'integration'/'animation-assets.ts').write_text(ts)
    print('Wrote gallery, standalone gallery, and typed asset manifest.')

if __name__=='__main__':main()
