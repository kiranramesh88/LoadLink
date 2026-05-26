import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnionQuoteReview = () => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    // Navigate to team assignment
    navigate('/union/requests/1/team-recommendation');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quote Review</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review the system-generated quote before confirming.</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Edit Details
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
        <div className="w-1/2 h-0.5 bg-blue-600 absolute left-0 top-1/2 -translate-y-1/2 -z-10"></div>
        
        <div className="flex flex-col items-center bg-white dark:bg-slate-900 px-2 cursor-pointer" onClick={() => navigate(-1)}>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-semibold text-blue-600 mt-2">Details</span>
        </div>
        <div className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">2</div>
          <span className="text-xs font-semibold text-blue-600 mt-2">Quote</span>
        </div>
        <div className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm">3</div>
          <span className="text-xs font-medium text-slate-500 mt-2">Assign</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Request Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">assignment</span>
                Request Summary
              </h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold rounded">Textile Loading</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Location</p>
                <p className="text-sm text-slate-900 dark:text-white mt-1 font-medium">123 Market Street, City Center</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Schedule</p>
                <p className="text-sm text-slate-900 dark:text-white mt-1 font-medium">Oct 24, 2023 at 09:00 AM</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Customer</p>
                <p className="text-sm text-slate-900 dark:text-white mt-1 font-medium">+91 9876543210 (Walk-in)</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Est. Weight</p>
                <p className="text-sm text-slate-900 dark:text-white mt-1 font-medium">500 kg (Ground Floor)</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-500 text-sm">
            <span className="material-symbols-outlined mt-0.5">info</span>
            <p>
              This quote is generated based on standard union rates for textile goods. Any additional work requested on-site will be billed separately.
            </p>
          </div>
        </div>

        {/* Right Col: Quote Breakdown */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="font-bold text-slate-900 dark:text-white mb-4">Labor & Cost Estimate</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center bg-blue-50 dark:bg-slate-700/50 p-3 rounded-lg border border-blue-100 dark:border-slate-600">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Required Workers</span>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">4</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Base Labor Charge</span>
                <span className="font-medium text-slate-900 dark:text-white">₹3,200</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Welfare Fund (5%)</span>
                <span className="font-medium text-slate-900 dark:text-white">₹160</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Convenience Fee</span>
                <span className="font-medium text-slate-900 dark:text-white">₹40</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-900 dark:text-white text-lg">Total Est.</span>
                <span className="font-black text-2xl text-blue-600 dark:text-blue-400">₹3,400</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleConfirm}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                Confirm & Assign Team
                <span className="material-symbols-outlined text-sm">group_add</span>
              </button>
              <button className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors">
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnionQuoteReview;
