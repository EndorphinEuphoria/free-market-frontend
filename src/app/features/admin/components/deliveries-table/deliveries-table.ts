// deliveries-table.ts
import { Component, inject, OnInit, signal ,computed} from '@angular/core';
import { AnalyticsService, DeliveryResponse } from '../../../../core/services/analityc-service';

@Component({
  selector: 'app-deliveries-table',
  standalone: true,
  templateUrl: './deliveries-table.html',
  styleUrl: './deliveries-table.css'
})
export class DeliveriesTableComponent implements OnInit {

  private analyticsService = inject(AnalyticsService);

  deliveries = signal<DeliveryResponse[]>([]);
  loading    = signal(true);
  error      = signal<string | null>(null);

  ngOnInit() {
    this.analyticsService.getAllDeliveries().subscribe({
      next: data => {
        this.deliveries.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar deliveries');
        this.loading.set(false);
      }
    });
  }

page        = signal(1);
pageSize    = signal(10);

pagedReservas = computed(() => {
  const start = (this.page() - 1) * this.pageSize();
  const end   = start + this.pageSize();
  return this.deliveries().slice(start, end);
});

totalPages = computed(() =>
  Math.ceil(this.deliveries().length / this.pageSize())
);

prevPage() {
  if (this.page() > 1) this.page.update(p => p - 1);
}

nextPage() {
  if (this.page() < this.totalPages()) this.page.update(p => p + 1);
}
}