import { Component, inject } from '@angular/core';
import { ForgotPasswordForm } from '../../components/forgot-password-form/forgot-password-form';
import { ConfigService } from '../../../../core/services/config-service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ForgotPasswordForm],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.css',
})
export class ForgotPasswordPage {
  readonly configService = inject(ConfigService);
}