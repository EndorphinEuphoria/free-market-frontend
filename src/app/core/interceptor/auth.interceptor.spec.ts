// auth.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  const TEST_URL     = 'http://localhost:8086/api-v1/test';
  const REFRESH_URL  = 'http://localhost:8086/api-v1/auth/refresh';
  const mockToken    = 'mock-token';
  const mockRefresh  = 'mock-refresh-token';
  const newToken     = 'new-token';
  const newRefresh   = 'new-refresh-token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    http     = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router   = TestBed.inject(Router);
    localStorage.clear();
    vi.spyOn(router, 'navigate');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Authorization header', () => {
    it('should attach Bearer token when token exists in localStorage', () => {
      localStorage.setItem('token', mockToken);
      http.get(TEST_URL).subscribe();
      const req = httpMock.expectOne(TEST_URL);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should not attach Authorization header when no token', () => {
      http.get(TEST_URL).subscribe();
      const req = httpMock.expectOne(TEST_URL);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('401 handling — no refresh token', () => {
    it('should clear localStorage and redirect to /login', () => {
      localStorage.setItem('token', mockToken);
      http.get(TEST_URL).subscribe({ error: () => {} });

      httpMock.expectOne(TEST_URL)
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('token')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('401 handling — with refresh token', () => {
    it('should call refresh endpoint and retry with new token', () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('refreshToken', mockRefresh);

      http.get(TEST_URL).subscribe(res => expect(res).toBeTruthy());

      httpMock.expectOne(TEST_URL)
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      const refreshReq = httpMock.expectOne(REFRESH_URL);
      expect(refreshReq.request.method).toBe('POST');
      expect(refreshReq.request.body).toEqual({ refreshToken: mockRefresh });
      refreshReq.flush({ token: newToken, refreshToken: newRefresh });

      const retryReq = httpMock.expectOne(TEST_URL);
      expect(retryReq.request.headers.get('Authorization')).toBe(`Bearer ${newToken}`);
      retryReq.flush({ success: true });

      expect(localStorage.getItem('token')).toBe(newToken);
      expect(localStorage.getItem('refreshToken')).toBe(newRefresh);
    });

    it('should clear localStorage and redirect if refresh fails', () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('refreshToken', mockRefresh);

      http.get(TEST_URL).subscribe({ error: () => {} });

      httpMock.expectOne(TEST_URL)
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      httpMock.expectOne(REFRESH_URL)
        .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('non-401 errors', () => {
    it('should propagate 500 errors without redirecting', () => {
      localStorage.setItem('token', mockToken);
      let capturedError!: HttpErrorResponse;

      http.get(TEST_URL).subscribe({ error: (err: HttpErrorResponse) => capturedError = err });

      httpMock.expectOne(TEST_URL)
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(capturedError.status).toBe(500);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should propagate 403 errors without redirecting', () => {
      localStorage.setItem('token', mockToken);
      let capturedError!: HttpErrorResponse;

      http.get(TEST_URL).subscribe({ error: (err: HttpErrorResponse) => capturedError = err });

      httpMock.expectOne(TEST_URL)
        .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(capturedError.status).toBe(403);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('refresh URL passthrough', () => {
    it('should not attempt refresh when 401 comes from the refresh endpoint itself', () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('refreshToken', mockRefresh);
      let capturedError!: HttpErrorResponse;

      http.post(REFRESH_URL, {}).subscribe({ error: (err: HttpErrorResponse) => capturedError = err });

      httpMock.expectOne(REFRESH_URL)
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(capturedError.status).toBe(401);
      expect(router.navigate).not.toHaveBeenCalled();
      httpMock.expectNone(REFRESH_URL);
    });
  });
});