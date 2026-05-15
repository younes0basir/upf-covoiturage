import React from 'react';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
