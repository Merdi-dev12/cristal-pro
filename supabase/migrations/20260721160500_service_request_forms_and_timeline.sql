-- Structured service forms and customer-visible request timeline.

alter table public.service_requests
  drop constraint if exists service_requests_service_type_check;

alter table public.service_requests
  add constraint service_requests_service_type_check
  check (service_type in (
    'verification',
    'location-vente',
    'maintenance',
    'decoration',
    'juridique',
    'demenagement'
  ));

alter table public.service_requests
  add column if not exists details jsonb not null default '{}'::jsonb;

alter table public.service_requests
  drop constraint if exists service_requests_details_object_check;

alter table public.service_requests
  add constraint service_requests_details_object_check
  check (jsonb_typeof(details) = 'object');

create table if not exists public.service_request_events (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  status text not null check (status in ('reçue', 'en traitement', 'assignée', 'terminée', 'annulée')),
  message text not null check (char_length(message) between 1 and 500),
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists service_request_events_request_created_idx
  on public.service_request_events(service_request_id, created_at);

alter table public.service_request_events enable row level security;

grant select on public.service_request_events to authenticated;

drop policy if exists service_request_events_select_own_or_admin
  on public.service_request_events;
create policy service_request_events_select_own_or_admin
  on public.service_request_events for select to authenticated
  using (
    exists (
      select 1
      from public.service_requests request
      where request.id = service_request_events.service_request_id
        and (
          request.user_id = (select auth.uid())
          or (select public.is_admin())
        )
    )
  );

create or replace function public.log_service_request_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_message text;
begin
  if tg_op = 'UPDATE' and new.status is not distinct from old.status then
    return new;
  end if;

  event_message := case new.status
    when 'reçue' then 'Demande reçue par RHEODYCE'
    when 'en traitement' then 'Analyse du dossier en cours'
    when 'assignée' then 'Demande assignée à un partenaire'
    when 'terminée' then 'Demande terminée'
    when 'annulée' then 'Demande annulée'
  end;

  insert into public.service_request_events (
    service_request_id,
    status,
    message,
    changed_by,
    created_at
  ) values (
    new.id,
    new.status,
    event_message,
    auth.uid(),
    case when tg_op = 'INSERT' then new.created_at else now() end
  );

  return new;
end;
$$;

revoke all on function public.log_service_request_event() from public, anon, authenticated;

drop trigger if exists trg_log_service_request_event on public.service_requests;
create trigger trg_log_service_request_event
after insert or update of status on public.service_requests
for each row execute function public.log_service_request_event();

insert into public.service_request_events (
  service_request_id,
  status,
  message,
  changed_by,
  created_at
)
select
  request.id,
  request.status,
  case request.status
    when 'reçue' then 'Demande reçue par RHEODYCE'
    when 'en traitement' then 'Analyse du dossier en cours'
    when 'assignée' then 'Demande assignée à un partenaire'
    when 'terminée' then 'Demande terminée'
    when 'annulée' then 'Demande annulée'
  end,
  request.user_id,
  request.created_at
from public.service_requests request
where not exists (
  select 1
  from public.service_request_events event
  where event.service_request_id = request.id
);

create or replace function public.enforce_service_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
     or new.service_type is distinct from old.service_type
     or new.client_name is distinct from old.client_name
     or new.client_email is distinct from old.client_email
     or new.client_phone is distinct from old.client_phone
     or new.description is distinct from old.description
     or new.details is distinct from old.details
     or new.property_id is distinct from old.property_id
     or new.budget is distinct from old.budget
     or new.assigned_to is distinct from old.assigned_to
     or new.notes is distinct from old.notes
     or new.completed_at is distinct from old.completed_at
     or new.notification_prepared is distinct from old.notification_prepared
  then
    raise exception 'Seul un administrateur peut modifier ces champs';
  end if;

  if new.status is distinct from old.status and new.status != 'annulée' then
    raise exception 'Vous ne pouvez qu''annuler votre demande';
  end if;

  if new.status is not distinct from old.status then
    raise exception 'Aucune modification autorisée';
  end if;

  if old.status not in ('reçue', 'en traitement') then
    raise exception 'Cette demande ne peut plus être annulée';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.enforce_service_request_update() from public, anon, authenticated;

drop policy if exists service_requests_select_own_or_admin on public.service_requests;
create policy service_requests_select_own_or_admin
  on public.service_requests for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists service_requests_insert_own on public.service_requests;
create policy service_requests_insert_own
  on public.service_requests for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists service_requests_update_own_or_admin on public.service_requests;
create policy service_requests_update_own_or_admin
  on public.service_requests for update to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
  )
  with check (
    user_id = (select auth.uid())
    or (select public.is_admin())
  );
