'use strict';
/* ===== Mando (Gamepad API): juego y menús ===== */
(function(){
const dz=()=>SAVE.ctl.dz||.4;let pad=null,prev={},nav={t:0,dir:''},usingPad=false,padTest=null;
const btn=(g,i)=>!!(g.buttons[i]&&(g.buttons[i].pressed||g.buttons[i].value>.5));
function state(g){const ax=g.axes[0]||0,ay=g.axes[1]||0;
 return{L:ax<-dz()||btn(g,14),R:ax>dz()||btn(g,15),U:ay<-dz()||btn(g,12),D:ay>dz()||btn(g,13),A:btn(g,0),B:btn(g,1),X:btn(g,2),Y:btn(g,3),LB:btn(g,4),RB:btn(g,5),LT:btn(g,6),RT:btn(g,7),St:btn(g,9)};}
function clearFocus(){document.querySelectorAll('.gpf').forEach(e=>e.classList.remove('gpf'));usingPad=false;}
addEventListener('pointerdown',clearFocus,true);addEventListener('mousemove',()=>{if(usingPad)clearFocus();},{passive:true});
addEventListener('gamepadconnected',e=>{try{toast('Mando conectado');if(tab==='play'&&!running&&!CAP)render_ui();}catch(_){}});
const sig=el=>{const d=el.dataset;return el.id?'#'+el.id:['go','act','x','id','k','i','v','t','s'].map(k=>d[k]===undefined?'':k+'='+d[k]).join('|');};
function items(){const root=$('modal')||(!pauseEl.hidden&&running?pauseEl:document);
 return[...root.querySelectorAll('button,input,summary,textarea,[data-act],[data-go]')].filter(e=>{if(e.disabled)return false;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;const cs=getComputedStyle(e);return cs.visibility!=='hidden'&&cs.display!=='none';});}
function cur(list){const a=document.activeElement;return list.includes(a)?a:null;}
function setFocus(el){document.querySelectorAll('.gpf').forEach(e=>e.classList.remove('gpf'));if(!el)return;el.classList.add('gpf');usingPad=true;el.focus({preventScroll:true});
 const r=el.getBoundingClientRect(),nb=document.getElementById('nav'),pb=document.querySelector('.playbar'),top=70,bot=innerHeight-((nb?nb.offsetHeight:66)+(pb&&el.closest('.playbar')===null?pb.offsetHeight+30:30)+24);
 if(r.top<top)scrollBy({top:r.top-top-10,behavior:'smooth'});else if(r.bottom>bot&&!el.closest('#nav,.playbar'))scrollBy({top:r.bottom-bot+10,behavior:'smooth'});}
function move(dir){const list=items();let c=cur(list);
 if(!c){const f=list.find(e=>e.closest('.playbar'))||list.find(e=>e.id==='bResume')||list[0];setFocus(f);return;}
 const a=c.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=null,bs=1e9;
 for(const e of list){if(e===c)continue;const r=e.getBoundingClientRect(),dx=r.left+r.width/2-ax,dy=r.top+r.height/2-ay;
  let along,perp;if(dir==='L'){along=-dx;perp=Math.abs(dy);}else if(dir==='R'){along=dx;perp=Math.abs(dy);}else if(dir==='U'){along=-dy;perp=Math.abs(dx);}else{along=dy;perp=Math.abs(dx);}
  if(along<4)continue;if(perp>along*2.2+r.height&&perp>60)continue;const sc=along+perp*2.2;if(sc<bs){bs=sc;best=e;}}
 if(best)setFocus(best);else if(dir==='U'||dir==='D')scrollBy({top:dir==='U'?-180:180,behavior:'smooth'});}
function activate(){const list=items(),c=cur(list);if(!c)return;const s=sig(c);c.click();
 setTimeout(()=>{if(document.body.contains(c)&&c===document.activeElement)return;const n=items().find(e=>sig(e)===s);if(n)setFocus(n);else if(usingPad)move('D');},30);}
function tabStep(d){const ks=TABS.slice(0,7).map(t=>t[0]);let i=ks.indexOf(tab);if(i<0)i=0;go(ks[(i+d+ks.length)%ks.length]);setTimeout(()=>{const b=document.querySelector('#nav .on');if(b)setFocus(b);},40);}
function menuPad(s,p,now){
 const edge=k=>s[k]&&!p[k];
 let held=null;for(const k of['L','R','U','D'])if(s[k]){held=k;break;}
 if(!held)nav.dir='';else if(nav.dir!==held||edge(held)){nav.dir=held;nav.t=now;nav.first=true;move(held);}
 else if(now-nav.t>(nav.first?380:120)){nav.t=now;nav.first=false;move(held);}
 if(edge('A')){if(!cur(items()))move('D');else activate();}
 if(edge('B')){if($('modal'))closeModal();else if(running&&M&&M.paused)setPause(false);else if(tab!=='home'&&!running)go('home');}
 if(!running){if(edge('LB'))tabStep(-1);if(edge('RB'))tabStep(1);
  if(edge('St')||edge('Y')){const g=document.querySelector('.playbar .go,.playbar button');if(g)g.click();}}
 else if(edge('St'))setPause(false);}
function padTok(g,tok){if(tok.charAt(0)==='B')return btn(g,+tok.slice(1));const m=/^A(\d+)([+-])$/.exec(tok);if(!m)return false;const v=g.axes[+m[1]]||0;return m[2]==='-'?v<-dz():v>dz();}
function padHas(g,toks){for(const t of toks)if(t&&padTok(g,t))return true;return false;}
function gamePad(s,p,g){
 const cur={};for(const a in SAVE.ctl.gp)cur[a]=padHas(g,SAVE.ctl.gp[a]);
 const prevA=padPrevAct||{};padAct=cur;
 if(M.tut&&M.tut.card&&s.A&&!p.A)tutPress();
 for(const a in cur)if(cur[a]&&!prevA[a]&&a!=='pause')onAction(a);
 if(cur.pause&&!prevA.pause)setPause(true);
 padPrevAct=cur;}
function capPad(g){
 if(!CAP.armed){if(g.buttons.some((b,i)=>btn(g,i))||g.axes.some(v=>Math.abs(v)>.5))return;CAP.armed=true;return;}
 for(let i=0;i<g.buttons.length;i++)if(btn(g,i)){capDone('B'+i);return;}
 for(let i=0;i<g.axes.length;i++){const v=g.axes[i]||0;if(Math.abs(v)>.7){capDone('A'+i+(v<0?'-':'+'));return;}}}
function splitPads(gs){const ps=[];for(const x of gs)if(x&&x.connected)ps.push(x);for(let i=1;i<M.pls.length;i++){const g=ps[i-1];if(!g){SPA[i]=null;SPP[i]=null;continue;}asPl(i,()=>gamePad(state(g),{},g));}}
function loop(now){requestAnimationFrame(loop);
 const gs=(navigator.getGamepads?navigator.getGamepads():[])||[];let g=null;for(const x of gs)if(x&&x.connected){g=x;break;}
 if(!g){padAct=null;padPrevAct=null;SPA.fill(null);SPP.fill(null);prev={};return;}
 const s=state(g);
 if(CAP&&CAP.dev==='gp'){padAct=null;padPrevAct=null;capPad(g);prev=s;return;}
 if(running&&M&&!M.paused&&!M.over){Snd.init();if(M.split)splitPads(gs);else gamePad(s,prev,g);}
 else{padAct=null;padPrevAct=null;SPA.fill(null);SPP.fill(null);
  if(!running&&tab==='play'&&ctlTab==='cmb'&&!CAP){const cur={};for(const a of['left','right','boost','flip'])cur[a]=padHas(g,SAVE.ctl.gp[a]);const pv=padTest||{};for(const a in cur)if(cur[a]&&!pv[a])testTok({left:'L',right:'R',boost:'B',flip:'D'}[a]);padTest=cur;}
  if(!running||(M&&M.paused))menuPad(s,prev,now);}
 prev=s;}
requestAnimationFrame(loop);
netBoot();
})();
