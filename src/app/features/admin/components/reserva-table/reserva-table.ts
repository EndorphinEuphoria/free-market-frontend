import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ReservaResponse {
  idReserva: number;
  reserveDate: string;
  totalPrice: number;
  status: 'ACTIVA' | 'CANCELADA' | 'COMPLETADA';
}

@Component({
  selector: 'app-reserva-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reserva-table.html',
  styleUrl: './reserva-table.css'
})
export class ReservaTableComponent implements OnInit {

  reservas = signal<ReservaResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  filterId = signal('');
  filterStatus = signal<'all' | 'ACTIVA' | 'CANCELADA' | 'COMPLETADA'>('all');

  filteredReservas = computed(() => {
    return this.reservas().filter(r => {
      const matchId = this.filterId() === '' ||
        r.idReserva.toString().includes(this.filterId());
      const matchStatus = this.filterStatus() === 'all' ||
        r.status === this.filterStatus();
      return matchId && matchStatus;
    });
  });

  ngOnInit() {
    this.loadReservas();
  }
  
loadReservas() {
  this.loading.set(true);
  this.error.set(null);
  // TODO: conectar servicio
  this.loading.set(false);
}

  onFilterId(e: Event) {
    this.filterId.set((e.target as HTMLInputElement).value);
  }

  onFilterStatus(e: Event) {
    this.filterStatus.set((e.target as HTMLSelectElement).value as any);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  }
}