import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosPageComponent } from './productos-page';

describe('ProductosPage', () => {
  let component: ProductosPageComponent;
  let fixture: ComponentFixture<ProductosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
