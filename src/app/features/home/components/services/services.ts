import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CLEANING_SERVICE_FIXTURES } from './service-fixtures';
import type { CleaningService } from './cleaning-service';
import { ServicesShowcase } from './services-showcase';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [ServicesShowcase],
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  readonly services = input<readonly CleaningService[]>([]);
  readonly autoplayDelay = input(4500);

  protected readonly displayedServices = computed(() =>
    (this.services().length ? this.services() : CLEANING_SERVICE_FIXTURES).slice(0, 5),
  );
}
