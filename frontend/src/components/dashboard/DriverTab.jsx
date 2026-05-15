import React from 'react';
import TripRouteMap from '../TripRouteMap';
import { Icons, StatusBadge, EmptyState } from './DashboardUI';

const DriverTab = ({ trips, onUpdateTripStatus, onUpdateResStatus, onContactUser }) => {
  if (trips.length === 0) {
    return (
      <EmptyState
        title="Become a Driver"
        message="Share your rides with other UPF students and earn while helping the community."
        buttonText="Publish First Trip"
        buttonLink="/trips/create"
        icon={Icons.EmptyBox}
      />
    );
  }

  return (
    <div className="space-y-8">
      {trips.map((trip, index) => (
        <div 
          key={trip.id} 
          className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden reveal-element"
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          <TripRouteMap 
            departure={trip.departureLocation} 
            destination={trip.destinationLocation} 
            height="h-36" 
          />
          
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Trip Header */}
              <div className="space-y-4">
                <div className="flex items-center text-2xl font-bold text-gray-900">
                  <span className="text-blue-500 mr-3">
                    <Icons.MapPin />
                  </span>
                  {trip.departureLocation.name}
                  <Icons.ArrowRight />
                  {trip.destinationLocation.name}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Icons.Calendar />
                    {new Date(trip.departureTime).toLocaleDateString()} •{' '}
                    {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {trip.availableSeats} seats available
                  </span>
                </div>
              </div>
              
              {/* Trip Actions */}
              <div className="text-right">
                <StatusBadge status={trip.status} />
                {trip.status === 'SCHEDULED' && (
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => onUpdateTripStatus(trip.id, 'COMPLETED')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition shadow-md"
                    >
                      <Icons.Check />
                      Complete
                    </button>
                    <button 
                      onClick={() => onUpdateTripStatus(trip.id, 'CANCELLED')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <Icons.X />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Passengers Section */}
          <div className="p-6 bg-gray-50/30">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6 flex items-center">
              <span className="w-10 h-px bg-gray-200 mr-4"></span>
              Passengers ({trip.reservations?.length || 0})
              <span className="flex-1 h-px bg-gray-200 ml-4"></span>
            </h4>
            
            {trip.reservations && trip.reservations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {trip.reservations.map(res => (
                  <div key={res.id} className="p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-semibold text-sm">
                          {res.passenger.firstName[0]}{res.passenger.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            {res.passenger.firstName} {res.passenger.lastName}
                          </p>
                          <p className="text-xs text-blue-600 font-semibold">
                            {res.seatsReserved} seat{res.seatsReserved > 1 ? 's' : ''} requested
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={res.status} />
                    </div>
                    
                    {res.status === 'PENDING' && trip.status === 'SCHEDULED' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => onUpdateResStatus(res.id, 'ACCEPTED')}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-black transition"
                        >
                          <Icons.Check />
                          Accept
                        </button>
                        <button 
                          onClick={() => onUpdateResStatus(res.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-500 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Icons.X />
                          Reject
                        </button>
                      </div>
                    )}

                    {res.status === 'ACCEPTED' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => onContactUser(res.passenger)}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-blue-100 transition"
                        >
                          <Icons.Phone />
                          Contact
                        </button>
                        {trip.status === 'SCHEDULED' && (
                          <button 
                            onClick={() => onUpdateResStatus(res.id, 'CANCELLED')}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-500 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                    
                    {res.status === 'CANCELLED' && (
                      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                        <span className="text-xs font-semibold text-gray-400 flex items-center justify-center gap-2">
                          <Icons.Info />
                          Reservation cancelled
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-50">
                <Icons.Users />
                <p className="text-gray-400 font-medium mt-3">No requests yet</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DriverTab;
