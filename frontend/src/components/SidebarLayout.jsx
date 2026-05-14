import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon, label, id, active, onClick, path }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (path) {
      navigate(path);
    } else {
      onClick(id);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
        active 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-2' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const SidebarLayout = ({ children, activeTab, setActiveTab, menuItems, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-100 w-72 transition-all duration-500 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 z-50 flex flex-col`}>
        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          <Link to="/" className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 hover:scale-105 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </Link>
          <div>
            <h1 className="font-black text-xl text-gray-900 tracking-tight leading-none">UPF-Ride</h1>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1.5">{subtitle || 'Plateforme'}</p>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-3 overflow-y-auto custom-scrollbar">
          {menuItems.map(item => (
            <SidebarItem
              key={item.id}
              {...item}
              active={activeTab === item.id}
              onClick={setActiveTab}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 space-y-3">
          <Link
            to="/account"
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
              location.pathname === '/account' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Mon Profil
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] text-red-500 hover:bg-red-50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1.5">Tableau de bord</h2>
              <p className="text-xl font-black text-gray-900 tracking-tight">
                {title || menuItems.find(i => i.id === activeTab)?.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 uppercase leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-[9px] text-blue-600 uppercase font-black tracking-widest mt-1.5">{user?.role === 'ADMIN' ? 'Administrateur' : 'Étudiant'}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-10 bg-[#fcfcfd]">
          <div className="max-w-7xl mx-auto pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
