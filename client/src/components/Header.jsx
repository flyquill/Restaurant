import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MdOutlineRestaurant } from 'react-icons/md';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex items-center space-x-3 text-slate-800">
        <MdOutlineRestaurant size={26} className="text-primary-500" />
        <span className="text-xl font-bold tracking-tight">Food Court</span>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 border-r border-slate-200 pr-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-700 capitalize">{user.username}</span>
              <span className="text-xs font-medium text-slate-400 capitalize">{user.role}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <span className="font-bold text-sm uppercase">{user.username[0]}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Sign Out"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
