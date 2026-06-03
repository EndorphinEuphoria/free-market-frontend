import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe,LowerCasePipe } from '@angular/common';
import { AdminService, User } from '../../../../core/services/admin';
import { DeliveryResponse, DeliveryService,DeliveryReportResponse } from '../../../../core/services/delivery.service';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { ToastService } from '../../../../core/services/toast-service';
import { Toast } from '../../../shop/components/toast/toast';


export interface ReportViewModel {
  report: DeliveryReportResponse;
  delivery: DeliveryResponse | null;
  reporter: User | null;
  courier: User | null;
}

@Component({
  selector: 'app-reports-page',
  imports: [DatePipe, AdminNavbar,LowerCasePipe,Toast],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPage implements OnInit {
  private deliveryService = inject(DeliveryService);
  private adminService    = inject(AdminService);
  private toast = inject(ToastService);
  reports    = signal<DeliveryReportResponse[]>([]);
  deliveries = signal<DeliveryResponse[]>([]);
  users      = signal<User[]>([]);
  loading    = signal(true);
  filterStatus = signal('ALL');
  selectedReport = signal<ReportViewModel | null>(null);
  updatingId = signal<number | null>(null);
  adminNoteInput = signal('');

  viewModels = computed<ReportViewModel[]>(() =>
    this.reports().map(r => ({
      report:   r,
      delivery: this.deliveries().find(d => d.idDelivery === r.idDelivery) ?? null,
      reporter: this.users().find(u => u.id === r.idUsuario) ?? null,
      courier:  this.users().find(u => {
        const d = this.deliveries().find(d => d.idDelivery === r.idDelivery);
        return d?.idRepartidor != null && u.id === d.idRepartidor;
      }) ?? null,
    }))
  );


  filtered = computed(() => {
    const status = this.filterStatus();
    return status === 'ALL'
      ? this.viewModels()
      : this.viewModels().filter(vm => vm.report.status === status);
  });

  ngOnInit() {
    this.loadAll();
  }

loadAll() {
  this.loading.set(true);

  this.deliveryService.getAllReports().subscribe({
    next: reports => {
      this.reports.set(reports);
      this.loading.set(false);
    },
    error: () => this.loading.set(false)
  });

  this.deliveryService.getAllDeliveries().subscribe({
    next: d => this.deliveries.set(d)
  });

  this.adminService.getAllUsers().subscribe({
    next: u => this.users.set(u)
  });
}

  openDetail(vm: ReportViewModel) {
    this.adminNoteInput.set(vm.report.adminNote ?? '');
    this.selectedReport.set(vm);
  }

  closeDetail() {
    this.selectedReport.set(null);
  }

 updateStatus(idReport: number, status: string) {
  const note = this.adminNoteInput().trim();

  if ((status === 'RESUELTO' || status === 'CERRADO') && !note) {
    this.toast.error(`A resolution note is required to mark this ticket as "${this.statusLabel(status)}".`);
    return;
  }

  this.updatingId.set(idReport);
  this.deliveryService.updateReport(idReport, { status, adminNote: note }).subscribe({
    next: updated => {
      this.reports.update(list =>
        list.map(r => r.idReport === idReport ? { ...r, ...updated } : r)
      );
      this.updatingId.set(null);
      // Refresca el modal con los datos actualizados
      const vm = this.viewModels().find(v => v.report.idReport === idReport);
      if (vm) this.selectedReport.set(vm);
    },
    error: () => {
      this.toast.error('Failed to update report.');
      this.updatingId.set(null);
    }
  });
}


  reasonLabel(reason: string): string {
    const map: Record<string, string> = {
      NO_ENTREGADO:      'Not delivered',
      PAQUETE_DANADO:    'Damaged package',
      PRODUCTO_INCORRECTO: 'Wrong product',
      OTRO:              'Other',
    };
    return map[reason] ?? reason;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ABIERTO:     'Open',
      EN_REVISION: 'In review',
      RESUELTO:    'Resolved',
      CERRADO:     'Closed',
    };
    return map[status] ?? status;
  }
}