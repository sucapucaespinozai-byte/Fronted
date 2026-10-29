import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService); const router = inject(Router);
  return auth.authenticated() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService); const router = inject(Router);
  return auth.authenticated() ? router.createUrlTree(['/']) : true;
};
export const permissionGuard: CanActivateFn = route => {
  const auth = inject(AuthService); const router = inject(Router);
  const permission = route.data['permission'] as string | undefined;
  return !permission || auth.has(permission) ? true : router.createUrlTree(['/acceso-denegado']);
};
