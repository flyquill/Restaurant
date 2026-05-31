// ============================================
// INVENTORY & STOCK MANAGEMENT ROUTES
// Handles stock tracking, alerts, waste logs, and purchase orders
// ============================================

const express = require('express');
const { all, get, run } = require('../database/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/inventory ----
// Fetches current stock levels with an evaluated low_stock alert state flag
router.get('/', authenticate, (req, res) => {
  const inventory = all(`
    SELECT 
      i.id,
      i.item_id,
      i.current_stock,
      i.min_stock,
      i.unit,
      i.supplier_name,
      i.updated_at,
      item.name as name,
      item.price as price,
      cat.name as category_name,
      (i.current_stock <= i.min_stock) as is_low_stock
    FROM inventory i
    JOIN items item ON i.item_id = item.id
    JOIN categories cat ON item.category_id = cat.id
    WHERE item.is_active = 1
    ORDER BY item.name
  `);

  res.json(inventory);
});

// ---- PUT /api/inventory/adjust ----
// Manually adjusts stock levels (e.g., Quick Add or physical count corrections)
router.put('/adjust', authenticate, adminOnly, (req, res) => {
  const { item_id, quantity } = req.body;

  if (!item_id || quantity === undefined) {
    return res.status(400).json({ error: 'Item ID and quantity adjustment are required' });
  }

  const result = run(
    `UPDATE inventory 
     SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP 
     WHERE item_id = ?`,
    [quantity, item_id]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Inventory profile for item not found' });
  }

  res.json({ message: 'Stock level updated successfully' });
});

// ============================================
// SUPPLIER PURCHASE ORDERS (PO)
// ============================================

// ---- GET /api/inventory/orders ----
// Retrieves all purchase orders matched with item details
router.get('/orders', authenticate, adminOnly, (req, res) => {
  const purchaseOrders = all(`
    SELECT po.*, item.name as item_name 
    FROM purchase_orders po
    JOIN items item ON po.item_id = item.id
    ORDER BY po.created_at DESC
  `);
  res.json(purchaseOrders);
});

// ---- POST /api/inventory/orders ----
// Creates a new pending supplier shipment purchase order
router.post('/orders', authenticate, adminOnly, (req, res) => {
  const { supplier_name, item_id, quantity, cost_price } = req.body;

  if (!supplier_name || !item_id || !quantity || !cost_price) {
    return res.status(400).json({ error: 'Supplier name, item, quantity, and cost price are required' });
  }

  const result = run(
    `INSERT INTO purchase_orders (supplier_name, item_id, quantity, cost_price, status) 
     VALUES (?, ?, ?, ?, 'pending')`,
    [supplier_name, item_id, quantity, cost_price]
  );

  res.status(201).json({ 
    message: 'Purchase order logged successfully', 
    id: result.lastInsertRowid 
  });
});

// ---- PUT /api/inventory/orders/:id/receive ----
// Approves a purchase order shipment, changing its status and adding to inventory
router.put('/orders/:id/receive', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;

  const po = get('SELECT * FROM purchase_orders WHERE id = ?', [id]);

  if (!po) {
    return res.status(404).json({ error: 'Purchase order not found' });
  }

  if (po.status === 'received') {
    return res.status(400).json({ error: 'Purchase order has already been closed and items added' });
  }

  // 1. Mark purchase order status row as received
  run(
    `UPDATE purchase_orders 
     SET status = 'received', received_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [id]
  );

  // 2. Add the shipment quantity to current inventory levels
  run(
    `UPDATE inventory 
     SET current_stock = current_stock + ?, 
         supplier_name = ?,
         updated_at = CURRENT_TIMESTAMP 
     WHERE item_id = ?`,
    [po.quantity, po.supplier_name, po.item_id]
  );

  res.json({ message: 'Shipment received, and inventory counts successfully increased.' });
});

// ============================================
// WASTE CONTROLS (SPENT / SPOILED STOCK)
// ============================================

// ---- GET /api/inventory/waste ----
// Fetches the historically logged waste history rows
router.get('/waste', authenticate, adminOnly, (req, res) => {
  const logs = all(`
    SELECT wl.*, item.name as item_name, u.username as logged_by_user
    FROM waste_logs wl
    JOIN items item ON wl.item_id = item.id
    LEFT JOIN users u ON wl.logged_by = u.id
    ORDER BY wl.created_at DESC
  `);
  res.json(logs);
});

// ---- POST /api/inventory/waste ----
// Deducts spoiled/damaged inventory and links the event to a waste log record
router.post('/waste', authenticate, (req, res) => {
  const { item_id, quantity, reason } = req.body;

  if (!item_id || !quantity || !reason) {
    return res.status(400).json({ error: 'Item ID, quantity, and waste rationale are required' });
  }

  // Verify stock exists before trying to subtract waste
  const inv = get('SELECT current_stock FROM inventory WHERE item_id = ?', [item_id]);
  if (!inv) {
    return res.status(404).json({ error: 'Inventory stock record not found for this item' });
  }

  // 1. Log the historical waste log line item record
  run(
    `INSERT INTO waste_logs (item_id, quantity, reason, logged_by) 
     VALUES (?, ?, ?, ?)`,
    [item_id, quantity, reason, req.user.id]
  );

  // 2. Reduce the spoiled stock units from active inventory levels
  run(
    `UPDATE inventory 
     SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP 
     WHERE item_id = ?`,
    [quantity, item_id]
  );

  res.status(201).json({ message: 'Waste event registered, item stock counts reduced.' });
});

module.exports = router;