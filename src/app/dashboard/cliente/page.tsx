// components/VehicleMap.tsx
'use client';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Mechanic, LatLngTuple } from "@/types";
import type { LatLngExpression } from "leaflet";

interface VehicleMapProps {
  userPosition: LatLngTuple | null;
  mechanics: Mechanic[];
  isDialogOpen: boolean;
}

const VehicleMap: React.FC<VehicleMapProps> = ({ userPosition, mechanics, isDialogOpen }) => {
  // Default position if userPosition is null
  const defaultPosition: LatLngTuple = [-23.5505, -46.6333]; // São Paulo, Brazil as fallback
  const center: LatLngExpression = userPosition || defaultPosition;

  // Fix for Leaflet marker icons
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  });

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userPosition && (
          <Marker position={userPosition as LatLngExpression}>
            <Popup>Você está aqui</Popup>
          </Marker>
        )}
        {mechanics.map((mechanic) => (
          <Marker key={mechanic.id} position={[mechanic.latitude, mechanic.longitude]}>
            <Popup>
              {mechanic.nome} <br />
              Distância: {mechanic.distance.toFixed(2)} km
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;