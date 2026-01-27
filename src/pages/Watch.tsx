import { useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function Watch() {
  const { videoId } = useParams<{ videoId: string }>();

  if (!videoId) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Reproduciendo</h1>
          <Button variant="secondary" asChild>
            <Link to="/">Volver</Link>
          </Button>
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
