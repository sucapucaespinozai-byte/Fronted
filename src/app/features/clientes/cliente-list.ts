import { Component, inject, input, numberAttribute, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TiendaApiService } from '../../core/data/tienda-api.service';
import { Paginador } from '../../shared/components/paginador/paginador';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';
import { mensajeError } from '../../core/utils/http-error';
@Component({
  imports: [ReactiveFormsModule, Paginador, SiPermisoDirective],
  templateUrl: './cliente-list.html',
})
export class ClienteList {
  private readonly api = inject(TiendaApiService);
  private readonly router = inject(Router);
  readonly pagina = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly tamanio = input(20, { transform: (v: unknown) => numberAttribute(v, 20) });
  readonly buscar = input('', { transform: (v: unknown) => (typeof v === 'string' ? v : '') });
  protected readonly clientes = rxResource({
    params: () => ({
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      ordenarPor: 'apellidos',
      direccion: 'asc',
      buscar: this.buscar(),
    }),
    stream: ({ params }) => this.api.listarClientes(params),
  });
  protected readonly error = signal('');
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly mensajeError = mensajeError;
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    direccion: [''],
  });
  navegar(c: Record<string, string | number>) {
    void this.router.navigate([], { queryParams: c, queryParamsHandling: 'merge' });
  }
  guardar() {
    if (this.form.invalid || this.guardando()) {
      this.form.markAllAsTouched();
      this.error.set('Completa los datos requeridos. El DNI debe tener 8 dÃƒÂ­gitos.');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.api
      .crearCliente({
        ...this.form.getRawValue(),
        telefono: this.form.controls.telefono.value || null,
        estado: true,
      })
      .subscribe({
        next: (c) => {
          this.guardando.set(false);
          this.mensaje.set(
            'Cliente ' + c.nombres + ' registrado. Ya puedes seleccionarlo en Nueva venta.',
          );
          this.form.reset();
          this.clientes.reload();
        },
        error: (e) => {
          this.error.set(mensajeError(e));
          this.guardando.set(false);
        },
      });
  }
}
