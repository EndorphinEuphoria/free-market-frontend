import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { vi } from 'vitest';

import { ProductFilters } from './product-filters';
import { FilterState } from '../../models/product.model';

const DEFAULT_FILTERS: FilterState = {
  minPrice: 0,
  maxPrice: 500000,
  inStockOnly: false,
  sortBy: 'relevance',
};

describe('ProductFilters', () => {
  let fixture: ComponentFixture<ProductFilters>;
  let component: ProductFilters;
  let componentRef: ComponentRef<ProductFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFilters, CommonModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFilters);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('filters', { ...DEFAULT_FILTERS });
    fixture.detectChanges();
  });


  describe('Inicialización', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe sincronizar señales locales con el input inicial', () => {
      expect(component.minPrice()).toBe(DEFAULT_FILTERS.minPrice);
      expect(component.maxPrice()).toBe(DEFAULT_FILTERS.maxPrice);
      expect(component.inStockOnly()).toBe(DEFAULT_FILTERS.inStockOnly);
    });

    it('debe actualizar señales cuando cambia el input filters', () => {
      const newFilters: FilterState = {
        minPrice: 10000,
        maxPrice: 200000,
        inStockOnly: true,
        sortBy: 'price-asc',
      };

      componentRef.setInput('filters', newFilters);
      fixture.detectChanges();

      expect(component.minPrice()).toBe(10000);
      expect(component.maxPrice()).toBe(200000);
      expect(component.inStockOnly()).toBe(true);
    });

    it('debe usar false como valor por defecto de inStockOnly si no viene en el input', () => {
      const filtersWithoutStock = {
        minPrice: 0,
        maxPrice: 500000,
        sortBy: 'relevance',
      } as unknown as FilterState;

      componentRef.setInput('filters', filtersWithoutStock);
      fixture.detectChanges();

      expect(component.inStockOnly()).toBe(false);
    });
  });


  describe('onMinPrice()', () => {
    it('debe actualizar minPrice cuando el valor es menor que maxPrice', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      component.onMinPrice(createInputEvent(50000));

      expect(component.minPrice()).toBe(50000);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('debe actualizar minPrice cuando el valor es igual a maxPrice', () => {
      component.onMinPrice(createInputEvent(500000));
      expect(component.minPrice()).toBe(500000);
    });

    it('NO debe actualizar minPrice cuando el valor supera maxPrice', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      component.onMinPrice(createInputEvent(600000));

      expect(component.minPrice()).toBe(0);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('debe emitir filtersChange con el nuevo minPrice', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      component.onMinPrice(createInputEvent(30000));

      expect(emitSpy).toHaveBeenCalledWith({
        minPrice: 30000,
        maxPrice: DEFAULT_FILTERS.maxPrice,
        inStockOnly: DEFAULT_FILTERS.inStockOnly,
        sortBy: DEFAULT_FILTERS.sortBy,
      });
    });
  });


  describe('onMaxPrice()', () => {
    it('debe actualizar maxPrice cuando el valor es mayor que minPrice', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      component.onMaxPrice(createInputEvent(300000));

      expect(component.maxPrice()).toBe(300000);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('debe actualizar maxPrice cuando el valor es igual a minPrice', () => {
      component.onMaxPrice(createInputEvent(0));
      expect(component.maxPrice()).toBe(0);
    });

    it('NO debe actualizar maxPrice cuando el valor es menor que minPrice', () => {
      componentRef.setInput('filters', { ...DEFAULT_FILTERS, minPrice: 100000 });
      fixture.detectChanges();

      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      component.onMaxPrice(createInputEvent(50000));

      expect(component.maxPrice()).toBe(DEFAULT_FILTERS.maxPrice);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('debe emitir filtersChange con el nuevo maxPrice', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      component.onMaxPrice(createInputEvent(250000));

      expect(emitSpy).toHaveBeenCalledWith({
        minPrice: DEFAULT_FILTERS.minPrice,
        maxPrice: 250000,
        inStockOnly: DEFAULT_FILTERS.inStockOnly,
        sortBy: DEFAULT_FILTERS.sortBy,
      });
    });
  });

  // ─── onStockChange ────────────────────────────────────────────────────────

  describe('onStockChange()', () => {
    it('debe activar inStockOnly cuando el checkbox se marca', () => {
      component.onStockChange(createCheckboxEvent(true));
      expect(component.inStockOnly()).toBe(true);
    });

    it('debe desactivar inStockOnly cuando el checkbox se desmarca', () => {
      component.inStockOnly.set(true);
      component.onStockChange(createCheckboxEvent(false));
      expect(component.inStockOnly()).toBe(false);
    });

    it('debe emitir filtersChange con inStockOnly actualizado', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      component.onStockChange(createCheckboxEvent(true));

      expect(emitSpy).toHaveBeenCalledWith({
        minPrice: DEFAULT_FILTERS.minPrice,
        maxPrice: DEFAULT_FILTERS.maxPrice,
        inStockOnly: true,
        sortBy: DEFAULT_FILTERS.sortBy,
      });
    });
  });


  describe('clearAll()', () => {
    it('debe restaurar minPrice a 0', () => {
      component.minPrice.set(100000);
      component.clearAll();
      expect(component.minPrice()).toBe(0);
    });

    it('debe restaurar maxPrice a 500000', () => {
      component.maxPrice.set(200000);
      component.clearAll();
      expect(component.maxPrice()).toBe(500000);
    });

    it('debe restaurar inStockOnly a false', () => {
      component.inStockOnly.set(true);
      component.clearAll();
      expect(component.inStockOnly()).toBe(false);
    });

    it('debe emitir filtersChange con los valores por defecto', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      component.minPrice.set(50000);
      component.maxPrice.set(200000);
      component.inStockOnly.set(true);
      component.clearAll();

      expect(emitSpy).toHaveBeenCalledWith({
        minPrice: 0,
        maxPrice: 500000,
        inStockOnly: false,
        sortBy: DEFAULT_FILTERS.sortBy,
      });
    });

    it('debe mantener el sortBy del filtro padre al limpiar', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');

      componentRef.setInput('filters', { ...DEFAULT_FILTERS, sortBy: 'price-asc' });
      fixture.detectChanges();
      component.clearAll();

      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'price-asc' })
      );
    });
  });


  describe('Template', () => {
    it('debe mostrar los valores de precio actuales', () => {
      componentRef.setInput('filters', { ...DEFAULT_FILTERS, minPrice: 10000, maxPrice: 300000 });
      fixture.detectChanges();

      const spans = fixture.debugElement.queryAll(By.css('.price-display span'));
      expect(spans[0].nativeElement.textContent).toContain('10000');
      expect(spans[1].nativeElement.textContent).toContain('300000');
    });

    it('debe tener los sliders con el valor correcto', () => {
      componentRef.setInput('filters', { ...DEFAULT_FILTERS, minPrice: 20000, maxPrice: 400000 });
      fixture.detectChanges();

      const sliders = fixture.debugElement.queryAll(By.css('input[type="range"]'));
      expect(sliders[0].nativeElement.value).toBe('20000');
      expect(sliders[1].nativeElement.value).toBe('400000');
    });

    it('debe reflejar el estado del checkbox de stock', () => {
      componentRef.setInput('filters', { ...DEFAULT_FILTERS, inStockOnly: true });
      fixture.detectChanges();

      const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));
      expect(checkbox.nativeElement.checked).toBe(true);
    });

    it('debe llamar a clearAll al hacer click en "Limpiar todo"', () => {
      const clearSpy = vi.spyOn(component, 'clearAll');
      const btn = fixture.debugElement.query(By.css('.btn-clear'));

      btn.nativeElement.click();

      expect(clearSpy).toHaveBeenCalled();
    });
  });
});


function createInputEvent(value: number): Event {
  const input = document.createElement('input');
  input.value = String(value);
  return { target: input } as unknown as Event;
}

function createCheckboxEvent(checked: boolean): Event {
  const input = document.createElement('input');
  input.checked = checked;
  return { target: input } as unknown as Event;
}