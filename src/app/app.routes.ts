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
import{DeliveryDashboardPage} from './features/delivery/pages/delivery-dashboard-page/delivery-dashboard-page'
import{MisEntregasPage} from './features/delivery/pages/mis-entregas-page/mis-entregas-page'
import { authGuard } from './core/guards/auth-guard';
import { deliveryOnlyGuard } from './core/guards/delivery-only-guard';
import { userOnlyGuard } from './core/guards/user-only-guard';
import { adminOnlyGuard } from './core/guards/admin-only-guard';
export const routes: Routes = [
  
  // Normal routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'register',              component: RegisterPage },
  { path: 'login',                 component: LoginPage },
  { path: 'home',                  component: HomePage, canActivate: [userOnlyGuard] },
  { path: 'shop',                  component: CatalogPage, canActivate: [userOnlyGuard]},
  { path: 'profile',               component: ProfilePage,                  canActivate: [authGuard] },
  { path: 'delivery',              component: DeliveryDashboardPage,        canActivate: [authGuard, deliveryOnlyGuard] },
  { path: 'delivery/entregas',     component: MisEntregasPage,              canActivate: [authGuard, deliveryOnlyGuard] }, 

  // Admin routes
  { path: 'admin',                 component: AdminDashboardPage,           canActivate: [authGuard, adminOnlyGuard] },
  { path: 'admin/pim',             component: PimPageComponent,             canActivate: [authGuard, adminOnlyGuard] }, 
  { path: 'admin/analytics',       component: AnalyticsPageComponent,       canActivate: [authGuard, adminOnlyGuard] },
  { path: 'admin/configuraciones', component: ConfiguracionesPageComponent, canActivate: [authGuard, adminOnlyGuard] },
  { path: 'admin/productos',       component: ProductosPageComponent,       canActivate: [authGuard, adminOnlyGuard] },

  // not-found route always at the bottom
  { path: '**',                    component: NotFound }
];
