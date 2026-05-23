import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private readonly API_URL    = 'http://localhost:8086/api-v1/config';
  private readonly http       = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  commerceName = signal<string>('FreeMarket');
  logoUrl      = signal<string>('');  
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
    if (!isPlatformBrowser(this.platformId)) return; 

    const root     = document.documentElement;
    const fontName = config.principalFont;

    const existingLink = document.querySelector('link[data-gfont]');
    if (existingLink) existingLink.remove();
    const fontLink = document.createElement('link');
    fontLink.rel  = 'stylesheet';
    fontLink.setAttribute('data-gfont', 'true');
    fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(fontLink);

    root.style.setProperty('--commerce-font',      `'${fontName}'`);
    root.style.setProperty('--commerce-primary',    config.primaryColor);
    root.style.setProperty('--commerce-secondary',  config.secondaryColor);
    root.style.setProperty('--color-primary',        config.primaryColor);
    root.style.setProperty('--color-primary-hover',  config.secondaryColor);
    document.body.style.fontFamily = `'${fontName}', sans-serif`;

    if (config.commerceName) {
      this.commerceName.set(config.commerceName);
      document.title = config.commerceName;
    }

    this.logoUrl.set(config.logoUrl ?? '');

    if (config.favicomUrl) {
      let favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = config.favicomUrl;
    } else {
      const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (favicon) favicon.remove();
    }
  }

  getPublicConfig(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(`${this.API_URL}/public`);
  }
}