'use strict';
/* ===== Estilo gráfico «Estilizado» + profundidad (parallax) ===== */
const DEPTH=()=>SAVE.cfg.depth!==0;
let CAMX=0,CAMY=0;
const LA=.022;
/* una única capa elevada (todo lo que no es suelo) con la misma profundidad; el suelo no se desplaza */
const mute=(h,a)=>{a=a===undefined?.2:a;const n=parseInt(h.slice(1,7),16);let r=n>>16,g=n>>8&255,b=n&255;const L=r*.3+g*.59+b*.11;r+=(L-r)*a;g+=(L-g)*a;b+=(L-b)*a;return hx2(r,g,b);};
const BANKS=[[170,'rgba(150,190,120,.14)'],[112,'rgba(190,214,140,.26)'],[66,'rgba(238,231,172,.55)']];
function waterLine(c,d){const w=d.w,path=()=>{c.beginPath();d.pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));};
 c.setLineDash([]);c.lineJoin=c.lineCap='round';
 for(const[e,col]of BANKS){c.strokeStyle=col;c.lineWidth=w+e;path();c.stroke();}
 c.strokeStyle='#a2d2e5';c.lineWidth=w;path();c.stroke();
 c.strokeStyle='#78b6d8';c.lineWidth=w*.7;path();c.stroke();
 c.strokeStyle='#5e9fc9';c.lineWidth=w*.4;path();c.stroke();c.strokeStyle='rgba(220,242,250,.3)';c.lineWidth=w*.12;path();c.stroke();}
function lakeSoft(c,d){c.lineJoin='round';for(const[e,col]of BANKS){poly(c,d.p);c.strokeStyle=col;c.lineWidth=e;c.stroke();}
 poly(c,d.p);c.fillStyle='#74b3d6';c.fill();c.strokeStyle='#a2d2e5';c.lineWidth=18;c.stroke();
 c.save();poly(c,d.p);c.clip();poly(c,d.p);c.strokeStyle='rgba(220,242,250,.34)';c.lineWidth=70;c.stroke();poly(c,d.p);c.strokeStyle='rgba(235,248,252,.3)';c.lineWidth=26;c.stroke();c.restore();
 softDetail(c,d.g,()=>poly(c,d.p));}
const PARK=.045,PARM=42;
function lift(x,y,k){if(!DEPTH())return[0,0];const dx=(x-CAMX)*PARK,dy=(y-CAMY)*PARK;return[PARM*Math.tanh(dx/PARM),PARM*Math.tanh(dy/PARM)];}
const hx2=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const SOFTCOL={valle:'#7bd85a',archi:'#8bc2e4',canon:'#e1a57d',mesa:'#d87c5a',fabrica:'#b3ba79',metro:'#b9bdc7',hielo:'#e6f1f7'};
const softCol=id=>SOFTCOL[id]||'#7bd85a';
const SSPR={};
function mkSpr(key,w,h,fn){if(SSPR[key])return SSPR[key];const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.translate(w/2,h/2);fn(x,w,h);return SSPR[key]=cv;}
function softBlob(x,R,seed,n){const r=mulberry(seed),p=[];for(let i=0;i<n;i++){const a=i/n*TAU;p.push([Math.cos(a)*R*(.78+r()*.22),Math.sin(a)*R*(.78+r()*.22)]);}
 x.beginPath();for(let i=0;i<n;i++){const a=p[i],b=p[(i+1)%n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if(i===0)x.moveTo(mx,my);else x.quadraticCurveTo(a[0],a[1],mx,my);}{const a=p[0],b=p[1];x.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}x.closePath();}
/* árboles vistos desde arriba: copa con lóbulos y borde oscuro (frondosa) o estrella de agujas (conífera) */
const grn=h=>{const n=parseInt(h.slice(1,7),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.round(r*1.05);g=Math.min(255,Math.round(g*1.45+10));b=Math.round(b*.95);return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');};
const sTreeC=(col0,kind,seed)=>mkSpr('tr'+col0+kind+seed,200,200,(x,w)=>{const hexs=(h,k)=>{const n=parseInt(h.slice(1,7),16),t=k<0?0:255,f=Math.abs(k);return'#'+[n>>16,n>>8&255,n&255].map(v=>Math.round(v+(t-v)*f).toString(16).padStart(2,'0')).join('');},col=hexs(grn(col0),.16),r=mulberry(seed*97+5),R=w*.36;
 if(kind==='pine'){const layers=[[1,-.22],[.74,-.05],[.5,.1],[.28,.2]];let ph=r()*6;
  for(let i=0;i<layers.length;i++){const[k,sh]=layers[i],n=9,pts=[];ph+=.35;for(let j=0;j<n*2;j++){const a=j/(n*2)*TAU+ph,rad=R*k*(j%2?.5:1);pts.push([Math.cos(a)*rad,Math.sin(a)*rad]);}
   x.beginPath();pts.forEach((p,j)=>j?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.lineJoin='round';x.fillStyle=x.strokeStyle=shade(col,sh);x.lineWidth=8;x.fill();x.stroke();}
  x.fillStyle=shade(col,.32);x.beginPath();x.arc(-R*.04,-R*.05,R*.1,0,TAU);x.fill();return;}
 softBlob(x,R*1.02,seed*13+1,13);x.fillStyle=shade(col,-.2);x.fill();
 const lobes=[];for(let i=0;i<6;i++){const a=i/6*TAU+r()*.5;lobes.push([Math.cos(a)*R*.5,Math.sin(a)*R*.5,R*(.44+r()*.1)]);}lobes.push([0,0,R*.55]);
 for(const[dx,dy,rd]of lobes){const g=x.createRadialGradient(dx-rd*.35,dy-rd*.4,rd*.08,dx,dy,rd);g.addColorStop(0,shade(col,.24));g.addColorStop(.7,shade(col,.02));g.addColorStop(1,shade(col,-.1));x.fillStyle=g;x.beginPath();x.arc(dx,dy,rd,0,TAU);x.fill();}
 for(let i=0;i<16;i++){const a=r()*TAU,d=r()*R*.8;x.fillStyle=r()<.5?'rgba(255,255,255,.16)':'rgba(0,0,0,.12)';x.beginPath();x.ellipse(Math.cos(a)*d,Math.sin(a)*d,3+r()*5,2+r()*3,r()*3,0,TAU);x.fill();}});
const sTree=sTreeC;
const sPalm=()=>mkSpr('palm',180,180,(x,w)=>{const R=w*.42;for(let i=0;i<8;i++){x.save();x.rotate(i/8*TAU+.2);const g=x.createLinearGradient(0,0,R,0);g.addColorStop(0,'#3f8f5a');g.addColorStop(1,'#8fd08a');x.fillStyle=g;x.strokeStyle='#2f7448';x.lineWidth=2;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(R*.5,-R*.3,R,0);x.quadraticCurveTo(R*.5,R*.3,0,0);x.fill();x.stroke();x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=2;x.beginPath();x.moveTo(R*.1,0);x.lineTo(R*.85,0);x.stroke();x.restore();}
 const g=x.createRadialGradient(-3,-3,1,0,0,R*.2);g.addColorStop(0,'#e0b97a');g.addColorStop(1,'#a97b45');x.fillStyle=g;x.beginPath();x.arc(0,0,R*.14,0,TAU);x.fill();});

const detSpr=(k,v)=>mkSpr('det3'+k+v,220,220,(x)=>{const r=mulberry(v*31+7);
 const rr=(x0,y0,w,h,rad)=>{x.beginPath();if(x.roundRect)x.roundRect(x0,y0,w,h,rad);else x.rect(x0,y0,w,h);};
 const ell=(cx,cy,rx,ry,rot)=>{x.beginPath();x.ellipse(cx,cy,rx,ry,rot||0,0,TAU);};
 x.lineJoin='round';x.lineCap='round';
 /* casas y graneros: tejado plano pastel de dos aguas, esquinas redondeadas, sin texturas */
 if(k==='house'||k==='barn'){const barn=k==='barn',pals=[['#f6b4a3','#e99a88'],['#f3d49b','#e2bb78'],['#abc8e8','#8fb0d6'],['#eab5cc','#d996b3'],['#b8dc9c','#9cc67f']],roof=barn?['#f19a8e','#de8176']:pals[v%5],hw=barn?82:68,hh=barn?58:50;
  rr(-hw,-hh,hw*2,hh*2,16);x.fillStyle=roof[1];x.fill();
  x.save();rr(-hw,-hh,hw*2,hh*2,16);x.clip();x.fillStyle=roof[0];x.fillRect(-hw,-hh,hw*2,hh);x.restore();
  rr(-hw,-hh,hw*2,hh*2,16);x.strokeStyle=shade(roof[1],-.1);x.lineWidth=4;x.stroke();
  x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=5;x.beginPath();x.moveTo(-hw+14,0);x.lineTo(hw-14,0);x.stroke();
  if(barn){x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=4;rr(-hw*.3,hh*.28,hw*.6,hh*.46,6);x.stroke();x.beginPath();x.moveTo(-hw*.3,hh*.28);x.lineTo(hw*.3,hh*.74);x.moveTo(hw*.3,hh*.28);x.lineTo(-hw*.3,hh*.74);x.stroke();}
  else{const cx0=hw*.4,cy0=-hh*.62;rr(cx0,cy0,20,20,6);x.fillStyle='#e6e8ee';x.fill();x.strokeStyle='#c8ccd6';x.lineWidth=3;x.stroke();rr(cx0+5,cy0+5,10,10,4);x.fillStyle='#b9bec9';x.fill();}
  return;}
 /* vaca: cuerpo redondeado, manchas suaves, hocico rosa */
 if(k==='cow'){const base=v%2?'#fbf8f0':'#e8bf8e',spot=v%2?'#7e7f8a':'#c58f5e',dk=shade(base,-.14);
  x.strokeStyle=dk;x.lineWidth=6;x.beginPath();x.moveTo(-58,0);x.quadraticCurveTo(-78,-6,-82,10);x.stroke();
  rr(-62,-32,120,64,32);x.fillStyle=base;x.fill();
  x.save();rr(-62,-32,120,64,32);x.clip();x.fillStyle=spot;for(let i=0;i<3;i++){ell(-34+i*28+(r()-.5)*8,(r()-.5)*30,10+r()*7,8+r()*5,r()*3);x.fill();}x.restore();
  rr(-62,-32,120,64,32);x.strokeStyle=dk;x.lineWidth=3;x.stroke();
  ell(66,0,23,21);x.fillStyle=base;x.fill();x.stroke();
  ell(58,-23,9,6,.5);ell(58,23,9,6,-.5);x.fillStyle=spot;x.fill();
  ell(82,0,9,13);x.fillStyle='#f6bcb4';x.fill();
  x.fillStyle='#4a4046';x.beginPath();x.arc(72,-10,2.4,0,TAU);x.arc(72,10,2.4,0,TAU);x.fill();return;}
 /* oveja: nube de lana blanca y cabeza gris suave */
 if(k==='sheep'){x.fillStyle='#ece7dc';for(let i=0;i<8;i++){const a=i/8*TAU;x.beginPath();x.arc(Math.cos(a)*28,Math.sin(a)*25,23,0,TAU);x.fill();}x.beginPath();x.arc(0,0,33,0,TAU);x.fill();
  x.fillStyle='#fffdf8';for(let i=0;i<8;i++){const a=i/8*TAU;x.beginPath();x.arc(Math.cos(a)*28,Math.sin(a)*25,20,0,TAU);x.fill();}x.beginPath();x.arc(0,0,30,0,TAU);x.fill();
  ell(50,0,16,13);x.fillStyle='#8a868c';x.fill();ell(40,-13,7,5,.6);ell(40,13,7,5,-.6);x.fillStyle='#74707a';x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(54,-5,2,0,TAU);x.arc(54,5,2,0,TAU);x.fill();return;}
 /* ciervo: cuerpo tostado liso, puntos claros y cuernos simples */
 if(k==='deer'){const base='#d6a574',dk=shade(base,-.16);
  x.fillStyle='#fbf5e6';x.beginPath();x.arc(-60,0,8,0,TAU);x.fill();
  rr(-58,-26,114,52,26);x.fillStyle=base;x.fill();x.strokeStyle=dk;x.lineWidth=3;x.stroke();
  x.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<6;i++){x.beginPath();x.arc(-38+r()*72,(r()-.5)*28,3.4,0,TAU);x.fill();}
  ell(64,0,21,14);x.fillStyle=base;x.fill();x.stroke();
  ell(50,-17,8,5,.6);ell(50,17,8,5,-.6);x.fillStyle=shade(base,-.06);x.fill();
  x.fillStyle='#4a3a30';x.beginPath();x.arc(82,0,3,0,TAU);x.arc(68,-7,2.2,0,TAU);x.arc(68,7,2.2,0,TAU);x.fill();
  x.strokeStyle='#ead9b8';x.lineWidth=4;for(const q of[-1,1]){x.beginPath();x.moveTo(60,q*10);x.quadraticCurveTo(74,q*24,90,q*30);x.moveTo(72,q*21);x.lineTo(86,q*21);x.stroke();}return;}
 if(k==='hay'){x.fillStyle='#f4e3a2';x.beginPath();x.arc(0,0,42,0,TAU);x.fill();x.strokeStyle='#dcc680';x.lineWidth=3;x.stroke();
  x.strokeStyle='rgba(200,170,80,.5)';x.lineWidth=3;for(const q of[28,15]){x.beginPath();x.arc(0,0,q,0,TAU);x.stroke();}}});
function drawDetail(c,d){const k=d.sp,big=(k==='house'||k==='barn'),mv=(k==='cow'||k==='sheep'||k==='deer'),sz=d.sz;let px=d.x,py=d.y,a=d.rot,sx=1,sy=1;
 /* los animales pasean por una trayectoria suave alrededor de su sitio, se orientan hacia donde van, se paran a ratos y balancean el paso */
 if(mv){const s=d.seed,ax=120+(s*7%80),ay=90+(s*13%70),f1=.12+(s*3%9)*.01,f2=.16+(s*5%9)*.01,t=M.t,tau=t+3.2*Math.sin(t*.31+s),dtau=1+3.2*.31*Math.cos(t*.31+s),p1=f1*tau+s,p2=f2*tau+s*1.7;
  px+=ax*Math.sin(p1);py+=ay*Math.sin(p2);
  const vx=ax*f1*Math.cos(p1),vy=ay*f2*Math.cos(p2);a=Math.atan2(vy,vx);
  const w=Math.min(1,Math.hypot(vx,vy)*dtau/18),st=tau*(ax*f1+ay*f2)*.5/9;
  a+=Math.sin(st)*.07*w;sx=1+Math.sin(st*2)*.035*w;sy=1-Math.sin(st*2)*.02*w;}
 c.save();c.translate(px+sz*.04,py+sz*.06);c.rotate(a);c.fillStyle='rgba(30,60,50,.13)';c.beginPath();c.ellipse(0,0,sz*(big?.31:.27),sz*(big?.24:.17),0,0,TAU);c.fill();c.restore();
 c.save();c.translate(px,py);c.rotate(a);c.scale(sx,sy);c.drawImage(detSpr(k,d.v),-sz/2,-sz/2,sz,sz);c.restore();}
function addDetail(b,id){const C=b.C;b.towns=[];if(id!=='mundo'&&id!=='valle'&&id!=='canon')return;
 const add=(sp,x,y,sz,v,ex)=>{const o=Object.assign({t:'c',x,y,r:sz*.55,sp,sz,v:v||0,rot:rnd(0,TAU),seed:rnd(0,100)},ex||{});C.push(o);return o;};
 /* agua (ríos y lagos) donde no deben ir casas ni animales */
 const dseg=(x,y,a,b2)=>{const dx=b2[0]-a[0],dy=b2[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);};
 const wat=C.filter(d=>(d.t==='g'||d.t==='gl')&&d.g==='archi').map(d=>{const pts=d.t==='g'?d.p:d.pts,bb=polyBB(pts);return{d,pts,bb,w:d.w||0};});
 const wet=(x,y,m)=>{for(const q of wat){const mm=m+q.w/2+40;if(x<q.bb.x0-mm||x>q.bb.x1+mm||y<q.bb.y0-mm||y>q.bb.y1+mm)continue;
   if(q.d.t==='g'){const r=distPoly(x,y,q.pts);if(r[0]||r[1]<mm)return true;}else for(let i=0;i<q.pts.length-1;i++)if(dseg(x,y,q.pts[i],q.pts[i+1])<mm)return true;}return false;};
 const okp=(x,y,m)=>x>400&&y>400&&x<World.w-400&&y<World.h-400&&World.free(x,y,m)&&!wet(x,y,m)&&!(id==='mundo'&&x<10500&&y<7100+m+200);
 const placed=[],houses=[],far=(x,y,d)=>placed.every(q=>Math.hypot(q[0]-x,q[1]-y)>d),clear=(x,y,m)=>houses.every(h=>Math.hypot(h[0]-x,h[1]-y)>h[2]+m);
 const herd=(cx,cy,rad,kind,n)=>{const hx=cx+rnd(-rad,rad),hy=cy+rnd(-rad,rad);for(let i=0;i<n;i++){const x=hx+rnd(-220,220),y=hy+rnd(-220,220);if(okp(x,y,70)&&clear(x,y,90))add(kind,x,y,56,rint(0,2));}};
 const SEP=id==='mundo'?1000:2300;
 /* los pueblos tienen una plaza central libre; las casas la rodean y de ella parten los caminos */
 const village=(z,nh,rad,kinds,pl)=>{for(let t=0;t<140;t++){const cx=rnd(z[0],z[2]),cy=rnd(z[1],z[3]);if(!okp(cx,cy,pl+200)||!far(cx,cy,SEP))continue;
   const hs=[];for(let i=0;i<nh*12&&hs.length<nh;i++){const a=rnd(0,TAU),d=rnd(pl+160,rad),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(!okp(x,y,170)||hs.some(q=>Math.hypot(q[0]-x,q[1]-y)<340))continue;hs.push([x,y,a]);}
   if(hs.length<Math.min(2,nh))continue;
   placed.push([cx,cy]);b.towns.push({x:cx,y:cy,pl,r:rad});
   hs.forEach((q,i)=>{const barn=i===1&&Math.random()<.6,sz=barn?300:rnd(235,285);add(barn?'barn':'house',q[0],q[1],sz,rint(0,4),{rot:Math.round(q[2]/(Math.PI/2))*(Math.PI/2)+rnd(-.08,.08)});houses.push([q[0],q[1],sz*.5]);});
   for(let i=0,n=rint(2,4);i<n;i++){const a=rnd(0,TAU),d=rnd(rad*.7,rad*1.4),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(okp(x,y,90)&&clear(x,y,60))add('hay',x,y,80,0);}
   herd(cx,cy,rad*1.5,pick(kinds),rint(4,8));return;}};
 if(id==='mundo'){const valley=[600,7500,9000,13000],forest=[20800,500,26400,6800];
  for(let i=0;i<11;i++)village(valley,rint(3,6),600,['cow','sheep'],230);
  for(let i=0;i<7;i++)village(forest,rint(2,3),480,['deer'],200);
  for(let i=0;i<16;i++){const x=rnd(valley[0],valley[2]),y=rnd(valley[1],valley[3]);if(okp(x,y,120))herd(x,y,300,Math.random()<.5?'cow':'sheep',rint(3,7));}
  for(let i=0;i<14;i++){const x=rnd(forest[0],forest[2]),y=rnd(forest[1],forest[3]);if(okp(x,y,120))herd(x,y,300,'deer',rint(2,5));}
  for(let i=0;i<10;i++){const x=rnd(10600,20300),y=rnd(500,6800);if(okp(x,y,120))herd(x,y,200,'sheep',rint(2,4));}}
 else if(id==='valle'){const z=[1000,2300,World.w-1000,World.h-2300];
  for(let i=0;i<7;i++)village(z,rint(3,5),600,['cow','sheep'],230);
  for(let i=0;i<14;i++){const x=rnd(z[0],z[2]),y=rnd(z[1],z[3]);if(okp(x,y,120))herd(x,y,300,Math.random()<.5?'cow':'sheep',rint(3,7));}}
 /* cañón: cactus, matojos secos y piedras, nunca dentro de la grieta */
 if(id==='mundo'||id==='canon'){const zc=id==='mundo'?[10600,300,20300,6800]:[500,500,World.w-500,World.h-500],rav=C.filter(d=>d.t==='gl'&&d.g==='mesa');
  const inRav=(x,y,m)=>{for(const d of rav)for(let i=0;i<d.pts.length-1;i++)if(dseg(x,y,d.pts[i],d.pts[i+1])<d.w/2+m)return true;return false;};
  const n=Math.round((zc[2]-zc[0])*(zc[3]-zc[1])/380000);
  for(let i=0;i<n;i++){const x=rnd(zc[0],zc[2]),y=rnd(zc[1],zc[3]);if(!okp(x,y,60)||inRav(x,y,70))continue;const q=Math.random();
   if(q<.34)add('cactus',x,y,rnd(60,86),0);else if(q<.62)add('dry',x,y,rnd(60,90),0);else if(q<.82)add('peb',x,y,rnd(20,34),0);else add('rk'+rint(0,5),x,y,rnd(28,48),0);}
  for(let i=0,m=Math.round(n/9);i<m;i++){const cx=rnd(zc[0],zc[2]),cy=rnd(zc[1],zc[3]);for(let k=0,nk=rint(3,6);k<nk;k++){const x=cx+rnd(-170,170),y=cy+rnd(-170,170);if(okp(x,y,60)&&!inRav(x,y,70))add(Math.random()<.65?'cactus':'dry',x,y,rnd(60,86),0);}}}
 /* los animales de pueblos creados después pueden quedar junto a casas posteriores: se retiran los que pisen una casa */
 for(let i=C.length-1;i>=0;i--){const d=C[i];if(d.t==='c'&&(d.sp==='cow'||d.sp==='sheep'||d.sp==='deer'||d.sp==='hay')&&!clear(d.x,d.y,d.sp==='hay'?40:80))C.splice(i,1);}}
const sPeb=()=>mkSpr('peb',64,64,(x,w)=>{const g=x.createRadialGradient(-6,-8,2,0,0,w*.42);g.addColorStop(0,'#eee9df');g.addColorStop(1,'#b3ab9e');x.fillStyle=g;x.beginPath();x.ellipse(0,0,w*.36,w*.28,.4,0,TAU);x.fill();});
const sRock=i=>mkSpr('rk'+i,200,200,(x,w)=>{const R=w*.42;softBlob(x,R,31+i*17,9);const g=x.createLinearGradient(-R,-R,R,R);g.addColorStop(0,'#ded7ca');g.addColorStop(1,'#a69e90');x.fillStyle=g;x.fill();
 x.save();x.scale(.62,.62);x.translate(-R*.22,-R*.26);softBlob(x,R,31+i*17,9);x.fillStyle='rgba(255,255,255,.22)';x.fill();x.restore();});
const sCloud=()=>mkSpr('cloud',320,200,(x,w)=>{for(const[dx,dy,r]of[[0,10,70],[70,0,55],[-72,14,52],[28,-26,52],[-30,-18,46]]){const g=x.createRadialGradient(dx,dy,r*.1,dx,dy,r);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.7,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(dx,dy,r,0,TAU);x.fill();}});

/* ---- avión ---- */
let TCOL=null;
const PLPATH={};
function drawPlaneSoft(c,def,look,o){TCOL=look.tc||null;
 const sh=def.shape,L=sh.len,bh=sh.bh*1.1,W=sh.wing*1.25,T=sh.tail,col=paintOf(look.paint),P=col[0],S=col[1],A=col[2],t=o.t||0,sw=sh.jet?.2:.03;
 c.save();c.translate(o.x,o.y);c.rotate(o.ang||0);
 const sy=o.roll===undefined?1:clamp(Math.abs(o.roll),.3,1),sc=o.scale||1;c.scale(sc,sc*sy);c.globalAlpha=o.alpha===undefined?1:o.alpha;c.lineJoin='round';c.lineCap='round';
 let PP=PLPATH[def.id];if(!PP){const body=new Path2D();body.moveTo(L*.5,0);body.quadraticCurveTo(L*.42,-bh*.66,L*.1,-bh*.66);body.quadraticCurveTo(-L*.25,-bh*.58,-L*.5,-bh*.16);body.quadraticCurveTo(-L*.54,0,-L*.5,bh*.16);body.quadraticCurveTo(-L*.25,bh*.58,L*.1,bh*.66);body.quadraticCurveTo(L*.42,bh*.66,L*.5,0);body.closePath();
 const wing=new Path2D(),tail=new Path2D();
 for(const s of[-1,1]){wing.moveTo(L*.16,s*bh*.4);wing.lineTo(-L*(.04+sw),s*W*.94);wing.lineTo(-L*(.22+sw),s*W*.94);wing.lineTo(-L*.22,s*bh*.4);wing.closePath();
  tail.moveTo(-L*.36,s*bh*.2);tail.lineTo(-L*(.48+sw*.4),s*T*1.05);tail.lineTo(-L*(.55+sw*.4),s*T*1.05);tail.lineTo(-L*.52,s*bh*.14);tail.closePath();}
 PP=PLPATH[def.id]={body,wing,tail};}
 const{body,wing,tail}=PP;
 const rw=Math.max(3,bh*.5);
 if(o.shadow){const all=new Path2D();all.addPath(wing);all.addPath(tail);all.addPath(body);c.fillStyle='rgba(30,52,92,.17)';c.fill(all);c.restore();return;}
 if(o.flame>0&&sh.jet){const fl=(12+o.flame*30)*(1+Math.sin(t*34)*.08),g=c.createLinearGradient(-L*.5,0,-L*.5-fl,0);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.35,'rgba(255,196,110,.85)');g.addColorStop(1,'rgba(255,110,60,0)');c.fillStyle=g;c.beginPath();c.moveTo(-L*.5,-bh*.24);c.quadraticCurveTo(-L*.5-fl*.7,-bh*.2,-L*.5-fl,0);c.quadraticCurveTo(-L*.5-fl*.7,bh*.2,-L*.5,bh*.24);c.fill();}
 /* cola y alas con puntas redondeadas */
 c.lineWidth=rw;c.fillStyle=c.strokeStyle=shade(S,-.1);c.fill(tail);c.stroke(tail);
 {const g=c.createLinearGradient(L*.16,0,-L*.26,0);g.addColorStop(0,shade(S,.3));g.addColorStop(1,shade(S,-.06));c.fillStyle=c.strokeStyle=g;c.fill(wing);c.stroke(wing);}
 c.save();c.clip(wing);planePattern(c,def,look);c.restore();
 /* barrita de color del ala: va debajo de las góndolas de motor y del fuselaje */
 c.strokeStyle=shade(A,0);c.globalAlpha*=.9;c.lineWidth=Math.max(1.4,bh*.14);c.beginPath();for(const s of[-1,1]){{const x1=-L*(.03+sw),t0=.3*bh/(.92*W-.42*bh);c.moveTo(L*.14+(x1-L*.14)*t0,s*bh*.72);c.lineTo(x1,s*W*.92);}}c.stroke();c.globalAlpha=o.alpha===undefined?1:o.alpha;
 if(sh.twin){for(const s of[-1,1]){const g=c.createLinearGradient(0,s*W*.46-bh*.3,0,s*W*.46+bh*.3);g.addColorStop(0,shade(S,.1));g.addColorStop(1,shade(S,-.3));c.fillStyle=g;c.beginPath();c.ellipse(L*.0,s*W*.46,L*.17,bh*.32,0,0,TAU);c.fill();}}
 {const g=c.createLinearGradient(0,-bh*.66,0,bh*.66);g.addColorStop(0,shade(P,.38));g.addColorStop(.5,P);g.addColorStop(1,shade(P,-.18));c.fillStyle=g;c.fill(body);}
 /* brillo suave del fuselaje */
 c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.ellipse(-L*.02,-bh*.3,L*.3,bh*.12,0,0,TAU);c.fill();
 /* cabina */
 {const g=c.createLinearGradient(0,-bh*.32,0,bh*.32);g.addColorStop(0,'#f2fdff');g.addColorStop(1,'#7ccaf0');c.fillStyle=g;c.beginPath();c.ellipse(L*.14,0,L*.1,bh*.33,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.ellipse(L*.16,-bh*.1,L*.04,bh*.09,0,0,TAU);c.fill();}
 if(sh.jet){c.fillStyle='#3a4256';c.beginPath();c.roundRect?c.roundRect(-L*.53,-bh*.24,L*.07,bh*.48,bh*.1):c.rect(-L*.53,-bh*.24,L*.07,bh*.48);c.fill();}
 else{const a=t*40;c.fillStyle=shade(S,-.05);c.beginPath();c.arc(L*.5,0,bh*.26,0,TAU);c.fill();const g=c.createRadialGradient(L*.54,0,0,L*.54,0,bh*1.3);g.addColorStop(0,'rgba(255,255,255,.34)');g.addColorStop(1,'rgba(255,255,255,.08)');c.fillStyle=g;c.beginPath();c.arc(L*.54,0,bh*1.3,0,TAU);c.fill();c.strokeStyle='rgba(40,56,90,.45)';c.lineWidth=2.2;c.beginPath();c.moveTo(L*.54+Math.cos(a)*0,Math.sin(a)*bh*1.25);c.lineTo(L*.54,-Math.sin(a)*bh*1.25);c.stroke();}
 const st=look.sticker;if(st&&st!=='none'){const cxw=-L*(.08+sw/2),cyw=bh*.2+W*.47,chord=L*(.28+sw/2),span=W*.94-bh*.4,sr=Math.max(3.5,Math.min(chord*.4,span*.34,bh*.62));for(const s of[-1,1]){c.save();c.translate(cxw,s*cyw);c.rotate(Math.PI/2);sticker(c,st,sr,A,S);c.restore();}}
 planeAcc(c,look,L,bh,W,A,t,sw);
 c.restore();}

