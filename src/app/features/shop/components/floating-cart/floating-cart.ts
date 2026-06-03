import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cart } from '../../../../core/services/cart';
import { ClpFormatPipe } from '../../../../core/pipes/clp-format-pipe';
import { Auth } from '../../../../core/services/auth';
import { LocationService, LocationResponseForId } from '../../../../core/services/location-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-floating-cart',
  imports: [ClpFormatPipe, CommonModule],
  templateUrl: './floating-cart.html',
  styleUrl: './floating-cart.css',
})
export class FloatingCart {
  cartService     = inject(Cart);
  auth            = inject(Auth);
  locationService = inject(LocationService);
  router          = inject(Router);

  reservaExitosa  = signal(false);
  hasLocation     = signal(false);
  locations       = signal<LocationResponseForId[]>([]);
  selectedAddress = signal<string | null>(null);
  isCheckingOut   = signal(false);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user?.userId) {
        this.locationService.getAllLocations(user.userId).subscribe({
          next: (locs) => {
            this.locations.set(locs);
            this.hasLocation.set(locs.length > 0);
            const active = locs.find(l => l.active);
            if (active) this.selectedAddress.set(active.addressType);
          },
          error: () => {
            this.hasLocation.set(false);
            this.locations.set([]);
          }
        });
      }
    });
  }

  checkout(): void {
    if (this.isCheckingOut()) return;
    if (this.cartService.items().length === 0) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.hasLocation()) {
      this.cartService.closeCart();
      this.router.navigate(['/profile']);
      return;
    }

    this.isCheckingOut.set(true);

    const selected = this.selectedAddress();
    const current  = this.locations().find(l => l.active);

    if (selected && current?.addressType !== selected) {
      this.locationService.setActiveLocation(selected).subscribe({
        next:  () => this.proceedCheckout(),
        error: (err) => {
          console.error('Error setting active location:', err);
          this.isCheckingOut.set(false);
        }
      });
    } else {
      this.proceedCheckout();
    }
  }

  private proceedCheckout(): void {
    const selected = this.selectedAddress();
    const loc = this.locations().find(l => l.addressType === selected)
              ?? this.locations().find(l => l.active)
              ?? this.locations()[0];
    if (loc) this.cartService.setActiveAddress(loc.streetAddress);

    this.cartService.checkout().subscribe({
      next: () => {
        this.cartService.clearCart();
        this.cartService.closeCart();
        this.reservaExitosa.set(true);
        setTimeout(() => this.reservaExitosa.set(false), 4000);
        setTimeout(() => this.isCheckingOut.set(false), 3000);
      },
      error: (err) => {
        console.error('Error al reservar:', err);
        this.isCheckingOut.set(false);
      }
    });
  }

  getLabelForType(type: string): string {
    const map: Record<string, string> = {
      HOME: 'Home', WORK: 'Work', OTHER: 'Other'
    };
    return map[type] ?? type;
  }
}