// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, CanActivateFn } from '@angular/router';
import { vi } from 'vitest';
import { authGuard } from './auth-guard';
import { Auth } from '../services/auth';

describe('authGuard', () => {
  let router: Router;
  let authMock: { isLoggedIn: ReturnType<typeof vi.fn> };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    authMock = { isLoggedIn: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authMock }
      ]
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should allow access when logged in', () => {
    authMock.isLoggedIn.mockReturnValue(true);
    expect(executeGuard({} as any, {} as any)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should block access and redirect to /login when not logged in', () => {
    authMock.isLoggedIn.mockReturnValue(false);
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});