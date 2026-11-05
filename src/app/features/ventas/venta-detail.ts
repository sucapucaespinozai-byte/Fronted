import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { Venta } from '../../core/data/tienda.model';
import { mensajeError } from '../../core/utils/http-error';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './venta-detail.html',
})
export class VentaDetail {
  private readonly api = inject(TiendaApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly sale = signal<Venta | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('El número de venta no es válido.');
      this.loading.set(false);
      return;
    }

    this.api.obtenerVenta(id).subscribe({
      next: (sale) => {
        this.sale.set(sale);
        this.loading.set(false);
      },
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.loading.set(false);
      },
    });
  }
}
