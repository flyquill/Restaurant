import menuItems from "../data/menuItems";

export default function MenuGrid({ addToCart }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => addToCart(item)}
          className="bg-white rounded shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
        >
          <img
            src={item.image}
            className="h-auto w-full object-cover"
          />
          <div className="p-3 text-center">
            <h1 className="font-bold">{item.name}</h1>
            <h2 className="text-sm text-red-700 font-bold">
              Rs. {item.price}
            </h2>
          </div>
        </button>
      ))}
    </div>
  );
}
