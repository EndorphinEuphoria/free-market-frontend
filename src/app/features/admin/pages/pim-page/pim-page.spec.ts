import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PimPageComponent } from './pim-page'; 

describe('PimPageComponent', () => {
  let component: PimPageComponent;
  let fixture: ComponentFixture<PimPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PimPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PimPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});