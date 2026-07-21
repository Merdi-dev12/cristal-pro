import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RheodyceDataService } from '../../../core/services/rheodyce-data.service';
import { SubscriberModal } from '../../../shared/components/subscriber-modal/subscriber-modal';
import { Property } from '../../../shared/models/property.model';
import { CategoryLabelPipe, PropertyPricePipe } from '../../../shared/pipes/pipe';

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

interface DetailItem {
  title: string;
  description: string;
}

interface RoomPreview {
  name: string;
  detail: string;
  image: string;
}

interface CostItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyPricePipe, CategoryLabelPipe, SubscriberModal],
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
  private shareFeedbackTimeout?: number;

  protected readonly selectedImage = signal(0);
  protected readonly showSubscriberModal = signal(false);
  protected readonly shareFeedback = signal('');
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
    if (this.shareFeedbackTimeout != null) window.clearTimeout(this.shareFeedbackTimeout);
  }

  protected readonly gallery = computed<string[]>(() => {
    const property = this.property();
    if (!property) return [];

    const images = [property.imageUrl, ...(property.photos ?? []), '/assets/hero_img_1.jpg', '/assets/hero_img.png'].filter(Boolean);
    return [...new Set(images)].slice(0, 6);
  });

  protected readonly highlights = computed<DetailItem[]>(() => {
    const property = this.property();
    if (!property) return [];

    if (property.category === 'terrain') {
      return [
        { title: 'Parcelle exploitable', description: 'Terrain situé dans une zone suivie, avec une lecture claire du potentiel de valorisation.' },
        { title: 'Accès identifié', description: 'Repères de localisation préparés pour faciliter la visite et les vérifications terrain.' },
        { title: 'Dossier à sécuriser', description: 'Accompagnement possible pour contrôler les informations cadastrales et juridiques.' },
      ];
    }

    return [
      { title: 'Plan lisible', description: 'Des volumes simples à projeter, avec une circulation fluide entre les espaces de vie.' },
      { title: 'Quartier utile', description: 'Proximité des axes, services quotidiens et points de repère importants.' },
      { title: 'Visite cadrée', description: 'Coordination RHEODYCE pour éviter les contacts dispersés et les visites inutiles.' },
    ];
  });

  protected readonly amenities = computed<string[]>(() => {
    const property = this.property();
    if (!property) return [];

    if (property.category === 'terrain') {
      return ['Accès route', 'Zone habitée', 'Repères géographiques', 'Vérification documentaire', 'Potentiel construction', 'Visite accompagnée'];
    }

    return ['Salon lumineux', 'Cuisine équipée', 'Accès sécurisé', 'Eau disponible', 'Accès véhicule', 'Quartier résidentiel', 'Bonne ventilation', 'Proche commodités'];
  });

  protected readonly roomPreview = computed<RoomPreview[]>(() => {
    const property = this.property();
    if (!property) return [];

    const gallery = this.gallery();
    const second = gallery[1] ?? property.imageUrl;
    const third = gallery[2] ?? second;

    if (property.category === 'terrain') {
      return [
        { name: 'Vue principale', detail: `${property.surface} m² exploitables`, image: property.imageUrl },
        { name: 'Environnement', detail: property.location, image: second },
        { name: 'Projection', detail: 'Usage résidentiel ou investissement', image: third },
      ];
    }

    return [
      { name: 'Séjour', detail: 'Espace de réception lumineux', image: property.imageUrl },
      { name: 'Chambres', detail: `${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''} exploitable${property.bedrooms > 1 ? 's' : ''}`, image: second },
      { name: 'Extérieur', detail: 'Accès et environnement du bien', image: third },
    ];
  });

  protected readonly costBreakdown = computed<CostItem[]>(() => {
    const property = this.property();
    if (!property) return [];

    return [
      { label: 'Coordonnées', value: this.isSubscriber() ? 'Disponibles' : 'Réservées' },
      { label: 'Visite', value: 'Sur demande' },
      { label: 'Dossier', value: property.verified ? 'Contrôlé' : 'À contrôler' },
    ];
  });

  protected readonly nearbyPlaces = computed<string[]>(() => {
    const property = this.property();
    if (!property) return [];
    return [`Centre de ${property.location}`, 'Axes principaux', 'Commerces utiles', 'Services administratifs'];
  });

  protected readonly similarProperties = computed<Property[]>(() => {
    const property = this.property();
    if (!property) return [];

    return this.data.properties
      .filter((item) => item.id !== property.id && (item.type === property.type || item.category === property.category))
      .slice(0, 3);
  });

  protected propertyTypeLabel(property: Property): string {
    return property.type === 'location' ? 'À louer' : 'À vendre';
  }

  protected onAction(): void {
    if (!this.isSubscriber()) {
      this.showSubscriberModal.set(true);
    }
  }

  protected async shareProperty(property: Property): Promise<void> {
    const url = window.location.href;
    const price = new Intl.NumberFormat('fr-FR').format(property.price);
    const text = `${property.title} - ${price} USD${property.priceSuffix ?? ''} - ${property.location}`;
    const shareData: ShareData = { title: property.title, text, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        this.showShareFeedback('Annonce partagée');
        return;
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      this.showShareFeedback('Lien copié');
    } catch {
      this.showShareFeedback('Partage indisponible');
    }
  }

  protected closeModal(): void {
    this.showSubscriberModal.set(false);
  }

  protected onLogin(): void {
    this.closeModal();
    void this.router.navigate(['/connexion']);
  }

  private showShareFeedback(message: string): void {
    this.shareFeedback.set(message);
    if (this.shareFeedbackTimeout != null) window.clearTimeout(this.shareFeedbackTimeout);
    this.shareFeedbackTimeout = window.setTimeout(() => this.shareFeedback.set(''), 3000);
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
