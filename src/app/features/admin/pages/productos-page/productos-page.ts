import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';

export interface ProductoResponse {
  id: number;
  proovedorNombre: string;
  name: string;
  url: string;
  price: number;
  stock: number;
}

export interface ProductoRequest {
  proovedorNombre: string;
  name: string;
  url: string;
  price: number;
  stock: number;
}

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

  productos = signal<ProductoResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filterText = signal('');

  showModal = signal(false);
  saving = signal(false);
  formError = signal<string | null>(null);
  formErrors = signal<FormErrors>({});
  editingProducto = signal<ProductoResponse | null>(null);
  form = signal<ProductoRequest>({ ...EMPTY_FORM });

  // Drag & drop
  isDraggingOver = signal(false);
  imagePreview = signal<string | null>(null);

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
    this.productos.set([
      { id: 1, proovedorNombre: 'Distribuidora Norte', name: 'Auriculares Bluetooth', url: 'https://placehold.co/48x48', price: 15990, stock: 42 },
      { id: 2, proovedorNombre: 'TechSur Ltda.', name: 'Mouse Inalámbrico', url: 'https://placehold.co/48x48', price: 9990, stock: 7 },
      { id: 3, proovedorNombre: 'Distribuidora Norte', name: 'Teclado Mecánico', url: 'https://placehold.co/48x48', price: 34990, stock: 15 },
    ]);
    this.loading.set(false);
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
      name: producto.name,
      url: producto.url,
      price: producto.price,
      stock: producto.stock,
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
    const raw = (e.target as HTMLInputElement).value;
    const value = (field === 'price' || field === 'stock') ? Number(raw) : raw;

    this.form.update(f => ({ ...f, [field]: value }));

    // Limpiar error del campo al escribir
    this.formErrors.update(errs => {
      const copy = { ...errs };
      delete copy[field as keyof FormErrors];
      return copy;
    });

    // Actualizar preview si editan URL manualmente
    if (field === 'url') {
      this.imagePreview.set(raw.trim() ? raw.trim() : null);
    }
  }

  // ── Validación ────────────────────────────────────────────────────────────

  private validateForm(): boolean {
    const f = this.form();
    const errors: FormErrors = {};

    if (!f.name.trim()) {
      errors.name = 'El nombre es obligatorio.';
    }
    if (!f.proovedorNombre.trim()) {
      errors.proovedorNombre = 'El proveedor es obligatorio.';
    }
    if (!f.price || f.price < 1) {
      errors.price = 'El precio debe ser al menos $1.';
    }
    if (!f.stock || f.stock < 1) {
      errors.stock = 'El stock debe ser al menos 1 unidad.';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────

  /** dragenter y dragover deben llamar preventDefault() para que drop funcione */
  onDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDraggingOver.set(true);
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Necesario: sin esto el browser cancela el drop
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    this.isDraggingOver.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDraggingOver.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDraggingOver.set(false);

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.readImageFile(file);
      return;
    }

    // Si arrastraron una URL desde el navegador
    const url = e.dataTransfer?.getData('text/uri-list')
      || e.dataTransfer?.getData('text/plain')
      || '';

    if (url.startsWith('http')) {
      this.setImageUrl(url.trim());
    }
  }

  onFileInputChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.readImageFile(file);
  }

  private readImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
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

  // ── Guardar ───────────────────────────────────────────────────────────────

  saveProducto() {
    if (!this.validateForm()) return;

    this.saving.set(true);
    this.formError.set(null);

    setTimeout(() => {
      const f = this.form();
      if (this.editingProducto()) {
        // TODO: PUT /productos/{id}
        this.productos.update(list =>
          list.map(p => p.id === this.editingProducto()!.id ? { ...p, ...f } : p)
        );
      } else {
        // TODO: POST /productos
        const newId = Math.max(0, ...this.productos().map(p => p.id)) + 1;
        this.productos.update(list => [...list, { id: newId, ...f }]);
      }
      this.saving.set(false);
      this.closeModal();
    }, 400);
  }

  deleteProducto(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.productos.update(list => list.filter(p => p.id !== id));
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  }
}