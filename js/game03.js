'use strict';
/* ===== Guardado local ===== */
const SKEY='asesDelCielo.v1';
function newPlaneSave(){return{up:{spd:0,acc:0,man:0,hp:0,pow:0},slot:0,slots:[{...DEFLOOK},{...DEFLOOK},{...DEFLOOK}]};}
function defSave(){const o={v:1,coins:400,planes:{colibri:newPlaneSave(),halcon:newPlaneSave()},own:{},maps:{valle:1},
 sel:{plane:'colibri',map:'valle'},cfg:{bots:4,diff:1,time:3,sound:1,style:0,depth:1,mode:0},stats:{},claimed:{},daily:{date:'',prog:{},claimed:{}},board:[],rec:{},xp:0,gems:0,xpDay:-1,pass:{season:-1,xp:0,prem:0,free:{},pre:{}},login:{last:0,streak:0},weekly:{wk:-1,prog:{},claimed:{}},shop:{sold:{},starter:0},ctl:ctlDefaults()};
 for(const [c] of CATS)o.own[c]={};return o;}
function merge(d,s){for(const k in s){if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k])&&d[k]&&typeof d[k]==='object'&&!Array.isArray(d[k]))merge(d[k],s[k]);else d[k]=s[k];}return d;}
let SAVE=defSave();
function loadSave(){let raw=null;try{raw=localStorage.getItem(SKEY);}catch(e){}SAVE=defSave();if(raw){try{merge(SAVE,JSON.parse(raw));}catch(e){}}
 try{if(!localStorage.getItem('ases_v10')){localStorage.setItem('ases_v10','1');SAVE.cfg.diff=1;SAVE.cfg.bots=Math.min(SAVE.cfg.bots||4,4);}}catch(e){}
 /* ★ MEJORA: migraciones incrementales del guardado. Cada entrada sube SAVE.v en 1; añade aquí las futuras. */
 const MIG=[/* v1→v2 */s=>{if(!s.rec)s.rec={};if(!s.cfg)s.cfg={};if(s.cfg.menufx===undefined)s.cfg.menufx=1;if(s.cfg.lefty===undefined)s.cfg.lefty=0;if(!s.cfg.tsz)s.cfg.tsz=100;if(!s.cfg.top)s.cfg.top=100;}];
 let sv=+SAVE.v||1;while(sv-1<MIG.length){try{MIG[sv-1](SAVE);}catch(e){}sv++;}SAVE.v=sv;
 SAVE.maps.valle=1;if(!MAPD[SAVE.sel.map]||!SAVE.maps[SAVE.sel.map])SAVE.sel.map='valle';
 for(const id in SAVE.planes){const p=SAVE.planes[id];if(!p.slots||p.slots.length<3)p.slots=[{...DEFLOOK},{...DEFLOOK},{...DEFLOOK}];}ctlNormalize();}
function applyUIPrefs(){try{const c=SAVE.cfg,d=document.documentElement,b=document.body;d.classList.toggle('lowfx',c.menufx===0);if(b)b.classList.toggle('lefty',!!c.lefty);d.style.setProperty('--tsz',((c.tsz||100)/100)+'');d.style.setProperty('--top',((c.top||100)/100)+'');}catch(e){}}
function persist(){ctlNormalize();if(SAVE.cheat){SAVE.coins=999999999;SAVE.gems=999999999;}try{localStorage.setItem(SKEY,JSON.stringify(SAVE));}catch(e){}}
const ST=k=>SAVE.stats[k]||0;
const achDone=id=>{const a=ACH.find(x=>x.id===id);return !!a&&ST(a.k)>=a.t;};
const ownedItem=(cat,it)=>it.ex?!!SAVE.own[cat][it.id]:it.cost===0&&!it.ach&&!it.gem||!!SAVE.own[cat][it.id]||(it.ach&&achDone(it.ach));
const planeOwned=id=>!!SAVE.planes[id];
const mapOwned=id=>!!SAVE.maps[id];
const lookOf=id=>{const p=SAVE.planes[id]||newPlaneSave();return p.slots[p.slot]||DEFLOOK;};
const paintOf=id=>(typeof id==='string'&&id.startsWith('team'))?TEAMPAL[+id[4]]:(CAT.paint.find(x=>x.id===id)||CAT.paint[0]).c;
function ensureDaily(){const d=new Date(),key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 if(SAVE.daily.date!==key)SAVE.daily={date:key,prog:{},claimed:{}};return key;}
function dailyList(){const key=ensureDaily(),r=mulberry(hashStr('ases'+key)),pool=DAILY.slice();
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,3).map((q,i)=>{const n=q.lo+Math.floor(r()*(q.hi-q.lo+1));return{id:key+'#'+i,k:q.k,n,max:q.max,text:q.t.replace('{n}',n),rw:Math.round(n*q.u/10)*10+40,got:Math.min(n,SAVE.daily.prog[q.k]||0)};});}
/* ===== Mundo (vista cenital): geometría y colisiones ===== */
const R4=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
function polyBB(p){let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const q of p){if(q[0]<a)a=q[0];if(q[0]>c)c=q[0];if(q[1]<b)b=q[1];if(q[1]>d)d=q[1];}return{x0:a,y0:b,x1:c,y1:d};}
function distPoly(px,py,poly){let inside=false,md=1e18;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
  if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))inside=!inside;
  const dx=xj-xi,dy=yj-yi;let t=((px-xi)*dx+(py-yi)*dy)/(dx*dx+dy*dy||1);t=t<0?0:t>1?1:t;
  const ex=xi+dx*t-px,ey=yi+dy*t-py,d=ex*ex+ey*ey;if(d<md)md=d;}
 return[inside,Math.sqrt(md)];}
const World={solids:[],dyn:[],storms:[],over:[],decor:[],rings:[],turrets:[],w:6000,h:4000,t:0,def:MAPDEF[0],
 hit(x,y,r){for(const s of this.solids){const b=s.bb;if(x<b.x0-r||x>b.x1+r||y<b.y0-r||y>b.y1+r)continue;const q=distPoly(x,y,s.poly);if(q[0]||q[1]<r)return s;}return null;},
 dist(x,y,lim){let m=lim;for(const s of this.solids){const b=s.bb;if(x<b.x0-m||x>b.x1+m||y<b.y0-m||y>b.y1+m)continue;const q=distPoly(x,y,s.poly);const d=q[0]?0:q[1];if(d<m)m=d;}return m;},
 update(dt){this.t+=dt;for(const s of this.dyn)s.upd(this.t);for(const g of this.rings)if(g.cd>0)g.cd-=dt;for(const st of this.storms){st.ph=(this.t+st.off)%st.cyc;}},
 stormAt(x,y,pad){for(const st of this.storms){const dx=x-st.x,dy=y-st.y;if(dx*dx+dy*dy<(st.r+(pad||0))**2)return st;}return null;},
 overAt(x,y){for(const o of this.over){const b=o.bb;if(x<b.x0||x>b.x1||y<b.y0||y>b.y1)continue;if(distPoly(x,y,o.poly)[0])return o;}return null;},
 free(x,y,m){return !this.hit(x,y,m)&&!this.stormAt(x,y,m)&&(this.def.closed||stormDepth(x,y)<-m*.5);}};
function mk(poly,kind,extra){const s={poly,bb:polyBB(poly),kind:kind||'rock'};if(extra)Object.assign(s,extra);return s;}
function blob(r,x,y,rad,n,rough){const p=[],ph=r()*6;for(let i=0;i<n;i++){const a=i/n*TAU,k=1-rough+rough*(Math.sin(a*3+ph)*.5+.5)+rough*(r()-.5)*.5;p.push([x+Math.cos(a)*rad*k,y+Math.sin(a)*rad*k*.92]);}return p;}
function chamf(x,y,w,h,c){return[[x+c,y],[x+w-c,y],[x+w,y+c],[x+w,y+h-c],[x+w-c,y+h],[x+c,y+h],[x,y+h-c],[x,y+c]];}
function rotorSolid(cx,cy,L,T,om,ph){const s=mk(R4(cx-L,cy-T,2*L,2*T),'rotor',{cx,cy,L,T});s.upd=t=>{const a=om*t+ph,c=Math.cos(a),n=Math.sin(a),X=s.cx,Y=s.cy,L=s.L,T=s.T /* ★ AMPLIO #4: L,T leídos del objeto para poder escalarlos */;s.a=a;
 s.poly=[[-L,-T],[L,-T],[L,T],[-L,T]].map(p=>[X+p[0]*c-p[1]*n,Y+p[0]*n+p[1]*c]);s.bb=polyBB(s.poly);};s.upd(0);return s;}
function sliderSolid(cx,cy,hw,hh,ax,ay,sp,ph){const s=mk(R4(cx-hw,cy-hh,2*hw,2*hh),'slider',{cx,cy,hw,hh,ax,ay});s.upd=t=>{const k=Math.sin(t*sp+ph),x=s.cx+s.ax*k,y=s.cy+s.ay*k;const hw=s.hw,hh=s.hh /* ★ AMPLIO #4 */;s.poly=R4(x-hw,y-hh,2*hw,2*hh);s.bb=polyBB(s.poly);};s.upd(0);return s;}
function lineBridge(a,b,wd){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*wd/2,ny=dx/L*wd/2;return mk([[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]],'bridge');}
function scatter(r,S,n,rmin,rmax,w,h,gap,kind){const placed=S.map(s=>s.cr).filter(Boolean);let c=0;
 for(let k=0;k<n*40&&c<n;k++){const rad=rnd(rmin,rmax),x=rnd(rad+320,w-rad-320),y=rnd(rad+320,h-rad-320);if(placed.some(q=>Math.hypot(q.x-x,q.y-y)<q.r+rad+gap))continue;
  const s=mk(blob(r,x,y,rad,14,.28),kind||'rock');s.cr={x,y,r:rad*1.08};placed.push(s.cr);S.push(s);c++;}}
function ridge(r,S,sx,sy,ang,n,sp,rad){const ca=Math.cos(ang),sa=Math.sin(ang);for(let i=0;i<n;i++){const x=sx+ca*sp*i+rnd(-40,40),y=sy+sa*sp*i+rnd(-40,40),q=rnd(rad*.8,rad*1.1),s=mk(blob(r,x,y,q,14,.3),'rock');s.cr={x,y,r:q*1.08};S.push(s);}}
function trees(C,cx,cy,n,spread,cols,sp){for(let i=0;i<n;i++)C.push({t:'c',x:cx+rnd(-spread,spread),y:cy+rnd(-spread*.75,spread*.75),r:rnd(26,54),c:pick(cols),sp:sp||'tree'});}
function polyline(w,h,n,amp,fr,y0,r){const a=[];const ph=r()*6;for(let i=0;i<=n;i++)a.push([i*w/n,y0+Math.sin(i*fr+ph)*amp+r()*60]);return a;}

function rotPoly(p,cx,cy,a){const c=Math.cos(a),s=Math.sin(a);return p.map(q=>[cx+(q[0]-cx)*c-(q[1]-cy)*s,cy+(q[0]-cx)*s+(q[1]-cy)*c]);}
function MB(r){const S=[];
 const rock=(x,y,rad,kind,ex)=>{const OL=typeof ASSETS!=='undefined'&&ASSETS.outline,k=kind||'rock';let poly,sp=null;
  if(OL&&(k==='rock'||k==='spire')){const i=rint(0,5),o=OL['rk'+i],W=rad*2.3,a=rnd(0,TAU),c=Math.cos(a),sn=Math.sin(a);poly=o.map(q=>[x+(q[0]*c-q[1]*sn)*W,y+(q[0]*sn+q[1]*c)*W]);sp={i,W,a};}else poly=blob(r,x,y,rad,14,.28);
  const s=mk(poly,k,ex);if(sp){s.sp=sp;s.sx=x;s.sy=y;}s.cr={x,y,r:rad*1.15};S.push(s);return s;};
 const line=(x0,y0,x1,y1,rad,step,gaps,kind)=>{const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.floor(L/step));for(let i=0;i<=n;i++){const d=i*L/n;if(gaps&&gaps.some(g=>Math.abs(d-g[0])<g[1]+rad*.9))continue;const t=d/L;rock(x0+(x1-x0)*t+rnd(-20,20),y0+(y1-y0)*t+rnd(-20,20),rad*rnd(.88,1.1),kind);}};
 const mesa=(x,y,w,h,ex)=>{const s=mk(chamf(x,y,w,h,Math.min(w,h)*.18),'mesa',ex);S.push(s);return s;};
 const rmesa=(cx,cy,w,h,a,ex)=>{const s=mk(rotPoly(chamf(cx-w/2,cy-h/2,w,h,Math.min(w,h)*.16),cx,cy,a),'mesa',ex);S.push(s);return s;};
 return{S,rock,line,mesa,rmesa};}
const MAPB={
 valle(r){const w=9200,h=6400,O=[],C=[],R=[],m=MB(r),S=m.S;
  C.push({t:'g',p:blob(r,w*.25,h*.8,900,20,.22),g:'archi'});
  const rv=polyline(w,h,16,420,.55,h*.46,r);C.push({t:'gl',pts:rv,w:130,g:'archi'});
  for(let i=0;i<32;i++)C.push({t:'p',p:chamf(rnd(100,w-700),rnd(100,h-500),rnd(300,620),rnd(250,460),24),c:pick(['#69a458','#7bb35f','#5b9a4d','#c3b86a'])});
  for(let i=0;i<30;i++)trees(C,rnd(300,w-300),rnd(300,h-300),12,260,['#2f6a35','#2a5e30','#37773c']);
  void polyline(w,h,14,500,.5,h*.7,r);
  /* Cordillera norte con dos pasos, corredor de flanqueo pegado al borde */
  m.line(500,1050,4400,1000,215,430,[[2300,250]]);m.line(5400,1250,8800,1200,215,430,[[1700,230]]);
  m.rock(2850,1750,150,'rock',{tur:true});m.rock(7100,1900,150,'rock',{tur:true});
  /* Cordillera sur con pasos estrechos */
  m.line(500,5450,3500,5350,215,430,[[1800,230]]);m.line(4300,5350,8800,5500,215,430,[[2100,240]]);
  /* Bosque de rocas (eslalon) al oeste */
  for(let gx=0;gx<4;gx++)for(let gy=0;gy<4;gy++)m.rock(1000+gx*560,2700+gy*520+(gx%2?260:0),rnd(90,115));
  /* Fortín al este: anillo de rocas con dos entradas y torreta central */
  for(let i=0;i<10;i++){if(i===0||i===5)continue;const a=i/10*TAU;m.rock(7300+Math.cos(a)*760,3800+Math.sin(a)*760,230);}
  m.rock(7300,3800,150,'rock',{tur:true});
  for(const fx of[.2,.36,.52,.72,.88]){const x=w*fx,y=rv[Math.min(16,Math.round(fx*16))][1];O.push(mk(R4(x-48,y-230,96,460),'bridge'));}
  R.push([2800,1000],[7000,1220],[4700,3300],[3600,3000],[7300,3300],[1800,3500],[2300,5400],[6500,5430],[4600,600]);
  return{w,h,S,D:[],O,C,R,storms:[]};},
 canon(r){const w=9600,h=6400,O=[],C=[],R=[],m=MB(r),S=m.S;
  C.push({t:'gl',pts:polyline(w,h,18,700,.5,h*.5,r),w:170,g:'mesa'});
  for(let i=0;i<28;i++)C.push({t:'p',p:blob(r,rnd(300,w-300),rnd(300,h-300),rnd(180,420),12,.3),c:pick(['#c07646','#a85b34','#d08a58'])});
  /* Banda norte: Gran Paso (700) y Grieta (380) */
  m.mesa(500,420,2700,1000);m.mesa(3900,420,1900,1000,{tur:true});m.mesa(6180,420,2900,1000);
  O.push(mk(R4(3150,880,850,110),'bridge'));
  /* Banda sur: tres cañones estrechos de 500 */
  m.mesa(500,4900,1500,1000);m.mesa(2500,4900,2100,1000);m.mesa(5100,4900,1300,1000,{tur:true});m.mesa(6900,4900,2100,1000);
  O.push(mk(R4(1950,5350,650,110),'bridge'));O.push(mk(R4(6350,5350,650,110),'bridge'));
  /* El Cráter: anillo de 6 mesas con 6 entradas y torre central */
  const cx=4800,cy=3200;for(let k=0;k<6;k++){const a=k/6*TAU-Math.PI/2;m.rmesa(cx+Math.cos(a)*1250,cy+Math.sin(a)*1250,800,380,a+Math.PI/2);}
  m.mesa(cx-160,cy-160,320,320,{tur:true});
  /* Laberinto oeste: mesas pequeñas escalonadas (pasillos de 320) */
  for(let gy=0;gy<4;gy++)for(let gx=0;gx<3;gx++)m.mesa(700+gx*700+(gy%2?350:0),1900+gy*800,380,380);
  /* Pista abierta este con una espina divisoria y un torreón */
  m.mesa(7500,3000,1500,200);m.mesa(8300,4000,420,420,{tur:true});
  for(let i=0;i<32;i++)C.push({t:'c',x:rnd(200,w-200),y:rnd(200,h-200),r:rnd(14,30),c:'#7a3d28',sp:'peb'});
  R.push([cx,2650],[3550,1100],[5990,1100],[2250,5400],[4850,5400],[6650,5400],[1800,3150],[7900,3700],[8000,2200]);
  return{w,h,S,D:[],O,C,R,storms:[]};},
 metro(r){const cell=800,cols=10,rows=7,ox=300,oy=250,w=ox*2+cols*cell-200,h=oy*2+rows*cell-100,O=[],C=[],D=[],R=[],m=MB(r),S=m.S,cells={};
  for(let j=1;j<rows;j++)C.push({t:'l',pts:[[ox,oy+j*cell],[ox+cols*cell,oy+j*cell]],w:6,c:'#ff4fa8',dash:[60,50]});
  for(let i=1;i<cols;i++)C.push({t:'l',pts:[[ox+i*cell,oy],[ox+i*cell,oy+rows*cell]],w:6,c:'#3fd0c9',dash:[60,50]});
  const turSet=new Set(['4,1','5,5','6,2','3,4']);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const cx0=ox+i*cell,cy0=oy+j*cell;let bw=0;
   if(j===3){C.push({t:'p',p:R4(cx0,cy0+cell*.38,cell,cell*.24),c:'#0f0e22'});continue;}           /* Avenida: autopista despejada */
   if(i>=7&&j<=2){if(i===8&&j===1){C.push({t:'g',p:chamf(cx0-200,cy0-200,cell+400,cell+400,60),g:'valle'});}trees(C,cx0+cell/2,cy0+cell/2,4,260,['#2f8a55','#25704a']);continue;} /* Plaza abierta */
   if(i>=3&&i<=6)bw=590;                                                                                   /* Centro denso: calles de 210 */
   else if(i<=2)bw=480;                                                                                    /* Oeste: calles de 320 */
   else{if(Math.random()<.4){C.push({t:'g',p:chamf(cx0+80,cy0+80,cell-160,cell-160,40),g:'valle'});trees(C,cx0+cell/2,cy0+cell/2,5,220,['#2f8a55','#25704a']);continue;}bw=440;}
   const bh=bw+(i%2?-30:20),x=cx0+(cell-bw)/2,y=cy0+(cell-bh)/2;const s=mk(chamf(x,y,bw,bh,14),'bld',{v:(i+j)%3});if(turSet.has(i+','+j))s.tur=true;S.push(s);cells[i+','+j]={x,y,w:bw,h:bh};}
  for(let j=0;j<rows;j++)for(let i=0;i<cols-1;i++){const a=cells[i+','+j],b=cells[(i+1)+','+j];if(a&&b&&(i>=3&&i<=5?r()<.6:r()<.25))O.push(mk(R4(a.x+a.w-20,Math.max(a.y,b.y)+110,b.x-a.x-a.w+40,90),'bridge'));}
  for(const[i,j]of[[4,2],[6,2],[5,5],[3,5],[6,6]])D.push(rotorSolid(ox+i*cell,oy+j*cell,175,15,((i+j)%2?1:-1)*(1.1+(i%3)*.2),r()*6));
  for(const i of[1,4,7])D.push(sliderSolid(ox+(i+.5)*cell,oy+3.5*cell,90,24,300,0,1.2+i*.08,r()*6));
  R.push([ox+8.5*cell,oy+1.5*cell],[ox+7.5*cell,oy+.7*cell],[ox+2.5*cell,oy+3.5*cell],[ox+7.5*cell,oy+3.5*cell],[ox+4*cell,oy+3*cell],[ox+5*cell,oy+4*cell],[ox+1*cell,oy+2*cell],[ox+9*cell,oy+5*cell]);
  return{w,h,S,D,O,C,R,storms:[]};},
 archi(r){const w=10400,h=7000,O=[],C=[],R=[],m=MB(r),S=m.S;
  const isle=(x,y,rad)=>{C.push({t:'g',p:blob(r,x,y,rad,16,.22),g:'canon'});C.push({t:'g',p:blob(r,x,y,rad*.78,16,.25),g:'valle'});};
  /* Dos continentes con fortaleza de agujas */
  for(const[x,y,rad,tx]of[[1900,3500,1150,1],[8500,3500,1100,-1]]){isle(x,y,rad);trees(C,x,y,10,rad*.5,['#2f6a35','#3a7a3f'],'palm');
   m.rock(x,y,190,'spire',{tur:true});for(let k=0;k<4;k++){const a=k/4*TAU+.8;m.rock(x+Math.cos(a)*640,y+Math.sin(a)*640,110,'spire');}
   {const dir=tx>0?0:Math.PI;for(const a of[-.45,.45])m.rock(x+Math.cos(dir+a)*1000,y+Math.sin(dir+a)*1000,90,'spire');}}
  /* El Estrecho: dos columnas de islotes, carril central con tormentas */
  const A=[[4500,1900],[4560,2700],[4480,3500],[4540,4300],[4500,5100]],B=[[5900,2300],[5960,3100],[5900,3900],[5940,4700]];
  A.forEach((q,i)=>{isle(q[0],q[1],230);m.rock(q[0],q[1],i===2?130:100,'spire',i===2?{tur:true}:null);});
  B.forEach((q,i)=>{isle(q[0],q[1],220);m.rock(q[0],q[1],105,'spire',i===1?{tur:true}:null);});
  for(const i of[0,2,3])O.push(lineBridge(A[i],A[i+1],80));O.push(lineBridge(B[1],B[2],80));
  /* Mares abiertos norte y sur: sólo tormentas y algún arrecife */
  m.line(1500,950,3300,850,70,300,[[900,200]],'spire');m.line(7200,6200,9000,6100,70,300,[[900,200]],'spire');
  const st=[[5200,1500],[5200,3500],[5200,5500],[2600,800],[7900,6200]].map(q=>({x:q[0],y:q[1],r:270,off:rnd(0,5),cyc:5,ph:0}));
  R.push([5200,2500],[5200,4500],[1900,2250],[8500,4750],[3400,6200],[7000,800],[5200,500],[5200,6500]);
  return{w,h,S,D:[],O,C,R,storms:st.filter(q=>!S.some(s=>q.x>s.bb.x0-q.r&&q.x<s.bb.x1+q.r&&q.y>s.bb.y0-q.r&&q.y<s.bb.y1+q.r))};},
 fabrica(r){const w=8400,h=5600,t=420,O=[],C=[],D=[],R=[],m=MB(r),S=m.S;
  {const seg=(x,y,ww,hh)=>{if(ww>1&&hh>1)S.push(mk(R4(x,y,ww,hh),'wall'));},gH=(y,gs)=>{let x=-t;for(const g of gs){seg(x,y,g-380-x,t);x=g+380;}seg(x,y,w+t-x,t);},gV=(x,gs)=>{let y=0;for(const g of gs){seg(x,y,t,g-380-y);y=g+380;}seg(x,y,t,h-y);};gH(-t,[w*.2,w*.5,w*.8]);gH(h,[w*.2,w*.5,w*.8]);gV(-t,[h*.3,h*.7]);gV(w,[h*.3,h*.7]);}
  const wallV=(x,gaps,th)=>{let y=0;for(const g of gaps.sort((a,b)=>a[0]-b[0])){if(g[0]-g[1]/2>y)S.push(mk(R4(x-(th||80)/2,y,th||80,g[0]-g[1]/2-y),'wall'));y=g[0]+g[1]/2;}if(y<h)S.push(mk(R4(x-(th||80)/2,y,th||80,h-y),'wall'));};
  const crate=(x,y,sz,ex)=>{const s=mk(chamf(x-sz/2,y-sz/2,sz,sz,12),'crate',ex);S.push(s);};
  const wallH=(x0,x1,y)=>S.push(mk(R4(x0,y-35,x1-x0,70),'wall'));
  /* Mamparos: 1 hueco ancho; 2 huecos con compuertas; 1 compuerta del reactor; 3 huecos estrechos */
  wallV(1680,[[2800,1000]]);wallV(3360,[[1150,520],[4450,520]]);wallV(5040,[[2800,420]]);wallV(6720,[[900,340],[2800,340],[4700,340]]);
  D.push(sliderSolid(3360,1150,44,110,0,140,1.3,0),sliderSolid(3360,4450,44,110,0,140,1.3,2));
  /* Muelle de carga (oeste): cobertura dispersa */
  for(const q of[[520,700],[520,4900],[1150,1500],[1150,4100],[800,2800,300]])crate(q[0],q[1],q[2]||230,q[0]===520&&q[1]===700?{tur:true}:null);
  /* Carriles: dos muros largos crean tres pasillos */
  wallH(1950,3100,1900);wallH(1950,3100,3700);
  /* Reactor: rotor gigante y cuatro pilares */
  D.push(rotorSolid(4200,2800,300,18,1.15,0));for(const q of[[3700,900],[4700,900],[3700,4700],[4700,4700]])crate(q[0],q[1],260,q[1]<2000&&q[0]>4000?{tur:true}:q[1]>4000&&q[0]<4000?{tur:true}:null);
  /* Serpentina: muros alternos con paso de 320 */
  wallH(5400,6720-40,1800);wallH(5080,6400,3800);
  /* Sala de control (este) */
  for(const q of[[7500,1200],[7500,4400],[8000,2800,320]])crate(q[0],q[1],q[2]||240,q[1]===4400?{tur:true}:null);
  for(const q of[[800,350],[3000,5250],[5200,300],[7000,5300],[1800,2600],[7200,2000]])O.push(mk(R4(q[0],q[1],1000,44),'pipe'));
  R.push([1680,2800],[3360,1150],[3360,4450],[5040,2800],[6720,2800],[4200,2000],[7700,2800],[900,1600],[2500,2800]);
  return{w,h,S,D,O,C,R,storms:[]};}};


function shiftB(b,ox,oy){const mv=p=>p.map(q=>[q[0]+ox,q[1]+oy]);
 for(const s of b.S.concat(b.D)){if(s.kind==='rotor'||s.kind==='slider'){s.cx+=ox;s.cy+=oy;s.upd(0);}else{s.poly=mv(s.poly);s.bb=polyBB(s.poly);}if(s.sx!==undefined){s.sx+=ox;s.sy+=oy;}if(s.cr){s.cr.x+=ox;s.cr.y+=oy;}}
 for(const o of b.O)o.poly=mv(o.poly);
 for(const d of b.C){if(d.t==='c'){d.x+=ox;d.y+=oy;}else if(d.p)d.p=mv(d.p);else if(d.pts)d.pts=mv(d.pts);}
 b.R=b.R.map(q=>[q[0]+ox,q[1]+oy]);for(const st of b.storms){st.x+=ox;st.y+=oy;}}
MAPB.mundo=function(r){const W=26800,H=13600,S=[],D=[],O=[],C=[],R=[],st=[];
 for(const[id,ox,oy]of[['archi',0,0],['canon',10650,100],['valle',50,7150],['metro',9300,7300],['fabrica',18220,7600]]){const b=MAPB[id](r);
  if(id==='valle')b.C=b.C.filter(d=>!(d.t==='g'&&d.g==='archi')); /* ★ GRAN CONTINENTE: el lago del suroeste pasa a ser césped (el río sigue) */
  shiftB(b,ox,oy);S.push(...b.S);D.push(...b.D);O.push(...b.O);C.push(...b.C);R.push(...b.R);st.push(...b.storms);}
 const m=MB(r);
 m.line(20800,1300,26200,1100,215,430,[[2200,260],[4100,250]]);m.line(20800,5900,26200,5800,215,430,[[2000,250],[3900,250]]);
 for(let i=0;i<12;i++){if(i===0||i===6)continue;const a=i/12*TAU;m.rock(23600+Math.cos(a)*950,3500+Math.sin(a)*950,215);}
 m.rock(23600,3500,150,'rock',{tur:true});m.rock(21400,3500,120);m.rock(25800,3500,120);
 for(let i=0;i<16;i++)trees(C,rnd(20800,26200),rnd(1700,5400),10,320,['#2f6a35','#37773c']);
 S.push(...m.S);R.push([23600,2500],[22000,3500],[25200,3500],[23600,600],[23600,6500],[21000,1400],[25800,6300]);
 return{w:W,h:H,S,D,O,C,R,storms:st,biomes:[{g:'archi',x:0,y:0,w:10500,h:7100},{g:'canon',x:10500,y:0,w:9900,h:7100},{g:'metro',x:9300,y:7100,w:8400,h:6500},{g:'fabrica',x:17700,y:7100,w:9100,h:6500}]};};
/* ★ AMPLIO #4 — escalado uniforme de un mapa completo (rocas, mesas, rotores, correderas, ríos, biomas, anillos, tormentas) */
function scaleB(b,K){const mv=p=>p.map(q=>[q[0]*K,q[1]*K]);
 for(const s of b.S.concat(b.D)){if(s.kind==='rotor'){s.cx*=K;s.cy*=K;s.L*=K;s.T*=K;s.upd(0);}else if(s.kind==='slider'){s.cx*=K;s.cy*=K;s.hw*=K;s.hh*=K;s.ax*=K;s.ay*=K;s.upd(0);}else{s.poly=mv(s.poly);s.bb=polyBB(s.poly);}
  if(s.sx!==undefined){s.sx*=K;s.sy*=K;}if(s.sp&&s.sp.W)s.sp.W*=K;if(s.cr){s.cr.x*=K;s.cr.y*=K;s.cr.r*=K;}}
 for(const o of b.O)o.poly=mv(o.poly);
 for(const d of b.C){if(d.t==='c'){d.x*=K;d.y*=K;}else if(d.p)d.p=mv(d.p);else if(d.pts){d.pts=mv(d.pts);if(d.w)d.w*=K;}}
 b.R=b.R.map(q=>[q[0]*K,q[1]*K].concat(q.slice(2)));for(const st of b.storms){st.x*=K;st.y*=K;st.r*=K;}
 if(b.biomes)for(const g of b.biomes){g.x*=K;g.y*=K;g.w*=K;g.h*=K;}
 b.w*=K;b.h*=K;}
/* ★ FIN AMPLIO #4 */
