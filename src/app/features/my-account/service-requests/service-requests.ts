import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import { RequestStatusBadge } from '../../../shared/components/request-status-badge/request-status-badge';
import { SERVICE_TYPE_LABELS, ServiceRequest } from '../../../shared/models/service-request.model';

type FilterKey = 'all' | 'pending' | 'done';

@Component({
  selector: 'app-service-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, RequestStatusBadge],
  templateUrl: './service-requests.html',
})
export class ServiceRequestsPage implements OnInit {
  protected readonly service = inject(ServiceRequestService);
  private readonly router = inject(Router);

  protected readonly filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En cours' },
    { key: 'done', label: 'Terminées' },
  ];

  protected readonly selectedFilter = signal<FilterKey>('all');

  protected readonly filteredRequests = computed(() => {
    const filter = this.selectedFilter();
    const requests = this.service.requests();

    if (filter === 'pending') {
      return requests.filter((request) => request.status !== 'terminée' && request.status !== 'annulée');
    }
    if (filter === 'done') {
      return requests.filter((request) => request.status === 'terminée');
    }
    return requests;
  });

  ngOnInit(): void {
    this.service.loadMyRequests();
  }

  protected serviceTypeLabel(request: ServiceRequest): string {
    return SERVICE_TYPE_LABELS[request.serviceType];
  }

  protected navigateToDetail(request: ServiceRequest): void {
    if (request.source !== 'service') return;
    this.router.navigate(['/mon-compte/demandes', request.id]);
  }
}
