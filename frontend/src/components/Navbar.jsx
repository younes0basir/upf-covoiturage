import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => 
    `text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 ${
      isActive 
        ? 'text-blue-600' 
        : scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-white/80 hover:text-white'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm' 
        : 'bg-transparent py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-8 md:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
              scrolled ? 'bg-slate-900 text-white' : 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
            } shadow-lg group-hover:scale-110`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <span className={`text-xl font-bold tracking-tighter transition-colors duration-500 ${
                scrolled ? 'text-slate-900' : 'text-white'
              }`}>UPF<span className="text-blue-500 italic">RIDE</span></span>
              <p className={`text-[8px] font-bold uppercase tracking-[0.3em] leading-none mt-1 transition-colors duration-500 ${
                scrolled ? 'text-slate-400' : 'text-white/50'
              }`}>Portail Étudiant</p>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-12">
            <NavLink to="/" className={navLinkClass}>Accueil</NavLink>
            <NavLink to="/trips" className={navLinkClass}>Rechercher</NavLink>
            {user && (
              <>
                <NavLink to="/trips/create" className={navLinkClass}>Publier</NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>Espace UPF</NavLink>
                {user.role === 'ADMIN' && (
                  <NavLink to="/admin" className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 hover:text-red-600">Administration</NavLink>
                )}
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/account" className="flex items-center gap-4 group">
                  <div className="text-right hidden sm:block">
                    <p className={`text-[10px] font-bold uppercase leading-none transition-colors duration-500 ${
                      scrolled ? 'text-slate-900' : 'text-white'
                    }`}>{user.firstName} {user.lastName}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 transition-colors duration-500 ${
                      scrolled ? 'text-slate-400' : 'text-white/50'
                    }`}>Mon Profil</p>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${
                    scrolled ? 'bg-slate-50 text-slate-900 border-white' : 'bg-white/10 text-white border-white/20 backdrop-blur-md'
                  } group-hover:scale-105 shadow-sm`}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    scrolled ? 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                  title="Déconnexion"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  scrolled ? 'text-slate-900 hover:text-blue-600' : 'text-white hover:text-blue-400'
                }`}>Connexion</Link>
                <Link to="/register" className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-lg transform active:scale-95 ${
                  scrolled ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-black/10'
                }`}>
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
