import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MasVendidos } from './mas-vendidos';

@Component({
  standalone: true,
  imports: [RouterLink, MasVendidos],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  protected readonly auth = inject(AuthService);
}
