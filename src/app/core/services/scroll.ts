import { Service, signal } from '@angular/core';

@Service()
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
