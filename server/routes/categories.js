// ============================================
// CATEGORIES ROUTES
// ============================================

const express = require('express');
const { all, get, run } = require('../database/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/categories ----
router.get('/', authenticate, (req, res) => {
  const categories = all('SELECT * FROM categories ORDER BY name');
  res.json(categories);
});

// ---- POST /api/categories ----
router.post('/', authenticate, adminOnly, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const result = run('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.lastInsertRowid, name });
  } catch (err) {
    res.status(400).json({ error: 'Category already exists' });
  }
});

// ---- DELETE /api/categories/:id ----
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;

  const itemCount = get('SELECT COUNT(*) as count FROM items WHERE category_id = ?', [id]);
  if (itemCount && itemCount.count > 0) {
    return res.status(400).json({ error: 'Cannot delete category that has items' });
  }

  const result = run('DELETE FROM categories WHERE id = ?', [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({ message: 'Category deleted' });
});

module.exports = router;
