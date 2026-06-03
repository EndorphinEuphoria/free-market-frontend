import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReservaDetalleResponse, ReserveService } from '../../../../core/services/reserve-service';
import { Auth } from '../../../../core/services/auth';
import { ClpFormatPipe } from '../../../../core/pipes/clp-format-pipe';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../../core/services/toast-service';
import { Toast } from '../../components/toast/toast';
import { DeliveryResponse, DeliveryService } from '../../../../core/services/delivery.service';
import { ReportModal } from '../../components/report-modal/report-modal';

@Component({
  selector: 'app-orders-page',
  imports: [ClpFormatPipe, DatePipe, Toast, ReportModal],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css',
})
export class OrdersPage implements OnInit {
  private reserveService  = inject(ReserveService);
  private auth            = inject(Auth);
  private toast           = inject(ToastService);
  private deliveryService = inject(DeliveryService);

  deliveries        = signal<DeliveryResponse[]>([]);
  loadingDeliveries = signal(false);
  activeTab = signal<'orders' | 'deliveries' | 'reports'>('orders');
  reserves          = signal<ReservaDetalleResponse[]>([]);
  loading           = signal(true);
  error             = signal<string | null>(null);
  filterText        = signal('');
  cancelling        = signal<number | null>(null);
  expandedId        = signal<number | null>(null);
  myReports = signal<number[]>([]); 
  myReportsDetail = signal<any[]>([]);
  loadingReports  = signal(false);

  activeReport = signal<{ idReserva: number; idDelivery: number } | null>(null);

  filteredReserves = computed(() => {
    const text = this.filterText().toLowerCase();
    return this.reserves().filter(r =>
      text === '' ||
      r.idReserva.toString().includes(text) ||
      r.status.toLowerCase().includes(text)
    );
  });

 
ngOnInit() {
  this.loadReserves();
  this.loadDeliveries();
  this.loadMyReportsDetail();
}

loadMyReportsDetail() {
  this.loadingReports.set(true);
  this.deliveryService.getMyReports().subscribe({
    next: reports => {
      this.myReportsDetail.set(reports);
      this.myReports.set(reports.map((r: any) => r.idDelivery));
      this.loadingReports.set(false);
    },
    error: () => this.loadingReports.set(false)
  });
}

 

  loadReserves() {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;

    this.loading.set(true);
    this.error.set(null);

    this.reserveService.getByUser(userId).subscribe({
      next:  data => { this.reserves.set(data); this.loading.set(false); },
      error: ()   => {
        this.error.set('Failed to load orders');
        this.toast.error('Could not load your orders.');
        this.loading.set(false);
      }
    });
  }

  loadDeliveries() {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;

    this.loadingDeliveries.set(true);
    this.deliveryService.getByUser(userId).subscribe({
      next:  data => { this.deliveries.set(data); this.loadingDeliveries.set(false); },
      error: ()   => { this.loadingDeliveries.set(false); }
    });
  }

  toggleExpand(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  async cancelReserve(idReserva: number) {
    const confirmed = await this.toast.confirm('Cancel this order?');
    if (!confirmed) return;

    const userId = this.auth.currentUser()?.userId!;
    this.cancelling.set(idReserva);

    this.reserveService.cancel(idReserva, userId).subscribe({
      next: () => {
        this.reserves.update(list =>
          list.map(r => r.idReserva === idReserva ? { ...r, status: 'CANCELADO' as const } : r)
        );
        this.cancelling.set(null);
        this.toast.success('Order cancelled successfully.');
      },
      error: () => {
        this.toast.error('Failed to cancel order. Please try again.');
        this.cancelling.set(null);
      }
    });
  }

  openReportModal(idReserva: number) {
    const delivery = this.deliveries().find(d => d.idReserva === idReserva);
    if (!delivery) {
      this.toast.error('Delivery information not found.');
      return;
    }
    this.activeReport.set({ idReserva, idDelivery: delivery.idDelivery });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      RESERVADO: 'Confirmed',
      PENDIENTE: 'Pending',
      CANCELADO: 'Cancelled',
      COMPLETO:  'Completed',
    };
    return map[status] ?? status;
  }

  deliveryStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pending',
      EN_CAMINO: 'On the way',
      ENTREGADO: 'Delivered',
      CANCELADO: 'Cancelled',
    };
    return map[status] ?? status;
  }
  isReported(idReserva: number): boolean {
  const delivery = this.deliveries().find(d => d.idReserva === idReserva);
  if (!delivery) return false;
  return this.myReports().includes(delivery.idDelivery);
}

reportReasonLabel(reason: string): string {
  const map: Record<string, string> = {
    NO_ENTREGADO:        'Not delivered',
    PAQUETE_DANADO:      'Damaged package',
    PRODUCTO_INCORRECTO: 'Wrong product',
    OTRO:                'Other',
  };
  return map[reason] ?? reason;
}

reportStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ABIERTO:     'Open',
    EN_REVISION: 'In review',
    RESUELTO:    'Resolved',
    CERRADO:     'Closed',
  };
  return map[status] ?? status;
}
}