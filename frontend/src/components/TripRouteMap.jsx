import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const TripRouteMap = ({ departure, destination, height = 'h-40' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!departure || !destination || !mapRef.current) return;

    const depLat = departure.latitude;
    const depLng = departure.longitude;
    const destLat = destination.latitude;
    const destLng = destination.longitude;

    if (!depLat || !depLng || !destLat || !destLng) return;

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: (depLat + destLat) / 2, lng: (depLng + destLng) / 2 },
        zoom: 12,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: 'none'
      });
      mapInstanceRef.current = map;

      // Green departure marker
      new window.google.maps.Marker({
        position: { lat: depLat, lng: depLng },
        map,
        title: departure.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });

      // Red destination marker
      new window.google.maps.Marker({
        position: { lat: destLat, lng: destLng },
        map,
        title: destination.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });

      // Draw route
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route({
        origin: { lat: depLat, lng: depLng },
        destination: { lat: destLat, lng: destLng },
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && result.routes[0]) {
          new window.google.maps.Polyline({
            path: result.routes[0].overview_path,
            geodesic: true,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 4
          }).setMap(map);
        }
      });

      // Fit bounds
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: depLat, lng: depLng });
      bounds.extend({ lat: destLat, lng: destLng });
      map.fitBounds(bounds, 30);
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
        version: 'weekly',
        libraries: ['places']
      });
      loader.load().then(initMap).catch(err => console.error('Map load error:', err));
    }

    return () => {
      mapInstanceRef.current = null;
    };
  }, [departure, destination]);

  if (!departure?.latitude || !destination?.latitude) return null;

  return (
    <div
      ref={mapRef}
      className={`w-full ${height} rounded-xl overflow-hidden`}
    />
  );
};

export default TripRouteMap;
