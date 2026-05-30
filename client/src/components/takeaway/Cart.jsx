import React from 'react';
import CartItem from './CartItem';
import { MdOutlineShoppingCart, MdDeleteSweep } from 'react-icons/md';

const Cart = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemove, 
  onClear, 
  onPlaceOrder, 
  isPlacing = false,
  tableName = null,
  waiterName = null
}) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col w-96 bg-white border-l border-slate-200 h-[calc(100vh-4rem)] shadow-sm">
      {/* Cart Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <MdOutlineShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse-once">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Active Cart</h3>
            {tableName && (
              <p className="text-xs font-semibold text-primary-600">
                {tableName} {waiterName && `• Waiter: ${waiterName}`}
              </p>
            )}
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <MdDeleteSweep size={16} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none">
            <svg className="h-16 w-16 mb-4 text-slate-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-base font-semibold">Cart is empty</span>
            <span className="text-xs mt-1 text-center max-w-[200px]">
              Click on any food item from the menu grid to add it to the cart
            </span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Totals & Checkout */}
      {cartItems.length > 0 && (
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Items Total</span>
              <span>₨ {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Tax (GST 0%)</span>
              <span>₨ 0</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="text-base font-bold text-slate-800">Grand Total</span>
              <span className="text-2xl font-black text-slate-900">
                ₨ {total.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={onPlaceOrder}
            disabled={isPlacing}
            className="flex w-full items-center justify-center rounded-xl bg-primary-500 py-4 text-base font-bold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-150 disabled:opacity-50"
          >
            {isPlacing ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : tableName ? (
              'Save Table Bill'
            ) : (
              'Place Takeaway Order'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
