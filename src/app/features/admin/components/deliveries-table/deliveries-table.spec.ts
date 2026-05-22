import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveriesTableComponent } from './deliveries-table';

describe('DeliveriesTable', () => {
  let component: DeliveriesTableComponent;
  let fixture: ComponentFixture<DeliveriesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveriesTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveriesTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
