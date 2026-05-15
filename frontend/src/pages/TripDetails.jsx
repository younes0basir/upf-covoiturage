import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tripService } from '../api/tripService';
import { reservationService } from '../api/reservationService';
import SidebarLayout from '../components/SidebarLayout';
import Layout from '../components/Layout';
import TripRouteMap from '../components/TripRouteMap';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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

// --- Icons ---
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
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  CarIcon: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  )
};

// --- Reusable Components ---
const StatusBadge = ({ status }) => {
  const config = {
    OPEN: { label: 'Available', color: 'bg-green-50 text-green-700 border-green-200' },
    SCHEDULED: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    COMPLETED: { label: 'Completed', color: 'bg-gray-50 text-gray-600 border-gray-200' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' }
  };

  const { label, color } = config[status] || config.OPEN;
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
};

const RouteTimeline = ({ departure, destination, departureTime, estimatedDuration }) => {
  const formattedDate = new Date(departureTime);
  
  return (
    <div className="flex items-start space-x-6 mb-10">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white" />
        <div className="w-px h-28 bg-gray-100 my-2" />
        <div className="w-3 h-3 rounded-full bg-gray-900" />
      </div>
      <div className="flex-grow space-y-16 pt-1">
        <div>
          <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-1">
            {departure.name}
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Icons.Calendar />
              {formattedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </span>
            <span className="flex items-center gap-1">
              <Icons.Clock />
              {formattedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-1">
            {destination.name}
          </p>
          <p className="text-sm text-gray-500">
            Estimated arrival: {estimatedDuration ? `${estimatedDuration} min` : 'Based on traffic'}
          </p>
        </div>
      </div>
    </div>
  );
};

const VehicleCard = ({ vehicle }) => (
  <div className="border-t border-gray-100 pt-8">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
      Vehicle & Comfort
    </h3>
    <div className="flex items-center gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
      <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 border border-gray-100">
        <Icons.CarIcon />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 leading-none mb-1">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="text-sm text-gray-500">
          {vehicle.color} • {vehicle.seats} total seats
        </p>
      </div>
    </div>
  </div>
);

const DriverCard = ({ driver }) => (
  <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center font-bold text-2xl border border-white/10 group-hover:scale-110 transition-transform">
          {driver.firstName?.[0]}{driver.lastName?.[0]}
        </div>
        <div>
          <p className="text-xl font-bold leading-none mb-1 tracking-tight">
            {driver.firstName} {driver.lastName}
          </p>
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
            Verified Driver
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 p-4 rounded-xl text-center backdrop-blur-sm border border-white/5">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icons.Star />
            <p className="text-xl font-bold text-yellow-400 tabular-nums">
              {driver.averageRating?.toFixed(1) || '—'}
            </p>
          </div>
          <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
            Rating
          </p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl text-center backdrop-blur-sm border border-white/5">
          <p className="text-xl font-bold text-white tabular-nums">
            {driver.totalRides || 0}
          </p>
          <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
            Trips
          </p>
        </div>
      </div>
    </div>
  </div>
);

const BookingCard = ({ trip, seats, setSeats, onBook, reserving }) => {
  const genderPreference = {
    ANY: 'Mixed',
    FEMALE_ONLY: 'Women only'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
      <div className="text-center mb-6">
        <p className="text-4xl font-bold text-gray-900 tracking-tight">
          {trip.totalPrice}
          <span className="text-lg text-gray-400 ml-1">DH</span>
        </p>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-2">
          Fixed price
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-900">{trip.availableSeats}</p>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
            Available
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
          <p className="text-xs font-semibold text-gray-900 uppercase">
            {genderPreference[trip.passengerGenderPreference] || 'Mixed'}
          </p>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
            Passengers
          </p>
        </div>
      </div>

      {trip.availableSeats > 0 && (
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
            Book seats
          </label>
          <div className="relative">
            <select 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-900 appearance-none"
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
            >
              {[...Array(Math.min(trip.availableSeats, 8))].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {i+1} seat{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Icons.ChevronDown />
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={onBook}
        disabled={reserving || trip.availableSeats === 0}
        className={`
          w-full py-4 rounded-xl font-bold text-base transition-all transform active:scale-95
          ${trip.availableSeats === 0 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl'
          }
        `}
      >
        {reserving ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : trip.availableSeats === 0 ? (
          'Fully Booked'
        ) : (
          'Book Now'
        )}
      </button>
    </div>
  );
};

const GuestCTA = () => (
  <div className="mt-10 max-w-5xl mx-auto">
    <div className="bg-gray-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <p className="text-white font-bold text-xl mb-1">Ready to book this ride?</p>
        <p className="text-gray-400 text-sm">Create an account or sign in to continue.</p>
      </div>
      <div className="flex gap-3 shrink-0">
        <Link 
          to="/login" 
          className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition active:scale-95"
        >
          Sign In
        </Link>
        <Link 
          to="/register" 
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition active:scale-95"
        >
          Sign Up
        </Link>
      </div>
    </div>
  </div>
);

const NotesCard = ({ notes }) => (
  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 reveal-element">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
      Driver's Notes
    </h3>
    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 text-gray-700 leading-relaxed font-medium italic text-base">
      "{notes || 'No additional notes for this trip.'}"
    </div>
  </div>
);

// --- Main Component ---
const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState(null);

  useReveal(loading);

  const menuItems = [
    { id: 'passenger', label: 'My Reservations', icon: <Icons.Passenger />, path: '/dashboard' },
    { id: 'driver', label: 'My Trips', icon: <Icons.Car />, path: '/dashboard' },
    { id: 'search', label: 'Find a Ride', icon: <Icons.Search />, path: '/trips' },
    { id: 'create', label: 'Publish a Ride', icon: <Icons.Plus />, path: '/trips/create' },
  ];

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await tripService.getById(id);
        setTrip(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch trip", err);
        setError("Trip not found");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrip();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setReserving(true);
    try {
      await reservationService.create({ tripId: id, seatsReserved: seats });
      toast.success('Your reservation request has been sent!', 'Booking confirmed');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book the trip.', 'Booking failed');
    } finally {
      setReserving(false);
    }
  };

  // Context-aware wrapper
  const Wrapper = user
    ? ({ children }) => (
        <SidebarLayout 
          menuItems={menuItems} 
          activeTab="search" 
          title="Trip Details" 
          subtitle="Booking"
        >
          {children}
        </SidebarLayout>
      )
    : ({ children }) => <Layout>{children}</Layout>;

  if (loading) return <PageLoader />;

  if (error || !trip) {
    return (
      <Wrapper>
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
            <p className="text-gray-500 mb-6">The trip you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/trips" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition"
            >
              Browse Trips
              <Icons.ArrowRight />
            </Link>
          </div>
        </div>
      </Wrapper>
    );
  }

  const isDriver = user && trip.driver?.id === user.id;

  return (
    <Wrapper>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Back Button */}
        <Link 
          to="/trips" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 reveal-element">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Route Details
                </h1>
                <StatusBadge status={trip.status} />
              </div>

              <RouteTimeline 
                departure={trip.departureLocation}
                destination={trip.destinationLocation}
                departureTime={trip.departureTime}
                estimatedDuration={trip.estimatedDurationMinutes}
              />

              {/* Interactive Route Map */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-100">
                <TripRouteMap
                  departure={trip.departureLocation}
                  destination={trip.destinationLocation}
                  height="h-64"
                />
              </div>

              <VehicleCard vehicle={trip.vehicle} />
            </div>

            {/* Driver Notes */}
            <NotesCard notes={trip.notes} />

            {/* Driver Info for Guests */}
            {!user && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 reveal-element">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                  About the Driver
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                    {trip.driver.firstName?.[0]}{trip.driver.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {trip.driver.firstName} {trip.driver.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Icons.Star />
                        <span className="text-sm font-medium text-gray-700">
                          {trip.driver.averageRating?.toFixed(1) || 'New'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {trip.driver.totalRides || 0} trips
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {!isDriver && (
              <BookingCard 
                trip={trip}
                seats={seats}
                setSeats={setSeats}
                onBook={handleBook}
                reserving={reserving}
              />
            )}
            
            {user && !isDriver && (
              <DriverCard driver={trip.driver} />
            )}
          </div>
        </div>

        {/* Guest CTA */}
        {!user && <GuestCTA />}
      </div>
    </Wrapper>
  );
};

export default TripDetails;