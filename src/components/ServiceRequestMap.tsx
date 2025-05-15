import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Location {
  lat: number;
  lng: number;
}

interface ServiceRequestMapProps {
  center: Location;
  markers: Array<{
    position: Location;
    title: string;
  }>;
  onMarkerClick?: (marker: { position: Location; title: string }) => void;
}

export default function ServiceRequestMap({
  center,
  markers,
  onMarkerClick,
}: ServiceRequestMapProps) {
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
  }, [markers, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-lg shadow-md"
    />
  );
} 