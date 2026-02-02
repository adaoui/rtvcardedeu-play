import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { fetchLatestVideos, type LatestVideo } from "../services/youtube";

const CATEGORY_META: Record<
  string,
  { title: string; match: RegExp; emptyHint: string }
> = {
  informatius: {
    title: "Informatius",
    match: /informatiu|not[ií]cies|actualitat|ple|ajuntament|municipal/i,
    emptyHint: "No he trobat informatius als últims vídeos.",
  },
  esports: {
    title: "Esports",
    match:
      /esport|futbol|b[àa]squet|basquet|handbol|volei|tennis|nataci[oó]|ciclisme|atletisme/i,
    emptyHint: "No he trobat esports als últims vídeos.",
  },
  podcasts: {
    title: "Pòdcasts",
    match: /SOS|Gata/i,
    emptyHint: "No he trobat pòdcasts als últims vídeos.",
  },
  especials: {
    title: "Especials",
    match: /especial|reportatge|documental|resum|gala|premis/i,
    emptyHint: "No he trobat especials als últims vídeos.",
  },
  cultura: {
    title: "Cultura",
    match: /cultura|concert|teatre|exposici[oó]|llibre|m[uú]sica|art|festival/i,
    emptyHint: "No he trobat cultura als últims vídeos.",
  },
  altres: {
    title: "Altres",
    match: /.*/i,
    emptyHint: "No hi ha vídeos per mostrar.",
  },
};

export default function Category() {
  const { id } = useParams();
  const catId = (id || "altres").toLowerCase();

  const meta = CATEGORY_META[catId] ?? CATEGORY_META.altres;

  const [videos, setVideos] = useState<LatestVideo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    fetchLatestVideos(200)
      .then(setVideos)
      .catch((e: any) => setError(e?.message ?? "Error"));
  }, [catId]);

  const filtered = useMemo(() => {
    const base = videos.filter((v) => meta.match.test(v.title));

    // “Altres” = els que NO han entrat a cap altra categoria
    if (catId === "altres") {
      const otherMatchers = Object.entries(CATEGORY_META)
        .filter(([k]) => k !== "altres")
        .map(([, v]) => v.match);

      return videos.filter(
        (v) => !otherMatchers.some((rx) => rx.test(v.title)),
      );
    }

    return base;
  }, [videos, catId, meta.match]);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold">{meta.title}</h1>
          <p className="text-zinc-400 text-sm">
            {error ? <span className="text-red-300">{error}</span> : null}
            {!error ? <>Vídeos: {filtered.length}</> : null}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-6 text-zinc-300">
            {meta.emptyHint}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((v) => (
              <Link
                key={v.videoId}
                to={`/watch/${v.videoId}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-950/30 overflow-hidden hover:border-zinc-600 transition"
              >
                <div className="relative aspect-video bg-black">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="h-full w-full object-cover opacity-95 group-hover:opacity-100 transition"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="p-3">
                  <div className="font-semibold leading-snug line-clamp-2">
                    {v.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {new Date(v.publishedAt).toLocaleDateString("ca-ES")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
