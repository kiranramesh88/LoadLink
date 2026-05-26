import React, { useState } from 'react';

const SettingsPage = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">App Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage notifications and preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Notifications</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
              <p className="text-xs text-gray-500">Alerts for new assignments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003ec7]"></div>
            </label>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">SMS Alerts</p>
              <p className="text-xs text-gray-500">Important union updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003ec7]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Preferences</h3>
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">App Language</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#003ec7] focus:border-[#003ec7] sm:text-sm bg-white"
          >
            <option value="en">English</option>
            <option value="ml">Malayalam (മലയാളം)</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
