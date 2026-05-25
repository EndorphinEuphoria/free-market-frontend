import { Component, inject } from '@angular/core';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type">
          <span>{{ toast.message }}</span>
          @if (toast.type === 'confirm') {
            <div class="toast-actions">
              <button class="toast-btn toast-btn--cancel" (click)="respond(toast, false)">No</button>
              <button class="toast-btn toast-btn--confirm" (click)="respond(toast, true)">Yes</button>
            </div>
          } @else {
            <button class="toast-close" (click)="toastService.remove(toast.id)">✕</button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 9999;
    }
    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      min-width: 260px;
      max-width: 360px;
      animation: slide-in 0.2s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    @keyframes slide-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .toast--success { background: #e8f5f1; color: #0f6e56; border: 1px solid #9fe1cb; }
    .toast--error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }
    .toast--info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; }
    .toast--confirm { background: #fff; color: #252b42; border: 1px solid #e5e5e5; }
    .toast-close {
      background: none; border: none; cursor: pointer;
      font-size: 0.8rem; color: inherit; opacity: 0.6; padding: 0;
    }
    .toast-close:hover { opacity: 1; }
    .toast-actions { display: flex; gap: 0.5rem; }
    .toast-btn {
      padding: 4px 14px; border-radius: 6px; font-size: 0.8rem;
      font-weight: 600; cursor: pointer; border: none;
    }
    .toast-btn--cancel  { background: #f5f5f5; color: #737373; }
    .toast-btn--confirm { background: #ef4444; color: #fff; }
    .toast-btn--cancel:hover  { background: #e5e5e5; }
    .toast-btn--confirm:hover { background: #dc2626; }
  `]
})
export class Toast {
  toastService = inject(ToastService);

  respond(toast: any, value: boolean) {
    toast.resolve?.(value);
    this.toastService.remove(toast.id);
  }
}