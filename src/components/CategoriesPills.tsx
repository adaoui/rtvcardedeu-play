import { Link } from "react-router-dom";

type Category = { id: string; label: string };

const RING: Record<string, string> = {
  informatius: "ring-orange-500/90",
  esports: "ring-amber-400/90",
  podcasts: "ring-violet-500/90",
  especials: "ring-sky-400/90",
  cultura: "ring-rose-500/90",
  altres: "ring-emerald-400/90",
};

export function CategoriesPills({ categories }: { categories: Category[] }) {
  return (
    <div className="mt-2">
      {/* Centrat, sense scroll, i amb wrap */}
      <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/categoria/${c.id}`}
            className={[
              // mida “Netflix-like”
              "group relative grid place-items-center",
              "h-[86px] w-[86px] sm:h-[96px] sm:w-[96px] md:h-[108px] md:w-[108px]",
              "rounded-full bg-black/30 ring-2",
              RING[c.id] ?? "ring-zinc-500/70",
              "shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur",
              "transition hover:scale-[1.06] hover:bg-black/40",
              "focus:outline-none focus:ring-4 focus:ring-white/20",
            ].join(" ")}
          >
            {/* Text: que no es talli i s’ajusti */}
            <span
              className={[
                "px-3 text-center font-semibold text-white",
                "text-[12px] sm:text-[13px] md:text-[14px]",
                "leading-tight",
                "break-words",
              ].join(" ")}
            >
              {c.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
