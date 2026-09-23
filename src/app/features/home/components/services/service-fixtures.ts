import type { CleaningService } from './cleaning-service';

export const CLEANING_SERVICE_FIXTURES: readonly CleaningService[] = [
  {
    id: 'nettoyage-regulier',
    name: 'Nettoyage réguliers',
    category: 'Entretien courant',
    description: 'Des passages planifiés pour maintenir vos bureaux, copropriétés et locaux professionnels propres au quotidien.',
    imageUrl: '/assets/prestations/agent-entretien-couloir.webp',
  },
  {
    id: 'fin-de-chantier',
    name: 'Nettoyage fin de chantier',
    category: 'Après travaux',
    description: 'Un nettoyage approfondi pour retirer poussières et résidus et préparer vos espaces à leur utilisation.',
    imageUrl: '/assets/prestations/nettoyage-fin-chantier.webp',
  },
  {
    id: 'remise-en-etat',
    name: 'Remise en état',
    category: 'Nettoyage ponctuel',
    description: 'Une intervention ciblée pour retrouver des locaux propres et accueillants après une période d’utilisation ou des travaux.',
    imageUrl: '/assets/prestations/remise-en-etat-couloir.webp',
  },
  {
    id: 'desinfection-nuisibles',
    name: 'Désinfection de nuisibles',
    category: 'Intervention ciblée',
    description: 'Des interventions adaptées à la situation de vos locaux pour contribuer à un environnement plus sain.',
    imageUrl: 'https://images.pexels.com/photos/4099267/pexels-photo-4099267.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
];
