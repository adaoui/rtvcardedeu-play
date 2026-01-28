import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { fetchPlaylistItems, newestFirst, type YouTubePlaylistVideo } from "../services/youtube";
import { Button } from "../components/ui/button";

export default function Playlist() {
  const { id } = useParams();
  const playlistId = id ?? "";

  const [items, setItems] = useState<YouTubePlaylistVideo[]>([]);
  const [selected, setSelected] = useState<YouTubePlaylistVideo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playlistId) return;

    fetchPlaylistItems(playlistId, 50)
      .then((v) => {
        const sorted = newestFirst(v);
        setItems(sorted);
        setSelected(sorted[0] ?? null);
      })
      .catch((e: any) => setError(e?.message ?? "Error"));
  }, [playlistId]);

  const selectedId = selected?.videoId;

  const embedUrl = useMemo(() => {
    if (!selectedId) return "";
    return `https://www.youtube.com/embed/${selectedId}?autoplay=0&rel=0&modestbranding=1`;
  }, [selectedId]);

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Playlist</h1>
          <p className="text-zinc-400 text-sm">ID: {playlistId}</p>
          {error ? <p className="mt-3 text-red-300">{error}</p> : null}
        </div>

        <Link to="/">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black">
            {embedUrl ? (
              <iframe
                className="h-full w-full"
                src={embedUrl}
                title={selected?.title ?? "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : null}
          </div>

          <div>
            <div className="text-lg font-semibold">{selected?.title ?? ""}</div>
            <div className="text-sm text-zinc-400">
              {selected?.publishedAt ? new Date(selected.publishedAt).toLocaleDateString() : ""}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-3">
          <div className="flex items-end justify-between px-2 pb-2">
            <div className="font-semibold">Capítols</div>
            <div className="text-xs text-zinc-400">{items.length}</div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto space-y-2 pr-1">
            {items.map((v) => {
              const active = v.videoId === selectedId;
              return (
                <button
                  key={v.videoId}
                  onClick={() => setSelected(v)}
                  className={[
                    "w-full text-left rounded-xl border p-2 transition",
                    active
                      ? "border-zinc-500 bg-zinc-900/60"
                      : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-600",
                  ].join(" ")}
                >
                  <div className="flex gap-3">
                    <div className="h-14 w-24 overflow-hidden rounded-lg bg-zinc-900 shrink-0">
                      {v.thumbnail ? (
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold line-clamp-2">{v.title}</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
