import { useState } from "react";
import type { Item, Status } from "@/lib/items";
import { CATEGORIES, categoryLabel, formatPrice, statusLabel } from "@/lib/items";
import { deleteItem, updateItemStatus } from "@/lib/use-items";

export function ItemSheet({
  item,
  photoUrl,
  onClose,
  onChanged,
}: {
  item: Item;
  photoUrl?: string | undefined;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const doneLabel = CATEGORIES.find((c) => c.id === item.category)?.doneLabel ?? "Done";
  const price = formatPrice(item.price);

  const options: { id: Status; label: string }[] = [
    { id: "available", label: "Still available" },
    { id: "reserved", label: "Reserved / promised" },
    { id: "done", label: doneLabel },
  ];

  async function setStatus(status: Status) {
    setBusy(true);
    await updateItemStatus(item.id, status);
    onChanged();
    setBusy(false);
    onClose();
  }

  async function remove() {
    setBusy(true);
    await deleteItem(item);
    onChanged();
    setBusy(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto panel rounded-t-3xl sm:rounded-3xl ring-1 ring-white/60 p-5 animate-pop">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-xl tracking-tight">{item.name}</h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft mt-1">
              {categoryLabel(item.category)} · {statusLabel(item)}
              {price ? ` · ${price}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 shrink-0 grid place-items-center rounded-full ring-1 ring-white/60 text-ink-soft"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {photoUrl && (
          <img
            src={photoUrl}
            alt={item.name}
            className="mt-4 w-full aspect-[6/5] object-cover rounded-2xl ring-1 ring-white/60"
          />
        )}

        {item.note && <p className="mt-4 text-sm text-ink-soft">{item.note}</p>}
        {item.added_by && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Added by {item.added_by}
          </p>
        )}

        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          Update the status
        </p>
        <div className="mt-2 grid gap-2">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={busy}
              onClick={() => setStatus(o.id)}
              className={`w-full rounded-2xl px-4 py-3.5 font-semibold text-left ring-1 ring-white/60 disabled:opacity-60 ${
                item.status === o.id ? "bg-sell text-sell-foreground" : "bg-white/55 text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className="mt-4 w-full rounded-full py-3 font-semibold text-sm text-destructive ring-1 ring-destructive/25 disabled:opacity-60"
        >
          Remove from the board
        </button>
      </div>
    </div>
  );
}
