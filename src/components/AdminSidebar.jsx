export default function AdminSidebar({ active, setActive }) {
  const menu = [
    { key: "pos", label: "POS" },
    { key: "orders", label: "Orders" },
    { key: "reports", label: "Reports" },
    { key: "products", label: "Products" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="w-56 bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6 text-center">
        Admin Panel
      </h2>

      <nav className="space-y-2">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`w-full text-left px-4 py-2 rounded cursor-pointer
              ${active === item.key
                ? "bg-gray-700"
                : "hover:bg-gray-800"}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
