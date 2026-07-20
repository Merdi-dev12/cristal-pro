import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RheodyceDataService } from '../../../core/services/rheodyce-data.service';
import { SubscriberModal } from '../../../shared/components/subscriber-modal/subscriber-modal';
import { Property } from '../../../shared/models/property.model';
import { PropertyPricePipe } from '../../../shared/pipes/pipe';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyPricePipe, SubscriberModal],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly data = inject(RheodyceDataService);
  private readonly auth = inject(AuthService);

  protected readonly selectedImage = signal(0);
  protected readonly showSubscriberModal = signal(false);
  protected readonly isSubscriber = computed(() => this.auth.isSubscriber());
  protected readonly property = computed<Property | undefined>(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.data.properties.find((item) => item.id === id);
  });

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
}
