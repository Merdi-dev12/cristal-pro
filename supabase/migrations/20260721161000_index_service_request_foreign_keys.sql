create index if not exists service_requests_user_created_idx
  on public.service_requests(user_id, created_at desc);

create index if not exists service_requests_property_id_idx
  on public.service_requests(property_id)
  where property_id is not null;

create index if not exists service_request_events_changed_by_idx
  on public.service_request_events(changed_by)
  where changed_by is not null;
