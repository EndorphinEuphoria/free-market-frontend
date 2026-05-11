import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  /**
   * Router needs inject() to get an instance as it is an injectable service
   */
  private router = inject(Router)
  
  private noNavRoutes: string[] = ['/login', '/register'];

  isForHiddenNav(): Boolean {
    return this.router.url in this.noNavRoutes
  }
  
  protected readonly title = signal('free-market');
}
