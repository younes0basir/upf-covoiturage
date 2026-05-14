import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../api/tripService';
import { reservationService } from '../api/reservationService';
import SidebarLayout from '../components/SidebarLayout';
import { Link, useNavigate } from 'react-router-dom';
import TripRouteMap from '../components/TripRouteMap';

const Icons = {
  Passenger: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Car: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Calendar: () => <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Phone: () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Info: () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/></svg>,
  EmptyBox: () => <svg className="w-24 h-24 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('passenger');

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
          fetchData();
      } catch (err) {
          alert("Erreur lors de la mise à jour");
      }
  };

  const handleUpdateTripStatus = async (tripId, status) => {
      const msgs = {
          COMPLETED: "Êtes-vous sûr de vouloir marquer ce trajet comme terminé ? Cela validera les réservations et ajustera vos statistiques.",
          CANCELLED: "Êtes-vous sûr de vouloir annuler tout ce trajet ? Toutes les réservations associées seront annulées."
      };
      if (!window.confirm(msgs[status])) return;
      try {
          await tripService.updateTripStatus(tripId, status);
          fetchData();
      } catch (err) {
          alert("Erreur lors de la mise à jour du trajet");
      }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACCEPTED: "bg-green-100 text-green-700 ring-green-500/20",
      PENDING: "bg-yellow-100 text-yellow-700 ring-yellow-500/20",
      REJECTED: "bg-red-100 text-red-700 ring-red-500/20",
      CANCELLED: "bg-gray-100 text-gray-700 ring-gray-500/20",
      COMPLETED: "bg-blue-100 text-blue-700 ring-blue-500/20"
    };
    const labels = {
      ACCEPTED: "Confirmé",
      PENDING: "En attente",
      REJECTED: "Refusé",
      CANCELLED: "Annulé",
      COMPLETED: "Terminé"
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ring-1 inset-ring ${styles[status] || styles.PENDING}`}>
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
    <SidebarLayout activeTab={activeTab} setActiveTab={setActiveTab} menuItems={menuItems} subtitle="Espace Étudiant">
      <div className="animate-fade-in">

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Chargement de vos données...</p>
                </div>
            ) : (
                <div className="animate-fade-in-up">
                    {activeTab === 'passenger' ? (
                        <div className="space-y-6">
                            {reservations.length > 0 ? (
                                reservations.map(res => (
                                    <div key={res.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group overflow-hidden">
                                        <TripRouteMap departure={res.trip?.departureLocation} destination={res.trip?.destinationLocation} height="h-32" />
                                        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                {/* Date Calendar Icon */}
                                                <div className="bg-blue-50 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
                                                    <span className="text-xs font-black uppercase text-blue-600 group-hover:text-blue-200">{new Date(res.trip?.departureTime).toLocaleDateString('fr-FR', {month: 'short'})}</span>
                                                    <span className="text-3xl font-black text-gray-900 group-hover:text-white leading-none">{new Date(res.trip?.departureTime).getDate()}</span>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-lg font-black text-gray-900">
                                                        <span>{res.trip?.departureLocation.name}</span>
                                                        <Icons.ArrowRight />
                                                        <span>{res.trip?.destinationLocation.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                                        <span className="flex items-center"><Icons.Clock /> {new Date(res.trip?.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded-lg">{res.seatsReserved} place(s)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto">
                                                <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4">
                                                    {getStatusBadge(res.status)}
                                                    <Link to={`/trips/${res.trip?.id}`} className="text-blue-600 font-bold text-sm hover:text-blue-800 hover:underline flex items-center">
                                                        Voir le trajet &rarr;
                                                    </Link>
                                                </div>
                                                
                                                {/* Actions Passager après confirmation */}
                                                {res.status === 'ACCEPTED' && (
                                                    <div className="flex items-center gap-2 mt-2 w-full">
                                                        <button 
                                                            onClick={() => contactUser(res.trip.driver)}
                                                            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                                                        >
                                                            <Icons.Phone /> Contacter
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                                            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                                                        >
                                                            Annuler
                                                        </button>
                                                    </div>
                                                )}
                                                {res.status === 'PENDING' && (
                                                    <div className="mt-2 w-full text-right">
                                                        <button 
                                                            onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                                            className="text-gray-400 hover:text-red-500 text-xs font-bold underline transition"
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
                                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                                    <Icons.EmptyBox />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun trajet en vue</h3>
                                    <p className="text-gray-500 mb-6">Vous n'avez pas encore réservé de trajet. C'est le moment de planifier votre prochain voyage !</p>
                                    <Link to="/trips" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Explorer les trajets</Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {trips.length > 0 ? (
                                trips.map(trip => (
                                    <div key={trip.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                                        <TripRouteMap departure={trip.departureLocation} destination={trip.destinationLocation} height="h-36" />
                                        {/* Trip Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-white p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center text-xl font-black text-gray-900 mb-2">
                                                    <span className="text-blue-600 mr-2"><Icons.MapPin /></span>
                                                    {trip.departureLocation.name} 
                                                    <Icons.ArrowRight /> 
                                                    {trip.destinationLocation.name}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                                                    <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"><Icons.Calendar /> {new Date(trip.departureTime).toLocaleDateString()} à {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    <span className="bg-gray-100 px-3 py-1 rounded-lg">{trip.availableSeats} places libres</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-3">
                                                <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                                    {trip.status === 'SCHEDULED' ? 'Prévu' : trip.status === 'COMPLETED' ? 'Terminé' : trip.status === 'CANCELLED' ? 'Annulé' : trip.status}
                                                </span>
                                                
                                                {trip.status === 'SCHEDULED' && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleUpdateTripStatus(trip.id, 'COMPLETED')}
                                                            className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center"
                                                        >
                                                            <Icons.Check /> Terminer
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateTripStatus(trip.id, 'CANCELLED')}
                                                            className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center"
                                                        >
                                                            <Icons.X /> Annuler
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Reservations Section */}
                                        <div className="p-6 md:p-8 bg-white">
                                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-6 flex items-center">
                                                <span className="w-8 h-px bg-gray-200 mr-4"></span>
                                                Demandes de réservation ({trip.reservations?.length || 0})
                                                <span className="flex-1 h-px bg-gray-200 ml-4"></span>
                                            </h4>
                                            
                                            {trip.reservations && trip.reservations.length > 0 ? (
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {trip.reservations.map(res => (
                                                        <div key={res.id} className="flex flex-col p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                                                        {res.passenger.firstName[0]}{res.passenger.lastName[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900">{res.passenger.firstName} {res.passenger.lastName}</p>
                                                                        <p className="text-xs text-blue-600 font-bold">{res.seatsReserved} place(s) demandée(s)</p>
                                                                    </div>
                                                                </div>
                                                                {getStatusBadge(res.status)}
                                                            </div>
                                                            
                                                            {res.status === 'PENDING' && trip.status === 'SCHEDULED' && (
                                                                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-200">
                                                                    <button 
                                                                        onClick={() => handleUpdateResStatus(res.id, 'ACCEPTED')}
                                                                        className="flex-1 flex items-center justify-center bg-green-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition shadow-sm"
                                                                    >
                                                                        <Icons.Check /> Accepter
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleUpdateResStatus(res.id, 'REJECTED')}
                                                                        className="flex-1 flex items-center justify-center bg-white border border-red-200 text-red-600 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition"
                                                                    >
                                                                        <Icons.X /> Refuser
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {res.status === 'ACCEPTED' && (
                                                                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-200">
                                                                    <button 
                                                                        onClick={() => contactUser(res.passenger)}
                                                                        className="flex-1 flex items-center justify-center bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition shadow-sm"
                                                                    >
                                                                        <Icons.Phone /> Contacter
                                                                    </button>
                                                                    {trip.status === 'SCHEDULED' && (
                                                                        <button 
                                                                            onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                                                            className="flex-1 flex items-center justify-center bg-white border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                                                                        >
                                                                            Annuler
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            {res.status === 'CANCELLED' && (
                                                                <div className="mt-auto pt-2 border-t border-gray-200 text-center">
                                                                    <span className="text-xs text-gray-400 flex items-center justify-center"><Icons.Info /> Réservation annulée</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-gray-400 font-medium">Aucune demande reçue pour le moment.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                                    <Icons.EmptyBox />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Devenez Conducteur</h3>
                                    <p className="text-gray-500 mb-6">Vous n'avez publié aucun trajet. Partagez vos frais et rendez service à d'autres étudiants !</p>
                                    <Link to="/trips/create" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Publier mon premier trajet</Link>
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
