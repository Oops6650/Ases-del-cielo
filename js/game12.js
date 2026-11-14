'use strict';
/* ===== Interfaz ===== */
const $=id=>document.getElementById(id);
/* ===== Interfaz v2: menús (Inicio, Garaje, Mapas, Retos, Perfil, Ajustes, Resultado) ===== */
const view=$('view'),navEl=$('nav'),coinsEl=$('coins');
const TABS=[['home','Inicio'],['garage','Garaje'],['maps','Mapas'],['pass','Pase'],['shop','Tienda'],['challenges','Retos'],['stats','Perfil'],['play','Ajustes']];
let gPrev=null,PVFXON=false;
let tab='home',gTab='paint',gSel=null,prevRaf=0,prevCv=null,prevPlane=null,lastResult=null,toastT=0;
const h=(s)=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IC={
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 garage:'<path d="M12 2c1 0 1.6 1 1.6 3l.5 5 8 4v2.2l-8-2.2-.5 4 2.5 2v1.8L12 20.2 7.9 21.8V20l2.5-2-.5-4-8 2.2V14l8-4 .5-5c0-2 .6-3 1.6-3z"/>',
 maps:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
 challenges:'<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8"/>',
 stats:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
 play:'<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
 lock:'<path d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3"/>',
 check:'<path d="M5 12l5 5 9-10"/>'};
const ic=(n,s)=>'<svg class="i-svg" viewBox="0 0 24 24" width="'+(s||24)+'" height="'+(s||24)+'" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';
const coin='<span class="coin" aria-hidden="true"></span>';
const price=n=>'<span class="pill cost">'+coin+nf(n)+'</span>';
const itemPill=it=>it.gem?'<span class="pill cost">'+GEM+nf(it.gem)+'</span>':price(it.cost);
const itemPriceTxt=it=>it.gem?GEM+' '+nf(it.gem):coin+' '+nf(it.cost);
function toast(t){let e=document.querySelector('.toast');if(e)e.remove();e=document.createElement('div');e.className='toast';e.setAttribute('role','status');e.setAttribute('aria-live','polite');e.textContent=t;document.body.appendChild(e);clearTimeout(toastT);toastT=setTimeout(()=>e.remove(),2200);}
function pips(v){let s='<span class="pips">';for(let i=1;i<=10;i++)s+='<b class="'+(i<=v?'f':'')+'"></b>';return s+'</span>';}
function go(t){tab=t;if(t==='garage')gSel=null;try{location.hash=t;}catch(e){}render_ui();window.scrollTo(0,0);}
const rank=(done,cl)=>cl?2:done?0:1;
function pendingCount(){return dailyList().filter(q=>q.got>=q.n&&!SAVE.daily.claimed[q.id]).length+ACH.filter(a=>achDone(a.id)&&!SAVE.claimed[a.id]).length;}
function header(){const n=pendingCount();const dots={challenges:n,pass:passClaimable()+weeklyReady(),home:loginIdx().ready?1:0};
 navEl.innerHTML=TABS.slice(0,7).map(([k,t])=>'<button class="t-'+k+(tab===k?' on':'')+'" data-go="'+k+'"'+(tab===k?' aria-current="page"':'')+'>'+ic(k,24)+'<span>'+t+'</span>'+(dots[k]?'<i class="dot">'+dots[k]+'</i>':'')+'</button>').join('');
 coinsEl.innerHTML=coin+'<b>'+(SAVE.cheat?'∞':nf(SAVE.coins))+'</b><span class="vsep"></span>'+GEM+'<b>'+(SAVE.cheat?'∞':nf(SAVE.gems))+'</b>';
 {const sb=document.querySelector('header.top [data-go="play"]');if(sb){sb.classList.toggle('sel',tab==='play');sb.setAttribute('aria-current',tab==='play'?'page':'false');}}try{$('tutBtn').classList.toggle('ready',!localStorage.getItem('ases_tut'));}catch(e){}
 requestAnimationFrame(()=>document.documentElement.style.setProperty('--dockh',(navEl.offsetHeight||66)+'px'));}
function stopPrev(){cancelAnimationFrame(prevRaf);prevCv=null;}
function startPrev(id,def,getLook){stopPrev();const el=$(id);if(!el)return;prevCv=el;prevPlane=def;const t0=performance.now();const loop=()=>{if(!document.body.contains(el))return;previewDraw(el,prevPlane,getLook(),(performance.now()-t0)/1000);prevRaf=requestAnimationFrame(loop);};loop();}
function drawMinis(){document.querySelectorAll('canvas.mini').forEach(c=>{const p=PLANE[c.dataset.mini];if(!p)return;const w=c.clientWidth||140,hh=c.clientHeight||70,d=Math.min(2,window.devicePixelRatio||1);c.width=w*d;c.height=hh*d;const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);drawPlane(x,p,planeOwned(p.id)?lookOf(p.id):DEFLOOK,{x:w/2,y:hh/2,ang:0,scale:Math.min(w/(p.shape.len*1.5),hh/(p.shape.wing*1.25*2.6)),flame:.4,t:1});});}
const STC={spd:'o',acc:'y',man:'',hp:'g',pow:''};
const stp=(lab,key,opts,tip)=>{const cur=SAVE.cfg[key],i=Math.max(0,opts.findIndex(o=>o[0]===cur)),pv=opts[i-1],nx=opts[i+1],bt=(o,t,al)=>'<button class="sb" aria-label="'+al+'" '+(o?'data-act="cfg" data-k="'+key+'" data-v="'+o[0]+'"':'disabled')+'>'+t+'</button>';
 return'<div class="orow"><span class="lab">'+lab+(tip?inf(tip):'')+'</span><div class="stp">'+bt(pv,'‹','Anterior')+'<div class="sv"><b>'+opts[i][1]+'</b><span class="dots">'+opts.map((o,j)=>'<i class="'+(j===i?'on':'')+'"></i>').join('')+'</span></div>'+bt(nx,'›','Siguiente')+'</div></div>';};
const mapStp=()=>{const ow=MAPDEF.filter(m=>mapOwned(m.id)),i=Math.max(0,ow.findIndex(m=>m.id===SAVE.sel.map)),pv=ow[i-1],nx=ow[i+1],bt=(m,t,al)=>'<button class="sb" aria-label="'+al+'" '+(m?'data-act="selmap" data-id="'+m.id+'"':'disabled')+'>'+t+'</button>';
 return'<div class="orow"><span class="lab">Mapa</span><div class="stp">'+bt(pv,'‹','Mapa anterior')+'<div class="sv"><b style="font-size:15px;text-align:center">'+h(ow[i].name)+'</b><span class="dots">'+ow.map((m,j)=>'<i class="'+(j===i?'on':'')+'"></i>').join('')+'</span></div>'+bt(nx,'›','Mapa siguiente')+'</div></div>';};
const seg=(lab,key,opts)=>'<div class="field"><div class="lab">'+lab+'</div><div class="seg">'+opts.map(([v,n])=>'<button class="chip '+(SAVE.cfg[key]===v?'on':'')+'" data-act="cfg" data-k="'+key+'" data-v="'+v+'" aria-pressed="'+(SAVE.cfg[key]===v)+'">'+n+'</button>').join('')+'</div></div>';
const inf=t=>'<span class="ibtn" role="button" tabindex="0" aria-label="Más información" data-tip="'+h(t)+'">i</span>';
const rowTitle=(t,sub)=>'<div class="head"><h2>'+t+'</h2>'+(sub?(sub[0]==='?'?inf(sub.slice(1)):'<span class="tag">'+sub+'</span>'):'')+'</div>';

/* --- Inicio: todo lo necesario para jugar en una pantalla --- */
const TEAMSZ=[[3,'2 vs 2'],[5,'3 vs 3'],[7,'4 vs 4'],[9,'5 vs 5'],[13,'7 vs 7']];
function snapBots(){const c=SAVE.cfg;if(c.mode===undefined)return;const L=MODES[c.mode||0].id==='team'?TEAMSZ:[[3],[5],[7],[10],[14]];if(MODES[c.mode||0].id==='waves')return;let b=L[0][0];for(const o of L)if(Math.abs(o[0]-c.bots)<Math.abs(b-c.bots))b=o[0];c.bots=b;}
function vHome(){snapBots();const own=Object.keys(PLANE).filter(planeOwned);if(SAVE.cfg.split>1)for(const k of['p2','p3','p4'])if(SAVE.cfg[k]===undefined)SAVE.cfg[k]=Math.max(0,own.indexOf(SAVE.sel.plane));const id=SAVE.sel.plane,def=PLANE[id],c=SAVE.cfg,mp=MAPD[SAVE.sel.map],dl=dailyList();
 view.innerHTML='<section class="home"><div class="top2">'+
  '<div class="stage"><canvas class="prev" id="pv"></canvas><div class="cap"><div><h1>'+h(def.name)+'</h1><span class="pill">'+h(def.role)+'</span></div><button class="btn sm" data-go="garage">Cambiar avión</button></div></div>'+
  '<div class="panel grid" style="align-content:start;gap:14px"><h2>Tu partida</h2>'+
   '<div class="maprow"><canvas class="th mgp" data-map="'+mp.id+'" style="background:url('+mapSketch(mp)+') center/cover"></canvas><div class="mi"><div class="n">'+h(mp.name)+'</div><span class="tag">'+h((mp.tag||'')+' · '+TIMES[curTime(mp.id)].n)+'</span></div><button class="btn sm" data-go="maps" style="margin-left:auto;flex:none">Cambiar</button></div>'+
   '<div class="opts">'+stp('Jugadores','split',[[0,'1 jugador'],[2,'2 jugadores'],[3,'3 jugadores'],[4,'4 jugadores']],'Pantalla dividida: J1 con teclado y ratón, J2–J4 con mandos.')+[2,3,4].map(k=>c.split>k-1?stp('Avión de J'+k,'p'+k,own.map((id,i)=>[i,PLANE[id].name]),'Avión que pilotará J'+k+' (el mando).'):'').join('')+stp('Modo','mode',MODES.map((m,i)=>[i,m.n]),MODES[c.mode||0].d.replace(/¤/g,'monedas'))+mapStp()+stp('Dificultad','diff',DIFFS.map((d,i)=>[i,d.name]))+stp('Duración','time',[[2,'2 min'],[3,'3 min'],[5,'5 min'],[8,'8 min']])+(MODES[c.mode||0].id==='waves'?'':MODES[c.mode||0].id==='team'?stp('Equipos','bots',TEAMSZ):stp('Rivales','bots',[[3,'3'],[5,'5'],[7,'7'],[10,'10'],[14,'14']]))+'</div>'+
   '<div class="rew">'+coin+'Recompensa ×'+(DIFFS[c.diff].mult*(.7+.08*(MODES[c.mode||0].id==='waves'?6:c.bots))*MODES[c.mode||0].mult).toFixed(2)+inf('Más rivales, mayor dificultad y más nivel pagan más.')+'</div></div></div>'+
  homeExtras()+
  '<div><div class="head"><h3>Retos de hoy</h3><span class="tag">'+(SAVE.stats.matches?'Mejor puntuación: '+nf(SAVE.rec.score||0):'')+'</span></div><div class="dq">'+
   dl.slice().sort((a,b)=>rank(a.got>=a.n,SAVE.daily.claimed[a.id])-rank(b.got>=b.n,SAVE.daily.claimed[b.id])).map(q=>{const done=q.got>=q.n,cl=SAVE.daily.claimed[q.id];return'<button data-go="challenges" class="'+(done&&!cl?'rd':'')+'"><b>'+h(q.text)+'</b><span class="row" style="flex-wrap:nowrap"><span class="bar g"><i style="width:'+(q.got/q.n*100)+'%"></i></span>'+(cl?'<span class="pill on">Cobrado</span>':done?'<span class="pill hot">¡Cobrar!</span>':price(q.rw))+'</span></button>';}).join('')+'</div></div></section>';
 startPrev('pv',def,()=>lookOf(id));}

/* --- Garaje --- */
function planeCard(p,sel){const own=planeOwned(p.id),use=SAVE.sel.plane===p.id;
 return'<button class="pcard '+(sel?'sel ':'')+(own?'':'lock')+'" data-act="selplane" data-id="'+p.id+'"><canvas class="mini" data-mini="'+p.id+'"></canvas><span class="n">'+h(p.name)+'</span>'+(own?(use?'<span class="pill on">En uso</span>':'<span class="tag">En tu garaje</span>'):'<span class="pill lock">'+ic('lock',14)+' '+nf(planePrice(p.id))+(planePrice(p.id)<p.cost?' <s class="was">'+nf(p.cost)+'</s>':'')+'</span>')+'</button>';}
function lockWhy(cat,it){
 if(it.ach){const a=ACH.find(x=>x.id===it.ach);if(!a)return{t:'Se desbloquea con un logro.',go:'challenges',b:'Ver retos'};return{t:'Logro «'+a.n+'»: '+a.d.split('. ')[0].replace(/\.$/,'')+'. Progreso: '+nf(Math.min(ST(a.k),a.t))+' / '+nf(a.t)+'.',go:'challenges',b:'Ver retos'};}
 if(it.ex){let tier=0;for(const t in PREM_SP){const r=PREM_SP[t];if(r.t==='item'&&r.cat===cat&&r.id===it.id)tier=+t;}
  if(tier)return{t:'Exclusivo del Pase de batalla premium: se consigue en el nivel '+tier+' (tú vas por el nivel '+passTier()+'). Requiere pase premium.',go:'pass',b:'Ver pase'};
  let ft=0;for(const t in FREE_SP){const r=FREE_SP[t];if(r.t==='item'&&r.cat===cat&&r.id===it.id)ft=+t;}
  if(ft)return{t:'Exclusivo del Pase de batalla (fila gratuita): se consigue en el nivel '+ft+' (tú vas por el nivel '+passTier()+').',go:'pass',b:'Ver pase'};
  if(it.id==='pionero')return{t:'Exclusivo del Pack de bienvenida de la tienda (pago único).',go:'shop',b:'Ver tienda'};
  return{t:'Cosmético exclusivo: solo se consigue en la tienda.',go:'shop',b:'Ver tienda'};}
 return null;}
function vGarage(){const id=gSel||SAVE.sel.plane,def=PLANE[id],owned=planeOwned(id),ps=SAVE.planes[id]||newPlaneSave(),look=lookOf(id),e=effStats(def,ps.up),base=effStats(def,null);
 const stage='<div class="grid" style="align-content:start"><div class="stage"><canvas class="prev" id="pv"></canvas><div class="cap"><h1>'+h(def.name)+'</h1>'+(gPrev?'<span class="pill hot">Vista previa</span>':'')+(owned?(SAVE.sel.plane===id?'<span class="pill on">En uso</span>':''):'<button class="btn buy" data-act="buy" data-id="'+id+'" '+(SAVE.coins<planePrice(id)?'disabled':'')+'>Comprar '+coin+nf(planePrice(id))+(planePrice(id)<def.cost?' <s class="was">'+nf(def.cost)+'</s>':'')+'</button>')+'</div></div>'+
  '<div class="panel"><div class="row"><h3>'+h(def.role)+'</h3>'+inf(def.desc)+'</div><div class="loadout"><div><small>Arma</small><b>'+h(GUNS[def.gun].n)+'</b></div><div><small>Secundaria</small><b>'+h(SECS[def.sec.t].n)+' ×'+def.sec.n+'</b></div><div><small>Especial</small><b>'+h(SPECS[def.sp.t].n)+'</b> '+inf(SPECS[def.sp.t].desc+(def.sp.t==='fenix'?'':' Tecla '+bindFirst('special')+' · recarga '+def.sp.cd+' s.'))+'</div></div>'+
  (def.acro?'<p class="tag" style="margin-top:10px">★ Acróbata '+inf('Las acrobacias gastan la mitad de energía.')+'</p>':'')+'</div></div>';
 const ups='<div class="panel"><div class="head"><h3>Mejoras</h3>'+inf('Barra = base del avión · casillas = mejoras (máx. 5).')+'</div>'+UPS.map(([k,n])=>{const lv=ps.up[k],mx=5,cst=upCost(def,lv);
   return'<div class="stat"><span class="l">'+n+'</span><div><div class="row" style="gap:8px;flex-wrap:nowrap"><span class="bar '+STC[k]+'"><i style="width:'+(def.stats[k]*10)+'%"></i></span><span class="tag" style="min-width:34px">'+def.stats[k]+'/10</span></div><div class="pips">'+Array.from({length:mx},(_,i)=>'<b class="'+(i<lv?'f':'')+'"></b>').join('')+'</div></div>'+
   (!owned?'<span></span>':lv>=mx?'<span class="pill on">Máx.</span>':'<button class="btn sm buy" data-act="up" data-k="'+k+'">'+coin+nf(cst)+'</button>')+'</div>';}).join('')+
  (owned?'<p class="tag" style="margin-top:8px">Con mejoras: '+Math.round(e.cruise*.36)+' km/h (base '+Math.round(base.cruise*.36)+') · casco '+Math.round(e.hp)+' · potencia ×'+e.pow.toFixed(2)+'</p>':'')+'</div>';

 const pit=gPrev&&gPrev.cat===gTab?CAT[gTab].find(x=>x.id===gPrev.id):null;
 let cust='<div class="panel tune"><div class="head"><h3>Tuneos</h3>'+(owned?'':'<span class="pill lock">'+ic('lock',14)+' Solo vista previa</span>')+'</div>'+
  (owned?'<div class="dseg" role="group" aria-label="Diseño">'+[0,1,2].map(i=>'<button class="segb '+(ps.slot===i?'on':'')+'" data-act="slot" data-i="'+i+'" aria-pressed="'+(ps.slot===i)+'"><b>'+(i+1)+'</b><span>Diseño</span></button>').join('')+'</div>':'')+
  '<div class="ctabs">'+CATS.map(([k,n])=>'<button class="chip ctab '+(gTab===k?'on':'')+'" data-act="gtab" data-k="'+k+'">'+ic('c_'+k,20)+'<span>'+n+'</span></button>').join('')+'</div>'+
  (pit?'<div class="pvbar">'+thImg(gTab,pit.id,id,look)+'<div class="pvt"><b>'+h(pit.name)+'</b>'+((!pit.ach&&!pit.ex&&!ownedItem(gTab,pit)&&owned)?'<span class="tag">Toca otra vez para comprar</span>':'')+((pit.ach||pit.ex)?'<span class="tag">'+ic('lock',14)+' Bloqueado '+inf(lockWhy(gTab,pit).t)+'</span>':'')+'</div>'+((pit.ach||pit.ex)?'<button class="btn sm" data-go="'+lockWhy(gTab,pit).go+'">'+lockWhy(gTab,pit).b+'</button>':ownedItem(gTab,pit)?'<span class="pill on">Tuyo</span>':'<button class="btn buy" data-act="pvbuy" '+(!owned?'disabled':'')+'>'+(owned?'Comprar y poner':'Compra antes el avión')+' '+itemPriceTxt(pit)+'</button>')+'<button class="btn sm" data-act="pvx" aria-label="Cerrar vista previa">'+ic('pvx',16)+'</button></div>':'')+
  '<div class="items tune-items">'+
  CAT[gTab].map(it=>{const ow=ownedItem(gTab,it),on=look[gTab]===it.id&&!pit,pv=pit&&pit.id===it.id;
   return'<button class="item '+(on?'sel ':'')+(pv?'pv':'')+'" data-act="item" data-id="'+it.id+'" aria-pressed="'+(on||pv)+'">'+thImg(gTab,it.id,id,look)+'<span>'+h(it.name)+'</span>'+(on?'<span class="pill on">'+ic('check',14)+' Puesto</span>':ow?'<span class="tag">Tuyo</span>':it.ach?'<span class="pill lock">'+ic('lock',14)+' Logro</span>':it.ex?'<span class="pill lock">'+ic('lock',14)+' Exclusivo</span>':pv&&owned?'<span class="pill hot">Toca para comprar</span>':itemPill(it))+'</button>';}).join('')+'</div>'+
  (CAT[gTab].some(i=>i.ach)?'':'')+'</div>';
 PVFXON=gTab==='fx';
 view.innerHTML=rowTitle('Garaje',Object.keys(SAVE.planes).length+' de '+PLANES.length+' aviones')+'<div class="strip">'+PLANES.map(p=>planeCard(p,p.id===id)).join('')+'</div>'+
  '<div class="grid g2 garage"><div class="col-l">'+stage+'</div><div class="grid" style="align-content:start">'+cust+ups+'</div></div>';
 drawMinis();startPrev('pv',def,()=>{const l=lookOf(id);return gPrev?{...l,[gPrev.cat]:gPrev.id}:l;});
 const s=view.querySelector('.pcard.sel');if(s&&s.scrollIntoView)s.scrollIntoView({inline:'center',block:'nearest'});}

/* --- Mapas --- */
/* miniaturas de mapa: cache por mapa y hora */
const MSK={};
function skRR(x,a,b,w,h,r){r=Math.min(r,w/2,h/2);x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
function skBiome(x,k,d,X,Y,w,h,L){const r=mulberry(hashStr(k+X)),u=Math.min(w,h);
 const shadow=fn=>{x.save();x.translate(u*.02,u*.035);x.globalAlpha=.3;x.fillStyle='#000';fn();x.restore();};
 const tree=(a,b,s)=>{shadow(()=>{x.beginPath();x.arc(a,b,s,0,TAU);x.fill();});x.fillStyle='#2c7236';x.beginPath();x.arc(a,b,s,0,TAU);x.fill();x.fillStyle='#4fae55';x.beginPath();x.arc(a-s*.25,b-s*.3,s*.55,0,TAU);x.fill();};
 x.save();x.translate(X,Y);x.beginPath();x.rect(0,0,w,h);x.clip();
 const g=x.createRadialGradient(w*.5,h*.45,h*.08,w*.5,h*.5,w*.72);g.addColorStop(0,shade(d.ground,.14));g.addColorStop(1,shade(d.ground,-.16));x.fillStyle=g;x.fillRect(0,0,w,h);
 if(k!=='archi'){for(let i=0;i<Math.round(w*h/260);i++){x.fillStyle=r()<.5?'rgba(255,255,255,.13)':'rgba(0,0,0,.09)';x.fillRect(r()*w,r()*h,1.6,1.6);}}
 if(k==='valle'){
  const ry=h*(.28+r()*.1),pa=()=>{x.beginPath();x.moveTo(-10,ry);x.bezierCurveTo(w*.25,ry-h*.3,w*.4,ry+h*.4,w*.6,ry+h*.12);x.bezierCurveTo(w*.75,ry-h*.06,w*.85,ry+h*.3,w+10,ry+h*.26);};
  x.lineCap='round';x.lineJoin='round';pa();x.strokeStyle='#e6d79c';x.lineWidth=u*.17;x.stroke();pa();x.strokeStyle='#3f9bd6';x.lineWidth=u*.125;x.stroke();pa();x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=u*.03;x.setLineDash([u*.1,u*.09]);x.stroke();x.setLineDash([]);
  const fx=w*.5,fy=h*.56,fs=u*.15;
  for(let i=0;i<9;i++){const cx=r()*w,cy=r()*h;if(Math.abs(cx-fx)<fs*2&&Math.abs(cy-fy)<fs*2)continue;for(let j=0;j<5;j++)tree(cx+(r()-.5)*u*.22,cy+(r()-.5)*u*.18,u*(.035+r()*.025));}
  x.strokeStyle='#cdb98a';x.lineWidth=u*.03;x.beginPath();x.moveTo(fx,fy+fs);x.quadraticCurveTo(fx-w*.12,h*.9,fx-w*.3,h+8);x.stroke();
  shadow(()=>x.fillRect(fx-fs,fy-fs,fs*2,fs*2));x.fillStyle=d.solid;x.strokeStyle=d.sedge;x.lineWidth=u*.012;x.fillRect(fx-fs,fy-fs,fs*2,fs*2);x.strokeRect(fx-fs,fy-fs,fs*2,fs*2);x.fillStyle=shade(d.solid,.25);x.fillRect(fx-fs*.55,fy-fs*.55,fs*1.1,fs*1.1);
  x.fillStyle=shade(d.solid,-.1);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){x.beginPath();x.arc(fx+a*fs,fy+b*fs,fs*.3,0,TAU);x.fill();x.stroke();}}
 else if(k==='canon'){
  x.strokeStyle='rgba(60,25,10,.35)';x.lineWidth=u*.014;for(let i=0;i<5;i++){x.beginPath();let a=r()*w,b=r()*h;x.moveTo(a,b);for(let j=0;j<4;j++){a+=(r()-.5)*w*.18;b+=(r()-.5)*h*.2;x.lineTo(a,b);}x.stroke();}
  const n=8;for(let i=0;i<n;i++){const a=i/n*TAU+r()*.35,cx=w/2+Math.cos(a)*w*(.3+r()*.08),cy=h/2+Math.sin(a)*h*(.3+r()*.06),mw=w*(.1+r()*.07),mh=h*(.15+r()*.1);
   shadow(()=>{skRR(x,cx-mw/2,cy-mh/2,mw,mh,u*.03);x.fill();});x.fillStyle=shade(d.solid,-.3);skRR(x,cx-mw/2,cy-mh/2+u*.035,mw,mh,u*.03);x.fill();
   x.fillStyle=d.solid;x.strokeStyle=d.sedge;x.lineWidth=u*.014;skRR(x,cx-mw/2,cy-mh/2,mw,mh,u*.03);x.fill();x.stroke();x.strokeStyle='rgba(255,255,255,.35)';x.beginPath();x.moveTo(cx-mw*.35,cy-mh*.3);x.lineTo(cx+mw*.2,cy-mh*.3);x.stroke();}
  const cr=u*.2,cg=x.createRadialGradient(w/2,h/2,cr*.1,w/2,h/2,cr);cg.addColorStop(0,'rgba(30,12,4,.75)');cg.addColorStop(.75,'rgba(60,25,10,.45)');cg.addColorStop(1,'rgba(255,255,255,.0)');x.fillStyle=cg;x.beginPath();x.arc(w/2,h/2,cr,0,TAU);x.fill();x.strokeStyle=d.sedge;x.lineWidth=u*.016;x.beginPath();x.arc(w/2,h/2,cr,0,TAU);x.stroke();
  x.fillStyle='#4a4f58';x.strokeStyle='#e8eaee';x.lineWidth=u*.012;x.beginPath();x.arc(w/2,h/2,u*.045,0,TAU);x.fill();x.stroke();
  if(d.id==='nieve'){for(let i=0;i<14;i++){x.fillStyle='rgba(190,225,245,.55)';x.beginPath();x.ellipse(r()*w,r()*h,u*(.03+r()*.05),u*.02,r()*3,0,TAU);x.fill();}}}
 else if(k==='archi'){
  x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=1.3;for(let i=0;i<Math.round(w*h/900);i++){x.beginPath();x.arc(r()*w,r()*h,u*.014+r()*u*.02,Math.PI*1.1,Math.PI*1.9);x.stroke();}
  const IS=[[.15,.3],[.3,.74],[.8,.25],[.86,.7],[.62,.86],[.2,.52],[.55,.14]];
  for(const[a,b]of IS){const cx=a*w,cy=b*h,rx=w*(.07+r()*.05),ry=h*(.12+r()*.06);
   x.fillStyle='rgba(170,230,235,.45)';x.beginPath();x.ellipse(cx,cy,rx*1.4,ry*1.4,0,0,TAU);x.fill();
   x.fillStyle=d.edge;x.beginPath();x.ellipse(cx,cy,rx,ry,r()*.5,0,TAU);x.fill();x.fillStyle='#5aa84a';x.beginPath();x.ellipse(cx,cy,rx*.7,ry*.68,0,0,TAU);x.fill();
   x.fillStyle='#2b7a3a';for(let t=0;t<3;t++)star(x,cx+(r()-.5)*rx,cy+(r()-.5)*ry*.8,u*.045);}
  x.fillStyle='rgba(30,36,52,.55)';for(const[a,b,s]of[[0,0,1],[.12,-.04,.8],[-.1,.05,.85],[.05,.1,.7],[-.04,-.1,.7]]){x.beginPath();x.arc(w*(.5+a),h*(.5+b),u*.15*s,0,TAU);x.fill();}
  x.fillStyle='rgba(85,95,118,.9)';for(const[a,b,s]of[[0,0,.85],[.1,-.05,.65],[-.09,.04,.7]]){x.beginPath();x.arc(w*(.5+a),h*(.49+b),u*.12*s,0,TAU);x.fill();}
  x.strokeStyle='#ffe45a';x.lineWidth=u*.022;x.lineJoin='miter';x.beginPath();x.moveTo(w*.52,h*.38);x.lineTo(w*.47,h*.52);x.lineTo(w*.53,h*.52);x.lineTo(w*.48,h*.68);x.stroke();}
 else if(k==='metro'){
  x.fillStyle=shade(d.ground,-.45);x.fillRect(0,0,w,h);
  const cols=8,rows=4,cw=w/cols,ch=h/rows;
  x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1;x.setLineDash([4,4]);for(let j=1;j<rows;j++){x.beginPath();x.moveTo(0,j*ch);x.lineTo(w,j*ch);x.stroke();}for(let i=1;i<cols;i++){x.beginPath();x.moveTo(i*cw,0);x.lineTo(i*cw,h);x.stroke();}x.setLineDash([]);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){if(i>=3&&i<=4&&j>=1&&j<=2)continue;const bw=cw*.72,bh=ch*.7,bx=i*cw+(cw-bw)/2,by=j*ch+(ch-bh)/2,hh=r();
   shadow(()=>x.fillRect(bx,by,bw,bh));x.fillStyle=shade(d.solid,(hh-.5)*.35);x.fillRect(bx,by,bw,bh);x.fillStyle=shade(d.solid,.3);x.fillRect(bx+bw*.12,by+bh*.12,bw*.76,bh*.22);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(bx+bw*.15,by+bh*.55,bw*.25,bh*.25);
   x.strokeStyle=d.sedge;x.lineWidth=1;x.strokeRect(bx,by,bw,bh);if(r()<.6)L.push([X+bx+bw*(.2+r()*.6),Y+by+bh*(.3+r()*.5)]);}
  const px=w/2,py=h/2,pr=Math.min(cw*1.4,ch*1.2);x.fillStyle=shade(d.ground,.1);x.beginPath();x.arc(px,py,pr,0,TAU);x.fill();x.strokeStyle=d.sedge;x.lineWidth=u*.014;x.stroke();
  x.strokeStyle='#e8c040';x.lineWidth=u*.026;x.lineCap='round';for(const a of[.5,2.07]){x.beginPath();x.moveTo(px-Math.cos(a)*pr*.7,py-Math.sin(a)*pr*.7);x.lineTo(px+Math.cos(a)*pr*.7,py+Math.sin(a)*pr*.7);x.stroke();}
  x.fillStyle='#333';x.beginPath();x.arc(px,py,u*.03,0,TAU);x.fill();L.push([X+px,Y+py]);}
 else{
  x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=1;for(let i=0;i<w;i+=u*.1){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();}for(let j=0;j<h;j+=u*.1){x.beginPath();x.moveTo(0,j);x.lineTo(w,j);x.stroke();}
  const wl=(a,b,ww,hh)=>{shadow(()=>x.fillRect(a,b,ww,hh));x.fillStyle=d.solid;x.strokeStyle=d.sedge;x.lineWidth=1;x.fillRect(a,b,ww,hh);x.strokeRect(a,b,ww,hh);};
  x.fillStyle=d.solid;const t=u*.06;wl(0,0,w,t);wl(0,h-t,w,t);wl(0,0,t,h);wl(w-t,0,t,h);
  for(const fx of[.26,.74]){wl(w*fx,t,t*.8,h*.3);wl(w*fx,h*.62,t*.8,h*.38-t);}
  wl(w*.34,h*.3,w*.12,t*.8);wl(w*.54,h*.64,w*.12,t*.8);
  for(const[a,b]of[[.4,.18],[.6,.2],[.4,.8],[.62,.78],[.16,.5],[.84,.5]]){x.fillStyle=shade(d.solid,-.15);x.fillRect(w*a-t*.4,h*b-t*.4,t*.8,t*.8);}
  for(const[a,b]of[[.12,.2],[.9,.8],[.12,.82]]){x.fillStyle='#a08a4a';x.fillRect(w*a,h*b,t*1.1,t*1.1);x.strokeStyle='#5c4a1a';x.strokeRect(w*a,h*b,t*1.1,t*1.1);}
  const rr0=u*.17;shadow(()=>{x.beginPath();x.arc(w/2,h/2,rr0,0,TAU);x.fill();});x.fillStyle='#2b2d24';x.beginPath();x.arc(w/2,h/2,rr0,0,TAU);x.fill();x.strokeStyle='#ffb02e';x.lineWidth=u*.02;x.stroke();
  x.strokeStyle='#ffb02e';x.lineWidth=u*.035;x.lineCap='round';for(let i=0;i<3;i++){const a=i*TAU/3+.4;x.beginPath();x.moveTo(w/2,h/2);x.lineTo(w/2+Math.cos(a)*rr0*.85,h/2+Math.sin(a)*rr0*.85);x.stroke();}
  x.fillStyle='#ffe58a';x.beginPath();x.arc(w/2,h/2,u*.03,0,TAU);x.fill();L.push([X+w/2,Y+h/2],[X+w*.2,Y+h*.4],[X+w*.8,Y+h*.6]);}
 x.restore();}
function mapSketch(m,W,H){W=W||360;H=H||200;const tm=curTime(m.id),key=m.id+'|'+tm+'|'+W+'x'+H;if(MSK[key])return MSK[key];
 const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),L=[],bid=m.base||m.id;
 if(m.id==='mundo'){const R=[['archi',0,0,.392,.52],['canon',.392,0,.369,.52],['valle',.761,0,.239,.52],['valle',0,.52,.347,.48],['metro',.347,.52,.313,.48],['fabrica',.66,.52,.34,.48]];
  for(const q of R)skBiome(x,q[0],MAPD[q[0]],q[1]*W,q[2]*H,q[3]*W+1,q[4]*H+1,L);
  x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1.5;for(const q of R)x.strokeRect(q[1]*W,q[2]*H,q[3]*W,q[4]*H);}
 else skBiome(x,bid,m,0,0,W,H,L);
 for(const t of[m.tint,TIMES[tm].c]){if(!t)continue;x.globalCompositeOperation='multiply';x.fillStyle=t;x.fillRect(0,0,W,H);}
 x.globalCompositeOperation='source-over';
 const vg=x.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.65);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.32)');x.fillStyle=vg;x.fillRect(0,0,W,H);
 if(tm==='noche'||tm==='atardecer'){x.globalCompositeOperation='lighter';for(const p of L){const g=x.createRadialGradient(p[0],p[1],0,p[0],p[1],H*.06);g.addColorStop(0,tm==='noche'?'rgba(255,225,130,.95)':'rgba(255,200,110,.45)');g.addColorStop(1,'rgba(255,200,90,0)');x.fillStyle=g;x.fillRect(p[0]-H*.07,p[1]-H*.07,H*.14,H*.14);}x.globalCompositeOperation='source-over';}
 return MSK[key]=c.toDataURL('image/jpeg',.88);}

