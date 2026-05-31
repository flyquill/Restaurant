import React, { useState, useEffect } from 'react';
// Import your custom configured API client instead of raw axios
import api from '../api'; 
import { 
  MdWarning, 
  MdAddShoppingCart, 
  MdDeleteSweep, 
  MdRefresh, 
  MdAssignmentTurnedIn, 
  MdLayers 
} from 'react-icons/md';

const StockPage = () => {
  const [inventory, setInventory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('status'); 
  const [loading, setLoading] = useState(false);

  // Forms Input States
  const [poForm, setPoForm] = useState({ supplier_name: '', item_id: '', quantity: '', cost_price: '' });
  const [wasteForm, setWasteForm] = useState({ item_id: '', quantity: '', reason: '' });

  useEffect(() => {
    fetchStockData();
  }, [activeTab]);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      // Cleaner endpoints using the base URL context from api.js
      const invRes = await api.get('/inventory');
      setInventory(Array.isArray(invRes.data) ? invRes.data : []);

      if (activeTab === 'orders') {
        const poRes = await api.get('/inventory/orders');
        setPurchaseOrders(Array.isArray(poRes.data) ? poRes.data : []);
      } else if (activeTab === 'waste') {
        const wasteRes = await api.get('/inventory/waste');
        setWasteLogs(Array.isArray(wasteRes.data) ? wasteRes.data : []);
      }
    } catch (err) {
      console.error('API Error:', err);
      setInventory([]);
      alert(err.response?.data?.error || 'Failed to sync inventory data tables.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/orders', poForm);
      setPoForm({ supplier_name: '', item_id: '', quantity: '', cost_price: '' });
      fetchStockData();
      alert('Supplier purchase order drafted!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save order entry.');
    }
  };

  const handleReceivePO = async (id) => {
    if (!window.confirm('Confirm receipt of shipment items? This will increment active inventory values.')) return;
    try {
      await api.put(`/inventory/orders/${id}/receive`, {});
      fetchStockData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update delivery profiles.');
    }
  };

  const handleLogWaste = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/waste', wasteForm);
      setWasteForm({ item_id: '', quantity: '', reason: '' });
      fetchStockData();
      alert('Waste parameters applied against operational logs.');
    } catch (err) {
      alert(err.response?.data?.error || 'Error recording waste allocation.');
    }
  };

  const lowStockItems = Array.isArray(inventory) ? inventory.filter(item => item.is_low_stock) : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Stock Management</h1>
          <p className="text-sm text-gray-500">Track restaurant inventory counts, supplier shipments, and kitchen wastage.</p>
        </div>
        <button 
          onClick={fetchStockData} 
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <MdRefresh className={loading ? "animate-spin" : ""} size={20} />
          Refresh Registry
        </button>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-pulse">
          <MdWarning className="text-red-500 flex-shrink-0 mt-0.5" size={22} />
          <div>
            <h3 className="font-bold text-red-800">Critical Stock Warning</h3>
            <p className="text-sm text-red-700 mt-0.5">
              The following preparation ingredients are below minimum threshold safety points: {' '}
              <span className="font-semibold">{lowStockItems.map(i => i.name).join(', ')}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Top Controller Toggles */}
      <div className="flex border-b border-gray-200 gap-2">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${activeTab === 'status' ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <MdLayers size={18} /> Master Stock Sheet
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${activeTab === 'orders' ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <MdAddShoppingCart size={18} /> Supplier Purchase Orders
        </button>
        <button 
          onClick={() => setActiveTab('waste')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${activeTab === 'waste' ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <MdDeleteSweep size={18} /> Waste Registers
        </button>
      </div>

      {/* Tab Context Content Components */}
      {activeTab === 'status' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Dish Description</th>
                  <th className="px-6 py-4">Menu Category</th>
                  <th className="px-6 py-4">Current Available Level</th>
                  <th className="px-6 py-4">Min. Buffer Point</th>
                  <th className="px-6 py-4 text-center">Status Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {Array.isArray(inventory) && inventory.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/70 transition-all">
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-gray-500">{row.category_name}</td>
                    <td className="px-6 py-4 font-mono font-medium text-base">
                      {row.current_stock} <span className="text-xs text-gray-400 font-sans">{row.unit}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">{row.min_stock} {row.unit}</td>
                    <td className="px-6 py-4 text-center">
                      {row.is_low_stock ? (
                        <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">LOW STOCK</span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">SECURE</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Order Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MdAddShoppingCart className="text-indigo-600" /> Procurement Entry
            </h2>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Supplier / Vendor Name</label>
                <input 
                  type="text" required value={poForm.supplier_name}
                  onChange={(e) => setPoForm({...poForm, supplier_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Metro Wholesale"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Target Menu Item Matching Stock</label>
                <select 
                  required value={poForm.item_id}
                  onChange={(e) => setPoForm({...poForm, item_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="">-- Choose Item --</option>
                  {Array.isArray(inventory) && inventory.map(i => <option key={i.item_id} value={i.item_id}>{i.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Quantity</label>
                  <input 
                    type="number" required min="1" value={poForm.quantity}
                    onChange={(e) => setPoForm({...poForm, quantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cost Unit Price</label>
                  <input 
                    type="number" required min="0" value={poForm.cost_price}
                    onChange={(e) => setPoForm({...poForm, cost_price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm">
                Log Purchase Order
              </button>
            </form>
          </div>

          {/* Orders Tracking Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider border-b border-gray-100">
                    <th className="px-4 py-4">Vendor</th>
                    <th className="px-4 py-4">Item</th>
                    <th className="px-4 py-4">Qty</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {Array.isArray(purchaseOrders) && purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{po.supplier_name}</td>
                      <td className="px-4 py-3 text-gray-700">{po.item_name}</td>
                      <td className="px-4 py-3 font-mono">{po.quantity}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${po.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {po.status === 'pending' && (
                          <button 
                            onClick={() => handleReceivePO(po.id)}
                            className="flex items-center gap-1 mx-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition-all"
                          >
                            <MdAssignmentTurnedIn size={14} /> Receive Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'waste' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Write-off Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MdDeleteSweep className="text-red-500" /> Log Food Waste
            </h2>
            <form onSubmit={handleLogWaste} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Damaged/Spoiled Item</label>
                <select 
                  required value={wasteForm.item_id}
                  onChange={(e) => setWasteForm({...wasteForm, item_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="">-- Choose Item --</option>
                  {Array.isArray(inventory) && inventory.map(i => <option key={i.item_id} value={i.item_id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Wasted Quantity Count</label>
                <input 
                  type="number" required min="1" value={wasteForm.quantity}
                  onChange={(e) => setWasteForm({...wasteForm, quantity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Reason / Explanation</label>
                <textarea 
                  required value={wasteForm.reason} rows={3}
                  onChange={(e) => setWasteForm({...wasteForm, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Expired shelf life / Spilled during prep line"
                />
              </div>
              <button type="submit" className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm">
                Deduct & Register Log
              </button>
            </form>
          </div>

          {/* Waste History */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider border-b border-gray-100">
                    <th className="px-4 py-4">Dish Item</th>
                    <th className="px-4 py-4">Quantity</th>
                    <th className="px-4 py-4">Reason Details</th>
                    <th className="px-4 py-4">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {Array.isArray(wasteLogs) && wasteLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{log.item_name}</td>
                      <td className="px-4 py-3 font-mono text-red-600 font-medium">-{log.quantity}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={log.reason}>{log.reason}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-medium">@{log.logged_by_user || 'system'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;