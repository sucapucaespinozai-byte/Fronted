export interface LoginPayload { username: string; password: string }
export interface SessionUser { token: string; tipo: string; expiraEnSegundos: number; nombreCompleto: string; roles: string[]; permisos: string[] }
export interface UserInfo { id: number; username: string; nombreCompleto: string; activo: boolean; roles: string[]; permisos: string[] }
export interface ApiError { status?: number; mensaje?: string; campos?: Record<string, string> }
export interface Servicio { id: number; codigo: string; nombre: string; descripcion?: string; precio: number; duracionMinutos: number; activo: boolean }
export interface ServicioPayload { codigo: string; nombre: string; descripcion: string; precio: number; duracionMinutos: number }
export interface Cliente { id: number; nombres: string; apellidos: string; documento: string; telefono?: string; correo?: string }
export interface Vehiculo { id: number; placa: string; marca: string; modelo: string; anio: number; kilometrajeActual?: number; clienteId: number; clienteNombre: string }
export interface VehiculoPayload { placa: string; marca: string; modelo: string; anio: number; clienteId: number }
export interface DetalleOrden { id?: number; servicioId: number; codigoServicio: string; servicio: string; cantidad: number; precioUnitario: number; subtotal: number }
export interface Orden { id: number; codigo: string; vehiculoId: number; placa: string; kilometraje: number; fechaCreacion: string; estado: string; total: number; motivoAnulacion?: string; detalles: DetalleOrden[] }
export interface OrdenPayload { vehiculoId: number; kilometraje: number; detalles: Array<{ servicioId: number; cantidad: number }> }
export interface IngresoServicio { codigoServicio: string; servicio: string; cantidadTotal: number; importeTotal: number }
