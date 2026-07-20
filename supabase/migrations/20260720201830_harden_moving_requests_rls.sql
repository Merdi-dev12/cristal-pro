drop policy if exists moving_requests_select_own_or_admin on public.moving_requests;
create policy moving_requests_select_own_or_admin
  on public.moving_requests for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    )
  );

drop policy if exists moving_requests_update_admin on public.moving_requests;
create policy moving_requests_update_admin
  on public.moving_requests for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    )
  );
