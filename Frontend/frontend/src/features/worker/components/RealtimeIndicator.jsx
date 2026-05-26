import React from 'react';

const RealtimeIndicator = ({ isOnline, isConnecting }) => {
  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
        <span className="text-xs font-semibold tracking-wide text-yellow-700 uppercase">Connecting...</span>
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-xs font-semibold tracking-wide text-green-700 uppercase">Live</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Offline</span>
    </div>
  );
};

export default RealtimeIndicator;
