export default function SalesTable({ orders, onEdit, onCancel, setActive }) {
  if (!orders.length)
    return (
      <p className="text-center text-gray-500">
        No order yet
      </p>
    );

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <table className="w-full border">
        <thead className="bg-gray-500 text-gray-50 border">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr key={i} className={`${order.status === "CANCELLED" ? "bg-red-800 text-gray-50" : ""}`}>
              <td className="border p-2 text-center">
                {new Date(order.created_at).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="border p-2 text-center">
                {order.id}
              </td>
              <td className="border p-2 text-center">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PKR',
                }).format(order.total)}
              </td>
              <td className={`border text-center`}>
                {order.status}
              </td>
              <td className="border p-1 text-center">
                <button
                  onClick={() => {onEdit(order.id); setActive("pos")}}
                  disabled={order.status === "CANCELLED"}
                  className={`p-2 mx-2 rounded text-white cursor-pointer
                  ${order.status === "CANCELLED"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800"}`}
                >
                  Edit
                </button>


                <button
                  onClick={() => onCancel(order.id)}
                  disabled={order.status === "CANCELLED"}
                  className={`p-2 rounded text-white cursor-pointer
                  ${order.status === "CANCELLED"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-700 hover:bg-red-800"}`}
                >
                  Cancel
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
