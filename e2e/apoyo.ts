import { expect, Page, test as base } from '@playwright/test';
export const USUARIOS = {
  admin: {
    usuario: process.env['E2E_ADMIN'] || 'admin',
    clave: process.env['E2E_ADMIN_PASSWORD'] || 'Admin2026*',
  },
  vendedor: {
    usuario: process.env['E2E_VENDEDOR'] || 'vendedor',
    clave: process.env['E2E_VENDEDOR_PASSWORD'] || 'Vendedor2026*',
  },
  almacen: {
    usuario: process.env['E2E_ALMACEN'] || 'almacen',
    clave: process.env['E2E_ALMACEN_PASSWORD'] || 'Almacen2026*',
  },
};
export const test = base.extend<{ vigilarErrores: void }>({
  vigilarErrores: [
    async ({ page }, use) => {
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));
      page.on('response', (r) => {
        if (r.status() >= 500) errores.push(`HTTP ${r.status()} ${r.url()}`);
      });
      await use();
      expect(errores, 'Sin errores JavaScript ni respuestas 500').toEqual([]);
    },
    { auto: true },
  ],
});
export async function iniciarSesion(page: Page, quien: keyof typeof USUARIOS, ruta = '/inicio') {
  await page.goto(ruta);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Usuario', { exact: true }).fill(USUARIOS[quien].usuario);
  await page.getByLabel('Contraseña', { exact: true }).fill(USUARIOS[quien].clave);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toBeVisible();
}
