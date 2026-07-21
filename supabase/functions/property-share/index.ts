import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const safeRedirect = (value: string | null): string | null => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

const htmlResponse = (body: string, status = 200): Response =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=900',
      'X-Content-Type-Options': 'nosniff',
    },
  });

Deno.serve(async (req: Request) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return htmlResponse('<h1>Méthode non autorisée</h1>', 405);
  }

  const requestUrl = new URL(req.url);
  const propertyId = requestUrl.searchParams.get('id')?.trim() ?? '';
  const redirectUrl = safeRedirect(requestUrl.searchParams.get('redirect'));
  if (!propertyId || !redirectUrl) return htmlResponse('<h1>Lien de partage invalide</h1>', 400);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: property, error } = await supabase
    .from('properties')
    .select('id, title, location, surface, description, image_url, status')
    .eq('id', propertyId)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !property) return htmlResponse('<h1>Annonce introuvable</h1>', 404);

  const title = escapeHtml(String(property.title ?? 'Annonce immobilière RHEODYCE'));
  const location = String(property.location ?? 'République démocratique du Congo');
  const surface = Number(property.surface ?? 0);
  const description = escapeHtml(
    `${location}${surface > 0 ? ` · ${surface} m²` : ''}. Découvrez les photos et les informations de ce bien vérifié sur RHEODYCE.`,
  );
  const destinationOrigin = new URL(redirectUrl).origin;
  const imageUrl = escapeHtml(
    new URL(String(property.image_url || '/assets/hero_img.png'), destinationOrigin).toString(),
  );
  const destination = escapeHtml(redirectUrl);
  const canonical = escapeHtml(requestUrl.toString());

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title} — RHEODYCE</title>
    <meta name="description" content="${description}">
    <meta property="og:site_name" content="RHEODYCE">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:url" content="${canonical}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <link rel="canonical" href="${canonical}">
    <meta http-equiv="refresh" content="0;url=${destination}">
  </head>
  <body style="font-family:Arial,sans-serif;text-align:center;padding:48px 20px;color:#1a1a1a">
    <p>Ouverture de l’annonce RHEODYCE…</p>
    <p><a href="${destination}">Voir le bien</a></p>
    <script>window.location.replace(${JSON.stringify(redirectUrl).replaceAll('<', '\\u003c')});</script>
  </body>
</html>`;

  return req.method === 'HEAD'
    ? new Response(null, { headers: htmlResponse('').headers })
    : htmlResponse(html);
});
