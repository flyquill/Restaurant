// ============================================
// SEED DATA
// Fills the database with sample data.
// This runs automatically when server starts.
// ============================================

const { all, get, run } = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  // ---- Helper: Insert only if not exists ----
  function insertIfNotExists(table, column, value, sql, params) {
    const existing = get(`SELECT id FROM ${table} WHERE ${column} = ?`, [value]);
    if (!existing) {
      return run(sql, params);
    }
    return existing;
  }

  // ============================================
  // 1. DEFAULT USERS
  // ============================================
  const adminPassword = bcrypt.hashSync('admin123', 10);
  insertIfNotExists('users', 'username', 'admin',
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    ['admin', adminPassword, 'admin']
  );

  const userPassword = bcrypt.hashSync('user123', 10);
  insertIfNotExists('users', 'username', 'user',
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    ['user', userPassword, 'user']
  );
  console.log('👤 Users created (admin/admin123, user/user123)');

  // ============================================
  // 2. CATEGORIES
  // ============================================
  const categories = ['Beverages', 'BBQ', 'Rice', 'Desserts', 'Fast Food', 'Karahi'];
  categories.forEach(name => {
    insertIfNotExists('categories', 'name', name,
      'INSERT INTO categories (name) VALUES (?)', [name]
    );
  });
  console.log('📂 Categories created');

  // ============================================
  // 3. MENU ITEMS
  // ============================================
  const getCategoryId = (name) => {
    const row = get('SELECT id FROM categories WHERE name = ?', [name]);
    return row ? row.id : null;
  };

  const menuItems = [
    { name: 'Chai',              price: 50,   category: 'Beverages' },
    { name: 'Green Tea',         price: 80,   category: 'Beverages' },
    { name: 'Cold Drink',        price: 100,  category: 'Beverages' },
    { name: 'Fresh Juice',       price: 150,  category: 'Beverages' },
    { name: 'Chicken Tikka',     price: 600,  category: 'BBQ' },
    { name: 'Seekh Kabab',       price: 500,  category: 'BBQ' },
    { name: 'Malai Boti',        price: 700,  category: 'BBQ' },
    { name: 'Chicken Biryani',   price: 350,  category: 'Rice' },
    { name: 'Mutton Pulao',      price: 500,  category: 'Rice' },
    { name: 'Plain Rice',        price: 150,  category: 'Rice' },
    { name: 'Gulab Jamun',       price: 120,  category: 'Desserts' },
    { name: 'Kheer',             price: 200,  category: 'Desserts' },
    { name: 'Zinger Burger',     price: 400,  category: 'Fast Food' },
    { name: 'Chicken Shawarma',  price: 300,  category: 'Fast Food' },
    { name: 'French Fries',      price: 200,  category: 'Fast Food' },
    { name: 'Chicken Karahi',    price: 2500, category: 'Karahi' },
    { name: 'Mutton Karahi',     price: 3500, category: 'Karahi' },
    { name: 'Daal',              price: 800,  category: 'Karahi' },
  ];

  menuItems.forEach(item => {
    const categoryId = getCategoryId(item.category);
    if (categoryId) {
      insertIfNotExists('items', 'name', item.name,
        'INSERT INTO items (name, price, category_id) VALUES (?, ?, ?)',
        [item.name, item.price, categoryId]
      );
    }
  });
  console.log('🍔 Menu items created');

  // ============================================
  // 4. TABLES
  // ============================================
  ['Table 1', 'Table 2', 'Table 3'].forEach(name => {
    insertIfNotExists('tables', 'name', name,
      'INSERT INTO tables (name) VALUES (?)', [name]
    );
  });
  console.log('🪑 Tables created');

  // ============================================
  // 5. WAITERS
  // ============================================
  ['Ahmed', 'Ali', 'Hassan'].forEach(name => {
    insertIfNotExists('waiters', 'name', name,
      'INSERT INTO waiters (name) VALUES (?)', [name]
    );
  });
  console.log('🧑‍🍳 Waiters created');

  console.log('✅ All seed data ready!');
}

module.exports = seedDatabase;
