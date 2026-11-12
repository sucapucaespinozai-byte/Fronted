import { expect } from '@playwright/test';
import { test, iniciarSesion } from './apoyo';
test('pagina del servidor y URL se conservan con F5', async ({ page }) => {
  await iniciarSesion(page, 'admin', '/productos');
  await expect(page.getByLabel('Filas por página')).toHaveValue('20');
  await expect(page.getByTestId('tabla-productos').locator('tbody tr')).toHaveCount(20);
  const respuesta = page.waitForResponse(
    (r) => r.url().includes('/api/v1/productos') && r.url().includes('pagina=1'),
  );
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  expect((await respuesta).status()).toBe(200);
  await expect(page).toHaveURL(/pagina=1/);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await page.reload();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await page.getByLabel('Filas por página').selectOption('10');
  await expect(page).toHaveURL(/pagina=0/);
  await expect(page.getByTestId('tabla-productos').locator('tbody tr')).toHaveCount(10);
});
