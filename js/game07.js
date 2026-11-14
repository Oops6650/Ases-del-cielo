'use strict';
/* ===== Piezas de dibujo compartidas de los aviones ===== */
const SPR={ready:false,expl:[],flames:[],fx:{},clouds:[],decor:null,ground:null,storm:null,turret:null};
function planePattern(c,def,look){const sh=def.shape,L=sh.len,bh=sh.bh*1.1,W=sh.wing*1.25,col=paintOf(look.paint),P=col[0],S=col[1],A=col[2],pt=look.pattern;if(!pt||pt==='none')return;
 /* solo en las alas: caja que cubre todo el ala (el recorte a la silueta lo hace quien llama) */
 const sw=sh.jet?.2:.03,X0=-L*(.25+sw),X1=L*.18,Y0=bh*.3,Y1=W*1.1,XW=X1-X0,YH=Y1-Y0,dk=shade(A,-.5);
 const R=(x,ya,w,h,s)=>c.fillRect(x,s>0?ya:-ya-h,w,h);
 c.lineJoin='round';c.lineCap='butt';
 if(pt==='rayas'){const n=6,gap=YH/n;c.fillStyle=A;for(const s of[-1,1])for(let i=0;i<n;i++)R(X0,Y0+gap*(i+.22),XW,gap*.52,s);}
 else if(pt==='flechas'){c.strokeStyle=A;const m=8;for(const s of[-1,1])for(const[am,w]of[[.45,.16],[.25,.09]]){c.lineWidth=Math.max(1.4,bh*w);c.beginPath();for(let i=0;i<=m;i++){const y=s*(Y0+YH*i/m),x=X0+XW*(.5+(i%2?am:-am));i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}
 else if(pt==='dientes'){const cols=4,rows=7,cw=XW/cols,ch=YH/rows;for(const s of[-1,1]){c.fillStyle=A;R(X0,Y0,XW,YH,s);c.strokeStyle=dk;c.lineWidth=Math.max(1,bh*.05);c.beginPath();for(let j=0;j<=rows;j++){c.moveTo(X0,s*(Y0+j*ch));c.lineTo(X1,s*(Y0+j*ch));}for(let i=0;i<=cols;i++){c.moveTo(X0+i*cw,s*Y0);c.lineTo(X0+i*cw,s*Y1);}c.stroke();c.fillStyle=dk;for(const[i,j]of[[0,1],[2,2],[3,0],[1,3],[2,5],[0,6],[3,4]])R(X0+i*cw+cw*.18,Y0+j*ch+ch*.18,cw*.64,ch*.64,s);}}
 else if(pt==='filetes'){const wg=new Path2D();for(const s of[-1,1]){wg.moveTo(L*.16,s*bh*.4);wg.lineTo(-L*(.04+sw),s*W*.94);wg.lineTo(-L*(.22+sw),s*W*.94);wg.lineTo(-L*.22,s*bh*.4);wg.closePath();}c.strokeStyle=A;c.lineWidth=bh*1.1;c.stroke(wg);c.strokeStyle=S;c.lineWidth=bh*.55;c.stroke(wg);}
 else if(pt==='camu'){const r=mulberry(hashStr(def.id));c.fillStyle=A;for(const s of[-1,1])for(let i=0;i<7;i++){const cx=X0+r()*XW,cy=s*(Y0+r()*YH),rad=XW*(.13+r()*.15),n=4+(r()*3|0),ph=r()*3;c.beginPath();for(let k=0;k<n;k++){const a=k/n*TAU+ph+r()*.5,q=rad*(.55+r()*.7);const x=cx+Math.cos(a)*q,y=cy+Math.sin(a)*q*.9;k?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fill();}}
 else if(pt==='tablero'){const cols=5,cw=XW/cols,rows=Math.max(3,Math.round(YH/cw)),ch=YH/rows;for(const s of[-1,1])for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){c.fillStyle=(i+j)%2?A:'#f4f1e6';R(X0+i*cw,Y0+j*ch,cw+.5,ch+.5,s);}}
 else if(pt==='bicolor'){const sz=Math.max(5,bh*.5);for(const s of[-1,1]){const g=c.createLinearGradient(0,s*Y0,0,s*Y1);g.addColorStop(0,A+'66');g.addColorStop(1,A);c.fillStyle=g;R(X0,Y0,XW,YH,s);}
  c.strokeStyle=dk;c.lineWidth=Math.max(.8,bh*.045);c.globalAlpha*=.75;c.beginPath();for(const s of[-1,1])for(let r=0;Y0+r*sz*.55<Y1;r++){const y=s*(Y0+r*sz*.55);for(let x=X0+(r%2)*sz/2;x<X1+sz;x+=sz){c.moveTo(x+sz/2,y);c.arc(x,y,sz/2,0,Math.PI,s<0);}}c.stroke();c.globalAlpha/=.75;}
 else if(pt==='llamas'){const r=mulberry(hashStr('tg'+def.id));c.strokeStyle=A;c.lineCap='round';for(const s of[-1,1])for(let k=0;k<11;k++){const x0=X0+k*XW/10,jx=(r()-.5)*XW*.18;c.lineWidth=Math.max(1.5,bh*(.14+r()*.14));c.beginPath();c.moveTo(x0+XW*.08,s*Y0);c.quadraticCurveTo(x0+jx,s*(Y0+YH*.55),x0-XW*.12,s*Y1);c.stroke();}}
 else if(pt==='ondas'){c.strokeStyle=A;c.lineWidth=Math.max(1.3,bh*.12);c.lineCap='round';const rows=5;for(const s of[-1,1])for(let r=0;r<rows;r++){const y0=s*(Y0+YH*(r+.5)/rows);c.beginPath();for(let i=0;i<=16;i++){const x=X0+XW*i/16,y=y0+Math.sin(i*.9+r)*YH/rows*.28*s;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}
 else if(pt==='puntos'){c.fillStyle=A;const cols=5,rows=6,cw=XW/cols,ch=YH/rows,rad=Math.min(cw,ch)*.3;for(const s of[-1,1])for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){c.beginPath();c.arc(X0+(i+.5+(j%2?.5:0))*cw,s*(Y0+(j+.5)*ch),rad,0,TAU);c.fill();}}
 else if(pt==='rombos'){c.fillStyle=A;const cols=4,rows=5,cw=XW/cols,ch=YH/rows;for(const s of[-1,1])for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){if((i+j)%2)continue;const cx=X0+(i+.5)*cw,cy=s*(Y0+(j+.5)*ch);c.beginPath();c.moveTo(cx,cy-ch*.48);c.lineTo(cx+cw*.48,cy);c.lineTo(cx,cy+ch*.48);c.lineTo(cx-cw*.48,cy);c.closePath();c.fill();}}
 else if(pt==='cebra'){c.fillStyle=A;const n=7,w=XW/n;for(const s of[-1,1])for(let i=-1;i<n;i++){c.beginPath();c.moveTo(X0+i*w,s*Y0);c.lineTo(X0+i*w+w*.5,s*Y0);c.lineTo(X0+i*w+w*.5+YH*.35,s*Y1);c.lineTo(X0+i*w+YH*.35,s*Y1);c.closePath();c.fill();}}
 else if(pt==='hexa'){c.strokeStyle=A;c.lineWidth=Math.max(1,bh*.09);const hr=Math.max(5,XW/5.5);for(const s of[-1,1])for(let j=0;Y0+j*hr*1.5<Y1+hr;j++)for(let i=-1;X0+i*hr*1.73<X1+hr;i++){const cx=X0+i*hr*1.73+(j%2?hr*.865:0),cy=s*(Y0+j*hr*1.5);c.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+TAU/12,x=cx+Math.cos(a)*hr*.88,y=cy+Math.sin(a)*hr*.88;k?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.stroke();}}
 else if(pt==='estrellado'){const r=mulberry(hashStr('st'+def.id));c.fillStyle=A;for(const s of[-1,1])for(let i=0;i<9;i++)star(c,X0+r()*XW,s*(Y0+r()*YH),Math.max(2.4,bh*(.22+r()*.2)));}
 else if(pt==='circuito'){c.strokeStyle=A;c.fillStyle=A;c.lineWidth=Math.max(1,bh*.08);c.lineJoin='miter';const r=mulberry(hashStr('ci'+def.id));for(const s of[-1,1])for(let k=0;k<6;k++){let x=X0+r()*XW,y=s*(Y0+r()*YH);c.beginPath();c.moveTo(x,y);for(let m=0;m<3;m++){if(m%2)y+=s*(r()*YH*.3);else x+=(r()-.3)*XW*.35;c.lineTo(x,y);}c.stroke();c.beginPath();c.arc(x,y,Math.max(1.4,bh*.1),0,TAU);c.fill();}}
 else if(pt==='galones'){c.strokeStyle=A;c.lineWidth=Math.max(1.4,bh*.16);c.lineJoin='miter';c.lineCap='butt';for(const s of[-1,1])for(let i=0;i<5;i++){const y=s*(Y0+YH*(i+.35)/5);c.beginPath();c.moveTo(X0,y+s*YH*.12);c.lineTo(X0+XW*.55,y-s*YH*.04);c.lineTo(X1,y+s*YH*.12);c.stroke();}}
 else if(pt==='pixel'){const r=mulberry(hashStr('px'+def.id)),n=8,cw=XW/n,ch=YH/7;for(const s of[-1,1])for(let j=0;j<7;j++)for(let i=0;i<n;i++){const v=r();if(v<.55)continue;c.fillStyle=v>.85?dk:A;R(X0+i*cw,Y0+j*ch,cw+.4,ch+.4,s);}}
 else if(pt==='cristal'){const r=mulberry(hashStr('cr'+def.id));for(const s of[-1,1])for(let i=0;i<14;i++){const ax=X0+r()*XW,ay=s*(Y0+r()*YH),b=XW*(.14+r()*.16);c.fillStyle=i%3?A:dk;c.globalAlpha*=.8;c.beginPath();c.moveTo(ax,ay);c.lineTo(ax+b*(r()-.2),ay+s*b*(.4+r()*.8));c.lineTo(ax-b*(.5+r()*.6),ay+s*b*(r()*.7));c.closePath();c.fill();c.globalAlpha/=.8;}}
 else if(pt==='rafaga'){c.fillStyle=A;const ox=L*.12,rays=11;for(const s of[-1,1])for(let k=0;k<rays;k++){if(k%2)continue;const a0=(k/rays)*Math.PI*.95+.03,a1=a0+Math.PI*.95/rays;c.beginPath();c.moveTo(ox,s*bh*.4);c.lineTo(ox-Math.cos(a0)*XW*2,s*(bh*.4+Math.sin(a0)*YH*2.2));c.lineTo(ox-Math.cos(a1)*XW*2,s*(bh*.4+Math.sin(a1)*YH*2.2));c.closePath();c.fill();}}}
const WING_CACHE={};
/* Busca sobre la silueta del sprite un punto dentro del ala (y su radio libre) para pegar la pegatina */
function planeAcc(c,look,L,bh,W,A,t,sw){sw=sw||0;const ac=look.acc;
 if(ac==='bufanda'){c.strokeStyle=A;c.lineWidth=4;c.lineCap='round';c.beginPath();for(let i=0;i<9;i++){const x=L*.04-i*L*.07,y=Math.sin(t*10+i*.8)*(2+i*.9);i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.lineCap='butt';}
 else if(ac==='bandera'){c.fillStyle=A;c.strokeStyle='rgba(8,12,22,.6)';const fl=Math.max(1,bh/14);c.beginPath();c.moveTo(-L*.52,0);c.lineTo(-L*.52-16*fl,-6*fl+Math.sin(t*9)*3);c.lineTo(-L*.52-30*fl,Math.sin(t*9+1)*3);c.lineTo(-L*.52-16*fl,6*fl+Math.sin(t*9+2)*3);c.closePath();c.fill();c.stroke();}
 else if(ac==='luces'){const on=Math.sin(t*8)>0,tx=-L*(.13+sw),ty=W*.94,r=Math.max(2.6,bh*.15);
  for(const s of[-1,1]){const lit=(s<0)===on,col=TCOL||(s<0?'#ff3b3b':'#3dff7a'),dim=TCOL?'#1a1a1a':(s<0?'#5a1111':'#0f4d24');
   if(lit){const g=c.createRadialGradient(tx,s*ty,0,tx,s*ty,r*3.4);g.addColorStop(0,col+'aa');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.arc(tx,s*ty,r*3.4,0,TAU);c.fill();}
   c.fillStyle=lit?col:dim;c.beginPath();c.arc(tx,s*ty,r,0,TAU);c.fill();
   if(lit){c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(tx-r*.25,s*ty-r*.25,r*.36,0,TAU);c.fill();}}}
  else if(ac==='antena'){c.strokeStyle='#e8edf5';c.lineWidth=Math.max(1.6,bh*.09);c.lineCap='round';c.beginPath();c.moveTo(-L*.08,-bh*.04);c.lineTo(-L*.3,-bh*.5);c.stroke();c.fillStyle=(TCOL||'#ff4d5e');c.beginPath();c.arc(-L*.3,-bh*.5,Math.max(2.2,bh*.14),0,TAU);c.fill();}
 else if(ac==='aureola'){c.strokeStyle=(TCOL||'#ffd93d');c.lineWidth=2.4;c.shadowColor=(TCOL||'#ffd93d');c.shadowBlur=8;c.beginPath();c.ellipse(L*.12,0,bh*.95,bh*.95,0,0,TAU);c.stroke();c.shadowBlur=0;}
 else if(ac==='gafas'){c.fillStyle='#1b1f27';c.strokeStyle=(TCOL||'#ffd93d');c.lineWidth=1.4;for(const s of[-1,1]){c.beginPath();c.arc(L*.17,s*bh*.32,Math.max(2.2,bh*.26),0,TAU);c.fill();c.stroke();}c.fillStyle='#9be7ff88';for(const s of[-1,1]){c.beginPath();c.arc(L*.17-1,s*bh*.32-1,Math.max(1,bh*.1),0,TAU);c.fill();}c.beginPath();c.moveTo(L*.17,-bh*.06);c.lineTo(L*.17,bh*.06);c.stroke();}
 else if(ac==='cresta'){c.fillStyle=(TCOL||A);c.strokeStyle='rgba(8,12,22,.6)';c.lineWidth=1;c.beginPath();c.moveTo(L*.22,0);for(let i=0;i<5;i++){const x=L*.22-i*L*.1;c.lineTo(x-L*.025,-bh*.34);c.lineTo(x-L*.05,0);}c.closePath();c.fill();c.stroke();}
 else if(ac==='cuernos'){c.fillStyle='#f4f1e6';c.strokeStyle='rgba(8,12,22,.6)';c.lineWidth=1;for(const s of[-1,1]){c.beginPath();c.moveTo(L*.2,s*bh*.35);c.quadraticCurveTo(L*.3,s*bh*1.1,L*.42,s*bh*.95);c.quadraticCurveTo(L*.32,s*bh*.6,L*.27,s*bh*.35);c.closePath();c.fill();c.stroke();}}
 else if(ac==='pinchos'){c.fillStyle=(TCOL||'#c9d0d9');c.strokeStyle='rgba(8,12,22,.6)';c.lineWidth=1;for(const s of[-1,1])for(let i=0;i<3;i++){const x=L*(.02+i*.09);c.beginPath();c.moveTo(x,s*bh*.55);c.lineTo(x+L*.05,s*bh*1.05);c.lineTo(x+L*.08,s*bh*.55);c.closePath();c.fill();c.stroke();}}
 else if(ac==='orejas'){c.fillStyle=A;c.strokeStyle='rgba(8,12,22,.6)';c.lineWidth=1;for(const s of[-1,1]){c.beginPath();c.moveTo(L*.14,s*bh*.35);c.lineTo(L*.22,s*bh*1.1);c.lineTo(L*.3,s*bh*.4);c.closePath();c.fill();c.stroke();c.fillStyle='#ffb3c6';c.beginPath();c.moveTo(L*.17,s*bh*.45);c.lineTo(L*.22,s*bh*.88);c.lineTo(L*.27,s*bh*.48);c.closePath();c.fill();c.fillStyle=A;}}
 else if(ac==='puntas'){const tx=-L*(.13+sw),ty=W*.94,r=Math.max(2.4,bh*.14),cl=TCOL||'#7de0ff';for(const s of[-1,1]){const g=c.createRadialGradient(tx,s*ty,0,tx,s*ty,r*3.6);g.addColorStop(0,cl+'cc');g.addColorStop(1,cl+'00');c.fillStyle=g;c.beginPath();c.arc(tx,s*ty,r*3.6*(.85+.15*Math.sin(t*6)),0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(tx,s*ty,r*.7,0,TAU);c.fill();}}
 else if(ac==='coronita'){c.fillStyle=(TCOL||'#ffd93d');c.strokeStyle='rgba(8,12,22,.6)';c.lineWidth=1;const cx=L*.1,r=bh*.5;c.beginPath();c.moveTo(cx-r,r*.8);c.lineTo(cx-r,-r*.6);c.lineTo(cx-r*.5,-r*.05);c.lineTo(cx,-r);c.lineTo(cx+r*.5,-r*.05);c.lineTo(cx+r,-r*.6);c.lineTo(cx+r,r*.8);c.closePath();c.fill();c.stroke();}
 else if(ac==='nimbo'){const cl=TCOL||'#7de0ff';c.strokeStyle=cl;c.shadowColor=cl;c.shadowBlur=9;c.lineWidth=2;for(let k=0;k<2;k++){c.beginPath();c.ellipse(L*.05,0,bh*(1.5+k*.55),bh*(.8+k*.3),t*(k?-1.6:1.6),0,TAU*.78);c.stroke();}c.shadowBlur=0;}
 else if(ac==='cometas'){const cl=TCOL||'#ffd34d';for(let k=0;k<3;k++){const a=t*3+k*TAU/3,x=L*.05+Math.cos(a)*L*.3,y=Math.sin(a)*W*.55;c.fillStyle=cl+'55';c.beginPath();c.arc(x-Math.cos(a+1.57)*5,y-Math.sin(a+1.57)*5,3.3,0,TAU);c.fill();c.fillStyle=cl;c.beginPath();c.arc(x,y,Math.max(2.4,bh*.16),0,TAU);c.fill();}}
 else if(ac==='alado'){c.fillStyle='#ffffffdd';c.strokeStyle='rgba(8,12,22,.6)';c.lineWidth=1;const fl=Math.sin(t*7)*.12;for(const s of[-1,1]){c.beginPath();c.moveTo(-L*.02,s*bh*.4);for(let i=0;i<4;i++){c.lineTo(-L*(.02+i*.1),s*(bh*.9+i*bh*.55+fl*bh*5));c.lineTo(-L*(.07+i*.1),s*(bh*.7+i*bh*.45+fl*bh*5));}c.lineTo(-L*.4,s*bh*.4);c.closePath();c.fill();c.stroke();}}}
/* ===== Dibujo de aviones (vista cenital) ===== */
const _SHC=new Map();
function shade(hex,k){const key=hex+k,hit=_SHC.get(key);if(hit)return hit;const r=_shade(hex,k);if(_SHC.size>3000)_SHC.clear();_SHC.set(key,r);return r;}
function _shade(hex,k){const n=parseInt(hex.slice(1,7),16),r=n>>16,g=n>>8&255,b=n&255,t=k<0?0:255,f=Math.abs(k);return'rgb('+Math.round(r+(t-r)*f)+','+Math.round(g+(t-g)*f)+','+Math.round(b+(t-b)*f)+')';}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();c.fill();}
function sticker(c,st,sr,A,S){c.lineWidth=1;c.strokeStyle='rgba(8,12,22,.6)';
 if(st==='estrella'){c.fillStyle=(TCOL||(TCOL||'#ffd93d'));star(c,0,0,sr);}
 else if(st==='diana'){c.fillStyle=A;c.beginPath();c.arc(0,0,sr,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(0,0,sr*.65,0,TAU);c.fill();c.fillStyle=S;c.beginPath();c.arc(0,0,sr*.32,0,TAU);c.fill();}
 else if(st==='rayo'){c.fillStyle=(TCOL||'#ffd93d');c.beginPath();c.moveTo(sr*.3,-sr);c.lineTo(-sr*.6,sr*.1);c.lineTo(-sr*.05,sr*.1);c.lineTo(-sr*.3,sr);c.lineTo(sr*.6,-sr*.15);c.lineTo(sr*.05,-sr*.15);c.closePath();c.fill();c.stroke();}
 else if(st==='calavera'){c.fillStyle=(TCOL?A:'#f4f1e6');c.beginPath();c.arc(0,-sr*.1,sr*.8,0,TAU);c.fill();c.fillRect(-sr*.4,sr*.4,sr*.8,sr*.5);c.fillStyle='#1a1d25';c.beginPath();c.arc(-sr*.32,-sr*.15,sr*.22,0,TAU);c.arc(sr*.32,-sr*.15,sr*.22,0,TAU);c.fill();}
 else if(st==='corazon'){c.fillStyle=(TCOL||'#ff4d6d');c.beginPath();c.moveTo(0,sr*.8);c.bezierCurveTo(-sr*1.4,-sr*.2,-sr*.5,-sr,0,-sr*.35);c.bezierCurveTo(sr*.5,-sr,sr*1.4,-sr*.2,0,sr*.8);c.fill();}
 else if(st==='corona'){c.fillStyle=(TCOL||'#ffd93d');c.beginPath();c.moveTo(-sr,sr*.7);c.lineTo(-sr,-sr*.5);c.lineTo(-sr*.5,0);c.lineTo(0,-sr*.8);c.lineTo(sr*.5,0);c.lineTo(sr,-sr*.5);c.lineTo(sr,sr*.7);c.closePath();c.fill();c.stroke();}
 else if(st==='luna'){c.fillStyle=(TCOL||'#f4f1e6');c.beginPath();c.arc(0,0,sr*.9,0,TAU);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(sr*.45,-sr*.15,sr*.75,0,TAU);c.fill();c.globalCompositeOperation='source-over';}
 else if(st==='trebol'){c.fillStyle=(TCOL||'#3fbf5a');for(const[x,y]of[[0,-.45],[.45,0],[0,.45],[-.45,0]]){c.beginPath();c.arc(x*sr,y*sr,sr*.42,0,TAU);c.fill();}c.fillRect(-sr*.07,0,sr*.14,sr);}
 else if(st==='gota'){c.fillStyle=(TCOL||'#4cc3ff');c.beginPath();c.moveTo(0,-sr);c.quadraticCurveTo(sr*.95,sr*.15,0,sr*.95);c.quadraticCurveTo(-sr*.95,sr*.15,0,-sr);c.fill();c.stroke();}
 else if(st==='flecha'){c.fillStyle=(TCOL||A);c.beginPath();c.moveTo(sr,0);c.lineTo(0,-sr*.85);c.lineTo(0,-sr*.35);c.lineTo(-sr,-sr*.35);c.lineTo(-sr,sr*.35);c.lineTo(0,sr*.35);c.lineTo(0,sr*.85);c.closePath();c.fill();c.stroke();}
 else if(st==='cruz'){c.fillStyle=(TCOL||'#f4f1e6');c.beginPath();c.moveTo(-sr*.3,-sr);c.lineTo(sr*.3,-sr);c.lineTo(sr*.3,-sr*.3);c.lineTo(sr,-sr*.3);c.lineTo(sr,sr*.3);c.lineTo(sr*.3,sr*.3);c.lineTo(sr*.3,sr);c.lineTo(-sr*.3,sr);c.lineTo(-sr*.3,sr*.3);c.lineTo(-sr,sr*.3);c.lineTo(-sr,-sr*.3);c.lineTo(-sr*.3,-sr*.3);c.closePath();c.fill();c.stroke();c.fillStyle=A;c.beginPath();c.arc(0,0,sr*.2,0,TAU);c.fill();}
 else if(st==='escudo'){c.fillStyle=(TCOL||S);c.beginPath();c.moveTo(-sr*.8,-sr*.8);c.lineTo(sr*.8,-sr*.8);c.lineTo(sr*.8,sr*.1);c.quadraticCurveTo(sr*.7,sr*.7,0,sr);c.quadraticCurveTo(-sr*.7,sr*.7,-sr*.8,sr*.1);c.closePath();c.fill();c.stroke();c.fillStyle=A;star(c,0,-sr*.05,sr*.5);}
 else if(st==='sol'){c.fillStyle=(TCOL||'#ffc83d');for(let i=0;i<12;i++){const a=i/12*TAU;c.beginPath();c.moveTo(Math.cos(a-.14)*sr*.62,Math.sin(a-.14)*sr*.62);c.lineTo(Math.cos(a)*sr,Math.sin(a)*sr);c.lineTo(Math.cos(a+.14)*sr*.62,Math.sin(a+.14)*sr*.62);c.fill();}c.beginPath();c.arc(0,0,sr*.55,0,TAU);c.fill();c.stroke();}
 else if(st==='alas'){c.fillStyle=(TCOL||'#f4f1e6');for(const s of[-1,1]){c.beginPath();c.moveTo(s*sr*.15,sr*.4);c.quadraticCurveTo(s*sr*.5,-sr*.2,s*sr*1.0,-sr*.7);c.quadraticCurveTo(s*sr*.8,-sr*.1,s*sr*.9,sr*.1);c.quadraticCurveTo(s*sr*.6,sr*.05,s*sr*.7,sr*.4);c.quadraticCurveTo(s*sr*.4,sr*.3,s*sr*.45,sr*.7);c.closePath();c.fill();c.stroke();}c.fillStyle=A;c.beginPath();c.arc(0,sr*.1,sr*.2,0,TAU);c.fill();}
 else if(st==='diamante'){c.fillStyle=(TCOL||'#7de0ff');c.beginPath();c.moveTo(-sr*.6,-sr*.45);c.lineTo(sr*.6,-sr*.45);c.lineTo(sr,0);c.lineTo(0,sr);c.lineTo(-sr,0);c.closePath();c.fill();c.stroke();c.fillStyle='#ffffff88';c.beginPath();c.moveTo(-sr*.6,-sr*.45);c.lineTo(0,-sr*.45);c.lineTo(-sr*.3,0);c.lineTo(-sr,0);c.closePath();c.fill();}
 else if(st==='ojo'){c.fillStyle='#fff';c.beginPath();c.moveTo(-sr,0);c.quadraticCurveTo(0,-sr*1.1,sr,0);c.quadraticCurveTo(0,sr*1.1,-sr,0);c.fill();c.stroke();c.fillStyle=(TCOL||A);c.beginPath();c.arc(0,0,sr*.42,0,TAU);c.fill();c.fillStyle='#10131a';c.beginPath();c.arc(0,0,sr*.2,0,TAU);c.fill();}
 else if(st==='fuego'){c.fillStyle=(TCOL||'#ff7a2b');c.beginPath();c.moveTo(0,-sr);c.quadraticCurveTo(sr*.9,-sr*.1,sr*.55,sr*.55);c.quadraticCurveTo(0,sr*1.1,-sr*.55,sr*.55);c.quadraticCurveTo(-sr*.8,-sr*.1,0,-sr);c.fill();c.stroke();c.fillStyle=(TCOL?'#fff':'#ffe27a');c.beginPath();c.moveTo(0,-sr*.2);c.quadraticCurveTo(sr*.4,sr*.15,sr*.2,sr*.5);c.quadraticCurveTo(0,sr*.7,-sr*.2,sr*.5);c.quadraticCurveTo(-sr*.4,sr*.15,0,-sr*.2);c.fill();}
 else if(st==='copo'){c.strokeStyle=(TCOL||'#bfe9ff');c.lineWidth=Math.max(1.4,sr*.14);c.lineCap='round';for(let i=0;i<6;i++){const a=i/6*TAU;c.save();c.rotate(a);c.beginPath();c.moveTo(0,0);c.lineTo(sr,0);c.moveTo(sr*.6,0);c.lineTo(sr*.8,sr*.25);c.moveTo(sr*.6,0);c.lineTo(sr*.8,-sr*.25);c.stroke();c.restore();}}
 else if(st==='yinyang'){c.fillStyle='#f4f1e6';c.beginPath();c.arc(0,0,sr,0,TAU);c.fill();c.fillStyle='#14161c';c.beginPath();c.arc(0,0,sr,-Math.PI/2,Math.PI/2);c.arc(0,sr/2,sr/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-sr/2,sr/2,Math.PI/2,-Math.PI/2);c.fill();c.fillStyle='#f4f1e6';c.beginPath();c.arc(0,-sr/2,sr*.14,0,TAU);c.fill();c.fillStyle='#14161c';c.beginPath();c.arc(0,sr/2,sr*.14,0,TAU);c.fill();c.beginPath();c.arc(0,0,sr,0,TAU);c.stroke();}
 else if(st==='mariposa'){c.fillStyle=(TCOL||A);for(const s of[-1,1]){c.beginPath();c.ellipse(s*sr*.5,-sr*.4,sr*.5,sr*.4,s*.5,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(s*sr*.4,sr*.4,sr*.34,sr*.3,-s*.5,0,TAU);c.fill();c.stroke();}c.fillStyle='#1a1d25';c.fillRect(-sr*.07,-sr*.6,sr*.14,sr*1.2);}
 else if(st==='espiral'){c.strokeStyle=(TCOL||A);c.lineWidth=Math.max(1.6,sr*.16);c.lineCap='round';c.beginPath();for(let i=0;i<=60;i++){const a=i/60*TAU*2.3,r=sr*.1+sr*.9*i/60;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.stroke();}}
const _OFF=document.createElement('canvas');
/* Con opacidad parcial (sigilo, parpadeo de invulnerabilidad) las capas ala/cola/fuselaje se transparentaban entre sí:
   se dibuja el avión opaco en un lienzo temporal y se compone una sola vez con el alfa deseado. */
function drawPlane(c,def,look,o){
 const al=o.alpha;
 if(al!==undefined&&al<.995&&!o.shadow){
  const sh=def.shape,sc=o.scale||1,R=(Math.max(sh.len*.75+50,sh.wing*1.25*1.5)+20)*sc;let k=1;
  try{const m=c.getTransform();k=Math.hypot(m.a,m.b)||1;}catch(e){}
  const px=Math.min(1100,Math.max(16,Math.ceil(2*R*k)));
  if(_OFF.width!==px||_OFF.height!==px){_OFF.width=px;_OFF.height=px;}
  const g=_OFF.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,px,px);const kk=px/(2*R);g.setTransform(kk,0,0,kk,0,0);
  drawPlaneSoft(g,def,look,Object.assign({},o,{x:R,y:R,alpha:1}));
  c.save();c.globalAlpha=al;c.drawImage(_OFF,o.x-R,o.y-R,2*R,2*R);c.restore();return;}
 drawPlaneSoft(c,def,look,o);}
function previewDraw(cv,def,look,t){const c=cv.getContext('2d'),w=cv.clientWidth||320,h=cv.clientHeight||200,d=Math.min(2,window.devicePixelRatio||1);
 if(cv.width!==Math.round(w*d)){cv.width=Math.round(w*d);cv.height=Math.round(h*d);}
 c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 const sh=def.shape,sc=Math.min(w/(sh.len*1.9),h/(sh.wing*1.25*3.6),170/(sh.len*1.2)),ang=-.3+Math.sin(t*.9)*.06,cy=h*.47;
 drawPlane(c,def,look,{x:w/2+8*sc,y:cy+10*sc,ang,scale:sc,shadow:true});
 const py=cy+Math.sin(t*1.6)*3,tl=sh.len*.5*sc;trailDraw(c,look.trail,w/2-Math.cos(ang)*tl,py-Math.sin(ang)*tl,ang,Math.min(w*.3,sh.len*sc*1.7),t,Math.max(.9,sc*1.25));
 drawPlane(c,def,look,{x:w/2,y:py,ang,scale:sc,flame:.7,t});
 if(PVFXON&&cv.id==='pv')fxDraw(c,look.fx,w*.8,h*.36,Math.min(w,h)*.24,(t%2.8)/2.8);}

const cv=document.getElementById('cv'),cx=cv.getContext('2d');
let VW=800,VH=600,DPR=1,INS={l:0,r:0,t:0,b:0};
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);const r=cv.getBoundingClientRect();VW=r.width||innerWidth;VH=r.height||innerHeight;cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);
 try{const p=document.createElement('div');p.style.cssText='position:fixed;visibility:hidden;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p);const s=getComputedStyle(p);INS={t:parseFloat(s.paddingTop)||0,r:parseFloat(s.paddingRight)||0,b:parseFloat(s.paddingBottom)||0,l:parseFloat(s.paddingLeft)||0};p.remove();}catch(e){}placePause();}
function placePause(){const b=document.getElementById('pbtn'),sm=VW<640,w=sm?104:140,hh=sm?36:46;b.style.cssText='left:'+(VW/2-w/2)+'px;top:'+(INS.t+12)+'px;transform:none;width:'+w+'px;height:'+hh+'px;opacity:0;border-radius:'+(hh/2)+'px';}

function buildMini(){const mw=300,mh=Math.max(60,Math.round(mw*World.h/World.w)),o=document.createElement('canvas');o.width=mw;o.height=mh;const c=o.getContext('2d'),kx=mw/World.w,ky=mh/World.h;
 c.fillStyle=softCol('valle');c.fillRect(0,0,mw,mh);
 for(const b of World.biomes||[]){c.fillStyle=softCol(b.g);c.fillRect(b.x*kx,b.y*ky,b.w*kx+1,b.h*ky+1);}
 c.lineJoin='round';
 for(const d of World.decor){if(d.t==='g'){c.fillStyle=softCol(d.g);c.beginPath();d.p.forEach((q,i)=>i?c.lineTo(q[0]*kx,q[1]*ky):c.moveTo(q[0]*kx,q[1]*ky));c.closePath();c.fill();}else if(d.t==='gl'){c.strokeStyle=softCol(d.g);c.lineWidth=Math.max(2,d.w*kx);c.beginPath();d.pts.forEach((q,i)=>i?c.lineTo(q[0]*kx,q[1]*ky):c.moveTo(q[0]*kx,q[1]*ky));c.stroke();}}
 try{if(!World.roadsOn)throw 0;if(!ROADNET||ROADNET.key!==World.solids)planRoads();c.strokeStyle='rgba(60,60,70,.8)';c.lineWidth=2;for(const R of ROADNET.list){roadBuild(R);c.beginPath();R.pts.forEach((q,i)=>i?c.lineTo(q[0]*kx,q[1]*ky):c.moveTo(q[0]*kx,q[1]*ky));c.stroke();}}catch(e){}
 for(const s of World.solids){const mv=s.kind==='rotor'||s.kind==='slider';c.fillStyle=mv?'#ff9f1a':'#3d4660';c.strokeStyle='#f4f6fb';c.lineWidth=1.2;c.beginPath();s.poly.forEach((q,i)=>{const x=q[0]*kx,y=q[1]*ky;i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();c.fill();c.stroke();}
 for(const st of World.storms){c.fillStyle='#7b8cffaa';c.beginPath();c.arc(st.x*kx,st.y*ky,st.r*kx,0,TAU);c.fill();}
 if(!World.def.closed){try{const sp=stormPoly();c.save();c.scale(kx,ky);c.fillStyle='rgba(70,35,130,.82)';c.fill(sp.out,'evenodd');c.restore();}catch(e){}}
 M.mm=o;const r=mulberry(hashStr(World.def.id));M.clouds=[];for(let i=0;i<14;i++)M.clouds.push({x:r()*2600,y:r()*2000,s:.7+r()*1.2});}
function poly(c,p){c.beginPath();for(let i=0;i<p.length;i++)i?c.lineTo(p[i][0],p[i][1]):c.moveTo(p[i][0],p[i][1]);c.closePath();}
const OVCOL={valle:'#b8b3a3',canon:'#cf9264',metro:'#4b4a7e',archi:'#9fa89c',fabrica:'#7b8497'};
function inView(b,v){return !(b.x1<v.x0||b.x0>v.x1||b.y1<v.y0||b.y0>v.y1);}
const PKC={rep:['#1d6b3a','#5bd67d'],mun:['#126a68','#3fd0c9'],esc:['#1d4d78','#9be7ff'],dmg:['#7a2a1d','#ff6a4d'],nrg:['#6e5a12','#ffe27a']};

