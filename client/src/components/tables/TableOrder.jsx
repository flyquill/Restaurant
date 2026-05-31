import React, { useState, useEffect } from 'react';
import api from '../../api';
import CategoryBar from '../takeaway/CategoryBar';
import ItemsGrid from '../takeaway/ItemsGrid';
import Cart from '../takeaway/Cart';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';

const TableOrder = ({ table, onBack, onOrderSettled }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [tableCart, setTableCart] = useState([]);
  
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const url = activeCategory ? `/items?category=${activeCategory}` : '/items';
        const response = await api.get(url);
        setItems(response.data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, [activeCategory]);

  const fetchTableCart = async () => {
    setLoadingCart(true);
    try {
      const response = await api.get(`/tables/${table.id}/items`);
      const mapped = response.data.map(item => ({
        id: item.item_id,
        table_item_id: item.table_item_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      setTableCart(mapped);
    } catch (err) {
      console.error('Error fetching table items:', err);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchTableCart();
  }, [table.id]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddItem = async (item) => {
    try {
      const response = await api.post(`/tables/${table.id}/items`, { item_id: item.id });
      const mapped = response.data.map(i => ({
        id: i.item_id,
        table_item_id: i.table_item_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }));
      setTableCart(mapped);
      showToast(`Added ${item.name}`);
    } catch (err) {
      console.error('Error adding item to table:', err);
      alert('Failed to add item to table');
    }
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    const cartItem = tableCart.find(i => i.id === itemId);
    if (!cartItem) return;
    try {
      const response = await api.put(`/tables/${table.id}/items/${cartItem.table_item_id}`, { quantity: newQty });
      const mapped = response.data.map(i => ({
        id: i.item_id,
        table_item_id: i.table_item_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }));
      setTableCart(mapped);
    } catch (err) {
      console.error('Error updating item quantity:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    const cartItem = tableCart.find(i => i.id === itemId);
    if (!cartItem) return;
    try {
      const response = await api.delete(`/tables/${table.id}/items/${cartItem.table_item_id}`);
      const mapped = response.data.map(i => ({
        id: i.item_id,
        table_item_id: i.table_item_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }));
      setTableCart(mapped);
      showToast('Item removed');
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handlePayAndClose = async () => {
    if (tableCart.length === 0) return;
    if (!window.confirm(`Confirm payment and close ${table.name}?`)) return;
    setIsProcessing(true);
    try {
      await api.post(`/tables/${table.id}/pay`);
      showToast('🎉 Table order settled!');
      setTimeout(() => onOrderSettled(), 1000);
    } catch (err) {
      console.error('Error closing table:', err);
      alert(err.response?.data?.error || 'Failed to settle table');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-6 relative">
      {/* Left panel — fixed layout, grid scrolls independently */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* Static header — never scrolls */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center space-x-4 select-none">
            <button
              onClick={onBack}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <MdArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{table.name} order</h1>
              <p className="text-slate-400 text-sm mt-0.5">Assigned to: <span className="font-semibold text-slate-600">{table.waiter_name}</span></p>
            </div>
          </div>
        </div>

        {/* Category bar — never scrolls */}
        <div className="flex-shrink-0 px-6">
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Items grid — only this scrolls */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
          <ItemsGrid
            items={items}
            loading={loadingItems}
            onAddItem={handleAddItem}
          />
        </div>
      </div>

      {/* Cart — right side */}
      <Cart
        cartItems={tableCart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
        onClear={null}
        onPlaceOrder={handlePayAndClose}
        isPlacing={isProcessing}
        tableName={table.name}
        waiterName={table.waiter_name}
      />

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-3.5 text-white shadow-xl toast-enter border border-white/5">
          <MdCheckCircle className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default TableOrder;