import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { ConfigService } from '../../../../core/services/config-service';
import { APP_THEME } from '../../../../core/config/theme.config';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound implements OnInit {
  private router     = inject(Router);
  private auth       = inject(Auth);
  private platformId = inject(PLATFORM_ID);

  primaryColor = signal(APP_THEME.primaryColor);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const cssVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--commerce-primary')
        .trim();
      if (cssVar) this.primaryColor.set(cssVar);
    }
  }

  goHome(): void {
    const rol = this.auth.currentUser()?.rol?.rolName?.toUpperCase();
    if (rol === 'ADMIN') this.router.navigate(['/admin']);
    else if (rol === 'DELIVERY') this.router.navigate(['/delivery']);
    else this.router.navigate(['/home']);
  }
}