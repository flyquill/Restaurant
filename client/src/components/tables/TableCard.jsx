import React, { useState } from 'react';
import { MdOutlineTableRestaurant, MdPersonOutline, MdAttachMoney, MdDeleteOutline } from 'react-icons/md';

const TableCard = ({ table, waiters, onAssignWaiter, onOpenOrder, onDelete, isAdmin }) => {
  const [selectedWaiter, setSelectedWaiter] = useState('');

  const isOccupied = table.status === 'occupied';

  const handleStart = () => {
    if (!selectedWaiter) return;
    onAssignWaiter(table.id, selectedWaiter);
  };

  return (
    <div className={`relative flex flex-col justify-between rounded-2xl bg-white p-5 border shadow-sm select-none transition-all duration-200 ${
      isOccupied ? 'border-red-100 hover:border-red-200' : 'border-slate-100 hover:border-indigo-100'
    }`}>
      {/* Table Title and Status Badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isOccupied ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'
          }`}>
            <MdOutlineTableRestaurant size={22} />
          </span>
          <div>
            <h4 className="font-extrabold text-slate-800 tracking-tight">{table.name}</h4>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold mt-1 ${
              isOccupied ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {isOccupied ? 'Occupied' : 'Available'}
            </span>
          </div>
        </div>

        {/* Delete table button (admin only) */}
        {isAdmin && (
          <button
            onClick={() => onDelete(table.id)}
            className="p-1 rounded-lg text-slate-300 hover:bg-slate-50 hover:text-red-500 transition-colors"
            title="Remove Table"
          >
            <MdDeleteOutline size={18} />
          </button>
        )}
      </div>

      {/* Middle section info details */}
      <div className="my-5 space-y-2">
        {isOccupied ? (
          <>
            <div className="flex items-center text-sm font-semibold text-slate-600">
              <MdPersonOutline size={18} className="mr-2 text-slate-400" />
              <span>Waiter: <span className="text-slate-800">{table.waiter_name}</span></span>
            </div>
            <div className="flex items-center text-sm font-semibold text-slate-600">
              <span className="w-5 text-center text-slate-400 mr-2 font-black text-xs">Qty</span>
              <span>Items Count: <span className="text-slate-800">{table.item_count}</span></span>
            </div>
            <div className="flex items-center text-sm font-semibold text-slate-600">
              <span className="w-5 text-center text-slate-400 mr-2 font-bold text-sm">₨</span>
              <span>Current Bill: <span className="text-primary-600 font-extrabold">₨ {table.current_total.toLocaleString()}</span></span>
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assign Waiter</label>
            <select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm font-medium text-slate-600 bg-slate-50 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
            >
              <option value="">Select Waiter...</option>
              {waiters.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Footer Trigger */}
      <div>
        {isOccupied ? (
          <button
            onClick={() => onOpenOrder(table)}
            className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            Manage Order
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!selectedWaiter}
            className="flex w-full items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-bold text-white hover:bg-primary-600 disabled:opacity-40 disabled:hover:bg-primary-500 transition-all shadow-sm shadow-primary-500/10"
          >
            Start Order
          </button>
        )}
      </div>
    </div>
  );
};

export default TableCard;
