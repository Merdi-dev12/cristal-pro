import { AfterViewInit, Component, ElementRef, HostListener, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-satisfaction',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-satisfaction.html',
  styleUrl: './client-satisfaction.css',
})
export class ClientSatisfaction implements AfterViewInit {
  @ViewChild('sectionRoot') private sectionRoot!: ElementRef<HTMLElement>;
  protected readonly horizontalOffset = signal(0);

  protected readonly values = [
    { number: '01', title: 'Qualité et Excellence', description: 'Nous veillons à offrir des prestations et produits irréprochables.' },
    { number: '02', title: 'Proximité et Écoute', description: 'Chaque client est unique, et nous mettons un point d’honneur à comprendre vos besoins.' },
    { number: '03', title: 'Innovation et Engagement', description: 'Nous restons à la pointe de notre secteur pour vous apporter les meilleures solutions.' },
  ] as const;

  protected readonly steps = [
    { number: '01', title: 'Prise de contact', description: 'Nous prenons contact pour comprendre vos besoins et répondre à vos questions.' },
    { number: '02', title: 'Évaluation sur site ou sur plans', description: 'Un expert évalue les lieux ou analyse les plans pour adapter nos services à votre environnement.' },
    { number: '03', title: 'Envoi de devis définitif', description: 'Nous vous envoyons un devis détaillé avec un calendrier indicatif.' },
    { number: '04', title: 'Planification des opérations', description: 'Nous planifions les interventions en fonction de vos disponibilités.' },
    { number: '05', title: 'Réalisation et suivi', description: 'Nos équipes réalisent les travaux avec un suivi rigoureux jusqu’à la finalisation.' },
  ] as const;

  ngAfterViewInit(): void {
    this.updateHorizontalPosition();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  protected updateHorizontalPosition(): void {
    if (typeof window === 'undefined' || window.innerWidth < 1024 || !this.sectionRoot) {
      this.horizontalOffset.set(0);
      return;
    }

    const section = this.sectionRoot.nativeElement;
    const travel = section.offsetHeight - window.innerHeight;
    const progress = travel > 0 ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / travel)) : 0;
    this.horizontalOffset.set(progress * 3 * window.innerWidth);
  }
}
