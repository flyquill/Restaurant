const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Input@title1",      // change if needed
  database: "restaurant",
});

db.connect(err => {
  if (err) {
    console.error("DB error:", err);
    return;
  }
  console.log("MySQL connected");
});

// Save order
app.post("/api/orders", (req, res) => {
  const { cart, total } = req.body;

  db.query(
    "INSERT INTO orders (total) VALUES (?)",
    [total],
    (err, orderResult) => {
      if (err) return res.status(500).json(err);

      const orderId = orderResult.insertId;

      const items = cart.map(item => [
        orderId,
        item.name,
        item.qty,
        item.price
      ]);

      db.query(
        "INSERT INTO order_items (order_id, item_name, qty, price) VALUES ?",
        [items],
        (err) => {
          if (err) return res.status(500).json(err);
          res.json({ success: true, orderId });
        }
      );
    }
  );
});

// Get sales
app.get("/api/orders", (req, res) => {
  db.query(
    `SELECT o.*
     FROM orders o
     ORDER BY o.id DESC`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

app.get("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;

  db.query(
    "SELECT item_name AS name, qty, price FROM order_items WHERE order_id = ?",
    [orderId],
    (err, items) => {
      if (err) return res.status(500).json(err);
      res.json(items);
    }
  );
});

app.put("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  const { cart, total } = req.body;

  db.query(
    "UPDATE orders SET total = ? WHERE id = ?",
    [total, orderId],
    (err) => {
      if (err) return res.status(500).json(err);

      db.query(
        "DELETE FROM order_items WHERE order_id = ?",
        [orderId],
        () => {
          const items = cart.map(i => [
            orderId,
            i.name,
            i.qty,
            i.price
          ]);

          db.query(
            "INSERT INTO order_items (order_id, item_name, qty, price) VALUES ?",
            [items],
            () => res.json({ success: true })
          );
        }
      );
    }
  );
});

app.put("/api/orders/:id/cancel", (req, res) => {
  const orderId = req.params.id;

  db.query(
    "UPDATE orders SET status = 'CANCELLED' WHERE id = ?",
    [orderId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});



app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
