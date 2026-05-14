import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tripService } from '../api/tripService';
import { locationService } from '../api/locationService';
import { driverService } from '../api/driverService';
import SidebarLayout from '../components/SidebarLayout';
import GoogleMapsLocationInput from '../components/GoogleMapsLocationInput';
import { Loader } from '@googlemaps/js-api-loader';

const Icons = {
  Passenger: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Car: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
};

const CreateTrip = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    departureLocationId: '',
    destinationLocationId: '',
    departureTime: '',
    availableSeats: 1,
    driverPrice: '',
    passengerGenderPreference: 'ANY',
    notes: ''
  });

  const [departureLocation, setDepartureLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const routeMapRef = useRef(null);
  const [routeMap, setRouteMap] = useState(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  const menuItems = [
    { id: 'passenger', label: 'Mes Réservations', icon: <Icons.Passenger />, path: '/dashboard' },
    { id: 'driver', label: 'Mes Trajets', icon: <Icons.Car />, path: '/dashboard' },
    { id: 'search', label: 'Chercher un trajet', icon: <Icons.Search />, path: '/trips' },
    { id: 'create', label: 'Publier un trajet', icon: <Icons.Plus />, path: '/trips/create' },
  ];

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const profile = await driverService.getProfile();
        setHasProfile(true);
        const userVehicles = await driverService.getVehicles();
        setVehicles(userVehicles);
        if (userVehicles.length > 0) {
            setFormData(prev => ({...prev, vehicleId: userVehicles[0].id}));
        }
      } catch (err) {
        console.error("Driver check failed", err);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  // Initialize map immediately on mount
  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      console.log('Google Maps loaded');
      setTimeout(() => {
        if (routeMapRef.current && window.google) {
          const container = routeMapRef.current;
          console.log('Creating map in container', container.offsetWidth, container.offsetHeight);
          
          const map = new window.google.maps.Map(container, {
            center: { lat: 34.0181, lng: -5.0078 }, // Fès center
            zoom: 12,
            mapTypeId: 'roadmap',
            disableDefaultUI: false
          });
          setRouteMap(map);
        }
      }, 100);
    }).catch(err => {
      console.error('Failed to load Google Maps:', err);
    });
  }, []);

  // Draw route when locations change
  useEffect(() => {
    if (!routeMap || !window.google) return;

    // Clear old markers and polyline
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    // Add departure marker (green)
    if (departureLocation) {
      const pos = { lat: departureLocation.latitude, lng: departureLocation.longitude };
      const marker = new window.google.maps.Marker({
        position: pos,
        map: routeMap,
        title: departureLocation.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
      hasPoints = true;
    }

    // Add destination marker (red)
    if (destinationLocation) {
      const pos = { lat: destinationLocation.latitude, lng: destinationLocation.longitude };
      const marker = new window.google.maps.Marker({
        position: pos,
        map: routeMap,
        title: destinationLocation.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
      hasPoints = true;
    }

    // Draw route line between both points
    if (departureLocation && destinationLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route({
        origin: { lat: departureLocation.latitude, lng: departureLocation.longitude },
        destination: { lat: destinationLocation.latitude, lng: destinationLocation.longitude },
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && result.routes[0]) {
          const path = result.routes[0].overview_path;
          const line = new window.google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 5
          });
          line.setMap(routeMap);
          polylineRef.current = line;
        }
      });
    }

    // Fit map to show all points
    if (hasPoints) {
      if (departureLocation && destinationLocation) {
        routeMap.fitBounds(bounds, 50);
      } else {
        routeMap.setCenter(bounds.getCenter());
        routeMap.setZoom(14);
      }
    }
  }, [departureLocation, destinationLocation, routeMap]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.departureLocationId || !formData.destinationLocationId) {
      setError("Veuillez sélectionner un lieu de départ et une destination via les suggestions.");
      return;
    }

    if (formData.departureLocationId === formData.destinationLocationId) {
      setError("Le lieu de départ et d'arrivée doivent être différents.");
      return;
    }

    if (!formData.departureTime) {
      setError("Veuillez choisir une date et heure de départ.");
      return;
    }

    setSubmitting(true);
    try {
      // Ensure departureTime is in correct ISO format
      const dateIso = new Date(formData.departureTime).toISOString();
      
      await tripService.createTrip({
        ...formData,
        departureTime: dateIso
      });
      
      // Success!
      navigate('/dashboard');
    } catch (err) {
      console.error("Creation failed", err);
      setError(err.response?.data?.message || "Erreur lors de la création du trajet. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepartureChange = (id, name, locationData) => {
    console.log('Departure changed', id, locationData);
    setFormData(prev => ({...prev, departureLocationId: id}));
    setDepartureLocation(locationData);
  };

  const handleDestinationChange = (id, name, locationData) => {
    console.log('Destination changed', id, locationData);
    setFormData(prev => ({...prev, destinationLocationId: id}));
    setDestinationLocation(locationData);
  };

  
  if (loading) return (
    <SidebarLayout menuItems={menuItems} activeTab="create">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Vérification de votre profil...</p>
      </div>
    </SidebarLayout>
  );

  if (!hasProfile || vehicles.length === 0) {
    return (
      <SidebarLayout menuItems={menuItems} activeTab="create">
        <div className="max-w-2xl mx-auto py-10 px-4 text-center">
          <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-blue-50 border border-blue-50">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Devenir Conducteur</h2>
            <p className="text-gray-600 mb-10 leading-relaxed text-lg">
              Pour commencer à publier des trajets et partager vos frais, vous devez d'abord configurer votre profil conducteur et ajouter votre véhicule.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link to="/driver/complete" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                  <span>Configurer mon profil</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
               </Link>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout menuItems={menuItems} activeTab="create" title="Publier un trajet" subtitle="Conducteur">
      <div className="max-w-4xl mx-auto">

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-center gap-3 animate-shake">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span className="font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-50 p-8 md:p-12 space-y-10">
          {/* Section 1: Itinerary */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">1. Itinéraire</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <GoogleMapsLocationInput 
                label="Lieu de départ"
                placeholder="Ex: UPF, Gare de Fès..."
                onChange={(id, name, locationData) => handleDepartureChange(id, name, locationData)}
                hideMap={true}
              />
              <GoogleMapsLocationInput 
                label="Destination"
                placeholder="Ex: Route d'Imouzzer, Narjiss..."
                onChange={(id, name, locationData) => handleDestinationChange(id, name, locationData)}
                hideMap={true}
              />
            </div>
          </section>

          {/* Section 2: Details */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">2. Détails du trajet</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Date et Heure de départ</label>
                <input 
                  type="datetime-local"
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition font-medium"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Véhicule utilisé</label>
                <select 
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition font-medium appearance-none"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} • {v.plateNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Nombre de places</label>
                <div className="flex items-center space-x-4 bg-gray-50 p-1.5 rounded-2xl border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition">
                  <button type="button" onClick={() => setFormData({...formData, availableSeats: Math.max(1, formData.availableSeats - 1)})} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-gray-50 text-xl font-bold text-gray-600">-</button>
                  <input type="number" readOnly className="flex-grow text-center bg-transparent border-0 font-bold text-lg focus:ring-0" value={formData.availableSeats} />
                  <button type="button" onClick={() => setFormData({...formData, availableSeats: Math.min(8, formData.availableSeats + 1)})} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-gray-50 text-xl font-bold text-gray-600">+</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Prix par passager (DH)</label>
                <div className="relative">
                    <input 
                      type="number"
                      required
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition font-bold text-lg pr-12"
                      placeholder="Ex: 20"
                      value={formData.driverPrice}
                      onChange={(e) => setFormData({...formData, driverPrice: e.target.value})}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">DH</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Preferences */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">3. Préférences & Notes</h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">Qui peut réserver ?</label>
              <div className="grid grid-cols-2 gap-4">
                  {[
                    {id: 'ANY', label: 'Tous les étudiants', icon: '👥'},
                    {id: 'FEMALE_ONLY', label: 'Femmes uniquement', icon: '👩'}
                  ].map(pref => (
                      <button
                          key={pref.id}
                          type="button"
                          onClick={() => setFormData({...formData, passengerGenderPreference: pref.id})}
                          className={`p-4 rounded-2xl border-2 transition flex items-center gap-3 ${
                              formData.passengerGenderPreference === pref.id 
                              ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-lg shadow-blue-50' 
                              : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                          }`}
                      >
                          <span className="text-xl">{pref.icon}</span>
                          <span className="font-bold text-sm">{pref.label}</span>
                      </button>
                  ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Notes de voyage (Optionnel)</label>
              <textarea 
                  className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition h-32 resize-none font-medium"
                  placeholder="Ex: Pas de bagages encombrants, départ précis à l'heure..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>
          </section>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-6 rounded-[1.5rem] font-black text-xl transition shadow-2xl flex items-center justify-center gap-3 transform active:scale-[0.98] ${
                submitting 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:shadow-blue-200'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <span>Publier le trajet</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>
            <p className="text-center text-gray-400 text-sm mt-6">En publiant, vous acceptez les règles de sécurité UPF-Ride.</p>
          </div>
        </form>

        {/* Route Map - Fixed position below form */}
        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Itinéraire du trajet</h4>
          <div 
            ref={routeMapRef} 
            className="w-full h-96 rounded-2xl shadow-2xl border-2 border-blue-200 bg-gray-100"
          />
          {departureLocation && destinationLocation && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 p-5 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">{departureLocation.name}</span>
              </div>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">{destinationLocation.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CreateTrip;
