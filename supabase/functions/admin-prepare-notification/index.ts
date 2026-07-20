import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ error: "Authorization requise" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authorization } } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Non authentifié" }, 401);

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return json({ error: "Accès administrateur requis" }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corps de requête invalide" }, 400);
  }

  const entityType = typeof body.entity_type === "string" ? body.entity_type : "";
  const entityId = typeof body.entity_id === "string" ? body.entity_id : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 4000) : "";
  if (!["visite", "service", "soumission", "annonce"].includes(entityType) || !entityId || !message) {
    return json({ error: "Type, identifiant et message sont requis" }, 400);
  }

  const { data, error } = await supabase.from("admin_notification_logs").insert({
    entity_type: entityType,
    entity_id: entityId,
    message,
    prepared_by: user.id,
    status: "prepared",
  }).select("id, entity_type, entity_id, message, status, created_at").single();

  if (error) return json({ error: error.message }, 400);
  return json(data, 201);
});
