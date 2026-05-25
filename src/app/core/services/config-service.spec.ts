import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';

import { ConfigService, ConfigRequest, ConfigResponse } from './config-service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  const API = 'http://localhost:8086/api-v1/config';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get config by user id', () => {
    const mock: ConfigResponse = {
      id: 1,
      commerceName: 'FreeMarket',
      logoUrl: 'logo.png',
      favicomUrl: 'favicon.ico',
      principalFont: 'Roboto',
      primaryColor: '#000',
      secondaryColor: '#fff',
      updateDate: '2026-01-01',
    };

    service.getConfig(10).subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/get/10`);

    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  it('should create config', () => {
    const request: ConfigRequest = {
      idUser: 10,
      commerceName: 'FreeMarket',
      logoUrl: 'logo.png',
      favicomUrl: 'favicon.ico',
      principalFont: 'Roboto',
      primaryColor: '#000',
      secondaryColor: '#fff',
      updateAt: '2026-01-01',
    };

    const mock: ConfigResponse = {
      id: 1,
      commerceName: 'FreeMarket',
      logoUrl: 'logo.png',
      favicomUrl: 'favicon.ico',
      principalFont: 'Roboto',
      primaryColor: '#000',
      secondaryColor: '#fff',
      updateDate: '2026-01-01',
    };

    service.createConfig(request).subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/create`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush(mock);
  });

  it('should update config', () => {
    const request: ConfigRequest = {
      idUser: 10,
      commerceName: 'FreeMarket',
      logoUrl: 'logo.png',
      favicomUrl: 'favicon.ico',
      principalFont: 'Roboto',
      primaryColor: '#000',
      secondaryColor: '#fff',
      updateAt: '2026-01-01',
    };

    const mock: ConfigResponse = {
      id: 1,
      commerceName: 'Updated',
      logoUrl: 'logo.png',
      favicomUrl: 'favicon.ico',
      principalFont: 'Roboto',
      primaryColor: '#000',
      secondaryColor: '#fff',
      updateDate: '2026-01-02',
    };

    service.updateConfig(1, request).subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/update/1`);

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(request);

    req.flush(mock);
  });

  it('should get public config', () => {
    const mock: ConfigResponse = {
      id: 1,
      commerceName: 'Public',
      logoUrl: 'logo.png',
      favicomUrl: 'favicon.ico',
      principalFont: 'Roboto',
      primaryColor: '#000',
      secondaryColor: '#fff',
      updateDate: '2026-01-01',
    };

    service.getPublicConfig().subscribe((data) => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${API}/public`);

    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  it('should apply styles in browser environment', () => {
    const config: ConfigRequest = {
      idUser: 1,
      commerceName: 'FreeMarket',
      logoUrl: 'logo.png',
      favicomUrl: 'favicon.ico',
      principalFont: 'Roboto',
      primaryColor: '#111',
      secondaryColor: '#222',
      updateAt: '2026-01-01',
    };

    service.applyStyles(config);

    expect(service.commerceName()).toBe('FreeMarket');
    expect(service.logoUrl()).toBe('logo.png');
    expect(document.title).toBe('FreeMarket');
  });
});