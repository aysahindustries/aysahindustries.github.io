-- =====================================================================
-- AYSAH INDUSTRIES LTD – database setup
-- Supabase dashboard -> SQL Editor -> New query -> paste ALL of this -> Run
-- =====================================================================

-- ---------- tables ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client','admin')),
  created_at timestamptz default now()
);

create table if not exists public.slides (
  id uuid primary key default gen_random_uuid(),
  sort int default 10,
  image_url text, title_rw text, title2_rw text, title_en text, title2_en text, text_rw text, text_en text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'product' check (kind in ('product','service')),
  category text, name text not null,
  description_rw text, description_en text,
  price_pi numeric(18,7) not null default 0 check (price_pi >= 0),
  image_url text,
  available boolean default true, featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.team (
  id uuid primary key default gen_random_uuid(),
  sort int default 10, name text not null,
  role_rw text, role_en text, bio_rw text, bio_en text, email text, phone text, photo_url text,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text, customer_email text, customer_phone text,
  product_id uuid references public.products(id) on delete set null,
  product_name text, kind text,
  amount_pi numeric(18,7) not null default 0,
  status text not null default 'pending'
    check (status in ('pending','requested','approved','paid','processing','delivered','cancelled')),
  payment_id text unique, txid text, admin_note text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text, email text, phone text, subject text, message text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ---------- helpers ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- New sign-up -> profile row. The owner's email becomes admin automatically.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email,
          new.raw_user_meta_data->>'full_name',
          new.raw_user_meta_data->>'phone',
          case when lower(new.email) = 'aysah22n@gmail.com' then 'admin' else 'client' end)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Clients may edit their name/phone but never their role.
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists protect_role on public.profiles;
create trigger protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- Clients can't mark their own order paid or change its price.
-- (Pi payment functions use the service key, which bypasses this check.)
create or replace function public.protect_order() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() or auth.role() = 'service_role' then return new; end if;
  if tg_op = 'INSERT' then
    new.user_id := auth.uid();
    new.payment_id := null; new.txid := null; new.paid_at := null; new.admin_note := null;
    -- price always comes from the product table
    select case when p.kind = 'product' then p.price_pi else 0 end, p.name, p.kind
      into new.amount_pi, new.product_name, new.kind
      from public.products p where p.id = new.product_id;
    new.status := case when coalesce(new.amount_pi,0) > 0 then 'pending' else 'requested' end;
  else
    -- a client may only cancel an unpaid order
    if not (old.status in ('pending','requested') and new.status = 'cancelled') then
      raise exception 'Not allowed';
    end if;
    new := old; new.status := 'cancelled';
  end if;
  return new;
end $$;
drop trigger if exists protect_order on public.orders;
create trigger protect_order before insert or update on public.orders
  for each row execute function public.protect_order();

-- ---------- row level security ----------
alter table public.settings enable row level security;
alter table public.profiles enable row level security;
alter table public.slides   enable row level security;
alter table public.products enable row level security;
alter table public.team     enable row level security;
alter table public.orders   enable row level security;
alter table public.messages enable row level security;

drop policy if exists "read settings" on public.settings;
create policy "read settings" on public.settings for select using (true);
drop policy if exists "admin settings" on public.settings;
create policy "admin settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

do $$ declare t text; begin
  foreach t in array array['slides','products','team'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (id = auth.uid() or public.is_admin());

drop policy if exists "orders read" on public.orders;
create policy "orders read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders insert" on public.orders;
create policy "orders insert" on public.orders for insert with check (auth.uid() is not null);
drop policy if exists "orders update" on public.orders;
create policy "orders update" on public.orders for update using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders delete" on public.orders;
create policy "orders delete" on public.orders for delete using (public.is_admin());

drop policy if exists "anyone can write" on public.messages;
create policy "anyone can write" on public.messages for insert with check (true);
drop policy if exists "admin messages" on public.messages;
create policy "admin messages" on public.messages for select using (public.is_admin());
drop policy if exists "admin messages upd" on public.messages;
create policy "admin messages upd" on public.messages for update using (public.is_admin());
drop policy if exists "admin messages del" on public.messages;
create policy "admin messages del" on public.messages for delete using (public.is_admin());

-- ---------- image storage ----------
insert into storage.buckets (id, name, public) values ('media','media', true)
  on conflict (id) do update set public = true;
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ---------- starting content (edit later from the Admin panel) ----------
insert into public.settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

insert into public.slides (sort, image_url, title_rw, title2_rw, title_en, title2_en, text_rw, text_en)
select * from (values
  (1, './images/actros-front.jpg', 'Imodoka zizewe.', 'Ibiciro bisobanutse.', 'Reliable vehicles.', 'Clear prices.', 'Hitamo imodoka ikubereye muri AYSAH INDUSTRIES, wishyure ukoresheje Pi.', 'Choose the right vehicle at AYSAH INDUSTRIES and pay with Pi.'),
  (2, './images/dump-trucks.jpg', 'Amakamyo mashya', 'ageze mu Rwanda.', 'New trucks', 'arriving in Rwanda.', 'Dump trucks na za kamyo z''imirimo itandukanye.', 'Dump trucks and work trucks for every job.'),
  (3, './images/g-class.jpg', 'Imodoka nziza', 'z''abantu ku giti cyabo.', 'Premium cars', 'for personal use.', 'SUV, imodoka nto n''iz''akazi.', 'SUVs, city cars and business cars.')
) v where not exists (select 1 from public.slides);

insert into public.products (kind, category, name, description_rw, description_en, price_pi, image_url, featured)
select * from (values
  ('product','SUV','Mercedes-Benz G-Class','SUV y''umukara, imeze neza cyane, ifite amapine mashya.','Black luxury SUV in excellent condition with new tyres.',250,'./images/g-class.jpg',true),
  ('product','Dump truck','Sinotruk HOWO Dump Truck','Kamyo y''ibitaka nshya, ikwiriye imirimo y''ubwubatsi.','New dump truck for construction work.',180,'./images/dump-trucks.jpg',true),
  ('product','Truck','Mercedes-Benz Actros + Container','Kamyo nini ifite container yo gutwara ibicuruzwa (transit goods).','Heavy truck with cargo container for transit goods.',300,'./images/actros-container.jpg',true),
  ('product','Trailer','Container Trailer (Orange)','Remorque ifite container, yiteguye gukoreshwa.','Container trailer, ready for use.',120,'./images/trailer-orange.jpg',false),
  ('service','Import','Vehicle import on order','Tukuzanira imodoka wahisemo, tugakurikirana gasutamo kugeza igeze iwawe.','We import the vehicle you choose and handle customs until delivery.',0,'./images/dump-trucks.jpg',false),
  ('service','Assembly','Truck body & container assembly','Duteranya container, citerne na carrosserie ku makamyo.','We assemble containers, tanks and truck bodies.',0,'./images/actros-front.jpg',false)
) v(kind,category,name,description_rw,description_en,price_pi,image_url,featured) where not exists (select 1 from public.products);

insert into public.team (sort, name, role_rw, role_en, bio_rw, bio_en, email, phone)
select 1, 'MUTABAZI Yves', 'Nyiri ikigo & Umuyobozi Mukuru', 'Owner & Managing Director',
       'Ayobora AYSAH INDUSTRIES LTD n''ubucuruzi bwayo bwose.', 'Leads AYSAH INDUSTRIES LTD and all of its business.',
       'aysah22n@gmail.com', '+250 784 578 722'
where not exists (select 1 from public.team);
