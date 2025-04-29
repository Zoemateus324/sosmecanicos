"use client";

import { memo, useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngTuple } from "leaflet";
import { Mechanic } from "@/types";

interface VehicleMapProps {
  userPosition: LatLngTuple | null;
  mechanics: Mechanic[];
  isDialogOpen: boolean;
}

const VehicleMap: React.FC<VehicleMapProps> = ({
  userPosition,
  mechanics,
  isDialogOpen,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure the component only renders on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cleanup the map instance on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fix for Leaflet marker icons
  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
      });
    }
  }, []);

  // Default position if userPosition is null (São Paulo, Brazil)
  const defaultPosition: LatLngTuple = [-23.5505, -46.6333];
  const center: LatLngTuple = userPosition || defaultPosition;

  // Render nothing on the server or until the component is mounted
  if (!isMounted) {
    return null;
  }

  return (
    <div ref={containerRef} className="h-96 w-full">
      <MapContainer
  center={[51.505, -0.09]}
  zoom={13}
  style={{ height: '100%', width: '100%' }}
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
          <Marker key={mechanic.id} position={mechanic.position}>
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

// Memoize the component to prevent unnecessary re-renders
export default memo(VehicleMap, (prevProps, nextProps) => {
  return (
    prevProps.userPosition === nextProps.userPosition &&
    prevProps.mechanics === nextProps.mechanics
  );
});