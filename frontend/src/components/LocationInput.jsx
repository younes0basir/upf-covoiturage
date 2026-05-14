import React, { useState, useEffect, useRef } from 'react';
import { locationService } from '../api/locationService';

const LocationInput = ({ label, value, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // Load university locations on mount
    locationService.getUniversity().then(setFeatured);
  }, []);

  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  const handleSearch = async (val) => {
    setQuery(val);
    
    if (val.length === 0) {
      setSuggestions(Array.isArray(featured) ? featured.map(l => ({ ...l, source: 'local' })) : []);
      setShowDropdown(true);
      return;
    }

    // Clear previous timeout for debouncing
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (val.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce search
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        // 1. Search in local database
        const localResults = await locationService.search(val).catch(() => []);
        
        // 2. Search in Mapbox
        const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmFzaXI5NyIsImEiOiJjbXA0amIwZ2MwaG90MnFzOWszeWp2dmMwIn0.7zkjkrNyD2thXDtjhPkqAA';
        const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${MAPBOX_TOKEN}&country=MA&proximity=-5.00,34.03&types=address,poi,neighborhood&language=fr,ar&limit=8`;
        
        const response = await fetch(mapboxUrl).catch(err => {
          console.error('Mapbox Fetch Error:', err);
          return null;
        });

        let mapboxResults = [];
        if (response && response.ok) {
          const data = await response.json();
          mapboxResults = data.features || [];
        } else if (response) {
          const errText = await response.text();
          console.error(`Mapbox API Error (${response.status}):`, errText);
          
          // FALLBACK to Photon if Mapbox token is invalid/expired
          console.log('Falling back to Photon API...');
          const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=8&lat=34.03&lon=-5.00`;
          const photonRes = await fetch(photonUrl).catch(() => null);
          if (photonRes && photonRes.ok) {
            const photonData = await photonRes.json();
            mapboxResults = (photonData.features || []).map(f => ({
                text: f.properties.name,
                place_name: [f.properties.name, f.properties.city, f.properties.country].filter(Boolean).join(', '),
                geometry: f.geometry,
                context: [{ id: 'place', text: f.properties.city }]
            }));
          }
        }
        
        const combined = [
          ...(Array.isArray(localResults) ? localResults : []).map(l => ({ ...l, source: 'local' })),
          ...mapboxResults.map(f => ({
            name: f.text_fr || f.text || (f.place_name ? f.place_name.split(',')[0] : 'Lieu'),
            address: f.place_name,
            city: f.context?.find(c => c.id.startsWith('place'))?.text || 'Maroc',
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
            source: 'maps'
          }))
        ];

        setSuggestions(combined);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search flow failed', err);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelect = async (item) => {
    if (item.source === 'maps') {
      // Create in local DB first
      try {
        const newLoc = await locationService.create({
          name: item.name,
          address: item.address,
          formattedAddress: item.address,
          city: item.city,
          latitude: item.latitude,
          longitude: item.longitude,
          isUniversity: false
        });
        onChange(newLoc.id, newLoc.name);
        setQuery(newLoc.name);
      } catch (err) {
        alert("Erreur lors de l'enregistrement du nouveau lieu");
      }
    } else {
      onChange(item.id, item.name);
      setQuery(item.name);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        required
        className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
        placeholder={placeholder || "Chercher un lieu à Fès..."}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => {
          if (query.length === 0) {
            setSuggestions(featured.map(l => ({ ...l, source: 'local' })));
            setShowDropdown(true);
          } else if (query.length >= 2) {
            setShowDropdown(true);
          }
        }}
      />

      {showDropdown && (searching || suggestions.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-auto">
          {searching && (
            <div className="p-4 text-center text-gray-500 flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium">Recherche...</span>
            </div>
          )}
          
          {!searching && suggestions.length === 0 && query.length >= 2 && (
             <div className="p-4 text-center text-gray-400 text-sm">
                Aucun résultat trouvé pour "{query}"
             </div>
          )}

          {Array.isArray(suggestions) && suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left p-4 hover:bg-blue-50 transition flex items-start space-x-3 border-b border-gray-50 last:border-0"
              onClick={() => handleSelect(item)}
            >
              <div className={`mt-1 ${item.source === 'local' ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.source === 'local' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500 truncate w-64">{item.address}</p>
                {item.source === 'maps' && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-1 inline-block uppercase font-bold tracking-wider">Nouveau lieu</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
