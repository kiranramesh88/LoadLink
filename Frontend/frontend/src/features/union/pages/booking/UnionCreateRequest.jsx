import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UnionCreateRequest = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: 'general', name: 'General Loading', icon: 'package_2', desc: 'Boxes, cartons, and standard goods' },
    { id: 'textile', name: 'Textile', icon: 'checkroom', desc: 'Clothing bales, fabric rolls' },
    { id: 'machinery', name: 'Heavy Machinery', icon: 'precision_manufacturing', desc: 'Industrial equipment, large parts' },
    { id: 'construction', name: 'Construction', icon: 'construction', desc: 'Cement, bricks, steel rods' },
    { id: 'event', name: 'Event/Exhibition', icon: 'event_seat', desc: 'Stage setup, chairs, sound systems' }
  ];

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/union/requests/quote');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Work Request</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Initiate a new labor request manually on behalf of a customer.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
        <div className="w-1/2 h-0.5 bg-blue-600 absolute left-0 top-1/2 -translate-y-1/2 -z-10"></div>
        
        <div className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
          <span className="text-xs font-semibold text-blue-600 mt-2">Details</span>
        </div>
        <div className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm">2</div>
          <span className="text-xs font-medium text-slate-500 mt-2">Quote</span>
        </div>
        <div className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm">3</div>
          <span className="text-xs font-medium text-slate-500 mt-2">Assign</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <form onSubmit={handleNext} className="space-y-8">
          
          {/* Customer Details */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">person</span>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Phone</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">phone</span>
                  <input type="tel" className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" placeholder="+91" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name (Optional)</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" placeholder="Walk-in Customer" />
              </div>
            </div>
          </section>

          {/* Category Selection */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">category</span>
              Select Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedCategory === cat.id 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className={`material-symbols-outlined text-3xl mb-2 ${selectedCategory === cat.id ? 'text-blue-600' : 'text-slate-400'}`}>
                    {cat.icon}
                  </span>
                  <h3 className={`font-bold ${selectedCategory === cat.id ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                    {cat.name}
                  </h3>
                  <p className={`text-xs mt-1 ${selectedCategory === cat.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500'}`}>
                    {cat.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {selectedCategory && (
            <div className="animate-fade-in-up">
              {/* Dynamic Details (Based on category) */}
              <section className="mb-8 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4">Work Specifics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Weight/Quantity</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" placeholder="e.g. 500 kg or 50 boxes" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Floor Level</label>
                    <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white">
                      <option>Ground Floor</option>
                      <option>1st Floor</option>
                      <option>2nd Floor or higher</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Location & Time */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">location_on</span>
                  Location & Schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Location</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                      <input type="text" className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Search location..." required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input type="date" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                    <input type="time" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" required />
                  </div>
                </div>
              </section>

              <div className="pt-6 flex justify-end">
                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                  Generate Quote
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UnionCreateRequest;
