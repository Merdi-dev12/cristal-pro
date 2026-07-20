import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiceRequestService } from '../../../../core/services/service-request.service';
import { RheodyceDataService } from '../../../../core/services/rheodyce-data.service';
import { RequestStatusBadge } from '../../../../shared/components/request-status-badge/request-status-badge';
import { SERVICE_TYPE_LABELS, ServiceRequest } from '../../../../shared/models/service-request.model';

@Component({
  selector: 'app-service-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RequestStatusBadge],
  templateUrl: './service-request-detail.html',
})
export class ServiceRequestDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ServiceRequestService);
  private readonly data = inject(RheodyceDataService);

  protected readonly request = signal<ServiceRequest | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly isCancelling = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    const found = await this.service.getRequest(id);
    if (!found) {
      this.notFound.set(true);
    } else {
      this.request.set(found);
    }
    this.isLoading.set(false);
  }

  protected serviceTypeLabel(request: ServiceRequest): string {
    return SERVICE_TYPE_LABELS[request.serviceType];
  }

  protected propertyTitle(propertyId: string): string | null {
    return this.data.properties.find((property) => property.id === propertyId)?.title ?? null;
  }

  protected canCancel(request: ServiceRequest): boolean {
    return this.service.canCancel(request);
  }

  protected async onCancel(): Promise<void> {
    const current = this.request();
    if (!current) return;

    const confirmed = window.confirm('Confirmez-vous l\'annulation de cette demande ?');
    if (!confirmed) return;

    this.isCancelling.set(true);
    try {
      await this.service.cancelRequest(current.id);
      this.request.set({ ...current, status: 'annulée' });
    } catch {
      window.alert('Impossible d\'annuler la demande pour le moment.');
    } finally {
      this.isCancelling.set(false);
    }
  }

  protected navigateBack(): void {
    this.router.navigate(['/mon-compte/demandes']);
  }
}
