import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';
import { PropertyCard } from '../../shared/components/property-card/property-card';
import { SubscriberModal } from '../../shared/components/subscriber-modal/subscriber-modal';
import { Property } from '../../shared/models/property.model';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, Hero, PropertyCard, SubscriberModal],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly data = inject(RheodyceDataService);

  readonly showSubscriberModal = signal(false);
  readonly isSubscriber = computed(() => this.auth.isSubscriber());
  protected readonly homeProperties = computed<Property[]>(() => {
    return this.data.properties;
  });

  protected serviceImage(index: number): string {
    return index % 2 === 0 ? '/assets/hero_img.png' : '/assets/hero_img_1.jpg';
  }

  protected onViewDetails(property: Property): void {
    if (this.isSubscriber()) {
      void this.router.navigate(['/annonces', property.id]);
      return;
    }

    this.showSubscriberModal.set(true);
  }

  protected onCloseModal(): void {
    this.showSubscriberModal.set(false);
  }

  protected onLoginModal(): void {
    this.showSubscriberModal.set(false);
    void this.router.navigate(['/connexion']);
  }
}
