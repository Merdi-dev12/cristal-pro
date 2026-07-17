import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'propertyPrice',
  standalone: true,
})
export class PropertyPricePipe implements PipeTransform {
  transform(value: number, suffix = ''): string {
    const formatted = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(value);

    return suffix ? `${formatted} $ ${suffix}` : `${formatted} $`;
  }
}

@Pipe({
  name: 'categoryLabel',
  standalone: true,
})
export class CategoryLabelPipe implements PipeTransform {
  transform(value: string): string {
    const labels: Record<string, string> = {
      appartement: 'Appartement',
      maison: 'Maison',
      residence: 'Résidence',
      terrain: 'Terrain',
    };

    return labels[value] ?? value;
  }
}
