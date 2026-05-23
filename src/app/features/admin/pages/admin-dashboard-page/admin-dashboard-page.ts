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
      step:   'Step 1',
      title:  'Set up your account',
      desc:   'Customize your admin profile, adjust your details and preferences before getting started.',
      action: 'View profile',
      route:  '/profile',
      icon:   '👤',
    },
    {
      step:   'Step 2',
      title:  'Set up your catalog',
      desc:   'Start by adding products and categories in the PIM. Define attributes and variants for your store.',
      action: 'Go to PIM',
      route:  '/admin/pim',
      icon:   '📦',
    },
    {
      step:   'Step 3',
      title:  'Manage your inventory',
      desc:   'Keep stock up to date, set prices and control the availability of each product.',
      action: 'Product management',
      route:  '/admin/products',
      icon:   '🗂️',
    },
    {
      step:   'Step 4',
      title:  'Review your metrics',
      desc:   'Analyze sales, visits and conversions from the Analytics dashboard to make better decisions.',
      action: 'View Analytics',
      route:  '/admin/analytics',
      icon:   '📊',
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