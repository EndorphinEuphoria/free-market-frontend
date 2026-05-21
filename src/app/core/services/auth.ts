import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, delay } from 'rxjs';
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

export interface User2 {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  status: 'active' | 'inactive';
  idRol: number;
}

export interface UserToken {
  userId: number;
  username: string;
  rol?: {
    rolName: string;
  }
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials{
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  genre: string;
  rol: {
    rolId: number | null;
  }
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

// ─── Service ──────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class Auth {

  private readonly API_URL = 'http://localhost:8086/api-v1/auth';
 
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
 
  private _currentUser = signal<UserToken | null>(null);

  readonly currentUser = this._currentUser.asReadonly();

  isLoggedIn(): boolean {
    return this._currentUser() !== null;
  }

  // ─── Auth ──────────────────────────────────────────────────
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => this._handleAuthSuccess(response))
      )
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, credentials)
      .pipe(
        tap(response => this._handleAuthSuccess(response))
      );

  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
 
  restoreSession(): void {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) this._currentUser.set(JSON.parse(user));
  }
 
  private _handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);

    const payload = this.decodeToken(response.token);

    const user: UserToken = {
      userId: payload.userId,
      username: payload.sub,
      rol: {
        rolName: payload.roles?.[0] || 'USER'
      }
    };

    localStorage.setItem('user', JSON.stringify(user));

    this._currentUser.set(user);
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];

    const decodePayload = atob(payload);

    return JSON.parse(decodePayload);
  }

  // ─── PIM / Usuarios ────────────────────────────────────────
  getAllUsers(): Observable<User2[]> {
    return this.http.get<User2[]>(`${this.API_URL}/users`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }

  toggleStatus(id: number, status: 'active' | 'inactive'): Observable<User2> {
    return this.http.patch<User2>(`${this.API_URL}/users/${id}/status`, { status });
  }
}