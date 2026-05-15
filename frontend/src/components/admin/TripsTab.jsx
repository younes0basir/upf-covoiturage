import React from 'react';
import { StatusBadge, ActionButton } from './AdminUI';

const TripsTab = ({ trips, filter, onFilterChange, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">All Trips</h3>
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
        >
          <option value="all">All Trips</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trips.map(trip => (
              <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 text-sm mb-1 leading-none">
                    {trip.departureLocation.city} → {trip.destinationLocation.city}
                  </p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{trip.totalPrice} DH • {trip.availableSeats} seats left</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-600">{trip.driver.firstName} {trip.driver.lastName}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-500">
                    {new Date(trip.departureTime).toLocaleString('fr-FR')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={trip.status} />
                </td>
                <td className="px-6 py-4">
                  <ActionButton
                    onClick={() => onDelete(trip.id)}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>}
                    label="Delete trip"
                    variant="delete"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripsTab;
