import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { MovingRequestService } from '../../core/services/moving-request.service';
import { MovingCoordinates, MovingRequestInput } from '../../shared/models/moving-request.model';

interface GeocodedPlace {
  lat: string;
  lon: string;
  display_name: string;
}

interface RouteResponse {
  routes?: Array<{ distance: number; duration: number; geometry: { coordinates: Array<[number, number]> } }>;
}

@Component({
  selector: 'app-demenagement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './demenagement.html',
  styleUrl: './demenagement.css',
})
export class DemenagementPage implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) private readonly mapElement!: ElementRef<HTMLDivElement>;

  private readonly requests = inject(MovingRequestService);
  private map?: L.Map;
  private markers?: L.LayerGroup;
  private routeLayer?: L.Polyline;

  departureAddress = '';
  arrivalAddress = '';
  movingDate = '';
  estimatedVolume: number | null = null;
  floor = 0;
  hasElevator = true;

  protected readonly routeLoading = signal(false);
  protected readonly routeError = signal('');
  protected readonly submitLoading = signal(false);
  protected readonly submitMessage = signal('');
  protected readonly submitError = signal('');
  protected readonly routeDistanceKm = signal<number | null>(null);
  protected readonly routeDurationMinutes = signal<number | null>(null);
  protected readonly departureCoordinates = signal<MovingCoordinates | null>(null);
  protected readonly arrivalCoordinates = signal<MovingCoordinates | null>(null);
  protected readonly mapReady = signal(false);

  ngAfterViewInit(): void {
    window.setTimeout(() => this.initMap(), 80);
  }

  async calculateRoute(): Promise<void> {
    if (!this.departureAddress.trim() || !this.arrivalAddress.trim()) {
      this.routeError.set('Renseignez les deux adresses pour afficher le trajet.');
      return;
    }

    this.routeLoading.set(true);
    this.routeError.set('');
    this.submitMessage.set('');

    try {
      const [departure, arrival] = await Promise.all([
        this.geocode(this.departureAddress),
        this.geocode(this.arrivalAddress),
      ]);
      if (!departure || !arrival) {
        throw new Error('Une adresse n’a pas pu être localisée. Précisez la commune ou le quartier.');
      }

      const from = this.toCoordinates(departure);
      const to = this.toCoordinates(arrival);
      const routeResponse = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`);
      if (!routeResponse.ok) {
        throw new Error('Le calcul du trajet est momentanément indisponible.');
      }
      const route = (await routeResponse.json()) as RouteResponse;
      const selectedRoute = route.routes?.[0];
      if (!selectedRoute) {
        throw new Error('Aucun trajet routier trouvé pour ces adresses.');
      }

      this.departureCoordinates.set(from);
      this.arrivalCoordinates.set(to);
      this.routeDistanceKm.set(Math.round((selectedRoute.distance / 1000) * 10) / 10);
      this.routeDurationMinutes.set(Math.max(1, Math.round(selectedRoute.duration / 60)));
      this.drawRoute(from, to, selectedRoute.geometry.coordinates);
    } catch (error) {
      this.routeError.set(error instanceof Error ? error.message : 'Impossible de calculer le trajet.');
    } finally {
      this.routeLoading.set(false);
    }
  }

  async submit(): Promise<void> {
    this.submitError.set('');
    this.submitMessage.set('');
    if (!this.isFormValid()) {
      this.submitError.set('Complétez les champs obligatoires avant d’envoyer la demande.');
      return;
    }

    this.submitLoading.set(true);
    const payload: MovingRequestInput = {
      departureAddress: this.departureAddress,
      arrivalAddress: this.arrivalAddress,
      movingDate: this.movingDate,
      estimatedVolume: this.estimatedVolume ?? 0,
      floor: this.floor,
      hasElevator: this.hasElevator,
      departureCoordinates: this.departureCoordinates(),
      arrivalCoordinates: this.arrivalCoordinates(),
      routeDistanceKm: this.routeDistanceKm(),
      routeDurationMinutes: this.routeDurationMinutes(),
    };

    try {
      await this.requests.create(payload);
      this.submitMessage.set('Votre demande est bien enregistrée. Vous pourrez suivre son traitement dans votre espace utilisateur.');
      this.resetForm();
    } catch (error) {
      this.submitError.set(error instanceof Error ? error.message : 'La demande n’a pas pu être enregistrée.');
    } finally {
      this.submitLoading.set(false);
    }
  }

  protected isFormValid(): boolean {
    return Boolean(this.departureAddress.trim() && this.arrivalAddress.trim() && this.movingDate && this.estimatedVolume && this.estimatedVolume > 0 && this.floor >= 0);
  }

  protected formatDuration(): string {
    const minutes = this.routeDurationMinutes();
    if (!minutes) return '—';
    const hours = Math.floor(minutes / 60);
    return hours ? `${hours} h ${minutes % 60} min` : `${minutes} min`;
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private async geocode(address: string): Promise<GeocodedPlace | null> {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=cd&q=${encodeURIComponent(address)}`, {
      headers: { 'Accept-Language': 'fr' },
    });
    if (!response.ok) return null;
    const places = (await response.json()) as GeocodedPlace[];
    return places[0] ?? null;
  }

  private toCoordinates(place: GeocodedPlace): MovingCoordinates {
    return { lat: Number(place.lat), lng: Number(place.lon) };
  }

  private drawRoute(from: MovingCoordinates, to: MovingCoordinates, coordinates: Array<[number, number]>): void {
    if (!this.map || !this.markers) return;
    this.markers.clearLayers();
    this.routeLayer?.removeFrom(this.map);
    const points: L.LatLngTuple[] = coordinates.map(([lng, lat]) => [lat, lng]);
    this.routeLayer = L.polyline(points, { color: '#c5e84a', weight: 6, opacity: 0.9 }).addTo(this.map);
    const departureMarker = L.marker([from.lat, from.lng], { icon: this.markerIcon('D') }).bindTooltip('Départ');
    const arrivalMarker = L.marker([to.lat, to.lng], { icon: this.markerIcon('A') }).bindTooltip('Arrivée');
    this.markers.addLayer(departureMarker).addLayer(arrivalMarker);
    this.map.fitBounds(this.routeLayer.getBounds(), { padding: [28, 28] });
  }

  private markerIcon(label: string): L.DivIcon {
    return L.divIcon({ className: '', html: `<span class="moving-map-marker"><span>${label}</span></span>`, iconSize: [30, 30], iconAnchor: [15, 30] });
  }

  private resetForm(): void {
    this.departureAddress = '';
    this.arrivalAddress = '';
    this.movingDate = '';
    this.estimatedVolume = null;
    this.floor = 0;
    this.hasElevator = true;
    this.departureCoordinates.set(null);
    this.arrivalCoordinates.set(null);
    this.routeDistanceKm.set(null);
    this.routeDurationMinutes.set(null);
    this.markers?.clearLayers();
    this.routeLayer?.remove();
  }

  private initMap(): void {
    try {
      this.map = L.map(this.mapElement.nativeElement, { zoomControl: false }).setView([-4.325, 15.322], 12);
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(this.map);
      this.markers = L.layerGroup().addTo(this.map);
      window.setTimeout(() => {
        this.map?.invalidateSize();
        this.mapReady.set(true);
      }, 120);
    } catch {
      this.routeError.set('La carte n’a pas pu être chargée. Le formulaire reste disponible.');
    }
  }
}
