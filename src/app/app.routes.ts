import { Routes } from '@angular/router';
import { RegisterPage } from './features/auth/pages/register-page/register-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { NotFound } from './features/auth/pages/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  },
  // BACKEND: add protected routes here with canActivate: [authGuard]
  // {
  //   path: 'home',
  //   Component:HomePage
  //   canActivate: [authGuard]
  // },
  {
    path: '**',
    component: NotFound
  }
];
