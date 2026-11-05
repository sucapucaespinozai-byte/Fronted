import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, expand, Observable, reduce } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  CategoriaRequest,
  Cliente,
  Producto,
  ProductoRequest,
  Venta,
  VentaRequest,
} from './tienda.model';

interface Pagina<T> {
  content: T[];
  number: number;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class TiendaApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
  }

  obtenerCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/categorias/${id}`);
  }

  crearCategoria(category: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.baseUrl}/categorias`, category);
  }

  actualizarCategoria(id: number, category: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/categorias/${id}`, category);
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categorias/${id}`);
  }

  listarProductos(): Observable<Producto[]> {
    return this.listarPaginas<Producto>('productos');
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/productos/${id}`);
  }

  crearProducto(product: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/productos`, product);
  }

  actualizarProducto(id: number, product: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/productos/${id}`, product);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/productos/${id}`);
  }

  listarClientes(): Observable<Cliente[]> {
    return this.listarPaginas<Cliente>('clientes');
  }

  private listarPaginas<T>(recurso: string): Observable<T[]> {
    const cargarPagina = (pagina: number) => this.http.get<Pagina<T>>(
      `${this.baseUrl}/${recurso}`,
      { params: { pagina, tamanio: 100, ordenarPor: 'id', direccion: 'asc' } },
    );
    // Los selectores y listados existentes consumen el conjunto de páginas como arreglo.
    return cargarPagina(0).pipe(
      expand((pagina) => pagina.last ? EMPTY : cargarPagina(pagina.number + 1)),
      reduce((filas, pagina) => [...filas, ...pagina.content], [] as T[]),
    );
  }

  listarVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.baseUrl}/ventas`);
  }

  obtenerVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.baseUrl}/ventas/${id}`);
  }

  buscarVentas(filters: {
    desde?: string;
    hasta?: string;
    estado?: string;
  }): Observable<Venta[]> {
    let params = new HttpParams()
      .set('ordenarPor', 'fecha')
      .set('direccion', 'desc');
    if (filters.desde) {
      params = params.set('desde', filters.desde);
    }
    if (filters.hasta) {
      params = params.set('hasta', filters.hasta);
    }
    if (filters.estado) {
      params = params.set('estado', filters.estado);
    }
    return this.http.get<Venta[]>(`${this.baseUrl}/ventas/buscar`, { params });
  }

  crearVenta(sale: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(`${this.baseUrl}/ventas`, sale);
  }

  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/auth/password`, {
      passwordActual,
      passwordNueva,
    });
  }
}
