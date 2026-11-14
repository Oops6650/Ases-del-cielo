'use strict';
/* ===== Utilidades ===== */
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),rint=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d;};
function mulberry(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const nf=n=>Math.round(n).toLocaleString('es-ES');

/* ===== Armas ===== */
/* ═══════════════════════════════════════════════════════════════════════════
   ★★★ AMPLIO · CONFIGURACIÓN GENERAL ★★★
   Todos los cambios de "juego más amplio, rápido y de largo alcance" están
   marcados con un comentario que empieza por  ★ AMPLIO #n  (usa Ctrl+F "AMPLIO").
   Para ajustar el efecto basta con tocar los números de este bloque:
     #1  Configuración (este bloque)
     #2  Armas: más velocidad de bala y más alcance          (tras la tabla GUNS)
     #3  Aviones: más velocidad, aceleración y giro más amplio (effStats)
     #4  Mapas más grandes (escalado de geometría)            (scaleB / loadMap)
     #5  Aparición, anillos y recogidas adaptados al tamaño   (spawnPlane, loadMap, newMatch)
     #6  REBUFO (estela aerodinámica)                         (updPlane + emitTrail + HUD)
     #7  Misiles y cohetes con más alcance                    (fireSec / updShots)
     #8  IA de bots adaptada a combate a distancia            (updAI)
     #9  Cámara más alejada y con más anticipación            (render / update)
     #10 Colisión por barrido a alta velocidad + bordes       (updPlane)
     #11 Torretas con más alcance                             (updTurrets)
   ═══════════════════════════════════════════════════════════════════════════ */
/* ★ AMPLIO #1 — parámetros */
const AMPLIO={
 speedK:1.5,      /* multiplicador de velocidad de crucero de todos los aviones */
 accelK:1.35,     /* multiplicador de aceleración */
 turnK:.9,        /* <1 = giros más abiertos (menos cuerpo a cuerpo) */
 gunSpdK:1.55,    /* velocidad de las balas */
 gunLifeK:1.5,    /* duración de las balas (alcance = velocidad × duración) */
 gunSpreadK:.75,  /* dispersión: menor = más precisión a larga distancia */
 secSpdK:1.5,     /* velocidad de misiles y cohetes */
 secLifeK:1.45,   /* duración de misiles y cohetes */
 assistRange:2400,/* alcance de la ayuda de puntería de las balas */
 lockRange:3000,  /* alcance de fijación de misiles */
 geoK:1.6,        /* tamaño de los mapas (el Gran Continente no se escala) */
 zoomK:.78,       /* <1 = cámara más alejada (se ve más mapa) */
 boostTurn:.8,   /* multiplicador de giro mientras se usa turbo/boost */
 lookAhead:.6,    /* cuánto se adelanta la cámara en la dirección de vuelo */
 turretK:1.3,     /* alcance y velocidad de bala de las torretas */
 /* rebufo: zona cónica detrás de otro avión que te da velocidad */
 draft:{len:1100,min:70,w0:55,w1:.08,gain:.32,accel:1.9,energy:9,ang:.75}
};
const GUNS={
 mg:{n:'Ametralladora',rate:.085,dmg:5,spd:920,life:.95,spread:.03,k:1,off:0,w:2.2,col:'#ffe27a'},
 twin:{n:'Ametralladoras gemelas',rate:.09,dmg:4.2,spd:920,life:.95,spread:.035,k:2,off:5,w:2,col:'#ffe27a'},
 laser:{n:'Láser pulsado',rate:.12,dmg:7,spd:1500,life:.6,spread:0,k:1,off:0,w:3,col:'#6df7ff'},
 cannon:{n:'Cañón pesado',rate:.34,dmg:20,spd:820,life:1.05,spread:.012,k:1,off:0,w:5,col:'#ffb066'},
 dcannon:{n:'Cañones dobles',rate:.3,dmg:15,spd:800,life:1,spread:.02,k:2,off:7,w:4.5,col:'#ffb066'},
 triple:{n:'Triple abanico',rate:.15,dmg:6,spd:900,life:.85,spread:.1,k:3,off:0,w:2.4,col:'#ff9a5a',fan:1},
 plasma:{n:'Plasma',rate:.17,dmg:12,spd:1100,life:.8,spread:.02,k:1,off:0,w:4,col:'#ff6ef5'}};
/* ★ AMPLIO #2 — balas más rápidas y de más alcance (alcance = spd × life) */
for(const g of Object.values(GUNS)){g.spd*=AMPLIO.gunSpdK;g.life*=AMPLIO.gunLifeK;if(!g.fan)g.spread*=AMPLIO.gunSpreadK;}
/* ★ FIN AMPLIO #2 */
const SECS={
 misil:{n:'Misiles guiados',desc:'Persiguen al objetivo'},
 cohetes:{n:'Ráfaga de cohetes',desc:'Tres cohetes sin guía'},
 bomba:{n:'Bombas',desc:'Caen y explotan en área'}};
const SPECS={
 dash:{n:'Embestida',desc:'Salto de velocidad enorme y 0,6 s de inmunidad: úsalo para escapar o para embestir'},
 turbo:{n:'Postcombustión',desc:'3,5 s a toda velocidad con energía infinita: acorrala o huye'},
 escudo:{n:'Coraza',desc:'4 s inmune a todo el daño: dispara sin miedo'},
 cloak:{n:'Sigilo letal',desc:'5 s invisible: los misiles pierden el fijado, los bots te ignoran y tu daño se dobla'},
 repair:{n:'Taller',desc:'Recupera el 50 % del casco y recarga todos tus misiles o bombas'},
 overdrive:{n:'Sobrecarga',desc:'5 s disparando el doble de rápido: derrite a quien tengas delante'},
 nova:{n:'Onda de choque',desc:'Explosión a tu alrededor: daña y frena a los rivales cercanos y destruye sus proyectiles'},
 fenix:{n:'Renacer',desc:'Pasiva: si te destruyen, reapareces al instante con la mitad del casco (se recarga)'}};

/* ===== Aviones ===== */
const PLANES=[
 {id:'colibri',name:'Colibrí',role:'Ligero y ágil',desc:'Diminuto y nervioso. Gira casi sobre sí mismo, pero un par de impactos lo parten.',cost:0,
  stats:{spd:5,acc:7,man:8,hp:3,pow:3},gun:'twin',sec:{t:'misil',n:2,rl:9},sp:{t:'dash',cd:10},shape:{len:54,bh:8,wing:22,tail:15,jet:0}},
 {id:'halcon',name:'Halcón',role:'Equilibrado',desc:'El avión de escuela de todo ás. Sin puntos débiles ni fuertes.',cost:0,
  stats:{spd:6,acc:6,man:6,hp:5,pow:5},gun:'mg',sec:{t:'misil',n:3,rl:7},sp:{t:'turbo',cd:16},shape:{len:62,bh:9,wing:26,tail:17,jet:0}},
 {id:'tabano',name:'Tábano',role:'Interceptor veloz',desc:'Reactor con láser rápido y sobrecarga de disparo. Frágil, pero llega antes que nadie.',cost:900,
  stats:{spd:8,acc:7,man:6,hp:3,pow:4},gun:'laser',sec:{t:'cohetes',n:2,rl:8},sp:{t:'overdrive',cd:16},shape:{len:66,bh:8,wing:20,tail:14,jet:1}},
 {id:'mastin',name:'Mastín',role:'Pesado y resistente',desc:'Blindado y bruto. Cañón pesado y bombas, a cambio de girar como una puerta.',cost:1300,
  stats:{spd:4,acc:3,man:3,hp:9,pow:7},gun:'cannon',sec:{t:'bomba',n:4,rl:8},sp:{t:'escudo',cd:26},shape:{len:76,bh:13,wing:34,tail:20,jet:0,twin:1}},
 {id:'vibora',name:'Víbora',role:'Acrobático',desc:'Las acrobacias le cuestan la mitad de energía. Para quien vive en el filo.',cost:1900,
  stats:{spd:6,acc:6,man:9,hp:4,pow:5},gun:'twin',sec:{t:'misil',n:2,rl:8},sp:{t:'dash',cd:9},acro:1,shape:{len:60,bh:8,wing:24,tail:15,jet:0}},
 {id:'condor',name:'Cóndor',role:'Potencia de fuego',desc:'Plataforma de armas. Abanico triple y cohetes, con taller de reparación en pleno vuelo.',cost:2700,
  stats:{spd:4,acc:4,man:4,hp:8,pow:9},gun:'triple',sec:{t:'cohetes',n:3,rl:9},sp:{t:'repair',cd:32},shape:{len:80,bh:12,wing:36,tail:20,jet:1,twin:1}},
 {id:'espectro',name:'Espectro',role:'Sigilo y velocidad',desc:'Se vuelve invisible y golpea el doble. Ideal para emboscar a quien pelea con otro.',cost:3600,
  stats:{spd:8,acc:6,man:7,hp:4,pow:6},gun:'laser',sec:{t:'misil',n:3,rl:9},sp:{t:'cloak',cd:22},shape:{len:70,bh:7,wing:30,tail:10,jet:1}},
 {id:'leviatan',name:'Leviatán',role:'Bombardero',desc:'Una fortaleza volante. Lento y enorme, con seis bombas y una onda de choque que limpia el cielo.',cost:4800,
  stats:{spd:3,acc:2,man:2,hp:10,pow:8},gun:'dcannon',sec:{t:'bomba',n:6,rl:7},sp:{t:'nova',cd:20},shape:{len:96,bh:15,wing:42,tail:24,jet:0,twin:1}},
 {id:'rayo',name:'Rayo',role:'Velocista',desc:'Un cohete con alas. Nadie lo alcanza, pero cualquier roce lo destroza.',cost:5800,
  stats:{spd:10,acc:8,man:5,hp:2,pow:3},gun:'mg',sec:{t:'cohetes',n:2,rl:7},sp:{t:'turbo',cd:14},shape:{len:68,bh:7,wing:16,tail:12,jet:1}},
 {id:'fenix',name:'Fénix',role:'Leyenda',desc:'Excelente en todo y con segunda vida. El orgullo de cualquier garaje.',cost:9000,
  stats:{spd:8,acc:8,man:8,hp:8,pow:8},gun:'plasma',sec:{t:'misil',n:4,rl:7},sp:{t:'fenix',cd:70},shape:{len:72,bh:10,wing:30,tail:18,jet:0}},
 {id:'gorrion',name:'Gorrión',role:'Ágil y barato',desc:'Un poco más duro que el Colibrí y con ametralladora. Ideal para dar el salto desde los aviones de inicio.',cost:600,
  stats:{spd:6,acc:6,man:7,hp:3,pow:4},gun:'mg',sec:{t:'misil',n:2,rl:8},sp:{t:'dash',cd:9},shape:{len:56,bh:8,wing:24,tail:15,jet:0}},
 {id:'lince',name:'Lince',role:'Cazador sigiloso',desc:'Láser preciso y capa de invisibilidad. Acecha, aparece y vuelve a desaparecer.',cost:1600,
  stats:{spd:7,acc:6,man:7,hp:4,pow:5},gun:'laser',sec:{t:'misil',n:3,rl:8},sp:{t:'cloak',cd:26},shape:{len:64,bh:8,wing:22,tail:13,jet:1}},
 {id:'jabali',name:'Jabalí',role:'Asalto blindado',desc:'Casco gordo, cañón y cohetes. Entra por la puerta grande y sale caminando.',cost:2300,
  stats:{spd:4,acc:4,man:4,hp:9,pow:8},gun:'cannon',sec:{t:'cohetes',n:3,rl:8},sp:{t:'escudo',cd:24},shape:{len:78,bh:13,wing:32,tail:19,jet:0,twin:1}},
 {id:'cuervo',name:'Cuervo',role:'Francotirador',desc:'Reactor esbelto con láser de largo alcance y sobrecarga. Cada disparo cuenta.',cost:3000,
  stats:{spd:6,acc:5,man:6,hp:5,pow:8},gun:'laser',sec:{t:'misil',n:4,rl:8},sp:{t:'overdrive',cd:18},shape:{len:74,bh:7,wing:28,tail:10,jet:1}},
 {id:'trueno',name:'Trueno',role:'Tormenta aérea',desc:'Abanico triple, cohetes en ráfaga y onda de choque. Ruido y furia en un solo avión.',cost:4000,
  stats:{spd:5,acc:5,man:5,hp:7,pow:9},gun:'triple',sec:{t:'cohetes',n:4,rl:7},sp:{t:'nova',cd:24},shape:{len:82,bh:12,wing:38,tail:21,jet:1,twin:1}},
 {id:'cobra',name:'Cobra',role:'Acrobático a reacción',desc:'Reactor que gira sobre un sello y gasta la mitad de energía en acrobacias.',cost:5200,
  stats:{spd:8,acc:7,man:9,hp:3,pow:6},gun:'twin',sec:{t:'misil',n:3,rl:7},sp:{t:'dash',cd:8},acro:1,shape:{len:62,bh:7,wing:26,tail:14,jet:1}},
 {id:'titan',name:'Titán',role:'Bombardero supremo',desc:'Ocho bombas, cañón doble y taller de reparación. Un castillo con alas.',cost:7600,
  stats:{spd:3,acc:2,man:2,hp:10,pow:9},gun:'dcannon',sec:{t:'bomba',n:8,rl:6},sp:{t:'repair',cd:28},shape:{len:104,bh:16,wing:46,tail:26,jet:0,twin:1}},
 {id:'quimera',name:'Quimera',role:'Prototipo experimental',desc:'Plasma, cinco misiles y turbo cortísimo. El avión que los ases sueñan con tener.',cost:12000,
  stats:{spd:9,acc:8,man:8,hp:7,pow:9},gun:'plasma',sec:{t:'misil',n:5,rl:6},sp:{t:'turbo',cd:12},shape:{len:74,bh:9,wing:32,tail:12,jet:1}}];
PLANES.sort((a,b)=>a.cost-b.cost);
const PLANE=Object.fromEntries(PLANES.map(p=>[p.id,p]));
const UPS=[['spd','Velocidad'],['acc','Aceleración'],['man','Maniobra'],['hp','Resistencia'],['pow','Potencia']];
const upCost=(def,lv)=>Math.round((60+def.cost*.05)*(lv+1)*(1+lv*.35)/10)*10;
function effStats(def,up){const s=def.stats,u=up||{spd:0,acc:0,man:0,hp:0,pow:0};
 /* ★ AMPLIO #3 — velocidad, aceleración y giro (ver AMPLIO.speedK/accelK/turnK) */
 return{cruise:(250+s.spd*34)*(1+.05*u.spd)*AMPLIO.speedK,accel:(110+s.acc*28)*(1+.07*u.acc)*AMPLIO.accelK,turn:(1.5+s.man*.27)*(1+.045*u.man)*AMPLIO.turnK,hp:(55+s.hp*22)*(1+.09*u.hp),pow:(.7+s.pow*.075)*(1+.07*u.pow)};}

/* ═══════════════════════════════════════════════════════════════════════════
   ★★★ HERIDO · PESO · CAJAS ★★★
   Cambios nuevos. Todos están marcados con un comentario que empieza por
   "★ HERIDO", "★ PESO" o "★ CAJAS" (usa Ctrl+F para encontrarlos):
     ★ HERIDO #1  Configuración y funciones auxiliares            (este bloque)
     ★ HERIDO #2  Las acrobacias cuestan más energía              (startRoll / startDash / startFlip / startMove)
     ★ HERIDO #3  Las acrobacias se ejecutan más despacio         (startRoll / startFlip / startMove / updPlane)
     ★ HERIDO #4  Física inestable: giro con retraso, menos fuerza y temblor (updPlane)
     ★ HERIDO #5  Aviso en el HUD                                 (drawHUD)
     ★ PESO   #1  Aviones grandes: acrobacias lentas y pesadas    (heavyMul + acroTimeMul + updPlane)
     ★ CAJAS  #1  Cajas-obstáculo con aspecto de caja de madera 3D (sCrate / drawCrateTop / drawSolidSoft)
     ★ CAJAS  #2  Cajas de recompensa flotantes como cajas 3D      (drawSupplyCrate / drawActors)
   ═══════════════════════════════════════════════════════════════════════════ */

/* ★ HERIDO #1 — parámetros de las heridas.
   Idea central: "nivel de herida" (wound) = 0 con el casco intacto … 1 con el casco casi destruido.
   Todos los efectos crecen de forma LINEAL con ese nivel, así el castigo es proporcional al daño.
   Para equilibrar el juego basta con tocar los números de esta tabla. */
const WOUND={
 deadzone:.10,  /* fracción de casco perdido que se ignora: un rasguño (≤10 %) no penaliza para nada */
 costK:.90,     /* sobrecoste de energía de las acrobacias con la herida máxima: ×(1+0,90) = ×1,9 */
 slowK:.75,     /* alargamiento de la duración de las acrobacias con la herida máxima: ×1,75 (más lentas) */
 turnLoss:.18,  /* pérdida de velocidad máxima de giro con la herida máxima (−18 %): "pérdida de fuerza" */
 lag:.35,       /* pérdida de capacidad de respuesta del giro con la herida máxima (−35 %): "pérdida de reflejos" */
 wobble:.55,    /* inestabilidad: oscilación aleatoria del giro, en rad/s, con la herida máxima (≈ ±13° de deriva).
                   Es lo bastante suave como para poder corregirla siempre: reto, pero no injugable */
 wobF1:1.4,wobF2:3.1, /* frecuencias (rad/s) de las dos ondas que forman el temblor; mezcladas parece aleatorio pero es suave */
 bots:true      /* true = los bots también sufren estas penalizaciones (reglas iguales para todos); false = solo el jugador */
};
/* ★ PESO #1 — parámetros del tamaño. La "talla" se mide con la longitud del fuselaje (def.shape.len):
   Colibrí 54 · Víbora 60 · Halcón 62 · Tábano 66 · Rayo 68 · Espectro 70 · Fénix 72  → pequeños/estándar (sin penalización)
   Mastín 76 · Cóndor 80 · Leviatán 96                                              → grandes (acrobacias más lentas) */
const HEAVY={
 minLen:74,     /* a partir de esta longitud un avión se considera "grande" */
 maxLen:96,     /* longitud a la que se alcanza el máximo (el Leviatán) */
 base:.45,      /* alargamiento mínimo de las acrobacias de cualquier avión grande: +45 % (Mastín ≈ ×1,5) */
 extra:.55,     /* alargamiento adicional que crece con la longitud: el Leviatán llega a ×2,0 y el Cóndor a ≈ ×1,6 */
 inertia:.25,   /* "peso" al virar: los aviones grandes tardan más en responder al mando (0 = sin efecto) */
 maxTm:3        /* tope del multiplicador de tiempo combinado (herida × tamaño): evita acrobacias eternas */
};

/* ★ HERIDO #1 — woundLevel(p): devuelve el nivel de herida del avión p, de 0 (sano) a 1 (casi muerto).
   Por qué: un único número que resume "cuánto daño llevo" y del que se derivan todos los castigos.
   Se ignora el primer WOUND.deadzone de daño para que un par de balazos sueltos no molesten. */
function woundLevel(p){
 if(!p||!p.maxHp)return 0;                         /* avión inexistente o sin casco definido → sano */
 if(p.ai&&!WOUND.bots)return 0;                    /* si se configuró "solo jugador", los bots nunca están heridos */
 const lost=1-clamp(p.hp/p.maxHp,0,1);             /* fracción de casco perdida (0 = intacto, 1 = destruido) */
 return clamp((lost-WOUND.deadzone)/(1-WOUND.deadzone),0,1); /* se reescala para que 'deadzone' → 0 y 100 % perdido → 1 */
}
/* ★ HERIDO #2 — woundCostMul(p): multiplicador del coste de energía de las acrobacias (1 = coste normal).
   Por qué: un piloto herido se agota antes; cada maniobra le exige más. */
function woundCostMul(p){return 1+WOUND.costK*woundLevel(p);}
/* ★ HERIDO #2 — woundCost(p,base): coste de energía final de una maniobra cuyo coste normal es 'base'. */
function woundCost(p,base){return base*woundCostMul(p);}
/* ★ PESO #1 — heavyMul(def): multiplicador de "pesadez" de un tipo de avión (1 = pequeño/estándar, hasta 2 = Leviatán).
   Por qué: un bombardero enorme no puede dar una media vuelta tan rápido como un caza ligero.
   Es independiente de la salud: solo depende del tamaño del fuselaje. */
function heavyMul(def){
 const len=def.shape.len;
 if(len<HEAVY.minLen)return 1;                                                  /* pequeño o estándar: sin cambios */
 const t=clamp((len-HEAVY.minLen)/(HEAVY.maxLen-HEAVY.minLen),0,1);             /* 0 en el límite … 1 en el más largo */
 return 1+HEAVY.base+HEAVY.extra*t;                                             /* base fija + parte proporcional al tamaño */
}
/* ★ HERIDO #3 / ★ PESO #1 — acroTimeMul(p): cuánto se alarga la duración de una acrobacia que empieza AHORA.
   Combina las dos causas (tamaño × herida) y se limita a HEAVY.maxTm.
   Se llama una sola vez al INICIAR cada maniobra y el resultado se guarda en el avión (rollTm / flipDur),
   así, si te hieren a mitad de una voltereta, esa voltereta no cambia de ritmo ni queda a medio girar. */
function acroTimeMul(p){return clamp(heavyMul(p.def)*(1+WOUND.slowK*woundLevel(p)),1,HEAVY.maxTm);}

