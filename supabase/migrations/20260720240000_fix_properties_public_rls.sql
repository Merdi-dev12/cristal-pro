-- Allow public visitors to read published properties without calling the
-- admin helper. The helper is intentionally not executable by anon.
drop policy if exists properties_select_published_or_admin on public.properties;

create policy properties_select_published_anon
  on public.properties for select to anon
  using (status = 'published');

create policy properties_select_published_authenticated
  on public.properties for select to authenticated
  using (status = 'published' or (select public.is_admin()));

drop policy if exists properties_write_admin on public.properties;

create policy properties_write_admin
  on public.properties for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke insert, update, delete on public.properties from anon;
grant select on public.properties to anon;
