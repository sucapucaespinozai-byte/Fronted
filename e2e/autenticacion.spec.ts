import { expect } from '@playwright/test';
import { test, iniciarSesion } from './apoyo';
test('ruta protegida conserva returnUrl', async ({ page }) => {
  await page.goto('/ventas');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fventas/);
});
test('credenciales incorrectas muestran el mensaje del backend', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Usuario', { exact: true }).fill('admin');
  await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(/Usuario o contraseña incorrectos/);
});
test('login vuelve a la ruta pedida', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas');
  await expect(page).toHaveURL(/\/ventas$/);
});
