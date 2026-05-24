import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const deliveryOnlyGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const rol = auth.currentUser()?.rol?.rolName;

  if (rol === 'DELIVERY') return true;

  rol === 'ADMIN'
    ? router.navigate(['/admin'])
    : router.navigate(['/home']);;
  return false;

  
};
