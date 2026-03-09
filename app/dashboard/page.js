"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  PackageSearch,
  Boxes,
  IndianRupee,
  TrendingUp,
  Package,
} from "lucide-react";

// Dynamically import Recharts components to reduce initial bundle size (bundle-dynamic-imports)
const DynamicAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false },
);
const DynamicArea = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const DynamicXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false },
);
const DynamicYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false },
);
const DynamicCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false },
);
const DynamicTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false },
);
const DynamicResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);
const DynamicBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false },
);
const DynamicBar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});

const transferPriceData = [
  { month: "Jan", price: 1200, overhead: 150 },
  { month: "Feb", price: 1100, overhead: 140 },
  { month: "Mar", price: 1150, overhead: 160 },
  { month: "Apr", price: 1050, overhead: 130 },
  { month: "May", price: 1000, overhead: 120 },
  { month: "Jun", price: 950, overhead: 110 },
];

const liabilityData = [
  { bucket: "0-30 Days", amount: 450000 },
  { bucket: "31-60 Days", amount: 280000 },
  { bucket: "61-90 Days", amount: 150000 },
  { bucket: "90+ Days", amount: 80000 },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    stockCount: 0,
    inventoryValue: 0,
    pendingQC: 0,
    rollingOverhead: 0,
    apLiability: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Trend State
  const [trendData, setTrendData] = useState([]);
  const [trendMode, setTrendMode] = useState("qty"); // 'qty' | 'value'
  const [trendRange, setTrendRange] = useState(30); // 7, 30, 90 days
  const [filters, setFilters] = useState({ category: "All", itemId: "" });
  const [items, setItems] = useState([]); // For item filter dropdown

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const json = await res.json();
        if (json.success) {
          setStats(json.stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Fetch Items for filter
  useEffect(() => {
    async function fetchItemOptions() {
      if (filters.category === "All") {
        setItems([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/dashboard/trend/options?category=${filters.category}`,
        );
        const json = await res.json();
        if (json.success) {
          setItems(json.options || []);
        }
      } catch (e) {
        console.error("Error fetching items for filter:", e);
      }
    }
    fetchItemOptions();
  }, [filters.category]);

  // Fetch Trend Data
  useEffect(() => {
    async function fetchTrend() {
      try {
        const query = new URLSearchParams({
          days: trendRange.toString(),
          category: filters.category,
          itemId: filters.itemId,
        });
        const res = await fetch(`/api/dashboard/trend?${query}`);
        const json = await res.json();
        if (json.success) {
          setTrendData(json.data);
        }
      } catch (e) {
        console.error("Error fetching trend data:", e);
      }
    }
    fetchTrend();
  }, [trendRange, filters, trendMode]);

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹ ${(val / 1000).toFixed(2)}K`;
    return `₹ ${val.toLocaleString("en-IN")}`;
  };

  const formatNumber = (val) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Welcome back,{" "}
            <span className="text-indigo-600">
              {session?.user?.name || "User"}
            </span>
            . Here is the daily summary for your factory.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard
            title="Stock Present in Inventory"
            value={isLoading ? "..." : formatNumber(stats.stockCount)}
            icon={Package}
            trend="+4"
          />
          <StatCard
            title="Total Inventory Value"
            value={isLoading ? "..." : formatCurrency(stats.inventoryValue)}
            icon={Boxes}
            trend="+12%"
          />
          <StatCard
            title="Items Pending QC"
            value={isLoading ? "..." : formatNumber(stats.pendingQC)}
            icon={PackageSearch}
            trend="-5%"
            trendDown
          />
          <StatCard
            title="Rolling Overhead/Unit"
            value={isLoading ? "..." : `₹ ${stats.rollingOverhead.toFixed(2)}`}
            icon={TrendingUp}
            trend="-2%"
            trendDown
          />
          <StatCard
            title="Total AP Liability"
            value={isLoading ? "..." : formatCurrency(stats.apLiability)}
            icon={IndianRupee}
            trend="+8%"
          />
        </div>

        {/* Section Headers and Alternating Rows */}
        <div className="space-y-16">
          {/* Row 1: Stock Trend */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-indigo-600 pl-4">
              Stock Movement Analysis
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px] transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Trend Visualization
                  </h3>
                  <div className="flex items-center gap-3">
                    <select
                      className="text-xs font-semibold border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={trendMode}
                      onChange={(e) => setTrendMode(e.target.value)}
                    >
                      <option value="qty">Quantity View</option>
                      <option value="value">Value View</option>
                    </select>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => setTrendRange(7)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${trendRange === 7 ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        7D
                      </button>
                      <button
                        onClick={() => setTrendRange(30)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${trendRange === 30 ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        30D
                      </button>
                      <button
                        onClick={() => setTrendRange(90)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${trendRange === 90 ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        90D
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Category Filter
                    </label>
                    <select
                      className="w-full text-xs font-medium border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ category: e.target.value, itemId: "" })
                      }
                    >
                      <option value="All">All Categories</option>
                      <option value="Component">Components</option>
                      <option value="Spare_Part">Spares</option>
                      <option value="Product">Finished Products</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Specific Item
                    </label>
                    <select
                      className="w-full text-xs font-medium border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                      value={filters.itemId}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, itemId: e.target.value }))
                      }
                      disabled={items.length === 0}
                    >
                      <option value="">All Items</option>
                      {items.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <DynamicResponsiveContainer width="100%" height="100%">
                    <DynamicAreaChart
                      data={trendData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorIn"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorOut"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#F43F5E"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#F43F5E"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <DynamicCartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <DynamicXAxis
                        dataKey="_id"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 10,
                          fontWeight: 500,
                        }}
                        tickFormatter={(str) =>
                          str.split("-").slice(1).join("/")
                        }
                        dy={10}
                      />
                      <DynamicYAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 10,
                          fontWeight: 500,
                        }}
                        dx={-10}
                      />
                      <DynamicTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #f1f5f9",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <DynamicArea
                        name={
                          trendMode === "qty"
                            ? "Inbound Qty"
                            : "Purchased Value"
                        }
                        type="monotone"
                        dataKey={
                          trendMode === "qty" ? "inQty" : "purchasedValue"
                        }
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIn)"
                      />
                      <DynamicArea
                        name={
                          trendMode === "qty"
                            ? "Outbound Qty"
                            : "Consumed Value"
                        }
                        type="monotone"
                        dataKey={
                          trendMode === "qty" ? "outQty" : "consumedValue"
                        }
                        stroke="#F43F5E"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorOut)"
                      />
                    </DynamicAreaChart>
                  </DynamicResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px] transition-shadow hover:shadow-md">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                  Movement Logs
                </h3>
                <div className="flex-1 overflow-auto no-scrollbar">
                  <TrendTable
                    data={trendData}
                    mode={trendMode}
                    formatCurrency={formatCurrency}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Transfer Price */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-indigo-600 pl-4">
              Production Cost Dynamics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px] order-2 lg:order-1 transition-shadow hover:shadow-md">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                  Historical Costing
                </h3>
                <div className="flex-1 overflow-auto no-scrollbar">
                  <TransferPriceTable
                    data={transferPriceData}
                    formatCurrency={formatCurrency}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px] order-1 lg:order-2 transition-shadow hover:shadow-md">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                  Costing Trends
                </h3>
                <div className="flex-1 min-h-0">
                  <DynamicResponsiveContainer width="100%" height="100%">
                    <DynamicAreaChart
                      data={transferPriceData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorPrice"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4F46E5"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4F46E5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <DynamicCartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <DynamicXAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        dy={10}
                      />
                      <DynamicYAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        dx={-10}
                      />
                      <DynamicTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #f1f5f9",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <DynamicArea
                        type="monotone"
                        dataKey="price"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </DynamicAreaChart>
                  </DynamicResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: AP Aging */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-indigo-600 pl-4">
              Financial Obligations
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pb-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px] transition-shadow hover:shadow-md">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                  Aging Distribution
                </h3>
                <div className="flex-1 min-h-0">
                  <DynamicResponsiveContainer width="100%" height="100%">
                    <DynamicBarChart
                      data={liabilityData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <DynamicCartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <DynamicXAxis
                        dataKey="bucket"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        dy={10}
                      />
                      <DynamicYAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748B",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        dx={-10}
                      />
                      <DynamicTooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #f1f5f9",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <DynamicBar
                        dataKey="amount"
                        fill="#4F46E5"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                      />
                    </DynamicBarChart>
                  </DynamicResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px] transition-shadow hover:shadow-md">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                  Liability Details
                </h3>
                <div className="flex-1 overflow-auto no-scrollbar">
                  <AgingLiabilityTable
                    data={liabilityData}
                    formatCurrency={formatCurrency}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendDown }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
        <div className="h-12 w-12 bg-indigo-50/80 rounded-xl flex items-center justify-center">
          <Icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline space-x-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
      </div>
      <div className="mt-2 text-xs font-semibold">
        <span
          className={`${trendDown ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" : "text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full"}`}
        >
          {trend}
        </span>
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    </div>
  );
}

function TrendTable({ data, mode, formatCurrency }) {
  const reversedData = [...data].reverse().slice(0, 10); // Show last 10 entries

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white border-b border-slate-100">
          <tr>
            <th className="py-3 font-semibold text-slate-600">Date</th>
            <th className="py-3 font-semibold text-slate-600 text-right">
              {mode === "qty" ? "Inbound" : "Purchased"}
            </th>
            <th className="py-3 font-semibold text-slate-600 text-right">
              {mode === "qty" ? "Outbound" : "Consumed"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {reversedData.map((row) => (
            <tr key={row._id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 text-slate-500 font-medium">{row._id}</td>
              <td className="py-3 text-emerald-600 font-bold text-right">
                {mode === "qty"
                  ? row.inQty
                  : formatCurrency(row.purchasedValue)}
              </td>
              <td className="py-3 text-rose-600 font-bold text-right">
                {mode === "qty"
                  ? row.outQty
                  : formatCurrency(row.consumedValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransferPriceTable({ data, formatCurrency }) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white border-b border-slate-100">
          <tr>
            <th className="py-3 font-semibold text-slate-600">Month</th>
            <th className="py-3 font-semibold text-slate-600 text-right">
              Avg. Price
            </th>
            <th className="py-3 font-semibold text-slate-600 text-right">
              Overhead
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row) => (
            <tr key={row.month} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 text-slate-500 font-medium">{row.month}</td>
              <td className="py-3 text-slate-900 font-bold text-right">
                {formatCurrency(row.price)}
              </td>
              <td className="py-3 text-indigo-600 font-bold text-right">
                {formatCurrency(row.overhead)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AgingLiabilityTable({ data, formatCurrency }) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white border-b border-slate-100">
          <tr>
            <th className="py-3 font-semibold text-slate-600">Age Bucket</th>
            <th className="py-3 font-semibold text-slate-600 text-right">
              Balance Due
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row) => (
            <tr
              key={row.bucket}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="py-3 text-slate-500 font-medium">{row.bucket}</td>
              <td className="py-3 text-rose-600 font-bold text-right">
                {formatCurrency(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
