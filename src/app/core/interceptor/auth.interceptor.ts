import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router     = inject(Router);
  const http       = inject(HttpClient);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token   = localStorage.getItem('token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401 && !req.url.includes('/refresh')) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.clear();
          router.navigate(['/login']);
          return throwError(() => error);
        }
        return http.post<{ token: string; refreshToken: string }>(
          'http://localhost:8086/api-v1/auth/refresh',
          { refreshToken }
        ).pipe(
          switchMap(response => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.token}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            localStorage.clear();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};