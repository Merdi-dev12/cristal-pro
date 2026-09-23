import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

interface GalleryItem { title: string; category: string; image: string; size: string; kind?: 'video'; videoUrl?: string; }
const pexels = (id: number): string => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1000`;
@Component({ selector: 'app-prestations', standalone: true, templateUrl: './prestations.html', styleUrl: './prestations.css' })
export class Prestations implements AfterViewInit {
  @ViewChildren('galleryCard', { read: ElementRef }) private cards!: QueryList<ElementRef<HTMLElement>>;
  protected readonly items: readonly GalleryItem[] = [
    { title: 'La propreté au quotidien', category: 'Entretien régulier', image: pexels(18134199), size: 'medium' },
    { title: 'Un espace de travail impeccable', category: 'Bureaux', image: pexels(18885426), size: 'short' },
    { title: 'Après les travaux, place au propre', category: 'Fin de chantier', image: pexels(4099085), size: 'medium' },
    { title: 'Le soin des détails', category: 'Remise en état', image: pexels(6195955), size: 'tall' },
    { title: 'Une intervention maîtrisée', category: 'Désinfection', image: pexels(4099267), size: 'medium' },
    { title: 'Des surfaces nettes, jusque dans les détails', category: 'Entretien régulier', image: pexels(10567364), size: 'short' },
    { title: 'Des locaux prêts à reprendre leur activité', category: 'Fin de chantier', image: pexels(6195278), size: 'tall' },
    { title: 'Retrouver la fraîcheur des lieux', category: 'Remise en état', image: pexels(6197114), size: 'medium' },
    { title: 'Une hygiène renforcée des surfaces', category: 'Désinfection', image: pexels(4099466), size: 'short' },
    { title: 'Des gestes précis à chaque passage', category: 'Entretien régulier', image: pexels(4921625), size: 'medium' },
    { title: 'Nettoyer après le chantier', category: 'Fin de chantier', image: pexels(8901934), size: 'tall' },
    { title: 'Une remise en état en profondeur', category: 'Remise en état', image: pexels(4098787), size: 'medium' },
    { title: 'Une attention portée à chaque zone', category: 'Désinfection', image: pexels(4098783), size: 'short' },
    { title: 'Des bureaux accueillants', category: 'Entretien régulier', image: pexels(9462157), size: 'medium' },
    { title: 'Un nettoyage jusque dans les angles', category: 'Fin de chantier', image: pexels(3616756), size: 'short' },
    { title: 'Des sols propres et soignés', category: 'Remise en état', image: pexels(4099468), size: 'tall' },
    { title: 'Propreté des zones de contact', category: 'Désinfection', image: pexels(4098779), size: 'medium' },
    { title: 'La régularité qui fait la différence', category: 'Entretien régulier', image: pexels(37440103), size: 'short' },
    { title: 'La dernière étape avant la livraison', category: 'Fin de chantier', image: pexels(4098313), size: 'medium' },
    { title: 'Des espaces de vie remis en ordre', category: 'Remise en état', image: pexels(4098916), size: 'tall' },
    { title: 'Une équipe équipée pour intervenir', category: 'Désinfection', image: pexels(33615263), size: 'medium' },
    { title: 'Un accueil propre et lumineux', category: 'Entretien régulier', image: pexels(33728674), size: 'short' },
    { title: 'Une intervention spécialisée en site professionnel', category: 'Fin de chantier', image: pexels(36302077), size: 'medium' },
    { title: 'Des locaux remis en état avec soin', category: 'Remise en état', image: pexels(9464969), size: 'tall' },
    { title: 'Un entretien régulier en mouvement', category: 'Vidéo · Entretien régulier', image: pexels(18885426), size: 'medium', kind: 'video', videoUrl: 'https://videos.pexels.com/video-files/6196267/6196267-uhd_3840_2160_25fps.mp4' },
    { title: 'Une équipe à l’œuvre', category: 'Vidéo · Locaux professionnels', image: pexels(6195955), size: 'short', kind: 'video', videoUrl: 'https://videos.pexels.com/video-files/5983927/5983927-hd_1920_1080_30fps.mp4' },
    { title: 'Des surfaces traitées avec méthode', category: 'Entretien en vidéo', image: pexels(6195278), size: 'medium', kind: 'video', videoUrl: 'https://videos.pexels.com/video-files/6195531/6195531-uhd_3840_2160_25fps.mp4' },
  ];
  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    this.cards.forEach((card) => observer.observe(card.nativeElement));
  }
}
