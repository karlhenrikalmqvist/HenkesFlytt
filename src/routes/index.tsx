import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Category, Item } from "@/lib/items";
import { CATEGORIES } from "@/lib/items";
import { useItems, usePhotoUrls } from "@/lib/use-items";
import { ItemCard } from "@/components/ItemCard";
import { AddItemSheet } from "@/components/AddItemSheet";
import { ItemSheet } from "@/components/ItemSheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Relocate — our family moving board" },
      {
        name: "description",
        content:
          "One shared board for the family move: snap a photo of each item and mark it Sell, Give away, or Throw away. Everyone sees the live status.",
      },
      { property: "og:title", content: "Relocate — our family moving board" },
      {
        property: "og:description",
        content:
          "Snap a photo of each item and mark it Sell, Give away, or Throw away. The whole family sees the live status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Filter = Category | "all";

function Index() {
  const { data: items = [], isLoading, refetch } = useItems();
  const { data: photoUrls = {} } = usePhotoUrls(items);
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);

  const counts = useMemo(() => {
    const map: Record<Category, number> = { sell: 0, give: 0, throw: 0 };
    for (const item of items) map[item.category]++;
    return map;
  }, [items]);

  const members = useMemo(
    () => Array.from(new Set(items.map((i) => i.added_by).filter(Boolean))).slice(0, 4) as string[],
    [items],
  );

  const sections = useMemo(() => {
    const source = filter === "all" ? items : items.filter((i) => i.category === filter);
    if (filter !== "all") {
      const cat = CATEGORIES.find((c) => c.id === filter)!;
      return [{ title: cat.section, items: source }];
    }
    return CATEGORIES.map((c) => ({
      title: c.section,
      items: source.filter((i) => i.category === c.id),
    })).filter((s) => s.items.length > 0);
  }, [items, filter]);

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="min-h-screen w-full relative overflow-hidden app-canvas text-ink">
      <header
        className="sticky top-0 z-30 px-5 pt-4 pb-3"
        style={{ background: "linear-gradient(180deg, oklch(0.975 0.008 220 / 0.7), transparent)" }}
      >
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 grid place-items-center rounded-xl panel ring-1 ring-white/40 font-display font-bold text-lg text-sell">
              R
            </div>
            <div className="leading-none">
              <div className="font-display font-bold text-lg tracking-tight">Relocate</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] mt-1 text-ink-soft">
                {items.length} item{items.length === 1 ? "" : "s"} · {doneCount} done
              </div>
            </div>
          </div>
          {members.length > 0 && (
            <div className="flex -space-x-2">
              {members.map((m, i) => (
                <div
                  key={m}
                  className="size-8 rounded-full panel ring-2 ring-white grid place-items-center text-[11px] font-semibold"
                  style={{ color: ["var(--color-status)", "var(--color-give)", "var(--color-sell)", "var(--color-throw)"][i % 4] }}
                  title={m}
                >
                  {m.slice(0, 1).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-28">
        <div className="mt-3 mb-4 animate-pop">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-soft">
            Our family move
          </span>
          <h1 className="font-display font-bold text-[34px] leading-tight tracking-tight text-balance mt-1">
            What are we doing with it?
          </h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 no-scrollbar">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            dot="bg-ink"
            label="All"
            count={items.length}
          />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
              dot={c.id === "sell" ? "bg-sell" : c.id === "give" ? "bg-give" : "bg-throw"}
              label={c.label}
              count={counts[c.id]}
            />
          ))}
        </div>

        {isLoading ? (
          <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Loading the board…
          </p>
        ) : items.length === 0 ? (
          <div className="mt-10 panel rounded-3xl ring-1 ring-white/50 p-8 text-center animate-pop">
            <div className="text-4xl">📦</div>
            <h2 className="mt-3 font-display font-bold text-xl tracking-tight">
              Nothing on the board yet
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Snap a photo of the first thing we can't keep and tap "Add item".
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <section key={section.title}>
              <div className="mt-8 flex items-center justify-between">
                <h2 className="font-display font-bold text-xl tracking-tight">{section.title}</h2>
                <span className="font-mono text-xs text-ink-soft">
                  {section.items.length} item{section.items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {section.items.map((item, i) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    photoUrl={item.photo_path ? photoUrls[item.photo_path] : undefined}
                    delay={Math.min(i * 80, 400)}
                    onOpen={setSelected}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {items.length > 0 && (
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-center text-ink-soft">
            Tap any item to update its status
          </p>
        )}
      </main>

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 rounded-full px-6 py-4 font-display font-bold text-base ring-1 ring-white/30 bg-sell text-sell-foreground animate-pop active:scale-[0.97] transition-transform"
        style={{ boxShadow: "0 12px 30px -10px oklch(0.72 0.165 62 / 0.6)" }}
      >
        <span className="size-7 grid place-items-center rounded-full bg-white/25 text-lg leading-none font-body">
          +
        </span>
        Add item
      </button>

      {adding && (
        <AddItemSheet
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            refetch();
          }}
        />
      )}
      {selected && (
        <ItemSheet
          item={selected}
          photoUrl={selected.photo_path ? photoUrls[selected.photo_path] : undefined}
          onClose={() => setSelected(null)}
          onChanged={() => refetch()}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  dot,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  dot: string;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-none rounded-full px-4 py-2.5 font-semibold text-sm flex items-center gap-2 ring-1 transition-colors ${
        active ? "bg-ink text-background ring-white/40" : "panel ring-white/50 text-ink"
      }`}
    >
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
      <span className={`font-mono text-xs ${active ? "opacity-70" : "text-ink-soft"}`}>{count}</span>
    </button>
  );
}
