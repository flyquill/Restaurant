import React from 'react';

const CategoryBar = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-3 scrollbar-thin select-none">
      {/* "All" button */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all ${
          activeCategory === null
            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
      >
        All Items
      </button>

      {/* Database Categories */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide whitespace-nowrap transition-all z-10 ${
            activeCategory === cat.id
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
