import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly auth = inject(AuthService);
  protected readonly menuOpen = signal(false);

  protected readonly menu = computed(() => {
    const links = [
      { label: 'Inicio', route: '/inicio', icon: '⌂', permission: null },
      {
        label: 'Categorías',
        route: '/categorias',
        icon: '▤',
        permission: 'CATALOGO_LEER' as const,
      },
      { label: 'Productos', route: '/productos', icon: '◈', permission: 'CATALOGO_LEER' as const },
      { label: 'Ventas', route: '/ventas', icon: '↗', permission: 'VENTAS_LEER' as const },
    ];
    return links.filter((item) => !item.permission || this.auth.tienePermiso(item.permission));
  });

  salir(): void {
    this.auth.cerrarSesion();
  }

  protected obtenerHoraExpiracion(fecha: string | Date | number | undefined): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
