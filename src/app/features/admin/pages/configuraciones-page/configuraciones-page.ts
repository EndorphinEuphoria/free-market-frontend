import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { Auth } from '../../../../core/services/auth';
import { ConfigService, ConfigRequest, ConfigResponse } from '../../../../core/services/config-service';

const EMPTY_FORM: ConfigRequest = {
  idUser:         1,
  commerceName:   '',
  logoUrl:        '',
  favicomUrl:     '',
  principalFont:  'Roboto',
  primaryColor:   '#23856d',
  secondaryColor: '#252b42',
  updateAt:       ''
};

@Component({
  selector: 'app-configuraciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbar],
  templateUrl: './configuraciones-page.html',
  styleUrl: './configuraciones-page.css'
})
export class ConfiguracionesPageComponent implements OnInit {

  private auth          = inject(Auth);
  private configService = inject(ConfigService);

  loading           = signal(true);
  saving            = signal(false);
  error             = signal<string | null>(null);
  success           = signal<string | null>(null);
  configId          = signal<number | null>(null);

  form              = signal<ConfigRequest>({ ...EMPTY_FORM });
  logoPreview       = signal<string | null>(null);
  faviconPreview    = signal<string | null>(null);
  isDraggingLogo    = signal(false);
  isDraggingFavicon = signal(false);

  ngOnInit() {
    this.auth.restoreSession();
    this.loadConfig();
  }

  loadConfig() {
    this.loading.set(true);
    this.error.set(null);

    this.configService.getPublicConfig().subscribe({
      next: (data: ConfigResponse) => {
        this.configId.set(data.id);
        this.form.set({
          idUser:         1,
          commerceName:   data.commerceName,
          logoUrl:        data.logoUrl    ?? '',
          favicomUrl:     data.favicomUrl ?? '',
          principalFont:  data.principalFont,
          primaryColor:   data.primaryColor,
          secondaryColor: data.secondaryColor,
          updateAt:       data.updateDate
        });
        this.logoPreview.set(data.logoUrl || null);
        this.faviconPreview.set(data.favicomUrl || null);
        this.configService.applyStyles(this.form());
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load configuration');
        this.loading.set(false);
      }
    });
  }

  saveConfig() {
    if (!this.form().commerceName.trim()) {
      this.error.set('Store name cannot be empty');
      setTimeout(() => this.error.set(null), 3000);
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: ConfigRequest = {
      ...this.form(),
      updateAt: new Date().toISOString().split('T')[0]
    };

    this.configService.updateConfig(this.configId()!, payload).subscribe({
      next: () => {
        this.configService.applyStyles(payload);
        this.success.set('Settings updated successfully');
        setTimeout(() => { this.saving.set(false); this.success.set(null); }, 3000);
      },
      error: () => {
        this.error.set('Failed to update configuration');
        setTimeout(() => { this.saving.set(false); this.error.set(null); }, 3000);
      }
    });
  }

  restoreDefaults() {
    if (!this.configId()) return;

    const defaults: ConfigRequest = {
      idUser:         1,
      commerceName:   'FreeMarket',
      logoUrl:        '',
      favicomUrl:     '',
      principalFont:  'DM Sans',
      primaryColor:   '#2563EB',
      secondaryColor: '#1D4ED8',
      updateAt:       new Date().toISOString().split('T')[0]
    };

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.configService.updateConfig(this.configId()!, defaults).subscribe({
      next: () => {
        this.form.set(defaults);
        this.logoPreview.set(null);
        this.faviconPreview.set(null);
        this.configService.applyStyles(defaults);
        this.success.set('Style restored to defaults');
        setTimeout(() => { this.saving.set(false); this.success.set(null); }, 3000);
      },
      error: () => {
        this.error.set('Failed to restore configuration');
        setTimeout(() => { this.saving.set(false); this.error.set(null); }, 3000);
      }
    });
  }

  // ── Drag & drop ──────────────────────────────────────────────
  onDragEnter(e: DragEvent, type: 'logo' | 'favicon') {
    e.preventDefault(); e.stopPropagation();
    type === 'logo' ? this.isDraggingLogo.set(true) : this.isDraggingFavicon.set(true);
  }

  onDragOver(e: DragEvent, type: 'logo' | 'favicon') {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    type === 'logo' ? this.isDraggingLogo.set(true) : this.isDraggingFavicon.set(true);
  }

  onDragLeave(e: DragEvent, type: 'logo' | 'favicon') {
    e.preventDefault(); e.stopPropagation();
    type === 'logo' ? this.isDraggingLogo.set(false) : this.isDraggingFavicon.set(false);
  }

  onDrop(e: DragEvent, type: 'logo' | 'favicon') {
    e.preventDefault(); e.stopPropagation();
    this.isDraggingLogo.set(false);
    this.isDraggingFavicon.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) this.readImageFile(file, type);
  }

  onFileInputChange(e: Event, type: 'logo' | 'favicon') {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.readImageFile(file, type);
  }

  private readImageFile(file: File, type: 'logo' | 'favicon') {
    if (file.size > 2 * 1024 * 1024) {
      this.error.set('Image cannot exceed 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (type === 'logo') {
        this.logoPreview.set(dataUrl);
        this.form.update(f => ({ ...f, logoUrl: dataUrl }));
      } else {
        this.faviconPreview.set(dataUrl);
        this.form.update(f => ({ ...f, favicomUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  }

  clearImage(type: 'logo' | 'favicon') {
    if (type === 'logo') {
      this.logoPreview.set(null);
      this.form.update(f => ({ ...f, logoUrl: '' }));
    } else {
      this.faviconPreview.set(null);
      this.form.update(f => ({ ...f, favicomUrl: '' }));
    }
  }

  onInput(e: Event, field: keyof ConfigRequest) {
    const value = (e.target as HTMLInputElement).value;
    this.form.update(f => ({ ...f, [field]: value }));
  }
}