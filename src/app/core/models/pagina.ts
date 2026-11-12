// Contrato real del PaginaResponseDTO existente de PharmaBackend.
export interface Pagina<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
export interface ConsultaPagina {
  pagina: number;
  tamanio: number;
  ordenarPor: string;
  direccion: string;
  buscar?: string;
  disponibles?: boolean;
}
