import { Routes } from '@angular/router';
import { RegisterPage } from './features/auth/pages/register-page/register-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { NotFound } from './features/auth/pages/not-found/not-found';
import { HomePage } from './features/home/home-page/home-page';
import { CatalogPage } from './features/shop/pages/catalog-page/catalog-page';
import { ProfilePage } from './features/auth/pages/profile-page/profile-page';
import { AdminDashboardPage } from './features/admin/pages/admin-dashboard-page/admin-dashboard-page';
import { PimPageComponent } from './features/admin/pages/pim-page/pim-page'; 
import { AnalyticsPageComponent } from './features/admin/pages/analitycs-page/analitycs-page'; 
import {ConfiguracionesPageComponent} from './features/admin/pages/configuraciones-page/configuraciones-page'
import{ProductosPageComponent} from './features/admin/pages/productos-page/productos-page'
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
  {
  path: 'admin',
  component: AdminDashboardPage
  
  },
  { path: 'admin/pim',
   component: PimPageComponent 
  }, 
  { path: 'admin/analytics', 
  component: AnalyticsPageComponent },

  { path: 'admin/configuraciones', 
  component: ConfiguracionesPageComponent },
  
  { path: 'admin/productos', 
  component: ProductosPageComponent },

  // {
  //   path: 'home',
  //   Component:HomePage
  //   canActivate: [authGuard]
  // },
  {
    path: 'shop',
    component: CatalogPage
  },
  {
    path: 'profile',
    component: ProfilePage
  },
  {
    path: '**',
    component: NotFound
  }
];
