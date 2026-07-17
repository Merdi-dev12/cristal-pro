import { Component, ElementRef, HostListener, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.html',
})
export class Hero implements OnInit, OnDestroy {
  protected readonly heroTags = ['Maison', 'Appartement', 'Résidentiel'];
  protected readonly filterChips = ['Kinshasa', 'Maison', 'Résidentiel', 'Appartement'];
  protected readonly activeTag = signal(this.heroTags[0]);
  protected readonly heroBackgroundUrl = '/assets/hero_img_1.jpg';

  protected readonly searchTypes = ['Location', 'Achat / Vente', 'Investissement'];
  protected readonly budgets = ['Tous les budgets', 'Moins de 800 $ / mois', '800 $ à 2 000 $ / mois', 'Plus de 100 000 $'];
  protected readonly locations = ['Partout en RDC', 'Gombe, Kinshasa', 'Ngaliema, Kinshasa', 'Lubumbashi', 'Goma'];
  protected readonly rooms = ['Indifférent', '1 à 2 chambres', '3 chambres', '4 chambres ou plus'];

  protected readonly selectedType = signal(this.searchTypes[0]);
  protected readonly selectedBudget = signal(this.budgets[0]);
  protected readonly selectedLocation = signal(this.locations[0]);
  protected readonly selectedRooms = signal(this.rooms[0]);

  protected readonly isTypeOpen = signal(false);
  protected readonly isBudgetOpen = signal(false);
  protected readonly isLocationOpen = signal(false);
  protected readonly isRoomsOpen = signal(false);

  private readonly wordsToType = ['un bien vérifié.', 'un foyer sécurisé.', 'un investissement durable.'];
  protected readonly typedText: WritableSignal<string> = signal('');
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.handleTyping();
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
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
    this.toggleDropdown(event, this.isTypeOpen);
  }

  protected toggleBudgetDropdown(event: Event): void {
    this.toggleDropdown(event, this.isBudgetOpen);
  }

  protected toggleLocationDropdown(event: Event): void {
    this.toggleDropdown(event, this.isLocationOpen);
  }

  protected toggleRoomsDropdown(event: Event): void {
    this.toggleDropdown(event, this.isRoomsOpen);
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

  protected selectTag(tag: string): void {
    this.activeTag.set(tag);
  }

  private toggleDropdown(event: Event, target: WritableSignal<boolean>): void {
    event.stopPropagation();
    const state = target();
    this.closeAllDropdowns();
    target.set(!state);
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

    let typingSpeed = this.isDeleting ? 38 : 70;

    if (!this.isDeleting && this.charIndex === currentWord.length) {
      typingSpeed = 1800;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.wordsToType.length;
      typingSpeed = 420;
    }

    this.typingTimeout = setTimeout(() => this.handleTyping(), typingSpeed);
  }
}
