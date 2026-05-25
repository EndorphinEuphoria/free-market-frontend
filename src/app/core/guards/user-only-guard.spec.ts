// user-only.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, CanActivateFn } from '@angular/router';
import { vi } from 'vitest';
import { userOnlyGuard } from './user-only-guard';
import { Auth } from '../services/auth';

describe('userOnlyGuard', () => {
  let router: Router;
  let authMock: { currentUser: ReturnType<typeof vi.fn> };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => userOnlyGuard(...guardParameters));

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

  it('should allow USER role', () => {
    authMock.currentUser.mockReturnValue({ rol: { rolName: 'USER' } });
    expect(executeGuard({} as any, {} as any)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow when no user', () => {
    authMock.currentUser.mockReturnValue(null);
    expect(executeGuard({} as any, {} as any)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow when rol is null', () => {
    authMock.currentUser.mockReturnValue({ rol: null });
    expect(executeGuard({} as any, {} as any)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should block ADMIN and redirect to /admin', () => {
    authMock.currentUser.mockReturnValue({ rol: { rolName: 'ADMIN' } });
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should block DELIVERY and redirect to /delivery', () => {
    authMock.currentUser.mockReturnValue({ rol: { rolName: 'DELIVERY' } });
    expect(executeGuard({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/delivery']);
  });
});