import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { CartState } from '../../features/shop/models/cart.model';

@Injectable({ providedIn: 'root' })
export class Cart {
  private readonly API_URL    = 'http://localhost:8086/api-v1/reserve';
  private readonly STORAGE_KEY = 'cart';
  private readonly http        = inject(HttpClient);

  private state = signal<CartState>(this.loadFromStorage());

  isOpen        = signal(false);
  activeAddress = signal<string>('');

  openCart():  void { this.isOpen.set(true);  }
  closeCart(): void { this.isOpen.set(false); }

  setActiveAddress(address: string): void {
    this.activeAddress.set(address);
  }

  // Selectores públicos
  items      = computed(() => this.state().items);
  totalItems = computed(() => this.items().reduce((acc, i) => acc + i.quantity, 0));
  totalPrice = computed(() => this.items().reduce((acc, i) => acc + i.price * i.quantity, 0));

  addItem(product: { id: number; name: string; price: number; url: string }): void {
    const items    = this.state().items;
    const existing = items.find(i => i.idProduct === product.id);
    if (existing) {
      this.updateQuantity(product.id, existing.quantity + 1);
      return;
    }
    this.setState({
      items: [...items, {
        idProduct: product.id,
        name:      product.name,
        price:     product.price,
        url:       product.url,
        quantity:  1,
      }]
    });
  }

  removeItem(idProduct: number): void {
    this.setState({ items: this.state().items.filter(i => i.idProduct !== idProduct) });
  }

  updateQuantity(idProduct: number, quantity: number): void {
    if (quantity <= 0) { this.removeItem(idProduct); return; }
    this.setState({
      items: this.state().items.map(i =>
        i.idProduct === idProduct ? { ...i, quantity } : i
      )
    });
  }

  clearCart(): void {
    this.setState({ items: [] });
    this.activeAddress.set('');
  }

  checkout() {
    const token   = localStorage.getItem('token');
    const payload = this.decodeJwt(token);
    const idUser: number = payload?.userId;

    const body = {
      idUser,
      deliveryAddress: this.activeAddress(),
      products: this.items().map(i => ({
        idProduct: i.idProduct,
        quantity:  i.quantity,
      }))
    };

    const headers = new HttpHeaders({
      'Idempotency-Key': crypto.randomUUID(),
      'X-User-Id':       idUser.toString()
    });

    return this.http.post(`${this.API_URL}/createReserve`, body, { headers });
  }

  // Helpers privados
  private setState(state: CartState): void {
    this.state.set(state);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private loadFromStorage(): CartState {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : { items: [] };
    } catch {
      return { items: [] };
    }
  }

  private decodeJwt(token: string | null): any {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}