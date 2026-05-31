// ============================================
// REPORTS & ANALYTICS ROUTES
// Generates commercial insights, velocity rankings, and audit statistics
// ============================================

const express = require('express');
const { all, get } = require('../database/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/reports/dashboard ----
// Compiles full financial KPIs and breakdown graphs for a date range
router.get('/dashboard', authenticate, adminOnly, (req, res) => {
  const { startDate, endDate } = req.query;

  // Build reactive date filters (Defaults to current day if no queries are parsed)
  let dateCondition = "date(created_at) = date('now', 'localtime')";
  let params = [];

  if (startDate && endDate) {
    dateCondition = "date(created_at) BETWEEN date(?) AND date(?)";
    params = [startDate, endDate];
  } else if (startDate) {
    dateCondition = "date(created_at) >= date(?)";
    params = [startDate];
  }

  try {
    // 1. Core Financial Math Calculations
    const coreSales = get(`
      SELECT 
        COALESCE(SUM(total), 0) as gross_revenue,
        COUNT(id) as total_orders
      FROM orders
      WHERE ${dateCondition}
    `, params);

    // Fetch dynamic rates to extract taxes from gross totals retrospectively
    const taxSetting = get("SELECT value FROM settings WHERE key = 'tax_rate'") || { value: '16' };
    const serviceSetting = get("SELECT value FROM settings WHERE key = 'service_charges'") || { value: '5' };
    
    const taxRate = parseFloat(taxSetting.value) / 100;
    const serviceRate = parseFloat(serviceSetting.value) / 100;
    const allocationFactor = 1 + taxRate + serviceRate;

    // Derived financials from aggregated parameters
    const gross = coreSales.gross_revenue;
    const subtotal = gross / allocationFactor;
    const taxCollected = subtotal * taxRate;
    const serviceChargesCollected = subtotal * serviceRate;

    // 2. Order Channel Ratios (Takeaway vs Dine-in distribution)
    const channels = all(`
      SELECT 
        order_type,
        COUNT(id) as counts,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE ${dateCondition}
      GROUP BY order_type
    `, params);

    // 3. Item Velocity Rankings (Top Selling Menu Items)
    const topItems = all(`
      SELECT 
        item_name,
        SUM(quantity) as units_sold,
        COALESCE(SUM(quantity * price), 0) as gross_sales
      FROM order_items
      WHERE order_id IN (SELECT id FROM orders WHERE ${dateCondition})
      GROUP BY item_id, item_name
      ORDER BY units_sold DESC
      LIMIT 10
    `, params);

    // 4. Waiter Volume Performances
    const waiterPerformance = all(`
      SELECT 
        waiter_name,
        COUNT(id) as tables_served,
        COALESCE(SUM(total), 0) as total_volume
      FROM orders
      WHERE ${dateCondition} AND order_type = 'dine-in' AND waiter_name IS NOT NULL
      GROUP BY waiter_name
      ORDER BY total_volume DESC
    `, params);

    // 5. Loss Management Audit (Wasted Items vs Active Stock Value)
    let wasteCondition = "date(created_at) = date('now', 'localtime')";
    if (startDate && endDate) wasteCondition = "date(created_at) BETWEEN date(?) AND date(?)";
    else if (startDate) wasteCondition = "date(created_at) >= date(?)";

    const wasteSummary = get(`
      SELECT 
        COALESCE(SUM(wl.quantity), 0) as total_wasted_units,
        COALESCE(SUM(wl.quantity * item.price), 0) as estimated_loss_value
      FROM waste_logs wl
      JOIN items item ON wl.item_id = item.id
      WHERE ${wasteCondition.replace('created_at', 'wl.created_at')}
    `, params);

    // Assemble final structured response object
    res.json({
      financials: {
        gross_revenue: gross,
        net_subtotal: subtotal,
        tax_collected: taxCollected,
        service_charges_collected: serviceChargesCollected,
        total_orders_processed: coreSales.total_orders
      },
      channels: channels.reduce((acc, current) => {
        acc[current.order_type] = {
          orders: current.counts,
          revenue: current.revenue
        };
        return acc;
      }, { takeaway: { orders: 0, revenue: 0 }, "dine-in": { orders: 0, revenue: 0 } }),
      top_selling_items: topItems,
      waiter_rankings: waiterPerformance,
      waste_audit: wasteSummary
    });

  } catch (error) {
    console.error('Failed to generate operational business metrics report:', error);
    res.status(500).json({ error: 'Internal processing failure running dynamic report data aggregates' });
  }
});

module.exports = router;