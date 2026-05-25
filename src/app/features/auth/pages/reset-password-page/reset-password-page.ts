import { Component, inject } from '@angular/core';
import { ResetPasswordForm } from '../../components/reset-password-form/reset-password-form';
import { ConfigService } from '../../../../core/services/config-service';

@Component({
  selector: 'app-reset-password-page',
  imports: [ResetPasswordForm],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.css',
})
export class ResetPasswordPage {
  readonly configService = inject(ConfigService);
}