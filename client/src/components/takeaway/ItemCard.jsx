import React from 'react';

const ItemCard = ({ item, onAdd }) => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''); // strip trailing slash
  const imageUrl = item.image_url ? `${base}${item.image_url}` : null;

  return (
    <div
      onClick={() => onAdd(item)}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-indigo-100 cursor-pointer card-hover item-click select-none"
    >
      {/* Item Image */}
      {imageUrl ? (
        <div className="w-full h-36 overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-36 flex-shrink-0 bg-slate-50 group-hover:bg-indigo-50/50 transition-colors duration-200 flex items-center justify-center">
          <svg className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Card content */}
      <div className="relative p-5">
        {/* Visual background detail */}
        <div className="absolute right-0 top-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-slate-50 group-hover:bg-primary-50 transition-colors duration-200" />

        <div className="relative z-10">
          <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-primary-600 mb-3">
            {item.category_name}
          </span>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-primary-600 transition-colors duration-150">
            {item.name}
          </h3>
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-between">
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
    </div>
  );
};

export default ItemCard;