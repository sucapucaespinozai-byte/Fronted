import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { Categoria } from '../../core/data/tienda.model';
import { mensajeError } from '../../core/utils/http-error';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';

@Component({
  imports: [RouterLink, SiPermisoDirective],
  templateUrl: './categoria-list.html',
})
export class CategoriaList {
  private readonly api = inject(TiendaApiService);
  protected readonly categories = signal<Categoria[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly search = signal('');
  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    return term
      ? this.categories().filter((item) =>
        `${item.nombre} ${item.descripcion ?? ''}`.toLocaleLowerCase().includes(term))
      : this.categories();
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listarCategorias().subscribe({
      next: (items) => {
        this.categories.set(items);
        this.loading.set(false);
      },
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.loading.set(false);
      },
    });
  }

  eliminar(category: Categoria): void {
    if (!globalThis.confirm(`¿Eliminar la categoría "${category.nombre}"?`)) {
      return;
    }
    this.error.set(null);
    this.api.eliminarCategoria(category.id).subscribe({
      next: () => this.load(),
      error: (failure: unknown) => this.error.set(mensajeError(failure)),
    });
  }
}
