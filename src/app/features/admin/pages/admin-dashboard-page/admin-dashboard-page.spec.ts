// admin-dashboard-page.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardPage } from './admin-dashboard-page';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { ConfigService } from '../../../../core/services/config-service';
import { Auth } from '../../../../core/services/auth';
import { vi } from 'vitest';

describe('AdminDashboardPage', () => {
  let fixture: ComponentFixture<AdminDashboardPage>;
  let component: AdminDashboardPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: { logoUrl: vi.fn().mockReturnValue(''), commerceName: vi.fn().mockReturnValue('Test') } },
        { provide: Auth, useValue: { currentUser: vi.fn().mockReturnValue(null), logout: vi.fn() } }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(AdminDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => component.stopAutoplay());

  describe('initialization', () => {
    it('should start on slide 0', () => {
      expect(component.currentSlide()).toBe(0);
    });

    it('should have 4 slides', () => {
      expect(component.slides.length).toBe(4);
    });
  });

  describe('navigation', () => {
    it('next() should advance to next slide', () => {
      component.next();
      expect(component.currentSlide()).toBe(1);
    });

    it('next() should wrap around from last to first', () => {
      component.currentSlide.set(3);
      component.next();
      expect(component.currentSlide()).toBe(0);
    });

    it('prev() should go to previous slide', () => {
      component.currentSlide.set(2);
      component.prev();
      expect(component.currentSlide()).toBe(1);
    });

    it('prev() should wrap around from first to last', () => {
      component.currentSlide.set(0);
      component.prev();
      expect(component.currentSlide()).toBe(3);
    });

    it('goTo() should set slide directly', () => {
      component.goTo(2);
      expect(component.currentSlide()).toBe(2);
    });
  });

  describe('autoplay', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('should auto-advance after 20 seconds', () => {
        component.stopAutoplay();
        component.startAutoplay();
        vi.advanceTimersByTime(20000);
        expect(component.currentSlide()).toBe(1);
        component.stopAutoplay();
    });

    it('should reset timer on prev()', () => {
        component.stopAutoplay();
        component.currentSlide.set(2);
        component.startAutoplay();
        vi.advanceTimersByTime(10000);
        component.prev();
        vi.advanceTimersByTime(10000);
        expect(component.currentSlide()).toBe(1);
        vi.advanceTimersByTime(10000);
        expect(component.currentSlide()).toBe(2);
        component.stopAutoplay();
    });

    it('should reset timer on goTo()', () => {
        component.stopAutoplay();
        component.startAutoplay();
        vi.advanceTimersByTime(10000);
        component.goTo(3);
        vi.advanceTimersByTime(10000);
        expect(component.currentSlide()).toBe(3);
        vi.advanceTimersByTime(10000);
        expect(component.currentSlide()).toBe(0);
        component.stopAutoplay();
    });

    it('should stop autoplay on destroy', () => {
        component.stopAutoplay();
        component.startAutoplay();
        component.ngOnDestroy();
        vi.advanceTimersByTime(20000);
        expect(component.currentSlide()).toBe(0);
    });
    });

  describe('template', () => {
    it('should render slides', () => {
      expect(fixture.nativeElement.querySelector('.admin-dashboard-page, [class*="slide"], [class*="carousel"], [class*="step"]')).toBeTruthy();
    });
  });
});