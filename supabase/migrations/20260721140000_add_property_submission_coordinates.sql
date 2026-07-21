alter table public.property_submissions
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7);

alter table public.property_submissions
  drop constraint if exists property_submissions_latitude_check,
  drop constraint if exists property_submissions_longitude_check;

alter table public.property_submissions
  add constraint property_submissions_latitude_check
    check (latitude is null or latitude between -90 and 90),
  add constraint property_submissions_longitude_check
    check (longitude is null or longitude between -180 and 180);

alter table public.properties
  drop constraint if exists properties_latitude_check,
  drop constraint if exists properties_longitude_check;

alter table public.properties
  add constraint properties_latitude_check
    check (latitude is null or latitude between -90 and 90),
  add constraint properties_longitude_check
    check (longitude is null or longitude between -180 and 180);
