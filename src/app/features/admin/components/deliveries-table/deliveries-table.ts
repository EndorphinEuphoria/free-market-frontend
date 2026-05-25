import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AnalyticsService, DeliveryResponse, UserResponse } from '../../../../core/services/analytics-service';

@Component({
  selector: 'app-deliveries-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deliveries-table.html',
  styleUrl: './deliveries-table.css'
})
export class DeliveriesTableComponent implements OnInit {

  private analyticsService = inject(AnalyticsService);

  deliveries = signal<DeliveryResponse[]>([]);
  usuarios   = signal<Map<number, string>>(new Map());
  loading    = signal(true);
  error      = signal<string | null>(null);

  page      = signal(1);
  pageSize  = signal(10);

  pagedReservas = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.deliveries().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.ceil(this.deliveries().length / this.pageSize())
  );

  ngOnInit() {
    forkJoin({
      
      deliveries: this.analyticsService.getAllDeliveries(),
      users:      this.analyticsService.getUsers()
    }).subscribe({
      next: ({ deliveries, users }) => {
        this.deliveries.set(deliveries);
        const mapa = new Map<number, string>();
        users.forEach(u => mapa.set(u.id, `${u.firstname} ${u.lastname}`));
        this.usuarios.set(mapa);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error loading deliveries');
        this.loading.set(false);
      }
    });
  }

  getNombre(id: number | null): string {
    if (id === null) return '—';
    return this.usuarios().get(id) ?? `#${id}`;
  }

  prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }
  nextPage() { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'Pending',
      'EN_CAMINO': 'On the way',
      'ENTREGADO': 'Delivered',
      'CANCELADO': 'Cancelled',
      
    };
    return map[status] ?? status;
    
  }
}