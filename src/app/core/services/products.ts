import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { ProductoResponse } from '../../features/shop/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class Products {

  private readonly API_URL = 'http://localhost:8086/api-v1/productos';

  private readonly http = inject(HttpClient);

  getAllProducts() {
    return this.http.get<ProductoResponse[]>(
    'http://localhost:8086/api-v1/productos/get/active'
  ).pipe(
    catchError(err => {
      console.error(err);
      return of([]);
    })
  );
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