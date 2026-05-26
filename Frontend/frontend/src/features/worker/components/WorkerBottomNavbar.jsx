import React from 'react';
import { NavLink } from 'react-router-dom';

const WorkerBottomNavbar = () => {
  const navItems = [
    { name: 'Home', path: '/worker/dashboard', icon: 'home' },
    { name: 'Assignments', path: '/worker/assignments', icon: 'assignment' },
    { name: 'Wallet', path: '/worker/wallet', icon: 'account_balance_wallet' },
    { name: 'Profile', path: '/worker/profile', icon: 'person' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-xl bg-surface-container-lowest/90 backdrop-blur-xl shadow-lg border-t border-outline-variant h-[80px]">
      <div className="flex justify-around items-center px-sm pt-sm pb-safe h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container scale-95 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined mb-xs"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="text-label-sm font-label-sm mt-1">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default WorkerBottomNavbar;
