'use strict';
/* ===== IA de bots ===== */
function ahead(p,dist,da){const a=p.ang+da;return[p.x+Math.cos(a)*dist,p.y+Math.sin(a)*dist];}
function arcTime(p,s,T,m,D){const e=p.eff,sp=Math.max(p.speed,e.cruise*.7),om=s*e.turn*(.45+.55*Math.min(sp/e.cruise,1))*(D.turn||1)*(s?1:0),dt=.08;let x=p.x,y=p.y,a=p.ang;
 for(let t=dt;t<=T;t+=dt){a+=om*dt;x+=Math.cos(a)*sp*dt;y+=Math.sin(a)*sp*dt;
  if(World.hit(x,y,m)||World.stormAt(x,y,20))return t;
  if(!World.def.closed&&(x<-60||y<-60||x>World.w+60||y>World.h+60))return t;}
 return T;}
function steerTo(p,ang,k){p.in.turn=clamp(angDiff(p.ang,ang)*(k||3),-1,1);}
function botThink(p,dt){const a=p.ai,D=a.d,I=p.in;I.fire=false;I.sec=false;I.boost=false;I.brake=false;
 if(a.dummy){tutDroneAI(p);return;}
 if(p.stall){I.turn=0;return;}
 a.t-=dt;a.fireT=Math.max(0,a.fireT-dt);a.stT=Math.max(0,a.stT-dt);a.manT=Math.max(0,a.manT-dt);
 const W=World;let desired=null,urgent=false;
 /* 1. evitar terreno: simula el giro maximo y elige el sentido mas seguro */
 const m=D.margin*(p.ai.pers==='acro'?.75:1),T=.95+D.look*.3;
 let ts=arcTime(p,0,T,m,D);
 if(ts<T){urgent=true;const tl=arcTime(p,-1,T,m,D),tr=arcTime(p,1,T,m,D);
  const s=tl===tr?(a.side||1):(tl>tr?-1:1);a.escape=s;desired=p.ang+s*1.2;I.boost=false;if(Math.max(tl,tr)<ts+.3&&ts<.6)I.brake=true;a.escT=.35;}
 else if(a.escT>0){a.escT-=dt;urgent=true;desired=p.ang+(a.escape||1)*.6;}
 if(!urgent&&M.zone&&Math.hypot(p.x-M.zone.x,p.y-M.zone.y)>M.zone.r*.92){desired=Math.atan2(M.zone.y-p.y,M.zone.x-p.x);urgent=true;}
 if(!urgent){const mg=420;if(!W.def.closed&&(p.x<mg||p.x>W.w-mg||p.y<mg||p.y>W.h-mg||stormDepth(p.x+Math.cos(p.ang)*450,p.y+Math.sin(p.ang)*450)>-150)){desired=Math.atan2(W.h/2-p.y,W.w/2-p.x);urgent=true;}}
 /* 2. objetivo */
 if(a.t<=0){a.t=D.think*rnd(.8,1.3);a.side=Math.random()<.5?-1:1;a.err=rnd(-D.aim,D.aim);
  let best=null,bs=-1;for(const q of M.planes){if(q===p||!q.alive||ally(p,q))continue;const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(q.cloak>0&&d>250)continue;if(D.rng&&d>D.rng&&!(q.lastHit===p&&M.t-q.lastHitT<4)&&!(a.pers==='carro'&&q.hp<q.maxHp*.5))continue;let s=3000/(d+500); /* ★ AMPLIO #8: elige objetivos más lejanos */
   if(q===a.tg)s*=1.3;if(q.isPlayer)s*=1.15;if(M.hill&&Math.hypot(q.x-M.hill.x,q.y-M.hill.y)<M.hill.r*1.2)s*=1.8;
   if(a.pers==='carro'){const lost=Math.max(0,1-q.hp/q.maxHp);s*=1+lost*5+(lost>.55?2:0);} /* ★ MEJORA: el Carroñero sí persigue a los heridos */
   if(a.pers==='franco')s*=d>450?1.3:.8;
   if(a.pers==='acro'&&q.lastHit===p)s*=.8;
   if(q.lastHit===p&&M.t-q.lastHitT<3)s*=1.2;
   if(s>bs){bs=s;best=q;}}
  a.tg=best;
  const low=p.hp<p.maxHp*.28&&a.pers!=='berserk';
  if(low&&a.state!=='flee'){a.state='flee';a.stT=rnd(3,5);}else if(a.state==='flee'&&(a.stT<=0||p.hp>p.maxHp*.5))a.state=a.tg?'attack':'patrol';
  if(a.state==='zoom'&&a.stT<=0)a.state='attack';
  if(a.state==='patrol'&&a.tg)a.state='attack';
  if(a.state==='attack'&&!a.tg)a.state='patrol';
  /* uso de especiales */
  const t=p.def.sp.t;if(p.spCd<=0){if(t==='escudo'&&(p.hp<p.maxHp*.55&&M.t-p.lastHitT<1.2))I.sp=true;else if(t==='repair'&&p.hp<p.maxHp*.45)I.sp=true;
   else if(t==='cloak'&&(a.state==='flee'||(a.tg&&p.hp<p.maxHp*.6)))I.sp=true;else if(t==='turbo'&&(a.state==='flee'||(a.tg&&Math.hypot(a.tg.x-p.x,a.tg.y-p.y)>1800)))I.sp=true; /* ★ AMPLIO #8 */
   else if(t==='dash'&&a.threat&&Math.random()<D.evade*.5)I.sp=true;
   else if(a.dsel>=5&&(t==='overdrive'&&a.tg&&Math.hypot(a.tg.x-p.x,a.tg.y-p.y)<1400||t==='nova'&&M.planes.some(q=>q!==p&&q.alive&&!ally(p,q)&&Math.hypot(q.x-p.x,q.y-p.y)<560)||t==='cloak'&&a.tg&&Math.hypot(a.tg.x-p.x,a.tg.y-p.y)<1100))I.sp=true; /* ★ MEJORA: Leyenda usa más sus especiales */
   else if(t==='overdrive'&&a.tg&&Math.hypot(a.tg.x-p.x,a.tg.y-p.y)<900)I.sp=true;
   else if(t==='nova'&&M.planes.some(q=>q!==p&&q.alive&&!ally(p,q)&&Math.hypot(q.x-p.x,q.y-p.y)<400))I.sp=true;}}
 /* 3. amenazas */
 let thr=null,td=1e9;
 for(const b of M.bul){if(b.o===p)continue;const rx=p.x-b.x,ry=p.y-b.y,d=Math.hypot(rx,ry);if(d>560||d<1)continue;if(rx*b.vx+ry*b.vy<=0)continue; /* ★ AMPLIO #8: ven venir balas más rápidas */
  if(segD2(b.x,b.y,b.x+b.vx*.35,b.y+b.vy*.35,p.x,p.y)<34*34&&d<td){td=d;thr={x:b.x,y:b.y,vx:b.vx,vy:b.vy,m:0};}}
 for(const m of M.mis){if(m.o===p)continue;const d=Math.hypot(p.x-m.x,p.y-m.y);if(d<1100&&(m.tg===p||m.kind==='cohete')&&d<td) /* ★ AMPLIO #8 */{td=d;thr={x:m.x,y:m.y,vx:Math.cos(m.ang)*m.sp,vy:Math.sin(m.ang)*m.sp,m:1};}}
 for(const b of M.bombs){if(b.o===p)continue;const d=Math.hypot(p.x-b.x,p.y-b.y);if(d<230&&d<td){td=d;thr={x:b.x,y:b.y,vx:b.vx,vy:b.vy,m:2};}}
 a.threat=thr;
 if(thr&&!urgent&&Math.random()<D.evade*dt*8){
  const ta=Math.atan2(thr.vy,thr.vx);desired=ta+(a.side||1)*Math.PI/2;
  if(td<260&&p.rollCd<=0&&Math.random()<D.evade*.8)I.roll=true;
  if(thr.m===1){I.brake=Math.random()<.4;if(td<350&&p.spCd<=0&&p.def.sp.t==='dash')I.sp=true;if(a.pers==='acro'&&td<300&&a.manT<=0){I.flip=true;a.manT=2;}}
  if(thr.m===2)desired=p.ang+(a.side||1)*Math.PI/2;}
 /* 4. combate */
 const tg=a.tg;let dist=1e9,rel=0;
 if(!desired&&a.state==='flee'){let pk=null,pd=1e9;for(const k of M.picks){const d=Math.hypot(k.x-p.x,k.y-p.y);if(k.k==='rep'&&d<pd){pd=d;pk=k;}}
  if(pk)desired=Math.atan2(pk.y-p.y,pk.x-p.x);else if(tg)desired=Math.atan2(p.y-tg.y,p.x-tg.x);I.boost=true;}
 if(tg&&tg.alive){const dx=tg.x-p.x,dy=tg.y-p.y;dist=Math.hypot(dx,dy);const g=GUNS[p.def.gun],tt=clamp(dist/(g.spd+p.speed*.55),0,2.6); /* ★ AMPLIO #8: anticipa disparos a larga distancia */
  const lx=tg.x+Math.cos(tg.ang)*tg.speed*tt,ly=tg.y+Math.sin(tg.ang)*tg.speed*tt,aim=Math.atan2(ly-p.y,lx-p.x)+a.err;rel=angDiff(p.ang,aim);
  if(!desired&&a.state!=='flee'){
   if(a.state==='zoom'){desired=Math.atan2(p.y-tg.y,p.x-tg.x)-.7*Math.sign(Math.cos(p.ang)||1);I.boost=true;}
   else{desired=aim;
    if(dist<190*AMPLIO.geoK&&Math.abs(rel)<.7&&a.manT<=0) /* ★ AMPLIO #8 */{a.state=a.pers==='franco'?'zoom':'attack';a.manT=1.2;if(a.state==='zoom')a.stT=1.8;desired=p.ang+(a.side||1)*1.1;}
    if(a.pers==='acro'){const behind=Math.abs(angDiff(tg.ang,Math.atan2(p.y-tg.y,p.x-tg.x)))<.5;
     if(Math.abs(rel)>2.2&&dist<520&&a.manT<=0&&Math.random()<D.man*.3){I.flip=true;a.manT=3;}
     else if(behind&&dist<420&&p.rollCd<=0&&Math.random()<D.man*.05)I.roll=true;}
    if(dist>900&&p.energy>35&&Math.abs(rel)<.4)I.boost=true;
    if(dist<260&&Math.abs(rel)>.5)I.brake=true;}}
  if(a.state==='attack'||a.state==='zoom'){const cone=D.cone*clamp(500/(dist+120),.35,1.6)+Math.atan2(26,dist+1)*.6;
   if(Math.abs(rel)<cone&&dist<g.spd*g.life*.95&&(!urgent||Math.abs(rel)<cone*.6)&&!(D.lazy&&Math.random()<D.lazy)){I.fire=true;if(a.pers==='franco'&&dist<260&&a.state!=='zoom'){a.state='zoom';a.stT=1.6;}}
   const sc=p.def.sec.t;if(p.secAmmo>0&&a.fireT<=0&&!urgent){
    if(D.lazy>.4){}else if(sc==='misil'&&dist>600&&dist<2800&& /* ★ AMPLIO #8 */(Math.abs(rel)<.4||(tg.boosting&&Math.abs(rel)<.9))&&Math.random()<(tg.boosting?.8:.5)){I.sec=true;a.fireT=2.2;}
    else if(sc==='cohetes'&&dist<1500&& /* ★ AMPLIO #8 */Math.abs(rel)<.12){I.sec=true;a.fireT=2;}
    else if(sc==='bomba'&&Math.abs(rel)<.3&&dist<380&&dist>120){I.sec=true;a.fireT=1.5;}}}}
 if(M.mode==='hill'&&M.hill&&!urgent&&!a.threat&&a.state!=='flee'&&!(tg&&tg.alive&&dist<650)){if(a.guard===undefined)a.guard=Math.random()<.34;a.wp=a.wp||wpick(p);if(Math.hypot(a.wp[0]-p.x,a.wp[1]-p.y)<220)a.wp=wpick(p);desired=Math.atan2(a.wp[1]-p.y,a.wp[0]-p.x);}
 if(!desired){ // patrulla
  a.wp=a.wp||wpick(p);if(Math.hypot(a.wp[0]-p.x,a.wp[1]-p.y)<350)a.wp=wpick(p);desired=Math.atan2(a.wp[1]-p.y,a.wp[0]-p.x);
  if(a.pers==='acro'&&a.manT<=0&&Math.random()<.004){I.flip=true;a.manT=4;}}
 if(a.pers==='acro'&&!a.tg&&a.manT<=0&&Math.random()<.002)a.loop=1.6;
 steerTo(p,desired,urgent?6:3);if(urgent&&a.escape&&ts<T)I.turn=a.escape;
 if(a.loop>0){a.loop-=dt;I.turn=1*a.side;}
 if(Math.abs(angDiff(p.ang,desired))>1.4&&!urgent&&p.speed>p.eff.cruise*.9&&dist>300)I.brake=I.brake||Math.random()<.2;}
const BOTUSED=new Set();
function makeBot(i,diffSel,cfgDiff,forceDef,hullX){const dsel=diffSel===0?pick([1,2,2,3,3,4]):diffSel,D=DIFFS[dsel],def=forceDef||pick(PLANES),pers=pick(PERS).id; /* ★ MEJORA: personalidad aleatoria (antes PERS[i%5], predecible) */
 const up={};for(const[k]of UPS)up[k]=Math.min(5,Math.floor(Math.random()*(dsel+1)));
 const lk={...DEFLOOK,paint:pick(CAT.paint).id,pattern:pick(CAT.pattern).id,trail:pick(['humo','humo','fuego','neon','chispas','doble']),sticker:pick(CAT.sticker).id,acc:pick(['none','none','luces','antena','bandera'])};
 if(i===0)BOTUSED.clear();let nm=pick(CALLS),tr=0;while(BOTUSED.has(nm)&&tr++<40)nm=pick(CALLS);BOTUSED.add(nm);
 return makePlane({id:'b'+i,name:nm,def,up,look:lk,hpMul:D.hp*(hullX||1),dmgMul:D.dmg,ai:{escape:0,escT:0,d:D,pers,state:'patrol',t:rnd(0,.3),fireT:0,stT:0,manT:rnd(0,2),side:1,err:0,tg:null,threat:null,dsel,loop:0}});}

/* ===== Modos de juego ===== */
const MODES=[
 {id:'ffa',s:'Cada uno a lo suyo',ic:'<circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',n:'Clásico',d:'Cada piloto va por su cuenta. Solo puntúan los kills (100 cada uno); acrobacias, asistencias y rachas dan ¤.',mult:1},
 {id:'team',s:'Azul vs Rojo',ic:'<circle cx="8" cy="9" r="3.5"/><circle cx="16" cy="15" r="3.5"/><path d="M10.5 11.5l3 1"/>',n:'Equipos',d:'Azul contra Rojo con equipos iguales (2 vs 2, 3 vs 3…) y sin fuego amigo. Gana el equipo con más kills; las acrobacias dan ¤.',mult:1.1},
 {id:'last',s:'2 vidas · zona',ic:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>',n:'Último en pie',d:'Solo 2 vidas y una zona que se encoge: fuera de ella pierdes casco. Puntúa tu posición final; todo lo demás da ¤. Sé el último que quede.',mult:1.25},
 {id:'hill',s:'Zona dorada',ic:'<path d="M3 20l6-11 4 7 3-4 5 8z"/><path d="M9 9V3l5 2-5 2"/>',n:'Rey de la colina',d:'Quédate solo dentro de la zona dorada: los puntos son tiempo en el círculo. Cambia de sitio cada 40 s.',mult:1.1},
 {id:'waves',s:'3 vidas',ic:'<path d="M3 8c3-3 6 3 9 0s6 3 9 0M3 14c3-3 6 3 9 0s6 3 9 0M3 20c3-3 6 3 9 0s6 3 9 0"/>',n:'Oleadas',d:'Tú solo contra oleadas de enemigos cada vez más duros. Tienes 3 vidas. Los puntos son oleadas superadas; los kills dan ¤.',mult:1.2}];
const TEAMC=['#3a8dff','#ff4a3d'],TEAMN=['Azul','Rojo'],TEAMPAL=[['#2f6fe0','#1d4fb0','#8cbcff'],['#e8382c','#b02218','#ff968a']];
function teamLook(p){if(!M||!M.teams||p.team===undefined)return p.look;if(!p._tl||p._tl.t!==p.team)p._tl={...p.look,paint:'team'+p.team,trail:'team'+p.team,tc:TEAMC[p.team],t:p.team};return p._tl;}
const ally=(a,b)=>!!(M&&M.teams&&a&&b&&a.team!==undefined&&a.team===b.team);
function modeInit(cfg){const m=M,pl=m.pl;m.mode=cfg.mode||'ffa';m.teams=m.mode==='team'||m.mode==='waves';m.ts=[0,0];m.wave=0;m.waveT=2.5;m.cleared=0;m.clr=true;m.hill=null;m.zone=null;
 if(m.mode==='team'){pl.team=0;const al=Math.floor(cfg.bots/2);m.planes.forEach((p,i)=>{if(p!==pl)p.team=(i-1)<al?0:1;});}
 else if(m.mode==='waves'){pl.team=0;pl.lives=3;}
 else if(m.mode==='last'){for(const p of m.planes)p.lives=2;const W=World,fp=airSpot(500),r0=Math.hypot(W.w,W.h)*.55;m.zone={x:W.w/2,y:W.h/2,cx0:W.w/2,cy0:W.h/2,fx:fp[0],fy:fp[1],r0,r:r0,r1:Math.min(W.w,W.h)*.13};}
 else if(m.mode==='hill'){const pt=airSpot(760);m.hill={x:pt[0],y:pt[1],r:700,t:0,mv:40,who:null,cont:false};}}
function hillMove(){const h=M.hill,pt=airSpot(760);h.x=pt[0];h.y=pt[1];h.t=0;for(const p of M.planes)if(p.ai)p.ai.wp=null;}
function wpick(p){const a=p&&p.ai;
 /* ★ MEJORA: cada bot tiene un 'hueco' (ángulo) propio alrededor de la colina / dentro de la zona para no converger todos en el mismo punto */
 if(a&&a.slot===undefined)a.slot=Math.random()*TAU;
 if(M.mode==='hill'&&M.hill){if(!a)return[M.hill.x+rnd(-560,560),M.hill.y+rnd(-560,560)];const an=a.slot+rnd(-.5,.5),r=a.guard?rnd(0,M.hill.r*.6):rnd(M.hill.r*.9,M.hill.r*2.2);return[M.hill.x+Math.cos(an)*r,M.hill.y+Math.sin(an)*r];}
 if(M.mode==='last'&&M.zone&&a){const an=a.slot+rnd(-.6,.6),r=M.zone.r*rnd(.15,.8);return[M.zone.x+Math.cos(an)*r,M.zone.y+Math.sin(an)*r];}
 return airSpot(150);}
function modeKill(v){const id=M.mode;
 if(id==='last'){v.lives--;if(v.lives<=0){v.out=true;v.outT=M.t;v.respawn=1e9;v.score=(M.elimN||0)*100;M.elimN=(M.elimN||0)+1;if(v.isPlayer)popup('ELIMINADO · puesto '+(M.planes.length-(M.elimN-1)),'#ff7a2f');}}
 else if(id==='waves'){if(v.isPlayer){v.lives--;if(v.lives<=0){v.out=true;v.outT=M.t;v.respawn=1e9;}}else{v.out=true;v.respawn=1e9;}}}
function nextWave(){const m=M,pl=m.pl;m.clr=false;m.wave++;m.planes=m.planes.filter(p=>!p.out||p.isPlayer);
 const n=Math.min(2+m.wave,10),ds=clamp((m.cfg.diff||3)-1+Math.ceil(m.wave/2),1,5);
 const boss=m.wave%5===0,bdef=PLANES.find(q=>q.id==='leviatan');
 for(let i=0;i<n;i++){const b=makeBot(i+m.wave*3,ds);b.id='w'+m.wave+'_'+i;b.team=1;m.planes.push(b);m.byId[b.id]=b;spawnPlane(b);}
 if(boss&&bdef){const b=makeBot(99+m.wave,clamp(ds,1,5),0,bdef,3);b.id='w'+m.wave+'_boss';b.name='JEFE '+b.name;b.team=1;b.boss=true;m.planes.push(b);m.byId[b.id]=b;spawnPlane(b);popup('¡JEFE: LEVIATÁN!','#ff4d3a');} /* ★ MEJORA: jefe cada 5 oleadas (casco ×3) */
 for(const q of(m.pls||[pl])){q.hp=Math.min(q.maxHp,q.hp+q.maxHp*.35);q.secAmmo=q.def.sec.n;}popup('¡OLEADA '+m.wave+'!','#ffc83d');}
function modeTick(dt){const m=M,pl=m.pl,id=m.mode;if(m.over||id==='ffa'||id==='team')return;
 if(id==='last'){const z=m.zone,f=clamp((m.t-15)/Math.max(10,m.limit*.85-15),0,1);z.r=z.r0+(z.r1-z.r0)*f;z.x=z.cx0+(z.fx-z.cx0)*f;z.y=z.cy0+(z.fy-z.cy0)*f;
  for(const p of m.planes){if(!p.alive)continue;if(Math.hypot(p.x-z.x,p.y-z.y)>z.r){p.zT=(p.zT||0)+dt;if(p.zT>=.5){p.zT=0;damage(p,(6+14*f)*.5,null,'zona');}if(p.isPlayer&&m.t-(m.zw||-9)>3){m.zw=m.t;popup('FUERA DE LA ZONA','#ff7a2f');}}else p.zT=0;}
  for(const p of m.planes)if(!p.out)p.score=(m.elimN||0)*100;
  if((pl.out&&(!m.pls||m.pls.every(q=>q.out))&&!m.net)||m.planes.filter(p=>!p.out).length<=1||(m.net&&!m.planes.some(p=>!p.out&&!p.ai))){m.over=true;m.overT=0;}}
 else if(id==='hill'){const h=m.hill;h.t+=dt;if(h.t>=h.mv){hillMove();popup('¡LA COLINA SE MUEVE!','#ffc83d');}
  let n=0,w=null;for(const p of m.planes)if(p.alive&&Math.hypot(p.x-h.x,p.y-h.y)<h.r){n++;w=p;}
  h.who=n===1?w:null;h.cont=n>1;
  if(h.who){const p=h.who;p.hs=(p.hs||0)+dt;p.hA=(p.hA||0)+8*dt;if(p.hA>=1){const g=Math.floor(p.hA);p.score+=g;p.hA-=g;}}}
 else if(id==='waves'){if(pl.out&&(!m.pls||m.pls.every(q=>q.out))){m.over=true;m.overT=0;return;}
  if(!m.planes.some(p=>p.team===1&&!p.out)){if(!m.clr){m.clr=true;m.cleared++;m.waveT=4;pl.score+=150*m.wave+(m.wave%5===0?500:0);if(m.pls)for(const q of m.pls)if(q!==pl)q.score+=150*m.wave;popup('OLEADA SUPERADA +'+150*m.wave,'#7fa646');}m.waveT-=dt;if(m.waveT<=0)nextWave();}}}
function modeFin(m,rk,rank){const pl=m.pl,id=m.mode,n=rk.length;
 if(id==='team'){const my=m.ts[pl.team],th=m.ts[1-pl.team],win=my>th;
  return{win,title:win?'¡Victoria del equipo '+TEAMN[pl.team]+'!':my===th?'Empate':'Derrota',sub:'Azul '+m.ts[0]+' – '+m.ts[1]+' Rojo',place:win?150:my===th?70:30,pl:win?'Equipo ganador':my===th?'Empate de equipos':'Equipo derrotado'};}
 if(id==='last'){const win=rank===1;return{win,title:win?'¡Último en pie!':'Eliminado: puesto '+rank+' de '+n,sub:'Vidas restantes: '+Math.max(0,pl.lives)};}
 if(id==='hill'){const win=rank===1,s=Math.round(pl.hs||0);return{win,title:win?'¡Rey de la colina!':'Terminaste '+rank+'.º de '+n,sub:'Tiempo en la colina: '+s+' s',extra:[['Tiempo en la colina ('+s+' s)',s*2]]};}
 if(id==='waves'){const c=m.cleared,win=c>=4;return{win,title:win?'¡Superviviente!':'Superaste '+c+' oleada'+(c===1?'':'s'),sub:'Llegaste a la oleada '+m.wave+' · '+pl.kills+' kills',place:c*40,pl:'Oleadas superadas ('+c+')',medal:'★'};}
 return{win:rank===1};}
function edgeArrow(c,wx,wy,col,always){const m=M,S=m.S,sx=VW/2+(wx-m.cam.x)*S,sy=VH/2+(wy-m.cam.y)*S;if(!always&&sx>40&&sx<VW-40&&sy>40&&sy<VH-40)return;
 const dx=sx-VW/2,dy=sy-VH/2,a=Math.atan2(dy,dx),k=Math.min((VW/2-30)/Math.abs(Math.cos(a)||1e-3),(VH/2-30)/Math.abs(Math.sin(a)||1e-3),Math.hypot(dx,dy)),ax=VW/2+Math.cos(a)*k,ay=VH/2+Math.sin(a)*k;
 c.save();c.translate(ax,ay);c.rotate(a);c.fillStyle=col;c.strokeStyle='#fff';c.lineWidth=2.5;c.lineJoin='round';c.beginPath();c.moveTo(17,0);c.lineTo(-10,-12);c.lineTo(-4,0);c.lineTo(-10,12);c.closePath();c.fill();c.stroke();c.restore();}
function modeHud(c,k){const m=M,pl=m.pl,id=m.mode;if(id==='ffa')return;const{small,F,INK,CORAL,SUN,MINT,T,pill}=k;
 const th=small?36:46,y=T+th+8,fh=small?24:28,fz='700 '+(small?13:16)+'px '+F,DK='rgba(22,27,32,.82)';c.textBaseline='alphabetic';
 if(id==='team'){const w=small?78:100,g=6,h2=fh+4;for(let i=0;i<2;i++){const x=VW/2+(i?g/2:-g/2-w);rq(c,x,y,w,h2,h2/2);c.fillStyle=TEAMC[i];c.fill();c.lineWidth=2.5;c.strokeStyle=INK;c.stroke();c.fillStyle='#fff';c.textAlign='center';c.font='700 '+(small?14:17)+'px '+F;c.fillText((pl.team===i?'★ ':'')+TEAMN[i]+' '+m.ts[i],x+w/2,y+h2*.68);}}
 else if(id==='last'){const alive=m.planes.filter(p=>!p.out).length;pill('Vivos '+alive+'  ·  Vidas '+Math.max(0,pl.lives),VW/2,y,DK,'#fff',fz,fh);
  const z=m.zone;if(z&&pl.alive&&Math.hypot(pl.x-z.x,pl.y-z.y)>z.r){edgeArrow(c,z.x,z.y,'#ff4d3d',true);pill('¡Vuelve a la zona!',VW/2,VH*.2,CORAL,'#fff','700 '+(small?16:22)+'px '+F,small?30:38);}
  else if(z&&m.t<15){pill('La zona se cierra en '+Math.ceil(15-m.t)+' s',VW/2,y+fh+8,'rgba(192,57,43,.85)','#fff','700 '+(small?11:13)+'px '+F,22);}}
 else if(id==='hill'){const h=m.hill,who=h.who;let txt='Colina libre',fill=SUN,col=INK;
  if(h.cont){txt='Colina disputada';fill=CORAL;col='#fff';}else if(who===pl){txt='¡Colina tuya! '+Math.round(pl.hs||0)+' s';fill=MINT;}else if(who){txt='Colina: '+who.name.slice(0,10);fill=DK;col='#fff';}
  pill(txt,VW/2,y,fill,col,fz,fh);pill('Cambia en '+Math.max(0,Math.ceil(h.mv-h.t))+' s',VW/2,y+fh+6,'rgba(22,27,32,.7)','#fff','700 '+(small?10:12)+'px '+F,20);edgeArrow(c,h.x,h.y,'#e0aa22',false);}
 else if(id==='waves'){const foes=m.planes.filter(p=>p.team===1&&!p.out).length;
  pill('Oleada '+m.wave+'  ·  Enemigos '+foes+'  ·  Vidas '+Math.max(0,pl.lives),VW/2,y,DK,'#fff',fz,fh);
  if(m.clr&&m.wave>0&&!m.over)pill('Siguiente oleada en '+Math.max(0,Math.ceil(m.waveT))+' s',VW/2,VH*.26,MINT,INK,'700 '+(small?16:22)+'px '+F,small?30:38);}}
function modeWorld(c,v){const m=M;
 if(m.hill){const h=m.hill,t=m.t,hold=h.who;c.save();c.beginPath();c.arc(h.x,h.y,h.r,0,TAU);c.fillStyle=h.cont?'rgba(192,57,43,.16)':hold?'rgba(127,166,70,.22)':'rgba(224,170,34,.16)';c.fill();
  c.lineWidth=7;c.strokeStyle=h.cont?'#c0392b':hold?'#7fa646':'#e0aa22';c.setLineDash([26,18]);c.lineDashOffset=-t*30;c.stroke();c.setLineDash([]);
  c.lineWidth=3;c.globalAlpha=.5;c.beginPath();c.arc(h.x,h.y,h.r*(.55+.05*Math.sin(t*3)),0,TAU);c.stroke();c.restore();}
 if(m.zone){const z=m.zone;c.save();c.beginPath();c.rect(v.x0-50,v.y0-50,v.x1-v.x0+100,v.y1-v.y0+100);c.arc(z.x,z.y,z.r,0,TAU,true);c.fillStyle='rgba(192,57,43,.28)';c.fill('evenodd');
  c.beginPath();c.arc(z.x,z.y,z.r,0,TAU);c.lineWidth=10;c.strokeStyle='#ff4d3d';c.stroke();c.restore();}}
function modeMini(c,mx,my,mw,mh){const m=M;if(!m.hill&&!m.zone)return;const k=mw/World.w;c.save();c.beginPath();c.rect(mx,my,mw,mh);c.clip();
 if(m.hill){c.beginPath();c.arc(mx+m.hill.x*k,my+m.hill.y*k,Math.max(4,m.hill.r*k),0,TAU);c.fillStyle='rgba(224,170,34,.45)';c.fill();c.lineWidth=2;c.strokeStyle='#e0aa22';c.stroke();}
 if(m.zone){const z=m.zone;c.beginPath();c.rect(mx,my,mw,mh);c.arc(mx+z.x*k,my+z.y*k,z.r*k,0,TAU,true);c.fillStyle='rgba(192,57,43,.4)';c.fill('evenodd');c.beginPath();c.arc(mx+z.x*k,my+z.y*k,z.r*k,0,TAU);c.lineWidth=2;c.strokeStyle='#ff4d3d';c.stroke();}
 c.restore();}

