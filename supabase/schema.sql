-- =====================================================================
-- SIGNATURE — base de données Supabase (offre gratuite) — VERSION 2
-- Coller TOUT ce fichier dans Supabase > SQL Editor > New query > Run.
-- Sans danger : on peut l'exécuter sur une base neuve OU sur la base de la v1
-- (il ajoute seulement ce qui manque ; les commandes et comptes ne sont pas touchés).
-- Ensuite exécuter catalogue_seed.sql pour charger les 20 articles du catalogue.
-- =====================================================================

-- 1. Tables ------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);

create table if not exists public.settings (
  key text primary key,
  value text not null default ''
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text,
  category text not null default 'other',
  name_fr text not null,
  name_ar text not null default '',
  price integer not null default 0 check (price >= 0),
  slots integer not null default 1 check (slots between 1 and 8),
  description_fr text not null default '',
  description_ar text not null default '',
  in_stock boolean not null default true,
  active boolean not null default true,
  image_url text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.box_options (
  id uuid primary key default gen_random_uuid(),
  code text,
  type text not null check (type in ('size','material','color')),
  name_fr text not null,
  name_ar text not null default '',
  description_fr text not null default '',
  description_ar text not null default '',
  material_id uuid,
  price integer not null default 0 check (price >= 0),
  capacity integer check (capacity is null or capacity > 0),
  hex text not null default '',
  image_url text not null default '',
  sort integer not null default 0,
  active boolean not null default true
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  code text,
  kind text not null default 'size',
  ref text not null default '',
  name_fr text not null,
  name_ar text not null default '',
  tagline_fr text not null default '',
  tagline_ar text not null default '',
  image_url text not null default '',
  product_ids jsonb not null default '[]'::jsonb,
  size_id uuid,
  sort integer not null default 0,
  active boolean not null default true
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text, phone text, wilaya text, commune text, address text
);

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number integer not null default nextval('public.order_number_seq'),
  user_id uuid not null references auth.users(id) on delete restrict,
  email text,
  customer_name text not null,
  phone text not null,
  wilaya text not null,
  commune text not null default '',
  address text not null,
  delivery_note text not null default '',
  box jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  message text not null default '',
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null default 0,
  status text not null default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  lang text not null default 'fr',
  admin_note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status, created_at desc);

-- 1b. Mise à niveau depuis la v1 (ajoute les colonnes manquantes) ------------
alter table public.products    add column if not exists code text;
alter table public.products    add column if not exists slots integer not null default 1;
alter table public.products    add column if not exists description_fr text not null default '';
alter table public.products    add column if not exists description_ar text not null default '';
alter table public.box_options add column if not exists code text;
alter table public.box_options add column if not exists description_fr text not null default '';
alter table public.box_options add column if not exists description_ar text not null default '';
alter table public.box_options add column if not exists material_id uuid;
alter table public.collections add column if not exists code text;
alter table public.collections add column if not exists kind text not null default 'size';
alter table public.collections add column if not exists ref text not null default '';

-- 2. Fonction « suis-je admin ? » -----------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  -- admin = e-mail présent dans « admins » ET adresse confirmée par le lien reçu par e-mail
  select exists (
    select 1 from public.admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  )
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Sécurité par ligne (RLS) -----------------------------------------------
alter table public.admins      enable row level security;
alter table public.settings    enable row level security;
alter table public.products    enable row level security;
alter table public.box_options enable row level security;
alter table public.collections enable row level security;
alter table public.profiles    enable row level security;
alter table public.orders      enable row level security;

-- lecture publique du catalogue
drop policy if exists "catalog read products" on public.products;
create policy "catalog read products"    on public.products    for select using (active or public.is_admin());
drop policy if exists "catalog read options" on public.box_options;
create policy "catalog read options"     on public.box_options for select using (active or public.is_admin());
drop policy if exists "catalog read collections" on public.collections;
create policy "catalog read collections" on public.collections for select using (active or public.is_admin());
drop policy if exists "catalog read settings" on public.settings;
create policy "catalog read settings"    on public.settings    for select using (true);

-- écriture réservée à l'admin
drop policy if exists "admin write products" on public.products;
create policy "admin write products"    on public.products    for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin write options" on public.box_options;
create policy "admin write options"     on public.box_options for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin write collections" on public.collections;
create policy "admin write collections" on public.collections for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin write settings" on public.settings;
create policy "admin write settings"    on public.settings    for all using (public.is_admin()) with check (public.is_admin());

-- table admins : personne n'y accède depuis le site (on la gère ici, dans SQL Editor)
-- (aucune policy = aucun accès pour anon/authenticated)

-- profil : chacun le sien
drop policy if exists "own profile select" on public.profiles;
create policy "own profile select" on public.profiles for select using (auth.uid() = user_id);
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = user_id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- commandes : le client voit les siennes ; l'admin voit et modifie tout.
-- Aucune insertion directe : on passe obligatoirement par place_order() (prix recalculés côté serveur).
drop policy if exists "own orders select" on public.orders;
create policy "own orders select"  on public.orders for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "admin orders update" on public.orders;
create policy "admin orders update" on public.orders for update using (public.is_admin()) with check (public.is_admin());

-- 4. Passer commande : les prix viennent de la base, jamais du navigateur ---
create or replace function public.place_order(p jsonb)
returns table(order_id uuid, order_number integer, total integer)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_email text := auth.jwt() ->> 'email';
  v_size public.box_options; v_mat public.box_options; v_col public.box_options;
  v_items jsonb := '[]'::jsonb; v_sub integer := 0; v_used integer := 0; v_box integer := 0;
  v_fee integer; v_total integer; v_id uuid; v_num integer;
  it jsonb; pr public.products; q integer;
  v_name text := btrim(coalesce(p->>'name','')); v_phone text := btrim(coalesce(p->>'phone',''));
  v_wilaya text := btrim(coalesce(p->>'wilaya','')); v_addr text := btrim(coalesce(p->>'address',''));
  v_has_size boolean; v_has_mat boolean; v_has_col boolean;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if v_name = '' or v_phone = '' or v_wilaya = '' or v_addr = '' then raise exception 'missing_fields'; end if;
  if v_wilaya !~ '^[0-9]{1,2}$' or v_wilaya::int not between 1 and 58 then raise exception 'missing_fields'; end if;
  if jsonb_typeof(p->'items') is distinct from 'array' or jsonb_array_length(p->'items') > 30 then raise exception 'empty_box'; end if;

  select exists(select 1 from box_options where type='size' and active) into v_has_size;
  select exists(select 1 from box_options where type='material' and active) into v_has_mat;
  select exists(select 1 from box_options where type='color' and active) into v_has_col;

  if v_has_size then select * into v_size from box_options where id = nullif(p->>'size_id','')::uuid and type='size' and active; if not found then raise exception 'invalid_options'; end if; end if;
  if v_has_mat  then select * into v_mat  from box_options where id = nullif(p->>'material_id','')::uuid and type='material' and active; if not found then raise exception 'invalid_options'; end if; end if;
  if v_has_col  then select * into v_col  from box_options where id = nullif(p->>'color_id','')::uuid and type='color' and active; if not found then raise exception 'invalid_options'; end if; end if;
  -- la couleur doit appartenir à la matière choisie (noir/marron = simili cuir ; blanc/vert sauge/bordeaux = forex laqué)
  if v_col.id is not null and v_col.material_id is not null and v_mat.id is not null and v_col.material_id <> v_mat.id then raise exception 'invalid_color'; end if;

  for it in select * from jsonb_array_elements(p->'items') loop
    select * into pr from products where id = (it->>'id')::uuid and active and in_stock;
    if not found then raise exception 'invalid_product'; end if;
    q := greatest(1, least(10, coalesce((it->>'qty')::int, 1)));
    v_items := v_items || jsonb_build_array(jsonb_build_object('id', pr.id, 'name_fr', pr.name_fr, 'name_ar', pr.name_ar, 'category', pr.category, 'price', pr.price, 'slots', pr.slots, 'qty', q));
    v_sub := v_sub + pr.price * q; v_used := v_used + pr.slots * q;
  end loop;
  if v_used = 0 then raise exception 'empty_box'; end if;
  -- capacité en « cases » : parfum = 2 cases, kamiss = 3 cases, autres = 1 case
  if v_size.capacity is not null and v_used > v_size.capacity then raise exception 'over_capacity'; end if;

  v_box := coalesce(v_size.price,0) + coalesce(v_mat.price,0) + coalesce(v_col.price,0);
  select coalesce(nullif(value,'')::int, 0) into v_fee from settings where key = 'delivery_fee';
  v_fee := coalesce(v_fee, 0);
  v_total := v_sub + v_box + v_fee;

  insert into orders (user_id, email, customer_name, phone, wilaya, commune, address, delivery_note, box, items, message, subtotal, delivery_fee, total, lang)
  values (uid, v_email, left(v_name,120), left(v_phone,30), v_wilaya, left(coalesce(p->>'commune',''),100), left(v_addr,300), left(coalesce(p->>'delivery_note',''),300),
    jsonb_build_object(
      'size',     case when v_size.id is null then null else jsonb_build_object('id', v_size.id, 'name_fr', v_size.name_fr, 'name_ar', v_size.name_ar, 'description_fr', v_size.description_fr, 'price', v_size.price) end,
      'material', case when v_mat.id  is null then null else jsonb_build_object('id', v_mat.id,  'name_fr', v_mat.name_fr,  'name_ar', v_mat.name_ar,  'price', v_mat.price)  end,
      'color',    case when v_col.id  is null then null else jsonb_build_object('id', v_col.id,  'name_fr', v_col.name_fr,  'name_ar', v_col.name_ar,  'price', v_col.price, 'hex', v_col.hex) end,
      'price', v_box, 'slots_used', v_used),
    v_items, left(coalesce(p->>'message',''),300), v_sub + v_box, v_fee, v_total, case when p->>'lang' = 'ar' then 'ar' else 'fr' end)
  returning id, number into v_id, v_num;

  return query select v_id, v_num, v_total;
end $$;
revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to authenticated;

-- 5. Photos des produits (stockage public en lecture, écriture admin) -------
insert into storage.buckets (id, name, public) values ('products','products', true) on conflict (id) do nothing;
drop policy if exists "products images read" on storage.objects;
create policy "products images read"  on storage.objects for select using (bucket_id = 'products');
drop policy if exists "products images admin" on storage.objects;
create policy "products images admin" on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());
drop policy if exists "products images admin update" on storage.objects;
create policy "products images admin update" on storage.objects for update using (bucket_id = 'products' and public.is_admin());
drop policy if exists "products images admin delete" on storage.objects;
create policy "products images admin delete" on storage.objects for delete using (bucket_id = 'products' and public.is_admin());

-- 6. Réglages par défaut ----------------------------------------------------
insert into public.settings (key, value) values
  ('delivery_fee','0'), ('phone','+213 783 96 68 42'), ('whatsapp','213783966842'),
  ('instagram','sign_ature2603'), ('email','signature2603@gmail.com'), ('announce_fr',''), ('announce_ar','')
on conflict (key) do nothing;

-- 7. Catalogue (articles, tailles, matières, couleurs, collections) : voir catalogue_seed.sql

-- 8. ADMINISTRATEUR — mettre ici l'e-mail qui gérera le catalogue ------------
insert into public.admins (email) values ('denni.lyes@gmail.com') on conflict do nothing;

-- 9. Rechargement du cache de l'API (pour que les nouvelles colonnes soient vues tout de suite)
notify pgrst, 'reload schema';
-- Pour ajouter l'ami plus tard : insert into public.admins (email) values ('son.adresse@gmail.com');
