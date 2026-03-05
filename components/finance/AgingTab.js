"use client";

import { useState, useEffect } from "react";
import { Clock, Download } from "lucide-react";

const AGING_DATA = [
  { vendor: "Acme Corp", invoice: "INV-201", due: "0-30", amount: 32000, status: "pending" },
  { vendor: "Global Tech", invoice: "INV-198", due: "31-60", amount: 78000, status: "overdue" },
  { vendor: "Electro Components", invoice: "INV-185", due: "31-60", amount: 21000, status: "overdue" },
  { vendor: "Global Tech", invoice: "INV-410", due: "61-90", amount: 45000, status: "critical" },
  { vendor: "Electro Components", invoice: "INV-99", due: "90+", amount: 120000, status: "critical" },
];


const statusBadge = (s) =>
  ({
    pending: (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        Pending
      </span>
    ),
    overdue: (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        Overdue
      </span>
    ),
    critical: (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
        Critical
      </span>
    ),
  })[s];

function AgingTab() {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
          Accounts Payable Aging
        </h2>
        <button type="button" className="text-slate-400 hover:text-indigo-600">
          <Download className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Invoice No.
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Aging Bucket
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Balance Due
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {AGING_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                  {row.vendor}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                  {row.invoice}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold">
                    {row.due} Days
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                  â‚¹ {row.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  {statusBadge(row.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AgingTab;

