import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../api/tripService';
import { reservationService } from '../api/reservationService';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';
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

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [seats, setSeats] = useState(1);

  useReveal(loading);

  const menuItems = [
    { id: 'passenger', label: 'Mes Réservations', icon: <Icons.Passenger />, path: '/dashboard' },
    { id: 'driver', label: 'Mes Trajets', icon: <Icons.Car />, path: '/dashboard' },
    { id: 'search', label: 'Chercher un trajet', icon: <Icons.Search />, path: '/trips' },
    { id: 'create', label: 'Publier un trajet', icon: <Icons.Plus />, path: '/trips/create' },
  ];

  useEffect(() => {
    tripService.getById(id)
      .then(setTrip)
      .catch(err => console.error("Failed to fetch trip", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setReserving(true);
    try {
      await reservationService.create({ tripId: id, seatsReserved: seats });
      alert("Demande de réservation envoyée !");
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la réservation.");
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!trip) return (
    <SidebarLayout menuItems={menuItems} activeTab="search">
      <div className="p-20 text-center text-slate-500 font-bold reveal-element">Trajet introuvable</div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout menuItems={menuItems} activeTab="search" title="Détails du trajet" subtitle="Réservation">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 reveal-element">
              <div className="flex items-center justify-between mb-12">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tighter">Itinéraire.</h1>
                <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  {trip.status === 'OPEN' ? 'Disponible' : trip.status}
                </span>
              </div>

              <div className="flex items-start space-x-10 mb-14">
                <div className="flex flex-col items-center mt-2">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white"></div>
                  <div className="w-px h-28 bg-slate-100 my-1"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-900"></div>
                </div>
                <div className="flex-grow space-y-20 pt-1">
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-1">{trip.departureLocation.name}</p>
                    <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                      {new Date(trip.departureTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} • {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-1">{trip.destinationLocation.name}</p>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      Arrivée estimée : {trip.estimatedDurationMinutes ? `${trip.estimatedDurationMinutes} min` : 'Selon trafic'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-10">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Véhicule & Confort</h3>
                <div className="flex items-center gap-8 bg-slate-50/50 p-8 rounded-3xl border border-slate-100/50">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 border border-slate-100">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-none mb-2">{trip.vehicle.brand} {trip.vehicle.model}</p>
                    <p className="text-slate-400 font-medium text-xs">{trip.vehicle.color} • {trip.vehicle.seats} places totales</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 reveal-element delay-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Notes du conducteur</h3>
              <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 text-slate-700 leading-relaxed font-medium italic text-lg">
                "{trip.notes || "Aucune note particulière pour ce trajet."}"
              </div>
            </div>
          </div>

          {/* Sidebar Booking */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 reveal-element delay-200">
              <div className="text-center mb-10">
                <p className="text-5xl font-bold text-slate-900 tracking-tighter tabular-nums">{trip.totalPrice}<span className="text-xl text-slate-300 ml-1">DH</span></p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mt-3">Tarif unique</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100/50">
                  <p className="text-xl font-bold text-slate-900">{trip.availableSeats}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Disponibles</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100/50">
                  <p className="text-[10px] font-bold text-slate-900 uppercase">{trip.passengerGenderPreference === 'ANY' ? 'Mixte' : 'Femmes'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Passagers</p>
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 ml-1">Réserver des places</label>
                <div className="relative">
                  <select 
                    className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold text-slate-900 appearance-none"
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                  >
                    {[...Array(trip.availableSeats)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} place{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleBook}
                disabled={reserving || trip.availableSeats === 0}
                className={`w-full py-6 rounded-2xl font-bold text-lg transition shadow-xl transform active:scale-95 ${
                  trip.availableSeats === 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
                }`}
              >
                {reserving ? 'Envoi...' : trip.availableSeats === 0 ? 'COMPLET' : 'RÉSERVER'}
              </button>
            </div>

            <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group reveal-element delay-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-6 mb-10">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-bold text-2xl border border-white/10 group-hover:scale-110 transition-transform">
                    {trip.driver.firstName[0]}
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none mb-2 tracking-tight">{trip.driver.firstName} {trip.driver.lastName}</p>
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Conducteur vérifié</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-5 rounded-2xl text-center backdrop-blur-sm border border-white/5">
                    <p className="text-2xl font-bold text-yellow-400 tabular-nums">{trip.driver.averageRating || "—"}</p>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-1">Rating</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl text-center backdrop-blur-sm border border-white/5">
                    <p className="text-2xl font-bold text-white tabular-nums">{trip.driver.totalRides || 0}</p>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-1">Trajets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TripDetails;
