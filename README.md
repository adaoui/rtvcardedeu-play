![RTVC](/public/favicon.ico/)

# RTVCardedeu Play 🎬📺

Web tipo “TV a la carta” usando **YouTube** como fuente de vídeos, con **backend local con cache** para reducir peticiones y evitar problemas de cuota.

Stack: **Vite + React + TypeScript + Tailwind + shadcn/ui**.

---

## ✨ Features (MVP)
- Home con diseño “streaming” (hero fullscreen + vídeos flotantes)
- Hero con imagen/vídeo de fondo
- Listado de últimos vídeos del canal
- Navegación simple para ver vídeos
- Backend local con cache para reducir llamadas a YouTube
- Routing con React Router

---

## 🧰 Tech Stack
- Vite
- React + TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Node.js (backend local)
- Express

---

## 🚀 Getting Started

### 1) Requisitos
- Node.js 18+ (recomendado 20+)
- npm

### 2) Instalar dependencias
```bash
npm install
```

### 3) Backend (cache local)
El proyecto incluye un **mini backend** en la carpeta `server` que:<br>
- Habla con YouTube Data API v3<br>
- Cachea las respuestas (TTL corto)<br>
- Reduce el número de peticiones desde el frontend<br>
<br>

Instalar dependencias del backend:<br>
```bash
cd server
npm install
```

Crear el archivo de variables de entorno:<br>
```bash
server/.env
```

Contenido del archivo `.env`:<br>
```bash
YOUTUBE_API_KEY=TU_API_KEY_AQUI
YOUTUBE_CHANNEL_ID=ID_DEL_CANAL
PORT=8787
CACHE_TTL_SECONDS=60
```

⚠️ Importante: el archivo `.env` NO se sube a GitHub.<br>
<br>

Arrancar el backend:<br>
```bash
npm run dev
```

El backend arrancará normalmente en:<br>
```bash
http://localhost:8787
```

### 4) Arrancar en desarrollo
Arrancar el frontend (desde la raíz del proyecto):<br>
```bash
npm run dev
```

Abre la URL que indica Vite (normalmente http://localhost:5173).
