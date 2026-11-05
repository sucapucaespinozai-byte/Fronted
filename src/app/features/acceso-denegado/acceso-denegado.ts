import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <section class="denied-card">
      <span class="denied-card__code">403</span>
      <span class="denied-card__icon" aria-hidden="true">⊘</span>
      <h1>Acceso denegado</h1>
      <p>Tu usuario no tiene permiso para abrir esta página. Si necesitas acceso, solicítalo a la persona administradora.</p>
      <a routerLink="/inicio" class="button button--primary">Volver al inicio</a>
    </section>
  `,
})
export class AccesoDenegado {}
