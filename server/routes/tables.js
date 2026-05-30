// ============================================
// TABLES ROUTES
// Manage restaurant tables and their orders
// ============================================

const express = require('express');
const { all, get, run } = require('../database/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/tables ----
router.get('/', authenticate, (req, res) => {
  const tables = all(`
    SELECT 
      tables.*,
      waiters.name as waiter_name,
      COALESCE(SUM(table_items.quantity), 0) as item_count,
      COALESCE(SUM(table_items.quantity * items.price), 0) as current_total
    FROM tables
    LEFT JOIN waiters ON tables.waiter_id = waiters.id
    LEFT JOIN table_items ON tables.id = table_items.table_id
    LEFT JOIN items ON table_items.item_id = items.id
    GROUP BY tables.id
    ORDER BY tables.name
  `);

  res.json(tables);
});

// ---- POST /api/tables ----
router.post('/', authenticate, adminOnly, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Table name is required' });
  }

  const result = run('INSERT INTO tables (name) VALUES (?)', [name]);
  res.status(201).json({ id: result.lastInsertRowid, name, status: 'available' });
});

// ---- PUT /api/tables/:id ----
router.put('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { waiter_id, status } = req.body;

  if (waiter_id !== undefined && status !== undefined) {
    run('UPDATE tables SET waiter_id = ?, status = ? WHERE id = ?', [waiter_id, status, id]);
  } else if (waiter_id !== undefined) {
    run("UPDATE tables SET waiter_id = ?, status = 'occupied' WHERE id = ?", [waiter_id, id]);
  } else if (status !== undefined) {
    run('UPDATE tables SET status = ? WHERE id = ?', [status, id]);
  }

  const table = get(`
    SELECT tables.*, waiters.name as waiter_name
    FROM tables
    LEFT JOIN waiters ON tables.waiter_id = waiters.id
    WHERE tables.id = ?
  `, [id]);

  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }

  res.json(table);
});

// ---- DELETE /api/tables/:id ----
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;

  run('DELETE FROM table_items WHERE table_id = ?', [id]);
  const result = run('DELETE FROM tables WHERE id = ?', [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Table not found' });
  }

  res.json({ message: 'Table deleted' });
});

// ============================================
// TABLE ITEMS
// ============================================

// ---- GET /api/tables/:id/items ----
router.get('/:id/items', authenticate, (req, res) => {
  const { id } = req.params;

  const items = all(`
    SELECT 
      table_items.id as table_item_id,
      table_items.quantity,
      items.id as item_id,
      items.name,
      items.price
    FROM table_items
    JOIN items ON table_items.item_id = items.id
    WHERE table_items.table_id = ?
    ORDER BY items.name
  `, [id]);

  res.json(items);
});

// ---- POST /api/tables/:id/items ----
router.post('/:id/items', authenticate, (req, res) => {
  const { id } = req.params;
  const { item_id } = req.body;

  if (!item_id) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  const existing = get(
    'SELECT * FROM table_items WHERE table_id = ? AND item_id = ?', [id, item_id]
  );

  if (existing) {
    run('UPDATE table_items SET quantity = quantity + 1 WHERE id = ?', [existing.id]);
  } else {
    run('INSERT INTO table_items (table_id, item_id, quantity) VALUES (?, ?, 1)', [id, item_id]);
  }

  run("UPDATE tables SET status = 'occupied' WHERE id = ?", [id]);

  const items = all(`
    SELECT 
      table_items.id as table_item_id,
      table_items.quantity,
      items.id as item_id,
      items.name,
      items.price
    FROM table_items
    JOIN items ON table_items.item_id = items.id
    WHERE table_items.table_id = ?
    ORDER BY items.name
  `, [id]);

  res.json(items);
});

// ---- PUT /api/tables/:id/items/:tableItemId ----
router.put('/:id/items/:tableItemId', authenticate, (req, res) => {
  const { id, tableItemId } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    run('DELETE FROM table_items WHERE id = ? AND table_id = ?', [tableItemId, id]);
  } else {
    run('UPDATE table_items SET quantity = ? WHERE id = ? AND table_id = ?', [quantity, tableItemId, id]);
  }

  const items = all(`
    SELECT 
      table_items.id as table_item_id,
      table_items.quantity,
      items.id as item_id,
      items.name,
      items.price
    FROM table_items
    JOIN items ON table_items.item_id = items.id
    WHERE table_items.table_id = ?
    ORDER BY items.name
  `, [id]);

  res.json(items);
});

// ---- DELETE /api/tables/:id/items/:tableItemId ----
router.delete('/:id/items/:tableItemId', authenticate, (req, res) => {
  const { id, tableItemId } = req.params;

  run('DELETE FROM table_items WHERE id = ? AND table_id = ?', [tableItemId, id]);

  const items = all(`
    SELECT 
      table_items.id as table_item_id,
      table_items.quantity,
      items.id as item_id,
      items.name,
      items.price
    FROM table_items
    JOIN items ON table_items.item_id = items.id
    WHERE table_items.table_id = ?
    ORDER BY items.name
  `, [id]);

  res.json(items);
});

// ---- POST /api/tables/:id/pay ----
router.post('/:id/pay', authenticate, (req, res) => {
  const { id } = req.params;

  const table = get(`
    SELECT tables.*, waiters.name as waiter_name
    FROM tables
    LEFT JOIN waiters ON tables.waiter_id = waiters.id
    WHERE tables.id = ?
  `, [id]);

  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }

  const tableItems = all(`
    SELECT table_items.quantity, items.id as item_id, items.name, items.price
    FROM table_items
    JOIN items ON table_items.item_id = items.id
    WHERE table_items.table_id = ?
  `, [id]);

  if (tableItems.length === 0) {
    return res.status(400).json({ error: 'No items on this table' });
  }

  const total = tableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Create order
  const orderResult = run(
    'INSERT INTO orders (order_type, table_name, waiter_name, total, created_by) VALUES (?, ?, ?, ?, ?)',
    ['dine-in', table.name, table.waiter_name, total, req.user.id]
  );

  // Save order items
  tableItems.forEach(item => {
    run(
      'INSERT INTO order_items (order_id, item_id, item_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
      [orderResult.lastInsertRowid, item.item_id, item.name, item.price, item.quantity]
    );
  });

  // Clear table
  run('DELETE FROM table_items WHERE table_id = ?', [id]);
  run("UPDATE tables SET status = 'available', waiter_id = NULL WHERE id = ?", [id]);

  res.json({
    message: 'Table paid and closed successfully',
    order_id: orderResult.lastInsertRowid,
    total,
  });
});

module.exports = router;
