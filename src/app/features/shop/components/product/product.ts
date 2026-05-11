import { Component, input, output } from '@angular/core';
import { Prod } from '../../models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  imports: [CommonModule],
  templateUrl: './product.html',
  styleUrl: './product.css',
})

export class Product {
  product = input.required<Prod>();

  addToCart = output<Prod>();
  toggleFavorite = output<Prod>();

  onAddToCart(event: MouseEvent): void {
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }

  onToggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.product());
  }

  get stars(): number[] {
    return Array(5).fill(0);
  }
}
