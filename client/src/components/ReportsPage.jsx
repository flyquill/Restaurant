import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  MdDateRange, 
  MdTrendingUp, 
  MdAttachMoney, 
  MdAccountBalanceWallet, 
  MdAssessment, 
  MdPeople, 
  MdDeleteForever, 
  MdRefresh 
} from 'react-icons/md';

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportMetrics();
  }, []);

  const fetchReportMetrics = async () => {
    setLoading(true);
    try {
      let url = '/reports/dashboard';
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get(url, { params });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to pull analytical parameters:', err);
      alert(err.response?.data?.error || 'Operational failure pulling reporting datasets.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => fetchReportMetrics(), 0);
  };

  // Safe formatting fallback shortcuts
  const formatCurrency = (num) => {
    const value = parseFloat(num) || 0;
    return `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const financials = reportData?.financials || { gross_revenue: 0, net_subtotal: 0, tax_collected: 0, service_charges_collected: 0, total_orders_processed: 0 };
  const channels = reportData?.channels || { takeaway: { orders: 0, revenue: 0 }, "dine-in": { orders: 0, revenue: 0 } };
  const topSelling = reportData?.top_selling_items || [];
  const waiters = reportData?.waiter_rankings || [];
  const wasteAudit = reportData?.waste_audit || { total_wasted_units: 0, estimated_loss_value: 0 };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Upper Title Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Intelligence & Reports</h1>
          <p className="text-sm text-gray-500">Track gross sales margins, channel volumes, waiter performance, and stock losses.</p>
        </div>

        {/* Dynamic Analytics Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <MdDateRange size={18} />
            <span>Filter Range:</span>
          </div>
          <input 
            type="date" value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input 
            type="date" value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
          />
          <button 
            onClick={fetchReportMetrics} disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm"
          >
            <MdRefresh className={loading ? "animate-spin" : ""} size={16} /> Apply
          </button>
          {(startDate || endDate) && (
            <button 
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2 py-2 transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Financial Core Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono">{formatCurrency(financials.gross_revenue)}</h3>
            <p className="text-xs text-gray-500 mt-1">{financials.total_orders_processed} closed bills</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><MdTrendingUp size={26} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Sales Subtotal</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1 font-mono">{formatCurrency(financials.net_subtotal)}</h3>
            <p className="text-xs text-gray-500 mt-1">Excludes calculated taxes</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><MdAttachMoney size={26} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sales Tax Collected</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono">{formatCurrency(financials.tax_collected)}</h3>
            <p className="text-xs text-gray-500 mt-1">SST / General sales tax log</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><MdAccountBalanceWallet size={26} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Charges</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono">{formatCurrency(financials.service_charges_collected)}</h3>
            <p className="text-xs text-gray-500 mt-1">Operational service margins</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><MdAssessment size={26} /></div>
        </div>
      </div>

      {/* Split Mid-Section Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Channel Splits Metrics */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Order Distribution Channels</h2>
          <div className="space-y-4 pt-2">
            {/* Takeaway Info Block */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">Takeaway Orders</span>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">{channels.takeaway?.orders || 0} bills</span>
              </div>
              <p className="text-xl font-mono font-black text-gray-900 mt-1">{formatCurrency(channels.takeaway?.revenue)}</p>
            </div>
            {/* Dine-In Info Block */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">Dine-In Tables</span>
                <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full">{channels["dine-in"]?.orders || 0} tables</span>
              </div>
              <p className="text-xl font-mono font-black text-gray-900 mt-1">{formatCurrency(channels["dine-in"]?.revenue)}</p>
            </div>
          </div>
        </div>

        {/* Loss Prevention Waste Audit Panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MdDeleteForever className="text-red-500" /> Stock Loss & Waste Summary
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Estimated values of items logged as damaged/spoiled.</p>
            
            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Raw Quantities Wasted</p>
              <p className="text-3xl font-mono font-black text-red-600">{wasteAudit.total_wasted_units || 0} Units</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Estimated Financial Cost Loss:</span>
            <span className="font-mono font-bold text-gray-900 text-base">{formatCurrency(wasteAudit.estimated_loss_value)}</span>
          </div>
        </div>

        {/* Waiter Performance rankings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MdPeople className="text-indigo-600" /> Floor Waiter Rankings
          </h2>
          <div className="overflow-y-auto max-h-[220px] pr-1 space-y-2">
            {waiters.length === 0 ? (
              <p className="text-sm text-gray-400 text-center pt-8">No table volume logged for this period.</p>
            ) : (
              waiters.map((waiter, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl hover:bg-gray-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 font-mono w-4">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{waiter.waiter_name}</p>
                      <p className="text-xs text-gray-400">{waiter.tables_served} tables served</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-gray-800">{formatCurrency(waiter.total_volume)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Menu Item Velocity Rankings Board */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Menu Velocity Matrix (Top 10 Selling Dishes)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Dishes organized descending based on cumulative order volume counts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Ranking</th>
                <th className="px-6 py-4">Menu Dish Description</th>
                <th className="px-6 py-4 text-center">Cumulative Units Dispatched</th>
                <th className="px-6 py-4 text-right">Gross Generated Turnover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {topSelling.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">No items sold inside selected parameters.</td>
                </tr>
              ) : (
                topSelling.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">#{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.item_name}</td>
                    <td className="px-6 py-4 text-center font-mono font-medium text-base text-gray-900">{item.units_sold}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(item.gross_sales)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;