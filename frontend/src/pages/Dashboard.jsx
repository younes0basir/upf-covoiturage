import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../api/tripService';
import { reservationService } from '../api/reservationService';
import SidebarLayout from '../components/SidebarLayout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageLoader from '../components/PageLoader';

// Modular Components
import { Icons, ContactModal } from '../components/dashboard/DashboardUI';
import PassengerTab from '../components/dashboard/PassengerTab';
import DriverTab from '../components/dashboard/DriverTab';
import AccountTab from '../components/dashboard/AccountTab';
import ChatWindow from '../components/dashboard/ChatWindow';

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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('passenger');
  const [contactPerson, setContactPerson] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  useReveal(loading);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const [myRes, myTrips] = await Promise.all([
        reservationService.getMyReservations(),
        tripService.getMyTrips().catch(() => [])
      ]);
      const sortedRes = [...myRes].sort((a, b) => 
        new Date(b.trip?.departureTime) - new Date(a.trip?.departureTime)
      );
      setReservations(sortedRes);
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

    // Refresh when AI agent creates a trip
    const handleTripCreated = () => {
      fetchData(false);
      setActiveTab('driver'); // Switch to Driver tab automatically
    };
    window.addEventListener('omni:trip-created', handleTripCreated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('omni:trip-created', handleTripCreated);
    };
  }, [fetchData]);

  const handleUpdateResStatus = async (resId, status) => {
    const confirmMessages = {
      CANCELLED: 'Are you sure you want to cancel this reservation?',
      ACCEPTED: 'Are you sure you want to accept this reservation?',
      REJECTED: 'Are you sure you want to reject this reservation?'
    };
    
    const execute = async () => {
      try {
        await reservationService.updateStatus(resId, status);
        await fetchData(false);
        toast.success('Reservation updated successfully');
      } catch (err) {
        console.error('Error updating reservation', err);
        toast.error(err.response?.data?.message || 'Error updating reservation');
      }
    };

    if (confirmMessages[status]) {
      toast.confirm(confirmMessages[status], execute);
    } else {
      execute();
    }
  };

  const handleOpenChat = (trip) => {
    setActiveChat({
      id: trip.id,
      title: `${trip.departureLocation.name} → ${trip.destinationLocation.name}`
    });
  };

  const handleUpdateTripStatus = async (tripId, status) => {
    const confirmMessages = {
      COMPLETED: 'Mark this trip as completed?',
      CANCELLED: 'Cancel this entire trip? This will affect all passengers.'
    };
    
    const execute = async () => {
      try {
        await tripService.updateTripStatus(tripId, status);
        await fetchData(false);
        toast.success('Trip updated successfully');
      } catch (err) {
        console.error('Error updating trip', err);
        toast.error(err.response?.data?.message || 'Error updating trip');
      }
    };
    
    toast.confirm(confirmMessages[status], execute);
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

  const getTitle = () => {
    if (activeTab === 'account') return 'Account Settings';
    const item = menuItems.find(i => i.id === activeTab);
    return item ? item.label : 'Dashboard';
  };

  return (
    <SidebarLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      menuItems={menuItems} 
      title={getTitle()}
      subtitle="Student Space"
      onAccountClick={setActiveTab}
    >
      <div className="space-y-8">
        {/* Tab Navigation */}
        {activeTab !== 'account' && (
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
        )}

        {loading ? (
          <PageLoader inline />
        ) : (
          <div className="reveal-element">
            {activeTab === 'passenger' && (
              <PassengerTab 
                reservations={reservations} 
                onUpdateStatus={handleUpdateResStatus} 
                onContactUser={contactUser} 
                onOpenChat={handleOpenChat}
              />
            )}
            {activeTab === 'driver' && (
              <DriverTab 
                trips={trips} 
                onUpdateTripStatus={handleUpdateTripStatus} 
                onUpdateResStatus={handleUpdateResStatus} 
                onContactUser={contactUser} 
                onOpenChat={handleOpenChat}
              />
            )}
            {activeTab === 'account' && (
              <AccountTab />
            )}
          </div>
        )}
      </div>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        person={contactPerson || {}}
        onConfirm={() => setShowContactModal(false)}
      />

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .reveal-hidden {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }
      `}</style>
      {activeChat && (
        <ChatWindow 
          tripId={activeChat.id}
          tripTitle={activeChat.title}
          onClose={() => setActiveChat(null)}
        />
      )}
    </SidebarLayout>
  );
};

export default Dashboard;