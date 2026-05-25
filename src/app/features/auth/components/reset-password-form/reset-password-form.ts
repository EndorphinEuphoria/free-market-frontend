import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormGroup, FormControl, Validators,
  ReactiveFormsModule, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Auth } from '../../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '../../../../core/services/config-service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('newPassword')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-form.html',
  styleUrl: './reset-password-form.css',
})
export class ResetPasswordForm implements OnInit {
  private readonly auth          = inject(Auth);
  private readonly router        = inject(Router);
  private readonly configService = inject(ConfigService);

  step         = signal<'token' | 'password' | 'done'>('token');
  isLoading    = signal(false);
  serverError  = signal('');
  showPassword = signal(false);

  tokenForm = new FormGroup({
    token: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  passwordForm = new FormGroup({
    newPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
      nonNullable: true,
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  }, { validators: passwordsMatch });

  get token():           AbstractControl { return this.tokenForm.get('token')!; }
  get newPassword():     AbstractControl { return this.passwordForm.get('newPassword')!; }
  get confirmPassword(): AbstractControl { return this.passwordForm.get('confirmPassword')!; }

  ngOnInit(): void {
    this.configService.getPublicConfig().subscribe({
      next: (data) => this.configService.applyStyles({
        idUser:         1,
        commerceName:   data.commerceName,
        logoUrl:        data.logoUrl        ?? '',
        favicomUrl:     data.favicomUrl     ?? '',
        principalFont:  data.principalFont,
        primaryColor:   data.primaryColor,
        secondaryColor: data.secondaryColor,
        updateAt:       data.updateDate,
      }),
      error: () => {}
    });
  }

  togglePassword(): void { this.showPassword.update(v => !v); }

  onSubmitToken(): void {
    if (this.tokenForm.invalid) { this.tokenForm.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.serverError.set('');
    const { token } = this.tokenForm.getRawValue();
    this.auth.validateToken(token).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set('password');
      },
      error: (err) => {
        this.serverError.set(err?.error?.message ?? 'Invalid or expired token.');
        this.isLoading.set(false);
      },
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.serverError.set('');
    const token       = this.tokenForm.getRawValue().token;
    const newPassword = this.passwordForm.getRawValue().newPassword;
    this.auth.resetPassword(token, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set('done');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        const msg = err?.error;
        this.serverError.set(msg?.trim() ? msg : 'Something went wrong. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}