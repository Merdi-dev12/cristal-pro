export type MovingRequestStatus = 'reçue' | 'en attente' | 'en traitement' | 'assignée' | 'terminée' | 'annulée';

export interface MovingCoordinates {
  lat: number;
  lng: number;
}

export interface MovingRequest {
  id: string;
  userId: string;
  departureAddress: string;
  arrivalAddress: string;
  movingDate: string;
  estimatedVolume: number;
  floor: number;
  hasElevator: boolean;
  departureCoordinates: MovingCoordinates | null;
  arrivalCoordinates: MovingCoordinates | null;
  routeDistanceKm: number | null;
  routeDurationMinutes: number | null;
  status: MovingRequestStatus;
  assignedPartnerId: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MovingRequestInput {
  departureAddress: string;
  arrivalAddress: string;
  movingDate: string;
  estimatedVolume: number;
  floor: number;
  hasElevator: boolean;
  departureCoordinates?: MovingCoordinates | null;
  arrivalCoordinates?: MovingCoordinates | null;
  routeDistanceKm?: number | null;
  routeDurationMinutes?: number | null;
}
