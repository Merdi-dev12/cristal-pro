import { PropertyCategory, PropertyType } from './property.model';
import { RequestStatus, ServiceRequest, ServiceType } from './service-request.model';

export type AdminUserRole = 'utilisateur' | 'abonné' | 'admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  isSubscriber: boolean;
  joinedAt: string;
}

export type VisitStatus = 'en attente' | 'confirmée' | 'annulée' | 'terminée';

export interface VisitRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyImageUrl: string;
  requestedDate: string;
  requestedTime: string;
  status: VisitStatus;
  message: string;
  internalNote: string;
  notificationPrepared: boolean;
  createdAt: string;
}

export interface AdminProperty {
  id: string;
  title: string;
  price: number;
  priceSuffix?: string;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  type: PropertyType;
  category: PropertyCategory;
  imageUrl: string;
  photos: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  verified: boolean;
  description: string;
  sensitiveInfo: string;
  ownerName: string;
  createdAt: string;
}

export interface AdminPropertyDraft {
  id?: string;
  title: string;
  price: number;
  priceSuffix: string;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  type: PropertyType;
  category: PropertyCategory;
  imageUrl: string;
  photos: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  verified: boolean;
  description: string;
  sensitiveInfo: string;
  ownerName: string;
}

export type SubmissionStatus = 'en attente' | 'acceptée' | 'refusée' | 'publiée';

export interface SubmissionDecision {
  id: string;
  status: SubmissionStatus;
  reason: string;
  decidedBy: string;
  decidedAt: string;
}

export interface PropertySubmission {
  id: string;
  ownerName: string;
  ownerEmail: string;
  title: string;
  category: PropertyCategory;
  type: PropertyType;
  city: string;
  address: string;
  price: number;
  surface: number;
  description: string;
  photos: string[];
  documents: string[];
  status: SubmissionStatus;
  rejectionReason: string;
  submittedAt: string;
  decisions: SubmissionDecision[];
  publishedPropertyId?: string;
}

export interface AdminDashboardStats {
  properties: number;
  users: number;
  subscribers: number;
  requests: number;
  pendingVisits: number;
  pendingSubmissions: number;
}

export interface AdminServiceRequestView extends ServiceRequest {
  notificationPrepared: boolean;
}

export interface AdminServiceOffer {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: string;
  cta: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

export interface AdminServiceOfferDraft {
  id?: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: string;
  cta: string;
  displayOrder: number;
  active: boolean;
}

export const ADMIN_REQUEST_STATUSES: RequestStatus[] = [
  'reçue',
  'en traitement',
  'assignée',
  'terminée',
  'annulée',
];

export const ADMIN_SERVICE_TYPES: ServiceType[] = [
  'maintenance',
  'decoration',
  'juridique',
  'demenagement',
];
