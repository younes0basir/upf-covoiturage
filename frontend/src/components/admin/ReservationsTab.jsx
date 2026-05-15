import React from 'react';
import { StatusBadge, ActionButton } from './AdminUI';

const ReservationsTab = ({ reservations, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Passenger</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trip Details</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seats</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations.map(res => (
              <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 text-sm">
                    {res.passenger.firstName} {res.passenger.lastName}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1 leading-none">
                    {res.trip.departureLocation.city} → {res.trip.destinationLocation.city}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {new Date(res.trip.departureTime).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                    {res.seatsReserved}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={res.status} />
                </td>
                <td className="px-6 py-4">
                  <ActionButton
                    onClick={() => onDelete(res.id)}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>}
                    label="Delete reservation"
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

export default ReservationsTab;
