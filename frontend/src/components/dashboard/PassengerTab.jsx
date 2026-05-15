import React from 'react';
import { Link } from 'react-router-dom';
import TripRouteMap from '../TripRouteMap';
import { Icons, StatusBadge, DateBadge, EmptyState } from './DashboardUI';

const PassengerTab = ({ reservations, onUpdateStatus, onContactUser }) => {
  if (reservations.length === 0) {
    return (
      <EmptyState
        title="No reservations yet"
        message="You haven't booked any rides yet. Start exploring available trips!"
        buttonText="Find a Ride"
        buttonLink="/trips"
        icon={Icons.EmptyBox}
      />
    );
  }

  return (
    <div className="space-y-6">
      {reservations.map((res, index) => (
        <div 
          key={res.id} 
          className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden reveal-element"
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          <TripRouteMap 
            departure={res.trip?.departureLocation} 
            destination={res.trip?.destinationLocation} 
            height="h-32" 
          />
          
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Trip Info */}
              <div className="flex items-center gap-6">
                <DateBadge date={res.trip?.departureTime} />
                
                <div className="space-y-3">
                  <div className="flex items-center text-xl font-bold text-gray-900">
                    <span>{res.trip?.departureLocation.name}</span>
                    <Icons.ArrowRight />
                    <span>{res.trip?.destinationLocation.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <Icons.Clock />
                      {new Date(res.trip?.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {res.seatsReserved} seat{res.seatsReserved > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col lg:items-end gap-4 pt-6 lg:pt-0 border-t lg:border-t-0">
                <div className="flex items-center justify-between lg:justify-end gap-4 w-full">
                  <StatusBadge status={res.status} />
                  <Link 
                    to={`/trips/${res.trip?.id}`} 
                    className="text-gray-900 font-semibold text-xs uppercase tracking-wider hover:text-blue-600 transition"
                  >
                    View Details →
                  </Link>
                </div>
                
                {res.status === 'ACCEPTED' && (
                  <div className="flex gap-3 w-full lg:w-auto">
                    <button 
                      onClick={() => onContactUser(res.trip.driver)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition shadow-md"
                    >
                      <Icons.Phone />
                      Contact
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(res.id, 'CANCELLED')}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {res.status === 'PENDING' && (
                  <div className="text-right">
                    <button 
                      onClick={() => onUpdateStatus(res.id, 'CANCELLED')}
                      className="text-gray-400 hover:text-red-600 text-xs font-semibold uppercase tracking-wider transition"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PassengerTab;
