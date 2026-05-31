import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  MdSettings, 
  MdPeople, 
  MdSave, 
  MdPersonAdd, 
  MdEdit, 
  MdDelete, 
  MdVpnKey, 
  MdRefresh 
} from 'react-icons/md';

const SettingsPage = () => {
  // Configs and System States
  const [settings, setSettings] = useState({
    restaurant_name: '',
    tax_rate: '0',
    service_charges: '0',
    currency: 'PKR'
  });
  
  // User Management Directory States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userTab, setUserTab] = useState('list'); // 'list' | 'create' | 'edit' | 'password'

  // Form Management Buffer States
  const [userForm, setUserForm] = useState({ id: '', username: '', password: '', role: 'user' });
  const [passForm, setPassForm] = useState({ id: '', username: '', newPassword: '' });

  useEffect(() => {
    fetchSystemConfigurations();
    fetchOperatorsList();
  }, []);

  // ---- API OPERATIONS ----
  
  const fetchSystemConfigurations = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSettings({
          restaurant_name: res.data.restaurant_name || '',
          tax_rate: res.data.tax_rate || '0',
          service_charges: res.data.service_charges || '0',
          currency: res.data.currency || 'PKR'
        });
      }
    } catch (err) {
      console.error('Failed to resolve system settings variables:', err);
    }
  };

  const fetchOperatorsList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load employee directories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      alert('Global configurations saved successfully!');
      fetchSystemConfigurations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update system settings profiles.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings/users', userForm);
      alert('Operator credentials successfully registered.');
      resetUserForms();
      fetchOperatorsList();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save new operator.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/settings/users/${userForm.id}`, {
        username: userForm.username,
        role: userForm.role
      });
      alert('Operator details successfully updated.');
      resetUserForms();
      fetchOperatorsList();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update operator records.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/settings/users/${passForm.id}/reset-password`, {
        newPassword: passForm.newPassword
      });
      alert('Password updated successfully.');
      resetUserForms();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed security passcode overwrite.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete @${name}?`)) return;
    try {
      await api.delete(`/settings/users/${id}`);
      fetchOperatorsList();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove operator profile.');
    }
  };

  // ---- UTILITY TOGGLES ----
  const triggerEditView = (user) => {
    setUserForm({ id: user.id, username: user.username, password: '', role: user.role });
    setUserTab('edit');
  };

  const triggerPasswordView = (user) => {
    setPassForm({ id: user.id, username: user.username, newPassword: '' });
    setUserTab('password');
  };

  const resetUserForms = () => {
    setUserForm({ id: '', username: '', password: '', role: 'user' });
    setPassForm({ id: '', username: '', newPassword: '' });
    setUserTab('list');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Upper Title Description */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Controls & Settings</h1>
        <p className="text-sm text-gray-500">Configure core taxes, business variables, and system terminal operators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Settings Form Block */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-2">
            <MdSettings className="text-indigo-600" /> Global Architecture
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Company / Restaurant Name</label>
              <input 
                type="text" required value={settings.restaurant_name}
                onChange={(e) => setSettings({...settings, restaurant_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tax Rate (%)</label>
                <input 
                  type="number" step="0.01" min="0" required value={settings.tax_rate}
                  onChange={(e) => setSettings({...settings, tax_rate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Service Charges (%)</label>
                <input 
                  type="number" step="0.01" min="0" required value={settings.service_charges}
                  onChange={(e) => setSettings({...settings, service_charges: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">System Base Currency</label>
              <select 
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="PKR">Pakistani Rupee (PKR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="AED">UAE Dirham (AED)</option>
              </select>
            </div>

            <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm">
              <MdSave size={18} /> Save Dynamic Variables
            </button>
          </form>
        </div>

        {/* User Account Controls Sub-Management Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            {/* Context Header */}
            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MdPeople className="text-indigo-600" /> Operator Directories
              </h2>
              {userTab === 'list' ? (
                <button 
                  onClick={() => setUserTab('create')}
                  className="text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                >
                  <MdPersonAdd size={14} /> Add System User
                </button>
              ) : (
                <button onClick={resetUserForms} className="text-xs font-bold text-gray-400 hover:text-gray-600">
                  Cancel Operations
                </button>
              )}
            </div>

            {/* Sub-tab view router screens */}
            {userTab === 'list' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                      <th className="px-4 py-3">Account Username</th>
                      <th className="px-4 py-3">Assigned Role</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                      <tr><td colSpan={3} className="text-center py-6 text-gray-400">Syncing database entries...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-6 text-gray-400">No matching operators found.</td></tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-900">@{u.username}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-black tracking-wide ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1">
                            <button onClick={() => triggerEditView(u)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg transition-all" title="Edit Metadata"><MdEdit size={16} /></button>
                            <button onClick={() => triggerPasswordView(u)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg transition-all" title="Force Password Reset"><MdVpnKey size={16} /></button>
                            <button onClick={() => handleDeleteUser(u.id, u.username)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-all" title="Wipe Profile"><MdDelete size={16} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {userTab === 'create' && (
              <form onSubmit={handleCreateUser} className="space-y-4 max-w-md pt-2">
                <h3 className="text-sm font-bold text-gray-700 uppercase">Register New Operator Credentials</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Username</label>
                  <input type="text" required value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="e.g. counter_clerk" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
                  <input type="password" required minLength={4} value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Minimum 4 alpha-characters" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Structural Clearance Role</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                    <option value="user">User (Cashier/Waiter Terminals)</option>
                    <option value="admin">Admin (Full Permissions)</option>
                  </select>
                </div>
                <button type="submit" className="bg-indigo-600 text-white font-medium px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-sm">Save Terminal Account</button>
              </form>
            )}

            {userTab === 'edit' && (
              <form onSubmit={handleUpdateUser} className="space-y-4 max-w-md pt-2">
                <h3 className="text-sm font-bold text-gray-700 uppercase">Alter Information for @{userForm.username}</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Account Username</label>
                  <input type="text" required value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Structural Clearance Role</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                    <option value="user">User (Cashier/Waiter Terminals)</option>
                    <option value="admin">Admin (Full Permissions)</option>
                  </select>
                </div>
                <button type="submit" className="bg-indigo-600 text-white font-medium px-5 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-sm">Commit System Changes</button>
              </form>
            )}

            {userTab === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4 max-w-md pt-2">
                <h3 className="text-sm font-bold text-amber-700 uppercase flex items-center gap-1"><MdVpnKey /> Force Passcode Overwrite (@{passForm.username})</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Enter New Security Password</label>
                  <input type="password" required minLength={4} value={passForm.newPassword} onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})} className="w-full px-4 py-2 border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none rounded-xl text-sm" placeholder="Minimum 4 characters" />
                </div>
                <button type="submit" className="bg-amber-600 text-white font-medium px-5 py-2 rounded-xl text-sm hover:bg-amber-700 transition-all shadow-sm">Override Credentials</button>
              </form>
            )}
          </div>

          {/* Footer Trigger Sync Button */}
          {userTab === 'list' && (
            <div className="pt-4 mt-4 border-t border-gray-50 flex justify-end">
              <button onClick={fetchOperatorsList} className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-all">
                <MdRefresh /> Resync Active Users
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;