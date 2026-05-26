import React from 'react';

const WorkerHeader = ({ title }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
          {title || "LoadLink Worker"}
        </h1>
        <div className="flex items-center gap-3">
          <button className="p-1.5 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
            W
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkerHeader;
