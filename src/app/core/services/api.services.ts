import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, IngresoServicio, Orden, OrdenPayload, Servicio, ServicioPayload, Vehiculo, VehiculoPayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ServicioApi {
  private http = inject(HttpClient); private url = `${environment.apiUrl}/servicios`;
  list(): Observable<Servicio[]> { return this.http.get<Servicio[]>(this.url); }
  get(id: number): Observable<Servicio> { return this.http.get<Servicio>(`${this.url}/${id}`); }
  create(data: ServicioPayload): Observable<Servicio> { return this.http.post<Servicio>(this.url, data); }
  update(id: number, data: ServicioPayload): Observable<Servicio> { return this.http.put<Servicio>(`${this.url}/${id}`, data); }
  deactivate(id: number): Observable<Servicio> { return this.http.patch<Servicio>(`${this.url}/${id}/estado`, { activo: false }); }
}
@Injectable({ providedIn: 'root' })
export class VehiculoApi {
  private http = inject(HttpClient); private url = `${environment.apiUrl}/vehiculos`;
  list(clienteId?: number): Observable<Vehiculo[]> { const params = clienteId ? new HttpParams().set('clienteId', clienteId) : undefined; return this.http.get<Vehiculo[]>(this.url, { params }); }
  get(id: number): Observable<Vehiculo> { return this.http.get<Vehiculo>(`${this.url}/${id}`); }
  create(data: VehiculoPayload): Observable<Vehiculo> { return this.http.post<Vehiculo>(this.url, data); }
  update(id: number, data: VehiculoPayload): Observable<Vehiculo> { return this.http.put<Vehiculo>(`${this.url}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
@Injectable({ providedIn: 'root' })
export class ClienteApi { private http = inject(HttpClient); list(): Observable<Cliente[]> { return this.http.get<Cliente[]>(`${environment.apiUrl}/clientes`); } }
@Injectable({ providedIn: 'root' })
export class OrdenApi {
  private http = inject(HttpClient); private url = `${environment.apiUrl}/ordenes`;
  list(filters: Record<string, string>): Observable<Orden[]> { let params = new HttpParams(); Object.entries(filters).forEach(([k,v]) => { if (v) params = params.set(k,v); }); return this.http.get<Orden[]>(this.url, { params }); }
  create(data: OrdenPayload): Observable<Orden> { return this.http.post<Orden>(this.url, data); }
  cancel(id: number, motivo: string): Observable<Orden> { return this.http.patch<Orden>(`${this.url}/${id}/anular`, { motivo }); }
}
@Injectable({ providedIn: 'root' })
export class ReporteApi {
  private http = inject(HttpClient);
  ingresos(desde: string, hasta: string): Observable<IngresoServicio[]> { let params = new HttpParams(); if (desde) params = params.set('desde',desde); if (hasta) params = params.set('hasta',hasta); return this.http.get<IngresoServicio[]>(`${environment.apiUrl}/reportes/ingresos-por-servicio`, { params }); }
}
