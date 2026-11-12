import { HttpErrorResponse } from '@angular/common/http';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function mensajeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado. Inténtelo nuevamente.';
  }

  const codigo = isRecord(error.error) ? error.error['requestId'] : null;
  const seguimiento = (mensaje: string): string => typeof codigo === 'string' && /^[a-zA-Z0-9-]{8,64}$/.test(codigo)
    ? `${mensaje} Código de seguimiento: ${codigo}` : mensaje;

  if (error.status === 0) {
    return 'No se pudo conectar con el backend. Verifique que el servicio esté disponible.';
  }
  if (error.status === 401) {
    return seguimiento('Usuario o contraseña incorrectos.');
  }
  if (error.status === 403) {
    return seguimiento('Su usuario no tiene permiso para realizar esta acción.');
  }
  if (isRecord(error.error)) {
    const message = error.error['mensaje'] ?? error.error['message'];
    if (typeof message === 'string' && message.trim()) {
      return seguimiento(message);
    }
    const errors = error.error['errores'] ?? error.error['errors'];
    if (Array.isArray(errors) && errors.every((item: unknown) => typeof item === 'string')) {
      return seguimiento(errors.join(' '));
    }
  }
  return seguimiento(error.message || `La solicitud no se pudo completar (HTTP ${error.status}).`);
}
