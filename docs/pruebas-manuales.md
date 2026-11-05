# Pruebas manuales de seguridad — Sesión 11

Ejecuta estas comprobaciones con el backend habitual en `http://localhost:8080` y PharmaSoft en `http://localhost:4200`. Usa las cuentas de práctica que ya existan en el backend; la SPA no crea ni modifica usuarios ni datos de la base de datos.

| N.° | Acción | Resultado esperado |
|---:|---|---|
| 1 | Sin sesión, abrir `http://localhost:4200/ventas`. | Se muestra el login y la URL incluye el retorno a `/ventas`. |
| 2 | Enviar el login vacío. | Se marcan los dos campos obligatorios y no se envían solicitudes. |
| 3 | Intentar iniciar sesión con contraseña incorrecta. | El formulario muestra un mensaje genérico de credenciales incorrectas; no abandona el login. |
| 4 | Iniciar sesión con una cuenta deshabilitada, si está configurada. | Se muestra el mismo mensaje genérico de credenciales incorrectas. |
| 5 | Iniciar sesión como vendedor y abrir la ruta de retorno. | Se abre la página solicitada y el encabezado identifica al usuario y la expiración de sesión. |
| 6 | Revisar en la pestaña Red el GET de productos y la solicitud de login. | El GET de productos incluye `Authorization: Bearer …`; la solicitud de login no incluye el token. |
| 7 | Revisar el almacenamiento de sesión de la pestaña. | Existe `pharmasoft.sesion` con token, vencimiento, usuario, roles y permisos. |
| 8 | Recargar la página de productos. | La sesión y la ruta permanecen activas. |
| 9 | Ver productos con un perfil de solo lectura. | No se muestran las acciones para crear, editar o dar de baja. |
| 10 | Abrir directamente `/productos/nuevo` con un perfil sin permiso de escritura. | Se muestra «403 — Acceso denegado». |
| 11 | Abrir `/login` después de iniciar sesión. | Se redirige a `/inicio`. |
| 12 | Cerrar sesión y consultar el almacenamiento de sesión. | Se vuelve al login y la clave `pharmasoft.sesion` desaparece. |
| 13 | Abrir `/ventas` con un perfil de almacén sin permiso de lectura de ventas. | La opción Ventas no aparece en el menú y la ruta directa muestra acceso denegado. |
| 14 | Iniciar sesión con un perfil supervisor que combina vendedor y almacenero. | Ve ventas y las acciones de edición del catálogo. |
| 15 | Cambiar manualmente un carácter del token en el almacenamiento y realizar una petición protegida. | El backend responde 401; la SPA cierra la sesión y vuelve al login con aviso de expiración. |
| 16 | En un entorno de prueba, ajustar temporalmente el vencimiento del token del backend a un minuto, iniciar sesión y esperar. | La SPA avisa antes del vencimiento; al expirar, vuelve al login con aviso y conserva la ruta de retorno. Restaura después el valor habitual del backend. |

**Precaución para la prueba 16:** no cambies la configuración del backend mientras esté en curso un proceso que dependa de ella. Esta prueba es opcional y no requiere modificar la base de datos.

Guarda una captura de cada comprobación para el PDF de entrega. Los resultados y las capturas dependen de las cuentas, los datos y el backend de tu entorno.
