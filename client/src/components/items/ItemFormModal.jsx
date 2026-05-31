import React, { useState, useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';

const ItemFormModal = ({ isOpen, onClose, onSave, categories, editItem = null }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Prefill form if editing
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPrice(editItem.price);
      setCategoryId(editItem.category_id);
      setImagePreview(editItem.image_url || null);
    } else {
      setName('');
      setPrice('');
      setCategoryId('');
      setImagePreview(null);
    }
    setImageFile(null);
    setError('');
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Revoke old object URL to avoid memory leak
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      category_id: parseInt(categoryId),
      image_file: imageFile,
      image_url: imageFile ? null : imagePreview, // existing URL if no new file
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

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Item Image <span className="text-slate-400 font-normal">(optional)</span>
            </label>

            {imagePreview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    Change
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={submitting}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={submitting}
                    className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-primary-400 transition-all group">
                <svg
                  className="h-8 w-8 text-slate-300 group-hover:text-primary-400 transition-colors mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-primary-500 transition-colors">
                  Click to upload image
                </span>
                <span className="text-xs text-slate-300 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={submitting}
                />
              </label>
            )}
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