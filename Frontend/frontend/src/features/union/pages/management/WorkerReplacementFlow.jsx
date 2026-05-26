import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const WorkerReplacementFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workerToReplace = searchParams.get('replace') || 'W-105';

  const [candidates] = useState([
    { id: 'W-201', name: 'John D.', match: 96, distance: '1.2 km', idleTime: '6 hrs', impact: '+2% Fairness', skill: 'Machinery' },
    { id: 'W-208', name: 'Manoj K.', match: 91, distance: '2.5 km', idleTime: '3 hrs', impact: '-1% Fairness', skill: 'Machinery' },
    { id: 'W-215', name: 'Alex M.', match: 88, distance: '0.8 km', idleTime: '1 hr', impact: '-4% Fairness', skill: 'General' },
  ]);

  const handleSelect = (candidateId) => {
    // Logic to select candidate
    navigate('/union/requests/1/team-recommendation');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">manage_accounts</span>
              Replace Worker
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Replacing <span className="font-bold text-slate-700 dark:text-slate-300">{workerToReplace}</span> for request WR-8921</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skill Level</label>
                <select className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white">
                  <option>Machinery (Required)</option>
                  <option>Any Skill</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Distance</label>
                <select className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white">
                  <option>5 km</option>
                  <option>10 km</option>
                  <option>Any Distance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum Idle Time</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="8" defaultValue="2" className="w-full" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">2+ hrs</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold transition-colors">
              Reset Filters
            </button>
          </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 dark:text-white">Available Candidates ({candidates.length})</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input type="text" placeholder="Search by ID or Name" className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
            </div>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {candidates.map(candidate => (
              <div key={candidate.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{candidate.name} <span className="text-sm font-normal text-slate-500">({candidate.id})</span></h4>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {candidate.distance}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> Idle: {candidate.idleTime}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">build</span> {candidate.skill}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{candidate.match}% Match</div>
                    <div className={`text-xs font-bold ${candidate.impact.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {candidate.impact}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSelect(candidate.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerReplacementFlow;
