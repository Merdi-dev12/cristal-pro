import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const notificationHtml = (request: {
  fullName: string;
  email: string;
  city: string;
  need: string;
  message: string;
}) => `
<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f5f7f4;font-family:Arial,sans-serif;color:#1a1a1a">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px">
      <div style="background:#1a1a1a;border-radius:24px 24px 0 0;padding:24px 28px;color:#fff">
        <div style="font-size:12px;letter-spacing:2px;color:#c5e84a;font-weight:700">RHEODYCE · CONTACT</div>
        <h1 style="margin:12px 0 0;font-size:26px">Nouvelle demande reçue</h1>
      </div>
      <div style="background:#fff;border:1px solid #e8ebe6;border-top:0;border-radius:0 0 24px 24px;padding:28px">
        <p style="margin:0 0 20px;color:#6b7280;line-height:1.6">Une nouvelle demande a été créée depuis le formulaire de contact.</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:9px 0;color:#6b7280;width:120px">Demandeur</td><td style="padding:9px 0;font-weight:700">${escapeHtml(request.fullName)}</td></tr>
          <tr><td style="padding:9px 0;color:#6b7280">E-mail</td><td style="padding:9px 0"><a href="mailto:${escapeHtml(request.email)}" style="color:#53621e">${escapeHtml(request.email)}</a></td></tr>
          <tr><td style="padding:9px 0;color:#6b7280">Ville</td><td style="padding:9px 0">${escapeHtml(request.city || 'Non précisée')}</td></tr>
          <tr><td style="padding:9px 0;color:#6b7280">Besoin</td><td style="padding:9px 0;font-weight:700">${escapeHtml(request.need || 'Autre demande')}</td></tr>
        </table>
        <div style="margin-top:22px;border-radius:16px;background:#f5f7f4;padding:18px;white-space:pre-wrap;line-height:1.65">${escapeHtml(request.message)}</div>
        <a href="mailto:${escapeHtml(request.email)}" style="display:inline-block;margin-top:24px;border-radius:14px;background:#c5e84a;padding:13px 20px;color:#1a1a1a;text-decoration:none;font-weight:700">Répondre au demandeur</a>
      </div>
    </div>
  </body>
</html>`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Corps de requête invalide' }, 400);
  }

  if (text(body.website, 200)) return json({ success: true }, 201);

  const fullName = text(body.full_name, 160);
  const email = text(body.email, 320).toLowerCase();
  const city = text(body.city, 120);
  const need = text(body.need, 120);
  const message = text(body.message, 5000);

  if (fullName.length < 2 || message.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Nom, adresse e-mail et message valides requis' }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  let userId: string | null = null;
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (token) {
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    userId = user?.id ?? null;
  }

  const { data: contactRequest, error: insertError } = await supabase
    .from('contact_messages')
    .insert({
      user_id: userId,
      full_name: fullName,
      email,
      city: city || null,
      need: need || null,
      message,
      notification_status: 'pending',
    })
    .select('id, created_at')
    .single();

  if (insertError || !contactRequest) {
    return json({ error: insertError?.message ?? 'Impossible de créer la demande' }, 500);
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const notificationEmail = Deno.env.get('CONTACT_NOTIFICATION_EMAIL') ?? 'reh.tssimba@gmail.com';
  const fromEmail =
    Deno.env.get('CONTACT_FROM_EMAIL') ?? 'RHEODYCE Contact <onboarding@resend.dev>';
  let notificationSent = false;
  let notificationError = 'Clé RESEND_API_KEY non configurée';

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: [notificationEmail],
          reply_to: email,
          subject: `Nouvelle demande RHEODYCE · ${need || 'Contact'}`,
          html: notificationHtml({ fullName, email, city, need, message }),
          text: `Nouvelle demande RHEODYCE\n\nNom : ${fullName}\nE-mail : ${email}\nVille : ${city || 'Non précisée'}\nBesoin : ${need || 'Autre demande'}\n\n${message}`,
        }),
      });
      notificationSent = response.ok;
      if (!response.ok) notificationError = (await response.text()).slice(0, 1000);
    } catch (error) {
      notificationError =
        error instanceof Error ? error.message.slice(0, 1000) : 'Erreur d’envoi inconnue';
    }
  }

  await supabase
    .from('contact_messages')
    .update({
      notification_status: notificationSent ? 'sent' : 'failed',
      notification_error: notificationSent ? null : notificationError,
      notified_at: notificationSent ? new Date().toISOString() : null,
    })
    .eq('id', contactRequest.id);

  return json(
    { success: true, request_id: contactRequest.id, notification_sent: notificationSent },
    201,
  );
});
