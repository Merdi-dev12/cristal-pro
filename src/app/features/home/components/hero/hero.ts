import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.html',
})
export class Hero implements OnInit, OnDestroy {
  protected readonly heroBackgroundUrl = '/assets/hero_img_1.jpg';
  protected readonly heroTags = ['Bureaux', 'Copropriétés', 'Locaux professionnels', 'Collectivités'];
  protected readonly typedText: WritableSignal<string> = signal('');
  private readonly wordsToType = [
    'La pureté du cristal\net toute sa lumière',
    'Propreté au quotidien\npour vos locaux',
    'Des espaces éclatants\npour votre image',
  ];
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingTimeout: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.handleTyping();
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  private handleTyping(): void {
    const word = this.wordsToType[this.wordIndex];
    this.charIndex += this.isDeleting ? -1 : 1;
    this.typedText.set(word.substring(0, this.charIndex));

    let delay = this.isDeleting ? 38 : 70;
    if (!this.isDeleting && this.charIndex === word.length) {
      this.isDeleting = true;
      delay = 1800;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.wordsToType.length;
      delay = 420;
    }

    this.typingTimeout = setTimeout(() => this.handleTyping(), delay);
  }
}
