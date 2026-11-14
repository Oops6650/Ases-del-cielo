'use strict';
/* ===== HUD v2 (se dibuja sobre el canvas): paneles redondeados, un color por función ===== */
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function rq(c,x,y,w,h,r){rr(c,x,y,w,h,Math.min(r,5));}
/* iconos del HUD */
function icoDraw(c,t,cx,cy,s,col){c.save();c.translate(cx,cy);c.fillStyle=col;c.strokeStyle=col;c.lineWidth=Math.max(1.6,s*.17);
  if(t==='kill'){c.beginPath();c.arc(0,0,s*.7,0,TAU);c.stroke();c.beginPath();for(const[a,b]of[[0,-1],[0,1],[-1,0],[1,0]]){c.moveTo(a*s*.45,b*s*.45);c.lineTo(a*s*1.05,b*s*1.05);}c.stroke();c.beginPath();c.arc(0,0,s*.13,0,TAU);c.fill();}
  else if(t==='skull'){c.beginPath();c.arc(0,-s*.15,s*.75,0,TAU);c.fill();c.fillRect(-s*.4,s*.3,s*.8,s*.55);c.fillStyle='#14181c';c.beginPath();c.arc(-s*.3,-s*.15,s*.23,0,TAU);c.arc(s*.3,-s*.15,s*.23,0,TAU);c.fill();c.fillRect(-s*.2,s*.5,s*.08,s*.35);c.fillRect(s*.12,s*.5,s*.08,s*.35);}
  else if(t==='flame'){c.beginPath();c.moveTo(0,-s);c.bezierCurveTo(s*.9,-s*.2,s*.9,s*.9,0,s);c.bezierCurveTo(-s*.9,s*.9,-s*.9,-s*.1,-s*.2,-s*.4);c.bezierCurveTo(-s*.1,-s*.1,s*.1,-s*.5,0,-s);c.fill();}
  else if(t==='bolt'){c.beginPath();c.moveTo(s*.3,-s);c.lineTo(-s*.6,s*.15);c.lineTo(-s*.05,s*.15);c.lineTo(-s*.3,s);c.lineTo(s*.6,-s*.2);c.lineTo(s*.05,-s*.2);c.closePath();c.fill();}
  else if(t==='shield'){c.beginPath();c.moveTo(0,-s);c.lineTo(s*.8,-s*.6);c.lineTo(s*.7,s*.3);c.quadraticCurveTo(s*.4,s*.8,0,s);c.quadraticCurveTo(-s*.4,s*.8,-s*.7,s*.3);c.lineTo(-s*.8,-s*.6);c.closePath();c.fill();}
  else if(t==='dash'){c.beginPath();c.moveTo(-s*.9,-s*.7);c.lineTo(-s*.1,0);c.lineTo(-s*.9,s*.7);c.moveTo(0,-s*.7);c.lineTo(s*.8,0);c.lineTo(0,s*.7);c.stroke();}
  else if(t==='cloak'){c.setLineDash([s*.4,s*.3]);c.beginPath();c.arc(0,0,s*.8,0,TAU);c.stroke();c.setLineDash([]);c.beginPath();c.arc(0,0,s*.2,0,TAU);c.fill();}
  else if(t==='plus'){c.fillRect(-s*.25,-s*.8,s*.5,s*1.6);c.fillRect(-s*.8,-s*.25,s*1.6,s*.5);}
  else if(t==='star'){star(c,0,0,s);}
  else if(t==='heart'){c.beginPath();c.moveTo(0,s*.85);c.bezierCurveTo(-s*1.5,-s*.1,-s*.7,-s*1.05,0,-s*.3);c.bezierCurveTo(s*.7,-s*1.05,s*1.5,-s*.1,0,s*.85);c.fill();}
  else if(t==='missile'){c.rotate(-.6);c.beginPath();c.moveTo(s*.95,0);c.lineTo(s*.4,-s*.25);c.lineTo(-s*.7,-s*.25);c.lineTo(-s*.7,s*.25);c.lineTo(s*.4,s*.25);c.closePath();c.fill();c.beginPath();c.moveTo(-s*.25,-s*.25);c.lineTo(-s*.75,-s*.75);c.lineTo(-s*.75,-s*.25);c.moveTo(-s*.25,s*.25);c.lineTo(-s*.75,s*.75);c.lineTo(-s*.75,s*.25);c.fill();}
  else if(t==='rockets'){c.rotate(-.5);for(const dy of[-.6,0,.6]){c.beginPath();c.moveTo(s*.85,dy*s);c.lineTo(s*.45,dy*s-s*.17);c.lineTo(s*.45,dy*s+s*.17);c.closePath();c.fill();c.beginPath();c.moveTo(-s*.7,dy*s);c.lineTo(s*.5,dy*s);c.lineWidth=s*.24;c.stroke();}}
  else if(t==='bomb'){c.beginPath();c.arc(0,s*.2,s*.65,0,TAU);c.fill();c.fillRect(-s*.14,-s*.6,s*.28,s*.3);c.lineWidth=s*.14;c.beginPath();c.moveTo(0,-s*.6);c.quadraticCurveTo(s*.3,-s*.95,s*.6,-s*.7);c.stroke();}
  else if(t==='plane'){c.beginPath();c.moveTo(s,0);c.lineTo(-s*.7,-s*.85);c.lineTo(-s*.35,0);c.lineTo(-s*.7,s*.85);c.closePath();c.fill();}
  else if(t==='warn'){c.lineWidth=s*.2;c.beginPath();c.moveTo(0,-s);c.lineTo(s*.98,s*.8);c.lineTo(-s*.98,s*.8);c.closePath();c.stroke();c.beginPath();c.moveTo(0,-s*.3);c.lineTo(0,s*.22);c.stroke();c.beginPath();c.arc(0,s*.52,s*.1,0,TAU);c.fill();}
  c.restore();}
function hud(c){const m=M,pl=m.pl,F='"Oswald","Arial Narrow",Impact,sans-serif',N='"Barlow",system-ui,sans-serif';
 const tch=document.body.classList.contains('touch'),small=VW<640;
 const PANEL='rgba(22,27,32,.76)',EDGE='rgba(210,200,150,.35)',INK='#14181c',CORAL='#c0392b',SUN='#e0aa22',MINT='#7fa646',SKY='#b8c2cc',BLUE='#587d8f';
 const L=INS.l+14,R=VW-INS.r-14,T=INS.t+12,B=VH-INS.b-24-(tch?120:0);
 const rk=ranking(),rank=rk.indexOf(pl)+1,PI=m.split?m.pls.indexOf(pl):0,P2v=PI>0;
 const panel=(x,y,w,h,r,fill)=>{rq(c,x,y,w,h,r);c.fillStyle=fill||PANEL;c.fill();c.strokeStyle=EDGE;c.lineWidth=2;c.stroke();};
 const shadowText=(s,x,y,fill)=>{c.lineJoin='round';c.lineWidth=4;c.strokeStyle='rgba(5,8,3,.6)';c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);};
 const pill=(s,cx,y,fill,col,font,h)=>{c.font=font;const w=c.measureText(s).width+h*1.1;rq(c,cx-w/2,y,w,h,h/2);c.fillStyle=fill;c.fill();c.lineWidth=2.5;c.strokeStyle=INK;c.stroke();c.fillStyle=col;c.textAlign='center';c.fillText(s,cx,y+h*.7);return w;};
 c.textBaseline='alphabetic';
 /* flechas hacia enemigos fuera de pantalla (primero, para que los paneles queden por encima) */
 {const S=m.S;let cnt=0;const vs=m.planes.filter(p=>p!==pl&&p.alive&&!(p.cloak>0)).sort((a,b)=>Math.hypot(a.x-pl.x,a.y-pl.y)-Math.hypot(b.x-pl.x,b.y-pl.y));
  for(const p of vs){if(cnt>=4)break;const sx=VW/2+(p.x-m.cam.x)*S,sy2=VH/2+(p.y-m.cam.y)*S;if(sx>40&&sx<VW-40&&sy2>40&&sy2<VH-40)continue;cnt++;
   const a=Math.atan2(sy2-VH/2,sx-VW/2),k=Math.min((VW/2-30)/Math.abs(Math.cos(a)||1e-3),(VH/2-30)/Math.abs(Math.sin(a)||1e-3)),ax=VW/2+Math.cos(a)*k,ay=VH/2+Math.sin(a)*k;
   c.save();c.translate(ax,ay);c.rotate(a);c.fillStyle=m.teams?TEAMC[p.team]:paintOf(p.look.paint)[2];c.strokeStyle='#fff';c.lineWidth=2.5;c.lineJoin='round';c.beginPath();c.moveTo(13,0);c.lineTo(-8,-9);c.lineTo(-3,0);c.lineTo(-8,9);c.closePath();c.fill();c.stroke();c.restore();}}
 /* ★ MEJORA: indicador direccional de impactos y aviso de misiles entrantes (aunque no te apunten directamente) */
 {if(pl.hitDir){pl.hitDir=pl.hitDir.filter(h=>m.t-h.t<1.2);for(const h of pl.hitDir){const k=1-(m.t-h.t)/1.2,r=Math.min(VW,VH)*.26;c.save();c.translate(VW/2,VH/2);c.rotate(h.a);c.globalAlpha=k*.9;c.strokeStyle='#ff4d3a';c.lineWidth=9;c.lineCap='round';c.beginPath();c.arc(0,0,r,-.28,.28);c.stroke();c.restore();}}
  /* misiles entrantes: flecha roja alrededor de TU avión que apunta hacia donde viene cada misil (más grande y rápida cuanto más cerca) */
  {const ms=[];for(const q of m.mis){if(q.o===pl||ally(q.o,pl))continue;const dx=pl.x-q.x,dy=pl.y-q.y,d=Math.hypot(dx,dy);if(d>1900||dx*Math.cos(q.ang)+dy*Math.sin(q.ang)<=0)continue;ms.push([d,q]);}
   ms.sort((a,b)=>a[0]-b[0]);const px=VW/2+(pl.x-m.cam.x)*m.S,py=VH/2+(pl.y-m.cam.y)*m.S,rr=clamp(Math.min(VW,VH)*.3,95,175);
   for(const[d,q]of ms.slice(0,3)){const a=Math.atan2(q.y-pl.y,q.x-pl.x),k=1-clamp(d/1900,0,1),bl=.5+.5*Math.sin(m.t*(8+22*k)),sz=14+16*k;c.save();c.translate(px+Math.cos(a)*rr,py+Math.sin(a)*rr);c.rotate(a);c.globalAlpha=.6+.4*bl;c.fillStyle=q.tg===pl?'#ff2d2d':'#ffb340';c.strokeStyle='#fff';c.lineWidth=3;c.lineJoin='round';c.beginPath();c.moveTo(sz*.5,0);c.lineTo(-sz*.8,-sz*.75);c.lineTo(-sz*.35,0);c.lineTo(-sz*.8,sz*.75);c.closePath();c.fill();c.stroke();c.restore();}}}
 /* PUNTOS + PUESTO (arriba a la izquierda) */
 const cw=small?128:214,ch=small?56:80;
 panel(L,T,cw,ch,20);HR.score=[L,T,cw,ch+(small?44:50)];
 c.textAlign='left';c.fillStyle='#fff';c.font='700 '+(small?26:44)+'px '+F;c.fillText(nf(pl.score),L+12,T+(small?35:54));
 c.font='700 '+(small?10:12)+'px '+N;c.fillStyle='rgba(255,255,255,.7)';c.fillText('puntos',L+12,T+(small?49:71));
 {const bx=L+cw-(small?22:40),by=T+ch/2,br=small?15:25;c.beginPath();c.arc(bx,by,br,0,TAU);c.fillStyle=rank===1?SUN:'#fff';c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();c.fillStyle=INK;c.textAlign='center';c.font='700 '+(small?13:22)+'px '+F;c.fillText(m.mode==='waves'?'Ol.'+m.wave:rank+'º',bx,by+(small?5:8));}
 let y=T+ch+8;
 panel(L,y,cw,small?36:42,16);
 [['Bajas',pl.kills,'#e0866a'],['Asist.',pl.assists,SUN],['Muertes',pl.deaths,SKY]].forEach((s,i)=>{const x=L+(i+.5)*cw/3;c.textAlign='center';c.fillStyle=s[2];c.font='700 '+(small?15:19)+'px '+F;c.fillText(s[1],x,y+(small?18:21));c.fillStyle='rgba(255,255,255,.7)';c.font='700 '+(small?9:10)+'px '+N;c.fillText(s[0],x,y+(small?30:35));});
 y+=(small?36:42)+10;
 if(pl.streak>=2){c.textAlign='left';const w=pill('Racha ×'+pl.streak,L+60,y,SUN,INK,'700 '+(small?13:15)+'px '+F,small?24:28);y+=(small?30:34);}
 if(pl.combo>=2&&m.t-pl.comboT<4){const mu=Math.min(3,1+(pl.combo-1)*.5),fr=1-(m.t-pl.comboT)/4,w=pill('Combo ×'+String(mu).replace('.0',''),L+66,y,BLUE,'#fff','700 '+(small?13:15)+'px '+F,small?24:28);
  rq(c,L+66-w/2+6,y+(small?26:30),w-12,5,2.5);c.fillStyle='rgba(22,27,32,.7)';c.fill();rq(c,L+66-w/2+6,y+(small?26:30),Math.max(5,(w-12)*fr),5,2.5);c.fillStyle=SKY;c.fill();y+=(small?38:42);}
 if(!small&&m.mode!=='waves'){c.textAlign='left';c.font='700 13px '+N;rk.slice(0,3).forEach((p,i)=>{const yy=y+8+i*18;c.fillStyle=p===pl?SUN:'rgba(255,255,255,.8)';c.lineWidth=3;c.strokeStyle='rgba(5,8,3,.55)';const nm=(i+1)+'  '+p.name.slice(0,10);c.strokeText(nm,L+4,yy);c.fillText(nm,L+4,yy);c.textAlign='right';c.strokeText(p.score,L+150,yy);c.fillText(p.score,L+150,yy);c.textAlign='left';});}
 /* TIEMPO (arriba al centro) */
 {const low=m.limit-m.t<20,blink=low&&Math.floor(m.t*2)%2,w=small?104:140,h=small?36:46;rq(c,VW/2-w/2,T,w,h,h/2);c.fillStyle=blink?CORAL:PANEL;c.fill();c.strokeStyle=EDGE;c.lineWidth=2;c.stroke();
  c.fillStyle='rgba(255,255,255,.85)';{const gx=VW/2-w/2+(small?16:22),gh=small?12:16;c.fillRect(gx,T+h/2-gh/2,3.5,gh);c.fillRect(gx+7,T+h/2-gh/2,3.5,gh);}c.textAlign='center';c.fillStyle='#fff';c.font='700 '+(small?22:30)+'px '+F;c.fillText(fmtT(m.limit-m.t),VW/2+(small?12:14),T+(small?27:34));
  if(!small&&m.mode==='ffa'){c.font='700 12px '+N;c.fillStyle='#fff';c.lineWidth=3;c.strokeStyle='rgba(5,8,3,.55)';const s=m.cfg.bots+' rivales · '+DIFFS[m.cfg.diff].name;c.strokeText(s,VW/2,T+h+16);c.fillText(s,VW/2,T+h+16);}}
 modeHud(c,{small,F,N,PANEL,EDGE,INK,CORAL,SUN,MINT,SKY,BLUE,T,L,R,B,pill,panel,shadowText,tch});
 /* MINIMAPA (arriba a la derecha) + bajas recientes */
 const mmK=m.mmBig?2.1:1,mw=Math.min((small?150:220)*mmK,VW*(m.mmBig?.62:.3)),mh=mw*m.mm.height/m.mm.width,mx=R-mw,my=T;HR.mini=[mx-5,my-5,mw+10,mh+10];
 rq(c,mx-5,my-5,mw+10,mh+10,16);c.fillStyle=PANEL;c.fill();c.strokeStyle=EDGE;c.lineWidth=2;c.stroke();
 c.save();rq(c,mx,my,mw,mh,12);c.clip();c.globalAlpha=.95;c.drawImage(m.mm,mx,my,mw,mh);c.restore();modeMini(c,mx,my,mw,mh);
 for(const k of m.picks){const x=mx+k.x/World.w*mw,yy=my+k.y/World.h*mh;c.fillStyle={rep:'#5bd67d',mun:'#3fd0c9',esc:'#9be7ff',dmg:'#ff6a4d',nrg:'#ffe27a'}[k.k]||'#fff';c.fillRect(x-2.5,yy-2.5,5,5);} /* ★ MEJORA: cajas en el minimapa */
 for(const p of m.planes){if(!p.alive||p===pl||p.cloak>0)continue;const x=mx+p.x/World.w*mw,yy=my+p.y/World.h*mh;c.beginPath();c.arc(x,yy,4,0,TAU);c.fillStyle=m.teams?TEAMC[p.team]:p.isPlayer?'#ffd24a':'#ff4d4d';c.fill();c.lineWidth=1.8;c.strokeStyle='#fff';c.stroke();}
 {const p=m.pl;if(p.alive){const x=mx+p.x/World.w*mw,yy=my+p.y/World.h*mh;c.save();c.translate(x,yy);c.rotate(p.ang);c.beginPath();c.moveTo(9,0);c.lineTo(-6,-6);c.lineTo(-3,0);c.lineTo(-6,6);c.closePath();c.fillStyle='#fff';c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();c.restore();c.strokeStyle='rgba(255,255,255,'+(.55-.35*Math.abs(Math.sin(m.t*3)))+')';c.lineWidth=2;c.beginPath();c.arc(x,yy,11+Math.sin(m.t*3)*2,0,TAU);c.stroke();}}
 c.textAlign='right';c.font='700 12px '+N;{let fy=my+mh+30;for(const k of m.feed.slice(-4)){if(m.t-k.t>6)continue;const s=k.a?k.a+' ▸ '+k.v:k.v+' ('+(k.k||'caída')+')',w=c.measureText(s).width+18;c.globalAlpha=clamp(6-(m.t-k.t),0,1);rq(c,R-w,fy-14,w,22,11);c.fillStyle='rgba(22,27,32,.7)';c.fill();c.fillStyle=k.ap?SUN:k.vp?'#e0866a':'#fff';c.fillText(s,R-9,fy+2);fy+=26;}c.globalAlpha=1;}
 /* CASCO y ENERGÍA (abajo al centro) */
 const bw=Math.min(420,VW*(small?.56:.4)),bx=VW/2-bw/2,hf=clamp(pl.hp/pl.maxHp,0,1),by=B-52,hc=hf>.5?MINT:hf>.25?SUN:CORAL;HR.bars=[bx-6,by-6,bw+12,68];HR.sp=[bx-52-30,by+12-30,60,60];HR.sec=[bx+bw+52-30,by+12-30,60,76];
 panel(bx-6,by-6,bw+12,36,18);
 rq(c,bx,by,bw,24,12);c.fillStyle='rgba(255,255,255,.14)';c.fill();
 if(hf>.01){c.save();rq(c,bx,by,bw,24,12);c.clip();c.fillStyle=hc;c.fillRect(bx,by,bw*hf,24);c.fillStyle='rgba(255,255,255,.28)';c.fillRect(bx,by,bw*hf,8);c.restore();}
 c.textAlign='center';c.font='700 17px '+F;shadowText(String(Math.ceil(pl.hp)),VW/2,by+19,'#fff');
 c.textAlign='left';c.font='700 11px '+N;shadowText('Casco',bx+10,by+17,'rgba(255,255,255,.9)');
 {const ey=by+34;rq(c,bx,ey,bw,9,4.5);c.fillStyle='rgba(22,27,32,.7)';c.fill();const ef=clamp(pl.energy/100,0,1);if(ef>.01){rq(c,bx,ey,Math.max(9,bw*ef),9,4.5);c.fillStyle=pl.boosting?'#c9d9a0':BLUE;c.fill();}
  c.font='700 11px '+N;c.textAlign='left';shadowText('Energía',bx,ey+23,'rgba(255,255,255,.85)');c.textAlign='right';shadowText(Math.round(pl.speed*.36)+' km/h',bx+bw,ey+23,'rgba(255,255,255,.85)');}
 {const hy=by-9,hf=pl.rldG>0?1-clamp(pl.rldG/1.6,0,1):clamp((pl.heat||0)/3,0,1);rq(c,bx,hy,bw,6,3);c.fillStyle='rgba(22,27,32,.7)';c.fill();if(hf>.01){rq(c,bx,hy,Math.max(6,bw*hf),6,3);c.fillStyle=pl.rldG>0?'#9aa5b1':hf>.66?'#ff5a3d':'#ffb040';c.fill();}if(pl.rldG>0){c.font='700 11px '+N;c.textAlign='center';shadowText('Recargando…',bx+bw/2,hy-4,'#fff');}}
 /* power-ups (sobre el casco) */
 const pu=[];if(pl.shield>0)pu.push(['Escudo',pl.shield,'#c9d9a0']);if(pl.dmgT>0)pu.push(['Daño ×2',pl.dmgT,'#e0866a']);if(pl.nrgT>0)pu.push(['Energía ∞',pl.nrgT,SUN]);if(pl.cloak>0)pu.push(['Camuflaje',pl.cloak,'#d5dade']);if(pl.spT>0)pu.push(['Postcomb.',pl.spT,'#FFB040']);if(pl.odT>0)pu.push(['Sobrecarga',pl.odT,'#ffd93d']);if(pl.dashT>0&&pl.def.sp.t==='dash')pu.push(['Embestida',pl.dashT,'#9be7ff']);if(pl.alive&&(pl.draft||0)>.25)pu.push(['Rebufo +'+Math.round(pl.draft*AMPLIO.draft.gain*100)+'% vel.',0,'#3fd0c9',1]);
 const sp=pl.def.sp,rdy=pl.spCd<=0;let sy=by-14;
 pu.forEach((q,i)=>{pill(q[3]?q[0]:q[0]+' '+Math.ceil(q[1])+' s',VW/2,sy-26*(i+1),q[2],INK,'700 13px '+F,24);});
 /* ESPECIAL (Q) y SECUNDARIA (R): botones circulares junto al casco (en táctil ya hay botones propios) */
 {const ring=(cx,cy,f,col,key,name,kb,cdt)=>{c.beginPath();c.arc(cx,cy,27,0,TAU);c.fillStyle=PANEL;c.fill();c.lineWidth=5;c.strokeStyle='rgba(255,255,255,.18)';c.stroke();
   if(f>0){c.beginPath();c.arc(cx,cy,27,-Math.PI/2,-Math.PI/2+TAU*clamp(f,0,1));c.strokeStyle=col;c.lineWidth=5;c.lineCap='round';c.stroke();c.lineCap='butt';}
   if(cdt){c.font='700 20px '+F;c.textAlign='center';shadowText(String(cdt),cx,cy+7,'#fff');}else icoDraw(c,key,cx,cy,13,f>=1?'#fff':'rgba(255,255,255,.6)');if(kb&&!tch){c.beginPath();c.arc(cx-21,cy-21,9,0,TAU);c.fillStyle=INK;c.fill();c.lineWidth=2;c.strokeStyle='#fff';c.stroke();c.fillStyle='#fff';c.font='700 11px '+N;c.textAlign='center';c.fillText(kb,cx-21,cy-17);}if(name){for(let i=0;i<name[0];i++){c.beginPath();c.arc(cx+(i-(name[0]-1)/2)*8,cy+39,3,0,TAU);c.fillStyle=i<name[1]?col:'rgba(255,255,255,.2)';c.fill();}}};
  ring(bx-52,by+12,rdy?1:1-clamp(pl.spCd/sp.cd,0,1),rdy?MINT:SKY,{dash:'dash',turbo:'flame',escudo:'shield',cloak:'cloak',repair:'plus',overdrive:'bolt',nova:'star',fenix:'heart'}[sp.t]||'star',null,sp.t==='fenix'?'':(P2v?'Y':'Q'),rdy?0:(sp.t==='fenix'?0:Math.ceil(pl.spCd)));
  ring(bx+bw+52,by+12,pl.secAmmo/pl.def.sec.n,'#d9954a',{misil:'missile',cohetes:'rockets',bomba:'bomb'}[pl.def.sec.t]||'missile',[pl.def.sec.n,pl.secAmmo],(P2v?'B':'R'),0);}
 /* AVISOS */
 c.textAlign='center';
 if(pl.alive){if(pl.stall)pill('Pérdida de sustentación',VW/2,VH*.28,Math.floor(m.t*6)%2?CORAL:SUN,Math.floor(m.t*6)%2?'#fff':INK,'700 '+(small?18:24)+'px '+F,small?34:42);
  else if(pl.oob>0)pill('Vuelve a la zona de combate',VW/2,VH*.28,CORAL,'#fff','700 '+(small?18:24)+'px '+F,small?34:42);
  if(pl.warnT>0||(!m.split&&m.warn>0)){const f8=Math.floor(m.t*8)%2,cy=VH*.28+(small?54:66),r=small?24:30;c.beginPath();c.arc(VW/2,cy,r,0,TAU);c.fillStyle=f8?CORAL:'#fff';c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();icoDraw(c,'missile',VW/2,cy,r*.6,f8?'#fff':CORAL);c.font='700 '+(small?12:14)+'px '+F;c.textAlign='center';shadowText('¡MISIL!',VW/2,cy+r+(small?16:20),'#fff');}
  if(pl.hp<pl.maxHp*.3){const g=c.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.7);g.addColorStop(0,'rgba(255,0,30,0)');g.addColorStop(1,'rgba(255,0,30,'+(.25+.1*Math.sin(m.t*8))+')');c.fillStyle=g;c.fillRect(0,0,VW,VH);}}
 /* mensajes de puntos */
 c.font='700 '+(small?20:25)+'px '+F;{let py=VH*.44;for(const q of m.pop.filter(z=>z.o===undefined||z.o===pl).slice(-4)){const age=m.t-q.t;if(age>1.8)continue;c.globalAlpha=clamp(1.8-age,0,1);{const hc=q.txt.includes('¤'),tt=q.txt.replace(/\s*¤/,''),yy=py-age*14,tw=c.measureText(tt).width,ox=hc?-13:0;shadowText(tt,VW/2+ox,yy,q.col);if(hc){const cx0=VW/2+ox+tw/2+16,cy0=yy-(small?7:9),cr=small?8:10;c.fillStyle='#e2aa2e';c.strokeStyle='#14181c';c.lineWidth=2.5;c.beginPath();c.arc(cx0,cy0,cr,0,TAU);c.fill();c.stroke();c.strokeStyle='rgba(138,95,0,.6)';c.lineWidth=1.5;c.beginPath();c.arc(cx0,cy0,cr*.55,0,TAU);c.stroke();}}py+=28;}c.globalAlpha=1;}
 if(!pl.alive&&!m.over){/* ★ MEJORA: el cartel ya no tapa el centro: se ve cómo cae tu avión */
  const w=Math.min(330,VW-32),bY=Math.max(64,VH*.17),hP=88;panel(VW/2-w/2,bY,w,hP,24);{const x0=VW/2-w/2-5,y0=bY-5,ww=w+10,hh=hP+10,per=2*(ww+hh)-(8-TAU)*5,fr=clamp(1-pl.respawn/3.2,0,1);rq(c,x0,y0,ww,hh,5);c.lineWidth=5;c.strokeStyle='rgba(255,255,255,.14)';c.stroke();if(fr>0){c.setLineDash([per*fr,per]);c.strokeStyle=SUN;c.stroke();c.setLineDash([]);}}c.textAlign='center';c.fillStyle='#e0866a';c.font='700 32px '+F;c.fillText(pl.out?'¡Eliminado!':'¡Derribado!',VW/2,bY+40);c.fillStyle='#fff';c.font='700 15px '+N;c.fillText('por '+(pl.deathBy||m.deathBy)+(pl.out?'':' · reaparece en '+Math.max(1,Math.ceil(pl.respawn))+' s'),VW/2,bY+68);}
 if(m.over){const w=Math.min(420,VW-32);rq(c,VW/2-w/2,VH*.36,w,96,26);c.fillStyle=SUN;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();c.textAlign='center';c.fillStyle=INK;c.font='700 '+(small?30:40)+'px '+F;c.fillText(m.split?splitVerdict():'¡Fin de la partida!',VW/2,VH*.36+60);}
 if(m.split){c.font='700 12px '+F;const s2=PI>0?'J'+(PI+1)+' · Mando':'J1 · Teclado y ratón',w2=c.measureText(s2).width+22,y2=VH-INS.b-22;rq(c,L,y2,w2,20,10);c.fillStyle=['#2f6fe0','#d9702a','#3aa55d','#a855c7'][PI]||'#2f6fe0';c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();c.fillStyle='#fff';c.textAlign='center';c.fillText(s2,L+w2/2,y2+15);}
 if(m.tut)tutHud(c,small);if(m.t<14&&(!small||m.split)&&!tch&&!m.tut){c.globalAlpha=clamp(14-m.t,0,1);c.textAlign='center';pill(P2v?'Stick: girar y turbo · A disparar · B misil · Y especial':hintLine(),VW/2,VH*(m.split?.23:.14),'rgba(22,27,32,.8)','#fff',(m.split?'700 12px ':'700 14px ')+N,m.split?28:34);c.globalAlpha=1;}
}
function renderView(){const c=cx,m=M,pl=m.pl,def=World.def;c.setTransform(DPR,0,0,DPR,VOX*DPR,VOY*DPR);
  /* ★ AMPLIO #9 — cámara más alejada que se abre aún más con la velocidad */
 const S=Math.min(VH/840,VW/1120)*AMPLIO.zoomK*clamp(1.02-(pl.speed/pl.eff.cruise-1)*.16,.8,1.05);m.S=S;
 const shk=m.split?(pl.shk||0):m.shake,sx=(Math.random()-.5)*shk*2,sy=(Math.random()-.5)*shk*2,cxm=m.cam.x,cym=m.cam.y;{const cm=m.cam,nw=performance.now(),dtp=Math.min(.1,Math.max(0,(nw-(cm.pt||nw))/1000));cm.pt=nw;const f=1-Math.exp(-dtp*4);cm.px=cm.px===undefined?cxm:cm.px+(cxm-cm.px)*f;cm.py=cm.py===undefined?cym:cm.py+(cym-cm.py)*f;CAMX=cm.px;CAMY=cm.py;}
 c.fillStyle=def.ground;c.fillRect(0,0,VW,VH);
 c.save();c.translate(VW/2-cxm*S+sx,VH/2-cym*S+sy);c.scale(S,S);
 const v={x0:cxm-VW/2/S-120,x1:cxm+VW/2/S+120,y0:cym-VH/2/S-120,y1:cym+VH/2/S+120};drawWorld(c,def,v);modeWorld(c,v);c.restore();
 drawCloudsSoft(c,S,cxm,cym);
 {const tl=[def.tint,TIMES[curTime(def.id)].c].filter(Boolean);if(tl.length){c.save();c.globalCompositeOperation='multiply';for(const t of tl){c.fillStyle=t;c.fillRect(0,0,VW,VH);}c.restore();}}
 {const vg=c.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.45,VW/2,VH/2,Math.max(VW,VH)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,18,10,.28)');c.fillStyle=vg;c.fillRect(0,0,VW,VH);}
 c.textBaseline='alphabetic';hud(c);}

/* ===== PANTALLA DIVIDIDA (2-4) · J1 teclado + ratón · J2-J4 mandos ===== */
let VOX=0,VOY=0;
const padCount=()=>{try{return[...navigator.getGamepads()].filter(g=>g&&g.connected).length;}catch(e){return 0;}};
function splitVerdict(){const m=M,H=m.pls;if(!H)return'¡Fin de la partida!';
 if(m.mode==='waves')return'Oleada '+m.wave+' · ¡Buen trabajo!';
 if(m.mode==='team')return m.ts[0]===m.ts[1]?'¡Empate!':m.ts[0]>m.ts[1]?'¡Gana el equipo Azul!':'¡Gana el equipo Rojo!';
 const rk=ranking(),o=H.slice().sort((a,b)=>rk.indexOf(a)-rk.indexOf(b));
 if(m.mode==='ffa'&&o[0].score===o[1].score)return'¡Empate!';
 return'¡Gana J'+(H.indexOf(o[0])+1)+'!';}
function splitTeams(){const m=M,H=m.pls;
 if(m.mode==='team'){const n=[0,0];H.forEach((p,i)=>{p.team=i%2;n[i%2]++;});for(const p of m.planes){if(H.includes(p))continue;const t=n[0]<=n[1]?0:1;p.team=t;n[t]++;}}
 else if(m.mode==='waves'){for(const p of H){p.team=0;p.lives=3;}}}
function splitRects(n,FW,FH,g){
 if(n===2){const s=FW>=FH;return s?[[0,0,(FW-g)/2,FH],[(FW+g)/2,0,(FW-g)/2,FH]]:[[0,0,FW,(FH-g)/2],[0,(FH+g)/2,FW,(FH-g)/2]];}
 const w=(FW-g)/2,h=(FH-g)/2,R=[[0,0,w,h],[w+g,0,w,h],[0,h+g,w,h],[w+g,h+g,w,h]];if(n===3)R[2]=[0,h+g,FW,h];return R.slice(0,n);}
function render(){
 if(!M||!M.split){VOX=VOY=0;renderView();return;}
 const c=cx,FW=VW,FH=VH,I0=INS,sv={pl:M.pl,cam:M.cam},n=M.pls.length,R=splitRects(n,FW,FH,6),np=padCount();
 c.setTransform(DPR,0,0,DPR,0,0);c.fillStyle='#0b0e11';c.fillRect(0,0,FW,FH);
 try{for(let i=0;i<n;i++){
  const[x,y,w,h]=R[i];
  M.pl=M.pls[i];M.cam=M.cams[i];VW=w;VH=h;VOX=x;VOY=y;
  INS={l:x<1?I0.l:0,r:x+w>FW-1?I0.r:0,t:y<1?I0.t:0,b:y+h>FH-1?I0.b:0};
  c.save();c.setTransform(DPR,0,0,DPR,x*DPR,y*DPR);c.beginPath();c.rect(0,0,w,h);c.clip();
  renderView();
  if(i>0&&np<i){const bw=Math.min(320,w-24);c.setTransform(DPR,0,0,DPR,x*DPR,y*DPR);rq(c,w/2-bw/2,h*.62,bw,54,14);c.fillStyle='rgba(22,27,32,.86)';c.fill();c.lineWidth=2;c.strokeStyle='rgba(210,200,150,.45)';c.stroke();
   c.fillStyle='#fff';c.textAlign='center';c.font='700 15px "Barlow",system-ui,sans-serif';c.fillText('J'+(i+1)+': conecta un mando',w/2,h*.62+23);c.font='600 12px "Barlow",system-ui,sans-serif';c.fillStyle='rgba(255,255,255,.75)';c.fillText('y pulsa cualquier botón',w/2,h*.62+41);}
  c.restore();}}
 finally{M.pl=sv.pl;M.cam=sv.cam;VW=FW;VH=FH;VOX=VOY=0;INS=I0;}}
