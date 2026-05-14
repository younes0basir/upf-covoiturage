import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { locationService } from '../api/locationService';

const GoogleMapsLocationInput = ({ label, value, onChange, placeholder, hideMap = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const dropdownRef = useRef(null);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    locationService.getUniversity().then(setFeatured);
  }, []);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      if (inputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'MA' },
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            handlePlaceSelect(place);
          }
        });

        autocompleteRef.current = autocomplete;
      }
    } else {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
        version: 'weekly',
        libraries: ['places']
      });

      loader.load().then(() => {
        if (inputRef.current && window.google) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'MA' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              handlePlaceSelect(place);
            }
          });

          autocompleteRef.current = autocomplete;
        }
      });
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlaceSelect = async (place) => {
    const locationData = {
      name: place.name || place.formatted_address,
      address: place.formatted_address,
      formattedAddress: place.formatted_address,
      city: extractCity(place),
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      isUniversity: false
    };

    setSelectedLocation(locationData);
    setQuery(place.formatted_address);
    setShowDropdown(false);
    setShowMap(true);

    // Create in local DB
    try {
      const newLoc = await locationService.create(locationData);
      onChange(newLoc.id, newLoc.name, locationData);
    } catch (err) {
      console.error('Error saving location:', err);
      onChange(null, locationData.name, locationData);
    }

    // Update map
    if (!hideMap && mapRef.current && window.google) {
      if (!map) {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: locationData.latitude, lng: locationData.longitude },
          zoom: 15,
          mapTypeId: 'roadmap'
        });
        setMap(newMap);

        const newMarker = new window.google.maps.Marker({
          position: { lat: locationData.latitude, lng: locationData.longitude },
          map: newMap,
          title: locationData.name
        });
        setMarker(newMarker);
      } else {
        map.setCenter({ lat: locationData.latitude, lng: locationData.longitude });
        marker.setPosition({ lat: locationData.latitude, lng: locationData.longitude });
      }
    }
  };

  const extractCity = (place) => {
    for (const component of place.address_components || []) {
      if (component.types.includes('locality')) {
        return component.long_name;
      }
    }
    return 'Maroc';
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length === 0) {
      setSuggestions(featured.map(l => ({ ...l, source: 'local' })));
      setShowDropdown(true);
      setShowMap(false);
      return;
    }

    if (val.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Search local database
    locationService.search(val).then(localResults => {
      const combined = [
        ...(Array.isArray(localResults) ? localResults : []).map(l => ({ ...l, source: 'local' }))
      ];
      setSuggestions(combined);
      setShowDropdown(true);
    }).catch(() => {
      setSuggestions([]);
      setShowDropdown(true);
    });
  };

  const handleLocalSelect = (item) => {
    const locationData = {
      name: item.name,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude
    };
    onChange(item.id, item.name, locationData);
    setQuery(item.name);
    setShowDropdown(false);
    
    if (item.latitude && item.longitude) {
      setSelectedLocation(locationData);
      setShowMap(true);

      if (!hideMap && mapRef.current && window.google) {
        if (!map) {
          const newMap = new window.google.maps.Map(mapRef.current, {
            center: { lat: item.latitude, lng: item.longitude },
            zoom: 15,
            mapTypeId: 'roadmap'
          });
          setMap(newMap);

          const newMarker = new window.google.maps.Marker({
            position: { lat: item.latitude, lng: item.longitude },
            map: newMap,
            title: item.name
          });
          setMarker(newMarker);
        } else {
          map.setCenter({ lat: item.latitude, lng: item.longitude });
          marker.setPosition({ lat: item.latitude, lng: item.longitude });
        }
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          required
          className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
          placeholder={placeholder || "Chercher un lieu..."}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length === 0) {
              setSuggestions(featured.map(l => ({ ...l, source: 'local' })));
              setShowDropdown(true);
            } else if (query.length >= 2) {
              setShowDropdown(true);
            }
          }}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-auto">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left p-4 hover:bg-blue-50 transition flex items-start space-x-3 border-b border-gray-50 last:border-0"
              onClick={() => handleLocalSelect(item)}
            >
              <div className="mt-1 text-blue-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500 truncate w-64">{item.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showMap && !hideMap && (
        <div className="absolute z-40 w-full mt-2 left-0">
          <div 
            ref={mapRef} 
            className="w-full h-64 rounded-2xl shadow-2xl border-2 border-blue-200"
          />
          {selectedLocation && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm rounded-b-2xl border-t border-blue-100">
              <p className="text-sm font-bold text-gray-900">{selectedLocation.name}</p>
              <p className="text-xs text-gray-600">{selectedLocation.address}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMapsLocationInput;
