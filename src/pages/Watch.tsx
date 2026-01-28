import { Link, useParams } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { Button } from "../components/ui/button";

export default function Watch() {
  const { id } = useParams();
  const videoId = id ?? "";

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vídeo</h1>
          <p className="text-zinc-400 text-sm">ID: {videoId}</p>
        </div>

        <Link to="/">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>

      <div className="mt-6">
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black">
          {videoId ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : null}
        </div>
      </div>
    </Shell>
  );
}
