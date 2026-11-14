'use strict';
/* ===== Tormenta fuera del mapa (fija, no se cierra) ===== */
const sStorm=i=>mkSpr('storm'+i,300,300,(x)=>{const r=mulberry(i*53+11);
 for(let k=0;k<9;k++){const a=r()*TAU,d=r()*50,rad=70+r()*30,px=Math.cos(a)*d,py=Math.sin(a)*d,t=r();const g=x.createRadialGradient(px-rad*.2,py-rad*.25,rad*.1,px,py,rad);
  g.addColorStop(0,'rgba(128,110,172,.95)');g.addColorStop(.55,'rgba('+Math.round(72+t*30)+','+Math.round(56+t*20)+','+Math.round(104+t*30)+',.82)');g.addColorStop(1,'rgba(40,30,72,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,rad,0,TAU);x.fill();}});
const _sh=(i,j,k)=>{let h=Math.imul((i*374761393)^(j*668265263)^(k*2147483647),1274126177);h^=h>>>13;h=Math.imul(h,1103515245);return((h^h>>>16)>>>0)/4294967296;};
/* borde irregular de la tormenta (fijo, no se cierra) */
function stormOff(u,k){return 220+130*Math.sin(u/2600*TAU+k*1.7)+70*Math.sin(u/1100*TAU+k*3.1)+40*Math.sin(u/450*TAU+k*5.3);}
function stormDepth(x,y){const W=World.w,H=World.h;return -Math.min(x-stormOff(y,0),W-stormOff(y,1)-x,y-stormOff(x,2),H-stormOff(x,3)-y);}
function stormPoly(){const W=World.w,H=World.h;if(World._sp&&World._sp.w===W&&World._sp.h===H)return World._sp;const st=100,pts=[];
 for(let y=0;y<=H;y+=st)pts.push([stormOff(y,0),y]);
 for(let x=0;x<=W;x+=st)pts.push([x,H-stormOff(x,3)]);
 for(let y=H;y>=0;y-=st)pts.push([W-stormOff(y,1),y]);
 for(let x=W;x>=0;x-=st)pts.push([x,stormOff(x,2)]);
 const safe=new Path2D();pts.forEach((p,i)=>i?safe.lineTo(p[0],p[1]):safe.moveTo(p[0],p[1]));safe.closePath();
 const out=new Path2D();out.rect(-2e5,-2e5,4e5,4e5);out.addPath(safe);
 return World._sp={w:W,h:H,safe,out};}
function drawStorm(c,v,front){const W=World.w,H=World.h,T=M.t,x0=v.x0-60,y0=v.y0-60,x1=v.x1+60,y1=v.y1+60,sp0=stormPoly();
 const inside=x0>470&&y0>470&&x1<W-470&&y1<H-470;
 if(inside&&(front||(x0>1150&&y0>1150&&x1<W-1150&&y1<H-1150)))return;
 if(!inside){c.save();c.clip(sp0.out,'evenodd');
  if(!front){c.fillStyle='#1f1634';c.fillRect(x0,y0,x1-x0,y1-y0);}
  const layers=front?[[340,440,.34,.05,3]]:[[380,780,1,.03,0],[300,600,.9,-.045,1],[240,460,.75,.07,2]];
  for(const[cell,sz,al,sp,li]of layers){const i0=Math.floor(x0/cell)-1,i1=Math.ceil(x1/cell)+1,j0=Math.floor(y0/cell)-1,j1=Math.ceil(y1/cell)+1;
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const h1=_sh(i,j,li*7+1),h2=_sh(i,j,li*7+2),h3=_sh(i,j,li*7+3);
    const x=(i+.5)*cell+(h1-.5)*cell*.9+Math.sin(T*sp*3+h3*6.28)*50,y=(j+.5)*cell+(h2-.5)*cell*.9+Math.cos(T*sp*2.4+h1*6.28)*40;
    if(stormDepth(x,y)<-sz*.35)continue;
    c.globalAlpha=al*(.8+.2*h3);c.save();c.translate(x,y);c.rotate(h1*6.28+T*sp);c.drawImage(sStorm(Math.floor(h2*4)),-sz/2,-sz/2,sz,sz);c.restore();}}
  c.globalAlpha=1;
  if(!front){const ph=T*.42,sd=Math.floor(ph),f=ph-sd;
   if(f<.12){const fl=1-f/.12;c.fillStyle='rgba(190,160,255,'+(.3*fl)+')';c.fillRect(x0,y0,x1-x0,y1-y0);
    for(let k=0;k<12;k++){const px=x0+_sh(sd,k,40)*(x1-x0),py=y0+_sh(sd,k,41)*(y1-y0);if(stormDepth(px,py)<=0)continue;
     c.lineJoin='round';c.beginPath();let bx=px,by=py;c.moveTo(bx,by);for(let q=0;q<9;q++){bx+=(_sh(sd,k,50+q)-.5)*90;by+=60+_sh(sd,k,70+q)*60;c.lineTo(bx,by);}
     c.strokeStyle='rgba(180,140,255,'+(.35*fl)+')';c.lineWidth=16;c.stroke();c.strokeStyle='rgba(245,238,255,'+(.95*fl)+')';c.lineWidth=4;c.stroke();break;}}}
  c.restore();}
 if(!front){const pul=.8+.15*Math.sin(T*.8);c.save();c.clip(sp0.safe);c.lineJoin='round';
  for(const[w,a]of[[1300,.07],[900,.09],[560,.11],[260,.13]]){c.strokeStyle='rgba(110,70,190,'+(a*pul)+')';c.lineWidth=w;c.stroke(sp0.safe);}
  c.restore();c.lineJoin='round';c.strokeStyle='rgba(205,170,255,'+(.5+.2*Math.sin(T*3))+')';c.lineWidth=8;c.stroke(sp0.safe);}}
function drawWorld(c,def,v){
 drawTerrainSoft(c,def,v);
 drawActors(c,def,v);if(!def.closed)drawStorm(c,v,true);}
/* ★ CAJAS #2 — drawSupplyCrate(c,k): dibuja UNA caja de recompensa flotante 'k' (reparación, munición, escudo, daño ×2 o energía).
   Antes era un disco redondo con un símbolo; ahora es una caja de suministros 3D:
     · sombra proyectada en el suelo que se aleja y se agranda cuando la caja sube (sensación de que flota);
     · cuerpo con 5 capas extruidas en oscuro (los costados), igual que las demás cajas del juego;
     · tapa con degradado del color del tipo (claro arriba-izquierda, oscuro abajo-derecha) y borde definido;
     · cintas cruzadas, cuatro esquineros metálicos con remache y una etiqueta blanca con el símbolo del contenido;
     · el halo luminoso se mantiene para que se vea de lejos, y un cabeceo suave refuerza que va en el aire.
   El tamaño visible (≈ 40 px) es parecido al del disco anterior, y el radio de recogida (42 px) no cambia.
   Se dibuja con coordenadas del mundo: el llamador ya aplicó el desplazamiento de paralaje (lift). */
function drawSupplyCrate(c,k){
 const pc=PKC[k.k]||PKC.rep;                    /* pc[0] = color oscuro, pc[1] = color claro del tipo de caja */
 const bob=Math.sin(k.t*3)*5;                   /* subida y bajada (mismo vaivén de 5 px que tenía el disco) */
 const cx=k.x,cy=k.y+bob;                       /* centro de la caja en el mundo */
 const S=20;                                    /* semilado de la caja (mitad de su anchura) */
 const tilt=Math.sin(k.t*1.7+k.x*.01)*.07;      /* cabeceo suave en radianes (≈ ±4°); la fase depende de x para que no cabeceen todas a la vez */
 const rise=(bob+5)/10;                         /* 0 = en lo más bajo … 1 = en lo más alto del vaivén */
 const rr=(x,y,w,h,r)=>{c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}; /* rectángulo redondeado (con alternativa para navegadores antiguos) */

 /* 1) Halo luminoso (como el original, pero centrado en la caja). */
 c.globalCompositeOperation='lighter';c.fillStyle=pc[1]+'44';
 c.beginPath();c.arc(cx,cy,34+Math.sin(k.t*5)*3,0,TAU);c.fill();
 c.globalCompositeOperation='source-over';

 /* 2) Sombra en el suelo: se desplaza más y se aclara cuanto más alta está la caja. */
 c.save();c.translate(k.x+11+4*rise,k.y+17+5*rise);c.rotate(tilt);
 rr(-S,-S,S*2,S*2,5);c.fillStyle='rgba(30,50,90,'+(.24-.07*rise)+')';c.fill();c.restore();

 /* 3) Costados: 5 capas desde la base hasta la altura de la tapa (offset total −3,5 / −6 px = hacia arriba-izquierda). */
 const TX=-3.5,TY=-6,N=5;
 for(let i=0;i<N;i++){const f=i/N;
  c.save();c.translate(cx+TX*f,cy+TY*f);c.rotate(tilt);
  rr(-S,-S,S*2,S*2,4);c.fillStyle=shade(pc[0],-.45+.2*f);c.fill();c.restore();}

 /* 4) Tapa de la caja (todo lo siguiente se dibuja en su sistema de coordenadas: origen en el centro de la tapa). */
 c.save();c.translate(cx+TX,cy+TY);c.rotate(tilt);
 const g=c.createLinearGradient(-S,-S,S,S);     /* degradado: luz arriba-izquierda, sombra abajo-derecha */
 g.addColorStop(0,shade(pc[1],.35));g.addColorStop(.55,pc[1]);g.addColorStop(1,shade(pc[0],-.05));
 rr(-S,-S,S*2,S*2,4);c.fillStyle=g;c.fill();
 c.strokeStyle=shade(pc[0],-.55);c.lineWidth=2.5;c.stroke();                       /* borde oscuro definido */
 c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1.5;                              /* bisel de luz: bordes superior e izquierdo */
 c.beginPath();c.moveTo(-S+3,S-5);c.lineTo(-S+3,-S+3);c.lineTo(S-5,-S+3);c.stroke();
 c.strokeStyle='rgba(0,0,0,.28)';                                                   /* bisel de sombra: bordes inferior y derecho */
 c.beginPath();c.moveTo(-S+5,S-3);c.lineTo(S-3,S-3);c.lineTo(S-3,-S+5);c.stroke();
 c.fillStyle='rgba(255,255,255,.32)';c.fillRect(-2.5,-S+1,5,S*2-2);c.fillRect(-S+1,-2.5,S*2-2,5); /* cintas de embalaje cruzadas */
 c.fillStyle='rgba(0,0,0,.18)';c.fillRect(2.5,-S+1,1,S*2-2);c.fillRect(-S+1,2.5,S*2-2,1);         /* sombra de las cintas (da relieve) */
 for(const sx of[-1,1])for(const sy of[-1,1]){                                      /* esquineros metálicos con remache */
  const qx=sx*(S-4),qy=sy*(S-4);
  c.fillStyle='#cfd6df';c.fillRect(qx-4,qy-4,8,8);c.strokeStyle='#4c5360';c.lineWidth=1;c.strokeRect(qx-4,qy-4,8,8);
  c.fillStyle='#4c5360';c.beginPath();c.arc(qx,qy,1.3,0,TAU);c.fill();}
 /* 5) Etiqueta blanca central con el símbolo del contenido, en el color oscuro del tipo para que contraste. */
 rr(-10.5,-10.5,21,21,3);c.fillStyle='#f6f3e8';c.fill();c.strokeStyle=shade(pc[0],-.3);c.lineWidth=1.5;c.stroke();
 c.fillStyle=pc[0];c.strokeStyle=pc[0];
 if(k.k==='rep'){c.fillRect(-2.5,-7.5,5,15);c.fillRect(-7.5,-2.5,15,5);}           /* reparación: cruz */
 else if(k.k==='mun'){c.fillRect(-6.5,-6,3,12);c.fillRect(-1.5,-6,3,12);c.fillRect(3.5,-6,3,12);} /* munición: tres balas */
 else if(k.k==='esc'){c.lineWidth=2.4;c.beginPath();c.arc(0,0,7,Math.PI*.15,Math.PI*.85,true);c.stroke(); /* escudo: arco + punta */
  c.beginPath();c.moveTo(-6.3,-1.4);c.lineTo(0,7.7);c.lineTo(6.3,-1.4);c.closePath();c.fill();}
 else if(k.k==='dmg'){c.font='900 14px "Big Shoulders Display",Impact,sans-serif';c.textAlign='center';c.fillText('x2',0,5);} /* daño ×2: texto */
 else{c.beginPath();c.moveTo(2,-8);c.lineTo(-5.5,1.4);c.lineTo(-.7,1.4);c.lineTo(-2,8);c.lineTo(5.5,-2);c.lineTo(.7,-2);c.closePath();c.fill();} /* energía: rayo */
 c.restore();
}
function drawActors(c,def,v){
 for(const g of World.rings){if(g.x<v.x0||g.x>v.x1||g.y<v.y0||g.y>v.y1)continue;const ready=g.cd<=0,pul=1+Math.sin(M.t*4+g.x)*.05;c.save();{const lo=lift(g.x,g.y,.03);c.translate(lo[0],lo[1]);}c.globalAlpha=ready?1:.25;c.strokeStyle='#7ff6ff';c.lineWidth=7;c.beginPath();c.arc(g.x,g.y,g.r*pul,0,TAU);c.stroke();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(127,246,255,.35)';c.lineWidth=20;c.beginPath();c.arc(g.x,g.y,g.r*pul,0,TAU);c.stroke();c.globalCompositeOperation='source-over';c.strokeStyle='#fff';c.lineWidth=2;c.setLineDash([10,14]);c.lineDashOffset=-M.t*30;c.beginPath();c.arc(g.x,g.y,g.r*.7,0,TAU);c.stroke();c.setLineDash([]);c.globalAlpha=1;c.restore();}
 for(const st of World.storms){const ph=st.ph||0,ch=ph/3.8;{const g=c.createRadialGradient(st.x,st.y,st.r*.1,st.x,st.y,st.r);g.addColorStop(0,'rgba(100,112,190,.6)');g.addColorStop(1,'rgba(100,112,190,0)');c.fillStyle=g;c.beginPath();c.arc(st.x,st.y,st.r,0,TAU);c.fill();}
  c.strokeStyle=ph>3.2&&ph<3.8?(Math.floor(M.t*14)%2?'#ffffff':'#ffd93d'):'rgba(150,170,255,.55)';c.lineWidth=ph>3.2?6:3;c.setLineDash([14,10]);c.beginPath();c.arc(st.x,st.y,st.r*(.55+.45*Math.min(1,ch)),0,TAU);c.stroke();c.setLineDash([]);}
 /* ★ CAJAS #2 — antes cada recompensa era un disco con un símbolo; ahora se delega en drawSupplyCrate() (caja 3D).
    Se conservan tal cual dos cosas: el parpadeo de los últimos 5 s antes de que la caja caduque y el desplazamiento
    de paralaje (lift) que da profundidad al mapa. */
 for(const k of M.picks){
  if(k.exp&&M.t>k.exp-5&&Math.floor(M.t*8)%2)continue;                 /* parpadeo antes de caducar (cajas que suelta un avión derribado) */
  c.save();{const lo=lift(k.x,k.y,.03);c.translate(lo[0],lo[1]);}     /* paralaje: la caja se desplaza ligeramente según la cámara */
  drawSupplyCrate(c,k);
  c.restore();}
 for(const p of M.parts){const a=clamp(p.l/p.m,0,1);
  if(p.k==='c'){c.globalAlpha=a*.7;c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,p.s,0,TAU);c.fill();}
  else if(p.k==='f'){c.globalCompositeOperation='lighter';c.globalAlpha=a*.85;c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,p.s*(.5+.5*a),0,TAU);c.fill();c.globalCompositeOperation='source-over';}
  else if(p.k==='l'){c.globalAlpha=a;c.strokeStyle=p.c;c.lineWidth=p.s;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*.04,p.y-p.vy*.04);c.stroke();}
  else if(p.k==='g'){c.globalCompositeOperation='lighter';const gg=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s);gg.addColorStop(0,'rgba(255,230,170,'+(a*.9)+')');gg.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=gg;c.globalAlpha=1;c.beginPath();c.arc(p.x,p.y,p.s,0,TAU);c.fill();c.globalCompositeOperation='source-over';}
  else if(p.k==='x'){softBoom(c,p,a);}
  else if(p.k==='fx'){c.globalAlpha=1;fxDraw(c,p.id,p.x,p.y,p.R,1-p.l/p.m);}
  else if(p.k==='r'){c.globalAlpha=a;c.strokeStyle=p.c;c.lineWidth=p.lw*a;c.beginPath();c.arc(p.x,p.y,p.s,0,TAU);c.stroke();}
  else if(p.k==='q'){c.globalAlpha=a;c.fillStyle=p.c;c.save();c.translate(p.x,p.y);c.rotate(p.l*8);c.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);c.restore();}
  else if(p.k==='o'){c.globalAlpha=a*.8;c.strokeStyle=p.c;c.lineWidth=1.2;c.beginPath();c.arc(p.x,p.y,p.s,0,TAU);c.stroke();}}
 c.globalAlpha=1;
 c.lineCap='round';c.globalCompositeOperation='lighter';c.globalAlpha=.3;for(const b of M.bul){c.strokeStyle=b.col;c.lineWidth=b.w*3.4;c.beginPath();{const o=lift(b.x,b.y,LA);c.moveTo(b.x-b.vx*.02+o[0],b.y-b.vy*.02+o[1]);c.lineTo(b.x+o[0],b.y+o[1]);}c.stroke();}c.globalCompositeOperation='source-over';c.globalAlpha=1;
 for(const b of M.bul){c.strokeStyle=b.col;c.lineWidth=b.w;{const o=lift(b.x,b.y,LA);c.beginPath();c.moveTo(b.x-b.vx*.026+o[0],b.y-b.vy*.026+o[1]);c.lineTo(b.x+o[0],b.y+o[1]);c.stroke();c.strokeStyle='#fff';c.lineWidth=b.w*.4;c.beginPath();c.moveTo(b.x-b.vx*.01+o[0],b.y-b.vy*.01+o[1]);c.lineTo(b.x+o[0],b.y+o[1]);c.stroke();}}c.lineCap='butt';
 for(const m of M.mis){c.save();{const lo=lift(m.x,m.y,LA);c.translate(m.x+lo[0],m.y+lo[1]);}c.rotate(m.ang);c.fillStyle='#f1f3f8';c.beginPath();c.roundRect?c.roundRect(-9,-3,18,6,3):c.rect(-9,-3,18,6);c.fill();c.fillStyle='#ff5a5a';c.beginPath();c.arc(8,0,3.2,0,TAU);c.fill();
  c.fillStyle='#ffb040';c.beginPath();c.moveTo(-9,-2);c.lineTo(-18-Math.random()*8,0);c.lineTo(-9,2);c.fill();c.restore();}
 for(const b of M.bombs){c.fillStyle='#4a566f';c.beginPath();c.arc(b.x,b.y,8,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(b.x-2,b.y-3,3,0,TAU);c.fill();c.fillStyle=Math.floor(M.t*10)%2?'#ff4d5e':'#552';c.beginPath();c.arc(b.x+4,b.y-7,2.2,0,TAU);c.fill();}
 for(const p of M.planes){if(!p.alive)continue;let al=1;if(p.cloak>0)al=p===M.pl?.45:.2;if(p.inv>0&&Math.floor(M.t*14)%2&&!(M.tut&&p.isPlayer))al*=.45;
  const rl=p.rollT>0?Math.cos((1-p.rollT/(p.rollD||.75))*TAU*(p.tonel?2:1)):1;
  const lk=teamLook(p);
  drawPlane(c,p.def,lk,{x:p.x+13,y:p.y+19,ang:p.ang,roll:rl,alpha:al,shadow:true});
  if(p.ghost)al=Math.min(al,.62);
  const pl2=lift(p.x,p.y,LA);c.save();c.translate(pl2[0],pl2[1]);
  if(p.tr&&p.tr.length>1&&p.cloak<=0&&near(p)){c.globalAlpha=al;trailPts(c,lk.trail,p.tr,M.t,2.1);c.globalAlpha=1;}
  drawPlane(c,p.def,lk,{x:p.x,y:p.y,ang:p.ang,roll:rl,alpha:al,flame:p.boosting?1:.35,t:M.t+p.x*.001});
  if(p.ghost){c.strokeStyle='rgba(155,231,255,'+(.45+.25*Math.sin(M.t*8))+')';c.lineWidth=3;c.setLineDash([10,8]);c.beginPath();c.arc(p.x,p.y,34,0,TAU);c.stroke();c.setLineDash([]);}
  if(p.flash>0){c.fillStyle='rgba(255,255,255,'+p.flash*3+')';c.beginPath();c.arc(p.x,p.y,20,0,TAU);c.fill();}
  if(p.shield>0){c.strokeStyle='#9be7ff';c.fillStyle='rgba(155,231,255,.15)';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,40,0,TAU);c.fill();c.stroke();}
  if((!p.isPlayer||p!==M.pl)&&p.cloak<=0){c.font='600 13px "IBM Plex Mono",monospace';c.textAlign='center';c.fillStyle='rgba(235,231,218,.9)';c.fillText(p.name,p.x,p.y-46);c.fillStyle='#0008';c.fillRect(p.x-18,p.y-42,36,4);c.fillStyle=p.hp/p.maxHp>.35?'#5bd67d':'#ff4d5e';c.fillRect(p.x-18,p.y-42,36*p.hp/p.maxHp,4);}
  c.restore();}
 drawWrecks(c,v);
 const oc=OVCOL[def.id]||'#aaa';
 c.save();c.translate(30,44);c.fillStyle='rgba(0,0,0,.25)';for(const o of World.over){if(!inView(o.bb,v))continue;poly(c,o.poly);c.fill();}c.restore();
 for(const o of World.over){if(!inView(o.bb,v))continue;const lo=lift((o.bb.x0+o.bb.x1)/2,(o.bb.y0+o.bb.y1)/2,.05),ox=lo[0]-2,oy=lo[1]-4;
  for(let i=0;i<8;i++){c.save();c.translate(ox*i/8,oy*i/8);poly(c,o.poly);c.fillStyle='#b2bad4';c.fill();c.lineJoin='round';c.strokeStyle='#b2bad4';c.lineWidth=8;c.stroke();c.restore();}
  c.save();c.translate(ox,oy);poly(c,o.poly);c.fillStyle='#e4e8f2';c.fill();c.strokeStyle='rgba(255,255,255,.7)';c.lineJoin='round';c.lineWidth=8;c.stroke();
  const b=o.bb,horiz=(b.x1-b.x0)>(b.y1-b.y0);c.strokeStyle='rgba(80,92,130,.22)';c.lineWidth=2;c.beginPath();
  if(horiz){for(let x=b.x0+30;x<b.x1;x+=60){c.moveTo(x,b.y0);c.lineTo(x,b.y1);}}else{for(let y=b.y0+30;y<b.y1;y+=60){c.moveTo(b.x0,y);c.lineTo(b.x1,y);}}c.stroke();c.restore();}
 for(const b of M.bolts){c.strokeStyle='rgba(255,255,255,'+Math.min(1,b.t*5)+')';c.fillStyle='rgba(200,215,255,'+Math.min(.5,b.t*2)+')';c.beginPath();c.arc(b.x,b.y,250,0,TAU);c.fill();c.lineWidth=6;c.shadowColor='#9bb4ff';c.shadowBlur=24;c.beginPath();c.arc(b.x,b.y,120+(.35-b.t)*500,0,TAU);c.stroke();c.shadowBlur=0;}}
function bar(c,x,y,w,h,f,col,label){c.fillStyle='rgba(6,12,22,.7)';c.fillRect(x,y,w,h);c.fillStyle=col;c.fillRect(x+1,y+1,Math.max(0,(w-2)*clamp(f,0,1)),h-2);if(label){c.fillStyle='#fff';c.font='600 11px "IBM Plex Mono",monospace';c.textAlign='left';c.fillText(label,x+5,y+h-4);}}
