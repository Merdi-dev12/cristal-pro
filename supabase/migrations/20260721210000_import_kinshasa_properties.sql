-- Add the explicit "immeuble" category used by the I-prefixed source files.
alter table public.properties
  drop constraint if exists properties_category_check;

alter table public.properties
  add constraint properties_category_check
  check (category in ('maison', 'appartement', 'residence', 'immeuble', 'terrain'));

alter table public.property_submissions
  drop constraint if exists property_submissions_category_check;

alter table public.property_submissions
  add constraint property_submissions_category_check
  check (category in ('maison', 'appartement', 'residence', 'immeuble', 'terrain'));

-- The source archive does not contain verified addresses or technical sheets.
-- These records are public at the owner's request but intentionally remain
-- unverified until an admin confirms ownership, exact coordinates, room
-- counts, surfaces and prices.
insert into public.properties (
  id,
  title,
  price,
  price_suffix,
  location,
  address,
  bedrooms,
  bathrooms,
  surface,
  type,
  category,
  image_url,
  photos,
  featured,
  verified,
  description,
  latitude,
  longitude,
  status,
  owner_name
)
values
  (
    'a71e0000-0000-4000-8000-000000000001',
    'Maison familiale avec cour à Kinsuka',
    195000,
    null,
    'Ngaliema, Kinshasa',
    'Secteur Kinsuka, Ngaliema',
    4,
    3,
    420,
    'vente',
    'maison',
    '/assets/properties/m1/m1-01.webp',
    array[
      '/assets/properties/m1/m1-01.webp',
      '/assets/properties/m1/m1-02.webp',
      '/assets/properties/m1/m1-03.webp',
      '/assets/properties/m1/m1-04.webp',
      '/assets/properties/m1/m1-05.webp'
    ]::text[],
    false,
    false,
    'Maison familiale sur deux niveaux avec cour arborée, circulation extérieure couverte et pièces de vie généreuses. La cuisine indépendante, les sols carrelés et les ouvertures protégées en font une base fonctionnelle pour une résidence principale à Ngaliema.',
    -4.3562000,
    15.2279000,
    'published',
    null
  ),
  (
    'a71e0000-0000-4000-8000-000000000002',
    'Maison moderne avec grande cour à Cité Verte',
    900,
    '/mois',
    'Mont-Ngafula, Kinshasa',
    'Quartier Cité Verte, Mont-Ngafula',
    3,
    2,
    360,
    'location',
    'maison',
    '/assets/properties/m2/m2-01.webp',
    array[
      '/assets/properties/m2/m2-01.webp',
      '/assets/properties/m2/m2-02.webp',
      '/assets/properties/m2/m2-03.webp'
    ]::text[],
    false,
    false,
    'Maison moderne dans une parcelle clôturée, avec vaste cour pavée permettant le stationnement de plusieurs véhicules. L’accès latéral, les dépendances et l’organisation du bâti conviennent à une famille recherchant de l’espace dans un secteur résidentiel de Mont-Ngafula.',
    -4.4209000,
    15.2706000,
    'published',
    null
  ),
  (
    'a71e0000-0000-4000-8000-000000000003',
    'Maison rénovée à Matadi-Kibala',
    600,
    '/mois',
    'Mont-Ngafula, Kinshasa',
    'Secteur Matadi-Kibala, Mont-Ngafula',
    3,
    2,
    180,
    'location',
    'maison',
    '/assets/properties/m3/m3-01.webp',
    array[
      '/assets/properties/m3/m3-01.webp',
      '/assets/properties/m3/m3-02.webp',
      '/assets/properties/m3/m3-03.webp',
      '/assets/properties/m3/m3-04.webp',
      '/assets/properties/m3/m3-05.webp'
    ]::text[],
    false,
    false,
    'Maison fraîchement rénovée aux finitions claires, avec séjour carrelé, éclairage décoratif et cuisine équipée de rangements. Le plan compact facilite l’entretien quotidien et répond aux besoins d’un foyer souhaitant s’installer dans la zone de Matadi-Kibala.',
    -4.4467000,
    15.2389000,
    'published',
    null
  ),
  (
    'a71e0000-0000-4000-8000-000000000004',
    'Maison de standing avec jardin à Joli Parc',
    320000,
    null,
    'Ngaliema, Kinshasa',
    'Quartier Joli Parc, Ngaliema',
    5,
    4,
    480,
    'vente',
    'maison',
    '/assets/properties/m4/m4-01.webp',
    array[
      '/assets/properties/m4/m4-01.webp',
      '/assets/properties/m4/m4-02.webp',
      '/assets/properties/m4/m4-03.webp',
      '/assets/properties/m4/m4-04.webp',
      '/assets/properties/m4/m4-05.webp'
    ]::text[],
    true,
    false,
    'Maison de standing entourée de végétation, avec séjour meublé, espace repas, escalier intérieur et terrasses protégées. Les volumes de réception et les circulations extérieures offrent un cadre confortable et discret dans le secteur résidentiel de Joli Parc.',
    -4.3501000,
    15.2536000,
    'published',
    null
  ),
  (
    'a71e0000-0000-4000-8000-000000000005',
    'Immeuble mixte aménagé à Ma Campagne',
    680000,
    null,
    'Ngaliema, Kinshasa',
    'Quartier Ma Campagne, Ngaliema',
    10,
    8,
    950,
    'vente',
    'immeuble',
    '/assets/properties/i1/i1-01.webp',
    array[
      '/assets/properties/i1/i1-01.webp',
      '/assets/properties/i1/i1-02.webp',
      '/assets/properties/i1/i1-03.webp',
      '/assets/properties/i1/i1-04.webp',
      '/assets/properties/i1/i1-05.webp',
      '/assets/properties/i1/i1-06.webp',
      '/assets/properties/i1/i1-07.webp'
    ]::text[],
    true,
    false,
    'Immeuble à vocation mixte réunissant des espaces de réception aménagés, des unités résidentielles meublées et des zones de service. Les intérieurs contemporains, les cuisines équipées et les salles d’eau individuelles permettent d’envisager une exploitation en résidence hôtelière, bureaux ou restauration, sous réserve des autorisations nécessaires.',
    -4.3379000,
    15.2678000,
    'published',
    null
  ),
  (
    'a71e0000-0000-4000-8000-000000000006',
    'Parcelle clôturée avec bâti à Maluku',
    38000,
    null,
    'Maluku, Kinshasa',
    'Secteur Maluku-centre, Kinshasa',
    0,
    0,
    600,
    'vente',
    'terrain',
    '/assets/properties/p1/p1-01.webp',
    array[
      '/assets/properties/p1/p1-01.webp',
      '/assets/properties/p1/p1-02.webp',
      '/assets/properties/p1/p1-03.webp',
      '/assets/properties/p1/p1-04.webp'
    ]::text[],
    false,
    false,
    'Parcelle clôturée accessible par un portail métallique et comprenant plusieurs constructions légères déjà occupables. La cour dégagée laisse une marge d’aménagement pour un projet résidentiel ou locatif. La superficie, les limites et les titres fonciers devront être confirmés par mesurage et vérification documentaire.',
    -4.0549000,
    15.5612000,
    'published',
    null
  ),
  (
    'a71e0000-0000-4000-8000-000000000007',
    'Parcelle bâtie à Lutendele',
    65000,
    null,
    'Mont-Ngafula, Kinshasa',
    'Quartier Lutendele, Mont-Ngafula',
    0,
    0,
    500,
    'vente',
    'terrain',
    '/assets/properties/p2/p2-01.webp',
    array[
      '/assets/properties/p2/p2-01.webp',
      '/assets/properties/p2/p2-02.webp',
      '/assets/properties/p2/p2-03.webp',
      '/assets/properties/p2/p2-04.webp'
    ]::text[],
    false,
    false,
    'Parcelle arborée comprenant une maison basse récente avec véranda, façade carrelée et cour en terre. Le bâti existant peut servir de logement principal ou de point de départ pour une extension. Les dimensions cadastrales, les raccordements et la conformité du titre restent à vérifier avant toute transaction.',
    -4.4016000,
    15.2119000,
    'published',
    null
  ),
  (
    'a71e0000-0000-4000-8000-000000000008',
    'Villa de plain-pied sur grande parcelle à Kimwenza',
    260000,
    null,
    'Mont-Ngafula, Kinshasa',
    'Quartier Kimwenza, Mont-Ngafula',
    5,
    4,
    900,
    'vente',
    'residence',
    '/assets/properties/v1/v1-01.webp',
    array[
      '/assets/properties/v1/v1-01.webp',
      '/assets/properties/v1/v1-02.webp',
      '/assets/properties/v1/v1-03.webp',
      '/assets/properties/v1/v1-04.webp',
      '/assets/properties/v1/v1-05.webp',
      '/assets/properties/v1/v1-06.webp'
    ]::text[],
    true,
    false,
    'Villa de plain-pied implantée sur une vaste parcelle arborée, avec galerie couverte, grandes pièces de réception et cour pavée. Son organisation horizontale, ses multiples accès et l’espace disponible autour du bâti conviennent à une résidence familiale, une maison d’hôtes ou un usage institutionnel.',
    -4.4600000,
    15.2890000,
    'published',
    null
  )
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  price_suffix = excluded.price_suffix,
  location = excluded.location,
  address = excluded.address,
  bedrooms = excluded.bedrooms,
  bathrooms = excluded.bathrooms,
  surface = excluded.surface,
  type = excluded.type,
  category = excluded.category,
  image_url = excluded.image_url,
  photos = excluded.photos,
  featured = excluded.featured,
  verified = excluded.verified,
  description = excluded.description,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  status = excluded.status,
  owner_name = excluded.owner_name;
