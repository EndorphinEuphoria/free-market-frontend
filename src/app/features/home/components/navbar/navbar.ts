import { Component, HostListener, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { Router, RouterLinkActive, RouterLinkWithHref } from '@angular/router';
import { Cart } from '../../../../core/services/cart';
import { ConfigService } from '../../../../core/services/config-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLinkActive, RouterLinkWithHref],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly auth = inject(Auth)
  readonly router = inject(Router)
  readonly cartService = inject(Cart)
  readonly configService = inject(ConfigService);

  isScrolled       = signal(false);
  isMobileMenuOpen = signal(false);
  isInShop = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  openCart(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return
    }
    if (!this.router.url.startsWith('/shop')) {
      return;
    }
    this.cartService.openCart();
  }
}