const { all, get, run } = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  function insertIfNotExists(table, column, value, sql, params) {
    const existing = get(`SELECT id FROM ${table} WHERE ${column} = ?`, [value]);
    if (!existing) { return run(sql, params); }
    return existing;
  }

  // 1. DEFAULT USERS
  const adminPassword = bcrypt.hashSync('admin123', 10);
  insertIfNotExists('users', 'username', 'admin', 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', adminPassword, 'admin']);
  const userPassword = bcrypt.hashSync('user123', 10);
  insertIfNotExists('users', 'username', 'user', 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user', userPassword, 'user']);

  // 2. CATEGORIES
  const categories = ['کڑاہی', 'سالن / دال', 'بروسٹ / توا', 'باربی کیو'];
  categories.forEach(name => { insertIfNotExists('categories', 'name', name, 'INSERT INTO categories (name) VALUES (?)', [name]); });

  // 3. MENU ITEMS (Configured with custom fraction jumps via variable_by)
  const getCategoryId = (name) => {
    const row = get('SELECT id FROM categories WHERE name = ?', [name]);
    return row ? row.id : null;
  };

  const menuItems = [
    // کڑاہی (Increments by 0.25)
    { name: 'چکن کڑاہی', price: 1800, category: 'کڑاہی', image: '/uploads/items/chicken-karahi.jpg', stock: 20, variable_by: 0.25 },
    { name: 'مٹن کڑاہی', price: 3200, category: 'کڑاہی', image: '/uploads/items/mutton-karahi.jpg', stock: 10, variable_by: 0.25 },
    { name: 'بیف کڑاہی', price: 2400, category: 'کڑاہی', image: '/uploads/items/beef-karahi.jpg', stock: 15, variable_by: 0.25 },

    // سالن / دال (Increments by 0.50)
    { name: 'دال ماش', price: 350, category: 'سالن / دال', image: '/uploads/items/daal-mash.jpg', stock: 40, variable_by: 0.50 },
    { name: 'چکن قورمہ', price: 650, category: 'سالن / دال', image: '/uploads/items/chicken-korma.jpg', stock: 25, variable_by: 0.50 },
    { name: 'سبزی', price: 300, category: 'سالن / دال', image: '/uploads/items/sabzi.jpg', stock: 30, variable_by: 0.50 },

    // بروسٹ / توا (Increments by 1.00)
    { name: 'بروسٹ چیسٹ پیس', price: 550, category: 'بروسٹ / توا', image: '/uploads/items/broast-chest.jpg', stock: 35, variable_by: 1.00 },
    { name: 'بروسٹ لیگ پیس', price: 500, category: 'بروسٹ / توا', image: '/uploads/items/broast-leg.jpg', stock: 35, variable_by: 1.00 },
    { name: 'توا چیسٹ پیس', price: 520, category: 'بروسٹ / توا', image: '/uploads/items/tawa-chest.jpg', stock: 20, variable_by: 1.00 },
    { name: 'توا لیگ پیس', price: 480, category: 'بروسٹ / توا', image: '/uploads/items/tawa-leg.jpg', stock: 20, variable_by: 1.00 },

    // باربی کیو (Increments by 1.00)
    { name: 'چکن کباب', price: 450, category: 'باربی کیو', image: '/uploads/items/chicken-kabab.jpg', stock: 50, variable_by: 1.00 },
    { name: 'بیف کباب', price: 500, category: 'باربی کیو', image: '/uploads/items/beef-kabab.jpg', stock: 45, variable_by: 1.00 },
    { name: 'شامی کباب', price: 120, category: 'باربی کیو', image: '/uploads/items/shami.jpg', stock: 60, variable_by: 1.00 },
    { name: 'چکن تکہ پیس', price: 400, category: 'باربی کیو', image: '/uploads/items/chicken-tikka.jpg', stock: 25, variable_by: 1.00 }
  ];

  menuItems.forEach(item => {
    const categoryId = getCategoryId(item.category);
    if (categoryId) {
      let existingItem = get('SELECT id FROM items WHERE name = ?', [item.name]);
      let itemId;
      
      if (!existingItem) {
        const itemResult = run(
          'INSERT INTO items (name, price, category_id, image_url, variable_by) VALUES (?, ?, ?, ?, ?)',
          [item.name, item.price, categoryId, item.image, item.variable_by]
        );
        itemId = itemResult.lastInsertRowid;
      } else {
        itemId = existingItem.id;
      }

      const existingStock = get('SELECT id FROM inventory WHERE item_id = ?', [itemId]);
      if (!existingStock) {
        run("INSERT INTO inventory (item_id, current_stock, min_stock, unit) VALUES (?, ?, 10, 'pcs')", [itemId, item.stock]);
      }
    }
  });

  // ============================================
  // 4. TABLES (میزیں)
  // ============================================
  ['میز نمبر 1', 'میز نمبر 2', 'میز نمبر 3'].forEach(name => {
    insertIfNotExists('tables', 'name', name,
      'INSERT INTO tables (name) VALUES (?)', [name]
    );
  });
  console.log('🪑 Tables created (میزیں تیار کر دی گئی ہیں)');

  // ============================================
  // 5. WAITERS (ویٹرز)
  // ============================================
  ['احمد', 'علی', 'حسن'].forEach(name => {
    insertIfNotExists('waiters', 'name', name,
      'INSERT INTO waiters (name) VALUES (?)', [name]
    );
  });
  console.log('🧑‍🍳 Waiters created (ویٹرز تیار کر دیے گئے ہیں)');

  // ============================================
  // 6. INITIAL CONFIGURATION SYSTEM SETTINGS
  // ============================================
  const hasSettings = get("SELECT COUNT(*) as count FROM settings");
  if (!hasSettings || hasSettings.count === 0) {
    run("INSERT INTO settings (key, value) VALUES ('restaurant_name', 'Namkeza Premium Restaurant')");
    run("INSERT INTO settings (key, value) VALUES ('address', 'Gulgasht Colony, Multan')");
    run("INSERT INTO settings (key, value) VALUES ('contact', '+923001234567')");
    run("INSERT INTO settings (key, value) VALUES ('tax_rate', '16')"); 
    run("INSERT INTO settings (key, value) VALUES ('service_charges', '5')"); 
    run("INSERT INTO settings (key, value) VALUES ('currency', 'PKR')");
  }
  console.log('⚙️ System settings populated (PKR defaults initialized)');

  console.log('✅ All seed data ready! (تمام ڈیٹا بیس لوڈ ہو چکا ہے)');
}

module.exports = seedDatabase;