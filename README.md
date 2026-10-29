# AutoAndes Web

SPA Angular 22 para el sistema de órdenes de servicio del taller AutoAndes.

## Requisitos

- Node.js 22.12+ o 24+
- npm 11+
- Backend AutoAndes activo en `http://localhost:8080`
- Base Oracle inicializada y usuarios de prueba creados por el backend

## Instalación y ejecución

Desde esta carpeta (`autoandes-web`):

```powershell
npm install
npm start
```

Abre `http://localhost:4200`. La API se configura en `src/environments/environment.ts` y apunta a `http://localhost:8080/api/v1`.

## Funcionalidad

- Inicio de sesión JWT; sesión en `sessionStorage` con vencimiento.
- Interceptor Bearer limitado a la API e interceptor 401; un 403 mantiene la sesión.
- Guards de sesión, invitado y permiso; menú y accesos visibles según permisos.
- CRUD de servicios con alta, edición, búsqueda y baja lógica.
- CRUD de vehículos con clientes cargados desde la API y filtro por cliente.
- Registro de órdenes con detalle dinámico, cálculo visual de subtotales/total y controles de validación del servidor.
- Consulta de órdenes con filtros y anulación autorizada por permiso.
- Reporte de ingresos agrupados por servicio.

Las peticiones usan el contrato real bajo `/api/v1`; no hay listas de negocio simuladas. Si la app muestra un error de conexión, confirma primero que el backend haya iniciado en el puerto 8080 y que permita CORS desde `http://localhost:4200`.

Las cuentas de prueba y sus contraseñas son las que se inicializaron en el backend para el examen. No guardes secretos de Oracle en este proyecto.
