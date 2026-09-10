create table public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('sell','give','throw')),
  status text not null default 'available' check (status in ('available','reserved','done')),
  price numeric,
  note text,
  added_by text,
  photo_path text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.items to anon;
grant all on public.items to service_role;

alter table public.items enable row level security;

create policy "anyone can view items" on public.items for select to anon using (true);
create policy "anyone can add items" on public.items for insert to anon with check (true);
create policy "anyone can update items" on public.items for update to anon using (true) with check (true);
create policy "anyone can delete items" on public.items for delete to anon using (true);

alter publication supabase_realtime add table public.items;

create policy "anyone can view item photos" on storage.objects for select to anon using (bucket_id = 'item-photos');
create policy "anyone can upload item photos" on storage.objects for insert to anon with check (bucket_id = 'item-photos');
create policy "anyone can delete item photos" on storage.objects for delete to anon using (bucket_id = 'item-photos');