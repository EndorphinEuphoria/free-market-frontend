import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionesPageComponent } from './configuraciones-page';

describe('ConfiguracionesPage', () => {
  let component: ConfiguracionesPageComponent;
  let fixture: ComponentFixture<ConfiguracionesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionesPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionesPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
