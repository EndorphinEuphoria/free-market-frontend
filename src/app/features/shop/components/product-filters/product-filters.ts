import { Component, effect, input, output, signal } from '@angular/core';
import { FilterState } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-filters',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.css',
})
export class ProductFilters {
  filters = input.required<FilterState>();

  filtersChange = output<FilterState>();

  // Estado local del formulario
  minPrice = signal(0);
  maxPrice = signal(500000);
  inStockOnly = signal(false);

  // Sincronizar cuando cambien los filtros desde el padre
  constructor() {
    effect(() => {
      const f = this.filters();
      this.minPrice.set(f.minPrice);
      this.maxPrice.set(f.maxPrice);
      this.inStockOnly.set(f.inStockOnly || false);
    });
  }

  onMinPrice(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    if (val <= this.maxPrice()) {
      this.minPrice.set(val);
      this.emit();
    }
  }

  onMaxPrice(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    if (val >= this.minPrice()) {
      this.maxPrice.set(val);
      this.emit()
    }
  }

  onStockChange(event: Event): void {
    this.inStockOnly.set((event.target as HTMLInputElement).checked);
    this.emit();
  }

  clearAll(): void {
    this.minPrice.set(0);
    this.maxPrice.set(500000);
    this.inStockOnly.set(false);
    this.emit();
  }

  private emit(): void {
    this.filtersChange.emit({
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      inStockOnly: this.inStockOnly(),
      sortBy: this.filters().sortBy,
    });
  }
}
