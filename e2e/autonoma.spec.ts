import { expect, Page } from '@playwright/test';
import { test, iniciarSesion } from './apoyo';

async function prepararVenta(page: Page) {
  await page.getByTestId('buscar-cliente').fill('S14 Demo');
  await page.getByTestId('opcion-cliente').filter({ hasText: 'S14 Demo' }).first().click();
  await page.getByTestId('buscar-producto').fill('00 S14 Producto');
  const opcion = page.getByTestId('opcion-producto').filter({ hasText: '00 S14 Producto' }).first();
  const stock = Number(await opcion.getAttribute('data-stock'));
  await opcion.click();
  return stock;
}
async function registrar(page: Page) {
  const respuesta = page.waitForResponse(r => r.url().endsWith('/api/v1/ventas') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Registrar venta', exact: true }).click();
  const r = await respuesta;
  expect(r.status()).toBe(201);
  await expect(page.getByRole('status')).toContainText(/Venta #\d+ registrada/);
  return { venta: await r.json(), requestId: r.headers()['x-request-id'] };
}

test('E2E-08 stock cambiado antes de enviar devuelve 409 sin registrar venta', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  const stock = await prepararVenta(page);
  const token = await page.evaluate(() => JSON.parse(sessionStorage.getItem('pharmasoft.sesion')!).token);
  const api = new URL('/api/v1', page.url()).href.replace(':4200', ':8080');
  const headers = { Authorization: `Bearer ${token}` };
  const antes = await (await page.request.get(api + '/ventas', { headers })).json();
  // Simula una solicitud preparada con stock obsoleto. La respuesta viene del backend real.
  await page.route('**/api/v1/ventas', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    const data = route.request().postDataJSON();
    data.detalles[0].cantidad = stock + 1;
    await route.continue({ postData: JSON.stringify(data) });
  });
  const respuesta = page.waitForResponse(r => r.url().endsWith('/api/v1/ventas') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Registrar venta', exact: true }).click();
  expect((await respuesta).status()).toBe(409);
  await expect(page.getByRole('alert')).toContainText(/Stock insuficiente/);
  const despues = await (await page.request.get(api + '/ventas', { headers })).json();
  expect(despues.totalElements).toBe(antes.totalElements);
});

test('E2E-09 no permite registrar una venta sin productos', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await page.getByTestId('buscar-cliente').fill('S14 Demo');
  await page.getByTestId('opcion-cliente').filter({ hasText: 'S14 Demo' }).first().click();
  await expect(page.getByRole('button', { name: 'Registrar venta', exact: true })).toBeDisabled();
});

test('E2E-10 cliente nuevo disponible para venta inmediata', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/clientes');
  const id = String(Date.now()).slice(-8);
  await page.getByLabel('Nombres', { exact: true }).fill('Autonoma');
  await page.getByLabel('Apellidos', { exact: true }).fill('Prueba ' + id);
  await page.getByLabel('DNI', { exact: true }).fill(id);
  await page.getByLabel('Email', { exact: true }).fill('autonoma.' + id + '@example.invalid');
  await page.getByRole('button', { name: 'Registrar cliente', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('registrado');
  await page.getByRole('link', { name: 'Ventas', exact: true }).click();
  await page.getByRole('link', { name: /Nueva venta/ }).click();
  await page.getByTestId('buscar-cliente').fill(id);
  await page.getByTestId('opcion-cliente').filter({ hasText: id }).click();
  await page.getByTestId('buscar-producto').fill('00 S14 Producto');
  await page.getByTestId('opcion-producto').filter({ hasText: '00 S14 Producto' }).first().click();
  const { venta } = await registrar(page);
  expect(venta.clienteNombre).toContain(id);
});

test('E2E-11 cambiar fecha desde pagina 3 vuelve a pagina 1', async ({ page }) => {
  await iniciarSesion(page, 'admin', '/ventas?pagina=2&tamanio=20');
  await expect(page.getByTestId('pagina-actual')).toContainText('Página 3');
  await page.getByLabel('Desde', { exact: true }).fill('2026-11-01');
  await page.getByLabel('Desde', { exact: true }).press('Tab');
  await expect(page).toHaveURL(/pagina=0/);
  await expect(page.getByTestId('pagina-actual')).toContainText('Página 1');
});

test('E2E-12 admin encuentra su venta y requestId en auditoria con filtros en URL', async ({ page }) => {
  await iniciarSesion(page, 'admin', '/ventas/nueva');
  await prepararVenta(page);
  const { venta, requestId } = await registrar(page);
  await page.getByRole('link', { name: 'Auditoría', exact: true }).click();
  await page.getByLabel('Usuario', { exact: true }).fill('admin');
  await page.getByLabel('Acción', { exact: true }).selectOption('VENTA_REGISTRADA');
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click();
  await expect(page).toHaveURL(/accion=VENTA_REGISTRADA/);
  const fila = page.getByTestId('tabla-auditoria').locator('tbody tr').filter({ hasText: requestId });
  await expect(fila).toContainText('Venta #' + venta.id);
  await page.reload();
  await expect(page.getByLabel('Acción', { exact: true })).toHaveValue('VENTA_REGISTRADA');
  await expect(page.getByTestId('tabla-auditoria')).toContainText(requestId);
});

test('E2E-13 vendedor no ve auditoria ni accede por URL', async ({ page }) => {
  await iniciarSesion(page, 'vendedor');
  await expect(page.getByRole('link', { name: 'Auditoría', exact: true })).toHaveCount(0);
  await page.goto('/auditoria');
  await expect(page.getByRole('heading', { name: /Acceso denegado/ })).toBeVisible();
});

test('E2E-14 token alterado vuelve al login con aviso de sesion expirada', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/productos');
  await page.evaluate(() => {
    const sesion = JSON.parse(sessionStorage.getItem('pharmasoft.sesion')!);
    sesion.token = 'token.alterado.invalido';
    sessionStorage.setItem('pharmasoft.sesion', JSON.stringify(sesion));
  });
  await page.reload();
  await expect(page).toHaveURL(/\/login.*expirada=1/);
  await expect(page.getByRole('status')).toContainText(/sesión.*expir|sesión.*venc/i);
});
