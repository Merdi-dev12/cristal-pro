export type ServiceType =
  | 'verification'
  | 'location-vente'
  | 'maintenance'
  | 'decoration'
  | 'juridique'
  | 'demenagement'
  | 'annonce'
  | 'contact';

export type RequestSource = 'service' | 'moving' | 'property-submission' | 'contact';

export type RequestStatus = 'reçue' | 'en traitement' | 'assignée' | 'terminée' | 'annulée';

export interface ServiceRequest {
  id: string;
  source: RequestSource;
  userId: string;
  serviceType: ServiceType;
  status: RequestStatus;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  details: ServiceRequestDetails;
  documents: ServiceRequestDocument[];
  propertyId?: string;
  budget?: number;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type ServiceRequestDetailValue = string | number | boolean | null;

export type ServiceRequestDetails = Record<string, ServiceRequestDetailValue>;

export interface ServiceRequestDocument {
  path: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface CreateServiceRequestInput {
  serviceType: Exclude<ServiceType, 'demenagement' | 'annonce' | 'contact'>;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  details: ServiceRequestDetails;
  documents?: File[];
  budget?: number;
}

export interface ServiceRequestEvent {
  id: string;
  requestId: string;
  status: RequestStatus;
  message: string;
  createdAt: Date;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  verification: 'Vérification anti-fraude',
  'location-vente': 'Location & vente',
  maintenance: 'Maintenance',
  decoration: 'Décoration',
  juridique: 'Assistance juridique',
  demenagement: 'Déménagement',
  annonce: 'Annonce proposée',
  contact: 'Contact',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  reçue: 'Reçue',
  'en traitement': 'En traitement',
  assignée: 'Assignée',
  terminée: 'Terminée',
  annulée: 'Annulée',
};

export const CANCELLABLE_STATUSES: RequestStatus[] = ['reçue', 'en traitement'];

export const SERVICE_DETAIL_LABELS: Record<string, string> = {
  property_address: 'Adresse du bien',
  transaction_type: 'Type de transaction',
  verification_scope: 'Vérification souhaitée',
  documents_available: 'Documents disponibles',
  project_type: 'Type de projet',
  property_category: 'Type de bien',
  city: 'Ville',
  preferred_area: 'Zone souhaitée',
  target_date: 'Date cible',
  intervention_type: 'Type d’intervention',
  urgency: 'Niveau d’urgence',
  preferred_date: 'Date souhaitée',
  access_details: 'Accès au bien',
  rooms: 'Pièces concernées',
  preferred_style: 'Style préféré',
  case_type: 'Nature du besoin',
  deadline: 'Échéance',
};
