import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [AdminNavbar, RouterLinkWithHref],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  currentSlide = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  
slides = [
  {
    step: 'Paso 1',
    title: 'Configura tu cuenta',
    desc: 'Personaliza tu perfil de administrador, ajusta tus datos y preferencias antes de empezar.',
    action: 'Ver perfil',
    route: '/profile',
    icon: '👤',
  },
  {
    step: 'Paso 2',
    title: 'Configura tu catálogo',
    desc: 'Comienza añadiendo productos y categorías en el PIM. Define atributos y variantes para tu tienda.',
    action: 'Ir a PIM',
    route: '/admin/pim',
    icon: '📦',
  },
  {
    step: 'Paso 3',
    title: 'Gestiona tu inventario',
    desc: 'Mantén el stock actualizado, asigna precios y controla la disponibilidad de cada producto.',
    action: 'Gestión de productos',
    route: '/admin/products',
    icon: '🗂️',
  },
  {
    step: 'Paso 4',
    title: 'Revisa tus métricas',
    desc: 'Analiza ventas, visitas y conversiones desde el panel de Analytics para tomar mejores decisiones.',
    action: 'Ver Analytics',
    route: '/admin/analytics',
    icon: '📊',
  },
];

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.timer = setInterval(() => this.next(), 20000);
  }

  stopAutoplay() {
    if (this.timer) clearInterval(this.timer);
  }

  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  prev() {
    this.currentSlide.update(i => (i === 0 ? this.slides.length - 1 : i - 1));
    this.resetAutoplay();
  }

  next() {
    this.currentSlide.update(i => (i === this.slides.length - 1 ? 0 : i + 1));
  }

  goTo(i: number) {
    this.currentSlide.set(i);
    this.resetAutoplay();
  }
}