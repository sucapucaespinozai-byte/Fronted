import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard } from './core/guards/guards';

const servicioPage = () => import('./features/servicios/servicios.page').then(m => m.ServiciosPage);
const vehiculoPage = () => import('./features/vehiculos/vehiculos.page').then(m => m.VehiculosPage);
const ordenPage = () => import('./features/ordenes/ordenes.page').then(m => m.OrdenesPage);

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login').then(m => m.LoginPage) },
  {
    path: '', canActivate: [authGuard], loadComponent: () => import('./layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./shared/pages/pages').then(m => m.HomePage) },
      { path: 'servicios', canActivate: [permissionGuard], data: { permission: 'SERVICIO_LEER' }, children: [
        { path: '', pathMatch: 'full', loadComponent: servicioPage },
        { path: 'nuevo', canActivate: [permissionGuard], data: { permission: 'SERVICIO_ESCRIBIR' }, loadComponent: servicioPage },
        { path: ':id', canActivate: [permissionGuard], data: { permission: 'SERVICIO_ESCRIBIR' }, children: [{ path: 'editar', loadComponent: servicioPage }] },
      ] },
      { path: 'vehiculos', canActivate: [permissionGuard], data: { permission: 'VEHICULO_LEER' }, children: [
        { path: '', pathMatch: 'full', loadComponent: vehiculoPage },
        { path: 'nuevo', canActivate: [permissionGuard], data: { permission: 'VEHICULO_ESCRIBIR' }, loadComponent: vehiculoPage },
        { path: ':id', canActivate: [permissionGuard], data: { permission: 'VEHICULO_ESCRIBIR' }, children: [{ path: 'editar', loadComponent: vehiculoPage }] },
      ] },
      { path: 'ordenes', canActivate: [permissionGuard], data: { permission: 'ORDEN_LEER' }, children: [
        { path: '', pathMatch: 'full', loadComponent: ordenPage },
        { path: 'nueva', canActivate: [permissionGuard], data: { permission: 'ORDEN_REGISTRAR' }, loadComponent: ordenPage },
      ] },
      { path: 'reportes', canActivate: [permissionGuard], data: { permission: 'REPORTE_VER' }, loadComponent: () => import('./features/reportes/reportes.page').then(m => m.ReportesPage) },
      { path: 'acceso-denegado', loadComponent: () => import('./shared/pages/pages').then(m => m.DeniedPage) },
    ],
  },
  { path: '**', loadComponent: () => import('./shared/pages/pages').then(m => m.NotFoundPage) },
];
