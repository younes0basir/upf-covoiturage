import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Reusable Components ---
const SidebarItem = ({ icon, label, id, active, onClick, path, badge }) => {
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
      className={`
        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl 
        text-sm font-medium transition-all duration-200 group
        ${active 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-200' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`
          px-2 py-0.5 text-xs font-semibold rounded-full
          ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
        `}>
          {badge}
        </span>
      )}
    </button>
  );
};

const UserMenu = ({ user, onLogout, onAccountClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl flex items-center justify-center font-semibold text-sm shadow-md">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
        </div>
        <svg className="hidden md:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
            </div>
            {onAccountClick ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onAccountClick('account');
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Account Settings
              </button>
            ) : (
              <Link
                to="/account"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Account Settings
              </Link>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const MobileMenuButton = ({ onClick }) => (
  <button 
    onClick={onClick} 
    className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
  >
    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
);

// --- Main Layout Component ---
const SidebarLayout = ({ children, activeTab, setActiveTab, menuItems, title, subtitle, onAccountClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentMenuItem = menuItems.find(i => i.id === activeTab);
  const isAccountActive = activeTab === 'account' || location.pathname === '/account';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white shadow-xl z-50 flex flex-col
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:translate-x-0
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 tracking-tight">UPF Ride</h1>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
                {subtitle || 'Student Portal'}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map(item => (
            <SidebarItem
              key={item.id}
              {...item}
              active={activeTab === item.id}
              onClick={setActiveTab}
            />
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {onAccountClick ? (
            <button
              onClick={() => onAccountClick('account')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isAccountActive 
                  ? 'bg-gray-900 text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </button>
          ) : (
            <Link
              to="/account"
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isAccountActive 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
              <div className="hidden md:block">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dashboard
                </h2>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                  {title || currentMenuItem?.label || 'Overview'}
                </p>
              </div>
            </div>

            <UserMenu user={user} onLogout={handleLogout} onAccountClick={onAccountClick} />
          </div>

          {/* Mobile Title */}
          <div className="md:hidden px-6 pb-4">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {title || currentMenuItem?.label || 'Overview'}
            </h2>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default SidebarLayout;