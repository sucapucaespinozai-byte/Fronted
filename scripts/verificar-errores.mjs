import '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { transform } from 'esbuild';
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('src/app/core/utils/http-error.ts', root), 'utf8');
const compiled = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
await mkdir(new URL('.angular/', root), { recursive: true });
const temp = new URL('.angular/test-http-error.mjs', root);
await writeFile(temp, compiled.code);
try {
  const { mensajeError } = await import(pathToFileURL(fileURLToPath(temp)));
  const id = 'efab1234-1111-4444-8888-abcdef123456';
  for (const status of [400, 401, 403, 404, 409, 500]) {
    const message = mensajeError(new HttpErrorResponse({ status, error: { message: 'Error de prueba', requestId: id } }));
    assert(message.includes(`Código de seguimiento: ${id}`), `Seguimiento para HTTP ${status}`);
  }
  assert(!mensajeError(new HttpErrorResponse({ status: 409, error: { requestId: '<script>' } })).includes('<script>'));
  assert.match(mensajeError(new HttpErrorResponse({ status: 0 })), /conectar/);
  console.log('8 verificaciones correctas de mensajes y requestId.');
} finally { await unlink(temp); }
