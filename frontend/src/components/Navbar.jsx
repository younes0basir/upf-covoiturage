import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive ? 'text-gray-950' : 'text-gray-400 hover:text-gray-950'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] bg-white transition-all duration-300 ${
      scrolled ? 'border-b border-gray-100 shadow-sm' : 'border-b border-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── LOGO ── */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gray-950 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-700 transition-colors duration-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="leading-none">
            <span className="text-sm font-black text-gray-950 tracking-tight uppercase">UPF</span>
            <span className="text-sm font-black text-blue-700 tracking-tight uppercase"> RIDE</span>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
              Portail Étudiant
            </p>
          </div>
        </Link>

        {/* ── NAV LINKS ── */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>Accueil</NavLink>
          <NavLink to="/trips" className={navLinkClass}>Rechercher</NavLink>
          {user && (
            <>
              <NavLink to="/trips/create" className={navLinkClass}>Publier</NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>Mon espace</NavLink>
              {user.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `text-sm font-semibold transition-colors duration-200 ${
                      isActive ? 'text-red-600' : 'text-red-400 hover:text-red-600'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* ── USER ACTIONS ── */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-xs text-gray-700 group-hover:bg-gray-200 transition-colors duration-200">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-700 group-hover:text-gray-950 transition-colors duration-200">
                  {user.firstName}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                title="Déconnexion"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-500 hover:text-gray-950 transition-colors duration-200"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
