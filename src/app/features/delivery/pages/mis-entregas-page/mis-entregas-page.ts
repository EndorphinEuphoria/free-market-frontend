import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DeliveryNavbar } from '../../components/delivery-navbar/delivery-navbar';
import { Auth } from '../../../../core/services/auth';
import { DeliveryService, DeliveryResponse } from '../../../../core/services/delivery.service';

@Component({
  selector: 'app-mis-entregas-page',
  standalone: true,
  imports: [CommonModule, DeliveryNavbar],
  templateUrl: './mis-entregas-page.html',
  styleUrl: './mis-entregas-page.css'
})
export class MisEntregasPage implements OnInit {
  private deliveryService = inject(DeliveryService);
  readonly auth           = inject(Auth);
  private router          = inject(Router);

  entregas    = signal<DeliveryResponse[]>([]);
  usuarios    = signal<Map<number, string>>(new Map());
  loading     = signal(true);
  error       = signal<string | null>(null);
  successMsg  = signal<string | null>(null);
  updatingId  = signal<number | null>(null);

  totalEntregas = computed(() => this.entregas().length);
  entregadas    = computed(() => this.entregas().filter(e => e.status === 'ENTREGADO').length);
  enCamino      = computed(() => this.entregas().filter(e => e.status === 'EN_CAMINO').length);

  ngOnInit() {
    this.auth.restoreSession();
    const idRepartidor = this.auth.currentUser()?.userId;
    if (!idRepartidor) { this.router.navigate(['/delivery']); return; }
    this.loadEntregas(idRepartidor);
  }

  loadEntregas(idRepartidor: number) {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      entregas: this.deliveryService.getDeliveriesByRepartidor(idRepartidor),
      users:    this.deliveryService.getUsers()
    }).subscribe({
      next: ({ entregas, users }) => {
        this.entregas.set(entregas);
        const mapa = new Map<number, string>();
        users.forEach(u => mapa.set(u.id, `${u.firstname} ${u.lastname}`));
        this.usuarios.set(mapa);
        this.loading.set(false);
      },
      error: () => { this.error.set('Error al cargar tus entregas'); this.loading.set(false); }
    });
  }

  getNombreCliente(idUsuario: number): string {
    return this.usuarios().get(idUsuario) ?? `Cliente #${idUsuario}`;
  }

  marcarEntregado(entrega: DeliveryResponse) {
    if (entrega.status === 'ENTREGADO' || entrega.status === 'CANCELADO') return;
    this.updatingId.set(entrega.idDelivery);
    this.error.set(null);

    this.deliveryService.updateStatus(entrega.idReserva, 'ENTREGADO').subscribe({
      next: (updated) => {
        this.entregas.update(list =>
          list.map(e => e.idDelivery === updated.idDelivery
            ? { ...updated, deliveryEndDate: new Date().toISOString().split('T')[0] }
            : e
          )
        );
        this.updatingId.set(null);
        this.successMsg.set('¡Entrega marcada como completada!');
        setTimeout(() => this.successMsg.set(null), 3000);
      },
      error: () => {
        this.error.set('Error al actualizar el estado');
        this.updatingId.set(null);
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'badge--pendiente',
      'EN_CAMINO': 'badge--en-camino',
      'ENTREGADO': 'badge--entregado',
      'CANCELADO': 'badge--cancelado',
    };
    return map[status] ?? '';
  }

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