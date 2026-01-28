import { Link, useParams } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { Button } from "../components/ui/button";

export default function Playlist() {
  const { id } = useParams();
  const playlistId = id ?? "";

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Playlist</h1>
          <p className="text-zinc-400 text-sm">ID: {playlistId}</p>
          <p className="text-zinc-300 mt-3">
            Página temporal (sin API). En el siguiente paso conectamos YouTube.
          </p>
        </div>

        <Link to="/">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-6">
        <p className="text-zinc-300">
          Aquí irá el reproductor + lista de capítulos cuando reintroduzcamos la
          API de playlists.
        </p>
      </div>
    </Shell>
  );
}
