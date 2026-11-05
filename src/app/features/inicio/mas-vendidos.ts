import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { mensajeError } from '../../core/utils/http-error';

interface ProductoMasVendido {
  productoId: number;
  productoNombre: string;
  categoriaNombre: string;
  cantidadVendida: number;
  montoTotal: number;
}

@Component({
  selector: 'app-mas-vendidos',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './mas-vendidos.html',
})
export class MasVendidos {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly filas = signal<ProductoMasVendido[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() { this.cargar(); }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.http.get<ProductoMasVendido[]>(`${environment.apiUrl}/reportes/productos-mas-vendidos`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (filas) => { this.filas.set(filas); this.cargando.set(false); },
        error: (error: unknown) => { this.error.set(mensajeError(error)); this.cargando.set(false); },
      });
  }
}
