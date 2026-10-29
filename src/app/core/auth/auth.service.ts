import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginPayload, SessionUser, UserInfo } from '../models/models';

const STORAGE_KEY = 'autoandes.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionState = signal<SessionUser | null>(this.restore());
  readonly session = this.sessionState.asReadonly();
  readonly authenticated = computed(() => !!this.sessionState() && !this.expired());
  readonly permissions = computed(() => this.sessionState()?.permisos ?? []);
  private expiryTimer?: ReturnType<typeof setTimeout>;

  login(payload: LoginPayload): Observable<SessionUser> {
    return this.http.post<SessionUser>(`${environment.apiUrl}/auth/login`, payload).pipe(tap(s => this.save(s)));
  }
  me(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${environment.apiUrl}/auth/me`).pipe(tap(user => {
      const current = this.sessionState();
      if (current) this.save({ ...current, nombreCompleto: user.nombreCompleto, roles: user.roles, permisos: user.permisos });
    }));
  }
  has(permission: string): boolean { return this.authenticated() && this.permissions().includes(permission); }
  logout(redirect = true): void {
    this.sessionState.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    if (redirect) void this.router.navigate(['/login']);
  }
  private save(session: SessionUser): void {
    const saved = { ...session, expiresAt: Date.now() + Math.max(1, session.expiraEnSegundos) * 1000 } as SessionUser & { expiresAt: number };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    this.sessionState.set(session);
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.expiryTimer = setTimeout(() => this.logout(), Math.max(1, session.expiraEnSegundos) * 1000);
  }
  private restore(): SessionUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw) as SessionUser & { expiresAt: number };
      if (!saved.expiresAt || saved.expiresAt <= Date.now()) { sessionStorage.removeItem(STORAGE_KEY); return null; }
      this.expiryTimer = setTimeout(() => this.logout(), saved.expiresAt - Date.now());
      return saved;
    } catch { sessionStorage.removeItem(STORAGE_KEY); return null; }
  }
  private expired(): boolean {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    try { return (JSON.parse(raw).expiresAt ?? 0) <= Date.now(); } catch { return true; }
  }
}
