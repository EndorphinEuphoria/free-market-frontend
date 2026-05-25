import { Component, effect, inject, signal } from '@angular/core';
import { Cart } from '../../../../core/services/cart';
import { ClpFormatPipe } from '../../../../core/pipes/clp-format-pipe';
import { Auth } from '../../../../core/services/auth';
import { LocationService } from '../../../../core/services/location-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-floating-cart',
  imports: [ClpFormatPipe],
  templateUrl: './floating-cart.html',
  styleUrl: './floating-cart.css',
})
export class FloatingCart {
  cartService = inject(Cart);
  auth = inject(Auth);
  locationService = inject(LocationService);
  router = inject(Router);

  reservaExitosa = signal(false);
  hasLocation = signal(false);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user?.userId) {
        this.locationService.getLocation(user.userId).subscribe({
          next: () => this.hasLocation.set(true),
          error: () => this.hasLocation.set(false)
        });
      }
    });
  }

  checkout(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.hasLocation()) {
      this.cartService.closeCart();
      this.router.navigate(['/profile']);
      return;
    }

    this.cartService.checkout().subscribe({
      next: () => {
        this.cartService.clearCart();
        this.cartService.closeCart();
        this.reservaExitosa.set(true);
        setTimeout(() => this.reservaExitosa.set(false), 4000);
      },
      error: (err) => console.error('Error al reservar:', err),
    });
  }
}
