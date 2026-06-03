import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeliveryResponse {
  idDelivery: number;
  status: string;
  idReserva: number;
  idUsuario: number;
  idRepartidor: number | null;
  deliveryBeginDate: string;
  idDeliveryDetails: number;
  deliveryEndDate: string;
}

export interface DeliveryReportResponse {
  idReport: number;
  idDelivery: number;
  idUsuario: number;
  reason: string;
  description: string;
  imageBase64?: string;
  status: string;         
  adminNote?:  string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReportRequest {
  reason: string;           
  description: string;
  imageBase64?: string;
}

export interface UserResponse {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  state: string;
  rol: string;
  idRol: number;
  genero: string;
}

export interface ProductoReservaResponse {
  idProduct: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ReservaDetalleResponse {
  idReserva: number;
  reserveDate: string;
  totalPrice: number;
  status: string;
  deliveryAddress: string;
  products: ProductoReservaResponse[];
}

export interface ToDeliveryRequest {
  idDeliveryDetails: number;
  idRepartidor: number;
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly http = inject(HttpClient);
  private readonly API  = 'http://localhost:8086/api-v1';

  getAllDeliveries(): Observable<DeliveryResponse[]> {
    return this.http.get<DeliveryResponse[]>(`${this.API}/delivery/all`);
  }

  getDeliveriesByRepartidor(idRepartidor: number): Observable<DeliveryResponse[]> {
    return this.http.get<DeliveryResponse[]>(`${this.API}/delivery/delivery/${idRepartidor}`);
  }

  getReservaById(idReserva: number): Observable<ReservaDetalleResponse> {
    return this.http.get<ReservaDetalleResponse>(`${this.API}/reserve/${idReserva}`);
  }

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API}/auth/getall`);
  }

  updateStatus(idReserva: number, status: string): Observable<DeliveryResponse> {
    return this.http.patch<DeliveryResponse>(
      `${this.API}/delivery/reserva/status/${idReserva}?status=${status}`, {}
    );
  }

  tomarDelivery(idDeliveryDetails: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/delivery/take`, { idDeliveryDetails });
  }

  getDeliveriesByStatus(status: string): Observable<DeliveryResponse[]> {
    return this.http.get<DeliveryResponse[]>(`${this.API}/delivery/status/${status}`);
  }

  getByUser(userId: number): Observable<DeliveryResponse[]> {
    return this.http.get<DeliveryResponse[]>(`${this.API}/delivery/usuario/${userId}`);
  }

  createReport(idDelivery: number, request: CreateReportRequest): Observable<DeliveryReportResponse> {
  return this.http.post<DeliveryReportResponse>(
    `${this.API}/delivery/reports/${idDelivery}`, request
  );
}

getMyReports(): Observable<DeliveryReportResponse[]> {
  return this.http.get<DeliveryReportResponse[]>(`${this.API}/delivery/reports/usuario`);
}

getAllReports(): Observable<DeliveryReportResponse[]> {
  return this.http.get<DeliveryReportResponse[]>(`${this.API}/delivery/reports/all`);
}

updateReport(idReport: number, body: { status: string; adminNote: string }): Observable<DeliveryReportResponse> {
  return this.http.patch<DeliveryReportResponse>(`${this.API}/delivery/reports/${idReport}`, body);
}
}