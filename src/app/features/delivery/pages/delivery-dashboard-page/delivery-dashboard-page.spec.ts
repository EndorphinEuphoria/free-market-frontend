// delivery-dashboard-page.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { DeliveryDashboardPage } from './delivery-dashboard-page';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { Auth } from '../../../../core/services/auth';

describe('DeliveryDashboardPage', () => {
  let component: DeliveryDashboardPage;
  let fixture: ComponentFixture<DeliveryDashboardPage>;

  let deliverySpy: {
    getDeliveriesByStatus: ReturnType<typeof vi.fn>;
    getUsers: ReturnType<typeof vi.fn>;
    getReservaById: ReturnType<typeof vi.fn>;
    getLocationByUserId: ReturnType<typeof vi.fn>;
    tomarDelivery: ReturnType<typeof vi.fn>;
  };

  const mockDeliveries = [
    {
      idDelivery: 1,
      idDeliveryDetails: 10,
      idReserva: 20,
      idUsuario: 5,
      deliveryBeginDate: '2026-01-01',
      status: 'PENDIENTE'
    }
  ];

  const mockUsers = [
    {
      id: 5,
      firstname: 'John',
      lastname: 'Doe'
    }
  ];

  const mockReserva = {
    reserveDate: '2026-01-01',
    status: 'PENDIENTE',
    totalPrice: 5000,
    products: [
      {
        idProduct: 1,
        productName: 'Pizza',
        quantity: 2,
        subtotal: 5000
      }
    ]
  };

  const mockLocation = {
    streetAddress: 'Fake Street 123',
    comunaNombre: 'Santiago',
    regionNombre: 'RM'
  };

  beforeEach(async () => {
    deliverySpy = {
      getDeliveriesByStatus: vi.fn(),
      getUsers: vi.fn(),
      getReservaById: vi.fn(),
      getLocationByUserId: vi.fn(),
      tomarDelivery: vi.fn(),
    };

    deliverySpy.getDeliveriesByStatus.mockReturnValue(of(mockDeliveries));
    deliverySpy.getUsers.mockReturnValue(of(mockUsers));

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve([
          {
            lat: '-33.45',
            lon: '-70.66'
          }
        ])
    }) as any;

    await TestBed.configureTestingModule({
      imports: [DeliveryDashboardPage],
      providers: [
        provideRouter([]),
        {
          provide: DeliveryService,
          useValue: deliverySpy
        },
        {
            provide: Auth,
            useValue: {
                currentUser: vi.fn().mockReturnValue({
                firstName: 'Delivery',
                lastName: 'User',
                role: 'DELIVERY'
                })
            }
            }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryDashboardPage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pending deliveries on init', () => {
    expect(deliverySpy.getDeliveriesByStatus)
      .toHaveBeenCalledWith('PENDIENTE');

    expect(deliverySpy.getUsers).toHaveBeenCalled();

    expect(component.deliveries().length).toBe(1);

    expect(component.loading()).toBe(false);
  });

  it('should set error if loadPendientes fails', () => {
    deliverySpy.getDeliveriesByStatus.mockReturnValue(
      throwError(() => new Error())
    );

    component.loadPendientes();

    expect(component.error()).toBe('Error al cargar pedidos');
    expect(component.loading()).toBe(false);
  });

  it('should return customer name', () => {
    expect(component.getNombreCliente(5))
      .toBe('John Doe');
  });

  it('should return fallback customer name', () => {
    expect(component.getNombreCliente(999))
      .toBe('Cliente #999');
  });

  it('should open modal correctly', () => {
    deliverySpy.getReservaById.mockReturnValue(of(mockReserva));
    deliverySpy.getLocationByUserId.mockReturnValue(of(mockLocation));

    component.abrirModal(mockDeliveries[0] as any);

    expect(component.modalDelivery()).toEqual(mockDeliveries[0]);

    expect(deliverySpy.getReservaById)
      .toHaveBeenCalledWith(20);

    expect(deliverySpy.getLocationByUserId)
      .toHaveBeenCalledWith(5);
  });

  it('should load reserva successfully', () => {
    deliverySpy.getReservaById.mockReturnValue(of(mockReserva));
    deliverySpy.getLocationByUserId.mockReturnValue(of(mockLocation));

    component.abrirModal(mockDeliveries[0] as any);

    expect(component.modalReserva()).toEqual(mockReserva);
    expect(component.loadingReserva()).toBe(false);
  });

  it('should set modal error when reserva fails', () => {
    deliverySpy.getReservaById.mockReturnValue(
      throwError(() => new Error())
    );

    deliverySpy.getLocationByUserId.mockReturnValue(of(mockLocation));

    component.abrirModal(mockDeliveries[0] as any);

    expect(component.modalError())
      .toBe('Error al cargar reserva');
  });

  it('should load location successfully', () => {
    deliverySpy.getReservaById.mockReturnValue(of(mockReserva));
    deliverySpy.getLocationByUserId.mockReturnValue(of(mockLocation));

    component.abrirModal(mockDeliveries[0] as any);

    expect(component.modalLocation()).toEqual(mockLocation);
    expect(component.loadingLocation()).toBe(false);
  });

  it('should set map error when location fails', () => {
    deliverySpy.getReservaById.mockReturnValue(of(mockReserva));

    deliverySpy.getLocationByUserId.mockReturnValue(
      throwError(() => new Error())
    );

    component.abrirModal(mockDeliveries[0] as any);

    expect(component.mapError()).toBe(true);
  });

  it('should toggle map expanded state', () => {
    expect(component.mapExpanded()).toBe(false);

    component.toggleMap();

    expect(component.mapExpanded()).toBe(true);
  });

  it('should close modal correctly', () => {
    deliverySpy.getReservaById.mockReturnValue(of(mockReserva));
    deliverySpy.getLocationByUserId.mockReturnValue(of(mockLocation));

    component.abrirModal(mockDeliveries[0] as any);

    component.cerrarModal();

    expect(component.modalDelivery()).toBe(null);
    expect(component.modalReserva()).toBe(null);
    expect(component.modalLocation()).toBe(null);
  });

  it('should take order successfully', () => {
    deliverySpy.getReservaById.mockReturnValue(of(mockReserva));
    deliverySpy.getLocationByUserId.mockReturnValue(of(mockLocation));
    deliverySpy.tomarDelivery.mockReturnValue(of({}));

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.abrirModal(mockDeliveries[0] as any);

    component.tomarPedido();

    expect(deliverySpy.tomarDelivery)
      .toHaveBeenCalledWith(10);

    expect(navigateSpy)
      .toHaveBeenCalledWith(['/delivery/entregas']);
  });

  it('should set modal error when tomarPedido fails', () => {
    deliverySpy.getReservaById.mockReturnValue(of(mockReserva));
    deliverySpy.getLocationByUserId.mockReturnValue(of(mockLocation));

    deliverySpy.tomarDelivery.mockReturnValue(
      throwError(() => new Error())
    );

    component.abrirModal(mockDeliveries[0] as any);

    component.tomarPedido();

    expect(component.modalError())
      .toBe('Error al tomar el pedido');

    expect(component.tomandoPedido()).toBe(false);
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('PENDIENTE'))
      .toBe('badge--pendiente');

    expect(component.getStatusClass('ENTREGADO'))
      .toBe('badge--entregado');
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('PENDIENTE'))
      .toBe('Pending');

    expect(component.getStatusLabel('EN_CAMINO'))
      .toBe('On the way');
  });
});