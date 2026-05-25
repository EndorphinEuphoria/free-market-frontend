import { Component, inject, signal, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Auth } from '../../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '../../../../core/services/config-service';

@Component({
  selector: 'app-forgot-password-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password-form.html',
  styleUrl: './forgot-password-form.css',
})
export class ForgotPasswordForm implements OnInit {
  private readonly auth          = inject(Auth);
  private readonly router        = inject(Router);
  private readonly configService = inject(ConfigService);

  isLoading   = signal(false);
  serverError = signal('');

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
  });

  get email(): AbstractControl { return this.form.get('email')!; }

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

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.serverError.set('');
    this.auth.requestPasswordReset(this.form.getRawValue().email.trim()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.serverError.set(err?.error?.message ?? 'Email not found.');
        this.isLoading.set(false);
      },
    });
  }
}