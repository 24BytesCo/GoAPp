import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout.component';
import { LoginComponent } from './auth/login.component';
import { AuthGuard } from './core/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '',   redirectTo:'mapa', pathMatch:'full' },
    //   { path: 'mapa', loadChildren: () =>
    //       import('./public/public.routes').then(m => m.PUBLIC_ROUTES) },

      { path: 'admin',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./admin.routes').then(m => m.ADMIN_ROUTES) },
    ],
  },
  { path: 'auth', component: LoginComponent },
  { path: '**', redirectTo:'' },
];
