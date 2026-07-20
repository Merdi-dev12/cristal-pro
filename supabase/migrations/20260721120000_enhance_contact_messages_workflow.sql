alter table public.contact_messages
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists notification_status text not null default 'pending',
  add column if not exists notification_error text,
  add column if not exists notified_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.contact_messages
  drop constraint if exists contact_messages_notification_status_check;

alter table public.contact_messages
  add constraint contact_messages_notification_status_check
  check (notification_status in ('pending', 'sent', 'failed'));

create index if not exists contact_messages_user_id_created_at_idx
  on public.contact_messages(user_id, created_at desc)
  where user_id is not null;

drop trigger if exists contact_messages_updated_at on public.contact_messages;
create trigger contact_messages_updated_at
before update on public.contact_messages
for each row execute function public.set_admin_workspace_updated_at();

alter table public.contact_messages enable row level security;

revoke all on public.contact_messages from anon;
revoke all on public.contact_messages from authenticated;
grant select on public.contact_messages to authenticated;
grant update (status, updated_at) on public.contact_messages to authenticated;

drop policy if exists contact_messages_select_admin on public.contact_messages;
drop policy if exists contact_messages_update_admin on public.contact_messages;
drop policy if exists contact_messages_select_own_or_admin on public.contact_messages;
drop policy if exists contact_messages_update_admin_only on public.contact_messages;

create policy contact_messages_select_own_or_admin
  on public.contact_messages for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy contact_messages_update_admin_only
  on public.contact_messages for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
