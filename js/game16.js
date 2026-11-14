'use strict';
/* ===== Tutorial interactivo (paso a paso, sin prisa) ===== */
const HR={};
const tPad=()=>{try{return[...navigator.getGamepads()].some(g=>g&&g.connected);}catch(e){return false;}};
const isTouch=()=>document.body.classList.contains('touch');
const chip=a=>'<kbd>'+h(bindFirst(a))+'</kbd>'+(tPad()?'<span class="or">'+(window.I18N&&I18N.or?I18N.or():'o')+'</span><kbd class="gpk">'+h(bindFirst(a,'gp'))+'</kbd>':'');
const TKACT={L:'left',R:'right',B:'boost',D:'flip'};
const seqChips=id=>seqOf(id).map(k=>'<kbd>'+h(bindFirst(TKACT[k]))+'</kbd>').join('<span class="then">›</span>');
const seqTouch=id=>seqOf(id).map(k=>({L:'◀',R:'▶',B:'▲ TURBO',D:'▼ GIRO'}[k])).join(' ');
const advStep=(id,last,t,intro,tb)=>({ch:'Acrobacias',adv:1,t,x:tc=>intro+'<br>'+(tc?'En pantalla táctil: <b>'+seqTouch(id)+'</b> (rápido). ◀ ▶ = empuja el joystick a ese lado de tu rumbo; TURBO y GIRO son los botones':'Pulsa rápido: '+seqChips(id)+' <span class="mut">(también en espejo)</span>')+'<br><span class="mut">Si no te sale, prueba «Relajada» en Ajustes ▸ Combos o pulsa «Saltar paso».</span>',ok:T=>T.last===last,hint:'Pulsa las teclas una detrás de otra, sin pausa. Con el probador de Ajustes ▸ Combos puedes entrenar sin gastar energía.'});
const TUT=[
 {ch:'Bienvenida',info:1,t:'¡Bienvenido a Ases del Cielo!',x:()=>'Eres piloto de combate. En cada partida vuelas contra rivales: <b>derríbalos</b>, esquiva sus disparos y <b>sobrevive</b>. Al terminar ganas monedas para mejorar y personalizar tus aviones.<br><br>Este tutorial va <b>sin prisa</b>: aquí no puedes morir, así que puedes seguir volando mientras lees. Avanza con el botón «Entendido» (o la tecla Intro).'},
 {ch:'Volar',info:1,t:'Tu avión nunca se detiene',x:()=>'Tu avión <b>avanza siempre solo</b>: no hay que acelerar ni frenar. Tu trabajo es <b>girar</b> para ir adonde quieras y esquivar obstáculos.'},
 {ch:'Volar',t:'Prueba a girar',x:tc=>tc?'Apoya el pulgar a la <b>izquierda</b> y arrastra el <b>joystick</b> hacia donde quieras ir: el avión gira hasta apuntar en esa dirección. Da una <b>vuelta completa</b>.':'Mantén pulsado '+chip('left')+' o '+chip('right')+' hasta dar una <b>vuelta completa</b> sobre ti mismo.',tb:['stick'],ok:T=>T.acc>=6.2,prog:T=>T.acc/6.28,hint:'No hace falta soltar: mantén el joystick (o la tecla) y el avión irá girando poco a poco.'},
 {ch:'Volar',t:'Usa el turbo',x:tc=>(tc?'Mantén pulsado el botón <b>TURBO</b>':'Mantén '+chip('boost'))+' durante un par de segundos para activar el <b>turbo</b>: vas más rápido pero gastas <b>energía</b>. Si lo sueltas, la energía se recarga sola.',tb:['boost'],ok:T=>T.boost>=1.5,prog:T=>T.boost/1.5,hint:'Mantén la tecla pulsada sin soltarla.'},
 {ch:'Pantalla',info:1,hl:['bars'],t:'Tu casco y tu energía',x:()=>'Abajo, dentro del recuadro amarillo parpadeante: la barra <b>verde</b> es tu <b>casco</b> (tu vida); si llega a cero te derriban. La barra <b>azul</b> de debajo es tu <b>energía</b>: la gastan el turbo y las acrobacias, y se recarga sola.'},
 {ch:'Pantalla',info:1,hl:['mini'],low:1,t:'El minimapa',x:()=>'Arriba a la derecha, en el recuadro amarillo: el <b>minimapa</b>. La flecha blanca eres tú y los puntos rojos son rivales. Si un rival queda fuera de la pantalla, una flecha en el borde te señala dónde está.'},
 {ch:'Pantalla',info:1,hl:['score'],low:1,t:'Tus puntos',x:()=>'Arriba a la izquierda, en el recuadro amarillo: tus <b>puntos</b> y tu puesto en la clasificación. Debajo ves tus bajas, asistencias y muertes. Ganas puntos derribando rivales y haciendo acrobacias.'},
 {ch:'Combate',t:'Dispara',setup:()=>tutDrone(),x:tc=>'Ha aparecido un <b>dron de práctica</b> (un punto rojo en el minimapa). '+(tc?'Mantén pulsado el botón de <b>fuego</b>':'Mantén '+chip('fire'))+' para <b>disparar</b> una ráfaga. Las balas salen hacia donde apunta la nariz de tu avión.',tb:['fire'],ok:T=>T.fire>=1,prog:T=>T.fire/1,hint:'Mantén el botón de disparo pulsado: sale una ráfaga continua.'},
 {ch:'Combate',t:'Derriba el dron',x:()=>'Gira hasta tener al dron <b>delante de tu avión</b> y dispara hasta destruirlo. Es lento y no devuelve el fuego. Si lo pierdes de vista, sigue la flecha roja del borde de la pantalla.',ok:(T,p)=>p.kills>T.k0,hint:'Apunta la nariz hacia el dron, acércate un poco y mantén el disparo.'},
 {ch:'Combate',t:'Lanza un misil',hl:['sec'],x:tc=>'Los <b>misiles</b> persiguen al rival que tengas delante. '+(tc?'Pulsa el botón del misil (el cohete, junto al de disparo).':'Pulsa '+chip('sec')+' con el dron más o menos de frente.')+' La munición es limitada (puntos bajo el círculo amarillo de la derecha) y se repone con cajas.',tb:['sec'],ok:(T,p)=>p.secAmmo<p.def.sec.n,hint:'Coloca al dron delante de tu avión y pulsa el botón de misil.'},
 {ch:'Combate',t:'Tu habilidad especial',hl:['sp'],x:tc=>{const sp=SPECS[M.pl.def.sp.t];return'Cada avión tiene una <b>habilidad especial</b> (círculo amarillo de la izquierda). La tuya: <b><span class="ph">'+sp.n+'</span></b> — <span class="ph">'+sp.desc+'</span>.<br>'+(M.pl.def.sp.t==='fenix'?'Es pasiva: se activa sola cuando te derriban.':(tc?'Pulsa el botón del rayo (junto al de disparo).':'Púlsala con '+chip('special')+'.')+' Después tarda un rato en recargarse.');},tb:['special'],ok:(T,p)=>p.def.sp.t==='fenix'||p.spCd>.5,hint:'Pulsa el botón de habilidad especial.'},
 {ch:'Mundo',info:1,t:'Cajas y recompensas',x:()=>'Por el mapa flotan <b>cajas</b>. Vuela sobre ellas para <b>reparar el casco</b>, recargar munición o conseguir potenciadores (escudo, daño ×2, energía infinita).'},
 {ch:'Mundo',info:1,t:'Obstáculos y tormenta',x:()=>'En una partida real, torres, rocas y paredes <b>chocan</b>: evítalas (en el tutorial las atraviesas sin riesgo). Árboles y casas se sobrevuelan sin problema. Rozar un obstáculo sin chocar da puntos de «rasante».<br>Fuera del mapa hay una <b>tormenta</b> que te quita casco: si ves el aviso, gira hacia el centro.'},
 {ch:'Maniobras',t:'Media vuelta',x:tc=>'La <b>media vuelta</b> gira tu avión 180° al instante: perfecta para encarar a quien te persigue. '+(tc?'Pulsa el botón <b>GIRO</b> una vez.':'Pulsa '+chip('flip')+' una vez.')+' Gasta algo de energía.',tb:['flip'],ok:T=>T.last==='MEDIA VUELTA',hint:'Basta con una sola pulsación.'},
 {ch:'Maniobras',t:'Roll: esquiva disparos',x:tc=>'El <b>roll</b> te hace <b>inmune a los disparos</b> un instante. '+(tc?'Pulsa el botón <b>ROLL</b>.':'Pulsa dos veces seguidas la misma tecla de giro: '+seqChips('roll')+'.')+'<br><span class="mut">Aquí tienes más margen de tiempo entre pulsaciones que en una partida normal.</span>',tb:['roll'],ok:T=>T.last.indexOf('ROLL')>=0,hint:'En táctil, un toque al botón ROLL; con teclado, dos toques rápidos a la misma dirección.'},
 {ch:'Acrobacias',info:1,advIntro:1,t:'Acrobacias avanzadas (opcional)',x:()=>'Las siguientes son más difíciles: cada una se hace con una <b>secuencia de pulsaciones</b>. Puedes intentarlas o <b>saltarlas</b>. Cuando quieras practicar, el <b>probador</b> de Ajustes ▸ Combos te dice qué acrobacia reconoce el juego sin gastar energía. Allí también puedes <b>cambiar las teclas y los combos</b> a tu gusto.'},
 advStep('bucle','BUCLE','Bucle','Un <b>looping</b> completo de 360°.'),
 advStep('tijera','TIJERA','Tijera','Dos rolls seguidos en sentidos opuestos.'),
 advStep('tonel','DOBLE ROLL','Doble roll','Un roll doble: más recorrido y más inmunidad.'),
 advStep('inmel','INMELMANN','Inmelmann','Media vuelta con impulso para cambiar de sentido.'),
 advStep('cobra','COBRA','Cobra','Un frenazo brusco para que el rival te sobrepase.'),
 advStep('tturbo','ROLL TURBO','Roll turbo','Un roll con impulso de velocidad (gasta energía).'),
 {ch:'Final',info:1,t:'¡Ya sabes volar!',x:()=>'Resumen: <b>gira</b> con '+chip('left')+chip('right')+', <b>turbo</b> '+chip('boost')+', <b>dispara</b> '+chip('fire')+', <b>misil</b> '+chip('sec')+', <b>especial</b> '+chip('special')+', <b>pausa</b> '+chip('pause')+'.<br>Tu primera partida: elige <b>Novato</b> o <b>Piloto</b> en Inicio y juega con calma. ¡Buena suerte, as!'+(SAVE.tutDone?'':'<br><b>Recompensa por completar el tutorial: 200 monedas.</b>')}];
function tutDrone(){const T=M.tut;if(M.drone&&M.drone.alive)return;let d=M.drone;
 if(!d){d=makePlane({id:'drone',name:'Dron',def:PLANE.mastin,up:{spd:0,acc:0,man:0,hp:0,pow:0},look:{...DEFLOOK,paint:'coral'},hpMul:.2,dmgMul:0,ai:{dummy:true,escape:0,escT:0,d:DIFFS[1],pers:'cazador',state:'patrol',t:0,fireT:0,stT:0,manT:0,side:1,err:0,tg:null,threat:null,dsel:1,loop:0}});
  M.planes.push(d);M.byId[d.id]=d;M.drone=d;}
 spawnPlane(d);const pl=M.pl;
 for(let k=0;k<30;k++){const a=pl.ang+rnd(-.5,.5),x=pl.x+Math.cos(a)*rnd(900,1200),y=pl.y+Math.sin(a)*rnd(900,1200);if(World.free(x,y,420)){d.x=x;d.y=y;d.ang=pl.ang+Math.PI/2;break;}}
 d.ai.cx=undefined;d.inv=0;d.ghost=false;d.ghostT=0;}
function tutDroneAI(p){const a=p.ai,I=p.in,R=650;if(a.cx===undefined){a.cx=p.x+Math.cos(p.ang-Math.PI/2)*R;a.cy=p.y+Math.sin(p.ang-Math.PI/2)*R;}
 const dx=a.cx-p.x,dy=a.cy-p.y,d=Math.hypot(dx,dy),e=clamp((d-R)/R,-1,1),des=Math.atan2(dy,dx)+(Math.PI/2)*(1-e);
 I.turn=clamp(angDiff(p.ang,des)*3,-1,1);I.fire=false;I.sec=false;I.boost=false;I.brake=false;}
function tutCardEl(){let el=$('tutcard');if(!el){el=document.createElement('div');el.id='tutcard';el.setAttribute('role','dialog');el.setAttribute('aria-live','polite');gameEl.appendChild(el);
 el.addEventListener('click',e=>{const b=e.target.closest('[data-tut]');if(b){e.stopPropagation();tutBtn(b.dataset.tut);}});el.addEventListener('pointerdown',e=>e.stopPropagation());}return el;}
function tutRender(){const T=M&&M.tut;if(!T)return;const s=TUT[T.i];if(!s)return;const el=tutCardEl(),n=TUT.length,tc=isTouch(),last=T.i===n-1;
 el.className=T.min?'min':'';el.hidden=false;
 let body=typeof s.x==='function'?s.x(tc):s.x;if(window.I18N&&I18N.html)body=I18N.html(body);
 const dots=TUT.map((_,i)=>'<i class="'+(i<T.i?'d':i===T.i?'c':'')+'"></i>').join('');
 let btns='';
 if(T.i>0)btns+='<button class="btn sm" data-tut="back">‹ Atrás</button>';
 if(!s.info&&!T.done)btns+='<button class="btn sm" data-tut="skip">Saltar paso</button>';
 if(s.adv)btns+='<button class="btn sm" data-tut="skipadv">Saltar acrobacias</button>';
 if(s.advIntro)btns+='<button class="btn sm" data-tut="endbasic">Terminar aquí</button>'; /* ★ MEJORA: tutorial básico terminable antes de las acrobacias */
 btns+='<span class="sp"></span><button class="btn sm" data-tut="min">'+(T.min?'Mostrar':'Ocultar')+'</button><button class="btn sm" data-tut="quit">Salir</button>';
 if(s.info||T.done)btns+='<button class="btn pri" data-tut="next">'+(last?'¡Terminar!':s.info?'Entendido ›':'Continuar ›')+'</button>';
 el.innerHTML='<div class="tc-top"><span>Paso '+(T.i+1)+' de '+n+' · '+h(s.ch)+'</span><span class="tc-dots">'+dots+'</span></div>'+
  '<h3 class="tc-t'+(T.done?' ok':'')+'">'+(T.done?'✔ ¡Bien hecho!':h(s.t))+'</h3><div class="tc-x">'+body+'</div>'+
  (s.prog&&!T.done?'<div class="tc-prog"><i id="tcp" style="width:'+Math.min(100,s.prog(T,M.pl)*100)+'%"></i></div>':'')+
  (T.hint&&!T.done&&s.hint?'<div class="tc-hint">Pista: '+h(s.hint)+'</div>':'')+
  '<div class="tc-btns">'+btns+'</div>';
 document.querySelectorAll('#touch button,#touch #stick').forEach(b=>b.classList.toggle('tuthl',!!(s.tb&&s.tb.includes(b.dataset.k||'stick')&&!T.done)));}
function tutEnter(i){const T=M.tut;if(i>=TUT.length){finishTut(true);return;}const s=TUT[i],pl=M.pl;
 if(s.adv)T.advSeen=true;
 Object.assign(T,{i,st:0,done:false,auto:0,hint:false,acc:0,pa:pl.ang,boost:0,fire:0,last:'',k0:pl.kills,hold:!!s.info,card:true});
 pl.secAmmo=pl.def.sec.n;pl.spCd=0;pl.energy=100;if(s.setup)s.setup();tutRender();}
if(window.I18N)I18N.onset=()=>{try{if(M&&M.tut)tutRender();}catch(e){}};
function tutNext(){const T=M&&M.tut;if(T&&(T.hold||T.done))tutEnter(T.i+1);}
function tutPress(){tutNext();}
function tutBtn(a){const T=M.tut;if(!T)return;
 if(a==='next')tutNext();else if(a==='back')tutEnter(Math.max(0,T.i-1));else if(a==='skip')tutEnter(T.i+1);
 else if(a==='skipadv'){let j=T.i;while(j<TUT.length&&TUT[j].adv)j++;tutEnter(j);}
 else if(a==='endbasic')finishTut(true);
 else if(a==='min'){T.min=!T.min;tutRender();}
 else if(a==='quit')finishTut(false);}
function tutTick(dt){const T=M.tut,pl=M.pl;if(!T||M.paused)return;pl.inv=Math.max(pl.inv,1);pl.hp=pl.maxHp;pl.energy=Math.max(pl.energy,70);
 const s=TUT[T.i];if(!s||T.hold)return;
 T.st+=dt;T.acc+=Math.abs(angDiff(T.pa,pl.ang));T.pa=pl.ang;if(pl.boosting)T.boost+=dt;if(pl.in.fire)T.fire+=dt;
 if(T.done){T.auto-=dt;if(T.auto<=0)tutEnter(T.i+1);return;}
 if(s.ok(T,pl)){T.done=true;T.auto=1.1;Snd.tone(880,.1,'triangle',.05,1.5);Snd.tone(1320,.12,'triangle',.04,1.4);tutRender();return;}
 const pb=$('tcp');if(pb&&s.prog)pb.style.width=Math.min(100,s.prog(T,pl)*100)+'%';
 if(T.st>14&&!T.hint&&s.hint){T.hint=true;tutRender();}}
function tutCleanup(){const el=$('tutcard');if(el)el.remove();document.querySelectorAll('#touch .tuthl').forEach(b=>b.classList.remove('tuthl'));}
function finishTut(done){const adv=!!(M&&M.tut&&M.tut.advSeen&&M.tut.i>=TUT.length-1);tutCleanup();let msg='Tutorial cerrado. Puedes repetirlo con el botón ?';
 if(done){try{localStorage.setItem('ases_tut','1');}catch(e){}if(!SAVE.tutDone){SAVE.tutDone=1;SAVE.coins+=200;persist();msg='¡Tutorial completado! +200 monedas';}else msg='¡Tutorial completado!';}
 if(done&&adv&&!SAVE.tutAdv){SAVE.tutAdv=1;SAVE.coins+=150;persist();msg+=' · Acrobacias avanzadas +150 monedas';} /* ★ MEJORA: recompensa aparte por las acrobacias */
 quitGame();toast(msg);}
function tutHud(c,small){const T=M.tut,s=TUT[T.i];if(!s||!s.hl)return;const pu=(Math.floor(performance.now()/380)%2===0)?1:.1;
 for(const k of s.hl){const r=HR[k];if(!r)continue;c.save();c.lineWidth=4;c.strokeStyle='rgba(255,214,64,'+pu+')';c.shadowColor='#ffd640';c.shadowBlur=pu>.5?16:0;rq(c,r[0]-6,r[1]-6,r[2]+12,r[3]+12,14);c.stroke();c.restore();}}
addEventListener('keydown',e=>{if(!running||!M||!M.tut||CAP||M.paused)return;const T=M.tut;
 if((e.code==='Enter'||e.code==='NumpadEnter'||(T.hold&&e.code==='Space'))&&!e.repeat&&(T.hold||T.done)){e.preventDefault();e.stopImmediatePropagation();tutNext();}},true);


const pressed=new Set();let padAct=null,padPrevAct=null,CAP=null,ctlTab='kb',ctlIgnore=0,tokSink=null;
const kbMap=()=>{if(kbC)return kbC;kbC={};const b=SAVE.ctl.kb;for(const a in b)for(const c of b[a])if(c&&!kbC[c])kbC[c]=a;return kbC;};
const actDown=a=>{const b=SAVE.ctl.kb[a];if(b)for(const c of b)if(c&&pressed.has(c))return true;return false;};
function setPause(v){if(!M||M.over)return;if(M.net){const sh=v&&pauseEl.hidden;pauseEl.hidden=!sh;if(sh)fillPauseKeys();return;}M.paused=v;pauseEl.hidden=!v;if(v)fillPauseKeys();}
/* --- textos con las teclas actuales --- */
const bindTxt=(a,dev)=>{const l=(SAVE.ctl[dev||'kb'][a]||[]).filter(Boolean).map(tokLabel);return l.length?l.join(' / '):'sin asignar';};
const bindFirst=(a,dev)=>{const l=(SAVE.ctl[dev||'kb'][a]||[]).filter(Boolean);return l.length?tokLabel(l[0]):'—';};
const seqOf=id=>SAVE.ctl.seq[id]||MOVES.find(m=>m.id===id).seq;
const seqTxt=id=>seqOf(id).map(k=>ARR[k]).join(' ');
const mirrorTok=k=>k==='L'?'R':k==='R'?'L':k;
const hasLR=sq=>sq.some(k=>k==='L'||k==='R');
function seqVariants(id){const sq=seqOf(id),v=[sq];if(hasLR(sq))v.push(sq.map(mirrorTok));return v;}
function hintLine(){return bindFirst('left')+' '+bindFirst('right')+' girar   '+bindFirst('boost')+' turbo   '+bindFirst('flip')+' media vuelta   '+bindFirst('fire')+' disparar   '+bindFirst('sec')+' misil   '+bindFirst('special')+' especial   '+bindFirst('pause')+' pausa';}
function fillPauseKeys(){const el=pauseEl.querySelector('.keys');if(!el)return;const r=(k,t)=>'<div class="r"><kbd>'+h(k)+'</kbd><span>'+h(t)+'</span></div>';
 let s=r(bindFirst('left')+' · '+bindFirst('right'),'Girar')+r(bindFirst('boost'),'Turbo')+r(bindFirst('flip'),'Media vuelta')+r(bindFirst('fire'),'Disparar')+r(bindFirst('sec'),'Misil, cohete o bomba')+r(bindFirst('special'),'Habilidad especial')+r('Esc · '+bindFirst('pause'),'Pausa');
 s+=r('Mando','Stick o cruz: girar/turbo/volteo · '+bindFirst('fire','gp')+' disparar · '+bindFirst('sec','gp')+' misil · '+bindFirst('special','gp')+' especial · '+bindFirst('pause','gp')+' pausa');
 if(M&&M.split)s=r('J1 · J2–J4','J1: teclado y ratón · J2–J4: mandos')+s;
 for(const m of MOVES)s+=r(seqTxt(m.id),m.n);
 s+='<div class="r"><span class="mut">Puedes cambiar teclas, mando y combos en Ajustes.</span></div>';el.innerHTML=s;}
/* --- motor de combos: cada pulsación de giro/turbo/volteo es una "ficha" (L R B D) y se busca la acrobacia más larga que encaje --- */
let tokH=[],WINS=[['Relajada',1.45],['Normal',1],['Rápida',.8]];
const winK=()=>{const k=(WINS[SAVE.ctl.win]||WINS[1])[1];return(running&&M&&M.tut)?Math.max(k,1.5):k;};
function fireMove(id,dir){if(!M||!M.pl||M.paused)return;const I=M.pl.in;
 if(id==='roll'){if(dir)I.rollDir=dir;I.roll=true;}
 else if(id==='dash')I.dash=true;
 else{if(dir&&M.pl.rollT<=0&&(id==='tonel'||id==='tijera'))I.rollDir=dir;I.mv=id;}}
function pushTok(k){const now=performance.now(),G=360*winK(),last=tokH[tokH.length-1];
 if(last&&last.k===k&&now-last.t<45)return null;
 tokH.push({k,t:now});while(tokH.length>6)tokH.shift();
 let best=null;
 for(const mv of MOVES)for(const sq of seqVariants(mv.id)){const n=sq.length;if(n<2||n>tokH.length)continue;const tail=tokH.slice(-n);let ok=true;
  for(let i=0;i<n&&ok;i++){if(tail[i].k!==sq[i])ok=false;else if(i&&tail[i].t-tail[i-1].t>G)ok=false;}
  if(ok&&(!best||n>best.n))best={id:mv.id,n,tail:tail.map(x=>x.k)};}
 if(!best)return null;
 const dt=best.tail.find(x=>x==='L'||x==='R'),dir=dt==='L'?-1:dt==='R'?1:0;
 /* si la secuencia es el comienzo de otra más larga (p. ej. Roll ← ← y Doble roll ← ← ←) se conserva el historial */
 const pre=MOVES.some(o=>o.id!==best.id&&seqVariants(o.id).some(v=>v.length>best.n&&v.slice(0,best.n).join()===best.tail.join()));
 if(!pre)tokH.length=0;
 if(tokSink)tokSink(best.id,dir);else fireMove(best.id,dir);
 return best.id;}
function tapKey(k){if(!M||!M.pl)return;pushTok(k);}
function flipKey(){if(!M||!M.pl)return;const mv=pushTok('D');if(!mv||mv==='inmel')M.pl.in.flip=true;}
function directMove(id,dir){fireMove(id,dir);if(id==='inmel'&&M&&M.pl)M.pl.in.flip=true;}
/* acciones de un solo golpe (teclado, mando y táctil comparten esto) */
function onAction(a){if(!M||!M.pl||M.paused)return;const I=M.pl.in;
 if(a==='left')tapKey('L');else if(a==='right')tapKey('R');else if(a==='boost')tapKey('B');else if(a==='flip')flipKey();
 else if(a==='special')I.sp=true;
 else if(a==='m_roll_l')directMove('roll',-1);else if(a==='m_roll_r')directMove('roll',1);
 else if(a.slice(0,2)==='m_')directMove(a.slice(2),I.turn||0);}
addEventListener('keydown',e=>{if(CAP||!running)return;
 if(e.code==='Escape'){setPause(!M.paused);e.preventDefault();return;}
 const a=kbMap()[e.code];
 if(a==='pause'){if(!e.repeat)setPause(!M.paused);e.preventDefault();return;}
 if(M.paused)return;Snd.init();
 if(!a)return;e.preventDefault();pressed.add(e.code);if(!e.repeat)onAction(a);});
addEventListener('keyup',e=>{pressed.delete(e.code);});
addEventListener('blur',()=>{pressed.clear();if(running)setPause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pressed.clear();if(running)setPause(true);}});
/* --- asignación de teclas (se abre desde Ajustes) --- */
function actName(a){const x=ACTS.find(v=>v[0]===a);if(x)return x[1];for(const m of MOVES)for(const d of m.keys)if(d[0]===a)return a==='m_roll_l'||a==='m_roll_r'?d[1]:m.n+' (atajo)';return a;}
function capStart(dev,a,i){CAP={dev,a,i,armed:dev!=='gp'};render_ui();}
function capEnd(){CAP=null;ctlIgnore=performance.now()+350;}
function capDone(tok){if(!CAP)return;const{dev,a,i}=CAP,b=SAVE.ctl[dev];let moved=null;
 if(tok){for(const k in b)for(let j=0;j<b[k].length;j++)if(b[k][j]===tok&&!(k===a&&j===i)){moved=k;b[k][j]='';}b[a][i]=tok;if(moved&&moved!==a)setTimeout(()=>toast('«'+tokLabel(tok)+'» pasa a «'+actName(a)+'» (antes: '+actName(moved)+')'),0);}
 else b[a][i]='';
 kbC=null;persist();capEnd();setTimeout(render_ui,0);}
addEventListener('keydown',e=>{if(!CAP)return;e.preventDefault();e.stopImmediatePropagation();
 if(e.code==='Escape'){capEnd();render_ui();return;}if(CAP.dev!=='kb')return;
 if(e.code==='Backspace'||e.code==='Delete'){capDone('');return;}
 if(['MetaLeft','MetaRight','ContextMenu'].includes(e.code))return;capDone(e.code);},true);
addEventListener('mousedown',e=>{if(!CAP||CAP.dev!=='kb')return;if(e.target.closest('[data-ctl="cancel"]'))return;e.preventDefault();e.stopImmediatePropagation();capDone('Mouse'+e.button);},true);
addEventListener('contextmenu',e=>{if(CAP)e.preventDefault();},true);
/* --- probador de combos (pestaña Combos de Ajustes) --- */
function testShow(t){const o=document.getElementById('cmbOut');if(o){o.textContent='✔ '+t;o.classList.remove('hit');void o.offsetWidth;o.classList.add('hit');}}
function testTok(k){tokSink=(id,dir)=>testShow(MOVES.find(m=>m.id===id).n+(dir?(dir<0?' ←':' →'):''));pushTok(k);tokSink=null;
 const hh=document.getElementById('cmbHist');if(hh)hh.textContent=tokH.map(x=>ARR[x.k]).join('  ')||'—';}
addEventListener('keydown',e=>{if(running||tab!=='play'||ctlTab!=='cmb'||CAP||e.repeat)return;const a=kbMap()[e.code];if(!a)return;
 const k={left:'L',right:'R',boost:'B',flip:'D'}[a];
 if(k){e.preventDefault();testTok(k);}else if(a.slice(0,2)==='m_'){e.preventDefault();testShow(actName(a)+' (atajo directo)');}});
function ctlGo(){/* hueco para ampliaciones */}
/* táctil */
const tk={};
document.querySelectorAll('#touch button').forEach(b=>{const k=b.dataset.k;
 const down=e=>{e.preventDefault();Snd.init();if(!M||M.paused)return;try{b.setPointerCapture(e.pointerId);}catch(_){}b.classList.add('on');
  if(k==='flip'){flipKey();}else if(k==='special')M.pl.in.sp=true;
  else if(k==='roll'){const I=M.pl.in;I.rollDir=(tk.sd>.18?Math.sign(angDiff(M.pl.ang,tk.sa))||M.pl.lastTurn||1:M.pl.lastTurn||1);I.roll=true;}
  else{tk[k]=true;if(k==='boost')tapKey('B');}};
 const up=e=>{e.preventDefault();b.classList.remove('on');tk[k]=false;};
 b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);});
/* ★ JOYSTICK flotante (estilo Brawl Stars): donde apoyas el pulgar aparece el stick; la dirección del stick es el rumbo al que gira el avión.
   tk.sd = inclinación 0…1 · tk.sa = ángulo en pantalla (el mapa no rota, así que coincide con el ángulo del avión) */
(()=>{const zone=document.getElementById('stickZone'),st=document.getElementById('stick');if(!zone||!st)return;const DZ=.16;let R=58,pid=null,ox=0,oy=0;
 const place=(x,y)=>{const g=document.getElementById('game').getBoundingClientRect();st.style.left=(x-g.left)+'px';st.style.top=(y-g.top)+'px';st.style.right='auto';st.style.marginLeft='calc(-68px*var(--tse,1))';st.style.marginRight='0';};
 const move=e=>{const dx=e.clientX-ox,dy=e.clientY-oy,d=Math.hypot(dx,dy),k=Math.min(d,R)/R;tk.sd=k<DZ?0:Math.min(1,(k-DZ)/(1-DZ)+.15);if(d>8)tk.sa=Math.atan2(dy,dx);
  const f=d>R?R/d:1;st.style.setProperty('--kx',dx*f+'px');st.style.setProperty('--ky',dy*f+'px');};
 zone.addEventListener('pointerdown',e=>{e.preventDefault();Snd.init();if(pid!==null||!M||M.paused)return;pid=e.pointerId;R=58*(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tse'))||1);try{zone.setPointerCapture(pid);}catch(_){}ox=e.clientX;oy=e.clientY;place(ox,oy);st.classList.add('on');move(e);});
 zone.addEventListener('pointermove',e=>{if(e.pointerId===pid)move(e);});
 const end=e=>{if(e&&e.pointerId!==pid)return;pid=null;tk.sd=0;st.classList.remove('on');st.style.setProperty('--kx','0px');st.style.setProperty('--ky','0px');st.style.left='';st.style.top='';st.style.right='';st.style.marginLeft='';st.style.marginRight='';};
 zone.addEventListener('pointerup',end);zone.addEventListener('pointercancel',end);zone.addEventListener('lostpointercapture',end);window.stickReset=()=>end(null);})();
addEventListener('touchstart',()=>document.body.classList.add('touch'),{once:true,passive:true});
/* ★ MEJORA: toca/clica el minimapa para ampliarlo o reducirlo */
(()=>{const cvs=document.getElementById('cv');if(!cvs)return;cvs.addEventListener('pointerdown',e=>{try{if(!M||!HR||!HR.mini)return;const r=cvs.getBoundingClientRect(),sx=(typeof VW==='number'?VW:r.width)/r.width,x=(e.clientX-r.left)*sx,y=(e.clientY-r.top)*sx,b=HR.mini;if(x>=b[0]&&x<=b[0]+b[2]&&y>=b[1]&&y<=b[1]+b[3]){M.mmBig=!M.mmBig;e.stopPropagation();}}catch(err){}});})();
$('pbtn').addEventListener('click',()=>setPause(true));
gameEl.addEventListener('contextmenu',e=>e.preventDefault());
gameEl.addEventListener('mousedown',e=>{if(!running||!M||M.paused||e.target.closest('button'))return;Snd.init();const c='Mouse'+e.button,a=kbMap()[c];if(a){pressed.add(c);onAction(a);}});
addEventListener('mouseup',e=>{pressed.delete('Mouse'+e.button);});
$('bResume').addEventListener('click',()=>setPause(false));
{let arm=0,tm=0;$('bEnd').addEventListener('click',()=>{const t=$('bEndT');if(!t){quitGame();return;}if(!arm){arm=1;t.textContent='¿Seguro? Se pierde la partida';clearTimeout(tm);tm=setTimeout(()=>{arm=0;t.textContent='Abandonar';},3500);return;}arm=0;clearTimeout(tm);t.textContent='Abandonar';quitGame();});}
/* ★ El joystick también alimenta los combos: un «golpe» del stick a un lado del rumbo cuenta como ◀ / ▶ (igual que pulsar la flecha) */
function stickTok(pl,df){const sdn=df>.45?'R':df<-.45?'L':0;if(sdn&&sdn!==pl._stk)tapKey(sdn);if(!sdn&&Math.abs(df)<.2)pl._stk=0;else if(sdn)pl._stk=sdn;}
function playerInput(){
 const mk=(pl,g,kb)=>{const I=pl.in,dn=a=>(kb&&actDown(a))||g[a],t=a=>kb&&tk[a];I.turn=((dn('right')||t('right'))?1:0)-((dn('left')||t('left'))?1:0);if(kb&&!I.turn&&tk.sd>0){const df=angDiff(pl.ang,tk.sa);I.turn=clamp(df*3.2,-1,1)*(.55+.45*tk.sd);stickTok(pl,df);}else if(kb)pl._stk=0;I.boost=!!(dn('boost')||t('boost'));I.brake=false;I.fire=!!(dn('fire')||t('fire'));I.sec=!!(dn('sec')||t('sec'));};
 if(M.split){mk(M.pl,{},true);for(let i=1;i<M.pls.length;i++)mk(M.pls[i],SPA[i]||{},false);}else mk(M.pl,padAct||{},true);}
const SPT=[null,[],[],[]],SPA=[null,null,null,null],SPP=[null,null,null,null];
function asPl(i,fn){const sp=M.pl,st=tokH,sa=padAct,sq=padPrevAct;M.pl=M.pls[i];tokH=SPT[i];padAct=SPA[i];padPrevAct=SPP[i];try{fn();}finally{SPA[i]=padAct;SPP[i]=padPrevAct;M.pl=sp;tokH=st;padAct=sa;padPrevAct=sq;}}
/* ★ Escala efectiva de los controles táctiles: el tamaño elegido, pero sin invadir el minimapa (vertical) ni el centro de la pantalla (horizontal) */
let _tseK='';function fitTouch(){try{const c=SAVE.cfg,u=(c.tsz||100)/100,mb=(M&&!M.split&&HR.mini)?HR.mini[1]+HR.mini[3]:0,safeB=14,availH=Math.max(120,VH-mb-safeB-10),k=Math.max(.7,Math.min(u,availH/180,(VW*.4)/240)),key=k.toFixed(2);if(key!==_tseK){_tseK=key;document.documentElement.style.setProperty('--tse',key);}}catch(e){}}
function touchState(){if(!document.body.classList.contains('touch')||!M)return;fitTouch();const p=M.pl,a=$('tbSp'),b=$('tbSec'),bs=document.querySelector('#touch [data-k=special]'),bc=document.querySelector('#touch [data-k=sec]');
 if(a){const t=p.spCd>0&&p.def.sp.t!=='fenix'?String(Math.ceil(p.spCd)):'';if(a.textContent!==t)a.textContent=t;bs.classList.toggle('cd',p.spCd>0);}
 if(b){const t=String(p.secAmmo);if(b.textContent!==t)b.textContent=t;bc.classList.toggle('cd',p.secAmmo<=0);}}
let FRERR=0;
function frame(now){if(!running)return;raf=requestAnimationFrame(frame);let dt=(now-last)/1000;last=now;if(dt>.1)dt=.1;
 try{if(!M.paused){playerInput();if(M.net&&NET.role==='guest')netGuestStep(dt);else{let n=Math.max(1,Math.ceil(dt/.017)),sd=dt/n;for(let i=0;i<n;i++)updateMatch(sd);if(M.net)netHostTick(dt);}if(M.tut)tutTick(dt);}
 render();
 touchState();if(M.over&&M.overT>(M.split?5:2.8)&&!resultShown){resultShown=true;endGame();}FRERR=0;}catch(e){console.error('frame',e);if(++FRERR>=30){FRERR=0;try{setPause(true);toast('Error en el juego: pausado');}catch(e2){}}}}
function startGame(tut){try{document.activeElement&&document.activeElement.blur();}catch(e){}Snd.init();Snd.on=!!SAVE.cfg.sound;const c=SAVE.cfg;
 stopPrev();newMatch({plane:SAVE.sel.plane,map:SAVE.sel.map,bots:tut?0:(snapBots(),c.bots),diff:c.diff,time:tut?60:c.time,mode:tut?'ffa':(MODES[c.mode]||MODES[0]).id,split:!tut&&c.split>1?c.split:0,planes:[c.p2,c.p3,c.p4].map(i=>Object.keys(PLANE).filter(planeOwned)[i]||SAVE.sel.plane)});if(tut){M.tut={i:0};tutEnter(0);}
 if(M.split&&padCount()<M.pls.length-1)setTimeout(()=>toast('Los jugadores con mando: conéctalos y pulsa un botón'),400);
 gameEl.hidden=false;pauseEl.hidden=true;document.documentElement.style.overflow='hidden';resize();buildMini();resultShown=false;running=true;last=performance.now();
 pressed.clear();tokH.length=0;for(const k in tk)tk[k]=false;if(window.stickReset)stickReset();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}
function quitGame(){if(M&&M.net&&NET.inMatch)netAbort();tutCleanup();running=false;cancelAnimationFrame(raf);if(M)M.paused=false;pauseEl.hidden=true;gameEl.hidden=true;document.documentElement.style.overflow='';if(tab==='result')tab='home';render_ui();window.scrollTo(0,0);if(NET.on&&NET.role==='host'&&!NET.inMatch)netUI(true);}
function endGame(){if(M&&M.net)netMatchEnded();running=false;cancelAnimationFrame(raf);
 const spv=M&&M.split?splitVerdict()+' · '+M.pls.map((p,i)=>'J'+(i+1)+' '+p.score).join(' · '):null;
 const res=finishMatch();const mk='map_'+res.cfg.map;if(res.mode==='ffa'&&res.pl.score>(SAVE.rec[mk]||0)){SAVE.rec[mk]=res.pl.score;persist();}
 lastResult=res;gameEl.hidden=true;document.documentElement.style.overflow='';tab='result';render_ui();window.scrollTo(0,0);
 const ready=ACH.filter(a=>achDone(a.id)&&!SAVE.claimed[a.id]).length;if(spv)setTimeout(()=>toast(spv),300);if(ready)setTimeout(()=>toast(ready+' objetivo(s) listos para cobrar en Retos'),spv?3800:600);}
addEventListener('resize',()=>{if(running)resize();});
loadSave();ensureDaily();applyUIPrefs();
/* ★ MEJORA: etiquetas accesibles para botones sin texto (usa title o data-tip) */
const fixAria=root=>{try{(root||document).querySelectorAll('button:not([aria-label]),[role=button]:not([aria-label])').forEach(b=>{if(b.textContent.trim())return;const l=b.getAttribute('title')||b.dataset.tip||b.dataset.act||b.dataset.go;if(l)b.setAttribute('aria-label',l);});}catch(e){}};
let _fa=0;new MutationObserver(()=>{if(_fa)return;_fa=requestAnimationFrame(()=>{_fa=0;fixAria();});}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.act==='optv'){SAVE.cfg[t.dataset.k]=+t.value;persist();applyUIPrefs();}});
{let hs='';try{hs=location.hash.slice(1);}catch(e){}if(TABS.some(t=>t[0]===hs))tab=hs;}
addEventListener('hashchange',()=>{if(running)return;let hs='';try{hs=location.hash.slice(1);}catch(e){}if(TABS.some(t=>t[0]===hs)&&hs!==tab){tab=hs;render_ui();}});

function askTutorial(){let seen=false;try{seen=!!(localStorage.getItem('ases_tut')||localStorage.getItem('ases_tutask'));}catch(e){}if(seen)return;try{localStorage.setItem('ases_tutask','1');}catch(e){}
 const m=document.createElement('div');m.className='modal';m.id='tutAsk';
 m.innerHTML='<div class="mbox" role="dialog" aria-modal="true" aria-labelledby="tutAskT"><h2 id="tutAskT">¿Quieres el tutorial?</h2><div class="mdesc"><p>Aprende paso a paso a volar, disparar y hacer acrobacias. Sin prisa, sin rivales peligrosos y sin riesgo: el juego se detiene mientras lees. Gana 200 monedas al completarlo.</p></div><div class="row" style="margin-top:16px"><button class="btn pri" id="tutYes" style="font-size:20px;padding:10px 20px">Sí, enséñame</button><button class="btn" id="tutNo">Ahora no</button></div></div>';
 document.body.appendChild(m);const close=()=>m.remove();
 m.querySelector('#tutNo').onclick=close;m.querySelector('#tutYes').onclick=()=>{close();if(!planeOwned(SAVE.sel.plane))SAVE.sel.plane='halcon';startGame(true);};
 setTimeout(()=>{try{m.querySelector('#tutYes').focus();}catch(e){}},60);}
render_ui();setTimeout(askTutorial,400);

addEventListener('keydown',e=>{if(e.key==='Escape'&&!running){const m=document.querySelector('.modal');if(m){m.remove();pendingBuy=null;}}});
addEventListener('click',e=>{const t=e.target;if(t.classList&&t.classList.contains('modal')){t.remove();pendingBuy=null;}});
addEventListener('keydown',e=>{if(e.key==='Enter'&&!running&&!e.repeat&&!document.querySelector('.modal')&&!['TEXTAREA','INPUT','BUTTON','SELECT'].includes(e.target.tagName)){e.preventDefault();if(!planeOwned(SAVE.sel.plane))SAVE.sel.plane='halcon';startGame();}});
