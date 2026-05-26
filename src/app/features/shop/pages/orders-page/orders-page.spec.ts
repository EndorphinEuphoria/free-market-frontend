import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { OrdersPage } from './orders-page';
import { ReservaDetalleResponse, ReserveService } from '../../../../core/services/reserve-service';
import { DeliveryResponse, DeliveryService } from '../../../../core/services/delivery.service';
import { Auth } from '../../../../core/services/auth';
import { ToastService } from '../../../../core/services/toast-service';
import { ClpFormatPipe } from '../../../../core/pipes/clp-format-pipe';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeReserva = (overrides: Partial<ReservaDetalleResponse> = {}): ReservaDetalleResponse => ({
  idReserva: 1,
  reserveDate: '2024-01-15',
  totalPrice: 150000,
  status: 'RESERVADO',
  products: [
    { idProduct: 10, productName: 'Arroz', unitPrice: 50000, quantity: 3, subtotal: 150000 },
  ],
  ...overrides,
});

const makeDelivery = (overrides: Partial<DeliveryResponse> = {}): DeliveryResponse => ({
  idDelivery: 1,
  idReserva: 1,
  status: 'PENDIENTE',
  deliveryBeginDate: '2024-01-16',
  deliveryEndDate: '2024-01-20',
  idRepartidor: null,
  idUsuario: 1,
  idDeliveryDetails: 1,
  ...overrides,
});

const RESERVES: ReservaDetalleResponse[] = [
  makeReserva({ idReserva: 1, status: 'RESERVADO' }),
  makeReserva({ idReserva: 2, status: 'CANCELADO' }),
  makeReserva({ idReserva: 3, status: 'COMPLETO'  }),
];

const DELIVERIES: DeliveryResponse[] = [
  makeDelivery({ idDelivery: 1, idReserva: 1, status: 'EN_CAMINO' }),
  makeDelivery({ idDelivery: 2, idReserva: 2, status: 'ENTREGADO' }),
];

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('OrdersPage', () => {
  let fixture: ComponentFixture<OrdersPage>;
  let component: OrdersPage;

  let reserveServiceMock: {
    getByUser: ReturnType<typeof vi.fn>;
    cancel:    ReturnType<typeof vi.fn>;
  };
  let deliveryServiceMock: { getByUser: ReturnType<typeof vi.fn> };
  let authMock:            { currentUser: ReturnType<typeof vi.fn> };
  let toastMock: {
    error:   ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
    confirm: ReturnType<typeof vi.fn>;
    toasts:  ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    reserveServiceMock = {
      getByUser: vi.fn().mockReturnValue(of(RESERVES)),
      cancel:    vi.fn().mockReturnValue(of({})),
    };

    deliveryServiceMock = {
      getByUser: vi.fn().mockReturnValue(of(DELIVERIES)),
    };

    authMock = {
      currentUser: vi.fn().mockReturnValue({ userId: 'user-123' }),
    };

    toastMock = {
      error:   vi.fn(),
      success: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
      toasts:  vi.fn().mockReturnValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [OrdersPage, ClpFormatPipe],
      providers: [
        { provide: ReserveService,  useValue: reserveServiceMock  },
        { provide: DeliveryService, useValue: deliveryServiceMock },
        { provide: Auth,            useValue: authMock            },
        { provide: ToastService,    useValue: toastMock           },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(OrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creación ─────────────────────────────────────────────────────────────

  describe('creación', () => {
    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar activeTab en "orders"', () => {
      expect(component.activeTab()).toBe('orders');
    });

    it('debe inicializar filterText vacío', () => {
      expect(component.filterText()).toBe('');
    });

    it('debe inicializar expandedId en null', () => {
      expect(component.expandedId()).toBeNull();
    });

    it('debe inicializar cancelling en null', () => {
      expect(component.cancelling()).toBeNull();
    });
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('debe llamar a loadReserves al iniciar', () => {
      expect(reserveServiceMock.getByUser).toHaveBeenCalledWith('user-123');
    });

    it('debe llamar a loadDeliveries al iniciar', () => {
      expect(deliveryServiceMock.getByUser).toHaveBeenCalledWith('user-123');
    });
  });

  // ─── loadReserves ─────────────────────────────────────────────────────────

  describe('loadReserves()', () => {
    it('debe cargar las reservas correctamente', () => {
      expect(component.reserves().length).toBe(3);
    });

    it('debe setear loading en false tras cargar', () => {
      expect(component.loading()).toBe(false);
    });

    it('debe setear error en null tras cargar exitosamente', () => {
      expect(component.error()).toBeNull();
    });

    it('no debe llamar a getByUser si no hay usuario autenticado', () => {
      authMock.currentUser.mockReturnValue(null);
      reserveServiceMock.getByUser.mockClear();
      component.loadReserves();
      expect(reserveServiceMock.getByUser).not.toHaveBeenCalled();
    });

    it('debe setear error cuando getByUser falla', () => {
      reserveServiceMock.getByUser.mockReturnValue(throwError(() => new Error('fail')));
      component.loadReserves();
      expect(component.error()).toBe('Failed to load orders');
    });

    it('debe mostrar toast de error cuando getByUser falla', () => {
      reserveServiceMock.getByUser.mockReturnValue(throwError(() => new Error('fail')));
      component.loadReserves();
      expect(toastMock.error).toHaveBeenCalledWith('Could not load your orders.');
    });

    it('debe setear loading en false cuando getByUser falla', () => {
      reserveServiceMock.getByUser.mockReturnValue(throwError(() => new Error('fail')));
      component.loadReserves();
      expect(component.loading()).toBe(false);
    });
  });

  // ─── loadDeliveries ───────────────────────────────────────────────────────

  describe('loadDeliveries()', () => {
    it('debe cargar las deliveries correctamente', () => {
      expect(component.deliveries().length).toBe(2);
    });

    it('debe setear loadingDeliveries en false tras cargar', () => {
      expect(component.loadingDeliveries()).toBe(false);
    });

    it('no debe llamar a getByUser de deliveries si no hay usuario', () => {
      authMock.currentUser.mockReturnValue(null);
      deliveryServiceMock.getByUser.mockClear();
      component.loadDeliveries();
      expect(deliveryServiceMock.getByUser).not.toHaveBeenCalled();
    });

    it('debe setear loadingDeliveries en false cuando falla', () => {
      deliveryServiceMock.getByUser.mockReturnValue(throwError(() => new Error('fail')));
      component.loadDeliveries();
      expect(component.loadingDeliveries()).toBe(false);
    });
  });

  // ─── filteredReserves ─────────────────────────────────────────────────────

  describe('filteredReserves()', () => {
    it('debe retornar todas las reservas si filterText está vacío', () => {
      expect(component.filteredReserves().length).toBe(3);
    });

    it('debe filtrar por idReserva', () => {
      component.filterText.set('2');
      expect(component.filteredReserves().length).toBe(1);
      expect(component.filteredReserves()[0].idReserva).toBe(2);
    });

    it('debe filtrar por status (case-insensitive)', () => {
      component.filterText.set('cancelado');
      const result = component.filteredReserves();
      expect(result.every(r => r.status === 'CANCELADO')).toBe(true);
    });

    it('debe retornar vacío si no hay coincidencias', () => {
      component.filterText.set('xyz-no-existe');
      expect(component.filteredReserves().length).toBe(0);
    });
  });

  // ─── toggleExpand ─────────────────────────────────────────────────────────

  describe('toggleExpand()', () => {
    it('debe expandir una reserva al hacer click', () => {
      component.toggleExpand(1);
      expect(component.expandedId()).toBe(1);
    });

    it('debe colapsar la reserva si ya estaba expandida', () => {
      component.expandedId.set(1);
      component.toggleExpand(1);
      expect(component.expandedId()).toBeNull();
    });

    it('debe cambiar a otra reserva si ya había una expandida', () => {
      component.expandedId.set(1);
      component.toggleExpand(2);
      expect(component.expandedId()).toBe(2);
    });
  });

  // ─── cancelReserve ────────────────────────────────────────────────────────

  describe('cancelReserve()', () => {
    it('no debe cancelar si el usuario no confirma', async () => {
      toastMock.confirm.mockResolvedValue(false);
      await component.cancelReserve(1);
      expect(reserveServiceMock.cancel).not.toHaveBeenCalled();
    });

    it('debe llamar a reserveService.cancel con los datos correctos', async () => {
      await component.cancelReserve(1);
      expect(reserveServiceMock.cancel).toHaveBeenCalledWith(1, 'user-123');
    });

    it('debe actualizar el status de la reserva a CANCELADO', async () => {
      await component.cancelReserve(1);
      const reserva = component.reserves().find(r => r.idReserva === 1);
      expect(reserva?.status).toBe('CANCELADO');
    });

    it('debe setear cancelling en null tras cancelar exitosamente', async () => {
      await component.cancelReserve(1);
      expect(component.cancelling()).toBeNull();
    });

    it('debe mostrar toast de éxito tras cancelar', async () => {
      await component.cancelReserve(1);
      expect(toastMock.success).toHaveBeenCalledWith('Order cancelled successfully.');
    });

    it('debe mostrar toast de error si falla la cancelación', async () => {
      reserveServiceMock.cancel.mockReturnValue(throwError(() => new Error('fail')));
      await component.cancelReserve(1);
      expect(toastMock.error).toHaveBeenCalledWith('Failed to cancel order. Please try again.');
    });

    it('debe setear cancelling en null si falla la cancelación', async () => {
      reserveServiceMock.cancel.mockReturnValue(throwError(() => new Error('fail')));
      await component.cancelReserve(1);
      expect(component.cancelling()).toBeNull();
    });
  });

  // ─── statusLabel ──────────────────────────────────────────────────────────

  describe('statusLabel()', () => {
    it.each([
      ['RESERVADO', 'Confirmed'],
      ['PENDIENTE', 'Pending'],
      ['CANCELADO', 'Cancelled'],
      ['COMPLETO',  'Completed'],
    ])('debe retornar "%s" → "%s"', (status, label) => {
      expect(component.statusLabel(status)).toBe(label);
    });

    it('debe retornar el status original si no está en el mapa', () => {
      expect(component.statusLabel('DESCONOCIDO')).toBe('DESCONOCIDO');
    });
  });

  // ─── deliveryStatusLabel ──────────────────────────────────────────────────

  describe('deliveryStatusLabel()', () => {
    it.each([
      ['PENDIENTE',  'Pending'],
      ['EN_CAMINO',  'On the way'],
      ['ENTREGADO',  'Delivered'],
      ['CANCELADO',  'Cancelled'],
    ])('debe retornar "%s" → "%s"', (status, label) => {
      expect(component.deliveryStatusLabel(status)).toBe(label);
    });

    it('debe retornar el status original si no está en el mapa', () => {
      expect(component.deliveryStatusLabel('OTRO')).toBe('OTRO');
    });
  });

  // ─── Template ─────────────────────────────────────────────────────────────

  describe('Template', () => {
    it('debe mostrar la tab "orders" activa por defecto', () => {
      const tabs = fixture.nativeElement.querySelectorAll('.orders-tab');
      expect(tabs[0].classList.contains('orders-tab--active')).toBe(true);
      expect(tabs[1].classList.contains('orders-tab--active')).toBe(false);
    });

    it('debe cambiar a tab "deliveries" al hacer click', () => {
      const tabs = fixture.nativeElement.querySelectorAll('.orders-tab');
      tabs[1].click();
      fixture.detectChanges();
      expect(component.activeTab()).toBe('deliveries');
    });

    it('debe mostrar el conteo de órdenes filtradas', () => {
      const count = fixture.nativeElement.querySelector('.orders-count');
      expect(count.textContent).toContain('3');
    });

    it('debe mostrar "No orders found" cuando filteredReserves está vacío', () => {
      component.filterText.set('xyz-no-existe');
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('.orders-empty');
      expect(empty.textContent.trim()).toBe('No orders found');
    });

    it('debe mostrar el mensaje de error cuando error() tiene valor', () => {
      component.error.set('Failed to load orders');
      fixture.detectChanges();
      const err = fixture.nativeElement.querySelector('.orders-error');
      expect(err.textContent.trim()).toBe('Failed to load orders');
    });

    it('debe mostrar el spinner de carga cuando loading es true', () => {
      component.loading.set(true);
      fixture.detectChanges();
      const loading = fixture.nativeElement.querySelector('.orders-loading');
      expect(loading).not.toBeNull();
    });

    it('debe ocultar la tabla mientras loading es true', () => {
      component.loading.set(true);
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector('.orders-table-wrapper');
      expect(table).toBeNull();
    });

    it('debe actualizar filterText al escribir en el input', () => {
      const input = fixture.nativeElement.querySelector('.orders-input');
      input.value = 'cancelado';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.filterText()).toBe('cancelado');
    });

    it('debe llamar a loadReserves al hacer click en Reload', () => {
      const reloadSpy = vi.spyOn(component, 'loadReserves');
      const btn = fixture.nativeElement.querySelector('.orders-btn-refresh');
      btn.click();
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('debe mostrar botón Cancel solo en reservas que no son CANCELADO ni COMPLETO', () => {
      const cancelBtns = fixture.nativeElement.querySelectorAll('.orders-btn-cancel');
      // Solo la reserva con status RESERVADO (id=1) debe tener botón
      expect(cancelBtns.length).toBe(1);
    });

    it('debe mostrar "—" en lugar del botón Cancel para reservas CANCELADO o COMPLETO', () => {
      const mutedSpans = fixture.nativeElement.querySelectorAll('.orders-td-muted');
      const dashes = Array.from(mutedSpans).filter((el: any) => el.textContent.trim() === '—');
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });

    it('debe mostrar el detalle de productos al expandir una reserva', () => {
      component.expandedId.set(1);
      fixture.detectChanges();
      const detailRow = fixture.nativeElement.querySelector('.orders-detail-row');
      expect(detailRow).not.toBeNull();
    });

    it('debe ocultar el detalle al colapsar la reserva', () => {
      component.expandedId.set(1);
      fixture.detectChanges();
      component.expandedId.set(null);
      fixture.detectChanges();
      const detailRow = fixture.nativeElement.querySelector('.orders-detail-row');
      expect(detailRow).toBeNull();
    });

    it('debe mostrar el spinner de deliveries cuando loadingDeliveries es true', () => {
      component.activeTab.set('deliveries');
      component.loadingDeliveries.set(true);
      fixture.detectChanges();
      const loading = fixture.nativeElement.querySelector('.orders-loading');
      expect(loading).not.toBeNull();
    });

    it('debe mostrar el conteo de deliveries en la tab de deliveries', () => {
      component.activeTab.set('deliveries');
      fixture.detectChanges();
      const count = fixture.nativeElement.querySelector('.orders-count');
      expect(count.textContent).toContain('2');
    });
  });
});