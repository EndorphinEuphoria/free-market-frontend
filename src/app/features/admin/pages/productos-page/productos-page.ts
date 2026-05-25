import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { ProductosService, ProductoResponse, ProductoRequest } from '../../../../core/services/productos-service';

export interface FormErrors {
  name?: string;
  proovedorNombre?: string;
  price?: string;
  stock?: string;
}

const EMPTY_FORM: ProductoRequest = {
  proovedorNombre: '',
  name: '',
  url: '',
  price: 0,
  stock: 0,
};

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, AdminNavbar],
  templateUrl: './productos-page.html',
  styleUrl: './productos-page.css'
})
export class ProductosPageComponent implements OnInit {

  private productosService = inject(ProductosService);

  productos        = signal<ProductoResponse[]>([]);
  loading          = signal(true);
  error            = signal<string | null>(null);
  filterText       = signal('');
  showModal        = signal(false);
  saving           = signal(false);
  formError        = signal<string | null>(null);
  formErrors       = signal<FormErrors>({});
  editingProducto  = signal<ProductoResponse | null>(null);
  form             = signal<ProductoRequest>({ ...EMPTY_FORM });
  isDraggingOver   = signal(false);
  imagePreview     = signal<string | null>(null);

  filteredProductos = computed(() => {
    const text = this.filterText().toLowerCase();
    return this.productos().filter(p =>
      text === '' ||
      p.id.toString().includes(text) ||
      p.name.toLowerCase().includes(text)
    );
  });

  ngOnInit() {
    this.loadProductos();
  }

  loadProductos() {
    this.loading.set(true);
    this.error.set(null);

    this.productosService.getAll().subscribe({
      next: data => {
        this.productos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products');
        this.loading.set(false);
      }
    });
  }

  onFilterText(e: Event) {
    this.filterText.set((e.target as HTMLInputElement).value);
  }

  openCreateModal() {
    this.editingProducto.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.formError.set(null);
    this.formErrors.set({});
    this.imagePreview.set(null);
    this.showModal.set(true);
  }

  openEditModal(producto: ProductoResponse) {
    this.editingProducto.set(producto);
    this.form.set({
      proovedorNombre: producto.proovedorNombre,
      name:            producto.name,
      url:             producto.url,
      price:           producto.price,
      stock:           producto.stock,
    });
    this.formError.set(null);
    this.formErrors.set({});
    this.imagePreview.set(producto.url || null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProducto.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.formErrors.set({});
    this.imagePreview.set(null);
  }

  onFormInput(e: Event, field: keyof ProductoRequest) {
    const raw   = (e.target as HTMLInputElement).value;
    const value = (field === 'price' || field === 'stock') ? Number(raw) : raw;

    this.form.update(f => ({ ...f, [field]: value }));

    this.formErrors.update(errs => {
      const copy = { ...errs };
      delete copy[field as keyof FormErrors];
      return copy;
    });

    if (field === 'url') {
      this.imagePreview.set(raw.trim() ? raw.trim() : null);
    }
  }

  private validateForm(): boolean {
    const f = this.form();
    const errors: FormErrors = {};

    if (!f.name.trim())            errors.name            = 'Name is required.';
    if (!f.proovedorNombre.trim()) errors.proovedorNombre = 'Supplier is required.';
    if (!f.price || f.price < 1)   errors.price           = 'Price must be at least $1.';
    if (!f.stock || f.stock < 1)   errors.stock           = 'Stock must be at least 1 unit.';

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveProducto() {
    if (!this.validateForm()) return;

    this.saving.set(true);
    this.formError.set(null);

    const f       = this.form();
    const editing = this.editingProducto();

    if (editing) {
      this.productosService.update(editing.id, f).subscribe({
        next: updated => {
          this.productos.update(list =>
            list.map(p => p.id === updated.id ? updated : p)
          );
          this.saving.set(false);
          this.closeModal();
        },
        error: () => {
          this.formError.set('Failed to update product.');
          this.saving.set(false);
        }
      });
    } else {
      this.productosService.create(f).subscribe({
        next: created => {
          this.productos.update(list => [...list, created]);
          this.saving.set(false);
          this.closeModal();
        },
        error: () => {
          this.formError.set('Failed to create product.');
          this.saving.set(false);
        }
      });
    }
  }

  deleteProducto(id: number) {

  if (!confirm('Are you sure you want to deactivate this product?')) return;

  this.productosService.delete(id).subscribe({

    next: () => {

      this.productos.update(list =>
        list.map(p =>
          p.id === id
            ? { ...p, active: false }
            : p
        )
      );

    },

    error: () => {
      alert('Failed to deactivate product.');
    }

  });

}

  // ── Drag & drop ──────────────────────────────────────────────
  onDragEnter(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDraggingOver.set(true); }
  onDragOver(e: DragEvent)  { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; this.isDraggingOver.set(true); }
  onDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDraggingOver.set(false); }

  onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    this.isDraggingOver.set(false);

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.readImageFile(file);
      return;
    }

    const url = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain') || '';
    if (url.startsWith('http')) this.setImageUrl(url.trim());
  }

  onFileInputChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.readImageFile(file);
  }

  private readImageFile(file: File) {
    const maxSizeMB    = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      this.formError.set(`Image cannot exceed ${maxSizeMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      this.imagePreview.set(dataUrl);
      this.form.update(f => ({ ...f, url: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  private setImageUrl(url: string) {
    this.imagePreview.set(url);
    this.form.update(f => ({ ...f, url }));
  }

  clearImage() {
    this.imagePreview.set(null);
    this.form.update(f => ({ ...f, url: '' }));
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  }

  activateProducto(id: number) {

  this.productosService.activate(id).subscribe({

    next: () => {

      this.productos.update(list =>
        list.map(p =>
          p.id === id
            ? { ...p, active: true }
            : p
        )
      );

    },

    error: () => {
      alert('Failed to activate product.');
    }

  });

}
}