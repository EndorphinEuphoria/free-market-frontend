import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
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
  private elementRef = inject(ElementRef);

  isScrolled       = signal(false);
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
  if (!this.elementRef.nativeElement.contains(event.target)) {
    this.isUserMenuOpen.set(false);
  }
}
}