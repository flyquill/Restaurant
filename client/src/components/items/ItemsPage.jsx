import React, { useState, useEffect } from 'react';
import api from '../../api';
import ItemFormModal from './ItemFormModal';
import { MdAdd, MdEdit, MdDeleteOutline, MdSearch, MdCheckCircle } from 'react-icons/md';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [toast, setToast] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Add or Edit save callback
  const handleSaveItem = async (itemData) => {
    try {
      // If image is a File object, upload it first
      let imageUrl = itemData.image_url;
      if (itemData.image_file instanceof File) {
        const formData = new FormData();
        formData.append('image', itemData.image_file);
        const uploadRes = await api.post('/items/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.url;
      }

      const payload = {
        name: itemData.name,
        category_id: itemData.category_id,
        price: itemData.price,
        image_url: imageUrl || null,
      };

      if (editingItem) {
        await api.put(`/items/${editingItem.id}`, payload);
        showToast(`Updated item "${payload.name}"`);
      } else {
        await api.post('/items', payload);
        showToast(`Created item "${payload.name}"`);
      }
      await fetchItems();
      return { success: true };
    } catch (err) {
      console.error('Error saving item:', err);
      return { success: false, error: err.response?.data?.error || 'Failed to save item' };
    }
  };

  // Delete item action (soft delete)
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      await fetchItems();
      showToast('Item deleted');
    } catch (err) {
      console.error('Error deleting item:', err);
      alert(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Filters calculation
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category_id === parseInt(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 relative select-none">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Items Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage menu categories, items, and pricing</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-white hover:bg-primary-600 shadow-sm shadow-primary-500/10 transition-colors"
        >
          <MdAdd size={20} />
          <span>Add Menu Item</span>
        </button>
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
            placeholder="Search items by name..."
            className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-slate-700 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all text-sm font-medium"
          />
        </div>

        {/* Category dropdown filter */}
        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm font-medium text-slate-600 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items list table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
          <div className="h-14 bg-slate-50 border-b border-slate-100" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-slate-100 flex items-center px-6 justify-between">
              <div className="flex space-x-6 flex-1 items-center">
                <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="h-4 w-24 bg-slate-200 rounded-md" />
                <div className="h-4 w-16 bg-slate-200 rounded-md" />
              </div>
              <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
          <svg className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-lg font-semibold">No items found</span>
          <span className="text-sm mt-1">Try expanding your search query or filters</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {/* NEW: Image column */}
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price (PKR)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* NEW: Item thumbnail */}
                    <td className="whitespace-nowrap px-6 py-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-800 text-sm">{item.name}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-primary-600">
                        {item.category_name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-extrabold text-slate-900 text-sm">
                      ₨ {item.price.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Edit Item"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete Item"
                        >
                          <MdDeleteOutline size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        categories={categories}
        editItem={editingItem}
      />

      {/* Success Toast */}
      {toast && (
        <div className="absolute right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-3.5 text-white shadow-xl toast-enter border border-white/5">
          <MdCheckCircle className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default ItemsPage;