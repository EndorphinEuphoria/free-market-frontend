// login-form.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { LoginForm } from './login-form';
import { Auth } from '../../../../core/services/auth';

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;
  let component: LoginForm;
  let authMock: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authMock = { login: vi.fn().mockReturnValue(of(void 0)) };

    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authMock },
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should start with empty form', () => {
      expect(component.loginForm.getRawValue()).toEqual({ username: '', password: '' });
    });

    it('should start with isLoading false', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should start with empty serverError', () => {
      expect(component.serverError()).toBe('');
    });

    it('should start with showPassword false', () => {
      expect(component.showPassword()).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should be invalid when both fields are empty', () => {
      expect(component.loginForm.invalid).toBe(true);
    });

    it('should be invalid when username is empty', () => {
      component.password.setValue('pass123');
      expect(component.username.hasError('required')).toBe(true);
    });

    it('should be invalid when password is empty', () => {
      component.username.setValue('alice');
      expect(component.password.hasError('required')).toBe(true);
    });

    it('should be invalid when username exceeds 30 characters', () => {
      component.username.setValue('a'.repeat(31));
      expect(component.username.hasError('maxlength')).toBe(true);
    });

    it('should be valid with correct username and password', () => {
      component.username.setValue('alice');
      component.password.setValue('pass123');
      expect(component.loginForm.valid).toBe(true);
    });

    it('should mark all touched on submit when invalid', () => {
      component.onSubmit();
      expect(component.username.touched).toBe(true);
      expect(component.password.touched).toBe(true);
      expect(authMock.login).not.toHaveBeenCalled();
    });
  });

  describe('togglePassword', () => {
    it('should toggle showPassword from false to true', () => {
      component.togglePassword();
      expect(component.showPassword()).toBe(true);
    });

    it('should toggle showPassword back to false', () => {
      component.togglePassword();
      component.togglePassword();
      expect(component.showPassword()).toBe(false);
    });
  });

  describe('onSubmit — success', () => {
    beforeEach(() => {
      component.username.setValue('alice');
      component.password.setValue('pass123');
    });

    it('should call login with trimmed credentials', () => {
      component.username.setValue('  alice  ');
      component.password.setValue('pass123');
      component.onSubmit();
      expect(authMock.login).toHaveBeenCalledWith({ username: 'alice', password: 'pass123' });
    });

    it('should emit loginSuccess on success', () => {
      const emitSpy = vi.spyOn(component.loginSuccess, 'emit');
      component.onSubmit();
      expect(emitSpy).toHaveBeenCalled();
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
    beforeEach(() => {
      component.username.setValue('alice');
      component.password.setValue('pass123');
    });

    it('should set serverError from response', () => {
      authMock.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );
      component.onSubmit();
      expect(component.serverError()).toBe('Invalid credentials');
    });

    it('should fallback to default message when no error message', () => {
      authMock.login.mockReturnValue(throwError(() => ({})));
      component.onSubmit();
      expect(component.serverError()).toBe('Invalid username or password.');
    });

    it('should set isLoading to false after error', () => {
      authMock.login.mockReturnValue(throwError(() => ({})));
      component.onSubmit();
      expect(component.isLoading()).toBe(false);
    });

    it('should not emit loginSuccess on error', () => {
      const emitSpy = vi.spyOn(component.loginSuccess, 'emit');
      authMock.login.mockReturnValue(throwError(() => ({})));
      component.onSubmit();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});