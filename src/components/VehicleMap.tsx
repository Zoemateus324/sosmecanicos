'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useMap } from 'react-leaflet';
import type { Map } from 'leaflet';
import { Loader } from "@googlemaps/js-api-loader";

interface Mechanic {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  position: [number, number];
  distance: number;
}

interface Location {
  lat: number;
  lng: number;
}

interface VehicleMapProps {
  isDialogOpen: boolean;
  userPosition: [number, number] | null;
  mechanics: Mechanic[];
  center: Location;
  markers: Array<{
    position: Location;
    title: string;
  }>;
  onMarkerClick?: (marker: { position: Location; title: string }) => void;
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

const VehicleMap: React.FC<VehicleMapProps> = ({ isDialogOpen, userPosition, mechanics, center, markers, onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
      });

      try {
        await loader.load();
        if (mapRef.current && !mapInstanceRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center,
            zoom: 13,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          mapInstanceRef.current = map;
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current,
        title: markerData.title,
      });

      if (onMarkerClick) {
        marker.addListener("click", () => onMarkerClick(markerData));
      }

      markersRef.current.push(marker);
    });

    // Cleanup function
    return () => {
      const currentMarkers = markersRef.current;
      currentMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [markers, onMarkerClick]);

  if (typeof window === 'undefined') {
    return null;
  }

  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const center = userPosition || defaultCenter;

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-lg shadow-md"
    />
  );
};

export default VehicleMap;