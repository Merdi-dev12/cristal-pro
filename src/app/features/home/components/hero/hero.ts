import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { PropertySearchService } from '../../../../core/services/property-search.service';
import { PropertyCategory } from '../../../../shared/models/property.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.html',
})
export class Hero implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly propertySearch = inject(PropertySearchService);

  protected readonly heroTags = ['Maison', 'Appartement', 'Résidentiel', 'Immeuble'];
  protected readonly filterChips = ['Kinshasa', 'Gombe', 'Ngaliema', 'Limete'];
  protected readonly activeTag = signal(this.heroTags[0]);
  protected readonly heroBackgroundUrl = '/assets/hero_img_1.jpg';

  protected readonly searchTypes = ['Location', 'Achat / Vente', 'Investissement'];
  protected readonly budgets = [
    'Tous les budgets',
    'Moins de 800 $ / mois',
    '800 $ à 2 000 $ / mois',
    'Plus de 100 000 $',
  ];
  protected readonly locations = [
    'Kinshasa',
    'Bandalungwa, Kinshasa',
    'Barumbu, Kinshasa',
    'Bumbu, Kinshasa',
    'Gombe, Kinshasa',
    'Kalamu, Kinshasa',
    'Kasa-Vubu, Kinshasa',
    'Kimbanseke, Kinshasa',
    'Kinshasa (commune)',
    'Kintambo, Kinshasa',
    'Kisenso, Kinshasa',
    'Lemba, Kinshasa',
    'Limete, Kinshasa',
    'Lingwala, Kinshasa',
    'Makala, Kinshasa',
    'Maluku, Kinshasa',
    'Masina, Kinshasa',
    'Matete, Kinshasa',
    'Mont-Ngafula, Kinshasa',
    'Ndjili, Kinshasa',
    'Ngaba, Kinshasa',
    'Ngaliema, Kinshasa',
    'Ngiri-Ngiri, Kinshasa',
    'Nsele, Kinshasa',
    'Selembao, Kinshasa',
  ];
  protected readonly rooms = ['Indifférent', '1 à 2 chambres', '3 chambres', '4 chambres ou plus'];

  protected readonly selectedType = signal(this.searchTypes[0]);
  protected readonly selectedBudget = signal(this.budgets[0]);
  protected readonly selectedLocation = signal(this.locations[0]);
  protected readonly selectedRooms = signal(this.rooms[0]);

  protected readonly isTypeOpen = signal(false);
  protected readonly isBudgetOpen = signal(false);
  protected readonly isLocationOpen = signal(false);
  protected readonly isRoomsOpen = signal(false);

  private readonly wordsToType = [
    'un bien vérifié.',
    'un foyer sécurisé.',
    'un investissement durable.',
  ];
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

  protected selectQuickLocation(location: string): void {
    this.selectedLocation.set(location);
  }

  protected onSearch(): void {
    const filters = {
      ...this.propertySearch.defaultFilters,
      type:
        this.selectedType() === 'Location'
          ? ('location' as const)
          : this.selectedType() === 'Achat / Vente'
            ? ('vente' as const)
            : ('all' as const),
      category: this.categoryFromTag(this.activeTag()),
      location: this.selectedLocation() === 'Kinshasa' ? '' : this.selectedLocation(),
      budgetMax: this.budgetFromLabel(this.selectedBudget()),
      bedroomsMin: this.roomsFromLabel(this.selectedRooms()),
    };

    void this.router.navigate(['/annonces'], {
      queryParams: this.propertySearch.toQueryParams(filters),
    });
  }

  private toggleDropdown(event: Event, target: WritableSignal<boolean>): void {
    event.stopPropagation();
    const state = target();
    this.closeAllDropdowns();
    target.set(!state);
  }

  private categoryFromTag(tag: string): PropertyCategory | 'all' {
    if (tag === 'Maison') return 'maison';
    if (tag === 'Appartement') return 'appartement';
    if (tag === 'Résidentiel' || tag === 'RÃ©sidentiel') return 'residence';
    if (tag === 'Immeuble') return 'immeuble';
    return 'all';
  }

  private budgetFromLabel(label: string): number | null {
    if (label.includes('2 000') || label.includes('2 000')) return 2000;
    if (label.includes('800')) return 800;
    if (label.includes('100 000')) return 100000;
    return null;
  }

  private roomsFromLabel(label: string): number | null {
    if (label.includes('1')) return 1;
    if (label.includes('3')) return 3;
    if (label.includes('4')) return 4;
    return null;
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
