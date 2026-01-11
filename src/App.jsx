import { useState, useEffect } from "react";
import MenuGrid from "./components/MenuGrid";
import CartSidebar from "./components/CartSidebar";
import SalesTable from "./components/SalesTable";
import Summary from "./components/Summary";
import AdminSidebar from "./components/AdminSidebar";


export default function App() {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeView, setActiveView] = useState("pos");
  const [editingOrderId, setEditingOrderId] = useState(null);



  // Add to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  // Update qty
  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((i) => i.id !== id));
    } else {
      setCart(
        cart.map((i) =>
          i.id === id ? { ...i, qty } : i
        )
      );
    }
  };

  const editOrder = async (orderId) => {
    const res = await fetch(
      `http://localhost:5000/api/orders/${orderId}`
    );
    const items = await res.json();

    setCart(
      items.map(i => ({
        id: i.name,      // temporary ID
        name: i.name,
        price: i.price,
        qty: i.qty,
      }))
    );

    setEditingOrderId(orderId);
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    await fetch(
      `http://localhost:5000/api/orders/${orderId}/cancel`,
      { method: "PUT" }
    );

    // reload orders
    const res = await fetch("http://localhost:5000/api/orders");
    setOrders(await res.json());
  };



  const printReceipt = (cart) => {
    const date = new Date().toLocaleString();

    const items = cart
      .map(
        (i, key) => `
        <tr>
          <td>${key + 1}</td>
          <td>${i.name}</td>
          <td style="text-align:center">${i.qty}</td>
          <td style="text-align:right">Rs ${i.price * i.qty}</td>
        </tr>`
      )
      .join("");

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const w = window.open("", "PRINT", "width=380,height=600");

    w.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page {
              size: 56mm auto;
              margin: 0;
            }
            body {
              width: 80mm;
              margin: 0;
              padding: 5mm;
              font-family: monospace;
              font-size: 12px;
            }
            h2 { text-align: center; margin: 0 0 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px;}
            td { padding: 3px 0; }
            .total {
              border-top: 1px dashed #000;
              margin-top: 6px;
              padding-top: 6px;
              font-weight: bold;
            }
            tr{
              border-top: 1px dashed #000;
            }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Restaurant Name</h2>
          <div class="center">${date}</div>

          <table>
            <tr>
              <td>Sr#</td>
              <td>Name</td>
              <td style="text-align:center">Qty</td>
              <td style="text-align:right">Price</td>
            </tr>
            ${items}
          </table >

          <div class="total">Total: Rs ${total}</div>

          <div class="center">Thank you!</div>

          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body >
      </html >
    `);

    w.document.close();
  };



  // Place order
  const placeOrder = async () => {
    if (!cart.length) return;

    const total = cart.reduce(
      (sum, i) => sum + i.price * i.qty,
      0
    );

    if (editingOrderId) {
      printReceipt(cart);
      await fetch(
        `http://localhost:5000/api/orders/${editingOrderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart, total }),
        }
      );
    } else {
      printReceipt(cart);
      await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, total }),
      });
    }

    setCart([]);
    setEditingOrderId(null);

    // reload orders
    const res = await fetch("http://localhost:5000/api/orders");
    setOrders(await res.json());
  };


  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);



  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* LEFT SIDEBAR */}
      <AdminSidebar
        active={activeView}
        setActive={setActiveView}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {activeView === "pos" && (
          <>
            <h1 className="text-3xl font-bold">
              Restaurant POS
            </h1>
            <MenuGrid addToCart={addToCart} />
          </>
        )}

        {activeView === "orders" && (
          <>
            <h1 className="text-3xl font-bold">
              Orders
            </h1>
            <SalesTable
              orders={orders}
              onEdit={editOrder}
              setActive={setActiveView}
              onCancel={cancelOrder}
            />
          </>
        )}

        {activeView === "reports" && (
          <>
            <h1 className="text-3xl font-bold">
              Reports
            </h1>
            <Summary
              orders={orders}
            />
          </>
        )}

        {activeView === "products" && (
          <h1 className="text-3xl font-bold">
            Products (Coming Soon)
          </h1>
        )}

        {activeView === "settings" && (
          <h1 className="text-3xl font-bold">
            Settings (Coming Soon)
          </h1>
        )}

      </div>

      {/* RIGHT CART – ONLY SHOW IN POS */}
      {activeView === "pos" && (
        <CartSidebar
          cart={cart}
          setCart={setCart}
          updateQty={updateQty}
          placeOrder={placeOrder}
          editingOrderId={editingOrderId}
        />

      )}

    </div>
  );

}
