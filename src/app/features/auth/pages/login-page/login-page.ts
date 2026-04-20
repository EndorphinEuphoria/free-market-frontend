import { afterNextRender, Component, inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { LoginForm } from '../../components/login-form/login-form';
import { APP_THEME } from '../../../../core/config/theme.config';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage  {
  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);
 
  readonly theme = APP_THEME;
 
  /** TODO: Changed to avoid error with ngOnInit(), used afterNextRender(), check later */ 
  // ngOnInit(): void {
    
  // }

  constructor() {
    afterNextRender(() => {
      // Push theme tokens to :root so child components can use var(--color-primary) etc.
      const root = document.documentElement;

      this.renderer.setStyle(root, '--color-primary', APP_THEME.primaryColor, 2);
      this.renderer.setStyle(root, '--color-primary-hover', APP_THEME.primaryHover, 2);
      this.renderer.setStyle(root, '--font-heading', APP_THEME.headingFont, 2);
      this.renderer.setStyle(root, '--font-body', APP_THEME.bodyFont, 2);
    })
  }
 
  onLoginSuccess(): void {
    // BACKEND: change '/home' with actual route when ready
    this.router.navigate(['/home']);
  }
}
