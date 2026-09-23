import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

interface GalleryItem { title: string; category: string; image: string; size: string; kind?: 'video'; }
@Component({ selector: 'app-prestations', standalone: true, templateUrl: './prestations.html', styleUrl: './prestations.css' })
export class Prestations implements AfterViewInit {
  @ViewChildren('galleryCard', { read: ElementRef }) private cards!: QueryList<ElementRef<HTMLElement>>;
  protected readonly items: readonly GalleryItem[] = [
    { title: 'La propreté au quotidien', category: 'Entretien régulier', image: '/assets/hero_img.png', size: 'tall' },
    { title: 'Des espaces de travail sereins', category: 'Bureaux', image: '/assets/hero_img_1.jpg', size: 'short' },
    { title: 'Après les travaux, place au propre', category: 'Fin de chantier', image: '/assets/hero_img_2.jpg', size: 'medium' },
    { title: 'Le soin des détails', category: 'Remise en état', image: '/assets/hero_img_3.jpg', size: 'tall' },
    { title: 'Un accueil toujours impeccable', category: 'Parties communes', image: '/assets/hero_img_1.jpg', size: 'medium' },
    { title: 'Une intervention maîtrisée', category: 'Savoir-faire', image: '/assets/hero_img.png', size: 'short', kind: 'video' },
    { title: 'La lumière retrouvée', category: 'Locaux professionnels', image: '/assets/hero_img_3.jpg', size: 'tall' },
    { title: 'Prêts à vous accueillir', category: 'Nettoyage ponctuel', image: '/assets/hero_img_2.jpg', size: 'medium' },
  ];
  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    this.cards.forEach((card) => observer.observe(card.nativeElement));
  }
}
