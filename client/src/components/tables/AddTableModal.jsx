import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';

const AddTableModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError('');
    setSubmitting(true);
    const result = await onAdd(name.trim());
    setSubmitting(false);

    if (result.success) {
      setName('');
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <h3 className="text-lg font-bold text-slate-800">Add New Table</h3>
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
            <label className="block text-sm font-semibold text-slate-600 mb-2">Table Name / Number</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Table 4"
              className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all text-sm font-medium"
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Create Table'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTableModal;
