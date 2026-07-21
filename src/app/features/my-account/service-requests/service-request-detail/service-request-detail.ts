import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiceRequestService } from '../../../../core/services/service-request.service';
import { RheodyceDataService } from '../../../../core/services/rheodyce-data.service';
import { RequestStatusBadge } from '../../../../shared/components/request-status-badge/request-status-badge';
import {
  SERVICE_DETAIL_LABELS,
  SERVICE_TYPE_LABELS,
  ServiceRequest,
  ServiceRequestDocument,
  ServiceRequestEvent,
} from '../../../../shared/models/service-request.model';

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
  protected readonly events = signal<ServiceRequestEvent[]>([]);
  protected readonly openingDocument = signal<string | null>(null);
  protected readonly wasCreated = signal(this.route.snapshot.queryParamMap.get('created') === '1');

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    const [found, events] = await Promise.all([
      this.service.getRequest(id),
      this.service.getRequestEvents(id).catch(() => []),
    ]);
    if (!found) {
      this.notFound.set(true);
    } else {
      this.request.set(found);
      this.events.set(events);
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

  protected detailRows(request: ServiceRequest): Array<{ label: string; value: string }> {
    return Object.entries(request.details)
      .filter(([, value]) => value !== null && value !== '')
      .map(([key, value]) => ({
        label: SERVICE_DETAIL_LABELS[key] ?? key,
        value: typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value),
      }));
  }

  protected async openDocument(document: ServiceRequestDocument): Promise<void> {
    this.openingDocument.set(document.path);
    try {
      const url = await this.service.getDocumentUrl(document);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.alert('Impossible d’ouvrir ce document pour le moment.');
    } finally {
      this.openingDocument.set(null);
    }
  }

  protected async onCancel(): Promise<void> {
    const current = this.request();
    if (!current) return;

    const confirmed = window.confirm("Confirmez-vous l'annulation de cette demande ?");
    if (!confirmed) return;

    this.isCancelling.set(true);
    try {
      await this.service.cancelRequest(current.id);
      this.request.set({ ...current, status: 'annulée' });
      this.events.set(await this.service.getRequestEvents(current.id));
    } catch {
      window.alert("Impossible d'annuler la demande pour le moment.");
    } finally {
      this.isCancelling.set(false);
    }
  }

  protected navigateBack(): void {
    this.router.navigate(['/mon-compte/demandes']);
  }
}
