
export interface Mechanic {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
}

export interface AuthUser {
  id: string;
  latitude?: number;
  longitude?: number;
}