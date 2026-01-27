import { Link } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { Card, CardContent } from "../components/ui/card";
import { PLAYLISTS } from "../data/playlists";

export default function Home() {
  return (
    <Shell>
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
        <div className="p-6 sm:p-10 space-y-3">
          <p className="text-sm text-zinc-400">RTVCardedeu Play</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            A la carta
          </h1>
          <p className="max-w-2xl text-zinc-300">
            Informatius, programes i especials. Tria una llista i comença a
            mirar.
          </p>
        </div>
      </section>

      {/* RAILS */}
      <section className="mt-8 space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Programes</h2>
          <span className="text-sm text-zinc-500">Playlists</span>
        </div>

        <div className="-mx-6 px-6 overflow-x-auto">
          <div className="flex gap-4 pb-2 min-w-max">
            {PLAYLISTS.map((p, idx) => (
              <Link
                key={`${p.id}-${idx}`}
                to={`/playlist/${p.id}`}
                className="group"
              >
                <Card className="w-[260px] bg-zinc-950 border-zinc-800 text-white hover:border-zinc-600 transition">
                  <CardContent className="p-0">
                    {/* “poster” */}
                    <div className="h-36 rounded-t-xl bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-center">
                      <div className="text-zinc-500 text-sm">RTVC</div>
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
                      <p className="text-xs text-zinc-500">Obre la playlist</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
