import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { fetchLatestVideos, type LatestVideo } from "../services/youtube";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type WatchVideo = {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
};

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const sec = Math.floor(s);
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function asWatchVideo(v: LatestVideo): WatchVideo {
  return {
    id: v.videoId,
    title: v.title,
    date: new Date(v.publishedAt).toLocaleDateString("ca-ES"),
    thumbnail: v.thumbnail,
  };
}

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoId = (id || "").trim();

  // Player refs
  const playerWrapRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Player state
  const [ready, setReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  // UI state
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  // Data
  const [sidebar, setSidebar] = useState<WatchVideo[]>([]);
  const [currentMeta, setCurrentMeta] = useState<WatchVideo | null>(null);

  /* -------------------- Helpers -------------------- */

  const clearHideTimer = () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  };

  const showControlsTemporarily = (ms = 1800) => {
    setControlsVisible(true);
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      // Amaguem controls només si està reproduint (si està pausat, els volem visibles)
      setControlsVisible((prev) => {
        if (!playing) return true;
        return false;
      });
    }, ms);
  };

  const ensureControlsVisible = () => {
    setControlsVisible(true);
    clearHideTimer();
  };

  const play = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.playVideo?.();
      setHasStarted(true);
      showControlsTemporarily();
    } catch {}
  };

  const pause = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.pauseVideo?.();
      ensureControlsVisible(); // quan pausat, controls visibles
    } catch {}
  };

  const togglePlay = () => {
    if (!ready) return;
    if (playing) pause();
    else play();
  };

  const seekTo = (to: number) => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.seekTo?.(to, true);
      setCurrent(to);
      showControlsTemporarily();
    } catch {}
  };

  const toggleFullscreen = () => {
    const el = playerWrapRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  /* -------------------- Sidebar + meta -------------------- */

  useEffect(() => {
    if (!videoId) return;

    let alive = true;

    fetchLatestVideos(24)
      .then((items) => {
        if (!alive) return;

        const all = items.map(asWatchVideo);

        const meta = all.find((v) => v.id === videoId) || {
          id: videoId,
          title: "Reproduint…",
          date: "",
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };

        setCurrentMeta(meta);

        // Mostrem els "últims" que càpiguen bé (ajusta si vols)
        const more = all.filter((v) => v.id !== videoId).slice(0, 10);
        setSidebar(more);
      })
      .catch(() => {
        setCurrentMeta({
          id: videoId,
          title: "Reproduint…",
          date: "",
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        });
        setSidebar([]);
      });

    return () => {
      alive = false;
    };
  }, [videoId]);

  /* -------------------- YouTube IFrame API -------------------- */

  useEffect(() => {
    if (!videoId) return;

    const load = () => {
      if (!iframeContainerRef.current) return;

      // Destroy old player on change
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // Reset state
      setReady(false);
      setHasStarted(false);
      setPlaying(false);
      setBuffering(false);
      setDuration(0);
      setCurrent(0);
      setControlsVisible(true);
      clearHideTimer();

      playerRef.current = new window.YT.Player(iframeContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0, // sense GUI youtube
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          fs: 0, // fem fullscreen nostre
          disablekb: 1,
        },
        events: {
          onReady: (e: any) => {
            setReady(true);

            // Força iframe 100%
            try {
              const iframe: HTMLIFrameElement = e.target.getIframe();
              iframe.style.position = "absolute";
              iframe.style.inset = "0";
              iframe.style.width = "100%";
              iframe.style.height = "100%";
              iframe.style.display = "block";
            } catch {}

            // Durada
            try {
              const d = e.target.getDuration?.();
              if (typeof d === "number") setDuration(d);
            } catch {}
          },
          onStateChange: (e: any) => {
            // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
            const st = e.data;

            setBuffering(st === 3);
            setPlaying(st === 1);

            if (st === 1) {
              setHasStarted(true);
              showControlsTemporarily(); // amaga després d'un temps si està reproduint
            }

            if (st === 2) {
              // paused
              ensureControlsVisible();
            }

            if (st === 0) {
              // ended => autoplay next (si n'hi ha)
              ensureControlsVisible();
              const next = sidebar[0];
              if (next?.id) {
                navigate(`/watch/${next.id}`);
              }
            }

            // refresca durada
            try {
              const d = playerRef.current?.getDuration?.();
              if (typeof d === "number" && d > 0) setDuration(d);
            } catch {}
          },
        },
      });
    };

    if (window.YT?.Player) {
      load();
      return;
    }

    // Load script once
    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => load();

    return () => {
      clearHideTimer();
      try {
        if (playerRef.current?.destroy) playerRef.current.destroy();
      } catch {}
      playerRef.current = null;
    };
    // IMPORTANT: sidebar s'usa a onStateChange(ended). Per no recrear player quan canvia sidebar,
    // NO posem sidebar a deps. Fem servir el sidebar actual a l'ended via state (pot quedar 1 render enrere).
    // Ho arreglem amb un ref a baix.
  }, [videoId, navigate]);

  // Ref per tenir el "sidebar actual" a l'ended sense dependències
  const sidebarRef = useRef<WatchVideo[]>([]);
  useEffect(() => {
    sidebarRef.current = sidebar;
  }, [sidebar]);

  // Ajust: autoplay next amb sidebarRef (en lloc de sidebar tancat)
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;

    // No podem “subscriure” fàcilment aquí perquè YT gestiona events internament.
    // Però ja ho hem fet a onStateChange. Ens assegurem només que sidebarRef està al dia.
  }, [sidebar]);

  /* -------------------- Time polling -------------------- */

  useEffect(() => {
    const t = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const cur = p.getCurrentTime?.();
        if (typeof cur === "number") setCurrent(cur);
      } catch {}
    }, 250);

    return () => window.clearInterval(t);
  }, []);

  /* -------------------- Mouse / Controls hide -------------------- */

  const onPlayerMouseMove = () => {
    // Quan mous el ratolí, mostrem controls i programem amagar-los
    if (!hasStarted) return;
    showControlsTemporarily();
  };

  const onPlayerMouseLeave = () => {
    // Si està reproduint, podem amagar quan surt el ratolí
    if (!hasStarted) return;
    if (playing) {
      clearHideTimer();
      hideTimerRef.current = window.setTimeout(
        () => setControlsVisible(false),
        700,
      );
    } else {
      ensureControlsVisible();
    }
  };

  /* -------------------- Render guards -------------------- */

  const poster =
    currentMeta?.thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const title = currentMeta?.title ?? "Reproduint…";
  const date = currentMeta?.date ?? "";

  if (!videoId) {
    return (
      <Shell>
        <div className="min-h-[60vh] grid place-items-center text-white/70">
          Falta ID de vídeo.
        </div>
      </Shell>
    );
  }

  return (
    <Shell fullWidth>
      <div className="pt-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          {/* PLAYER */}
          <section className="min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="mb-3 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
              aria-label="Tornar enrere"
            >
              <span className="text-lg leading-none">←</span> Tornar enrere
            </button>

            <div
              ref={playerWrapRef}
              className="relative w-full overflow-hidden rounded-2xl bg-black border border-white/10"
              onMouseMove={onPlayerMouseMove}
              onMouseLeave={onPlayerMouseLeave}
            >
              <div className="relative w-full pt-[56.25%]">
                {/* YouTube iframe container: SEMPRE sense pointer events (això mata el banner de YouTube) */}
                <div
                  ref={iframeContainerRef}
                  className="absolute inset-0"
                  style={{ pointerEvents: "none" }}
                />

                {/* Click-to-toggle layer (captura click sobre vídeo) */}
                {hasStarted && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0"
                    aria-label={playing ? "Pausar" : "Reproduir"}
                    // aquesta capa és transparent; no tapa els controls perquè els controls estan per sobre
                    style={{ background: "transparent" }}
                  />
                )}

                {/* Poster + play inicial */}
                {!hasStarted && (
                  <button
                    onClick={play}
                    disabled={!ready}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label="Reproduir"
                  >
                    <img
                      src={poster}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-70"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />
                    <div className="relative flex items-center gap-3 px-6 py-4 rounded-full bg-white/10 backdrop-blur border border-white/20">
                      <div className="w-12 h-12 rounded-full bg-white/20 grid place-items-center text-xl">
                        ▶
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Reproduir</div>
                        <div className="text-xs text-white/60">Player RTVC</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Controls nostres (auto-hide) */}
                {hasStarted && (
                  <div
                    className={[
                      "absolute inset-x-0 bottom-0 p-3 transition-opacity duration-200",
                      controlsVisible
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none",
                    ].join(" ")}
                  >
                    <div className="rounded-xl bg-black/45 backdrop-blur border border-white/10 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay();
                          }}
                          disabled={!ready}
                          className="h-9 w-9 grid place-items-center rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50"
                          aria-label={playing ? "Pausar" : "Reproduir"}
                        >
                          {playing ? "❚❚" : "▶"}
                        </button>

                        <div className="flex-1">
                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.25}
                            value={Math.min(current, duration || 0)}
                            onChange={(e) => seekTo(Number(e.target.value))}
                            onMouseDown={() => ensureControlsVisible()}
                            onMouseUp={() => showControlsTemporarily()}
                            className="w-full"
                          />
                          <div className="mt-1 flex items-center justify-between text-[11px] text-white/70">
                            <span>{formatTime(current)}</span>
                            <span>
                              {buffering ? "Carregant…" : formatTime(duration)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFullscreen();
                          }}
                          className="h-9 w-9 grid place-items-center rounded-lg bg-white/10 hover:bg-white/15"
                          title="Pantalla completa"
                          aria-label="Pantalla completa"
                        >
                          ⛶
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-tight">{title}</h1>
            {date ? <div className="text-sm text-white/60">{date}</div> : null}
          </section>

          {/* SIDEBAR */}
          <aside className="rounded-2xl bg-white/5 border border-white/10 p-3 h-fit">
            <div className="font-semibold text-sm mb-3">Més vídeos</div>

            {sidebar.length === 0 ? (
              <div className="text-sm text-white/70">No hi ha més vídeos</div>
            ) : (
              <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
                {sidebar.map((v) => {
                  const isActive = v.id === videoId;

                  return (
                    <Link
                      key={v.id}
                      to={`/watch/${v.id}`}
                      className={[
                        "flex gap-3 rounded-xl p-2 border transition",
                        isActive
                          ? "bg-white/10 border-white/20"
                          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10",
                      ].join(" ")}
                      onClick={() => {
                        // Mostrem controls quan canvies de vídeo, perquè quedi “pro”
                        ensureControlsVisible();
                      }}
                    >
                      <div className="relative w-32 h-20 shrink-0 overflow-hidden rounded-lg bg-black">
                        <img
                          src={v.thumbnail}
                          alt=""
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold leading-snug line-clamp-2">
                          {v.title}
                        </div>
                        <div className="mt-1 text-xs text-white/60">
                          {v.date}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </Shell>
  );
}
