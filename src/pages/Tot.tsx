import { useEffect, useMemo, useState } from "react";
import { Shell } from "../components/layout/Shell";
import { Card, CardContent } from "../components/ui/card";
import {
  fetchChannelPlaylists,
  type YouTubeChannelPlaylist,
} from "../services/youtube";
import { Link } from "react-router-dom";
import { GROUP_RULES } from "../data/groups";

function bestRuleForTitle(title: string) {
  const matches = GROUP_RULES.filter((r) => r.match.test(title));
  if (matches.length === 0) return null;
  matches.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  return matches[0];
}

export default function Home() {
  const [items, setItems] = useState<YouTubeChannelPlaylist[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannelPlaylists()
      .then(setItems)
      .catch((e: any) => setError(e?.message ?? "Error"));
  }, []);

  const { grouped, rest } = useMemo(() => {
    const groupedMap = new Map<string, YouTubeChannelPlaylist[]>();
    const used = new Set<string>();

    for (const p of items) {
      const rule = bestRuleForTitle(p.title);
      if (rule && rule.merge) {
        const arr = groupedMap.get(rule.group) ?? [];
        arr.push(p);
        groupedMap.set(rule.group, arr);
        used.add(p.playlistId);
      }
    }
    // ORDENAR cada grupo: más nuevo → más antiguo
    for (const [groupName, arr] of groupedMap.entries()) {
      arr.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
      groupedMap.set(groupName, arr);
    }

    // ORDENAR cada grupo: más nuevo → más antiguo (robusto)
    for (const [groupName, arr] of groupedMap.entries()) {
      arr.sort((a, b) => {
        const da = Date.parse(a.publishedAt) || 0;
        const db = Date.parse(b.publishedAt) || 0;
        return db - da;
      });
      groupedMap.set(groupName, arr);
    }

    // Resto (no agrupado) también ordenado
    const rest = items
      .filter((p) => !used.has(p.playlistId))
      .sort(
        (a, b) =>
          (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0),
      );

    // IMPORTANTE: ordenar los grupos entre sí por la fecha del primer elemento (el más nuevo del grupo)
    const groupedSorted = new Map(
      [...groupedMap.entries()].sort(([, aArr], [, bArr]) => {
        const aTop = Date.parse(aArr[0]?.publishedAt ?? "") || 0;
        const bTop = Date.parse(bArr[0]?.publishedAt ?? "") || 0;
        return bTop - aTop;
      }),
    );

    return { grouped: groupedSorted, rest };
  }, [items]);

  return (
    <Shell>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold">A la carta</h1>
          <p className="text-zinc-400">
            {error ? (
              <span className="text-red-300">{error}</span>
            ) : (
              <>Playlists: {items.length}</>
            )}
          </p>
        </div>

        {/* Rails agrupados (solo los que tú elijas) */}
        {[...grouped.entries()].map(([groupName, playlists]) => (
          <section key={groupName} className="space-y-3">
            <h2 className="text-xl font-semibold">{groupName}</h2>
            <div className="-mx-6 px-6 overflow-x-auto">
              <div className="flex gap-4 pb-2 min-w-max">
                {playlists.map((p) => (
                  <Link
                    key={p.playlistId}
                    to={`/playlist/${p.playlistId}`}
                    className="group"
                  >
                    <Card className="w-[280px] bg-zinc-950 border-zinc-800 text-white hover:border-zinc-600 transition overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-zinc-900">
                          {p.thumbnail ? (
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                              loading="lazy"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        </div>
                        <div className="p-4">
                          <div className="font-semibold line-clamp-2">
                            {p.title}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            {new Date(p.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Resto sin agrupar: lo que NO quieres tocar */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Totes les playlists</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((p) => (
              <Link
                key={p.playlistId}
                to={`/playlist/${p.playlistId}`}
                className="group"
              >
                <Card className="bg-zinc-950 border-zinc-800 text-white hover:border-zinc-600 transition overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-zinc-900">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="p-4">
                      <div className="font-semibold line-clamp-2">
                        {p.title}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {new Date(p.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
