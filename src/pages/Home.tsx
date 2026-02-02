import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { fetchLatestVideos, type LatestVideo } from "../services/youtube";
import { Button } from "../components/ui/button";
import { CategoriesPills } from "../components/CategoriesPills";

export default function Home() {
  const [videos, setVideos] = useState<LatestVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  useEffect(() => {
    fetchLatestVideos(20)
      .then((v) => {
        setVideos(v);
        setHeroIndex(0);
      })
      .catch((e: any) => setError(e?.message ?? "Error"));
  }, []);

  const heroVideos = useMemo(() => videos.slice(0, 5), [videos]);
  const noveltyVideos = useMemo(() => videos.slice(5, 10), [videos]);

  const featured = heroVideos[heroIndex];

  function prevHero() {
    setHeroVideoReady(false);
    setHeroIndex((i) => (i - 1 + heroVideos.length) % heroVideos.length);
  }

  function nextHero() {
    setHeroVideoReady(false);
    setHeroIndex((i) => (i + 1) % heroVideos.length);
  }
  const categories = [
    { id: "informatius", label: "Informatius" },
    { id: "esports", label: "Esports" },
    { id: "podcasts", label: "Pòdcasts" },
    { id: "especials", label: "Especials" },
    { id: "cultura", label: "Cultura" },
    { id: "altres", label: "Altres" },
  ];

  return (
    <Shell>
      {error ? (
        <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-4 text-red-200">
          {error}
        </div>
      ) : null}

      {/* HERO (últimos 5) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden pb-64 lg:pb-0 bg-black min-h-[520px] h-[80vh]">
        {/* Video background (muted autoplay) */}
        <div className="absolute inset-0">
          {/* Video background (encima) */}
          {featured?.videoId ? (
            <iframe
              className="absolute inset-0 h-full w-full scale-[1.45] opacity-55"
              src={`https://www.youtube-nocookie.com/embed/${featured.videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${featured.videoId}&iv_load_policy=3&cc_load_policy=0`}
              title="Hero background"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent" />
          {/* “Cortina” para tapar UI de YouTube (arriba) */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />

          {/* overlays (menos oscuro que antes) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 sm:px-10 pt-16 pb-10">
          <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Últims vídeos
          </h1>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-center">
            {/* left info */}
            <div className="space-y-4">
              <p className="inline-flex items-center rounded-full border border-zinc-700 bg-black/30 px-3 py-1 text-xs text-zinc-200">
                Novetats
              </p>

              <div className="text-2xl sm:text-3xl font-bold leading-tight">
                {featured?.title ?? "Carregant..."}
              </div>

              <div className="text-sm text-zinc-300/80">
                {featured?.publishedAt
                  ? new Date(featured.publishedAt).toLocaleDateString()
                  : ""}
              </div>

              <div className="flex items-center gap-3">
                {featured?.videoId ? (
                  <Link to={`/watch/${featured.videoId}`}>
                    <Button className="gap-2">
                      <span>▶</span> Reproduir
                    </Button>
                  </Link>
                ) : (
                  <Button disabled>Reprodueix</Button>
                )}

                <div className="ml-2 flex items-center gap-2">
                  <button
                    onClick={prevHero}
                    className="h-10 w-10 rounded-full border border-zinc-700 bg-black/30 text-white hover:bg-black/50 transition"
                    aria-label="Anterior"
                    disabled={heroVideos.length === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextHero}
                    className="h-10 w-10 rounded-full border border-zinc-700 bg-black/30 text-white hover:bg-black/50 transition"
                    aria-label="Siguiente"
                    disabled={heroVideos.length === 0}
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* mini-dots */}
              <div className="flex gap-2 pt-1">
                {heroVideos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={[
                      "h-2 w-2 rounded-full transition",
                      idx === heroIndex
                        ? "bg-white"
                        : "bg-white/30 hover:bg-white/50",
                    ].join(" ")}
                    aria-label={`Ir a novedad ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* right preview image */}
            <div className="w-full">
              <div className="aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-black/40">
                {featured?.thumbnail ? (
                  <img
                    src={featured.thumbnail}
                    alt={featured.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOVETATS (flotant sobre el final del HERO) */}
      <section className="relative z-30 mt-8 pb-10 lg:-mt-52">
        {/* full width, centrat tipus Netflix */}
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-10">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-xl font-semibold">Més novetats</h2>
          </div>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
            {noveltyVideos.map((v) => (
              <Link
                key={v.videoId}
                to={`/watch/${v.videoId}`}
                className="group"
              >
                <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur hover:border-zinc-600 transition">
                  <div className="relative aspect-video bg-zinc-900">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  </div>

                  <div className="p-4">
                    <div className="font-semibold line-clamp-2">{v.title}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {new Date(v.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="relative z-20 pb-10">
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-10">
          <CategoriesPills categories={categories} />
        </div>
      </section>
    </Shell>
  );
}
