import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalitycsPage } from './analitycs-page';

describe('AnalitycsPage', () => {
  let component: AnalitycsPage;
  let fixture: ComponentFixture<AnalitycsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalitycsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalitycsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
