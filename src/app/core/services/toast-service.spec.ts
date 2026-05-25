import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast-service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast', () => {
    service.show('Hola', 'success');

    const toasts = service.toasts();

    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Hola');
    expect(toasts[0].type).toBe('success');
  });

  it('should remove a toast', () => {
    service.show('Eliminar', 'info');

    const toast = service.toasts()[0];

    service.remove(toast.id);

    expect(service.toasts().length).toBe(0);
  });

  it('should create success toast', () => {
    service.success('OK');

    const toast = service.toasts()[0];

    expect(toast.type).toBe('success');
    expect(toast.message).toBe('OK');
  });

  it('should create error toast', () => {
    service.error('Error');

    const toast = service.toasts()[0];

    expect(toast.type).toBe('error');
    expect(toast.message).toBe('Error');
  });

  it('should create info toast', () => {
    service.info('Info');

    const toast = service.toasts()[0];

    expect(toast.type).toBe('info');
    expect(toast.message).toBe('Info');
  });

  it('should auto remove toast after duration', async () => {
    service.show('Temporal', 'info', 10);

    expect(service.toasts().length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(service.toasts().length).toBe(0);
  });

  it('should create confirm toast', async () => {
    const promise = service.confirm('Confirmar');

    const toast = service.toasts()[0];

    expect(toast.type).toBe('confirm');
    expect(toast.message).toBe('Confirmar');

    toast.resolve?.(true);

    await expect(promise).resolves.toBe(true);
  });
});