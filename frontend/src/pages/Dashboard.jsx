import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../api/tripService';
import { reservationService } from '../api/reservationService';
import SidebarLayout from '../components/SidebarLayout';
import { Link, useNavigate } from 'react-router-dom';
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
  }, [loading]);
};

const Icons = {
  Passenger: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Car: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Calendar: () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4 mx-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Phone: () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Info: () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/></svg>,
  EmptyBox: () => <svg className="w-20 h-20 mx-auto text-slate-100 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('passenger');

  useReveal(loading);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const myRes = await reservationService.getMyReservations();
      setReservations(myRes);
    } catch (err) {
      console.error('Failed to fetch reservations', err);
    }

    try {
      const myTrips = await tripService.getMyTrips();
      setTrips(myTrips);
    } catch (err) {
      console.error('Failed to fetch trips (user might not be a driver)', err);
    }
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
        fetchData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateResStatus = async (resId, status) => {
      if (status === 'CANCELLED' && !window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
      try {
          await reservationService.updateStatus(resId, status);
          fetchData(false);
      } catch (err) {
          alert("Erreur lors de la mise à jour");
      }
  };

  const handleUpdateTripStatus = async (tripId, status) => {
      const msgs = {
          COMPLETED: "Êtes-vous sûr de vouloir marquer ce trajet comme terminé ?",
          CANCELLED: "Êtes-vous sûr de vouloir annuler tout ce trajet ?"
      };
      if (!window.confirm(msgs[status])) return;
      try {
          await tripService.updateTripStatus(tripId, status);
          fetchData(false);
      } catch (err) {
          alert("Erreur lors de la mise à jour du trajet");
      }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACCEPTED: "bg-green-50 text-green-600 border-green-100",
      PENDING: "bg-amber-50 text-amber-600 border-amber-100",
      REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
      CANCELLED: "bg-slate-50 text-slate-400 border-slate-100",
      COMPLETED: "bg-blue-50 text-blue-600 border-blue-100"
    };
    const labels = {
      ACCEPTED: "Confirmé",
      PENDING: "En attente",
      REJECTED: "Refusé",
      CANCELLED: "Annulé",
      COMPLETED: "Terminé"
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status] || styles.PENDING}`}>
            {labels[status] || status}
        </span>
    );
  };

  const contactUser = (person) => {
      const contactInfo = person.phone ? `Téléphone: ${person.phone}` : `Email: ${person.email}`;
      alert(`Contacter ${person.firstName} ${person.lastName}\n${contactInfo}`);
  };

  const menuItems = [
    { id: 'passenger', label: 'Mes Réservations', icon: <Icons.Passenger /> },
    { id: 'driver', label: 'Mes Trajets', icon: <Icons.Car /> },
    { id: 'search', label: 'Chercher un trajet', icon: <Icons.Search />, path: '/trips' },
    { id: 'create', label: 'Publier un trajet', icon: <Icons.Plus />, path: '/trips/create' },
  ];

  return (
    <SidebarLayout activeTab={activeTab} setActiveTab={setActiveTab} menuItems={menuItems} subtitle="Espace UPF">
      <div className="space-y-10">
        <div className="flex items-center gap-10 border-b border-slate-100 pb-2">
          <button 
            onClick={() => setActiveTab('passenger')}
            className={`pb-4 px-2 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'passenger' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Passager
            {activeTab === 'passenger' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full animate-fade-in"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('driver')}
            className={`pb-4 px-2 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'driver' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Conducteur
            {activeTab === 'driver' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full animate-fade-in"></div>}
          </button>
        </div>

        {loading ? <PageLoader inline /> : (
          <div className="reveal-element">
            {activeTab === 'passenger' ? (
              <div className="space-y-8">
                {reservations.length > 0 ? (
                  reservations.map((res, i) => (
                    <div key={res.id} className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 border border-slate-100 group overflow-hidden reveal-element" style={{ transitionDelay: `${i * 100}ms` }}>
                      <TripRouteMap departure={res.trip?.departureLocation} destination={res.trip?.destinationLocation} height="h-32" />
                      <div className="p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="flex items-center gap-10">
                          <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center border border-slate-100 transition-all duration-500 group-hover:bg-slate-900 group-hover:border-slate-900">
                            <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-slate-400 transition-colors">{new Date(res.trip?.departureTime).toLocaleDateString('fr-FR', {month: 'short'})}</span>
                            <span className="text-3xl font-bold text-slate-900 group-hover:text-white leading-none mt-1">{new Date(res.trip?.departureTime).getDate()}</span>
                          </div>
                          
                          <div className="space-y-4 pt-1">
                            <div className="flex items-center text-xl font-bold text-slate-900 leading-none">
                              <span>{res.trip?.departureLocation.name}</span>
                              <Icons.ArrowRight />
                              <span>{res.trip?.destinationLocation.name}</span>
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center"><Icons.Clock /> <span className="ml-2">{new Date(res.trip?.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></span>
                              <span className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{res.seatsReserved} place(s)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end gap-6 border-t lg:border-t-0 pt-8 lg:pt-0">
                          <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
                            {getStatusBadge(res.status)}
                            <Link to={`/trips/${res.trip?.id}`} className="text-slate-900 font-bold text-xs uppercase tracking-widest hover:underline decoration-blue-500 decoration-2 underline-offset-8">
                              Voir détails
                            </Link>
                          </div>
                          
                          {res.status === 'ACCEPTED' && (
                            <div className="flex items-center gap-3 w-full">
                              <button 
                                onClick={() => contactUser(res.trip.driver)}
                                className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-200"
                              >
                                <Icons.Phone /> Appeler
                              </button>
                              <button 
                                onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition"
                              >
                                Annuler
                              </button>
                            </div>
                          )}
                          {res.status === 'PENDING' && (
                            <div className="w-full text-right pt-2">
                              <button 
                                onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                className="text-slate-400 hover:text-rose-500 text-[10px] font-bold uppercase tracking-widest underline decoration-dotted transition"
                              >
                                Annuler la demande
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-[3rem] p-24 text-center shadow-sm border border-slate-100 reveal-element">
                    <Icons.EmptyBox />
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tighter">Aucune réservation.</h3>
                    <p className="text-slate-400 mb-10 max-w-sm mx-auto font-medium italic">Vous n'avez pas encore réservé de trajet pour le moment.</p>
                    <Link to="/trips" className="inline-block bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition shadow-xl shadow-slate-200">Explorer les trajets</Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-12">
                {trips.length > 0 ? (
                  trips.map((trip, i) => (
                    <div key={trip.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 border border-slate-100 reveal-element" style={{ transitionDelay: `${i * 100}ms` }}>
                      <TripRouteMap departure={trip.departureLocation} destination={trip.destinationLocation} height="h-36" />
                      <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="space-y-6 pt-1">
                          <div className="flex items-center text-2xl font-bold text-slate-900 leading-none">
                            <span className="text-blue-500 mr-4 scale-125"><Icons.MapPin /></span>
                            {trip.departureLocation.name} 
                            <Icons.ArrowRight /> 
                            {trip.destinationLocation.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <span className="flex items-center text-slate-900"><Icons.Calendar /> <span className="ml-3">{new Date(trip.departureTime).toLocaleDateString()} • {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></span>
                            <span className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">{trip.availableSeats} places libres</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-5">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${
                            trip.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            trip.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' : 
                            'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                            {trip.status === 'SCHEDULED' ? 'Prévu' : trip.status === 'COMPLETED' ? 'Terminé' : trip.status === 'CANCELLED' ? 'Annulé' : trip.status}
                          </span>
                          
                          {trip.status === 'SCHEDULED' && (
                            <div className="flex gap-3">
                              <button 
                                onClick={() => handleUpdateTripStatus(trip.id, 'COMPLETED')}
                                className="bg-slate-900 text-white hover:bg-black px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition flex items-center shadow-lg shadow-slate-200"
                              >
                                <Icons.Check /> Terminer
                              </button>
                              <button 
                                onClick={() => handleUpdateTripStatus(trip.id, 'CANCELLED')}
                                className="bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition flex items-center"
                              >
                                <Icons.X /> Annuler
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-10 bg-slate-50/30">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                          <span className="w-10 h-px bg-slate-100 mr-6"></span>
                          Passagers ({trip.reservations?.length || 0})
                          <span className="flex-1 h-px bg-slate-100 ml-6"></span>
                        </h4>
                        
                        {trip.reservations && trip.reservations.length > 0 ? (
                          <div className="grid gap-6 md:grid-cols-2">
                            {trip.reservations.map(res => (
                              <div key={res.id} className="flex flex-col p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-sm shadow-md">
                                      {res.passenger.firstName[0]}{res.passenger.lastName[0]}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 leading-none mb-2">{res.passenger.firstName} {res.passenger.lastName}</p>
                                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{res.seatsReserved} place(s) demandée(s)</p>
                                    </div>
                                  </div>
                                  {getStatusBadge(res.status)}
                                </div>
                                
                                {res.status === 'PENDING' && trip.status === 'SCHEDULED' && (
                                  <div className="flex gap-3 mt-auto pt-6 border-t border-slate-50">
                                    <button 
                                      onClick={() => handleUpdateResStatus(res.id, 'ACCEPTED')}
                                      className="flex-1 flex items-center justify-center bg-slate-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-100"
                                    >
                                      <Icons.Check /> Accepter
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateResStatus(res.id, 'REJECTED')}
                                      className="flex-1 flex items-center justify-center bg-white border border-slate-200 text-slate-400 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition"
                                    >
                                      <Icons.X /> Refuser
                                    </button>
                                  </div>
                                )}

                                {res.status === 'ACCEPTED' && (
                                  <div className="flex gap-3 mt-auto pt-6 border-t border-slate-50">
                                    <button 
                                      onClick={() => contactUser(res.passenger)}
                                      className="flex-1 flex items-center justify-center bg-blue-50 text-blue-600 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition border border-blue-100"
                                    >
                                      <Icons.Phone /> Appeler
                                    </button>
                                    {trip.status === 'SCHEDULED' && (
                                      <button 
                                        onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                        className="flex-1 flex items-center justify-center bg-white border border-slate-200 text-slate-400 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition"
                                      >
                                        Annuler
                                      </button>
                                    )}
                                  </div>
                                )}
                                
                                {res.status === 'CANCELLED' && (
                                  <div className="mt-auto pt-6 border-t border-slate-50 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 flex items-center justify-center"><Icons.Info /> Réservation annulée</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-50">
                            <p className="text-slate-300 font-medium italic text-sm">Aucune demande reçue pour le moment.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-[3rem] p-24 text-center shadow-sm border border-slate-100 reveal-element">
                    <Icons.EmptyBox />
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tighter">Devenez Conducteur.</h3>
                    <p className="text-slate-400 mb-10 max-w-sm mx-auto font-medium italic">Partagez vos trajets avec d'autres étudiants de l'UPF.</p>
                    <Link to="/trips/create" className="inline-block bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition shadow-xl shadow-slate-200">Publier mon premier trajet</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
