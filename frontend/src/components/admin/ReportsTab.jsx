import React from 'react';
import { StatusBadge } from './AdminUI';

const ReportsTab = ({ reports, onUpdateStatus }) => {
  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No reports to display</p>
          <p className="text-sm text-gray-300 mt-1">All reports have been resolved or dismissed.</p>
        </div>
      ) : (
        reports.map(report => (
          <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <StatusBadge status={report.status} />
                  <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {report.type}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                    {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-gray-700 mb-6 font-medium leading-relaxed">{report.description}</p>
                <div className="flex flex-wrap gap-8 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Reporter:</span>
                    <span className="text-gray-900">{report.reporter?.firstName} {report.reporter?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Target:</span>
                    <span className="text-gray-900">{report.reported?.firstName} {report.reported?.lastName}</span>
                  </div>
                </div>
              </div>
              
              {report.status === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onUpdateStatus(report.id, 'RESOLVED')}
                    className="px-5 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-100"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => onUpdateStatus(report.id, 'DISMISSED')}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReportsTab;
