import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const ItemFormModal = ({ isOpen, onClose, onSave, categories, editItem = null }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Prefill form if editing
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPrice(editItem.price);
      setCategoryId(editItem.category_id);
    } else {
      setName('');
      setPrice('');
      setCategoryId('');
    }
    setError('');
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) {
      setError('Please fill in all fields');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price greater than 0');
      return;
    }

    setError('');
    setSubmitting(true);

    const itemData = {
      name: name.trim(),
      price: priceNum,
      category_id: parseInt(categoryId)
    };

    const result = await onSave(itemData);
    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <h3 className="text-lg font-bold text-slate-800">
            {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Shawarma"
              className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all text-sm font-medium"
              required
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Price (₨)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="300"
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all text-sm font-medium"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-3 text-sm font-medium text-slate-600 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                required
                disabled={submitting}
              >
                <option value="">Select...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : editItem ? 'Save Changes' : 'Create Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
