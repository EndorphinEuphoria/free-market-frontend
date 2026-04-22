import { Component, inject, Renderer2 } from '@angular/core';
import { RegisterForm } from '../../components/register-form/register-form';
import { Router } from '@angular/router';
import { APP_THEME } from '../../../../core/config/theme.config';

@Component({
  selector: 'app-register-page',
  imports: [RegisterForm],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);

  readonly theme = APP_THEME;

  ngOnInit(): void {
    const root = document.documentElement;
    this.renderer.setStyle(root, '--color-primary', APP_THEME.primaryColor, 2);
    this.renderer.setStyle(root, '--color-primary-hover', APP_THEME.primaryHover, 2);
    this.renderer.setStyle(root, '--font-heading', APP_THEME.headingFont, 2);
    this.renderer.setStyle(root, '--font-body', APP_THEME.bodyFont, 2);
  }

  onRegisterSuccess(): void {
    // ─── BACKEND: navigate to email verification, onboarding, or login ──────
    // Option A — redirect to login after registration:
    //   this.router.navigate(['/login']);
    // Option B — redirect to onboarding if your flow has one:
    //   this.router.navigate(['/onboarding']);
    this.router.navigate(['/login']);
  }

}
