import { Routes } from '@angular/router';
import { ProyectoList } from './proyecto-list/proyecto-list';
import { ProyectoForm } from './proyecto-form/proyecto-form';

export const PROYECTOS_ROUTES: Routes = [
  { path: '', component: ProyectoList },
  { path: 'nuevo', component: ProyectoForm },
  { path: ':id/editar', component: ProyectoForm },
];
