// migrate.js
const db = require('./database/db'); // adjust path to your db file

try {
  db.run('ALTER TABLE items ADD COLUMN image_url TEXT');
  console.log('✅ Migration successful');
} catch (e) {
  console.log('⚠️ Column may already exist:', e.message);
}