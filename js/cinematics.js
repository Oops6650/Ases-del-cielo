/* ===== Cinemática de recompensas y compras: caja de suministros que cae, se carga, estalla y revela lo ganado ===== */
(function(){
const RC={common:{n:'Común',c:'#b9c6d3',m:['#707a85','#363c43','#555e68'],p:['#cfe3f5','#8fb4d6','#ffffff']},rare:{n:'Raro',c:'#4fb0ff',m:['#4f81ab','#22364d','#3a5f82'],p:['#3fa7ff','#8ad0ff','#ffffff']},epic:{n:'Épico',c:'#c07bff',m:['#7d5aab','#2e2146','#5b3f86'],p:['#b86bff','#e1b3ff','#ff7ad9','#ffffff']},legendary:{n:'Legendario',c:'#ffd04a',m:['#c9a23e','#5e4713','#a3801f'],p:['#ffc83d','#fff1a8','#ff8a3d','#ffffff']}};
const ORD=['common','rare','epic','legendary'];
const byCost=(c,a,b,d)=>c>=d?'legendary':c>=b?'epic':c>=a?'rare':'common';
function rarity(it){
 if(it.r)return it.r;
 if(it.k==='coins')return byCost(it.n,250,800,2000);
 if(it.k==='gems')return byCost(it.n,20,60,200);
 if(it.k==='plane'){const p=PLANE[it.id];return byCost((p&&p.cost)||0,400,1200,2500);}
 if(it.k==='map'){const m=MAPD[it.id];return byCost((m&&m.cost)||0,500,1300,2300);}
 if(it.k==='item'){const x=itemOf(it.cat,it.id);if(!x)return 'rare';if(x.ach||x.ex)return 'legendary';return byCost(x.gem?x.gem*30:(x.cost||0),150,350,700);}
 if(it.k==='pass')return 'legendary';
 if(it.k==='tier')return 'epic';
 return 'rare';}
function merge(L){const out=[];let co=0,ge=0,xp=0;for(const i of L){if(!i)continue;if(i.k==='coins')co+=i.n;else if(i.k==='gems')ge+=i.n;else if(i.k==='xp')xp+=i.n;else out.push(i);}
 const r=[];if(co)r.push({k:'coins',n:co});if(ge)r.push({k:'gems',n:ge});if(xp)r.push({k:'xp',n:xp});return r.concat(out);}
const css=document.createElement('style');css.textContent=`
/* ★ RECOMPENSAS EN LA PÁGINA (lluvia de monedas/gemas) */
#rfx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:900}
.rfxlab{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:901;pointer-events:none;text-align:center;font-weight:900;letter-spacing:.02em;font-size:clamp(26px,6vw,48px);line-height:1.15;animation:rfxl 2.4s cubic-bezier(.2,.8,.2,1) forwards;text-shadow:0 2px 0 #000a,0 0 18px #000a}
.rfxlab .c{color:#ffd24a}.rfxlab .g{color:#6fe0ff}.rfxlab .x{color:#bff08a;font-size:.6em}
@keyframes rfxl{0%{opacity:0;transform:translate(-50%,24px) scale(.7)}12%{opacity:1;transform:translate(-50%,0) scale(1.12)}22%{transform:translate(-50%,0) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-46px) scale(1)}}
.cine{position:fixed;inset:0;z-index:400;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at 50% 55%,#3b424a 0,#1c2025 55%,#07080a 100%);opacity:0;transition:opacity .25s;--rc:#ffc83d;font-family:inherit;color:#fff;user-select:none;-webkit-tap-highlight-color:transparent}
.cine::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px),repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0 1px,transparent 1px 3px),radial-gradient(circle at 50% 50%,transparent 45%,rgba(0,0,0,.6) 100%)}
.cine.on{opacity:1}.cine.shake{animation:cshk .45s}
@keyframes cshk{0%,100%{transform:none}15%{transform:translate(-9px,5px)}30%{transform:translate(8px,-6px)}45%{transform:translate(-6px,-4px)}60%{transform:translate(5px,5px)}80%{transform:translate(-2px,2px)}}
.cine canvas.cfx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
.cflash{position:absolute;inset:0;z-index:5;background:radial-gradient(circle at 50% 50%,#fff 0,#ffe2b0 45%,#ffb15a 100%);opacity:0;pointer-events:none}.cflash.go{animation:cfl .5s ease-out}
@keyframes cfl{0%{opacity:.92}100%{opacity:0}}
.chaz{position:absolute;left:0;right:0;height:30px;z-index:4;background:repeating-linear-gradient(-45deg,#ffc83d 0 20px,#16181c 20px 40px);border-block:4px solid #0b0c0e;box-shadow:inset 0 0 0 2px #6b7681,0 6px 14px rgba(0,0,0,.6);animation:chz .5s .6s cubic-bezier(.2,1.3,.4,1) both}
.chaz.t{top:0;--y:-115%}.chaz.b{bottom:0;--y:115%}
@keyframes chz{from{transform:translateY(var(--y))}to{transform:none}}
.cine.fast .chaz{animation-delay:.25s;animation-duration:.35s}
.cdoor{position:absolute;top:0;bottom:0;width:50.6%;z-index:6;overflow:hidden;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 4px),linear-gradient(90deg,#646d77,#3d444c 45%,#2b3037);box-shadow:inset 0 0 0 5px #1d2227,inset 0 0 70px rgba(0,0,0,.55)}
.cdoor.l{left:0;border-right:6px solid #101316;animation:cdl .8s .22s cubic-bezier(.75,0,.2,1) forwards}
.cdoor.r{right:0;border-left:6px solid #101316;animation:cdr .8s .22s cubic-bezier(.75,0,.2,1) forwards}
.cine.fast .cdoor.l,.cine.fast .cdoor.r{animation-duration:.45s;animation-delay:.05s}
@keyframes cdl{to{transform:translateX(-103%)}}@keyframes cdr{to{transform:translateX(103%)}}
.cdoor::before{content:"";position:absolute;top:0;bottom:0;width:46px;background:repeating-linear-gradient(-45deg,#ffc83d 0 18px,#16181c 18px 36px);border-inline:4px solid #0b0c0e}
.cdoor.l::before{right:0}.cdoor.r::before{left:0}
.cdoor::after{content:"";position:absolute;inset:16px 76px 16px 16px;border:4px solid #1b2025;border-radius:8px;background:radial-gradient(circle,#c9d2db 0 4px,#1b2025 5px,transparent 6px) 0 0/74px 74px,linear-gradient(135deg,rgba(255,255,255,.1),transparent 55%)}
.cdoor.r::after{inset:16px 16px 16px 76px}
.cstage{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:20px;width:min(980px,96vw);max-height:100vh;padding:34px 0}
.ctitle{position:relative;font-family:var(--f-disp);font-weight:700;text-transform:uppercase;letter-spacing:.09em;font-size:clamp(24px,4.6vw,46px);text-align:center;line-height:1.05;color:#fff;padding:10px clamp(34px,6vw,64px);border-radius:6px;border:4px solid;border-color:#d4dce4 #77818b #353c43 #a3adb7;background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px),linear-gradient(180deg,#5f6872,#2f353c 60%,#3d444c);box-shadow:0 8px 0 rgba(0,0,0,.55),0 0 40px -6px var(--rc),inset 0 0 0 2px rgba(0,0,0,.4);text-shadow:0 2px 0 #000,0 0 18px var(--rc);opacity:0;transform:translateY(-22px) scale(.85);transition:opacity .35s,transform .5s cubic-bezier(.2,1.5,.4,1)}
.ctitle::before,.ctitle::after{content:"";position:absolute;top:50%;width:14px;height:14px;margin-top:-7px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f2f6fa,#8b95a0 55%,#2c3238);box-shadow:0 0 0 2px #14171b}
.ctitle::before{left:14px}.ctitle::after{right:14px}
.ctitle.on{opacity:1;transform:none}
.csub{margin-top:-6px;font-size:clamp(14px,2.2vw,19px);opacity:0;transition:opacity .5s;color:#dfe6f0;text-align:center;letter-spacing:.04em}.csub.on{opacity:.92}
.ccrate{width:min(270px,52vw);filter:drop-shadow(0 22px 22px rgba(0,0,0,.6));transform-origin:50% 90%;animation:cdrop .6s .8s both}
.cine.fast .ccrate{animation-delay:.3s}
.ccrate svg{display:block;width:100%;height:auto;overflow:visible}
@keyframes cdrop{0%{transform:translateY(-95vh) rotate(-9deg) scale(.85);opacity:0}15%{opacity:1}68%{transform:translateY(0) rotate(0) scale(1.05,.93)}80%{transform:translateY(-30px) scale(.97,1.04)}100%{transform:none}}
.ccrate.c1{animation:cshA .1s infinite alternate;filter:drop-shadow(0 0 22px var(--rc)) drop-shadow(0 18px 18px rgba(0,0,0,.55))}
.ccrate.c2{animation:cshA .05s infinite alternate;filter:drop-shadow(0 0 44px var(--rc)) drop-shadow(0 0 90px var(--rc)) brightness(1.25)}
@keyframes cshA{from{transform:translate(-4px,0) rotate(-1.6deg)}to{transform:translate(4px,1px) rotate(1.6deg)}}
.ccrate.c2 .seam{opacity:1}.ccrate.c1 .seam{opacity:.7}.ccrate .seam{opacity:0;transition:opacity .4s}
.ccrate .lid{transform-origin:12% 100%;transform-box:fill-box}
.ccrate.open{animation:cbye .5s forwards}.ccrate.open .lid{animation:clid .7s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes clid{to{transform:translate(120px,-320px) rotate(48deg);opacity:0}}
@keyframes cbye{0%{transform:scale(1);filter:brightness(3)}40%{transform:scale(1.18);opacity:1}100%{transform:scale(.7) translateY(60px);opacity:0}}
.ccrate.gone{display:none}
.ccards{display:none;flex-wrap:wrap;justify-content:center;gap:clamp(12px,2.2vw,24px);width:100%}.ccards.on{display:flex}
.ccard{position:relative;width:clamp(138px,24vw,210px);padding:18px 12px 18px;border-radius:8px;text-align:center;color:#fff;background:repeating-linear-gradient(90deg,rgba(255,255,255,.055) 0 1px,transparent 1px 3px),linear-gradient(160deg,var(--p1),var(--p2) 58%,var(--p3));border:4px solid;border-color:#d8e0e8 #7d8791 #3b4249 #a7b1bb;box-shadow:0 10px 0 -1px rgba(0,0,0,.55),0 0 40px -6px var(--cc),inset 0 0 0 2px rgba(0,0,0,.35),inset 0 0 36px -12px var(--cc);opacity:0;transform:translateY(60px) scale(.3) rotate(-6deg)}
.ccard.show{animation:ccin .75s cubic-bezier(.2,1.5,.4,1) forwards}
.ccard.big{width:clamp(220px,46vw,340px)}
@keyframes ccin{0%{opacity:0;transform:translateY(60px) scale(.3) rotate(-6deg)}55%{opacity:1;transform:translateY(-10px) scale(1.12) rotate(1.5deg)}100%{opacity:1;transform:none}}
.ccard::after{content:"";position:absolute;inset:5px;pointer-events:none;background:radial-gradient(circle at 6px 6px,#e9eef3 0 2px,#1b2025 3px,transparent 4.5px),radial-gradient(circle at calc(100% - 6px) 6px,#e9eef3 0 2px,#1b2025 3px,transparent 4.5px),radial-gradient(circle at 6px calc(100% - 6px),#e9eef3 0 2px,#1b2025 3px,transparent 4.5px),radial-gradient(circle at calc(100% - 6px) calc(100% - 6px),#e9eef3 0 2px,#1b2025 3px,transparent 4.5px)}
.ccard::before{content:"";position:absolute;left:50%;top:-60vh;width:46%;height:60vh;transform:translateX(-50%);background:linear-gradient(0deg,var(--cc),transparent);opacity:0;pointer-events:none;filter:blur(8px)}
.ccard.show::before{animation:ccol 1.1s ease-out}
@keyframes ccol{0%{opacity:.8}100%{opacity:0}}
.cgw{position:absolute;inset:0;overflow:hidden;border-radius:4px;pointer-events:none}
.cgw i{position:absolute;top:-20%;bottom:-20%;width:38%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-18deg)}
.ccard.show .cgw i{animation:cgl .9s .55s ease-in-out forwards}
@keyframes cgl{to{left:140%}}
.ccard .cic{height:clamp(70px,13vw,112px);display:grid;place-items:center;margin-bottom:6px}
.ccard.big .cic{height:clamp(110px,19vw,170px);margin-bottom:10px}
.ccard .cic img{max-width:100%;max-height:100%;border-radius:5px;border:3px solid #d3dbe3;box-shadow:0 6px 16px rgba(0,0,0,.55),inset 0 0 0 2px #1b2025}
.ccard .cic canvas{max-width:100%}
.ccard .cic .coin{transform:scale(2.5)}.ccard .cic .gem{transform:scale(2.9)}
.ccard .cic svg{width:78px;height:78px;filter:drop-shadow(0 0 10px var(--cc)) drop-shadow(0 3px 0 rgba(0,0,0,.5))}
.ccard .cn{font-family:var(--f-disp);font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:clamp(17px,2.6vw,25px);line-height:1.1;text-shadow:0 2px 0 rgba(0,0,0,.7)}
.ccard .cs{margin-top:4px;font-size:clamp(12px,1.7vw,14px);color:#e3e9f0;text-shadow:0 1px 0 rgba(0,0,0,.6)}
.ccard .cr{display:inline-block;margin-top:9px;padding:3px 16px;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#0c0e11;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0) 55%),var(--cc);clip-path:polygon(7px 0,calc(100% - 7px) 0,100% 50%,calc(100% - 7px) 100%,7px 100%,0 50%)}
.cbtn{position:relative;margin-top:8px;padding:14px 40px;border:4px solid;border-color:#ffe28a #c98a00 #7a5200 #f0b92c;border-radius:6px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 1px,transparent 1px 3px),linear-gradient(180deg,#ffd75a,#f0a400);color:#10131a;font-family:var(--f-disp);font-weight:700;font-size:21px;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;box-shadow:0 7px 0 #14171a,0 0 30px rgba(255,200,60,.5);opacity:0;pointer-events:none;transform:translateY(12px);transition:opacity .4s,transform .4s}
.cbtn.on{opacity:1;pointer-events:auto;transform:none;animation:cpul 1.4s ease-in-out .5s infinite}
@keyframes cpul{50%{transform:scale(1.06)}}
.cbtn:active{transform:translateY(4px);box-shadow:0 2px 0 #14171a}
.chint{position:absolute;bottom:42px;left:0;right:0;z-index:2;text-align:center;font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.55}
@media (prefers-reduced-motion:reduce){.cine.shake{animation:none}.ccrate{animation-duration:.01s}}
`;document.head.appendChild(css);

const CRATE=`<svg viewBox="0 0 220 190" aria-hidden="true"><defs>
<linearGradient id="cs1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#363d45"/><stop offset=".16" stop-color="#9aa4ae"/><stop offset=".3" stop-color="#5b646e"/><stop offset=".62" stop-color="#848e98"/><stop offset=".86" stop-color="#434b54"/><stop offset="1" stop-color="#2b3138"/></linearGradient>
<linearGradient id="cs2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3ccd5"/><stop offset=".5" stop-color="#7b858f"/><stop offset="1" stop-color="#474f58"/></linearGradient>
<linearGradient id="cs3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".55" stop-color="#ffc83d"/><stop offset="1" stop-color="#b9780a"/></linearGradient>
<radialGradient id="cb1" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f4f8fb"/><stop offset=".5" stop-color="#9ba5af"/><stop offset="1" stop-color="#363d45"/></radialGradient>
<radialGradient id="cg3" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="var(--rc)"/><stop offset="1" stop-color="transparent"/></radialGradient></defs>
<ellipse cx="110" cy="178" rx="94" ry="9" fill="rgba(0,0,0,.45)"/>
<g class="body"><rect x="22" y="72" width="176" height="100" rx="5" fill="url(#cs1)" stroke="#11141a" stroke-width="5"/>
<path d="M24 104H196M24 148H196" stroke="rgba(0,0,0,.4)" stroke-width="3"/><path d="M24 107H196M24 151H196" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>
<rect x="40" y="72" width="16" height="100" fill="url(#cs2)" stroke="#11141a" stroke-width="3"/><rect x="164" y="72" width="16" height="100" fill="url(#cs2)" stroke="#11141a" stroke-width="3"/>
<g fill="url(#cb1)" stroke="#11141a" stroke-width="2"><circle cx="48" cy="86" r="5"/><circle cx="48" cy="158" r="5"/><circle cx="172" cy="86" r="5"/><circle cx="172" cy="158" r="5"/><circle cx="30" cy="164" r="3.5"/><circle cx="190" cy="164" r="3.5"/></g>
<rect x="80" y="92" width="60" height="62" rx="6" fill="url(#cs2)" stroke="#11141a" stroke-width="3.5"/><rect x="85" y="97" width="50" height="52" rx="4" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>
<path d="M110 100l7.500 15.500 17 2.500-12.300 12 3 17-15.200-8-15.200 8 3-17-12.300-12 17-2.500z" fill="url(#cs3)" stroke="#11141a" stroke-width="3" stroke-linejoin="round"/>
<path d="M30 120l24-6M150 140l30-9M60 160l18-4" stroke="rgba(255,255,255,.22)" stroke-width="1.5"/>
<ellipse cx="34" cy="168" rx="9" ry="3" fill="#b8602a" opacity=".4"/><ellipse cx="188" cy="130" rx="6" ry="9" fill="#b8602a" opacity=".25"/></g>
<g class="lid"><rect x="14" y="46" width="192" height="32" rx="5" fill="url(#cs2)" stroke="#11141a" stroke-width="5"/>
<path d="M30 78l14-32h16l-14 32zM68 78l14-32h16L84 78zM106 78l14-32h16l-14 32zM144 78l14-32h16l-14 32zM182 78l14-32h16l-14 32z" fill="#16181c" opacity=".78"/>
<path d="M16 49H204" stroke="rgba(255,255,255,.55)" stroke-width="2"/><rect x="14" y="46" width="192" height="32" rx="5" fill="none" stroke="#11141a" stroke-width="5"/>
<rect x="96" y="64" width="28" height="20" rx="3" fill="url(#cs2)" stroke="#11141a" stroke-width="3.5"/><circle cx="110" cy="74" r="3.500" fill="#11141a"/></g>
<g class="seam"><rect x="16" y="75" width="188" height="6" fill="#fff" opacity=".95"/><ellipse cx="110" cy="78" rx="120" ry="34" fill="url(#cg3)" opacity=".75"/></g></svg>`;

const ICON={pass:'<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.5 6.8L12 17l-6.2 3.5 1.5-6.8L2.2 9l6.9-.7z" fill="#ffd34d" stroke="#10131a" stroke-width="1.6" stroke-linejoin="round"/></svg>',
 tier:'<svg viewBox="0 0 24 24"><path d="M12 3l8 9h-5v9H9v-9H4z" fill="#8ad0ff" stroke="#10131a" stroke-width="1.6" stroke-linejoin="round"/></svg>',
 xp:'<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="#ffd34d" stroke="#10131a" stroke-width="1.6" stroke-linejoin="round"/></svg>',
 map:'<svg viewBox="0 0 24 24"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="#7bd85a" stroke="#10131a" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="#10131a" stroke-width="1.4"/></svg>'};

let cur=null;
function cardHTML(it,i){const r=rarity(it),R=RC[r],big=it.k==='plane'||it.k==='map'||it.big;let ic='',nm='',sub='',tag=R.n;
 if(it.k==='coins'){ic=coin;nm='+<span data-n="'+it.n+'">0</span>';sub='Monedas';}
 else if(it.k==='gems'){ic=GEM;nm='+<span data-n="'+it.n+'">0</span>';sub='Gemas';}
 else if(it.k==='xp'){ic=ICON.xp;nm='+<span data-n="'+it.n+'">0</span> XP';sub='Pase';}
 else if(it.k==='plane'){const p=PLANE[it.id];ic='<canvas data-plane="'+it.id+'" width="360" height="190"></canvas>';nm=h(p.name);sub=h(p.role||'');tag='Nuevo avión';}
 else if(it.k==='map'){const m=MAPD[it.id];ic=ICON.map;nm=h(m.name);sub=h(m.tag||'');tag='Nuevo mapa';}
 else if(it.k==='pass'){ic=ICON.pass;nm='Pase Premium';sub='20 cosméticos exclusivos';tag='Legendario';}
 else if(it.k==='tier'){ic=ICON.tier;nm='Nivel de pase +1';sub='Pase';}
 else{const x=itemOf(it.cat,it.id)||{name:it.id},cat=(CATS.find(c=>c[0]===it.cat)||[0,''])[1];ic='<img alt="" src="'+thumbURL(it.cat,it.id,SAVE.sel&&SAVE.sel.plane)+'">';nm=h(x.name);sub=h(cat);}
 return '<div class="ccard'+(big?' big':'')+'" style="--cc:'+R.c+';--p1:'+R.m[0]+';--p2:'+R.m[1]+';--p3:'+R.m[2]+'" data-i="'+i+'"><div class="cic">'+ic+'</div><div class="cn">'+nm+'</div>'+(sub?'<div class="cs">'+sub+'</div>':'')+'<span class="cr">'+tag+'</span><div class="cgw"><i></i></div></div>';}

function show(o){
 try{if(!o||!o.items||!o.items.length)return false;if(cur)cur.close(true);}catch(e){return false;}
 const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,fast=!!o.fast||reduce,items=o.items.slice(0,8);
 let top=0;for(const it of items)top=Math.max(top,ORD.indexOf(rarity(it)));const maxR=ORD[top],RCOL=RC[maxR];
 const big=!!o.big||top>=2;
 const el=document.createElement('div');el.className='cine';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.style.setProperty('--rc',RCOL.c);
 el.innerHTML='<canvas class="cfx"></canvas><div class="cflash"></div><div class="chaz t"></div><div class="chaz b"></div><div class="cdoor l"></div><div class="cdoor r"></div><div class="cstage"><div class="ctitle">'+h(o.title||'¡Recompensa!')+'</div>'+(o.sub?'<div class="csub">'+h(o.sub)+'</div>':'')+'<div class="ccrate">'+CRATE+'</div><div class="ccards">'+items.map(cardHTML).join('')+'</div><button class="cbtn" type="button">Continuar</button></div><div class="chint">Toca para saltar</div>';
 if(fast)el.classList.add('fast');document.body.appendChild(el);
 const cv=el.querySelector('canvas.cfx'),cx=cv.getContext('2d'),crate=el.querySelector('.ccrate'),cards=[...el.querySelectorAll('.ccard')],cbox=el.querySelector('.ccards'),btn=el.querySelector('.cbtn'),ttl=el.querySelector('.ctitle'),sub=el.querySelector('.csub'),flash=el.querySelector('.cflash'),hint=el.querySelector('.chint');
 let W=0,H=0,D=1,parts=[],raf=0,t0=performance.now(),phase=0,timers=[],shown=0,closed=false,ang=0,burstAt=0;
 const rs=()=>{D=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;};rs();addEventListener('resize',rs);
 const T=(f,ms)=>{const id=setTimeout(()=>{if(!closed)f();},ms);timers.push(id);return id;};
 let cpos=null;const stage=el.querySelector('.cstage');const ctr=()=>{if(cbox.classList.contains('on')){const r=cbox.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2];}if(cpos)return cpos;const st=stage.getBoundingClientRect();return[st.left+crate.offsetLeft+crate.offsetWidth/2,st.top+crate.offsetTop+crate.offsetHeight*.55];};
 const note=(i,v)=>{try{Snd.init();const f=[392,494,587,784,988,1175,1319,1568][Math.min(7,i)];Snd.tone(f,.5,'triangle',v||.06);Snd.tone(f*2.76,.4,'sine',.03);Snd.tone(f*5.4,.25,'sine',.016);Snd.noise(.08,.05);if(maxR==='legendary')Snd.tone(f*4,.5,'sine',.02);}catch(e){}};
 const pal=[];for(const it of items){const r=RC[rarity(it)];for(const c of r.p)pal.push(c);}
 const hasCoin=items.some(i=>i.k==='coins'),hasGem=items.some(i=>i.k==='gems');
 const WARM=['#fff3c4','#ffc83d','#ff8a3d','#ffffff',RCOL.c],SCRAP=['#e2e8ee','#aab3bc','#79838d','#4d555e'];
 const spawn=(x,y,n,pw,kind)=>{for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=(.35+Math.random())*pw,k=kind||(Math.random()<.18&&hasCoin?'coin':Math.random()<.14&&hasGem?'gem':Math.random()<.4?'scrap':'spark');
   const c=k==='spark'?WARM[(Math.random()*WARM.length)|0]:k==='scrap'?SCRAP[(Math.random()*SCRAP.length)|0]:pal[(Math.random()*pal.length)|0],l=k==='spark'?.5+Math.random()*.9:1.4+Math.random()*1.3;
   parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-pw*.3,g:k==='spark'?700:900,l,m:l,s:k==='spark'?2+Math.random()*3:5+Math.random()*9,r:Math.random()*6,vr:(Math.random()-.5)*14,c,k});}};
 const smoke=(x,y,n)=>{for(let i=0;i<n;i++){const l=1.2+Math.random()*1.1;parts.push({x:x+(Math.random()-.5)*120,y:y+30+Math.random()*30,vx:(Math.random()-.5)*60,vy:-40-Math.random()*70,g:-12,l,m:l,s:36+Math.random()*44,r:0,vr:0,c:'#c2c9d0',k:'smoke'});}};
 const ring=(x,y,col)=>parts.push({x,y,vx:0,vy:0,g:0,l:.7,m:.7,s:20,k:'ring',c:col||'#e8eef4',r:0,vr:0});
 const star=(c,x,y,s,a)=>{c.beginPath();for(let i=0;i<8;i++){const rr=i%2?s*.28:s;const q=i*Math.PI/4+a;c.lineTo(x+Math.cos(q)*rr,y+Math.sin(q)*rr);}c.closePath();c.fill();};
 function frame(now){if(closed)return;const t=(now-t0)/1000,dt=Math.min(.05,(now-(frame.l||now))/1000);frame.l=now;ang+=dt;
  cx.setTransform(D,0,0,D,0,0);cx.clearRect(0,0,W,H);
  const[x0,y0]=ctr(),k=phase>=2?1:phase===1?.55+.45*Math.min(1,(now-t0)/1500):.25;
  /* rayos giratorios */
  cx.save();cx.translate(x0,y0);cx.rotate(ang*.35);const nr=big?18:12,rl=Math.max(W,H),al=(phase>=2?.34:.16)*k;
  for(let i=0;i<nr;i++){const a0=i/nr*Math.PI*2,a1=a0+Math.PI/nr*.9;const g=cx.createRadialGradient(0,0,0,0,0,rl*.75);g.addColorStop(0,'#e8eff7');g.addColorStop(1,'transparent');cx.globalAlpha=al*.8;cx.fillStyle=g;cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,rl*.75,a0,a1);cx.closePath();cx.fill();}
  cx.restore();cx.globalAlpha=1;
  const gl=cx.createRadialGradient(x0,y0,0,x0,y0,Math.min(W,H)*.55);gl.addColorStop(0,RCOL.c+(phase>=2?'66':'33'));gl.addColorStop(1,'transparent');cx.fillStyle=gl;cx.fillRect(0,0,W,H);
  /* chispas de carga alrededor de la caja */
  if(phase===1&&Math.random()<.7){const a=Math.random()*6.28,r=90+Math.random()*80;parts.push({x:x0+Math.cos(a)*r,y:y0+Math.sin(a)*r*.7,vx:-Math.cos(a)*180,vy:-Math.sin(a)*130,g:0,l:.5,m:.5,s:3+Math.random()*3,r:0,vr:0,c:'#ffd9a0',k:'spark'});}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;if(p.l<=0){parts.splice(i,1);continue;}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;const al=Math.min(1,p.l/(p.m*.45));cx.globalAlpha=al;cx.fillStyle=p.c;cx.strokeStyle=p.c;
   if(p.k==='scrap'){cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.scale(1,Math.cos(p.r*1.7));cx.beginPath();cx.moveTo(-p.s/2,-p.s/4);cx.lineTo(p.s/2,-p.s/3);cx.lineTo(p.s/3,p.s/4);cx.lineTo(-p.s/2,p.s/3);cx.closePath();cx.fill();cx.strokeStyle='rgba(0,0,0,.55)';cx.lineWidth=1.5;cx.stroke();cx.restore();}
   else if(p.k==='smoke'){const q=1-p.l/p.m,rr=p.s*(1+q*1.4),g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);g.addColorStop(0,'rgba(200,207,214,.42)');g.addColorStop(1,'rgba(200,207,214,0)');cx.globalAlpha=al*.9;cx.fillStyle=g;cx.beginPath();cx.arc(p.x,p.y,rr,0,6.3);cx.fill();}
   else if(p.k==='spark'||p.k==='star'){cx.lineWidth=Math.max(1.5,p.s*.45);cx.lineCap='round';cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.vx*.05,p.y-p.vy*.05);cx.stroke();cx.fillStyle='#fff';cx.beginPath();cx.arc(p.x,p.y,Math.max(1,p.s*.3),0,6.3);cx.fill();}
   else if(p.k==='coin'){cx.save();cx.translate(p.x,p.y);cx.scale(Math.abs(Math.cos(p.r)),1);cx.fillStyle='#ffc83d';cx.beginPath();cx.arc(0,0,p.s*1.1,0,6.3);cx.fill();cx.strokeStyle='#8a5a00';cx.lineWidth=2;cx.stroke();cx.restore();}
   else if(p.k==='gem'){cx.save();cx.translate(p.x,p.y);cx.rotate(p.r*.3);cx.fillStyle='#40c9ff';cx.beginPath();cx.moveTo(0,-p.s);cx.lineTo(p.s*.9,-p.s*.2);cx.lineTo(0,p.s);cx.lineTo(-p.s*.9,-p.s*.2);cx.closePath();cx.fill();cx.strokeStyle='#fff';cx.lineWidth=1.5;cx.stroke();cx.restore();}
   else if(p.k==='ring'){const q=1-p.l/p.m;cx.lineWidth=10*(1-q)+1;cx.beginPath();cx.arc(p.x,p.y,40+q*Math.max(W,H)*.55,0,6.3);cx.stroke();}}
  cx.globalAlpha=1;
  /* aviones: giran suavemente */
  for(const c of el.querySelectorAll('canvas[data-plane]')){const p=PLANE[c.dataset.plane],g=c.getContext('2d');if(!p)continue;g.clearRect(0,0,c.width,c.height);const look=(SAVE.planes[p.id]&&lookOf(p.id))||DEFLOOK;
   try{drawPlane(g,p,look,{x:c.width/2,y:c.height/2,ang:-.35+Math.sin(t*1.6)*.14,scale:Math.min(c.width/(p.shape.len*1.7),c.height/(p.shape.wing*1.25*3.2)),flame:.8,t:t});}catch(e){}}
  raf=requestAnimationFrame(frame);}
 /* línea de tiempo */
 const countUp=card=>{card.querySelectorAll('[data-n]').forEach(s=>{const n=+s.dataset.n,st=performance.now(),dur=Math.min(1300,500+n*.4);const f=()=>{if(closed)return;const q=Math.min(1,(performance.now()-st)/dur),e=1-Math.pow(1-q,3);s.textContent=nf(n*e);if(q<1)requestAnimationFrame(f);};f();});};
 const reveal=i=>{const c=cards[i];if(!c||c.classList.contains('show'))return;c.classList.add('show');shown++;countUp(c);note(i);
  const r=c.getBoundingClientRect();spawn(r.left+r.width/2,r.top+r.height/2,big?30:18,520,'spark');if(rarity(items[i])!=='common')ring(r.left+r.width/2,r.top+r.height/2,RC[rarity(items[i])].c);
  if(shown===cards.length){T(()=>{btn.classList.add('on');btn.focus({preventScroll:true});hint.style.opacity=0;phase=3;},fast?250:700);}};
 const dd=fast?300:780,dropT=dd+(fast?320:620),chargeT=fast?480:1050,c2T=fast?0:550;
 function burst(){if(phase>=2)return;cpos=ctr();phase=2;burstAt=performance.now();timers.forEach(clearTimeout);timers=[];
  const[x,y]=ctr();flash.classList.add('go');el.classList.add('shake');T(()=>el.classList.remove('shake'),480);
  crate.classList.remove('c1','c2');crate.classList.add('open');T(()=>{crate.classList.add('gone');},fast?350:520);
  spawn(x,y,big?170:100,fast?640:760);smoke(x,y,big?12:8);ring(x,y,'#fff');T(()=>ring(x,y,RCOL.c),140);
  try{Snd.init();Snd.noise(.8,.34);Snd.tone(80,.55,'sine',.18,.4);Snd.tone(330,.6,'square',.05,.5);[1.0,2.76,5.4].forEach((m,i)=>Snd.tone(440*m,.9,'sine',.05/(i+1)));[392,587,784,988].forEach((f,i)=>T(()=>Snd.tone(f,.5,'triangle',.05),90+i*80));}catch(e){}
  ttl.classList.add('on');if(sub)sub.classList.add('on');
  T(()=>{cbox.classList.add('on');cards.forEach((c,i)=>T(()=>reveal(i),(fast?170:420)*i+(fast?60:260)));},fast?220:380);}
 try{Snd.init();T(()=>{Snd.noise(.4,.2);Snd.tone(55,.6,'sawtooth',.09,.5);},fast?40:200);T(()=>{Snd.noise(.3,.34);Snd.tone(70,.35,'sine',.16,.5);Snd.tone(520,.3,'square',.04,.45);Snd.tone(1380,.22,'triangle',.05,.5);},dropT-(fast?110:220));}catch(e){}
 T(()=>{if(phase<1){phase=1;crate.classList.add('c1');try{for(let q=0;q<(fast?5:11);q++)T(()=>Snd.tone(700+q*55,.03,'square',.03),q*(fast?80:95));Snd.tone(160,fast?.5:1.1,'sawtooth',.02,fast?4:7);}catch(e){}}},dropT);
 if(!fast)T(()=>{crate.classList.remove('c1');crate.classList.add('c2');},dropT+c2T+250);
 T(burst,dropT+chargeT);
 function close(quick){if(closed)return;closed=true;timers.forEach(clearTimeout);cancelAnimationFrame(raf);removeEventListener('resize',rs);document.removeEventListener('keydown',key,true);cur=null;
  if(quick){el.remove();return;}el.classList.remove('on');setTimeout(()=>el.remove(),320);}
 function skip(){if(phase<2){burst();return;}if(shown<cards.length){timers.forEach(clearTimeout);timers=[];cards.forEach((c,i)=>{if(!c.classList.contains('show')){c.classList.add('show');c.style.animationDuration='.3s';countUp(c);}});shown=cards.length;cbox.classList.add('on');ttl.classList.add('on');if(sub)sub.classList.add('on');btn.classList.add('on');btn.focus({preventScroll:true});hint.style.opacity=0;phase=3;note(2);}}
 function key(e){if(['Enter',' ','Escape','Spacebar'].includes(e.key)){e.preventDefault();e.stopPropagation();if(phase>=3)close();else skip();}}
 document.addEventListener('keydown',key,true);
 el.addEventListener('click',e=>{if(e.target===btn||phase>=3){close();}else skip();});
 requestAnimationFrame(()=>el.classList.add('on'));raf=requestAnimationFrame(frame);
 cur={close};return true;}
window.CINE={show,merge};
})();
