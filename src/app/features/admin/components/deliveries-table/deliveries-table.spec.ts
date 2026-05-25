// deliveries-table.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { DeliveriesTableComponent } from './deliveries-table';
import { AnalyticsService, DeliveryResponse, UserResponse } from '../../../../core/services/analytics-service';

const mockDeliveries: DeliveryResponse[] = [
  { idDelivery: 1, status: 'PENDIENTE',  idReserva: 10, idUsuario: 1, deliveryBeginDate: '2025-01-01', deliveryEndDate: '2025-01-02', idRepartidor: null },
  { idDelivery: 2, status: 'EN_CAMINO',  idReserva: 11, idUsuario: 2, deliveryBeginDate: '2025-01-02', deliveryEndDate: '2025-01-03', idRepartidor: 5 },
  { idDelivery: 3, status: 'ENTREGADO',  idReserva: 12, idUsuario: 1, deliveryBeginDate: '2025-01-03', deliveryEndDate: '2025-01-04', idRepartidor: 6 },
  { idDelivery: 4, status: 'CANCELADO',  idReserva: 13, idUsuario: 2, deliveryBeginDate: '2025-01-04', deliveryEndDate: '2025-01-05', idRepartidor: null },
];

const mockUsers: UserResponse[] = [
  { id: 1, firstname: 'Alice', lastname: 'Smith',  username: 'alice' },
  { id: 2, firstname: 'Bob',   lastname: 'Jones',  username: 'bob' },
  { id: 5, firstname: 'Carlos', lastname: 'Ruiz',  username: 'carlos' },
  { id: 6, firstname: 'Diana', lastname: 'Lopez',  username: 'diana' },
];

describe('DeliveriesTable', () => {
  let fixture: ComponentFixture<DeliveriesTableComponent>;
  let component: DeliveriesTableComponent;
  let analyticsServiceMock: { getAllDeliveries: ReturnType<typeof vi.fn>; getUsers: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    analyticsServiceMock = {
      getAllDeliveries: vi.fn().mockReturnValue(of(mockDeliveries)),
      getUsers:        vi.fn().mockReturnValue(of(mockUsers))
    };

    await TestBed.configureTestingModule({
      imports: [DeliveriesTableComponent],
      providers: [{ provide: AnalyticsService, useValue: analyticsServiceMock }]
    }).compileComponents();

    fixture   = TestBed.createComponent(DeliveriesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should load deliveries and users on init', () => {
      expect(component.deliveries()).toEqual(mockDeliveries);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should build usuarios map correctly', () => {
      expect(component.usuarios().get(1)).toBe('Alice Smith');
      expect(component.usuarios().get(2)).toBe('Bob Jones');
    });

    it('should set error signal on failure', async () => {
      analyticsServiceMock.getAllDeliveries.mockReturnValue(throwError(() => new Error('fail')));

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [DeliveriesTableComponent],
        providers: [{ provide: AnalyticsService, useValue: analyticsServiceMock }]
      }).compileComponents();

      const f = TestBed.createComponent(DeliveriesTableComponent);
      f.detectChanges();

      expect(f.componentInstance.error()).toBe('Error loading deliveries');
      expect(f.componentInstance.loading()).toBe(false);
    });
  });

  describe('getNombre', () => {
    it('should return full name when id exists in map', () => {
      expect(component.getNombre(1)).toBe('Alice Smith');
      expect(component.getNombre(5)).toBe('Carlos Ruiz');
    });

    it('should return —  when id is null', () => {
      expect(component.getNombre(null)).toBe('—');
    });

    it('should return #id when id not found in map', () => {
      expect(component.getNombre(99)).toBe('#99');
    });
  });

  describe('getStatusLabel', () => {
    it('should map PENDIENTE to Pending',     () => expect(component.getStatusLabel('PENDIENTE')).toBe('Pending'));
    it('should map EN_CAMINO to On the way',  () => expect(component.getStatusLabel('EN_CAMINO')).toBe('On the way'));
    it('should map ENTREGADO to Delivered',   () => expect(component.getStatusLabel('ENTREGADO')).toBe('Delivered'));
    it('should map CANCELADO to Cancelled',   () => expect(component.getStatusLabel('CANCELADO')).toBe('Cancelled'));
    it('should return original when unknown', () => expect(component.getStatusLabel('UNKNOWN')).toBe('UNKNOWN'));
  });

  describe('pagination', () => {
    it('should start on page 1', () => {
      expect(component.page()).toBe(1);
    });

    it('should calculate totalPages correctly', () => {
      expect(component.totalPages()).toBe(1);
    });

    it('should not go below page 1 on prevPage', () => {
      component.prevPage();
      expect(component.page()).toBe(1);
    });

    it('should not exceed totalPages on nextPage', () => {
      component.nextPage();
      expect(component.page()).toBe(1);
    });

    it('should paginate correctly with more than pageSize items', () => {
      const many: DeliveryResponse[] = Array.from({ length: 25 }, (_, i) => ({
        idDelivery: i + 1, status: 'PENDIENTE', idReserva: i,
        idUsuario: 1, deliveryBeginDate: '2025-01-01',
        deliveryEndDate: '2025-01-02', idRepartidor: null
      }));
      component.deliveries.set(many);

      expect(component.totalPages()).toBe(3);
      expect(component.pagedReservas().length).toBe(10);

      component.nextPage();
      expect(component.page()).toBe(2);
      expect(component.pagedReservas().length).toBe(10);

      component.nextPage();
      expect(component.page()).toBe(3);
      expect(component.pagedReservas().length).toBe(5);

      component.nextPage();
      expect(component.page()).toBe(3);
    });

    it('should navigate prev and next correctly', () => {
      component.deliveries.set(Array.from({ length: 25 }, (_, i) => ({
        idDelivery: i + 1, status: 'PENDIENTE', idReserva: i,
        idUsuario: 1, deliveryBeginDate: '2025-01-01',
        deliveryEndDate: '2025-01-02', idRepartidor: null
      })));

      component.nextPage();
      expect(component.page()).toBe(2);

      component.prevPage();
      expect(component.page()).toBe(1);
    });
  });

  describe('template', () => {
    it('should render table when data loaded', () => {
      const table = fixture.nativeElement.querySelector('.at-table');
      expect(table).toBeTruthy();
    });

    it('should render correct number of rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(mockDeliveries.length);
    });

    it('should show loading state', async () => {
      analyticsServiceMock.getAllDeliveries.mockReturnValue(of([]));
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [DeliveriesTableComponent],
        providers: [{ provide: AnalyticsService, useValue: analyticsServiceMock }]
      }).compileComponents();

      const f = TestBed.createComponent(DeliveriesTableComponent);
      expect(f.componentInstance.loading()).toBe(true);
    });

    it('should show — for end date when status is not ENTREGADO', () => {
      const cells = fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(6)');
      expect(cells[0].textContent.trim()).toBe('—');
    });

    it('should show end date when status is ENTREGADO', () => {
      const cells = fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(6)');
      expect(cells[2].textContent.trim()).toBe('2025-01-04');
    });
  });
});