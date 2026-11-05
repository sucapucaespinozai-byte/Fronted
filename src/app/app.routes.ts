import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './core/guards/auth.guard';
import { permisoGuard } from './core/guards/permiso.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión | PharmaSoft',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/login').then((module) => module.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout').then((module) => module.MainLayout),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'categorias' },
      {
        path: 'inicio',
        title: 'Inicio | PharmaSoft',
        loadComponent: () => import('./features/inicio/inicio').then((module) => module.Inicio),
      },
      {
        path: 'categorias',
        canActivate: [permisoGuard],
        data: { permiso: 'CATALOGO_LEER' },
        children: [
          {
            path: '',
            title: 'Categorías | PharmaSoft',
            loadComponent: () =>
              import('./features/categorias/categoria-list').then((module) => module.CategoriaList),
          },
          {
            path: 'nuevo',
            title: 'Nueva categoría | PharmaSoft',
            canActivate: [permisoGuard],
            data: { permiso: 'CATALOGO_ESCRIBIR' },
            loadComponent: () =>
              import('./features/categorias/categoria-form').then((module) => module.CategoriaForm),
          },
          {
            path: ':id/editar',
            title: 'Editar categoría | PharmaSoft',
            canActivate: [permisoGuard],
            data: { permiso: 'CATALOGO_ESCRIBIR' },
            loadComponent: () =>
              import('./features/categorias/categoria-form').then((module) => module.CategoriaForm),
          },
        ],
      },
      {
        path: 'productos',
        canActivate: [permisoGuard],
        data: { permiso: 'CATALOGO_LEER' },
        children: [
          {
            path: '',
            title: 'Productos | PharmaSoft',
            loadComponent: () =>
              import('./features/productos/producto-list').then((module) => module.ProductoList),
          },
          {
            path: 'nuevo',
            title: 'Nuevo producto | PharmaSoft',
            canActivate: [permisoGuard],
            data: { permiso: 'CATALOGO_ESCRIBIR' },
            loadComponent: () =>
              import('./features/productos/producto-form').then((module) => module.ProductoForm),
          },
          {
            path: ':id/editar',
            title: 'Editar producto | PharmaSoft',
            canActivate: [permisoGuard],
            data: { permiso: 'CATALOGO_ESCRIBIR' },
            loadComponent: () =>
              import('./features/productos/producto-form').then((module) => module.ProductoForm),
          },
        ],
      },
      {
        path: 'ventas',
        canActivate: [permisoGuard],
        data: { permiso: 'VENTAS_LEER' },
        children: [
          {
            path: '',
            title: 'Ventas | PharmaSoft',
            loadComponent: () =>
              import('./features/ventas/venta-list').then((module) => module.VentaList),
          },
          {
            path: 'nueva',
            title: 'Nueva venta | PharmaSoft',
            canActivate: [permisoGuard],
            data: { permiso: 'VENTAS_REGISTRAR' },
            loadComponent: () =>
              import('./features/ventas/venta-form').then((module) => module.VentaForm),
          },
          {
            path: ':id',
            title: 'Detalle de venta | PharmaSoft',
            loadComponent: () =>
              import('./features/ventas/venta-detail').then((module) => module.VentaDetail),
          },
        ],
      },
      {
        path: 'cuenta',
        title: 'Mi cuenta | PharmaSoft',
        loadComponent: () => import('./features/cuenta/cuenta').then((module) => module.Cuenta),
      },
      {
        path: 'acceso-denegado',
        title: 'Acceso denegado | PharmaSoft',
        loadComponent: () =>
          import('./features/acceso-denegado/acceso-denegado').then(
            (module) => module.AccesoDenegado,
          ),
      },
      {
        path: '**',
        title: 'Página no encontrada | PharmaSoft',
        loadComponent: () =>
          import('./features/no-encontrado/no-encontrado').then((module) => module.NoEncontrado),
      },
    ],
  },
];
