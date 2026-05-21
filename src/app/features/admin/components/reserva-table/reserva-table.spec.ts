import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservaTableComponent } from './reserva-table';

describe('ReservaTableComponent', () => {
  let component: ReservaTableComponent;
  let fixture: ComponentFixture<ReservaTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});