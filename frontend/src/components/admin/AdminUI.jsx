import React from 'react';

export const StatCard = ({ label, value, icon, color, trend }) => (
  <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {trend > 0 ? `+${trend}` : trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value ?? '—'}</p>
    </div>
  </div>
);

export const StatusBadge = ({ status }) => {
  const styles = {
    VERIFIED: 'bg-green-50 text-green-700 border-green-200',
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INACTIVE: 'bg-gray-50 text-gray-600 border-gray-200',
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
    ACCEPTED: 'bg-teal-50 text-teal-700 border-teal-200',
    REVIEWED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    RESOLVED: 'bg-green-50 text-green-700 border-green-200',
    DISMISSED: 'bg-gray-50 text-gray-500 border-gray-200'
  };

  const selectedStyle = styles[status] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${selectedStyle}`}>
      {status}
    </span>
  );
};

export const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      placeholder={placeholder}
      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export const ActionButton = ({ onClick, icon, label, variant = 'default' }) => {
  const variants = {
    delete: 'text-gray-400 hover:text-red-600 hover:bg-red-50',
    edit: 'text-gray-400 hover:text-blue-600 hover:bg-blue-50',
    view: 'text-gray-400 hover:text-purple-600 hover:bg-purple-50',
    default: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-200 ${variants[variant]}`}
      title={label}
    >
      {icon}
    </button>
  );
};
