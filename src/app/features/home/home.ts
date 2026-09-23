import { Component } from '@angular/core';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';
import { Benefits } from './components/benefits/benefits';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, Footer, Hero, Benefits],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly data = {
    services: [
      { id: 'bureaux', title: 'Entretien de bureaux', eyebrow: 'Espaces de travail', description: 'Un environnement de travail propre et accueillant, entretenu selon vos horaires et votre rythme.' },
      { id: 'coproprietes', title: 'Entretien de copropriétés', eyebrow: 'Parties communes', description: 'Des halls, circulations et espaces communs soignés pour le confort de tous les occupants.' },
      { id: 'locaux', title: 'Locaux professionnels', eyebrow: 'Votre activité', description: 'Des prestations adaptées à la configuration de vos locaux et aux besoins de vos équipes.' },
      { id: 'collectivites', title: 'Nettoyage de collectivités', eyebrow: 'Accueil du public', description: 'Des espaces propres et agréables pour les équipes, les visiteurs et les usagers.' },
    ],
  };

  protected serviceImage(index: number): string {
    return index % 2 === 0 ? '/assets/hero_img.png' : '/assets/hero_img_1.jpg';
  }
}
