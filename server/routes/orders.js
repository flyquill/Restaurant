// ============================================
// ORDERS ROUTES
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

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Create order
  const orderResult = run(
    'INSERT INTO orders (order_type, total, created_by) VALUES (?, ?, ?)',
    ['takeaway', total, req.user.id]
  );

  // Save order items
  items.forEach(item => {
    run(
      'INSERT INTO order_items (order_id, item_id, item_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
      [orderResult.lastInsertRowid, item.item_id, item.item_name, item.price, item.quantity]
    );
  });

  res.status(201).json({
    message: 'Order placed successfully!',
    order_id: orderResult.lastInsertRowid,
    total,
  });
});

module.exports = router;
