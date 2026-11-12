import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, linkedSignal, numberAttribute, DestroyRef } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { Producto } from '../../core/data/tienda.model';
import { mensajeError } from '../../core/utils/http-error';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';
import { Paginador } from '../../shared/components/paginador/paginador';
@Component({
  imports: [CurrencyPipe, RouterLink, SiPermisoDirective, Paginador],
  templateUrl: './producto-list.html',
})
export class ProductoList {
  private readonly api = inject(TiendaApiService);
  private readonly router = inject(Router);
  readonly pagina = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly tamanio = input(20, { transform: (v: unknown) => numberAttribute(v, 20) });
  readonly orden = input('nombre', {
    transform: (v: unknown) => (typeof v === 'string' ? v : 'nombre'),
  });
  readonly dir = input('asc', { transform: (v: unknown) => (typeof v === 'string' ? v : 'asc') });
  readonly buscar = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  protected readonly filtro = new Subject<string>();
  protected readonly productos = rxResource({
    params: () => ({
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      ordenarPor: this.orden(),
      direccion: this.dir(),
      buscar: this.buscar(),
    }),
    stream: ({ params }) => this.api.listarProductos(params),
  });
  protected readonly pag = linkedSignal<Pagina<Producto> | undefined, Pagina<Producto> | undefined>(
    {
      source: () => (this.productos.error() ? undefined : this.productos.value()),
      computation: (n, p) => n ?? p?.value,
    },
  );
  protected readonly mensajeError = mensajeError;
  constructor() {
    this.filtro
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((buscar) => this.navegar({ buscar, pagina: 0 }));
  }
  protected navegar(c: Record<string, string | number>) {
    void this.router.navigate([], { queryParams: c, queryParamsHandling: 'merge' });
  }
  protected ordenarPor(campo: string) {
    this.navegar({
      orden: campo,
      dir: this.orden() === campo && this.dir() === 'asc' ? 'desc' : 'asc',
      pagina: 0,
    });
  }
  eliminar(p: Producto) {
    if (!confirm(`¿Dar de baja el producto "${p.nombre}"?`)) return;
    this.api
      .eliminarProducto(p.id)
      .subscribe({ next: () => this.productos.reload(), error: (e) => alert(mensajeError(e)) });
  }
}

import { Pagina } from '../../core/models/pagina';
