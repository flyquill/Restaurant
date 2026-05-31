// ============================================
// ORDERS ROUTES (With Stock Tracking)
// ============================================

const express = require('express');
const { all, run } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/orders ----
router.get('/', authenticate, (req, res) => {
  const orders = all('SELECT * FROM orders ORDER BY created_at DESC');

  const ordersWithItems = orders.map(order => ({
    ...order,
    items: all('SELECT * FROM order_items WHERE order_id = ?', [order.id]),
  }));

  res.json(ordersWithItems);
});

// ---- POST /api/orders ----
router.post('/', authenticate, (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }

  // Calculate order items totals
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 1. Create order header log
  const orderResult = run(
    'INSERT INTO orders (order_type, total, created_by) VALUES (?, ?, ?)',
    ['takeaway', total, req.user.id]
  );

  const orderId = orderResult.lastInsertRowid;

  // 2. Process order items & adjust inventory counts
  items.forEach(item => {
    // Log item specifics for order details
    run(
      'INSERT INTO order_items (order_id, item_id, item_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
      [orderId, item.item_id, item.item_name, item.price, item.quantity]
    );

    // Automatically decrement current stock mapping inside inventory
    run(
      `UPDATE inventory 
       SET current_stock = current_stock - ?, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE item_id = ?`,
      [item.quantity, item.item_id]
    );
  });

  res.status(201).json({
    message: 'Order placed successfully and stock adjusted!',
    order_id: orderId,
    total,
  });
});

module.exports = router;