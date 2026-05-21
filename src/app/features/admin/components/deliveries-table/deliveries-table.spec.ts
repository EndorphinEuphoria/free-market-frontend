import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveriesTable } from './deliveries-table';

describe('DeliveriesTable', () => {
  let component: DeliveriesTable;
  let fixture: ComponentFixture<DeliveriesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveriesTable],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveriesTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
