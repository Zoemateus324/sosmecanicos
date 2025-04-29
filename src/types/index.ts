export interface Mechanic {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export type LatLngTuple = [number, number];
