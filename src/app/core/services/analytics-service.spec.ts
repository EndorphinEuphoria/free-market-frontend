// analytics.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { AnalyticsService, ReservaResponse, DeliveryResponse, UserResponse } from './analytics-service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const mockReservas: ReservaResponse[] = [
    { idReserva: 1, reserveDate: '2025-01-01', totalPrice: 100, status: 'ACTIVA' },
    { idReserva: 2, reserveDate: '2025-01-02', totalPrice: 200, status: 'COMPLETADA' },
    { idReserva: 3, reserveDate: '2025-01-03', totalPrice: 50,  status: 'CANCELADA' },
  ];

  const mockDeliveries: DeliveryResponse[] = [
    { idDelivery: 1, status: 'PENDIENTE',  idReserva: 1, idUsuario: 10, deliveryBeginDate: '2025-01-01', deliveryEndDate: '2025-01-02', idRepartidor: null },
    { idDelivery: 2, status: 'EN_CAMINO',  idReserva: 2, idUsuario: 11, deliveryBeginDate: '2025-01-02', deliveryEndDate: '2025-01-03', idRepartidor: 5 },
    { idDelivery: 3, status: 'ENTREGADO',  idReserva: 3, idUsuario: 12, deliveryBeginDate: '2025-01-03', deliveryEndDate: '2025-01-04', idRepartidor: 6 },
    { idDelivery: 4, status: 'CANCELADO',  idReserva: 4, idUsuario: 13, deliveryBeginDate: '2025-01-04', deliveryEndDate: '2025-01-05', idRepartidor: null },
  ];

  const mockUsers: UserResponse[] = [
    { id: 1, firstname: 'Alice', lastname: 'Smith',  username: 'alice' },
    { id: 2, firstname: 'Bob',   lastname: 'Jones',  username: 'bob' },
  ];

  describe('getAllReservas', () => {
    it('should GET all reservas', () => {
      service.getAllReservas().subscribe((res: ReservaResponse[]) => {
        expect(res).toEqual(mockReservas);
        expect(res.length).toBe(3);
      });
      const req = httpMock.expectOne('http://localhost:8086/api-v1/reserve/getallreserve');
      expect(req.request.method).toBe('GET');
      req.flush(mockReservas);
    });

    it('should return all status variants', () => {
      service.getAllReservas().subscribe((res: ReservaResponse[]) => {
        const statuses = res.map(r => r.status);
        expect(statuses).toContain('ACTIVA');
        expect(statuses).toContain('COMPLETADA');
        expect(statuses).toContain('CANCELADA');
      });
      httpMock.expectOne('http://localhost:8086/api-v1/reserve/getallreserve').flush(mockReservas);
    });

    it('should return empty array when no reservas', () => {
      service.getAllReservas().subscribe((res: ReservaResponse[]) => expect(res).toEqual([]));
      httpMock.expectOne('http://localhost:8086/api-v1/reserve/getallreserve').flush([]);
    });

    it('should propagate HTTP errors', () => {
      service.getAllReservas().subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(500)
      });
      httpMock.expectOne('http://localhost:8086/api-v1/reserve/getallreserve')
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getAllDeliveries', () => {
    it('should GET all deliveries', () => {
      service.getAllDeliveries().subscribe((res: DeliveryResponse[]) => {
        expect(res).toEqual(mockDeliveries);
        expect(res.length).toBe(4);
      });
      const req = httpMock.expectOne('http://localhost:8086/api-v1/delivery/all');
      expect(req.request.method).toBe('GET');
      req.flush(mockDeliveries);
    });

    it('should return all status variants', () => {
      service.getAllDeliveries().subscribe((res: DeliveryResponse[]) => {
        const statuses = res.map(d => d.status);
        expect(statuses).toContain('PENDIENTE');
        expect(statuses).toContain('EN_CAMINO');
        expect(statuses).toContain('ENTREGADO');
        expect(statuses).toContain('CANCELADO');
      });
      httpMock.expectOne('http://localhost:8086/api-v1/delivery/all').flush(mockDeliveries);
    });

    it('should handle null idRepartidor', () => {
      service.getAllDeliveries().subscribe((res: DeliveryResponse[]) => {
        const sinRepartidor = res.filter(d => d.idRepartidor === null);
        expect(sinRepartidor.length).toBe(2);
      });
      httpMock.expectOne('http://localhost:8086/api-v1/delivery/all').flush(mockDeliveries);
    });

    it('should return empty array when no deliveries', () => {
      service.getAllDeliveries().subscribe((res: DeliveryResponse[]) => expect(res).toEqual([]));
      httpMock.expectOne('http://localhost:8086/api-v1/delivery/all').flush([]);
    });

    it('should propagate HTTP errors', () => {
      service.getAllDeliveries().subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(403)
      });
      httpMock.expectOne('http://localhost:8086/api-v1/delivery/all')
        .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getUsers', () => {
    it('should GET all users', () => {
      service.getUsers().subscribe((res: UserResponse[]) => {
        expect(res).toEqual(mockUsers);
        expect(res.length).toBe(2);
      });
      const req = httpMock.expectOne('http://localhost:8086/api-v1/auth/getall');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should return empty array when no users', () => {
      service.getUsers().subscribe((res: UserResponse[]) => expect(res).toEqual([]));
      httpMock.expectOne('http://localhost:8086/api-v1/auth/getall').flush([]);
    });

    it('should propagate HTTP errors', () => {
      service.getUsers().subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(401)
      });
      httpMock.expectOne('http://localhost:8086/api-v1/auth/getall')
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
});