import React, { useState, useEffect } from 'react';
import api from '../../api';
import CategoryBar from './CategoryBar';
import ItemsGrid from './ItemsGrid';
import Cart from './Cart';
import { MdCheckCircle } from 'react-icons/md';

const TakeawayPage = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);
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

  // Inside TakeawayPage.jsx

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const url = activeCategory ? `/items?category=${activeCategory}` : '/items';
        const response = await api.get(url);
        const rawItems = response.data;

        // 1. Retrieve the saved order array from localStorage
        const savedOrderString = localStorage.getItem('takeaway_items_order');

        if (savedOrderString) {
          const savedOrder = JSON.parse(savedOrderString); // This is an array of IDs

          // 2. Sort incoming items to match the order of IDs in our saved array
          const sortedItems = [...rawItems].sort((a, b) => {
            const indexA = savedOrder.indexOf(a.id);
            const indexB = savedOrder.indexOf(b.id);

            // If an item isn't in the saved configuration (e.g., a newly created item), 
            // push it to the end of the list safely
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
          });

          setItems(sortedItems);
        } else {
          // Fallback to default backend order if nothing is saved in localStorage yet
          setItems(rawItems);
        }

      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [activeCategory]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddItem = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    showToast(`Added ${item.name} to cart`);
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === itemId ? { ...cartItem, quantity: newQty } : cartItem
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    const item = cart.find((i) => i.id === itemId);
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== itemId));
    if (item) showToast(`Removed ${item.name} from cart`);
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Cart cleared');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacing(true);
    try {
      const orderItems = cart.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      await api.post('/orders', { items: orderItems });
      setCart([]);
      showToast('🎉 Takeaway order placed successfully!');
    } catch (err) {
      console.error('Error placing order:', err);
      alert(err.response?.data?.error || 'Failed to place order');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-6 relative">
      {/* Left panel — fixed layout, grid scrolls independently */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* Static header — never scrolls */}
        <div className="flex-shrink-0 px-6 pt-6 pb-2">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Takeaway Orders</h1>
          <p className="text-slate-400 text-sm mt-0.5">Select items to build a takeaway order</p>
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
            setItems={setItems}
            loading={loadingItems}
            onAddItem={handleAddItem}
          />
        </div>
      </div>

      {/* Cart — right side */}
      <Cart
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
        onClear={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        isPlacing={isPlacing}
      />

      {/* Toast */}
      {toast && (
        <div className="absolute right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-3.5 text-white shadow-xl toast-enter border border-white/5">
          <MdCheckCircle className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default TakeawayPage;