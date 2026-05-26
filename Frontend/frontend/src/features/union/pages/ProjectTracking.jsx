import React from 'react';

const ProjectTracking = () => {
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
      {/* Left Panel: Map & Visuals */}
      <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        {/* Search Bar overlaid on map */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg shadow-md flex items-center px-4 py-3 border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
            <input type="text" placeholder="Search active sites or workers..." className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none dark:text-white" />
          </div>
          <button className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">filter_list</span>
          </button>
        </div>

        {/* Map Placeholder */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-5"></div>
          
          {/* Mock Map Markers */}
          <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">City Center Mall (6 Workers)</div>
            <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-white text-sm">engineering</span>
            </div>
          </div>

          <div className="absolute top-2/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Global Hardware (2 Workers)</div>
            <div className="w-6 h-6 bg-amber-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">warning</span>
            </div>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="bg-white dark:bg-slate-800 p-3 border-t border-slate-200 dark:border-slate-700 flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Active</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Delayed</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div> Completed</div>
        </div>
      </div>

      {/* Right Panel: Active Sites List */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
          Live Status
          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full font-bold">12 Sites</span>
        </h2>

        {/* Site Card 1 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">WR-8921</span>
              <h3 className="font-bold text-slate-900 dark:text-white mt-1">City Center Mall Delivery</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              In Progress
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg text-center">
              <p className="text-xs text-slate-500">Progress</p>
              <p className="font-bold text-slate-900 dark:text-white">65%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg text-center">
              <p className="text-xs text-slate-500">Est. Completion</p>
              <p className="font-bold text-slate-900 dark:text-white">02:30 PM</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 font-medium">Team Assigned (6)</span>
              <button className="text-xs text-blue-600 hover:underline">Manage</button>
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-600">
                  W{i}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                +2
              </div>
            </div>
          </div>
        </div>

        {/* Site Card 2 (Issue) */}
        <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">WR-8922</span>
              <h3 className="font-bold text-slate-900 dark:text-white mt-1">Global Hardware Co.</h3>
            </div>
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-md">
              Delayed
            </span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-lg mb-3 flex gap-2">
            <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">warning</span>
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-500">Worker Absent</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">1 assigned worker failed to report. Requesting replacement.</p>
            </div>
          </div>

          <button className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 dark:hover:bg-slate-100">
            Find Replacement
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTracking;
