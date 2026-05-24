import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { userOnlyGuard } from './user-only-guard';

describe('userOnlyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => userOnlyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
