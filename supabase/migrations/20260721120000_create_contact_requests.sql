create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  city text,
  need text not null,
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_requests_user_id_created_at_idx
  on public.contact_requests(user_id, created_at desc);

alter table public.contact_requests enable row level security;
grant select, insert on public.contact_requests to authenticated;

create policy "Users can view their contact requests"
  on public.contact_requests for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their contact requests"
  on public.contact_requests for insert to authenticated
  with check ((select auth.uid()) = user_id);
