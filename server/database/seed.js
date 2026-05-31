// ============================================
// SEED DATA (ڈیٹا بیس لوڈ کرنے کا ڈیٹا)
// Fills the database with sample data.
// Runs automatically when server starts.
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
  // 1. DEFAULT USERS (صارفین)
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
  // 2. CATEGORIES (اقسام)
  // ============================================
  const categories = ['مشروبات', 'باربی کیو', 'چاول', 'مٹھائیاں', 'فاسٹ فوڈ', 'کڑاہی'];
  categories.forEach(name => {
    insertIfNotExists('categories', 'name', name,
      'INSERT INTO categories (name) VALUES (?)', [name]
    );
  });
  console.log('📂 Categories created (اقسام تیار کر دی گئی ہیں)');

  // ============================================
  // 3. MENU ITEMS & INVENTORY STOCK (مینو کے پکوان اور اسٹاک)
  // ============================================
  const getCategoryId = (name) => {
    const row = get('SELECT id FROM categories WHERE name = ?', [name]);
    return row ? row.id : null;
  };

  const menuItems = [
    { name: 'چائے',              price: 50,   category: 'مشروبات',  image: '/uploads/items/chai.jpg', stock: 100 },
    { name: 'سبز چائے (گرین ٹی)',   price: 80,   category: 'مشروبات',  image: '/uploads/items/green-tea.jpg', stock: 60 },
    { name: 'کولڈ ڈرنک',         price: 100,  category: 'مشروبات',  image: '/uploads/items/cold-drink.jpg', stock: 5 }, // Will trigger low-stock alert
    { name: 'تازہ جوس',           price: 150,  category: 'مشروبات',  image: '/uploads/items/fresh-juice.jpg', stock: 40 },
    { name: 'چکن تکہ',           price: 600,  category: 'باربی کیو', image: '/uploads/items/chicken-tikka.jpg', stock: 25 },
    { name: 'سیخ کباب',          price: 500,  category: 'باربی کیو', image: '/uploads/items/seekh-kabab.jpg', stock: 30 },
    { name: 'ملائی بوٹی',          price: 700,  category: 'باربی کیو', image: '/uploads/items/malai-boti.jpg', stock: 15 },
    { name: 'چکن بریانی',         price: 350,  category: 'چاول',     image: '/uploads/items/chicken-biryani.jpg', stock: 50 },
    { name: 'مٹن پلاؤ',           price: 500,  category: 'چاول',     image: '/uploads/items/mutton-pulao.jpg', stock: 20 },
    { name: 'سادہ چاول',          price: 150,  category: 'چاول',     image: '/uploads/items/plain-rice.jpg', stock: 45 },
    { name: 'گلاب جامن',         price: 120,  category: 'مٹھائیاں',  image: '/uploads/items/gulab-jamun.jpg', stock: 8 }, // Will trigger low-stock alert
    { name: 'کھیر',              price: 200,  category: 'مٹھائیاں',  image: '/uploads/items/kheer.jpg', stock: 25 },
    { name: 'زنگر برگر',          price: 400,  category: 'فاسٹ فوڈ',  image: '/uploads/items/zinger-burger.jpg', stock: 35 },
    { name: 'چکن شوارما',        price: 300,  category: 'فاسٹ فوڈ',  image: '/uploads/items/chicken-shawarma.jpg', stock: 40 },
    { name: 'فرینچ فرائز',         price: 200,  category: 'فاسٹ فوڈ',  image: '/uploads/items/french-fries.jpg', stock: 55 },
    { name: 'چکن کڑاہی',         price: 2500, category: 'کڑاہی',    image: '/uploads/items/chicken-karahi.jpg', stock: 12 },
    { name: 'مٹن کڑاہی',          price: 3500, category: 'کڑاہی',    image: '/uploads/items/mutton-karahi.jpg', stock: 6 }, // Will trigger low-stock alert
    { name: 'دال مکھنی',          price: 800,  category: 'کڑاہی',    image: '/uploads/items/daal.jpg', stock: 15 },
  ];

  menuItems.forEach(item => {
    const categoryId = getCategoryId(item.category);
    if (categoryId) {
      // Check if the item already exists
      let existingItem = get('SELECT id FROM items WHERE name = ?', [item.name]);
      let itemId;
      
      if (!existingItem) {
        const itemResult = run(
          'INSERT INTO items (name, price, category_id, image_url) VALUES (?, ?, ?, ?)',
          [item.name, item.price, categoryId, item.image]
        );
        itemId = itemResult.lastInsertRowid;
      } else {
        itemId = existingItem.id;
      }

      // Populate matching inventory row if missing
      const existingStock = get('SELECT id FROM inventory WHERE item_id = ?', [itemId]);
      if (!existingStock) {
        run(
          "INSERT INTO inventory (item_id, current_stock, min_stock, unit) VALUES (?, ?, 10, 'pcs')",
          [itemId, item.stock]
        );
      }
    }
  });
  console.log('🍔 Menu items & stock profiles aligned');

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