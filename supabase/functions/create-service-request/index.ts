import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors';

type DetailValue = string | number | boolean | null;
type Details = Record<string, DetailValue>;
type RequestDocument = { path: string; name: string; mimeType: string; size: number };

const SERVICE_FIELDS = {
  verification: {
    allowed: ['property_address', 'transaction_type', 'verification_scope', 'documents_available'],
    required: ['property_address', 'transaction_type', 'verification_scope'],
  },
  'location-vente': {
    allowed: ['project_type', 'property_category', 'city', 'preferred_area', 'target_date'],
    required: ['project_type', 'property_category', 'city'],
  },
  maintenance: {
    allowed: [
      'intervention_type',
      'urgency',
      'property_address',
      'preferred_date',
      'access_details',
    ],
    required: ['intervention_type', 'urgency', 'property_address'],
  },
  decoration: {
    allowed: ['project_type', 'property_address', 'rooms', 'preferred_style', 'target_date'],
    required: ['project_type', 'property_address', 'rooms'],
  },
  juridique: {
    allowed: ['case_type', 'property_address', 'deadline', 'documents_available'],
    required: ['case_type'],
  },
} as const;

type ServiceType = keyof typeof SERVICE_FIELDS;

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer '))
    return json({ error: 'Authentification requise' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } } },
  );
  const token = authorization.slice('Bearer '.length);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user) return json({ error: 'Session invalide ou expirée' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Corps de requête invalide' }, 400);
  }

  const serviceType = typeof body.service_type === 'string' ? body.service_type : '';
  if (!isServiceType(serviceType)) return json({ error: 'Type de service invalide' }, 400);

  const clientName = cleanText(body.client_name, 120);
  const clientEmail = cleanText(body.client_email, 254).toLowerCase();
  const clientPhone = cleanText(body.client_phone, 40);
  const description = cleanText(body.description, 4000);
  const budget = body.budget === null || body.budget === undefined ? null : Number(body.budget);
  const requestId = typeof body.request_id === 'string' ? body.request_id : crypto.randomUUID();

  if (!clientName || !clientEmail || !clientPhone) {
    return json({ error: 'Les coordonnées sont obligatoires' }, 400);
  }
  if (!/^\S+@\S+\.\S+$/.test(clientEmail)) return json({ error: 'Adresse email invalide' }, 400);
  if (description.length < 20)
    return json({ error: 'La description doit contenir au moins 20 caractères' }, 400);
  if (budget !== null && (!Number.isFinite(budget) || budget < 0 || budget > 100_000_000)) {
    return json({ error: 'Budget invalide' }, 400);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return json({ error: 'Identifiant de demande invalide' }, 400);
  }

  const detailsResult = validateDetails(serviceType, body.details);
  if ('error' in detailsResult) return json({ error: detailsResult.error }, 400);
  const documentsResult = validateDocuments(body.documents, user.id, requestId);
  if ('error' in documentsResult) return json({ error: documentsResult.error }, 400);

  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      id: requestId,
      user_id: user.id,
      service_type: serviceType,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      description,
      details: detailsResult.details,
      budget,
      documents: documentsResult.documents,
    })
    .select()
    .single();

  if (error) {
    console.error('create-service-request insert failed', error.code);
    return json({ error: 'La demande n’a pas pu être enregistrée' }, 400);
  }

  return json(data, 201);
});

function validateDetails(
  type: ServiceType,
  input: unknown,
): { details: Details } | { error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Les informations du service sont invalides' };
  }

  const source = input as Record<string, unknown>;
  const config = SERVICE_FIELDS[type];
  const details: Details = {};

  for (const key of config.allowed) {
    const value = source[key];
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'string') {
      const clean = value.trim();
      if (clean.length > 1000) return { error: `Le champ ${key} est trop long` };
      details[key] = clean;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      details[key] = value;
    } else if (typeof value === 'boolean') {
      details[key] = value;
    } else {
      return { error: `Le champ ${key} est invalide` };
    }
  }

  const missing = config.required.find((key) => details[key] === undefined || details[key] === '');
  if (missing) return { error: `Le champ ${missing} est obligatoire` };
  if (JSON.stringify(details).length > 10_000)
    return { error: 'Les informations du dossier sont trop volumineuses' };
  return { details };
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function validateDocuments(
  input: unknown,
  userId: string,
  requestId: string,
): { documents: RequestDocument[] } | { error: string } {
  if (input === undefined || input === null) return { documents: [] };
  if (!Array.isArray(input) || input.length > 5) return { error: 'Liste de documents invalide' };

  const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
  const expectedPrefix = `${userId}/${requestId}/`;
  const documents: RequestDocument[] = [];
  for (const value of input) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { error: 'Document invalide' };
    }
    const document = value as Record<string, unknown>;
    const path = cleanText(document.path, 500);
    const name = cleanText(document.name, 255);
    const mimeType = cleanText(document.mimeType, 100);
    const size = Number(document.size);
    if (!path.startsWith(expectedPrefix) || !name || !allowedTypes.has(mimeType)) {
      return { error: 'Métadonnées de document invalides' };
    }
    if (!Number.isInteger(size) || size <= 0 || size > 10 * 1024 * 1024) {
      return { error: 'Taille de document invalide' };
    }
    documents.push({ path, name, mimeType, size });
  }
  return { documents };
}

function isServiceType(value: string): value is ServiceType {
  return Object.prototype.hasOwnProperty.call(SERVICE_FIELDS, value);
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
