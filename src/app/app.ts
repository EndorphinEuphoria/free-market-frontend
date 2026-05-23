import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './features/home/components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FloatingCart } from "./features/shop/components/floating-cart/floating-cart";
import { ConfigService } from './core/services/config-service';
import { Auth } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, CommonModule, FloatingCart],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private router        = inject(Router);
  private configService = inject(ConfigService);
  private auth          = inject(Auth);
  private platformId    = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.auth.restoreSession();
    }
  }

  private noNavRoutes: string[] = [
    '/login', '/register', '/profile',
    '/admin', '/admin/pim', '/admin/analytics',
    '/admin/configuraciones', '/admin/productos',
    '/delivery','/delivery/entregas',
    '/delivery/:id',
  ];

  

  protected readonly title = signal('free-market');

  ngOnInit() {
    console.log('AppComponent ngOnInit, isBrowser:', isPlatformBrowser(this.platformId));
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.restoreSession();
    this.loadAndApplyConfig();
  }

 

  private loadAndApplyConfig() {
  console.log('loadAndApplyConfig llamado');
  this.configService.getPublicConfig().subscribe({
    next: (data) => {
      console.log('config cargada:', data);
      this.configService.applyStyles({
        idUser:         0,
        commerceName:   data.commerceName,
        logoUrl:        data.logoUrl,
        favicomUrl:     data.favicomUrl,
        principalFont:  data.principalFont,
        primaryColor:   data.primaryColor,
        secondaryColor: data.secondaryColor,
        updateAt:       data.updateDate
      });
    },
    error: (err) => {
      console.log('error cargando config:', err);
      this.configService.applyStyles({
        idUser:         0,
        commerceName:   'FreeMarket',
        logoUrl:        '',
        favicomUrl:     '',
        principalFont:  'DM Sans',
        primaryColor:   '#2563EB',
        secondaryColor: '#1D4ED8',
        updateAt:       ''
      });
    }
  });
}

  showNavbar(): Boolean {
  return !this.noNavRoutes.includes(this.router.url) && !this.router.url.startsWith('/delivery');
}
}