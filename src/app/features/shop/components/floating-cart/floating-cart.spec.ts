import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, afterEach } from 'vitest';

import { FloatingCart } from './floating-cart';
import { Cart } from '../../../../core/services/cart';
import { Auth } from '../../../../core/services/auth';
import { LocationService, LocationResponseForId } from '../../../../core/services/location-service';
import { ClpFormatPipe } from '../../../../core/pipes/clp-format-pipe';

const makeLocation = (overrides: Partial<LocationResponseForId> = {}): LocationResponseForId => ({
  addressType:   'HOME',
  streetAddress: 'Av. Siempre Viva 123',
  comunaNombre:  'Santiago',
  regionNombre:  'Metropolitana',
  active:        true,
  ...overrides,
});

describe('FloatingCart', () => {
  let fixture: ComponentFixture<FloatingCart>;
  let component: FloatingCart;

  let cartServiceMock: {
    checkout:         ReturnType<typeof vi.fn>;
    clearCart:        ReturnType<typeof vi.fn>;
    closeCart:        ReturnType<typeof vi.fn>;
    isOpen:           ReturnType<typeof vi.fn>;
    totalItems:       ReturnType<typeof vi.fn>;
    totalPrice:       ReturnType<typeof vi.fn>;
    items:            ReturnType<typeof vi.fn>;
    removeItem:       ReturnType<typeof vi.fn>;
    updateQuantity:   ReturnType<typeof vi.fn>;
    setActiveAddress: ReturnType<typeof vi.fn>;
  };
  let authMock: {
    currentUser: ReturnType<typeof vi.fn>;
    isLoggedIn:  ReturnType<typeof vi.fn>;
  };
  let locationServiceMock: {
    getAllLocations:    ReturnType<typeof vi.fn>;
    setActiveLocation: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  let currentUserSignal: ReturnType<typeof signal<{ userId: string } | null>>;

  beforeEach(async () => {
    currentUserSignal = signal<{ userId: string } | null>(null);

    cartServiceMock = {
      checkout:         vi.fn().mockReturnValue(of({})),
      clearCart:        vi.fn(),
      closeCart:        vi.fn(),
      isOpen:           vi.fn().mockReturnValue(false),
      totalItems:       vi.fn().mockReturnValue(0),
      totalPrice:       vi.fn().mockReturnValue(0),
      items:            vi.fn().mockReturnValue([]),
      removeItem:       vi.fn(),
      updateQuantity:   vi.fn(),
      setActiveAddress: vi.fn(),
    };

    authMock = {
      currentUser: vi.fn().mockImplementation(() => currentUserSignal()),
      isLoggedIn:  vi.fn().mockReturnValue(false),
    };

    locationServiceMock = {
      getAllLocations:    vi.fn().mockReturnValue(of([])),
      setActiveLocation: vi.fn().mockReturnValue(of({})),
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [FloatingCart, ClpFormatPipe],
      providers: [
        { provide: Cart,            useValue: cartServiceMock },
        { provide: Auth,            useValue: authMock },
        { provide: LocationService, useValue: locationServiceMock },
        { provide: Router,          useValue: routerMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(FloatingCart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Creación ─────────────────────────────────────────────────────────────

  describe('creación', () => {
    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar reservaExitosa en false', () => {
      expect(component.reservaExitosa()).toBe(false);
    });

    it('debe inicializar hasLocation en false', () => {
      expect(component.hasLocation()).toBe(false);
    });
  });

  // ─── effect de ubicación ──────────────────────────────────────────────────

  describe('effect de ubicación', () => {
    it('debe llamar a getAllLocations cuando hay un usuario autenticado', () => {
      currentUserSignal.set({ userId: 'user-123' });
      fixture.detectChanges();

      expect(locationServiceMock.getAllLocations).toHaveBeenCalledWith('user-123');
    });

    it('debe setear hasLocation en true cuando getAllLocations devuelve ubicaciones', () => {
      locationServiceMock.getAllLocations.mockReturnValue(of([makeLocation()]));
      currentUserSignal.set({ userId: 'user-123' });
      fixture.detectChanges();

      expect(component.hasLocation()).toBe(true);
    });

    it('debe setear hasLocation en false cuando getAllLocations devuelve lista vacía', () => {
      locationServiceMock.getAllLocations.mockReturnValue(of([]));
      currentUserSignal.set({ userId: 'user-123' });
      fixture.detectChanges();

      expect(component.hasLocation()).toBe(false);
    });

    it('debe setear hasLocation en false cuando getAllLocations falla', () => {
      locationServiceMock.getAllLocations.mockReturnValue(throwError(() => new Error('sin ubicación')));
      currentUserSignal.set({ userId: 'user-123' });
      fixture.detectChanges();

      expect(component.hasLocation()).toBe(false);
    });

    it('debe setear selectedAddress con la dirección activa', () => {
      locationServiceMock.getAllLocations.mockReturnValue(of([
        makeLocation({ addressType: 'HOME', active: true }),
      ]));
      currentUserSignal.set({ userId: 'user-123' });
      fixture.detectChanges();

      expect(component.selectedAddress()).toBe('HOME');
    });

    it('no debe llamar a getAllLocations si no hay usuario', () => {
      currentUserSignal.set(null);
      fixture.detectChanges();

      expect(locationServiceMock.getAllLocations).not.toHaveBeenCalled();
    });
  });

  // ─── checkout() – usuario no autenticado ──────────────────────────────────

  describe('checkout() - usuario no autenticado', () => {
    beforeEach(() => {
      authMock.isLoggedIn.mockReturnValue(false);
      cartServiceMock.items.mockReturnValue([{ idProduct: 1, quantity: 1 }]);
    });

    it('debe redirigir a /login si el usuario no está logueado', () => {
      component.checkout();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('no debe llamar a cartService.checkout si el usuario no está logueado', () => {
      component.checkout();
      expect(cartServiceMock.checkout).not.toHaveBeenCalled();
    });
  });

  // ─── checkout() – sin ubicación ───────────────────────────────────────────

  describe('checkout() - sin ubicación', () => {
    beforeEach(() => {
      authMock.isLoggedIn.mockReturnValue(true);
      component.hasLocation.set(false);
      cartServiceMock.items.mockReturnValue([{ idProduct: 1, quantity: 1 }]);
    });

    it('debe cerrar el carrito si no hay ubicación', () => {
      component.checkout();
      expect(cartServiceMock.closeCart).toHaveBeenCalled();
    });

    it('debe redirigir a /profile si no hay ubicación', () => {
      component.checkout();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/profile']);
    });

    it('no debe llamar a cartService.checkout si no hay ubicación', () => {
      component.checkout();
      expect(cartServiceMock.checkout).not.toHaveBeenCalled();
    });
  });

  // ─── checkout() – flujo exitoso ───────────────────────────────────────────

  describe('checkout() - flujo exitoso', () => {
    beforeEach(() => {
      authMock.isLoggedIn.mockReturnValue(true);
      component.hasLocation.set(true);
      component.locations.set([makeLocation({ addressType: 'HOME', active: true })]);
      component.selectedAddress.set('HOME');
      cartServiceMock.items.mockReturnValue([{ idProduct: 1, quantity: 1 }]);
      cartServiceMock.checkout.mockReturnValue(of({}));
    });

    it('debe llamar a cartService.checkout', () => {
      component.checkout();
      expect(cartServiceMock.checkout).toHaveBeenCalled();
    });

    it('debe llamar a clearCart tras una reserva exitosa', () => {
      component.checkout();
      expect(cartServiceMock.clearCart).toHaveBeenCalled();
    });

    it('debe llamar a closeCart tras una reserva exitosa', () => {
      component.checkout();
      expect(cartServiceMock.closeCart).toHaveBeenCalled();
    });

    it('debe setear reservaExitosa en true tras el checkout', () => {
      component.checkout();
      expect(component.reservaExitosa()).toBe(true);
    });

    it('debe resetear reservaExitosa a false después de 4 segundos', () => {
      vi.useFakeTimers();
      component.checkout();
      expect(component.reservaExitosa()).toBe(true);

      vi.advanceTimersByTime(4000);
      expect(component.reservaExitosa()).toBe(false);
    });

    it('reservaExitosa debe seguir en true antes de que pasen los 4 segundos', () => {
      vi.useFakeTimers();
      component.checkout();

      vi.advanceTimersByTime(3999);
      expect(component.reservaExitosa()).toBe(true);
    });
  });

  // ─── checkout() – error en el servidor ───────────────────────────────────

  describe('checkout() - error en el servidor', () => {
    beforeEach(() => {
      authMock.isLoggedIn.mockReturnValue(true);
      component.hasLocation.set(true);
      component.locations.set([makeLocation({ addressType: 'HOME', active: true })]);
      component.selectedAddress.set('HOME');
      cartServiceMock.items.mockReturnValue([{ idProduct: 1, quantity: 1 }]);
      cartServiceMock.checkout.mockReturnValue(throwError(() => new Error('server error')));
    });

    it('no debe setear reservaExitosa en true si el checkout falla', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      component.checkout();
      expect(component.reservaExitosa()).toBe(false);
    });

    it('no debe llamar a clearCart si el checkout falla', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      component.checkout();
      expect(cartServiceMock.clearCart).not.toHaveBeenCalled();
    });

    it('debe loggear el error en consola', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      component.checkout();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // ─── Template ─────────────────────────────────────────────────────────────

  describe('template', () => {
    it('no debe mostrar el toast de reserva exitosa por defecto', () => {
      const toast = fixture.nativeElement.querySelector('.reserva-toast');
      expect(toast).toBeNull();
    });

    it('debe mostrar el toast cuando reservaExitosa es true', () => {
      component.reservaExitosa.set(true);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('.reserva-toast');
      expect(toast).not.toBeNull();
    });

    it('debe mostrar "Add an address first" cuando no hay ubicación', () => {
      component.hasLocation.set(false);
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.btn-checkout');
      expect(btn.textContent.trim()).toBe('Add an address first');
    });

    it('debe mostrar "Purchase" cuando hay ubicación', () => {
      component.hasLocation.set(true);
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.btn-checkout');
      expect(btn.textContent.trim()).toBe('Purchase');
    });

    it('debe abrir el drawer cuando isOpen retorna true', async () => {
      cartServiceMock.isOpen.mockReturnValue(true);

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [FloatingCart, ClpFormatPipe],
        providers: [
          { provide: Cart,            useValue: cartServiceMock },
          { provide: Auth,            useValue: authMock },
          { provide: LocationService, useValue: locationServiceMock },
          { provide: Router,          useValue: routerMock },
        ],
      }).compileComponents();

      const f = TestBed.createComponent(FloatingCart);
      f.detectChanges();

      const drawer = f.nativeElement.querySelector('.cart-drawer');
      expect(drawer.classList.contains('open')).toBe(true);
    });

    it('debe mostrar el mensaje de carrito vacío cuando no hay items', () => {
      cartServiceMock.items.mockReturnValue([]);
      fixture.detectChanges();

      const empty = fixture.nativeElement.querySelector('.cart-empty');
      expect(empty).not.toBeNull();
    });
  });
});