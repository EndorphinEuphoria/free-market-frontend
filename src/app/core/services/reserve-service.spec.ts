import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ReserveService, ReservaDetalleResponse } from './reserve-service';

describe('ReserveService', () => {
  let service: ReserveService;
  let httpMock: HttpTestingController;

  const API = 'http://localhost:8086/api-v1/reserve';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReserveService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ReserveService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get reservations by user', () => {
    const mock: ReservaDetalleResponse[] = [
      {
        idReserva: 1,
        reserveDate: '2026-05-25',
        totalPrice: 20000,
        status: 'RESERVADO',
        products: [
          {
            idProduct: 1,
            productName: 'Producto 1',
            unitPrice: 10000,
            quantity: 2,
            subtotal: 20000,
          },
        ],
      },
    ];

    service.getByUser(10).subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/user/10`);

    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  it('should cancel reservation', () => {
    service.cancel(1, 10).subscribe((data) => {
      expect(data).toBeNull();
    });

    const req = httpMock.expectOne(`${API}/cancel`);

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      idReserve: 1,
      idUser: 10,
    });

    req.flush(null);
  });
});