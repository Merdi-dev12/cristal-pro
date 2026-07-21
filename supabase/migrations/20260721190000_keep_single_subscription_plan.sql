update public.subscription_plans
set active = false
where slug <> 'rheodyce';

insert into public.subscription_plans (
  slug,
  name,
  price,
  period,
  description,
  features,
  highlighted,
  badge,
  display_order,
  active
)
values (
  'rheodyce',
  'Abonnement immobilier',
  19.9,
  'par mois',
  'Tout ce qu’il faut pour avancer avec plus de visibilité et de sécurité.',
  array[
    'Coordonnées des propriétaires et agences',
    'Localisation précise des biens',
    'Photos et informations complètes',
    'Support prioritaire RHEODYCE'
  ],
  true,
  null,
  1,
  true
)
on conflict (slug) do update
set
  name = excluded.name,
  price = excluded.price,
  period = excluded.period,
  description = excluded.description,
  features = excluded.features,
  highlighted = excluded.highlighted,
  badge = excluded.badge,
  display_order = excluded.display_order,
  active = excluded.active;
