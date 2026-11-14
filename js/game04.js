'use strict';
/* ===== Mapas independientes: cada bioma como mapa propio + variantes con otra ambientación ===== */
for(const id of['archi','canon','valle','metro','fabrica']){const f=MAPB[id];MAPB[id]=function(r){const b=f(r);if(!b.biomes&&id!=='valle')b.biomes=[{g:id,x:0,y:0,w:b.w,h:b.h}];return b;};}
MAPB.nieve=function(r){const b=MAPB.canon(r);b.biomes=[{g:'hielo',x:0,y:0,w:b.w,h:b.h}];for(const d of b.C)if(d.g==='canon'||d.g==='mesa')d.g='hielo';return b;};
/* ★ AGUA LIMPIA — ríos y lagos (no el mar de los archipiélagos) no llevan árboles, rocas ni cajas encima; solo los puentes (b.O) cruzan el agua */
function purgeWater(b){
 const ar=(b.biomes||[]).filter(q=>q.g==='archi'),inSea=(x,y)=>ar.some(q=>x>q.x&&x<q.x+q.w&&y>q.y&&y<q.y+q.h);
 const W=[];for(const d of b.C){if(d.g!=='archi')continue;
  if(d.t==='g'){const bb=polyBB(d.p);if(!inSea((bb.x0+bb.x1)/2,(bb.y0+bb.y1)/2))W.push({t:'g',pts:d.p,bb,w:0});}
  else if(d.t==='gl'){const bb=polyBB(d.pts),h=d.w/2;if(!inSea((bb.x0+bb.x1)/2,(bb.y0+bb.y1)/2))W.push({t:'gl',pts:d.pts,bb:{x0:bb.x0-h,y0:bb.y0-h,x1:bb.x1+h,y1:bb.y1+h},w:d.w});}}
 if(!W.length)return 0;
 const dseg=(x,y,a,c)=>{const dx=c[0]-a[0],dy=c[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);};
 const wet=(x,y,m)=>{for(const q of W){if(x<q.bb.x0-m||x>q.bb.x1+m||y<q.bb.y0-m||y>q.bb.y1+m)continue;
  if(q.t==='g'){const e=distPoly(x,y,q.pts);if(e[0]||e[1]<m)return true;}else{for(let i=0;i<q.pts.length-1;i++)if(dseg(x,y,q.pts[i],q.pts[i+1])<q.w/2+m)return true;}}return false;};
 const n0=b.C.length+b.S.length;
 b.C=b.C.filter(d=>!((d.t==='c'||d.t==='p')&&(d.t==='c'?wet(d.x,d.y,d.r*.7):wet(d.p[0][0],d.p[0][1],0))));
 b.S=b.S.filter(s=>{if(s.upd||s.tur||s.kind==='bridge'||!s.bb)return true;const m=Math.min(s.bb.x1-s.bb.x0,s.bb.y1-s.bb.y0)*.3;return !wet((s.bb.x0+s.bb.x1)/2,(s.bb.y0+s.bb.y1)/2,m);});
 return n0-(b.C.length+b.S.length);}
function loadMap(id,seedRand){const def=MAPD[id],r=seedRand||Math.random,b=MAPB[id](r);
 /* ★ AMPLIO #4 — agrandar el mapa (el Gran Continente ya es enorme y se queda igual) */
 World.geoK=id==='mundo'?1:AMPLIO.geoK;if(World.geoK!==1)scaleB(b,World.geoK);
 purgeWater(b); /* ★ AGUA LIMPIA */
 World.def=def;World.w=b.w;World.h=b.h;World.solids=b.S.concat(b.D);World.dyn=b.D;World.storms=b.storms;World.t=0;
 World.over=[];
 b.C=b.C.filter(d=>d.sp||d.t==='g'||d.t==='gl');World.biomes=b.biomes||[];addDetail(b,id);World.towns=b.towns||[];World.roadsOn=id==='valle'||id==='mundo';
 for(const d of b.C){if(d.t==='c')d.bb={x0:d.x-d.r,y0:d.y-d.r,x1:d.x+d.r,y1:d.y+d.r};else if(d.t==='p'||d.t==='g')d.bb=polyBB(d.p);else{const q=polyBB(d.pts);d.bb={x0:q.x0-d.w,y0:q.y0-d.w,x1:q.x1+d.w,y1:q.y1+d.w};}}
 World.decor=b.C;
 try{ROADNET=null;if(World.roadsOn)planRoads();}catch(e){}
 World.rings=[];if(b.R&&b.R.length){for(const q of b.R){let x=q[0],y=q[1];if(!World.free(x,y,130)){const a=airSpot(140);x=a[0];y=a[1];}World.rings.push({x,y,r:85,cd:0});}}else{const nr=Math.round(b.w*b.h/6e6);for(let i=0;i<nr;i++){const q=airSpot(140);World.rings.push({x:q[0],y:q[1],r:85,cd:0});}}
 /* ★ AMPLIO #5 — más anillos de impulso en mapas grandes */
 for(let i=0,n=Math.round(World.rings.length*(World.geoK-1));i<n;i++){const q=airSpot(140);World.rings.push({x:q[0],y:q[1],r:85,cd:0});}
 World.turrets=[];const cand=World.solids.filter(s=>['rock','mesa','bld','crate','spire'].includes(s.kind)&&s.bb.x1-s.bb.x0>130&&s.bb.y1-s.bb.y0>130);
 for(let i=cand.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cand[i],cand[j]]=[cand[j],cand[i]];}
 const flag=World.solids.filter(s=>s.tur);const nt=flag.length?flag.length:Math.round(b.w*b.h/8e6);for(const s of (flag.length?flag:cand).slice(0,nt))World.turrets.push({x:(s.bb.x0+s.bb.x1)/2,y:(s.bb.y0+s.bb.y1)/2,hp:70,max:70,cd:rnd(0,1.5),alive:true,rs:0,ang:rnd(0,TAU)});
 return World;}
function airSpot(margin,avoid){for(let k=0;k<160;k++){const x=rnd(320,World.w-320),y=rnd(320,World.h-320);if(!World.free(x,y,margin||220))continue;
  if(k<110&&avoid&&avoid.some(a=>(a.x-x)**2+(a.y-y)**2<(750*World.geoK)**2 /* ★ AMPLIO #5 */))continue;return[x,y];}
 for(let k=0;k<400;k++){const x=rnd(300,World.w-300),y=rnd(300,World.h-300);if(World.free(x,y,120))return[x,y];}
 return[World.w/2,World.h/2];}
function bestHeading(x,y){let best=0,bd=-1;for(let i=0;i<16;i++){const a=i/16*TAU-Math.PI;let d=0;for(let r=40;r<=900;r+=40){if(World.hit(x+Math.cos(a)*r,y+Math.sin(a)*r,30))break;d=r;}
  d+=rnd(0,60);if(d>bd){bd=d;best=a;}}return best;}
/* ===== Sonido, partículas y entidades de combate ===== */
let M=null;
const Snd={ctx:null,on:true,last:{},nb:null,
 init(){if(this.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(C)this.ctx=new C();}catch(e){}},
 tone(f,d,type,v,slide,key){if(!this.on||!this.ctx)return;const t=this.ctx.currentTime;if(key){if(t-(this.last[key]||0)<.05)return;this.last[key]=t;}
  try{const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
  g.gain.setValueAtTime(v||.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+d+.02);}catch(e){}},
 noise(d,v,key){if(!this.on||!this.ctx)return;const t=this.ctx.currentTime;if(key){if(t-(this.last[key]||0)<.05)return;this.last[key]=t;}
  try{if(!this.nb){const n=this.ctx.sampleRate*.6,b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;this.nb=b;}
  const s=this.ctx.createBufferSource(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(1800,t);f.frequency.exponentialRampToValueAtTime(120,t+d);
  s.buffer=this.nb;g.gain.setValueAtTime(v||.1,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(this.ctx.destination);s.start(t);s.stop(t+d);}catch(e){}}};
const near=p=>M&&M.pl&&(p.isPlayer||(p.x-M.pl.x)**2+(p.y-M.pl.y)**2<1000*1000);
const segD2=(x1,y1,x2,y2,px,py)=>{const dx=x2-x1,dy=y2-y1;let t=((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy||1);t=t<0?0:t>1?1:t;const ex=x1+dx*t-px,ey=y1+dy*t-py;return ex*ex+ey*ey;};

const PART_CAP=[1200,600,250,90],PART_DROP=[0,.3,.55,.8];
function emit(o){const lv=SAVE.cfg.parts|0,cap=PART_CAP[lv]||1200;if(PART_DROP[lv]&&Math.random()<PART_DROP[lv])return;if(M.parts.length>cap)M.parts.splice(0,Math.ceil(cap/8));M.parts.push(o);}
/* Brillos (shadowBlur) desactivables desde Ajustes */
(function(){try{const pr=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(pr,'shadowBlur');if(d&&d.set)Object.defineProperty(pr,'shadowBlur',{configurable:true,get:d.get,set(v){d.set.call(this,SAVE.cfg.glow===0?0:v);}});}catch(e){}})();
function sparks(x,y,n,col,sp,life){for(let i=0;i<n;i++){const a=rnd(0,TAU),s=rnd(sp*.25,sp);emit({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:rnd(.2,1)*life,m:life,s:rnd(1.5,3),c:col,g:260,d:1.6,k:'l'});}}
function popupFor(o,txt,col){if(!M)return;M.pop.push({t:M.t,txt,col:col||'#ffc83d',o});if(M.pop.length>8)M.pop.shift();}
function popup(txt,col){if(!M)return;M.pop.push({t:M.t,txt,col:col||'#ffc83d'});if(M.pop.length>5)M.pop.shift();}
/* ★ MEJORA: sacudida de cámara. camShake sacude a los jugadores humanos según su distancia al punto; selfShake sacude solo a p */
function selfShake(p,a){if(!p||!p.isPlayer||!M)return;p.shk=Math.max(p.shk||0,a);if(!M.split)M.shake=Math.max(M.shake,a);}
function camShake(x,y,a,range){if(!M)return;for(const p of(M.pls||[M.pl])){if(!p||!p.alive)continue;const d=Math.hypot(p.x-x,p.y-y);if(d<range)selfShake(p,a*(1-d/range));}}
function explosion(x,y,size,fx){netEvX(x,y,size,fx);camShake(x,y,13*size,1100);const n=Math.round(14*size);
 emit({x,y,vx:0,vy:0,l:.8,m:.8,s:46*size+10,c:'#fff',g:0,d:0,k:'x'});
 
 const cf=!!fx&&fx!=='clasico';if(cf)emit({x,y,vx:0,vy:0,l:1.5,m:1.5,s:0,c:'#fff',g:0,d:0,k:'fx',id:fx,R:240*size});
 if(!cf)emit({x,y,vx:0,vy:0,l:.45,m:.45,s:8,c:'#ffd9a0',g:0,d:0,k:'r',grow:260*size,lw:4});
 if(!cf){
 for(let i=0;i<n;i++){const a=rnd(0,TAU),s=rnd(40,280)*size;emit({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:rnd(.3,.8),m:.8,s:rnd(5,15)*size,c:pick(['#ffdc7a','#ff9b3d','#ff5a2b']),g:-20,d:2.2,k:'f'});}
 for(let i=0;i<n*.7;i++){const a=rnd(0,TAU),s=rnd(20,120)*size;emit({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,l:rnd(.8,1.8),m:1.8,s:rnd(6,14)*size,c:'#3a3a40',g:-30,d:1.1,k:'c',grow:10});}
 }
 sparks(x,y,Math.round(10*size),'#ffd27a',420*size,.8);
 if(size>=1.3)M.shake=Math.max(M.shake,9*size/1.5);
 if(near({x,y}))Snd.noise(.5*Math.min(size,1.5),.12,'ex');}

/* ===== Aviones ===== */
function makePlane(o){const def=o.def,e=effStats(def,o.up),hm=o.hpMul||1;
 return{id:o.id,name:o.name,def,eff:e,upv:o.up,look:o.look,isPlayer:!!o.isPlayer,ai:o.ai||null,dmgMul:o.dmgMul||1,
 x:0,y:0,ang:0,speed:e.cruise,angVel:0,hp:e.hp*hm,maxHp:e.hp*hm,energy:100,alive:false,respawn:.01,inv:0,rollT:0,rollInv:0,rollCd:0,flipT:0,flipDir:0,
  /* ★ HERIDO #3 / ★ PESO #1 — campos nuevos de cada avión:
       flipDur : duración (s) de una media vuelta ya iniciada. Antes era siempre 0,5 s; ahora varía con herida y tamaño.
                 Se guarda para girar siempre exactamente 180° (la velocidad angular = π / flipDur).
       rollTm  : multiplicador de tiempo del roll en curso (1 = normal). Lo usan la 2ª mitad de la tijera y el desplazamiento lateral.
     ★ HERIDO #4 — wobPh : fase aleatoria propia del temblor, para que dos aviones heridos no tiemblen sincronizados. */
  flipDur:.5,rollTm:1,wobPh:Math.random()*TAU,
 cd:0,secAmmo:def.sec.n,secT:0,secRl:0,spCd:0,spT:0,shield:0,cloak:0,boosting:false,stall:false,oob:0,flash:0,
 score:0,kills:0,deaths:0,assists:0,streak:0,bestStreak:0,dmgBy:{},lastHit:null,lastHitT:-99,loopAcc:0,loopT:0,loopCd:0,nmT:0,nmCool:0,trailT:0,aliveT:0,
 in:{turn:0,boost:false,brake:false,fire:false,sec:false,roll:false,flip:false,flipDown:false,sp:false},
 st:{kills:0,assists:0,loops:0,rolls:0,flips:0,dodges:0,nearmiss:0,coins:0,alive:0,tricks:0,bestStreak:0}};}
function spawnPlane(p){const others=M.planes.filter(q=>q.alive&&q!==p);let pt=null;if(others.length&&Math.random()<.7){const q=pick(others);for(let k=0;k<40&&!pt;k++){const a=rnd(0,TAU),d=rnd(1600,3400)*World.geoK /* ★ AMPLIO #5: aparecer más lejos */,x=q.x+Math.cos(a)*d,y=q.y+Math.sin(a)*d;if(x>400&&y>400&&x<World.w-400&&y<World.h-400&&World.free(x,y,240))pt=[x,y];}}
 if(!pt)pt=airSpot(240,others);if(M.zone){for(let k=0;k<30&&Math.hypot(pt[0]-M.zone.x,pt[1]-M.zone.y)>M.zone.r*.8;k++)pt=airSpot(240,others);}p.x=pt[0];p.y=pt[1];p.ang=bestHeading(p.x,p.y);
 p.speed=p.eff.cruise;p.angVel=0;p.hp=p.maxHp;p.energy=100;p.secAmmo=p.def.sec.n;p.secRl=0;p.heat=0;p.rldG=0;p.inv=2.5;p.ghost=true;p.ghostT=2.5;p.far=0;p.alive=true;p.rollT=0;p.flipT=0;p.rollInv=0;p.shield=0;p.cloak=0;p.spT=0;
 p.dmgBy={};p.loopAcc=0;p.stall=false;p.oob=0;p.lastHit=null;p.cd=0;p.secT=0;if(p.ai){p.ai.state='patrol';p.ai.cx=undefined;}if(p.def.sp.t==='fenix')p.spCd=0;}
function comboHit(p){if(M.t-(p.comboT===undefined?-99:p.comboT)<4)p.combo=(p.combo||0)+1;else p.combo=1;p.comboT=M.t;return Math.min(3,1+(p.combo-1)*.5);}
function trick(p,txt,pts,coins,key){if(p.isPlayer&&M&&M.tut)M.tut.last=txt;const mult=comboHit(p);pts=Math.round(pts*mult);coins=Math.round(coins*mult)+Math.max(1,Math.round(pts*.25));p.st.tricks++;if(key)p.st[key]++;if(p.spCd>0&&p.def&&p.def.sp&&p.def.sp.t!=='fenix')p.spCd=Math.max(0,p.spCd-1); /* ★ MEJORA: cada acrobacia acorta 1 s el enfriamiento del especial */if(p.isPlayer||p.remote){p.st.coins+=coins;if(p.isPlayer){popupFor(p,txt+' +'+coins+' ¤'+(mult>1?'  x'+String(mult).replace('.0',''):''),'#3fd0c9');Snd.tone(660,.09,'triangle',.05,1.5);Snd.tone(990,.12,'triangle',.04,1.4);}}}
/* ayuda de puntería del jugador según dificultad (Mixta, Novato, Piloto, Veterano, As, Leyenda) */
const aimK=()=>{const k=[1,1.8,1.5,1.15,.65,0][M.cfg.diff];return k===undefined?1:k;};
function fireGun(p){const g=GUNS[p.def.gun];if(p.cd>0||p.rldG>0)return;p.cd=g.rate/(p.odT>0?2:1);const c=Math.cos(p.ang),s=Math.sin(p.ang),L=p.def.shape.len*.5+6;
 let assist=0;if(!p.isPlayer||aimK()>0){const tg=pickTarget(p,.32,AMPLIO.assistRange) /* ★ AMPLIO #7: ayuda de puntería a más distancia */;if(tg){const d=Math.hypot(tg.x-p.x,tg.y-p.y),tt=d/(g.spd+p.speed*.55),lx=tg.x+Math.cos(tg.ang)*tg.speed*tt-p.x,ly=tg.y+Math.sin(tg.ang)*tg.speed*tt-p.y;const ak=p.isPlayer?aimK():1;assist=clamp(angDiff(p.ang,Math.atan2(ly,lx)),-.16*ak,.16*ak)*(p.isPlayer?.85*ak:.5);}}
 for(let i=0;i<g.k;i++){let a=p.ang+assist+rnd(-g.spread,g.spread),lat=0;if(g.fan)a=p.ang+(i-1)*g.spread;else if(g.k===2)lat=(i?1:-1)*g.off;
  const x=p.x+c*L-s*lat,y=p.y+s*L+c*lat,sp=g.spd;M.bul.push({x,y,px:x,py:y,vx:Math.cos(a)*sp+c*p.speed*.55,vy:Math.sin(a)*sp+s*p.speed*.55,l:g.life,dmg:g.dmg*p.eff.pow*p.dmgMul*(p.dmgT>0?2:1),o:p,col:g.col,w:g.w,dv:0});}
 if(p.isPlayer)selfShake(p,g.dmg>=15?2.4:.9);
 if(near(p))Snd.tone(g.dmg>10?240:820,.05,'square',.022,.45,'g'+(p.isPlayer?1:0));}
function pickTarget(p,cone,rng){let best=null,bd=1e9;for(const q of M.planes){if(q===p||!q.alive||ally(p,q))continue;const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d>rng)continue;if(q.cloak>0&&d>420)continue;
  const df=Math.abs(angDiff(p.ang,Math.atan2(dy,dx)));if(df>cone)continue;const sc=d*(1+df*1.4);if(sc<bd){bd=sc;best=q;}}return best;}
function fireSec(p){const s=p.def.sec;if(p.secT>0||p.secAmmo<=0)return;const c=Math.cos(p.ang),s2=Math.sin(p.ang),L=p.def.shape.len*.5;p.secAmmo--;selfShake(p,3.2);
 if(s.t==='misil'){p.secT=.5;M.mis.push({x:p.x+c*L,y:p.y+s2*L,ang:p.ang,sp:Math.max(p.speed+120*AMPLIO.speedK,430*AMPLIO.secSpdK),max:900*AMPLIO.secSpdK,l:4.6*AMPLIO.secLifeK,o:p,tg:pickTarget(p,.6,AMPLIO.lockRange) /* ★ AMPLIO #7 */,dmg:58*p.eff.pow*p.dmgMul*(p.dmgT>0?2:1),age:0,ign:0,r:80,kind:'misil'});if(near(p))Snd.noise(.35,.07,'ms');}
 else if(s.t==='cohetes'){p.secT=.8;for(let i=-1;i<=1;i++){const a=p.ang+i*.07;M.mis.push({x:p.x+c*L,y:p.y+s2*L,ang:a,sp:Math.max(p.speed+200*AMPLIO.speedK,700*AMPLIO.secSpdK),max:1000*AMPLIO.secSpdK,l:1.7*AMPLIO.secLifeK, /* ★ AMPLIO #7 */o:p,tg:null,dmg:26*p.eff.pow*p.dmgMul*(p.dmgT>0?2:1),age:0,ign:0,r:55,kind:'cohete'});}if(near(p))Snd.noise(.3,.07,'ms');}
 else{p.secT=.55;M.bombs.push({x:p.x,y:p.y,vx:c*(p.speed*.6+160),vy:s2*(p.speed*.6+160),l:1.8,o:p,dmg:75*p.eff.pow*p.dmgMul*(p.dmgT>0?2:1),age:0});}
 if(p.isPlayer)Snd.tone(300,.12,'sawtooth',.04,.4);}
function useSpecial(p){const s=p.def.sp;if(p.spCd>0||s.t==='fenix')return;const t=s.t;
 if(t==='dash'){p.speed=Math.min(p.eff.cruise*2.3,p.speed+p.eff.cruise*1.0);p.dashT=Math.max(p.dashT,.5);p.inv=Math.max(p.inv,.6);sparks(p.x,p.y,26,'#9be7ff',460,.6);}
 else if(t==='turbo'){p.spT=3.5;p.nrgT=Math.max(p.nrgT,3.5);p.energy=100;sparks(p.x,p.y,22,'#ffb040',400,.6);}
 else if(t==='escudo'){p.shield=4;emit({x:p.x,y:p.y,vx:0,vy:0,l:.5,m:.5,s:10,c:'#9be7ff',g:0,d:0,k:'r',grow:160,lw:5});}
 else if(t==='cloak'){p.cloak=5;p.dmgT=Math.max(p.dmgT,5);for(const m of M.mis)if(m.tg===p)m.tg=null;for(const q of M.planes)if(q.ai&&q.ai.tg===p&&Math.hypot(q.x-p.x,q.y-p.y)>250)q.ai.tg=null;sparks(p.x,p.y,20,'#d5dade',260,.7);}
 else if(t==='repair'){p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.5);p.secAmmo=p.def.sec.n;sparks(p.x,p.y,26,'#5bd67d',260,.9);emit({x:p.x,y:p.y,vx:0,vy:0,l:.6,m:.6,s:8,c:'#5bd67d',g:0,d:0,k:'r',grow:130,lw:5});}
 else if(t==='overdrive'){p.odT=5;sparks(p.x,p.y,22,'#ffd93d',420,.6);}
 else if(t==='nova'){const R=520;emit({x:p.x,y:p.y,vx:0,vy:0,l:.6,m:.6,s:12,c:'#ffd27a',g:0,d:0,k:'r',grow:R*1.7,lw:8});sparks(p.x,p.y,40,'#ffb040',620,.7);M.shake=Math.max(M.shake,10);
  for(const v of M.planes){if(v===p||!v.alive||ally(p,v))continue;if(Math.hypot(v.x-p.x,v.y-p.y)<R){damage(v,38,p,'onda de choque');v.speed*=.55;}}
  for(let i=M.bul.length-1;i>=0;i--){const b=M.bul[i];if(b.o!==p&&!(b.o&&ally(p,b.o))&&Math.hypot(b.x-p.x,b.y-p.y)<R)M.bul.splice(i,1);}
  for(let i=M.mis.length-1;i>=0;i--){const m=M.mis[i];if(m.o!==p&&!(m.o&&ally(p,m.o))&&Math.hypot(m.x-p.x,m.y-p.y)<R){explosion(m.x,m.y,.5,'clasico');M.mis.splice(i,1);}}}
 p.spCd=s.cd;if(p.isPlayer){Snd.tone(440,.25,'sine',.06,2);popupFor(p,SPECS[t].n.toUpperCase(),'#9be7ff');}}
/* ★ HERIDO #2 / #3 · ★ PESO #1 — startRoll: inicia un roll (barrena lateral que da inmunidad a los disparos).
   Cambios respecto al original:
     · El coste de energía pasa por woundCost(): sube cuanto más herido está el piloto.
     · La duración del roll (rollT) y su duración de referencia (rollD, que usan el dibujo y el desplazamiento) se
       multiplican por acroTimeMul(): más lento si está herido o si el avión es grande.
     · La inmunidad (rollInv = 0,55 s) NO se alarga a propósito: un roll lento deja más tiempo vulnerable al final,
       así la lentitud es un castigo real y no una ventaja. */
function startRoll(p){
 const k=p.def.acro?.5:1;                 /* Víbora (def.acro): mitad de coste, regla original que se conserva */
 const cost=woundCost(p,22*k);            /* coste base 22, aumentado por las heridas */
 if(p.rollT>0||p.rollCd>0||p.energy<cost)return; /* ya rueda, en enfriamiento o sin energía suficiente → no hace nada */
 p.energy-=cost;
 p.rollDir=p.in.rollDir||(p.in.turn?Math.sign(p.in.turn):(Math.random()<.5?1:-1)); /* sentido: el pedido, el del giro actual o al azar */
 p.in.rollDir=0;
 const tm=acroTimeMul(p);                 /* alargamiento de esta maniobra (se calcula una sola vez, al empezar) */
 p.rollTm=tm;                             /* se guarda para la 2ª mitad de la tijera y para el desplazamiento lateral */
 p.rollT=.75*tm;p.rollD=.75*tm;           /* duración del roll: 0,75 s normales × alargamiento */
 p.tonel=false;p.turboRoll=false;
 p.rollInv=.55;                           /* inmunidad: se mantiene en 0,55 s (ver nota arriba) */
 p.rollCd=1.8;}
/* ★ HERIDO #2 — startDash: la embestida también es una maniobra con coste de energía, así que sube con las heridas.
   (Su velocidad no se toca: es una ráfaga de empuje, no una acrobacia que "se ejecute" despacio.) */
function startDash(p){
 const cost=woundCost(p,30);              /* coste base 30, aumentado por las heridas */
 if(p.dashCd>0||p.energy<cost)return;
 p.energy-=cost;
 selfShake(p,4);p.dashCd=3.5;p.dashT=.6;p.speed=Math.min(p.eff.cruise*2.4,p.speed+p.eff.cruise*1.1);p.inv=Math.max(p.inv,.35);
 sparks(p.x,p.y,18,'#9be7ff',420,.5);p.st.tricks++;
 if(p.isPlayer){popupFor(p,'DASH','#9be7ff');Snd.tone(300,.18,'sawtooth',.05,3);}}
/* ★ HERIDO #2 / #3 · ★ PESO #1 — startFlip: inicia una media vuelta (giro de 180°).
   Cambios respecto al original:
     · Coste de energía con woundCost().
     · La duración ya no es fija (0,5 s): flipDur = 0,5 × acroTimeMul(). El giro se reparte en esa duración
       (velocidad angular = π / flipDur en updPlane), así sigue girando exactamente 180°, pero más despacio. */
function startFlip(p){
 const k=p.def.acro?.5:1;                 /* Víbora: mitad de coste (regla original) */
 const cost=woundCost(p,26*k);            /* coste base 26, aumentado por las heridas */
 if(p.flipT>0||p.energy<cost)return;
 p.energy-=cost;
 p.flipDur=.5*acroTimeMul(p);             /* duración de la media vuelta: 0,5 s normales × alargamiento */
 p.flipT=p.flipDur;                       /* tiempo restante de giro */
 p.flipDir=p.in.turn?Math.sign(p.in.turn):(p.lastTurn||(Math.random()<.5?1:-1)); /* sentido del giro */
 p.loopAcc=0;
 if(p.in.flipDown)p.speed=Math.min(p.eff.cruise*1.9,p.speed*1.12);}
/* ★ HERIDO #2 / #3 · ★ PESO #1 — startMove: maniobras compuestas (tonel, tijera, inmelmann, bucle, cobra, roll turbo).
   Todas conservan su lógica original; solo cambian dos cosas:
     · cada coste de energía pasa por woundCost() (más caro herido);
     · cada duración se multiplica por el alargamiento de la maniobra (rollTm, flipDur o acroTimeMul()). */
function startMove(p,mv){const I=p.in;
 if(mv==='tonel'){                                   /* TONEL: roll doble, 1,3 s normales */
  if(p.tonel)return;
  if(p.rollT<=0){startRoll(p);if(p.rollT<=0)return;} /* si no estaba rodando, empieza un roll (que ya cobra su coste) */
  const cost=woundCost(p,12);                        /* coste extra de convertirlo en tonel */
  if(p.energy<cost)return;
  p.energy-=cost;
  p.tonel=true;
  p.rollT=1.3*(p.rollTm||1);p.rollD=p.rollT;         /* misma proporción de alargamiento que el roll que ya está en curso */
  p.rollInv=Math.max(p.rollInv,1.05);}               /* inmunidad sin alargar (misma razón que en startRoll) */
 else if(mv==='tijera'){                             /* TIJERA: dos rolls seguidos en sentidos opuestos */
  if(p.rollT>0||p.energy<woundCost(p,34))return;     /* debe poder pagar el roll (22) + el extra (12) con el sobrecoste */
  const d=I.rollDir||p.lastTurn||1;I.rollDir=d;
  startRoll(p);if(p.rollT<=0)return;
  p.energy-=woundCost(p,12);                         /* coste extra de la tijera */
  p.rollQ=-d;p.rollInv=.6;
  p.rollD=.75*(p.rollTm||1);}                        /* 1ª mitad con la duración alargada (la 2ª se programa en updPlane) */
 else if(mv==='inmel'){if(p.flipT<=0)startFlip(p);if(p.flipT>0&&!p.loopX)p.afterDash=true;} /* INMELMANN: usa startFlip (ya modificado) */
 else if(mv==='bucle'){                              /* BUCLE: media vuelta + otra media vuelta = 360° */
  if(p.flipT<=0)startFlip(p);
  const cost=woundCost(p,16);                        /* coste extra de la 2ª media vuelta del bucle, con sobrecoste por heridas */
  if(p.flipT>0&&!p.loopX&&p.energy>=cost){
   p.energy-=cost;p.loopX=true;p.afterDash=false;
   p.flipT+=p.flipDur;}}                             /* se añade OTRA media vuelta de la misma duración → 2 × 180° = 360° */
 else if(mv==='cobra'){                              /* COBRA: frenada vertical, 0,85 s normales */
  const cost=woundCost(p,20);                        /* coste de la cobra, con sobrecoste por heridas */
  if(p.cobraT>0||p.energy<cost)return;
  p.energy-=cost;
  p.cobraT=.85*acroTimeMul(p);                       /* duración alargada por herida y tamaño */
  p.inv=Math.max(p.inv,.25);
  if(p.isPlayer){popupFor(p,'COBRA…','#cfd6e4');Snd.tone(220,.2,'sawtooth',.04,.6);}}
 else if(mv==='tturbo'){                             /* ROLL TURBO: roll + impulso */
  if(p.rollT<=0)startRoll(p);
  const cost=woundCost(p,24);                        /* coste extra del impulso turbo del roll, con sobrecoste por heridas */
  if(p.rollT>0&&!p.turboRoll&&p.energy>=cost){
   p.energy-=cost;p.turboRoll=true;p.dashT=.6;
   p.speed=Math.min(p.eff.cruise*2.4,p.speed+p.eff.cruise*1.1);
   p.rollInv=Math.max(p.rollInv,.8);
   sparks(p.x,p.y,16,'#ffd93d',400,.5);trick(p,'ROLL TURBO',40,8,'dodges');}}}
function damage(v,amt,att,kind){if(!v.alive||M.over||amt<=0)return;if(att&&att!==v&&ally(att,v))return;if(v.inv>0)return;if(v.shield>0){sparks(v.x,v.y,3,'#9be7ff',160,.3);return;}
 if(kind==='disparo')amt*=1.6;v.hp-=amt;v.flash=.14;if(att&&att!==v){v.lastHit=att;v.lastHitT=M.t;const r=v.dmgBy[att.id]||(v.dmgBy[att.id]={t:0,a:0});r.t=M.t;r.a+=amt;if(att.isPlayer)Snd.tone(320,.05,'sine',.03,.5,'hit');}
 if(v.isPlayer&&att&&att!==v&&att.x!==undefined){(v.hitDir||(v.hitDir=[])).push({a:Math.atan2(att.y-v.y,att.x-v.x),t:M.t});if(v.hitDir.length>6)v.hitDir.shift();} /* ★ MEJORA: indicador direccional de impacto */
 if(v.isPlayer){M.shake=Math.max(M.shake,4);v.shk=Math.max(v.shk||0,4);Snd.tone(150,.08,'sawtooth',.04,.5,'hurt');}
 if(v.hp<=0){if(v.def.sp.t==='fenix'&&v.spCd<=0){v.hp=v.maxHp*.5;v.spCd=v.def.sp.cd;v.inv=1.5;emit({x:v.x,y:v.y,vx:0,vy:0,l:.8,m:.8,s:10,c:'#ffb040',g:0,d:0,k:'r',grow:360,lw:6});if(v.isPlayer)popupFor(v,'RENACER','#ffb040');}else kill(v,att,kind);}}
/* ═══════════════════════════════════════════════════════════════════════════
   ★ DERRIBO — al morir el avión ya no desaparece: cae humeando, se desprenden piezas y, al tocar el suelo, reacciona según el terreno:
     agua → salpicadura, anillos de ondas, burbujas, se hunde y deja una mancha de aceite
     césped → surco de tierra, terrones y briznas, polvo, se desintegra en restos humeantes
     arena/cañón → gran nube de polvo ocre, surco ancho
     nieve → polvo blanco, vapor, surco azulado, esquirlas de hielo
     ciudad / fábrica → chispas, marcas de derrape negras, bola de fuego, humo denso (y aceite en la fábrica)
     obstáculo → explosión directa con metralla
   La caída es solo visual: no interactúa con nada. La cámara sigue al avión derribado.
   ═══════════════════════════════════════════════════════════════════════════ */
const WG={
 valle:{dust:'#a39166',dust2:'#7a8c52',chunks:['#4a3a28','#5e4a32','#3f7a35','#4f8f3f','#6a5538'],furrow:'#4a3a29',edge:'#735e40',fire:1,smoke:'#2b2b2f'},
 canon:{dust:'#e8c898',dust2:'#d4a771',chunks:['#c28a5a','#d7ac7a','#a9744c'],furrow:'#b07a4f',edge:'#dfb687',fire:.55,smoke:'#4a3b31',big:1.35},
 mesa:{dust:'#d9a077',dust2:'#b9693c',chunks:['#b8613a','#9c4e2e','#c9835c','#7d3f27'],furrow:'#9a5535',edge:'#c98a62',fire:.6,smoke:'#46342b',big:1.2},
 hielo:{dust:'#f6fbff',dust2:'#cfe4f2',chunks:['#ffffff','#d6ecfa','#a9d3ec','#8fc2e2'],furrow:'#9fb2c6',edge:'#eef7fc',fire:.5,smoke:'#6b7078',steam:1,big:1.3},
 metro:{dust:'#92929f',dust2:'#6d6d7b',chunks:['#5d5d6b','#7d7d8b','#3f3f4a','#a0a0ac'],skid:'#121217',fire:1.4,sparks:1,smoke:'#1c1c21'},
 fabrica:{dust:'#8d9174',dust2:'#6b6f55',chunks:['#7a7e68','#4d503f','#a0a58a','#34362b'],skid:'#15160f',fire:1.2,sparks:1,oil:1,smoke:'#1c1c17'},
 crash:{dust:'#7d7d88',dust2:'#4b4b55',chunks:['#6a6a76','#8a8a96','#3c3c46','#ffb040'],fire:1.6,sparks:1,smoke:'#1f1f24'}};
/* ¿qué suelo hay en (x,y)? — mismo orden de pintado que el mapa: bioma base → biomas duros → mar → manchas y ríos */
function groundAt(x,y){let g='valle';const bl=World.biomes||[];
 const inB=b=>{try{const P=biomePoly(b,0),r=P.r;if(x<r.x0||x>r.x1||y<r.y0||y>r.y1)return false;return distPoly(x,y,P.all)[0];}catch(e){return false;}};
 for(const b of bl)if(!HARD[b.g]&&b.g!=='archi'&&inB(b))g=b.g;
 for(const b of bl)if(HARD[b.g]&&inB(b))g=b.g;
 for(const b of bl)if(b.g==='archi'&&inB(b))g='archi';
 for(const d of World.decor){if(d.t==='c'||!d.bb)continue;const bb=d.bb;if(x<bb.x0||x>bb.x1||y<bb.y0||y>bb.y1)continue;
  if(d.t==='g'){if(distPoly(x,y,d.p)[0])g=d.g;}
  else if(d.t==='gl'){const P=d.pts;for(let i=0;i<P.length-1;i++){if(Math.sqrt(segD2(P[i][0],P[i][1],P[i+1][0],P[i+1][1],x,y))<d.w*.5){g=d.g;break;}}}}
 return g;}
const WQ=()=>[1,.7,.45,.25][SAVE.cfg.parts|0]||1;
const hexRGB=c=>{const n=parseInt(c.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];};
let WTR=0; /* ★ AGUA RECORTADA: mientras vale 1, las partículas que se crean se marcan como 'de agua' (o.wt) y solo se pintan sobre el agua */
const WK=1.75; /* el mapa se ve alejado: los efectos se agrandan para que se lean */
function wpart(o){const a=M.wp||(M.wp=[]);if(WTR)o.wt=1;if(a.length>600)a.splice(0,80);o.m=o.l;o.dl=o.dl||0;o.s*=WK;if(o.grow)o.grow*=WK;if(o.lw)o.lw*=1.4;if(o.k==='drop'||o.k==='chunk'||o.k==='ember'||o.k==='spark'){o.vx*=1.3;o.vy*=1.3;}a.push(o);return o;}
function wpiece(o){const a=M.wpc||(M.wpc=[]);if(a.length>90)a.splice(0,10);a.push(o);return o;}
function wscar(o){const a=M.scars||(M.scars=[]);o.t=0;if(a.length>34)a.shift();a.push(o);return o;}
/* tamaño de las piezas según el modelo del avión */
function pieceShape(def,type,s){const sh=def.shape,L=sh.len,W=sh.wing*1.25,bh=sh.bh*1.1;
 if(type==='wing')return[[L*.16,0],[-L*.04,W*.94*s],[-L*.22,W*.94*s],[-L*.22,0]];
 if(type==='tail')return[[0,-bh*.7],[-L*.14,-sh.tail*.9],[-L*.2,-sh.tail*.9],[-L*.2,bh*.7],[0,bh*.7]].map(q=>[q[0],q[1]*.8]);
 if(type==='nose')return[[L*.22,0],[L*.08,-bh*.62],[-L*.12,-bh*.55],[-L*.12,bh*.55],[L*.08,bh*.62]];
 const Ls=(10+Math.random()*16)*s,Ws=(3+Math.random()*5)*s;return[[-Ls*.5,-Ws*.5],[Ls*(.2+Math.random()*.3),-Ws*(.4+Math.random()*.6)],[Ls*.5,Ws*(.1+Math.random()*.4)],[-Ls*.3,Ws*.55]];}
function spawnPiece(w,type,side,fall,spd,from){const p=w.p,def=p.def,lk=w.lk,col=paintOf(lk.paint);
 const a=from!==undefined?from:w.ang+(side>0?Math.PI/2:-Math.PI/2)+rnd(-.5,.5),v=spd*rnd(.6,1.2),sc=type==='scrap'?rnd(.5,1.3):1;
 return wpiece({type,def,x:w.x+rnd(-8,8),y:w.y+rnd(-8,8),vx:w.vx*.6+Math.cos(a)*v,vy:w.vy*.6+Math.sin(a)*v,rot:w.ang+(side<0&&type==='wing'?0:0),vr:rnd(-7,7),side:side||1,
  poly:pieceShape(def,type,sc),P:type==='scrap'?(Math.random()<.45?'#3a3a40':(Math.random()<.5?col[0]:col[1])):col[0],S:col[1],fall:fall,age:0,z:1,land:false,life:rnd(9,13),burn:Math.random()<.7,fl:rnd(0,9),sc:1});}
/* ─── crear el derribo ─── */
function spawnWreck(v,kind){if(!M||!v)return;const arr=M.wrecks||(M.wrecks=[]);const sp=Math.min(900,Math.max(80,v.speed||200)),a=v.ang||0,msl=/misil|cohete|bomba|onda|explos|torre/i.test(kind||''),col=/colisi/i.test(kind||''),crash=kind==='choque';
 const w={p:v,def:v.def,lk:teamLook(v),x:v.x,y:v.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,ang:a,dir:a,av:(Math.random()<.5?-1:1)*rnd(2.4,4.4)*(msl||col?1.5:1),t:0,T:crash?0:(msl?rnd(.85,1.25):rnd(1.3,1.9)),z:1,mode:'fall',acc:0,acc2:0,kind:kind||'',tailLost:false,seed:Math.random()*99};
 arr.push(w);
 if(!crash){if(msl||col)spawnPiece(w,'wing',Math.random()<.5?1:-1,rnd(.6,1.0),rnd(120,260));
  if(msl)for(let i=0;i<3;i++)spawnPiece(w,'scrap',1,rnd(.5,.9),rnd(120,260),rnd(0,TAU));}
 else{wreckImpact(w,true);}
 if(v.isPlayer){M.shake=Math.max(M.shake,5);v.shk=Math.max(v.shk||0,5);}}
/* ─── impacto ─── */
/* ondas en el agua: arcos rotos y ondulados, alargados en el sentido de avance (nada de círculos perfectos) */
function ringFx(x,y,s,grow,l,lw,c,dl,fill,dir,st){wpart({k:'wring',x,y,vx:0,vy:0,s,grow,l,lw,c,dl:dl||0,seed:rnd(0,99),dir:dir===undefined?rnd(0,TAU):dir,st:st||rnd(1,1.25)});}
function blobPath(c,x,y,r,seed,st,dir){const n=16,P=[];for(let i=0;i<n;i++){const a=i/n*TAU,k=1+.2*Math.sin(a*3+seed)+.13*Math.sin(a*5+seed*1.9)+.08*Math.sin(a*7+seed*2.7),lx=Math.cos(a)*r*k*st,ly=Math.sin(a)*r*k,ca=Math.cos(dir),sa=Math.sin(dir);P.push([x+lx*ca-ly*sa,y+lx*sa+ly*ca]);}c.beginPath();c.moveTo((P[0][0]+P[n-1][0])/2,(P[0][1]+P[n-1][1])/2);for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}c.closePath();}
function dustFx(x,y,s,grow,l,c,vx,vy,al){wpart({k:'dust',x,y,vx:vx||0,vy:vy||0,s,grow,l,c,al:al||.55,d:1.4});}
function wreckImpact(w,obstacle){const q=WQ();WTR=0;w.z=0;const g=obstacle?'crash':groundAt(w.x,w.y),G=WG[g]||WG.valle;w.g=g;const sp=Math.hypot(w.vx,w.vy);
 if(sp>25)w.dir=Math.atan2(w.vy,w.vx);
 if(g==='archi'){/* ── AGUA ── */
  WTR=1;w.mode='sink';w.sk=0;w.SK=2.6;w.vx*=.3;w.vy*=.3;w.seed2=rnd(0,99);
  const X=w.x,Y=w.y;camShake(X,Y,8,900);Snd.noise(.55,.12,'spl');Snd.tone(150,.3,'sine',.07,.4,'spl2');
  const dr=w.dir,sk=sp>150;
  ringFx(X,Y,12,300,1.2,4.5,'#ffffff',0,null,dr,1.15);ringFx(X,Y,8,210,1.5,3.5,'#e2f6fd',.1,null,dr,1.2);ringFx(X,Y,6,140,1.8,3,'#bfe6f4',.24,null,dr,1.25);
  /* corona de chorros (la salpicadura) */
  for(let i=0;i<Math.round(26*q);i++){const a=i/26*TAU+rnd(-.12,.12),v=rnd(140,400);wpart({k:'jet',x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:rnd(2,4.2),l:rnd(.4,.8),d:2.8,c:'#ffffff'});}
  for(let i=0;i<Math.round(46*q);i++){const a=rnd(0,TAU),v=rnd(50,330);wpart({k:'drop',x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:rnd(2,5.5),l:rnd(.5,1.1),d:2.2,c:Math.random()<.5?'#ffffff':'#c9ecf8'});}
  /* columna de agua: varias bocanadas pequeñas, no un disco */
  for(let i=0;i<Math.round(9*q);i++)dustFx(X+rnd(-16,16),Y+rnd(-16,16),rnd(8,14),rnd(26,46),rnd(.5,.85),'#f2fbff',rnd(-70,70),rnd(-70,70),.5);
  /* espuma en racimo que se va deshaciendo */
  for(let i=0;i<Math.round(24*q);i++){const a=rnd(0,TAU),d=Math.pow(Math.random(),.6)*34;wpart({k:'foam',x:X+Math.cos(a)*d,y:Y+Math.sin(a)*d,vx:Math.cos(a)*rnd(8,40),vy:Math.sin(a)*rnd(8,40),s:rnd(5,11),grow:rnd(0,5),l:rnd(1.3,2.8),d:1.1});}
  if(sk){w.vx*=1.6;w.vy*=1.6;w.wake=.9;}
  wscar({k:'slick',x:X,y:Y,r:rnd(110,150),ttl:14,seed:rnd(0,99),dir:dr,st:sk?1.5:1.15});
  if(w.lk&&Math.random()<.9)spawnPiece(w,'wing',Math.random()<.5?1:-1,.01,rnd(40,110));
  WTR=0;return;}
 /* ── TIERRA / OBSTÁCULO ── */
 const X=w.x,Y=w.y,big=G.big||1,fire=G.fire||1;camShake(X,Y,obstacle?10:12,1000);Snd.noise(obstacle?.6:.45,.16,'cr1');Snd.tone(90,.4,'sawtooth',.07,.4,'cr2');
 dustFx(X,Y,16*big,70*big,1.2,G.dust,0,0,.7);for(let i=0;i<Math.round(10*q);i++){const a=rnd(0,TAU),v=rnd(60,230)*big;dustFx(X+Math.cos(a)*20,Y+Math.sin(a)*20,12*big,52*big,rnd(1.1,2),i%2?G.dust:G.dust2,Math.cos(a)*v+w.vx*.25,Math.sin(a)*v+w.vy*.25,.62);}
 for(let i=0;i<Math.round(26*q);i++){const a=rnd(0,TAU),v=rnd(70,380);wpart({k:'chunk',x:X,y:Y,vx:Math.cos(a)*v+w.vx*.3,vy:Math.sin(a)*v+w.vy*.3,s:rnd(3,9),l:rnd(.6,1.3),d:1.8,c:pick(G.chunks),rot:rnd(0,TAU),vr:rnd(-12,12)});}
 for(let i=0;i<Math.round(14*fire*q);i++){const a=rnd(0,TAU),v=rnd(40,260);wpart({k:'ember',x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:rnd(6,16),grow:-8,l:rnd(.35,.9),d:2.4,c:pick(['#fff3b0','#ffc060','#ff8a2a'])});}
 if(G.sparks)for(let i=0;i<Math.round(18*q);i++){const a=rnd(0,TAU),v=rnd(160,520);wpart({k:'spark',x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:rnd(1.6,3),l:rnd(.25,.6),d:2.2,c:'#ffd27a'});}
 /* las alas saltan, el avión se parte */
 if(!w.brokeWings){w.brokeWings=true;spawnPiece(w,'wing',1,.01,rnd(160,320));spawnPiece(w,'wing',-1,.01,rnd(160,320));spawnPiece(w,'tail',1,.01,rnd(90,200),w.dir+Math.PI+rnd(-.6,.6));}
 if(obstacle){disintegrate(w);return;}
 w.mode='slide';w.st=0;w.sv=Math.min(520,sp*.85+60);w.D=clamp(w.sv/320,.55,1.45);w.fur=wscar({k:'furrow',pts:[[X,Y]],w:G.skid?7:20,col:G.skid||G.furrow,edge:G.edge||'#000',skid:!!G.skid,ttl:30});w.lastP=[X,Y];}
function disintegrate(w){const q=WQ(),G=WG[w.g]||WG.valle,X=w.x,Y=w.y,fire=G.fire||1,big=G.big||1;
 camShake(X,Y,7,800);Snd.noise(.4,.12,'dis');
 for(let i=0;i<Math.round(8*q)+2;i++)spawnPiece(w,'scrap',1,rnd(.35,.8),rnd(60,260),w.dir+rnd(-1.4,1.4));
 spawnPiece(w,'nose',1,.5,rnd(80,160),w.dir+rnd(-.5,.5));
 for(let i=0;i<Math.round(20*fire*q);i++){const a=rnd(0,TAU),v=rnd(30,280);wpart({k:'ember',x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:rnd(8,22),grow:-12,l:rnd(.4,1),d:2.2,c:pick(['#fff3b0','#ffc060','#ff7a2a','#e8431c'])});}
 for(let i=0;i<3;i++)dustFx(X+rnd(-20,20),Y+rnd(-20,20),16*big,70*big,rnd(1.2,2),i%2?'#55555d':G.smoke,rnd(-40,40),rnd(-70,-20),.42);
 wscar({k:'scorch',x:X,y:Y,r:rnd(42,62),ttl:26});wpart({k:'ember',x:X,y:Y,vx:0,vy:0,s:34,grow:-70,l:.28,d:1,c:'#ffd38a'});
 w.mode='burn';w.bt=0;w.BT=G.steam?2.8:4.2;w.fire=fire;}
/* ─── actualización ─── */
/* ★ REBOTE DE PIEZAS — punto más cercano del borde de un obstáculo y su normal hacia fuera */
function edgeNear(s,x,y){const P=s.poly;let best=1e18,bx=x,by=y,inside=false;
 for(let i=0,j=P.length-1;i<P.length;j=i++){const xi=P[i][0],yi=P[i][1],xj=P[j][0],yj=P[j][1];
  if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  const dx=xj-xi,dy=yj-yi;let t=((x-xi)*dx+(y-yi)*dy)/(dx*dx+dy*dy||1);t=t<0?0:t>1?1:t;
  const ex=xi+dx*t,ey=yi+dy*t,d=(x-ex)*(x-ex)+(y-ey)*(y-ey);if(d<best){best=d;bx=ex;by=ey;}}
 let nx=x-bx,ny=y-by;const L=Math.hypot(nx,ny);
 if(L>1e-6){nx/=L;ny/=L;if(inside){nx=-nx;ny=-ny;}}else{nx=1;ny=0;}
 return{nx,ny,bx,by,inside};}
/* ★ REBOTE DE PIEZAS — si una pieza toca un obstáculo se saca fuera, rebota con pérdida de energía y, si pega fuerte, lo muerde un poco (cráter pequeño) */
function pieceBounce(c,dt){const r=c.type==='scrap'?4:8,s=World.hit(c.x,c.y,r);if(!s)return;
 const e=edgeNear(s,c.x,c.y);c.x=e.bx+e.nx*(r+1);c.y=e.by+e.ny*(r+1);
 const vn=c.vx*e.nx+c.vy*e.ny;if(vn>=0)return;
 const imp=-vn;c.vx-=1.55*vn*e.nx;c.vy-=1.55*vn*e.ny;c.vx*=.82;c.vy*=.82;c.vr=-c.vr*.6+rnd(-5,5);
 if(imp>70&&(c.bn||0)<=M.t){c.bn=M.t+.18;
  sparks(e.bx,e.by,3+Math.min(5,imp/60|0),'#ffd27a',140+imp*.4,.35);
  if(imp>120&&(c.dn||0)<3&&SCULPT.on&&!M.net){c.dn=(c.dn||0)+1;sculptAt(e.bx,e.by,clamp(r+3+imp*.02,8,13),SCULPT.bC0+Math.min(6,imp*.012));}
  if(imp>110)Snd.tone(rnd(200,320),.05,'triangle',.03,.6,'pcb');}}
function updWrecks(dt){const W=M.wrecks,q=WQ();WTR=0;
 if(W)for(let i=W.length-1;i>=0;i--){const w=W[i],p=w.p,G=WG[w.g]||WG.valle;w.t+=dt;
  if(w.mode==='fall'){
   const k=Math.max(0,1-.3*dt);w.vx*=k;w.vy*=k;w.x+=w.vx*dt;w.y+=w.vy*dt;w.ang+=w.av*dt;w.av*=1+.18*dt;
   const u=clamp(w.t/w.T,0,1);w.z=1-Math.pow(u,1.7);
   w.acc+=dt;const step=.026/Math.max(.3,q);while(w.acc>=step){w.acc-=step;const tx=w.x-Math.cos(w.ang)*16,ty=w.y-Math.sin(w.ang)*16;
    dustFx(tx,ty,4+u*4,14+u*22,rnd(1,1.7),Math.random()<.35?'#5a5a62':'#34343a',rnd(-16,16),rnd(-34,-8),.2+u*.1);
    if(Math.random()<.85)wpart({k:'ember',x:tx,y:ty,vx:rnd(-30,30),vy:rnd(-30,30),s:rnd(5,10)+u*5,grow:-10,l:rnd(.22,.4),d:1.2,c:Math.random()<.5?'#ffb040':'#ff6a22'});}
   w.acc2+=dt;if(w.acc2>.11){w.acc2=0;wpart({k:'spark',x:w.x,y:w.y,vx:rnd(-120,120)+w.vx*.2,vy:rnd(-120,120)+w.vy*.2,s:1.8,l:rnd(.25,.45),d:1.5,c:'#ffd27a'});}
   if(!w.tailLost&&!/choque/.test(w.kind)&&u>.4&&Math.random()<dt*3.5){w.tailLost=true;spawnPiece(w,'tail',1,(w.T-w.t)*.9,rnd(40,110),w.ang+Math.PI+rnd(-.7,.7));}
   if(w.t>.15&&w.z>.02&&World.hit(w.x,w.y,8))wreckImpact(w,true);else if(w.t>=w.T)wreckImpact(w,false);}
  else if(w.mode==='slide'){w.st+=dt;const u=clamp(w.st/w.D,0,1),v=w.sv*(1-u)*(1-u),dx=Math.cos(w.dir)*v*dt,dy=Math.sin(w.dir)*v*dt;w.x+=dx;w.y+=dy;w.av*=Math.max(0,1-3*dt);w.ang+=w.av*dt;
   const nx=w.dir+Math.PI/2,L=Math.hypot(dx,dy),n=Math.ceil(L/9*Math.max(.4,q));
   for(let j=0;j<n;j++){const px=w.x-dx*j/n,py=w.y-dy*j/n;
    if(Math.random()<.9)wpart({k:'chunk',x:px+rnd(-8,8),y:py+rnd(-8,8),vx:Math.cos(nx)*rnd(-190,190)-Math.cos(w.dir)*rnd(30,160),vy:Math.sin(nx)*rnd(-190,190)-Math.sin(w.dir)*rnd(30,160),s:rnd(2.5,7),l:rnd(.4,.9),d:2,c:pick(G.chunks),rot:rnd(0,TAU),vr:rnd(-14,14)});
    if(Math.random()<.55)dustFx(px+rnd(-10,10),py+rnd(-10,10),10,46,rnd(.9,1.6),Math.random()<.5?G.dust:G.dust2,Math.cos(nx)*rnd(-90,90),Math.sin(nx)*rnd(-90,90),.5);
    if(G.sparks&&Math.random()<.7)wpart({k:'spark',x:px,y:py,vx:-Math.cos(w.dir)*rnd(80,300)+rnd(-110,110),vy:-Math.sin(w.dir)*rnd(80,300)+rnd(-110,110),s:rnd(1.5,2.6),l:rnd(.2,.5),d:2.4,c:'#ffd27a'});
    if(Math.random()<.5)wpart({k:'ember',x:px,y:py,vx:rnd(-30,30),vy:rnd(-30,30),s:rnd(6,12),grow:-12,l:rnd(.25,.5),d:2,c:Math.random()<.5?'#ffb040':'#ff6a22'});}
   if(Math.hypot(w.x-w.lastP[0],w.y-w.lastP[1])>10){w.fur.pts.push([w.x,w.y]);w.lastP=[w.x,w.y];if(w.fur.pts.length>60)w.fur.pts.shift();}
   if(u>=.62||(w.st>.05&&World.hit(w.x,w.y,10)))disintegrate(w); /* ★ el avión que se arrastra no atraviesa rocas ni obstáculos: se desintegra contra ellos */}
  else if(w.mode==='sink'){WTR=1;w.sk+=dt;const u=clamp(w.sk/w.SK,0,1);const k=Math.exp(-1.8*dt);w.vx*=k;w.vy*=k;w.x+=w.vx*dt;w.y+=w.vy*dt;w.ang+=w.av*dt*.3;w.av*=Math.max(0,1-1.6*dt);
   if(w.wake>0){w.wake-=dt;const nx2=Math.cos(w.dir+Math.PI/2),ny3=Math.sin(w.dir+Math.PI/2);w.acc3=(w.acc3||0)+dt;while(w.acc3>.03){w.acc3-=.03;for(const sd of[-1,1]){const o=(8+(.9-w.wake)*70)*sd;wpart({k:'foam',x:w.x+nx2*o,y:w.y+ny3*o,vx:nx2*sd*30,vy:ny3*sd*30,s:rnd(4,8),grow:rnd(2,8),l:rnd(.8,1.5),d:1.4});}
     wpart({k:'foam',x:w.x+rnd(-8,8),y:w.y+rnd(-8,8),vx:rnd(-14,14),vy:rnd(-14,14),s:rnd(5,9),grow:3,l:rnd(.9,1.6),d:1.3});}}
   w.acc+=dt;if(w.acc>.42){w.acc=0;ringFx(w.x+rnd(-14,14),w.y+rnd(-14,14),8,80,1.1,2.5,'#e4f6fc',0,null,w.dir,1.2);}
   w.acc2+=dt;if(w.acc2>.07){w.acc2=0;wpart({k:'bub',x:w.x+rnd(-26,26),y:w.y+rnd(-20,20),vx:rnd(-10,10),vy:rnd(-12,4),s:rnd(2,6),l:rnd(.5,.9),d:.5,c:'#ffffff'});}
   if(u>=1){ringFx(w.x,w.y,6,120,1.1,3,'#ffffff',0,null,w.dir,1.2);for(let j=0;j<8;j++)wpart({k:'bub',x:w.x+rnd(-20,20),y:w.y+rnd(-20,20),vx:rnd(-20,20),vy:rnd(-20,20),s:rnd(3,8),l:rnd(.4,.8),d:.5,c:'#ffffff'});W.splice(i,1);}WTR=0;}
  else if(w.mode==='burn'){w.bt+=dt;const u=clamp(w.bt/w.BT,0,1);w.acc+=dt;
   if(w.acc>.07+u*.12){w.acc=0;dustFx(w.x+rnd(-22,22),w.y+rnd(-22,22),8+(1-u)*7,30+(1-u)*28,rnd(1.4,2.4),G.steam?'#e2e8ee':(Math.random()<.5?'#55555d':G.smoke),rnd(8,30),rnd(-64,-30),.3*(1-u*.5));
    if(Math.random()<(1-u)*.9*(G.fire||1))wpart({k:'ember',x:w.x+rnd(-26,26),y:w.y+rnd(-26,26),vx:rnd(-20,20),vy:rnd(-50,-10),s:rnd(6,14)*(1-u*.5),grow:-6,l:rnd(.3,.6),d:1.4,c:Math.random()<.5?'#ffb040':'#ff6a22'});}
   if(u>=1)W.splice(i,1);}
  /* la cámara sigue al avión derribado */
  if(p&&!p.alive){p.x=w.x;p.y=w.y;p.ang=w.dir;p.speed=w.mode==='fall'?Math.min(300,Math.hypot(w.vx,w.vy)):w.mode==='slide'?w.sv*(1-clamp(w.st/w.D,0,1))*.6:0;}}
 /* piezas sueltas */
 const P=M.wpc;if(P)for(let i=P.length-1;i>=0;i--){const c=P[i];c.age+=dt;
  if(!c.land){c.x+=c.vx*dt;c.y+=c.vy*dt;c.rot+=c.vr*dt;const k=Math.max(0,1-.5*dt);c.vx*=k;c.vy*=k;c.z=Math.max(0,1-c.age/Math.max(.05,c.fall));
   if(c.burn&&Math.random()<dt*22)wpart({k:'ember',x:c.x,y:c.y,vx:rnd(-20,20),vy:rnd(-20,20),s:rnd(4,8),grow:-8,l:rnd(.2,.35),d:1,c:'#ff8a2a'});
   if(c.burn&&Math.random()<dt*7)dustFx(c.x,c.y,6,22,rnd(.9,1.4),'#5a5a62',6,-22,.26);
   if(c.age>=c.fall){c.land=true;c.g=groundAt(c.x,c.y);const G=WG[c.g];
    if(c.g==='archi'){WTR=1;c.water=true;c.vx*=.15;c.vy*=.15;c.vr*=.2;ringFx(c.x,c.y,5,100,1,2.5,'#ffffff');for(let j=0;j<Math.round(8*q);j++){const a=rnd(0,TAU),v=rnd(40,170);wpart({k:'drop',x:c.x,y:c.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:rnd(2,4.5),l:rnd(.4,.8),d:2.2,c:'#e4f6fc'});}c.life=Math.min(c.life,rnd(3.5,6));WTR=0;}
    else{dustFx(c.x,c.y,12,48,.9,(G||WG.valle).dust,0,0,.5);for(let j=0;j<4;j++)wpart({k:'chunk',x:c.x,y:c.y,vx:rnd(-90,90),vy:rnd(-90,90),s:rnd(2,5),l:rnd(.4,.8),d:2,c:pick((G||WG.valle).chunks),rot:rnd(0,TAU),vr:rnd(-10,10)});c.vx*=.5;c.vy*=.5;c.vr*=.3;}}}
  else{const k=Math.exp((c.water?-1.6:-4.5)*dt);c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx*=k;c.vy*=k;c.rot+=c.vr*dt;c.vr*=k;
   if(c.burn&&!c.water&&c.age<c.life*.6&&Math.random()<dt*5)dustFx(c.x,c.y,5,16,rnd(.8,1.3),'#5a5a62',0,-16,.22);}
  pieceBounce(c,dt); /* ★ REBOTE: las piezas chocan con rocas y paredes en vez de atravesarlas */
  if(c.age>c.life)P.splice(i,1);}
 /* partículas propias */
 const A=M.wp;if(A)for(let i=A.length-1;i>=0;i--){const o=A[i];if(o.dl>0){o.dl-=dt;continue;}o.l-=dt;if(o.l<=0){A.splice(i,1);continue;}
  const d=o.d?Math.max(0,1-o.d*dt):1;o.vx*=d;o.vy*=d;o.x+=o.vx*dt;o.y+=o.vy*dt;if(o.grow)o.s=Math.max(.5,o.s+o.grow*dt);if(o.vr)o.rot+=o.vr*dt;}
 const S=M.scars;if(S)for(let i=S.length-1;i>=0;i--){S[i].t+=dt;if(S[i].t>S[i].ttl)S.splice(i,1);}}
/* ─── dibujo ─── */
/* ★ AGUA RECORTADA — los efectos de agua (ondas, espuma, chorros, mancha de aceite, halo) se dibujan en un lienzo aparte y se recortan con una
   máscara de AGUA (biomas 'archi' + lagos/ríos 'archi' − islas/tierra − obstáculos). Así nunca se pintan sobre césped, rocas ni edificios. */
let WFX=null,WMK=null;
function waterShapes(k,v){
 k.fillStyle=k.strokeStyle='#fff';k.lineCap=k.lineJoin='round';k.globalCompositeOperation='source-over';
 for(const b of World.biomes||[]){if(b.g!=='archi')continue;if(v&&(b.x>v.x1||b.x+b.w<v.x0||b.y>v.y1||b.y+b.h<v.y0))continue;
  if(!b._wp){try{b._wp=biomePoly(b,0).all;}catch(e){b._wp=[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]];}}
  wpoly(k,b._wp);k.fill();}
 for(const d of World.decor){if(d.t==='c'||!d.bb)continue;if(v&&(d.bb.x1<v.x0||d.bb.x0>v.x1||d.bb.y1<v.y0||d.bb.y0>v.y1))continue;
  const water=d.g==='archi';k.globalCompositeOperation=water?'source-over':'destination-out';
  if(d.t==='g'){wpoly(k,d.p);k.fill();}
  else if(d.t==='gl'){k.lineWidth=d.w*.88;k.beginPath();d.pts.forEach((q,i)=>i?k.lineTo(q[0],q[1]):k.moveTo(q[0],q[1]));k.stroke();}}
 k.globalCompositeOperation='destination-out';
 for(const s of World.solids){if(!s.bb||!s.poly)continue;if(v&&(s.bb.x1<v.x0||s.bb.x0>v.x1||s.bb.y1<v.y0||s.bb.y0>v.y1))continue;wpoly(k,s.poly);k.fill();}
 k.globalCompositeOperation='source-over';}
function withWaterClip(c,v,fn){
 const cv=c.canvas,W=cv.width,H=cv.height;if(!c.getTransform){fn(c);return;}
 if(!WFX||WFX.canvas.width!==W||WFX.canvas.height!==H){const a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=W;a.height=b.height=H;WFX=a.getContext('2d');WMK=b.getContext('2d');}
 const T=c.getTransform(),k=WMK,f=WFX;
 k.setTransform(1,0,0,1,0,0);k.globalCompositeOperation='source-over';k.clearRect(0,0,W,H);k.setTransform(T);waterShapes(k,v);
 f.setTransform(1,0,0,1,0,0);f.globalCompositeOperation='source-over';f.globalAlpha=1;f.clearRect(0,0,W,H);f.setTransform(T);
 fn(f);
 f.setTransform(1,0,0,1,0,0);f.globalAlpha=1;f.globalCompositeOperation='destination-in';f.drawImage(WMK.canvas,0,0);f.globalCompositeOperation='source-over';
 c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.drawImage(f.canvas,0,0);c.restore();}
function drawSlick(c,s){const f=clamp((s.ttl-s.t)/6,0,1),ex=Math.min(1,s.t/1.4),r=s.r*(.55+.45*ex);c.lineCap='round';c.lineJoin='round';c.globalAlpha=f*.3;c.fillStyle='#15303f';blobPath(c,s.x,s.y,r,s.seed,s.st,s.dir);c.fill();
 c.globalAlpha=f*.22;c.fillStyle='#2c5b78';blobPath(c,s.x+r*.08,s.y-r*.05,r*.68,s.seed+2,s.st,s.dir);c.fill();
 c.globalAlpha=f*.16;c.lineWidth=2.5;c.strokeStyle='#9d86d4';blobPath(c,s.x,s.y,r*.92,s.seed,s.st,s.dir);c.stroke();c.strokeStyle='#7ed3c4';blobPath(c,s.x,s.y,r*.8,s.seed+1,s.st,s.dir);c.stroke();c.globalAlpha=1;}
function wpoly(c,pts){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();}
function drawScars(c,v){const S=M.scars;if(!S||!S.length)return;let SL=null;c.save();c.lineCap='round';c.lineJoin='round';
 for(const s of S){const f=clamp((s.ttl-s.t)/6,0,1);
  if(s.k==='furrow'){const P=s.pts;if(P.length<2)continue;let ok=false;for(const q of P)if(q[0]>v.x0&&q[0]<v.x1&&q[1]>v.y0&&q[1]<v.y1){ok=true;break;}if(!ok)continue;
   const tr=()=>{c.beginPath();c.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);};
   if(s.skid){c.globalAlpha=f*.6;c.strokeStyle=s.col;for(const o of[-9,9]){c.beginPath();const a=Math.atan2(P[P.length-1][1]-P[0][1],P[P.length-1][0]-P[0][0]),nx=Math.cos(a+Math.PI/2)*o,ny=Math.sin(a+Math.PI/2)*o;c.moveTo(P[0][0]+nx,P[0][1]+ny);for(let i=1;i<P.length;i++)c.lineTo(P[i][0]+nx,P[i][1]+ny);c.lineWidth=5;c.stroke();}c.globalAlpha=f*.35;c.lineWidth=18;c.stroke();}
   else{tr();c.globalAlpha=f*.55;c.strokeStyle=s.edge;c.lineWidth=s.w+12;c.stroke();tr();c.globalAlpha=f*.9;c.strokeStyle=s.col;c.lineWidth=s.w;c.stroke();tr();c.globalAlpha=f*.35;c.strokeStyle='#000';c.lineWidth=s.w*.35;c.stroke();}}
  else if(s.k==='scorch'){if(s.x<v.x0-100||s.x>v.x1+100||s.y<v.y0-100||s.y>v.y1+100)continue;const g=c.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r);const glow=clamp(1-s.t/3,0,1);g.addColorStop(0,'rgba(24,18,12,'+.5*f+')');g.addColorStop(.6,'rgba(30,24,16,'+.3*f+')');g.addColorStop(1,'rgba(22,18,12,0)');c.globalAlpha=1;c.fillStyle=g;c.beginPath();c.arc(s.x,s.y,s.r,0,TAU);c.fill();
   if(glow>0){c.globalCompositeOperation='lighter';c.globalAlpha=glow*.55;const g2=c.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*.7);g2.addColorStop(0,'rgba(255,130,40,.8)');g2.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g2;c.beginPath();c.arc(s.x,s.y,s.r*.7,0,TAU);c.fill();c.globalCompositeOperation='source-over';}}
  else if(s.k==='slick'){if(s.x<v.x0-160||s.x>v.x1+160||s.y<v.y0-160||s.y>v.y1+160)continue;(SL||(SL=[])).push(s);}}
 c.restore();c.globalAlpha=1;
 if(SL)withWaterClip(c,v,f=>{for(const s of SL)drawSlick(f,s);}); /* ★ la mancha solo sobre el agua */}
function drawWrecks(c,v){const W=M.wrecks,P=M.wpc,A=M.wp;
 /* piezas */
 if(P)for(const o of P){if(o.x<v.x0||o.x>v.x1||o.y<v.y0||o.y>v.y1)continue;const fade=clamp((o.life-o.age)/2.2,0,1),wk=o.water?clamp(1-(o.age-o.fall)/Math.max(.5,o.life-o.fall)*1.1,0,1):1,al=Math.min(fade,wk);
  const sc=.7+.3*o.z;c.save();c.translate(o.x,o.y);c.rotate(o.rot);c.scale(o.side<0&&o.type==='wing'?1:1,o.side<0&&o.type==='wing'?-1:1);
  c.save();c.translate(3+o.z*14,5+o.z*20);c.scale(sc,sc);c.globalAlpha=al*.22;c.fillStyle='#10161c';wpoly(c,o.poly);c.fill();c.restore();
  c.scale(sc,sc);c.globalAlpha=al;c.fillStyle=o.P;c.strokeStyle='rgba(20,22,28,.85)';c.lineWidth=1.6;c.lineJoin='round';wpoly(c,o.poly);c.fill();c.stroke();
  if(o.type!=='scrap'){c.fillStyle='rgba(0,0,0,.28)';c.globalAlpha=al*.5;wpoly(c,o.poly.map(q=>[q[0]*.78,q[1]*.6]));c.fill();}
  if(o.land&&!o.water&&o.burn&&o.age<o.life*.65){c.globalCompositeOperation='lighter';c.globalAlpha=al*(.25+.15*Math.sin(M.t*20+o.fl));c.fillStyle='#ff7a22';c.beginPath();c.arc(0,0,9,0,TAU);c.fill();}
  c.restore();}
 /* aviones en caída / arrastre / hundiéndose */
 if(W)for(const w of W){if(w.mode==='burn')continue;if(w.x<v.x0-200||w.x>v.x1+200||w.y<v.y0-200||w.y>v.y1+200)continue;
  const def=w.def,lk=w.lk;let sc=.7+.3*w.z,al=1,roll=Math.abs(Math.cos(w.t*Math.min(8,Math.abs(w.av)*1.2))),ox=0,oy=0;
  if(w.mode==='slide'){roll=1;sc=.7;ox=rnd(-1.6,1.6);oy=rnd(-1.6,1.6);}
  if(w.mode==='sink'){const u=clamp(w.sk/w.SK,0,1);sc=.7*(1-.38*u);al=1-u*u;roll=1-.4*u;}
  drawPlane(c,def,lk,{x:w.x+4+w.z*16+ox,y:w.y+6+w.z*24+oy,ang:w.ang,roll,alpha:Math.min(.6,al),shadow:true,scale:sc});
  drawPlane(c,def,lk,{x:w.x+ox,y:w.y+oy,ang:w.ang,roll,alpha:al,flame:0,t:M.t+w.seed,scale:sc});
  if(w.mode!=='sink'){const fl=.55+.45*Math.sin(M.t*26+w.seed),r=44*sc;c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(w.x,w.y,0,w.x,w.y,r);g.addColorStop(0,'rgba(255,170,60,'+.55*fl+')');g.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g;c.beginPath();c.arc(w.x,w.y,r,0,TAU);c.fill();c.restore();}}
 /* partículas */
 if(A){const pass=(c,wt)=>{c.save();for(const o of A){if(o.dl>0||!!o.wt!==wt)continue;if(o.x<v.x0-60||o.x>v.x1+60||o.y<v.y0-60||o.y>v.y1+60)continue;const q=1-o.l/o.m,a=1-q;
  if(o.k==='dust'||o.k==='foam'){const[r,g,b]=hexRGB(o.k==='foam'?'#f4fcff':o.c),al=(o.k==='foam'?.4:(o.al||.5))*a*Math.min(1,q*6+.25),R=Math.max(1,o.s),gr=c.createRadialGradient(o.x-R*.15,o.y-R*.15,R*.08,o.x,o.y,R);gr.addColorStop(0,'rgba('+r+','+g+','+b+','+al+')');gr.addColorStop(.55,'rgba('+r+','+g+','+b+','+al*.7+')');gr.addColorStop(1,'rgba('+r+','+g+','+b+',0)');c.globalAlpha=1;c.fillStyle=gr;c.beginPath();c.arc(o.x,o.y,R,0,TAU);c.fill();}
  else if(o.k==='chunk'){c.save();c.translate(o.x,o.y);c.rotate(o.rot);c.globalAlpha=Math.min(1,a*2.2);c.fillStyle=o.c;c.fillRect(-o.s/2,-o.s*.35,o.s,o.s*.7);c.restore();}
  else if(o.k==='drop'){const h=Math.sin(Math.PI*Math.min(1,q))*.7+.45,R=o.s*h;c.globalAlpha=Math.min(1,a*1.8);c.fillStyle=o.c;c.beginPath();c.arc(o.x,o.y,R,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.arc(o.x-R*.3,o.y-R*.3,R*.38,0,TAU);c.fill();}
  else if(o.k==='wring'){const ca=Math.cos(o.dir),sa=Math.sin(o.dir);c.globalAlpha=a*.85;c.strokeStyle=o.c;c.lineCap='round';c.lineWidth=Math.max(.6,o.lw*a);let pen=false;c.beginPath();
   for(let i=0;i<=44;i++){const t=i/44*TAU,gap=Math.sin(2*t+o.seed*3)+.6*Math.sin(5*t+o.seed);if(gap<-.55){pen=false;continue;}const r=o.s*(1+.1*Math.sin(3*t+o.seed)+.07*Math.sin(5*t+o.seed*1.7)),lx=Math.cos(t)*r*o.st,ly=Math.sin(t)*r*.8,px=o.x+lx*ca-ly*sa,py=o.y+lx*sa+ly*ca;if(!pen){c.moveTo(px,py);pen=true;}else c.lineTo(px,py);}
   c.stroke();}
  else if(o.k==='jet'){const L=Math.hypot(o.vx,o.vy)*.05;c.globalAlpha=Math.min(1,a*1.6)*.9;c.strokeStyle=o.c;c.lineCap='round';c.lineWidth=Math.max(.8,o.s*(.4+a*.6));c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.x-o.vx*.05,o.y-o.vy*.05);c.stroke();}
  else if(o.k==='ring'){c.globalAlpha=a*.85;c.strokeStyle=o.c;c.lineWidth=Math.max(.6,o.lw*a);c.beginPath();c.ellipse(o.x,o.y,o.s,o.s*.72,0,0,TAU);if(o.fill){c.save();c.globalAlpha=a*a*.3;c.fillStyle=o.fill;c.fill();c.restore();}c.stroke();}
  else if(o.k==='bub'){const R=Math.max(1,o.s*.5*(.8+q*.5));c.globalAlpha=a*.7;c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(o.x,o.y,R,0,TAU);c.fill();c.globalAlpha=a;c.fillStyle='#ffffff';c.beginPath();c.arc(o.x-R*.3,o.y-R*.3,R*.35,0,TAU);c.fill();}
  else if(o.k==='ember'){c.globalCompositeOperation='lighter';c.globalAlpha=a*.9;c.fillStyle=o.c;c.beginPath();c.arc(o.x,o.y,o.s*(.5+.5*a),0,TAU);c.fill();c.globalAlpha=a*.6;c.fillStyle='#fff7d0';c.beginPath();c.arc(o.x,o.y,o.s*.32*a,0,TAU);c.fill();c.globalCompositeOperation='source-over';}
  else if(o.k==='spark'){c.globalCompositeOperation='lighter';c.globalAlpha=a;c.strokeStyle=o.c;c.lineWidth=o.s;c.lineCap='round';c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.x-o.vx*.05,o.y-o.vy*.05);c.stroke();c.globalCompositeOperation='source-over';}}
  c.restore();};
  pass(c,false);
  const sk=W&&W.filter(w=>w.mode==='sink');
  if(A.some(o=>o.wt)||(sk&&sk.length))withWaterClip(c,v,f=>{ /* ★ todo lo de agua, recortado al agua */
   if(sk)for(const w of sk){const u=clamp(w.sk/w.SK,0,1);f.globalAlpha=.28+.3*u;f.fillStyle='#1f5b78';blobPath(f,w.x,w.y,40*(1+u*.2),w.seed2||0,1.35,w.dir);f.fill();f.globalAlpha=1;}
   pass(f,true);});}
 c.globalAlpha=1;}

function kill(v,att,kind){v.alive=false;v.deaths++;v.respawn=3.2;modeKill(v);v.aliveT=0;v.in.fire=false;if(Math.random()<.4)M.picks.push({x:v.x,y:v.y,k:pickKind(),t:0,exp:M.t+25});
 if(!att&&v.lastHit&&M.t-v.lastHitT<4)att=v.lastHit;if(att===v)att=null;if(M.mode==='team'&&att&&att.team!==undefined&&att.team!==v.team)M.ts[att.team]++;
 const fxId=att?att.look.fx:v.look.fx;explosion(v.x,v.y,kind==='choque'?1.5:1.05,att&&att.isPlayer?fxId:'clasico');spawnWreck(v,kind);
 M.feed.push({t:M.t,a:att?att.name:null,v:v.name,k:kind||'',ap:att&&att.isPlayer,vp:v.isPlayer});if(M.feed.length>6)M.feed.shift();
 if(att){if(att.alive){att.hp=Math.min(att.maxHp,att.hp+att.maxHp*.12);att.energy=Math.min(100,att.energy+25);}att.kills++;att.st.kills++;att.streak++;att.bestStreak=Math.max(att.bestStreak,att.streak);att.st.bestStreak=att.bestStreak;if(M.mode==='ffa'||M.mode==='team')att.score+=100;att.st.coins+=Math.min(att.streak-1,5)*5;
  if(att.isPlayer){popupFor(att,(M.mode==='ffa'||M.mode==='team')?'KILL +100':'KILL +25 ¤','#ff7a2f');Snd.tone(520,.12,'square',.05,1.6);if(att.streak>=3){att.st.coins+=att.streak*6;popupFor(att,'RACHA x'+att.streak,'#ffc83d');}}
  for(const id in v.dmgBy){const r=v.dmgBy[id],A=M.byId[id];if(!A||A===att||A===v)continue;if(r.a>=Math.max(15,v.maxHp*.2)&&M.t-r.t<7){A.assists++;A.st.assists++;A.st.coins+=10;if(A.isPlayer)popupFor(A,'ASISTENCIA +10 ¤','#9be7ff');}}}
 v.streak=0;v.dmgBy={};if(v.isPlayer){M.deathBy=v.deathBy=att?att.name:(kind||'el terreno');}}
/* ═══════════════════════════════════════════════════════════════════════════
   ★★★ ESCULPIR OBSTÁCULOS ★★★  (balas y misiles excavan cráteres; los obstáculos NO tienen barra de vida)
   Marcas para buscar con Ctrl+F:
     ★ ESCULPIR #1  Configuración (tabla SCULPT)
     ★ ESCULPIR #2  Datos del borde y su preparación            (sculptInit)
     ★ ESCULPIR #3  Excavar un cráter                           (sculptRefine / sculptHit / sculptAt)
     ★ ESCULPIR #4  Enganches: bala, misil/cohete, bomba y choque de avión (sculptBullet / sculptBlast / sculptCrash + updShots / updPlane)
     ★ ESCULPIR #5  Borde del cráter en las cajas                (drawCrateTop; el resto de obstáculos no lleva ninguna marca extra)

   IDEA GENERAL. Cada obstáculo sigue siendo un polígono (s.poly) y TODO el juego lo lee de ahí: la colisión de aviones,
   balas y misiles, la IA de los bots, el dibujo, las sombras y el minimapa. Por eso, para "esculpir" basta con cambiar
   s.poly: no hay que tocar nada más. La forma se deforma así:
     · Se guarda el borde ORIGINAL (puntos p0) y, para cada punto, la dirección "hacia dentro" (normal n).
     · Cada punto tiene una PROFUNDIDAD d: el borde actual está en p0 + n·d. Excavar = aumentar d.
     · Como cada punto solo se mueve a lo largo de su normal, el contorno nunca se cruza consigo mismo.

   RESISTENCIA (por qué el spam no lo destruye todo, sin usar una "salud" global):
     1) Núcleo intacto: cada punto tiene una profundidad máxima m = maxFrac × grosor local del obstáculo (36 %).
        Por muy fuerte que se dispare, queda siempre un núcleo central sin tocar, así que nunca desaparece ni se atraviesa.
     2) Rendimientos decrecientes: lo que excava un impacto se multiplica por (1 − d/m). Cuanto más profundo ya está
        un punto, más duro es seguir excavando allí, y disparar mil veces al mismo sitio satura en vez de perforar.
     3) Tope por impacto: un impacto nunca arranca más de 'cap' píxeles de profundidad (las balas rascan, los misiles muerden).
     4) Validación: si un impacto hiciera que el contorno se cruzara consigo mismo (algo que rompería las colisiones), ese
        impacto se descarta entero: en ese punto el obstáculo ya no puede excavarse más.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ★ ESCULPIR #1 — configuración. Todos los números de equilibrio están aquí. */
const SCULPT={
 on:true,         /* interruptor general: false = los obstáculos vuelven a ser indestructibles */
 kinds:{          /* tipos de obstáculo que se pueden esculpir y su BLANDURA (mayor = se excava más fácil). Rotores y deslizadores (móviles) nunca. */
  crate:1.35,     /* caja de madera: la más blanda */
  bld:1,          /* edificio */
  wall:.9,        /* muro */
  rock:.85,       /* roca */
  mesa:.8,        /* meseta */
  spire:.8        /* aguja de roca: la más dura */
 },
 maxFrac:.36,     /* profundidad máxima = 36 % del grosor local → desde los dos lados siempre sobra ≥ 28 % de núcleo */
 slope:2.2,       /* ángulo de reposo: diferencia máxima de profundidad entre puntos vecinos por píxel de borde (≈ 65°); suaviza las paredes del cráter */
 maxVerts:520,    /* tope de puntos por obstáculo: acota el coste de las colisiones aunque se dispare muchísimo */
 minSeg:2.2,      /* longitud mínima de un tramo de borde al subdividir (px) */
 bR0:7, bRk:.9,   /* radio del cráter de una bala = 7 + 0,9 × daño (limitado a 9…22 px): una ráfaga abre huecos bien visibles */
 bC0:2.5, bCk:.35,/* excavación máxima de una bala = 2,5 + 0,35 × daño px por impacto (antes de la blandura y la dureza acumulada) */
 blastR:.6,       /* radio del cráter de una explosión = 60 % de su radio (misil 80 → 48 px, cohete 55 → 33 px, bomba 140 → 84 px) */
 blastCap:.5      /* excavación máxima de una explosión = 50 % de su radio (misil ≈ 40 px, bomba ≈ 70 px por impacto, × blandura del material) */
};

/* Un obstáculo es esculpible si no es móvil (los móviles tienen upd()) y su tipo figura en SCULPT.kinds. */
function sculptable(s){return !s.upd&&SCULPT.kinds[s.kind]!==undefined;}

/* ★ ESCULPIR #2 — sculptInit(s): prepara un obstáculo para ser esculpido (se hace una sola vez, en el primer impacto).
   Crea s.sc = { V, soft }, donde V es la lista de puntos del borde. Cada punto es:
     x,y  = posición ORIGINAL en el borde sin dañar
     nx,ny= normal unitaria apuntando HACIA DENTRO del obstáculo
     d    = profundidad excavada actual (0 = sin tocar)
     m    = profundidad máxima permitida (el núcleo intacto)                                                         */
function sculptInit(s){
 const P=s.poly,n=P.length;
 /* 1) ¿Hacia qué lado es "dentro"? Se prueba con el tramo más largo: se avanza 1,5 px por una normal candidata y se
       comprueba con distPoly si el punto cae dentro. 'sg' = +1 si la candidata era la buena, −1 si hay que invertirla. */
 let be=0,bl=-1;
 for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l>bl){bl=l;be=i;}}
 const A=P[be],B=P[(be+1)%n],L=bl||1,tx=-(B[1]-A[1])/L,ty=(B[0]-A[0])/L;
 const sg=distPoly((A[0]+B[0])/2+tx*1.5,(A[1]+B[1])/2+ty*1.5,P)[0]?1:-1;
 /* 2) Normal hacia dentro de cada tramo e (de P[e] a P[e+1]). */
 const EN=P.map((a,e)=>{const b=P[(e+1)%n],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return[sg*-(b[1]-a[1])/l,sg*(b[0]-a[0])/l];});
 /* 3) rayT: distancia desde (ox,oy) en la dirección (dx,dy) hasta el primer tramo del polígono original que se cruza
       (ignorando los dos tramos que tocan el vértice de salida). Mide el GROSOR del obstáculo en esa dirección. */
 const rayT=(ox,oy,dx,dy,sa,sb)=>{let best=1e9;
  for(let e=0;e<n;e++){if(e===sa||e===sb)continue;
   const a=P[e],b=P[(e+1)%n],ex=b[0]-a[0],ey=b[1]-a[1],den=dx*ey-dy*ex;if(Math.abs(den)<1e-9)continue;
   const t=((a[0]-ox)*ey-(a[1]-oy)*ex)/den,u=((a[0]-ox)*dy-(a[1]-oy)*dx)/den;
   if(t>1e-3&&u>=0&&u<=1&&t<best)best=t;}
  return best<1e9?best:200;};
 /* 4) Un punto por vértice: normal = media de las normales de sus dos tramos; profundidad máxima = maxFrac × el menor
       grosor medido (por la normal del punto y por las de sus dos tramos, para que las esquinas no se coman en diagonal). */
 const V=P.map((p,i)=>{
  const e0=(i+n-1)%n,e1=i,n0=EN[e0],n1=EN[e1];let nx=n0[0]+n1[0],ny=n0[1]+n1[1];const nl=Math.hypot(nx,ny);
  if(nl<1e-6){nx=n1[0];ny=n1[1];}else{nx/=nl;ny/=nl;}
  const T=Math.min(rayT(p[0]+nx*.5,p[1]+ny*.5,nx,ny,e0,e1),rayT(p[0]+n0[0]*.5,p[1]+n0[1]*.5,n0[0],n0[1],e0,e1),rayT(p[0]+n1[0]*.5,p[1]+n1[1]*.5,n1[0],n1[1],e0,e1));
  return{x:p[0],y:p[1],nx,ny,d:0,m:SCULPT.maxFrac*T};});
 s.sc={V,soft:SCULPT.kinds[s.kind]};}

/* ★ ESCULPIR #3 — sculptRefine(V,qx,qy,R,hmax): subdivide los tramos del borde que están cerca del impacto (a menos de R),
   hasta que ninguno mida más de hmax. Por qué: un cráter de 8 px no se puede dibujar sobre un lado de 300 px que solo tiene
   dos puntos. Solo se subdivide donde hace falta (el resto del obstáculo sigue con pocos puntos, así las colisiones siguen
   siendo baratas). El punto nuevo hereda la media de la profundidad y del máximo de sus vecinos: la forma NO cambia al subdividir. */
function sculptRefine(V,qx,qy,R,hmax){
 for(let i=0,guard=0;i<V.length&&V.length<SCULPT.maxVerts&&guard<4000;guard++){
  const a=V[i],b=V[(i+1)%V.length];
  const ax=a.x+a.nx*a.d,ay=a.y+a.ny*a.d,bx=b.x+b.nx*b.d,by=b.y+b.ny*b.d;     /* posiciones ACTUALES de los dos extremos */
  if(Math.hypot(bx-ax,by-ay)>hmax&&Math.sqrt(segD2(ax,ay,bx,by,qx,qy))<R+2){ /* tramo largo y cercano al impacto → partirlo */
   let nx=a.nx+b.nx,ny=a.ny+b.ny;const nl=Math.hypot(nx,ny);if(nl<1e-6){nx=a.nx;ny=a.ny;}else{nx/=nl;ny/=nl;}
   V.splice(i+1,0,{x:(a.x+b.x)/2,y:(a.y+b.y)/2,nx,ny,d:(a.d+b.d)/2,m:(a.m+b.m)/2});  /* no se avanza: se vuelve a mirar el tramo, ya más corto */
  }else i++;}}

/* ★ ESCULPIR #3 — sculptHit(s,qx,qy,R,cap): excava en el obstáculo 's' un cráter circular de radio R centrado en (qx,qy),
   con una excavación máxima de 'cap' px. Devuelve true si la forma cambió.
   Cómo calcula el cráter: para cada punto del borde pregunta "¿está dentro del círculo?". Si lo está, se calcula cuánto
   hay que hundirlo (a lo largo de su normal) para salir del círculo: eso da un cráter redondo. Después se aplican la
   resistencia (cap, dureza acumulada, profundidad máxima) y el ángulo de reposo. */
function sculptHit(s,qx,qy,R,cap){
 const bb=s.bb;if(qx<bb.x0-R||qx>bb.x1+R||qy<bb.y0-R||qy>bb.y1+R)return false;   /* descarte rápido: lejos del obstáculo */
 const dp=distPoly(qx,qy,s.poly);if(!dp[0]&&dp[1]>R)return false;                  /* el círculo no llega a tocarlo */
 if(!s.sc)sculptInit(s);
 const V=s.sc.V;
 sculptRefine(V,qx,qy,R,Math.max(SCULPT.minSeg,R/3.5));
 const n=V.length,want=new Array(n).fill(0),old=V.map(v=>v.d);let maxW=0;   /* 'old' = profundidades previas, para poder deshacer el impacto si no es válido */
 /* a) Excavación deseada por punto: intersección de su rayo (p0 + t·n) con el círculo. El punto está dentro del círculo
       si su profundidad actual d cae entre la entrada (t1) y la salida (t2); para salir hay que llegar a t2. */
 for(let i=0;i<n;i++){const v=V[i],wx=v.x-qx,wy=v.y-qy,bq=wx*v.nx+wy*v.ny,disc=bq*bq-(wx*wx+wy*wy-R*R);
  if(disc<=0)continue;const sq=Math.sqrt(disc),t1=-bq-sq,t2=-bq+sq;
  if(v.d>=t1&&v.d<t2){const dd=t2-v.d;if(dd>0){want[i]=dd;if(dd>maxW)maxW=dd;}}}
 if(maxW<.05)return false;
 /* b) Resistencia. 'k' reduce TODO el cráter por igual para que su profundidad máxima no pase de cap×blandura
       (así conserva su forma redonda pero más somera). Además, cada punto se multiplica por (1−d/m): la dureza crece
       linealmente conforme se acerca a su profundidad máxima m. */
 const k=Math.min(1,cap*s.sc.soft/maxW);let changed=false;
 for(let i=0;i<n;i++){if(want[i]<=0)continue;const v=V[i],h=Math.max(0,1-v.d/v.m),nd=Math.min(v.m,v.d+want[i]*k*h);
  if(nd>v.d+1e-3){v.d=nd;changed=true;}}
 if(!changed)return false;
 /* c) Ángulo de reposo: un punto no puede estar mucho más hundido que su vecino (diferencia máx. slope × distancia).
       Se recorre la lista dos veces, hacia delante y hacia atrás, ensanchando las paredes de los pozos estrechos.
       Siempre se respeta la profundidad máxima m. */
 const S=SCULPT.slope,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 for(let k2=0;k2<2*n;k2++){const i=k2%n,j=(i+n-1)%n,lim=V[j].d-S*dist(V[j],V[i]);if(V[i].d<lim)V[i].d=Math.min(V[i].m,lim);}
 for(let k2=2*n;k2>0;k2--){const i=k2%n,j=(i+1)%n,lim=V[j].d-S*dist(V[j],V[i]);if(V[i].d<lim)V[i].d=Math.min(V[i].m,lim);}
 /* d) Validación: se comprueba que NINGÚN tramo que ha cambiado cruce a otro tramo del contorno. Un contorno cruzado rompería
       la colisión (huecos o zonas "al revés"), así que si ocurre se deshace todo el impacto y se devuelve false (sin restos
       ni polvo). Solo se miran los puntos modificados (c·n comparaciones), no todos contra todos. */
 const Q=V.map(v=>[v.x+v.nx*v.d,v.y+v.ny*v.d]),crosses=(ax,ay,bx,by,cx,cy,dx,dy)=>{
  const o=(px,py,qx,qy,rx,ry)=>(ry-py)*(qx-px)-(qy-py)*(rx-px);
  return o(ax,ay,cx,cy,dx,dy)*o(bx,by,cx,cy,dx,dy)<0&&o(ax,ay,bx,by,cx,cy)*o(ax,ay,bx,by,dx,dy)<0;};
 for(let i=0;i<n;i++){if(V[i].d===old[i])continue;
  for(const e of[(i+n-1)%n,i]){const a=Q[e],b=Q[(e+1)%n];                       /* los dos tramos que tocan el punto modificado */
   for(let j=0;j<n;j++){if(j===e||j===(e+1)%n||(j+1)%n===e)continue;             /* se saltan el propio tramo y sus vecinos directos */
    const c2=Q[j],d2=Q[(j+1)%n];
    if(crosses(a[0],a[1],b[0],b[1],c2[0],c2[1],d2[0],d2[1])){for(let q=0;q<n;q++)V[q].d=old[q];return false;}}}}
 /* e) Se reconstruye el polígono real con las nuevas profundidades. Al ser una lista NUEVA, todo el que lea s.poly la ve
       al instante. s.bb NO se toca a propósito: el obstáculo solo se encoge, así que la caja original sigue conteniéndolo
       (los descartes rápidos siguen siendo válidos) y las texturas ancladas a ella (p. ej. la tapa de la caja) no se mueven. */
 s.poly=Q;
 return true;}

/* ★ ESCULPIR #3 — sculptAt(x,y,R,cap): excava en TODOS los obstáculos esculpibles que toque el círculo (x,y,R) y suelta
   restos (chispas + una nubecilla de polvo del color del material) si algo cambió. Devuelve true si hubo cambio. */
function sculptAt(x,y,R,cap){
 let any=false;
 for(const s of World.solids){if(!sculptable(s))continue;
  if(sculptHit(s,x,y,R,cap)){any=true;
   const pal=(World.def.pal&&World.def.pal[s.kind])||SOLIDP[s.kind],col=pal?pal[0][1]:'#bdb4a4';
   sparks(x,y,4+Math.round(R/4),col,120+R*4,.7);                                                  /* trocitos que saltan (más cuantos más grande el cráter) */
   for(let i=0;i<2;i++)emit({x,y,vx:rnd(-40,40),vy:rnd(-40,40),l:.8,m:.8,s:R*.5,c:col,g:-6,d:2,k:'c',grow:R*1.4}); /* polvo que se expande */
  }}
 return any;}

/* impactPoint(px,py,x,y,r): punto exacto donde un proyectil que fue de (px,py) a (x,y) entró en un obstáculo.
   Por qué: en un fotograma una bala avanza ~25 px (más si hay lag) y puede quedar bien dentro del obstáculo, o incluso
   haberlo atravesado entero; si el cráter se centrara en (x,y) saldría en el sitio equivocado.
   Cómo: se recorre el trayecto en pasos de ~6 px hasta el primer punto que ya toca (World.hit con radio r) y entonces se
   afina por bisección dentro de ese último paso. Si ningún punto toca, devuelve el final del trayecto. */
function impactPoint(px,py,x,y,r){
 if(px===undefined)return[x,y];
 const len=Math.hypot(x-px,y-py),steps=Math.max(1,Math.ceil(len/6));
 for(let k=1;k<=steps;k++){
  if(!World.hit(px+(x-px)*k/steps,py+(y-py)*k/steps,r))continue;       /* este paso aún no toca nada */
  let lo=(k-1)/steps,hi=k/steps;                                        /* el choque está entre lo (libre) y hi (toca) */
  for(let i=0;i<5;i++){const mid=(lo+hi)/2;if(World.hit(px+(x-px)*mid,py+(y-py)*mid,r))hi=mid;else lo=mid;}
  return[px+(x-px)*hi,py+(y-py)*hi];}
 return[x,y];}

/* ★ ESCULPIR #4 — sculptBullet(b): una bala acaba de chocar con un obstáculo. Cráter pequeño que crece con el daño de la bala
   (una ametralladora raspa, un cañón muerde). Se ignora en online (M.net): cada cliente simula sus propios proyectiles y
   los mapas se desincronizarían (unos verían un cráter donde otros ven pared). */
function sculptBullet(b){
 if(!SCULPT.on||M.net||b.air)return;
 const dmg=clamp(b.dmg||6,3,30),ip=impactPoint(b.px,b.py,b.x,b.y,2);
 sculptAt(ip[0],ip[1],clamp(SCULPT.bR0+dmg*SCULPT.bRk,9,22),SCULPT.bC0+dmg*SCULPT.bCk);}
/* ★ ESCULPIR #4 — sculptBlast(x,y,r,px,py,hitR): un misil, cohete o bomba de radio de explosión r detona en (x,y).
   Si venía de (px,py) y chocó con un obstáculo (radio de choque hitR), el cráter se centra en el punto de entrada real;
   si estalló en el aire cerca de un obstáculo, se centra donde estalló (y solo muerde si queda dentro del círculo). */
function sculptBlast(x,y,r,px,py,hitR){
 if(!SCULPT.on||M.net)return;
 if(px!==undefined&&World.hit(x,y,hitR)){const ip=impactPoint(px,py,x,y,hitR);x=ip[0];y=ip[1];}
 sculptAt(x,y,r*SCULPT.blastR,r*SCULPT.blastCap);}

/* ★ ESCULPIR #4 — sculptCrash(p,ox,oy): un avión acaba de estrellarse contra un obstáculo (kill 'choque') viniendo de (ox,oy).
   Cráter de tamaño proporcional al avión (radio = 60 % de su longitud, entre 32 y 60 px: un Leviatán abre un hueco mucho
   mayor que un Colibrí) y de fuerza proporcional a su velocidad de impacto (×0,6 si iba lento … ×1,6 si iba muy rápido).
   Se centra donde el avión tocó el obstáculo (radio de choque 11, el mismo que usa updPlane). Como el resto, no se aplica en online. */
function sculptCrash(p,ox,oy){
 if(!SCULPT.on||M.net)return;
 const R=clamp(p.def.shape.len*.6,32,60),v=clamp(p.speed/(p.eff.cruise||1),.6,1.6),ip=impactPoint(ox,oy,p.x,p.y,11);
 sculptAt(ip[0],ip[1],R,R*.9*v);}


function blast(x,y,r,dmg,o,kind){for(const t of World.turrets){if(!t.alive)continue;const d=Math.hypot(t.x-x,t.y-y);if(d<r+30){t.hp-=dmg*(1-.5*d/(r+30));if(t.hp<=0)destroyTurret(t,o);}}
 for(const v of M.planes){if(!v.alive)continue;const d=Math.hypot(v.x-x,v.y-y);if(d<r+14){damage(v,dmg*(1-.6*d/(r+14))*(v===o?.4:1),o,kind);}}}
function pickKind(){const r=Math.random();return r<.3?'rep':r<.5?'mun':r<.67?'esc':r<.84?'dmg':'nrg';}
function pickupSpawn(){const pt=airSpot(180);M.picks.push({x:pt[0],y:pt[1],k:pickKind(),t:0});}
function applyPick(v,k){const kk=k.k,col={rep:'#5bd67d',mun:'#3fd0c9',esc:'#9be7ff',dmg:'#ff6a4d',nrg:'#ffe27a'}[kk],nm={rep:'REPARACIÓN',mun:({misil:'MISILES',cohetes:'COHETES',bomba:'BOMBAS'}[v.def.sec.t]||'MISILES')+(v.def.sec.n-v.secAmmo>0?' +'+(v.def.sec.n-v.secAmmo):''),esc:'ESCUDO',dmg:'DAÑO x2',nrg:'ENERGÍA INFINITA'}[kk];
 if(kk==='rep')v.hp=Math.min(v.maxHp,v.hp+v.maxHp*.45);else if(kk==='mun'){v.secAmmo=v.def.sec.n;v.energy=Math.min(100,v.energy+30);} /* ★ MEJORA: la munición ya no rellena toda la energía */else if(kk==='esc')v.shield=Math.max(v.shield,5);else if(kk==='dmg')v.dmgT=8;else v.nrgT=8;
 sparks(k.x,k.y,12,col,240,.6);if(v.isPlayer){Snd.tone(780,.12,'triangle',.05,1.5);popupFor(v,nm,col);}}
const TUR={id:'tur',name:'Torreta',isPlayer:false,dmgBy:{},look:{fx:'clasico'},kills:0,assists:0,streak:0,bestStreak:0,score:0,st:{kills:0,bestStreak:0,coins:0,assists:0},alive:true};
function destroyTurret(t,att){t.alive=false;t.rs=28;explosion(t.x,t.y,1.4,'clasico');if(att&&att!==TUR&&att.st){if(att.isPlayer||att.remote){att.st.coins+=12;if(att.isPlayer)popupFor(att,'TORRETA +12 ¤','#ffb040');}}}
function updTurrets(dt){for(const t of World.turrets){if(!t.alive){t.rs-=dt;if(t.rs<=0){t.alive=true;t.hp=t.max;}continue;}
 let best=null,bd=(800*AMPLIO.turretK)**2 /* ★ AMPLIO #11 */;for(const q of M.planes){if(!q.alive)continue;const dx=q.x-t.x,dy=q.y-t.y,d=dx*dx+dy*dy;if(d<bd&&(q.cloak<=0||d<400*400)){bd=d;best=q;}}
 t.tg=best;if(!best){t.ang+=dt*.6;continue;}
 const dist=Math.sqrt(bd),tt=dist/(560*AMPLIO.turretK),lx=best.x+Math.cos(best.ang)*best.speed*tt,ly=best.y+Math.sin(best.ang)*best.speed*tt,want=Math.atan2(ly-t.y,lx-t.x);
 t.ang+=clamp(angDiff(t.ang,want),-3*dt,3*dt);t.cd-=dt;
 if(t.cd<=0&&Math.abs(angDiff(t.ang,want))<.12){t.cd=1.15;for(const o of[-.05,.05]){const a=t.ang+o,x=t.x+Math.cos(a)*34,y=t.y+Math.sin(a)*34;M.bul.push({x,y,px:x,py:y,vx:Math.cos(a)*560*AMPLIO.turretK,vy:Math.sin(a)*560*AMPLIO.turretK,l:1.7,dmg:9,o:TUR,col:'#ff5a5a',w:3,dv:0,air:true});}if(near({x:t.x,y:t.y,isPlayer:false}))Snd.tone(200,.06,'square',.02,.6,'tur');}}}

function updPlane(p,dt){
 if(!p.alive){p.respawn-=dt;if(p.respawn<=0&&!M.over)spawnPlane(p);return;}
 const e=p.eff,I=p.in,W=World;p.aliveT+=dt;p.st.alive+=dt;
 for(const k of['inv','rollInv','rollCd','cd','flash','shield','cloak','spCd','spT','secT','nmCool','loopCd','dashT','dashCd','dmgT','nrgT','colCd','odT','warnT'])if(p[k]>0)p[k]=Math.max(0,p[k]-dt);
 if(p.ghost){p.inv=Math.max(p.inv,.35);p.ghostT-=dt;if(p.ghostT<=0&&!W.hit(p.x,p.y,18))p.ghost=false;}
 if(p.rldG>0){p.rldG-=dt;p.heat=0;}else if(p.in.fire&&p.alive){p.heat=(p.heat||0)+dt;if(p.heat>=3){p.rldG=1.6;p.heat=0;if(p.isPlayer){popupFor(p,'RECARGANDO…','#ffc83d');Snd.tone(300,.2,'square',.04,.7);}}}else p.heat=Math.max(0,(p.heat||0)-dt*1.2);
 if(p.secAmmo<p.def.sec.n){p.secRl+=dt;if(p.secRl>=p.def.sec.rl){p.secAmmo++;p.secRl=0;}}
 p.energy=Math.min(100,p.energy+14*dt);if(p.nrgT>0)p.energy=100;
 if(I.turn)p.lastTurn=Math.sign(I.turn);
 if(I.dash){I.dash=false;startDash(p);}
 if(I.roll){I.roll=false;startRoll(p);}if(I.flip){I.flip=false;startFlip(p);}
 if(I.sp){I.sp=false;useSpecial(p);}if(I.sec)fireSec(p);if(I.fire)fireGun(p);
 if(p.cobraT>0){p.cobraT-=dt;if(Math.random()<.5)emit({x:p.x,y:p.y,vx:rnd(-30,30),vy:rnd(-30,30),l:.5,m:.5,s:rnd(4,8),c:'#cfd6e4',g:0,d:2,k:'c',grow:20});if(p.cobraT<=0){trick(p,'COBRA',32,7,'flips');p.speed=Math.min(p.eff.cruise*1.6,p.speed+p.eff.cruise*.5);}}
 if(I.mv){const mv=I.mv;I.mv=null;startMove(p,mv);}
 /* ★ HERIDO #3 / ★ PESO #1 — cuenta atrás del roll. Al acabar la 1ª mitad de una TIJERA se lanza la 2ª, que dura lo mismo
    que la 1ª (0,75 s × p.rollTm) en lugar de los 0,75 s fijos de antes; la inmunidad (0,6 s) no se alarga. */
 if(p.rollT>0){p.rollT-=dt;if(p.rollT<=0){if(p.rollQ){p.rollDir=p.rollQ;p.rollQ=0;p.rollD=.75*(p.rollTm||1);p.rollT=p.rollD;p.rollInv=.6;p.scis=true;}else{p.st.rolls++;if(p.scis){p.scis=false;trick(p,'TIJERA',38,8,'dodges');}else if(p.tonel){p.tonel=false;trick(p,'DOBLE ROLL',32,6);}else trick(p,'ROLL',10,2);}}}
/* ★ AMPLIO #6 — REBUFO: volar justo detrás de otro avión (en su estela) da velocidad, aceleración y energía */
 {const D=AMPLIO.draft;let best=0;
  for(const q of M.planes){if(q===p||!q.alive||q.ghost)continue;
   const dx=p.x-q.x,dy=p.y-q.y,cq=Math.cos(q.ang),sq=Math.sin(q.ang),back=-(dx*cq+dy*sq);   /* distancia por detrás de q */
   if(back<D.min||back>D.len)continue;
   const wd=D.w0+back*D.w1,lat=Math.abs(-dx*sq+dy*cq);if(lat>wd)continue;                    /* dentro del cono */
   if(Math.abs(angDiff(p.ang,q.ang))>D.ang||q.speed<q.eff.cruise*.7)continue;                 /* misma dirección y el líder va rápido */
   const k=(1-lat/wd)*(.4+.6*(1-(back-D.min)/(D.len-D.min)));if(k>best)best=k;}
  const cur=p.draft||0;p.draft=cur+(best-cur)*Math.min(1,dt*(best>cur?2.2:1.2));if(p.draft<.01)p.draft=0;
  if(p.draft>0){p.energy=Math.min(100,p.energy+D.energy*p.draft*dt);}
  p.dfCd=Math.max(0,(p.dfCd||0)-dt);if(p.draft>.5){p.dfT=(p.dfT||0)+dt;if(p.dfT>1.8&&p.dfCd<=0){p.dfCd=6;p.dfT=0;trick(p,'REBUFO',14,3);}}else p.dfT=0;}
 /* ★ FIN AMPLIO #6 (efectos en velocidad más abajo, estela en emitTrail y aviso en el HUD) */
 let target=e.cruise;p.boosting=false;if(p.cobraT>0)target=e.cruise*.28;const farK=p.far||0;
 if(p.spT>0&&p.def.sp.t==='turbo'){target=e.cruise*1.9;p.boosting=true;}
 else if(I.boost&&p.energy>2){target=e.cruise*1.45;p.energy-=30*dt;p.boosting=true;}
 else if(I.brake)target=e.cruise*.55;
 if(p.draft>0)target*=1+AMPLIO.draft.gain*p.draft; /* ★ AMPLIO #6: bonus de rebufo */
 if(farK>0)target*=1-.7*farK;
 const flipping=p.flipT>0,spdF=Math.min(p.speed/e.cruise,1.25);
 /* ★ HERIDO #4 / ★ PESO #1 — FÍSICA DE GIRO CON HERIDAS Y TAMAÑO. Tres variables nuevas:
      wound : nivel de herida de este avión (0 sano … 1 casi muerto), ver woundLevel().
      heavy : pesadez del modelo de avión (1 pequeño … 2 Leviatán), ver heavyMul(). */
 const wound=woundLevel(p),heavy=heavyMul(p.def);
 /* 'rate' = velocidad máxima de giro (rad/s). Se mantiene la fórmula original y se le añade al final un factor nuevo:
    (1 − turnLoss·wound) → "pérdida de fuerza": herido, el avión no puede girar tan rápido (hasta −18 %). */
 let rate=(p.cobraT>0?2.6:1)*(1-.55*(p.far||0))*e.turn*(.45+.55*Math.min(spdF,1))*(I.brake?1.3:1)*(p.stall?.3:1)*(p.ai?p.ai.d.turn||1:1)*(1-WOUND.turnLoss*wound)*(p.boosting?AMPLIO.boostTurn:1); /* ★ MEJORA: turbo/boost = giro más abierto (no se escapa girando) */
 /* 'resp' = cuánto se acerca el giro real al giro pedido en cada fotograma (0 = no responde, 1 = instantáneo).
    Original: dt·(5+turn·1,2). Nuevo:
      · × (1 − lag·wound)            → "pérdida de reflejos": herido, el avión tarda más en obedecer al mando.
      · ÷ (1 + inertia·(heavy − 1))  → "peso": un avión grande tiene más inercia y responde con más pereza. */
 const resp=Math.min(1,dt*(5+e.turn*1.2)*(1-WOUND.lag*wound)/(1+HEAVY.inertia*(heavy-1)));
 /* 'wob' = temblor (rad/s) que se SUMA al giro pedido: el avión herido "se mueve solo" y hay que corregirlo.
    Es la suma de dos ondas suaves (60 % + 40 %) desfasadas por p.wobPh: parece aleatoria pero nunca da tirones bruscos.
    Su amplitud crece con la herida, así que sano = 0 y en estado crítico ≈ ±13° de deriva: difícil, pero controlable. */
 const wob=wound>0?WOUND.wobble*wound*(Math.sin(M.t*WOUND.wobF1+p.wobPh)*.6+Math.sin(M.t*WOUND.wobF2+p.wobPh*1.7)*.4):0;
 /* ★ HERIDO #3 / ★ PESO #1 — media vuelta en curso: velocidad angular = 180° (π rad) repartidos en 'flipDur' segundos.
    Antes era π/0,5 fijo; ahora, con flipDur alargado, gira más despacio pero sigue completando exactamente 180°
    (y 360° en el bucle, que suma otra flipDur). El '|| .5' protege los aviones remotos que nunca iniciaron un flip aquí. */
 if(p.isPlayer&&p.boosting)selfShake(p,1.3);
 if(p.isPlayer&&p.warnT>0){let md=1e9;for(const q of M.mis)if(q.tg===p)md=Math.min(md,Math.hypot(q.x-p.x,q.y-p.y));if(md<700)selfShake(p,3.5*(1-md/700));}
 if(p.isPlayer&&wound>.35){p.shk=Math.max(p.shk||0,wound*2.2);if(!M.split)M.shake=Math.max(M.shake,wound*2.2);} /* ★ MEJORA: sacudida leve cuando estás herido */
 if(flipping){p.flipT-=dt;p.angVel=p.flipDir*Math.PI/(p.flipDur||.5);if(p.flipT<=0){p.angVel=0;p.loopAcc=0;if(p.loopX){p.loopX=false;p.afterDash=false;p.speed=Math.min(p.eff.cruise*1.8,p.speed+p.eff.cruise*.6);p.inv=Math.max(p.inv,.3);trick(p,'BUCLE',45,9,'loops');}else if(p.afterDash){p.afterDash=false;p.dashT=.6;p.speed=Math.min(p.eff.cruise*2.4,p.speed+p.eff.cruise*1.1);p.inv=Math.max(p.inv,.35);sparks(p.x,p.y,18,'#9be7ff',420,.5);trick(p,'INMELMANN',42,9,'flips');}else trick(p,'MEDIA VUELTA',12,3,'flips');}}
 /* Giro normal (sin media vuelta): la velocidad angular persigue (giro pedido + temblor) con la respuesta 'resp'.
    Cambios: se suma 'wob' (inestabilidad) y se usa 'resp' (reflejos/peso) en lugar de la constante original. */
 else p.angVel+=(clamp(I.turn,-1,1)*rate+wob-p.angVel)*resp;
 p.ang+=p.angVel*dt;if(p.ang>Math.PI)p.ang-=TAU;else if(p.ang<-Math.PI)p.ang+=TAU;
 p.stall=false;
 if(p.speed<target)p.speed+=e.accel*(1+AMPLIO.draft.accel*(p.draft||0))*clamp( /* ★ AMPLIO #6 */(target-p.speed)/60,0,1)*dt;else p.speed-=e.accel*.9*clamp((p.speed-target)/80,0,1)*dt;
p.speed=clamp(p.speed,40,e.cruise*(p.dashT>0?2.5:1.9)*(1+AMPLIO.draft.gain*(p.draft||0))); /* ★ AMPLIO #6 */
 const ox0=p.x,oy0=p.y; /* ★ AMPLIO #10: posición previa para colisión por barrido */
 p.x+=Math.cos(p.ang)*p.speed*dt;p.y+=Math.sin(p.ang)*p.speed*dt;
 /* ★ HERIDO #3 / ★ PESO #1 — desplazamiento lateral del roll. Como el roll ahora dura rollTm veces más, la velocidad
    lateral (330) se divide por rollTm: así recorre la MISMA distancia total pero más despacio (no regala esquiva extra). */
 if(p.rollT>0){const k=Math.sin(Math.min(1,p.rollT/(p.rollD||.75))*Math.PI)*(330/(p.rollTm||1))*(p.tonel?1.7:1)*dt*(p.rollDir||1);p.x-=Math.sin(p.ang)*k;p.y+=Math.cos(p.ang)*k;}
 /* bucles */
 if(!flipping){p.loopAcc+=p.angVel*dt;if(Math.abs(p.angVel)>.6)p.loopT=0;else p.loopT+=dt;if(p.loopT>.5)p.loopAcc=0;
  if(Math.abs(p.loopAcc)>TAU*.95){p.loopAcc=0;if(p.loopCd<=0){p.loopCd=1.5;trick(p,'GIRO 360°',30,6,'loops');}}}
 /* límites */
 const sDep=W.def.closed?-1:stormDepth(p.x,p.y);if(sDep>0){p.oob+=dt;p.far=clamp(sDep/3200,0,1);{const dx=W.w/2-p.x,dy=W.h/2-p.y,dl=Math.hypot(dx,dy)||1,ps=(140+760*p.far)*AMPLIO.speedK*dt; /* ★ AMPLIO #10: la tormenta empuja acorde a la nueva velocidad */p.x+=dx/dl*ps;p.y+=dy/dl*ps;}if(p.ai)p.ang+=clamp(angDiff(p.ang,Math.atan2(W.h/2-p.y,W.w/2-p.x)),-1,1)*3.2*dt;if(!(M.tut&&p.ai&&p.ai.dummy))damage(p,(22+45*clamp(sDep/1200,0,1))*dt,null,'la tormenta');}else{p.oob=0;p.far=Math.max(0,(p.far||0)-dt*1.5);}
 /* choque y pasadas rasantes */
 if(!p.ghost&&!(M.tut&&(p.isPlayer||(p.ai&&p.ai.dummy)))&&(W.hit(p.x,p.y,11)||W.hit((p.x+ox0)/2,(p.y+oy0)/2,11))){ /* ★ AMPLIO #10 */sculptCrash(p,ox0,oy0); /* ★ ESCULPIR #4: el avión que se estrella también excava un cráter (ox0,oy0 = posición del fotograma anterior) */kill(p,null,'choque');explosion(p.x,p.y,1.1,'clasico');return;}
 if(p.speed>160){const d=W.dist(p.x,p.y,52);if(d<48){p.nmT+=dt;}else{if(p.nmT>=.3&&p.nmCool<=0){p.nmCool=1;trick(p,'RASANTE',8+Math.min(12,Math.round(p.nmT*10)),3+Math.round(p.nmT*4),'nearmiss');}p.nmT=0;}}
 if(W.over.length&&(p.ovCd=(p.ovCd||0)-dt)<=0&&W.overAt(p.x,p.y)){p.ovCd=2.5;trick(p,'BAJO EL PUENTE',15,4,'nearmiss');}
 for(const g of W.rings){if(g.cd>0)continue;const dx=p.x-g.x,dy=p.y-g.y;if(dx*dx+dy*dy<(g.r+10)**2){g.cd=10;p.speed=Math.min(e.cruise*1.9,p.speed+260*AMPLIO.speedK); /* ★ AMPLIO #3: impulso de anillo escalado */p.energy=Math.min(100,p.energy+35);trick(p,'ANILLO',20,5,'nearmiss');sparks(g.x,g.y,18,'#7ff6ff',380,.6);}}
 /* estela */
 p.trailT-=dt;if(p.trailT<=0){p.trailT=.03;emitTrail(p);}
 {const tl=p.def.shape.len*.5,tx=p.x-Math.cos(p.ang)*tl,ty=p.y-Math.sin(p.ang)*tl,tr=p.tr||(p.tr=[]),q=tr[0];if(q&&Math.hypot(q[0]-tx,q[1]-ty)>160)tr.length=0;if(!tr[0]||Math.hypot(tr[0][0]-tx,tr[0][1]-ty)>3)tr.unshift([tx,ty]);else tr[0]=[tx,ty];const mx=p.def.shape.len*3.2;let acc=0;for(let i=1;i<tr.length;i++){acc+=Math.hypot(tr[i][0]-tr[i-1][0],tr[i][1]-tr[i-1][1]);if(acc>mx){tr.length=i+1;break;}}}
}
function emitTrail(p){const L=p.def.shape.len*.5,tx=p.x-Math.cos(p.ang)*L,ty=p.y-Math.sin(p.ang)*L,t=p.look.trail,hurt=p.hp<p.maxHp*.5,wl=woundLevel(p);
 /* ★ AMPLIO #6 — estela de aire visible detrás de los aviones rápidos y líneas de viento en quien la aprovecha */
 if(p.speed>p.eff.cruise*.85&&Math.random()<.55)emit({x:tx,y:ty,vx:0,vy:0,l:1.1,m:1.1,s:2.6,c:'#ffffff44',g:0,d:0,k:'f',grow:7});
 if((p.draft||0)>.25){const cc=Math.cos(p.ang),ss=Math.sin(p.ang),Wd=p.def.shape.wing*1.4;for(const q of[-1,1])emit({x:p.x+cc*L-ss*q*Wd,y:p.y+ss*L+cc*q*Wd,vx:-cc*140,vy:-ss*140,l:.45,m:.45,s:2.4,c:'#bff3ffcc',g:0,d:1,k:'f'});}
 /* ★ FIN AMPLIO #6 */
 if(hurt){const n=1+(wl>.5?1:0)+(wl>.8?1:0);for(let i=0;i<n;i++)emit({x:tx,y:ty,vx:rnd(-20,20),vy:rnd(-40,-10),l:.9+wl*.6,m:.9+wl*.6,s:5+wl*3,c:Math.random()<.4?'#ff7a2f':'#26262b',g:-20,d:1,k:Math.random()<.4?'f':'c',grow:12});} /* ★ MEJORA: humo más denso cuanto más herido */
 if(p.boosting&&p.def.shape.jet)emit({x:tx,y:ty,vx:-Math.cos(p.ang)*80,vy:-Math.sin(p.ang)*80,l:.25,m:.25,s:5,c:'#8fe8ff',g:0,d:2,k:'f'});
 if(p.boosting||p.dashT>0||Math.abs(p.angVel)>1.7){const ln=p.def.shape.len,Wd=p.def.shape.wing*1.25,cc=Math.cos(p.ang),ss=Math.sin(p.ang);for(const q of[-1,1])emit({x:p.x-cc*ln*.15-ss*q*Wd,y:p.y-ss*ln*.15+cc*q*Wd,vx:0,vy:0,l:.4,m:.4,s:2.2,c:'#ffffffcc',g:0,d:0,k:'f'});}}

function updShots(dt){
 for(let i=M.bul.length-1;i>=0;i--){const b=M.bul[i];
  const bk=(b.o&&b.o.isPlayer)?aimK():1;if(b.o&&b.o!==TUR&&b.l>0&&bk>0){let ad=null,bd=1e9;const ba=Math.atan2(b.vy,b.vx);for(const v of M.planes){if(v===b.o||!v.alive||v.cloak>0||ally(b.o,v))continue;const dx=v.x-b.x,dy=v.y-b.y,d=Math.hypot(dx,dy);if(d>950||d<50||d>=bd)continue;const da=angDiff(ba,Math.atan2(dy,dx));if(Math.abs(da)<.24*bk){bd=d;ad=da;}}
   if(ad!==null){const k=clamp(ad,-1.5*bk*dt,1.5*bk*dt),ca=Math.cos(k),sa=Math.sin(k),nx=b.vx*ca-b.vy*sa,ny=b.vx*sa+b.vy*ca;b.vx=nx;b.vy=ny;}}
  b.px=b.x;b.py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;let dead=b.l<=0;
  if(!dead&&!b.air&&(World.hit(b.x,b.y,2)||World.hit((b.px+b.x)/2,(b.py+b.y)/2,2))){sparks(b.x,b.y,4,'#ffd27a',160,.3);sculptBullet(b); /* ★ ESCULPIR #4: la bala excava un cráter en el punto de impacto */dead=true;}
  if(!dead)for(const v of M.planes){if(v===b.o||!v.alive||ally(b.o,v))continue;if(segD2(b.px,b.py,b.x,b.y,v.x,v.y)<(15+b.w)**2){
   if(v.rollInv>0){if(b.dv!==v.id){b.dv=v.id;v.st.dodges++;trick(v,'ESQUIVA',25,6);}continue;}
   damage(v,b.dmg,b.o,'disparo');sparks(b.x,b.y,3,b.col,150,.25);dead=true;break;}}
  if(!dead&&b.o!==TUR)for(const t of World.turrets){if(!t.alive)continue;if(segD2(b.px,b.py,b.x,b.y,t.x,t.y)<(30+b.w)**2){t.hp-=b.dmg;sparks(b.x,b.y,3,b.col,150,.25);dead=true;if(t.hp<=0)destroyTurret(t,b.o);break;}}
  if(dead)M.bul.splice(i,1);}
 for(let i=M.mis.length-1;i>=0;i--){const m=M.mis[i];m.px=m.x;m.py=m.y; /* ★ ESCULPIR #4 */m.age+=dt;m.l-=dt;let boom=false;
  if(m.tg&&m.tg.alive&&(m.tg.cloak<=0||Math.hypot(m.tg.x-m.x,m.tg.y-m.y)<250)){m.ang+=clamp(angDiff(m.ang,Math.atan2(m.tg.y-m.y,m.tg.x-m.x)),-3.1*dt,3.1*dt);if(m.tg&&m.tg.isPlayer){M.warn=.25;m.tg.warnT=.25;}}
  m.sp=Math.min(m.sp+450*AMPLIO.secSpdK*dt,m.max); /* ★ AMPLIO #7 */m.x+=Math.cos(m.ang)*m.sp*dt;m.y+=Math.sin(m.ang)*m.sp*dt;
  emit({x:m.x,y:m.y,vx:0,vy:0,l:.5,m:.5,s:3,c:'#d8d8dc',g:-8,d:1,k:'c',grow:8});
  if(World.hit(m.x,m.y,5))boom=true;
  if(!boom&&m.age>.2)for(const v of M.planes){if(v===m.o||!v.alive||ally(m.o,v))continue;if((v.x-m.x)**2+(v.y-m.y)**2<30*30){if(v.rollInv>0){if(m.ign!==v.id){m.ign=v.id;v.st.dodges++;trick(v,'ESQUIVA',25,6);if(m.tg===v)m.tg=null;}continue;}boom=true;break;}}
  if(m.l<=0)boom=true;
  if(boom){sculptBlast(m.x,m.y,m.r,m.px,m.py,5); /* ★ ESCULPIR #4: el misil/cohete excava un cráter */blast(m.x,m.y,m.r,m.dmg,m.o,m.kind);explosion(m.x,m.y,m.r>70?.9:.6,'clasico');M.mis.splice(i,1);}}
 for(let i=M.bombs.length-1;i>=0;i--){const b=M.bombs[i];b.px=b.x;b.py=b.y; /* ★ ESCULPIR #4: posición anterior de la bomba */b.age+=dt;b.l-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const dr=Math.max(0,1-1.6*dt);b.vx*=dr;b.vy*=dr;let boom=b.l<=0||!!World.hit(b.x,b.y,7);
  if(!boom&&b.age>.25)for(const v of M.planes){if(v===b.o||!v.alive||ally(b.o,v))continue;if((v.x-b.x)**2+(v.y-b.y)**2<36*36){boom=true;break;}}
  if(boom){sculptBlast(b.x,b.y,140,b.px,b.py,7); /* ★ ESCULPIR #4: la bomba excava el mayor cráter */blast(b.x,b.y,140,b.dmg,b.o,'bomba');explosion(b.x,b.y,1.4,'clasico');M.bombs.splice(i,1);}}
 for(let i=M.picks.length-1;i>=0;i--){const k=M.picks[i];k.t+=dt;if(k.exp&&M.t>k.exp){M.picks.splice(i,1);continue;}for(const v of M.planes){if(!v.alive)continue;if((v.x-k.x)**2+(v.y-k.y)**2<42*42){
  applyPick(v,k);M.picks.splice(i,1);break;}}}
 for(let i=M.parts.length-1;i>=0;i--){const p=M.parts[i];p.l-=dt;if(p.l<=0){M.parts.splice(i,1);continue;}const dr=Math.max(0,1-p.d*dt);p.vx*=dr;p.vy*=dr;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.grow)p.s+=p.grow*dt;}
}
