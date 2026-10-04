from pathlib import Path
import json,hashlib,zipfile,re,shutil,html
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).parent
catalog=json.loads((ROOT/'qa/catalog-base.json').read_text())
metas={}
for p in ROOT.glob('assets-*/metadata.json'):
 d=json.loads(p.read_text()); rows=d if isinstance(d,list) else d.get('artworks',d.get('items',[d]))
 for row in rows:
  slug=row.get('slug') or Path(row.get('file','')).stem
  metas[slug]=row
out=ROOT/'dist/batch07';out.mkdir(exist_ok=True)
for n in ['previews','downloads','qa']: (out/n).mkdir(exist_ok=True)
shell=(ROOT/'shell.html').read_text();runtime=(ROOT/'runtime.js').read_text();alltxt=[]
for a in catalog:
 slug=a['slug'];m=metas.get(slug,{});a['metadata']=m;a['description']=m.get('description',a['description']);d=out/slug;d.mkdir(exist_ok=True)
 src=(ROOT/a['source']).read_text();assert '</script' not in src.lower()
 page=shell.replace('__NUMBER__',str(a['number'])).replace('__ART__',src).replace('__RUNTIME__',runtime)
 (d/'index.html').write_text(page)
 instructions=[a['title'], '第七组 · 2026-10-04 · 待真实浏览器验收', '',a['description'],'','玩法工具：']
 instructions += ['- '+x['label'] for x in a['tools']]
 sourcefolder=ROOT/Path(a['source']).parent
 # Preserve the complete authored evidence/guide in a separately named local document.
 prose=list(sourcefolder.glob('*.txt'))+list(sourcefolder.glob('*.md'))
 for p in prose:
  if re.match(r'^\d\d-',p.name) and not p.name.startswith(f'{a["number"]:02}-'): continue
  if '说明' in p.name or '来源' in p.name or '玩法' in p.name or 'README' in p.name or 'readme' in p.name or p.name.endswith('.zh.md'):
   body=p.read_text().replace('Node渲染环境的system-ui无中文字体，Node示意图内部分中文提示缺字。集成壳/真实浏览器仍需系统中文字体和真实检查。','最终离屏预览已注册Noto中文字体；真实浏览器仍需检查系统中文字体替换。');(d/('创作说明-'+p.name)).write_text(body)
 instructions += ['']+[str(i+1)+'. '+str(x) for i,x in enumerate(m.get('steps',[]))]
 instructions += ['','具体操作顺序、参考观察、许可与旧作区别见 metadata.json 及随附创作说明。','音乐与操作音效是程序合成。第一次手势开启；声音开关可静音，重置保留静音。失焦、隐藏或离开页面停止声音，返回后再次轻触恢复。','独立HTML内嵌全部程序，不依赖CDN、在线字体或外部图片。设计为可离线使用，但本版真实断网打开尚待验收。','所有画面为本次Canvas独立绘制，声音由WebAudio合成。参考图片只作研究、不在本包再分发。第三方参考的版权不转移，不保证生成内容的独占版权。','','状态：未真实浏览器验收、未发布。预览图是Node离屏渲染，不能当作浏览器截图。']
 text='\n'.join(instructions);(d/'玩法与来源.txt').write_text(text)
 (d/'metadata.json').write_text(json.dumps(m,ensure_ascii=False,indent=2))
 for suffix in ['desktop','composed','portrait']:
  png=ROOT/'qa/renders'/f'{slug}-{suffix}.png'
  if png.exists():Image.open(png).convert('RGB').save(out/'previews'/f'{slug}-{suffix}.jpg',quality=89)
 a['html_sha256']=hashlib.sha256(page.encode()).hexdigest();a['html_bytes']=len(page.encode())
 zpath=out/'downloads'/f'{slug}.zip'
 with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in sorted(d.iterdir()):z.write(p,p.name)
 a['zip_sha256']=hashlib.sha256(zpath.read_bytes()).hexdigest();a['zip_bytes']=zpath.stat().st_size
 alltxt += [a['title'],a['description'],'独立HTML: '+slug+'/index.html','独立ZIP: downloads/'+slug+'.zip','']
(out/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
for name in ['验收边界.txt','交接验收要求.txt','renderer-checks.json','runtime-structural-checks.json','package-checks.json']:
 shutil.copyfile(ROOT/'qa'/name,out/'qa'/name)
(out/'玩法目录.txt').write_text('\n'.join(alltxt))
cards=[]
for a in catalog:
 s=a['slug'];cards.append(f'<article><a class="picture" href="{s}/index.html"><img src="previews/{s}-desktop.jpg" alt="{html.escape(a["title"])}，离屏Canvas渲染预览"></a><div class="copy"><span>{a["number"]:02} / LITTLE WORLDS</span><h2>{html.escape(a["title"])}</h2><p>{html.escape(a["description"])}</p><nav><a href="{s}/index.html">打开作品</a><a href="downloads/{s}.zip" download>独立 ZIP</a><a href="{s}/玩法与来源.txt">玩法与来源</a></nav></div></article>')
index='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>纤维与奇想 · 第七组 · 待实测</title><style>*{box-sizing:border-box}body{margin:0;background:#10272c;color:#e6dfc2;font:16px system-ui,sans-serif}main{max-width:1500px;margin:auto;padding:36px 28px 70px}header{border-bottom:1px solid #e6dfc244;padding-bottom:24px;margin-bottom:26px}.label{font-size:13px;letter-spacing:.18em;color:#aab8ab}h1{font:500 clamp(32px,5vw,59px) Georgia,serif;margin:18px 0}p{line-height:1.75}header p{max-width:900px}.notice{border-left:3px solid #d6a257;padding:0 0 0 16px}a{color:inherit;text-decoration:none}nav{display:flex;flex-wrap:wrap;gap:12px}nav a{font-size:14px;min-height:44px;display:inline-flex;align-items:center;border-bottom:1px solid #d6cba866}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}article{background:#f1ead8;color:#253436;border-radius:4px;overflow:hidden}.picture{display:block;aspect-ratio:1.42;background:#18292d}.picture img{width:100%;height:100%;object-fit:cover}.copy{padding:20px}.copy span{font-size:12px;letter-spacing:.08em;color:#62716b}h2{font-size:25px;font-weight:500;margin:12px 0}.copy p{font-size:14px;min-height:3.5em}.copy nav a{border-color:#26343550}footer{font-size:14px;line-height:1.8;margin-top:30px;opacity:.8}@media(max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){main{padding:24px 15px}.grid{grid-template-columns:1fr}.copy p{min-height:0}}</style><main><header><div class="label">LITTLE WORLDS / COLLECTION 07</div><h1>纤维与奇想 · 10 件</h1><p class="notice">待真实浏览器验收的工作版本。程序与离屏画面检查已完成；每件60–90秒桌面／触控、真实声音和断网测试尚未完成。本组尚未发布。</p><nav><a href="玩法目录.txt">中文玩法目录</a><a href="qa/验收边界.txt">已测与待测</a><a href="qa/交接验收要求.txt">验收要求</a></nav></header><div class="grid">'''+''.join(cards)+'''</div><footer>预览均为Node离屏Canvas渲染，不是浏览器截图。10件为独立Canvas与WebAudio作品，无运行时外链依赖；首次手势开启声音，可静音与重置。参考图仅研究、未嵌入或分发。</footer></main></html>'''
(out/'index.html').write_text(index)
# Contact sheet is explicitly labelled as renderer output.
font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc';ft=ImageFont.truetype(font,32);small=ImageFont.truetype(font,21)
cs=Image.new('RGB',(1680,1370),'#10272c');dr=ImageDraw.Draw(cs);dr.text((30,15),'第七组 · 10件离屏Canvas渲染预览',font=ft,fill='#e6dfc2');dr.text((30,59),'未真实浏览器验收 · 非浏览器截图 · 尚未发布',font=small,fill='#d9ae6f')
for i,a in enumerate(catalog):
 x=25+(i%5)*330;y=110+(i//5)*610
 im=Image.open(out/'previews'/f'{a["slug"]}-desktop.jpg');im.thumbnail((315,330));cs.paste(im,(x,y))
 dr.text((x,y+235),f'{i+1:02} {a["title"]}',font=small,fill='#e6dfc2')
 im=Image.open(out/'previews'/f'{a["slug"]}-composed.jpg');im.thumbnail((315,240));cs.paste(im,(x,y+283))
 dr.text((x,y+525),'初始 / 直接API组合后',font=small,fill='#acb7aa')
cs.save(ROOT/'artifacts/Batch07-离屏渲染预览-待实测.jpg',quality=91)
shutil.copyfile(ROOT/'qa/验收边界.txt',ROOT/'artifacts/Batch07-验收边界-待实测.txt')
# Include authoring sources and reproducible Node checks in the handoff zip.
stage=ROOT/'artifacts/Batch07-2026-10-04-待实测.zip'
with zipfile.ZipFile(stage,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(out.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(out))
 for p in [ROOT/'runtime.js',ROOT/'shell.html',ROOT/'build-batch07.py',ROOT/'qa/render-validate.cjs',ROOT/'qa/test-runtime.cjs',ROOT/'qa/catalog.cjs']:
  z.write(p,Path('authoring')/p.relative_to(ROOT))
 for p in sorted(ROOT.glob('assets-*/*.js')):z.write(p,Path('authoring')/p.relative_to(ROOT))
 for p in sorted(ROOT.glob('assets-*/metadata.json')):z.write(p,Path('authoring')/p.relative_to(ROOT))
 for p in sorted(ROOT.glob('assets-*/*results.json')):z.write(p,Path('authoring')/p.relative_to(ROOT))
assert stage.stat().st_size<25*1024*1024
for a in catalog:shutil.copyfile(out/'downloads'/f'{a["slug"]}.zip',ROOT/'artifacts'/f'{a["number"]:02}-{a["title"]}-待实测.zip')
print(json.dumps({'pieces':len(catalog),'metadata':len(metas),'total_zip_bytes':stage.stat().st_size,'html_bytes':sum(x['html_bytes'] for x in catalog)},ensure_ascii=False))
