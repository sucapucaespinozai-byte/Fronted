import { HttpErrorResponse } from '@angular/common/http';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function mensajeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado. Inténtelo nuevamente.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el backend. Verifique que el servicio esté disponible.';
  }
  if (error.status === 401) {
    return 'Usuario o contraseña incorrectos.';
  }
  if (error.status === 403) {
    return 'Su usuario no tiene permiso para realizar esta acción.';
  }
  if (isRecord(error.error)) {
    const message = error.error['mensaje'] ?? error.error['message'];
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    const errors = error.error['errores'] ?? error.error['errors'];
    if (Array.isArray(errors) && errors.every((item: unknown) => typeof item === 'string')) {
      return errors.join(' ');
    }
  }
  return error.message || `La solicitud no se pudo completar (HTTP ${error.status}).`;
}
