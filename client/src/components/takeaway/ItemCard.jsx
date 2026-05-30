import React from 'react';

const ItemCard = ({ item, onAdd }) => {
  return (
    <div
      onClick={() => onAdd(item)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:border-indigo-100 cursor-pointer card-hover item-click select-none"
    >
      {/* Visual background details to look premium */}
      <div className="absolute right-0 top-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-slate-50 group-hover:bg-primary-50 transition-colors duration-200" />
      
      <div className="relative z-10">
        <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-primary-600 mb-3">
          {item.category_name}
        </span>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-primary-600 transition-colors duration-150">
          {item.name}
        </h3>
      </div>

      <div className="relative z-10 mt-6 flex items-center justify-between">
        <span className="text-xl font-extrabold text-slate-900">
          ₨ {item.price.toLocaleString()}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-primary-500 group-hover:text-white transition-all duration-200 shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default ItemCard;
