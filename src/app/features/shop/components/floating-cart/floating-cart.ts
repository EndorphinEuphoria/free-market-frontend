import { Component, inject } from '@angular/core';
import { Cart } from '../../../../core/services/cart';

@Component({
  selector: 'app-floating-cart',
  imports: [],
  templateUrl: './floating-cart.html',
  styleUrl: './floating-cart.css',
})
export class FloatingCart {
  cartService = inject(Cart);

  checkout(): void {
    this.cartService.checkout().subscribe({
      next: (res) => {
        console.log('Reserva creada:', res);
        this.cartService.clearCart();
      },
      error: (err) => console.error('Error al reservar:', err),
    });
  }
}
