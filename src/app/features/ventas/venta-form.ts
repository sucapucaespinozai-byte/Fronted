import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Cliente, Producto, DetalleVentaRequest } from '../../core/data/tienda.model';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { mensajeError } from '../../core/utils/http-error';
interface SaleLine {
  product: Producto;
  quantity: number;
}
@Component({
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './venta-form.html',
})
export class VentaForm {
  private readonly api = inject(TiendaApiService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly draftKey = 'pharmasoft.venta.borrador.' + (this.auth.sesion()?.username ?? '');
  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly lines = signal<SaleLine[]>([]);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly textoCliente = signal('');
  protected readonly textoProducto = signal('');
  private readonly buscarCliente = new Subject<string>();
  private readonly buscarProducto = new Subject<string>();
  protected readonly clientes = rxResource({
    params: () => ({
      pagina: 0,
      tamanio: 20,
      ordenarPor: 'apellidos',
      direccion: 'asc',
      buscar: this.textoCliente(),
    }),
    stream: ({ params }) => this.api.listarClientes(params),
  });
  protected readonly productos = rxResource({
    params: () => ({
      pagina: 0,
      tamanio: 20,
      ordenarPor: 'nombre',
      direccion: 'asc',
      buscar: this.textoProducto(),
      disponibles: true,
    }),
    stream: ({ params }) => this.api.listarProductos(params),
  });
  protected readonly total = computed(() =>
    this.lines().reduce((n, l) => n + Number(l.product.precio) * l.quantity, 0),
  );
  protected readonly mensajeError = mensajeError;
  constructor() {
    try {
      const d = JSON.parse(sessionStorage.getItem(this.draftKey) || 'null');
      if (d) {
        this.cliente.set(d.cliente);
        this.lines.set(d.lines || []);
      }
    } catch {
      sessionStorage.removeItem(this.draftKey);
    }
    this.buscarCliente
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((t) => this.textoCliente.set(t));
    this.buscarProducto
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((t) => this.textoProducto.set(t));
    effect(() =>
      sessionStorage.setItem(
        this.draftKey,
        JSON.stringify({ cliente: this.cliente(), lines: this.lines() }),
      ),
    );
  }
  filtrarCliente(t: string) {
    this.buscarCliente.next(t);
  }
  filtrarProducto(t: string) {
    this.buscarProducto.next(t);
  }
  agregar(p: Producto) {
    this.lines.update((ls) => {
      let l = ls.find((l) => l.product.id === p.id);
      return l
        ? ls.map((x) => (x === l ? { product: p, quantity: x.quantity + 1 } : x))
        : [...ls, { product: p, quantity: 1 }];
    });
  }
  cantidad(i: number, v: string) {
    this.lines.update((ls) => ls.map((l, n) => (n === i ? { ...l, quantity: Number(v) } : l)));
  }
  quitar(i: number) {
    this.lines.update((ls) => ls.filter((_, n) => n !== i));
  }
  guardar() {
    if (this.saving()) return;
    if (
      !this.cliente() ||
      !this.lines().length ||
      this.lines().some(
        (l) => !Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > l.product.stock,
      )
    ) {
      this.error.set(
        'Selecciona un cliente y productos con cantidades válidas y stock suficiente.',
      );
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const detalles: DetalleVentaRequest[] = this.lines().map((l) => ({
      productoId: l.product.id,
      cantidad: l.quantity,
    }));
    this.api.crearVenta({ clienteId: this.cliente()!.id, detalles }).subscribe({
      next: (s) => {
        sessionStorage.removeItem(this.draftKey);
        void this.router.navigate(['/ventas', s.id], { queryParams: { registrada: 1 } });
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.saving.set(false);
        this.productos.reload();
      },
    });
  }
}
