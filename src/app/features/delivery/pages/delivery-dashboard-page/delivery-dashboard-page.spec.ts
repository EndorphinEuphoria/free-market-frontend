import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryDashboardPage } from './delivery-dashboard-page';

describe('DeliveryDashboardPage', () => {
  let component: DeliveryDashboardPage;
  let fixture: ComponentFixture<DeliveryDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryDashboardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryDashboardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
