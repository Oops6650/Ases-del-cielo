'use strict';
/* ===== Miniaturas de mapa = minigameplay: un caza persigue y derriba a otros dos sobre el propio mapa ===== */
const MPIMG={},MPST=new WeakMap();let MPRAF=0,MPLAST=0;
function mpImg(m){const k=m.id+'|'+curTime(m.id);let o=MPIMG[k];if(!o){o=MPIMG[k]=new Image();o.src=mapSketch(m);}return o;}
function mpInit(cv,m){let hs=0;for(const ch of m.id)hs=(hs*31+ch.charCodeAt(0))>>>0;
 const n=PLANES.length,pp=SAVE.planes[SAVE.sel.plane]?SAVE.sel.plane:PLANES[0].id,pk=i=>CAT.paint[(hs+i*7)%CAT.paint.length].id;
 const fd=i=>PLANES[(hs+1+i*3)%n];
 return{t:(hs%50)/10,hero:{def:PLANE[pp]||PLANES[0],look:planeOwned(pp)?lookOf(pp):DEFLOOK},
  foes:[0,1].map(i=>({def:fd(i),look:{...DEFLOOK,paint:pk(i+1),trail:'humo'},ph:i*3.1+hs%7,dead:0,sh:.5*i,pa:0,pb:0})),
  bl:[],pt:[],fire:0,tr:0,img:mpImg(m),m,hs};}
function mpStep(st,cv,dt){
 const w=cv.width/cv.dpr,h=cv.height/cv.dpr,ax=w*.34,ay=h*.28,cx=w/2,cy=h/2,t=st.t+=dt,L=Math.max(18,w*.13);
 const pos=(ux,uy)=>[cx+ux*ax,cy+uy*ay];
 const hu=tt=>[Math.cos(.9*tt),.85*Math.sin(1.35*tt)];
 const fu=(f,tt)=>{const a=.55*tt+f.ph;return[.95*Math.cos(a)+.1*Math.sin(2.2*tt),.8*Math.sin(a*1.2)];};
 const hp=pos(...hu(t)),hq=pos(...hu(t+.02)),ha=Math.atan2(hq[1]-hp[1],hq[0]-hp[0]);
 const H={x:hp[0],y:hp[1],a:ha};st.H=H;
 for(const f of st.foes){f.dead=Math.max(0,f.dead-dt);const p=pos(...fu(f,t)),q=pos(...fu(f,t+.02));f.x=p[0];f.y=p[1];f.a=Math.atan2(q[1]-p[1],q[0]-p[0]);}
 const sp=w*1.0;
 st.fire-=dt;
 let tg=null,bd=1e9;for(const f of st.foes){if(f.dead>0)continue;const dx=f.x-H.x,dy=f.y-H.y,d=Math.hypot(dx,dy),da=Math.abs(Math.atan2(Math.sin(Math.atan2(dy,dx)-H.a),Math.cos(Math.atan2(dy,dx)-H.a)));if(da<.45&&d<w*.7&&d<bd){bd=d;tg=f;}}
 if(tg&&st.fire<=0){st.fire=.26;st.bl.push({x:H.x+Math.cos(H.a)*L*.5,y:H.y+Math.sin(H.a)*L*.5,vx:Math.cos(H.a)*sp,vy:Math.sin(H.a)*sp,l:.9,c:'#ffe27a'});}
 for(const f of st.foes){f.sh-=dt;if(f.dead<=0&&f.sh<=0){f.sh=1.1+((st.hs+((f.ph*10)|0))%5)*.2;st.bl.push({x:f.x+Math.cos(f.a)*L*.5,y:f.y+Math.sin(f.a)*L*.5,vx:Math.cos(f.a)*sp*.6,vy:Math.sin(f.a)*sp*.6,l:.9,c:'#ff6b5e'});}}
 for(const b of st.bl){b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.c==='#ffe27a')for(const f of st.foes){if(f.dead>0||b.l<=0)continue;if(Math.hypot(f.x-b.x,f.y-b.y)<L*.42){b.l=0;f.dead=1.6;for(let i=0;i<16;i++){const a=i/16*6.283+Math.random()*.4,v=w*(.15+Math.random()*.35);st.pt.push({x:f.x,y:f.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.6,m:.6,k:i%3?'#ff9b3d':'#ffe27a'});}}}}
 st.bl=st.bl.filter(b=>b.l>0);
 st.tr-=dt;if(st.tr<=0){st.tr=.045;const all=[[H.x,H.y,H.a,1],...st.foes.filter(f=>f.dead<=0).map(f=>[f.x,f.y,f.a,0])];for(const[x,y,a,hr]of all)st.pt.push({x:x-Math.cos(a)*L*.45,y:y-Math.sin(a)*L*.45,vx:0,vy:0,l:.5,m:.5,k:'#ffffff',r:hr?L*.09:L*.07,s:1});}
 for(const p of st.pt){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}st.pt=st.pt.filter(p=>p.l>0);
}
function mpDraw(st,cv){const c=cv.getContext('2d'),d=cv.dpr,w=cv.width/d,h=cv.height/d,L=Math.max(18,w*.13);
 c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
 const im=st.img;if(im.complete&&im.naturalWidth){const z=1.3,sc=Math.max(w/im.naturalWidth,h/im.naturalHeight)*z,iw=im.naturalWidth*sc,ih=im.naturalHeight*sc,H=st.H||{x:w/2,y:h/2},ox=-(iw-w)*(.5+.5*(H.x/w-.5)*1.6),oy=-(ih-h)*(.5+.5*(H.y/h-.5)*1.6);c.drawImage(im,Math.min(0,Math.max(w-iw,ox)),Math.min(0,Math.max(h-ih,oy)),iw,ih);}
 for(const p of st.pt){if(!p.s)continue;c.globalAlpha=p.l/p.m*.55;c.fillStyle=p.k;c.beginPath();c.arc(p.x,p.y,p.r*(1.4-p.l/p.m*.5),0,6.283);c.fill();}
 c.globalAlpha=1;
 const dr=(o,x,y,a)=>drawPlane(c,o.def,o.look,{x,y,ang:a,scale:L/o.def.shape.len,flame:.6,t:st.t});
 for(const f of st.foes)if(f.dead<=0)dr(f,f.x,f.y,f.a);
 if(st.H)dr(st.hero,st.H.x,st.H.y,st.H.a);
 for(const b of st.bl){c.fillStyle=b.c;c.globalAlpha=Math.min(1,b.l*3);c.fillRect(b.x-L*.12,b.y-L*.03,L*.24,L*.06);}
 for(const p of st.pt){if(p.s)continue;c.globalAlpha=p.l/p.m;c.fillStyle=p.k;c.beginPath();c.arc(p.x,p.y,L*.1*(.5+p.l/p.m),0,6.283);c.fill();}
 c.globalAlpha=1;}
function mpFrame(now){MPRAF=0;const cvs=[...document.querySelectorAll('canvas.mgp')];if(!cvs.length)return;
 const dt=Math.min(.05,(now-MPLAST)/1000||.033);
 if(now-MPLAST<30){MPRAF=requestAnimationFrame(mpFrame);return;}
 MPLAST=now;
 for(const cv of cvs){const r=cv.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.width<8)continue;
  const dpr=Math.min(1.5,window.devicePixelRatio||1),W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}cv.dpr=dpr;
  const m=MAPD[cv.dataset.map];if(!m)continue;let st=MPST.get(cv);if(!st){st=mpInit(cv,m);MPST.set(cv,st);}
  mpStep(st,cv,dt);mpDraw(st,cv);}
 MPRAF=requestAnimationFrame(mpFrame);}
function startMapPlay(){cancelAnimationFrame(MPRAF);MPRAF=0;if(!document.querySelector('canvas.mgp'))return;
 if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches){for(const cv of document.querySelectorAll('canvas.mgp')){const m=MAPD[cv.dataset.map],r=cv.getBoundingClientRect();cv.dpr=1;cv.width=Math.round(r.width)||240;cv.height=Math.round(r.height)||136;const st=mpInit(cv,m);for(let i=0;i<40;i++)mpStep(st,cv,.05);mpDraw(st,cv);}return;}
 MPLAST=0;MPRAF=requestAnimationFrame(mpFrame);}
function timePanel(){const id=SAVE.sel.map,mp=MAPD[id],ct=curTime(id);return'<div class="panel" style="margin-bottom:16px"><div class="row"><h3>Hora del día</h3>'+inf('La hora del día se aplica a todos los mapas y miniaturas.')+'</div><div class="seg" style="margin-top:10px">'+TIMEK.map(k=>'<button class="chip '+(ct===k?'on':'')+'" data-act="settime" data-v="'+k+'" aria-pressed="'+(ct===k)+'">'+TIMES[k].n+'</button>').join('')+'</div></div>';}
function vMaps(){view.innerHTML=rowTitle('Mapas',Object.keys(SAVE.maps).length+' de '+MAPDEF.length+' desbloqueados')+timePanel()+'<div class="grid g3">'+MAPDEF.map(m=>{const own=mapOwned(m.id),sel=SAVE.sel.map===m.id,rec=SAVE.rec['map_'+m.id];
  return'<button class="map '+(sel?'sel':'')+(own?'':' locked')+'" data-act="'+(own?'selmap':'buymap')+'" data-id="'+m.id+'" aria-pressed="'+sel+'"><div class="sk" style="background:url('+mapSketch(m)+') center/cover"><canvas class="mgp" data-map="'+m.id+'"></canvas><span class="badge">'+(own?(sel?'<span class="pill on">'+ic('check',14)+' Elegido</span>':''):'<span class="pill cost">'+ic('lock',14)+' '+coin+nf(mapPrice(m.id))+(mapPrice(m.id)<m.cost?' <s class="was">'+nf(m.cost)+'</s>':'')+'</span>')+'</span></div><div class="bd"><span class="n">'+h(m.name)+' '+inf(m.desc)+'</span>'+(rec?'<span class="tag">Récord: '+nf(rec)+' pts</span>':'')+'</div></button>';}).join('')+'</div>';}

/* --- Ajustes y controles --- */
function slotBtn(dev,a,i){const tok=SAVE.ctl[dev][a][i],cap=CAP&&CAP.dev===dev&&CAP.a===a&&CAP.i===i;
 return'<button class="slot'+(cap?' cap':'')+(tok?'':' empty')+'" data-ctl="slot" data-dev="'+dev+'" data-a="'+a+'" data-i="'+i+'" aria-label="'+h(actName(a))+', casilla '+(i+1)+(tok?': '+h(tokLabel(tok)):': vacía')+'">'+(cap?'…':tok?h(tokLabel(tok)):'—')+'</button>';}
const bindRow=(dev,a,name)=>'<div class="brow"><span class="bn">'+h(name)+'</span><span class="slots3">'+[0,1,2].map(i=>slotBtn(dev,a,i)).join('')+'</span></div>';
const bindPanel=(dev,t,list)=>'<div class="panel"><h3>'+t+'</h3>'+list.map(a=>bindRow(dev,a,actName(a))).join('')+'</div>';
function ctlCapBanner(){if(!CAP)return'';return'<div class="capbar" role="status"><div><b>Asignando «'+h(actName(CAP.a))+'»</b><span class="tag" style="display:block">'+(CAP.dev==='gp'?'Pulsa un botón del mando o mueve un stick':'Pulsa una tecla o un botón del ratón')+' · Esc cancela'+(CAP.dev==='kb'?' · Retroceso borra la casilla':'')+'</span></div><button class="btn sm" data-ctl="cancel">Cancelar</button></div>';}
function ctlKb(){return'<p class="mut" style="margin-bottom:12px">Pulsa una casilla y luego la tecla (o un botón del ratón) que quieras. Cada acción admite hasta tres teclas. Si repites una tecla, pasa a la acción nueva. <b>Esc</b> siempre abre la pausa.</p><div class="grid g2">'+
 bindPanel('kb','Vuelo',['left','right','boost','flip'])+bindPanel('kb','Combate',['fire','sec','special'])+bindPanel('kb','Sistema',['pause'])+'</div>'+
 '<div class="row" style="margin-top:14px"><button class="btn sm" data-ctl="kbreset">Restablecer teclado</button>'+inf('Los atajos directos de acrobacias están en la pestaña Combos.')+'</div>';}
function ctlGp(){const pads=(navigator.getGamepads?[...navigator.getGamepads()]:[]).filter(x=>x&&x.connected),dzs=[[.25,'Muy sensible'],[.4,'Normal'],[.55,'Suave']];
 return'<div class="panel '+(pads.length?'tint':'')+'" style="margin-bottom:16px"><div class="row"><b>'+(pads.length?'Mando detectado: '+h(pads[0].id.slice(0,60)):'Ningún mando detectado')+'</b></div><p class="mut" style="margin-top:4px">'+(pads.length?'Pulsa una casilla y luego el botón (o mueve el stick) que quieras usar.':'Conecta un mando y pulsa cualquier botón para que el navegador lo reconozca. Puedes configurar los botones aunque aún no esté conectado.')+'</p></div>'+
 '<div class="grid g2">'+bindPanel('gp','Vuelo',['left','right','boost','flip'])+bindPanel('gp','Combate',['fire','sec','special'])+bindPanel('gp','Sistema',['pause'])+
 '<div class="panel"><h3>Sensibilidad del stick</h3><div class="seg" style="margin-top:10px">'+dzs.map(([v,n])=>'<button class="chip '+(Math.abs(SAVE.ctl.dz-v)<.01?'on':'')+'" data-ctl="dz" data-v="'+v+'">'+n+'</button>').join('')+'</div><p class="tag" style="margin-top:10px">Info '+inf('Cuánto hay que mover el stick para que cuente como una pulsación.')+'</p></div></div>'+
 '<div class="row" style="margin-top:14px"><button class="btn sm" data-ctl="gpreset">Restablecer mando</button>'+inf('En los menús el mando siempre usa: A aceptar · B volver · LB/RB cambiar de pestaña.')+'</div>';}
function seqDup(id){const mine=seqVariants(id).map(v=>v.join());for(const o of MOVES){if(o.id===id)continue;if(seqVariants(o.id).some(v=>mine.includes(v.join())))return o;}return null;}
function seqCard(m){const sq=seqOf(m.id),dup=seqDup(m.id),lr=hasLR(sq);
 return'<div class="panel mv"><div class="head"><h3>'+h(m.n)+'</h3>'+(dup?'<span class="pill" style="background:#f2c4bb">Igual que «'+h(dup.n)+'»</span>':'')+'</div><p class="mut" style="margin:2px 0 10px">'+h(m.d)+'</p>'+
 '<div class="seqrow">'+sq.map((k,i)=>(i?'<span class="then">›</span>':'')+'<button class="step" data-ctl="seqstep" data-id="'+m.id+'" data-i="'+i+'" aria-label="Paso '+(i+1)+': '+ARR[k]+'. Pulsa para cambiar">'+ARR[k]+'</button>').join('')+
  (sq.length<4?'<button class="step add" data-ctl="seqadd" data-id="'+m.id+'" aria-label="Añadir paso">+</button>':'')+(sq.length>2?'<button class="step add" data-ctl="seqdel" data-id="'+m.id+'" aria-label="Quitar último paso">−</button>':'')+'</div>'+
 '<p class="tag" style="margin:8px 0">'+(lr?'También funciona en espejo: '+sq.map(mirrorTok).map(k=>ARR[k]).join(' ')+'. ':'')+'Pulsa un paso para cambiar su flecha.</p>'+
 m.keys.map(([a,nm])=>bindRow('kb',a,nm+' · teclado')+bindRow('gp',a,nm+' · mando')).join('')+'</div>';}
function ctlCombos(){return'<div class="panel" style="margin-bottom:16px"><h3>Tiempo entre pulsaciones</h3><div class="seg" style="margin-top:10px">'+WINS.map(([n],i)=>'<button class="chip '+(SAVE.ctl.win===i?'on':'')+'" data-ctl="win" data-v="'+i+'">'+n+'</button>').join('')+'</div><p class="tag" style="margin-top:10px">Info '+inf('Cuanto más relajada, más margen tienes entre una pulsación y la siguiente. Si los combos no te salen, prueba «Relajada».')+'</p></div>'+
 '<div class="panel tester" style="margin-bottom:16px"><h3>Probador</h3><p class="mut" style="margin:2px 0 8px">Pulsa tus teclas de giro, turbo y volteo (o el stick del mando) y mira qué acrobacia se reconoce. Aquí no gastas energía ni arriesgas nada.</p><div id="cmbOut" class="cout">Esperando pulsaciones…</div><div class="tag" style="margin-top:6px">Últimas pulsaciones: <b id="cmbHist" style="letter-spacing:.2em">—</b></div></div>'+
 '<div class="grid g2">'+MOVES.map(seqCard).join('')+'</div><div class="row" style="margin-top:14px"><button class="btn sm" data-ctl="seqreset">Restablecer combos</button>'+inf('Se pueden usar de 2 a 4 pasos. Las secuencias con ← y → funcionan también en espejo.')+'</div>';}
function vPlay(){if(SAVE.cfg.parts==null)SAVE.cfg.parts=0;const tabs=[['kb','Teclado y ratón'],['gp','Mando'],['cmb','Combos']];
 view.innerHTML=rowTitle('Ajustes')+'<div class="panel" style="margin-bottom:16px"><label class="sw-t"><input type="checkbox" id="snd" '+(SAVE.cfg.sound?'checked':'')+' data-act="snd"> Sonido</label></div>'+
 '<div class="panel" style="margin-bottom:16px"><div class="head"><h3>Rendimiento</h3><span class="tag">Si notas lag, baja estas opciones</span></div>'+
 '<label class="sw-t" style="margin:6px 0"><input type="checkbox" '+(SAVE.cfg.clouds!==0?'checked':'')+' data-act="opt" data-k="clouds"> Nubes</label>'+
 '<label class="sw-t" style="margin:6px 0"><input type="checkbox" '+(SAVE.cfg.glow!==0?'checked':'')+' data-act="opt" data-k="glow"> Brillos y resplandores</label>'+
 '<label class="sw-t" style="margin:6px 0 10px"><input type="checkbox" '+(DEPTH()?'checked':'')+' data-act="opt" data-k="depth"> Profundidad (parallax)</label>'+
 '<label class="sw-t" style="margin:6px 0 10px"><input type="checkbox" '+(SAVE.cfg.menufx!==0?'checked':'')+' data-act="opt" data-k="menufx"> Efectos visuales del menú</label>'+
 '<div class="opts">'+stp('Partículas','parts',[[0,'Altas'],[1,'Medias'],[2,'Pocas'],[3,'Mínimas']])+'</div></div>'+
 '<div class="panel" style="margin-bottom:16px"><div class="head"><h3>Controles táctiles</h3></div>'+
 '<label class="sw-t" style="margin:6px 0"><input type="checkbox" '+(SAVE.cfg.lefty?'checked':'')+' data-act="opt" data-k="lefty"> Modo zurdo (invierte los lados)</label>'+
 '<label class="field" style="margin:8px 0"><span class="lab">Tamaño de botones</span><input type="range" min="80" max="140" step="10" value="'+(SAVE.cfg.tsz||100)+'" data-act="optv" data-k="tsz"></label>'+
 '<label class="field" style="margin:8px 0"><span class="lab">Opacidad de botones</span><input type="range" min="40" max="100" step="10" value="'+(SAVE.cfg.top||100)+'" data-act="optv" data-k="top"></label></div>'+devPanel()+
 '<div class="head"><h2>Controles</h2>'+inf('En pantallas táctiles aparecen botones')+'</div>'+
 '<div class="seg" style="margin-bottom:14px">'+tabs.map(([k,n])=>'<button class="chip '+(ctlTab===k?'on':'')+'" data-ctl="tab" data-v="'+k+'" aria-pressed="'+(ctlTab===k)+'">'+n+'</button>').join('')+'</div>'+ctlCapBanner()+
 (ctlTab==='kb'?ctlKb():ctlTab==='gp'?ctlGp():ctlCombos())+
 '<div class="panel tint" style="margin-top:16px"><h3>Consejos</h3><p style="margin-top:6px">Roza los obstáculos para ganar «rasantes», pasa por los anillos celestes para recibir impulso y puntos. Encadena acrobacias para subir el combo (hasta ×3). Destruye las torretas por puntos y recoge escudo, daño ×2 y energía infinita. Cada baja te cura un poco.</p></div>';}
document.addEventListener('click',e=>{const t=e.target.closest('[data-ctl]');if(!t)return;const c=t.dataset.ctl,id=t.dataset.id;
 if(c==='slot'){if(performance.now()<ctlIgnore)return;capStart(t.dataset.dev,t.dataset.a,+t.dataset.i);return;}
 if(c==='cancel'){capEnd();render_ui();return;}
 if(c==='tab'){CAP=null;ctlTab=t.dataset.v;render_ui();return;}
 if(c==='kbreset'){const d=ctlDefaults();SAVE.ctl.kb=d.kb;kbC=null;persist();toast('Teclado restablecido');}
 else if(c==='gpreset'){SAVE.ctl.gp=ctlDefaults().gp;persist();toast('Mando restablecido');}
 else if(c==='seqreset'){SAVE.ctl.seq=ctlDefaults().seq;persist();toast('Combos restablecidos');}
 else if(c==='win'){SAVE.ctl.win=+t.dataset.v;persist();}
 else if(c==='dz'){SAVE.ctl.dz=+t.dataset.v;persist();}
 else if(c==='seqstep'){const s=SAVE.ctl.seq[id],i=+t.dataset.i;s[i]=TOKS[(TOKS.indexOf(s[i])+1)%4];persist();}
 else if(c==='seqadd'){const s=SAVE.ctl.seq[id];if(s.length<4)s.push(s[s.length-1]);persist();}
 else if(c==='seqdel'){const s=SAVE.ctl.seq[id];if(s.length>2)s.pop();persist();}
 render_ui();});

/* --- Resultado --- */
function vResult(){const r=lastResult;if(!r){go('home');return;}
 const me=r.rk.find(p=>p.me)||{},det=!!window._resDet;
 /* ★ MEJORA: primero 3 datos clave; el resto bajo «Ver detalles» */
 const top3=[['Puesto',r.rank+'.º / '+r.n],['Kills',me.kills!==undefined?me.kills:(r.pl&&r.pl.kills)||0],['Monedas',coin+' '+nf(r.total)]];
 view.innerHTML='<div class="panel '+(r.win?'tint':'')+'" style="margin-bottom:16px"><div class="row" style="gap:18px"><div class="medal '+(r.win?'w':'')+'">'+(r.medal||r.rank+'º')+'</div><div><h1>'+h(r.title||(r.win?'¡Victoria!':'Terminaste '+r.rank+'.º de '+r.n))+'</h1>'+(r.recs.length?'<p style="margin-top:6px"><span class="pill hot">Nuevo récord</span> '+r.recs.map(h).join(', ')+'</p>':'<p class="mut" style="margin-top:6px">'+h(r.msg||'Clasificación final de '+r.n+' pilotos')+'</p>')+'</div></div></div>'+
 '<div class="kpis" style="margin-bottom:16px">'+top3.map(a=>'<div class="kpi"><div class="big">'+(typeof a[1]==='number'?nf(a[1]):a[1])+'</div><span class="tag">'+a[0]+'</span></div>').join('')+'</div>'+
 '<div class="row" style="margin-bottom:16px">'+(NET.on?'<button class="btn pri" data-act="olroom">Volver a la sala</button>':'<button class="btn pri" data-act="start">Revancha</button>')+'<button class="btn" data-act="resdet" aria-expanded="'+det+'">'+(det?'Ocultar detalles':'Ver detalles')+'</button><button class="btn" data-act="share">Compartir</button><button class="btn" data-go="garage">Garaje</button><button class="btn" data-go="home">Inicio</button></div>'+
 (det?progPanel(r)+'<div class="grid g2"><div class="panel"><h3>Clasificación</h3><div class="scroll"><table class="t"><tr><th>#</th><th>Piloto</th><th>Avión</th><th class="num">Pts</th><th class="num">Kills</th><th class="num">Asist.</th><th class="num">Muertes</th></tr>'+r.rk.map((p,i)=>'<tr class="'+(p.me?'me':'')+'"><td>'+(i+1)+'</td><td>'+(r.mode==='team'&&p.team!==undefined?'<span style="color:'+TEAMC[p.team]+'">●</span> ':'')+h(p.name)+'</td><td>'+h(p.plane)+'</td><td class="num">'+p.score+'</td><td class="num">'+p.kills+'</td><td class="num">'+p.assists+'</td><td class="num">'+p.deaths+'</td></tr>').join('')+'</table></div></div>'+
 '<div class="panel sky"><h3>Recompensas</h3>'+r.parts.filter(x=>x[1]>0).map(x=>'<div class="reward"><span>'+h(x[0])+'</span><span>+'+nf(x[1])+'</span></div>').join('')+
 (r.gems?'<div class="reward"><span>Gemas (acrobacias y victoria)</span><span>+'+r.gems+' <i class="gem"></i></span></div>':'')+'<div class="reward"><span class="mut">Multiplicador (dificultad y rivales)</span><span>×'+r.mult.toFixed(2)+'</span></div><div class="row" style="justify-content:space-between;margin-top:10px"><h3>Total</h3><span class="big">'+coin+' '+nf(r.total)+'</span></div>'+
 '<div class="kpis" style="margin-top:14px">'+[['Bucles',r.pl.loops],['Rolls',r.pl.rolls],['Esquivas',r.pl.dodges],['Rasantes',r.pl.nearmiss],['Mejor racha',r.pl.streak]].map(a=>'<div class="kpi"><div class="big" style="font-size:26px">'+a[1]+'</div><span class="tag">'+a[0]+'</span></div>').join('')+'</div></div></div>':'');}
function shareResult(){const r=lastResult;if(!r)return;const me=r.rk.find(p=>p.me)||{},txt='Ases del Cielo · '+(r.title||('Puesto '+r.rank+'/'+r.n))+' · '+(me.score!==undefined?me.score+' pts · ':'')+(me.kills!==undefined?me.kills+' kills':'');
 try{if(navigator.share){navigator.share({title:'Ases del Cielo',text:txt}).catch(()=>{});return;}}catch(e){}
 try{navigator.clipboard.writeText(txt).then(()=>toast('Resultado copiado'),()=>toast(txt));}catch(e){toast(txt);}}

/* --- Retos --- */
function claimAch(id){const a=ACH.find(x=>x.id===id);if(!a||!achDone(id)||SAVE.claimed[id])return;SAVE.claimed[id]=1;SAVE.coins+=a.rw;persist();cineOr({title:'¡Recompensa!',items:[{k:'coins',n:a.rw}],fast:1},'+'+a.rw+' monedas');render_ui();}
function vChallenges(){const dl=dailyList();
 const claim=(done,cl,attr)=>cl?'<span class="pill on">Cobrado</span>':'<button class="btn sm '+(done?'ok ready':'')+'" '+attr+' '+(done?'':'disabled')+'>Cobrar</button>';
 view.innerHTML=rowTitle('Retos','?Los retos de hoy cambian cada día.')+'<div class="grid g2"><div class="panel tint"><h3>Hoy · '+h(SAVE.daily.date)+'</h3>'+
 dl.slice().sort((a,b)=>rank(a.got>=a.n,SAVE.daily.claimed[a.id])-rank(b.got>=b.n,SAVE.daily.claimed[b.id])).map(q=>{const done=q.got>=q.n,cl=SAVE.daily.claimed[q.id];return'<div class="reward'+(done&&!cl?' rdy':'')+'" style="display:grid;gap:8px"><div class="qh"><b>'+h(q.text)+'</b>'+price(q.rw)+'</div><div class="qb"><span class="bar g"><i style="width:'+(q.got/q.n*100)+'%"></i></span><span class="tag">'+q.got+'/'+q.n+'</span>'+claim(done,cl,'data-act="claimd" data-id="'+q.id+'" data-rw="'+q.rw+'"')+'</div></div>';}).join('')+'</div>'+
 '<div class="panel"><h3>Objetivos permanentes</h3>'+ACH.slice().sort((a,b)=>rank(ST(a.k)>=a.t,SAVE.claimed[a.id])-rank(ST(b.k)>=b.t,SAVE.claimed[b.id])).map(a=>{const v=Math.min(a.t,ST(a.k)),done=v>=a.t,cl=SAVE.claimed[a.id];return'<div class="reward'+(done&&!cl?' rdy':'')+'" style="display:grid;gap:6px"><div class="qh"><b>'+h(a.n)+'</b>'+price(a.rw)+'</div><div class="mut" style="font-size:14px">'+h(a.d)+'</div><div class="qb"><span class="bar"><i style="width:'+(v/a.t*100)+'%"></i></span><span class="tag">'+nf(v)+'/'+nf(a.t)+'</span>'+claim(done,cl,'data-act="claima" data-id="'+a.id+'"')+'</div></div>';}).join('')+'</div></div>';}

/* --- Perfil --- */
function vStats(){const k=ST('kills'),d=ST('deaths'),mp=ST('matches');
 const kp=[['Partidas',mp],['Victorias',ST('wins')],['Kills',k],['Muertes',d],['K/D',d?(k/d).toFixed(2):k],['Asistencias',ST('assists')],['Bucles',ST('loops')],['Rolls',ST('rolls')],['Medias vueltas',ST('flips')],['Esquivas',ST('dodges')],['Rasantes',ST('nearmiss')],['Mejor racha',ST('bestStreak')],['Tiempo de vuelo',Math.round(ST('playSec')/60)+' min'],['Monedas ganadas',nf(ST('coinsEarned'))]];
 view.innerHTML=rowTitle('Perfil')+'<div class="kpis">'+kp.map(a=>'<div class="kpi"><div class="big">'+(typeof a[1]==='number'?nf(a[1]):a[1])+'</div><span class="tag">'+a[0]+'</span></div>').join('')+'</div>'+
 '<div class="grid g2" style="margin-top:18px"><div class="panel"><h3>Mejores partidas</h3>'+(SAVE.board.length?'<div class="scroll"><table class="t"><tr><th>#</th><th class="num">Pts</th><th>Puesto</th><th>Avión</th><th>Mapa</th><th>Nivel</th><th>Fecha</th></tr>'+SAVE.board.map((b,i)=>'<tr><td>'+(i+1)+'</td><td class="num">'+b.s+'</td><td>'+b.r+'/'+b.n+'</td><td>'+h(PLANE[b.plane]?PLANE[b.plane].name:b.plane)+'</td><td>'+h(MAPD[b.map]?MAPD[b.map].name:b.map)+'</td><td>'+h(DIFFS[b.d].name)+'</td><td>'+h(b.date)+'</td></tr>').join('')+'</table></div>':'<p class="mut">Aún no hay partidas. Juega una y aparecerá aquí.</p>')+'</div>'+
 '<div class="panel"><details><summary>Copia de seguridad '+inf('Tu progreso vive en este navegador. Exporta el código para guardarlo, o pégalo aquí y pulsa Importar para recuperarlo.')+'</summary><div style="height:10px"></div><textarea id="bk" spellcheck="false" aria-label="Código de copia de seguridad"></textarea><div class="row" style="margin-top:10px"><button class="btn sm" data-act="exp">Exportar</button><button class="btn sm" data-act="imp">Importar</button></div></details></div></div>'+'<div class="panel danger" style="margin-top:18px"><h3>Zona de peligro '+inf('Borra monedas, gemas, aviones, pase, misiones y estadísticas. No se puede deshacer.')+'</h3><div style="height:12px"></div><button class="btn bad" data-x="resetask">Borrar todo el progreso</button></div>';}

let shownTab=null;
function ensurePlaybar(){let pb=document.getElementById('pbar');if(!pb){pb=document.createElement('div');pb.id='pbar';pb.className='playbar';document.body.appendChild(pb);}const hh='<button class="btn pri go" data-act="start">'+ic('play',30)+(SAVE.cfg.split>1?' Jugar a '+['dos','tres','cuatro'][SAVE.cfg.split-2]:' Jugar solo')+'</button><button class="btn pri go friends" data-act="online">'+(NET.on?'Sala '+h(NET.code):'Con amigos')+'</button>';if(pb._h!==hh){pb._h=hh;pb.innerHTML=hh;};pb.hidden=(tab==='result');}
function render_ui(){PVFXON=false;const y=window.scrollY,same=shownTab===tab;stopPrev();header();ensurePlaybar();({home:vHome,garage:vGarage,pass:vPass,shop:vShop,maps:vMaps,play:vPlay,challenges:vChallenges,stats:vStats,result:vResult}[tab]||vHome)();view.classList.toggle('still',same);if(same)window.scrollTo(0,y);shownTab=tab;startMapPlay();}
let resetArm=0;
(()=>{let tip=null,cur=null;const show=el=>{if(!tip){tip=document.createElement('div');tip.id='tip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);}cur=el;tip.textContent=el.dataset.tip;tip.hidden=false;const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;let x=Math.min(innerWidth-tw-12,Math.max(12,r.left+r.width/2-tw/2)),y=r.bottom+8;if(y+th>innerHeight-8)y=Math.max(8,r.top-th-8);tip.style.left=x+'px';tip.style.top=y+'px';};
 const hide=()=>{if(tip)tip.hidden=true;cur=null;};
 document.addEventListener('mouseover',e=>{const i=e.target.closest&&e.target.closest('.ibtn');if(i)show(i);});
 document.addEventListener('mouseout',e=>{const i=e.target.closest&&e.target.closest('.ibtn');if(i&&cur===i)hide();});
 document.addEventListener('click',e=>{const i=e.target.closest&&e.target.closest('.ibtn');if(i){e.stopPropagation();e.preventDefault();show(i);return;}hide();},true);
 document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const i=document.activeElement;if(i&&i.classList&&i.classList.contains('ibtn')){e.preventDefault();e.stopPropagation();show(i);}}else if(e.key==='Escape')hide();},true);
 addEventListener('scroll',hide,true);})();
/* Compra de un tuneo (monedas o gemas) y lo pone en el diseño activo */
function buyTuneo(cc,id){const it=CAT[cc].find(x=>x.id===id),ps=SAVE.planes[gSel||SAVE.sel.plane];
 if(!it||it.ach||it.ex||ownedItem(cc,it))return;
 if(!ps){toast('Compra antes el avión');return;}
 if(it.gem){if(!spendGems(it.gem)){toast('Te faltan '+nf(Math.max(1,it.gem-SAVE.gems))+' gemas: consíguelas en la Tienda');return;}}
 else if(!spendCoins(it.cost)){toast('Te faltan '+nf(Math.max(1,it.cost-SAVE.coins))+' monedas');return;}
 SAVE.own[cc][it.id]=1;ps.slots[ps.slot][cc]=it.id;gPrev=null;persist();
 cineOr({title:'¡Desbloqueado!',items:[{k:'item',cat:cc,id:it.id}],fast:1},it.name+' desbloqueado y puesto');render_ui();}
document.addEventListener('click',e=>{const t=e.target.closest('[data-go],[data-act]');if(!t)return;Snd.init();
 if(t.dataset.go){go(t.dataset.go);return;}const a=t.dataset.act,id=t.dataset.id;
 /* Elegir un avión: si es tuyo pasa a estar en uso; si no, solo se muestra para poder comprarlo */
 if(a==='selplane'){gSel=id;gPrev=null;if(planeOwned(id)){SAVE.sel.plane=id;persist();}render_ui();}
 else if(a==='buy'){const p=PLANE[id],pr=planePrice(id);if(SAVE.coins>=pr&&!SAVE.planes[id]){markDeal('plane',id);SAVE.coins-=pr;SAVE.planes[id]=newPlaneSave();SAVE.sel.plane=id;persist();cineOr({title:'¡Nuevo avión!',items:[{k:'plane',id:id}],big:1},p.name+' añadido al garaje');render_ui();}}
 else if(a==='up'){const k=t.dataset.k,pid=gSel||SAVE.sel.plane,ps=SAVE.planes[pid];if(!ps)return;const c=upCost(PLANE[pid],ps.up[k]);if(ps.up[k]<5&&SAVE.coins>=c){SAVE.coins-=c;ps.up[k]++;persist();render_ui();}}
 else if(a==='slot'){gPrev=null;SAVE.planes[gSel||SAVE.sel.plane].slot=+t.dataset.i;persist();render_ui();}
 else if(a==='gtab'){gTab=t.dataset.k;gPrev=null;render_ui();}
 else if(a==='pvx'){gPrev=null;render_ui();}
 else if(a==='pvbuy'){if(gPrev)buyTuneo(gPrev.cat,gPrev.id);}
 else if(a==='item'){const it=CAT[gTab].find(x=>x.id===id),ps=SAVE.planes[gSel||SAVE.sel.plane];
  if(ps&&ownedItem(gTab,it)){gPrev=null;ps.slots[ps.slot][gTab]=it.id;persist();render_ui();}
  else if(gPrev&&gPrev.cat===gTab&&gPrev.id===it.id){/* segundo toque sobre el que ya estás viendo: comprar */
   if(it.ach||it.ex){const w=lockWhy(gTab,it);toast(w.t.split('. ')[0]);}else buyTuneo(gTab,it.id);}
  else{gPrev={cat:gTab,id:it.id};render_ui();}}
 else if(a==='selmap'){SAVE.sel.map=id;persist();render_ui();}
 else if(a==='settime'){const k=t.dataset.v;if(TIMES[k]){SAVE.times=SAVE.times||{};for(const mm of MAPDEF)SAVE.times[mm.id]=k;persist();render_ui();}}
 else if(a==='buymap'){const m=MAPD[id],pr=mapPrice(id);if(SAVE.coins>=pr){markDeal('map',id);SAVE.coins-=pr;SAVE.maps[id]=1;SAVE.sel.map=id;persist();cineOr({title:'¡Nuevo mapa!',items:[{k:'map',id:id}],big:1},m.name+' desbloqueado');render_ui();}else toast('Te faltan '+nf(pr-SAVE.coins)+' monedas');}
 else if(a==='cfg'){SAVE.cfg[t.dataset.k]=+t.dataset.v;persist();render_ui();}
 else if(a==='snd'){SAVE.cfg.sound=t.checked?1:0;persist();}
 else if(a==='opt'){SAVE.cfg[t.dataset.k]=t.checked?1:0;persist();applyUIPrefs();}
 else if(a==='optv'){SAVE.cfg[t.dataset.k]=+t.value;persist();applyUIPrefs();}
 else if(a==='resdet'){window._resDet=!window._resDet;render_ui();}
 else if(a==='share'){shareResult();}
 else if(a==='online'||a==='olroom'){netOpenUI();}
 else if(a==='start'){if(!planeOwned(SAVE.sel.plane))SAVE.sel.plane='halcon';startGame();}
 else if(a==='tutorial'){if(!planeOwned(SAVE.sel.plane))SAVE.sel.plane='halcon';startGame(true);}
 else if(a==='claimd'){if(!SAVE.daily.claimed[id]){SAVE.daily.claimed[id]=1;SAVE.coins+=+t.dataset.rw;addPassXP(60);persist();cineOr({title:'¡Recompensa!',items:[{k:'coins',n:+t.dataset.rw},{k:'xp',n:60}],fast:1},'+'+t.dataset.rw+' monedas');render_ui();}}
 else if(a==='claima')claimAch(id);
 else if(a==='exp'){const b=$('bk');b.value=btoa(unescape(encodeURIComponent(JSON.stringify(SAVE))));b.select();try{navigator.clipboard.writeText(b.value).then(()=>toast('Copiado'),()=>{});}catch(e){}}
 else if(a==='imp'){try{const o=JSON.parse(decodeURIComponent(escape(atob($('bk').value.trim()))));if(!o||o.v!==1)throw 0;SAVE=defSave();merge(SAVE,o);persist();toast('Progreso importado');render_ui();}catch(e){toast('Código no válido');}}

});

/* Truco oculto (se conserva): 5 clics seguidos en las monedas lo desbloquea todo y da dinero infinito */
let coinClicks=0,coinT=0;
function activateCheat(){SAVE.cheat=1;for(const p of PLANES)if(!SAVE.planes[p.id])SAVE.planes[p.id]=newPlaneSave();
 for(const m of MAPDEF)SAVE.maps[m.id]=1;for(const[c]of CATS)for(const it of CAT[c])SAVE.own[c][it.id]=1;devMax();persist();toast('Modo desarrollador: nivel máximo, todos los aviones y todo desbloqueado');render_ui();}
coinsEl.addEventListener('click',()=>{const n=Date.now();if(n-coinT>1500)coinClicks=0;coinT=n;coinClicks++;if(coinClicks>=5){coinClicks=0;if(!SAVE.cheat)activateCheat();else toast('Ya está activado');}});
