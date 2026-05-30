import React from 'react';

const OrderDetail = ({ order }) => {
  return (
    <div className="bg-slate-50/50 p-6 rounded-b-2xl border-t border-slate-100 select-none animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Details</span>
          <span className="text-sm font-semibold text-slate-700">Order ID: #{order.id}</span>
          <span className="block text-sm font-semibold text-slate-700 mt-0.5">
            Type: <span className="capitalize">{order.order_type}</span>
          </span>
        </div>

        {order.order_type === 'dine-in' && (
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Table Details</span>
            <span className="text-sm font-semibold text-slate-700">Table: {order.table_name}</span>
            <span className="block text-sm font-semibold text-slate-700 mt-0.5">Waiter: {order.waiter_name}</span>
          </div>
        )}

        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timestamp</span>
          <span className="text-sm font-semibold text-slate-700">
            {new Date(order.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/75">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Item Name</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Price</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold text-slate-700 text-sm">{item.item_name}</td>
                <td className="px-4 py-3 text-center text-slate-600 text-sm font-semibold">₨ {item.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-center text-slate-600 text-sm font-bold">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-extrabold text-slate-900 text-sm">
                  ₨ {(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50/50">
              <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-600 text-sm">Grand Total</td>
              <td className="px-4 py-3 text-right font-black text-slate-900 text-base">
                ₨ {order.total.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetail;
