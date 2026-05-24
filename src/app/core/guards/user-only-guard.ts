import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const userOnlyGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const rol = auth.currentUser()?.rol?.rolName;

  if (rol !== 'ADMIN' && rol !== 'DELIVERY') return true;

  rol === 'ADMIN'
    ? router.navigate(['/admin'])
    : router.navigate(['/delivery'])
  return false;
};
