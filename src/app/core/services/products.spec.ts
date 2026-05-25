import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { Products } from './products';
import { ProductoResponse } from '../../features/shop/models/product.model';

describe('Products service', () => {
  let service: Products;
  let httpMock: HttpTestingController;

  const API_URL = 'http://localhost:8086/api-v1/productos/get';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Products,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(Products);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all products', () => {
    const mockResponse: ProductoResponse[] = [
      {
        id: 1,
        name: 'Auriculares Bluetooth',
        price: 15990,
        stock: 10,
        url: 'img.png',
        proovedorNombre: 'Distribuidora Norte',
      } as any,
    ];

    service.getAllProducts().subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8086/api-v1/productos/get');

    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });
});