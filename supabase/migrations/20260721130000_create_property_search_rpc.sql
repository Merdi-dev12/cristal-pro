create extension if not exists pg_trgm with schema extensions;

create index if not exists properties_public_filter_idx
  on public.properties (status, type, category, verified);

create index if not exists properties_public_price_idx
  on public.properties (price);

create index if not exists properties_public_bedrooms_idx
  on public.properties (bedrooms);

create index if not exists properties_public_surface_idx
  on public.properties (surface);

create index if not exists properties_public_created_at_idx
  on public.properties (created_at desc);

create index if not exists properties_public_text_search_trgm_idx
  on public.properties
  using gin ((
    coalesce(title, '') || ' ' ||
    coalesce(location, '') || ' ' ||
    coalesce(address, '') || ' ' ||
    coalesce(description, '')
  ) extensions.gin_trgm_ops);

create or replace function public.search_properties(
  p_query text default null,
  p_type text default null,
  p_category text default null,
  p_location text default null,
  p_budget_max numeric default null,
  p_bedrooms_min integer default null,
  p_verified_only boolean default false,
  p_sort text default 'recent',
  p_limit integer default 60,
  p_offset integer default 0
)
returns setof public.properties
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select properties.*
  from public.properties
  where status = 'published'
    and (
      nullif(trim(coalesce(p_query, '')), '') is null
      or (
        coalesce(title, '') || ' ' ||
        coalesce(location, '') || ' ' ||
        coalesce(address, '') || ' ' ||
        coalesce(description, '')
      ) ilike '%' || trim(p_query) || '%'
    )
    and (p_type is null or p_type = 'all' or type = p_type)
    and (p_category is null or p_category = 'all' or category = p_category)
    and (
      nullif(trim(coalesce(p_location, '')), '') is null
      or (
        coalesce(location, '') || ' ' ||
        coalesce(address, '')
      ) ilike '%' || trim(p_location) || '%'
    )
    and (p_budget_max is null or price <= p_budget_max)
    and (p_bedrooms_min is null or bedrooms >= p_bedrooms_min)
    and (coalesce(p_verified_only, false) = false or verified is true)
  order by
    case when p_sort = 'price-asc' then price end asc nulls last,
    case when p_sort = 'price-desc' then price end desc nulls last,
    case when p_sort = 'surface-desc' then surface end desc nulls last,
    created_at desc
  limit least(greatest(coalesce(p_limit, 60), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

grant execute on function public.search_properties(
  text,
  text,
  text,
  text,
  numeric,
  integer,
  boolean,
  text,
  integer,
  integer
) to anon, authenticated;
