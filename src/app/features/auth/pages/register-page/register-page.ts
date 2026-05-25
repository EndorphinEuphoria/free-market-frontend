import { Component, inject } from '@angular/core';
import { RegisterForm } from '../../components/register-form/register-form';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [RegisterForm],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private readonly router = inject(Router);

  onRegisterSuccess(): void {
    this.router.navigate(['/login']);
  }
}