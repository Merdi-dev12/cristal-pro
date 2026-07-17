import { Service, signal } from '@angular/core';

@Service()
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
