import React from 'react';
import { MdSettings } from 'react-icons/md';

const SettingsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center select-none">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-primary-500 mb-6">
        <MdSettings size={40} />
      </div>
      <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Settings</h1>
      <p className="text-slate-400 text-sm mt-2 max-w-sm">
        Configure restaurant profiles, taxes, currencies, printer formats, and user role accounts.
      </p>
      <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-primary-600 mt-6 uppercase tracking-widest border border-indigo-100">
        Coming Soon in Phase 2
      </span>
    </div>
  );
};

export default SettingsPage;
