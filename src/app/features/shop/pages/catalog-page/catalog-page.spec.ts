import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CatalogPage } from './catalog-page';
import { ProductosService } from '../../../../core/services/productos-service';
import { Cart } from '../../../../core/services/cart';
import { Auth } from '../../../../core/services/auth';
import { ToastService } from '../../../../core/services/toast-service';
import { FilterState, ProductoResponse, SortOption } from '../../models/product.model';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<ProductoResponse> = {}): ProductoResponse => ({
  id: 1,
  name: 'Producto Test',
  proovedorNombre: 'Proveedor',
  url: 'https://img.test/1.jpg',
  price: 100000,
  stock: 10,
  active: true,
  ...overrides,
});

const PRODUCTS: ProductoResponse[] = [
  makeProduct({ id: 1, name: 'Arroz',  price: 50000,  stock: 5 }),
  makeProduct({ id: 2, name: 'Azúcar', price: 200000, stock: 0 }),
  makeProduct({ id: 3, name: 'Aceite', price: 350000, stock: 3 }),
];

const DEFAULT_FILTERS: FilterState = {
  minPrice: 0,
  maxPrice: 500000,
  inStockOnly: false,
  sortBy: 'relevance',
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('CatalogPage', () => {
  let fixture: ComponentFixture<CatalogPage>;
  let component: CatalogPage;

  let productosServiceMock: { getAllProducts: ReturnType<typeof vi.fn>; products$?: any };
  let cartServiceMock:      { addItem: ReturnType<typeof vi.fn>; items: ReturnType<typeof vi.fn> };
  let authMock:             { isLoggedIn: ReturnType<typeof vi.fn> };
  let routerMock:           { navigate: ReturnType<typeof vi.fn> };
  let toastMock:            { show: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    productosServiceMock = {
      getAllProducts: vi.fn().mockReturnValue(of(PRODUCTS)),
      products$: of(PRODUCTS),
    };

    cartServiceMock = {
      addItem: vi.fn(),
      items:   vi.fn().mockReturnValue([]),
    };

    authMock = {
      isLoggedIn: vi.fn().mockReturnValue(true),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    toastMock = {
      show: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [
        { provide: ProductosService, useValue: productosServiceMock },
        { provide: Cart,             useValue: cartServiceMock },
        { provide: Auth,             useValue: authMock },
        { provide: Router,           useValue: routerMock },
        { provide: ToastService,     useValue: toastMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creación ─────────────────────────────────────────────────────────────

  describe('creación', () => {
    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar searchTerm vacío', () => {
      expect(component.searchTerm()).toBe('');
    });

    it('debe inicializar viewMode en grid', () => {
      expect(component.viewMode()).toBe('grid');
    });

    it('debe inicializar filters con valores por defecto', () => {
      expect(component.filters()).toEqual(DEFAULT_FILTERS);
    });

    it('debe cargar los productos al iniciar', () => {
      // acepta tanto getAllProducts como products$
      const loaded = component.allProducts().length;
      expect(loaded).toBe(3);
    });
  });

  // ─── filteredProducts ─────────────────────────────────────────────────────

  describe('filteredProducts()', () => {
    it('debe retornar todos los productos sin filtros activos', () => {
      expect(component.filteredProducts().length).toBe(3);
    });

    it('debe filtrar por searchTerm (case-insensitive)', () => {
      component.searchTerm.set('arroz');
      expect(component.filteredProducts().length).toBe(1);
      expect(component.filteredProducts()[0].name).toBe('Arroz');
    });

    it('debe retornar vacío si searchTerm no coincide con ningún producto', () => {
      component.searchTerm.set('xyz-no-existe');
      expect(component.filteredProducts().length).toBe(0);
    });

    it('debe filtrar por minPrice', () => {
      component.filters.set({ ...DEFAULT_FILTERS, minPrice: 100000 });
      const result = component.filteredProducts();
      expect(result.every(p => p.price >= 100000)).toBe(true);
    });

    it('debe filtrar por maxPrice', () => {
      component.filters.set({ ...DEFAULT_FILTERS, maxPrice: 100000 });
      const result = component.filteredProducts();
      expect(result.every(p => p.price <= 100000)).toBe(true);
    });

    it('debe filtrar solo productos en stock cuando inStockOnly es true', () => {
      component.filters.set({ ...DEFAULT_FILTERS, inStockOnly: true });
      const result = component.filteredProducts();
      expect(result.every(p => p.stock > 0)).toBe(true);
      expect(result.find(p => p.id === 2)).toBeUndefined();
    });

    it('NO debe excluir productos sin stock cuando inStockOnly es false', () => {
      component.filters.set({ ...DEFAULT_FILTERS, inStockOnly: false });
      expect(component.filteredProducts().length).toBe(3);
    });

    it('debe ordenar por price-asc correctamente', () => {
      component.filters.set({ ...DEFAULT_FILTERS, sortBy: 'price-asc' });
      const prices = component.filteredProducts().map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('debe ordenar por price-desc correctamente', () => {
      component.filters.set({ ...DEFAULT_FILTERS, sortBy: 'price-desc' });
      const prices = component.filteredProducts().map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('debe combinar búsqueda y filtro de precio', () => {
      component.searchTerm.set('a');
      component.filters.set({ ...DEFAULT_FILTERS, maxPrice: 100000 });
      const result = component.filteredProducts();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Arroz');
    });

    it('debe combinar filtro de stock y precio', () => {
      component.filters.set({ ...DEFAULT_FILTERS, minPrice: 100000, inStockOnly: true });
      const result = component.filteredProducts();
      expect(result.every(p => p.price >= 100000 && p.stock > 0)).toBe(true);
    });
  });

  // ─── onFiltersChange ──────────────────────────────────────────────────────

  describe('onFiltersChange()', () => {
    it('debe actualizar la señal filters', () => {
      const newFilters: FilterState = { minPrice: 10000, maxPrice: 300000, inStockOnly: true, sortBy: 'price-asc' };
      component.onFiltersChange(newFilters);
      expect(component.filters()).toEqual(newFilters);
    });
  });

  // ─── onSortChange ─────────────────────────────────────────────────────────

  describe('onSortChange()', () => {
    it('debe actualizar sortBy manteniendo el resto de filtros', () => {
      const event = { target: { value: 'price-desc' } } as unknown as Event;
      component.onSortChange(event);
      expect(component.filters().sortBy).toBe('price-desc');
      expect(component.filters().minPrice).toBe(DEFAULT_FILTERS.minPrice);
    });

    it('debe aceptar todos los valores de SortOption', () => {
      const options: SortOption[] = ['relevance', 'price-asc', 'price-desc', 'newest'];
      options.forEach(sortBy => {
        component.onSortChange({ target: { value: sortBy } } as unknown as Event);
        expect(component.filters().sortBy).toBe(sortBy);
      });
    });
  });

  // ─── onAddToCart ──────────────────────────────────────────────────────────

  describe('onAddToCart()', () => {
    it('debe redirigir a /login si el usuario no está autenticado', () => {
      authMock.isLoggedIn.mockReturnValue(false);
      component.onAddToCart(PRODUCTS[0]);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      expect(cartServiceMock.addItem).not.toHaveBeenCalled();
    });

    it('NO debe agregar al carrito si el producto sin stock', () => {
      const sinStock = makeProduct({ stock: 0 });
      component.onAddToCart(sinStock);
      expect(cartServiceMock.addItem).not.toHaveBeenCalled();
    });

    it('debe llamar a cartService.addItem con los datos correctos', () => {
      const product = makeProduct({ id: 5, name: 'Leche', price: 80000, url: 'img.jpg', stock: 2 });
      component.onAddToCart(product);
      expect(cartServiceMock.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id:    5,
          name:  'Leche',
          price: 80000,
          url:   'img.jpg',
        })
      );
    });

    it('NO debe navegar a /login si el usuario está autenticado', () => {
      component.onAddToCart(PRODUCTS[0]);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  // ─── viewMode ─────────────────────────────────────────────────────────────

  describe('viewMode()', () => {
    it('debe cambiar a list', () => {
      component.viewMode.set('list');
      expect(component.viewMode()).toBe('list');
    });

    it('debe volver a grid', () => {
      component.viewMode.set('list');
      component.viewMode.set('grid');
      expect(component.viewMode()).toBe('grid');
    });
  });

  // ─── Template ─────────────────────────────────────────────────────────────

  describe('Template', () => {
    it('debe mostrar el conteo de productos filtrados', () => {
      const count = fixture.nativeElement.querySelector('.catalog-count strong');
      expect(count.textContent.trim()).toBe('3');
    });

    it('debe mostrar el mensaje de vacío cuando no hay resultados', () => {
      component.searchTerm.set('xyz-no-existe');
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('.catalog-empty');
      expect(empty).not.toBeNull();
    });

    it('NO debe mostrar el mensaje de vacío cuando hay resultados', () => {
      const empty = fixture.nativeElement.querySelector('.catalog-empty');
      expect(empty).toBeNull();
    });

    it('debe agregar la clase list-view al grid cuando viewMode es list', () => {
      component.viewMode.set('list');
      fixture.detectChanges();
      const grid = fixture.nativeElement.querySelector('.products-grid');
      expect(grid.classList.contains('list-view')).toBe(true);
    });

    it('NO debe tener clase list-view cuando viewMode es grid', () => {
      const grid = fixture.nativeElement.querySelector('.products-grid');
      expect(grid.classList.contains('list-view')).toBe(false);
    });

    it('debe resetear filtros al hacer click en "Limpiar filtros"', () => {
  component.searchTerm.set('xyz-no-existe');
  fixture.detectChanges();

  const btn = fixture.nativeElement.querySelector('.catalog-empty button');
  btn.click();
  fixture.detectChanges();

  expect(component.filters().minPrice).toBe(0);
  expect(component.filters().inStockOnly).toBe(false);
  expect(component.filters().sortBy).toBe('relevance');
});

    it('debe actualizar searchTerm al escribir en el input de búsqueda', () => {
      const input = fixture.nativeElement.querySelector('input[type="text"]');
      input.value = 'Arroz';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.searchTerm()).toBe('Arroz');
    });

    it('debe actualizar sortBy al cambiar el select', () => {
      const select = fixture.nativeElement.querySelector('.sort-select');
      select.value = 'price-asc';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(component.filters().sortBy).toBe('price-asc');
    });

    it('debe marcar el botón grid como activo por defecto', () => {
      const gridBtn = fixture.debugElement.queryAll(By.css('.view-btn'))[0];
      expect(gridBtn.nativeElement.classList.contains('active')).toBe(true);
    });

    it('debe marcar el botón list como activo al cambiar a list', () => {
      component.viewMode.set('list');
      fixture.detectChanges();
      const listBtn = fixture.debugElement.queryAll(By.css('.view-btn'))[1];
      expect(listBtn.nativeElement.classList.contains('active')).toBe(true);
    });
  });
});