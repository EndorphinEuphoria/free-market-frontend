import { Component, computed, OnInit, signal } from '@angular/core';
import { Category, FilterState, Prod, SortOption } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../components/product/product';
import { ProductFilters } from '../../components/product-filters/product-filters';

@Component({
  selector: 'app-catalog-page',
  imports: [CommonModule, FormsModule, Product, ProductFilters],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css',
})
export class CatalogPage implements OnInit {
  // ─── BACKEND: reemplazar con llamada a ProductService.getAll() ───────────
  allProducts = signal<Prod[]>([
    { id: 1, name: 'Silla Ergonómica Pro', category: 'Muebles', price: 299.99, originalPrice: 399.99, badge: '-25%', rating: 4, reviewCount: 128, inStock: true, imageUrl: 'https://placehold.co/400x400?text=Silla' },
    { id: 2, name: 'Escritorio de Madera', category: 'Muebles', price: 450.00, rating: 5, reviewCount: 64, inStock: true, imageUrl: 'https://placehold.co/400x400?text=Escritorio' },
    { id: 3, name: 'Lámpara LED de Escritorio', category: 'Iluminación', price: 49.99, originalPrice: 69.99, badge: 'Oferta', rating: 4, reviewCount: 312, inStock: true, imageUrl: 'https://placehold.co/400x400?text=Lampara' },
    { id: 4, name: 'Monitor 4K 27"', category: 'Electrónica', price: 599.00, rating: 5, reviewCount: 89, inStock: true, imageUrl: 'https://placehold.co/400x400?text=Monitor' },
    { id: 5, name: 'Teclado Mecánico', category: 'Electrónica', price: 129.99, badge: 'Nuevo', rating: 4, reviewCount: 201, inStock: false, imageUrl: 'https://placehold.co/400x400?text=Teclado' },
    { id: 6, name: 'Mouse Inalámbrico', category: 'Electrónica', price: 39.99, rating: 3, reviewCount: 445, inStock: true, imageUrl: 'https://placehold.co/400x400?text=Mouse' },
    { id: 7, name: 'Repisa Flotante', category: 'Muebles', price: 35.00, rating: 4, reviewCount: 78, inStock: true, imageUrl: 'https://placehold.co/400x400?text=Repisa' },
    { id: 8, name: 'Planta Artificial', category: 'Decoración', price: 24.99, badge: 'Nuevo', rating: 5, reviewCount: 33, inStock: true, imageUrl: 'https://placehold.co/400x400?text=Planta' },
  ]);
  // ────────────────────────────────────────────────────────────────────────

  categories = signal<Category[]>([
    { id: 'Muebles', name: 'Muebles' },
    { id: 'Electrónica', name: 'Electrónica' },
    { id: 'Iluminación', name: 'Iluminación' },
    { id: 'Decoración', name: 'Decoración' },
  ]);

  filters = signal<FilterState>({
    categories: [],
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    inStockOnly: false,
    sortBy: 'relevance',
  });

  viewMode = signal<'grid' | 'list'>('grid');
  isLoading = signal(false);

  // ─── Productos filtrados y ordenados ─────────────────────────────────────
  filteredProducts = computed(() => {
    const f = this.filters();
    let result = this.allProducts();

    if (f.categories.length > 0) {
      result = result.filter(p => f.categories.includes(p.category));
    }

    result = result.filter(p => p.price >= f.minPrice && p.price <= f.maxPrice);

    if (f.minRating > 0) {
      result = result.filter(p => (p.rating ?? 0) >= f.minRating);
    }

    if (f.inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    switch (f.sortBy) {
      case 'price-asc':  result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'rating-desc': result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case 'newest':     result = [...result].reverse(); break;
    }

    return result;
  });

  ngOnInit(): void {
    // BACKEND: cargar productos aquí
    // this.isLoading.set(true);
    // this.productService.getAll().subscribe({
    //   next: (products) => { this.allProducts.set(products); this.isLoading.set(false); },
    //   error: () => this.isLoading.set(false),
    // });
  }

  onFiltersChange(newFilters: FilterState): void {
    this.filters.set(newFilters);
  }

  trackById(index: number, product: Prod): string | number {
  return product.id;
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.filters.update(f => ({ ...f, sortBy: value }));
  }

  onAddToCart(product: Prod): void {
    console.log('Agregar al carrito:', product);
    // BACKEND: llamar a CartService.add(product)
  }

  onToggleFavorite(product: Prod): void {
    console.log('Toggle favorito:', product);
    // BACKEND: llamar a WishlistService.toggle(product)
  }
}
