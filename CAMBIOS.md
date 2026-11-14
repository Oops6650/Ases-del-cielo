# Ases del Cielo — registro de cambios de esta conversación

Base: el `Index.html` original que subiste. `Index.diff` es el diff unificado (original → versión actual, 47 bloques) para fusionar con tu otra versión:
`patch -p0 Index.html < Index.diff` o abrirlo en cualquier herramienta de merge (la mayoría de cambios están marcados con `★` en el código; busca con Ctrl+F).

Marcas de búsqueda: `★ MEJORA`, `★ HERIDO`, `★ PESO`, `★ CAJAS`, `★ JOYSTICK`, `★ DERRIBO`, `★ REBOTE`, `★ AGUA RECORTADA`, `★ AGUA LIMPIA`, `★ GRAN CONTINENTE`, `★ MEJORAS UI`.

---
## 1. Último pedido (esta ronda)
| Cambio | Dónde |
|---|---|
| **Los efectos de agua solo se ven sobre el agua**: ondas, espuma, chorros, gotas, burbujas, mancha de aceite y halo del hundimiento se dibujan en un lienzo aparte recortado con una máscara de agua (biomas `archi` + lagos/ríos − islas/tierra − obstáculos). | `waterShapes`, `withWaterClip`, `drawSlick`; `drawScars` y `drawWrecks` (pasada `pass(c,wt)`); flag `WTR` en `wpart` (`o.wt`) |
| **Ríos y lagos sin nada encima** (salvo puentes): árboles y rocas/obstáculos con el centro en un río o lago se eliminan al cargar el mapa. No toca el mar de los archipiélagos, torretas, móviles ni puentes. | `purgeWater(b)` (llamada desde `loadMap`, tras `scaleB`) |
| **Gran Continente, abajo a la izquierda: ahora césped.** Era el lago del Valle; se quita en el mundo (el río sigue). | `MAPB.mundo` → `if(id==='valle') b.C=b.C.filter(...)` |
| **Piezas del avión rebotan** contra rocas/paredes (nunca las atraviesan), pierden energía y, si pegan fuerte, hacen un pequeño cráter (máx. 3 por pieza, no en online). Chispas y "tic" al rebotar. | `edgeNear`, `pieceBounce` (se llama en `updWrecks`) |
| El avión derribado que se **arrastra** por el suelo ya no atraviesa obstáculos: se desintegra contra ellos. | `updWrecks`, modo `slide` |
| Ondas del agua (ronda anterior, ya aprobadas): arcos rotos, chorros, espuma en racimo, mancha irregular. | `ringFx`, `blobPath`, rama agua de `wreckImpact` |

## 2. Derribo de aviones (en vez de desaparecer)
Sistema completo insertado justo antes de `function kill(`: `WG` (tabla por suelo), `groundAt`, `WQ`, `wpart/wpiece/wscar`, `pieceShape`, `spawnPiece`, `spawnWreck`, `wreckImpact`, `disintegrate`, `updWrecks`, `drawScars`, `drawWrecks`.
- Cae con humo y fuego; según el suelo: **agua** (salpica y se hunde), **césped/valle** (surco de tierra y se desintegra), **cañón/mesa, hielo, metrópolis, fábrica** (cada uno con polvo, chispas, vapor, etc.), **obstáculo** (se desintegra).
- Engancha en: `kill()` (llama a `spawnWreck`), host update tras `updShots(dt)` y `netGuestStep` (llama a `updWrecks`), `netGuestSnap` (invitados), `drawTerrainSoft` (`drawScars`), `drawActors` (`drawWrecks`).
- Respeta la opción de partículas (`SAVE.cfg.parts`). La cámara sigue al avión derribado. Cartel "¡Derribado!" subido y más pequeño (`bY=Math.max(64,VH*.17)`).

## 3. Misil entrante, camera shake y HUD
- Flechas (chevrons) alrededor del avión que indican **por dónde viene cada misil** (≤1900 px, hasta 3; rojo si te apunta). Se quitó la flecha de borde antigua del círculo "¡MISIL!".
- **Camera shake**: `selfShake`, `camShake`; explosiones, disparo, secundaria, dash, boost, misil cercano, herido.
- Indicador de dirección del impacto (`pl.hitDir`, en `damage()`).
- **Eliminados** los avisos "Herido · acrobacias…" y "REBUFO…" (se mantiene el popup de truco "REBUFO +monedas").

## 4. Controles táctiles estilo Brawl Stars
- `#touch`: `#stickZone` + `#stick` (joystick flotante a la izquierda), botones `.cr` fire(grande)/special/sec/boost/flip/roll a la derecha.
- JS: giro por ángulo del stick (`tk.sd`, `tk.sa`, rama en `mk`), `stickTok` (gestos → tokens L/R de combos), `stickReset`, botón ROLL (`I.rollDir`/`I.roll`).
- **Sin solapamientos al aumentar el tamaño**: `fitTouch()` calcula `--tse = max(.7, min(escala, altoLibre/180, VW*.4/240))` y se llama desde `touchState`.
- Textos del tutorial táctil actualizados (stick/TURBO/GIRO/ROLL) — solo en español.

## 5. Gameplay (prioridad alta y media)
- `AMPLIO.boostTurn:.8` (el turbo reduce el giro); coste del boost 24→30/s.
- Humo y temblor por herida; **jefe Leviatán** cada 5 oleadas (casco ×3); récord `SAVE.rec['waves_'+mapa]`.
- IA: personalidades (`PERS`), Carroñero ataca a los heridos, Leyenda usa más especiales; `wpick(p)` reparte a los bots en ángulos alrededor de la colina/zona.
- Cajas de munición: +30 energía (no recarga completa); cada truco resta 1 s al enfriamiento del especial.
- Online: límite de ritmo de entrada en `netHostInput`; aviso "Online: los obstáculos no se esculpen".
- `SAVE`: migraciones `MIG` + `SAVE.v`; `SAVE.cheat` no cuenta para récords.

## 6. UI
- `applyUIPrefs()` (`html.lowfx`, `body.lefty`, `--tsz`, `--top`); ajustes: efectos visuales del menú y opciones táctiles.
- `todayPanel()`; pantalla de resultados con resumen + Revancha / Ver detalles / Compartir (`vResult`, `shareResult`).
- Tutorial: botón `endbasic` y +150 monedas por el avanzado; minimapa ampliable al tocar (`M.mmBig`) y cajas en el minimapa.
- aria-live / aria-labels; textos i18n adicionales.

## Pendiente / ojo al fusionar
- Textos nuevos del tutorial táctil solo en español (sin traducir a en/ca/it/fr/de).
- `loadMap`: el `purgeWater(b)` va justo después de `scaleB`; si tu otra versión toca ahí, mantenlo antes de `b.C=b.C.filter(...)`.
- `drawWrecks` tiene ahora una función interna `pass(c,wt)`; si tocas el dibujo de partículas, hazlo dentro de ella.
- Los cráteres de las piezas usan `sculptAt` (requiere el sistema ESCULPIR; se omiten con `M.net`).
- Sin hacer aún: consolidar capas CSS, ajuste fino de `AMPLIO.geoK`, tests unitarios, sincronizar cráteres online.
