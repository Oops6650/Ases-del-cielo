'use strict';
/* ===== Tuneos: dibujo procedural de estelas y efectos, miniaturas y vista previa ===== */
/* Estela: cinta que sigue una trayectoria (pts de más reciente a más antiguo). Misma pieza en la vista previa y en el juego */
function trailPts(c,id,pts,t,sc){if(!pts||pts.length<2)return;const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const tot=cum[cum.length-1];if(tot<2)return;
 const N=17,S=[];let j=1;for(let i=0;i<N;i++){const d=tot*i/(N-1);while(j<pts.length-1&&cum[j]<d)j++;const a=pts[j-1],b=pts[j],sp=cum[j]-cum[j-1]||1,u=Math.min(1,Math.max(0,(d-cum[j-1])/sp));S.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);}
 const Nn=S.map((p,i)=>{const a=S[Math.max(0,i-1)],b=S[Math.min(N-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[-dy/l,dx/l];});
 const P=(k,off)=>{const i=Math.round(k*(N-1)),p=S[i],n=Nn[i];return[p[0]+n[0]*off,p[1]+n[1]*off];};
 const grad=cl=>{const g=c.createLinearGradient(S[0][0],S[0][1],S[N-1][0],S[N-1][1]);g.addColorStop(0,cl);g.addColorStop(1,cl+'00');return g;};
 const poly=off=>{c.beginPath();S.forEach((p,i)=>{const o=off(i/(N-1)),n=Nn[i],x=p[0]+n[0]*o,y=p[1]+n[1]*o;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();};
 c.save();c.lineCap='round';c.lineJoin='round';const M9=9;
 if(id==='humo'){for(let i=0;i<M9;i++){const k=i/(M9-1),p=P(k,Math.sin(k*5-t*6)*1.6*sc*k);c.globalAlpha=.75*(1-k);c.fillStyle='#c8ccd4';c.beginPath();c.arc(p[0],p[1],(2.2+i*.9)*sc,0,TAU);c.fill();}}
 else if(id==='fuego'){const cs=['#fff3b0','#ffdc7a','#ffb03d','#ff7a2b','#ff4a22','#c0361a'];for(let i=M9-1;i>=0;i--){const k=i/(M9-1),p=P(k,Math.sin(i*2+t*20)*sc);c.globalAlpha=.95*(1-k*.7);c.fillStyle=cs[Math.min(5,Math.floor(k*6))];c.beginPath();c.arc(p[0],p[1],(4.4-i*.32)*sc,0,TAU);c.fill();}}
 else if(id==='neon'){c.strokeStyle=grad('#4ff6ff');c.shadowColor='#4ff6ff';c.shadowBlur=10*sc;c.lineWidth=3.2*sc;poly(()=>0);c.shadowBlur=0;c.strokeStyle=grad('#ffffff');c.lineWidth=1.1*sc;poly(()=>0);}
 else if(id==='chispas'){for(let i=0;i<14;i++){const k=i/13,p=P(k,Math.sin(i*12.9+t*3)*5*sc*(.3+k));c.globalAlpha=1-k*.8;c.fillStyle=i%3?'#ffe27a':'#fff';c.beginPath();c.arc(p[0],p[1],(1.6+((i*7)%3)*.5)*sc,0,TAU);c.fill();}}
 else if(id==='burbujas'){for(let i=0;i<7;i++){const k=i/6,p=P(k,-Math.abs(Math.sin(i*5.3))*8*sc*k-3*sc*k+Math.sin(t*2+i)*sc);c.globalAlpha=.9-k*.5;c.strokeStyle='#bfe9ff';c.fillStyle='#bfe9ff44';c.lineWidth=1.3*sc;c.beginPath();c.arc(p[0],p[1],(2+((i*5)%4))*sc,0,TAU);c.fill();c.stroke();}}
 else if(id==='arcoiris'){['#ff4d5e','#ffa62b','#ffe14a','#4ade80','#38bdf8','#a78bfa'].forEach((cl,j)=>{c.strokeStyle=grad(cl);c.lineWidth=1.9*sc;poly(k=>(j-2.5)*1.8*sc+Math.sin(t*4+j+k*4)*sc*.4);});}
 else if(typeof id==='string'&&id.startsWith('team')){const tc=TEAMC[+id[4]];c.strokeStyle=grad(tc);c.shadowColor=tc;c.shadowBlur=8*sc;c.lineWidth=3*sc;poly(()=>0);c.shadowBlur=0;c.strokeStyle=grad('#ffffff');c.lineWidth=1*sc;poly(()=>0);}
 else if(id==='doble'){for(const s of[-1,1]){c.strokeStyle=grad('#ffffff');c.lineWidth=2.2*sc;poly(()=>s*4.5*sc);}}
 else if(id==='aurora'){for(let j=0;j<3;j++){c.strokeStyle=grad(['#2ee6a6','#6a4cff','#ff7ad9'][j]);c.lineWidth=2.6*sc;c.globalAlpha=.85;poly(k=>Math.sin(k*7+t*3+j*2)*3.5*sc*k+(j-1)*2.2*sc);}}
 else if(id==='vapor'){for(let i=0;i<M9;i++){const k=i/(M9-1),p=P(k,Math.sin(k*4-t*3)*3*sc*k);c.globalAlpha=.55*(1-k);c.fillStyle='#ffffff';c.beginPath();c.arc(p[0],p[1],(3+i*1.5)*sc,0,TAU);c.fill();}}
 else if(id==='tinta'){c.strokeStyle=grad('#27306b');c.lineWidth=3.6*sc;poly(k=>Math.sin(k*9-t*5)*2*sc*k);c.strokeStyle=grad('#6a7cff');c.lineWidth=1.2*sc;poly(k=>Math.sin(k*9-t*5)*2*sc*k);}
 else if(id==='rayos'){c.strokeStyle=grad('#ffe14a');c.shadowColor='#ffe14a';c.shadowBlur=7*sc;c.lineWidth=2*sc;poly(k=>((Math.floor(k*14+t*18)%2)?1:-1)*3.2*sc*(.4+k));c.shadowBlur=0;}
 else if(id==='pixeles'){for(let i=0;i<12;i++){const k=i/11,p=P(k,(((i*37)%7)-3)*1.7*sc*(.3+k)),q=(2+((i*5)%3))*sc;c.globalAlpha=1-k*.75;c.fillStyle=['#38bdf8','#4ade80','#ffd93d','#ff4d5e'][i%4];c.fillRect(Math.round(p[0]/q)*q,Math.round(p[1]/q)*q,q,q);}}
 else if(id==='corazones'){for(let i=0;i<6;i++){const k=i/5,p=P(k,Math.sin(i*3+t*3)*4*sc*k),r=(2.2+(5-i)*.45)*sc;c.globalAlpha=1-k*.7;c.fillStyle='#ff4d6d';c.beginPath();c.moveTo(p[0],p[1]+r*.8);c.bezierCurveTo(p[0]-r*1.4,p[1]-r*.2,p[0]-r*.5,p[1]-r,p[0],p[1]-r*.35);c.bezierCurveTo(p[0]+r*.5,p[1]-r,p[0]+r*1.4,p[1]-r*.2,p[0],p[1]+r*.8);c.fill();}}
 else if(id==='estrellas'){for(let i=0;i<7;i++){const k=i/6,p=P(k,Math.sin(i*5+t*4)*4*sc*k);c.globalAlpha=1-k*.75;c.fillStyle=i%2?'#ffd93d':'#fff';c.save();c.translate(p[0],p[1]);c.rotate(t*2+i);star(c,0,0,(4.2-i*.4)*sc);c.restore();}}
 else if(id==='plasma'){c.strokeStyle=grad('#b36bff');c.shadowColor='#b36bff';c.shadowBlur=12*sc;c.lineWidth=4*sc;poly(k=>Math.sin(k*8-t*8)*1.6*sc);c.shadowBlur=0;c.strokeStyle=grad('#ffffff');c.lineWidth=1.3*sc;poly(k=>Math.sin(k*8-t*8)*1.6*sc);}
 else if(id==='oro'){for(let i=0;i<16;i++){const k=i/15,p=P(k,Math.sin(i*9.1+t*4)*5*sc*(.3+k));c.globalAlpha=1-k*.8;c.fillStyle=i%3?'#ffd34d':'#fff3b0';c.beginPath();c.arc(p[0],p[1],(1.2+((i*5)%3)*.6)*sc,0,TAU);c.fill();}c.strokeStyle=grad('#ffd34d');c.lineWidth=1.4*sc;c.globalAlpha=.6;poly(()=>0);}
 else if(id==='galaxia'){c.strokeStyle=grad('#2b1b6e');c.lineWidth=5*sc;poly(()=>0);for(let i=0;i<14;i++){const k=i/13,p=P(k,Math.sin(i*7.7)*3*sc);c.globalAlpha=1-k*.6;c.fillStyle=['#fff','#c084fc','#7de0ff'][i%3];c.beginPath();c.arc(p[0],p[1],(.8+((i*3)%3)*.5)*sc,0,TAU);c.fill();}}
 else if(id==='lava'){for(let i=M9-1;i>=0;i--){const k=i/(M9-1),p=P(k,Math.sin(i*1.6+t*4)*2*sc);c.globalAlpha=1-k*.5;c.fillStyle=i%2?'#ff4a22':'#ffb03d';c.beginPath();c.arc(p[0],p[1],(4.6-i*.3)*sc,0,TAU);c.fill();c.fillStyle='#2b1a16';c.beginPath();c.arc(p[0]+sc*2,p[1]-sc*2,(1.4)*sc*(1-k),0,TAU);c.fill();}}
 else if(id==='prisma'){['#ff4d5e','#ffd93d','#4ade80','#38bdf8','#a78bfa'].forEach((cl,j)=>{c.strokeStyle=grad(cl);c.lineWidth=2.2*sc;c.shadowColor=cl;c.shadowBlur=4*sc;poly(k=>(j-2)*(1.4+k*3.2)*sc);});c.shadowBlur=0;}
 else if(id==='fantasma'){for(let i=0;i<M9;i++){const k=i/(M9-1),p=P(k,Math.sin(k*6-t*5)*3*sc);c.globalAlpha=.5*(1-k);c.fillStyle='#d9f3ff';c.beginPath();c.arc(p[0],p[1],(5-i*.35)*sc,0,TAU);c.fill();c.globalAlpha=(1-k)*.8;c.fillStyle='#10131a';c.beginPath();c.arc(p[0]+sc,p[1]-sc*.5,Math.max(.4,(1.1-k))*sc,0,TAU);c.fill();}}
 c.restore();}
function trailDraw(c,id,x,y,ang,len,t,sc){const pts=[];for(let i=0;i<17;i++){const k=i/16;pts.push([x-Math.cos(ang)*len*k,y-Math.sin(ang)*len*k]);}trailPts(c,id,pts,t,sc);}
function fxDraw(c,id,x,y,r,ph){c.save();c.translate(x,y);const e=1-(1-ph)*(1-ph),al=Math.max(0,1-ph*ph*1.1);
 if(id==='confeti'){const cs=['#ff4d5e','#ffd93d','#4ade80','#38bdf8','#c084fc','#ffffff'];for(let i=0;i<22;i++){const a=i*2.399,d=r*(.25+.75*((i*7)%10)/10)*e;c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d+ph*ph*r*.5);c.rotate(i+ph*8);c.globalAlpha=al;c.fillStyle=cs[i%6];c.fillRect(-r*.07,-r*.035,r*.14,r*.07);c.restore();}}
 else if(id==='fuegos'){const cs=['#ff4d5e','#ffd93d','#38bdf8'];for(let b=0;b<3;b++){const bx=(b-1)*r*.75,by=(b%2?.25:-.2)*r,pp=Math.max(0,Math.min(1,ph*1.3-b*.15)),ee=1-(1-pp)*(1-pp);for(let i=0;i<12;i++){const a=i/12*TAU;c.globalAlpha=Math.max(0,1-pp);c.strokeStyle=cs[b];c.lineWidth=Math.max(1.5,r*.05);c.lineCap='round';c.beginPath();c.moveTo(bx+Math.cos(a)*r*.16*ee,by+Math.sin(a)*r*.16*ee);c.lineTo(bx+Math.cos(a)*r*.42*ee,by+Math.sin(a)*r*.42*ee+pp*r*.1);c.stroke();}}}
 else if(id==='onda'){for(let k=0;k<3;k++){const pp=Math.max(0,Math.min(1,ph*1.25-k*.14));if(pp<=0)continue;c.globalAlpha=(1-pp)*.9;c.strokeStyle=k?'#ffffff':'#9be7ff';c.lineWidth=r*.09*(1-pp)+1;c.beginPath();c.arc(0,0,r*pp,0,TAU);c.stroke();}c.globalAlpha=al*.4;c.fillStyle='#9be7ff';c.beginPath();c.arc(0,0,r*.25*(1-ph),0,TAU);c.fill();}
 else if(id==='glitch'){for(let i=0;i<10;i++){const a=i*1.7,d=r*.6*e*((i%3)+1)/3,px=Math.cos(a)*d,py=Math.sin(a)*d*.8,w=r*(.2+(i%4)*.1),hh=r*.07*(1+i%3),j=(Math.floor(ph*14+i)%3-1)*r*.05;c.globalAlpha=al;c.fillStyle='#00f0ff';c.fillRect(px+j-w/2,py,w,hh);c.fillStyle='#ff2bd6';c.fillRect(px-j-w/2+2,py+hh*.4,w,hh);c.fillStyle='#fff';c.fillRect(px-w/2,py+hh*.2,w*.6,hh*.5);}}
 else if(id==='estrellas'){const cs=['#ffd93d','#fff','#ffb03d'];for(let i=0;i<14;i++){const a=i*2.399,d=r*(.2+.7*((i*7)%10)/10)*e;c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d);c.rotate(ph*5+i);c.globalAlpha=al;c.fillStyle=cs[i%3];star(c,0,0,r*(.07+((i*3)%4)*.02));c.restore();}}
 else if(id==='burbujas'){for(let i=0;i<14;i++){const a=i*2.1,d=r*(.15+.75*((i*5)%9)/9)*e;c.globalAlpha=al*.9;c.strokeStyle='#bfe9ff';c.fillStyle='#bfe9ff33';c.lineWidth=Math.max(1,r*.02);c.beginPath();c.arc(Math.cos(a)*d,Math.sin(a)*d-ph*r*.25,r*(.05+((i*3)%4)*.025),0,TAU);c.fill();c.stroke();}}
 else if(id==='rayos'){c.lineCap='round';c.lineJoin='round';for(let i=0;i<9;i++){const a=i/9*TAU+.3;c.globalAlpha=Math.max(0,1-ph*1.3);c.strokeStyle=i%2?'#fff':'#ffe14a';c.shadowColor='#ffe14a';c.shadowBlur=8;c.lineWidth=Math.max(1.5,r*.035);c.beginPath();c.moveTo(0,0);let d=0;for(let k=1;k<=5;k++){d=r*.19*k*e;const j=((k*7+i)%3-1)*r*.07;c.lineTo(Math.cos(a)*d-Math.sin(a)*j,Math.sin(a)*d+Math.cos(a)*j);}c.stroke();}c.shadowBlur=0;}
 else if(id==='corazones'){c.fillStyle='#ff4d6d';for(let i=0;i<12;i++){const a=i*2.5,d=r*(.2+.7*((i*7)%10)/10)*e,x=Math.cos(a)*d,y=Math.sin(a)*d-ph*r*.3,q=r*(.06+((i*3)%3)*.03);c.globalAlpha=al;c.beginPath();c.moveTo(x,y+q*.8);c.bezierCurveTo(x-q*1.4,y-q*.2,x-q*.5,y-q,x,y-q*.35);c.bezierCurveTo(x+q*.5,y-q,x+q*1.4,y-q*.2,x,y+q*.8);c.fill();}}
 else if(id==='pixel'){const cs=['#ff4d5e','#ffd93d','#4ade80','#38bdf8','#fff'];for(let i=0;i<26;i++){const a=i*2.399,d=r*(.15+.8*((i*7)%10)/10)*e,q=Math.max(3,r*.07),x=Math.round(Math.cos(a)*d/q)*q,y=Math.round(Math.sin(a)*d/q)*q;c.globalAlpha=al;c.fillStyle=cs[i%5];c.fillRect(x,y,q,q);}}
 else if(id==='nova'){for(let k=0;k<2;k++){const pp=Math.max(0,Math.min(1,ph*1.2-k*.15));c.globalAlpha=(1-pp)*.9;c.strokeStyle=k?'#fff':'#c084fc';c.lineWidth=r*.07*(1-pp)+1;c.beginPath();c.arc(0,0,r*.8*pp,0,TAU);c.stroke();}c.globalAlpha=al;c.fillStyle='#fff';c.save();c.rotate(ph*2);for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(0,0);c.lineTo(r*.07,r*.1);c.lineTo(0,r*(.75-ph*.4));c.lineTo(-r*.07,r*.1);c.fill();}c.restore();}
 else if(id==='supernova'){const g=c.createRadialGradient(0,0,0,0,0,r*(.3+.7*e));g.addColorStop(0,'#fff');g.addColorStop(.35,'#ffd34d99');g.addColorStop(1,'#ff4a2200');c.globalAlpha=al;c.fillStyle=g;c.beginPath();c.arc(0,0,r*(.3+.7*e),0,TAU);c.fill();c.strokeStyle='#fff';c.lineWidth=Math.max(1.5,r*.03);c.lineCap='round';for(let i=0;i<16;i++){const a=i/16*TAU,d0=r*.15*e,d1=r*(i%2?.5:.85)*e;c.beginPath();c.moveTo(Math.cos(a)*d0,Math.sin(a)*d0);c.lineTo(Math.cos(a)*d1,Math.sin(a)*d1);c.stroke();}for(let k=0;k<2;k++){const pp=Math.max(0,Math.min(1,ph*1.15-k*.18));c.globalAlpha=(1-pp)*.8;c.strokeStyle=k?'#ffd34d':'#ff7a2b';c.lineWidth=r*.06*(1-pp)+1;c.beginPath();c.arc(0,0,r*1.05*pp,0,TAU);c.stroke();}}
 else if(id==='sakura'){for(let i=0;i<24;i++){const a=i*2.399,d=r*(.15+.8*((i*7)%10)/10)*e;c.save();c.translate(Math.cos(a)*d+Math.sin(ph*6+i)*r*.04,Math.sin(a)*d+ph*ph*r*.5);c.rotate(i+ph*5);c.globalAlpha=al;c.fillStyle=i%3?'#ffb7d0':'#fff0f5';c.beginPath();c.ellipse(0,0,r*.06,r*.035,0,0,TAU);c.fill();c.restore();}}
 else if(id==='lluvia'){c.lineCap='round';for(let i=0;i<20;i++){const x=((i*53)%100-50)/50*r*.85*(.3+.7*e),y0=-r*.8+((i*37)%100)/100*r*.6;c.globalAlpha=al;c.strokeStyle=i%2?'#bfe9ff':'#fff';c.lineWidth=Math.max(1.2,r*.025);c.beginPath();c.moveTo(x,y0+ph*r*1.2);c.lineTo(x,y0+ph*r*1.2+r*.2);c.stroke();}c.globalAlpha=al*.5;c.fillStyle='#bfe9ff';c.beginPath();c.arc(0,0,r*.25*(1-ph),0,TAU);c.fill();}
 else{const rr=r*(.25+.75*e);c.globalAlpha=al*.55;c.fillStyle='#3a3a40';c.beginPath();c.arc(0,0,rr*1.05,0,TAU);c.fill();c.globalAlpha=al;const g=c.createRadialGradient(0,0,0,0,0,rr);g.addColorStop(0,'#fff6c8');g.addColorStop(.45,'#ffb03d');g.addColorStop(1,'#ff4a22');c.fillStyle=g;c.beginPath();for(let i=0;i<14;i++){const a=i/14*TAU,q=i%2?rr*.7:rr;c.lineTo(Math.cos(a)*q,Math.sin(a)*q);}c.closePath();c.fill();}
 c.restore();}
const THC={};
function noIcon(c,x,y,r){c.save();c.strokeStyle='#cfd6de';c.lineWidth=3;c.lineCap='round';c.beginPath();c.arc(x,y,r,0,TAU);c.moveTo(x-r*.7,y+r*.7);c.lineTo(x+r*.7,y-r*.7);c.stroke();c.restore();}
/* Miniatura (data URL) de un elemento: pintura, diseño y accesorio se ven sobre el avión; pegatina, estela y efecto, dibujados en grande */
function thumbURL(cat,id,pid,base){pid=pid||'halcon';base=base||DEFLOOK;const def=PLANE[pid]||PLANE.halcon,key=[cat,id,pid,cat==='pattern'||cat==='acc'||cat==='sticker'?base.paint:''].join('|');if(THC[key])return THC[key];
 const W=104,H=64,D=2,cv=document.createElement('canvas');cv.width=W*D;cv.height=H*D;const c=cv.getContext('2d');c.scale(D,D);
 const bg=c.createRadialGradient(W/2,H*.45,4,W/2,H/2,W*.62);bg.addColorStop(0,'#aab4be');bg.addColorStop(1,'#4a535c');c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle='#ffffff12';for(let i=0;i<H;i+=3)c.fillRect(0,i,W,1);
 const sh=def.shape,fit=Math.min(W*.8/(sh.len*1.1),H*.84/(sh.wing*1.25*2)),plane=(look,x,s,a)=>drawPlane(c,def,look,{x:x,y:H/2,ang:a===undefined?-.35:a,scale:s,t:1});
 if(cat==='paint')plane({...DEFLOOK,paint:id},W/2,fit);
 else if(cat==='pattern')plane({...DEFLOOK,paint:base.paint,pattern:id},W/2,fit);
 else if(cat==='acc'){if(id==='none')noIcon(c,W/2,H/2,14);else plane({...DEFLOOK,paint:base.paint,acc:id},W/2+5,fit*.85);}
 else if(cat==='sticker'){if(id==='none')noIcon(c,W/2,H/2,14);else{const col=paintOf(base.paint);c.fillStyle='#ffffff22';c.beginPath();c.arc(W/2,H/2,26,0,TAU);c.fill();c.save();c.translate(W/2,H/2);sticker(c,id,19,col[2],col[1]);c.restore();}}
 else if(cat==='trail'){const s=fit*.5,px=W*.82;trailDraw(c,id,px-sh.len*.5*s,H/2,0,W*.62,1.2,1.15);plane({...DEFLOOK,trail:id},px,s,0);}
 else if(cat==='fx')fxDraw(c,id,W/2,H/2,38,.42);
 return THC[key]=cv.toDataURL();}
const thImg=(cat,id,pid,base)=>'<img class="th" alt="" src="'+thumbURL(cat,id,pid,base)+'">';

/* ---- detalle del suelo ---- */
const SOFTP={};
function wrapDraw(S,x,y,r,fn){for(const dx of[-S,0,S])for(const dy of[-S,0,S]){if(x+dx<-r||x+dx>S+r||y+dy<-r||y+dy>S+r)continue;fn(x+dx,y+dy);}}
function mkTile(S,fn){const cv=document.createElement('canvas');cv.width=cv.height=S;fn(cv.getContext('2d'),S);return cv;}
function detailTile(id){const col=softCol(id),lt=shade(col,.35),dk=shade(col,-.22),r=mulberry(hashStr('det'+id));
 return mkTile(240,(x,S)=>{x.lineCap='round';x.lineJoin='round';const R=(a,b)=>a+r()*(b-a),P=()=>[r()*S,r()*S];
  if(id==='archi'){x.strokeStyle='#ffffff';x.lineWidth=2.6;x.globalAlpha=.38;for(let i=0;i<30;i++){const[px,py]=P(),rad=R(9,19);wrapDraw(S,px,py,24,(a,b)=>{x.beginPath();x.arc(a,b,rad,-2.2,-.9);x.stroke();});}
   x.globalAlpha=.5;x.fillStyle='#ffffff';for(let i=0;i<10;i++){const[px,py]=P();wrapDraw(S,px,py,4,(a,b)=>{x.beginPath();x.arc(a,b,1.8,0,TAU);x.fill();});}}
  else if(id==='canon'||id==='mesa'||id==='hielo'){x.strokeStyle=dk;x.lineWidth=3;x.globalAlpha=.22;for(let i=0;i<14;i++){const[px,py]=P(),w=R(50,110),h=R(8,18);wrapDraw(S,px,py,120,(a,b)=>{x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(a+w/2,b-h,a+w,b);x.stroke();});}
   x.globalAlpha=.3;x.fillStyle=dk;for(let i=0;i<46;i++){const[px,py]=P();wrapDraw(S,px,py,3,(a,b)=>{x.beginPath();x.arc(a,b,R(1,2),0,TAU);x.fill();});}
   x.globalAlpha=.4;x.fillStyle=lt;for(let i=0;i<8;i++){const[px,py]=P(),rx=R(4,8);wrapDraw(S,px,py,10,(a,b)=>{x.beginPath();x.ellipse(a,b,rx,rx*.7,R(0,3),0,TAU);x.fill();});}}
  else if(id==='fabrica'){x.strokeStyle=dk;x.lineWidth=3;x.globalAlpha=.16;for(let k=0;k<=3;k++){x.beginPath();x.moveTo(k*80,0);x.lineTo(k*80,S);x.moveTo(0,k*80);x.lineTo(S,k*80);x.stroke();}
   x.globalAlpha=.55;x.fillStyle=lt;for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(const[ox,oy]of[[10,10],[70,10],[10,70],[70,70]]){x.beginPath();x.arc(i*80+ox,j*80+oy,3,0,TAU);x.fill();}
   x.globalAlpha=.12;x.strokeStyle=dk;x.lineWidth=2;for(let i=0;i<8;i++){const[px,py]=P(),w=R(20,50);wrapDraw(S,px,py,60,(a,b)=>{x.beginPath();x.moveTo(a,b);x.lineTo(a+w,b+R(-6,6));x.stroke();});}}
  else if(id==='metro'){/* cemento: losas con juntas, granulado, grietas y manchas */
   x.globalAlpha=.4;x.strokeStyle='#6f7584';x.lineWidth=4;x.beginPath();x.moveTo(0,0);x.lineTo(S,0);x.moveTo(0,S/2);x.lineTo(S,S/2);x.moveTo(0,0);x.lineTo(0,S);x.moveTo(S/2,0);x.lineTo(S/2,S);x.stroke();
   x.globalAlpha=.35;x.strokeStyle='#ffffff';x.lineWidth=2;x.beginPath();x.moveTo(0,3);x.lineTo(S,3);x.moveTo(0,S/2+3);x.lineTo(S,S/2+3);x.moveTo(3,0);x.lineTo(3,S);x.moveTo(S/2+3,0);x.lineTo(S/2+3,S);x.stroke();
   for(let i=0;i<150;i++){const[px,py]=P();x.globalAlpha=R(.12,.3);x.fillStyle=r()>.5?'#5e6472':'#ffffff';x.beginPath();x.arc(px,py,R(.7,1.7),0,TAU);x.fill();}
   x.globalAlpha=.3;x.strokeStyle='#5e6472';x.lineWidth=1.8;for(let i=0;i<3;i++){let[px,py]=P();x.beginPath();x.moveTo(px,py);for(let k=0;k<5;k++){px+=R(-14,14);py+=R(6,16);x.lineTo(px,py);}x.stroke();}
   x.globalAlpha=.05;x.fillStyle='#3d4250';for(let i=0;i<4;i++){const[px,py]=P(),rad=R(16,34);wrapDraw(S,px,py,36,(a,b)=>{x.beginPath();x.ellipse(a,b,rad,rad*.7,R(0,3),0,TAU);x.fill();});}}
  else{/* valle y resto: hierba */x.strokeStyle=dk;x.lineWidth=2.4;x.globalAlpha=.34;for(let i=0;i<46;i++){const[px,py]=P(),h=R(6,11);wrapDraw(S,px,py,14,(a,b)=>{x.beginPath();for(const d of[-.5,0,.5]){x.moveTo(a,b);x.lineTo(a+Math.sin(d)*h,b-Math.cos(d)*h);}x.stroke();});}
   x.globalAlpha=.1;x.fillStyle=lt;for(let i=0;i<7;i++){const[px,py]=P(),rad=R(16,30);wrapDraw(S,px,py,34,(a,b)=>{x.beginPath();x.ellipse(a,b,rad,rad*.7,R(0,3),0,TAU);x.fill();});}
   x.globalAlpha=.85;const fc=['#ffffff','#ffe27a','#ffb3d1'];for(let i=0;i<7;i++){const[px,py]=P();x.fillStyle=fc[i%3];wrapDraw(S,px,py,4,(a,b)=>{x.beginPath();x.arc(a,b,2.3,0,TAU);x.fill();});}}});}
function blobTile(id){const col=softCol(id),r=mulberry(hashStr('blb'+id));
 return mkTile(720,(x,S)=>{for(let i=0;i<16;i++){const px=r()*S,py=r()*S,rad=110+r()*140,light=r()>.45;wrapDraw(S,px,py,rad,(a,b)=>{const g=x.createRadialGradient(a,b,0,a,b,rad);g.addColorStop(0,light?'rgba(255,255,255,.22)':'rgba(30,50,90,.14)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(a,b,rad,0,TAU);x.fill();});}});}
function softDetail(c,id,path,al){/* path: función que traza la zona; dibuja primero manchas grandes y luego el detalle fino */
 let e=SOFTP[id];if(!e)e=SOFTP[id]={b:c.createPattern(blobTile(id),'repeat'),d:c.createPattern(detailTile(id),'repeat')};
 if(id==='archi'&&e.d.setTransform)e.d.setTransform(new DOMMatrix().translate(M.t*7,M.t*3));
 const ga=c.globalAlpha;c.globalAlpha=ga*(al===undefined?1:al);for(const f of[e.b,e.d]){path();c.fillStyle=f;c.fill();}c.globalAlpha=ga;}
/* ---- terreno ---- */
function biomeExt(b){const W=World.w,H=World.h,E=9000;return{x0:b.x<=1?-E:b.x,y0:b.y<=1?-E:b.y,x1:b.x+b.w>=W-1?W+E:b.x+b.w,y1:b.y+b.h>=H-1?H+E:b.y+b.h,e:{l:b.x<=1,t:b.y<=1,r:b.x+b.w>=W-1,b:b.y+b.h>=H-1}};}
/* ---- límites irregulares: ruido compartido por los dos biomas que tocan el mismo límite ---- */
function h2(a,b){let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296;}
function vn(sd,t,wl){const u=t/wl,i=Math.floor(u),f=u-i,s=f*f*(3-2*f);return h2(sd,i)*(1-s)+h2(sd,i+1)*s;}
function wob(coord,t){const sd=Math.round(coord)|0;return(vn(sd,t,1150)-.5)*2*270+(vn(sd+7,t,430)-.5)*2*95+(vn(sd+13,t,150)-.5)*2*32;}
const BPOLY={};
function biomePoly(b,f){const key=b.g+b.x+'|'+f;if(BPOLY[key])return BPOLY[key];const r=biomeExt(b),st=110,E={t:[],r:[],b:[],l:[]};
 if(r.e.t){E.t.push([r.x0,r.y0],[r.x1,r.y0]);}else{for(let x=r.x0;;x+=st){const xx=Math.min(x,r.x1);E.t.push([xx,r.y0-f+wob(r.y0,xx)]);if(xx>=r.x1)break;}}
 if(r.e.r){E.r.push([r.x1,r.y0],[r.x1,r.y1]);}else{for(let y=r.y0;;y+=st){const yy=Math.min(y,r.y1);E.r.push([r.x1+f+wob(r.x1,yy),yy]);if(yy>=r.y1)break;}}
 if(r.e.b){E.b.push([r.x1,r.y1],[r.x0,r.y1]);}else{for(let x=r.x1;;x-=st){const xx=Math.max(x,r.x0);E.b.push([xx,r.y1+f+wob(r.y1,xx)]);if(xx<=r.x0)break;}}
 if(r.e.l){E.l.push([r.x0,r.y1],[r.x0,r.y0]);}else{for(let y=r.y1;;y-=st){const yy=Math.max(y,r.y0);E.l.push([r.x0-f+wob(r.x0,yy),yy]);if(yy<=r.y0)break;}}
 return BPOLY[key]={E,r,all:E.t.concat(E.r,E.b,E.l)};}
function smoothPath(c,p,close){const n=p.length;c.moveTo((p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2);for(let i=1;i<=n;i++){const a=p[i%n],b=p[(i+1)%n];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}if(close)c.closePath();}
function biomePath(c,b,f){c.beginPath();smoothPath(c,biomePoly(b,f).all,true);}
const HARD={metro:1,fabrica:1};
function inView2(r,v,m){return!(r.x0>v.x1+m||r.x1<v.x0-m||r.y0>v.y1+m||r.y1<v.y0-m);}
function softBiome(c,b,v,water){const P0=biomePoly(b,0),r=P0.r;if(!inView2(r,v,500))return;
 const col=softCol(b.g),g=c.createLinearGradient(b.x,b.y,b.x+b.w*.4,b.y+b.h);g.addColorStop(0,shade(col,.08));g.addColorStop(1,shade(col,-.07));
 if(water){biomePath(c,b,0);c.fillStyle=g;c.fill();softDetail(c,b.g,()=>biomePath(c,b,0),1);
  /* costa: aguas poco profundas hacia dentro y línea de espuma solo donde el agua toca tierra */
  const pul=.85+Math.sin(M.t*1.4)*.08,E=P0.E,coast=[];for(const k of['t','r','b','l'])if(!r.e[k])coast.push(E[k]);
  c.save();biomePath(c,b,0);c.clip();c.lineJoin='round';for(const[lw,al]of[[380,.08],[250,.09],[140,.1],[60,.13]]){c.strokeStyle='rgba(255,255,255,'+al+')';c.lineWidth=lw;for(const e of coast){c.beginPath();smoothPath(c,e.length>2?e:[e[0],e[0],e[1],e[1]],false);c.stroke();}}c.restore();
  c.lineJoin='round';c.lineCap='round';for(const[lw,al]of[[28,.26*pul],[9,.95*pul]]){c.strokeStyle='rgba(255,255,255,'+al+')';c.lineWidth=lw;for(const e of coast){c.beginPath();c.moveTo(e[0][0],e[0][1]);for(let i=1;i<e.length-1;i++){const a=e[i],q=e[i+1];c.quadraticCurveTo(a[0],a[1],(a[0]+q[0])/2,(a[1]+q[1])/2);}c.lineTo(e[e.length-1][0],e[e.length-1][1]);c.stroke();}}
  return;}
 if(HARD[b.g]){/* suelo duro (cemento, losas): cambio tajante pero irregular */
  biomePath(c,b,0);c.fillStyle=g;c.fill();softDetail(c,b.g,()=>biomePath(c,b,0),1);
  biomePath(c,b,0);c.lineJoin='round';c.strokeStyle='rgba(60,66,80,.32)';c.lineWidth=7;c.stroke();c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=2;c.stroke();return;}
 /* tierra con tierra (césped, arena...): degradado suave a ambos lados del límite irregular */
 const N=11,span=380;c.fillStyle=g;c.globalAlpha=.3;
 for(let i=0;i<N;i++){biomePath(c,b,span/2-i*span/(N-1));c.fill();}
 c.globalAlpha=1;biomePath(c,b,-span/2);c.fill();
 for(const f of[-30,-120,-220]){softDetail(c,b.g,()=>biomePath(c,b,f),.5);}}
/* ---- caminos v2: red en árbol que une pueblos, con plazas, puentes sobre los ríos y casas a pie de camino ---- */
const ROUTES=[
 {p:[[900,8700],[9300,8800],[13400,9400],[17700,10200],[21000,10000],[25900,10400]],fa:1,fb:1},
 {p:[[900,12400],[8200,12300],[9500,11510],[13000,11510],[17400,11510],[21000,11900]],fa:1,fb:1},
 {p:[[14800,1200],[14500,6900],[14300,9000]],fa:0,fb:0,o:1},
 {p:[[15200,3500],[20400,3600],[23000,3000],[26200,3600]],fa:0,fb:1,j:1},
 {p:[[23000,3000],[23000,6900],[22800,10000]],fa:0,fb:0,j:1}];
const ROADC={dirt:{w:112,sh:'#a9de8c',bd:'#e3d3a2',bo:'#f1e5bd',hi:'#f8f0d3'},asph:{w:112,sh:'#a9de8c',bd:'#aab3c2',bo:'#cdd3dc'}};
let ROADNET=null;
function planRoads(){
 ROADNET={key:World.solids,list:[],sites:[],plazas:[]};
 if(!World.roadsOn)return;
 try{planRoads2(ROADNET);}catch(e){console.warn('caminos',e);}}
function planRoads2(RN){
 const CS=80,GW=Math.ceil(World.w/CS),GH=Math.ceil(World.h/CS),N=GW*GH,blk=new Uint8Array(N),riv=new Uint8Array(N),brg=new Uint8Array(N),MG=100,net=RN.list;
 const box=(x0,y0,x1,y1,fn)=>{for(let y=Math.max(0,Math.floor(y0/CS));y<=Math.min(GH-1,Math.floor(y1/CS));y++)for(let x=Math.max(0,Math.floor(x0/CS));x<=Math.min(GW-1,Math.floor(x1/CS));x++)fn(x,y,x*CS+CS/2,y*CS+CS/2);};
 const segBlock=(a,b,rr,arr)=>box(Math.min(a[0],b[0])-rr,Math.min(a[1],b[1])-rr,Math.max(a[0],b[0])+rr,Math.max(a[1],b[1])+rr,(x,y,px,py)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy||1),0,1);if(Math.hypot(px-a[0]-dx*t,py-a[1]-dy*t)<rr)arr[y*GW+x]=1;});
 /* 1) lo que no se puede pisar: sólidos, casas, lagos, ríos (salvo en los pasos de puente) y los bordes */
 for(const s of World.solids){let b=s.bb,x0=b.x0,y0=b.y0,x1=b.x1,y1=b.y1;
  if(s.kind==='rotor'){const L=s.L+MG;box(s.cx-L,s.cy-L,s.cx+L,s.cy+L,(x,y,px,py)=>{if(Math.hypot(px-s.cx,py-s.cy)<L)blk[y*GW+x]=1;});continue;}
  if(s.kind==='slider'){if(x1-x0>y1-y0){x0-=320;x1+=320;}else{y0-=160;y1+=160;}box(x0-MG,y0-MG,x1+MG,y1+MG,(x,y)=>{blk[y*GW+x]=1;});continue;}
  box(x0-MG-CS,y0-MG-CS,x1+MG+CS,y1+MG+CS,(x,y,px,py)=>{if(blk[y*GW+x])return;const q=distPoly(px,py,s.poly);if(q[0]||q[1]<MG+CS*.3)blk[y*GW+x]=1;});}
 for(const d of World.decor)if(d.t==='c'&&(d.sp==='house'||d.sp==='barn'||d.sp==='hay')){const rr=d.r+(d.sp==='hay'?30:55);box(d.x-rr-CS,d.y-rr-CS,d.x+rr+CS,d.y+rr+CS,(x,y,px,py)=>{if(Math.hypot(px-d.x,py-d.y)<rr+CS*.3)blk[y*GW+x]=1;});}
 for(const d of World.decor){if(d.g!=='archi'&&!(d.t==='gl'&&d.g==='mesa'))continue;
  if(d.t==='g'){box(d.bb.x0-MG-CS,d.bb.y0-MG-CS,d.bb.x1+MG+CS,d.bb.y1+MG+CS,(x,y,px,py)=>{const q=distPoly(px,py,d.p);if(q[0]||q[1]<MG+CS*.6)blk[y*GW+x]=1;});}
  else if(d.t==='gl'){const rr=d.w/2+MG+70,P=d.pts;let acc=900;
   for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;segBlock(a,b,rr,riv);
    while(acc<L){const t=acc/L;RN.sites.push({x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,nx:-(b[1]-a[1])/L,ny:(b[0]-a[0])/L,hl:d.w/2+170,w:d.w,st:d.g==='mesa'?1:0});acc+=2100;}acc-=L;}}}
 for(const s of RN.sites){const R2=s.hl+CS;box(s.x-R2,s.y-R2,s.x+R2,s.y+R2,(x,y,px,py)=>{const dx=px-s.x,dy=py-s.y;if(Math.abs(dx*s.nx+dy*s.ny)<=R2&&Math.abs(dx*s.ny-dy*s.nx)<125){riv[y*GW+x]=0;brg[y*GW+x]=1;}});}
 for(let i=0;i<N;i++)if(riv[i])blk[i]=1;
 for(const b of World.biomes||[])if(b.g==='archi')box(b.x-100,b.y-100,b.x+b.w+160,b.y+b.h+160,(x,y)=>{blk[y*GW+x]=1;});
 box(0,0,World.w,250,(x,y)=>{blk[y*GW+x]=1;});box(0,World.h-250,World.w,World.h,(x,y)=>{blk[y*GW+x]=1;});box(0,0,250,World.h,(x,y)=>{blk[y*GW+x]=1;});box(World.w-250,0,World.w,World.h,(x,y)=>{blk[y*GW+x]=1;});
 /* 2) penalización junto a obstáculos y zona transitable principal */
 const pen=new Uint8Array(N);for(let y=2;y<GH-2;y++)for(let x=2;x<GW-2;x++){if(blk[y*GW+x])continue;let n=0;for(let j=-2;j<=2&&!n;j++)for(let i=-2;i<=2;i++)if(blk[(y+j)*GW+x+i]){n=Math.max(Math.abs(i),Math.abs(j))===1?2:1;break;}pen[y*GW+x]=n;}
 const comp=new Int32Array(N).fill(-1);let best=-1,bn=0;
 for(let i0=0;i0<N;i0++){if(blk[i0]||comp[i0]>=0)continue;const st=[i0];comp[i0]=i0;let n=0;while(st.length){const i=st.pop();n++;const x=i%GW,y=(i/GW)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const m=ny*GW+nx;if(!blk[m]&&comp[m]<0){comp[m]=i0;st.push(m);}}}if(n>bn){bn=n;best=i0;}}
 const okc=i=>!blk[i]&&comp[i]===best;
 const snap=(x,y)=>{const cx=clamp(Math.floor(x/CS),0,GW-1),cy=clamp(Math.floor(y/CS),0,GH-1);if(okc(cy*GW+cx))return cy*GW+cx;for(let r=1;r<70;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const a=cx+i,b=cy+j;if(a>=0&&b>=0&&a<GW&&b<GH&&okc(b*GW+a))return b*GW+a;}return -1;};
 const onNet=new Uint8Array(N),netCells=[],mark=i=>{if(!onNet[i]){onNet[i]=1;netCells.push(i);}};
 /* búsqueda de caminos: con meta concreta (A*) o hasta tocar cualquier celda de la red (Dijkstra) */
 function route(s,goal,gx,gy,disc){const G=new Float32Array(N).fill(1e9),F=new Int32Array(N).fill(-1),cl=new Uint8Array(N),H=[];
  const hf=gx===undefined?()=>0:i=>{const dx=Math.abs(i%GW-gx),dy=Math.abs(((i/GW)|0)-gy);return Math.max(dx,dy)+.414*Math.min(dx,dy);};
  const push=(f,i)=>{H.push([f,i]);let k=H.length-1;while(k>0){const p=(k-1)>>1;if(H[p][0]<=H[k][0])break;[H[p],H[k]]=[H[k],H[p]];k=p;}};
  const pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let k=0;for(;;){let a=2*k+1,b=a+1,m=k;if(a<H.length&&H[a][0]<H[m][0])m=a;if(b<H.length&&H[b][0]<H[m][0])m=b;if(m===k)break;[H[m],H[k]]=[H[k],H[m]];k=m;}}return t;};
  G[s]=0;push(hf(s),s);
  while(H.length){const[,i]=pop();if(cl[i])continue;cl[i]=1;
   if(i!==s&&goal(i)){const o=[];for(let k=i;k!==-1;k=F[k])o.push(k);return o.reverse();}
   const x=i%GW,y=(i/GW)|0;
   for(let j=-1;j<=1;j++)for(let a=-1;a<=1;a++){if(!a&&!j)continue;const nx=x+a,ny=y+j;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const n=ny*GW+nx;if(blk[n]||cl[n])continue;
    if(a&&j&&(blk[y*GW+nx]||blk[ny*GW+x]))continue;const c=G[i]+(a&&j?1.414:1)*(1+pen[n]*1.6)*(disc&&onNet[n]?.3:1);if(c<G[n]){G[n]=c;F[n]=i;push(c+hf(n),n);}}}
  return null;}
 const los=(a,b)=>{const ax=a%GW,ay=(a/GW)|0,bx=b%GW,by=(b/GW)|0,n=Math.max(Math.abs(bx-ax),Math.abs(by-ay))*2;for(let k=0;k<=n;k++){const t=n?k/n:0,x=Math.round(ax+(bx-ax)*t),y=Math.round(ay+(by-ay)*t);if(blk[y*GW+x]||pen[y*GW+x]>1)return false;}return true;};
 const cellXY=i=>[(i%GW+.5)*CS,(((i/GW)|0)+.5)*CS],nearSite=(x,y,r)=>RN.sites.some(s=>Math.hypot(s.x-x,s.y-y)<r);
 /* geometría de puentes y empalmes: los extremos se pegan a la calzada real y los cruces de río son rectos y perpendiculares */
 const sAc=(s,x,y)=>(x-s.x)*s.nx+(y-s.y)*s.ny,sAl=(s,x,y)=>(x-s.x)*s.ny-(y-s.y)*s.nx;
 const inBridge=(x,y,m)=>RN.sites.some(s=>Math.abs(sAc(s,x,y))<=s.hl+m&&Math.abs(sAl(s,x,y))<110+m);
 function nearNet(x,y,maxd){let bd=maxd,bp=null;for(const R of net){if(!R.pts||!R.bb)continue;const b=R.bb;if(x<b.x0-maxd||x>b.x1+maxd||y<b.y0-maxd||y>b.y1+maxd)continue;const P=R.pts;
   for(let i=0;i<P.length-1;i++){const a=P[i],c=P[i+1],dx=c[0]-a[0],dy=c[1]-a[1],L2=dx*dx+dy*dy||1,t=clamp(((x-a[0])*dx+(y-a[1])*dy)/L2,0,1),qx=a[0]+dx*t,qy=a[1]+dy*t,d=Math.hypot(qx-x,qy-y);if(d<bd&&!inBridge(qx,qy,60)){bd=d;bp=[qx,qy];}}}return bp;}
 function fixBridges(P){for(const s of RN.sites){const inZ=q=>Math.abs(sAc(s,q[0],q[1]))<=s.hl+260&&Math.abs(sAl(s,q[0],q[1]))<=450;
   let ci=-1;for(let i=0;i<P.length-1;i++){const a=sAc(s,P[i][0],P[i][1]),b=sAc(s,P[i+1][0],P[i+1][1]);if(a*b>0||a===b)continue;const t=a/(a-b),qx=P[i][0]+(P[i+1][0]-P[i][0])*t,qy=P[i][1]+(P[i+1][1]-P[i][1])*t;if(Math.abs(sAl(s,qx,qy))<300){ci=i;break;}}
   if(ci<0)continue;
   let lo=ci+1,hi=ci;while(lo-1>=1&&inZ(P[lo-1]))lo--;while(hi+1<=P.length-2&&inZ(P[hi+1]))hi++;
   const sg=sAc(s,P[ci][0],P[ci][1])<0?-1:1,hl=s.hl,ins=[hl+110,hl*.5,0,-hl*.5,-(hl+110)].map(o=>[s.x+s.nx*o*sg,s.y+s.ny*o*sg]);
   P.splice(lo,Math.max(0,hi-lo+1),...ins);}}
 const joinPt=q=>{const pz=RN.plazas.find(p=>Math.hypot(p.x-q[0],p.y-q[1])<p.r+CS*1.2);return pz?[pz.x,pz.y]:nearNet(q[0],q[1],520);};
 function addRoad(cells,fa,fb,t0,snapA,snapB){
  if(cells.length<2)return null;
  const pl=[cells[0]];let i=0;while(i<cells.length-1){let j=cells.length-1;while(j>i+1&&!los(cells[i],cells[j]))j--;pl.push(cells[j]);i=j;}
  /* tramos largos: se subdividen y se ondulan un poco para que no parezcan trazados con regla */
  const P=[];let u=0;for(let k=0;k<pl.length;k++){const[x,y]=cellXY(pl[k]);if(k){const q=P[P.length-1],L=Math.hypot(x-q[0],y-q[1])||1,m=Math.ceil(L/450);for(let w=1;w<m;w++){const f=w/m,px=q[0]+(x-q[0])*f,py=q[1]+(y-q[1])*f,o=nearSite(px,py,700)?0:(h2(u++*7+k,P.length+3)-.5)*70;P.push([px-(y-q[1])/L*o,py+(x-q[0])/L*o]);}}P.push([x,y]);}
  if(t0&&Math.hypot(P[0][0]-t0.x,P[0][1]-t0.y)<130)P[0]=[t0.x,t0.y];
  if(snapA){const q=joinPt(P[0]);if(q)P[0]=q;}if(snapB){const q=joinPt(P[P.length-1]);if(q)P[P.length-1]=q;}
  fixBridges(P);
  const R=roadBuild({p:P,fa,fb});net.push(R);return R;}
 const plaza=t=>{RN.plazas.push({x:t.x,y:t.y,r:t.pl*.75});box(t.x-t.pl,t.y-t.pl,t.x+t.pl,t.y+t.pl,(x,y,px,py)=>{if(Math.hypot(px-t.x,py-t.y)<t.pl*.75&&!blk[y*GW+x])mark(y*GW+x);});};
 /* 3) red: troncales prefijadas (Gran Continente) y luego cada pueblo se une a lo que ya existe */
 const id=World.def&&World.def.id;
 /* una troncal sólo dibuja los tramos que aún no existen: así dos carreteras nunca se superponen */
 function addPath(cells,fa,fb){const n=cells.length;let k=0;while(k<n){if(onNet[cells[k]]){k++;continue;}let m=k;while(m<n&&!onNet[cells[m]])m++;const a=Math.max(0,k-1),b=Math.min(n-1,m);if(b-a>=2)addRoad(cells.slice(a,b+1),a===0?fa:0,b===n-1?fb:0,null,a>0,b<n-1);k=m;}cells.forEach(mark);}
 if(id==='mundo')for(const R0 of ROUTES){const R=Object.assign({},R0,{p:R0.p.map(q=>q.slice())});let cells=[],ok=true;
  if(R.j&&netCells.length){let bd=1e18,bc=-1;for(const c0 of netCells){if(brg[c0])continue;const[x,y]=cellXY(c0),d=(x-R.p[0][0])*(x-R.p[0][0])+(y-R.p[0][1])*(y-R.p[0][1]);if(d<bd){bd=d;bc=c0;}}R.p[0]=cellXY(bc);}
  for(let i=0;i<R.p.length-1;i++){const s=snap(R.p[i][0],R.p[i][1]),g=snap(R.p[i+1][0],R.p[i+1][1]);if(s<0||g<0){ok=false;break;}const pth=route(s,k=>k===g,g%GW,(g/GW)|0,true);if(!pth){ok=false;break;}if(cells.length)pth.shift();cells=cells.concat(pth);}
  if(!ok||cells.length<4)continue;if(R.o){const[ox,oy]=cellXY(cells[0]);plaza({x:ox,y:oy,pl:200});}addPath(cells,R.fa,R.fb);}
 const nodes=(World.towns||[]).map(t=>Object.assign({},t));
 if(id==='valle'){const K=World.geoK||1;nodes.push({x:6540*K,y:3800*K,pl:0,gate:1});}
 if(!netCells.length){let bi=-1,bd=1e18;nodes.forEach((n,k)=>{if(n.gate)return;const d=Math.hypot(n.x-World.w/2,n.y-World.h/2);if(d<bd){bd=d;bi=k;}});if(bi>=0){const n=nodes.splice(bi,1)[0];plaza(n);}}
 while(nodes.length&&netCells.length){let bi=-1,bd=1e18;
  nodes.forEach((n,k)=>{let md=1e18;for(const c of netCells){const[x,y]=cellXY(c),d=(x-n.x)*(x-n.x)+(y-n.y)*(y-n.y);if(d<md)md=d;}if(md<bd){bd=md;bi=k;}});
  const n=nodes.splice(bi,1)[0],s=snap(n.x,n.y);if(s<0)continue;
  if(!onNet[s]){const path=route(s,i=>onNet[i]&&!brg[i]);if(!path)continue;addRoad(path,0,0,n.gate?null:n,false,true);path.forEach(mark);}
  if(!n.gate)plaza(n);}
 /* 4) asfalto: dentro de suelo duro y con transición gradual antes de entrar */
 for(const R of net){const hard=R.pts.map(q=>(World.biomes||[]).some(b=>HARD[b.g]&&q[0]>=b.x&&q[0]<=b.x+b.w&&q[1]>=b.y&&q[1]<=b.y+b.h)),E=800,iv=[];
  let k=0;while(k<hard.length){if(!hard[k]){k++;continue;}let m=k;while(m<hard.length&&hard[m])m++;iv.push([R.cum[k]-E,R.cum[m-1]+E]);k=m;}
  const mg=[];for(const v of iv){const l=mg[mg.length-1];if(l&&v[0]<=l[1])l[1]=Math.max(l[1],v[1]);else mg.push(v.slice());}
  R.asph=mg.map(([a,b])=>{let i0=0,i1=R.pts.length-1;while(i0<i1&&R.cum[i0]<a)i0++;while(i1>i0&&R.cum[i1]>b)i1--;return[i0,i1];}).filter(r=>r[1]-r[0]>2);}
 /* 5) puentes: se dibujan sólo donde algún camino cruza de verdad */
 for(const R of net){R.brk=new Uint8Array(R.pts.length);R.pts.forEach((q,k)=>{for(const s of RN.sites){const dx=q[0]-s.x,dy=q[1]-s.y;if(Math.abs(dx*s.nx+dy*s.ny)<=s.hl&&Math.abs(dx*s.ny-dy*s.nx)<90){R.brk[k]=1;s.used=1;}}});}
 /* 6) cuadrícula de búsqueda y limpieza de árboles, piedras y animales sobre la calzada o la plaza */
 const K=160,bk=new Map();for(const R of net)for(const q of R.pts){const key=((q[0]/K)|0)+','+((q[1]/K)|0);let a=bk.get(key);if(!a)bk.set(key,a=[]);a.push(q);}
 const nearRoad=(x,y,m)=>{const c=Math.ceil(m/K),cx=(x/K)|0,cy=(y/K)|0;for(let j=-c;j<=c;j++)for(let i=-c;i<=c;i++){const a=bk.get((cx+i)+','+(cy+j));if(a)for(const q of a)if(Math.hypot(q[0]-x,q[1]-y)<m)return true;}return false;};
 for(const d of World.decor){if(d.t!=='c')continue;d.hide=false;if(d.sp==='house'||d.sp==='barn')continue;
  if(RN.plazas.some(p=>Math.hypot(p.x-d.x,p.y-d.y)<p.r+d.r)||nearRoad(d.x,d.y,78+d.r*1.5))d.hide=true;}
 /* 7) casas a pie de camino cerca de cada pueblo, orientadas según la calzada */
 const hl=[];for(const d of World.decor)if(d.t==='c'&&(d.sp==='house'||d.sp==='barn'))hl.push([d.x,d.y,d.r]);
 const cellFree=(x,y)=>{const cx=Math.floor(x/CS),cy=Math.floor(y/CS);return cx>=0&&cy>=0&&cx<GW&&cy<GH&&!blk[cy*GW+cx];};
 for(const t of World.towns||[]){let n=0;
  for(const R of net){let last=-1e9;
   for(let k=1;k<R.pts.length-1&&n<7;k++){const q=R.pts[k],d=Math.hypot(q[0]-t.x,q[1]-t.y);
    if(d<t.pl+330||d>t.r+800||R.cum[k]-last<430||R.brk[k])continue;
    last=R.cum[k];if(h2(k*3+n,R.len|0)<.3)continue;
    const a=R.pts[k-1],b=R.pts[k+1],ang=Math.atan2(b[1]-a[1],b[0]-a[0]),sd=h2(k,R.len|0)<.5?-1:1,sz=rnd(225,265),rr=sz*.55,m=sz*.5,off=ROADC.dirt.w/2+m+45+h2(k,9)*30,x=q[0]-Math.sin(ang)*off*sd,y=q[1]+Math.cos(ang)*off*sd;
    if(x<450||y<450||x>World.w-450||y>World.h-450)continue;
    if(![[0,0],[m,m],[-m,m],[m,-m],[-m,-m]].every(o=>cellFree(x+o[0],y+o[1])))continue;
    if(nearRoad(x,y,ROADC.dirt.w/2+rr+10)||nearSite(x,y,700)||RN.plazas.some(p=>Math.hypot(p.x-x,p.y-y)<p.r+rr+30))continue;
    if(!hl.every(h=>Math.hypot(h[0]-x,h[1]-y)>h[2]+rr+40))continue;
    const o={t:'c',x,y,r:rr,sp:'house',sz,v:rint(0,4),rot:ang+rnd(-.05,.05),seed:rnd(0,100)};o.bb={x0:x-rr,y0:y-rr,x1:x+rr,y1:y+rr};World.decor.push(o);hl.push([x,y,rr]);n++;}}}
}
function roadBuild(R){if(R.pts)return R;const P=R.p,out=[];
 for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)],n=Math.max(2,Math.round(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/55));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
 out.push(P[P.length-1]);R.pts=out;R.cum=[0];for(let i=1;i<out.length;i++)R.cum.push(R.cum[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));R.len=R.cum[R.cum.length-1];
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of out){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}R.bb={x0:x0-200,y0:y0-200,x1:x1+200,y1:y1+200};return R;}
function subPts(R,s0,s1){const o=[];for(let i=0;i<R.pts.length;i++){const s=R.cum[i];if(s<s0||s>s1)continue;o.push(R.pts[i]);}return o;}
function strokePts(c,p){if(p.length<2)return;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length-1;i++)c.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);c.lineTo(p[p.length-1][0],p[p.length-1][1]);c.stroke();}
/* traza un tramo con difuminado en los extremos: capas de trazo cada vez más cortas y estrechas */
function fadePaths(R,i0,i1,fa,fb,F){const key=i0+'_'+i1+'_'+(fa?1:0)+(fb?1:0)+'_'+F,K=R._fc||(R._fc={});if(K[key])return K[key];
 const Fe=Math.min(F,(R.cum[i1]-R.cum[i0])/2.2),N=72,s0=R.cum[i0],s1=R.cum[i1],ia=fa?s0+Fe:s0,ib=fb?s1-Fe:s1;
 const mk=q=>{if(q.length<2)return null;const o=new Path2D();o.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length-1;i++)o.quadraticCurveTo(q[i][0],q[i][1],(q[i][0]+q[i+1][0])/2,(q[i][1]+q[i+1][1])/2);o.lineTo(q[q.length-1][0],q[q.length-1][1]);return o;};
 const r={mid:ib>ia?mk(subPts(R,ia,ib)):null,ends:[]};
 for(let k=0;k<N;k++){const u=Fe*(k+.5)/N;if(fa)r.ends.push(mk(subPts(R,s0+u,ia+2)));if(fb)r.ends.push(mk(subPts(R,ib-2,s1-u)));}
 return K[key]=r;}
function fadeStroke(c,R,i0,i1,w,col,al,fa,fb,F){const P=fadePaths(R,i0,i1,fa,fb,F),a=1-Math.pow(1-al,1/72);c.lineJoin='round';c.strokeStyle=col;c.lineCap='butt';c.lineWidth=w;
 c.globalAlpha=al;if(P.mid)c.stroke(P.mid);c.globalAlpha=a;for(const q of P.ends)if(q)c.stroke(q);c.globalAlpha=1;}
/* línea paralela desplazada, solo por los puntos visibles */
function offLine(c,R,i,j,s0,s1,off,v){let st=false;c.beginPath();for(let k=i;k<=j;k++){const s=R.cum[k],q=R.pts[k];if(s<s0||s>s1||q[0]<v.x0-120||q[0]>v.x1+120||q[1]<v.y0-120||q[1]>v.y1+120){st=false;continue;}
  const a=R.pts[Math.max(0,k-1)],b=R.pts[Math.min(R.pts.length-1,k+1)],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,x=q[0]-dy/L*off,y=q[1]+dx/L*off;if(!st){c.moveTo(x,y);st=true;}else c.lineTo(x,y);}c.stroke();}
function drawRoads(c,v){if(!World.roadsOn)return;if(!ROADNET||ROADNET.key!==World.solids)planRoads();const RN=ROADNET;if(!RN.list.length&&!RN.plazas.length)return;c.save();c.lineJoin='round';
 const segs=[];
 for(const R of RN.list){if(!inView2(R.bb,v,0))continue;const last=R.pts.length-1,rg=[];let pv=0;
  for(const[i,j]of R.asph||[]){if(i>pv+1)rg.push([pv,i]);pv=j;}if(pv<last-1)rg.push([pv,last]);
  for(const[i,j]of rg)segs.push({R,i,j,T:ROADC.dirt,F:1100,fa:R.fa&&i===0,fb:R.fb&&j===last,as:0});
  for(const[i,j]of R.asph||[])segs.push({R,i,j,T:ROADC.asph,F:900,fa:R.fa&&i===0,fb:R.fb&&j===last,as:1});}
 const pls=RN.plazas.filter(p=>inView2({x0:p.x-p.r,y0:p.y-p.r,x1:p.x+p.r,y1:p.y+p.r},v,60));
 /* cinta plana y suave: halo verde claro, borde, relleno y una franja central más clara (los cruces y plazas se funden) */
 for(const as of[0,1]){const ss=segs.filter(s=>s.as===as),L=as?[[30,'sh',.4],[10,'bd',1],[0,'bo',1]]:[[30,'sh',.4],[10,'bd',1],[0,'bo',1],[-46,'hi',.7]];
  for(const[ex,key,al]of L){for(const s of ss)fadeStroke(c,s.R,s.i,s.j,s.T.w+ex,s.T[key],al,s.fa,s.fb,s.F);
   if(!as){c.globalAlpha=al;c.fillStyle=ROADC.dirt[key];for(const p of pls){c.beginPath();c.arc(p.x,p.y,Math.max(8,p.r+ex*.6),0,TAU);c.fill();}c.globalAlpha=1;}}}
 /* asfalto: solo una línea central discontinua blanca */
 for(const s of segs){if(!s.as)continue;const R=s.R,F=s.F,s0=R.cum[s.i]+(s.fa?F*.85:0),s1=R.cum[s.j]-(s.fb?F*.85:0);if(s1<=s0)continue;
  c.lineCap='round';c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=5;c.setLineDash([30,36]);offLine(c,R,s.i,s.j,s0,s1,0,v);c.setLineDash([]);}
 /* puentes: tablones lisos con barandillas redondeadas */
 for(const s of RN.sites){if(!s.used||!inView2({x0:s.x-s.hl,y0:s.y-s.hl,x1:s.x+s.hl,y1:s.y+s.hl},v,60))continue;
  const hl=s.hl,hw=ROADC.dirt.w/2+22,st=s.st;c.save();c.translate(s.x,s.y);c.rotate(Math.atan2(s.ny,s.nx));
  c.fillStyle='rgba(30,60,80,.14)';c.beginPath();c.roundRect?c.roundRect(-hl+6,-hw+12,hl*2,hw*2,14):c.rect(-hl+6,-hw+12,hl*2,hw*2);c.fill();
  c.fillStyle=st?'#e4dccb':'#e8cfa0';c.beginPath();c.roundRect?c.roundRect(-hl,-hw,hl*2,hw*2,14):c.rect(-hl,-hw,hl*2,hw*2);c.fill();
  c.strokeStyle='rgba(160,125,80,.28)';c.lineWidth=3;c.beginPath();for(let x=-hl+20;x<hl;x+=26){c.moveTo(x,-hw+10);c.lineTo(x,hw-10);}c.stroke();
  c.strokeStyle=st?'#bfb5a0':'#cfa970';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(-hl,-hw+2);c.lineTo(hl,-hw+2);c.moveTo(-hl,hw-2);c.lineTo(hl,hw-2);c.stroke();
  c.restore();}
 c.restore();}
function drawRavine(c,d,v){const P=d.pts,w=d.w;c.save();c.lineJoin='round';c.lineCap='round';
 const path=()=>{c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));};
 const off=(o,col,lw,dash)=>{c.strokeStyle=col;c.lineWidth=lw;c.setLineDash(dash||[]);c.beginPath();for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,x=P[i][0]-dy/L*o,y=P[i][1]+dx/L*o;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.setLineDash([]);};
 c.strokeStyle='rgba(176,86,52,.32)';c.lineWidth=w+96;path();c.stroke();
 c.strokeStyle='#a24c2d';c.lineWidth=w+28;path();c.stroke();
 c.strokeStyle='#c4694a';c.lineWidth=w+8;path();c.stroke();
 c.strokeStyle='#d6804f';c.lineWidth=w-18;path();c.stroke();
 c.strokeStyle='#e4a273';c.lineWidth=w*.46;path();c.stroke();
 off(-(w/2-16),'rgba(90,35,18,.34)',26);off(w/2-14,'rgba(255,225,180,.24)',16);off(0,'rgba(255,238,205,.32)',5,[26,70]);
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,n=Math.floor(L/70),ux=dx/L,uy=dy/L,ang=Math.atan2(dy,dx);
  for(let k=0;k<n;k++){const x=a[0]+ux*(k+.5)*L/n,y=a[1]+uy*(k+.5)*L/n;if(x<v.x0-150||x>v.x1+150||y<v.y0-150||y>v.y1+150)continue;
   const h=h2(i*131+k,1),sd=h2(i*17+k,2)<.5?-1:1;
   if(h<.3){const o=sd*(w/2+2+h2(i+k,3)*12),r=7+h2(k,4)*13;c.fillStyle='rgba(98,40,22,.6)';c.beginPath();c.ellipse(x-uy*o,y+ux*o,r*1.3,r,ang+h2(k,5),0,TAU);c.fill();c.fillStyle='rgba(235,170,130,.35)';c.beginPath();c.ellipse(x-uy*o-2,y+ux*o-3,r*.7,r*.45,ang,0,TAU);c.fill();}
   else if(h<.62){const o=(h2(i+k,6)-.5)*w*.62,r=3+h2(k,7)*6;c.fillStyle=h<.46?'rgba(255,232,196,.42)':'rgba(120,56,32,.34)';c.beginPath();c.ellipse(x-uy*o,y+ux*o,r*1.4,r,ang+h2(k,8),0,TAU);c.fill();}
   else if(h>.9){const o=(h2(i+k,9)-.5)*w*.5;c.strokeStyle='rgba(110,48,28,.4)';c.lineWidth=2;c.beginPath();c.moveTo(x-uy*o,y+ux*o);c.lineTo(x-uy*o+ux*16+uy*5,y+ux*o+uy*16-ux*5);c.lineTo(x-uy*o+ux*26,y+ux*o+uy*26+6);c.stroke();}}}
 c.restore();}
function drawGroundSoft(c,def,v){
 const base=softCol('valle'),g0=c.createLinearGradient(0,0,0,World.h);g0.addColorStop(0,shade(base,.1));g0.addColorStop(1,shade(base,-.08));c.fillStyle=g0;c.fillRect(v.x0,v.y0,v.x1-v.x0,v.y1-v.y0);
 softDetail(c,'valle',()=>{c.beginPath();c.rect(v.x0,v.y0,v.x1-v.x0,v.y1-v.y0);});
 c.lineJoin='round';c.lineCap='round';
 const bl=World.biomes||[];for(const b of bl)if(!HARD[b.g]&&b.g!=='archi')softBiome(c,b,v,false);for(const b of bl)if(HARD[b.g])softBiome(c,b,v,false);for(const b of bl)if(b.g==='archi')softBiome(c,b,v,true);
 const HOUSEQ=[];
 for(let pass=0;pass<2;pass++){if(pass===1)drawRoads(c,v);
 for(const d of World.decor){if(!inView(d.bb,v)||(d.t==='c')!==(pass===1))continue;
  if(d.t==='g'){const col=softCol(d.g);if(d.wet===undefined){const ar=(World.biomes||[]).find(q=>q.g==='archi'),cx0=(d.bb.x0+d.bb.x1)/2,cy0=(d.bb.y0+d.bb.y1)/2;d.wet=!!ar&&cx0>ar.x&&cx0<ar.x+ar.w&&cy0>ar.y&&cy0<ar.y+ar.h;}
   if(d.wet){const pul=.85+Math.sin(M.t*1.4+d.bb.x0*.01)*.08;poly(c,d.p);c.lineJoin='round';c.strokeStyle='rgba(255,255,255,'+.3*pul+')';c.lineWidth=84;c.stroke();c.strokeStyle='rgba(255,255,255,'+.95*pul+')';c.lineWidth=16;c.stroke();}
   if(d.g==='archi'&&!d.wet){lakeSoft(c,d);continue;}
   poly(c,d.p);c.fillStyle=col;c.fill();c.strokeStyle=col;c.lineWidth=18;c.stroke();softDetail(c,d.g,()=>poly(c,d.p));continue;}
  if(d.t==='gl'){if(d.g==='mesa'){drawRavine(c,d,v);continue;}if(d.g==='archi'){waterLine(c,d);continue;}c.strokeStyle=softCol(d.g);c.lineWidth=d.w;c.beginPath();d.pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();continue;}
  if(d.t==='c'){if(d.hide)continue;const k=d.sp,sw=Math.sin(M.t*.9+d.x*.013)*1.4;
   if(k==='tree'||k==='palm'){const pine=d.c==='#2f6a35'||d.c==='#2a5e30'||d.c==='#25704a',im=k==='tree'?sTreeC(d.c,pine?'pine':'leaf',((d.x*3+d.y)|0)%3):sPalm(),sz=d.r*(k==='tree'?3.2:3.6),a=((d.x*7.31+d.y*3.17)%6.28);c.fillStyle='rgba(30,50,90,.2)';c.beginPath();c.ellipse(d.x+sz*.1,d.y+sz*.14,sz*.3,sz*.26,0,0,TAU);c.fill();
    const lo=lift(d.x,d.y,.05);c.save();c.translate(d.x+lo[0]+sw,d.y+lo[1]);c.rotate(k==='palm'?a+Math.sin(M.t*.7+d.y*.01)*.05:a*.3);c.drawImage(im,-sz/2,-sz/2,sz,sz);c.restore();}
   else if(k==='house'||k==='barn'){HOUSEQ.push(d);}
   else if(k==='cow'||k==='sheep'||k==='deer'||k==='hay'){drawDetail(c,d);}
   else if(k==='cactus'){const s=d.r,lo=lift(d.x,d.y,.03);c.save();c.translate(d.x+lo[0],d.y+lo[1]);
    c.fillStyle='rgba(60,30,20,.22)';c.beginPath();c.ellipse(s*.3,s*.4,s*.8,s*.55,0,0,TAU);c.fill();c.rotate(d.rot);
    c.strokeStyle='#3f7a3c';c.lineCap='round';c.lineWidth=s*.3;c.beginPath();c.moveTo(-s*.62,-s*.1);c.lineTo(-s*.62,-s*.55);c.moveTo(-s*.62,-s*.1);c.lineTo(0,-s*.1);c.moveTo(s*.6,s*.15);c.lineTo(s*.6,s*.55);c.moveTo(s*.6,s*.15);c.lineTo(0,s*.15);c.stroke();
    c.fillStyle='#58994d';c.beginPath();c.arc(0,0,s*.42,0,TAU);c.fill();c.strokeStyle='rgba(30,70,30,.5)';c.lineWidth=2;c.beginPath();c.arc(0,0,s*.42,0,TAU);c.moveTo(0,-s*.42);c.lineTo(0,s*.42);c.stroke();
    c.fillStyle='#f08aa8';c.beginPath();c.arc(s*.1,-s*.1,s*.1,0,TAU);c.fill();c.restore();}
   else if(k==='dry'){const s=d.r,sd=d.seed|0;c.save();c.translate(d.x,d.y);c.fillStyle='rgba(60,30,20,.18)';c.beginPath();c.ellipse(s*.25,s*.35,s*.85,s*.5,0,0,TAU);c.fill();
    for(let u=0;u<7;u++){const a=h2(sd,u)*TAU,dd=h2(sd+3,u+9)*s*.6,r=s*(.28+h2(u,sd)*.22);c.fillStyle=u%2?'#b59a5c':'#9d8349';c.beginPath();c.arc(Math.cos(a)*dd,Math.sin(a)*dd,r,0,TAU);c.fill();}
    c.strokeStyle='rgba(90,60,25,.5)';c.lineWidth=2;c.beginPath();for(let u=0;u<5;u++){const a=h2(u,sd)*TAU;c.moveTo(0,0);c.lineTo(Math.cos(a)*s*.9,Math.sin(a)*s*.9);}c.stroke();c.restore();}
   else if(k==='peb'){const sz=d.r*3.2;c.drawImage(sPeb(),d.x-sz/2,d.y-sz/2,sz,sz);}
   else if(k&&k.slice(0,2)==='rk'){const sz=d.r*3.4,lo=lift(d.x,d.y,.04);c.fillStyle='rgba(30,40,60,.15)';c.beginPath();c.ellipse(d.x+sz*.08,d.y+sz*.12,sz*.38,sz*.32,0,0,TAU);c.fill();c.drawImage(sRock(+k.slice(2)||0),d.x+lo[0]-sz/2,d.y+lo[1]-sz/2,sz,sz);}
   else{c.fillStyle=d.c;c.beginPath();c.arc(d.x,d.y,d.r,0,TAU);c.fill();}continue;}
  if(d.t==='p'){const water=d.c==='#4a98d0';if(water){c.lineJoin='round';for(const[e,col]of BANKS){poly(c,d.p);c.strokeStyle=col;c.lineWidth=e;c.stroke();}}poly(c,d.p);if(water){const g=c.createLinearGradient(d.bb.x0,d.bb.y0,d.bb.x1,d.bb.y1);g.addColorStop(0,'#92c9e0');g.addColorStop(1,'#68a9cf');c.fillStyle=g;c.strokeStyle='#9bd0e4';}else{c.fillStyle=shade(d.c,.1);c.strokeStyle=shade(d.c,.1);}
   c.fill();c.lineWidth=14;c.stroke();if(water){c.save();poly(c,d.p);c.clip();poly(c,d.p);c.strokeStyle='rgba(205,236,246,.32)';c.lineWidth=64;c.stroke();c.restore();poly(c,d.p);c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=5;c.setLineDash([26,90]);c.lineDashOffset=-M.t*22;c.stroke();c.setLineDash([]);}continue;}
  if(d.c==='#4a98d0')waterLine(c,d);else{c.strokeStyle=d.c;c.lineWidth=d.w;c.setLineDash(d.dash||[]);c.beginPath();d.pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();}
  if(d.c==='#4a98d0'){c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=5;c.setLineDash([30,80]);c.lineDashOffset=-M.t*26;c.stroke();}c.setLineDash([]);}}
 for(const d of HOUSEQ)drawDetail(c,d);
 if(!def.closed)drawStorm(c,v,false);}
const SOLIDP={rock:[['#e0d9cc','#bdb4a4'],'#8f8779'],spire:[['#e6dfd2','#c4bba9'],'#8f8779'],mesa:[['#f0cfa8','#dba97c'],'#a97c58'],bld:[['#dfe2ea','#bcc2d0'],'#8a93a7'],crate:[['#f6cd85','#e3a652'],'#94602b'] /* ★ CAJAS #1: lateral en madera oscura (antes '#b88034', casi igual a la tapa y sin sensación de volumen) */,wall:[['#ccd3e0','#a7b0c4'],'#7e889d'],rotor:[['#d7dfec','#acb9d0'],'#7886a0'],slider:[['#d7dfec','#acb9d0'],'#7886a0']};
/* ★ CAJAS #1 — sCrate(): textura de la TAPA de una caja-obstáculo, dibujada UNA sola vez y guardada en caché (mkSpr).
   Por qué un sprite: así los detalles (veta, remaches, sombras) no se recalculan cada fotograma y no parpadean.
   Diseño: caja de carga de madera vista desde arriba = marco de tablas con bisel + tablones interiores con veta y nudos
   + dos travesaños en X + cuatro esquineros de acero con remaches + placa central remachada + luz desde arriba-izquierda
   (brillo en los bordes superior/izquierdo, sombra en los inferior/derecho) + contorno oscuro bien definido.
   El dibujo se hace en un cuadrado de 320 px con el origen en el centro y luego se escala al tamaño real de cada caja. */
const sCrate=()=>mkSpr('crate',320,320,(x,w)=>{
 const H=w/2;                 /* semilado del dibujo (160) */
 const F=30;                  /* grosor del marco de madera exterior */
 const IN=H-F;                /* semilado del panel interior (zona de tablones) */
 const rnd=mulberry(4242);    /* generador con semilla fija: la veta y los nudos salen SIEMPRE iguales */
 /* board(): dibuja una tabla de madera con veta y bisel.
      (bx,by,bw,bh) = rectángulo · base = color de la madera · vert = veta vertical (true) u horizontal (false)
      sh = true → proyecta sombra sobre lo que hay debajo (la sombra se apaga justo después de pintar la base,
           para que la veta y el bisel no generen sombras propias). */
 const board=(bx,by,bw,bh,base,vert,sh)=>{
  if(sh){x.shadowColor='rgba(40,18,0,.55)';x.shadowBlur=7;x.shadowOffsetX=3;x.shadowOffsetY=4;}
  x.fillStyle=base;x.fillRect(bx,by,bw,bh);
  x.shadowColor='transparent';
  x.strokeStyle='rgba(95,55,18,.32)';x.lineWidth=1.4;                       /* veta: 3 líneas suavemente curvadas */
  for(let i=0;i<3;i++){x.beginPath();
   if(vert){const gx=bx+bw*(.2+.3*i+rnd()*.1);x.moveTo(gx,by+2);x.quadraticCurveTo(gx+(rnd()-.5)*6,by+bh/2,gx,by+bh-2);}
   else{const gy=by+bh*(.2+.3*i+rnd()*.1);x.moveTo(bx+2,gy);x.quadraticCurveTo(bx+bw/2,gy+(rnd()-.5)*6,bx+bw-2,gy);}
   x.stroke();}
  x.fillStyle='rgba(255,236,190,.38)';x.fillRect(bx,by,bw,2.5);x.fillRect(bx,by,2.5,bh);                 /* bisel iluminado (arriba/izquierda) */
  x.fillStyle='rgba(50,24,4,.38)';x.fillRect(bx,by+bh-2.5,bw,2.5);x.fillRect(bx+bw-2.5,by,2.5,bh);       /* bisel en sombra (abajo/derecha) */};
 /* metal(): rellena el camino actual con acero (degradado claro→oscuro en diagonal) y lo perfila. */
 const metal=(x0,y0,x1,y1)=>{const g=x.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#cdd5df');g.addColorStop(1,'#8892a2');
  x.fillStyle=g;x.fill();x.strokeStyle='#3f4856';x.lineWidth=2;x.stroke();};
 /* rivet(): remache = aro oscuro + cabeza metálica + puntito de brillo. */
 const rivet=(rx,ry)=>{x.fillStyle='#3f4856';x.beginPath();x.arc(rx,ry,5,0,TAU);x.fill();
  x.fillStyle='#d5dbe3';x.beginPath();x.arc(rx-.6,ry-.6,3.7,0,TAU);x.fill();
  x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(rx-1.6,ry-1.6,1.2,0,TAU);x.fill();};
 /* nail(): clavo de las tablas del marco. */
 const nail=(nx,ny)=>{x.fillStyle='#3a2410';x.beginPath();x.arc(nx,ny,3.2,0,TAU);x.fill();
  x.fillStyle='#d8b98a';x.beginPath();x.arc(nx-.8,ny-.8,1.1,0,TAU);x.fill();};

 /* 1) Fondo oscuro: se asoma en las juntas entre tablas y da profundidad. */
 x.fillStyle='#6b4219';x.fillRect(-H,-H,w,w);
 /* 2) Cinco tablones horizontales con tonos de madera alternados. */
 const cols=['#dfab62','#d29a52','#e5b46c','#cc964f','#dba75d'],ph=2*IN/5;
 for(let i=0;i<5;i++)board(-IN,-IN+i*ph,2*IN,ph,cols[i],false,false);
 /* 3) Nudos de la madera (posiciones fijas gracias a la semilla). */
 for(let i=0;i<3;i++){const kx=(rnd()-.5)*IN*1.3,ky=(rnd()-.5)*IN*1.3;
  x.fillStyle='rgba(90,50,14,.55)';x.beginPath();x.ellipse(kx,ky,7,4.5,0,0,TAU);x.fill();
  x.strokeStyle='rgba(60,30,6,.45)';x.lineWidth=1.5;x.beginPath();x.ellipse(kx,ky,11,7.5,0,0,TAU);x.stroke();}
 /* 4) Dos travesaños en X (refuerzo típico de una caja). Se recortan al panel interior y proyectan sombra. */
 x.save();x.beginPath();x.rect(-IN,-IN,2*IN,2*IN);x.clip();
 const L=IN*2*Math.SQRT2+20;
 for(const a of[Math.PI/4,-Math.PI/4]){x.save();x.rotate(a);board(-L/2,-13,L,26,'#c18c47',false,true);x.restore();}
 x.restore();
 /* 5) Marco exterior: cuatro tablas con bisel que tapan los extremos de los travesaños y proyectan sombra hacia dentro. */
 board(-H,-H,w,F,'#b9803f',false,true);
 board(-H,H-F,w,F,'#b07838',false,true);
 board(-H,-H+F,F,w-2*F,'#b57c3b',true,true);
 board(H-F,-H+F,F,w-2*F,'#ad7536',true,true);
 /* 6) Clavos a lo largo del marco. */
 for(let i=-2;i<=2;i++){const q=i*58;nail(q,-H+F/2);nail(q,H-F/2);nail(-H+F/2,q);nail(H-F/2,q);}
 /* 7) Esquineros de acero en forma de L en las cuatro esquinas (A = largo del brazo, T = grosor), con remaches. */
 const A=84,T=26;
 for(const sx of[-1,1])for(const sy of[-1,1]){
  x.shadowColor='rgba(20,10,0,.5)';x.shadowBlur=4;x.shadowOffsetX=2;x.shadowOffsetY=3;
  x.beginPath();                                   /* L: esquina, brazo horizontal, hueco interior, brazo vertical */
  x.moveTo(sx*H,sy*H);x.lineTo(sx*(H-A),sy*H);x.lineTo(sx*(H-A),sy*(H-T));
  x.lineTo(sx*(H-T),sy*(H-T));x.lineTo(sx*(H-T),sy*(H-A));x.lineTo(sx*H,sy*(H-A));x.closePath();
  metal(-H,-H,H,H);                                /* degradado en coordenadas globales: la luz siempre viene de arriba-izquierda */
  x.shadowColor='transparent';
  rivet(sx*(H-T/2),sy*(H-T/2));rivet(sx*(H-A+13),sy*(H-T/2));rivet(sx*(H-T/2),sy*(H-A+13));}
 /* 8) Placa central de acero donde se cruzan los travesaños, con cuatro remaches. */
 x.shadowColor='rgba(20,10,0,.5)';x.shadowBlur=5;x.shadowOffsetX=2;x.shadowOffsetY=3;
 x.beginPath();x.rect(-27,-27,54,54);metal(-27,-27,27,27);
 x.shadowColor='transparent';
 for(const sx of[-1,1])for(const sy of[-1,1])rivet(sx*17,sy*17);
 /* 9) Sombreado general: aclarado arriba-izquierda y oscurecido abajo-derecha (volumen). */
 const g=x.createLinearGradient(-H,-H,H,H);
 g.addColorStop(0,'rgba(255,248,225,.20)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,12,0,.28)');
 x.fillStyle=g;x.fillRect(-H,-H,w,w);
 /* 10) Contorno oscuro que define el borde de la caja. */
 x.strokeStyle='#3d2410';x.lineWidth=6;x.strokeRect(-H,-H,w,w);
});
/* ★ CAJAS #1 — drawCrateTop(c,s): pinta la tapa de la caja-obstáculo 's' sobre el volumen que ya dibuja drawSolidSoft.
   Qué hace: recorta al polígono real de la caja (así NUNCA se dibuja fuera de su colisión), estira la textura sCrate()
   al tamaño de la caja y remata con un contorno oscuro. El volumen lateral (las 6 capas extruidas en la dirección de la
   cámara, que dan el aspecto tridimensional) lo sigue generando drawSolidSoft con el color de borde SOLIDP.crate[1].
   Sustituye a la "X" plana de antes. */
function drawCrateTop(c,s){
 const b=s.bb,im=sCrate();
 c.save();poly(c,s.poly);c.clip();                                                /* recorte al polígono de la caja (octógono chaflanado) */
 c.drawImage(im,b.x0-4,b.y0-4,b.x1-b.x0+8,b.y1-b.y0+8);                          /* textura 4 px más grande para tapar el borde del relleno genérico */
 c.restore();
 /* Contorno definido (7 px = el grosor del trazo genérico).
    ★ ESCULPIR #5: en una caja excavada el contorno se dibuja por tramos. Los tramos intactos conservan el marrón casi negro
    de siempre, pero los del borde de un cráter usan el color de la pared lateral de la caja (madera, '#8a5a2b'): así el hueco
    continúa de forma natural con el volumen de la caja y no aparece un aro negro alrededor del agujero. */
 if(!s.sc){poly(c,s.poly);c.lineWidth=7;c.strokeStyle='#3d2410';c.lineJoin='round';c.stroke();}
 else{const V=s.sc.V,n=V.length;c.lineWidth=7;c.lineCap='round';
  for(let i=0;i<n;i++){const a=V[i],b=V[(i+1)%n];
   c.strokeStyle=(a.d>=.8||b.d>=.8)?'#8a5a2b':'#3d2410';                       /* tramo de cráter → madera; tramo intacto → contorno oscuro */
   c.beginPath();c.moveTo(a.x+a.nx*a.d,a.y+a.ny*a.d);c.lineTo(b.x+b.nx*b.d,b.y+b.ny*b.d);c.stroke();}}
}
function drawSolidSoft(c,def,s){const pal=(def.pal&&def.pal[s.kind])||SOLIDP[s.kind]||[[shade(def.solid,.25),def.solid],shade(def.solid,-.2)],cx=(s.bb.x0+s.bb.x1)/2,cy=(s.bb.y0+s.bb.y1)/2;
 const k=s.kind==='bld'?.1:s.kind==='wall'?.08:s.kind==='crate'?.06:s.kind==='spire'?.12:s.kind==='mesa'?.09:.05,lo=lift(cx,cy,k);const ox=lo[0]-3,oy=lo[1]-5;
 c.lineJoin='round';const R=7;
 for(let i=0;i<=6;i++){const f=i/6;c.save();c.translate(ox*f,oy*f);poly(c,s.poly);
  if(i<6){c.fillStyle=c.strokeStyle=shade(pal[1],-.1+i*.017);c.lineWidth=R;c.fill();c.stroke();}
  else{const g=c.createLinearGradient(s.bb.x0,s.bb.y0,s.bb.x1,s.bb.y1);g.addColorStop(0,pal[0][0]);g.addColorStop(1,pal[0][1]);c.fillStyle=c.strokeStyle=g;c.lineWidth=R;c.fill();c.stroke();
   c.save();c.translate(cx,cy);c.scale(.82,.82);c.translate(-cx,-cy);poly(c,s.poly);c.fillStyle='rgba(255,255,255,.2)';c.fill();c.restore();
   if(s.kind==='bld'){c.fillStyle='rgba(255,255,255,.35)';const w=Math.min(60,(s.bb.x1-s.bb.x0)*.3),h=Math.min(60,(s.bb.y1-s.bb.y0)*.3);c.beginPath();c.roundRect?c.roundRect(cx-w/2,cy-h/2,w,h,12):c.rect(cx-w/2,cy-h/2,w,h);c.fill();}
   /* ★ CAJAS #1 — antes aquí había solo una "X" semitransparente; ahora se dibuja la tapa completa de madera, esquineros y remaches */
   if(s.kind==='crate')drawCrateTop(c,s);
   if(s.kind==='rotor'){c.fillStyle='#4b566e';c.beginPath();c.arc(s.cx,s.cy,s.T*1.9,0,TAU);c.fill();c.strokeStyle='#ffc34d';c.lineWidth=4;c.stroke();}
   if(s.kind==='slider'||s.kind==='rotor'){c.strokeStyle='#ffc34d';c.lineWidth=4;poly(c,s.poly);c.stroke();}}
  c.restore();}}
function drawTerrainSoft(c,def,v){
 drawGroundSoft(c,def,v);drawScars(c,v);
 c.save();c.translate(16,22);c.fillStyle='rgba(30,50,90,.17)';c.strokeStyle='rgba(30,50,90,.17)';c.lineWidth=14;c.lineJoin='round';for(const s of World.solids){if(!inView(s.bb,v))continue;poly(c,s.poly);c.fill();c.stroke();}c.restore();
 for(const s of World.solids){if(!inView(s.bb,v))continue;
  if(s.kind==='rotor'){c.strokeStyle='rgba(255,176,46,.35)';c.lineWidth=4;c.setLineDash([16,14]);c.beginPath();c.arc(s.cx,s.cy,s.L,0,TAU);c.stroke();c.setLineDash([]);}
  drawSolidSoft(c,def,s);}
 for(const t of World.turrets){if(t.x<v.x0||t.x>v.x1||t.y<v.y0||t.y>v.y1)continue;
  if(!t.alive){c.fillStyle='rgba(60,70,90,.4)';c.beginPath();c.arc(t.x,t.y,26,0,TAU);c.fill();continue;}
  c.fillStyle='rgba(30,50,90,.2)';c.beginPath();c.ellipse(t.x+6,t.y+9,32,26,0,0,TAU);c.fill();
  {const lo=lift(t.x,t.y,.055),ox=lo[0],oy=lo[1]-5;
   for(let i=0;i<3;i++){c.fillStyle='#5c6985';c.beginPath();c.arc(t.x+ox*i/3,t.y+oy*i/3,29,0,TAU);c.fill();}
   {const g=c.createRadialGradient(t.x+ox-8,t.y+oy-8,3,t.x+ox,t.y+oy,30);g.addColorStop(0,'#b4c0d8');g.addColorStop(1,'#7584a2');c.fillStyle=g;c.beginPath();c.arc(t.x+ox,t.y+oy,29,0,TAU);c.fill();}
   c.save();c.translate(t.x+ox,t.y+oy-3);c.rotate(t.ang);c.fillStyle='#4a566f';for(const yy of[-6,6]){c.beginPath();c.roundRect?c.roundRect(6,yy-3.5,36,7,3.5):c.rect(6,yy-3.5,36,7);c.fill();}
   const g=c.createRadialGradient(-4,-4,1,0,0,16);g.addColorStop(0,t.tg?'#ff9a9a':'#dfe6f4');g.addColorStop(1,t.tg?'#ff5a5a':'#8d9ab5');c.fillStyle=g;c.beginPath();c.arc(0,0,15,0,TAU);c.fill();c.restore();}
  if(t.hp<t.max){c.fillStyle='rgba(20,30,60,.35)';c.fillRect(t.x-22,t.y+36,44,5);c.fillStyle='#ff6b6b';c.fillRect(t.x-22,t.y+36,44*t.hp/t.max,5);}}
 c.globalAlpha=1;}
/* ---- nubes ---- */
function drawCloudsSoft(c,S,cxm,cym){if(SAVE.cfg.clouds===0)return;const t=M.t,TW=2600*S,TH=2000*S,cs=sCloud();
 for(const[f,sz,al,sp]of[[1.35,1,.5,9]]){c.globalAlpha=al;
  for(const k of M.clouds){let sx=((k.x*(f>1.5?.7:1)-cxm*f+t*sp)*S)%TW,sy=((k.y*(f>1.5?1.3:1)-cym*f)*S)%TH;if(sx<0)sx+=TW;if(sy<0)sy+=TH;
   for(let x=sx-TW;x<VW+300;x+=TW)for(let y=sy-TH;y<VH+300;y+=TH){if(x<-300||y<-300)continue;const W=70*k.s*S*3.4*sz,H=W*cs.height/cs.width;c.drawImage(cs,x-W/2,y-H/2,W,H);}}}c.globalAlpha=1;}
/* ---- explosión suave ---- */
function softBoom(c,p,a){const u=1-a,r=p.s*(.45+u*1.15),g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba(255,255,235,'+(a*.95)+')');g.addColorStop(.35,'rgba(255,208,110,'+(a*.8)+')');g.addColorStop(.75,'rgba(255,120,70,'+(a*.45)+')');g.addColorStop(1,'rgba(255,90,70,0)');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,r,0,TAU);c.fill();
 c.strokeStyle='rgba(255,255,255,'+(a*.6)+')';c.lineWidth=3*a+1;c.beginPath();c.arc(p.x,p.y,r*.9,0,TAU);c.stroke();}
