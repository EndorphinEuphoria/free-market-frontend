import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DeliveryResponse {
  idDelivery: number;
  status: 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  idReserva: number;
  idUsuario: number;
  deliveryBeginDate: string;
  deliveryEndDate: string;
}

@Component({
  selector: 'app-deliveries-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deliveries-table.html',
  styleUrl: './deliveries-table.css'
})
export class DeliveriesTableComponent implements OnInit {

  deliveries = signal<DeliveryResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  filterId = signal('');
  filterIdReserva = signal('');
  filterStatus = signal<'all' | 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO'>('all');

  filteredDeliveries = computed(() => {
    return this.deliveries().filter(d => {
      const matchId = this.filterId() === '' ||
        d.idDelivery.toString().includes(this.filterId());
      const matchReserva = this.filterIdReserva() === '' ||
        d.idReserva.toString().includes(this.filterIdReserva());
      const matchStatus = this.filterStatus() === 'all' ||
        d.status === this.filterStatus();
      return matchId && matchReserva && matchStatus;
    });
  });

  ngOnInit() {
    this.loadDeliveries();
  }

loadDeliveries() {
  this.loading.set(true);
  this.error.set(null);
  // TODO: conectar servicio
  this.loading.set(false);
}

  onFilterId(e: Event) {
    this.filterId.set((e.target as HTMLInputElement).value);
  }

  onFilterIdReserva(e: Event) {
    this.filterIdReserva.set((e.target as HTMLInputElement).value);
  }

  onFilterStatus(e: Event) {
    this.filterStatus.set((e.target as HTMLSelectElement).value as any);
  }
}


