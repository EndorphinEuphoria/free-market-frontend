import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Auth, LoginCredentials, RegisterCredentials } from './auth';

describe('Auth', () => {
  let service: Auth;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    service = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no user logged in', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should login and store token', () => {
    const credentials: LoginCredentials = { username: 'user', password: '1234' };
    const fakeToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
      btoa(JSON.stringify({ sub: 'user', userId: 1, roles: ['USER'] })) + '.sig';

    service.login(credentials).subscribe();

    const req = http.expectOne('http://localhost:8086/api-v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush({ token: fakeToken, refreshToken: 'refresh123' });

    expect(localStorage.getItem('token')).toBe(fakeToken);
    expect(localStorage.getItem('refreshToken')).toBe('refresh123');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.username).toBe('user');
    expect(service.currentUser()?.userId).toBe(1);
  });

  it('should set role from token on login', () => {
    const credentials: LoginCredentials = { username: 'admin', password: '1234' };
    const fakeToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
      btoa(JSON.stringify({ sub: 'admin', userId: 2, roles: ['ADMIN'] })) + '.sig';

    service.login(credentials).subscribe();
    http.expectOne('http://localhost:8086/api-v1/auth/login')
      .flush({ token: fakeToken, refreshToken: 'refresh456' });

    expect(service.currentUser()?.rol?.rolName).toBe('ADMIN');
  });

  it('should restore session from localStorage', () => {
    const user = { userId: 1, username: 'user', rol: { rolName: 'USER' } };
    localStorage.setItem('token', 'sometoken');
    localStorage.setItem('user', JSON.stringify(user));

    service.restoreSession();

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.username).toBe('user');
  });

  it('should not restore session if no token in localStorage', () => {
    service.restoreSession();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should call register endpoint', () => {
    const credentials: RegisterCredentials = {
      email: 'test@test.com',
      password: '1234',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      genre: 'MALE',
      rol: { rolId: 2 }
    };
    const fakeToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
      btoa(JSON.stringify({ sub: 'testuser', userId: 3, roles: ['USER'] })) + '.sig';

    service.register(credentials).subscribe();

    const req = http.expectOne('http://localhost:8086/api-v1/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({ token: fakeToken, refreshToken: 'refresh789' });
  });

  it('should call requestPasswordReset endpoint', () => {
    service.requestPasswordReset('test@test.com').subscribe();

    const req = http.expectOne('http://localhost:8086/api-v1/auth/password/reset-request');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com' });
    req.flush(null);
  });

  it('should call resetPassword endpoint', () => {
    service.resetPassword('token123', 'newpass').subscribe();

    const req = http.expectOne('http://localhost:8086/api-v1/auth/password/reset');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'token123', newPassword: 'newpass' });
    req.flush(null);
  });

  it('should call validateToken endpoint', () => {
    service.validateToken('token123').subscribe();

    const req = http.expectOne('http://localhost:8086/api-v1/auth/password/validate-token');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
});