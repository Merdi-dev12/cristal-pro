import { Component, input, output } from '@angular/core';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-card',
  imports: [],
  templateUrl: './property-card.html',
})
export class PropertyCard {
  readonly property = input.required<Property>();
  readonly viewDetails = output<Property>();

  protected typeLabel(type: Property['type']): string {
    return type === 'vente' ? 'À vendre' : 'À louer';
  }

  protected onViewDetails(): void {
    this.viewDetails.emit(this.property());
  }
}
