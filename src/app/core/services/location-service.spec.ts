import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { LocationService, LocationRequest, LocationResponse, LocationresponseForId } from './location-service';

describe('LocationService', () => {
  let service: LocationService;
  let httpMock: HttpTestingController;

  const API = 'http://localhost:8086/api-v1/location';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocationService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(LocationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get location by userId', () => {
    const mock: LocationresponseForId = {
      streetAddress: 'Av. Siempre Viva 123',
      comunaNombre: 'Santiago',
      regionNombre: 'Metropolitana',
    };

    service.getLocation(1).subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/getLocation/1`);

    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  it('should create location', () => {
    const request: LocationRequest = {
      street: 'Los Leones',
      streetNumber: '123',
      comuna: 'Providencia',
      region: 'Metropolitana',
    };

    const mockResponse: LocationResponse = {
      locationId: 1,
      userId: 10,
      street: 'Los Leones',
      streetAddress: 'Los Leones 123',
      latitude: -33.45,
      longitude: -70.66,
      comunaNombre: 'Providencia',
      regionNombre: 'Metropolitana',
    };

    service.createLocation(request).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API}/createLocation`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush(mockResponse);
  });

  it('should update location', () => {
    const request: LocationRequest = {
      street: 'Los Leones',
      streetNumber: '999',
      comuna: 'Providencia',
      region: 'Metropolitana',
    };

    const mockResponse: LocationResponse = {
      locationId: 1,
      userId: 10,
      street: 'Los Leones',
      streetAddress: 'Los Leones 999',
      latitude: -33.45,
      longitude: -70.66,
      comunaNombre: 'Providencia',
      regionNombre: 'Metropolitana',
    };

    service.updateLocation(request).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API}/updateLocation`);

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);

    req.flush(mockResponse);
  });
});