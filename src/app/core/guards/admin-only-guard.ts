import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminOnlyGuard: CanActivateFn = () => {
  const auth       = inject(Auth);
  const router     = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  const rol = auth.currentUser()?.rol?.rolName;
  if (rol === 'ADMIN') return true;
  rol === 'DELIVERY'
    ? router.navigate(['/delivery'])
    : router.navigate(['/home']);
  return false;
};