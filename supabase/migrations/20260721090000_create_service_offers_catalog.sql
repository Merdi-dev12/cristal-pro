-- Catalogue public des services RHEODYCE.
-- Les visiteurs ne voient que les services actifs ; seuls les admins peuvent
-- créer, modifier, désactiver ou supprimer une offre.
create table if not exists public.service_offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 160),
  eyebrow text not null check (char_length(eyebrow) between 2 and 80),
  description text not null check (char_length(description) between 10 and 1000),
  icon text not null default '✦',
  cta text not null check (char_length(cta) between 2 and 80),
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibilité avec une éventuelle table créée lors d’un déploiement
-- précédent avant l’ajout de l’activation et de la date de modification.
alter table public.service_offers
  add column if not exists active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.service_offers enable row level security;

grant select on public.service_offers to anon, authenticated;
grant insert, update, delete on public.service_offers to authenticated;

drop policy if exists service_offers_select_active on public.service_offers;
drop policy if exists service_offers_select_all on public.service_offers;
create policy service_offers_select_active
  on public.service_offers for select to anon
  using (active = true);

drop policy if exists service_offers_select_active_or_admin on public.service_offers;
create policy service_offers_select_active_or_admin
  on public.service_offers for select to authenticated
  using (active = true or (select public.is_admin()));

drop policy if exists service_offers_write_admin on public.service_offers;
create policy service_offers_write_admin
  on public.service_offers for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

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

drop trigger if exists service_offers_updated_at on public.service_offers;
create trigger service_offers_updated_at
before update on public.service_offers
for each row execute function public.set_service_offer_updated_at();

revoke execute on function public.set_service_offer_updated_at() from public;

insert into public.service_offers (slug, title, eyebrow, description, icon, cta, display_order)
values
  ('verification', 'Vérification anti-fraude', 'Confiance', 'Contrôle des informations, cohérence des pièces et statut du bien avant mise en relation.', '✓', 'Voir le protocole', 1),
  ('location-vente', 'Location & vente', 'Transaction', 'Un parcours clair pour trouver, visiter, comparer et sécuriser votre prochain bien.', '⌂', 'Explorer', 2),
  ('maintenance', 'Maintenance immobilière', 'Après-vente', 'Plomberie, électricité, climatisation, peinture et remise en état avec prestataires suivis.', '⚙', 'Demander un devis', 3),
  ('decoration', 'Décoration intérieure', 'Valorisation', 'Aménagement, rénovation légère et mise en scène pour louer ou vendre plus vite.', '◐', 'S’inspirer', 4),
  ('juridique', 'Assistance juridique', 'Protection', 'Appui documentaire et orientation vers un cabinet partenaire en droit immobilier.', '§', 'Être accompagné', 5),
  ('demenagement', 'Déménagement', 'Logistique', 'Organisation du transport, estimation du trajet et mise en relation avec un partenaire terrain.', '↗', 'Planifier mon déménagement', 6)
on conflict (slug) do update set
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  description = excluded.description,
  icon = excluded.icon,
  cta = excluded.cta,
  display_order = excluded.display_order,
  active = true;
