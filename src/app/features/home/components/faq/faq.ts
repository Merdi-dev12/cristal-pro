import { Component } from '@angular/core';

@Component({ selector: 'app-faq', standalone: true, templateUrl: './faq.html' })
export class Faq {
  protected readonly items = [
    { question: 'Quels types de locaux entretenez-vous ?', answer: 'Nous intervenons dans les bureaux, copropriétés, commerces, locaux professionnels et collectivités en Île-de-France.' },
    { question: 'Proposez-vous des interventions ponctuelles ?', answer: 'Oui. Nous organisons des prestations régulières ou ponctuelles, selon vos espaces, vos contraintes et le niveau de service attendu.' },
    { question: 'Comment obtenir un devis ?', answer: 'Décrivez vos locaux et vos besoins dans notre formulaire de devis. Ces informations nous permettront de préparer une proposition adaptée.' },
    { question: 'Intervenez-vous après un chantier ?', answer: 'Oui, nous proposons le nettoyage de fin de chantier et la remise en état avant la réouverture ou la reprise des locaux.' },
  ];
}
