// reserva-table.ts
import { Component, inject, OnInit, signal,computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AnalyticsService, ReservaResponse } from '../../../../core/services/analityc-service';

@Component({
  selector: 'app-reserva-table',
  standalone: true,
  imports:[DecimalPipe],
  templateUrl: './reserva-table.html',
  styleUrl: './reserva-table.css'
})
export class ReservaTableComponent implements OnInit {

  private analyticsService = inject(AnalyticsService);

  reservas  = signal<ReservaResponse[]>([]);
  loading   = signal(true);
  error     = signal<string | null>(null);

  ngOnInit() {
    this.analyticsService.getAllReservas().subscribe({
      next: data => {
        this.reservas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar reservas');
        this.loading.set(false);
      }
    });
  }

page        = signal(1);
pageSize    = signal(10);

pagedReservas = computed(() => {
  const start = (this.page() - 1) * this.pageSize();
  const end   = start + this.pageSize();
  return this.reservas().slice(start, end);
});

totalPages = computed(() =>
  Math.ceil(this.reservas().length / this.pageSize())
);

prevPage() {
  if (this.page() > 1) this.page.update(p => p - 1);
}

nextPage() {
  if (this.page() < this.totalPages()) this.page.update(p => p + 1);
}
}