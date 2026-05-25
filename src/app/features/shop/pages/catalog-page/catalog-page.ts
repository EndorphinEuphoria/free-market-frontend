import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FilterState, ProductoResponse, SortOption } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../components/product/product';
import { ProductFilters } from '../../components/product-filters/product-filters';
import { Products } from '../../../../core/services/products';
import { toSignal } from '@angular/core/rxjs-interop';
import { Cart } from '../../../../core/services/cart';
import { Auth } from '../../../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, Product, ProductFilters],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css',
})
export class CatalogPage {

  searchTerm = signal('');

  productsService = inject(Products);
  cartService = inject(Cart);
  auth = inject(Auth);
  router = inject(Router)

  allProducts = toSignal(this.productsService.getAllProducts(), {
    initialValue: [],
  });

  filters = signal<FilterState>({
    minPrice: 0,
    maxPrice: 500000,
    inStockOnly: false,
    sortBy: 'relevance',
  });

  viewMode = signal<'grid' | 'list'>('grid');
  isLoading = signal(false);

  filteredProducts = computed(() => {

  const f = this.filters();
  const search = this.searchTerm().toLowerCase().trim();

  let result = this.allProducts()
  
  return result
    .filter(p =>
      p.name.toLowerCase().includes(search)
    )
    .filter(
      p =>
        p.price >= f.minPrice &&
        p.price <= f.maxPrice &&
        (!f.inStockOnly || p.stock > 0)
    )
    .sort((a, b) =>
      f.sortBy === 'price-asc'
        ? a.price - b.price
        : f.sortBy === 'price-desc'
        ? b.price - a.price
        : 0
    );
});

  onFiltersChange(newFilters: FilterState): void {
    this.filters.set(newFilters);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.filters.update(f => ({ ...f, sortBy: value }));
  }

  onAddToCart(product: ProductoResponse): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (product.stock === 0) return;
    this.cartService.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      url: product.url
    })
    
  }
}