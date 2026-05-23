import { Component, inject, OnInit, signal, AfterViewChecked, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DeliveryNavbar } from '../../components/delivery-navbar/delivery-navbar';
import { Auth } from '../../../../core/services/auth';
import {
  DeliveryService, DeliveryResponse,
  ReservaDetalleResponse, LocationResponseForId
} from '../../../../core/services/delivery.service';

@Component({
  selector: 'app-delivery-dashboard-page',
  standalone: true,
  imports: [CommonModule, DeliveryNavbar],
  templateUrl: './delivery-dashboard-page.html',
  styleUrl: './delivery-dashboard-page.css'
})
export class DeliveryDashboardPage implements OnInit, AfterViewChecked {

  private deliveryService = inject(DeliveryService);
  private auth            = inject(Auth);
  private router          = inject(Router);
  private zone            = inject(NgZone);

  deliveries = signal<DeliveryResponse[]>([]);
  usuarios   = signal<Map<number, string>>(new Map());
  loading    = signal(true);
  error      = signal<string | null>(null);

  // Modal
  modalDelivery   = signal<DeliveryResponse | null>(null);
  modalReserva    = signal<ReservaDetalleResponse | null>(null);
  modalLocation   = signal<LocationResponseForId | null>(null);
  loadingReserva  = signal(false);
  loadingLocation = signal(false);
  tomandoPedido   = signal(false);
  modalError      = signal<string | null>(null);

  // Mapa
  mapLoading  = signal(false);
  mapError    = signal(false);
  mapExpanded = signal(false);

  private map:       any = null;
  private mapCoords: [number, number] | null = null;
  private pendingMap = false;

  ngOnInit() { this.loadPendientes(); }

  ngAfterViewChecked() {
    if (this.pendingMap && this.mapCoords) {
      const el = document.getElementById('leaflet-map');
      if (el && !this.map) {
        this.pendingMap = false;
        this.initMap(this.mapCoords);
      }
    }
  }

  loadPendientes() {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      deliveries: this.deliveryService.getDeliveriesByStatus('PENDIENTE'),
      users:      this.deliveryService.getUsers()
    }).subscribe({
      next: ({ deliveries, users }) => {
        this.deliveries.set(deliveries);
        const mapa = new Map<number, string>();
        users.forEach(u => mapa.set(u.id, `${u.firstname} ${u.lastname}`));
        this.usuarios.set(mapa);
        this.loading.set(false);
      },
      error: () => { this.error.set('Error al cargar pedidos'); this.loading.set(false); }
    });
  }

  getNombreCliente(idUsuario: number): string {
    return this.usuarios().get(idUsuario) ?? `Cliente #${idUsuario}`;
  }

  abrirModal(delivery: DeliveryResponse) {
    this.cerrarModal();
    this.modalDelivery.set(delivery);
    this.modalError.set(null);
    this.mapError.set(false);
    this.mapExpanded.set(false);
    this.loadingReserva.set(true);
    this.loadingLocation.set(true);
    this.mapLoading.set(true);

    this.deliveryService.getReservaById(delivery.idReserva).subscribe({
      next:  (r) => { this.modalReserva.set(r); this.loadingReserva.set(false); },
      error: ()  => { this.modalError.set('Error al cargar reserva'); this.loadingReserva.set(false); }
    });

    this.deliveryService.getLocationByUserId(delivery.idUsuario).subscribe({
      next: (loc) => {
        this.modalLocation.set(loc);
        this.loadingLocation.set(false);
        this.geocodeAndInitMap(loc.streetAddress);
      },
      error: () => {
        this.loadingLocation.set(false);
        this.mapLoading.set(false);
        this.mapError.set(true);
      }
    });
  }

  private geocodeAndInitMap(address: string) {
    const query = encodeURIComponent(`${address}, Chile`);
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
      .then(r => r.json())
      .then((results: any[]) => {
        if (!results.length) {
          this.zone.run(() => { this.mapLoading.set(false); this.mapError.set(true); });
          return;
        }
        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);
        this.zone.run(() => {
          this.mapCoords  = [lat, lon];
          this.mapLoading.set(false);
          this.pendingMap = true;
        });
      })
      .catch(() => this.zone.run(() => { this.mapLoading.set(false); this.mapError.set(true); }));
  }

  private async initMap(coords: [number, number]) {
    const L = await import('leaflet');

    this.map = L.map('leaflet-map', {
      zoomControl: true,
      dragging: !this.mapExpanded()
    }).setView(coords, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl:    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize:   [25, 41],
      iconAnchor: [12, 41]
    });

    L.marker(coords, { icon })
      .addTo(this.map)
      .bindPopup(this.modalLocation()?.streetAddress ?? '')
      .openPopup();
  }

  toggleMap() {
    this.mapExpanded.update(v => !v);
    if (this.map) {
      this.mapExpanded() ? this.map.dragging.enable() : this.map.dragging.disable();
    }
    setTimeout(() => this.map?.invalidateSize(), 350);
  }

  cerrarModal() {
    if (this.map) { this.map.remove(); this.map = null; }
    this.mapCoords  = null;
    this.pendingMap = false;
    this.mapExpanded.set(false);
    this.modalDelivery.set(null);
    this.modalReserva.set(null);
    this.modalLocation.set(null);
    this.modalError.set(null);
    this.tomandoPedido.set(false);
  }

  tomarPedido() {
    const d = this.modalDelivery();
    if (!d) return;
    this.tomandoPedido.set(true);
    this.modalError.set(null);
    this.deliveryService.tomarDelivery(d.idDeliveryDetails).subscribe({
      next:  () => { this.router.navigate(['/delivery/entregas']); },
      error: () => { this.modalError.set('Error al tomar el pedido'); this.tomandoPedido.set(false); }
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