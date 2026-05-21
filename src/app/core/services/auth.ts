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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredential {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  genre: string;
  rolId: number | null;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

// ─── Service ──────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly API_URL = 'http://localhost:8086/api-v1/auth/getall'; 
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  isLoggedIn(): boolean {
    return this._currentUser() !== null;
  }

  // ─── Auth ──────────────────────────────────────────────────
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-12345',
      refreshToken: 'mock-refresh-token-12345',
    };
    return of(mockResponse).pipe(
      delay(800),
      tap(response => this._handleAuthSuccess(response))
    );
  }

  register(credentials: RegisterCredential): Observable<AuthResponse> {
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-12345',
      refreshToken: 'mock-refresh-token-12345',
    };
    return of(mockResponse).pipe(
      delay(800),
      tap(response => this._handleAuthSuccess(response))
    );
  }

  loginWithGoogle(): void {
    console.log('Google OAuth — connect backend');
  }

  loginWithFacebook(): void {
    console.log('Facebook OAuth — connect backend');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private _handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
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