// ============================================
// AUTH MIDDLEWARE
// This checks if the user is logged in and
// what role they have (admin or user).
// ============================================

const jwt = require('jsonwebtoken');

// Secret key for JWT tokens (in production, use environment variable)
const JWT_SECRET = 'restaurant-secret-key-2024';

// ---- Middleware: Check if user is logged in ----
function authenticate(req, res, next) {
  // Get the token from the Authorization header
  // Format: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not logged in. Please login first.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and extract user info
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
}

// ---- Middleware: Check if user is admin ----
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

module.exports = { authenticate, adminOnly, JWT_SECRET };
