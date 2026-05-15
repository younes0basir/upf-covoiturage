import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../api/tripService';

// --- Icons ---
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
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
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

// --- Custom Hooks ---
const useReveal = (dep) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-hidden');
        }
      });
    }, { threshold: 0.05, rootMargin: '20px' });
    
    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => { 
      el.classList.add('reveal-hidden'); 
      observer.observe(el); 
    });
    
    return () => observer.disconnect();
  }, [dep]);
};

// --- Reusable Components ---
const SearchInput = ({ icon: Icon, placeholder, value, onChange }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon />
    </div>
    <input
      type="text"
      placeholder={placeholder}
      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
      value={value}
      onChange={onChange}
    />
  </div>
);

const FilterBadge = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
    {label}
    <button onClick={onRemove} className="hover:text-blue-900 transition-colors">
      <Icons.X />
    </button>
  </span>
);

const TripCard = ({ trip, index }) => {
  const departureDate = new Date(trip.departureTime);
  const formattedDate = departureDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const formattedTime = departureDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 hover:bg-gray-50 -mx-4 px-4 rounded-2xl transition-all duration-300 reveal-element"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="flex-grow">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-100">
            {trip.availableSeats} seat{trip.availableSeats !== 1 ? 's' : ''} available
          </span>
          {trip.status === 'SCHEDULED' && (
            <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
              Available
            </span>
          )}
        </div>

        {/* Route */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
          {trip.departureLocation?.name}
          <span className="text-gray-300 mx-3 font-light">→</span>
          {trip.destinationLocation?.name}
        </h2>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
          <span className="flex items-center gap-1.5">
            <Icons.Calendar />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Icons.Clock />
            {formattedTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Icons.User />
            {trip.driver?.firstName} {trip.driver?.lastName}
          </span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900 tracking-tight leading-none">
            {trip.totalPrice}
            <span className="text-base font-semibold text-gray-400 ml-1">DH</span>
          </p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
            per person
          </p>
        </div>
        <div className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200">
          <Icons.ArrowRight />
        </div>
      </div>
    </Link>
  );
};

const EmptyState = ({ onReset }) => (
  <div className="py-32 text-center reveal-element">
    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
      <Icons.Search />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
      No trips found
    </h3>
    <p className="text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
      Try adjusting your filters to see more results.
    </p>
    <button 
      onClick={onReset} 
      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
    >
      Reset all filters
    </button>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-32">
    <div className="w-10 h-10 border-3 border-gray-100 border-t-gray-900 rounded-full animate-spin mb-4" />
    <p className="text-gray-400 text-sm font-medium">Loading trips...</p>
  </div>
);

// --- Main Component ---
const TripSearch = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ 
    from: '', 
    to: '', 
    date: '', 
    seats: '' 
  });
  const [showFilters, setShowFilters] = useState(false);

  const studentMenuItems = [
    { id: 'passenger', label: 'My Reservations', icon: <Icons.Passenger />, path: '/dashboard' },
    { id: 'driver', label: 'My Trips', icon: <Icons.Car />, path: '/dashboard' },
    { id: 'search', label: 'Find a Ride', icon: <Icons.Search />, path: '/trips' },
    { id: 'create', label: 'Publish a Ride', icon: <Icons.Plus />, path: '/trips/create' },
  ];

  useReveal(loading);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tripService.getAllTrips();
      setTrips(data || []);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleReset = () => {
    setSearchParams({ from: '', to: '', date: '', seats: '' });
  };

  const handleRemoveFilter = (filterKey) => {
    setSearchParams(prev => ({ ...prev, [filterKey]: '' }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(searchParams).filter(v => v).length;
  };

  const filteredTrips = trips.filter(trip => {
    const matchFrom = !searchParams.from || 
      trip.departureLocation.city.toLowerCase().includes(searchParams.from.toLowerCase()) || 
      trip.departureLocation.name.toLowerCase().includes(searchParams.from.toLowerCase());
    
    const matchTo = !searchParams.to || 
      trip.destinationLocation.city.toLowerCase().includes(searchParams.to.toLowerCase()) || 
      trip.destinationLocation.name.toLowerCase().includes(searchParams.to.toLowerCase());
    
    const matchDate = !searchParams.date || 
      new Date(trip.departureTime).toLocaleDateString() === new Date(searchParams.date).toLocaleDateString();
    
    const matchSeats = !searchParams.seats || 
      trip.availableSeats >= parseInt(searchParams.seats);
    
    return matchFrom && matchTo && matchDate && matchSeats;
  });

  const activeFilters = [
    searchParams.from && { key: 'from', label: `From: ${searchParams.from}` },
    searchParams.to && { key: 'to', label: `To: ${searchParams.to}` },
    searchParams.date && { key: 'date', label: `Date: ${new Date(searchParams.date).toLocaleDateString()}` },
    searchParams.seats && { key: 'seats', label: `${searchParams.seats}+ seats` }
  ].filter(Boolean);

  const mainContent = (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="border-b border-gray-100 py-12 reveal-element">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                Find Your Ride
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                Discover your <br /> next{' '}
                <span className="text-blue-600">journey.</span>
              </h1>
            </div>
            
            {/* Search Inputs */}
            <div className="flex flex-wrap items-end gap-3 flex-1">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Departure
                </label>
                <SearchInput
                  icon={Icons.MapPin}
                  placeholder="City or address"
                  value={searchParams.from}
                  onChange={e => setSearchParams(p => ({ ...p, from: e.target.value }))}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Destination
                </label>
                <SearchInput
                  icon={Icons.MapPin}
                  placeholder="City or address"
                  value={searchParams.to}
                  onChange={e => setSearchParams(p => ({ ...p, to: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icons.Filter />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3">
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={handleReset}
                  className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    value={searchParams.date}
                    onChange={e => setSearchParams(p => ({ ...p, date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Minimum Seats
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    value={searchParams.seats}
                    onChange={e => setSearchParams(p => ({ ...p, seats: e.target.value }))}
                  >
                    <option value="">Any</option>
                    <option value="1">1+ seats</option>
                    <option value="2">2+ seats</option>
                    <option value="3">3+ seats</option>
                    <option value="4">4+ seats</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Badges */}
          {activeFilters.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <FilterBadge
                  key={filter.key}
                  label={filter.label}
                  onRemove={() => handleRemoveFilter(filter.key)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <LoadingState />
        ) : filteredTrips.length > 0 ? (
          <>
            <div className="mb-6 text-sm text-gray-500">
              Found {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
            </div>
            <div className="divide-y divide-gray-100">
              {filteredTrips.map((trip, index) => (
                <TripCard key={trip.id} trip={trip} index={index} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState onReset={handleReset} />
        )}
      </div>
    </div>
  );

  // Render with appropriate layout based on user role
  if (user?.role === 'STUDENT') {
    return (
      <SidebarLayout 
        activeTab="search" 
        setActiveTab={() => {}} 
        menuItems={studentMenuItems} 
        subtitle="Student Portal"
      >
        {mainContent}
      </SidebarLayout>
    );
  }

  return <Layout>{mainContent}</Layout>;
};

export default TripSearch;