# Sesión 13: frontend PharmaSoft

## Ejecución

Se conserva la carpeta original C:/Users/sucap/Downloads/tienda/PharmaSoft,
Angular 22 y todas las rutas anteriores. Se añade /inicio y un enlace Inicio en
el menú. El acceso inicial y el retorno predeterminado del login siguen siendo
/categorias. También se corrige el retorno a /inicio de usuarios ya autenticados:
esa ruta antes no existía.

En la carpeta del proyecto:

```powershell
npm start
```

Continúa en http://localhost:4200. Desarrollo llama a
http://localhost:8080/api/v1 mediante environment.development.ts. No se cambió
ninguna ruta de los endpoints existentes. Se conserva el login JWT real;
no se crean cuentas ficticias ni se omiten los guards.

## Producción con Nginx y Redis

Con Docker Desktop y el backend de farmacia disponibles en la máquina anfitriona:

```powershell
npm run build:stats
docker compose -f deploy/docker-compose.yml up -d
docker compose -f deploy/docker-compose.yml ps
```

Abrir http://localhost:8081. Producción usa /api/v1; Nginx reenvía a
backend:8080 conservando la ruta completa. El backend sigue en su puerto 8080.
La carpeta de salida es dist/pharmasoft/browser y el analizador recibe
dist/pharmasoft/browser-stats.json. El volumen se monta solo para lectura.

Redis usa 127.0.0.1:6379. Si ya tienes Redis o el Compose del backend usando ese
puerto, utiliza una sola instancia; no levantes dos servicios sobre el mismo
puerto. El frontend nunca se conecta directamente a Redis. Nginx sirve la SPA
y reenvía la API; el backend y Oracle se ejecutan por separado.

## Optimización implementada

- Features y layout mediante loadComponent, con rutas hijas existentes.
  No hay imports estáticos de features en app.ts, layout ni core.
- MasVendidos standalone solo se usa dentro de @defer (on viewport).
  @placeholder de raíz única; @loading (minimum 300ms); @error para chunks.
- REPORTES_VER envuelve el bloque: el vendedor sin ese permiso no descarga
  el reporte ni realiza su consulta. El permiso debe validarse también en el API.
- Los fallos HTTP del reporte se muestran dentro del componente con reintento;
  no se confunden con la ausencia de ventas.
- Interceptor JWT compatible con URL relativa de producción; solo envía tokens
  al origen y prefijo del API. Los 401 de otros recursos no cierran la sesión.
- Producción: hash para todos los bundles; presupuesto inicial 370kB (aviso)
  y 1MB (error), estilos por componente 4kB/8kB.
- Se conserva la ausencia de precarga global para limitar descargas al navegar.
- Nginx: Gzip, index.html no-cache, JS/CSS con hash durante un año e immutable,
  JS/CSS sin hash revalidables, chunks inexistentes con 404, fallback SPA y proxy.
  No almacena en caché las respuestas del API autenticado.

Para comprobar @defer en desarrollo usar `npm run start:practica` (sin HMR).
La evidencia definitiva se toma sobre el build de producción servido por Nginx.

## Mediciones reales del build

| Medición | Antes | Después |
|---|---:|---:|
| Initial total (Raw) | 307,02 kB | 310,97 kB |
| Initial total (Estimated transfer) | 84,00 kB | 86,77 kB |
| Filas Lazy chunk files | 15 | 18 |
| Chunk mas-vendidos | No existía | 2,49 kB / transferencia estimada 1,21 kB |

El inicial aumentó 3,95 kB (aproximadamente 1,29 %). No se presenta como una
reducción. Se incorporaron inicio, infraestructura de @defer y manejo de URL
relativa; el layout pasó a ser diferido. Los builds terminaron sin errores de
budgets. Los tamaños estimados del CLI no sustituyen los bytes HTTP medidos.

Los tres paquetes con más bytes atribuidos en los outputs del build son:
- @angular/core: 181.74 kB sin compresión (suma de contribuciones a los outputs).
- @angular/router: 97.91 kB sin compresión (suma de contribuciones a los outputs).
- @angular/forms: 59.09 kB sin compresión (suma de contribuciones a los outputs).

## Pruebas verificadas

Se usó Chrome headless y Nginx 1.27.5 nativo en Windows, con el mismo bloque
server de despliegue; se sustituyeron solo root, puerto y host del upstream
por valores temporales de prueba. Los datos y tokens de las pruebas son
simulados; no se escribieron en tu frontend ni en Oracle.

1. nginx -t correcto y docker compose config válido.
2. index.html responde Cache-Control: no-cache.
3. Todos los JS/CSS físicos con hash responden con caché anual e immutable.
4. Gzip funciona para JavaScript; un chunk inexistente devuelve 404 sin caché anual.
5. GET directo /productos devuelve la SPA y permite la recarga de rutas.
6. El proxy conserva /api/v1, query string y Authorization y añade no-store.
7. Vendedor sin REPORTES_VER: no descarga el chunk ni consulta el reporte.
8. Admin: el viewport activa el chunk; se observan placeholder, loading y tabla.
9. La consulta del reporte usa /api/v1 relativo y Bearer en producción.
10. Error HTTP visible y botón Reintentar funcional.
11. Fallo de descarga del chunk muestra @error.
12. Vista móvil de 390px sin desbordamiento horizontal del inicio.
13. Sin errores JavaScript en el recorrido de consulta y reintento.
14. Compilaciones production y development correctas.

## Integración pendiente con el backend real

La carpeta del backend de farmacia no se proporcionó. El backend de matrículas
revisado en este chat no implementa los endpoints de PharmaSoft y no sirve
como sustituto. Se conserva el contrato actual del frontend, que requiere:

- POST /api/v1/auth/login (token, tipo, expiraEnSegundos, username,
  nombreCompleto, roles y permisos).
- CRUD /api/v1/categorias y /api/v1/productos.
- GET /api/v1/clientes; ventas y búsqueda bajo /api/v1/ventas.
- PUT /api/v1/auth/password.
- GET /api/v1/reportes/productos-mas-vendidos devuelve un arreglo de
  productoId, productoNombre, categoriaNombre, cantidadVendida y montoTotal.

No se inventaron datos de negocio ni se cambiaron contratos existentes. Si el
backend real entrega productos paginados o nombres de campos diferentes,
hay que contrastar sus DTO antes de ajustar esa integración.

## Evidencias pendientes para completar la entrega académica

La guía pide 14 pruebas integradas y un PDF con capturas, ramas, commits y PR.
Este registro acredita la implementación y las verificaciones del frontend;
no reemplaza esas evidencias ni demuestra resultados de Oracle/Redis reales.

| Evidencia integrada | Estado |
|---|---|
| Capturas del build antes/después | Logs de build conservados; falta captura para el PDF |
| Bytes de primera visita y F5 en /productos | Pendiente con backend real y mismo procedimiento |
| SQL en dos GET /categorias y latencia del segundo | Pendiente con backend de farmacia |
| Redis: TTL, aciertos e invalidación por escrituras/ventas | Pendiente con backend de farmacia |
| Caída de Redis con respuesta desde Oracle y health DOWN | Pendiente con servicios reales |
| X-Request-Id y Actuator health/metrics por rol | Pendiente con backend de farmacia |
| Perfil prod y ausencia de secretos en logs | Pendiente con backend de farmacia |
| PDF Apellido_LP2_S13_Practica.pdf, ramas y solicitudes a develop | Pendiente de evidencias reales e identidad de entrega |

No se crearon commits ni se publicaron cambios en repositorios remotos.
