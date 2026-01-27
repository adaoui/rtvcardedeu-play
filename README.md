# RTVCardedeu Play 🎬📺

Web tipo “TV a la carta” usando **playlists de YouTube** como catálogo.

Stack: **Vite + React + TypeScript + Tailwind + shadcn/ui**.

---

## ✨ Features (MVP)
- Home con diseño “streaming” (hero + rail horizontal de playlists)
- Página de playlist con:
  - Player grande
  - Lista de capítulos (vídeos) con miniaturas
  - Reproducción por defecto del vídeo más reciente (ordenado por `publishedAt`)
- Routing con React Router

---

## 🧰 Tech Stack
- Vite
- React + TypeScript
- Tailwind CSS
- shadcn/ui
- React Router

---

## 🚀 Getting Started

### 1) Requisitos
- Node.js 18+ (recomendado 20+)
- npm

### 2) Instalar dependencias
```bash
npm install
```
### 3) Variables de entorno
Crea un archivo .env.local en la raíz:
```bash
VITE_YOUTUBE_API_KEY=TU_API_KEY_AQUI
```
⚠️ Importante: .env.local NO se sube a GitHub.

### 4) Arrancar en desarrollo
```bash
npm run dev
```
Abre la URL que indica Vite (normalmente http://localhost:5173).<br>
<br>
### 🔑 YouTube Data API v3 (API Key)
Este proyecto usa YouTube Data API v3 para leer:<br>
Items de una playlist (títulos, miniaturas, fechas, videoId)<br>
No requiere OAuth para contenido público, solo API Key.<br>
<br>
**Errores comunes:**<br>
403 quotaExceeded: el proyecto de Google Cloud ha excedido cuota o la key está mal configurada (restricciones / API no habilitada).<br>
API not enabled: hay que habilitar YouTube Data API v3 en el proyecto de GCP.<br>

### 🗂️ Estructura del proyecto
```bash
src/
  components/
    layout/
      Shell.tsx
    ui/                # shadcn/ui components (Button, Card, Input, etc.)
  data/
    playlists.ts       # catálogo de playlists
  pages/
    Home.tsx
    Playlist.tsx
    Watch.tsx
  services/
    youtube.ts         # llamadas a YouTube Data API v3
```

### 📝 Configuración de playlists
Edita src/data/playlists.ts y añade tus playlists:<br>
Si tienes una URL tipo:<br>
https://www.youtube.com/playlist?list=PLxxxxxxxxxxxx<br>
el ID es lo que va después de list=.<br>
Ejemplo:<br>
```bash
export const PLAYLISTS = [
  {
    id: "PLxxxxxxxxxxxx",
    title: "Cardedeu Informatiu",
    description: "Informatius setmanals",
  },
];
```

### 📌 Scripts
```bash
npm run dev       # desarrollo
npm run build     # build producción
npm run preview   # preview del build
```
