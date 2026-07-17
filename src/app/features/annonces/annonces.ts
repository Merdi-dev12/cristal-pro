import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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

  readonly chips = [
    { label: 'Location', type: 'location' as PropertyType },
    { label: 'Vente', type: 'vente' as PropertyType },
  ];

  readonly selectedType = signal<PropertyType | 'all'>('all');

  readonly filtered = computed(() => {
    const type = this.selectedType();
    return type === 'all' ? this.data.properties : this.data.properties.filter((property) => property.type === type);
  });

  protected onViewDetails(_property: Property): void {
    // La fiche détaillée sera connectée ensuite.
  }
}
