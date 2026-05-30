// ============================================
// MAIN SERVER FILE
// Entry point - sets up Express, connects
// routes, and starts the server.
// ============================================

const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database/db');
const seedDatabase = require('./database/seed');

const app = express();
const PORT = 5000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Import Routes ----
const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const itemsRoutes = require('./routes/items');
const tablesRoutes = require('./routes/tables');
const waitersRoutes = require('./routes/waiters');
const ordersRoutes = require('./routes/orders');

// ---- Connect Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/waiters', waitersRoutes);
app.use('/api/orders', ordersRoutes);

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Restaurant API is running!' });
});

// ---- Start the server ----
// We need to initialize the database first (async)
// then seed it, then start listening
async function startServer() {
  try {
    // 1. Initialize database (create tables)
    await initDatabase();

    // 2. Seed sample data
    seedDatabase();

    // 3. Start listening
    app.listen(PORT, () => {
      console.log('');
      console.log('🍽️  Restaurant Management System - API Server');
      console.log(`📡 Server running at: http://localhost:${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
