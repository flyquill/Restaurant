// ============================================
// ITEMS ROUTES
// CRUD operations for menu items
// ============================================

const express = require('express');
const { all, get, run } = require('../database/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/items ----
router.get('/', authenticate, (req, res) => {
  const { category } = req.query;

  let items;

  if (category) {
    items = all(`
      SELECT items.*, categories.name as category_name
      FROM items
      JOIN categories ON items.category_id = categories.id
      WHERE items.category_id = ? AND items.is_active = 1
      ORDER BY items.name
    `, [category]);
  } else {
    items = all(`
      SELECT items.*, categories.name as category_name
      FROM items
      JOIN categories ON items.category_id = categories.id
      WHERE items.is_active = 1
      ORDER BY items.name
    `);
  }

  res.json(items);
});

// ---- POST /api/items ----
router.post('/', authenticate, adminOnly, (req, res) => {
  const { name, price, category_id } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const result = run(
    'INSERT INTO items (name, price, category_id) VALUES (?, ?, ?)',
    [name, price, category_id]
  );

  const item = get(`
    SELECT items.*, categories.name as category_name
    FROM items
    JOIN categories ON items.category_id = categories.id
    WHERE items.id = ?
  `, [result.lastInsertRowid]);

  res.status(201).json(item);
});

// ---- PUT /api/items/:id ----
router.put('/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  const { name, price, category_id } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const result = run(
    'UPDATE items SET name = ?, price = ?, category_id = ? WHERE id = ?',
    [name, price, category_id, id]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const item = get(`
    SELECT items.*, categories.name as category_name
    FROM items
    JOIN categories ON items.category_id = categories.id
    WHERE items.id = ?
  `, [id]);

  res.json(item);
});

// ---- DELETE /api/items/:id ----
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;

  const result = run('UPDATE items SET is_active = 0 WHERE id = ?', [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({ message: 'Item deleted' });
});

module.exports = router;
