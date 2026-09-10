import { useRef, useState } from "react";
import type { Category } from "@/lib/items";
import { CATEGORIES } from "@/lib/items";
import { addItem, uploadPhoto } from "@/lib/use-items";

const CATEGORY_ACTIVE: Record<Category, string> = {
  sell: "bg-sell text-sell-foreground",
  give: "bg-give text-give-foreground",
  throw: "bg-throw text-throw-foreground",
};

export function AddItemSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("sell");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function save() {
    if (!name.trim()) {
      setError("Please give the item a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let photoPath: string | null = null;
      if (file) photoPath = await uploadPhoto(file);
      await addItem({
        name: name.trim(),
        category,
        price: category === "sell" && price.trim() ? Number(price) : null,
        note: note.trim() || null,
        added_by: addedBy.trim() || null,
        photo_path: photoPath,
      });
      onSaved();
    } catch {
      setError("Something went wrong saving this. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto panel rounded-t-3xl sm:rounded-3xl ring-1 ring-white/60 p-5 animate-pop">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl tracking-tight">Add an item</h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 grid place-items-center rounded-full ring-1 ring-white/60 text-ink-soft"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="mt-4 w-full rounded-2xl overflow-hidden ring-1 ring-white/60"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Selected item" className="w-full aspect-[6/5] object-cover" />
          ) : (
            <div className="w-full aspect-[6/5] grid place-items-center bg-white/40 gap-1">
              <span className="text-3xl">📷</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
                Take or choose a photo
              </span>
            </div>
          )}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            What is it?
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leather sofa"
            className="mt-1.5 w-full rounded-2xl bg-white/60 ring-1 ring-white/60 px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-sell/50"
          />
        </label>

        <div className="mt-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            What happens to it?
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-4 py-2.5 font-semibold text-sm ring-1 ring-white/50 ${
                  category === c.id ? CATEGORY_ACTIVE[c.id] : "bg-white/50 text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {category === "sell" && (
          <label className="mt-4 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              Price (optional)
            </span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="180"
              className="mt-1.5 w-full rounded-2xl bg-white/60 ring-1 ring-white/60 px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-sell/50"
            />
          </label>
        )}

        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Note (optional)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="In the garage, needs cleaning"
            className="mt-1.5 w-full rounded-2xl bg-white/60 ring-1 ring-white/60 px-4 py-3 outline-none focus:ring-2 focus:ring-sell/50"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Your name (optional)
          </span>
          <input
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value)}
            placeholder="Henrik"
            className="mt-1.5 w-full rounded-2xl bg-white/60 ring-1 ring-white/60 px-4 py-3 outline-none focus:ring-2 focus:ring-sell/50"
          />
        </label>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-5 w-full rounded-full bg-sell text-sell-foreground font-display font-bold text-base py-4 ring-1 ring-white/30 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add to the board"}
        </button>
      </div>
    </div>
  );
}
