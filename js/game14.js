'use strict';
/* ===== UI de progresión: Pase, Tienda, recompensa diaria, panel de partida ===== */
IC.pass='<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>';
IC.c_paint='<path d="M12 3c3.5 4.5 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.5 12 3z"/>';
IC.c_pattern='<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 12L12 4M4 20L20 4M12 20l8-8"/>';
IC.c_sticker='<path d="M4 4h16v10l-6 6H4z"/><path d="M20 14h-6v6"/>';
IC.c_trail='<path d="M3 8h8M2 12h11M3 16h8"/><path d="M15 12l6-3.5v7z"/>';
IC.c_fx='<path d="M12 2l2 6 6-2-3 5 5 3-6 1 1 6-5-4-5 4 1-6-6-1 5-3-3-5 6 2z"/>';
IC.c_acc='<path d="M6 21V4"/><path d="M6 5h12l-3 4 3 4H6"/>';
IC.pvx='<path d="M6 6l12 12M18 6L6 18"/>';
IC.shop='<path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0"/>';
const weeklyReady=()=>weeklyList().filter(q=>q.got>=q.n&&!SAVE.weekly.claimed[q.id]).length;
function modal(html){closeModal();const m=document.createElement('div');m.id='modal';m.className='modal';m.innerHTML='<div class="mbox" role="dialog" aria-modal="true">'+html+'</div>';document.body.appendChild(m);setTimeout(()=>{const b=m.querySelector('[data-x="mok"]');if(b)b.focus({preventScroll:true});},0);}
function cineOr(o,fb){try{if(window.CINE&&CINE.show(o))return;}catch(e){}if(fb)toast(fb);}
function rw2item(r){return r.t==='coins'||r.t==='gems'?{k:r.t,n:r.n}:{k:'item',cat:r.cat,id:r.id};}
function closeModal(){const m=$('modal');if(m)m.remove();pendingBuy=null;}
let pendingBuy=null;
function askBuy(o){modal('<h2>'+h(o.title)+'</h2><div class="mdesc">'+o.body+'</div><div class="row" style="justify-content:space-between;margin:14px 0"><span class="mut">Precio</span><span class="big" style="font-size:26px">'+o.price+'</span></div>'+
 '<div class="row"><button class="btn ok" data-x="mok">Confirmar</button><button class="btn" data-x="mno">Cancelar</button></div>');pendingBuy=o;}
const gemsTxt=n=>GEM+' '+nf(n);
function unlockPrem(){ensureSeason();SAVE.pass.prem=1;persist();cineOr({title:'¡Pase Premium activado!',items:[{k:'pass'}],big:1},'¡Pase Premium activado!');}

/* ---- Inicio: nivel + login ---- */
function loginCard(){const L=loginIdx();
 return'<div class="panel login"><div class="head"><h3>Recompensa diaria</h3><span class="tag">Racha: '+SAVE.login.streak+' '+(SAVE.login.streak===1?'día':'días')+'</span></div><div class="days">'+
  LOGIN.map((r,i)=>'<div class="day '+(i<L.idx?'done':'')+(i===L.idx&&L.ready?' cur':'')+'"><span class="tag">Día '+(i+1)+'</span>'+(r.coins?'<b>'+coin+nf(r.coins)+'</b>':'')+(r.gems?'<b>'+GEM+r.gems+'</b>':'')+(i<L.idx?'<i class="chk">'+ic('check',14)+'</i>':'')+'</div>').join('')+'</div>'+
  (L.ready?'<button class="btn ok ready" data-x="login" style="margin-top:12px;width:100%">Cobrar día '+(L.idx+1)+'</button>':'<p class="tag" style="margin-top:10px">Vuelve mañana '+inf('Vuelve mañana para el día '+(L.idx+1)+'. Si faltas un día, la racha vuelve a empezar.')+'</p>')+'</div>';}
function todayPanel(){const L=loginIdx(),dl=dailyList(),rdy=dl.filter(q=>q.got>=q.n&&!SAVE.daily.claimed[q.id]).length,pend=dl.filter(q=>q.got<q.n).length,cl=passClaimable()+weeklyReady();let fo=null;try{fo=flashOffer();}catch(e){}
 const it=[];if(L.ready)it.push(['login','Cobra tu recompensa diaria (día '+(L.idx+1)+')','Cobrar','hot']);if(rdy)it.push(['challenges',rdy+' reto'+(rdy>1?'s':'')+' listo'+(rdy>1?'s':'')+' para cobrar','Ver','hot']);if(pend)it.push(['challenges',pend+' reto'+(pend>1?'s':'')+' en curso','Ver','']);if(cl)it.push(['pass',cl+' recompensa'+(cl>1?'s':'')+' del pase','Cobrar','hot']);if(fo&&!fo.sold)it.push(['shop','Oferta flash disponible','Ver','']);
 if(!it.length)return'';
 return'<div class="panel today" style="margin-bottom:14px"><div class="head"><h3>Qué hacer hoy</h3><span class="tag">'+it.length+' pendiente'+(it.length>1?'s':'')+'</span></div><div class="row" style="gap:8px;flex-wrap:wrap">'+it.map(a=>a[0]==='login'?'<button class="btn sm ok ready" data-x="login">'+h(a[1])+'</button>':'<button class="btn sm'+(a[3]?' ok':'')+'" data-go="'+a[0]+'">'+h(a[1])+'</button>').join('')+'</div></div>';}
function homeExtras(){ensureSeason();const lv=levelOf(SAVE.xp),tier=passTier(),cl=passClaimable()+weeklyReady();
 return todayPanel()+'<div class="meta"><button class="panel lvl" data-go="pass"><span class="lvbadge">'+lv.l+'</span><span class="lv-m"><b>Nivel '+lv.l+'</b><span class="bar g"><i style="width:'+(lv.cur/lv.need*100)+'%"></i></span><span class="tag">'+nf(lv.cur)+' / '+nf(lv.need)+' XP</span></span>'+
  '<span class="lv-p"><span class="tag">Pase · '+h(seasonInfo().name)+'</span><b>Nivel '+tier+' / '+TIERS+'</b>'+(cl?'<span class="pill hot">'+cl+' por cobrar</span>':'<span class="tag">Quedan '+seasonInfo().left+' días</span>')+'</span></button>'+loginCard()+'</div>';}

/* ---- Pase de batalla ---- */
function vPass(){const s=ensureSeason(),P=SAVE.pass,tier=passTier(),inT=tier>=TIERS?TIER_XP:P.xp-tier*TIER_XP,cl=passClaimable(),wk=weeklyList();
 const cell=(t,side)=>{const r=PASS[t-1][side==='f'?'free':'prem'],got=side==='f'?P.free[t]:P.pre[t],reach=t<=tier,locked=side==='p'&&!P.prem,can=reach&&!locked&&!got;
  return'<button class="tcell '+side+(got?' got':'')+(can?' rdy':'')+(locked?' pl':'')+'" '+(can?'data-x="claim" data-t="'+t+'" data-s="'+side+'"':'disabled')+' title="'+h(rewardTxt(r))+'" aria-label="Nivel '+t+' '+(side==='f'?'gratis':'premium')+': '+h(rewardTxt(r))+'">'+rewardIcon(r)+'<span>'+h(r.t==='item'?rewardTxt(r):nf(r.n))+'</span>'+(got?'<i class="chk">'+ic('check',14)+'</i>':locked?'<i class="chk">'+ic('lock',14)+'</i>':'')+'</button>';};
 view.innerHTML=rowTitle('Pase de batalla','Temporada '+(s.idx+1)+' · quedan '+s.left+' días')+
 '<div class="panel passhead"><div class="ph-l"><h2>'+h(s.name)+'</h2><div class="row" style="flex-wrap:nowrap;margin-top:8px"><span class="lvbadge sm">'+tier+'</span><div style="flex:1;min-width:0"><div class="row" style="flex-wrap:nowrap"><b>Nivel de pase '+tier+' / '+TIERS+'</b><span class="sp"></span><span class="tag">'+nf(inT)+' / '+TIER_XP+' XP</span></div><div class="bar g"><i style="width:'+(inT/TIER_XP*100)+'%"></i></div></div></div>'+
  '<p class="tag" style="margin-top:8px">XP de temporada '+inf('Ganas XP en cada partida. Al terminar la temporada se cobran solas las recompensas que no hayas reclamado.')+'</p></div>'+
  '<div class="ph-r">'+(P.prem?'<span class="pill on">★ Premium activo</span>':'<button class="btn buy" data-x="prem">★ Premium · '+gemsTxt(PASS_GEMS)+'</button>')+
  (cl?'<button class="btn ok ready" data-x="claimall">Reclamar todo ('+cl+')</button>':'')+(tier<TIERS?'<button class="btn" data-x="buytier">+1 nivel · '+gemsTxt(TIER_GEMS)+'</button>':'')+'</div></div>'+
 '<div class="trackwrap"><div class="tlab"><span class="tn">&nbsp;</span><b>Gratis</b><b class="pm">★ Premium</b></div><div class="track" id="track">'+
  PASS.map((_,i)=>{const t=i+1;return'<div class="tier '+(t===tier?'cur':'')+(t<=tier?' done':'')+'"><div class="tn">'+t+'</div>'+cell(t,'f')+cell(t,'p')+'</div>';}).join('')+'</div></div>'+
 '<div class="panel" style="margin-top:16px"><div class="head"><h3>Misiones semanales</h3>'+inf('Dan XP de pase y gemas. Se renuevan cada lunes.')+'</div>'+
  wk.slice().sort((a,b)=>rank(a.got>=a.n,SAVE.weekly.claimed[a.id])-rank(b.got>=b.n,SAVE.weekly.claimed[b.id])).map(q=>{const done=q.got>=q.n,c=SAVE.weekly.claimed[q.id];return'<div class="reward'+(done&&!c?' rdy':'')+'" style="display:grid;gap:8px"><div class="qh"><b>'+h(q.text)+'</b><span class="pill cost">+'+q.pxp+' XP</span><span class="pill cost">'+GEM+q.gems+'</span></div><div class="qb"><span class="bar g"><i style="width:'+(q.got/q.n*100)+'%"></i></span><span class="tag">'+q.got+'/'+q.n+'</span>'+(c?'<span class="pill on">Cobrado</span>':'<button class="btn sm '+(done?'ok ready':'')+'" data-x="wclaim" data-id="'+q.id+'" '+(done?'':'disabled')+'>Cobrar</button>')+'</div></div>';}).join('')+'</div>';
 const tr=$('track');if(tr){const tc=tr.querySelector('.tier.cur')||tr.querySelector('.tier');if(tc)tr.scrollLeft=Math.max(0,tc.offsetLeft-tr.clientWidth/2+tc.offsetWidth/2);}}

/* ---- Tienda ---- */
let cdT=0;
function startCd(){clearInterval(cdT);cdT=setInterval(()=>{const els=document.querySelectorAll('.cd');if(!els.length){clearInterval(cdT);return;}let exp=false;
 els.forEach(e=>{const l=+e.dataset.until-Date.now();if(l<=0)exp=true;else e.textContent=fmtLeft(l);});if(exp&&tab==='shop')render_ui();},20000);}
const cdTag=(until,txt)=>'<span class="tag">'+txt+' <b class="cd" data-until="'+until+'">'+fmtLeft(until-Date.now())+'</b></span>';
function offerTile(o,x,i){return'<button class="item" data-x="'+x+'"'+(i===undefined?'':' data-i="'+i+'"')+(o.sold?' disabled':'')+'>'+rewardIcon({t:'item',cat:o.cat,id:o.id})+'<span>'+h(o.name)+'</span><span class="tag">'+h(CATS.find(c=>c[0]===o.cat)[1])+'</span>'+
 (o.sold?'<span class="pill on">Comprado</span>':'<span class="pill cost">'+coin+nf(o.price)+' <s class="was">'+nf(o.cost)+'</s></span><i class="ribbon">-'+o.off+'%</i>')+'</button>';}
function vShop(){const day=dailyOffers(),fl=flashOffer(),wd=weeklyDeal(),st=!SAVE.shop.starter,dayEnd=(dayNum()+1)*864e5,wkEnd=((weekNum()+1)*7-3)*864e5;
 const flash=fl?'<div class="panel flash"><div class="head"><h3>Oferta relámpago</h3>'+cdTag(flashEnd(),'Termina en')+'</div><div class="items shopitems" style="grid-template-columns:1fr">'+offerTile(fl,'flash')+'</div><p class="tag" style="margin-top:10px">Cambia cada '+FLASH_H+' horas: -50 % en un cosmético.</p></div>':'';
 let deal='';
 if(wd){const vis=wd.kind==='plane'?'<canvas class="mini" data-mini="'+wd.id+'"></canvas>':'<img alt="" src="'+mapSketch(MAPD[wd.id])+'" style="width:100%;height:auto;border-radius:10px;border:2px solid var(--ink)">';
  deal='<div class="panel deal"><div class="head"><h3>Oferta de la semana</h3>'+cdTag(wkEnd,'Termina en')+'</div>'+vis+'<div class="row" style="margin:10px 0"><b style="font-size:18px">'+h(wd.name)+'</b><span class="tag">'+(wd.kind==='plane'?'Avión':'Mapa')+'</span><span class="sp"></span><i class="off">-'+wd.off+'%</i></div>'+
   (wd.sold?'<span class="pill on">Comprado</span>':'<button class="btn buy" data-x="deal" style="width:100%">'+coin+nf(wd.price)+' <s class="was">'+nf(wd.cost)+'</s></button>')+'</div>';}
 view.innerHTML=rowTitle('Tienda','?Todo se paga con las monedas y gemas que ganas jugando; sin dinero real.')+
 (st?'<div class="panel promo"><div class="pr-t"><span class="pill hot">Solo una vez · -'+STARTER.off+'%</span><h2>Pack de bienvenida</h2><p>Pintura exclusiva <b>Pionero</b> · estela Neón · pegatina Estrella · '+GEM+' '+STARTER.gems+' gemas</p><p class="tag">Valor '+coin+nf(STARTER.was)+'</p></div><button class="btn buy" data-x="starter">'+coin+nf(STARTER.price)+'</button></div>':'')+
 ((flash||deal)?'<div class="grid g2" style="margin-bottom:16px">'+flash+deal+'</div>':'')+
 '<div class="panel" style="margin-bottom:16px"><div class="head"><h3>Ofertas de hoy</h3>'+cdTag(dayEnd,'Se renuevan en')+'</div><div class="items shopitems">'+
  (day.length?day.map((o,i)=>offerTile(o,'offer',i)).join(''):'<p class="mut">Ya lo tienes todo. ¡Enhorabuena!</p>')+'</div></div>'+
 '<div class="grid g2" style="margin-bottom:16px"><div class="panel"><div class="head"><h3>Packs de estilo</h3>'+inf('Más baratos que por separado')+'</div>'+
  BUNDLES.map(b=>{const own=bundleOwned(b);return'<div class="reward" style="display:grid;gap:8px"><div class="row"><b>'+h(b.name)+'</b><i class="off">-'+b.off+'%</i><span class="sp"></span>'+(own?'<span class="pill on">Tuyo</span>':'<button class="btn sm buy" data-x="bundle" data-id="'+b.id+'">'+coin+nf(bundleNow(b))+' <s class="was">'+nf(bundleWas(b))+'</s></button>')+'</div><div class="row">'+b.items.map(([c,i])=>rewardIcon({t:'item',cat:c,id:i})+'<span class="tag">'+h(itemOf(c,i).name)+'</span>').join('')+'</div></div>';}).join('')+'</div>'+
 '<div class="panel"><div class="head"><h3>Cambio de gemas</h3>'+inf('Cuanto más cambias, más gemas')+'</div><div class="items shopitems">'+
  GEMSHOP.map(g=>'<button class="item" data-x="gemx" data-id="'+g.id+'"><span class="gemxl">'+GEM+'</span><b class="big" style="font-size:22px">'+nf(g.gems)+'</b><span class="pill cost">'+coin+nf(g.coins)+'</span>'+(g.tag?'<i class="ribbon">'+g.tag+'</i>':'')+'</button>').join('')+'</div>'+
  '<p class="tag" style="margin-top:10px">Info '+inf('Las gemas sirven para el Pase Premium, subir niveles de pase y más. También las ganas jugando (niveles, recompensa diaria, misiones).')+'</p></div></div>'+
 '<div class="panel"><div class="row"><div style="flex:1;min-width:200px"><h3>Pase de batalla</h3><p class="mut" style="margin-top:4px">Recompensas gratis en cada nivel. El Pase Premium ('+GEM+' '+PASS_GEMS+') añade cosméticos exclusivos.</p></div><button class="btn" data-go="pass">Ver pase</button></div></div>'+
 '<p class="tag" style="margin-top:14px">Relámpago cada '+FLASH_H+' h · ofertas diarias a medianoche (UTC) · oferta semanal con avión o mapa. Las rebajas también aparecen en Garaje y Mapas.</p>';
 drawMinis();startCd();}

/* ---- panel de progreso en el resultado ---- */
function progPanel(r){const p=r.prog;if(!p)return'';const lv=p.lv;
 return'<div class="panel prog" style="margin-bottom:16px"><div class="head"><h3>Progreso</h3><span class="pill cost">+'+nf(p.xp)+' XP</span></div>'+
 p.lines.map(x=>'<div class="reward"><span>'+h(x[0])+'</span><span>+'+nf(x[1])+' XP</span></div>').join('')+
 '<div class="row" style="flex-wrap:nowrap;margin-top:12px"><span class="lvbadge sm">'+lv.l+'</span><div style="flex:1;min-width:0"><div class="row" style="flex-wrap:nowrap"><b>Nivel '+lv.l+'</b><span class="sp"></span><span class="tag">'+nf(lv.cur)+' / '+nf(lv.need)+' XP</span></div><div class="bar g grow"><i style="--w:'+(lv.cur/lv.need*100)+'%;width:var(--w)"></i></div></div></div>'+
 p.rw.map(x=>'<div class="lvup">¡Subes al nivel '+x.l+'! <b>'+coin+nf(x.coins)+'</b>'+(x.gems?' <b>'+GEM+x.gems+'</b>':'')+'</div>').join('')+
 '<div class="row" style="margin-top:14px;flex-wrap:nowrap"><div class="grow1"><b>Pase de batalla</b>'+(p.t1>p.t0?' <span class="pill hot">¡Nivel '+p.t1+'!</span>':'')+'<div class="tag">Nivel '+p.pt+' / '+TIERS+'</div></div><button class="btn sm '+(passClaimable()?'ok ready':'')+'" data-go="pass">'+(passClaimable()?'Reclamar':'Ver pase')+'</button></div></div>';}

/* ---- acciones ---- */
function buyItemOffer(o){askBuy({title:o.name,body:'<p>'+h(CATS.find(c=>c[0]===o.cat)[1])+' para tus aviones. Oferta -'+o.off+'%.</p>',price:coin+' '+nf(o.price),ok:()=>{if(o.sold)return;if(!spendCoins(o.price)){toast('Te faltan monedas');return;}SAVE.own[o.cat][o.id]=1;SAVE.shop.sold[o.key]=1;persist();cineOr({title:'¡Desbloqueado!',items:[{k:'item',cat:o.cat,id:o.id}]},o.name+' desbloqueado');render_ui();}});}
document.addEventListener('click',e=>{const t=e.target.closest('[data-x]');if(!t)return;Snd.init();const x=t.dataset.x,id=t.dataset.id;
 if(x==='mok'){const o=pendingBuy;closeModal();if(o)o.ok();return;}
 if(x==='mno'){closeModal();return;}
 if(x==='resetask'){modal('<h2>¿Borrar todo el progreso?</h2><div class="mdesc"><p>Perderás monedas, gemas, aviones, mejoras, pase y estadísticas. Esta acción no se puede deshacer.</p></div><div class="row" style="margin-top:14px"><button class="btn bad" data-x="resetok">Sí, borrar</button><button class="btn ok" data-x="mno">Cancelar</button></div>');return;}
 if(x==='resetok'){closeModal();try{localStorage.removeItem(SKEY);}catch(e){}SAVE=defSave();persist();toast('Progreso borrado');go('home');return;}
 if(x==='claim'){const tt=+t.dataset.t,sd=t.dataset.s;const r=PASS[tt-1][sd==='f'?'free':'prem'];if(claimTier(tt,sd))cineOr({title:'¡Recompensa!',items:[rw2item(r)],fast:1},'Recibido: '+rewardTxt(r));render_ui();return;}
 if(x==='claimall'){let n=0;const L=[],P=SAVE.pass,tier=passTier();for(let k=1;k<=tier;k++){if(claimTier(k,'f')){n++;L.push(rw2item(PASS[k-1].free));}if(claimTier(k,'p')){n++;L.push(rw2item(PASS[k-1].prem));}}if(n)cineOr({title:'¡Recompensas!',items:window.CINE?CINE.merge(L):L},'Has reclamado '+n+' recompensas');render_ui();return;}
 if(x==='buytier'){askBuy({title:'Comprar un nivel de pase',body:'<p>Sube un nivel de pase al instante.</p>',price:gemsTxt(TIER_GEMS),ok:()=>{if(!spendGems(TIER_GEMS)){toast('Te faltan gemas');return;}ensureSeason();SAVE.pass.xp=Math.min(TIERS*TIER_XP,(passTier()+1)*TIER_XP);persist();cineOr({title:'¡Subes un nivel de pase!',items:[{k:'tier'}],fast:1},'¡Subes un nivel de pase!');render_ui();}});return;}
 if(x==='prem'){askBuy({title:'Pase Premium',body:'<p>Desbloquea la fila premium: 20 cosméticos exclusivos, gemas y monedas en cada nivel.</p>',price:gemsTxt(PASS_GEMS),ok:()=>{if(SAVE.pass.prem){return;}if(!spendGems(PASS_GEMS)){toast('Te faltan gemas: consíguelas en la Tienda');return;}unlockPrem();render_ui();}});return;}
 if(x==='login'){const r=claimLogin();if(r){cineOr({title:'¡Recompensa diaria!',items:[r.coins?{k:'coins',n:r.coins}:null,r.gems?{k:'gems',n:r.gems}:null].filter(Boolean)},'Recompensa diaria: '+(r.coins?'+'+nf(r.coins)+' monedas ':'')+(r.gems?'+'+r.gems+' gemas':''));}render_ui();return;}
 if(x==='wclaim'){const q=claimWeekly(id);if(q)cineOr({title:'¡Recompensa!',items:[{k:'gems',n:q.gems},{k:'xp',n:q.pxp}],fast:1},'+'+q.pxp+' XP de pase y '+q.gems+' gemas');render_ui();return;}
 if(x==='offer'){const o=dailyOffers()[+t.dataset.i];if(!o||o.sold)return;buyItemOffer(o);return;}
 if(x==='bundle'){const b=BUNDLES.find(k=>k.id===id);if(!b||bundleOwned(b))return;const pr=bundleNow(b);askBuy({title:b.name,body:'<p>'+b.items.map(([c,i])=>h(itemOf(c,i).name)).join(' · ')+'</p><p class="tag" style="margin-top:6px">-'+b.off+'% frente a comprarlos por separado.</p>',price:coin+' '+nf(pr),ok:()=>{if(!spendCoins(pr)){toast('Te faltan monedas');return;}for(const[c,i]of b.items)SAVE.own[c][i]=1;persist();cineOr({title:'¡Desbloqueado!',sub:b.name,items:b.items.map(([c,i])=>({k:'item',cat:c,id:i})),big:1},b.name+' desbloqueado');render_ui();}});return;}
 if(x==='starter'){askBuy({title:'Pack de bienvenida',body:'<p>Pintura exclusiva Pionero, estela Neón, pegatina Estrella y '+STARTER.gems+' gemas. Solo una vez.</p>',price:coin+' '+nf(STARTER.price),ok:()=>{if(SAVE.shop.starter)return;if(!spendCoins(STARTER.price)){toast('Te faltan monedas');return;}SAVE.shop.starter=1;for(const[c,i]of STARTER.items)grant({t:'item',cat:c,id:i},true);SAVE.gems+=STARTER.gems;persist();cineOr({title:'¡Pack de bienvenida recibido!',items:[{k:'gems',n:STARTER.gems}].concat(STARTER.items.map(([c,i])=>({k:'item',cat:c,id:i}))),big:1},'¡Pack de bienvenida recibido!');render_ui();}});return;}
 if(x==='flash'){const o=flashOffer();if(!o||o.sold)return;buyItemOffer(o);return;}
 if(x==='deal'){const d=weeklyDeal();if(!d||d.sold)return;askBuy({title:d.name,body:'<p>'+(d.kind==='plane'?'Avión':'Mapa')+' de la oferta semanal (-'+d.off+'%). El precio rebajado también aparece en '+(d.kind==='plane'?'el Garaje':'Mapas')+'.</p>',price:coin+' '+nf(d.price),ok:()=>{if(d.sold)return;if(!spendCoins(d.price)){toast('Te faltan monedas');return;}SAVE.shop.sold[d.key]=1;if(d.kind==='plane'){SAVE.planes[d.id]=newPlaneSave();SAVE.sel.plane=d.id;}else SAVE.maps[d.id]=1;persist();cineOr({title:d.kind==='plane'?'¡Nuevo avión!':'¡Nuevo mapa!',items:[{k:d.kind==='plane'?'plane':'map',id:d.id}],big:1},d.name+' desbloqueado');render_ui();}});return;}
 if(x==='gemx'){const g=GEMSHOP.find(k=>k.id===id);if(!g)return;askBuy({title:nf(g.gems)+' gemas',body:'<p>Cambia monedas por gemas: sirven para el Pase Premium y para subir niveles de pase.</p>',price:coin+' '+nf(g.coins),ok:()=>{if(!spendCoins(g.coins)){toast('Te faltan monedas');return;}SAVE.gems+=g.gems;persist();cineOr({title:'¡Compra completada!',items:[{k:'gems',n:g.gems}],big:1},'+'+nf(g.gems)+' gemas');render_ui();}});return;}
});

/* ---- Modo desarrollador ---- */
const xpTotalFor=l=>{let n=0;for(let i=1;i<l;i++)n+=xpNeed(i);return n;};
function devMax(){SAVE.xp=Math.max(SAVE.xp,xpTotalFor(50));ensureSeason();SAVE.pass.xp=TIERS*TIER_XP;SAVE.pass.prem=1;SAVE.gems=999999999;
 for(const p of PLANES)if(!SAVE.planes[p.id])SAVE.planes[p.id]=newPlaneSave();}
function devPanel(){if(!SAVE.cheat)return'';
 return'<div class="panel dev" style="margin-bottom:16px"><div class="head"><h3>Modo desarrollador</h3><span class="tag">Nivel '+levelOf(SAVE.xp).l+' · '+Object.keys(SAVE.planes).length+' aviones</span></div>'+
 '<label class="sw-t" style="margin:6px 0 12px"><input type="checkbox" '+(DEPTH()?'checked':'')+' data-x="depth"> Profundidad (parallax)</label>'+
 '<div class="row"><button class="btn sm" data-x="devmax">Nivel máx. y todo desbloqueado</button><button class="btn sm bad" data-x="devoff">Salir del modo</button></div></div>';}
document.addEventListener('click',e=>{const t=e.target.closest('[data-x]');if(!t)return;const x=t.dataset.x;
 if(x==='depth'){SAVE.cfg.depth=t.checked?1:0;persist();}
 else if(x==='devmax'){devMax();persist();toast('Nivel máximo y todo desbloqueado');render_ui();}
 else if(x==='devoff'){SAVE.cheat=0;SAVE.coins=Math.min(SAVE.coins,5000);SAVE.gems=Math.min(SAVE.gems,500);persist();toast('Modo desarrollador desactivado');render_ui();}});
/* ===== Entrada, bucle y arranque ===== */
const gameEl=$('game'),pauseEl=$('pause');
let running=false,last=0,raf=0,resultShown=false;
