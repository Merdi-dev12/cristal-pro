import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RheodyceDataService } from '../../core/services/rheodyce-data.service';
import { PropertyCard } from '../../shared/components/property-card/property-card';
import { Property, PropertyType } from '../../shared/models/property.model';

@Component({
  selector: 'app-annonces',
  standalone: true,
  imports: [CommonModule, PropertyCard],
  templateUrl: "./annonces.html",
})
export class AnnoncesPage {
  private readonly data = inject(RheodyceDataService);
  private readonly router = inject(Router);

  readonly chips = [
    { label: 'Location', type: 'location' as PropertyType },
    { label: 'Vente', type: 'vente' as PropertyType },
  ];

  readonly selectedType = signal<PropertyType | 'all'>('all');

  readonly filtered = computed(() => {
    const type = this.selectedType();
    return type === 'all' ? this.data.properties : this.data.properties.filter((property) => property.type === type);
  });

  protected onViewDetails(property: Property): void {
    void this.router.navigate(['/annonces', property.id]);
  }
}
