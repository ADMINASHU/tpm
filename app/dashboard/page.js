"use client";

import { useSession } from "next-auth/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PackageSearch, Boxes, IndianRupee, TrendingUp } from "lucide-react";

const transferPriceData = [
    { month: 'Jan', price: 1200, overhead: 150 },
    { month: 'Feb', price: 1100, overhead: 140 },
    { month: 'Mar', price: 1150, overhead: 160 },
    { month: 'Apr', price: 1050, overhead: 130 },
    { month: 'May', price: 1000, overhead: 120 },
    { month: 'Jun', price: 950, overhead: 110 },
];

const liabilityData = [
    { bucket: '0-30 Days', amount: 450000 },
    { bucket: '31-60 Days', amount: 280000 },
    { bucket: '61-90 Days', amount: 150000 },
    { bucket: '90+ Days', amount: 80000 },
];

export default function DashboardPage() {
    const { data: session } = useSession();

    return (
        <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Welcome back, <span className="text-indigo-600">{session?.user?.name || "User"}</span>. Here is the daily summary for your factory.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Inventory Value" value="₹ 24,50K" icon={Boxes} trend="+12%" />
                    <StatCard title="Items Pending QC" value="142" icon={PackageSearch} trend="-5%" trendDown />
                    <StatCard title="Rolling Overhead/Unit" value="₹ 145.00" icon={TrendingUp} trend="-2%" trendDown />
                    <StatCard title="Total AP Liability" value="₹ 9,60K" icon={IndianRupee} trend="+8%" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Transfer Price Trending</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={transferPriceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="price" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">AP Aging Liability</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={liabilityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dx={-10} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="amount" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend, trendDown }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
                <div className="h-12 w-12 bg-indigo-50/80 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-indigo-600" />
                </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
            </div>
            <div className="mt-2 text-xs font-semibold">
                <span className={`${trendDown ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full' : 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full'}`}>
                    {trend}
                </span>
                <span className="text-slate-400 ml-2">vs last month</span>
            </div>
        </div>
    );
}
