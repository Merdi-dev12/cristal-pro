create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  period text not null,
  description text not null,
  features text[] not null default '{}',
  highlighted boolean not null default false,
  badge text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_slug text not null references public.subscription_plans(slug),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

alter table public.subscription_plans enable row level security;
alter table public.subscription_requests enable row level security;
grant select on public.subscription_plans to anon, authenticated;
grant select, insert on public.subscription_requests to authenticated;

create policy subscription_plans_select_active on public.subscription_plans for select to anon, authenticated using (active = true);
create policy subscription_plans_admin_write on public.subscription_plans for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy subscription_requests_select_own_or_admin on public.subscription_requests for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy subscription_requests_insert_own on public.subscription_requests for insert to authenticated with check (user_id = (select auth.uid()));
create policy subscription_requests_admin_update on public.subscription_requests for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.subscription_plans (slug, name, price, period, description, features, highlighted, badge, display_order)
values
('preview', 'Aperçu', 0, 'pour toujours', 'Pour découvrir les annonces et préparer votre recherche.', array['Accès aux annonces publiques', 'Filtres de recherche', 'Conseils immobiliers'], false, null, 0),
('rheodyce', 'Abonnement immobilier', 19.9, 'par mois', 'Tout ce qu’il faut pour avancer avec plus de visibilité et de sécurité.', array['Coordonnées des propriétaires et agences', 'Localisation précise des biens', 'Photos et informations complètes', 'Support prioritaire RHEODYCE'], true, 'Le plus choisi', 1),
('accompagnement', 'Accompagnement', 49.9, 'par mois', 'Une formule avec accompagnement renforcé pour les recherches exigeantes.', array['Tous les avantages RHEODYCE', 'Mise en relation prioritaire', 'Conseils personnalisés'], false, null, 2)
on conflict (slug) do update set name = excluded.name, price = excluded.price, period = excluded.period, description = excluded.description, features = excluded.features, highlighted = excluded.highlighted, badge = excluded.badge, display_order = excluded.display_order, active = true;
