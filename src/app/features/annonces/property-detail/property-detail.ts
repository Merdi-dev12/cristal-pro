import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RheodyceDataService } from '../../../core/services/rheodyce-data.service';
import { SubscriberModal } from '../../../shared/components/subscriber-modal/subscriber-modal';
import { Property } from '../../../shared/models/property.model';
import { PropertyPricePipe } from '../../../shared/pipes/pipe';

type MapPoint = [number, number];

interface PropertyMap {
  setView(point: MapPoint, zoom: number): PropertyMap;
  invalidateSize(): void;
  remove(): void;
}

interface PropertyMarker {
  addTo(map: PropertyMap): PropertyMarker;
  bindTooltip(text: string): PropertyMarker;
}

interface LeafletNamespace {
  map(element: HTMLElement, options: Record<string, unknown>): PropertyMap;
  tileLayer(url: string, options: Record<string, unknown>): { addTo(map: PropertyMap): void };
  marker(point: MapPoint): PropertyMarker;
}

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyPricePipe, SubscriberModal],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetailPage implements AfterViewInit, OnDestroy {
  @ViewChild('propertyMap') private readonly propertyMap?: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly data = inject(RheodyceDataService);
  private readonly auth = inject(AuthService);
  private map?: PropertyMap;

  protected readonly selectedImage = signal(0);
  protected readonly showSubscriberModal = signal(false);
  protected readonly isSubscriber = computed(() => this.auth.isSubscriber());
  protected readonly property = computed<Property | undefined>(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.data.properties.find((item) => item.id === id);
  });
  protected readonly hasCoordinates = computed(() => {
    const item = this.property();
    return Number.isFinite(item?.latitude) && Number.isFinite(item?.longitude);
  });

  ngAfterViewInit(): void {
    if (this.hasCoordinates()) void this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  protected readonly gallery = computed<string[]>(() => {
    const property = this.property();
    if (!property) return [];
    return [property.imageUrl, '/assets/hero_img_1.jpg', property.imageUrl].filter(Boolean);
  });

  protected propertyTypeLabel(property: Property): string {
    return property.type === 'location' ? 'À louer' : 'À vendre';
  }

  protected categoryLabel(property: Property): string {
    return property.category.charAt(0).toUpperCase() + property.category.slice(1);
  }

  protected onAction(): void {
    if (!this.isSubscriber()) {
      this.showSubscriberModal.set(true);
    }
  }

  protected closeModal(): void {
    this.showSubscriberModal.set(false);
  }

  protected onLogin(): void {
    this.closeModal();
    void this.router.navigate(['/connexion']);
  }

  private async initMap(): Promise<void> {
    const item = this.property();
    const element = this.propertyMap?.nativeElement;
    if (!item || item.latitude == null || item.longitude == null || !element) return;

    try {
      const leaflet = await this.loadLeaflet();
      this.map = leaflet.map(element, { zoomControl: true }).setView([item.latitude, item.longitude], 14);
      leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(this.map);
      leaflet.marker([item.latitude, item.longitude]).addTo(this.map).bindTooltip(item.location);
      window.setTimeout(() => this.map?.invalidateSize(), 0);
    } catch {
      // The address and coordinates remain visible if the map provider is unavailable.
    }
  }

  private loadLeaflet(): Promise<LeafletNamespace> {
    const existing = (window as Window & { L?: LeafletNamespace }).L;
    if (existing) return Promise.resolve(existing);

    const pending = (window as Window & { __rheodyceLeaflet?: Promise<LeafletNamespace> }).__rheodyceLeaflet;
    if (pending) return pending;

    const promise = new Promise<LeafletNamespace>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.onload = () => {
        const namespace = (window as Window & { L?: LeafletNamespace }).L;
        namespace ? resolve(namespace) : reject(new Error('Leaflet indisponible'));
      };
      script.onerror = () => reject(new Error('Leaflet indisponible'));
      document.head.appendChild(script);
    });
    (window as Window & { __rheodyceLeaflet?: Promise<LeafletNamespace> }).__rheodyceLeaflet = promise;
    return promise;
  }
}
