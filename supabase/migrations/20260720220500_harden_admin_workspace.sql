-- Tighten the new admin workspace policies and remove public RPC access to
-- the existing admin helper while keeping it available to RLS evaluation.

create index if not exists admin_notification_logs_prepared_by_idx
  on public.admin_notification_logs(prepared_by);
create index if not exists property_submission_decisions_decided_by_idx
  on public.property_submission_decisions(decided_by);
create index if not exists property_submissions_decision_by_idx
  on public.property_submissions(decision_by);
create index if not exists property_submissions_published_property_idx
  on public.property_submissions(published_property_id);

drop policy if exists property_private_details_admin_write on public.property_private_details;
create policy property_private_details_admin_insert
  on public.property_private_details for insert to authenticated
  with check ((select public.is_admin()));
create policy property_private_details_admin_update
  on public.property_private_details for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy property_private_details_admin_delete
  on public.property_private_details for delete to authenticated
  using ((select public.is_admin()));

revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
