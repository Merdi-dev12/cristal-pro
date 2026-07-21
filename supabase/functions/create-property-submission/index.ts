import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const documentTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
const text = (form: FormData, key: string, max: number) =>
  String(form.get(key) ?? '')
    .trim()
    .slice(0, max);
const files = (form: FormData, key: string) =>
  form.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);

function extension(file: File): string {
  return (
    {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'application/pdf': 'pdf',
    }[file.type] ?? 'bin'
  );
}

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
    error: authError,
  } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: 'Non authentifié' }, 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: 'Formulaire multipart invalide' }, 400);
  }

  const title = text(form, 'title', 180);
  const city = text(form, 'city', 120);
  const address = text(form, 'address', 300);
  const description = text(form, 'description', 5000);
  const category = text(form, 'category', 30);
  const type = text(form, 'type', 30);
  const price = Number(form.get('price'));
  const surface = Number(form.get('surface'));
  const bedrooms = Number(form.get('bedrooms') ?? 0);
  const bathrooms = Number(form.get('bathrooms') ?? 0);
  const latitude = Number(form.get('latitude'));
  const longitude = Number(form.get('longitude'));
  const photos = files(form, 'photos');
  const documents = files(form, 'documents');

  const invalidFields =
    title.length < 3 ||
    city.length < 2 ||
    address.length < 3 ||
    description.length < 20 ||
    !['maison', 'appartement', 'residence', 'immeuble', 'terrain'].includes(category) ||
    !['vente', 'location'].includes(type) ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(surface) ||
    surface <= 0 ||
    !Number.isInteger(bedrooms) ||
    bedrooms < 0 ||
    !Number.isInteger(bathrooms) ||
    bathrooms < 0 ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180;
  if (invalidFields)
    return json({ error: 'Les informations de l’annonce sont incomplètes ou invalides.' }, 400);
  if (photos.length < 1 || photos.length > 12)
    return json({ error: 'Ajoutez entre 1 et 12 photos.' }, 400);
  if (documents.length > 8) return json({ error: 'Vous pouvez ajouter 8 documents maximum.' }, 400);
  if (photos.some((file) => !imageTypes.has(file.type) || file.size > 6 * 1024 * 1024))
    return json(
      { error: 'Chaque photo doit être une image JPG, PNG, WebP ou AVIF de 6 Mo maximum.' },
      400,
    );
  if (documents.some((file) => !documentTypes.has(file.type) || file.size > 10 * 1024 * 1024))
    return json({ error: 'Chaque document doit être un PDF ou une image de 10 Mo maximum.' }, 400);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const submissionId = crypto.randomUUID();
  const uploaded: Array<{ bucket: string; path: string }> = [];

  try {
    const photoUrls: string[] = [];
    for (const file of photos) {
      const path = `${user.id}/${submissionId}/photos/${crypto.randomUUID()}.${extension(file)}`;
      const { error } = await admin.storage
        .from('property-images')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      uploaded.push({ bucket: 'property-images', path });
      photoUrls.push(admin.storage.from('property-images').getPublicUrl(path).data.publicUrl);
    }

    const documentPaths: string[] = [];
    for (const file of documents) {
      const path = `${user.id}/${submissionId}/documents/${crypto.randomUUID()}.${extension(file)}`;
      const { error } = await admin.storage
        .from('property-documents')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      uploaded.push({ bucket: 'property-documents', path });
      documentPaths.push(path);
    }

    const { data: profile } = await userClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle();
    const { data, error } = await userClient
      .from('property_submissions')
      .insert({
        id: submissionId,
        owner_id: user.id,
        owner_name:
          String(profile?.full_name ?? '')
            .trim()
            .slice(0, 160) ||
          user.email ||
          'Utilisateur',
        owner_email:
          String(profile?.email ?? '')
            .trim()
            .slice(0, 320) ||
          user.email ||
          '',
        title,
        category,
        type,
        city,
        address,
        price,
        surface,
        bedrooms,
        bathrooms,
        latitude,
        longitude,
        description,
        photos: photoUrls,
        documents: documentPaths,
      })
      .select('*')
      .single();
    if (error) throw error;
    return json(data, 201);
  } catch (error) {
    await Promise.all(
      uploaded.map(({ bucket, path }) => admin.storage.from(bucket).remove([path])),
    );
    return json({ error: error instanceof Error ? error.message : 'Envoi impossible' }, 400);
  }
});
