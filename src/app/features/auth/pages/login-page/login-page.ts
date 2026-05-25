import { afterNextRender, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginForm } from '../../components/login-form/login-form';
import { APP_THEME } from '../../../../core/config/theme.config';
import { ConfigService } from '../../../../core/services/config-service';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})


export class LoginPage {
  private readonly router        = inject(Router);
  readonly configService = inject(ConfigService);
  private readonly auth = inject(Auth);
  readonly theme = APP_THEME; 

  constructor() {
  afterNextRender(() => {
    this.configService.getPublicConfig().subscribe({
      next: (config) => this.configService.applyStyles(config as any),
      error: () => {} 
    });
  });
}
  onLoginSuccess(): void {
    if (this.auth.currentUser()?.rol?.rolName === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (this.auth.currentUser()?.rol?.rolName === 'DELIVERY') {
      this.router.navigate(['/delivery']);
    } else {
      this.router.navigate(['/home']);
    }
  }

}