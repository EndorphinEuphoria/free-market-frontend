import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  id: number;
  commerceName: string;
  logoUrl: string;
  favicomUrl: string;
  principalFont: string;
  primaryColor: string;
  secondaryColor: string;
  updateDate: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {

  private readonly API_URL = 'http://localhost:8086/api-v1/config';
  private readonly http    = inject(HttpClient);

  commerceName = signal<string>('FreeMarket'); 

  getConfig(idUser: number): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(`${this.API_URL}/get/${idUser}`);
  }

  createConfig(request: ConfigRequest): Observable<ConfigResponse> {
    return this.http.post<ConfigResponse>(`${this.API_URL}/create`, request);
  }

  updateConfig(id: number, request: ConfigRequest): Observable<ConfigResponse> {
    return this.http.patch<ConfigResponse>(`${this.API_URL}/update/${id}`, request);
  }

  applyStyles(config: ConfigRequest) {
  const root = document.documentElement;
  root.style.setProperty('--commerce-primary',   config.primaryColor);
  root.style.setProperty('--commerce-secondary', config.secondaryColor);
  root.style.setProperty('--commerce-font',      config.principalFont);
  
  root.style.setProperty('--color-primary',       config.primaryColor);
  root.style.setProperty('--color-primary-hover', config.secondaryColor);

  document.body.style.fontFamily = config.principalFont + ', sans-serif';

  if (config.commerceName) {
    this.commerceName.set(config.commerceName);
    document.title = config.commerceName;
  }

  if (config.favicomUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = config.favicomUrl;
  }
}

  getPublicConfig(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(`${this.API_URL}/public`);
}
}