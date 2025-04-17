import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Corrige o ícone padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function VehicleMap({ isDialogOpen, userPosition, mechanics = [] }) {
  if (isDialogOpen) {
    return (
      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        Mapa desativado enquanto o dialog ou menu está aberto
      </div>
    );
  }

  const defaultPosition = [-23.5505, -46.6333]; 
  const center = userPosition || defaultPosition;

  return (
    <div className="h-96 relative">
      <style jsx>{`
        .leaflet-container {
          z-index: 1 !important;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userPosition && (
          <Marker position={userPosition}>
            <Popup>Sua Localização</Popup>
          </Marker>
        )}
        {mechanics.map((mechanic, index) => (
          <Marker key={index} position={[mechanic.latitude, mechanic.longitude]}>
            <Popup>
              {mechanic.name} <br /> {mechanic.distance.toFixed(2)} km de distância
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}