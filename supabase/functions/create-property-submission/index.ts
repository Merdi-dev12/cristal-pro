import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const urls = (value: unknown, maxItems: number) => Array.isArray(value) ? value.map((item) => text(item, 2000)).filter((item) => /^https?:\/\//.test(item)).slice(0, maxItems) : [];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ error: "Authorization requise" }, 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Non authentifié" }, 401);
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Corps de requête invalide" }, 400); }
  const title = text(body.title, 180); const city = text(body.city, 120); const address = text(body.address, 300); const description = text(body.description, 5000);
  const category = text(body.category, 30); const type = text(body.type, 30);
  const price = Number(body.price); const surface = Number(body.surface); const bedrooms = Number(body.bedrooms ?? 0); const bathrooms = Number(body.bathrooms ?? 0);
  if (title.length < 3 || city.length < 2 || address.length < 3 || description.length < 20 || !["maison", "appartement", "residence", "terrain"].includes(category) || !["vente", "location"].includes(type) || !Number.isFinite(price) || price < 0 || !Number.isFinite(surface) || surface <= 0 || !Number.isInteger(bedrooms) || bedrooms < 0 || !Number.isInteger(bathrooms) || bathrooms < 0) return json({ error: "Les informations de l’annonce sont incomplètes ou invalides." }, 400);
  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle();
  const { data, error } = await supabase.from("property_submissions").insert({ owner_id: user.id, owner_name: text(profile?.full_name, 160) || user.email || "Utilisateur", owner_email: text(profile?.email, 320) || user.email || "", title, category, type, city, address, price, surface, bedrooms, bathrooms, description, photos: urls(body.photos, 12), documents: urls(body.documents, 8) }).select("*").single();
  if (error) return json({ error: error.message }, 400);
  return json(data, 201);
});
