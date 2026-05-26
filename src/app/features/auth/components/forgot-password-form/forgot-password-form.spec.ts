// forgot-password-form.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { ForgotPasswordForm } from './forgot-password-form';
import { Auth } from '../../../../core/services/auth';
import { ConfigService } from '../../../../core/services/config-service';

describe('ForgotPasswordForm', () => {
  let fixture: ComponentFixture<ForgotPasswordForm>;
  let component: ForgotPasswordForm;
  let authMock: { requestPasswordReset: ReturnType<typeof vi.fn> };
  let configMock: {
    getPublicConfig: ReturnType<typeof vi.fn>;
    applyStyles:     ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authMock = {
      requestPasswordReset: vi.fn().mockReturnValue(of(void 0))
    };
    configMock = {
      getPublicConfig: vi.fn().mockReturnValue(of({
        id: 1, commerceName: 'Test', logoUrl: '', favicomUrl: '',
        principalFont: 'Roboto', primaryColor: '#000', secondaryColor: '#fff', updateDate: '2025-01-01'
      })),
      applyStyles: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordForm],
      providers: [
        provideRouter([]),
        { provide: Auth,          useValue: authMock },
        { provide: ConfigService, useValue: configMock },
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(ForgotPasswordForm);
    component = fixture.componentInstance;
    router    = TestBed.inject(Router);
    fixture.detectChanges();

    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  describe('initialization', () => {
    it('should load and apply config on init', () => {
      expect(configMock.getPublicConfig).toHaveBeenCalled();
      expect(configMock.applyStyles).toHaveBeenCalled();
    });

    it('should start with empty form', () => {
      expect(component.form.getRawValue().email).toBe('');
    });

    it('should start with isLoading false', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should start with empty serverError', () => {
      expect(component.serverError()).toBe('');
    });
  });

  describe('form validation', () => {
    it('should be invalid when email is empty', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid with bad email format', () => {
      component.email.setValue('notanemail');
      expect(component.email.hasError('email')).toBe(true);
    });

    it('should be valid with correct email', () => {
      component.email.setValue('test@example.com');
      expect(component.form.valid).toBe(true);
    });

    it('should mark all touched on submit when invalid', () => {
      component.onSubmit();
      expect(component.email.touched).toBe(true);
      expect(authMock.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit — success', () => {
    beforeEach(() => component.email.setValue('test@example.com'));

    it('should call requestPasswordReset with trimmed email', () => {
        component.email.setValue('test@example.com');
        component.onSubmit();
        expect(authMock.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });

    it('should navigate to /reset-password on success', () => {
      component.onSubmit();
      expect(router.navigate).toHaveBeenCalledWith(['/reset-password']);
    });

    it('should set isLoading to false after success', () => {
      component.onSubmit();
      expect(component.isLoading()).toBe(false);
    });

    it('should clear serverError before submitting', () => {
      component.serverError.set('old error');
      component.onSubmit();
      expect(component.serverError()).toBe('');
    });
  });

  describe('onSubmit — error', () => {
    beforeEach(() => component.email.setValue('test@example.com'));

    it('should set serverError from response', () => {
      authMock.requestPasswordReset.mockReturnValue(
        throwError(() => ({ error: { message: 'Email not found' } }))
      );
      component.onSubmit();
      expect(component.serverError()).toBe('Email not found');
    });

    it('should fallback to default message when no error message', () => {
      authMock.requestPasswordReset.mockReturnValue(throwError(() => ({})));
      component.onSubmit();
      expect(component.serverError()).toBe('Email not found.');
    });

    it('should set isLoading to false after error', () => {
      authMock.requestPasswordReset.mockReturnValue(throwError(() => ({})));
      component.onSubmit();
      expect(component.isLoading()).toBe(false);
    });

    it('should not navigate on error', () => {
      authMock.requestPasswordReset.mockReturnValue(throwError(() => ({})));
      component.onSubmit();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});