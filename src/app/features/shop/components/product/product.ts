import { Component, input, output } from '@angular/core';
import { ProductoResponse } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { ClpFormatPipe } from '../../../../core/pipes/clp-format-pipe';

@Component({
  selector: 'app-product',
  imports: [CommonModule, ClpFormatPipe],
  templateUrl: './product.html',
  styleUrl: './product.css',
})

export class Product {
  product = input.required<ProductoResponse>();

  addToCart = output<ProductoResponse>();
  toggleFavorite = output<ProductoResponse>();

  onAddToCart(event: MouseEvent): void {
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }

  onToggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.product());
  }
}
