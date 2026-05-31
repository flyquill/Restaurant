// ============================================
// SYSTEM SETTINGS & OPERATOR MANAGEMENT ROUTES
// Handles global variables, tax adjustments, and security profiles
// ============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const { all, get, run } = require('../database/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ============================================
// GLOBAL CONFIGURATIONS (KEY-VALUE STORE)
// ============================================

// ---- GET /api/settings ----
// Fetches flat key-value configs and reduces them into a cohesive system object
router.get('/', authenticate, (req, res) => {
  try {
    const rawSettings = all("SELECT * FROM settings");
    
    // Convert array of [{key, value}, ...] into a single clean map object
    const settingsMap = rawSettings.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    res.json(settingsMap);
  } catch (error) {
    console.error("Failed to load global configurations:", error);
    res.status(500).json({ error: "Could not retrieve system parameters" });
  }
});

// ---- PUT /api/settings ----
// Updates multiple configuration attributes safely via key-value replaces
router.put('/', authenticate, adminOnly, (req, res) => {
  const updates = req.body; // Expects an object, e.g., { restaurant_name: "New Name", tax_rate: "16" }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No configuration parameters provided" });
  }

  try {
    // Write batch updates using SQLITE's built-in REPLACE command
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value.toString()]);
      }
    });

    res.json({ message: "System configuration maps updated successfully" });
  } catch (error) {
    console.error("Failed to batch persist settings:", error);
    res.status(500).json({ error: "Failed to save changed system variables" });
  }
});

// ============================================
// OPERATOR / USER ACCOUNT CONTROLS
// ============================================

// ---- GET /api/settings/users ----
// Retreives list of all authorized machine operators (excludes sensitive hash strings)
router.get('/users', authenticate, adminOnly, (req, res) => {
  try {
    const users = all("SELECT id, username, role FROM users ORDER BY username ASC");
    res.json(users);
  } catch (error) {
    console.error("Failed to pull system user rosters:", error);
    res.status(500).json({ error: "Could not retrieve operators directory" });
  }
});

// ---- POST /api/settings/users ----
// Registers a new user account profile with secure salted password hashing
router.post('/users', authenticate, adminOnly, (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password, and designated role are required" });
  }

  try {
    // Check for unique username conflict before triggering insert logic
    const existing = get("SELECT id FROM users WHERE username = ?", [username.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: "An operator profile with that username already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const result = run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username.toLowerCase().trim(), passwordHash, role]
    );

    res.status(201).json({
      message: "Operator created successfully",
      user: { id: result.lastInsertRowid, username, role }
    });
  } catch (error) {
    console.error("Failed to instantiate new operator registration:", error);
    res.status(500).json({ error: "Failed to create security account profile" });
  }
});

// ---- PUT /api/settings/users/:id ----
// Modifies basic information (username/role) of a user profile
router.put('/users/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;

  if (!username || !role) {
    return res.status(400).json({ error: "Username and role updates are required" });
  }

  try {
    const result = run(
      "UPDATE users SET username = ?, role = ? WHERE id = ?",
      [username.toLowerCase().trim(), role, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.json({ message: "Operator profile updated successfully" });
  } catch (error) {
    console.error("Failed to alter target user fields:", error);
    res.status(500).json({ error: "Internal processing error altering target records" });
  }
});

// ---- PUT /api/settings/users/:id/reset-password ----
// Forced password overwrite mechanics for account lockouts
router.put('/users/:id/reset-password', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: "A valid new password (minimum 4 characters) must be supplied" });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    const result = run("UPDATE users SET password = ? WHERE id = ?", [newHash, id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Target account profile not found" });
    }

    res.json({ message: "Password reset applied successfully" });
  } catch (error) {
    console.error("Failed executing strict security pass reset query updates:", error);
    res.status(500).json({ error: "Internal account database password override failure" });
  }
});

// ---- DELETE /api/settings/users/:id ----
// Deletes terminal operators from the active database infrastructure
router.delete('/users/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;

  // Prevent an admin from deleting their own active profile session
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: "Self-deletion block triggered. You cannot delete your current active login profile." });
  }

  try {
    const result = run("DELETE FROM users WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Target user account not found" });
    }

    res.json({ message: "Operator profile permanently deleted from server registries" });
  } catch (error) {
    console.error("Failed to clean target account row from disk database:", error);
    res.status(500).json({ error: "Failed to delete target user account" });
  }
});

module.exports = router;