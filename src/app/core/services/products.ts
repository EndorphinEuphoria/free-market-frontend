import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoResponse } from '../../features/shop/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class Products {

  private readonly API_URL = 'http://localhost:8086/api-v1/productos';

  private readonly http = inject(HttpClient);

  getAllProducts(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.API_URL}/get`);
  }

}
/* TODO eliminar después, body para crear producto  
{ 
  "proovedorNombre": "Distribuidora Norte",
  "name": "Auriculares Bluetooth",
  "url": "https://cdn.freemarket.com/productos/auriculares.png",
  "price": 15990,
  "stock": 100
}
*/