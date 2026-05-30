import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MdReceipt, 
  MdTableRestaurant, 
  MdRestaurantMenu, 
  MdInventory, 
  MdBarChart, 
  MdHistory, 
  MdSettings 
} from 'react-icons/md';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const links = [
    { to: '/takeaway', label: 'Takeaway Orders', icon: MdReceipt, roles: ['admin', 'user'] },
    { to: '/tables', label: 'Tables', icon: MdTableRestaurant, roles: ['admin', 'user'] },
    { to: '/orders', label: 'Orders History', icon: MdHistory, roles: ['admin', 'user'] },
    { to: '/items', label: 'Items Management', icon: MdRestaurantMenu, roles: ['admin'] },
    { to: '/stock', label: 'Stock Management', icon: MdInventory, roles: ['admin'] },
    { to: '/reports', label: 'Reports', icon: MdBarChart, roles: ['admin'] },
    { to: '/settings', label: 'Settings', icon: MdSettings, roles: ['admin'] },
  ];

  return (
    <aside className="w-64 bg-sidebar-bg text-indigo-100 flex flex-col h-screen select-none">
      {/* Brand logo space - already in header, but sidebar header gives a unified look */}
      <div className="flex h-16 items-center justify-center border-b border-indigo-950 px-6">
        <span className="text-xl font-black tracking-wider text-white flex items-center gap-2">
          HOTEL SYSTEM
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {links.map((link) => {
          // If this page is admin-only and user is not admin, hide it
          if (link.roles.includes('admin') && !link.roles.includes('user') && !isAdmin) {
            return null;
          }

          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sidebar-active text-white shadow-lg shadow-indigo-600/10'
                    : 'hover:bg-sidebar-hover text-indigo-200 hover:text-white'
                }`
              }
            >
              <Icon size={22} className="flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-indigo-950 text-center text-xs text-indigo-400">
        <p>© 2026 Restaurant Pro</p>
      </div>
    </aside>
  );
};

export default Sidebar;
