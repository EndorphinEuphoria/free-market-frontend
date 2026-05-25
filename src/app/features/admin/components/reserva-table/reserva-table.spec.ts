// reserva-table.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ReservaTableComponent } from './reserva-table';
import { AnalyticsService, ReservaResponse } from '../../../../core/services/analytics-service';

const mockReservas: ReservaResponse[] = [
  { idReserva: 1, reserveDate: '2025-01-01', totalPrice: 100, status: 'ACTIVA' },
  { idReserva: 2, reserveDate: '2025-01-02', totalPrice: 200, status: 'COMPLETADA' },
  { idReserva: 3, reserveDate: '2025-01-03', totalPrice: 50,  status: 'CANCELADA' },
];

describe('ReservaTable', () => {
  let fixture: ComponentFixture<ReservaTableComponent>;
  let component: ReservaTableComponent;
  let analyticsServiceMock: { getAllReservas: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    analyticsServiceMock = {
      getAllReservas: vi.fn().mockReturnValue(of(mockReservas))
    };

    await TestBed.configureTestingModule({
      imports: [ReservaTableComponent],
      providers: [{ provide: AnalyticsService, useValue: analyticsServiceMock }]
    }).compileComponents();

    fixture   = TestBed.createComponent(ReservaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should load reservas on init', () => {
      expect(component.reservas()).toEqual(mockReservas);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should set error signal on failure', async () => {
      analyticsServiceMock.getAllReservas.mockReturnValue(throwError(() => new Error('fail')));

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ReservaTableComponent],
        providers: [{ provide: AnalyticsService, useValue: analyticsServiceMock }]
      }).compileComponents();

      const f = TestBed.createComponent(ReservaTableComponent);
      f.detectChanges();

      expect(f.componentInstance.error()).toBe('Error al cargar reservas');
      expect(f.componentInstance.loading()).toBe(false);
    });
  });

  describe('getStatusLabel', () => {
    it('should map RESERVADO to Reserved',    () => expect(component.getStatusLabel('RESERVADO')).toBe('Reserved'));
    it('should map COMPLETO to Completed',    () => expect(component.getStatusLabel('COMPLETO')).toBe('Completed'));
    it('should map CANCELADO to Cancelled',   () => expect(component.getStatusLabel('CANCELADO')).toBe('Cancelled'));
    it('should map PENDIENTE to Pending',     () => expect(component.getStatusLabel('PENDIENTE')).toBe('Pending'));
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
      const many: ReservaResponse[] = Array.from({ length: 25 }, (_, i) => ({
        idReserva: i + 1, reserveDate: '2025-01-01', totalPrice: 10, status: 'ACTIVA'
      }));
      component.reservas.set(many);

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

    it('should navigate prev correctly', () => {
      component.reservas.set(Array.from({ length: 25 }, (_, i) => ({
        idReserva: i + 1, reserveDate: '2025-01-01', totalPrice: 10, status: 'ACTIVA'
      })));

      component.nextPage();
      expect(component.page()).toBe(2);

      component.prevPage();
      expect(component.page()).toBe(1);
    });
  });

  describe('template', () => {
    it('should render table when data loaded', () => {
      expect(fixture.nativeElement.querySelector('.at-table')).toBeTruthy();
    });

    it('should render correct number of rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(mockReservas.length);
    });

    it('should show loading state before init', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ReservaTableComponent],
        providers: [{ provide: AnalyticsService, useValue: analyticsServiceMock }]
      }).compileComponents();

      const f = TestBed.createComponent(ReservaTableComponent);
      expect(f.componentInstance.loading()).toBe(true);
    });

    it('should show empty message when no reservas', () => {
      component.reservas.set([]);
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('.at-empty');
      expect(empty?.textContent?.trim()).toBe('No orders found');
    });

    it('should display reserva count', () => {
      const count = fixture.nativeElement.querySelector('.at-count');
      expect(count?.textContent?.trim()).toBe('3 order(s) found');
    });
  });
});