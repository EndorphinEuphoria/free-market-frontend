import { ApplicationConfig, inject, PLATFORM_ID, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http'; // ← withFetch
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { Auth } from './core/services/auth';
import { isPlatformBrowser } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),              // ← NUEVO
      withInterceptors([authInterceptor])
    ),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideAppInitializer(() => {
      const auth = inject(Auth);
      const platformId = inject(PLATFORM_ID);
      if (isPlatformBrowser(platformId)) {
        auth.restoreSession();
      }
    })
  ]
};