import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PropertyCard } from '../../shared/components/property-card/property-card';
import { Property } from '../../shared/models/property.model';
import { FaqItem, ServiceOffer, StatItem } from '../../shared/models/site-content.model';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Hero, PropertyCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly data = {
    stats: [
      { value: '08', label: 'Biens sélectionnés' },
      { value: '04', label: 'Communes couvertes' },
      { value: '100%', label: 'Accompagnement humain' },
      { value: '01', label: 'Interlocuteur dédié' },
    ] satisfies StatItem[],
    properties: [
      {
        id: 'm1', title: 'Villa contemporaine à Ngaliema', price: 1850, priceSuffix: '/mois',
        location: 'Ngaliema, Kinshasa', address: 'Ngaliema, Kinshasa', bedrooms: 4, bathrooms: 3,
        surface: 280, type: 'location', category: 'maison',
        imageUrl: '/assets/properties/m1/m1-01.webp', featured: true, verified: true,
        description: 'Villa lumineuse avec jardin dans un quartier calme.',
      },
      {
        id: 'm2', title: 'Maison familiale à Gombe', price: 245000, location: 'Gombe, Kinshasa',
        address: 'Gombe, Kinshasa', bedrooms: 5, bathrooms: 4, surface: 340, type: 'vente',
        category: 'maison', imageUrl: '/assets/properties/m2/m2-01.webp', featured: true, verified: true,
        description: 'Grande maison familiale proche des commodités.',
      },
      {
        id: 'p1', title: 'Appartement lumineux', price: 950, priceSuffix: '/mois',
        location: 'Limete, Kinshasa', address: 'Limete, Kinshasa', bedrooms: 2, bathrooms: 2,
        surface: 110, type: 'location', category: 'appartement',
        imageUrl: '/assets/properties/p1/p1-01.webp', featured: true, verified: true,
        description: 'Appartement prêt à vivre avec espaces généreux.',
      },
      {
        id: 'v1', title: 'Résidence élégante', price: 320000, location: 'Mont-Fleury, Kinshasa',
        address: 'Mont-Fleury, Kinshasa', bedrooms: 4, bathrooms: 3, surface: 310, type: 'vente',
        category: 'residence', imageUrl: '/assets/properties/v1/v1-01.webp', featured: true, verified: true,
        description: 'Résidence moderne dans un environnement verdoyant.',
      },
    ] satisfies Property[],
    services: [
      { id: 'verification', title: 'Vérification immobilière', eyebrow: 'Sérénité', description: 'Vérifiez les informations essentielles avant de vous engager.', icon: '✓', cta: 'En savoir plus' },
      { id: 'maintenance', title: 'Entretien & maintenance', eyebrow: 'Au quotidien', description: 'Des professionnels de confiance pour entretenir votre bien.', icon: '⌂', cta: 'En savoir plus' },
      { id: 'decoration', title: 'Aménagement intérieur', eyebrow: 'À votre image', description: 'Donnez vie à un espace qui vous ressemble.', icon: '✳', cta: 'En savoir plus' },
      { id: 'juridique', title: 'Conseil immobilier', eyebrow: 'Bien conseillé', description: 'Un accompagnement clair à chaque étape de votre projet.', icon: '§', cta: 'En savoir plus' },
    ] satisfies ServiceOffer[],
    faqs: [
      { question: 'Comment sont sélectionnés les biens ?', answer: 'Chaque annonce présentée sur cette page est une sélection de démonstration. Contactez notre équipe pour vérifier les disponibilités et les informations avant toute visite.' },
      { question: 'Puis-je visiter un bien ?', answer: 'Oui. Écrivez-nous en précisant le bien qui vous intéresse et vos disponibilités, notre équipe vous répondra.' },
      { question: 'Dans quelles zones êtes-vous présents ?', answer: 'Nous accompagnons actuellement les projets immobiliers à Kinshasa et dans ses principales communes.' },
    ] satisfies FaqItem[],
  };

  protected readonly homeProperties = this.data.properties;

  protected serviceImage(index: number): string {
    return index % 2 === 0 ? '/assets/hero_img.png' : '/assets/hero_img_1.jpg';
  }

  protected onViewDetails(property: Property): void {
    const subject = encodeURIComponent(`Renseignement sur ${property.title}`);
    window.location.href = `mailto:contact@rheodyce.com?subject=${subject}`;
  }
}
