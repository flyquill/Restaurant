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

  // Load categories and menu items
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

  // Fetch items whenever selected category changes
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

  // Toast helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Add item to cart
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

  // Update item quantity
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

  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    const item = cart.find((i) => i.id === itemId);
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== itemId));
    if (item) {
      showToast(`Removed ${item.name} from cart`);
    }
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
    showToast('Cart cleared');
  };

  // Place takeaway order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsPlacing(true);
    try {
      // Map cart to backend order item structure
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
      {/* Menu / Items Grid Area - Left */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="mb-2">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Takeaway Orders</h1>
          <p className="text-slate-400 text-sm mt-0.5">Select items to build a takeaway order</p>
        </div>

        {/* Categories Bar */}
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Items Grid */}
        <ItemsGrid
          items={items}
          loading={loadingItems}
          onAddItem={handleAddItem}
        />
      </div>

      {/* Cart Area - Right */}
      <Cart
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
        onClear={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        isPlacing={isPlacing}
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

export default TakeawayPage;
