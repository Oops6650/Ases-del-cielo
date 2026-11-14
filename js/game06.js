'use strict';
/* ===== Partida ===== */
function newMatch(cfg){
 const seedR=Math.random;loadMap(cfg.map,seedR);
 const def=PLANE[cfg.plane],ps=SAVE.planes[cfg.plane];
 M={cfg,t:0,limit:cfg.time*60,over:false,overT:0,paused:false,planes:[],byId:{},bul:[],mis:[],bombs:[],parts:[],picks:[],pop:[],feed:[],bolts:[],decals:[],shake:0,warn:0,deathBy:'',pickT:6,cam:{x:0,y:0},stormPh:{},endTimer:0};
 const pl=makePlane({id:'me',name:'Tú',def,up:ps.up,look:lookOf(cfg.plane),isPlayer:true});M.pl=pl;M.planes.push(pl);
 if(cfg.split>1){M.pls=[pl];M.cams=[M.cam];for(let k=1;k<cfg.split;k++){const ik=cfg.planes&&PLANE[cfg.planes[k-1]]?cfg.planes[k-1]:cfg.plane,pk=SAVE.planes[ik]||ps,q=makePlane({id:'p'+(k+1),name:'J'+(k+1),def:PLANE[ik],up:pk.up,look:lookOf(ik),isPlayer:true});M.pls.push(q);M.cams.push({x:0,y:0});M.planes.push(q);}
  pl.name='J1';M.pl2=M.pls[1];M.split=cfg.split;}
 for(let i=0;i<(cfg.mode==='waves'?0:(cfg.split>1&&cfg.mode==='team'?Math.max(0,cfg.bots+1-cfg.split):cfg.bots));i++)M.planes.push(makeBot(i,cfg.diff));
 modeInit(cfg);if(M.split)splitTeams();
 for(const p of M.planes)M.byId[p.id]=p;
 for(const p of M.planes)spawnPlane(p);
 for(let i=0;i<Math.round(6*World.geoK);i++)pickupSpawn(); /* ★ AMPLIO #5 */
 M.cam.x=pl.x;M.cam.y=pl.y;if(M.pls)for(let k=1;k<M.pls.length;k++){M.cams[k].x=M.pls[k].x;M.cams[k].y=M.pls[k].y;}return M;}
function updateMatch(dt){
 if(M.paused)return;
 World.update(dt);M.t+=dt;M.shake*=Math.max(0,1-6*dt);M.warn=Math.max(0,M.warn-dt);
 if(!M.over&&M.t>=M.limit){M.over=true;M.overT=0;}
 modeTick(dt);
 if(M.over){M.overT+=dt;}
 for(const p of M.planes){if(p.ai&&p.alive&&!M.over)botThink(p,dt);else if(p.ai)Object.assign(p.in,{turn:0,fire:false,sec:false});updPlane(p,dt);}
 for(const st of World.storms){const prev=st.prev===undefined?st.ph:st.prev;if(prev<3.8&&st.ph>=3.8){M.bolts.push({x:st.x,y:st.y,t:.35});if(NET.role==='host')NET.evq.push(['b',Math.round(st.x),Math.round(st.y)]);for(const v of M.planes)if(v.alive&&(v.x-st.x)**2+(v.y-st.y)**2<st.r*st.r)damage(v,45,null,'rayo');M.shake=Math.max(M.shake,3);}st.prev=st.ph;}
 for(let i=M.bolts.length-1;i>=0;i--){M.bolts[i].t-=dt;if(M.bolts[i].t<=0)M.bolts.splice(i,1);}
 updTurrets(dt);
 for(let i=0;i<M.planes.length;i++){const a=M.planes[i];if(!a.alive)continue;for(let j=i+1;j<M.planes.length;j++){const b=M.planes[j];if(!b.alive||a.colCd>0||b.colCd>0||a.inv>0||b.inv>0||a.rollInv>0||b.rollInv>0)continue;
  const dx=a.x-b.x,dy=a.y-b.y;if(dx*dx+dy*dy>32*32)continue;const rv=Math.hypot(Math.cos(a.ang)*a.speed-Math.cos(b.ang)*b.speed,Math.sin(a.ang)*a.speed-Math.sin(b.ang)*b.speed),dm=Math.min(70,12+rv*.07),d=Math.hypot(dx,dy)||1;
  a.colCd=b.colCd=.6;damage(a,dm,b,'colisión');damage(b,dm,a,'colisión');a.x+=dx/d*18;a.y+=dy/d*18;b.x-=dx/d*18;b.y-=dy/d*18;a.speed*=.75;b.speed*=.75;sparks((a.x+b.x)/2,(a.y+b.y)/2,16,'#ffd27a',360,.5);if(a.isPlayer||b.isPlayer){if(a.isPlayer)a.shk=7;if(b.isPlayer)b.shk=7;M.shake=Math.max(M.shake,7);Snd.noise(.25,.1,'col');}}}
 updShots(dt);updWrecks(dt);
 for(const q of M.decals)q.t+=dt;while(M.decals.length&&M.decals[0].t>22)M.decals.shift();
 M.pickT-=dt;if(M.pickT<=0){M.pickT=9;if(M.picks.length<Math.round(8*World.geoK))pickupSpawn(); /* ★ AMPLIO #5 */}
 const pl=M.pl;const k=1-Math.exp(-dt*6.5);const tx=pl.x+Math.cos(pl.ang)*pl.speed*AMPLIO.lookAhead,ty=pl.y+Math.sin(pl.ang)*pl.speed*AMPLIO.lookAhead; /* ★ AMPLIO #9 */M.cam.x+=(tx-M.cam.x)*k;M.cam.y+=(ty-M.cam.y)*k;
 if(M.pls)for(let j=1;j<M.pls.length;j++){const q=M.pls[j],cm=M.cams[j],tx2=q.x+Math.cos(q.ang)*q.speed*AMPLIO.lookAhead,ty2=q.y+Math.sin(q.ang)*q.speed*AMPLIO.lookAhead;cm.x+=(tx2-cm.x)*k;cm.y+=(ty2-cm.y)*k;}
 for(const p of M.planes)if(p.shk)p.shk*=Math.max(0,1-6*dt);
}
function ranking(){const f=M.mode==='last'?(p=>p.out?p.outT:1e9):null;return M.planes.slice().sort((a,b)=>(f?f(b)-f(a):0)||b.score-a.score||b.kills-a.kills||a.deaths-b.deaths);}
function finishMatchBase(){const m=M,pl=m.pl,rk=ranking(),rank=rk.indexOf(pl)+1,n=rk.length,D=DIFFS[m.cfg.diff],fin=modeFin(m,rk,rank),win=fin.win;
 const place=fin.place!==undefined?fin.place:([200,120,70,35][rank-1]||0),mult=D.mult*(.7+.08*(m.mode==='waves'?6:m.cfg.bots))*MODES.find(x=>x.id===m.mode).mult;
 const parts=[['Kills ('+pl.kills+')',pl.kills*25],['Asistencias ('+pl.assists+')',pl.assists*10],['Acrobacias y rachas',Math.round(pl.st.coins)],['Tiempo en el aire',Math.floor(pl.st.alive/6)],[fin.pl||('Puesto '+rank+'.º'),place]];
 if(fin.extra)parts.push(...fin.extra);
 if(win)parts.push(['Victoria',80]);
 const sub=parts.reduce((s,x)=>s+x[1],0),total=Math.round(sub*mult);
 const ds={matches:1,wins:win?1:0,kills:pl.kills,deaths:pl.deaths,assists:pl.assists,loops:pl.st.loops,rolls:pl.st.rolls,flips:pl.st.flips,dodges:pl.st.dodges,nearmiss:pl.st.nearmiss,tricks:pl.st.tricks,playSec:Math.round(pl.st.alive),coinsEarned:total,winsLegend:win&&m.cfg.diff===5?1:0};
 for(const k in ds)SAVE.stats[k]=(SAVE.stats[k]||0)+ds[k];
 SAVE.stats.bestStreak=Math.max(ST('bestStreak'),pl.bestStreak);SAVE.stats.bestScore=Math.max(ST('bestScore'),pl.score);
 ensureDaily();const dp=SAVE.daily.prog;for(const k of['kills','loops','dodges','nearmiss','assists','wins','flips','matches'])dp[k]=(dp[k]||0)+(ds[k]||0);dp.bestStreak=Math.max(dp.bestStreak||0,pl.bestStreak);
 const recs=[];if(SAVE.cheat){/* ★ MEJORA: el modo trucos no cuenta para récords */}else if(m.mode==='waves'&&m.cfg){const wk='waves_'+m.cfg.map,wv=m.cleared||0;if(wv>(SAVE.rec[wk]||0)){if(SAVE.rec[wk])recs.push('Récord de oleadas en este mapa');SAVE.rec[wk]=wv;}}
 const newRec=(k,v,l)=>{if(SAVE.cheat)return;if(v>(SAVE.rec[k]||0)){if(SAVE.rec[k])recs.push(l);SAVE.rec[k]=v;}};
 if(m.mode==='ffa')newRec('score',pl.score,'Puntuación máxima');newRec('kills',pl.kills,'Más kills en una partida');newRec('streak',pl.bestStreak,'Mejor racha');
 SAVE.coins+=total;const gemsGot=Math.min(6,Math.floor(pl.st.tricks/12)+(win?1:0));if(gemsGot)SAVE.gems=(SAVE.gems||0)+gemsGot;
 SAVE.board.push({s:pl.score,k:pl.kills,r:rank,n,plane:m.cfg.plane,map:m.cfg.map,d:m.cfg.diff,date:new Date().toLocaleDateString('es-ES')});SAVE.board.sort((a,b)=>b.s-a.s);SAVE.board=SAVE.board.slice(0,10);
 persist();
 return{title:fin.title,msg:fin.sub,medal:fin.medal,mode:m.mode,rank,n,win,parts,sub,mult,total,gems:gemsGot,rk:rk.map(p=>({name:p.name,score:p.score,kills:p.kills,deaths:p.deaths,assists:p.assists,me:p===pl,team:p.team,plane:p.def.name})),recs,pl:{kills:pl.kills,assists:pl.assists,score:pl.score,streak:pl.bestStreak,loops:pl.st.loops,dodges:pl.st.dodges,nearmiss:pl.st.nearmiss,flips:pl.st.flips,rolls:pl.st.rolls},cfg:m.cfg};}
/* ===== Progresión: nivel de cuenta, pase de batalla, login diario, misiones semanales, tienda ===== */
const GEM='<span class="gem" aria-hidden="true"></span>';
const dayNum=(d)=>{d=d||new Date();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);};
const dayKey=(n)=>{const d=new Date((n===undefined?dayNum():n)*864e5);return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');};

/* --- cosméticos exclusivos (solo se consiguen con pase / pack) --- */
const EXCL=[
 {id:'p1tormenta',name:'Tormenta',c:['#3d4f7a','#1a2238','#7de0ff']},{id:'p1ciber',name:'Ciber',c:['#1d1f2b','#ff2bd6','#2bffe5']},
 {id:'p1ambar',name:'Ámbar',c:['#ffb347','#8a3b12','#fff2cc']},{id:'p1lunar',name:'Lunar',c:['#e6e9f5','#59607a','#b8a6ff']},
 {id:'p1estelar',name:'Estelar',c:['#0f1530','#6a4cff','#ffd34d']},{id:'pionero',name:'Pionero',c:['#f4c20d','#2a2a2a','#ffffff']}];
EXCL.push({id:'p2nebulosa',name:'Nebulosa',c:['#2a1b5e','#d6337a','#7de0ff']},{id:'p2volcan',name:'Volcán',c:['#2b1a16','#ff4a22','#ffd34d']},
 {id:'p2glaciar',name:'Glaciar',c:['#bfe9ff','#2f6fa8','#ffffff']});
for(const e of EXCL)CAT.paint.push({...e,cost:0,ex:true});
/* exclusivos del pase en el resto de categorías (solo se consiguen subiendo de nivel) */
const EXOTHER={pattern:[['galones','Galones'],['pixel','Pixelado'],['cristal','Cristal'],['rafaga','Ráfaga']],
 sticker:[['copo','Copo de nieve'],['yinyang','Equilibrio'],['mariposa','Mariposa'],['espiral','Espiral']],
 trail:[['galaxia','Galaxia'],['lava','Lava'],['prisma','Prisma'],['fantasma','Fantasma']],
 fx:[['supernova','Supernova'],['sakura','Sakura'],['lluvia','Lluvia de luz']],
 acc:[['nimbo','Nimbo'],['cometas','Cometas'],['alado','Alado']]};
for(const k in EXOTHER)for(const[id,name]of EXOTHER[k])CAT[k].push({id,name,cost:0,ex:true});

/* --- nivel de cuenta --- */
const xpNeed=l=>120+(l-1)*30;
function levelOf(xp){let l=1;while(xp>=xpNeed(l)){xp-=xpNeed(l);l++;}return{l,cur:xp,need:xpNeed(l)};}
const levelReward=l=>({coins:80+l*15,gems:l%5===0?20:(l%2===0?5:0)});

/* --- pase de batalla --- */
const TIERS=40,TIER_XP=260,SEASON_LEN=42,SEASON_EPOCH=Math.floor(Date.UTC(2026,10,2)/864e5);
const SEASONS=['Tormenta de Estrellas','Aurora Boreal','Cañón de Fuego','Mar de Nubes'];
function seasonInfo(){const n=dayNum(),idx=Math.max(0,Math.floor((n-SEASON_EPOCH)/SEASON_LEN)),end=SEASON_EPOCH+(idx+1)*SEASON_LEN;return{idx,name:SEASONS[idx%SEASONS.length],left:Math.max(0,end-n)};}
const FREE_SP={5:{t:'item',cat:'sticker',id:'espiral'},10:{t:'item',cat:'paint',id:'p2glaciar'},15:{t:'item',cat:'trail',id:'fantasma'},20:{t:'gems',n:60},25:{t:'item',cat:'pattern',id:'rafaga'},30:{t:'item',cat:'fx',id:'lluvia'},35:{t:'item',cat:'acc',id:'alado'},40:{t:'gems',n:100}};
const PREM_SP={1:{t:'item',cat:'paint',id:'p1tormenta'},3:{t:'item',cat:'sticker',id:'copo'},4:{t:'item',cat:'pattern',id:'galones'},6:{t:'item',cat:'trail',id:'galaxia'},
 8:{t:'item',cat:'acc',id:'nimbo'},10:{t:'item',cat:'fx',id:'sakura'},12:{t:'item',cat:'paint',id:'p1ciber'},14:{t:'item',cat:'sticker',id:'yinyang'},16:{t:'item',cat:'pattern',id:'pixel'},
 18:{t:'item',cat:'trail',id:'lava'},20:{t:'item',cat:'paint',id:'p1ambar'},22:{t:'item',cat:'acc',id:'cometas'},24:{t:'item',cat:'fx',id:'supernova'},26:{t:'item',cat:'sticker',id:'mariposa'},
 28:{t:'item',cat:'pattern',id:'cristal'},30:{t:'item',cat:'trail',id:'prisma'},32:{t:'item',cat:'paint',id:'p1lunar'},34:{t:'item',cat:'paint',id:'p2nebulosa'},
 36:{t:'item',cat:'paint',id:'p2volcan'},40:{t:'item',cat:'paint',id:'p1estelar'}};
const PASS=[];for(let t=1;t<=TIERS;t++)PASS.push({free:FREE_SP[t]||{t:'coins',n:60+t*6},prem:PREM_SP[t]||(t%2===0?{t:'gems',n:10}:{t:'coins',n:150+t*8})});
function itemOf(cat,id){return CAT[cat].find(x=>x.id===id);}
function rewardTxt(r){return r.t==='coins'?nf(r.n)+' monedas':r.t==='gems'?nf(r.n)+' gemas':(itemOf(r.cat,r.id)||{name:r.id}).name;}
function rewardIcon(r){if(r.t==='coins')return coin;if(r.t==='gems')return GEM;return itemOf(r.cat,r.id)?thImg(r.cat,r.id):'';}
function grant(r,silent){if(r.t==='coins')SAVE.coins+=r.n;else if(r.t==='gems')SAVE.gems+=r.n;
 else{const it=itemOf(r.cat,r.id);if(SAVE.own[r.cat][r.id]||(it&&it.cost===0&&!it.ex&&!it.ach&&!it.gem)){const v=Math.round(((it&&(it.cost||(it.gem||0)*25))||100)*.5);SAVE.coins+=v;if(!silent)toast('Ya lo tenías: +'+v+' monedas');}else SAVE.own[r.cat][r.id]=1;}}
function ensureSeason(){const s=seasonInfo(),P=SAVE.pass;if(P.season===s.idx)return s;
 if(P.season>=0){const tier=Math.min(TIERS,Math.floor(P.xp/TIER_XP));for(let t=1;t<=tier;t++){if(!P.free[t]){grant(PASS[t-1].free,true);}if(P.prem&&!P.pre[t]){grant(PASS[t-1].prem,true);}}}
 SAVE.pass={season:s.idx,xp:0,prem:0,free:{},pre:{}};persist();return s;}
const passTier=()=>Math.min(TIERS,Math.floor(SAVE.pass.xp/TIER_XP));
function passClaimable(){ensureSeason();const P=SAVE.pass,tier=passTier();let n=0;for(let t=1;t<=tier;t++){if(!P.free[t])n++;if(P.prem&&!P.pre[t])n++;}return n;}
function claimTier(t,side){const P=SAVE.pass;if(t>passTier())return false;if(side==='f'){if(P.free[t])return false;P.free[t]=1;grant(PASS[t-1].free);}else{if(!P.prem||P.pre[t])return false;P.pre[t]=1;grant(PASS[t-1].prem);}persist();return true;}
function addPassXP(n){ensureSeason();const P=SAVE.pass,t0=passTier();P.xp=Math.min(TIERS*TIER_XP,P.xp+n);return{t0,t1:passTier()};}
function spendGems(n){if(SAVE.cheat)return true;if(SAVE.gems<n)return false;SAVE.gems-=n;return true;}

/* --- XP de cuenta --- */
function addXP(n){const l0=levelOf(SAVE.xp).l;SAVE.xp+=n;const l1=levelOf(SAVE.xp).l,rw=[];
 for(let l=l0+1;l<=l1;l++){const r=levelReward(l);SAVE.coins+=r.coins;SAVE.gems+=r.gems;rw.push({l,coins:r.coins,gems:r.gems});}return{l0,l1,rw};}

/* --- login diario --- */
const LOGIN=[{coins:100},{coins:150},{gems:10},{coins:250},{gems:15},{coins:400},{coins:500,gems:40}];
function loginIdx(){const L=SAVE.login,t=dayNum(),last=L.last?L.last:-99;if(last===t)return{idx:L.streak%7,ready:false};return{idx:(last===t-1?L.streak:0)%7,ready:true};}
function claimLogin(){const s=loginIdx();if(!s.ready)return null;const L=SAVE.login,t=dayNum(),r=LOGIN[s.idx];L.streak=(L.last===t-1?L.streak:0)+1;L.last=t;SAVE.coins+=r.coins||0;SAVE.gems+=r.gems||0;persist();return r;}

/* --- misiones semanales (dan XP de pase y gemas) --- */
const WEEKLY=[
 {k:'kills',t:'Derriba {n} aviones',n:50,pxp:500,gems:20},{k:'wins',t:'Gana {n} partidas',n:3,pxp:600,gems:25},{k:'loops',t:'Completa {n} bucles',n:40,pxp:400,gems:15},
 {k:'matches',t:'Juega {n} partidas',n:12,pxp:500,gems:15},{k:'dodges',t:'Esquiva {n} disparos con roll',n:30,pxp:450,gems:15},{k:'nearmiss',t:'Haz {n} pasadas rasantes',n:80,pxp:400,gems:15},{k:'assists',t:'Consigue {n} asistencias',n:30,pxp:450,gems:15}];
const weekNum=()=>Math.floor((dayNum()+3)/7);
function weeklyList(){const w=weekNum();if(SAVE.weekly.wk!==w)SAVE.weekly={wk:w,prog:{},claimed:{}};const r=mulberry(hashStr('sem'+w)),pool=WEEKLY.slice(),out=[];
 for(let i=0;i<3;i++){const q=pool.splice(Math.floor(r()*pool.length),1)[0];out.push({...q,id:'w'+w+q.k,text:q.t.replace('{n}',q.n),got:Math.min(q.n,SAVE.weekly.prog[q.k]||0)});}return out;}
function claimWeekly(id){const q=weeklyList().find(x=>x.id===id);if(!q||q.got<q.n||SAVE.weekly.claimed[id])return false;SAVE.weekly.claimed[id]=1;SAVE.gems+=q.gems;addPassXP(q.pxp);persist();return q;}

/* --- tienda: TODO se paga con moneda del juego (monedas y gemas se ganan jugando; no hay dinero real) --- */
const GEMSHOP=[{id:'x1',coins:600,gems:100},{id:'x2',coins:1350,gems:250,tag:'+11%'},{id:'x3',coins:2800,gems:550,tag:'+18%'},{id:'x4',coins:5000,gems:1100,tag:'Mejor valor'}];
const BUNDLES=[
 {id:'elite',name:'Pack Piloto de élite',off:30,items:[['paint','cromo'],['trail','arcoiris'],['acc','aureola']]},
 {id:'fiesta',name:'Pack Fiesta',off:30,items:[['fx','fuegos'],['sticker','corona'],['pattern','llamas']]},
 {id:'noche',name:'Pack Nocturno',off:25,items:[['paint','noche'],['trail','neon'],['acc','luces']]}];
const bundleOwned=b=>b.items.every(([c,i])=>SAVE.own[c][i]);
const bundleWas=b=>b.items.reduce((s,[c,i])=>s+(SAVE.own[c][i]?0:itemOf(c,i).cost),0);
const bundleNow=b=>Math.round(bundleWas(b)*(100-b.off)/1000)*10;
const PASS_GEMS=950,TIER_GEMS=60;
const STARTER={price:250,gems:25,off:73,was:930,items:[['paint','pionero'],['trail','neon'],['sticker','estrella']]};
function spendCoins(n){if(SAVE.cheat)return true;if(SAVE.coins<n)return false;SAVE.coins-=n;return true;}
const eligible=()=>{const a=[];for(const[c]of CATS)for(const it of CAT[c])if(it.cost>=100&&!it.ach&&!it.ex)a.push({kind:'item',cat:c,id:it.id,name:it.name,cost:it.cost});return a;};
/* Elección estable: mezcla con semilla y toma los que no tienes aún o ya comprados en este periodo (así la oferta no cambia al comprarla) */
function pickStable(pool,seed,keyOf,owned,n){const r=mulberry(hashStr(seed)),arr=pool.slice();
 for(let i=arr.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
 const out=[];for(const o of arr){if(out.length>=n)break;if(!owned(o)||SAVE.shop.sold[keyOf(o)])out.push(o);}return out;}
const ownedCat=o=>ownedItem(o.cat,itemOf(o.cat,o.id));
const FLASH_H=6,flashSlot=()=>Math.floor(Date.now()/(FLASH_H*36e5)),flashEnd=()=>(flashSlot()+1)*FLASH_H*36e5;
function flashOffer(){const k=flashSlot(),pk=o=>'f'+k+o.cat+o.id,r=pickStable(eligible().filter(o=>o.cost>=200),'flash'+k,pk,ownedCat,1)[0];if(!r)return null;
 return{...r,off:50,price:Math.round(r.cost*.5/10)*10,key:pk(r),sold:!!SAVE.shop.sold[pk(r)]};}
const DAILY_OFF=[35,25,20,15];
function dailyOffers(){const k=dayKey(),fl=flashOffer(),pool=eligible().filter(o=>!(fl&&fl.cat===o.cat&&fl.id===o.id)),ky=o=>k+o.cat+o.id;
 return pickStable(pool,'tienda'+k,ky,ownedCat,4).map((o,i)=>({...o,off:DAILY_OFF[i],price:Math.round(o.cost*(100-DAILY_OFF[i])/1000)*10,key:ky(o),sold:!!SAVE.shop.sold[ky(o)]}));}
function weeklyDeal(){const w=weekNum(),pool=[];
 for(const p of PLANES)if(p.cost>0)pool.push({kind:'plane',id:p.id,name:p.name,cost:p.cost});
 for(const m of MAPDEF)if(m.cost>0)pool.push({kind:'map',id:m.id,name:m.name,cost:m.cost});
 const key=o=>'w'+w+o.kind+o.id,r=pickStable(pool,'deal'+w,key,o=>o.kind==='plane'?planeOwned(o.id):mapOwned(o.id),1)[0];if(!r)return null;
 return{...r,off:25,price:Math.round(r.cost*.75/10)*10,key:key(r),sold:!!SAVE.shop.sold[key(r)]};}
/* precios con la oferta semanal aplicada (también en Garaje y Mapas) */
const planePrice=id=>{const d=weeklyDeal();return d&&!d.sold&&d.kind==='plane'&&d.id===id?d.price:PLANE[id].cost;};
const mapPrice=id=>{const d=weeklyDeal();return d&&!d.sold&&d.kind==='map'&&d.id===id?d.price:MAPD[id].cost;};
function markDeal(kind,id){const d=weeklyDeal();if(d&&d.kind===kind&&d.id===id)SAVE.shop.sold[d.key]=1;}
function fmtLeft(ms){const m=Math.max(1,Math.ceil(ms/6e4)),hh=Math.floor(m/60);if(hh>=24)return Math.floor(hh/24)+' d '+(hh%24)+' h';return hh>0?hh+' h '+String(m%60).padStart(2,'0')+' min':m+' min';}

/* --- fin de partida: XP, pase, semanales --- */
function finishMatch(){const r=finishMatchBase();ensureSeason();
 let xp=Math.round(r.total*.5)+30;const lines=[['Partida',xp]];
 if(SAVE.xpDay!==dayNum()){SAVE.xpDay=dayNum();lines.push(['Primera partida del día ×2',xp]);xp*=2;}
 const wk=weeklyList();const add=(k,v)=>{SAVE.weekly.prog[k]=(SAVE.weekly.prog[k]||0)+v;};
 add('kills',r.pl.kills);add('loops',r.pl.loops);add('dodges',r.pl.dodges);add('nearmiss',r.pl.nearmiss);add('assists',r.pl.assists);add('matches',1);if(r.win)add('wins',1);
 const a=addXP(xp),p=addPassXP(xp);persist();
 r.prog={xp,lines,l0:a.l0,l1:a.l1,rw:a.rw,t0:p.t0,t1:p.t1,lv:levelOf(SAVE.xp),pt:passTier()};return r;}
