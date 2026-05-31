import React from 'react';
import ItemCard from './ItemCard';

const ItemsGrid = ({ items, loading, onAddItem }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-36 bg-slate-200 w-full" />
            <div className="p-5 flex flex-col gap-3">
              <div className="h-4 w-16 bg-slate-200 rounded-md" />
              <div className="h-6 w-32 bg-slate-200 rounded-md" />
              <div className="flex justify-between items-center mt-1">
                <div className="h-6 w-20 bg-slate-200 rounded-md" />
                <div className="h-9 w-9 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 select-none">
        <svg className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span className="text-lg font-semibold">No items found</span>
        <span className="text-sm mt-1">Try adding menu items in Items Management</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-start pb-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onAdd={onAddItem} />
      ))}
    </div>
  );
};

export default ItemsGrid;