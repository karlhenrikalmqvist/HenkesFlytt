import type { Item } from "@/lib/items";
import { categoryLabel, formatPrice, statusLabel } from "@/lib/items";

const CATEGORY_BADGE: Record<Item["category"], string> = {
  sell: "bg-sell text-sell-foreground",
  give: "bg-give text-give-foreground",
  throw: "bg-throw text-throw-foreground",
};

const PLACEHOLDER_BG: Record<Item["category"], string> = {
  sell: "bg-[oklch(0.93_0.05_70)]",
  give: "bg-[oklch(0.93_0.03_160)]",
  throw: "bg-[oklch(0.93_0.05_50)]",
};

export function ItemCard({
  item,
  photoUrl,
  delay = 0,
  onOpen,
}: {
  item: Item;
  photoUrl?: string | undefined;
  delay?: number;
  onOpen: (item: Item) => void;
}) {
  const price = formatPrice(item.price);
  const done = item.status === "done";
  const reserved = item.status === "reserved";

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="panel rounded-3xl ring-1 ring-white/50 p-2.5 text-left animate-rise transition-transform active:scale-[0.98]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative rounded-2xl overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={item.name}
            loading="lazy"
            className={`w-full aspect-[6/5] object-cover ${done ? "opacity-60" : ""}`}
          />
        ) : (
          <div
            className={`w-full aspect-[6/5] grid place-items-center ${PLACEHOLDER_BG[item.category]}`}
          >
            <span className="font-display font-bold text-3xl text-ink/25">
              {item.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
        <span
          className={`absolute top-2 left-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${CATEGORY_BADGE[item.category]}`}
        >
          {categoryLabel(item.category)}
        </span>
        {price && (
          <span className="absolute top-2 right-2 rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-wider panel ring-1 ring-white/50 text-ink">
            {price}
          </span>
        )}
      </div>
      <div className="px-1.5 pt-2.5 pb-1">
        <div className={`font-semibold leading-snug ${done ? "line-through text-ink-soft" : ""}`}>
          {item.name}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={`size-1.5 rounded-full ${reserved ? "bg-status" : done ? "bg-give" : "bg-ink"}`}
          />
          <span
            className={`font-mono text-[11px] uppercase tracking-wider ${
              reserved ? "text-status" : done ? "text-give" : "text-ink-soft"
            }`}
          >
            {statusLabel(item)}
          </span>
          {item.added_by && (
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-ink-soft/70">
              {item.added_by}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
