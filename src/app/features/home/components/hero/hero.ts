import { Component, signal, OnInit, OnDestroy, WritableSignal, HostListener, ElementRef } from '@angular/core';

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

  // --- Choix possibles dans les dropdowns ---
  protected readonly searchTypes = ['Une Location', 'Un Achat / Vente'];
  protected readonly budgets = ['Tous les budgets', 'Moins de 500 $ / mois', '500 $ — 1 500 $ / mois', 'Plus de 100 000 $ (Achat)'];
  protected readonly locations = ['Partout en RDC', 'Gombe (Kinshasa)', 'Ngaliema (Kinshasa)', 'Lubumbashi', 'Goma'];
  protected readonly rooms = ['Indifférent', '1 à 2 chambres', '3 chambres', '4 chambres ou plus'];

  // --- Signaux des valeurs sélectionnées ---
  protected readonly selectedType = signal(this.searchTypes[0]);
  protected readonly selectedBudget = signal(this.budgets[0]);
  protected readonly selectedLocation = signal(this.locations[0]);
  protected readonly selectedRooms = signal(this.rooms[0]);

  // --- Signaux d'état d'ouverture des Dropdowns ---
  protected readonly isTypeOpen = signal(false);
  protected readonly isBudgetOpen = signal(false);
  protected readonly isLocationOpen = signal(false);
  protected readonly isRoomsOpen = signal(false);

  // --- Configuration de l'effet d'écriture ---
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

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.handleTyping();
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  // Fermeture automatique des dropdowns si clic en dehors
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    }
  }

  protected closeAllDropdowns(): void {
    this.isTypeOpen.set(false);
    this.isBudgetOpen.set(false);
    this.isLocationOpen.set(false);
    this.isRoomsOpen.set(false);
  }

  protected toggleTypeDropdown(event: Event): void {
    event.stopPropagation();
    const state = this.isTypeOpen();
    this.closeAllDropdowns();
    this.isTypeOpen.set(!state);
  }

  protected toggleBudgetDropdown(event: Event): void {
    event.stopPropagation();
    const state = this.isBudgetOpen();
    this.closeAllDropdowns();
    this.isBudgetOpen.set(!state);
  }

  protected toggleLocationDropdown(event: Event): void {
    event.stopPropagation();
    const state = this.isLocationOpen();
    this.closeAllDropdowns();
    this.isLocationOpen.set(!state);
  }

  protected toggleRoomsDropdown(event: Event): void {
    event.stopPropagation();
    const state = this.isRoomsOpen();
    this.closeAllDropdowns();
    this.isRoomsOpen.set(!state);
  }

  protected selectType(value: string): void {
    this.selectedType.set(value);
    this.isTypeOpen.set(false);
  }

  protected selectBudget(value: string): void {
    this.selectedBudget.set(value);
    this.isBudgetOpen.set(false);
  }

  protected selectLocation(value: string): void {
    this.selectedLocation.set(value);
    this.isLocationOpen.set(false);
  }

  protected selectRooms(value: string): void {
    this.selectedRooms.set(value);
    this.isRoomsOpen.set(false);
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
      typingSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
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