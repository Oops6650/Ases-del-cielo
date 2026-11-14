'use strict';
/* ===== Personalización ===== */
const CATS=[['paint','Pintura'],['pattern','Diseño'],['sticker','Pegatina'],['trail','Estela'],['fx','Explosión'],['acc','Accesorio']];
const CAT={
 paint:[
  {id:'clasico',name:'Clásico',cost:0,c:['#d9d4c3','#3b5b8f','#ff7a2f']},{id:'selva',name:'Selva',cost:150,c:['#5a8a3e','#2d4a2a','#e8d36a']},
  {id:'ceniza',name:'Ceniza',cost:150,c:['#9a9ea6','#43464d','#ff4d5e']},{id:'noche',name:'Noche',cost:200,c:['#242c40','#4b5a85','#3fd0c9']},
  {id:'coral',name:'Coral',cost:250,c:['#ff6f61','#fff1e6','#2b2d42']},{id:'hielo',name:'Hielo',cost:300,c:['#d3eef8','#6aa7c9','#ffffff']},
  {id:'menta',name:'Menta',cost:300,c:['#7fe3c4','#1f6f5c','#ffffff']},{id:'sol',name:'Sol naciente',cost:350,c:['#ffb02e','#e4572e','#fff7e0']},
  {id:'amatista',name:'Amatista',cost:400,c:['#8a55e0','#2c1b5a','#ffd166']},{id:'oro',name:'Oro viejo',cost:600,c:['#dcab26','#7a5a10','#fff3c4']},
  {id:'cromo',name:'Cromo',cost:900,c:['#e8edf2','#8895a7','#2d9cdb']},{id:'aurora',name:'Aurora',cost:0,ach:'kills100',c:['#2ee6a6','#6a4cff','#ff7ad9']},
  {id:'desierto',name:'Desierto',cost:200,c:['#d9b77a','#8a6a3a','#fff2d0']},{id:'oceano',name:'Océano',cost:250,c:['#2f80c8','#12365e','#9be7ff']},
  {id:'cereza',name:'Cereza',cost:300,c:['#c81e4a','#4a0d22','#ffd1dc']},{id:'lima',name:'Lima',cost:300,c:['#b8e03a','#3f5d12','#fffbd0']},
  {id:'grafito',name:'Grafito',cost:350,c:['#4b5058','#1c1f24','#ffb02e']},{id:'rosa',name:'Rosa chicle',cost:350,c:['#ff9ecb','#b03a7a','#ffffff']},
  {id:'cobre',name:'Cobre',cost:500,c:['#c9743a','#5a2c14','#ffe0c0']},{id:'esmeralda',name:'Esmeralda',cost:0,gem:12,c:['#1fbf7a','#0b4a35','#d6ffe9']},
  {id:'zafiro',name:'Zafiro',cost:0,gem:15,c:['#2a5bd7','#0f1f5a','#bcd2ff']},{id:'obsidiana',name:'Obsidiana',cost:0,gem:20,c:['#14141c','#3b2a5a','#c084fc']},
  {id:'nacar',name:'Nácar',cost:0,gem:25,c:['#f6eef7','#b79ad8','#7de0ff']},{id:'neonico',name:'Neónico',cost:0,gem:30,c:['#1a1a2e','#00f0ff','#ff2bd6']},
  {id:'galaxia',name:'Galaxia',cost:0,gem:40,c:['#1b0f3a','#5b2bd6','#ffd34d']}],
 pattern:[
  {id:'none',name:'Liso',cost:0},{id:'rayas',name:'Franjas',cost:100},{id:'tablero',name:'Cuadros',cost:200},{id:'dientes',name:'Paneles',cost:300},
  {id:'flechas',name:'Zigzag',cost:200},{id:'camu',name:'Camuflaje',cost:250},{id:'llamas',name:'Tigre',cost:450},{id:'bicolor',name:'Escamas',cost:150},{id:'filetes',name:'Bordes',cost:120},
  {id:'ondas',name:'Ondas',cost:180},{id:'puntos',name:'Lunares',cost:150},{id:'rombos',name:'Rombos',cost:220},{id:'cebra',name:'Cebra',cost:260},
  {id:'hexa',name:'Panal',cost:300},{id:'estrellado',name:'Estrellado',cost:0,gem:8},{id:'circuito',name:'Circuito',cost:0,gem:15}],
 sticker:[
  {id:'none',name:'Ninguna',cost:0},{id:'estrella',name:'Estrella',cost:80},{id:'diana',name:'Escarapela',cost:100},{id:'rayo',name:'Rayo',cost:120},
  {id:'calavera',name:'Calavera',cost:200},{id:'corazon',name:'Corazón',cost:150},{id:'corona',name:'Corona',cost:350},
  {id:'luna',name:'Luna',cost:90},{id:'trebol',name:'Trébol',cost:100},{id:'gota',name:'Gota',cost:90},{id:'flecha',name:'Flecha',cost:110},
  {id:'cruz',name:'Cruz',cost:120},{id:'escudo',name:'Escudo',cost:220},{id:'sol',name:'Sol',cost:300},
  {id:'alas',name:'Alas',cost:0,gem:6},{id:'diamante',name:'Diamante',cost:0,gem:8},{id:'ojo',name:'Ojo',cost:0,gem:10},{id:'fuego',name:'Llama',cost:0,gem:12}],
 trail:[
  {id:'humo',name:'Humo',cost:0},{id:'fuego',name:'Fuego',cost:200},{id:'neon',name:'Neón',cost:300},{id:'chispas',name:'Chispas',cost:250},
  {id:'burbujas',name:'Burbujas',cost:200},{id:'arcoiris',name:'Arcoíris',cost:600},{id:'doble',name:'Doble estela',cost:400},{id:'aurora',name:'Aurora',cost:0,ach:'kills100'},
  {id:'vapor',name:'Vapor',cost:150},{id:'tinta',name:'Tinta',cost:200},{id:'rayos',name:'Rayos',cost:350},{id:'pixeles',name:'Píxeles',cost:300},
  {id:'corazones',name:'Corazones',cost:0,gem:8},{id:'estrellas',name:'Estrellas',cost:0,gem:10},{id:'plasma',name:'Plasma',cost:0,gem:15},{id:'oro',name:'Polvo de oro',cost:0,gem:20}],
 fx:[
  {id:'clasico',name:'Explosión clásica',cost:0},{id:'confeti',name:'Confeti',cost:250},{id:'fuegos',name:'Fuegos artificiales',cost:400},
  {id:'onda',name:'Onda de choque',cost:350},{id:'glitch',name:'Glitch',cost:0,ach:'legend'},
  {id:'estrellas',name:'Lluvia de estrellas',cost:300},{id:'burbujas',name:'Pompas',cost:250},{id:'rayos',name:'Tormenta eléctrica',cost:350},
  {id:'corazones',name:'Corazones',cost:0,gem:8},{id:'pixel',name:'Pixelado',cost:0,gem:10},{id:'nova',name:'Nova',cost:0,gem:15}],
 acc:[
  {id:'none',name:'Ninguno',cost:0},{id:'bufanda',name:'Bufanda',cost:150},{id:'bandera',name:'Banderín',cost:150},{id:'luces',name:'Luces de ala',cost:250},
  {id:'antena',name:'Antena',cost:100},{id:'aureola',name:'Aureola',cost:500},
  {id:'gafas',name:'Gafas de piloto',cost:120},{id:'cresta',name:'Cresta',cost:180},{id:'cuernos',name:'Cuernos',cost:160},{id:'pinchos',name:'Pinchos',cost:200},
  {id:'orejas',name:'Orejas',cost:0,gem:8},{id:'puntas',name:'Puntas brillantes',cost:0,gem:12},{id:'coronita',name:'Coronita',cost:0,gem:15}]};
const DEFLOOK={paint:'clasico',pattern:'none',sticker:'none',trail:'humo',fx:'clasico',acc:'none'};

/* ===== Mapas (datos; geometría en p3) ===== */
const MAPDEF=[
 {id:'valle',name:'Valle del Fortín',cost:0,tag:'Pradera · tutorial',desc:'Praderas verdes, bosques, un río serpenteante y un fortín central. El mapa más amable para entrenar: mucho espacio abierto y pocas torretas.',sky:['#5aa7e8','#cfe9f7'],far:'#7fa6c9',mid:'#5d8a76',ground:'#7bd85a',edge:'#8fd16a',solid:'#7d7a72',sedge:'#cfc9b8',cloud:'#ffffffcc',sun:1},
 {id:'canon',name:'Cañón del Cráter',cost:900,tag:'Desierto · mesas',desc:'Mesetas rojas, grietas estrechas, puentes de roca y un anillo de mesas alrededor de un cráter con torre central. Vuelo rasante o pierdes.',sky:['#e8a468','#f7d9b0'],far:'#c98a62',mid:'#b9693c',ground:'#e1a57d',edge:'#f0c090',solid:'#c9855c',sedge:'#f0cfa8',cloud:'#ffffffcc',sun:1},
 {id:'nieve',base:'canon',name:'Cañón Helado',cost:1500,tag:'Nieve · mesas',desc:'El Cañón del Cráter cubierto de nieve: mesetas blancas, hielo azulado y un sol bajo y pálido. Misma geometría, pero con el frío en las alas.',sky:['#8fb8d8','#e4f1f8'],far:'#a9c4d8',mid:'#8fb0c6',ground:'#e6f1f7',edge:'#ffffff',solid:'#cfdfe9',sedge:'#ffffff',cloud:'#ffffffcc',sun:1,tint:'#d6e6ff',pal:{rock:[['#f4f8fb','#d3e1ea'],'#9fb4c4'],spire:[['#f4f8fb','#d3e1ea'],'#9fb4c4'],mesa:[['#eef5f9','#c9dbe6'],'#8fa8ba']}},
 {id:'archi',name:'Archipiélago de Tormentas',cost:1300,tag:'Mar · tormentas',desc:'Islas con palmeras y agujas de roca sobre un mar abierto. Un estrecho central cruzado por tormentas eléctricas que te obligan a cambiar de rumbo.',sky:['#3d86c9','#bfe3f4'],far:'#6f9fc4',mid:'#4f86a8',ground:'#8bc2e4',edge:'#dac88e',solid:'#c9b98a',sedge:'#efe3b8',cloud:'#ffffffcc',sun:1},
 {id:'metro',name:'Metrópolis Nocturna',cost:1800,tag:'Ciudad · noche',desc:'Una ciudad a oscuras de rascacielos, avenidas y plazas con rotores giratorios. Callejones de 210 de ancho en el centro: sólo para pilotos con nervios de acero.',sky:['#15122e','#3a3366'],far:'#2a2650',mid:'#1f1c3c',ground:'#b9bdc7',edge:'#6a6f86',solid:'#6a7090',sedge:'#aab1d0',cloud:'#ffffff66',sun:0,time:'noche'},
 {id:'fabrica',name:'Complejo Industrial',cost:2300,tag:'Interior · mamparos',desc:'Un recinto amurallado con mamparos, compuertas, pilares y un reactor con rotor gigante. Pasillos cerrados donde cada hueco cuenta.',sky:['#4a4f40','#a9ad8a'],far:'#6c7058',mid:'#585d48',ground:'#b3ba79',edge:'#8a8f5a',solid:'#8d9276',sedge:'#d8dcb0',cloud:'#ffffff55',sun:0,tint:'#e6e2c8'},
 {id:'mundo',name:'Gran Continente',cost:3500,desc:'Un único mapa gigantesco con cinco biomas: Archipiélago de tormentas al noroeste, Cañón y su Cráter al norte, la reserva boscosa al noreste, el Valle y su fortín al suroeste, la Metrópolis en el centro sur y el Complejo Industrial amurallado al sureste.',sky:['#5aa7e8','#cfe9f7'],far:'#7fa6c9',mid:'#5d8a76',ground:'#4f8a45',edge:'#8fd16a',solid:'#7d7a72',sedge:'#cfc9b8',cloud:'#ffffffcc',sun:1,tag:'Mapa único · 5 biomas'}];
const MAPD=Object.fromEntries(MAPDEF.map(m=>[m.id,m]));
/* Hora del día: tinte multiplicado sobre la escena; se guarda por mapa */
const TIMES={amanecer:{n:'Amanecer',c:'#ffcfb4'},dia:{n:'Día',c:null},atardecer:{n:'Atardecer',c:'#ffbf88'},noche:{n:'Noche',c:'#5f6ea6'}};
const TIMEK=Object.keys(TIMES);
const curTime=id=>{if(M&&M.net&&M.tod&&M.cfg&&M.cfg.map===id&&running&&TIMES[M.tod])return M.tod;const t=SAVE.times&&SAVE.times[id];return TIMES[t]?t:((MAPD[id]||{}).time||'dia');};

/* ===== Bots ===== */
const DIFFS=[
 {name:'Mixta',mult:1.1},
 {name:'Novato',aim:.46,think:.55,cone:.07,turn:.68,margin:78,look:.75,evade:.04,man:0,hp:.76,dmg:.6,mult:.7,rng:800,lazy:.5},
 {name:'Piloto',aim:.31,think:.4,cone:.1,turn:.78,margin:68,look:.83,evade:.15,man:.08,hp:.85,dmg:.72,mult:.85,lazy:.28},
 {name:'Veterano',aim:.19,think:.27,cone:.14,turn:.88,margin:57,look:.92,evade:.35,man:.22,hp:.95,dmg:.86,mult:1},
 {name:'As',aim:.09,think:.15,cone:.18,turn:.97,margin:46,look:1.05,evade:.65,man:.45,hp:1.05,dmg:.98,mult:1.3},
 {name:'Leyenda',aim:.015,think:.07,cone:.22,turn:1.07,margin:36,look:1.2,evade:.96,man:.9,hp:1.15,dmg:1.1,mult:1.7}];
const PERS=[
 {id:'cazador',name:'Cazador',desc:'Persigue sin descanso'},{id:'acro',name:'Acróbata',desc:'Esquiva, rueda y vuela rasante'},
 {id:'franco',name:'Francotirador',desc:'Pasadas rápidas y huida'},{id:'carro',name:'Carroñero',desc:'Remata a los heridos'},{id:'berserk',name:'Berserker',desc:'No retrocede jamás'}];
const CALLS=['Rasante','Nimbo','Cuervo','Zorro','Bengala','Turbina','Fantasma','Cobra','Relámpago','Ciclón','Tiburón','Águila','Lince','Tormenta','Aspa','Picaflor','Gavilán','Trueno','Escarcha','Dinamo','Halcón','Búho','Cóndor','Pantera','Jaguar','Lobo','Orca','Mantis','Escorpión','Viento','Brasa','Cometa','Meteoro','Nebulosa','Aurora','Eclipse','Vértigo','Titán','Ónix','Rubí','Zafiro','Ámbar','Fénix','Dragón','Grifo','Quimera','Centella','Rayo','Huracán','Tornado','Monzón','Borrasca','Niebla','Escarlata','Sable','Daga','Flecha','Arpón','Lanza','Centurión','Bruma','Cenit','Ocaso','Alba','Brisa','Vendaval','Chubasco','Tempestad','Pirata','Corsario','Vikingo','Samurái','Ninja','Gladiador','Mago','Bruja','Duende','Gárgola','Yeti','Kraken','Neptuno','Atlas','Orión','Polaris','Sirio','Vega','Nova','Pulsar','Quásar','Galaxia','Cósmico','Turquesa','Coral','Cobalto','Plomo','Acero','Cromo','Bisonte','Mamut','Rinoceronte','Pelícano','Colibrí','Tucán','Loro','Gaviota','Petrel','Albatros','Cigüeña','Milano','Azor','Alcotán','Buitre','Vencejo','Golondrina'];

/* ===== Logros y retos diarios ===== */
const ACH=[
 {id:'kills10',n:'Primera sangre',d:'Derriba 10 aviones',k:'kills',t:10,rw:100},
 {id:'kills100',n:'Cazador de ases',d:'Derriba 100 aviones. Desbloquea pintura y estela Aurora',k:'kills',t:100,rw:500},
 {id:'kills500',n:'Leyenda del cielo',d:'Derriba 500 aviones',k:'kills',t:500,rw:2000},
 {id:'wins1',n:'Primer puesto',d:'Gana una partida',k:'wins',t:1,rw:150},
 {id:'wins10',n:'Campeón',d:'Gana 10 partidas',k:'wins',t:10,rw:800},
 {id:'streak5',n:'Imparable',d:'Encadena 5 kills sin morir',k:'bestStreak',t:5,rw:300},
 {id:'loops25',n:'Rizar el rizo',d:'Completa 25 bucles',k:'loops',t:25,rw:300},
 {id:'dodge50',n:'Roll maestro',d:'Esquiva 50 disparos con roll',k:'dodges',t:50,rw:400},
 {id:'near100',n:'Rozando la roca',d:'100 pasadas rasantes',k:'nearmiss',t:100,rw:400},
 {id:'assist50',n:'Jugador de equipo',d:'50 asistencias',k:'assists',t:50,rw:300},
 {id:'matches25',n:'Veterano de guerra',d:'Juega 25 partidas',k:'matches',t:25,rw:300},
 {id:'legend',n:'Domador de leyendas',d:'Gana en dificultad Leyenda. Desbloquea el efecto Glitch',k:'winsLegend',t:1,rw:1000}];
const DAILY=[
 {k:'kills',t:'Derriba {n} aviones',lo:6,hi:14,u:12},{k:'loops',t:'Completa {n} bucles',lo:3,hi:8,u:35},
 {k:'dodges',t:'Esquiva {n} disparos con roll',lo:3,hi:7,u:40},{k:'nearmiss',t:'Haz {n} pasadas rasantes',lo:6,hi:16,u:15},
 {k:'assists',t:'Consigue {n} asistencias',lo:3,hi:7,u:30},{k:'wins',t:'Gana {n} partida(s)',lo:1,hi:2,u:150},
 {k:'bestStreak',t:'Encadena {n} kills seguidas',lo:3,hi:5,u:70,max:1},{k:'flips',t:'Haz {n} medias vueltas',lo:3,hi:7,u:30},
 {k:'matches',t:'Juega {n} partidas',lo:2,hi:4,u:60}];

/* ===== Controles: acciones, acrobacias y valores por defecto (configurables en Ajustes) ===== */
const ARR={L:'←',R:'→',B:'↑',D:'↓'},TOKS=['L','R','B','D'];let kbC=null;
const ACTS=[['left','Girar a la izquierda','Vuelo'],['right','Girar a la derecha','Vuelo'],['boost','Turbo','Vuelo'],['flip','Media vuelta','Vuelo'],
 ['fire','Disparar','Combate'],['sec','Misil, cohete o bomba','Combate'],['special','Habilidad especial','Combate'],['pause','Pausa','Sistema']];
const MOVES=[
 {id:'roll',n:'Roll',seq:['L','L'],d:'Esquiva: te hace inmune a los disparos un instante.',keys:[['m_roll_l','Roll a la izquierda'],['m_roll_r','Roll a la derecha']]},
 {id:'dash',n:'Dash explosivo',seq:['B','B','B'],d:'Empujón de velocidad (gasta energía).',keys:[['m_dash','Atajo directo']]},
 {id:'tonel',n:'Doble roll',seq:['L','L','L'],d:'Roll doble: más recorrido y más tiempo de inmunidad.',keys:[['m_tonel','Atajo directo']]},
 {id:'tijera',n:'Tijera',seq:['L','R','L'],d:'Dos rolls seguidos en sentidos opuestos.',keys:[['m_tijera','Atajo directo']]},
 {id:'inmel',n:'Inmelmann',seq:['B','D'],d:'Media vuelta con impulso para cambiar de sentido.',keys:[['m_inmel','Atajo directo']]},
 {id:'bucle',n:'Bucle',seq:['D','D'],d:'Looping completo de 360°.',keys:[['m_bucle','Atajo directo']]},
 {id:'cobra',n:'Cobra',seq:['B','B','D'],d:'Frenazo brusco para que el rival te sobrepase.',keys:[['m_cobra','Atajo directo']]},
 {id:'tturbo',n:'Roll turbo',seq:['L','L','B'],d:'Roll con un impulso de velocidad (gasta energía).',keys:[['m_tturbo','Atajo directo']]}];
const KB_DEF={left:['ArrowLeft','KeyA',''],right:['ArrowRight','KeyD',''],boost:['ArrowUp','KeyW','ShiftLeft'],flip:['ArrowDown','KeyS',''],fire:['Space','KeyE','Mouse0'],sec:['KeyR','Mouse2',''],special:['KeyQ','',''],pause:['KeyP','','']};
const GP_DEF={left:['A0-','B14',''],right:['A0+','B15',''],boost:['A1-','B12','B2'],flip:['A1+','B13',''],fire:['B0','B7','B5'],sec:['B1','B6','B4'],special:['B3','',''],pause:['B9','','']};
function ctlDefaults(){const o={kb:{},gp:{},seq:{},win:1,dz:.4};for(const a in KB_DEF)o.kb[a]=KB_DEF[a].slice();for(const a in GP_DEF)o.gp[a]=GP_DEF[a].slice();
 for(const m of MOVES){o.seq[m.id]=m.seq.slice();for(const d of m.keys){o.kb[d[0]]=['','',''];o.gp[d[0]]=['','',''];}}return o;}
function ctlNormalize(){const d=ctlDefaults();if(!SAVE.ctl||typeof SAVE.ctl!=='object')SAVE.ctl=d;const c=SAVE.ctl;
 for(const dev of['kb','gp']){if(!c[dev]||typeof c[dev]!=='object')c[dev]=d[dev];for(const a in d[dev]){let v=c[dev][a];if(!Array.isArray(v))v=d[dev][a].slice();v=v.slice(0,3).map(x=>typeof x==='string'?x:'');while(v.length<3)v.push('');c[dev][a]=v;}}
 if(!c.seq||typeof c.seq!=='object')c.seq=d.seq;for(const id in d.seq){const s=c.seq[id];if(!Array.isArray(s)||s.length<2||s.length>4||s.some(k=>!TOKS.includes(k)))c.seq[id]=d.seq[id].slice();}
 if(![0,1,2].includes(c.win))c.win=1;if(!(c.dz>=.15&&c.dz<=.8))c.dz=.4;kbC=null;}
const KLAB={ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'Espacio',ShiftLeft:'Shift izq.',ShiftRight:'Shift der.',ControlLeft:'Ctrl izq.',ControlRight:'Ctrl der.',AltLeft:'Alt izq.',AltRight:'Alt der.',Enter:'Intro',NumpadEnter:'Intro (num.)',Backspace:'Retroceso',Tab:'Tab',Escape:'Esc',CapsLock:'Bloq Mayús',Mouse0:'Clic izq.',Mouse1:'Clic central',Mouse2:'Clic der.',Mouse3:'Ratón 4',Mouse4:'Ratón 5',Comma:',',Period:'.',Minus:'-',Slash:'/',Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Backslash:'\\',Backquote:'`',Equal:'=',IntlBackslash:'<',Home:'Inicio',End:'Fin',PageUp:'Re Pág',PageDown:'Av Pág',Insert:'Insert',Delete:'Supr'};
function keyLabel(c){if(KLAB[c])return KLAB[c];if(/^Key[A-Z]$/.test(c))return c.slice(3);if(/^Digit\d$/.test(c))return c.slice(5);if(/^Numpad/.test(c))return'Num '+c.slice(6).replace('Add','+').replace('Subtract','-').replace('Multiply','*').replace('Divide','/').replace('Decimal','.');return c;}
const GPN={B0:'A',B1:'B',B2:'X',B3:'Y',B4:'LB',B5:'RB',B6:'LT',B7:'RT',B8:'Atrás',B9:'Start',B10:'Pulsar stick izq.',B11:'Pulsar stick der.',B12:'Cruz ↑',B13:'Cruz ↓',B14:'Cruz ←',B15:'Cruz →',B16:'Inicio'};
function gpLabel(t){if(GPN[t])return GPN[t];const m=/^A(\d+)([+-])$/.exec(t);if(m){const i=+m[1],neg=m[2]==='-';if(i<4){const ar=i%2===0?(neg?'←':'→'):(neg?'↑':'↓');return'Stick '+(i<2?'izq.':'der.')+' '+ar;}return'Eje '+i+(neg?' −':' +');}return t;}
const isGpTok=t=>/^(B\d+|A\d+[+-])$/.test(t),tokLabel=t=>isGpTok(t)?gpLabel(t):keyLabel(t);

