import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Cliente, DetalleVentaRequest, Producto } from '../../core/data/tienda.model';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { mensajeError } from '../../core/utils/http-error';

interface SaleLine {
  productId: number | null;
  quantity: number;
}

@Component({
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './venta-form.html',
})
export class VentaForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(TiendaApiService);
  private readonly router = inject(Router);
  protected readonly clients = signal<Cliente[]>([]);
  protected readonly products = signal<Producto[]>([]);
  protected readonly lines = signal<SaleLine[]>([{ productId: null, quantity: 1 }]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({ clienteId: ['', Validators.required] });
  protected readonly total = computed(() =>
    this.lines().reduce((sum, line) => {
      const product = this.products().find((item) => item.id === line.productId);
      return sum + (product ? Number(product.precio) * line.quantity : 0);
    }, 0),
  );

  constructor() {
    forkJoin({
      clients: this.api.listarClientes(),
      products: this.api.listarProductos(),
    }).subscribe({
      next: ({ clients, products }) => {
        this.clients.set(clients.filter((client) => client.estado));
        this.products.set(products);
        this.loading.set(false);
      },
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.loading.set(false);
      },
    });
  }

  agregarLinea(): void {
    this.lines.update((lines) => [...lines, { productId: null, quantity: 1 }]);
  }

  quitarLinea(index: number): void {
    this.lines.update((lines) => lines.filter((_line, current) => current !== index));
  }

  seleccionarProducto(index: number, event: Event): void {
    const productId = Number((event.target as HTMLSelectElement).value) || null;
    this.lines.update((lines) => lines.map((line, current) =>
      current === index ? { ...line, productId } : line));
  }

  cambiarCantidad(index: number, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    this.lines.update((lines) => lines.map((line, current) =>
      current === index ? { ...line, quantity } : line));
  }

  guardar(): void {
    const lines = this.lines();
    if (this.form.invalid || !lines.length || lines.some((line) => !line.productId || !Number.isInteger(line.quantity) || line.quantity < 1)) {
      this.form.markAllAsTouched();
      this.error.set('Selecciona un cliente y al menos un producto con una cantidad válida.');
      return;
    }

    const grouped = new Map<number, number>();
    for (const line of lines) {
      if (line.productId === null) {
        this.error.set('Selecciona un producto para cada detalle de la venta.');
        return;
      }
      grouped.set(line.productId, (grouped.get(line.productId) ?? 0) + line.quantity);
    }
    const details: DetalleVentaRequest[] = Array.from(grouped, ([productoId, cantidad]) => ({ productoId, cantidad }));
    const insufficientStock = details.find((detail) => {
      const product = this.products().find((item) => item.id === detail.productoId);
      return !product || detail.cantidad > product.stock;
    });
    if (insufficientStock) {
      const product = this.products().find((item) => item.id === insufficientStock.productoId);
      this.error.set(`No hay stock suficiente para ${product?.nombre ?? 'el producto seleccionado'}.`);
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.api.crearVenta({
      clienteId: Number(this.form.controls.clienteId.value),
      detalles: details,
    }).subscribe({
      next: (sale) => void this.router.navigate(['/ventas', sale.id]),
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.saving.set(false);
      },
    });
  }
}
