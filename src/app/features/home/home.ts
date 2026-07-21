import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';
import { PropertyCard } from '../../shared/components/property-card/property-card';
import { Property } from '../../shared/models/property.model';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, Hero, PropertyCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly router = inject(Router);
  protected readonly data = inject(RheodyceDataService);

  protected readonly homeProperties = computed<Property[]>(() => {
    return this.data.properties;
  });

  protected serviceImage(index: number): string {
    return index % 2 === 0 ? '/assets/hero_img.png' : '/assets/hero_img_1.jpg';
  }

  protected serviceRequestLink(serviceId: string): string[] {
    return serviceId === 'demenagement' ? ['/demenagement'] : ['/services', serviceId, 'demande'];
  }

  protected onViewDetails(property: Property): void {
    void this.router.navigate(['/annonces', property.id]);
  }
}
