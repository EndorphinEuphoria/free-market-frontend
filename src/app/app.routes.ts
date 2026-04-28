import { Routes } from '@angular/router';
import { RegisterPage } from './features/auth/pages/register-page/register-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { NotFound } from './features/auth/pages/not-found/not-found';
import { HomePage } from './features/home/home-page/home-page';

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
  {
    path:'home',
    component: HomePage
    //canActivate: [authGuard]
  },
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
