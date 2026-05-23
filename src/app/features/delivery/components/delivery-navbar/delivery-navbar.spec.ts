import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryNavbar } from './delivery-navbar';

describe('DeliveryNavbar', () => {
  let component: DeliveryNavbar;
  let fixture: ComponentFixture<DeliveryNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
