// admin-only.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { vi } from 'vitest';
import { adminOnlyGuard } from './admin-only-guard';
import { Auth } from '../services/auth';

describe('adminOnlyGuard', () => {
  let router: Router;
  let authMock: { currentUser: ReturnType<typeof vi.fn> };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminOnlyGuard(...guardParameters));

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

  it('should allow ADMIN', () => {
    authMock.currentUser.mockReturnValue({ rol: { rolName: 'ADMIN' } });
    expect(executeGuard({} as any, {} as any)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should block DELIVERY and redirect to /delivery', () => {
    authMock.currentUser.mockReturnValue({ rol: { rolName: 'DELIVERY' } });
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/delivery']);
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

  it('should block when rol is undefined and redirect to /home', () => {
    authMock.currentUser.mockReturnValue({ rol: null });
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});