import { useState } from "react";

export default function SaleForm({ addSale }) {
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!item || !amount) return;

    addSale({
      id: Date.now(),
      item,
      amount: Number(amount),
      date: new Date().toLocaleDateString(),
    });

    setItem("");
    setAmount("");
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Item name"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button className="bg-black text-white rounded px-4">
          Add Sale
        </button>
      </div>
    </form>
  );
}
