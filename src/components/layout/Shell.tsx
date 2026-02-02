import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Input } from "../ui/input";

export function Shell({
  children,
  fullWidth = false,
}: {
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 font-extrabold tracking-tight text-xl"
          >
            <img
              src="/src/assets/logo.png"
              alt="RTVCardedeu Play Logo"
              className="h-10 w-auto"
            />
            <span>
              RTVCardedeu{" "}
              <span className="text-zinc-400 text-[0.95em]">Play</span>
            </span>
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

      <main
        className={
          fullWidth
            ? "w-full px-6 pt-0 pb-6"
            : "mx-auto max-w-6xl px-6 pt-0 pb-6"
        }
      >
        {children}
      </main>
    </div>
  );
}
