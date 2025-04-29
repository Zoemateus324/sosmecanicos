"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LatLngTuple } from "leaflet";

interface Mechanic {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  distance: number;
}

interface VehicleMapProps {
  userPosition: [number, number] | null;
  mechanics: Mechanic[];
  isDialogOpen: boolean;
}

const VehicleMap: React.FC<VehicleMapProps> = ({
  userPosition,
  mechanics,
  isDialogOpen,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure the component only renders on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default position if userPosition is null (São Paulo, Brazil)
  const defaultPosition: [number, number] = [-23.5505, -46.6333];
  const center = userPosition || defaultPosition;

  // Fix for Leaflet marker icons
  if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    });
  }

  // Render nothing on the server or until the component is mounted
  if (!isMounted) {
    return null;
  }

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
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userPosition && (
          <Marker position={userPosition}>
            <Popup>Você está aqui</Popup>
          </Marker>
        )}
        {mechanics.map((mechanic) => (
          <Marker
            key={mechanic.id}
            position={[mechanic.latitude, mechanic.longitude]}
          >
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