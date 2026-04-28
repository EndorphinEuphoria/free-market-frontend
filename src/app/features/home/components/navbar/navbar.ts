import { Component, HostListener, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly auth = inject(Auth)

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  // Agrega sombra al navbar cuando se hace scroll
  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
}
