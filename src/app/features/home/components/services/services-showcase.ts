import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import type { CleaningService } from './cleaning-service';

@Component({
  selector: 'app-services-showcase',
  standalone: true,
  templateUrl: './services-showcase.html',
  styleUrl: './services-showcase.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesShowcase implements OnDestroy {
  readonly services = input<readonly CleaningService[]>([]);
  readonly autoplayDelay = input(4500);

  protected readonly activeIndex = signal(0);
  protected readonly paused = signal(false);
  protected readonly activeService = computed(
    () => this.services()[Math.min(this.activeIndex(), Math.max(this.services().length - 1, 0))] ?? null,
  );

  #timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    afterNextRender(() => {
      this.#timer = setInterval(() => {
        if (!this.paused()) this.nextService();
      }, this.autoplayDelay());
    });
  }

  ngOnDestroy(): void {
    if (this.#timer) clearInterval(this.#timer);
  }

  protected setPaused(paused: boolean): void {
    this.paused.set(paused);
  }

  protected selectService(index: number): void {
    if (index >= 0 && index < this.services().length) this.activeIndex.set(index);
  }

  protected nextService(): void {
    const count = this.services().length;
    if (count > 1) this.activeIndex.update((index) => (index + 1) % count);
  }

  protected previousService(): void {
    const count = this.services().length;
    if (count > 1) this.activeIndex.update((index) => (index - 1 + count) % count);
  }
}
