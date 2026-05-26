// register-form.spec.ts (Vitest)

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { RegisterForm } from './register-form';
import { Auth } from '../../../../core/services/auth';
import { provideRouter } from '@angular/router';

describe('RegisterForm', () => {
  let component: RegisterForm;
  let fixture: ComponentFixture<RegisterForm>;
  let authSpy: { register: ReturnType<typeof vi.fn> };

  const validFormData = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@test.com',
    password: '123456',
    repeatPassword: '123456',
    genre: 'MALE',
    rolId: 2
  };

    beforeEach(async () => {
    authSpy = {
        register: vi.fn()
    };

    await TestBed.configureTestingModule({
        imports: [RegisterForm],
        providers: [
        provideRouter([]),

        {
            provide: Auth,
            useValue: authSpy
        }
        ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterForm);
    component = fixture.componentInstance;

    fixture.detectChanges();
    });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();

    expect(component.registerForm.invalid).toBe(true);
    expect(authSpy.register).not.toHaveBeenCalled();
  });

  it('should detect password mismatch', () => {
    component.registerForm.patchValue({
      password: '123456',
      repeatPassword: '654321'
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
  });

  it('should submit valid form', () => {
    authSpy.register.mockReturnValue(of({}));

    component.registerForm.setValue(validFormData);

    component.onSubmit();

    expect(authSpy.register).toHaveBeenCalled();
  });

    it('should build credentials correctly', () => {
    authSpy.register.mockReturnValue(of({}));

    component.registerForm.setValue({
        ...validFormData,
        firstName: ' John ',
        lastName: ' Doe '
    });

    component.onSubmit();

    expect(authSpy.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@test.com',
        password: '123456',
        genre: 'MALE',
        rol: {
        rolId: 2
        }
    });
    });

  it('should emit registerSuccess on successful register', () => {
    authSpy.register.mockReturnValue(of({}));

    const emitSpy = vi.spyOn(component.registerSuccess, 'emit');

    component.registerForm.setValue(validFormData);

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should set server error on backend failure', () => {
    authSpy.register.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Email already exists'
        }
      }))
    );

    component.registerForm.setValue(validFormData);

    component.onSubmit();

    expect(component.serverError()).toBe('Email already exists');
    expect(component.isLoading()).toBe(false);
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBe(false);

    component.togglePassword();

    expect(component.showPassword()).toBe(true);
  });

  it('should toggle repeat password visibility', () => {
    expect(component.showRepeat()).toBe(false);

    component.toggleRepeat();

    expect(component.showRepeat()).toBe(true);
  });

  it('should mark all controls as touched when form is invalid', () => {
    component.onSubmit();

    expect(component.firstName.touched).toBe(true);
    expect(component.email.touched).toBe(true);
    expect(component.password.touched).toBe(true);
  });
});