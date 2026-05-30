// ============================================
// WAITERS ROUTES
// ============================================

const express = require('express');
const { all, run } = require('../database/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/waiters ----
router.get('/', authenticate, (req, res) => {
  const waiters = all('SELECT * FROM waiters WHERE is_active = 1 ORDER BY name');
  res.json(waiters);
});

// ---- POST /api/waiters ----
router.post('/', authenticate, adminOnly, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Waiter name is required' });
  }

  const result = run('INSERT INTO waiters (name) VALUES (?)', [name]);
  res.status(201).json({ id: result.lastInsertRowid, name, is_active: 1 });
});

// ---- DELETE /api/waiters/:id ----
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;

  const result = run('UPDATE waiters SET is_active = 0 WHERE id = ?', [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Waiter not found' });
  }

  res.json({ message: 'Waiter removed' });
});

module.exports = router;
