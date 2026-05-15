import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { tripService } from '../api/tripService';

// --- REVEAL HOOK ---
const useReveal = (dep) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-hidden');
        }
      });
    }, { threshold: 0.05 });
    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => { el.classList.add('reveal-hidden'); observer.observe(el); });
    return () => observer.disconnect();
  }, [dep]);
};

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
  </svg>
);

const TripSearch = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ from: '', to: '', date: '', seats: '' });

  useReveal(loading);

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const results = await tripService.searchTrips({});
      setTrips(results || []);
    } catch (err) {
      console.error('Search failed', err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const fromQ = searchParams.from.toLowerCase();
    const toQ = searchParams.to.toLowerCase();
    const fromMatch = !fromQ ||
      trip.departureLocation?.name?.toLowerCase().includes(fromQ) ||
      trip.departureLocation?.city?.toLowerCase().includes(fromQ);
    const toMatch = !toQ ||
      trip.destinationLocation?.name?.toLowerCase().includes(toQ) ||
      trip.destinationLocation?.city?.toLowerCase().includes(toQ);
    const dateMatch = !searchParams.date ||
      new Date(trip.departureTime).toDateString() === new Date(searchParams.date).toDateString();
    const seatsMatch = !searchParams.seats || trip.availableSeats >= parseInt(searchParams.seats);
    return fromMatch && toMatch && dateMatch && seatsMatch;
  });

  const handleReset = () => setSearchParams({ from: '', to: '', date: '', seats: '' });

  return (
    <Layout>
      <div className="min-h-screen bg-white">

        {/* ── PAGE HEADER ── */}
        <div className="border-b border-gray-100 pt-28 pb-12 px-6">
          <div className="max-w-5xl mx-auto">
            {/* Back link */}
            <Link to="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors mb-8 group">
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l'accueil
            </Link>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                Covoiturage
              </span>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                UPF-Ride
              </span>
              {!loading && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <UserIcon />
                  {filteredTrips.length} trajet{filteredTrips.length !== 1 ? 's' : ''} disponible{filteredTrips.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tight leading-[1.05] mb-4">
              Rechercher un trajet.
            </h1>
            <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
              Parcourez les trajets publiés par les étudiants de l'UPF. Filtrez, comparez, et réservez en quelques clics.
            </p>
          </div>
        </div>

        {/* ── SEARCH FILTERS ── */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap md:flex-nowrap items-end gap-3">
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Départ
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fès..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                  value={searchParams.from}
                  onChange={e => setSearchParams(p => ({ ...p, from: e.target.value }))}
                />
              </div>

              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rabat..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                  value={searchParams.to}
                  onChange={e => setSearchParams(p => ({ ...p, to: e.target.value }))}
                />
              </div>

              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                  value={searchParams.date}
                  onChange={e => setSearchParams(p => ({ ...p, date: e.target.value }))}
                />
              </div>

              <div className="w-28">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Places
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  placeholder="1"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                  value={searchParams.seats}
                  onChange={e => setSearchParams(p => ({ ...p, seats: e.target.value }))}
                />
              </div>

              {(searchParams.from || searchParams.to || searchParams.date || searchParams.seats) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors border border-gray-200 bg-white rounded-xl"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── TRIP LISTING ── */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-gray-100 border-t-gray-900 rounded-full animate-spin mb-5" />
              <p className="text-gray-400 text-sm font-medium">Chargement des trajets...</p>
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredTrips.map((trip, i) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 hover:bg-gray-50 -mx-4 px-4 rounded-2xl transition-colors duration-200 reveal-element"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {/* LEFT: Route & Meta */}
                  <div className="flex-grow">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                        {trip.availableSeats} place{trip.availableSeats !== 1 ? 's' : ''} libre{trip.availableSeats !== 1 ? 's' : ''}
                      </span>
                      {trip.status === 'SCHEDULED' && (
                        <span className="inline-flex items-center bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-green-100">
                          Disponible
                        </span>
                      )}
                    </div>

                    {/* Main route title */}
                    <h2 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight mb-2 group-hover:text-blue-700 transition-colors duration-200">
                      {trip.departureLocation?.name}
                      <span className="text-gray-300 mx-3 font-light">→</span>
                      {trip.destinationLocation?.name}
                    </h2>

                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon />
                        {new Date(trip.departureTime).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long'
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ClockIcon />
                        {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <UserIcon />
                        {trip.driver?.firstName} {trip.driver?.lastName}
                        {trip.driver?.averageRating > 0 && (
                          <span className="text-amber-400 ml-1">
                            {'★'.repeat(Math.round(trip.driver.averageRating))}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: Price & CTA */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-3xl font-black text-gray-950 tracking-tight tabular-nums leading-none">
                        {trip.totalPrice}
                        <span className="text-base font-semibold text-gray-400 ml-1">DH</span>
                      </p>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-1">par personne</p>
                    </div>
                    <div className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200">
                      <ArrowRight />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="py-32 text-center reveal-element">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-950 tracking-tight mb-2">Aucun trajet trouvé.</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
                Aucun trajet ne correspond à vos critères. Essayez de modifier vos filtres.
              </p>
              <button
                onClick={handleReset}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default TripSearch;
