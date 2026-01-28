export type GroupRule = {
  group: string; // nombre del rail
  match: RegExp; // match sobre el título de la playlist
  merge: boolean; // true = agrupa varias playlists en 1 rail
  priority?: number; // por si varias reglas encajan
};

export const GROUP_RULES: GroupRule[] = [
  // ✅ Agrupar
  {
    group: "Informatiu",
    match: /noticies|notícies|actualitat/i,
    merge: true,
    priority: 90,
  },
  {
    group: "Premis Tele Cardedeu",
    match: /premis.*tele.*cardedeu/i,
    merge: true,
    priority: 90,
  },
  {
    group: "Objectiu Paki",
    match: /.*paki.*/i,
    merge: true,
    priority: 90,
  },
  {
    group: "Festa Major",
    match: /festa.*|major/i,
    merge: true,
    priority: 90,
  },
  {
    group: "Esports",
    match:
      /Club.*|Futbol.*|Natacio.*|Voleibol.*|Tenis.*|Basquet.*|Esport.*|Handbol.*/i,
    merge: true,
    priority: 100,
  },
  // ❌ No agrupar (ej: podcasts, quieres que sigan separados)
  // No pongas regla de Podcast aquí, así no se agrupa.
];
