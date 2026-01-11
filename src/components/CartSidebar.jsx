export default function CartSidebar({
  cart,
  setCart,
  updateQty,
  placeOrder,
  editingOrderId,
}) {
  const total = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  return (
    <div className="w-80 bg-white shadow-lg p-4 flex flex-col">
      <h2 className={`text-xl font-bold mb-4 ${editingOrderId ? "text-blue-600" : ""}`}>
        {editingOrderId
          ? `Editing Order ${editingOrderId}`
          : "Cart"}
      </h2>

      <div className="flex-1 space-y-3 overflow-auto">
        {cart.length === 0 && (
          <p className="text-gray-500 text-center">
            Cart is empty
          </p>
        )}

        {cart.map((item) => (
          <div
            key={item.id}
            className="border rounded p-2"
          >
            <div className="flex justify-between">
              <span className="font-semibold">
                {item.name}
              </span>
              <span>
                Rs. {item.price * item.qty}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() =>
                  updateQty(item.id, item.qty - 1)
                }
                className="px-2 bg-gray-200 rounded"
              >
                -
              </button>

              <span>{item.qty}</span>

              <button
                onClick={() =>
                  updateQty(item.id, item.qty + 1)
                }
                className="px-2 bg-gray-200 rounded"
              >
                +
              </button>

              <button
                onClick={() => updateQty(item.id, 0)}
                className="ml-auto text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between font-bold mb-3">
          <span>Total</span>
          <span>Rs. {total}</span>
        </div>

        <button
          onClick={placeOrder}
          className="w-full bg-black text-white font-bold py-2 rounded cursor-pointer"
        >
          {editingOrderId ? "Update Order" : "Place Order"}
        </button>

        <button
          onClick={() => setCart([])}
          className="w-full mt-2 bg-red-700 text-white font-bold py-2 rounded cursor-pointer"
        >
          Clear Cart
        </button>

      </div>
    </div>
  );
}
