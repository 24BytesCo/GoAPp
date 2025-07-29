import { Routes } from '@angular/router';
import { Admin } from './admin/admin';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: Admin },
  {
  path: 'proyectos',
  loadChildren: () =>
    import('./admin/proyectos/proyectos.routes').then(m => m.PROYECTOS_ROUTES),
},

];
