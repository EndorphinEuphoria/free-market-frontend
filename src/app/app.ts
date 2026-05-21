import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './features/home/components/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  /**
   * Router needs inject() to get an instance as it is an injectable service
   */
  private router = inject(Router)
  
  private noNavRoutes: string[] = ['/login', '/register', '/profile','/admin','/admin/pim','/admin/analytics'];

  showNavbar(): Boolean {
    return !this.noNavRoutes.includes(this.router.url)
  }
  
  protected readonly title = signal('free-market');
}
