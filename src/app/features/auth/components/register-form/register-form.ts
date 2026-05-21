import { Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, RegisterCredentials } from '../../../../core/services/auth';
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
      validators: [Validators.required, Validators.minLength(6)],
      nonNullable: true
    }),
    repeatPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
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
      validators: [Validators.required],
      nonNullable: true
    }),
    rolId: new FormControl<number | null>(null, {
      validators: [Validators.required]
    }),
  }, {
  validators: passwordMatchValidator
  });

  /** DRY methods */
  get firstName(): AbstractControl { return this.registerForm.get('firstName')!; }
  get lastName(): AbstractControl { return this.registerForm.get('lastName')!; }
  get username(): AbstractControl { return this.registerForm.get('username')!; }
  get email(): AbstractControl { return this.registerForm.get('email')!; }
  get password(): AbstractControl { return this.registerForm.get('password')!; }
  get repeatPassword(): AbstractControl { return this.registerForm.get('repeatPassword')!; }
  get genre(): AbstractControl { return this.registerForm.get('genre')!; }
  get rolId(): AbstractControl { return this.registerForm.get('rolId')!; }

  get passwordMismatch(): boolean {
    const groupError = this.registerForm.hasError('passwordMismatch');
    const touched = this.repeatPassword.touched || this.password.touched;

    return groupError && touched;
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

  const formValue = this.registerForm.getRawValue();

  const credentials: RegisterCredentials = {
    firstName: formValue.firstName,
    lastName: formValue.lastName,
    username: formValue.username,
    email: formValue.email,
    password: formValue.password,
    genre: formValue.genre,
    rol: {
      rolId: formValue.rolId!
    } 
  };

    this.auth.register(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.registerSuccess.emit();
      },
      error: (err) => {
        const backendError =
          err?.error?.message ||
          err?.error?.error ||
          err?.error ||
          err?.message;

        this.serverError.set(
          typeof backendError === 'string'
            ? backendError
            : 'Something went wrong. Please try again later.'
        );

        this.isLoading.set(false);
      }
    });
  }

}
