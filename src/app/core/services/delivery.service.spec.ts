import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { DeliveryService, DeliveryResponse, ReservaDetalleResponse, LocationResponseForId, UserResponse } from './delivery.service';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let httpMock: HttpTestingController;

  const API = 'http://localhost:8086/api-v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeliveryService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all deliveries', () => {
    const mock: DeliveryResponse[] = [];

    service.getAllDeliveries().subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/delivery/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should get deliveries by repartidor', () => {
    service.getDeliveriesByRepartidor(1).subscribe();

    const req = httpMock.expectOne(`${API}/delivery/delivery/1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get reserva by id', () => {
    const mock: ReservaDetalleResponse = {
      idReserva: 1,
      reserveDate: '2026-01-01',
      totalPrice: 1000,
      status: 'PENDIENTE',
      products: [],
    };

    service.getReservaById(1).subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/reserve/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should get location by user id', () => {
    const mock: LocationResponseForId = {
      streetAddress: 'Av. Siempre Viva 123',
      comunaNombre: 'Santiago',
      regionNombre: 'RM',
    };

    service.getLocationByUserId(1).subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/location/getLocation/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should get users', () => {
    const mock: UserResponse[] = [];

    service.getUsers().subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/auth/getall`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should update status', () => {
    const mock: DeliveryResponse = {
      idDelivery: 1,
      status: 'ENTREGADO',
      idReserva: 1,
      idUsuario: 1,
      idRepartidor: null,
      deliveryBeginDate: '',
      idDeliveryDetails: 1,
      deliveryEndDate: '',
    };

    service.updateStatus(1, 'ENTREGADO').subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(
      `${API}/delivery/reserva/status/1?status=ENTREGADO`
    );

    expect(req.request.method).toBe('PATCH');
    req.flush(mock);
  });

  it('should take delivery', () => {
    service.tomarDelivery(5).subscribe();

    const req = httpMock.expectOne(`${API}/delivery/take`);

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ idDeliveryDetails: 5 });

    req.flush(null);
  });

  it('should get deliveries by status', () => {
    service.getDeliveriesByStatus('PENDIENTE').subscribe();

    const req = httpMock.expectOne(`${API}/delivery/status/PENDIENTE`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get coordinates', () => {
    const mock = { latitude: -33.45, longitude: -70.66 };

    service.getCoordinates(1).subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/location/coordinates/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should get deliveries by user', () => {
    service.getByUser(1).subscribe();

    const req = httpMock.expectOne(`${API}/delivery/usuario/1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});