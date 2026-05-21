import { Component, inject } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLinkActive, RouterLinkWithHref],
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.css',
})
export class AdminNavbar {
  readonly auth = inject(Auth);
}