// mis-entregas-page.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { MisEntregasPage } from './mis-entregas-page';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { Auth } from '../../../../core/services/auth';

describe('MisEntregasPage', () => {
  let component: MisEntregasPage;
  let fixture: ComponentFixture<MisEntregasPage>;

  let deliverySpy: {
    getDeliveriesByRepartidor: ReturnType<typeof vi.fn>;
    getUsers: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  let authSpy: {
    restoreSession: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
  };

  const mockEntregas = [
    {
      idDelivery: 1,
      idReserva: 10,
      idUsuario: 5,
      deliveryBeginDate: '2026-01-01',
      deliveryEndDate: null,
      status: 'EN_CAMINO'
    },
    {
      idDelivery: 2,
      idReserva: 20,
      idUsuario: 6,
      deliveryBeginDate: '2026-01-02',
      deliveryEndDate: '2026-01-03',
      status: 'ENTREGADO'
    }
  ];

  const mockUsers = [
    {
      id: 5,
      firstname: 'John',
      lastname: 'Doe'
    },
    {
      id: 6,
      firstname: 'Jane',
      lastname: 'Smith'
    }
  ];

  beforeEach(async () => {
    deliverySpy = {
      getDeliveriesByRepartidor: vi.fn(),
      getUsers: vi.fn(),
      updateStatus: vi.fn(),
    };

    authSpy = {
      restoreSession: vi.fn(),
      currentUser: vi.fn().mockReturnValue({
        userId: 99,
        firstName: 'Delivery',
        lastName: 'User',
        role: 'DELIVERY'
      }),
    };

    deliverySpy.getDeliveriesByRepartidor.mockReturnValue(
      of(mockEntregas)
    );

    deliverySpy.getUsers.mockReturnValue(
      of(mockUsers)
    );

    await TestBed.configureTestingModule({
      imports: [MisEntregasPage],
      providers: [
        provideRouter([]),
        {
          provide: DeliveryService,
          useValue: deliverySpy
        },
        {
          provide: Auth,
          useValue: authSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisEntregasPage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should restore session on init', () => {
    expect(authSpy.restoreSession).toHaveBeenCalled();
  });

  it('should load deliveries on init', () => {
    expect(deliverySpy.getDeliveriesByRepartidor)
      .toHaveBeenCalledWith(99);

    expect(deliverySpy.getUsers)
      .toHaveBeenCalled();

    expect(component.entregas().length)
      .toBe(2);

    expect(component.loading())
      .toBe(false);
  });

  it('should redirect if no current user', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    authSpy.currentUser.mockReturnValue(null);

    component.ngOnInit();

    expect(navigateSpy)
      .toHaveBeenCalledWith(['/delivery']);
  });

  it('should set error if loadEntregas fails', () => {
    deliverySpy.getDeliveriesByRepartidor.mockReturnValue(
      throwError(() => new Error())
    );

    component.loadEntregas(99);

    expect(component.error())
      .toBe('Error loading your deliveries');

    expect(component.loading())
      .toBe(false);
  });

  it('should return customer name', () => {
    expect(component.getNombreCliente(5))
      .toBe('John Doe');
  });

  it('should return fallback customer name', () => {
    expect(component.getNombreCliente(999))
      .toBe('Cliente #999');
  });

  it('should calculate total deliveries', () => {
    expect(component.totalEntregas())
      .toBe(2);
  });

  it('should calculate completed deliveries', () => {
    expect(component.entregadas())
      .toBe(1);
  });

  it('should calculate on the way deliveries', () => {
    expect(component.enCamino())
      .toBe(1);
  });

  it('should mark delivery as completed', () => {
    deliverySpy.updateStatus.mockReturnValue(
      of({
        ...mockEntregas[0],
        status: 'ENTREGADO'
      })
    );

    component.marcarEntregado(mockEntregas[0] as any);

    expect(deliverySpy.updateStatus)
      .toHaveBeenCalledWith(10, 'ENTREGADO');

    expect(component.successMsg())
      .toBe('Delivery marked as completed!');

    expect(component.updatingId())
      .toBe(null);
  });

  it('should not update already completed delivery', () => {
    component.marcarEntregado(mockEntregas[1] as any);

    expect(deliverySpy.updateStatus)
      .not.toHaveBeenCalled();
  });

  it('should set error when update fails', () => {
    deliverySpy.updateStatus.mockReturnValue(
      throwError(() => new Error())
    );

    component.marcarEntregado(mockEntregas[0] as any);

    expect(component.error())
      .toBe('Error updating delivery status');

    expect(component.updatingId())
      .toBe(null);
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('PENDIENTE'))
      .toBe('badge--pendiente');

    expect(component.getStatusClass('ENTREGADO'))
      .toBe('badge--entregado');
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('EN_CAMINO'))
      .toBe('On the way');

    expect(component.getStatusLabel('ENTREGADO'))
      .toBe('Delivered');
  });
});