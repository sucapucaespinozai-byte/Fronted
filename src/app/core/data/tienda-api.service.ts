import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagina, ConsultaPagina } from '../models/pagina';
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

  listarProductos(c: ConsultaPagina): Observable<Pagina<Producto>> {
    return this.http.get<Pagina<Producto>>(`${this.baseUrl}/productos`, { params: { ...c } });
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

  listarClientes(c: ConsultaPagina): Observable<Pagina<Cliente>> {
    return this.http.get<Pagina<Cliente>>(`${this.baseUrl}/clientes`, { params: { ...c } });
  }
  crearCliente(c: Omit<Cliente, 'id' | 'creadoPor' | 'modificadoPor'>): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes`, c);
  }
  buscarAuditoria(c: Record<string, string | number>): Observable<Pagina<Auditoria>> {
    return this.http.get<Pagina<Auditoria>>(`${this.baseUrl}/auditoria`, { params: c });
  }
  obtenerVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.baseUrl}/ventas/${id}`);
  }

  buscarVentas(filters: Record<string, string | number>): Observable<Pagina<Venta>> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== '' && v != null) params = params.set(k, v);
    }
    return this.http.get<Pagina<Venta>>(`${this.baseUrl}/ventas/buscar`, { params });
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

export interface Auditoria {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  entidad: string;
  entidadId: number | null;
  detalle: string | null;
  requestId: string | null;
}
