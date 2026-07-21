import { PropertyCategory, PropertyType } from './property.model';

export type PropertySubmissionStatus =
  'en attente' | 'informations requises' | 'refusée' | 'publiée';

export interface PropertySubmissionInput {
  title: string;
  category: PropertyCategory;
  type: PropertyType;
  city: string;
  address: string;
  price: number;
  surface: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  latitude: number;
  longitude: number;
  photos: File[];
  documents: File[];
}

export interface MyPropertySubmission extends Omit<
  PropertySubmissionInput,
  'photos' | 'documents'
> {
  id: string;
  photoUrls: string[];
  documentUrls: string[];
  status: PropertySubmissionStatus;
  adminMessage: string;
  createdAt: Date;
  updatedAt: Date;
  publishedPropertyId?: string;
}

export interface PropertySubmissionNotification {
  id: string;
  submissionId: string;
  kind: 'submission_received' | 'details_requested' | 'approved' | 'rejected';
  message: string;
  readAt?: Date;
  createdAt: Date;
}
