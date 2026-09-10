import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Item } from "@/lib/items";

const PHOTO_BUCKET = "item-photos";

export function useItems() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("items-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, () => {
        queryClient.invalidateQueries({ queryKey: ["items"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["items"],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Item[];
    },
  });
}

export function usePhotoUrls(items: Item[]) {
  const paths = items
    .map((i) => i.photo_path)
    .filter((p): p is string => Boolean(p))
    .sort()
    .join(",");

  return useQuery({
    queryKey: ["photo-urls", paths],
    enabled: paths.length > 0,
    staleTime: 45 * 60 * 1000,
    queryFn: async (): Promise<Record<string, string>> => {
      const list = paths.split(",");
      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrls(list, 60 * 60);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const entry of data ?? []) {
        if (entry.path && entry.signedUrl) map[entry.path] = entry.signedUrl;
      }
      return map;
    },
  });
}

export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function addItem(input: {
  name: string;
  category: Item["category"];
  price?: number | null;
  note?: string | null;
  added_by?: string | null;
  photo_path?: string | null;
}) {
  const { error } = await supabase.from("items").insert({
    name: input.name,
    category: input.category,
    price: input.price ?? null,
    note: input.note ?? null,
    added_by: input.added_by ?? null,
    photo_path: input.photo_path ?? null,
  });
  if (error) throw error;
}

export async function updateItemStatus(id: string, status: Item["status"]) {
  const { error } = await supabase.from("items").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(item: Item) {
  const { error } = await supabase.from("items").delete().eq("id", item.id);
  if (error) throw error;
  if (item.photo_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([item.photo_path]);
  }
}
