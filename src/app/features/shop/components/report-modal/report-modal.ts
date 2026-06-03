import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CreateReportRequest, DeliveryService } from '../../../../core/services/delivery.service';
import { ToastService } from '../../../../core/services/toast-service';
import { FormsModule } from '@angular/forms';

const REASONS = [
  { value: 'NO_ENTREGADO',        label: 'I did not receive my order' },
  { value: 'PAQUETE_DANADO',      label: 'Damaged product' },
  { value: 'PRODUCTO_INCORRECTO', label: 'Wrong product received' },
  { value: 'OTRO',                label: 'Other' },
];

@Component({
  selector: 'app-report-modal',
  imports: [FormsModule],
  templateUrl: './report-modal.html',
  styleUrl:    './report-modal.css',
})
export class ReportModal {
  @Input()  idReserva!:  number;
  @Input()  idDelivery!: number;
  @Output() closed    = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  private deliveryService = inject(DeliveryService);
  private toast           = inject(ToastService);

  reasons     = REASONS;
  reason      = signal('');
  description = signal('');
  imageBase64 = signal<string | undefined>(undefined);
  submitting  = signal(false);

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.imageBase64.set((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  }

  submit() {
    if (!this.reason() || !this.description().trim()) {
      this.toast.error('Please fill in all required fields.');
      return;
    }

    const body: CreateReportRequest = {
      reason:      this.reason(),
      description: this.description().trim(),
      imageBase64: this.imageBase64(),
    };

    this.submitting.set(true);
    this.deliveryService.createReport(this.idDelivery, body).subscribe({
      next: () => {
        this.toast.success('Report submitted successfully.');
        this.submitted.emit();
      },
      error: (err) => {
        const msg = err?.error ?? 'Failed to submit report. Please try again.';
        this.toast.error(typeof msg === 'string' ? msg : 'Failed to submit report.');
        this.submitting.set(false);
      },
    });
  }

  close() {
    this.closed.emit();
  }
}