import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places']
});

const TripRouteMap = ({ departure, destination, height = 'h-64' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!departure?.latitude || !destination?.latitude || !mapRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const depLat = Number(departure.latitude);
    const depLng = Number(departure.longitude);
    const destLat = Number(destination.latitude);
    const destLng = Number(destination.longitude);

    const initMap = async () => {
      try {
        // Modern pattern: explicitly import the 'maps' library
        const { Map, Polyline, LatLngBounds } = await loader.importLibrary('maps');
        const { Marker } = await loader.importLibrary('marker');
        const { DirectionsService, TravelMode } = await loader.importLibrary('routes');

        if (!mapRef.current) return;

        const map = new Map(mapRef.current, {
          center: { lat: (depLat + destLat) / 2, lng: (depLng + destLng) / 2 },
          zoom: 12,
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        });
        mapInstanceRef.current = map;

        // Departure marker (green)
        new Marker({
          position: { lat: depLat, lng: depLng },
          map,
          title: departure.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });

        // Destination marker (red)
        new Marker({
          position: { lat: destLat, lng: destLng },
          map,
          title: destination.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });

        // Fit bounds
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: depLat, lng: depLng });
        bounds.extend({ lat: destLat, lng: destLng });
        map.fitBounds(bounds, 40);

        // Draw driving route
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: { lat: depLat, lng: depLng },
            destination: { lat: destLat, lng: destLng },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK' && result.routes[0]) {
              new Polyline({
                path: result.routes[0].overview_path,
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.85,
                strokeWeight: 4,
                map,
              });
              map.fitBounds(result.routes[0].bounds, 40);
            }
          }
        );
      } catch (err) {
        console.error('TripRouteMap error:', err);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      mapInstanceRef.current = null;
    };
  }, [departure, destination]);

  if (!departure?.latitude || !destination?.latitude) return null;

  if (mapError) {
    return (
      <div className={`w-full ${height} rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center`}>
        <p className="text-sm text-slate-400 font-medium">Map unavailable</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`w-full ${height} rounded-xl overflow-hidden`}
    />
  );
};

export default TripRouteMap;
