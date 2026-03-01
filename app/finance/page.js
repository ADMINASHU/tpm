"use client";

import { useState } from "react";
import { LineChart, Mail, Receipt, Clock, Download } from "lucide-react";

export default function FinancePage() {
    const agingData = [
        { vendor: "Acme Corp", invoice: "INV-001", due: "0-30", amount: 150000, status: "pending" },
        { vendor: "Global Tech", invoice: "INV-442", due: "31-60", amount: 85000, status: "overdue" },
        { vendor: "Global Tech", invoice: "INV-410", due: "61-90", amount: 45000, status: "critical" },
        { vendor: "Electro Components", invoice: "INV-99", due: "90+", amount: 120000, status: "critical" },
    ];

    return (
        <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finance & Ledger</h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium">
                            Manage accounts payable, overhead reconciliation, and vendor aging.
                        </p>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Trigger Aging Email
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                            Accounts Payable Aging
                        </h2>
                        <button className="text-slate-400 hover:text-indigo-600"><Download className="w-5 h-5" /></button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice No.</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aging Bucket</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Balance Due</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {agingData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{row.vendor}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{row.invoice}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold">{row.due} Days</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">₹ {row.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center text-sm">
                                            {row.status === "pending" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>}
                                            {row.status === "overdue" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Overdue</span>}
                                            {row.status === "critical" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">Critical</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
