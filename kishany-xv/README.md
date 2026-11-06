# Kishany Florez · Mis 15 Años · El Bosque de un Renacer

Invitación digital interactiva. Pensada para el teléfono: en el celular ocupa toda la pantalla y en computador o tablet se muestra centrada dentro de un marco con forma de teléfono, para que todos vean exactamente lo mismo.

**Dirección creativa y desarrollo:** Yosimar Zuñiga · LA MOVIE AGENCY S.A.S.

---

## 1. Publicar en Vercel (15 minutos)

### Paso 1 — Subir el proyecto

1. Crea un repositorio en GitHub y sube esta carpeta completa.
2. Entra a [vercel.com](https://vercel.com) → **Add New… → Project** → elige el repositorio.
3. En *Framework Preset* elige **Other**. Deja vacíos *Build Command* y *Output Directory*.
4. **Deploy**.

La invitación ya funciona: escena 3D, música, cuenta regresiva, mapa y calendario. Las confirmaciones todavía llegan por WhatsApp hasta que hagas el paso 2.

### Paso 2 — Guardar las confirmaciones (Supabase, gratis)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre **SQL Editor → New query**, pega todo el contenido de `supabase/schema.sql` y pulsa **Run**.
3. Ve a **Project Settings → API** y copia:
   - *Project URL*
   - *service_role* (clave secreta; nunca la pongas en el código ni la compartas)
4. En Vercel: **Settings → Environment Variables** y agrega:

| Nombre | Valor |
|---|---|
| `SUPABASE_URL` | la Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | la clave *service_role* |
| `ADMIN_PASSWORD` | la contraseña que usarán los organizadores |
| `MAX_COMPANIONS` | `2` (opcional) |

5. **Deployments → Redeploy**.

Desde ese momento las confirmaciones y las canciones se guardan en la base de datos.

### Paso 3 — Dominio propio (opcional)

**Settings → Domains → Add**. Por ejemplo `kishany15.com` o `invitacion.lamovie.co`.

---

## 2. Panel de los organizadores

Entra a `tudominio.com/admin` y escribe la contraseña de `ADMIN_PASSWORD`.

Ahí ves:

- Total de personas confirmadas (invitados + acompañantes).
- Quién asiste y quién no, con sus acompañantes, celular, restricciones de alimentación y mensajes.
- Las canciones pedidas, ordenadas por votos.
- Botones para descargar todo en Excel (archivos CSV).

El buscador filtra por nombre.

---

## 3. Qué cambiar y dónde

Todo lo editable está en la carpeta `config/`. No hace falta tocar el código.

### `config/event.config.js` — datos del evento

| Quiero cambiar… | Línea |
|---|---|
| Fecha y hora | `startISO` (formato `2026-11-21T19:00:00-05:00`) |
| Lugar y salón | `venue`, `room`, `address`, `city` |
| Nombres de los padres | `parents` |
| Enlace de Google Maps | `mapsUrl` (si lo dejas vacío, se usa `mapsQuery` para buscar el lugar) |
| Playlist de Spotify | `spotifyUrl` (vacío = el botón no aparece) |
| Fecha límite para confirmar | `rsvpDeadline` |

### `config/rsvp` (dentro de `event.config.js`)

- `maxCompanions`: cuántos acompañantes puede traer cada invitado.
- `whatsappText`: el mensaje que se envía. `{nombre}`, `{personas}`, `{asistencia}` y `{mensaje}` se reemplazan solos.
- `whatsappNumber`: número que recibe las confirmaciones si la base de datos no está configurada o falla. Formato internacional, solo dígitos, sin `+` ni espacios: `573001234567`.
- `whatsappLink`: un enlace completo ya armado. Si lo escribes, tiene prioridad sobre el número.

> **Importante sobre el enlace de WhatsApp.** Después de `wa.me/` WhatsApp solo acepta un **número de teléfono**. Un enlace como `wa.me/Kishanys15thBirthday` le muestra al invitado el error «número de teléfono no válido» y no abre ningún chat. Lo que sí funciona:
>
> - `https://wa.me/573001234567` — el número de quien recibe las confirmaciones.
> - `https://wa.me/message/XXXXXXXXXXXX` — el enlace corto que genera WhatsApp Business en *Herramientas de empresa → Enlace corto*.
> - `https://chat.whatsapp.com/XXXXXXXX` — el enlace de invitación a un grupo.
>
> Con Supabase configurado (paso 2) este enlace casi nunca se usa: las confirmaciones se guardan solas y el invitado no tiene que enviar nada.

### `config/credits` (dentro de `event.config.js`)

Nombre, agencia, descripción, texto del botón y enlace de Instagram que aparecen en los créditos de producción.

### `config/branding.config.js` — el sello

El monograma K es el de la invitación física original, recortado de la pieza que entregó la dirección creativa. No se redibujó ni se generó una K nueva.

- `seal`: rutas de los archivos del sello.
- `placement`: en qué escenas aparece, de qué tamaño y con qué opacidad. Pon `enabled: false` para quitarlo de una escena.
- `agencyLogo`: ruta del logo oficial de LA MOVIE. Mientras esté vacío, el crédito aparece solo en texto.

**Cómo cambiar el sello:** reemplaza los archivos en `assets/branding/` conservando los nombres, o escribe las rutas nuevas en `seal`.

**Cómo cambiar el logo:** guarda el archivo en `assets/branding/` y escribe su ruta en `agencyLogo`.

### `config/assets.config.js` — recursos reemplazables

Cada elemento tiene un `id`, una ruta (`src`) y un tipo (`type`). Para reemplazar cualquier cosa: copia el archivo a `assets/` y escribe su ruta. Si el archivo no existe, la web usa la versión generada automáticamente y **no se rompe**.

**Cómo cambiar la puerta:** pon tu modelo en `assets/intro/` y escribe la ruta en `intro.door.src` con `type: "3d"`. Para que las dos hojas se abran, nómbralas `LeafLeft` y `LeafRight` dentro del archivo GLB. También puedes dejar la puerta generada y solo cambiar sus texturas con `textureLeft` y `textureRight`.

**Cómo cambiar las mariposas:** cada una es un objeto dentro de `floating`. Cambia `src` por una imagen PNG/WebP transparente, un modelo GLB o un video. Ajusta `scale`, `speed`, `layer` (`near`, `mid`, `far`) y `opacity`. Pon `enabled: false` para apagarla o `mobileEnabled: false` para que no aparezca en el celular.

**Cómo agregar flores u otros elementos:** copia una línea de `floating`, cámbiale el `id` y apunta a tu archivo.

**Cómo cambiar el bosque:** ajusta `forest.trees` y `forest.flowers`, o reemplaza la textura del muro en `intro.wall.src`.

### `config/music.config.js` y `config/sound.config.js` — sonido

- `music.src`: ruta del instrumental **autorizado** de «Dos Oruguitas». Colócalo en `assets/music/`. Mientras esté vacío, suena un ambiente instrumental original generado en el navegador, sin derechos de terceros.
- `sound.channels`: volumen de música y de efectos, por separado.
- `sound.effects`: los ocho sonidos de la experiencia. Cada uno puede usar tu propio archivo (`src`) o el sonido original sintetizado.

La música nunca empieza sola: suena al tocar «Descubrir la magia», como exigen iOS y Android.

### `config/animation.config.js` — cámara

Tiempos de la intro, distancia de los planos de profundidad, recorrido por el bosque y fuerza del parallax.

---

## 4. Qué incluye

**Intro.** Pantalla clara con partículas, acercamiento de cámara a una puerta 3D con el sello KF, una mariposa que cruza en primer plano y el botón «Descubrir la magia». Al tocarlo, las dos hojas giran sobre bisagras independientes, entra la luz, suena la música y la cámara atraviesa la entrada.

**Bosque.** Árboles en varios planos, flores, rayos de luz, pétalos, corazones dorados y mariposas en tres profundidades. La cámara avanza mientras el invitado desliza.

**Secciones.** Mensaje de bienvenida, datos del evento, cuenta regresiva real en hora de Colombia, guardar la fecha (Google Calendar y archivo .ics para iPhone y Outlook), dress code con colores reservados, lluvia de sobres con sobre que se abre, ubicación con mapa y botones a Google Maps y Waze, playlist colaborativa, confirmación de asistencia, escena final y créditos.

**Rendimiento.** Si el teléfono va lento, la escena baja la calidad sola. Si no hay WebGL, se muestra una versión ligera. Las animaciones se detienen cuando la pestaña no está visible y se respeta «reducir movimiento» del sistema.

---

## 5. Probar en tu computador

Necesitas Node 20 o superior. No hace falta instalar nada más: las librerías (Three.js, GSAP) y las fuentes vienen dentro del proyecto, así que la invitación funciona incluso sin internet.

```bash
npm run dev
```

Y abre:

- **Invitación:** http://localhost:3000
- **Panel:** http://localhost:3000/admin

El servidor local también ejecuta las funciones de `/api/`, igual que Vercel. Para que guarden datos de verdad en tu computador, crea un archivo `.env.local` con tus claves (puedes copiar `.env.example`) y arranca así:

```bash
node --env-file=.env.local server.js
```

Sin esas claves, la confirmación usa la ruta de WhatsApp, que es el mismo comportamiento que tendrá la web si algún día la base de datos falla.

Para detener el servidor: `Ctrl + C`.

---

## 6. Estructura

```
index.html              La invitación
admin.html              Panel de organizadores
server.js               Servidor local (npm run dev)
config/                 TODO lo editable
  event.config.js       fecha, lugar, enlaces, acompañantes
  branding.config.js    sello, paleta, opacidades, dónde aparece
  assets.config.js      recursos reemplazables
  music.config.js       música ambiental
  sound.config.js       identidad sonora
  animation.config.js   cámara y tiempos
src/
  styles/global.css
  js/                   utils · assetLoader · textures · audioManager · sfx
                        scene3d · intro · sections · forms · main
api/                    Funciones de Vercel
  rsvp.js  songs.js  admin.js  _lib.js
supabase/schema.sql     Base de datos
assets/
  branding/             Sello y monograma K oficiales
  fonts/                Fuentes alojadas localmente (woff2, licencia OFL)
  vendor/               Three.js y GSAP dentro del proyecto
  music/ audio/         Música y efectos (coloca aquí tus archivos)
  intro/ floating/ …    Modelos, texturas y elementos reemplazables
```

---

## 7. Licencias y contenido

- El monograma K y la textura del sello provienen de la invitación original de Kishany, entregada por la dirección creativa.
- La música ambiental y los ocho efectos son originales, generados en el navegador. Para usar «Dos Oruguitas» se requiere un archivo con licencia; colócalo en `assets/music/` y escribe su ruta.
- No se incluyen datos bancarios, coordenadas inventadas ni fotografías de personas.

---

**LA MOVIE AGENCY S.A.S.** · Creative Direction · Audiovisual Production · Interactive Digital Experiences
