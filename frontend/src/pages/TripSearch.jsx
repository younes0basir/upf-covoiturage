import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { tripService } from '../api/tripService';
import GoogleMapsLocationInput from '../components/GoogleMapsLocationInput';
import TripRouteMap from '../components/TripRouteMap';
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
  }, [loading]); // Re-run when loading finished
};

const Icons = {
  Passenger: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Car: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
};

const TripSearch = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    fromId: '',
    toId: '',
    date: '',
    seats: 1
  });

  useReveal(loading);

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
    <SidebarLayout menuItems={menuItems} activeTab="search" title="Rechercher un trajet" subtitle="Portail">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10 reveal-element">
          <form onSubmit={handleSearch} className="grid md:grid-cols-5 gap-8 items-end">
            <div className="md:col-span-1">
              <GoogleMapsLocationInput 
                label="Départ"
                placeholder="Ville ou lieu"
                onChange={(id) => setSearchParams(prev => ({...prev, fromId: id}))}
                hideMap={true}
              />
            </div>

            <div className="md:col-span-1">
              <GoogleMapsLocationInput 
                label="Destination"
                placeholder="Ville ou lieu"
                onChange={(id) => setSearchParams(prev => ({...prev, toId: id}))}
                hideMap={true}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-[0.2em] ml-1">Date du départ</label>
              <input 
                type="date"
                className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-semibold"
                value={searchParams.date}
                onChange={(e) => setSearchParams(prev => ({...prev, date: e.target.value}))}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-[0.2em] ml-1">Passagers</label>
              <input 
                type="number"
                min="1"
                className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-semibold"
                value={searchParams.seats}
                onChange={(e) => setSearchParams(prev => ({...prev, seats: e.target.value}))}
              />
            </div>

            <button type="submit" className="bg-slate-900 text-white p-5 rounded-2xl font-bold hover:bg-black transition shadow-xl shadow-slate-200 transform active:scale-95 flex items-center justify-center gap-3">
              <Icons.Search />
              <span className="text-sm uppercase tracking-widest font-black">Trouver</span>
            </button>
          </form>
      </div>

      <div className="pb-32">
        {loading ? (
          <div className="bg-white p-20 rounded-[2.5rem] shadow-sm text-center border border-slate-100">
            <div className="w-12 h-12 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-slate-400 font-medium italic">Analyse des trajets disponibles...</p>
          </div>
        ) : trips.length > 0 ? (
          <div className="grid gap-8">
            {trips.map((trip, i) => (
              <div key={trip.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden group reveal-element" style={{ transitionDelay: `${i * 100}ms` }}>
                <TripRouteMap departure={trip.departureLocation} destination={trip.destinationLocation} height="h-48" />
                <div className="p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-5 mb-8">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-900 border border-slate-100 transition-transform group-hover:scale-110">
                        {trip.driver.firstName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg leading-none mb-2">{trip.driver.firstName} {trip.driver.lastName}</p>
                        <div className="flex items-center text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                          <span className="mr-2">{'★'.repeat(Math.round(trip.driver.averageRating || 0))}</span>
                          <span className="text-slate-400 italic">({trip.driver.totalRides || 0} trajets effectués)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-8">
                      <div className="flex flex-col items-center mt-1.5">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white"></div>
                        <div className="w-px h-16 bg-slate-100 my-1"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Départ</p>
                          <p className="font-bold text-slate-900 text-lg">{trip.departureLocation.name}</p>
                          <p className="text-[11px] text-blue-600 font-bold uppercase mt-1 tracking-widest">
                            {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Arrivée</p>
                          <p className="font-bold text-slate-900 text-lg">{trip.destinationLocation.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-8 border-t lg:border-0 pt-8 lg:pt-0">
                    <div className="text-right">
                      <p className="text-5xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none mb-3">{trip.totalPrice} <span className="text-xl text-slate-300">DH</span></p>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                        {trip.availableSeats} places libres
                      </span>
                    </div>
                    <Link to={`/trips/${trip.id}`} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-sm hover:bg-black transition shadow-xl shadow-slate-200 transform active:scale-95 text-center min-w-[180px]">
                      Détails du trajet
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-24 rounded-[2.5rem] shadow-sm text-center border border-slate-100 reveal-element">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tighter">Aucun trajet trouvé.</h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium italic">Essayez de modifier vos critères de recherche pour voir plus de résultats.</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TripSearch;
