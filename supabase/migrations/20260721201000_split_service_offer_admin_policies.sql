-- Avoid overlapping permissive SELECT policies while preserving the full
-- catalogue management capabilities for administrators.
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
