import { Service, computed, inject, signal } from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import {
  AdminDashboardStats,
  AdminProperty,
  AdminPropertyDraft,
  AdminServiceRequestView,
  AdminUser,
  PropertySubmission,
  SubmissionDecision,
  SubmissionStatus,
  VisitRequest,
  VisitStatus,
} from '../../shared/models/admin.model';
import { PropertyCategory, PropertyType } from '../../shared/models/property.model';
import { RequestStatus, ServiceRequest, ServiceType } from '../../shared/models/service-request.model';

@Service()
export class AdminService {
  private readonly supabase = inject(SupabaseClientService).client;
  private hasLoaded = false;

  readonly users = signal<AdminUser[]>(createDemoUsers());
  readonly properties = signal<AdminProperty[]>(createDemoProperties());
  readonly visits = signal<VisitRequest[]>(createDemoVisits());
  readonly serviceRequests = signal<AdminServiceRequestView[]>(createDemoServiceRequests());
  readonly submissions = signal<PropertySubmission[]>(createDemoSubmissions());
  readonly isLoading = signal(false);
  readonly usingDemoData = signal(true);
  readonly actionMessage = signal('');

  readonly stats = computed<AdminDashboardStats>(() => ({
    properties: this.properties().length,
    users: this.users().length,
    subscribers: this.users().filter((user) => user.isSubscriber).length,
    requests: this.visits().length + this.serviceRequests().length,
    pendingVisits: this.visits().filter((visit) => visit.status === 'en attente').length,
    pendingSubmissions: this.submissions().filter((submission) => submission.status === 'en attente').length,
  }));

  readonly recentVisits = computed(() => this.visits().slice(0, 4));
  readonly recentSubmissions = computed(() => this.submissions().slice(0, 4));
  readonly recentServiceRequests = computed(() => this.serviceRequests().slice(0, 4));

  async load(): Promise<void> {
    if (this.hasLoaded) return;

    this.isLoading.set(true);
    try {
      const [profileRows, propertyRows, serviceRows, visitRows, submissionRows, privateRows] = await Promise.all([
        this.loadRows('profiles'),
        this.loadRows('properties'),
        this.loadRows('service_requests'),
        this.loadRows('visit_requests'),
        this.loadRows('property_submissions'),
        this.loadRows('property_private_details'),
      ]);

      let hasBackendData = false;
      if (profileRows.length) {
        this.users.set(profileRows.map((row) => mapUser(row)));
        hasBackendData = true;
      }
      if (propertyRows.length) {
        const privateByProperty = new Map(privateRows.map((row) => [String(row['property_id']), String(row['sensitive_info'] ?? '')]));
        this.properties.set(propertyRows.map((row) => {
          const property = mapProperty(row);
          return { ...property, sensitiveInfo: privateByProperty.get(property.id) ?? property.sensitiveInfo };
        }));
        hasBackendData = true;
      }
      if (serviceRows.length) {
        this.serviceRequests.set(serviceRows.map((row) => mapServiceRequest(row)));
        hasBackendData = true;
      }
      if (visitRows.length) {
        this.visits.set(visitRows.map((row) => mapVisit(row, this.users(), this.properties())));
        hasBackendData = true;
      }
      if (submissionRows.length) {
        this.submissions.set(submissionRows.map((row) => mapSubmission(row)));
        hasBackendData = true;
      }
      this.usingDemoData.set(!hasBackendData || !profileRows.length || !propertyRows.length || !serviceRows.length || !visitRows.length || !submissionRows.length);
    } finally {
      this.hasLoaded = true;
      this.isLoading.set(false);
    }
  }

  async updateVisit(id: string, status: VisitStatus, internalNote: string): Promise<void> {
    this.visits.update((items) =>
      items.map((visit) => visit.id === id ? { ...visit, status, internalNote } : visit),
    );
    await this.persistFakeSafe('visit_requests', id, { status, internal_note: internalNote || null });
    this.actionMessage.set('La demande de visite a été mise à jour.');
  }

  async toggleSubscription(user: AdminUser): Promise<void> {
    const nextValue = !user.isSubscriber;
    this.users.update((items) => items.map((item) => item.id === user.id
      ? { ...item, isSubscriber: nextValue, role: item.role === 'admin' ? 'admin' : nextValue ? 'abonné' : 'utilisateur' }
      : item));
    await this.persistFakeSafe('profiles', user.id, {
      is_subscriber: nextValue,
      subscribed_at: nextValue ? new Date().toISOString() : null,
    });
    this.actionMessage.set(nextValue ? 'Abonnement activé.' : 'Abonnement désactivé.');
  }

  async updateServiceRequest(id: string, status: RequestStatus, assignedTo: string, notes: string): Promise<void> {
    this.serviceRequests.update((items) => items.map((request) => request.id === id
      ? { ...request, status, assignedTo: assignedTo || undefined, notes: notes || undefined, notificationPrepared: false, updatedAt: new Date() }
      : request));
    await this.persistFakeSafe('service_requests', id, {
      status,
      assigned_to: assignedTo || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    });
    this.actionMessage.set('La demande de service a été mise à jour.');
  }

  async prepareNotification(kind: 'visite' | 'service', id: string, message: string): Promise<void> {
    if (kind === 'visite') {
      this.visits.update((items) => items.map((visit) => visit.id === id
        ? { ...visit, notificationPrepared: true, internalNote: visit.internalNote || message }
        : visit));
    } else {
      this.serviceRequests.update((items) => items.map((request) => request.id === id
        ? { ...request, notificationPrepared: true, notes: request.notes || message }
        : request));
    }
    if (id.startsWith('demo-')) {
      await this.persistFakeSafe('admin_notification_logs', `demo-${kind}-${id}`, {
        target_id: id,
        channel: 'email',
        body: message,
        status: 'prepared',
      });
    } else {
      const { error } = await this.supabase.functions.invoke('admin-prepare-notification', {
        body: { entity_type: kind, entity_id: id, message },
      });
      if (error) throw error;
    }
    this.actionMessage.set('Notification préparée, prête à être envoyée par le backend.');
  }

  async decideSubmission(submission: PropertySubmission, status: 'acceptée' | 'refusée', reason = ''): Promise<void> {
    const decision = createDecision(status, reason);
    this.submissions.update((items) => items.map((item) => item.id === submission.id
      ? { ...item, status, rejectionReason: reason, decisions: [decision, ...item.decisions] }
      : item));
    await this.persistFakeSafe('property_submissions', submission.id, {
      status,
      rejection_reason: reason || null,
      decision_at: new Date().toISOString(),
    });
    await this.persistFakeSafe('property_submission_decisions', decision.id, {
      submission_id: submission.id,
      status,
      reason: reason || null,
    });
    this.actionMessage.set(status === 'acceptée' ? 'Soumission acceptée.' : 'Soumission refusée avec motif.');
  }

  async publishSubmission(submission: PropertySubmission): Promise<void> {
    const property: AdminProperty = {
      id: `demo-published-${submission.id}`,
      title: submission.title,
      price: submission.price,
      location: submission.city,
      address: submission.address,
      bedrooms: 3,
      bathrooms: 2,
      surface: submission.surface,
      type: submission.type,
      category: submission.category,
      imageUrl: submission.photos[0] ?? '/assets/hero_img.png',
      photos: submission.photos,
      status: 'published',
      featured: false,
      verified: true,
      description: submission.description,
      sensitiveInfo: 'Coordonnées réservées aux abonnés — à compléter.',
      ownerName: submission.ownerName,
      createdAt: new Date().toISOString(),
    };
    let publishedPropertyId = property.id;
    if (!submission.id.startsWith('demo-')) {
      const { data, error } = await this.supabase.from('properties').insert(toPropertyRow(property)).select('id, created_at').single();
      if (error || !data) throw error ?? new Error('Impossible de publier cette annonce.');
      publishedPropertyId = String(data['id']);
      property.id = publishedPropertyId;
      property.createdAt = String(data['created_at'] ?? property.createdAt);
      const { error: privateError } = await this.supabase.from('property_private_details').upsert({ property_id: publishedPropertyId, sensitive_info: property.sensitiveInfo });
      if (privateError) throw privateError;
      const { error: submissionError } = await this.supabase.from('property_submissions').update({ status: 'publiée', published_property_id: publishedPropertyId }).eq('id', submission.id);
      if (submissionError) throw submissionError;
    }
    this.properties.update((items) => [property, ...items]);
    this.submissions.update((items) => items.map((item) => item.id === submission.id
      ? { ...item, status: 'publiée', publishedPropertyId, decisions: [createDecision('publiée', 'Annonce publiée depuis le panel admin.'), ...item.decisions] }
      : item));
    this.actionMessage.set('La soumission a été transformée en annonce publiée.');
  }

  async saveProperty(draft: AdminPropertyDraft): Promise<void> {
    const property = toAdminProperty(draft);
    if (draft.id) {
      this.properties.update((items) => items.map((item) => item.id === draft.id ? property : item));
      await this.persistFakeSafe('properties', draft.id, toPropertyRow(property));
      if (!draft.id.startsWith('demo-')) {
        const { error } = await this.supabase.from('property_private_details').upsert({ property_id: draft.id, sensitive_info: property.sensitiveInfo || null });
        if (error) throw error;
      }
      this.actionMessage.set('Annonce modifiée.');
      return;
    }

    const created = { ...property, id: `demo-property-${Date.now()}` };
    this.properties.update((items) => [created, ...items]);
    if (!created.id.startsWith('demo-')) await this.supabase.from('properties').insert(toPropertyRow(created));
    this.actionMessage.set('Annonce créée.');
  }

  async setPropertyStatus(property: AdminProperty, status: AdminProperty['status']): Promise<void> {
    this.properties.update((items) => items.map((item) => item.id === property.id ? { ...item, status } : item));
    await this.persistFakeSafe('properties', property.id, { status });
    this.actionMessage.set(status === 'published' ? 'Annonce publiée.' : 'Annonce dépubliée.');
  }

  async setPropertyVerified(property: AdminProperty, verified: boolean): Promise<void> {
    this.properties.update((items) => items.map((item) => item.id === property.id ? { ...item, verified } : item));
    await this.persistFakeSafe('properties', property.id, { verified });
    this.actionMessage.set(verified ? 'Annonce marquée comme vérifiée.' : 'Badge de vérification retiré.');
  }

  async deleteProperty(property: AdminProperty): Promise<void> {
    this.properties.update((items) => items.filter((item) => item.id !== property.id));
    if (!property.id.startsWith('demo-')) await this.supabase.from('properties').delete().eq('id', property.id);
    this.actionMessage.set('Annonce supprimée.');
  }

  async addPhoto(property: AdminProperty, photoUrl: string): Promise<void> {
    const url = photoUrl.trim();
    if (!url) return;
    const photos = [...property.photos, url];
    this.properties.update((items) => items.map((item) => item.id === property.id ? { ...item, photos, imageUrl: item.imageUrl || url } : item));
    await this.persistFakeSafe('properties', property.id, { photos, image_url: property.imageUrl || url });
  }

  async removePhoto(property: AdminProperty, photoUrl: string): Promise<void> {
    const photos = property.photos.filter((photo) => photo !== photoUrl);
    this.properties.update((items) => items.map((item) => item.id === property.id ? { ...item, photos, imageUrl: photos[0] ?? '' } : item));
    await this.persistFakeSafe('properties', property.id, { photos, image_url: photos[0] ?? null });
  }

  private async loadRows(table: string): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await this.supabase.from(table).select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data as unknown as Record<string, unknown>[];
    } catch {
      return [];
    }
  }

  private async persistFakeSafe(table: string, id: string, payload: Record<string, unknown>): Promise<void> {
    if (id.startsWith('demo-')) return;
    const { error } = await this.supabase.from(table).update(payload).eq('id', id);
    if (error) throw error;
  }
}

const imageA = '/assets/hero_img.png';
const imageB = '/assets/hero_img_1.jpg';

function createDemoUsers(): AdminUser[] {
  return [
    { id: 'demo-user-1', name: 'Mireille Kabeya', email: 'mireille.k@example.com', phone: '+243 81 000 00 01', role: 'abonné', isSubscriber: true, joinedAt: '2026-06-12' },
    { id: 'demo-user-2', name: 'Patrick Mbuyi', email: 'patrick.m@example.com', phone: '+243 82 000 00 02', role: 'utilisateur', isSubscriber: false, joinedAt: '2026-07-09' },
    { id: 'demo-user-3', name: 'Sarah Ilunga', email: 'sarah.i@example.com', phone: '+243 83 000 00 03', role: 'abonné', isSubscriber: true, joinedAt: '2026-05-28' },
    { id: 'demo-user-4', name: 'Blaise Tshisekedi', email: 'blaise.t@example.com', phone: '+243 84 000 00 04', role: 'utilisateur', isSubscriber: false, joinedAt: '2026-07-15' },
    { id: 'demo-user-5', name: 'Aline Mukendi', email: 'aline.m@example.com', phone: '+243 85 000 00 05', role: 'utilisateur', isSubscriber: false, joinedAt: '2026-07-18' },
    { id: 'demo-admin-1', name: 'Équipe RHEODYCE', email: 'admin@rheodyce.cd', phone: '+243 80 000 00 00', role: 'admin', isSubscriber: true, joinedAt: '2026-01-02' },
  ];
}

function createDemoProperties(): AdminProperty[] {
  return [
    { id: 'demo-property-1', title: 'Villa contemporaine à Binza', price: 285000, location: 'Kinshasa · Binza', address: 'Avenue des Orangers, Binza', bedrooms: 4, bathrooms: 3, surface: 320, type: 'vente', category: 'maison', imageUrl: imageA, photos: [imageA, imageB], status: 'published', featured: true, verified: true, description: 'Une villa lumineuse avec jardin et gardiennage dans un quartier résidentiel.', sensitiveInfo: 'Contact propriétaire : +243 81 555 10 10', ownerName: 'Agence Horizon', createdAt: '2026-07-18' },
    { id: 'demo-property-2', title: 'Appartement meublé Gombe', price: 1800, priceSuffix: '/mois', location: 'Kinshasa · Gombe', address: 'Boulevard du 30 Juin, Gombe', bedrooms: 2, bathrooms: 2, surface: 120, type: 'location', category: 'appartement', imageUrl: imageB, photos: [imageB], status: 'published', featured: false, verified: true, description: 'Appartement prêt à vivre, proche des commerces et des ambassades.', sensitiveInfo: 'Visite sur rendez-vous via RHEODYCE.', ownerName: 'Jean-Pierre M.', createdAt: '2026-07-14' },
    { id: 'demo-property-3', title: 'Résidence familiale à Lubumbashi', price: 210000, location: 'Lubumbashi · Golf', address: 'Rue des Acacias, Golf', bedrooms: 5, bathrooms: 3, surface: 410, type: 'vente', category: 'residence', imageUrl: imageA, photos: [imageA], status: 'draft', featured: false, verified: false, description: 'Grande résidence familiale avec dépendance et espace extérieur.', sensitiveInfo: 'Informations propriétaires à réserver aux abonnés.', ownerName: 'Kivu Immo', createdAt: '2026-07-11' },
    { id: 'demo-property-4', title: 'Terrain constructible à Matadi', price: 95000, location: 'Matadi · Nzanza', address: 'Quartier Nzanza, Matadi', bedrooms: 0, bathrooms: 0, surface: 850, type: 'vente', category: 'terrain', imageUrl: imageB, photos: [imageB], status: 'published', featured: false, verified: false, description: 'Terrain plat et accessible, idéal pour un projet résidentiel.', sensitiveInfo: 'Dossier foncier disponible après validation.', ownerName: 'Bureau Congo Habitat', createdAt: '2026-07-08' },
  ];
}

function createDemoVisits(): VisitRequest[] {
  return [
    { id: 'demo-visit-1', userId: 'demo-user-1', userName: 'Mireille Kabeya', userEmail: 'mireille.k@example.com', propertyId: 'demo-property-1', propertyTitle: 'Villa contemporaine à Binza', propertyLocation: 'Kinshasa · Binza', propertyImageUrl: imageA, requestedDate: '2026-07-22', requestedTime: '10:30', status: 'en attente', message: 'Je souhaite visiter avec mon conjoint.', internalNote: '', notificationPrepared: false, createdAt: '2026-07-20T08:30:00Z' },
    { id: 'demo-visit-2', userId: 'demo-user-2', userName: 'Patrick Mbuyi', userEmail: 'patrick.m@example.com', propertyId: 'demo-property-2', propertyTitle: 'Appartement meublé Gombe', propertyLocation: 'Kinshasa · Gombe', propertyImageUrl: imageB, requestedDate: '2026-07-23', requestedTime: '14:00', status: 'confirmée', message: 'Disponible uniquement l’après-midi.', internalNote: 'Confirmer l’accès avec le gardien.', notificationPrepared: true, createdAt: '2026-07-19T11:15:00Z' },
    { id: 'demo-visit-3', userId: 'demo-user-3', userName: 'Sarah Ilunga', userEmail: 'sarah.i@example.com', propertyId: 'demo-property-3', propertyTitle: 'Résidence familiale à Lubumbashi', propertyLocation: 'Lubumbashi · Golf', propertyImageUrl: imageA, requestedDate: '2026-07-25', requestedTime: '09:00', status: 'en attente', message: 'Visite pour un projet familial.', internalNote: '', notificationPrepared: false, createdAt: '2026-07-18T16:45:00Z' },
    { id: 'demo-visit-4', userId: 'demo-user-4', userName: 'Blaise Tshisekedi', userEmail: 'blaise.t@example.com', propertyId: 'demo-property-4', propertyTitle: 'Terrain constructible à Matadi', propertyLocation: 'Matadi · Nzanza', propertyImageUrl: imageB, requestedDate: '2026-07-16', requestedTime: '11:00', status: 'terminée', message: 'Je viens avec mon architecte.', internalNote: 'Visite réalisée, retour attendu.', notificationPrepared: true, createdAt: '2026-07-12T09:05:00Z' },
  ];
}

function createDemoServiceRequests(): AdminServiceRequestView[] {
  return [
    createRequest('demo-service-1', 'maintenance', 'en traitement', 'Mireille Kabeya', 'mireille.k@example.com', 'Réparer une fuite dans la salle de bain', 'demo-property-1', '2026-07-20T09:15:00Z', 'Équipe technique à confirmer.', 'Paul Maintenance'),
    createRequest('demo-service-2', 'decoration', 'reçue', 'Sarah Ilunga', 'sarah.i@example.com', 'Conseil décoration pour un salon', 'demo-property-3', '2026-07-19T14:10:00Z', '', ''),
    createRequest('demo-service-3', 'juridique', 'assignée', 'Patrick Mbuyi', 'patrick.m@example.com', 'Vérifier les documents d’un terrain', 'demo-property-4', '2026-07-18T10:00:00Z', 'Préparer une première lecture du titre foncier.', 'Cabinet Mbuyi'),
    createRequest('demo-service-4', 'demenagement', 'terminée', 'Aline Mukendi', 'aline.m@example.com', 'Organiser un déménagement résidentiel', undefined, '2026-07-10T08:20:00Z', 'Dossier clôturé.', 'Move Congo'),
    createRequest('demo-service-5', 'maintenance', 'annulée', 'Blaise Tshisekedi', 'blaise.t@example.com', 'Réparer la climatisation', 'demo-property-2', '2026-07-08T13:30:00Z', '', ''),
  ];
}

function createRequest(id: string, serviceType: ServiceType, status: RequestStatus, clientName: string, clientEmail: string, description: string, propertyId: string | undefined, createdAt: string, notes: string, assignedTo: string): AdminServiceRequestView {
  return { id, userId: clientEmail, serviceType, status, clientName, clientEmail, clientPhone: '+243 81 000 00 00', description, propertyId, notes: notes || undefined, assignedTo: assignedTo || undefined, createdAt: new Date(createdAt), updatedAt: new Date(createdAt), notificationPrepared: status === 'terminée' };
}

function createDemoSubmissions(): PropertySubmission[] {
  return [
    { id: 'demo-submission-1', ownerName: 'Esther Nsimba', ownerEmail: 'esther.n@example.com', title: 'Maison avec jardin à Ngaliema', category: 'maison', type: 'vente', city: 'Kinshasa · Ngaliema', address: 'Quartier Pigeon, Ngaliema', price: 195000, surface: 260, description: 'Maison familiale avec quatre chambres, jardin et dépendance.', photos: [imageA, imageB], documents: ['Titre de propriété.pdf', 'Plan de situation.pdf'], status: 'en attente', rejectionReason: '', submittedAt: '2026-07-20T07:50:00Z', decisions: [] },
    { id: 'demo-submission-2', ownerName: 'Agence Kasaï Habitat', ownerEmail: 'contact@kasaihabitat.cd', title: 'Studio moderne à Limete', category: 'appartement', type: 'location', city: 'Kinshasa · Limete', address: '7e Rue, Limete', price: 650, surface: 48, description: 'Studio moderne dans une résidence sécurisée.', photos: [imageB], documents: ['Mandat de gestion.pdf'], status: 'en attente', rejectionReason: '', submittedAt: '2026-07-19T15:20:00Z', decisions: [] },
    { id: 'demo-submission-3', ownerName: 'Jean Kalume', ownerEmail: 'jean.k@example.com', title: 'Terrain résidentiel à Goma', category: 'terrain', type: 'vente', city: 'Goma · Katindo', address: 'Avenue du Lac, Katindo', price: 72000, surface: 600, description: 'Terrain résidentiel proche du lac et des axes principaux.', photos: [imageA], documents: ['Certificat d’enregistrement.pdf'], status: 'acceptée', rejectionReason: '', submittedAt: '2026-07-15T09:40:00Z', decisions: [createDecision('acceptée', 'Documents vérifiés.') ] },
    { id: 'demo-submission-4', ownerName: 'Bureau Immo Plus', ownerEmail: 'hello@immoplus.cd', title: 'Résidence à rénover', category: 'residence', type: 'vente', city: 'Lubumbashi · Kenya', address: 'Avenue des Écoles, Kenya', price: 120000, surface: 300, description: 'Résidence avec potentiel de rénovation.', photos: [imageB], documents: ['Pièce manquante.pdf'], status: 'refusée', rejectionReason: 'Le document de propriété est incomplet.', submittedAt: '2026-07-11T08:15:00Z', decisions: [createDecision('refusée', 'Le document de propriété est incomplet.') ] },
  ];
}

function createDecision(status: SubmissionStatus, reason: string): SubmissionDecision {
  return { id: `demo-decision-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, status, reason, decidedBy: 'Équipe RHEODYCE', decidedAt: new Date().toISOString() };
}

function mapUser(row: Record<string, unknown>): AdminUser {
  const isSubscriber = Boolean(row['is_subscriber']);
  const role = row['role'] === 'admin' ? 'admin' : isSubscriber ? 'abonné' : 'utilisateur';
  return { id: String(row['id'] ?? ''), name: String(row['full_name'] ?? row['email'] ?? 'Utilisateur'), email: String(row['email'] ?? ''), phone: String(row['phone'] ?? '—'), role, isSubscriber, joinedAt: String(row['created_at'] ?? new Date().toISOString()) };
}

function mapProperty(row: Record<string, unknown>): AdminProperty {
  const photos = Array.isArray(row['photos']) ? row['photos'].map(String) : [];
  const imageUrl = String(row['image_url'] ?? photos[0] ?? '');
  return { id: String(row['id'] ?? ''), title: String(row['title'] ?? ''), price: Number(row['price'] ?? 0), priceSuffix: row['price_suffix'] ? String(row['price_suffix']) : undefined, location: String(row['location'] ?? ''), address: String(row['address'] ?? ''), bedrooms: Number(row['bedrooms'] ?? 0), bathrooms: Number(row['bathrooms'] ?? 0), surface: Number(row['surface'] ?? 0), type: (row['type'] as PropertyType) ?? 'vente', category: (row['category'] as PropertyCategory) ?? 'maison', imageUrl, photos: photos.length ? photos : imageUrl ? [imageUrl] : [], status: (row['status'] as AdminProperty['status']) ?? 'draft', featured: Boolean(row['featured']), verified: Boolean(row['verified']), description: String(row['description'] ?? ''), sensitiveInfo: String(row['sensitive_info'] ?? ''), ownerName: String(row['owner_name'] ?? '—'), createdAt: String(row['created_at'] ?? new Date().toISOString()) };
}

function mapServiceRequest(row: Record<string, unknown>): AdminServiceRequestView {
  return { id: String(row['id'] ?? ''), userId: String(row['user_id'] ?? ''), serviceType: row['service_type'] as ServiceType, status: row['status'] as RequestStatus, clientName: String(row['client_name'] ?? ''), clientEmail: String(row['client_email'] ?? ''), clientPhone: String(row['client_phone'] ?? ''), description: String(row['description'] ?? ''), propertyId: row['property_id'] ? String(row['property_id']) : undefined, budget: row['budget'] == null ? undefined : Number(row['budget']), assignedTo: row['assigned_to'] ? String(row['assigned_to']) : undefined, notes: row['notes'] ? String(row['notes']) : undefined, createdAt: new Date(String(row['created_at'] ?? new Date().toISOString())), updatedAt: new Date(String(row['updated_at'] ?? new Date().toISOString())), completedAt: row['completed_at'] ? new Date(String(row['completed_at'])) : undefined, notificationPrepared: Boolean(row['notification_prepared']) };
}

function mapVisit(row: Record<string, unknown>, users: AdminUser[], properties: AdminProperty[]): VisitRequest {
  const user = users.find((item) => item.id === row['user_id']);
  const property = properties.find((item) => item.id === row['property_id']);
  return { id: String(row['id'] ?? ''), userId: String(row['user_id'] ?? ''), userName: user?.name ?? 'Utilisateur', userEmail: user?.email ?? '', propertyId: String(row['property_id'] ?? ''), propertyTitle: property?.title ?? 'Annonce', propertyLocation: property?.location ?? '', propertyImageUrl: property?.imageUrl ?? '', requestedDate: String(row['requested_date'] ?? ''), requestedTime: String(row['requested_time'] ?? ''), status: row['status'] as VisitStatus, message: String(row['message'] ?? ''), internalNote: String(row['internal_note'] ?? ''), notificationPrepared: Boolean(row['notification_prepared']), createdAt: String(row['created_at'] ?? new Date().toISOString()) };
}

function mapSubmission(row: Record<string, unknown>): PropertySubmission {
  return { id: String(row['id'] ?? ''), ownerName: String(row['owner_name'] ?? ''), ownerEmail: String(row['owner_email'] ?? ''), title: String(row['title'] ?? ''), category: row['category'] as PropertyCategory, type: row['type'] as PropertyType, city: String(row['city'] ?? ''), address: String(row['address'] ?? ''), price: Number(row['price'] ?? 0), surface: Number(row['surface'] ?? 0), description: String(row['description'] ?? ''), photos: Array.isArray(row['photos']) ? row['photos'].map(String) : [], documents: Array.isArray(row['documents']) ? row['documents'].map(String) : [], status: row['status'] as SubmissionStatus, rejectionReason: String(row['rejection_reason'] ?? ''), submittedAt: String(row['created_at'] ?? new Date().toISOString()), decisions: [] };
}

function toAdminProperty(draft: AdminPropertyDraft): AdminProperty {
  return { id: draft.id ?? '', title: draft.title, price: Number(draft.price) || 0, priceSuffix: draft.priceSuffix || undefined, location: draft.location, address: draft.address, bedrooms: Number(draft.bedrooms) || 0, bathrooms: Number(draft.bathrooms) || 0, surface: Number(draft.surface) || 0, type: draft.type, category: draft.category, imageUrl: draft.imageUrl, photos: draft.photos, status: draft.status, featured: draft.featured, verified: draft.verified, description: draft.description, sensitiveInfo: draft.sensitiveInfo, ownerName: draft.ownerName, createdAt: new Date().toISOString() };
}

function toPropertyRow(property: AdminProperty): Record<string, unknown> {
  return { title: property.title, price: property.price, price_suffix: property.priceSuffix ?? null, location: property.location, address: property.address, bedrooms: property.bedrooms, bathrooms: property.bathrooms, surface: property.surface, type: property.type, category: property.category, image_url: property.imageUrl, photos: property.photos, status: property.status, featured: property.featured, verified: property.verified, description: property.description, owner_name: property.ownerName };
}
