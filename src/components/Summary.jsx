import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SummaryChart({ orders }) {

  const deliveredOrders = orders.filter(
    (o) => o.status === "DELIVERED"
  );

  const cancelledOrders = orders.filter(
    (o) => o.status === "CANCELLED"
  );

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay() || 7;
    if (day !== 1) date.setHours(-24 * (day - 1));
    return startOfDay(date);
  };
  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const startOfYear = (d) => new Date(d.getFullYear(), 0, 1);

  const sumBetween = (orders, from, to) =>
    orders.reduce((sum, o) => {
      const date = new Date(o.created_at);
      return date >= from && date < to ? sum + Number(o.total) : sum;
    }, 0);

  const now = new Date();

  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const weekStart = startOfWeek(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const monthStart = startOfMonth(now);
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const yearStart = startOfYear(now);
  const lastYearStart = new Date(yearStart);
  lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);

  const data = [
    {
      name: "Today",
      Current: sumBetween(deliveredOrders, todayStart, now),
      Previous: sumBetween(deliveredOrders, yesterdayStart, todayStart),
    },
    {
      name: "This Week",
      Current: sumBetween(deliveredOrders, weekStart, now),
      Previous: sumBetween(deliveredOrders, lastWeekStart, weekStart),
    },
    {
      name: "This Month",
      Current: sumBetween(deliveredOrders, monthStart, now),
      Previous: sumBetween(deliveredOrders, lastMonthStart, monthStart),
    },
    {
      name: "This Year",
      Current: sumBetween(deliveredOrders, yearStart, now),
      Previous: sumBetween(deliveredOrders, lastYearStart, yearStart),
    },
  ];

  const cancelledData = [
    {
      name: "Today",
      Current: sumBetween(cancelledOrders, todayStart, now),
      Previous: sumBetween(cancelledOrders, yesterdayStart, todayStart),
    },
    {
      name: "This Week",
      Current: sumBetween(cancelledOrders, weekStart, now),
      Previous: sumBetween(cancelledOrders, lastWeekStart, weekStart),
    },
    {
      name: "This Month",
      Current: sumBetween(cancelledOrders, monthStart, now),
      Previous: sumBetween(cancelledOrders, lastMonthStart, monthStart),
    },
    {
      name: "This Year",
      Current: sumBetween(cancelledOrders, yearStart, now),
      Previous: sumBetween(cancelledOrders, lastYearStart, yearStart),
    },
  ];

  const percentChange = (current, previous) => {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };


  return (
    <>
      <div className="bg-white p-4 rounded shadow">

        <h2 className="text-xl font-semibold text-center mb-4">
          Sales Comparison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {data.map((row) => {
            const diff = percentChange(row.Current, row.Previous);
            const isUp = diff >= 0;

            return (
              <div
                key={row.name}
                className="bg-gray-50 border rounded p-4 text-center"
              >
                <h3 className="font-semibold text-gray-700 mb-2">
                  {row.name}
                </h3>

                <p className="text-green-600 font-bold text-lg">
                  Current: Rs {row.Current.toLocaleString()}
                </p>

                <p className="text-red-600">
                  Previous: Rs {row.Previous.toLocaleString()}
                </p>

                <p
                  className={`mt-2 font-semibold ${isUp ? "text-green-700" : "text-red-700"
                    }`}
                >
                  {isUp ? "↑" : "↓"} {Math.abs(diff)}%
                </p>
              </div>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => `Rs. ${v}`} />
            <Legend />
            <Bar dataKey="Current" fill="#16a34a" />
            <Bar dataKey="Previous" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>

      </div>
      <div className="bg-white p-4 rounded shadow">

        <h2 className="text-xl font-semibold text-center mb-4 mt-8">
          Cancelled Orders Comparison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cancelledData.map((row) => {
            const diff = percentChange(row.Current, row.Previous);
            const isUp = diff >= 0;

            return (
              <div
                key={row.name}
                className="bg-gray-50 border rounded p-4 text-center"
              >
                <h3 className="font-semibold text-gray-700 mb-2">
                  {row.name}
                </h3>

                <p className="text-red-600 font-bold text-lg">
                  Current: Rs {row.Current.toLocaleString()}
                </p>

                <p className="text-green-600">
                  Previous: Rs {row.Previous.toLocaleString()}
                </p>

                <p
                  className={`mt-2 font-semibold ${isUp ? "text-red-700" : "text-green-700"
                    }`}
                >
                  {isUp ? "↑" : "↓"} {Math.abs(diff)}%
                </p>
              </div>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={cancelledData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => `Rs. ${v}`} />
            <Legend />
            <Bar dataKey="Current" fill="#dc2626" />
            <Bar dataKey="Previous" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
