import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly auth = inject(AuthService);

  readonly plans: SubscriptionPlan[] = [
    {
      id: 'preview',
      name: 'Aperçu',
      price: 0,
      period: 'pour toujours',
      description: 'Pour découvrir les annonces et préparer votre recherche.',
      features: ['Accès aux annonces publiques', 'Filtres de recherche', 'Conseils immobiliers'],
    },
    {
      id: 'rheodyce',
      name: 'Abonnement immobilier',
      price: 19.9,
      period: 'par mois',
      description: 'Tout ce qu’il faut pour avancer avec plus de visibilité et de sécurité.',
      features: [
        'Coordonnées des propriétaires et agences',
        'Localisation précise des biens',
        'Photos et informations complètes',
        'Support prioritaire RHEODYCE',
      ],
      highlighted: true,
      badge: 'Le plus choisi',
    },
    {
      id: 'accompagnement',
      name: 'Accompagnement',
      price: 49.9,
      period: 'par mois',
      description:
        'Une formule de démonstration pour les recherches qui demandent plus d’accompagnement.',
      features: [
        'Tous les avantages RHEODYCE',
        'Mise en relation prioritaire',
        'Conseils personnalisés',
      ],
    },
  ];

  activateFake(plan: SubscriptionPlan): void {
    if (plan.id === 'preview') return;
    this.auth.setSubscriber(true);
  }

  async createCheckoutSession(_plan: SubscriptionPlan): Promise<never> {
    throw new Error('Le paiement réel sera connecté ici ultérieurement.');
  }
}
