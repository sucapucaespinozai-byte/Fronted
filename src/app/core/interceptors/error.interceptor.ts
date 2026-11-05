import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiUrl = new URL(environment.apiUrl, globalThis.location.origin);
      const requestUrl = new URL(request.url, globalThis.location.origin);
      const isApiRequest = requestUrl.origin === apiUrl.origin
        && requestUrl.pathname.startsWith(`${apiUrl.pathname.replace(/\/$/, '')}/`);
      const isLoginRequest = requestUrl.pathname === `${apiUrl.pathname}/auth/login`;

      if (error.status === 401 && isApiRequest && !isLoginRequest) {
        auth.cerrarSesion('expirada', globalThis.location.pathname + globalThis.location.search);
      }

      return throwError(() => error);
    }),
  );
};
