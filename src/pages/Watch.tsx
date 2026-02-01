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

  const playerWrapRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const [sidebar, setSidebar] = useState<WatchVideo[]>([]);
  const [currentMeta, setCurrentMeta] = useState<WatchVideo | null>(null);

  /* -------------------- SIDEBAR -------------------- */

  useEffect(() => {
    if (!videoId) return;

    let alive = true;

    fetchLatestVideos(20).then((items) => {
      if (!alive) return;

      const all = items.map(asWatchVideo);

      const meta = all.find((v) => v.id === videoId) || {
        id: videoId,
        title: "Reproduint…",
        date: "",
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };

      setCurrentMeta(meta);
      setSidebar(all.filter((v) => v.id !== videoId).slice(0, 10));
    });

    return () => {
      alive = false;
    };
  }, [videoId]);

  /* -------------------- PLAYER -------------------- */

  useEffect(() => {
    if (!videoId) return;

    const load = () => {
      if (!iframeContainerRef.current) return;

      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(iframeContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            setReady(true);

            const iframe: HTMLIFrameElement = e.target.getIframe();
            iframe.style.position = "absolute";
            iframe.style.inset = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";

            const d = e.target.getDuration?.();
            if (typeof d === "number") setDuration(d);
          },
          onStateChange: (e: any) => {
            const st = e.data;
            setBuffering(st === 3);
            setPlaying(st === 1);
            if (st === 1) setHasStarted(true);
          },
        },
      });
    };

    if (window.YT?.Player) {
      load();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = load;

    return () => {
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId]);

  /* -------------------- TEMPS -------------------- */

  useEffect(() => {
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const c = p.getCurrentTime?.();
      if (typeof c === "number") setCurrent(c);
    }, 250);

    return () => clearInterval(t);
  }, []);

  /* -------------------- CONTROLS -------------------- */

  const play = () => {
    playerRef.current?.playVideo?.();
    setHasStarted(true);
  };

  const togglePlay = () => {
    if (!ready) return;
    playing ? playerRef.current.pauseVideo() : play();
  };

  const seekTo = (v: number) => {
    playerRef.current?.seekTo?.(v, true);
    setCurrent(v);
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

  const poster =
    currentMeta?.thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <Shell fullWidth>
      <div className="pt-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          {/* PLAYER */}
          <section className="min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="mb-3 text-sm text-white/70 hover:text-white"
            >
              ← Tornar enrere
            </button>

            <div
              ref={playerWrapRef}
              className="relative w-full overflow-hidden rounded-2xl bg-black border border-white/10"
            >
              <div className="relative w-full pt-[56.25%]">
                <div
                  ref={iframeContainerRef}
                  className="absolute inset-0"
                  style={{ pointerEvents: "none" }}
                />

                {!hasStarted && (
                  <button
                    onClick={play}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <img
                      src={poster}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="relative px-6 py-4 rounded-full bg-white/10 backdrop-blur">
                      ▶ Reproduir
                    </div>
                  </button>
                )}

                {hasStarted && (
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="rounded-xl bg-black/50 backdrop-blur px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlay}>
                          {playing ? "❚❚" : "▶"}
                        </button>

                        <input
                          type="range"
                          min={0}
                          max={duration}
                          value={current}
                          onChange={(e) => seekTo(+e.target.value)}
                          className="flex-1"
                        />

                        <button
                          onClick={toggleFullscreen}
                          title="Pantalla completa"
                        >
                          ⛶
                        </button>

                        <span className="text-xs text-white/70">
                          {buffering ? "…" : formatTime(duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-bold">{currentMeta?.title}</h1>
            <div className="text-sm text-white/60">{currentMeta?.date}</div>
          </section>

          {/* SIDEBAR */}
          <aside className="rounded-2xl bg-white/5 border border-white/10 p-3 h-fit">
            <div className="font-semibold text-sm mb-3">Més vídeos</div>

            <div className="space-y-2 max-h-[75vh] overflow-y-auto">
              {sidebar.map((v) => (
                <Link
                  key={v.id}
                  to={`/watch/${v.id}`}
                  className="flex gap-3 p-2 rounded-xl hover:bg-white/5"
                >
                  <img
                    src={v.thumbnail}
                    className="w-32 h-20 rounded-lg object-cover"
                  />
                  <div className="text-sm font-semibold line-clamp-2">
                    {v.title}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
