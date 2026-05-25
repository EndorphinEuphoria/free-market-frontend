export interface ProductoResponse {
  id: number;
  proovedorNombre: string;
  name: string;
  url: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface FilterState { // OK
  minPrice: number;
  maxPrice: number;
  inStockOnly?: boolean;
  sortBy: SortOption;
}

export type SortOption =
| 'relevance'
| 'price-asc'
| 'price-desc'
| 'newest';