import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Scroll {
  public readonly isScrolled = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 40);
      });
    }
  }
}