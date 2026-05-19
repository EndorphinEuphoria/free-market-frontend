import { Component, effect, input, output, signal } from '@angular/core';
import { Category, FilterState } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-filters',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.css',
})
export class ProductFilters {
  categories = input.required<Category[]>();
  filters = input.required<FilterState>();

  filtersChange = output<FilterState>();

  // Estado local del formulario
  selectedCategories = signal<string[]>([]);
  minPrice = signal(0);
  maxPrice = signal(0);
  minRating = signal(0);
  inStockOnly = signal(false);

  ratings = [5, 4, 3, 2, 1];

  // Sincronizar cuando cambien los filtros desde el padre
  constructor() {
    effect(() => {
      const f = this.filters();
      this.selectedCategories.set(f.categories);
      this.minPrice.set(f.minPrice);
      this.maxPrice.set(f.maxPrice);
      this.minRating.set(f.minRating);
      this.inStockOnly.set(f.inStockOnly);
    });
  }

  toggleCategory(id: string): void {
    const current = this.selectedCategories();
    const updated = current.includes(id)
      ? current.filter(c => c !== id)
      : [...current, id];
    this.selectedCategories.set(updated);
    this.emit();
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

  setRating(rating: number): void {
    this.minRating.set(this.minRating() === rating ? 0 : rating);
    this.emit();
  }

  onStockChange(event: Event): void {
    this.inStockOnly.set((event.target as HTMLInputElement).checked);
    this.emit();
  }

  clearAll(): void {
    this.selectedCategories.set([]);
    this.minPrice.set(0);
    this.maxPrice.set(1000);
    this.minRating.set(0);
    this.inStockOnly.set(false);
    this.emit();
  }

  private emit(): void {
    this.filtersChange.emit({
      categories: this.selectedCategories(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      minRating: this.minRating(),
      inStockOnly: this.inStockOnly(),
      sortBy: this.filters().sortBy,
    });
  }
}
