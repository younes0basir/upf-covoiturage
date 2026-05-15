import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tripService } from '../api/tripService';
import { locationService } from '../api/locationService';
import { driverService } from '../api/driverService';
import SidebarLayout from '../components/SidebarLayout';
import GoogleMapsLocationInput from '../components/GoogleMapsLocationInput';
import { Loader } from '@googlemaps/js-api-loader';
import PageLoader from '../components/PageLoader';

// --- REVEAL HOOK ---
const useReveal = (loading) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-hidden');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => {
      el.classList.add('reveal-hidden');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);
};

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

  useReveal(loading);

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
      setTimeout(() => {
        if (routeMapRef.current && window.google) {
          const map = new window.google.maps.Map(routeMapRef.current, {
            center: { lat: 34.0181, lng: -5.0078 }, // Fès center
            zoom: 12,
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            styles: [
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [{"saturation": 36}, {"color": "#333333"}, {"lightness": 40}]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.stroke",
                    "stylers": [{"visibility": "on"}, {"color": "#ffffff"}, {"lightness": 16}]
                }
            ]
          });
          setRouteMap(map);
        }
      }, 100);
    }).catch(err => console.error('Failed to load Google Maps:', err));
  }, []);

  // Draw route when locations change
  useEffect(() => {
    if (!routeMap || !window.google) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    if (departureLocation) {
      const pos = { lat: departureLocation.latitude, lng: departureLocation.longitude };
      const marker = new window.google.maps.Marker({
        position: pos,
        map: routeMap,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
      hasPoints = true;
    }

    if (destinationLocation) {
      const pos = { lat: destinationLocation.latitude, lng: destinationLocation.longitude };
      const marker = new window.google.maps.Marker({
        position: pos,
        map: routeMap,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#0f172a',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
      hasPoints = true;
    }

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
            strokeColor: '#0f172a',
            strokeOpacity: 0.8,
            strokeWeight: 4
          });
          line.setMap(routeMap);
          polylineRef.current = line;
        }
      });
    }

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
      setError("Sélectionnez les lieux via les suggestions.");
      return;
    }
    if (formData.departureLocationId === formData.destinationLocationId) {
      setError("Les lieux doivent être différents.");
      return;
    }

    setSubmitting(true);
    try {
      const dateIso = new Date(formData.departureTime).toISOString();
      await tripService.createTrip({...formData, departureTime: dateIso});
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepartureChange = (id, name, locationData) => {
    setFormData(prev => ({...prev, departureLocationId: id}));
    setDepartureLocation(locationData);
  };

  const handleDestinationChange = (id, name, locationData) => {
    setFormData(prev => ({...prev, destinationLocationId: id}));
    setDestinationLocation(locationData);
  };

  if (loading) return <SidebarLayout menuItems={menuItems} activeTab="create"><PageLoader inline /></SidebarLayout>;

  if (!hasProfile || vehicles.length === 0) {
    return (
      <SidebarLayout menuItems={menuItems} activeTab="create" title="Nouveau Conducteur" subtitle="Portail">
        <div className="max-w-2xl mx-auto py-20 px-4 text-center reveal-element">
          <div className="bg-white p-20 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-slate-100">
              <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tighter">Devenir Conducteur</h2>
            <p className="text-slate-400 mb-12 max-w-sm mx-auto font-medium italic">
              Configurez votre profil et ajoutez votre véhicule pour commencer à partager vos trajets.
            </p>
            <Link to="/driver/complete" className="inline-block bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition shadow-xl shadow-slate-200">
               Configurer mon profil
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout menuItems={menuItems} activeTab="create" title="Publier un trajet" subtitle="Conducteur">
      <div className="max-w-5xl mx-auto pb-32">
        {error && (
          <div className="mb-10 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl flex items-center gap-4 animate-shake font-bold text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 items-start">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 space-y-12 reveal-element">
              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] flex items-center">
                    <span className="w-8 h-px bg-blue-100 mr-4"></span> 01. Itinéraire
                </h3>
                <div className="space-y-6">
                  <GoogleMapsLocationInput 
                    label="Lieu de départ"
                    placeholder="Ville ou établissement"
                    onChange={handleDepartureChange}
                    hideMap={true}
                  />
                  <GoogleMapsLocationInput 
                    label="Destination finale"
                    placeholder="Ville ou établissement"
                    onChange={handleDestinationChange}
                    hideMap={true}
                  />
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] flex items-center">
                    <span className="w-8 h-px bg-blue-100 mr-4"></span> 02. Logistique
                </h3>
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Départ prévu</label>
                    <input 
                      type="datetime-local"
                      required
                      className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Véhicule</label>
                    <select 
                      required
                      className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold appearance-none"
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                    >
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} • {v.plateNumber}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Places</label>
                    <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <button type="button" onClick={() => setFormData({...formData, availableSeats: Math.max(1, formData.availableSeats - 1)})} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-900 hover:text-white transition font-bold text-xl">-</button>
                      <input type="number" readOnly className="flex-grow text-center bg-transparent border-0 font-bold text-lg focus:ring-0" value={formData.availableSeats} />
                      <button type="button" onClick={() => setFormData({...formData, availableSeats: Math.min(8, formData.availableSeats + 1)})} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-900 hover:text-white transition font-bold text-xl">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Prix (DH)</label>
                    <div className="relative">
                        <input 
                          type="number"
                          required
                          className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold text-lg pr-12"
                          placeholder="00"
                          value={formData.driverPrice}
                          onChange={(e) => setFormData({...formData, driverPrice: e.target.value})}
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-300">DH</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] flex items-center">
                    <span className="w-8 h-px bg-blue-100 mr-4"></span> 03. Préférences
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                      {id: 'ANY', label: 'Tous', icon: '👥'},
                      {id: 'FEMALE_ONLY', label: 'Femmes', icon: '👩'}
                    ].map(pref => (
                        <button
                            key={pref.id}
                            type="button"
                            onClick={() => setFormData({...formData, passengerGenderPreference: pref.id})}
                            className={`p-5 rounded-2xl border transition-all flex items-center justify-center gap-3 ${
                                formData.passengerGenderPreference === pref.id 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                        >
                            <span className="font-bold text-[10px] uppercase tracking-widest">{pref.label}</span>
                        </button>
                    ))}
                </div>

                <textarea 
                    className="w-full p-6 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition h-32 resize-none font-medium italic text-sm"
                    placeholder="Notes additionnelles (ex: bagages, musique...)"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </section>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-xs transition-all shadow-2xl flex items-center justify-center gap-4 transform active:scale-[0.98] ${
                    submitting 
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
                  }`}
                >
                  {submitting ? 'Publication...' : 'Publier le trajet'}
                  {!submitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                </button>
              </div>
            </form>

            <div className="space-y-10 sticky top-10 reveal-element" style={{ transitionDelay: '200ms' }}>
              <div className="bg-slate-900 rounded-[3rem] p-1 overflow-hidden shadow-2xl">
                  <div 
                    ref={routeMapRef} 
                    className="w-full h-[500px] rounded-[2.8rem]"
                  />
              </div>
              
              {departureLocation && destinationLocation && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Départ</p>
                      <p className="font-bold text-slate-900">{departureLocation.name}</p>
                    </div>
                    <div className="flex-1 h-px bg-slate-100 mx-8 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3">
                            <Icons.Car />
                        </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Destination</p>
                      <p className="font-bold text-slate-900">{destinationLocation.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CreateTrip;
