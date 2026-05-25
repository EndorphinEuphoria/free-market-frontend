import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirm';
  resolve?: (val: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: Toast['type'] = 'info', duration = 3500) {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  confirm(message: string): Promise<boolean> {
    return new Promise(resolve => {
      const id = ++this.counter;
      this.toasts.update(t => [...t, { id, message, type: 'confirm', resolve }]);
    });
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
  info(msg: string)    { this.show(msg, 'info'); }
}