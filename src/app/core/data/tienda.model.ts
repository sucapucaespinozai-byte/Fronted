export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: number;
  createdAt: string;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: { id: number; nombre: string };
}

export interface ProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  categoriaId: number;
}

export interface Cliente {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  estado: boolean;
}

export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
}

export interface VentaRequest {
  clienteId: number;
  detalles: DetalleVentaRequest[];
}

export interface DetalleVenta {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  fecha: string;
  clienteId: number;
  clienteNombre: string;
  estado: string;
  total: number;
  detalles: DetalleVenta[];
}
