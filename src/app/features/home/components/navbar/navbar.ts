import { Component, HostListener, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';
import { ConfigService } from '../../../../core/services/config-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLinkActive, RouterLinkWithHref],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly auth         = inject(Auth);
  readonly configService = inject(ConfigService);

  isScrolled       = signal(false);
  isMobileMenuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
}