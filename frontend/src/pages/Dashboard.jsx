import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../api/tripService';
import { reservationService } from '../api/reservationService';
import SidebarLayout from '../components/SidebarLayout';
import { Link, useNavigate } from 'react-router-dom';
import TripRouteMap from '../components/TripRouteMap';
import PageLoader from '../components/PageLoader';

// --- Custom Hooks ---
const useReveal = (loading) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-hidden');
        }
      });
    }, { threshold: 0.1, rootMargin: '20px' });

    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => {
      el.classList.add('reveal-hidden');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);
};

// --- Icons Component ---
const Icons = {
  Passenger: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4 mx-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
    </svg>
  ),
  EmptyBox: () => (
    <svg className="w-20 h-20 mx-auto text-gray-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  Users: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
};

// --- Reusable Components ---
const StatusBadge = ({ status }) => {
  const config = {
    ACCEPTED: { label: 'Confirmed', color: 'bg-green-50 text-green-700 border-green-200' },
    PENDING: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
    CANCELLED: { label: 'Cancelled', color: 'bg-gray-50 text-gray-500 border-gray-200' },
    COMPLETED: { label: 'Completed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    SCHEDULED: { label: 'Scheduled', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  };

  const { label, color } = config[status] || config.PENDING;
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
};

const DateBadge = ({ date }) => {
  const formattedDate = new Date(date);
  return (
    <div className="bg-gray-50 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border border-gray-100 transition-all duration-300 group-hover:bg-gray-900 group-hover:border-gray-900">
      <span className="text-xs font-semibold uppercase text-gray-400 group-hover:text-gray-400">
        {formattedDate.toLocaleDateString('en-US', { month: 'short' })}
      </span>
      <span className="text-3xl font-bold text-gray-900 group-hover:text-white leading-none mt-1">
        {formattedDate.getDate()}
      </span>
    </div>
  );
};

const EmptyState = ({ title, message, buttonText, buttonLink, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 reveal-element">
    <Icon />
    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-400 mb-8 max-w-sm mx-auto font-medium">{message}</p>
    <Link 
      to={buttonLink} 
      className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold uppercase tracking-wider text-sm hover:bg-black transition shadow-lg"
    >
      {buttonText}
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </Link>
  </div>
);

const ContactModal = ({ isOpen, onClose, person, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Contact {person.firstName}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <Icons.X />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Phone Number</p>
            <p className="text-lg font-semibold text-gray-900">{person.phone || 'Not provided'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Email Address</p>
            <p className="text-lg font-semibold text-gray-900">{person.email}</p>
          </div>
        </div>
        <button
          onClick={onConfirm}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('passenger');
  const [contactPerson, setContactPerson] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useReveal(loading);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const [myRes, myTrips] = await Promise.all([
        reservationService.getMyReservations(),
        tripService.getMyTrips().catch(() => [])
      ]);
      setReservations(myRes);
      setTrips(myTrips);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleUpdateResStatus = async (resId, status) => {
    const confirmMessages = {
      CANCELLED: 'Are you sure you want to cancel this reservation?',
      ACCEPTED: 'Are you sure you want to accept this reservation?',
      REJECTED: 'Are you sure you want to reject this reservation?'
    };
    
    if (confirmMessages[status] && !window.confirm(confirmMessages[status])) return;
    
    try {
      await reservationService.updateStatus(resId, status);
      await fetchData(false);
    } catch (err) {
      alert('Error updating reservation');
    }
  };

  const handleUpdateTripStatus = async (tripId, status) => {
    const confirmMessages = {
      COMPLETED: 'Mark this trip as completed?',
      CANCELLED: 'Cancel this entire trip? This will affect all passengers.'
    };
    
    if (!window.confirm(confirmMessages[status])) return;
    
    try {
      await tripService.updateTripStatus(tripId, status);
      await fetchData(false);
    } catch (err) {
      alert('Error updating trip');
    }
  };

  const contactUser = (person) => {
    setContactPerson(person);
    setShowContactModal(true);
  };

  const menuItems = [
    { id: 'passenger', label: 'My Reservations', icon: <Icons.Passenger /> },
    { id: 'driver', label: 'My Trips', icon: <Icons.Car /> },
    { id: 'search', label: 'Find a Ride', icon: <Icons.Search />, path: '/trips' },
    { id: 'create', label: 'Publish a Ride', icon: <Icons.Plus />, path: '/trips/create' },
  ];

  return (
    <SidebarLayout activeTab={activeTab} setActiveTab={setActiveTab} menuItems={menuItems} subtitle="Student Space">
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-gray-100 pb-2">
          <button 
            onClick={() => setActiveTab('passenger')}
            className={`pb-4 px-2 text-sm font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === 'passenger' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Passenger
            {activeTab === 'passenger' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full animate-slide-in" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('driver')}
            className={`pb-4 px-2 text-sm font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === 'driver' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Driver
            {activeTab === 'driver' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full animate-slide-in" />
            )}
          </button>
        </div>

        {loading ? (
          <PageLoader inline />
        ) : (
          <div className="reveal-element">
            {/* Passenger Tab */}
            {activeTab === 'passenger' && (
              <div className="space-y-6">
                {reservations.length > 0 ? (
                  reservations.map((res, index) => (
                    <div 
                      key={res.id} 
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden reveal-element"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <TripRouteMap 
                        departure={res.trip?.departureLocation} 
                        destination={res.trip?.destinationLocation} 
                        height="h-32" 
                      />
                      
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Trip Info */}
                          <div className="flex items-center gap-6">
                            <DateBadge date={res.trip?.departureTime} />
                            
                            <div className="space-y-3">
                              <div className="flex items-center text-xl font-bold text-gray-900">
                                <span>{res.trip?.departureLocation.name}</span>
                                <Icons.ArrowRight />
                                <span>{res.trip?.destinationLocation.name}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <span className="flex items-center gap-2">
                                  <Icons.Clock />
                                  {new Date(res.trip?.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                  {res.seatsReserved} seat{res.seatsReserved > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col lg:items-end gap-4 pt-6 lg:pt-0 border-t lg:border-t-0">
                            <div className="flex items-center justify-between lg:justify-end gap-4 w-full">
                              <StatusBadge status={res.status} />
                              <Link 
                                to={`/trips/${res.trip?.id}`} 
                                className="text-gray-900 font-semibold text-xs uppercase tracking-wider hover:text-blue-600 transition"
                              >
                                View Details →
                              </Link>
                            </div>
                            
                            {res.status === 'ACCEPTED' && (
                              <div className="flex gap-3 w-full lg:w-auto">
                                <button 
                                  onClick={() => contactUser(res.trip.driver)}
                                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition shadow-md"
                                >
                                  <Icons.Phone />
                                  Contact
                                </button>
                                <button 
                                  onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            
                            {res.status === 'PENDING' && (
                              <div className="text-right">
                                <button 
                                  onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                  className="text-gray-400 hover:text-red-600 text-xs font-semibold uppercase tracking-wider transition"
                                >
                                  Cancel Request
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No reservations yet"
                    message="You haven't booked any rides yet. Start exploring available trips!"
                    buttonText="Find a Ride"
                    buttonLink="/trips"
                    icon={Icons.EmptyBox}
                  />
                )}
              </div>
            )}

            {/* Driver Tab */}
            {activeTab === 'driver' && (
              <div className="space-y-8">
                {trips.length > 0 ? (
                  trips.map((trip, index) => (
                    <div 
                      key={trip.id} 
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden reveal-element"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <TripRouteMap 
                        departure={trip.departureLocation} 
                        destination={trip.destinationLocation} 
                        height="h-36" 
                      />
                      
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Trip Header */}
                          <div className="space-y-4">
                            <div className="flex items-center text-2xl font-bold text-gray-900">
                              <span className="text-blue-500 mr-3">
                                <Icons.MapPin />
                              </span>
                              {trip.departureLocation.name}
                              <Icons.ArrowRight />
                              {trip.destinationLocation.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              <span className="flex items-center gap-2">
                                <Icons.Calendar />
                                {new Date(trip.departureTime).toLocaleDateString()} •{' '}
                                {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                {trip.availableSeats} seats available
                              </span>
                            </div>
                          </div>
                          
                          {/* Trip Actions */}
                          <div className="text-right">
                            <StatusBadge status={trip.status} />
                            {trip.status === 'SCHEDULED' && (
                              <div className="flex gap-3 mt-4">
                                <button 
                                  onClick={() => handleUpdateTripStatus(trip.id, 'COMPLETED')}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition shadow-md"
                                >
                                  <Icons.Check />
                                  Complete
                                </button>
                                <button 
                                  onClick={() => handleUpdateTripStatus(trip.id, 'CANCELLED')}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition"
                                >
                                  <Icons.X />
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Passengers Section */}
                      <div className="p-6 bg-gray-50/30">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6 flex items-center">
                          <span className="w-10 h-px bg-gray-200 mr-4"></span>
                          Passengers ({trip.reservations?.length || 0})
                          <span className="flex-1 h-px bg-gray-200 ml-4"></span>
                        </h4>
                        
                        {trip.reservations && trip.reservations.length > 0 ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {trip.reservations.map(res => (
                              <div key={res.id} className="p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-semibold text-sm">
                                      {res.passenger.firstName[0]}{res.passenger.lastName[0]}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 mb-1">
                                        {res.passenger.firstName} {res.passenger.lastName}
                                      </p>
                                      <p className="text-xs text-blue-600 font-semibold">
                                        {res.seatsReserved} seat{res.seatsReserved > 1 ? 's' : ''} requested
                                      </p>
                                    </div>
                                  </div>
                                  <StatusBadge status={res.status} />
                                </div>
                                
                                {res.status === 'PENDING' && trip.status === 'SCHEDULED' && (
                                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <button 
                                      onClick={() => handleUpdateResStatus(res.id, 'ACCEPTED')}
                                      className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-black transition"
                                    >
                                      <Icons.Check />
                                      Accept
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateResStatus(res.id, 'REJECTED')}
                                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-500 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition"
                                    >
                                      <Icons.X />
                                      Reject
                                    </button>
                                  </div>
                                )}

                                {res.status === 'ACCEPTED' && (
                                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <button 
                                      onClick={() => contactUser(res.passenger)}
                                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-blue-100 transition"
                                    >
                                      <Icons.Phone />
                                      Contact
                                    </button>
                                    {trip.status === 'SCHEDULED' && (
                                      <button 
                                        onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-500 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                )}
                                
                                {res.status === 'CANCELLED' && (
                                  <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                    <span className="text-xs font-semibold text-gray-400 flex items-center justify-center gap-2">
                                      <Icons.Info />
                                      Reservation cancelled
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-white rounded-xl border border-gray-50">
                            <Icons.Users />
                            <p className="text-gray-400 font-medium mt-3">No requests yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="Become a Driver"
                    message="Share your rides with other UPF students and earn while helping the community."
                    buttonText="Publish First Trip"
                    buttonLink="/trips/create"
                    icon={Icons.EmptyBox}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        person={contactPerson || {}}
        onConfirm={() => setShowContactModal(false)}
      />

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .reveal-hidden {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </SidebarLayout>
  );
};

export default Dashboard;