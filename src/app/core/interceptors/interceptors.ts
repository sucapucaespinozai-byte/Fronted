import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const bearerInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.session()?.token;
  if (!token || !request.url.startsWith(environment.apiUrl)) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const unauthorizedInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(request).pipe(catchError(error => {
    const isLogin = request.url.endsWith('/auth/login');
    if (error.status === 401 && !isLogin) {
      const returnUrl = router.url;
      auth.logout(false);
      void router.navigate(['/login'], { queryParams: { returnUrl } });
    }
    return throwError(() => error);
  }));
};
