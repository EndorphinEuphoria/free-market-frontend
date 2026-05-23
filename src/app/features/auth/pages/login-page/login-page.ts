import { afterNextRender, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginForm } from '../../components/login-form/login-form';
import { APP_THEME } from '../../../../core/config/theme.config';
import { ConfigService } from '../../../../core/services/config-service';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly router        = inject(Router);
  private readonly configService = inject(ConfigService);
  readonly theme = APP_THEME; 

  constructor() {
    afterNextRender(() => {
    });
  }

  onLoginSuccess(): void {
    this.router.navigate(['/home']);
  }
}