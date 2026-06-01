import React, { useState, useEffect } from 'react';
import CartItem from './CartItem';
import api from '../../api'; // Centralized interceptor instance
import { MdOutlineShoppingCart, MdDeleteSweep, MdPrint } from 'react-icons/md';

// ============================================================
// RECEIPT PRINTER (Handles Decimal Quantities)
// ============================================================
const printReceipt = ({ cartItems, subtotal, tableName, waiterName, orderNumber, config }) => {
  const date = new Date();
  const dateStr = date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

  const restaurantName = config?.restaurant_name || 'DESI HOUSE';
  const taxPercent = parseFloat(config?.tax_rate || 0);
  const servicePercent = parseFloat(config?.service_charges || 0);

  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  const serviceAmount = Math.round(subtotal * (servicePercent / 100));
  const grandTotal = subtotal + taxAmount + serviceAmount;

  const orderType = tableName || 'Takeaway';
  const orderNum = orderNumber || `#${Date.now().toString().slice(-4)}`;

  const customerRows = cartItems.map(item => `
    <tr>
      <td class="col-item"><span class="item-name">${item.name}</span></td>
      <!-- Displaying quantity cleanly as a decimal if it's fractional -->
      <td class="col-qty">${Number(item.quantity).toFixed(2).replace(/\.00$/, '')}</td>
      <td class="col-rate">${item.price.toLocaleString()}</td>
      <td class="col-total">${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const kotRows = cartItems.map(item => `
    <tr>
      <td class="ki-item"><span class="ki-name">${item.name}</span></td>
      <td class="ki-qty">× ${Number(item.quantity).toFixed(2).replace(/\.00$/, '')}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${orderNum}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 80mm; margin: 0 auto; background: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, system-ui, sans-serif;
      font-size: 12px; color: #111; line-height: 1.5;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .receipt { width: 100%; padding: 8px 6px; }
    .cut-line {
      width: 100%; text-align: center; font-size: 10px; color: #888; letter-spacing: 1px;
      padding: 6px 0; border-top: 1px dashed #aaa; border-bottom: 1px dashed #aaa;
      margin: 4px 0; page-break-after: always; break-after: page;
    }
    .header { text-align: center; padding-bottom: 8px; border-bottom: 1px dashed #ccc; margin-bottom: 8px; }
    .restaurant-name-urdu { display: block; font-size: 16px; font-weight: 700; }
    .restaurant-name-eng  { display: block; font-size: 14px; font-weight: 900; letter-spacing: 1px; direction: ltr; text-transform: uppercase; }
    .address, .phone      { font-size: 10px; color: #555; direction: ltr; }
    .meta-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 2px 8px; font-size: 10.5px;
      padding: 6px 0; border-bottom: 1px dashed #ccc; margin-bottom: 8px; direction: ltr;
    }
    .meta-item   { display: flex; justify-content: space-between; }
    .meta-full   { grid-column: 1 / -1; display: flex; justify-content: space-between; }
    .meta-label  { color: #666; font-weight: 600; }
    .meta-value  { font-weight: 700; color: #111; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; direction: ltr; }
    .items-table thead tr { border-bottom: 1px solid #111; border-top: 1px solid #111; }
    .items-table thead th { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 2px; color: #333; }
    .items-table thead th.col-item  { text-align: left; }
    .items-table thead th.col-qty   { text-align: center; }
    .items-table thead th.col-rate  { text-align: right; }
    .items-table thead th.col-total { text-align: right; }
    .items-table tbody tr { border-bottom: 1px dashed #e0e0e0; }
    .items-table tbody td { padding: 5px 2px; font-size: 11.5px; vertical-align: top; }
    .items-table tbody td.col-item  { text-align: left; font-weight: 600; direction: rtl; }
    .items-table tbody td.col-qty   { text-align: center; font-weight: 700; }
    .items-table tbody td.col-rate  { text-align: right; color: #444; }
    .items-table tbody td.col-total { text-align: right; font-weight: 700; }
    .item-name { display: block; font-size: 12px; font-weight: 700; }
    .totals { width: 100%; direction: ltr; margin-bottom: 8px; }
    .totals-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 2px; font-size: 11px; }
    .totals-row .label { color: #555; font-weight: 600; }
    .totals-row .value { font-weight: 700; }
    .totals-row.grand-total { border-top: 2px solid #111; margin-top: 4px; padding-top: 6px; }
    .totals-row.grand-total .label { font-size: 13px; font-weight: 900; color: #111; }
    .totals-row.grand-total .value { font-size: 16px; font-weight: 900; color: #111; }
    .footer { text-align: center; padding-top: 8px; border-top: 1px dashed #ccc; direction: rtl; }
    .thank-you-urdu { font-size: 13px; font-weight: 700; display: block; }
    .thank-you-eng  { font-size: 10.5px; color: #555; display: block; direction: ltr; margin-top: 2px; }
    .powered        { font-size: 9px; color: #bbb; margin-top: 6px; direction: ltr; display: block; }
    .kot-header { text-align: center; padding-bottom: 8px; border-bottom: 2px solid #111; margin-bottom: 10px; }
    .kot-title  { font-size: 15px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.2; }
    .kot-sub    { display: block; font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #555; margin-top: 2px; }
    .kot-meta { display: flex; flex-direction: column; gap: 4px; padding: 8px 0; border-bottom: 1px dashed #ccc; margin-bottom: 10px; direction: ltr; }
    .kot-meta-row { display: flex; justify-content: space-between; align-items: center; }
    .km-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #666; }
    .km-value { font-size: 14px; font-weight: 900; color: #111; }
    .kot-items { width: 100%; border-collapse: collapse; direction: ltr; }
    .kot-items thead tr { border-top: 1px solid #111; border-bottom: 1px solid #111; }
    .kot-items thead th { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 2px; color: #333; }
    .kot-items thead th.ki-item { text-align: left; }
    .kot-items thead th.ki-qty  { text-align: right; }
    .kot-items tbody tr { border-bottom: 1px dashed #ddd; }
    .kot-items tbody td { padding: 7px 2px; }
    .kot-items tbody td.ki-item { text-align: left; direction: rtl; }
    .ki-name { display: block; font-size: 13px; font-weight: 700; }
    .kot-items tbody td.ki-qty { text-align: right; font-size: 20px; font-weight: 900; color: #111; white-space: nowrap; vertical-align: middle; }
    .kot-footer { margin-top: 10px; text-align: center; font-size: 9.5px; color: #aaa; border-top: 1px dashed #ccc; padding-top: 6px; direction: ltr; }
    @media print {
      html, body { width: 80mm; margin: 0; padding: 0; }
      .receipt { page-break-inside: avoid; break-inside: avoid; }
      .kot-section { page-break-before: auto; break-before: auto; }
    }
  </style>
</head>
<body>
  <!-- RECEIPT 1: CUSTOMER COPY -->
  <div class="receipt">
    <div class="header">
      <span class="restaurant-name-urdu">دیسی ہاؤس</span>
      <span class="restaurant-name-eng">${restaurantName}</span>
      <div class="address">123 Food Street, Karachi</div>
      <div class="phone">Tel: 021-3456-7890</div>
    </div>
    <div class="meta-grid">
      <div class="meta-item"><span class="meta-label">Date:</span><span class="meta-value">${dateStr}</span></div>
      <div class="meta-item"><span class="meta-label">Time:</span><span class="meta-value">${timeStr}</span></div>
      <div class="meta-item"><span class="meta-label">Order #:</span><span class="meta-value">${orderNum}</span></div>
      <div class="meta-item"><span class="meta-label">Type:</span><span class="meta-value">${orderType}</span></div>
      ${waiterName ? `<div class="meta-full"><span class="meta-label">Waiter:</span><span class="meta-value">${waiterName}</span></div>` : ''}
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th class="col-item">Item</th>
          <th class="col-qty">Qty</th>
          <th class="col-rate">Rate</th>
          <th class="col-total">Total</th>
        </tr>
      </thead>
      <tbody>${customerRows}</tbody>
    </table>
    <div class="totals">
      <div class="totals-row"><span class="label">Subtotal</span><span class="value">Rs. ${subtotal.toLocaleString()}</span></div>
      <div class="totals-row"><span class="label">GST (${taxPercent}%)</span><span class="value">Rs. ${taxAmount.toLocaleString()}</span></div>
      <div class="totals-row"><span class="label">Service Charges (${servicePercent}%)</span><span class="value">Rs. ${serviceAmount.toLocaleString()}</span></div>
      <div class="totals-row grand-total"><span class="label">GRAND TOTAL</span><span class="value">Rs. ${grandTotal.toLocaleString()}</span></div>
    </div>
    <div class="footer">
      <span class="thank-you-urdu">تشریف آوری کا شکریہ! 🙏</span>
      <span class="thank-you-eng">Thank you for dining with us!</span>
      <span class="powered">Powered by ${restaurantName} POS</span>
    </div>
  </div>
  <div class="cut-line">✂ &nbsp;&nbsp; CUT HERE &nbsp;&nbsp; ✂</div>
  <!-- RECEIPT 2: KITCHEN ORDER TICKET -->
  <div class="receipt kot kot-section">
    <div class="kot-header"><div class="kot-title">KITCHEN ORDER<span class="kot-sub">— K O T —</span></div></div>
    <div class="kot-meta">
      <div class="kot-meta-row"><span class="km-label">Order #</span><span class="km-value">${orderNum}</span></div>
      <div class="kot-meta-row"><span class="km-label">Type</span><span class="km-value">${orderType}</span></div>
      ${waiterName ? `<div class="kot-meta-row"><span class="km-label">Waiter</span><span class="km-value">${waiterName}</span></div>` : ''}
      <div class="kot-meta-row"><span class="km-label">Time</span><span class="km-value" style="font-size:12px;">${timeStr}</span></div>
    </div>
    <table class="kot-items">
      <thead><tr><th class="ki-item">Item</th><th class="ki-qty">Qty</th></tr></thead>
      <tbody>${kotRows}</tbody>
    </table>
    <div class="kot-footer">Printed: ${dateStr} — ${timeStr}<br/>— End of Kitchen Ticket —</div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=400,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 300);
};

// ============================================================
// CART COMPONENT
// ============================================================
const Cart = ({
  cartItems,
  onUpdateQuantity,
  onRemove,
  onClear,
  onPlaceOrder,
  isPlacing = false,
  tableName = null,
  waiterName = null,
  orderNumber = null,
}) => {
  const [config, setConfig] = useState({
    restaurant_name: '', tax_rate: '0', service_charges: '0', currency: 'PKR'
  });

  useEffect(() => { fetchSystemVariables(); }, []);

  const fetchSystemVariables = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setConfig({
          restaurant_name: res.data.restaurant_name || '',
          tax_rate: res.data.tax_rate || '0',
          service_charges: res.data.service_charges || '0',
          currency: res.data.currency || 'PKR'
        });
      }
    } catch (err) {
      console.error('Cart failed to synchronize with global settings:', err);
    }
  };

  // Subtotal handles decimal multiplication safely
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const taxPercent = parseFloat(config.tax_rate || 0);
  const servicePercent = parseFloat(config.service_charges || 0);
  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  const serviceAmount = Math.round(subtotal * (servicePercent / 100));
  const grandTotal = subtotal + taxAmount + serviceAmount;

  // Calculates overall total units accurately counting decimals
  const overallItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handlePlaceOrder = async () => {
    const snapshot = [...cartItems];
    const snapSubtotal = subtotal;
    await onPlaceOrder();
    printReceipt({ 
      cartItems: snapshot, subtotal: snapSubtotal, tableName, waiterName, orderNumber, config 
    });
  };

  return (
    <div className="flex flex-col w-96 bg-white border-l border-slate-200 h-[calc(100vh-4rem)] shadow-sm">
      {/* Cart Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <MdOutlineShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white ring-2 ring-white">
                {overallItemCount.toFixed(2).replace(/\.00$/, '')}
              </span>
            )}
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Active Cart</h3>
            {tableName && (
              <p className="text-xs font-semibold text-primary-600">
                {tableName} {waiterName && `• Waiter: ${waiterName}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {cartItems.length > 0 && (
            <button
              onClick={() => printReceipt({ cartItems, subtotal, tableName, waiterName, orderNumber, config })}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              title="Print Receipt"
            >
              <MdPrint size={18} />
            </button>
          )}
          {cartItems.length > 0 && onClear && (
            <button
              onClick={onClear}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <MdDeleteSweep size={16} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none">
            <svg className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-base font-semibold">Cart is empty</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals Section */}
      {cartItems.length > 0 && (
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Items Total</span>
              <span>₨ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Tax (GST {taxPercent}%)</span>
              <span>₨ {taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Service Charges ({servicePercent}%)</span>
              <span>₨ {serviceAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="text-base font-bold text-slate-800">Grand Total</span>
              <span className="text-2xl font-black text-slate-900">₨ {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-4 text-base font-bold text-white shadow-lg transition-all disabled:opacity-50"
          >
            {isPlacing ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <MdPrint size={18} />
                <span>{tableName ? 'Pay & Print Bill' : 'Place Order & Print'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;