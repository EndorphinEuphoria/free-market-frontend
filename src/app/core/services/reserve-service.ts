import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  status: 'RESERVADO' | 'PENDIENTE' | 'CANCELADO' | 'COMPLETO';
  products: ProductoReservaResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class ReserveService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:8086/api-v1/reserve';

  getByUser(userId: number): Observable<ReservaDetalleResponse[]> {
    return this.http.get<ReservaDetalleResponse[]>(`${this.API}/user/${userId}`);
  }

  cancel(idReserve: number, idUser: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/cancel`, { idReserve, idUser });
  }

}
