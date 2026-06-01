import React from 'react';
import { MdAdd, MdRemove, MdDeleteOutline } from 'react-icons/md';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  // Use the unique database multiplier step per dish (fallback to 1 if empty)
  console.log(item);
  const step = Number(item.variable_by || 1.00);

  const handleDecrease = () => {
    if (item.quantity > step) {
      // Clean decimal floating-point rounding rule
      const newQty = Number((item.quantity - step).toFixed(2));
      onUpdateQuantity(item.id, newQty);
    } else {
      // Drop completely from array if quantity hits zero/below threshold boundary
      onRemove(item.id);
    }
  };

  const handleIncrease = () => {
    const newQty = Number((item.quantity + step).toFixed(2));
    onUpdateQuantity(item.id, newQty);
  };

  // Prettifies layout string values dynamically (keeps .25, .5, drops integer trailing zeros)
  const formattedQuantity = Number(item.quantity).toFixed(2).replace(/\.00$/, '');

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
            onClick={handleDecrease}
            className="p-1 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition-colors"
          >
            <MdRemove size={16} />
          </button>
          
          <span className="w-10 text-center text-sm font-bold text-slate-800">
            {formattedQuantity}
          </span>
          
          <button
            onClick={handleIncrease}
            className="p-1 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition-colors"
          >
            <MdAdd size={16} />
          </button>
        </div>

        {/* Total Price (Safely computed based on step counts) */}
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