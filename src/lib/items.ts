export type Category = "sell" | "give" | "throw";
export type Status = "available" | "reserved" | "done";

export interface Item {
  id: string;
  name: string;
  category: Category;
  status: Status;
  price: number | null;
  note: string | null;
  added_by: string | null;
  photo_path: string | null;
  created_at: string;
}

export const CATEGORIES: {
  id: Category;
  label: string;
  section: string;
  doneLabel: string;
}[] = [
  { id: "sell", label: "Sell", section: "On sale now", doneLabel: "Sold" },
  { id: "give", label: "Give away", section: "Ready to give", doneLabel: "Given away" },
  { id: "throw", label: "Throw away", section: "To throw away", doneLabel: "Thrown away" },
];

export const STATUSES: { id: Status; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "reserved", label: "Reserved" },
  { id: "done", label: "Done" },
];

export function categoryLabel(category: Category) {
  return CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function statusLabel(item: Item) {
  if (item.status === "done") {
    return CATEGORIES.find((c) => c.id === item.category)?.doneLabel ?? "Done";
  }
  return STATUSES.find((s) => s.id === item.status)?.label ?? item.status;
}

export function formatPrice(price: number | null) {
  if (price == null) return null;
  return `$${price % 1 === 0 ? price : price.toFixed(2)}`;
}
