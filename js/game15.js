'use strict';
/* ===================================================================
   ONLINE · multijugador P2P (WebRTC con PeerJS)
   El anfitrión ejecuta toda la simulación. Los invitados envían sus
   controles y reciben instantáneas (20/s) que dibujan con el mismo motor.
   Sin servidor propio: vale para GitHub Pages.
   =================================================================== */
const NET={on:false,role:null,state:'idle',code:'',myId:null,name:'',peer:null,conn:null,players:[],gid:0,L:null,inMatch:false,evq:[],acc:0,inAcc:0,got:false,lat:.05,err:'',local:false,pingT:0,seen:{}};
try{NET.local=/[?&]local\b/.test(location.search);NET.demo=!(NET.local||/[?&]online\b/.test(location.search)||/(^|\.)github\.io$/i.test(location.hostname)||/^(localhost|127\.0\.0\.1)$/.test(location.hostname));}catch(e){NET.demo=true;}
const NET_MAX=8,NET_MODES=['ffa','team','last','hill'];
const r2n=v=>Math.round((+v||0)*100)/100;
const netCode=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return s;};
function mulb(a){return function(){a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function cleanProf(p,fb){p=p&&typeof p==='object'?p:{};const o={};
 o.name=String(p.name||'').replace(/[\u0000-\u001f<>&"\\]/g,'').trim().slice(0,14)||fb;
 o.plane=PLANE[p.plane]?p.plane:'halcon';
 const up={},pu=p.up&&typeof p.up==='object'?p.up:{};for(const[k]of UPS)up[k]=clamp(Math.floor(+pu[k])||0,0,5);o.up=up;
 const lk={},pl=p.look&&typeof p.look==='object'?p.look:{};for(const k in DEFLOOK)lk[k]=(CAT[k]||[]).some(x=>x.id===pl[k])?pl[k]:DEFLOOK[k];o.look=lk;return o;}
function netProfile(){const pid=planeOwned(SAVE.sel.plane)?SAVE.sel.plane:'halcon';let nm=NET.name;
 return{name:nm,plane:pid,up:(SAVE.planes[pid]||{}).up||{},look:lookOf(pid)};}

/* ---------- transporte ---------- */
function wrapPeer(c){const w={send(o){try{if(c.open)c.send(o);}catch(e){}},close(){try{c.close();}catch(e){}},onmessage:null,onclose:null,onopen:null};
 c.on('data',d=>{w.onmessage&&w.onmessage(d);});c.on('close',()=>{w.onclose&&w.onclose();});c.on('error',()=>{w.onclose&&w.onclose();});
 if(c.open)setTimeout(()=>w.onopen&&w.onopen());else c.on('open',()=>w.onopen&&w.onopen());return w;}
function mkLoop(bc,to,from){const w={send(o){try{bc.postMessage({to,from,k:'d',d:o});}catch(e){}},close(){try{bc.postMessage({to,from,k:'bye'});}catch(e){}},onmessage:null,onclose:null,onopen:null};return w;}
function trHost(code,cb){
 if(code[0]==='L'){const bc=new BroadcastChannel('ases-'+code),cs={};
  bc.onmessage=e=>{const m=e.data;if(!m||m.to!=='host')return;
   if(m.k==='hi'){const w=mkLoop(bc,m.from,'host');cs[m.from]=w;cb.conn(w);bc.postMessage({to:m.from,from:'host',k:'ok'});setTimeout(()=>w.onopen&&w.onopen());}
   else if(cs[m.from]){if(m.k==='d')cs[m.from].onmessage&&cs[m.from].onmessage(m.d);else if(m.k==='bye'){const w=cs[m.from];delete cs[m.from];w.onclose&&w.onclose();}}};
  NET.peer={destroy(){for(const k in cs){cs[k].close();}try{bc.close();}catch(e){}}};setTimeout(()=>cb.open());return;}
 if(typeof Peer==='undefined'){cb.err('lib');return;}
 let peer;try{peer=new Peer('ases-'+code,{debug:0});}catch(e){cb.err('lib');return;}
 NET.peer=peer;peer.on('open',()=>cb.open());peer.on('connection',c=>cb.conn(wrapPeer(c)));peer.on('error',e=>cb.err(e&&e.type||'error'));peer.on('disconnected',()=>{try{peer.reconnect();}catch(e){}});}
function trJoin(code,cb){
 if(code[0]==='L'){const bc=new BroadcastChannel('ases-'+code),id='c'+Math.random().toString(36).slice(2,8),w=mkLoop(bc,'host',id);let ok=false;
  bc.onmessage=e=>{const m=e.data;if(!m||m.to!==id)return;if(m.k==='ok'){ok=true;w.onopen&&w.onopen();}else if(m.k==='d')w.onmessage&&w.onmessage(m.d);else if(m.k==='bye')w.onclose&&w.onclose();};
  NET.peer={destroy(){try{bc.close();}catch(e){}}};cb.conn(w);bc.postMessage({to:'host',from:id,k:'hi'});setTimeout(()=>{if(!ok)cb.err('peer-unavailable');},2500);return;}
 if(typeof Peer==='undefined'){cb.err('lib');return;}
 let peer;try{peer=new Peer({debug:0});}catch(e){cb.err('lib');return;}
 NET.peer=peer;let opened=false;
 peer.on('open',()=>{const c=peer.connect('ases-'+code,{reliable:true,serialization:'json'});const w=wrapPeer(c);const o=w.onopen;cb.conn(w);setTimeout(()=>{if(!opened)cb.err('timeout');},15000);});
 peer.on('error',e=>cb.err(e&&e.type||'error'));
 NET._opened=()=>{opened=true;};}
function netErrTxt(e){return({'peer-unavailable':'No existe esa sala. Revisa el código.','unavailable-id':'Código ocupado, inténtalo otra vez.','lib':'No se pudo iniciar la red en este navegador.','timeout':'No se pudo conectar (¿red o cortafuegos?).','network':'Sin conexión con el servidor de salas.','server-error':'El servidor de salas no responde.','socket-error':'El servidor de salas no responde.','socket-closed':'Se perdió la conexión con el servidor de salas.','browser-incompatible':'Tu navegador no admite WebRTC.'})[e]||('Error de red ('+e+')');}

/* ---------- sala (anfitrión) ---------- */
function netDefaultCfg(){return{mode:'ffa',map:SAVE.sel.map,time:3,diff:2,total:6,tod:'auto'};}
function netDemo(role,code){netReset(false);NET.role=role;NET.on=true;NET.state='room';NET.demo=true;const pr=cleanProf(netProfile(),'Piloto'),rp=()=>pick(PLANES).id,nm=()=>netUniq(genName(),'x');
 NET.code=role==='host'?netCode():(String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'')||'DEMO1');NET.L={cfg:netDefaultCfg()};
 if(role==='host'){NET.myId='me';NET.players=[{id:'me',...pr,conn:null}];}else{NET.myId='g1';NET.players=[{id:'me',name:nm(),plane:rp(),up:{},look:{}},{id:'g1',...pr,conn:null}];}
 NET.gid=5;netUI(true);
 NET.dt=setInterval(()=>{if(!NET.demo||NET.state!=='room'){clearInterval(NET.dt);return;}
  if(NET.players.length<4){NET.players.push({id:'g'+(++NET.gid),name:nm(),plane:rp(),up:{},look:{}});}
  else if(role==='guest'){const c=NET.L.cfg,o=netOpts('map',c),i=o.findIndex(x=>x[0]===c.map);c.map=o[(i+1)%o.length][0];}
  netPatch();},2600);}
function netCreate(){if(NET.demo){netDemo('host');return;}netReset(false);NET.role='host';NET.state='connecting';NET.err='';netUI();
 const tryOnce=(n)=>{const code=(NET.local?'L':'')+netCode();
  trHost(code,{open(){NET.code=code;NET.on=true;NET.state='room';NET.myId='me';NET.L={cfg:netDefaultCfg()};NET.players=[{id:'me',...cleanProf(netProfile(),'Piloto'),conn:null}];netLobbySend();netUI();},
   conn:netHostAccept,
   err(e){if(e==='unavailable-id'&&n<4){try{NET.peer&&NET.peer.destroy();}catch(x){}tryOnce(n+1);return;}if(NET.state==='connecting'||!NET.on){NET.err=netErrTxt(e);netReset(true);netUI();}else{toast(netErrTxt(e));}}});};
 tryOnce(0);}
function netHostAccept(c){let pid=null;
 c.onmessage=m=>{if(!m||typeof m!=='object')return;
  if(m.t==='hello'){if(NET.inMatch){c.send({t:'full',why:'Partida en curso'});setTimeout(()=>c.close(),300);return;}if(NET.players.length>=NET_MAX){c.send({t:'full',why:'Sala llena'});setTimeout(()=>c.close(),300);return;}
   pid='g'+(++NET.gid);const pr=cleanProf(m.p,'Piloto');pr.name=netUniq(pr.name,pid);NET.players.push({id:pid,...pr,conn:c});c.send({t:'welcome',id:pid});netLobbySend();netPatch();return;}
  if(!pid)return;const pl=NET.players.find(p=>p.id===pid);if(!pl)return;
  if(m.t==='prof'){const pr=cleanProf(m.p,pl.name);Object.assign(pl,{plane:pr.plane,up:pr.up,look:pr.look});if(pr.name!==pl.name)pl.name=netUniq(pr.name,pid);netLobbySend();netPatch();}
  else if(m.t==='in')netHostInput(pid,m);
  else if(m.t==='ping')c.send({t:'pong',c:m.c});
  else if(m.t==='bye')c.close();};
 c.onclose=()=>{if(pid)netHostDrop(pid);};}
function netUniq(nm,pid){let n=nm,i=2;while(NET.players.some(p=>p.id!==pid&&p.name===n))n=nm.slice(0,12)+' '+(i++);return n;}
function netHostDrop(pid){const i=NET.players.findIndex(p=>p.id===pid);if(i<0)return;const pl=NET.players[i];NET.players.splice(i,1);
 if(NET.inMatch&&M){const p=M.byId[pid];if(p){p.remote=false;p.in.fire=false;p.ai={escape:0,escT:0,d:DIFFS[Math.max(1,M.cfg.diff||3)],pers:PERS[0].id,state:'patrol',t:0,fireT:0,stT:0,manT:0,side:1,err:0,tg:null,threat:null,dsel:Math.max(1,M.cfg.diff||3),loop:0};M.feed.push({t:M.t,a:null,v:p.name+' se fue',k:'',ap:false,vp:false});}}
  netLobbySend();netPatch();}
function netLobbyView(){return{t:'lobby',cfg:NET.L.cfg,pl:NET.players.map(p=>({id:p.id,name:p.name,plane:p.plane}))};}
function netLobbySend(){if(NET.role!=='host')return;const m=netLobbyView();for(const p of NET.players)if(p.conn)p.conn.send(m);}
function netBcast(o){for(const p of NET.players)if(p.conn)p.conn.send(o);}

/* ---------- sala (invitado) ---------- */
function netJoin(code){if(NET.demo){netDemo('guest',code);return;}code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){NET.err='Escribe el código de la sala.';netUI();return;}
 netReset(false);NET.role='guest';NET.state='connecting';NET.code=code;NET.err='';netUI();
 trJoin(code,{conn(c){NET.conn=c;
   c.onopen=()=>{if(NET._opened)NET._opened();c.send({t:'hello',p:netProfile()});};
   c.onmessage=netGuestMsg;
   c.onclose=()=>{if(NET.role==='guest'&&NET.on||NET.state==='connecting'){const was=NET.inMatch;netReset(true);if(was)quitGame();toast('Se perdió la conexión con la sala');netUI();}};},
  err(e){NET.err=netErrTxt(e);netReset(true);netUI();}});}
function netGuestMsg(m){if(!m||typeof m!=='object')return;
 if(m.t==='welcome'){NET.myId=m.id;NET.on=true;}
 else if(m.t==='full'){NET.err=m.why||'Sala llena';netReset(true);netUI();}
 else if(m.t==='lobby'){NET.L={cfg:m.cfg};NET.players=m.pl;NET.state='room';if(!NET.inMatch){const e=$('ol');if(e&&!e.hidden&&!e.querySelector('#olPl'))netUI();else netPatch();}}
 else if(m.t==='start')netGuestStart(m);
 else if(m.t==='s')netGuestSnap(m);
 else if(m.t==='abort'){if(NET.inMatch){NET.inMatch=false;quitGame();toast('El anfitrión ha terminado la partida');}}
 else if(m.t==='pong'){const rtt=(performance.now()-m.c)/1000;NET.lat=clamp(rtt/2,.01,.35);NET.rtt=Math.round(rtt*1000);}}
function netReset(keepUI){clearInterval(NET.dt);try{if(NET.role==='host'){for(const p of NET.players)if(p.conn)p.conn.close();}else if(NET.conn){NET.conn.send({t:'bye'});NET.conn.close();}}catch(e){}
 try{NET.peer&&NET.peer.destroy();}catch(e){}
 Object.assign(NET,{on:false,role:null,state:'idle',code:'',myId:null,peer:null,conn:null,players:[],gid:0,L:null,inMatch:false,evq:[],got:false});}
function netLeave(){const was=NET.inMatch;netReset(true);netCloseUI();if(was&&running)quitGame();}

/* ---------- comienzo de partida ---------- */
function netHostStart(){if(NET.role!=='host'||NET.inMatch)return;if(NET.demo){toast('Simulación: aquí empezaría la partida con tus amigos');return;}const cfg0=NET.L.cfg,H=NET.players;
 let total=clamp(cfg0.total,Math.max(2,H.length),NET_MAX);if(cfg0.mode==='team'&&total%2)total=Math.min(NET_MAX,total+1);if(total<H.length)total=H.length;
 const nb=total-H.length,seed=Math.floor(Math.random()*2147483647);
 const cfg={plane:H[0].plane,map:cfg0.map,mode:cfg0.mode,time:cfg0.time,diff:cfg0.diff,bots:total-1,tod:cfg0.tod==='auto'?null:cfg0.tod};
 const planes=H.map(h=>{const p=makePlane({id:h.id,name:h.name,def:PLANE[h.plane],up:h.up,look:h.look,isPlayer:h.id==='me'});p.remote=h.id!=='me';return p;});
 for(let i=0;i<nb;i++)planes.push(makeBot(i,cfg.diff));{const used=new Set(H.map(h=>h.name));for(const p of planes)if(p.ai){while(used.has(p.name))p.name=p.name.slice(0,12)+' II';used.add(p.name);}}
 stopPrev();netInitMatch(cfg,planes,'me','host',seed);
 const roster=M.planes.map(p=>({id:p.id,name:p.name,plane:p.def.id,up:p.upv||{},look:p.look,hp:p.maxHp,team:p.team,bot:p.ai?1:0}));
 for(const h of H)if(h.conn)h.conn.send({t:'start',cfg,seed,roster,you:h.id});
 NET.inMatch=true;NET.acc=0;NET.evq=[];netCloseUI();netRun();setTimeout(()=>{try{popup('Online: los obstáculos no se esculpen','#9be7ff');}catch(e){}},1500);}
function netGuestStart(m){if(NET.inMatch||NET.role!=='guest')return;
 const planes=m.roster.map(r=>{const p=makePlane({id:r.id,name:String(r.name).slice(0,14),def:PLANE[r.plane]||PLANE.halcon,up:r.up,look:cleanProf({look:r.look},'x').look,isPlayer:r.id===m.you});p.maxHp=+r.hp||p.maxHp;p.hp=p.maxHp;p.team=r.team;p.ai=null;p.alive=false;p.gotPos=false;return p;});
 stopPrev();netInitMatch(m.cfg,planes,m.you,'guest',m.seed);NET.inMatch=true;NET.got=false;NET.inAcc=0;NET.pingT=0;netCloseUI();netRun();setTimeout(()=>{try{popup('Online: los obstáculos no se esculpen','#9be7ff');}catch(e){}},1500);}
function netInitMatch(cfg,planes,myId,role,seed){
 const old=Math.random;Math.random=mulb(seed);try{loadMap(cfg.map,Math.random);}finally{Math.random=old;}
 M={cfg,t:0,limit:cfg.time*60,over:false,overT:0,paused:false,planes:[],byId:{},bul:[],mis:[],bombs:[],parts:[],picks:[],pop:[],feed:[],bolts:[],decals:[],shake:0,warn:0,deathBy:'',pickT:6,cam:{x:0,y:0},stormPh:{},endTimer:0,net:true,tod:cfg.tod||null};
 M.planes=planes;for(const p of planes){M.byId[p.id]=p;}M.pl=M.byId[myId];
 if(role==='host'){modeInit(cfg);
  if(cfg.mode==='team'){const half=planes.length/2,cnt=[0,0];for(const p of planes.filter(p=>!p.ai)){const t=cnt[0]<=cnt[1]?0:1;p.team=t;cnt[t]++;}for(const p of planes.filter(p=>p.ai)){const t=cnt[0]<half?0:1;p.team=t;cnt[t]++;}}
  for(const p of planes)spawnPlane(p);for(let i=0;i<Math.round(6*World.geoK);i++)pickupSpawn();}
 else{M.mode=cfg.mode||'ffa';M.teams=M.mode==='team';M.ts=[0,0];M.wave=0;M.cleared=0;M.clr=true;M.hill=M.mode==='hill'?{x:World.w/2,y:World.h/2,r:700,t:0,mv:40,who:null,cont:false}:null;M.zone=M.mode==='last'?{x:World.w/2,y:World.h/2,r:Math.hypot(World.w,World.h)*.55}:null;}
 M.cam.x=M.pl.x;M.cam.y=M.pl.y;return M;}
function netRun(){try{document.activeElement&&document.activeElement.blur();}catch(e){}Snd.init();Snd.on=!!SAVE.cfg.sound;
 gameEl.hidden=false;pauseEl.hidden=true;document.documentElement.style.overflow='hidden';resize();buildMini();resultShown=false;running=true;last=performance.now();
 pressed.clear();tokH.length=0;for(const k in tk)tk[k]=false;if(window.stickReset)stickReset();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}

/* ---------- entrada de los invitados → anfitrión ---------- */
function netHostInput(pid,m){if(!NET.inMatch||!M)return;const p=M.byId[pid];if(!p||!p.remote||!m||typeof m!=='object')return;const I=p.in;
 /* ★ MEJORA: límite de ritmo (máx. ~40 paquetes/s y 6 acciones puntuales/s por jugador) contra clientes abusivos */
 const nw=performance.now(),rl=p._rl||(p._rl={t:nw,n:0,a:0,at:nw});if(nw-rl.t>1000){rl.t=nw;rl.n=0;}if(++rl.n>40)return;
 const act=(m.roll||m.flip||m.sp||m.dash||m.mv)?1:0;if(act){if(nw-rl.at>1000){rl.at=nw;rl.a=0;}if(++rl.a>6){m={turn:m.turn,boost:m.boost,fire:m.fire,sec:m.sec,rd:m.rd};}}
 I.turn=clamp(+m.turn||0,-1,1);I.boost=!!m.boost;I.fire=!!m.fire;I.sec=!!m.sec;I.brake=false;
 if(m.rd)I.rollDir=m.rd>0?1:-1;
 if(m.roll)I.roll=true;if(m.flip)I.flip=true;if(m.sp)I.sp=true;if(m.dash)I.dash=true;
 if(typeof m.mv==='string'&&MOVES.some(x=>x.id===m.mv))I.mv=m.mv;}
function netSendInput(dt){NET.inAcc+=dt;NET.pingT+=dt;if(NET.pingT>2){NET.pingT=0;NET.conn&&NET.conn.send({t:'ping',c:performance.now()});}
 if(NET.inAcc<.033)return;NET.inAcc=0;const I=M.pl.in,o={t:'in',turn:I.turn||0,boost:+!!I.boost,fire:+!!I.fire,sec:+!!I.sec};
 if(I.rollDir)o.rd=I.rollDir;
 if(I.roll){o.roll=1;I.roll=false;}if(I.flip){o.flip=1;I.flip=false;}if(I.sp){o.sp=1;I.sp=false;}if(I.dash){o.dash=1;I.dash=false;}if(I.mv){o.mv=I.mv;I.mv=null;}
 NET.conn&&NET.conn.send(o);}

/* ---------- instantáneas ---------- */
const PF=['x','y','ang','speed','angVel','hp','inv','cloak','shield','rollT','rollD','flash','energy','secAmmo','spCd','spT','heat','rldG','score','kills','deaths','assists','streak','bestStreak','lives','respawn','outT','hs','dashT','cobraT','draft','dir'];
const PBF=['alive','ghost','tonel','boosting','stall','out'];
const PSF=['coins','alive','tricks','loops','rolls','flips','dodges','nearmiss','kills','assists','bestStreak'];
function snapPlane(p){const a=[p.id];for(const k of PF)a.push(r2n(p[k]));let f=0;PBF.forEach((k,i)=>{if(p[k])f|=1<<i;});a.push(f);for(const k of PSF)a.push(r2n(p.st[k]));return a;}
function netHostTick(dt){NET.acc+=dt;if(NET.acc<.05)return;NET.acc=0;const m=M;
 const S={w:r2n(World.t),o:m.over?1:0,
  p:m.planes.map(snapPlane),
  b:m.bul.slice(0,170).map(b=>[r2n(b.x),r2n(b.y),Math.round(b.vx),Math.round(b.vy),b.w,b.col]),
  m:m.mis.map(q=>[Math.round(q.x),Math.round(q.y),r2n(q.ang),Math.round(q.sp)]),
  k:m.bombs.map(b=>[Math.round(b.x),Math.round(b.y)]),
  u:m.picks.map(k=>[Math.round(k.x),Math.round(k.y),k.k,k.exp?r2n(k.exp):0]),
  f:m.feed.map(f=>[r2n(f.t),f.a,f.v,f.k]),
  tu:World.turrets.map(t=>[t.alive?1:0,r2n(t.ang),Math.round(t.hp)]),
  rg:World.rings.map(g=>g.cd>0?1:0).join(''),
  ev:NET.evq.splice(0)};
 if(m.ts)S.ts=m.ts;S.en=m.elimN||0;
 if(m.zone)S.z=[Math.round(m.zone.x),Math.round(m.zone.y),Math.round(m.zone.r)];
 if(m.hill){const h=m.hill;S.h=[Math.round(h.x),Math.round(h.y),h.r,r2n(h.t),h.mv,h.who?h.who.id:null,h.cont?1:0];}
 const msg={t:'s',mt:r2n(m.t),w:S.w,o:S.o,p:S.p,b:S.b,m:S.m,k:S.k,u:S.u,f:S.f,tu:S.tu,rg:S.rg,ev:S.ev,ts:S.ts,en:S.en,z:S.z,h:S.h};
 for(const p of NET.players)if(p.conn)p.conn.send(msg);}
function netGuestSnap(s){if(!NET.inMatch||!M)return;const m=M,now=performance.now();
 m.t=s.mt;World.t=s.w;
 for(const a of s.p){const p=m.byId[a[0]];if(!p)continue;let i=1;const o={};for(const k of PF)o[k]=a[i++];const f=a[i++];const st={};for(const k of PSF)st[k]=a[i++];
  const was=p.alive,alive=!!(f&1);
  const dead=p.hp>o.hp+.5&&p===m.pl;if(dead)m.shake=Math.max(m.shake,4);
  if(p===m.pl){if(st.kills>(p.st.kills||0)){popup('KILL','#ff7a2f');}else if(st.coins>(p.st.coins||0)+4&&NET.got)popup('+'+Math.round(st.coins-p.st.coins)+' ¤','#3fd0c9');}
  for(const k of PF)if(k!=='x'&&k!=='y'&&k!=='ang'&&k!=='dir')p[k]=o[k];
  PBF.forEach((k,j)=>{p[k]=!!(f&(1<<j));});for(const k of PSF)p.st[k]=st[k];
  p.sx=o.x;p.sy=o.y;p.sang=o.ang;p.ssp=o.speed;p.sav=o.angVel;p.sat=now;
  if(!p.gotPos||(!was&&alive)||Math.hypot(p.x-o.x,p.y-o.y)>450){p.x=o.x;p.y=o.y;p.ang=o.ang;p.gotPos=true;if(p.tr)p.tr.length=0;}
  if(was&&!alive){let ek=null;for(let j=m.feed.length-1;j>=0&&!ek;j--)if(m.feed[j].v===p.name)ek=m.feed[j];p.x=p.x||o.x;try{spawnWreck(p,ek&&ek.k||'disparo');}catch(_){}}
  if(was&&!alive&&p===m.pl){let e=null;for(let j=m.feed.length-1;j>=0&&!e;j--)if(m.feed[j].v===p.name)e=m.feed[j];m.deathBy=e?(e.a||e.k||'el terreno'):'el terreno';}}
 const lat=NET.lat;
 m.bul=s.b.map(b=>({x:b[0]+b[2]*lat,y:b[1]+b[3]*lat,px:b[0],py:b[1],vx:b[2],vy:b[3],w:b[4],col:b[5]}));
 m.mis=s.m.map(q=>({x:q[0]+Math.cos(q[2])*q[3]*lat,y:q[1]+Math.sin(q[2])*q[3]*lat,ang:q[2],sp:q[3]}));
 m.bombs=s.k.map(b=>({x:b[0],y:b[1]}));
 m.picks=s.u.map(k=>({x:k[0],y:k[1],k:k[2],exp:k[3]||0,t:m.t}));
 m.feed=s.f.map(f=>({t:f[0],a:f[1],v:f[2],k:f[3],ap:f[1]===m.pl.name,vp:f[2]===m.pl.name}));
 for(let i=0;i<s.tu.length&&i<World.turrets.length;i++){const t=World.turrets[i],q=s.tu[i];t.alive=!!q[0];t.ang=q[1];t.hp=q[2];}
 for(let i=0;i<World.rings.length;i++)World.rings[i].cd=s.rg[i]==='1'?5:0;
 if(s.ts)m.ts=s.ts;m.elimN=s.en||0;
 if(s.z){const z=m.zone||(m.zone={});z.x=s.z[0];z.y=s.z[1];z.r=s.z[2];}
 if(s.h){const h=m.hill||(m.hill={});h.x=s.h[0];h.y=s.h[1];h.r=s.h[2];h.t=s.h[3];h.mv=s.h[4];h.who=s.h[5]?m.byId[s.h[5]]:null;h.cont=!!s.h[6];}
 for(const e of s.ev||[]){if(e[0]==='x')explosion(e[1],e[2],e[3],e[4]);else if(e[0]==='b')m.bolts.push({x:e[1],y:e[2],t:.35});}
 if(s.o&&!m.over){m.over=true;m.overT=0;}
 if(!NET.got){NET.got=true;m.cam.x=m.pl.x;m.cam.y=m.pl.y;}}
function netGuestStep(dt){const m=M,now=performance.now();
 World.update(dt);m.t+=dt;m.shake*=Math.max(0,1-6*dt);m.warn=Math.max(0,m.warn-dt);if(m.over)m.overT+=dt;updWrecks(dt);
 for(const p of m.planes){
  if(!p.alive){if(p.respawn>0&&p.respawn<1e8)p.respawn=Math.max(0,p.respawn-dt);continue;}
  for(const k of['inv','flash','shield','cloak','rollT'])if(p[k]>0)p[k]=Math.max(0,p[k]-dt);
  const age=Math.min(.3,(now-(p.sat||now))/1000+NET.lat),px=p.sx+Math.cos(p.sang)*p.ssp*age,py=p.sy+Math.sin(p.sang)*p.ssp*age,ta=p.sang+(p.sav||0)*age,k=Math.min(1,dt*14);
  p.x+=(px-p.x)*k;p.y+=(py-p.y)*k;p.ang+=angDiff(p.ang,ta)*k;if(p.ang>Math.PI)p.ang-=TAU;else if(p.ang<-Math.PI)p.ang+=TAU;
  p.trailT=(p.trailT||0)-dt;if(p.trailT<=0){p.trailT=.03;emitTrail(p);}
  {const tl=p.def.shape.len*.5,tx=p.x-Math.cos(p.ang)*tl,ty=p.y-Math.sin(p.ang)*tl,tr=p.tr||(p.tr=[]),q=tr[0];if(q&&Math.hypot(q[0]-tx,q[1]-ty)>160)tr.length=0;if(!tr[0]||Math.hypot(tr[0][0]-tx,tr[0][1]-ty)>3)tr.unshift([tx,ty]);else tr[0]=[tx,ty];const mx=p.def.shape.len*3.2;let acc=0;for(let i=1;i<tr.length;i++){acc+=Math.hypot(tr[i][0]-tr[i-1][0],tr[i][1]-tr[i-1][1]);if(acc>mx){tr.length=i+1;break;}}}}
 for(const b of m.bul){b.px=b.x;b.py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;}
 for(const q of m.mis){q.x+=Math.cos(q.ang)*q.sp*dt;q.y+=Math.sin(q.ang)*q.sp*dt;emit({x:q.x,y:q.y,vx:0,vy:0,l:.5,m:.5,s:3,c:'#d8d8dc',g:-8,d:1,k:'c',grow:8});}
 for(const k of m.picks)k.t=m.t;
 for(let i=m.bolts.length-1;i>=0;i--){m.bolts[i].t-=dt;if(m.bolts[i].t<=0)m.bolts.splice(i,1);}
 for(const q of m.decals)q.t+=dt;while(m.decals.length&&m.decals[0].t>22)m.decals.shift();
 for(let i=m.parts.length-1;i>=0;i--){const p=m.parts[i];p.l-=dt;if(p.l<=0){m.parts.splice(i,1);continue;}const dr=Math.max(0,1-p.d*dt);p.vx*=dr;p.vy*=dr;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.grow)p.s+=p.grow*dt;}
 const pl=m.pl,k=1-Math.exp(-dt*6.5),tx=pl.x+Math.cos(pl.ang)*pl.speed*AMPLIO.lookAhead,ty=pl.y+Math.sin(pl.ang)*pl.speed*AMPLIO.lookAhead;m.cam.x+=(tx-m.cam.x)*k;m.cam.y+=(ty-m.cam.y)*k;
 netSendInput(dt);}
function netEvX(x,y,size,fx){if(NET.role==='host'&&NET.inMatch&&NET.evq.length<60)NET.evq.push(['x',Math.round(x),Math.round(y),size,fx||'clasico']);}
function netAbort(){if(!NET.inMatch)return;NET.inMatch=false;if(NET.role==='host'){netBcast({t:'abort'});}else{netReset(true);}}
function netMatchEnded(){NET.inMatch=false;if(NET.role==='host')netLobbySend();}

/* ---------- interfaz de la sala ---------- */
function genName(){const n=pick(CALLS);return Math.random()<.5?n:n+(10+Math.floor(Math.random()*90));}
function netEl(){let e=$('ol');if(!e){e=document.createElement('div');e.id='ol';e.className='modal';e.hidden=true;document.body.appendChild(e);
  e.addEventListener('click',netClick);e.addEventListener('input',ev=>{if(ev.target.id==='olName'){NET.name=ev.target.value.slice(0,14);try{localStorage.setItem('ases_name',NET.name);}catch(x){}}if(ev.target.id==='olCode')ev.target.value=ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'');});
  e.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.id==='olCode'){ev.preventDefault();netJoin(ev.target.value);}ev.stopPropagation();});}return e;}
function netOpenUI(){netSendProfile();if(!NET.name){try{NET.name=localStorage.getItem('ases_name')||'';}catch(e){}if(!NET.name)NET.name=genName();}netUI(true);}
function netCloseUI(){const e=$('ol');if(e)e.hidden=true;}
const NET_ROWS=[['mode','Modo'],['map','Mapa'],['time','Duración'],['total','Plazas'],['diff','Bots'],['tod','Hora']];
function netOpts(k,c){
 if(k==='mode')return MODES.filter(m=>NET_MODES.includes(m.id)).map(m=>[m.id,m.n]);
 if(k==='map')return MAPDEF.map(m=>[m.id,m.name]);
 if(k==='time')return[2,3,5,8].map(n=>[n,n+' min']);
 if(k==='total')return[2,3,4,5,6,7,8].filter(n=>c.mode!=='team'||n%2===0).map(n=>[n,n+' pilotos']);
 if(k==='diff')return DIFFS.map((d,i)=>[i,d.name]);
 return[['auto','Del mapa']].concat(TIMEK.map(t=>[t,TIMES[t].n]));}
function olRowInner(k,lab,host){const c=NET.L.cfg,o=netOpts(k,c),i=Math.max(0,o.findIndex(x=>String(x[0])===String(c[k])));
 const tip=k==='mode'?(MODES.find(m=>m.id===c.mode)||{}).d:k==='total'?'Los pilotos que falten los ocupan bots.':k==='diff'?'Dificultad de los bots que rellenan la partida.':'';
 const L='<span class="lab">'+lab+(tip?inf(tip):'')+'</span>';
 if(!host)return L+'<div class="ro-val">'+ic('lock',15)+'<b>'+h(o[i][1])+'</b></div>';
 const bt=(d,t)=>'<button class="sb" aria-label="'+(d<0?'Anterior':'Siguiente')+'" '+(o[i+d]?'data-nt="step" data-k="'+k+'" data-d="'+d+'"':'disabled')+'>'+t+'</button>';
 return L+'<div class="stp">'+bt(-1,'‹')+'<div class="sv"><b>'+h(o[i][1])+'</b><span class="dots">'+o.map((_,j)=>'<i class="'+(j===i?'on':'')+'"></i>').join('')+'</span></div>'+bt(1,'›')+'</div>';}
function olPlayers(){const c=NET.L.cfg,tot=Math.max(NET.players.length,c.total);
 let s=NET.players.map(p=>'<div class="olp'+(p.id===NET.myId?' me':'')+'"><span class="olname">'+h(p.name)+(p.id==='me'?' <span class="pill cost">Anfitrión</span>':'')+(p.id===NET.myId?' <span class="pill on">Tú</span>':'')+'</span><span class="mut">'+h((PLANE[p.plane]||{}).name||'')+'</span></div>').join('');
 for(let i=NET.players.length;i<tot;i++)s+='<div class="olp empty"><span>Plaza libre</span><span class="mut">Bot</span></div>';return s;}
function netLink(){let b='';try{b=location.href.split('#')[0].split('?')[0];}catch(e){}return b+'?sala='+NET.code+(NET.local?'&local':'');}
function netUI(force){const e=netEl();if(!force&&e.hidden)return;e.hidden=false;let s='';e.dataset.st=NET.state;
 if(NET.state==='connecting'){s='<h2>Conectando…</h2><div class="olfoot"><button class="btn" data-nt="leave">Cancelar</button></div>';}
 else if(NET.state==='room'&&NET.L){const host=NET.role==='host';
  s='<div class="olhead"><div><div class="mut">Sala</div><div class="olcode">'+h(NET.code)+'</div></div><button class="btn sm" data-nt="copy">Copiar enlace</button></div>'+
   (NET.demo?'<div class="olban lockd">'+ic('lock',16)+'<span><b>Simulación:</b> no hay conexión real, los pilotos son ficticios.</span></div>':'')+'<div class="olban" id="olBan"></div>'+
   '<div class="olgrid"><div class="panel"><h3 id="olPh"></h3><div id="olPl"></div></div>'+
   '<div class="panel"><h3>Partida</h3><div class="opts" id="olSet">'+NET_ROWS.map(([k,l])=>'<div class="orow" id="olr-'+k+'"></div>').join('')+'</div></div></div>'+
   '<div class="olfoot">'+(host?'<button class="btn pri go" data-nt="start">Empezar partida</button>':'<div class="olwait">Esperando a que <b id="olHn"></b> empiece la partida<span class="dots3"></span></div>')+'<button class="btn" data-nt="leave">Salir</button><button class="btn sm" data-nt="hide">Ocultar</button></div>';}
 else{
  s='<h2>Jugar con amigos</h2>'+(NET.demo?'<div class="olban lockd">'+ic('lock',16)+'<span>El online solo funciona con el juego publicado en GitHub Pages. Aquí puedes probar una <b>simulación</b> del menú.</span></div>':'')+
   '<div class="olnm"><span class="lab">Tu nombre</span><input id="olName" maxlength="14" value="'+h(NET.name)+'"><button class="btn sm" data-nt="rname">Aleatorio</button></div>'+
   '<div class="olgrid2"><div class="panel olcard"><h3>Crear sala'+inf('Tú llevas la partida y tus amigos entran con un código o un enlace. Hasta 8 pilotos.')+'</h3><button class="btn pri" data-nt="create">Crear sala</button></div>'+
   '<div class="panel olcard"><h3>Unirse a una sala</h3><input id="olCode" maxlength="8" placeholder="CÓDIGO" autocapitalize="characters" autocomplete="off"><button class="btn pri blue" data-nt="join">Unirse</button></div></div>'+
   (NET.err?'<p class="olerr"><b>'+h(NET.err)+'</b></p>':'')+'<div class="olfoot"><button class="btn sm" data-nt="hide">Cerrar</button></div>';}
 e.innerHTML='<div class="mbox olbox" role="dialog" aria-modal="true">'+s+'</div>';if(NET.state==='room'&&NET.L)netPatch(true);}
function netPatch(all){const e=$('ol');if(!e||e.hidden||e.dataset.st!=='room'||NET.state!=='room'||!NET.L)return;const host=NET.role==='host';
 const set=(id,html)=>{const x=$(id);if(x&&x._h!==html){x._h=html;x.innerHTML=html;}};
 const hn=NET.players.find(p=>p.id==='me');
 set('olBan',host?ic('check',16)+'<span>Eres el anfitrión: tú eliges los ajustes y empiezas la partida.</span>':ic('lock',16)+'<span>Solo el anfitrión ('+h(hn?hn.name:'?')+') puede cambiar los ajustes.</span>');
 const b=$('olBan');if(b)b.classList.toggle('lockd',!host);
 set('olPh','Pilotos ('+NET.players.length+'/'+Math.max(NET.players.length,NET.L.cfg.total)+')');
 set('olPl',olPlayers());
 for(const[k,l]of NET_ROWS)set('olr-'+k,olRowInner(k,l,host));
 const hnn=$('olHn');if(hnn)hnn.textContent=hn?hn.name:'el anfitrión';}
function netClick(ev){const t=ev.target.closest('[data-nt]');if(!t)return;const a=t.dataset.nt;
 if(a==='create'){const i=$('olName');if(i)NET.name=i.value.slice(0,14)||NET.name;netCreate();}
 else if(a==='join'){const i=$('olName');if(i)NET.name=i.value.slice(0,14)||NET.name;const c=$('olCode');netJoin(c?c.value:'');}
 else if(a==='rname'){NET.name=genName();const i=$('olName');if(i)i.value=NET.name;try{localStorage.setItem('ases_name',NET.name);}catch(x){}}
 else if(a==='leave')netLeave();
 else if(a==='hide')netCloseUI();
 else if(a==='copy'){try{navigator.clipboard.writeText(netLink());toast('Enlace copiado');}catch(e){toast(netLink());}}
 else if(a==='step'&&NET.role==='host'){const k=t.dataset.k,c=NET.L.cfg,o=netOpts(k,c),i=o.findIndex(x=>String(x[0])===String(c[k])),n=o[i+(+t.dataset.d)];
  if(n){c[k]=n[0];if(c.mode==='team'&&c.total%2)c.total=Math.min(NET_MAX,c.total+1);netLobbySend();netPatch();}}
 else if(a==='start')netHostStart();}
/* el invitado reenvía su avión cuando cambia en el garaje */
function netSendProfile(){if(NET.role==='guest'&&NET.conn&&NET.on)NET.conn.send({t:'prof',p:netProfile()});else if(NET.role==='host'&&NET.on){const me=NET.players[0];if(me){Object.assign(me,cleanProf(netProfile(),'Piloto'));me.name=netUniq(me.name,'me');netLobbySend();}}}
function netBoot(){try{const q=new URLSearchParams(location.search),c=q.get('sala');if(c){NET.local=NET.local||q.has('local');NET.name=localStorage.getItem('ases_name')||'';if(!NET.name)NET.name=genName();netEl().hidden=false;netJoin(c);}}catch(e){}}

