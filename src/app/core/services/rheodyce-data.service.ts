import { Service } from '@angular/core';
import { Property } from '../../shared/models/property.model';
import { FaqItem, ProcessStep, ServiceOffer, StatItem, Testimonial } from '../../shared/models/site-content.model';

@Service()
export class RheodyceDataService {
  readonly properties: Property[] = [
    {
      id: 'kin-villa-01',
      title: 'Villa contemporaine avec jardin',
      price: 356798,
      location: 'Gombe, Kinshasa',
      address: 'Avenue de la Justice, Kinshasa',
      bedrooms: 5,
      bathrooms: 3,
      surface: 420,
      type: 'vente',
      category: 'maison',
      imageUrl: '/assets/hero_img.png',
      featured: true,
      verified: true,
      description: 'Maison familiale lumineuse, sécurisée, avec espaces de réception et dépendance.',
    },
    {
      id: 'kin-apt-02',
      title: 'Appartement premium meublé',
      price: 1850,
      priceSuffix: '/mois',
      location: 'Ngaliema, Kinshasa',
      address: 'Quartier Ma Campagne, Kinshasa',
      bedrooms: 3,
      bathrooms: 2,
      surface: 145,
      type: 'location',
      category: 'appartement',
      imageUrl: '/assets/hero_img.png',
      verified: true,
      description: 'Appartement prêt à vivre avec parking, gardiennage et accès rapide aux axes principaux.',
    },
    {
      id: 'lub-res-03',
      title: 'Résidence sécurisée neuve',
      price: 128000,
      location: 'Golf, Lubumbashi',
      address: 'Route du Golf, Lubumbashi',
      bedrooms: 4,
      bathrooms: 3,
      surface: 260,
      type: 'vente',
      category: 'residence',
      imageUrl: '/assets/hero_img.png',
      featured: true,
      verified: true,
      description: 'Résidence récente dans une concession calme, idéale pour investissement locatif.',
    },
    {
      id: 'goma-house-04',
      title: 'Maison familiale proche lac',
      price: 950,
      priceSuffix: '/mois',
      location: 'Himbi, Goma',
      address: 'Avenue du Lac, Goma',
      bedrooms: 4,
      bathrooms: 2,
      surface: 210,
      type: 'location',
      category: 'maison',
      imageUrl: '/assets/hero_img.png',
      verified: true,
      description: 'Maison fonctionnelle avec cour, terrasse et accès aux commerces du quartier.',
    },
    {
      id: 'matadi-land-05',
      title: 'Terrain titré à fort potentiel',
      price: 42000,
      location: 'Matadi, Kongo Central',
      address: 'Zone résidentielle, Matadi',
      bedrooms: 0,
      bathrooms: 0,
      surface: 800,
      type: 'vente',
      category: 'terrain',
      imageUrl: '/assets/hero_img.png',
      verified: false,
      description: 'Parcelle bien située pour projet résidentiel ou petite promotion immobilière.',
    },
    {
      id: 'kin-studio-06',
      title: 'Studio moderne avec services',
      price: 620,
      priceSuffix: '/mois',
      location: 'Limete, Kinshasa',
      address: '7e Rue, Limete',
      bedrooms: 1,
      bathrooms: 1,
      surface: 58,
      type: 'location',
      category: 'appartement',
      imageUrl: '/assets/hero_img.png',
      verified: true,
      description: 'Studio compact, propre et sécurisé, pensé pour jeunes actifs et consultants.',
    },
  ];

  readonly stats: StatItem[] = [
    { value: '100%', label: 'Annonces contrôlées' },
    { value: '500+', label: 'Biens publiés' },
    { value: '150+', label: 'Quartiers couverts' },
    { value: '2 000+', label: 'Avis positifs' },
  ];

  readonly services: ServiceOffer[] = [
    {
      id: 'verification',
      title: 'Vérification anti-fraude',
      eyebrow: 'Confiance',
      description: 'Contrôle des informations, cohérence des pièces et statut du bien avant mise en relation.',
      icon: '✓',
      cta: 'Voir le protocole',
    },
    {
      id: 'location-vente',
      title: 'Location & vente',
      eyebrow: 'Transaction',
      description: 'Un parcours clair pour trouver, visiter, comparer et sécuriser votre prochain bien.',
      icon: '⌂',
      cta: 'Explorer',
    },
    {
      id: 'maintenance',
      title: 'Maintenance immobilière',
      eyebrow: 'Après-vente',
      description: 'Plomberie, électricité, climatisation, peinture et remise en état avec prestataires suivis.',
      icon: '⚙',
      cta: 'Demander un devis',
    },
    {
      id: 'decoration',
      title: 'Décoration intérieure',
      eyebrow: 'Valorisation',
      description: 'Aménagement, rénovation légère et mise en scène pour louer ou vendre plus vite.',
      icon: '◐',
      cta: 'S’inspirer',
    },
    {
      id: 'juridique',
      title: 'Assistance juridique',
      eyebrow: 'Protection',
      description: 'Appui documentaire et orientation vers un cabinet partenaire en droit immobilier.',
      icon: '§',
      cta: 'Être accompagné',
    },
  ];

  readonly process: ProcessStep[] = [
    { step: '01', title: 'Rechercher', description: 'Filtrez par ville, budget, typologie et niveau de vérification.' },
    { step: '02', title: 'Comparer', description: 'Consultez les fiches synthétiques, photos et informations essentielles.' },
    { step: '03', title: 'Sécuriser', description: 'Débloquez les coordonnées et l’accompagnement sur les biens qui vous intéressent.' },
  ];

  readonly faqs: FaqItem[] = [
    {
      question: 'Comment RHEODYCE vérifie les annonces ?',
      answer: 'Les informations clés sont recoupées avant publication : identité du contact, cohérence du prix, localisation, photos et statut du bien.',
    },
    {
      question: 'Pourquoi certaines informations sont réservées aux abonnés ?',
      answer: 'Les coordonnées précises et documents sensibles sont protégés afin de limiter les abus et garder une mise en relation qualifiée.',
    },
    {
      question: 'Puis-je demander une visite avant de payer ?',
      answer: 'Oui. Les fiches publiques donnent assez d’éléments pour présélectionner, puis l’équipe aide à organiser une visite encadrée.',
    },
    {
      question: 'RHEODYCE remplace-t-il un agent immobilier ?',
      answer: 'La plateforme centralise, vérifie et facilite la transaction. Selon le dossier, un partenaire terrain ou juridique peut intervenir.',
    },
  ];

  readonly testimonials: Testimonial[] = [
    {
      name: 'Mireille K.',
      role: 'Acheteuse à Kinshasa',
      quote: 'La fiche était claire, le prix cohérent et la visite s’est faite sans mauvaises surprises.',
    },
    {
      name: 'Patrick M.',
      role: 'Propriétaire bailleur',
      quote: 'J’ai publié un bien en gardant un cadre sérieux pour filtrer les demandes peu fiables.',
    },
  ];

  get featuredProperties(): Property[] {
    return this.properties.filter((property) => property.featured || property.verified).slice(0, 3);
  }
}
