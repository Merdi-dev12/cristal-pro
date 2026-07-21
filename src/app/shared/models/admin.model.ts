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
  readAt?: string;
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
  latitude?: number;
  longitude?: number;
  sensitiveInfo: string;
  ownerName: string;
  readAt?: string;
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
  latitude?: number;
  longitude?: number;
  sensitiveInfo: string;
  ownerName: string;
}

export type SubmissionStatus = 'en attente' | 'informations requises' | 'refusée' | 'publiée';

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
  latitude: number;
  longitude: number;
  description: string;
  photos: string[];
  documents: string[];
  status: SubmissionStatus;
  rejectionReason: string;
  submittedAt: string;
  decisions: SubmissionDecision[];
  publishedPropertyId?: string;
  readAt?: string;
}

export interface AdminDashboardStats {
  properties: number;
  users: number;
  subscribers: number;
  requests: number;
  pendingVisits: number;
  pendingSubmissions: number;
}

export type ContactMessageStatus = 'new' | 'read' | 'archived';
export type ContactNotificationStatus = 'pending' | 'sent' | 'failed';

export interface AdminContactMessage {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  city: string;
  need: string;
  message: string;
  status: ContactMessageStatus;
  notificationStatus: ContactNotificationStatus;
  notificationError?: string;
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminServiceRequestView extends ServiceRequest {
  notificationPrepared: boolean;
  readAt?: string;
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
  'verification',
  'location-vente',
  'maintenance',
  'decoration',
  'juridique',
  'installation-solaire',
];
