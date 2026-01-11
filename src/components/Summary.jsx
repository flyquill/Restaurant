export default function Summary({ orders }) {
  const total = orders.reduce((sum, s) => sum + Number(s.total), 0);

  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h2 className="text-xl font-semibold">Total Sales Today</h2>
      <p className="text-2xl font-bold mt-2">Rs. {total}</p>
    </div>
  );
}
