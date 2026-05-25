// productos-page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ProductosPageComponent } from './productos-page';
import { ProductosService, ProductoResponse, ProductoRequest } from '../../../../core/services/productos-service';
import { ToastService } from '../../../../core/services/toast-service';
import { ConfigService } from '../../../../core/services/config-service';
import { Auth } from '../../../../core/services/auth';
import { provideRouter } from '@angular/router';

const mockProducto: ProductoResponse = {
  id: 1, proovedorNombre: 'Proveedor A', name: 'Producto 1',
  url: 'http://img.com/1.jpg', price: 100, stock: 10, active: true
};

const mockProductos: ProductoResponse[] = [
  mockProducto,
  { id: 2, proovedorNombre: 'Proveedor B', name: 'Producto 2', url: 'http://img.com/2.jpg', price: 50,  stock: 5,  active: true  },
  { id: 3, proovedorNombre: 'Proveedor C', name: 'Otro',       url: 'http://img.com/3.jpg', price: 200, stock: 0,  active: false },
];

const validForm: ProductoRequest = {
  proovedorNombre: 'Proveedor A', name: 'Producto Test',
  url: 'http://img.com/test.jpg', price: 100, stock: 5
};

describe('ProductosPageComponent', () => {
  let fixture: ComponentFixture<ProductosPageComponent>;
  let component: ProductosPageComponent;
  let productosMock: {
    getAll:    ReturnType<typeof vi.fn>;
    create:    ReturnType<typeof vi.fn>;
    update:    ReturnType<typeof vi.fn>;
    delete:    ReturnType<typeof vi.fn>;
    activate:  ReturnType<typeof vi.fn>;
  };
    let toastMock: {
    confirm: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
    error:   ReturnType<typeof vi.fn>;
    toasts:  ReturnType<typeof vi.fn>;
    };

  beforeEach(async () => {
    productosMock = {
      getAll:   vi.fn().mockReturnValue(of(mockProductos)),
      create:   vi.fn().mockReturnValue(of(mockProducto)),
      update:   vi.fn().mockReturnValue(of(mockProducto)),
      delete:   vi.fn().mockReturnValue(of(void 0)),
      activate: vi.fn().mockReturnValue(of(void 0)),
    };
    toastMock = {
        confirm: vi.fn().mockResolvedValue(true),
        success: vi.fn(),
        error:   vi.fn(),
        toasts:  vi.fn().mockReturnValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [ProductosPageComponent],
      providers: [
        provideRouter([]),
        { provide: ProductosService, useValue: productosMock },
        { provide: ToastService,     useValue: toastMock },
        { provide: ConfigService,    useValue: { logoUrl: vi.fn().mockReturnValue(''), commerceName: vi.fn().mockReturnValue('Test') } },
        { provide: Auth,             useValue: { currentUser: vi.fn().mockReturnValue(null), logout: vi.fn() } },
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(ProductosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should load productos on init', () => {
      expect(component.productos()).toEqual(mockProductos);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should set error on load failure', async () => {
      productosMock.getAll.mockReturnValue(throwError(() => new Error('fail')));

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ProductosPageComponent],
        providers: [
          provideRouter([]),
          { provide: ProductosService, useValue: productosMock },
          { provide: ToastService,     useValue: toastMock },
          { provide: ConfigService,    useValue: { logoUrl: vi.fn().mockReturnValue(''), commerceName: vi.fn().mockReturnValue('') } },
          { provide: Auth,             useValue: { currentUser: vi.fn().mockReturnValue(null), logout: vi.fn() } },
        ]
      }).compileComponents();

      const f = TestBed.createComponent(ProductosPageComponent);
      f.detectChanges();

      expect(f.componentInstance.error()).toBe('Failed to load products');
      expect(f.componentInstance.loading()).toBe(false);
    });
  });

  describe('filteredProductos', () => {
    it('should return all when filterText is empty', () => {
      expect(component.filteredProductos().length).toBe(3);
    });

    it('should filter by name', () => {
      component.filterText.set('otro');
      expect(component.filteredProductos().length).toBe(1);
      expect(component.filteredProductos()[0].name).toBe('Otro');
    });

    it('should filter by id', () => {
      component.filterText.set('2');
      expect(component.filteredProductos().some(p => p.id === 2)).toBe(true);
    });

    it('should be case-insensitive', () => {
      component.filterText.set('PRODUCTO');
      expect(component.filteredProductos().length).toBe(2);
    });
  });

  describe('modal', () => {
    it('should open create modal with empty form', () => {
      component.openCreateModal();
      expect(component.showModal()).toBe(true);
      expect(component.editingProducto()).toBeNull();
      expect(component.form().name).toBe('');
    });

    it('should open edit modal with product data', () => {
      component.openEditModal(mockProducto);
      expect(component.showModal()).toBe(true);
      expect(component.editingProducto()).toEqual(mockProducto);
      expect(component.form().name).toBe('Producto 1');
      expect(component.imagePreview()).toBe('http://img.com/1.jpg');
    });

    it('should close modal and reset state', () => {
      component.openCreateModal();
      component.closeModal();
      expect(component.showModal()).toBe(false);
      expect(component.editingProducto()).toBeNull();
      expect(component.form().name).toBe('');
      expect(component.imagePreview()).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should pass with valid form', () => {
      component.form.set(validForm);
      component.saveProducto();
      expect(productosMock.create).toHaveBeenCalled();
    });

    it('should fail when name is empty', () => {
      component.form.set({ ...validForm, name: '' });
      component.saveProducto();
      expect(component.formErrors().name).toBe('Name is required.');
      expect(productosMock.create).not.toHaveBeenCalled();
    });

    it('should fail when proovedorNombre is empty', () => {
      component.form.set({ ...validForm, proovedorNombre: '' });
      component.saveProducto();
      expect(component.formErrors().proovedorNombre).toBe('Supplier is required.');
    });

    it('should fail when price is 0', () => {
      component.form.set({ ...validForm, price: 0 });
      component.saveProducto();
      expect(component.formErrors().price).toBe('Price must be at least $1.');
    });

    it('should fail when stock is 0', () => {
      component.form.set({ ...validForm, stock: 0 });
      component.saveProducto();
      expect(component.formErrors().stock).toBe('Stock must be at least 1 unit.');
    });
  });

  describe('saveProducto — create', () => {
    beforeEach(() => {
      component.openCreateModal();
      component.form.set(validForm);
    });

    it('should call create and add to list', () => {
      component.saveProducto();
      expect(productosMock.create).toHaveBeenCalledWith(validForm);
      expect(toastMock.success).toHaveBeenCalledWith('Product created successfully');
    });

    it('should close modal after create', () => {
      component.saveProducto();
      expect(component.showModal()).toBe(false);
    });

    it('should set formError on create failure', () => {
      productosMock.create.mockReturnValue(throwError(() => new Error('fail')));
      component.saveProducto();
      expect(component.formError()).toBe('Failed to create product.');
    });
  });

  describe('saveProducto — update', () => {
    const updatedProducto = { ...mockProducto, name: 'Producto Editado' };

    beforeEach(() => {
      productosMock.update.mockReturnValue(of(updatedProducto));
      component.openEditModal(mockProducto);
      component.form.set(validForm);
    });

    it('should call update and replace in list', () => {
      component.saveProducto();
      expect(productosMock.update).toHaveBeenCalledWith(mockProducto.id, validForm);
      expect(toastMock.success).toHaveBeenCalledWith('Product updated successfully');
    });

    it('should close modal after update', () => {
      component.saveProducto();
      expect(component.showModal()).toBe(false);
    });

    it('should set formError on update failure', () => {
      productosMock.update.mockReturnValue(throwError(() => new Error('fail')));
      component.saveProducto();
      expect(component.formError()).toBe('Failed to update product.');
    });
  });

  describe('deleteProducto', () => {
    it('should mark product as inactive after delete', async () => {
      vi.useFakeTimers();
      await component.deleteProducto(1);
      vi.advanceTimersByTime(3000);
      expect(component.productos().find(p => p.id === 1)?.active).toBe(false);
      expect(toastMock.success).toHaveBeenCalledWith('Product deactivated');
      vi.useRealTimers();
    });

    it('should not delete if confirm returns false', async () => {
      toastMock.confirm.mockResolvedValue(false);
      await component.deleteProducto(1);
      expect(productosMock.delete).not.toHaveBeenCalled();
    });

    it('should not delete if already processing', async () => {
      component.processingIds.set([1]);
      await component.deleteProducto(1);
      expect(productosMock.delete).not.toHaveBeenCalled();
    });

    it('should show error toast on delete failure', async () => {
      productosMock.delete.mockReturnValue(throwError(() => new Error('fail')));
      await component.deleteProducto(1);
      expect(toastMock.error).toHaveBeenCalledWith('Failed to deactivate product');
    });
  });

  describe('activateProducto', () => {
    it('should mark product as active', async () => {
      vi.useFakeTimers();
      await component.activateProducto(3);
      vi.advanceTimersByTime(3000);
      expect(component.productos().find(p => p.id === 3)?.active).toBe(true);
      expect(toastMock.success).toHaveBeenCalledWith('Product activated');
      vi.useRealTimers();
    });

    it('should not activate if confirm returns false', async () => {
      toastMock.confirm.mockResolvedValue(false);
      await component.activateProducto(3);
      expect(productosMock.activate).not.toHaveBeenCalled();
    });

    it('should not activate if already processing', async () => {
      component.processingIds.set([3]);
      await component.activateProducto(3);
      expect(productosMock.activate).not.toHaveBeenCalled();
    });

    it('should show error toast on activate failure', async () => {
      productosMock.activate.mockReturnValue(throwError(() => new Error('fail')));
      await component.activateProducto(3);
      expect(toastMock.error).toHaveBeenCalledWith('Failed to activate product');
    });
  });

  describe('clearImage', () => {
    it('should clear imagePreview and form url', () => {
      component.imagePreview.set('http://img.com/test.jpg');
      component.form.update(f => ({ ...f, url: 'http://img.com/test.jpg' }));
      component.clearImage();
      expect(component.imagePreview()).toBeNull();
      expect(component.form().url).toBe('');
    });
  });

  describe('formatPrice', () => {
    it('should format price in CLP', () => {
      const result = component.formatPrice(1000);
      expect(result).toContain('1.000');
    });
  });

  describe('onFormInput', () => {
    it('should update string field', () => {
      component.onFormInput({ target: { value: 'Nuevo nombre' } } as any, 'name');
      expect(component.form().name).toBe('Nuevo nombre');
    });

    it('should parse number for price', () => {
      component.onFormInput({ target: { value: '999' } } as any, 'price');
      expect(component.form().price).toBe(999);
    });

    it('should parse number for stock', () => {
      component.onFormInput({ target: { value: '20' } } as any, 'stock');
      expect(component.form().stock).toBe(20);
    });

    it('should update imagePreview when url field changes', () => {
      component.onFormInput({ target: { value: 'http://img.com/new.jpg' } } as any, 'url');
      expect(component.imagePreview()).toBe('http://img.com/new.jpg');
    });

    it('should clear imagePreview when url is empty', () => {
      component.onFormInput({ target: { value: '' } } as any, 'url');
      expect(component.imagePreview()).toBeNull();
    });

    it('should clear formError for that field on input', () => {
      component.formErrors.set({ name: 'Name is required.' });
      component.onFormInput({ target: { value: 'Nombre' } } as any, 'name');
      expect(component.formErrors().name).toBeUndefined();
    });
  });
});