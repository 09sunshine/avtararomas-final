create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price numeric(12,2) not null,
  original_price numeric(12,2),
  category text not null,
  subcategory text,
  images text[] not null,
  description text not null,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  stock integer not null default 0,
  tags text[] default array[]::text[],
  sizes text[] default array[]::text[],
  featured boolean default false,
  is_new boolean default false,
  top_notes text,
  heart_notes text,
  base_notes text,
  ingredients text,
  longevity text,
  sillage text,
  season text,
  origin text,
  concentration text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists top_notes text;
alter table public.products add column if not exists heart_notes text;
alter table public.products add column if not exists base_notes text;
alter table public.products add column if not exists ingredients text;
alter table public.products add column if not exists longevity text;
alter table public.products add column if not exists sillage text;
alter table public.products add column if not exists season text;
alter table public.products add column if not exists origin text;
alter table public.products add column if not exists concentration text;


create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null,
  email text not null unique,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.users (id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_role text not null default 'customer' check (customer_role in ('customer', 'admin')),
  status text not null default 'processing' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  coupon_code text,
  payment_method text,
  payment_status text not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  razorpay_refund_id text,
  notes text,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_line1 text not null,
  shipping_line2 text,
  shipping_city text not null,
  shipping_state text not null,
  shipping_pincode text not null,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists razorpay_refund_id text;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  product_slug text not null,
  product_name text not null,
  product_image text,
  price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  product_id text not null,
  product_slug text not null,
  product_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists reviews_product_id_idx on public.reviews (product_id);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount integer not null check (discount between 1 and 90),
  uses integer not null default 0,
  "limit" integer not null default 100,
  active boolean not null default true,
  expiry text,
  min_order numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id text primary key default 'default',
  store_name text not null default 'Avtar Aromas',
  support_email text not null default 'hello@avtararomas.com',
  phone text not null default '+91 98765 43210',
  gst text default '29ABCDE1234F1Z5',
  currency text not null default 'INR',
  free_shipping_threshold numeric(12,2) not null default 999,
  standard_shipping_fee numeric(12,2) not null default 149,
  order_alerts boolean not null default true,
  stock_alerts boolean not null default true,
  news_alerts boolean not null default false,
  instagram text default '@avtararomas',
  facebook text default 'avtararomas',
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

insert into public.store_settings (id)
values ('default')
on conflict (id) do nothing;

