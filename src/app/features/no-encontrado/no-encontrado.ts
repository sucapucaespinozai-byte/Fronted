import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <section class="denied-card">
      <span class="denied-card__code">404</span>
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no está disponible.</p>
      <a routerLink="/inicio" class="button button--primary">Volver al inicio</a>
    </section>
  `,
})
export class NoEncontrado {}
