import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).token();
  const apiUrl = new URL(environment.apiUrl, globalThis.location.origin);
  const requestUrl = new URL(request.url, globalThis.location.origin);

  if (!token || requestUrl.origin !== apiUrl.origin || !requestUrl.pathname.startsWith(`${apiUrl.pathname.replace(/\/$/, '')}/`)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
