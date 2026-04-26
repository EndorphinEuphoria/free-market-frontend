import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, delay } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredential {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  genre: string;
  rolId: number | null; /** TODO: Change to number if necessary */
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // ─── BACKEND: replace with API URL
  // private readonly API_URL = 'https://your-api.com/auth';
 
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
 
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
 
  isLoggedIn(): boolean {
    return this._currentUser() !== null;
  }
 
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // BACKEND: replace mock with real HTTP call
    // return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
    //   tap(response => this._handleAuthSuccess(response))
    // );
 
    // MOCK: simulates a successful login after 800ms
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-12345',
      user: { id: '1', email: credentials.email, name: 'Demo User' },
    };
    return of(mockResponse).pipe(
      delay(800),
      tap(response => this._handleAuthSuccess(response))
    );
  }

  register(credentials: RegisterCredential): Observable<AuthResponse> {
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-12345',
      user: { id: '1', email: credentials.email, name: 'Demo User' }
    };
    return of(mockResponse).pipe(
      delay(800),
      tap(response => this._handleAuthSuccess(response))
    );
  }
 
  loginWithGoogle(): void {
    // BACKEND: implement OAuth redirect or popup
    // window.location.href = `${this.API_URL}/google`;
    console.log('Google OAuth — connect backend');
  }
 
  loginWithFacebook(): void {
    // BACKEND: implement OAuth redirect or popup
    // window.location.href = `${this.API_URL}/facebook`;
    console.log('Facebook OAuth — connect backend');
  }
 
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
 
  // BACKEND: call this on app init to restore session from stored token
  // restoreSession(): void {
  //   const token = localStorage.getItem('token');
  //   const user  = localStorage.getItem('user');
  //   if (token && user) this._currentUser.set(JSON.parse(user));
  // }
 
  private _handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }
}
