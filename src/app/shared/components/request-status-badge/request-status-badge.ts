import { Component, computed, input } from '@angular/core';
import { REQUEST_STATUS_LABELS, RequestStatus } from '../../models/service-request.model';

@Component({
  selector: 'app-request-status-badge',
  standalone: true,
  templateUrl: './request-status-badge.html',
})
export class RequestStatusBadge {
  readonly status = input.required<RequestStatus>();

  protected readonly label = computed(() => REQUEST_STATUS_LABELS[this.status()]);

  protected readonly classes = computed(() => {
    switch (this.status()) {
      case 'reçue':
        return 'border border-rheo-border bg-rheo-bg text-rheo-muted';
      case 'en traitement':
        return 'border border-rheo-accent/40 bg-rheo-accent/15 text-rheo-dark';
      case 'assignée':
        return 'border border-transparent bg-[#111711] text-white';
      case 'terminée':
        return 'border border-transparent bg-rheo-accent text-rheo-dark';
      case 'annulée':
        return 'border border-red-500/25 bg-red-500/10 text-red-700';
    }
  });
}
