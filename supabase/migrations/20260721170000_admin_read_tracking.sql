-- Keep workflow statuses independent from the admin notification badges.
-- A resource becomes read when an administrator opens its detail page.

alter table public.visit_requests
  add column if not exists read_at timestamptz;

alter table public.service_requests
  add column if not exists read_at timestamptz;

alter table public.property_submissions
  add column if not exists read_at timestamptz;

alter table public.properties
  add column if not exists read_at timestamptz;

grant update (read_at) on public.visit_requests to authenticated;
grant update (read_at) on public.service_requests to authenticated;
grant update (read_at) on public.property_submissions to authenticated;
grant update (read_at) on public.properties to authenticated;
