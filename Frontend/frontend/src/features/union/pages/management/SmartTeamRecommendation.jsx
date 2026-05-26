import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SmartTeamRecommendation = () => {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([
    { id: 'W-102', name: 'Rajan P.', match: 98, idleTime: '4 hrs', skill: 'Heavy lifting' },
    { id: 'W-105', name: 'Suresh K.', match: 95, idleTime: '5 hrs', skill: 'Machinery' },
    { id: 'W-110', name: 'Anil T.', match: 92, idleTime: '3 hrs', skill: 'General' },
    { id: 'W-112', name: 'Babu M.', match: 89, idleTime: '2 hrs', skill: 'Textile' }
  ]);

  const handleReplace = (workerId) => {
    navigate(`/union/requests/1/replace-worker?replace=${workerId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">auto_awesome</span>
            Smart Team Recommendation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI-generated team optimizing for skill match and workload fairness.</p>
        </div>
        <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-sm">refresh</span>
          Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Metrics & Fairness */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-sm">
            <h2 className="font-bold mb-4 opacity-90 uppercase tracking-wider text-xs">Overall Match Quality</h2>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black">94%</span>
              <span className="text-purple-200 mb-1">Excellent</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 mb-4">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '94%' }}></div>
            </div>
            <p className="text-sm text-purple-100">Team perfectly matches skill requirements and proximity limits.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">balance</span>
              Union Fairness Impact
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Idle Time Reduction</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">-12%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Workload Variance</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Optimized</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Suggested Team Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 dark:text-white">Suggested Workers (4)</h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-medium">WR-8921</span>
          </div>
          
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
            {workers.map(worker => (
              <div key={worker.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleReplace(worker.id)}
                    className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-2 py-1 rounded shadow-sm hover:text-blue-600"
                  >
                    Replace
                  </button>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-500">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{worker.name}</h4>
                    <p className="text-xs text-slate-500">{worker.id} • {worker.skill}</p>
                    
                    <div className="mt-3 flex gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                        <span className="material-symbols-outlined text-[10px]">check_circle</span>
                        {worker.match}% Match
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-800">
                        <span className="material-symbols-outlined text-[10px]">schedule</span>
                        Idle: {worker.idleTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 mt-auto flex justify-end gap-3">
            <button 
              onClick={() => navigate('/union/dashboard')}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => navigate('/union/dashboard')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              Confirm Team & Dispatch
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTeamRecommendation;
