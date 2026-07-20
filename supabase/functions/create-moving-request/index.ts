import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

type Coordinates = { lat: number; lng: number };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const coordinates = (value: unknown): Coordinates | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const lat = typeof candidate.lat === "number" ? candidate.lat : Number(candidate.lat);
  const lng = typeof candidate.lng === "number" ? candidate.lng : Number(candidate.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
    ? { lat, lng }
    : null;
};

const normalize = (row: Record<string, unknown>) => ({
  id: row.id,
  userId: row.user_id,
  departureAddress: row.departure_address,
  arrivalAddress: row.arrival_address,
  movingDate: row.moving_date,
  estimatedVolume: row.estimated_volume,
  floor: row.floor,
  hasElevator: row.has_elevator,
  departureCoordinates: row.departure_coordinates,
  arrivalCoordinates: row.arrival_coordinates,
  routeDistanceKm: row.route_distance_km,
  routeDurationMinutes: row.route_duration_minutes,
  status: row.status,
  assignedPartnerId: row.assigned_partner_id,
  adminNotes: row.admin_notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!["GET", "POST", "PATCH"].includes(req.method)) return json({ error: "Méthode non autorisée" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Authorization requise" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Non authentifié" }, 401);

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";

  if (req.method === "GET") {
    const url = new URL(req.url);
    const adminScope = url.searchParams.get("scope") === "admin";
    if (adminScope && !isAdmin) return json({ error: "Accès administrateur requis" }, 403);

    let query = supabase.from("moving_requests").select("*").order("created_at", { ascending: false });
    if (!adminScope) query = query.eq("user_id", user.id);
    const { data, error } = await query;
    if (error) return json({ error: error.message }, 400);
    return json((data ?? []).map((row) => normalize(row as Record<string, unknown>)));
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corps de requête invalide" }, 400);
  }

  if (req.method === "PATCH") {
    if (!isAdmin) return json({ error: "Accès administrateur requis" }, 403);
    const id = cleanText(body.id, 80);
    if (!id) return json({ error: "Identifiant de demande requis" }, 400);
    const assignedPartnerId = cleanText(body.assigned_partner_id, 160) || null;
    const adminNotes = cleanText(body.admin_notes, 2000) || null;
    const status = cleanText(body.status, 40) || "assignée";
    const { data, error } = await supabase.from("moving_requests").update({
      assigned_partner_id: assignedPartnerId,
      admin_notes: adminNotes,
      status,
    }).eq("id", id).select("*").single();
    if (error) return json({ error: error.message }, 400);
    return json(normalize(data as Record<string, unknown>));
  }

  const departureAddress = cleanText(body.departure_address, 500);
  const arrivalAddress = cleanText(body.arrival_address, 500);
  const movingDate = cleanText(body.moving_date, 20);
  const estimatedVolume = Number(body.estimated_volume);
  const floor = Number(body.floor ?? 0);
  const hasElevator = Boolean(body.has_elevator);
  const distance = body.route_distance_km == null ? null : Number(body.route_distance_km);
  const duration = body.route_duration_minutes == null ? null : Number(body.route_duration_minutes);

  if (departureAddress.length < 3 || arrivalAddress.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(movingDate)) {
    return json({ error: "Adresses et date valides requis" }, 400);
  }
  if (!Number.isFinite(estimatedVolume) || estimatedVolume <= 0 || estimatedVolume > 1000 || !Number.isInteger(floor) || floor < 0 || floor > 100) {
    return json({ error: "Volume ou étage invalide" }, 400);
  }
  if (distance !== null && (!Number.isFinite(distance) || distance < 0) || duration !== null && (!Number.isFinite(duration) || duration < 0)) {
    return json({ error: "Informations de trajet invalides" }, 400);
  }

  const { data, error } = await supabase.from("moving_requests").insert({
    user_id: user.id,
    departure_address: departureAddress,
    arrival_address: arrivalAddress,
    moving_date: movingDate,
    estimated_volume: estimatedVolume,
    floor,
    has_elevator: hasElevator,
    departure_coordinates: coordinates(body.departure_coordinates),
    arrival_coordinates: coordinates(body.arrival_coordinates),
    route_distance_km: distance,
    route_duration_minutes: duration === null ? null : Math.round(duration),
  }).select("*").single();

  if (error) return json({ error: error.message }, 400);
  return json(normalize(data as Record<string, unknown>), 201);
});
