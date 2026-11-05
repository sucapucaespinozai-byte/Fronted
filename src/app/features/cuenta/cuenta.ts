import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { mensajeError } from '../../core/utils/http-error';

@Component({
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './cuenta.html',
})
export class Cuenta {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(TiendaApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly saving = signal(false);
  protected readonly success = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    passwordActual: ['', Validators.required],
    passwordNueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
    confirmarPassword: ['', Validators.required],
  });

  cambiarPassword(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { passwordActual, passwordNueva, confirmarPassword } = this.form.getRawValue();
    if (passwordNueva !== confirmarPassword) {
      this.error.set('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);
    this.api.cambiarPassword(passwordActual, passwordNueva).subscribe({
      next: () => {
        this.form.reset();
        this.success.set('Tu contraseña se actualizó correctamente.');
        this.saving.set(false);
      },
      error: (failure: unknown) => {
        this.error.set(mensajeError(failure));
        this.saving.set(false);
      },
    });
  }
}
