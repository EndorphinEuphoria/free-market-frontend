import { Component, inject, signal, output } from '@angular/core';
import {   
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl 
} from '@angular/forms'
import { Auth, LoginCredentials } from '../../../../core/services/auth'
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
private readonly auth = inject(Auth);
 
  readonly loginSuccess = output<void>();
 
  isLoading = signal(false);
  serverError = signal('');
  showPassword = signal(false);
 
  loginForm = new FormGroup({
    username: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(30)],
      nonNullable: true,
    }),
    password: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });
 
  get username(): AbstractControl { return this.loginForm.get('username')!; }
  get password(): AbstractControl { return this.loginForm.get('password')!; }
 
  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
 
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
 
    this.isLoading.set(true);
    this.serverError.set('');
 
    const credentials: LoginCredentials = this.loginForm.getRawValue();
 
    this.auth.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loginSuccess.emit();
      },
      error: (err) => {
        // BACKEND: adjust error path to match API's shape
        // Express:  err.error.message
        // FastAPI:  err.error.detail
        // NestJS:   err.error.message
        this.serverError.set(err?.error?.message ?? 'Invalid username or password.');
        this.isLoading.set(false);
      },
    });
  }
 
}
