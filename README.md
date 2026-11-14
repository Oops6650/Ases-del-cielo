# Ases del Cielo

Juego de combate aéreo con vista cenital: partidas contra bots, multijugador por sala (PeerJS), pantalla dividida, garaje, pase de batalla y tutorial interactivo.

Es una web estática: no necesita compilar ni instalar nada.

## Estructura

```
index.html            Página y maquetación de los menús
css/style.css         Estilos
js/assets.js          Contornos de las rocas
js/i18n.js            Idiomas (es, en, ca, it…)
js/vendor/peerjs.min.js  PeerJS 1.5.4 (MIT), multijugador
js/game01.js … game17.js  El juego, en orden de carga (ver abajo)
js/cinematics.js      Cinemática de recompensas
CAMBIOS.md            Registro de las mejoras incorporadas (derribo de aviones, joystick táctil, IA, UI…)
.nojekyll             Evita que GitHub Pages procese los archivos con Jekyll
```

Los `game*.js` son scripts clásicos que comparten ámbito global, así que **el orden de las etiquetas `<script>` en `index.html` importa**:
utilidades → armas/aviones → guardado → mundo y mapas → IA → partida → dibujo → HUD → estilo/parallax → efectos → interfaz → progresión → tutorial → mando.

## Publicar en GitHub Pages

1. Sube todo el contenido de esta carpeta a la raíz de un repositorio (incluido `.nojekyll`).
2. En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Espera un minuto y abre `https://TU_USUARIO.github.io/NOMBRE_REPO/`.

Todas las rutas son relativas, así que funciona tanto en la raíz de un dominio como en un subdirectorio.

## Probar en local

Abrir `index.html` con doble clic puede funcionar, pero es mejor servirlo:

```
python3 -m http.server 8000
```

y abrir http://localhost:8000

## Notas

- Las tipografías (Oswald y Barlow) se cargan desde Google Fonts. Sin conexión se usa la fuente del sistema.
- El multijugador online está activo en `*.github.io` y en localhost. En otros dominios arranca en modo demostración; añade `?online` a la URL para activarlo.
- Las partidas, monedas y ajustes se guardan en el `localStorage` del navegador.
