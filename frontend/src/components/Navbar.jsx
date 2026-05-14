import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => 
    `text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
      isActive 
        ? 'text-blue-600' 
        : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm py-3' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <span className="text-xl font-black text-gray-900 tracking-tighter">UPF<span className="text-blue-600">RIDE</span></span>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Plateforme Étudiante</p>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-10">
            <NavLink to="/" className={navLinkClass}>Accueil</NavLink>
            <NavLink to="/trips" className={navLinkClass}>Chercher</NavLink>
            {user && (
              <>
                <NavLink to="/trips/create" className={navLinkClass}>Publier</NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>Espace Étudiant</NavLink>
                {user.role === 'ADMIN' && (
                  <NavLink to="/admin" className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600 hover:text-red-700">Admin</NavLink>
                )}
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/account" className="flex items-center gap-3 group">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Mon Compte</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all"
                  title="Déconnexion"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-gray-900 hover:text-blue-600 transition">Connexion</Link>
                <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100 transform active:scale-95">
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
