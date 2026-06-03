// productos.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { ProductosService, ProductoResponse, ProductoRequest } from './productos-service';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpMock: HttpTestingController;

  const BASE = 'http://localhost:8086/api-v1/productos';

  const mockProducto: ProductoResponse = {
    id: 1, proovedorNombre: 'Proveedor A', name: 'Producto 1',
    url: 'http://img.com/1.jpg', price: 99.9, stock: 10, active: true
  };

  const mockRequest: ProductoRequest = {
    proovedorNombre: 'Proveedor A', name: 'Producto 1',
    url: 'http://img.com/1.jpg', price: 99.9, stock: 10
  };

  const mockList: ProductoResponse[] = [
    mockProducto,
    { id: 2, proovedorNombre: 'Proveedor B', name: 'Producto 2', url: 'http://img.com/2.jpg', price: 49.9, stock: 0, active: false }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProductosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getAll', () => {
    it('should GET all products', () => {
      service.getAll().subscribe((res: ProductoResponse[]) => {
        expect(res).toEqual(mockList);
        expect(res.length).toBe(2);
      });
      const req = httpMock.expectOne(`${BASE}/get`);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should return empty array when no products', () => {
      service.getAll().subscribe((res: ProductoResponse[]) => expect(res).toEqual([]));
      httpMock.expectOne(`${BASE}/get`).flush([]);
    });

    it('should propagate HTTP errors', () => {
      service.getAll().subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(500)
      });
      httpMock.expectOne(`${BASE}/get`)
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('create', () => {
    it('should POST and return created product', () => {
      service.create(mockRequest).subscribe((res: ProductoResponse) => {
        expect(res).toEqual(mockProducto);
        expect(res.id).toBe(1);
      });
      const req = httpMock.expectOne(`${BASE}/create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockProducto);
    });

    it('should propagate HTTP errors', () => {
      service.create(mockRequest).subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(400)
      });
      httpMock.expectOne(`${BASE}/create`)
        .flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should PATCH and return updated product', () => {
      const updated = { ...mockProducto, name: 'Producto Editado' };
      service.update(1, mockRequest).subscribe((res: ProductoResponse) => {
        expect(res).toEqual(updated);
      });
      const req = httpMock.expectOne(`${BASE}/update/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(updated);
    });

    it('should propagate HTTP errors', () => {
      service.update(99, mockRequest).subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(404)
      });
      httpMock.expectOne(`${BASE}/update/99`)
        .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('delete', () => {
    it('should DELETE product by id', () => {
      service.delete(1).subscribe((res: void) => expect(res).toBeNull());
      const req = httpMock.expectOne(`${BASE}/delete/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should propagate HTTP errors', () => {
      service.delete(99).subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(404)
      });
      httpMock.expectOne(`${BASE}/delete/99`)
        .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('activate', () => {
    it('should PATCH to activate product', () => {
      service.activate(1).subscribe(res => expect(res).toBeTruthy());
      const req = httpMock.expectOne(`${BASE}/activate/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({ ...mockProducto, active: true });
    });

    it('should propagate HTTP errors', () => {
      service.activate(99).subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(404)
      });
      httpMock.expectOne(`${BASE}/activate/99`)
        .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('products$', () => {

  it('should GET active products', () => {
    service.products$.subscribe((res: ProductoResponse[]) => {
      expect(res).toEqual([mockProducto]);
    });

    const req = httpMock.expectOne(`${BASE}/get/active`);
    expect(req.request.method).toBe('GET');
    req.flush([mockProducto]);
  });

  it('should return empty array on error', () => {
    service.products$.subscribe((res: ProductoResponse[]) => {
      expect(res).toEqual([]);
    });

    httpMock.expectOne(`${BASE}/get/active`)
      .flush('Error', {
        status: 500,
        statusText: 'Internal Server Error'
      });
  });

  it('should return empty array when no active products', () => {
    service.products$.subscribe((res: ProductoResponse[]) => {
      expect(res).toEqual([]);
    });

    httpMock.expectOne(`${BASE}/get/active`)
      .flush([]);
  });

});
});