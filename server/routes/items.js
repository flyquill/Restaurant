// ============================================
// ITEMS ROUTES
// CRUD operations for menu items with automated inventory triggers
// ============================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { all, get, run } = require('../database/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---- Multer setup ----
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'items');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                  allowed.test(file.mimetype);
    if (valid) cb(null, true);
    else cb(new Error('Only JPEG, PNG, and WEBP images are allowed'));
  },
});

// Helper: delete an image file from disk (ignores missing files)
const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;
  try {
    const filename = path.basename(imageUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Failed to delete image file:', err);
  }
};

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

// ---- POST /api/items/upload-image ----
router.post('/upload-image', authenticate, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const url = `/uploads/items/${req.file.filename}`;
  res.status(201).json({ url });
});

// ---- POST /api/items ----
router.post('/', authenticate, adminOnly, (req, res) => {
  const { name, price, category_id, image_url } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const result = run(
    'INSERT INTO items (name, price, category_id, image_url) VALUES (?, ?, ?, ?)',
    [name, price, category_id, image_url || null]
  );

  const newItemId = result.lastInsertRowid;

  // Automatically initialize stock control schema parameters for this food item
  run(
    "INSERT OR IGNORE INTO inventory (item_id, current_stock, min_stock, unit) VALUES (?, 0, 10, 'pcs')",
    [newItemId]
  );

  const item = get(`
    SELECT items.*, categories.name as category_name
    FROM items
    JOIN categories ON items.category_id = categories.id
    WHERE items.id = ?
  `, [newItemId]);

  res.status(201).json(item);
});

// ---- PUT /api/items/:id ----
router.put('/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  const { name, price, category_id, image_url } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const existing = get('SELECT image_url FROM items WHERE id = ?', [id]);
  if (existing && existing.image_url && existing.image_url !== image_url) {
    deleteImageFile(existing.image_url);
  }

  const result = run(
    'UPDATE items SET name = ?, price = ?, category_id = ?, image_url = ? WHERE id = ?',
    [name, price, category_id, image_url || null, id]
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

  const existing = get('SELECT image_url FROM items WHERE id = ?', [id]);
  if (existing?.image_url) deleteImageFile(existing.image_url);

  const result = run('UPDATE items SET is_active = 0, image_url = NULL WHERE id = ?', [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({ message: 'Item deleted' });
});

router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image must be under 5MB' });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;