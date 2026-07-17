import { Component, input, output } from '@angular/core';
import { Property } from '../../models/property.model';
import { PropertyPricePipe } from '../../pipes/pipe';

@Component({
  selector: 'app-property-card',
  imports: [PropertyPricePipe],
  templateUrl: './property-card.html',
})
export class PropertyCard {
  readonly property = input.required<Property>();
  readonly viewDetails = output<Property>();

  protected bedroomsLabel(property: Property): string {
    if (property.category === 'terrain') {
      return 'Terrain';
    }

    return `${property.bedrooms || 1} chambre${property.bedrooms > 1 ? 's' : ''}`;
  }

  protected bathroomsLabel(property: Property): string {
    if (property.category === 'terrain') {
      return 'Titré';
    }

    return `${property.bathrooms} SDB`;
  }

  protected onViewDetails(): void {
    this.viewDetails.emit(this.property());
  }
}
