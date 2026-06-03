import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ReportsPage } from './reports-page';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { AdminService } from '../../../../core/services/admin';
import { ToastService } from '../../../../core/services/toast-service';

describe('ReportsPage', () => {
  let component: ReportsPage;
  let fixture: ComponentFixture<ReportsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsPage],
      providers: [
        provideRouter([]),
        { provide: DeliveryService, useValue: { getAllReports: vi.fn().mockReturnValue(of([])), getAllDeliveries: vi.fn().mockReturnValue(of([])), updateReport: vi.fn().mockReturnValue(of({})) } },
        { provide: AdminService,    useValue: { getAllUsers: vi.fn().mockReturnValue(of([])) } },
        { provide: ToastService,    useValue: { error: vi.fn(), success: vi.fn(), toasts: vi.fn().mockReturnValue([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});