alter table public.service_requests
  add column if not exists documents jsonb not null default '[]'::jsonb,
  add constraint service_requests_documents_is_array
    check (jsonb_typeof(documents) = 'array');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-request-documents',
  'service-request-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "service_request_documents_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'service-request-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "service_request_documents_select_own_or_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'service-request-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select public.is_admin())
  )
);

create policy "service_request_documents_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'service-request-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
