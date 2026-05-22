// auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http   = inject(HttpClient);

  const token = localStorage.getItem('token');

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
            // Si el refresh falló, limpia todo y manda al login
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