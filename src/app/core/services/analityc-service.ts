// analytics.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReservaResponse {
  idReserva: number;
  reserveDate: string;
  totalPrice: number;
  status: 'ACTIVA' | 'CANCELADA' | 'COMPLETADA';
}

export interface DeliveryResponse {
  idDelivery: number;
  status: 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  idReserva: number;
  idUsuario: number;
  deliveryBeginDate: string;
  deliveryEndDate: string;
  idRepartidor: number | null; 

}

export interface UserResponse {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private readonly RESERVA_URL  = 'http://localhost:8086/api-v1/reserve';
  private readonly DELIVERY_URL = 'http://localhost:8086/api-v1/delivery';
  private readonly AUTH_URL = 'http://localhost:8086/api-v1/auth';
  private readonly http = inject(HttpClient);

  getAllReservas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.RESERVA_URL}/getallreserve`);
  }

  getAllDeliveries(): Observable<DeliveryResponse[]> {
    return this.http.get<DeliveryResponse[]>(`${this.DELIVERY_URL}/all`);
  }

  getUsers(): Observable<UserResponse[]> {
  return this.http.get<UserResponse[]>(`${this.AUTH_URL}/getall`);
}
}