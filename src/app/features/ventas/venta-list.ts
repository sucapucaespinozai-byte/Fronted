import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, input, linkedSignal, numberAttribute, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { mensajeError } from '../../core/utils/http-error';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';
import { Paginador } from '../../shared/components/paginador/paginador';
@Component({
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, SiPermisoDirective, Paginador],
  templateUrl: './venta-list.html',
})
export class VentaList {
  private readonly api = inject(TiendaApiService);
  private readonly router = inject(Router);
  readonly pagina = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly tamanio = input(20, { transform: (v: unknown) => numberAttribute(v, 20) });
  readonly orden = input('fecha', {
    transform: (v: unknown) => (typeof v === 'string' ? v : 'fecha'),
  });
  readonly dir = input('desc', { transform: (v: unknown) => (typeof v === 'string' ? v : 'desc') });
  readonly desde = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  readonly hasta = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  readonly estado = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  readonly clienteId = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  protected readonly form = inject(NonNullableFormBuilder).group({
    desde: [''],
    hasta: [''],
    estado: [''],
    clienteId: [''],
  });
  protected readonly ventas = rxResource({
    params: () => ({
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      ordenarPor: this.orden(),
      direccion: this.dir(),
      desde: this.desde(),
      hasta: this.hasta(),
      estado: this.estado(),
      clienteId: this.clienteId(),
    }),
    stream: ({ params }) => this.api.buscarVentas(params),
  });
  protected readonly pag = linkedSignal<Pagina<Venta> | undefined, Pagina<Venta> | undefined>({
    source: () => (this.ventas.error() ? undefined : this.ventas.value()),
    computation: (n, p) => n ?? p?.value,
  });
  protected readonly mensajeError = mensajeError;
  constructor() {
    effect(() =>
      this.form.patchValue({
        desde: this.desde(),
        hasta: this.hasta(),
        estado: this.estado(),
        clienteId: this.clienteId(),
      }),
    );
  }
  protected navegar(c: Record<string, string | number>) {
    void this.router.navigate([], { queryParams: c, queryParamsHandling: 'merge' });
  }
  buscar() {
    this.navegar({ ...this.form.getRawValue(), pagina: 0 });
    this.ventas.reload();
  }
  limpiar() {
    this.navegar({ desde: '', hasta: '', estado: '', clienteId: '', pagina: 0 });
  }
  ordenarPor(campo: string) {
    this.navegar({
      orden: campo,
      dir: this.orden() === campo && this.dir() === 'asc' ? 'desc' : 'asc',
      pagina: 0,
    });
  }
}

import { Pagina } from '../../core/models/pagina';
import { Venta } from '../../core/data/tienda.model';
