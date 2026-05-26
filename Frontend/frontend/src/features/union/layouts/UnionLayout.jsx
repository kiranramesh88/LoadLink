import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const UnionLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navLinks = [
    { name: 'Dashboard',    path: '/union/dashboard',    icon: 'dashboard' },
    { name: 'Requests',     path: '/union/requests',     icon: 'assignment' },
    { name: 'Active Works', path: '/union/active-works', icon: 'construction' },
    { name: 'Disputes',     path: '/union/disputes',     icon: 'gavel' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-inter text-slate-900">
      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:static flex flex-col`}
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span className="material-symbols-outlined">hub</span>
            LoadLink
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">UnionAdmin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              UA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Union Admin</p>
              <p className="text-xs text-slate-500 truncate">Central Branch</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 rounded-md hover:bg-slate-100 text-slate-500"
              onClick={toggleSidebar}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden sm:block relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search projects, workers..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UnionLayout;
