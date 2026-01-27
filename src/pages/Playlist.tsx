import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  fetchPlaylistItems,
  newestFirst,
  bestThumb,
  type YouTubePlaylistItem,
} from "../services/youtube";

export default function Playlist() {
  const { playlistId } = useParams<{ playlistId: string }>();

  const [items, setItems] = useState<YouTubePlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video seleccionado (por defecto: el más nuevo)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!playlistId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPlaylistItems(playlistId, 50)
      .then((res) => {
        if (cancelled) return;
        const sorted = newestFirst(res);
        setItems(sorted);
        setSelectedVideoId(sorted[0]?.videoId ?? null); // el más nuevo
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e?.message ?? "Error loading playlist");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  const selected = useMemo(
    () => items.find((x) => x.videoId === selectedVideoId) ?? null,
    [items, selectedVideoId],
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* header mini */}
      <div className="border-b border-zinc-800/80 bg-black/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate">Playlist</h1>
            <p className="text-xs text-zinc-400 truncate">ID: {playlistId}</p>
          </div>
          <Button variant="secondary" asChild>
            <Link to="/">Volver</Link>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-zinc-300">Cargando vídeos…</p>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-red-300">Error: {error}</p>
            <p className="text-zinc-400 text-sm">
              (Si es 403/400 suele ser API key, cuota o playlist privada.)
            </p>
          </div>
        ) : items.length === 0 ? (
          <p className="text-zinc-300">No hay vídeos en esta playlist.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* PLAYER */}
            <section className="space-y-3">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                {selectedVideoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideoId}?autoplay=1&rel=0`}
                    title="YouTube video"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : null}
              </div>

              {selected ? (
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{selected.title}</h2>
                  <p className="text-sm text-zinc-400">
                    {new Date(selected.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : null}
            </section>

            {/* LISTA */}
            <aside className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Capítols
                </h3>
                <span className="text-xs text-zinc-500">{items.length}</span>
              </div>

              <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
                {items.map((it) => {
                  const thumb = bestThumb(it);
                  const active = it.videoId === selectedVideoId;

                  return (
                    <button
                      key={it.videoId}
                      onClick={() => setSelectedVideoId(it.videoId)}
                      className={[
                        "w-full text-left rounded-xl border transition overflow-hidden",
                        active
                          ? "border-zinc-500 bg-zinc-900/40"
                          : "border-zinc-800 bg-zinc-950 hover:border-zinc-600",
                      ].join(" ")}
                    >
                      <div className="flex gap-3 p-2">
                        <div className="w-28 aspect-video rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={it.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 py-1">
                          <div className="text-sm font-medium line-clamp-2">
                            {it.title}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">
                            {new Date(it.publishedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
