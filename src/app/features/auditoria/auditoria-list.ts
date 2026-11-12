import { Component, inject, input, linkedSignal, numberAttribute, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { Paginador } from '../../shared/components/paginador/paginador';
import { mensajeError } from '../../core/utils/http-error';
@Component({
  imports: [DatePipe, ReactiveFormsModule, Paginador],
  templateUrl: './auditoria-list.html',
})
export class AuditoriaList {
  private readonly api = inject(TiendaApiService);
  private readonly router = inject(Router);
  readonly pagina = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly tamanio = input(20, { transform: (v: unknown) => numberAttribute(v, 20) });
  readonly usuario = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  readonly accion = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  readonly desde = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  readonly hasta = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  protected readonly form = inject(NonNullableFormBuilder).group({
    usuario: [''],
    accion: [''],
    desde: [''],
    hasta: [''],
  });
  protected readonly eventos = rxResource({
    params: () => ({
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      usuario: this.usuario(),
      accion: this.accion(),
      desde: this.desde(),
      hasta: this.hasta(),
    }),
    stream: ({ params }) => this.api.buscarAuditoria(params),
  });
  protected readonly pag = linkedSignal<
    Pagina<Auditoria> | undefined,
    Pagina<Auditoria> | undefined
  >({
    source: () => (this.eventos.error() ? undefined : this.eventos.value()),
    computation: (n, p) => n ?? p?.value,
  });
  protected readonly mensajeError = mensajeError;
  constructor() {
    effect(() =>
      this.form.patchValue({
        usuario: this.usuario(),
        accion: this.accion(),
        desde: this.desde(),
        hasta: this.hasta(),
      }),
    );
  }
  navegar(c: Record<string, string | number>) {
    void this.router.navigate([], { queryParams: c, queryParamsHandling: 'merge' });
  }
  buscar() {
    this.navegar({ ...this.form.getRawValue(), pagina: 0 });
    this.eventos.reload();
  }
}

import { Pagina } from '../../core/models/pagina';
import { Auditoria } from '../../core/data/tienda-api.service';
