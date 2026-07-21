-- Keep the public catalogue compatible with the admin workspace and expose
-- only active offers to visitors.
alter table public.service_offers
  add column if not exists active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.service_offers enable row level security;

grant select on public.service_offers to anon, authenticated;
grant insert, update, delete on public.service_offers to authenticated;

drop policy if exists service_offers_select_all on public.service_offers;
drop policy if exists service_offers_select_active on public.service_offers;
create policy service_offers_select_active
  on public.service_offers for select to anon
  using (active = true);

drop policy if exists service_offers_select_active_or_admin on public.service_offers;
create policy service_offers_select_active_or_admin
  on public.service_offers for select to authenticated
  using (active = true or (select public.is_admin()));

drop policy if exists service_offers_write_admin on public.service_offers;
drop policy if exists service_offers_insert_admin on public.service_offers;
create policy service_offers_insert_admin
  on public.service_offers for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists service_offers_update_admin on public.service_offers;
create policy service_offers_update_admin
  on public.service_offers for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists service_offers_delete_admin on public.service_offers;
create policy service_offers_delete_admin
  on public.service_offers for delete to authenticated
  using ((select public.is_admin()));

create or replace function public.set_service_offer_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_service_offer_updated_at() from public, anon, authenticated;

drop trigger if exists service_offers_updated_at on public.service_offers;
create trigger service_offers_updated_at
before update on public.service_offers
for each row execute function public.set_service_offer_updated_at();

insert into public.service_offers (
  slug,
  title,
  eyebrow,
  description,
  icon,
  cta,
  display_order,
  active
)
values
  (
    'demenagement',
    'Déménagement',
    'Logistique',
    'Organisation du transport, estimation du trajet et mise en relation avec un partenaire terrain.',
    '↗',
    'Planifier mon déménagement',
    6,
    true
  ),
  (
    'installation-solaire',
    'Installation de panneaux solaires',
    'Énergie',
    'Étude du besoin, dimensionnement et mise en relation avec un installateur de panneaux solaires qualifié.',
    '☀',
    'Étudier mon installation',
    7,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  description = excluded.description,
  icon = excluded.icon,
  cta = excluded.cta,
  display_order = excluded.display_order,
  active = excluded.active;

alter table public.service_requests
  drop constraint if exists service_requests_service_type_check;

alter table public.service_requests
  add constraint service_requests_service_type_check
  check (service_type in (
    'verification',
    'location-vente',
    'maintenance',
    'decoration',
    'juridique',
    'demenagement',
    'installation-solaire'
  ));
