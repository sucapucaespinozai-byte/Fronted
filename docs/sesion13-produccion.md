# Sesión 13 - PharmaSoft

Desarrollo: npm start desde PharmaSoft, http://localhost:4200/login.
Producción: npm run build:stats y docker compose -f deploy/docker-compose.yml up -d;
http://localhost:8081/login, con el backend de farmacia en 8080.
El lanzador C:/PHARMAPROYECT/INICIAR-PRACTICA.cmd inicia Java 21, Nginx y Redis.

## Implementación

- Rutas y layout con loadComponent, sin features estáticas en core.
- Reporte standalone con @defer(on viewport), REPORTES_VER, placeholder, loading,
  error y reintento HTTP. El API también valida el permiso con JWT.
- Desarrollo http://localhost:8080/api/v1; producción /api/v1.
- JWT solo para el origen y prefijo del API; compatible con URL relativa.
- Clientes/productos paginados: se recorren las páginas para los selectores y
  listados existentes. Cada página de productos tiene clave Redis independiente.
- Budgets 370kB/1MB y 4kB/8kB de estilos, hash all, sin precarga global.
- Nginx: Gzip, index no-cache, archivos con hash cacheados un año e immutable,
  chunks ausentes 404, F5 con try_files, proxy /api sin caché de respuestas.

## Mediciones verificadas el 5 de noviembre de 2026

| Indicador | Base reconstruida | Actual |
|---|---:|---:|
| Initial raw | 307,02 kB | 311,29 kB |
| Estimated transfer | 83,99 kB | 86,88 kB |
| Filas lazy | 15 | 18 |
| mas-vendidos | Ausente | 2,50 kB raw / 1,21 kB estimados |

Base reconstruida desde 0a0ac6c con las mismas dependencias instaladas. No es una
captura histórica anterior a las sesiones previas. El inicial aumenta 4,27 kB;
no se presenta como reducción. El reporte permanece diferido y fuera del vendedor.

Chrome en Nginx: visita /productos 349545 bytes; recarga 1743 bytes, con recursos
desde disco. Son bytes CDP medidos, no estimaciones del CLI. Admin: placeholder,
loading y tabla; vendedor: no descarga ni consulta. Sin errores JavaScript.
Se pausó la descarga del chunk real para capturar loading; API y datos reales.

Pruebas y capturas en C:/PHARMAPROYECT/evidencias-s13. Redis, Oracle y Actuator se
verificaron con PharmaBackend, no con el backend de matrículas. Las 30 pruebas
Java pasaron. Los datos temporales automáticos se limpiaron; quedan datos DEMO
claramente identificados para practicar manualmente una venta.

## Recomendaciones

Mantener carga bajo demanda con conexión limitada; medir antes de activar
precarga global. Revisar budgets y browser-stats.json al añadir dependencias.
Mantener TTL e invalidación tras escrituras. Fuera del laboratorio usar TLS,
secretos externos y monitoreo. La muestra con Redis redujo consultas al catálogo,
pero no mejoró la latencia del segundo GET; el filtro JWT aún consulta usuarios.
