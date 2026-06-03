import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Cart } from './cart';
import { CartState } from '../../features/shop/models/cart.model';

describe('Cart service', () => {
  let service: Cart;
  let httpMock: HttpTestingController;
  const STORAGE_KEY = 'cart';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        Cart,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service  = TestBed.inject(Cart);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open and close cart', () => {
    service.openCart();
    expect(service.isOpen()).toBe(true);
    service.closeCart();
    expect(service.isOpen()).toBe(false);
  });

  it('should add item to cart', () => {
    service.addItem({ id: 1, name: 'Producto 1', price: 100, url: 'img.png' ,stock:10});
    const items = service.items();
    expect(items.length).toBe(1);
    expect(items[0].idProduct).toBe(1);
    expect(items[0].quantity).toBe(1);
  });

  it('should increase quantity if item already exists', () => {
    service.addItem({ id: 1, name: 'Producto 1', price: 100, url: 'img.png',stock:10 });
    service.addItem({ id: 1, name: 'Producto 1', price: 100, url: 'img.png',stock:10});
    const items = service.items();
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(2);
  });

  it('should remove item', () => {
    service.addItem({ id: 1, name: 'Producto 1', price: 100, url: 'img.png',stock:10});
    service.removeItem(1);
    expect(service.items().length).toBe(0);
  });

  it('should update quantity', () => {
    service.addItem({ id: 1, name: 'Producto 1', price: 100, url: 'img.png',stock:10});
    service.updateQuantity(1, 5);
    expect(service.items()[0].quantity).toBe(5);
  });

  it('should remove item when quantity <= 0', () => {
    service.addItem({ id: 1, name: 'Producto 1', price: 100, url: 'img.png',stock:10});
    service.updateQuantity(1, 0);
    expect(service.items().length).toBe(0);
  });

  it('should calculate totals', () => {
    service.addItem({ id: 1, name: 'A', price: 100, url: 'a',stock:10 });
    service.addItem({ id: 2, name: 'B', price: 200, url: 'b' ,stock:10});
    service.updateQuantity(1, 2);
    service.updateQuantity(2, 1);
    expect(service.totalItems()).toBe(3);
    expect(service.totalPrice()).toBe(400);
  });

  it('should persist state in localStorage', () => {
    service.addItem({ id: 1, name: 'Producto 1', price: 100, url: 'img.png',stock:10});
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed: CartState = JSON.parse(raw!);
    expect(parsed.items.length).toBe(1);
  });

  it('should perform checkout request', () => {
    localStorage.setItem(
      'token',
      btoa(JSON.stringify({ header: {}, userId: 10 })) +
      '.' +
      btoa(JSON.stringify({ userId: 10 })) +
      '.signature'
    );
    service.addItem({ id: 1, name: 'Producto 1', price: 100, url: 'img.png',stock:10});
    service.checkout().subscribe();

    const req = httpMock.expectOne('http://localhost:8086/api-v1/reserve/createReserve');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('X-User-Id')).toBe('10');
    expect(req.request.headers.has('Idempotency-Key')).toBe(true);
    expect(req.request.body).toEqual({
      idUser:          10,
      deliveryAddress: '',
      products:        [{ idProduct: 1, quantity: 1 }],
    });
    req.flush({});
  });
});