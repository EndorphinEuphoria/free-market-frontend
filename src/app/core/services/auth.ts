import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// ─── Interfaces ───────────────────────────────────────────────
export interface User {
  userId: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  genre?: string;
  rol?: { rolName: string };
}

export interface UserToken {
  userId: number;
  username: string;
  rol?: { rolName: string };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  genre: string;
  rol: { rolId: number | null };
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}



// ─── Service ──────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly API_URL    = 'http://localhost:8086/api-v1/auth';
  private readonly http       = inject(HttpClient);
  private readonly router     = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private _currentUser = signal<UserToken | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  isLoggedIn(): boolean {
    return this._currentUser() !== null;
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(tap(response => this._handleAuthSuccess(response)));
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, credentials)
      .pipe(tap(response => this._handleAuthSuccess(response)));
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken }).subscribe({
        complete: () => this._clearSession()
      });
    } else {
      this._clearSession();
    }
  }

  restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) this._currentUser.set(JSON.parse(user));
  }

  private _clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private _handleAuthSuccess(response: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    const payload = this.decodeToken(response.token);
    const user: UserToken = {
      userId:   payload.userId,
      username: payload.sub,
      rol:      { rolName: payload.roles?.[0] || 'USER' }
    };
    localStorage.setItem('user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  private decodeToken(token: string): any {
    return JSON.parse(atob(token.split('.')[1]));
  }

  requestPasswordReset(email: string): Observable<void> {
  return this.http.post<void>(`${this.API_URL}/password/reset-request`, { email });
}

resetPassword(token: string, newPassword: string): Observable<void> {
  return this.http.post<void>(`${this.API_URL}/password/reset`, { token, newPassword });
}

validateToken(token: string): Observable<void> {
  return this.http.post<void>(`${this.API_URL}/password/validate-token`, { token });
}
}