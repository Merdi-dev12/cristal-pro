import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ error: "Authorization requise" }, 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Non authentifié" }, 401);
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return json({ error: "Accès administrateur requis" }, 403);
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Corps de requête invalide" }, 400); }
  const id = clean(body.submission_id, 80); const action = clean(body.action, 30); const message = clean(body.message, 4000);
  if (!id || !["approve", "reject", "request_details"].includes(action) || ((action === "reject" || action === "request_details") && !message)) return json({ error: "Action ou message invalide." }, 400);
  const { data: submission, error: findError } = await supabase.from("property_submissions").select("*").eq("id", id).single();
  if (findError || !submission) return json({ error: "Soumission introuvable" }, 404);
  if (submission.status === "publiée") return json({ error: "Cette annonce est déjà publiée." }, 409);
  let status = ""; let kind = ""; let notification = ""; let publishedPropertyId: string | null = null;
  if (action === "approve") {
    const { data: property, error } = await supabase.from("properties").insert({ title: submission.title, price: submission.price, price_suffix: submission.type === "location" ? "/mois" : null, location: submission.city, address: submission.address, bedrooms: submission.bedrooms, bathrooms: submission.bathrooms, surface: submission.surface, type: submission.type, category: submission.category, image_url: submission.photos?.[0] ?? null, photos: submission.photos ?? [], status: "published", verified: true, description: submission.description, owner_name: submission.owner_name }).select("id").single();
    if (error || !property) return json({ error: error?.message ?? "Publication impossible" }, 400);
    publishedPropertyId = property.id; status = "publiée"; kind = "approved"; notification = message || "Votre annonce a été validée et est maintenant visible par tous les utilisateurs.";
  } else if (action === "reject") { status = "refusée"; kind = "rejected"; notification = message; }
  else { status = "informations requises"; kind = "details_requested"; notification = message; }
  const { error: updateError } = await supabase.from("property_submissions").update({ status, admin_message: notification, rejection_reason: action === "reject" ? notification : null, decision_at: new Date().toISOString(), decision_by: user.id, published_property_id: publishedPropertyId, last_notified_at: new Date().toISOString() }).eq("id", id);
  if (updateError) return json({ error: updateError.message }, 400);
  const { error: decisionError } = await supabase.from("property_submission_decisions").insert({ submission_id: id, status, reason: notification, decided_by: user.id });
  if (decisionError) return json({ error: decisionError.message }, 400);
  const { error: notificationError } = await supabase.from("property_submission_notifications").insert({ submission_id: id, recipient_id: submission.owner_id, kind, message: notification });
  if (notificationError) return json({ error: notificationError.message }, 400);
  return json({ id, status, published_property_id: publishedPropertyId, message: notification });
});
