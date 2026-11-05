import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { mensajeError } from '../../core/utils/http-error';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './categoria-form.html',
})
export class CategoriaForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(TiendaApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly id = Number(this.route.snapshot.paramMap.get('id')) || null;
  protected readonly loading = signal(this.id !== null);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(255)]],
    activo: [true],
  });

  constructor() {
    if (this.id !== null) {
      this.api.obtenerCategoria(this.id).subscribe({
        next: (category) => {
          this.form.setValue({
            nombre: category.nombre,
            descripcion: category.descripcion ?? '',
            activo: category.activo === 1,
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
    this.saving.set(true);
    this.error.set(null);
    const request = this.form.getRawValue();
    const save = this.id === null
      ? this.api.crearCategoria(request)
      : this.api.actualizarCategoria(this.id, request);

    save.subscribe({
      next: () => void this.router.navigate(['/categorias']),
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.saving.set(false);
      },
    });
  }
}
