import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { Producto } from '../../core/data/tienda.model';
import { mensajeError } from '../../core/utils/http-error';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';

@Component({
  imports: [CurrencyPipe, RouterLink, SiPermisoDirective],
  templateUrl: './producto-list.html',
})
export class ProductoList {
  private readonly api = inject(TiendaApiService);
  protected readonly products = signal<Producto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly search = signal('');
  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    return term
      ? this.products().filter((product) =>
        `${product.nombre} ${product.categoria?.nombre ?? ''}`.toLocaleLowerCase().includes(term))
      : this.products();
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listarProductos().subscribe({
      next: (items) => {
        this.products.set(items);
        this.loading.set(false);
      },
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.loading.set(false);
      },
    });
  }

  eliminar(product: Producto): void {
    if (!globalThis.confirm(`¿Dar de baja el producto "${product.nombre}"?`)) {
      return;
    }
    this.error.set(null);
    this.api.eliminarProducto(product.id).subscribe({
      next: () => this.load(),
      error: (failure: unknown) => this.error.set(mensajeError(failure)),
    });
  }
}
