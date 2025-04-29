import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Mechanic {
  id: string;
  nome: string;
  position: LatLngTuple;
  distance: number;
}

interface VehicleMapProps {
  isDialogOpen: boolean;
  userPosition: LatLngTuple | null;
  mechanics: Mechanic[];
}

export default function VehicleMap({ isDialogOpen, userPosition, mechanics }: VehicleMapProps) {
  const defaultCenter: LatLngTuple = [-23.55052, -46.633308]; // São Paulo coordinates as fallback
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-96 w-full">
      <MapContainer
        center={userPosition || defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userPosition && (
          <Marker position={userPosition}>
            <Popup>Você está aqui</Popup>
          </Marker>
        )}
        {mechanics.map((mechanic) => (
          <Marker key={mechanic.id} position={mechanic.position}>
            <Popup>
              {mechanic.nome} - {mechanic.distance.toFixed(2)} km de distância
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}