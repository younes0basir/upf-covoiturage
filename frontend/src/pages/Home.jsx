import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../api/tripService';
import PageLoader from '../components/PageLoader';

/**
 * UPF RIDE HOMEPAGE - PREMIUM ACADEMIC VERSION
 * Style: Academic & Professional (MIT/Stanford inspired)
 */

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

const Home = () => {
  const { user } = useAuth();
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useReveal(loading);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await tripService.searchTrips({ limit: 3 });
        setRecentTrips(data || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* HERO SECTION */}
        <header className="relative min-h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop"
              alt="UPF Campus"
              className="w-full h-full object-cover animate-float"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-white backdrop-blur-[1px]"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto pt-20">
            <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] uppercase font-black tracking-[0.3em] rounded-full mb-8 reveal-element">
              Université Privée de Fès
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-semibold text-white leading-[1.05] mb-6 max-w-5xl mx-auto drop-shadow-2xl reveal-element delay-100 tracking-tight">
              La mobilité étudiante.<br />
              <span className="text-blue-400 italic">Simplifiée.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow reveal-element delay-200 font-medium">
              Rejoignez la plateforme officielle de covoiturage de l'UPF. 
              Une solution sécurisée pour connecter les étudiants et faciliter vos trajets.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 reveal-element delay-300">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-10 py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-black/20"
                >
                  Mon Tableau de Bord
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                  >
                    Démarrer l'Aventure
                  </Link>
                  <Link
                    to="/login"
                    className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all active:scale-95"
                  >
                    Se Connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* MISSION STRIP */}
        <section className="bg-[#f8fafc] py-24 px-6 border-y border-slate-100">
          <div className="max-w-7xl mx-auto reveal-element">
            <div className="grid md:grid-cols-[200px_1fr] gap-12 items-start">
              <div className="text-7xl md:text-9xl font-black text-blue-100/80 leading-none select-none">
                01
              </div>
              <div className="max-w-3xl">
                <p className="text-2xl md:text-4xl font-medium text-slate-800 leading-tight italic tracking-tight">
                  "Notre mission est de renforcer l'esprit communautaire de l'UPF tout en offrant une alternative de transport durable et économique pour chaque étudiant."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT TRIPS SECTION */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="reveal-element">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] font-black text-blue-600 border-b-2 border-blue-600 pb-2">
                  Trajets Disponibles
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-6 tracking-tighter">Prochains départs.</h2>
              </div>
              <Link to="/trips" className="hidden md:block text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                Voir tous les trajets →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-10 mb-16">
              {recentTrips.length > 0 ? (
                recentTrips.map((trip, i) => (
                  <Link
                    key={trip.id}
                    to={`/trips/${trip.id}`}
                    className="group flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 reveal-element"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {/* Trip Info Header */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop`}
                        alt="Trip"
                        className="w-full h-full object-cover ken-burns"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                          {trip.totalPrice} DH
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black border border-blue-100">
                          {trip.driverName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conducteur</p>
                          <p className="text-sm font-bold text-slate-800">{trip.driverName || 'Étudiant UPF'}</p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5"></div>
                          <p className="text-sm font-semibold text-slate-600 line-clamp-1">{trip.departureLocationName}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>
                          <p className="text-sm font-semibold text-slate-600 line-clamp-1">{trip.destinationLocationName}</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(trip.departureTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-blue-600 font-black text-[11px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                          Réserver →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">Aucun trajet disponible pour le moment.</p>
                  <Link to="/trips" className="text-blue-600 font-bold mt-4 inline-block hover:underline italic">Commencer une recherche</Link>
                </div>
              )}
            </div>

            <Link to="/trips" className="md:hidden block text-center text-blue-600 font-black text-xs uppercase tracking-widest py-4 bg-slate-50 rounded-2xl">
              Voir tous les trajets →
            </Link>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="bg-slate-900 py-24 px-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
            {[
              { label: 'Utilisateurs', value: '500+' },
              { label: 'Trajets', value: '1.2k' },
              { label: 'Campus', value: 'Fès' },
              { label: 'Sécurité', value: '100%' },
            ].map((stat, i) => (
              <div key={i} className="reveal-element text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                <p className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* JOIN THE COMMUNITY CTA */}
        <section className="bg-white py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto reveal-element">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-8 inline-block">Rejoignez-nous</span>
            <h2 className="text-4xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tighter leading-[0.9]">
              Faites partie d'une mobilité intelligente.
            </h2>
            <p className="text-slate-500 text-lg md:text-2xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
              Nous construisons une communauté où chaque trajet est une opportunité de partage et d'économie.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/register"
                className="px-12 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-2xl shadow-blue-600/20"
              >
                Créer mon compte
              </Link>
              <Link
                to="/trips"
                className="px-12 py-5 bg-white border-2 border-slate-100 text-slate-800 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
              >
                Explorer les trajets
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
