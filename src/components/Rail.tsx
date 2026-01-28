import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import type { PlaylistItem } from "../data/playlists";
import { fetchPlaylistPoster } from "../services/youtube";

export function Rail({
  title,
  items,
}: {
  title: string;
  items: PlaylistItem[];
}) {
  const [posters, setPosters] = useState<Record<string, string | undefined>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      items.map(async (p) => {
        const poster = await fetchPlaylistPoster(p.id).catch(() => undefined);
        return [p.id, poster] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      setPosters(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-zinc-500">Playlists</span>
      </div>

      <div className="-mx-6 px-6 overflow-x-auto">
        <div className="flex gap-4 pb-2 min-w-max">
          {items.map((p, idx) => {
            const poster = posters[p.id];
            return (
              <Link
                key={`${p.id}-${idx}`}
                to={`/playlist/${p.id}`}
                className="group"
              >
                <Card className="w-[280px] bg-zinc-950 border-zinc-800 text-white hover:border-zinc-600 transition overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-zinc-900">
                      {poster ? (
                        <img
                          src={poster}
                          alt={p.title}
                          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-500 text-sm">
                          Cargando…
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    </div>

                    <div className="p-4 space-y-1">
                      <div className="font-semibold group-hover:underline">
                        {p.title}
                      </div>
                      {p.description ? (
                        <p className="text-sm text-zinc-300 line-clamp-2">
                          {p.description}
                        </p>
                      ) : null}
                      <p className="text-xs text-zinc-400">Obre la playlist</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
