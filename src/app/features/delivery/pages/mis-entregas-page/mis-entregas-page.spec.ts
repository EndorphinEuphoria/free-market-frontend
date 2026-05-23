import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisEntregasPage } from './mis-entregas-page';

describe('MisEntregasPage', () => {
  let component: MisEntregasPage;
  let fixture: ComponentFixture<MisEntregasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisEntregasPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MisEntregasPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
