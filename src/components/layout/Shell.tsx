import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Input } from "../ui/input";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-4">
          <Link to="/" className="font-extrabold tracking-tight text-xl">
            RTVCardedeu <span className="text-zinc-400">Play</span>
          </Link>

          <div className="flex-1" />

          <div className="w-full max-w-xs hidden sm:block">
            <Input
              placeholder="Cerca programes, capítols…"
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">{children}</main>
    </div>
  );
}
