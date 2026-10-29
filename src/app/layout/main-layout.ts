import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-main-layout', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/"><span class="brand-mark">A</span><span>AutoAndes<small>GESTIÓN DE TALLER</small></span></a>
        <div class="nav-caption">MENÚ PRINCIPAL</div>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span>⌂</span> Inicio</a>
          @if (auth.has('SERVICIO_LEER')) { <a routerLink="/servicios" routerLinkActive="active"><span>▧</span> Servicios</a> }
          @if (auth.has('VEHICULO_LEER')) { <a routerLink="/vehiculos" routerLinkActive="active"><span>▱</span> Vehículos</a> }
          @if (auth.has('ORDEN_LEER')) { <a routerLink="/ordenes" routerLinkActive="active"><span>▤</span> Órdenes</a> }
          @if (auth.has('ORDEN_REGISTRAR')) { <a routerLink="/ordenes/nueva" routerLinkActive="active"><span>＋</span> Nueva orden</a> }
          @if (auth.has('REPORTE_VER')) { <a routerLink="/reportes" routerLinkActive="active"><span>▥</span> Reportes</a> }
        </nav>
        <div class="sidebar-bottom"><div class="status-dot"></div><span>API AutoAndes</span><small>localhost:8080</small></div>
      </aside>
      <section class="workspace">
        <header class="topbar"><div class="crumb">AutoAndes <span>/</span> Panel de gestión</div><div class="user-pill"><span class="avatar">{{ initials }}</span><span>{{ auth.session()?.nombreCompleto || 'Usuario' }}<small>{{ auth.session()?.roles?.join(' · ') }}</small></span><button class="link-button" type="button" (click)="auth.logout()">Salir</button></div></header>
        <main class="content"><router-outlet /></main>
      </section>
    </div>`
})
export class MainLayout {
  readonly auth = inject(AuthService);
  get initials(): string { return (this.auth.session()?.nombreCompleto ?? 'AA').split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase(); }
}
