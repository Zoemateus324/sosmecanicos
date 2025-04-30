'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useMap } from 'react-leaflet';
import type { Map } from 'leaflet';

interface Mechanic {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  position: [number, number];
  distance: number;
}

interface VehicleMapProps {
  isDialogOpen: boolean;
  userPosition: [number, number] | null;
  mechanics: Mechanic[];
}

const MapUpdater: React.FC<{
  userPosition: [number, number] | null;
  mechanics: Mechanic[];
}> = ({ userPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (userPosition) {
      map.setView(userPosition, 13);
    } else {
      map.setView([-23.5505, -46.6333], 13);
    }
  }, [userPosition, map]);

  return null;
};

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

const VehicleMap: React.FC<VehicleMapProps> = ({ isDialogOpen, userPosition, mechanics }) => {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
    import('leaflet/dist/leaflet.css');
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current && containerRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (typeof window === 'undefined') {
    return null;
  }

  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const center = userPosition || defaultCenter;

  return (
    <div ref={containerRef}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%' }}
        id="leaflet-map"
        whenReady={(map: any) => {
          console.log('Map is ready:', map);
          mapRef.current = map;
        }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater userPosition={userPosition} mechanics={mechanics} />
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

export default VehicleMap;