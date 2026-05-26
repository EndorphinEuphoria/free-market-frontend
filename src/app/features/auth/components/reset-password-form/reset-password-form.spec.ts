// reset-password-form.spec.ts

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { ResetPasswordForm } from './reset-password-form';
import { Auth } from '../../../../core/services/auth';
import { ConfigService } from '../../../../core/services/config-service';

describe('ResetPasswordForm', () => {
  let component: ResetPasswordForm;
  let fixture: ComponentFixture<ResetPasswordForm>;

  let authSpy: {
    validateToken: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
  };

  let configSpy: {
    getPublicConfig: ReturnType<typeof vi.fn>;
    applyStyles: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authSpy = {
      validateToken: vi.fn(),
      resetPassword: vi.fn(),
    };

    configSpy = {
      getPublicConfig: vi.fn().mockReturnValue(
        of({
          commerceName: 'Free Market',
          logoUrl: '',
          favicomUrl: '',
          principalFont: 'Roboto',
          primaryColor: '#000',
          secondaryColor: '#fff',
          updateDate: '2026-01-01'
        })
      ),
      applyStyles: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordForm],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: authSpy
        },
        {
          provide: ConfigService,
          useValue: configSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordForm);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load public config on init', () => {
    expect(configSpy.getPublicConfig).toHaveBeenCalled();
    expect(configSpy.applyStyles).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBe(false);

    component.togglePassword();

    expect(component.showPassword()).toBe(true);
  });

  it('should not submit token form if invalid', () => {
    component.onSubmitToken();

    expect(component.tokenForm.invalid).toBe(true);
    expect(authSpy.validateToken).not.toHaveBeenCalled();
    expect(component.token.touched).toBe(true);
  });

  it('should validate token successfully', () => {
    authSpy.validateToken.mockReturnValue(of({}));

    component.tokenForm.setValue({
      token: '123456'
    });

    component.onSubmitToken();

    expect(authSpy.validateToken).toHaveBeenCalledWith('123456');
    expect(component.step()).toBe('password');
    expect(component.isLoading()).toBe(false);
  });

  it('should set server error when token validation fails', () => {
    authSpy.validateToken.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Invalid token'
        }
      }))
    );

    component.tokenForm.setValue({
      token: 'bad-token'
    });

    component.onSubmitToken();

    expect(component.serverError()).toBe('Invalid token');
    expect(component.isLoading()).toBe(false);
  });

  it('should detect password mismatch', () => {
    component.passwordForm.setValue({
      newPassword: '123456',
      confirmPassword: '654321'
    });

    expect(component.passwordForm.hasError('mismatch')).toBe(true);
  });

  it('should not submit password form if invalid', () => {
    component.onSubmitPassword();

    expect(component.passwordForm.invalid).toBe(true);
    expect(authSpy.resetPassword).not.toHaveBeenCalled();
  });

  it('should reset password successfully', async () => {
    vi.useFakeTimers();

    authSpy.resetPassword.mockReturnValue(of({}));

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.tokenForm.setValue({
        token: 'token123'
    });

    component.passwordForm.setValue({
        newPassword: '123456',
        confirmPassword: '123456'
    });

    component.onSubmitPassword();

    expect(authSpy.resetPassword).toHaveBeenCalledWith(
        'token123',
        '123456'
    );

    expect(component.step()).toBe('done');

    vi.advanceTimersByTime(2000);

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);

    vi.useRealTimers();
    });

  it('should set default error message on password reset failure', () => {
    authSpy.resetPassword.mockReturnValue(
      throwError(() => ({
        error: ''
      }))
    );

    component.tokenForm.setValue({
      token: 'token123'
    });

    component.passwordForm.setValue({
      newPassword: '123456',
      confirmPassword: '123456'
    });

    component.onSubmitPassword();

    expect(component.serverError()).toBe(
      'Something went wrong. Please try again.'
    );

    expect(component.isLoading()).toBe(false);
  });

  it('should set backend error message on password reset failure', () => {
    authSpy.resetPassword.mockReturnValue(
      throwError(() => ({
        error: 'Custom backend error'
      }))
    );

    component.tokenForm.setValue({
      token: 'token123'
    });

    component.passwordForm.setValue({
      newPassword: '123456',
      confirmPassword: '123456'
    });

    component.onSubmitPassword();

    expect(component.serverError()).toBe('Custom backend error');
  });
});