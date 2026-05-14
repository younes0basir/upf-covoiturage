import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { tripService } from '../api/tripService';
import GoogleMapsLocationInput from '../components/GoogleMapsLocationInput';
import TripRouteMap from '../components/TripRouteMap';

const Icons = {
  Passenger: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Car: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
};

const TripSearch = () => {
  const [locations, setLocations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    fromId: '',
    toId: '',
    date: '',
    seats: 1
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const results = await tripService.searchTrips(
        searchParams.fromId && searchParams.toId 
          ? searchParams 
          : {}
      );
      setTrips(results);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'passenger', label: 'Mes Réservations', icon: <Icons.Passenger />, path: '/dashboard' },
    { id: 'driver', label: 'Mes Trajets', icon: <Icons.Car />, path: '/dashboard' },
    { id: 'search', label: 'Chercher un trajet', icon: <Icons.Search />, path: '/trips' },
    { id: 'create', label: 'Publier un trajet', icon: <Icons.Plus />, path: '/trips/create' },
  ];

  return (
    <SidebarLayout menuItems={menuItems} activeTab="search" title="Rechercher un trajet" subtitle="Étudiant">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 animate-fade-in">
          <form onSubmit={handleSearch} className="grid md:grid-cols-5 gap-6 items-end">
            <div className="md:col-span-1">
              <GoogleMapsLocationInput 
                label="Départ"
                placeholder="Lieu de départ"
                onChange={(id) => setSearchParams(prev => ({...prev, fromId: id}))}
                hideMap={true}
              />
            </div>

            <div className="md:col-span-1">
              <GoogleMapsLocationInput 
                label="Arrivée"
                placeholder="Destination"
                onChange={(id) => setSearchParams(prev => ({...prev, toId: id}))}
                hideMap={true}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Date</label>
              <input 
                type="date"
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={searchParams.date}
                onChange={(e) => setSearchParams(prev => ({...prev, date: e.target.value}))}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Places</label>
              <input 
                type="number"
                min="1"
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={searchParams.seats}
                onChange={(e) => setSearchParams(prev => ({...prev, seats: e.target.value}))}
              />
            </div>

            <button type="submit" className="bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100 transform active:scale-95 flex items-center justify-center gap-2">
              <Icons.Search />
              <span>Rechercher</span>
            </button>
          </form>
      </div>

      <div className="pb-20">
        {loading ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 font-medium">Recherche des meilleurs trajets...</p>
          </div>
        ) : trips.length > 0 ? (
          <div className="grid gap-6">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <TripRouteMap departure={trip.departureLocation} destination={trip.destinationLocation} height="h-40" />
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg">
                        {trip.driver.firstName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{trip.driver.firstName} {trip.driver.lastName}</p>
                        <div className="flex items-center text-yellow-400 text-xs font-black uppercase tracking-wider">
                          <span className="mr-2">{'★'.repeat(Math.round(trip.driver.averageRating || 0))}</span>
                          <span className="text-gray-400">({trip.driver.totalRides} trajets)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white"></div>
                        <div className="w-px h-12 bg-gray-200 my-1"></div>
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Départ</p>
                          <p className="font-bold text-gray-900">{trip.departureLocation.name}</p>
                          <p className="text-xs text-blue-600 font-black">{new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Arrivée</p>
                          <p className="font-bold text-gray-900">{trip.destinationLocation.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-6 border-t md:border-0 pt-6 md:pt-0">
                    <div className="text-right">
                      <p className="text-4xl font-black text-gray-900 tabular-nums leading-none mb-1">{trip.totalPrice} <span className="text-sm font-bold text-gray-400">DH</span></p>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg inline-block">
                        {trip.availableSeats} places restantes
                      </p>
                    </div>
                    <Link to={`/trips/${trip.id}`} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition shadow-lg transform active:scale-95">
                      Réserver maintenant
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-3xl shadow-sm text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Aucun trajet trouvé</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Nous n'avons pas trouvé de trajets correspondant à vos critères pour le moment.</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TripSearch;
