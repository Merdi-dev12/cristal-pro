import type { CleaningService } from './cleaning-service';

export const CLEANING_SERVICE_FIXTURES: readonly CleaningService[] = [
  {
    id: 'nettoyage-regulier',
    name: 'Nettoyage réguliers',
    category: 'Entretien courant',
    description: 'Des passages planifiés pour maintenir vos bureaux, copropriétés et locaux professionnels propres au quotidien.',
    imageUrl: 'https://images.pexels.com/photos/33357392/pexels-photo-33357392.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    id: 'fin-de-chantier',
    name: 'Nettoyage fin de chantier',
    category: 'Après travaux',
    description: 'Un nettoyage approfondi pour retirer poussières et résidus et préparer vos espaces à leur utilisation.',
    imageUrl: 'https://images.pexels.com/photos/4099085/pexels-photo-4099085.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    id: 'remise-en-etat',
    name: 'Remise en état',
    category: 'Nettoyage ponctuel',
    description: 'Une intervention ciblée pour retrouver des locaux propres et accueillants après une période d’utilisation ou des travaux.',
    imageUrl: 'https://images.pexels.com/photos/6195955/pexels-photo-6195955.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    id: 'desinfection-nuisibles',
    name: 'Désinfection de nuisibles',
    category: 'Intervention ciblée',
    description: 'Des interventions adaptées à la situation de vos locaux pour contribuer à un environnement plus sain.',
    imageUrl: 'https://images.pexels.com/photos/4099267/pexels-photo-4099267.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
];
