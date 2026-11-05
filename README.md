# PharmaSoft

Aplicación SPA para administrar una farmacia, creada con Angular 22 y conectada al backend Spring Boot existente.

## Ejecutar en el navegador

1. Inicia el backend como ya lo ejecutas habitualmente y verifica que esté disponible en `http://localhost:8080`.
2. Abre una terminal en la carpeta `PharmaSoft` e instala las dependencias la primera vez:

   ```powershell
   npm install
   ```

3. Inicia la aplicación:

   ```powershell
   npm start
   ```

4. Abre [http://localhost:4200](http://localhost:4200) e inicia sesión con una cuenta habilitada en tu backend.

Desarrollo usa `src/environments/environment.development.ts` (`http://localhost:8080/api/v1`); producción usa `src/environments/environment.ts` (`/api/v1`). El backend de este proyecto ya permite el origen `http://localhost:4200`; si el origen cambia, configura CORS en el backend por separado. Esta SPA no ejecuta SQL, migraciones ni operaciones en DBeaver.

Ver [la preparación de producción y las evidencias de sesión 13](docs/sesion13-produccion.md).

## Funcionalidades

- Inicio de sesión, validación de campos, retorno seguro a la ruta solicitada y mensajes de error.
- Sesión recuperada desde `sessionStorage`, temporizador de expiración y aviso cinco minutos antes del vencimiento.
- Interceptores JWT para la API y manejo de 401 sin cerrar la sesión ante un 403.
- Guards de autenticación y permisos; navegación y botones según los permisos del usuario.
- Consulta y CRUD de categorías y productos; consulta, filtros, registro y detalle de ventas.
- Página «Mi cuenta» con información de sesión y cambio de contraseña.
- Diseño adaptable a teléfono, tableta y escritorio.

## Verificación

```powershell
npm run build
```

La [matriz de pruebas manuales](docs/pruebas-manuales.md) recoge los 16 casos de la guía. Las pruebas que dependen del backend requieren que este se encuentre disponible y que las cuentas de práctica ya estén configuradas.
