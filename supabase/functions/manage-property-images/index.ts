import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
const extension = (file: File) =>
  ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' })[
    file.type
  ] ?? 'bin';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);
  const authorization = req.headers.get('Authorization');
  if (!authorization) return json({ error: 'Authorization requise' }, 401);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !anonKey || !serviceKey)
    return json({ error: 'Configuration serveur incomplète' }, 500);
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return json({ error: 'Non authentifié' }, 401);
  const { data: profile } = await userClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.role !== 'admin') return json({ error: 'Accès administrateur requis' }, 403);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: 'Formulaire multipart invalide' }, 400);
  }
  const propertyId = String(form.get('property_id') ?? '').trim();
  const action = String(form.get('action') ?? 'upload');
  if (!propertyId) return json({ error: 'Annonce manquante' }, 400);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: property, error: findError } = await admin
    .from('properties')
    .select('id, photos, image_url')
    .eq('id', propertyId)
    .single();
  if (findError || !property) return json({ error: 'Annonce introuvable' }, 404);
  const current = Array.isArray(property.photos) ? property.photos.map(String) : [];

  if (action === 'delete') {
    const photoUrl = String(form.get('photo_url') ?? '');
    if (!current.includes(photoUrl)) return json({ error: 'Photo introuvable' }, 404);
    const photos = current.filter((photo) => photo !== photoUrl);
    const marker = '/storage/v1/object/public/property-images/';
    const markerIndex = photoUrl.indexOf(marker);
    if (markerIndex >= 0)
      await admin.storage
        .from('property-images')
        .remove([decodeURIComponent(photoUrl.slice(markerIndex + marker.length))]);
    const { error } = await admin
      .from('properties')
      .update({ photos, image_url: photos[0] ?? null })
      .eq('id', propertyId);
    if (error) return json({ error: error.message }, 400);
    return json({ photos, image_url: photos[0] ?? null });
  }

  const images = form
    .getAll('images')
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (!images.length || current.length + images.length > 12)
    return json({ error: 'Sélectionnez des images sans dépasser 12 photos au total.' }, 400);
  if (images.some((file) => !imageTypes.has(file.type) || file.size > 6 * 1024 * 1024))
    return json(
      { error: 'Chaque photo doit être une image JPG, PNG, WebP ou AVIF de 6 Mo maximum.' },
      400,
    );

  const uploaded: string[] = [];
  try {
    const urls: string[] = [];
    for (const file of images) {
      const path = `admin/${propertyId}/${crypto.randomUUID()}.${extension(file)}`;
      const { error } = await admin.storage
        .from('property-images')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      uploaded.push(path);
      urls.push(admin.storage.from('property-images').getPublicUrl(path).data.publicUrl);
    }
    const photos = [...current, ...urls];
    const { error } = await admin
      .from('properties')
      .update({ photos, image_url: photos[0] })
      .eq('id', propertyId);
    if (error) throw error;
    return json({ photos, image_url: photos[0] });
  } catch (error) {
    if (uploaded.length) await admin.storage.from('property-images').remove(uploaded);
    return json({ error: error instanceof Error ? error.message : 'Upload impossible' }, 400);
  }
});
