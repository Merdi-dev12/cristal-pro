import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RheodyceDataService } from '../../../core/services/rheodyce-data.service';
import { Property } from '../../../shared/models/property.model';
import { PropertyPricePipe } from '../../../shared/pipes/pipe';
import { environment } from '../../../../environments/environment';

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
  imports: [CommonModule, RouterLink, PropertyPricePipe],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetailPage implements AfterViewInit, OnDestroy {
  @ViewChild('propertyMap') private readonly propertyMap?: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly data = inject(RheodyceDataService);
  private readonly auth = inject(AuthService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);
  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private map?: PropertyMap;
  private shareFeedbackTimeout?: number;

  protected readonly selectedImage = signal(0);
  protected readonly shareFeedback = signal('');
  protected readonly isSubscriber = computed(() => this.auth.isSubscriber());
  protected readonly property = computed<Property | undefined>(() => {
    const id = this.routeParams().get('id');
    return this.data.properties.find((item) => item.id === id);
  });
  protected readonly hasCoordinates = computed(() => {
    const item = this.property();
    return Number.isFinite(item?.latitude) && Number.isFinite(item?.longitude);
  });

  constructor() {
    effect(() => {
      const item = this.property();
      if (item) this.updateShareMetadata(item);
    });
  }

  ngAfterViewInit(): void {
    if (this.hasCoordinates()) void this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    if (this.shareFeedbackTimeout != null) window.clearTimeout(this.shareFeedbackTimeout);
    this.resetShareMetadata();
  }

  protected readonly gallery = computed<string[]>(() => {
    const property = this.property();
    if (!property) return [];
    if (!this.isSubscriber()) return [property.imageUrl].filter(Boolean);
    const images = [property.imageUrl, ...(property.photos ?? [])].filter(Boolean);
    return [...new Set(images)];
  });

  protected propertyTypeLabel(property: Property): string {
    return property.type === 'location' ? 'À louer' : 'À vendre';
  }

  protected categoryLabel(property: Property): string {
    return property.category.charAt(0).toUpperCase() + property.category.slice(1);
  }

  protected onAction(): void {
    if (!this.isSubscriber()) {
      this.openSubscription();
    }
  }

  protected async shareProperty(property: Property): Promise<void> {
    const url = this.propertyShareUrl(property);
    const price = new Intl.NumberFormat('fr-FR').format(property.price);
    const text = `${property.title} — ${price} USD${property.priceSuffix ?? ''} — ${property.location}`;
    const shareData = await this.withShareImage(property, {
      title: property.title,
      text,
      url,
    });

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

  protected openSubscription(): void {
    void this.router.navigate(['/abonnement'], {
      queryParams: {
        access: 'subscription-required',
        redirect: `/annonces/${this.property()?.id ?? ''}`,
      },
      fragment: 'plans',
    });
  }

  private showShareFeedback(message: string): void {
    this.shareFeedback.set(message);
    if (this.shareFeedbackTimeout != null) window.clearTimeout(this.shareFeedbackTimeout);
    this.shareFeedbackTimeout = window.setTimeout(() => this.shareFeedback.set(''), 3000);
  }

  private propertyShareUrl(property: Property): string {
    const detailUrl = new URL(
      `/annonces/${encodeURIComponent(property.id)}`,
      window.location.origin,
    );
    const shareUrl = new URL(`${environment.supabaseUrl}/functions/v1/property-share`);
    shareUrl.searchParams.set('id', property.id);
    shareUrl.searchParams.set('redirect', detailUrl.toString());
    return shareUrl.toString();
  }

  private async withShareImage(property: Property, shareData: ShareData): Promise<ShareData> {
    if (!navigator.canShare || !property.imageUrl) return shareData;

    try {
      const response = await fetch(property.imageUrl);
      if (!response.ok) return shareData;
      const image = await response.blob();
      if (!image.type.startsWith('image/')) return shareData;
      const extension = image.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
      const candidate: ShareData = {
        ...shareData,
        files: [new File([image], `rheodyce-${property.id}.${extension}`, { type: image.type })],
      };
      return navigator.canShare(candidate) ? candidate : shareData;
    } catch {
      return shareData;
    }
  }

  private updateShareMetadata(property: Property): void {
    const detailUrl = new URL(
      `/annonces/${encodeURIComponent(property.id)}`,
      window.location.origin,
    ).toString();
    const imageUrl = new URL(property.imageUrl, window.location.origin).toString();
    const description = `${property.title}, ${property.location} · ${property.surface} m². Découvrez cette annonce vérifiée sur RHEODYCE.`;

    this.title.setTitle(`${property.title} — RHEODYCE`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:site_name', content: 'RHEODYCE' });
    this.meta.updateTag({ property: 'og:title', content: property.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:alt', content: property.title });
    this.meta.updateTag({ property: 'og:url', content: detailUrl });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: property.title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.setCanonicalUrl(detailUrl);
  }

  private resetShareMetadata(): void {
    const description =
      'RHEODYCE — Annonces immobilières vérifiées, location, vente, maintenance et assistance juridique.';
    this.title.setTitle('RHEODYCE — Agence immobilière');
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'RHEODYCE' });
    this.meta.updateTag({ property: 'og:title', content: 'RHEODYCE — Agence immobilière' });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: '/assets/hero_img.png' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    for (const selector of [
      'property="og:image:alt"',
      'property="og:url"',
      'name="twitter:title"',
      'name="twitter:description"',
      'name="twitter:image"',
    ]) {
      this.meta.removeTag(selector);
    }
    this.document.head.querySelector('link[rel="canonical"]')?.remove();
  }

  private setCanonicalUrl(url: string): void {
    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private async initMap(): Promise<void> {
    const item = this.property();
    const element = this.propertyMap?.nativeElement;
    if (!item || item.latitude == null || item.longitude == null || !element) return;

    try {
      const leaflet = await this.loadLeaflet();
      this.map = leaflet
        .map(element, { zoomControl: true })
        .setView([item.latitude, item.longitude], 14);
      leaflet
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        })
        .addTo(this.map);
      leaflet.marker([item.latitude, item.longitude]).addTo(this.map).bindTooltip(item.location);
      window.setTimeout(() => this.map?.invalidateSize(), 0);
    } catch {
      // The address and coordinates remain visible if the map provider is unavailable.
    }
  }

  private loadLeaflet(): Promise<LeafletNamespace> {
    const existing = (window as Window & { L?: LeafletNamespace }).L;
    if (existing) return Promise.resolve(existing);

    const pending = (window as Window & { __rheodyceLeaflet?: Promise<LeafletNamespace> })
      .__rheodyceLeaflet;
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
    (window as Window & { __rheodyceLeaflet?: Promise<LeafletNamespace> }).__rheodyceLeaflet =
      promise;
    return promise;
  }
}
