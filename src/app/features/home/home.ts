import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
})
export class Home {
  private readonly auth = inject(AuthService);
  protected readonly data = inject(RheodyceDataService);

  readonly showSubscriberModal = signal(false);
  readonly isSubscriber = computed(() => this.auth.isSubscriber());
  protected readonly featuredProperties = computed(() => this.data.featuredProperties);

  protected onViewDetails(_property: Property): void {
    if (this.isSubscriber()) {
      return;
    }

    this.showSubscriberModal.set(true);
  }

  protected onCloseModal(): void {
    this.showSubscriberModal.set(false);
  }

  protected onSubscribeModal(): void {
    this.auth.setSubscriber(true);
    this.showSubscriberModal.set(false);
  }
}
