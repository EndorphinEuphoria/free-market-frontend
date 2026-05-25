// productos.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoResponse {
  id: number;
  proovedorNombre: string;
  name: string;
  url: string;
  price: number;
  stock: number;
  active: boolean;
  
}

export interface ProductoRequest {
  proovedorNombre: string;
  name: string;
  url: string;
  price: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {

  private readonly API_URL = 'http://localhost:8086/api-v1/productos';
  private readonly http = inject(HttpClient);

  getAll(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.API_URL}/get`);
  }

  create(request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(`${this.API_URL}/create`, request);
  }

  update(id: number, request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.patch<ProductoResponse>(`${this.API_URL}/update/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/delete/${id}`);
  }

  activate(id: number) {
    return this.http.patch(`${this.API_URL}/activate/${id}`,{});
  }
}