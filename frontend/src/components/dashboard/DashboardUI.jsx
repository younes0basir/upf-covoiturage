import React from 'react';
import { Link } from 'react-router-dom';

// --- Icons ---
export const Icons = {
  Passenger: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4 mx-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
    </svg>
  ),
  EmptyBox: () => (
    <svg className="w-20 h-20 mx-auto text-gray-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  Users: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
};

// --- Reusable Components ---
export const StatusBadge = ({ status }) => {
  const config = {
    ACCEPTED: { label: 'Confirmed', color: 'bg-green-50 text-green-700 border-green-200' },
    PENDING: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
    CANCELLED: { label: 'Cancelled', color: 'bg-gray-50 text-gray-500 border-gray-200' },
    COMPLETED: { label: 'Completed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    SCHEDULED: { label: 'Scheduled', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  };

  const { label, color } = config[status] || config.PENDING;
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
};

export const DateBadge = ({ date }) => {
  const formattedDate = new Date(date);
  return (
    <div className="bg-gray-50 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border border-gray-100 transition-all duration-300 group-hover:bg-gray-900 group-hover:border-gray-900">
      <span className="text-xs font-semibold uppercase text-gray-400 group-hover:text-gray-400">
        {formattedDate.toLocaleDateString('en-US', { month: 'short' })}
      </span>
      <span className="text-3xl font-bold text-gray-900 group-hover:text-white leading-none mt-1">
        {formattedDate.getDate()}
      </span>
    </div>
  );
};

export const EmptyState = ({ title, message, buttonText, buttonLink, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 reveal-element">
    <Icon />
    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-400 mb-8 max-w-sm mx-auto font-medium">{message}</p>
    <Link 
      to={buttonLink} 
      className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold uppercase tracking-wider text-sm hover:bg-black transition shadow-lg"
    >
      {buttonText}
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </Link>
  </div>
);

export const ContactModal = ({ isOpen, onClose, person, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Contact {person.firstName}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <Icons.X />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Phone Number</p>
            <p className="text-lg font-semibold text-gray-900">{person.phone || 'Not provided'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Email Address</p>
            <p className="text-lg font-semibold text-gray-900">{person.email}</p>
          </div>
        </div>
        <button
          onClick={onConfirm}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
