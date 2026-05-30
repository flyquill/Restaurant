import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import TableCard from './TableCard';
import AddTableModal from './AddTableModal';
import AddWaiterModal from './AddWaiterModal';
import TableOrder from './TableOrder';
import { MdOutlineTableRestaurant, MdPersonAdd, MdCheckCircle } from 'react-icons/md';

const TablesPage = () => {
  const { isAdmin } = useAuth();
  
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  
  // Active table view (for managing order of a specific occupied table)
  const [activeTable, setActiveTable] = useState(null);
  
  const [toast, setToast] = useState(null);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  };

  const fetchWaiters = async () => {
    try {
      const response = await api.get('/waiters');
      setWaiters(response.data);
    } catch (err) {
      console.error('Error fetching waiters:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTables(), fetchWaiters()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Create Table action
  const handleAddTable = async (name) => {
    try {
      await api.post('/tables', { name });
      await fetchTables();
      showToast(`Created ${name}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to create table' };
    }
  };

  // Add Waiter action
  const handleAddWaiter = async (name) => {
    try {
      await api.post('/waiters', { name });
      await fetchWaiters();
      showToast(`Added waiter ${name}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to add waiter' };
    }
  };

  // Delete Table action
  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await api.delete(`/tables/${tableId}`);
      await fetchTables();
      showToast('Table deleted');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete table');
    }
  };

  // Assign Waiter to Table (Occupies Table)
  const handleAssignWaiter = async (tableId, waiterId) => {
    try {
      await api.put(`/tables/${tableId}`, { waiter_id: parseInt(waiterId) });
      await fetchTables();
      showToast('Waiter assigned to table');
    } catch (err) {
      console.error('Error assigning waiter:', err);
      alert('Failed to assign waiter');
    }
  };

  // Settle Order callback
  const handleOrderSettled = () => {
    setActiveTable(null);
    loadData();
  };

  // If a table is active, render the ordering screen instead
  if (activeTable) {
    return (
      <TableOrder
        table={activeTable}
        onBack={() => {
          setActiveTable(null);
          fetchTables(); // Refresh bills on return
        }}
        onOrderSettled={handleOrderSettled}
      />
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tables Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage dine-in tables, waiters, and table orders</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 select-none">
          <button
            onClick={() => setIsWaiterModalOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <MdPersonAdd size={18} />
            <span>Add Waiter</span>
          </button>
          
          <button
            onClick={() => setIsTableModalOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-600 shadow-sm shadow-primary-500/10 transition-colors"
          >
            <MdOutlineTableRestaurant size={18} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-5 border border-slate-100 h-56 flex flex-col justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-slate-200 rounded-md" />
                  <div className="h-3 w-16 bg-slate-200 rounded-md" />
                </div>
              </div>
              <div className="space-y-2 py-4">
                <div className="h-3 w-28 bg-slate-200 rounded-md" />
                <div className="h-3 w-24 bg-slate-200 rounded-md" />
              </div>
              <div className="h-10 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 select-none">
          <MdOutlineTableRestaurant className="h-16 w-16 mb-4 text-slate-300" />
          <span className="text-lg font-semibold">No tables created</span>
          <span className="text-sm mt-1">Click the "Add Table" button above to get started</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              waiters={waiters}
              onAssignWaiter={handleAssignWaiter}
              onOpenOrder={setActiveTable}
              onDelete={handleDeleteTable}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddTableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onAdd={handleAddTable}
      />

      <AddWaiterModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        onAdd={handleAddWaiter}
      />

      {/* Success Toast */}
      {toast && (
        <div className="absolute bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-3.5 text-white shadow-xl toast-enter border border-white/5">
          <MdCheckCircle className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default TablesPage;
