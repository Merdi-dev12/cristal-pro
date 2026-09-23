import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

interface GalleryItem { title: string; category: string; image: string; size: string; kind?: 'video'; videoUrl?: string; }
const pexels = (id: number): string => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1000`;
const suppliedPhotos = Array.from({ length: 102 }, (_, index) => ({
  title: `Photo des prestations Cristal Pro ${index + 1}`,
  category: 'Nos prestations',
  image: `/assets/prestations/galerie/photo-${String(index + 1).padStart(3, '0')}.jpg`,
  size: ['medium', 'short', 'tall'][index % 3],
}));
@Component({ selector: 'app-prestations', standalone: true, templateUrl: './prestations.html', styleUrl: './prestations.css' })
export class Prestations implements AfterViewInit {
  @ViewChildren('galleryCard', { read: ElementRef }) private cards!: QueryList<ElementRef<HTMLElement>>;
  protected readonly items: readonly GalleryItem[] = [
    { title: 'La propreté au quotidien', category: 'Entretien régulier', image: '/assets/prestations/agent-entretien-couloir.webp', size: 'medium' },
    { title: 'Un espace de travail impeccable', category: 'Bureaux', image: '/assets/prestations/bureaux-entretenus.webp', size: 'short' },
    { title: 'Après les travaux, place au propre', category: 'Fin de chantier', image: '/assets/prestations/nettoyage-fin-chantier.webp', size: 'medium' },
    { title: 'Le soin des détails', category: 'Remise en état', image: '/assets/prestations/remise-en-etat-couloir.webp', size: 'tall' },
    { title: 'Une intervention maîtrisée', category: 'Désinfection', image: pexels(4099267), size: 'medium' },
    { title: 'Des surfaces nettes, jusque dans les détails', category: 'Entretien régulier', image: '/assets/prestations/sols-industriels.webp', size: 'short' },
    { title: 'Après les travaux, place au nettoyage', category: 'Fin de chantier', image: '/assets/prestations/locaux-apres-travaux.webp', size: 'tall' },
    { title: 'Retrouver la fraîcheur des lieux', category: 'Remise en état', image: '/assets/prestations/sols-entretenus.webp', size: 'medium' },
    { title: 'Une hygiène renforcée des surfaces', category: 'Désinfection', image: pexels(4099466), size: 'short' },
    { title: 'Des gestes précis à chaque passage', category: 'Entretien régulier', image: '/assets/prestations/nettoyage-grande-surface.webp', size: 'medium' },
    { title: 'Nettoyer après le chantier', category: 'Fin de chantier', image: pexels(8901934), size: 'tall' },
    { title: 'Une remise en état en profondeur', category: 'Remise en état', image: '/assets/prestations/bureaux-lumineux.webp', size: 'medium' },
    { title: 'Une attention portée à chaque zone', category: 'Désinfection', image: pexels(4098783), size: 'short' },
    { title: 'Des bureaux accueillants', category: 'Entretien régulier', image: '/assets/prestations/hall-professionnel.webp', size: 'medium' },
    { title: 'Un nettoyage jusque dans les angles', category: 'Fin de chantier', image: pexels(3616756), size: 'short' },
    { title: 'Des sols propres et soignés', category: 'Remise en état', image: pexels(4099468), size: 'tall' },
    { title: 'Propreté des zones de contact', category: 'Désinfection', image: pexels(4098779), size: 'medium' },
    { title: 'La régularité qui fait la différence', category: 'Entretien régulier', image: '/assets/prestations/autolaveuse-professionnelle.webp', size: 'short' },
    { title: 'La dernière étape avant la livraison', category: 'Fin de chantier', image: pexels(4098313), size: 'medium' },
    { title: 'Des espaces de vie remis en ordre', category: 'Remise en état', image: pexels(4098916), size: 'tall' },
    { title: 'Une équipe équipée pour intervenir', category: 'Désinfection', image: pexels(33615263), size: 'medium' },
    { title: 'Un accueil propre et lumineux', category: 'Entretien régulier', image: '/assets/prestations/couloir-industriel.webp', size: 'short' },
    { title: 'Une intervention spécialisée en site professionnel', category: 'Fin de chantier', image: '/assets/prestations/entretien-couloir.webp', size: 'medium' },
    { title: 'Des locaux remis en état avec soin', category: 'Remise en état', image: '/assets/prestations/bureaux-lumineux.webp', size: 'tall' },
    { title: 'Un entretien régulier en mouvement', category: 'Vidéo · Entretien régulier', image: '/assets/prestations/sols-industriels.webp', size: 'medium', kind: 'video', videoUrl: '/assets/prestations/entretien-industriel.mp4' },
    { title: 'Une équipe à l’œuvre', category: 'Vidéo · Locaux professionnels', image: '/assets/prestations/agent-entretien-couloir.webp', size: 'short', kind: 'video', videoUrl: '/assets/prestations/entretien-locaux.mp4' },
    { title: 'Des surfaces traitées avec méthode', category: 'Vidéo · Remise en état', image: '/assets/prestations/bureaux-entretenus.webp', size: 'medium', kind: 'video', videoUrl: '/assets/prestations/remise-en-etat.mp4' },
    { title: 'L’entretien des sanitaires', category: 'Vidéo · Surfaces sanitaires', image: '/assets/prestations/sanitaires-propres.webp', size: 'short', kind: 'video', videoUrl: '/assets/prestations/sanitaires.mp4' },
    ...suppliedPhotos,
    { title: 'Vidéo des prestations Cristal Pro 1', category: 'Vidéo · Nos prestations', image: '/assets/prestations/galerie/photo-001.jpg', size: 'tall', kind: 'video', videoUrl: '/assets/prestations/galerie/video-01.mp4' },
    { title: 'Vidéo des prestations Cristal Pro 2', category: 'Vidéo · Nos prestations', image: '/assets/prestations/galerie/photo-002.jpg', size: 'medium', kind: 'video', videoUrl: '/assets/prestations/galerie/video-02.mp4' },
    { title: 'Vidéo des prestations Cristal Pro 3', category: 'Vidéo · Nos prestations', image: '/assets/prestations/galerie/photo-003.jpg', size: 'short', kind: 'video', videoUrl: '/assets/prestations/galerie/video-03.mp4' },
    { title: 'Vidéo des prestations Cristal Pro 4', category: 'Vidéo · Nos prestations', image: '/assets/prestations/galerie/photo-004.jpg', size: 'tall', kind: 'video', videoUrl: '/assets/prestations/galerie/video-04.mp4' },
  ];
  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    this.cards.forEach((card) => observer.observe(card.nativeElement));
  }
}
