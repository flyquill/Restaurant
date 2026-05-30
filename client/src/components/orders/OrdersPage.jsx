import React, { useState, useEffect } from 'react';
import api from '../../api';
import OrderDetail from './OrderDetail';
import { MdOutlineReceiptLong, MdSearch, MdFilterList, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'takeaway', 'dine-in'
  
  // Tracks expanded order IDs
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Filter calculations
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toString().includes(searchQuery) ||
      (order.table_name && order.table_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.waiter_name && order.waiter_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = typeFilter === 'all' ? true : order.order_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Orders History</h1>
        <p className="text-slate-400 text-sm mt-0.5">Browse past takeaway and dine-in orders</p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <MdSearch size={20} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Table name, Waiter..."
            className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-slate-700 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all text-sm font-medium"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/50">
          {['all', 'takeaway', 'dine-in'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                typeFilter === type
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {type === 'all' ? 'All Orders' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 h-20 shadow-sm" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
          <MdOutlineReceiptLong className="h-16 w-16 mb-4 text-slate-300" />
          <span className="text-lg font-semibold">No orders found</span>
          <span className="text-sm mt-1">Try expanding your search query or filters</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-indigo-50/50 transition-colors"
              >
                {/* Order Row Header Summary */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl font-extrabold ${
                      order.order_type === 'dine-in'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      #{order.id}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-800 text-base">
                          ₨ {order.total.toLocaleString()}
                        </span>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          order.order_type === 'dine-in'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {order.order_type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold mt-0.5 block">
                        {new Date(order.created_at).toLocaleString()}
                        {order.order_type === 'dine-in' && ` • ${order.table_name} (${order.waiter_name})`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </span>
                    <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                      {isExpanded ? <MdKeyboardArrowUp size={20} /> : <MdKeyboardArrowDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Item Details */}
                {isExpanded && <OrderDetail order={order} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
