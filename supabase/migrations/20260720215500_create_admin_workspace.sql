-- RHEODYCE admin workspace
-- All operational tables are protected by RLS. Private property details stay
-- outside the public properties table so they can only be read by subscribers
-- and administrators.

alter table public.properties
  add column if not exists photos text[] not null default '{}',
  add column if not exists owner_name text;

alter table public.service_requests
  add column if not exists notification_prepared boolean not null default false;

create table if not exists public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  requested_date date not null,
  requested_time text not null check (char_length(requested_time) between 1 and 40),
  status text not null default 'en attente' check (status in ('en attente', 'confirmée', 'annulée', 'terminée')),
  message text,
  internal_note text,
  notification_prepared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  owner_name text not null,
  owner_email text not null,
  title text not null check (char_length(title) between 3 and 180),
  category text not null check (category in ('maison', 'appartement', 'residence', 'terrain')),
  type text not null check (type in ('vente', 'location')),
  city text not null,
  address text not null,
  price numeric not null check (price >= 0),
  surface numeric not null check (surface > 0),
  description text not null,
  photos text[] not null default '{}',
  documents text[] not null default '{}',
  status text not null default 'en attente' check (status in ('en attente', 'acceptée', 'refusée', 'publiée')),
  rejection_reason text,
  decision_at timestamptz,
  decision_by uuid references public.profiles(id),
  published_property_id uuid references public.properties(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_submission_media (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions(id) on delete cascade,
  media_type text not null check (media_type in ('photo', 'document')),
  file_url text not null,
  label text,
  created_at timestamptz not null default now()
);

create table if not exists public.property_submission_decisions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions(id) on delete cascade,
  status text not null check (status in ('en attente', 'acceptée', 'refusée', 'publiée')),
  reason text,
  decided_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.property_private_details (
  property_id uuid primary key references public.properties(id) on delete cascade,
  sensitive_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_notification_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('visite', 'service', 'soumission', 'annonce')),
  entity_id uuid not null,
  message text not null,
  channel text not null default 'email' check (channel in ('email', 'sms', 'push')),
  status text not null default 'prepared' check (status in ('prepared', 'sent', 'failed')),
  prepared_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists visit_requests_status_idx on public.visit_requests(status);
create index if not exists visit_requests_user_id_idx on public.visit_requests(user_id);
create index if not exists visit_requests_property_id_idx on public.visit_requests(property_id);
create index if not exists property_submissions_status_idx on public.property_submissions(status);
create index if not exists property_submissions_owner_id_idx on public.property_submissions(owner_id);
create index if not exists property_submission_media_submission_id_idx on public.property_submission_media(submission_id);

create or replace function public.set_admin_workspace_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists visit_requests_updated_at on public.visit_requests;
create trigger visit_requests_updated_at
before update on public.visit_requests
for each row execute function public.set_admin_workspace_updated_at();

drop trigger if exists property_submissions_updated_at on public.property_submissions;
create trigger property_submissions_updated_at
before update on public.property_submissions
for each row execute function public.set_admin_workspace_updated_at();

drop trigger if exists property_private_details_updated_at on public.property_private_details;
create trigger property_private_details_updated_at
before update on public.property_private_details
for each row execute function public.set_admin_workspace_updated_at();

alter table public.visit_requests enable row level security;
alter table public.property_submissions enable row level security;
alter table public.property_submission_media enable row level security;
alter table public.property_submission_decisions enable row level security;
alter table public.property_private_details enable row level security;
alter table public.admin_notification_logs enable row level security;

grant select, insert on public.visit_requests to authenticated;
grant update (status, internal_note, notification_prepared, updated_at) on public.visit_requests to authenticated;
grant select, insert on public.property_submissions to authenticated;
grant update on public.property_submissions to authenticated;
grant select, insert on public.property_submission_media to authenticated;
grant select, insert on public.property_submission_decisions to authenticated;
grant select, insert, update on public.property_private_details to authenticated;
grant select, insert on public.admin_notification_logs to authenticated;

drop policy if exists visit_requests_select_own_or_admin on public.visit_requests;
create policy visit_requests_select_own_or_admin
  on public.visit_requests for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists visit_requests_insert_own on public.visit_requests;
create policy visit_requests_insert_own
  on public.visit_requests for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists visit_requests_update_admin on public.visit_requests;
create policy visit_requests_update_admin
  on public.visit_requests for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists property_submissions_select_own_or_admin on public.property_submissions;
create policy property_submissions_select_own_or_admin
  on public.property_submissions for select to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists property_submissions_insert_own on public.property_submissions;
create policy property_submissions_insert_own
  on public.property_submissions for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists property_submissions_update_admin on public.property_submissions;
create policy property_submissions_update_admin
  on public.property_submissions for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists property_submission_media_select_owner_or_admin on public.property_submission_media;
create policy property_submission_media_select_owner_or_admin
  on public.property_submission_media for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.property_submissions submission
      where submission.id = property_submission_media.submission_id
        and submission.owner_id = (select auth.uid())
    )
  );

drop policy if exists property_submission_media_insert_owner on public.property_submission_media;
create policy property_submission_media_insert_owner
  on public.property_submission_media for insert to authenticated
  with check (
    (select public.is_admin())
    or exists (
      select 1 from public.property_submissions submission
      where submission.id = property_submission_media.submission_id
        and submission.owner_id = (select auth.uid())
    )
  );

drop policy if exists property_submission_decisions_admin on public.property_submission_decisions;
create policy property_submission_decisions_admin
  on public.property_submission_decisions for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists property_private_details_subscriber_or_admin on public.property_private_details;
create policy property_private_details_subscriber_or_admin
  on public.property_private_details for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.is_subscriber = true
    )
  );

drop policy if exists property_private_details_admin_write on public.property_private_details;
create policy property_private_details_admin_write
  on public.property_private_details for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists admin_notification_logs_admin on public.admin_notification_logs;
create policy admin_notification_logs_admin
  on public.admin_notification_logs for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke execute on function public.set_admin_workspace_updated_at() from public;
