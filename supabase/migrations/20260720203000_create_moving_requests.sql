create table if not exists public.moving_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  departure_address text not null check (char_length(departure_address) between 3 and 500),
  arrival_address text not null check (char_length(arrival_address) between 3 and 500),
  moving_date date not null,
  estimated_volume numeric(8, 2) not null check (estimated_volume > 0 and estimated_volume <= 1000),
  floor integer not null default 0 check (floor between 0 and 100),
  has_elevator boolean not null default false,
  departure_coordinates jsonb,
  arrival_coordinates jsonb,
  route_distance_km numeric(10, 2) check (route_distance_km is null or route_distance_km >= 0),
  route_duration_minutes integer check (route_duration_minutes is null or route_duration_minutes >= 0),
  status text not null default 'reçue' check (status in ('reçue', 'en traitement', 'assignée', 'terminée', 'annulée')),
  assigned_partner_id text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists moving_requests_user_id_idx on public.moving_requests(user_id);
create index if not exists moving_requests_status_idx on public.moving_requests(status);
create index if not exists moving_requests_date_idx on public.moving_requests(moving_date);

alter table public.moving_requests enable row level security;

grant select, insert on public.moving_requests to authenticated;
grant update (status, assigned_partner_id, admin_notes, updated_at) on public.moving_requests to authenticated;

drop policy if exists moving_requests_select_own_or_admin on public.moving_requests;
create policy moving_requests_select_own_or_admin
  on public.moving_requests for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists moving_requests_insert_own on public.moving_requests;
create policy moving_requests_insert_own
  on public.moving_requests for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists moving_requests_update_admin on public.moving_requests;
create policy moving_requests_update_admin
  on public.moving_requests for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace function public.set_moving_request_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists moving_requests_updated_at on public.moving_requests;
create trigger moving_requests_updated_at
before update on public.moving_requests
for each row execute function public.set_moving_request_updated_at();

revoke execute on function public.set_moving_request_updated_at() from public;
