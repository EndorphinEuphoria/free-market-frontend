import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { Auth } from '../../../../core/services/auth';

export interface ConfigRequest {
  idUser: number;
  commerceName: string;
  logoUrl: string;
  favicomUrl: string;
  principalFont: string;
  primaryColor: string;
  secondaryColor: string;
  updateAt: string;
}

export interface ConfigResponse {
  commerceName: string;
  logoUrl: string;
  favicomUrl: string;
  principalFont: string;
  primaryColor: string;
  secondaryColor: string;
  updateDate: string;
}

@Component({
  selector: 'app-configuraciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbar],
  templateUrl: './configuraciones-page.html',
  styleUrl: './configuraciones-page.css'
})
export class ConfiguracionesPageComponent implements OnInit {

  //private auth = inject(Auth);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  hasExistingConfig = signal(false);

  form = signal<ConfigRequest>({
    idUser: 0,
    commerceName: '',
    logoUrl: '',
    favicomUrl: '',
    principalFont: 'Roboto',
    primaryColor: '#23856d',
    secondaryColor: '#252b42',
    updateAt: ''
  });

  ngOnInit() {
    this.loadConfig();
  }

loadConfig() {
  this.loading.set(true);
  this.hasExistingConfig.set(false);
  this.loading.set(false);
  console.log('loading:', this.loading()); 
}

  updateField(field: keyof ConfigRequest, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  saveConfig() {
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: ConfigRequest = {
      ...this.form(),
      updateAt: new Date().toISOString().split('T')[0]
    };

    // TODO: conectar POST o PUT según hasExistingConfig
    // Simula guardado
    setTimeout(() => {
      this.applyStyles(payload);
      this.hasExistingConfig.set(true);
      this.success.set('Configuración guardada correctamente');
      this.saving.set(false);
    }, 500);
  }

  applyStyles(config: ConfigRequest) {
    const root = document.documentElement;
    root.style.setProperty('--commerce-primary', config.primaryColor);
    root.style.setProperty('--commerce-secondary', config.secondaryColor);
    root.style.setProperty('--commerce-font', config.principalFont);
  }

  onInput(e: Event, field: keyof ConfigRequest) {
    this.updateField(field, (e.target as HTMLInputElement).value);
  }
}