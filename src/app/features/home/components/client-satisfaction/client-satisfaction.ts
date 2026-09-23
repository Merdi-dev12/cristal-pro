import { AfterViewInit, Component, ElementRef, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-client-satisfaction',
  standalone: true,
  templateUrl: './client-satisfaction.html',
})
export class ClientSatisfaction implements AfterViewInit {
  @ViewChild('sectionRoot') sectionRoot!: ElementRef<HTMLElement>;

  protected readonly visible = signal(false);

  ngAfterViewInit(): void {
    const root = this.sectionRoot.nativeElement;

    const sectionObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.visible.set(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    sectionObserver.observe(root);

    const counter = root.querySelector<HTMLElement>('.counter');
    if (counter) {
      const counterObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animateCounter(counter);
              obs.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );
      counterObserver.observe(counter);
    }
  }

  private animateCounter(el: HTMLElement): void {
    const target = parseInt(el.dataset['target'] ?? '0', 10);
    const duration = 1200;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(progress * target).toString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
