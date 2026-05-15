import React from 'react';
import { StatCard, StatusBadge } from './AdminUI';

const OverviewTab = ({ stats, recentUsers }) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers}
          color="bg-blue-50"
          trend={12}
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>}
        />
        <StatCard
          label="Verified Users"
          value={stats?.verifiedUsers}
          color="bg-green-50"
          trend={8}
          icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        />
        <StatCard
          label="Total Trips"
          value={stats?.totalTrips}
          color="bg-purple-50"
          trend={-3}
          icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>}
        />
        <StatCard
          label="Reservations"
          value={stats?.totalReservations}
          color="bg-orange-50"
          trend={15}
          icon={<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>}
        />
        <StatCard
          label="Pending Reports"
          value={stats?.pendingReports}
          color="bg-red-50"
          trend={-2}
          icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>}
        />
      </div>

      {/* Recent Users Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Users</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentUsers.slice(0, 5).map(user => (
            <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={user.verified ? 'VERIFIED' : 'PENDING'} />
                <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-gray-50 text-gray-400 border border-gray-100">
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
