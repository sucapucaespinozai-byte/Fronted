import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { Categoria } from '../../core/data/tienda.model';
import { mensajeError } from '../../core/utils/http-error';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.html',
})
export class ProductoForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(TiendaApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly id = Number(this.route.snapshot.paramMap.get('id')) || null;
  protected readonly categories = signal<Categoria[]>([]);
  protected readonly loading = signal(this.id !== null);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    precio: ['', [Validators.required]],
    stock: ['', [Validators.required]],
    categoriaId: ['', [Validators.required]],
  });

  constructor() {
    this.api.listarCategorias().subscribe({
      next: (categories) => this.categories.set(categories.filter((category) => category.activo === 1)),
      error: (failure: unknown) => this.error.set(mensajeError(failure)),
    });
    if (this.id !== null) {
      this.api.obtenerProducto(this.id).subscribe({
        next: (product) => {
          this.form.setValue({
            nombre: product.nombre,
            precio: String(product.precio),
            stock: String(product.stock),
            categoriaId: String(product.categoria.id),
          });
          this.loading.set(false);
        },
        error: (failure: unknown) => {
          this.error.set(mensajeError(failure));
          this.loading.set(false);
        },
      });
    }
  }

  guardar(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    const price = Number(values.precio);
    const stock = Number(values.stock);
    const categoryId = Number(values.categoriaId);
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0 || !Number.isInteger(categoryId) || categoryId <= 0) {
      this.error.set('Ingresa un precio mayor que cero, un stock entero no negativo y una categoría válida.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    const request = { nombre: values.nombre.trim(), precio: price, stock, categoriaId: categoryId };
    const save = this.id === null
      ? this.api.crearProducto(request)
      : this.api.actualizarProducto(this.id, request);
    save.subscribe({
      next: () => void this.router.navigate(['/productos']),
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.saving.set(false);
      },
    });
  }
}
