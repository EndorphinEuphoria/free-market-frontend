import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingCart } from './floating-cart';

describe('FloatingCart', () => {
  let component: FloatingCart;
  let fixture: ComponentFixture<FloatingCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingCart],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingCart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
