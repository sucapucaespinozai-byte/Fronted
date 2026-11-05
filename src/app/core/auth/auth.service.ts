import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Permiso, Sesion } from './auth.model';

const SESSION_KEY = 'pharmasoft.sesion';
const WARNING_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

function isSession(value: unknown): value is Sesion {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate['token'] === 'string'
    && typeof candidate['tipo'] === 'string'
    && typeof candidate['expiraEn'] === 'number'
    && typeof candidate['username'] === 'string'
    && typeof candidate['nombreCompleto'] === 'string'
    && Array.isArray(candidate['roles'])
    && candidate['roles'].every((role: unknown) => typeof role === 'string')
    && Array.isArray(candidate['permisos'])
    && candidate['permisos'].every((permission: unknown) => typeof permission === 'string');
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionState = signal<Sesion | null>(this.restoreSession());
  private warningTimer?: ReturnType<typeof setTimeout>;
  private expiryTimer?: ReturnType<typeof setTimeout>;

  readonly sesion = this.sessionState.asReadonly();
  readonly autenticado = computed(() => this.token() !== null);
  readonly advertenciaExpiracion = signal(false);

  constructor() {
    const session = this.sessionState();
    if (session) {
      this.scheduleExpiration(session);
    }
  }

  login(credentials: LoginRequest): Observable<Sesion> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        map((response) => ({
          token: response.token,
          tipo: response.tipo || 'Bearer',
          expiraEn: Date.now() + response.expiraEnSegundos * 1000,
          username: response.username,
          nombreCompleto: response.nombreCompleto,
          roles: response.roles,
          permisos: response.permisos,
        })),
        tap((session) => this.startSession(session)),
      );
  }

  cerrarSesion(motivo?: 'expirada', returnUrl?: string): void {
    this.cancelTimers();
    this.advertenciaExpiracion.set(false);
    this.sessionState.set(null);

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('No se pudo borrar la sesión del almacenamiento del navegador.', error);
    }

    const queryParams: Record<string, string> = {};
    if (motivo) {
      queryParams['expirada'] = '1';
    }
    if (returnUrl && returnUrl !== '/login' && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      queryParams['returnUrl'] = returnUrl;
    }

    void this.router.navigate(['/login'], { queryParams });
  }

  token(): string | null {
    const session = this.sessionState();
    return session && Date.now() < session.expiraEn ? session.token : null;
  }

  tienePermiso(permission: Permiso): boolean {
    return this.sessionState()?.permisos.includes(permission) ?? false;
  }

  private startSession(session: Sesion): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionState.set(session);
    this.scheduleExpiration(session);
  }

  private scheduleExpiration(session: Sesion): void {
    this.cancelTimers();
    this.advertenciaExpiracion.set(false);
    const remaining = session.expiraEn - Date.now();

    if (remaining <= 0) {
      this.cerrarSesion('expirada', this.router.url);
      return;
    }

    this.warningTimer = setTimeout(() => {
      this.advertenciaExpiracion.set(true);
    }, Math.max(remaining - WARNING_BEFORE_EXPIRY_MS, 0));

    this.expiryTimer = setTimeout(() => {
      this.cerrarSesion('expirada', this.router.url);
    }, remaining);
  }

  private cancelTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
    }
  }

  private restoreSession(): Sesion | null {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) {
        return null;
      }

      const parsed: unknown = JSON.parse(stored);
      if (isSession(parsed) && Date.now() < parsed.expiraEn) {
        return parsed;
      }

      console.warn('Se descartó una sesión vencida o con formato inválido.');
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    } catch (error) {
      console.error('No se pudo recuperar la sesión guardada.', error);
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
