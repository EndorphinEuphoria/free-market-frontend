// delivery-only.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, CanActivateFn } from '@angular/router';
import { vi } from 'vitest';
import { deliveryOnlyGuard } from './delivery-only-guard';
import { Auth } from '../services/auth';

describe('deliveryOnlyGuard', () => {
  let router: Router;
  let authMock: { currentUser: ReturnType<typeof vi.fn> };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => deliveryOnlyGuard(...guardParameters));

  beforeEach(() => {
    authMock = { currentUser: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authMock }
      ]
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should allow DELIVERY', () => {
    authMock.currentUser.mockReturnValue({ rol: { rolName: 'DELIVERY' } });
    expect(executeGuard({} as any, {} as any)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should block ADMIN and redirect to /admin', () => {
    authMock.currentUser.mockReturnValue({ rol: { rolName: 'ADMIN' } });
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should block any other role and redirect to /home', () => {
    authMock.currentUser.mockReturnValue({ rol: { rolName: 'USER' } });
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should block when no user and redirect to /home', () => {
    authMock.currentUser.mockReturnValue(null);
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should block when rol is null and redirect to /home', () => {
    authMock.currentUser.mockReturnValue({ rol: null });
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});