import { Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, RegisterCredential } from '../../../../core/services/auth';
import { ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const repeat = group.get('repeatPassword')?.value;
  return password === repeat ? null : { passwordMismatch: true }
}

@Component({
  selector: 'app-register-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css',
})
export class RegisterForm {
  private readonly auth = inject(Auth);

  readonly registerSuccess = output<void>();

  isLoading = signal(false);
  serverError = signal('')
  showPassword = signal(false);
  showRepeat = signal(false);

  registerForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)], // TODO: add validation
      nonNullable: true
    }),
    repeatPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)], // TODO: add validation
      nonNullable: true
    }),
    username: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(30)],
      nonNullable: true
    }),
    firstName: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(30)],
      nonNullable: true
    }),
    lastName: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(30)],
      nonNullable: true
    }),
    genre: new FormControl('', {
      validators: [Validators.required, Validators.max(3)],
      nonNullable: true /** Use dirty validation for genre */
    }),
    rolId: new FormControl(<number | null> (null), [Validators.required, Validators.max(2)]),
  });

  /** DRY methods */
  get email(): AbstractControl { return this.registerForm.get('email')!; }
  get password(): AbstractControl { return this.registerForm.get('password')!; }
  get repeatPassword(): AbstractControl { return this.registerForm.get('repeatPassword')!; }

  get showMismatch(): boolean {
    return (
      this.registerForm.hasError('passwordMismatch') &&
      this.repeatPassword.touched
    )
  }

  togglePassword(): void {
    this.showPassword.update(v => !v); /** Logical NOT to set to true/false */
  }
  toggleRepeat(): void {
    this.showRepeat.update(v => !v); /** Logical NOT to set to true/false */
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set('');

    const credentials: RegisterCredential = this.registerForm.getRawValue();

    this.auth.register(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.registerSuccess.emit();
      },
      error: (err) => {
        // BACKEND: adjust error path to match API's shape
        // Express:  err.error.message
        // FastAPI:  err.error.detail
        // NestJS:   err.error.message
        this.serverError.set(err?.error?.message ?? 'Invalid email or password.');
        this.isLoading.set(false);
      }
    });
  }

  onGoogleLogin(): void {
    this.auth.loginWithGoogle();
  }
 
  onFacebookLogin(): void {
    this.auth.loginWithFacebook();
  }
}
