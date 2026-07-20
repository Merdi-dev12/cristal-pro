export type ServiceType = 'maintenance' | 'decoration' | 'juridique' | 'demenagement';

export type RequestStatus = 'reçue' | 'en traitement' | 'assignée' | 'terminée' | 'annulée';

export interface ServiceRequest {
  id: string;
  userId: string;
  serviceType: ServiceType;
  status: RequestStatus;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  propertyId?: string;
  budget?: number;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  maintenance: 'Maintenance',
  decoration: 'Décoration',
  juridique: 'Assistance juridique',
  demenagement: 'Déménagement',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  'reçue': 'Reçue',
  'en traitement': 'En traitement',
  'assignée': 'Assignée',
  'terminée': 'Terminée',
  'annulée': 'Annulée',
};

export const CANCELLABLE_STATUSES: RequestStatus[] = ['reçue', 'en traitement'];
