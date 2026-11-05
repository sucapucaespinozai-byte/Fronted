import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { Venta } from '../../core/data/tienda.model';
import { mensajeError } from '../../core/utils/http-error';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';

@Component({
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, SiPermisoDirective],
  templateUrl: './venta-list.html',
})
export class VentaList {
  private readonly api = inject(TiendaApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly sales = signal<Venta[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({ desde: [''], hasta: [''], estado: [''] });

  constructor() {
    this.load();
  }

  buscar(): void {
    this.load();
  }

  limpiar(): void {
    this.form.reset({ desde: '', hasta: '', estado: '' });
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.buscarVentas(this.form.getRawValue()).subscribe({
      next: (sales) => {
        this.sales.set(sales);
        this.loading.set(false);
      },
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.loading.set(false);
      },
    });
  }
}
