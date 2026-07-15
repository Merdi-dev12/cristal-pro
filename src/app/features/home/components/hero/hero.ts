import { Component, signal, OnInit, OnDestroy, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.html',
})
export class Hero implements OnInit, OnDestroy {
  protected readonly heroTags = ['Maisons', 'Appartements', 'Terrains'];
  protected readonly filterChips = ['Kinshasa', 'Lubumbashi', 'Goma', 'Kongo Central'];
  protected readonly activeTag = signal(this.heroTags[0]);
  protected readonly heroBackgroundUrl = 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80';

  private readonly wordsToType = [
    'un bien immobilier à la fois.',
    'un foyer sécurisé en RDC.',
    'un investissement d\'avenir.'
  ];
  protected readonly typedText: WritableSignal<string> = signal('');
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingTimeout: any;

  ngOnInit(): void {
    this.handleTyping();
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private handleTyping(): void {
    const currentWord = this.wordsToType[this.wordIndex];
    
    if (this.isDeleting) {
      this.typedText.set(currentWord.substring(0, this.charIndex - 1));
      this.charIndex--;
    } else {
      this.typedText.set(currentWord.substring(0, this.charIndex + 1));
      this.charIndex++;
    }

    let typingSpeed = this.isDeleting ? 40 : 80;

    if (!this.isDeleting && this.charIndex === currentWord.length) {
      typingSpeed = 2000; // Pause à la fin du mot écrit
      this.isDeleting = true;
    } 
    else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.wordsToType.length;
      typingSpeed = 500; 
    }

    this.typingTimeout = setTimeout(() => this.handleTyping(), typingSpeed);
  }

  protected selectTag(tag: string): void {
    this.activeTag.set(tag);
  }
}