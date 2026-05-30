import React from 'react';
import { MdAdd, MdRemove, MdDeleteOutline } from 'react-icons/md';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0 animate-fade-in">
      {/* Item info */}
      <div className="flex-1 min-w-0 pr-3">
        <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
        <span className="text-xs text-slate-400 font-semibold">
          ₨ {item.price.toLocaleString()} each
        </span>
      </div>

      {/* Quantity adjustment & Line total */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Quantity Controls */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition-colors"
          >
            <MdRemove size={16} />
          </button>
          
          <span className="w-8 text-center text-sm font-bold text-slate-800">
            {item.quantity}
          </span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition-colors"
          >
            <MdAdd size={16} />
          </button>
        </div>

        {/* Total Price */}
        <span className="w-20 text-right text-sm font-extrabold text-slate-900">
          ₨ {(item.price * item.quantity).toLocaleString()}
        </span>

        {/* Delete Button */}
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <MdDeleteOutline size={20} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
