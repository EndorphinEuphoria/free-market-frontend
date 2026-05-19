export interface Prod {
    id: string | number;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    badge?: string;
    rating?: number;
    reviewCount?: number;
    isFavorite?: boolean;
    inStock?: boolean;
    description?: string;
    tags?: string[];
}

export interface Category {
    id: string;
    name: string;
    count?: number;
}

export interface FilterState {
    categories: string[];
    minPrice: number;
    maxPrice: number;
    minRating: number;
    inStockOnly: boolean;
    sortBy: SortOption;
}

export type SortOption =
| 'relevance'
| 'price-asc'
| 'price-desc'
| 'rating-desc'
| 'newest';