import { expect } from '@playwright/test';
import { test, iniciarSesion } from './apoyo';
test('venta desde SPA descuenta stock sin F5', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await page.getByTestId('buscar-cliente').fill('S14 Demo');
  const cliente = page.getByTestId('opcion-cliente').filter({ hasText: 'S14 Demo' }).first();
  await expect(cliente).toBeVisible();
  await cliente.click();
  await page.getByTestId('buscar-producto').fill('00 S14 Producto');
  const opcion = page.getByTestId('opcion-producto').filter({ hasText: '00 S14 Producto' }).first();
  await expect(opcion).toBeVisible();
  const stock = Number(await opcion.getAttribute('data-stock'));
  await opcion.click();
  await page.getByTestId('cantidad').last().fill('2');
  await expect(page.getByTestId('total-venta')).not.toHaveText(/S\/\s*0[.,]00/);
  const response = page.waitForResponse(
    (r) => r.url().endsWith('/api/v1/ventas') && r.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Registrar venta', exact: true }).click();
  expect((await response).status()).toBe(201);
  await expect(page.getByRole('status')).toContainText(/Venta #\d+ registrada/);
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar producto', exact: true }).fill('00 S14 Producto');
  const fila = page
    .getByTestId('tabla-productos')
    .locator('tbody tr')
    .filter({ hasText: '00 S14 Producto' })
    .first();
  await expect(fila.getByTestId('stock')).toHaveText(`${stock - 2} un.`);
});
