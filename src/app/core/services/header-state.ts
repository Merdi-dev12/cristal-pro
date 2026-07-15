import { Injectable, signal, HostListener } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderStateService {
  public readonly isScrolled = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll);
    }
  }

  private onScroll = () => {
    this.isScrolled.set(window.scrollY > 50);
  };
}