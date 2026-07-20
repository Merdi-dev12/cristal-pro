-- Property submissions are a moderated workflow. A user can see only their
-- own dossier and its notifications; administrators review through Edge
-- Functions with their authenticated session.

alter table public.property_submissions
  drop constraint if exists property_submissions_status_check;

alter table public.property_submissions
  add constraint property_submissions_status_check
  check (status in ('en attente', 'informations requises', 'refusée', 'publiée'));

alter table public.property_submission_decisions
  drop constraint if exists property_submission_decisions_status_check;

alter table public.property_submission_decisions
  add constraint property_submission_decisions_status_check
  check (status in ('en attente', 'informations requises', 'refusée', 'publiée'));

alter table public.property_submissions
  add column if not exists admin_message text,
  add column if not exists last_notified_at timestamptz,
  add column if not exists bedrooms integer not null default 0 check (bedrooms >= 0),
  add column if not exists bathrooms integer not null default 0 check (bathrooms >= 0);

create table if not exists public.property_submission_notifications (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('submission_received', 'details_requested', 'approved', 'rejected')),
  message text not null check (char_length(message) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists property_submission_notifications_recipient_idx
  on public.property_submission_notifications(recipient_id, created_at desc);

alter table public.property_submission_notifications enable row level security;
grant select, insert, update (read_at) on public.property_submission_notifications to authenticated;

create policy property_submission_notifications_select_recipient_or_admin
  on public.property_submission_notifications for select to authenticated
  using (recipient_id = (select auth.uid()) or (select public.is_admin()));

create policy property_submission_notifications_insert_admin
  on public.property_submission_notifications for insert to authenticated
  with check ((select public.is_admin()));

create policy property_submission_notifications_mark_read_recipient
  on public.property_submission_notifications for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));
