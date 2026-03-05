"use client";

import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, History, CreditCard, Receipt, Building2 } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";


const LEDGER_ENTRIES = [
  {
    date: "2026-02-28",
    ref: "PO-1042",
    description: "Raw Material Purchase â€” Acme Corp",
    type: "debit",
    amount: 150000,
  },
  {
    date: "2026-02-27",
    ref: "PMT-0891",
    description: "Vendor Payment â€” Global Tech",
    type: "credit",
    amount: 85000,
  },
  {
    date: "2026-02-26",
    ref: "PO-1039",
    description: "Electrical Components â€” Electro Comp",
    type: "debit",
    amount: 45000,
  },
  {
    date: "2026-02-25",
    ref: "PMT-0889",
    description: "Vendor Payment â€” Acme Corp",
    type: "credit",
    amount: 60000,
  },
  {
    date: "2026-02-24",
    ref: "PO-1031",
    description: "Packaging Material â€” Packrite Ltd",
    type: "debit",
    amount: 22000,
  },
  {
    date: "2026-02-23",
    ref: "PMT-0882",
    description: "Advance Payment â€” Pacrite Ltd",
    type: "credit",
    amount: 10000,
  },
];

function LedgerTab({ pageName = "Finance" }) {
  let running = 0;
  const rows = LEDGER_ENTRIES.map((e) => {
    running += e.type === "debit" ? e.amount : -e.amount;
    return { ...e, balance: running };
  });

  const totalDebit = LEDGER_ENTRIES
    .filter((e) => e.type === "debit")
    .reduce((s, e) => s + e.amount, 0);
  const totalCredit = LEDGER_ENTRIES
    .filter((e) => e.type === "credit")
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Debits",
            value: totalDebit,
            color: "rose",
            icon: ArrowDownRight,
          },
          {
            label: "Total Credits",
            value: totalCredit,
            color: "emerald",
            icon: ArrowUpRight,
          },
          {
            label: "Net Balance",
            value: totalDebit - totalCredit,
            color: "indigo",
            icon: Building2,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-5`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 text-${color}-500`} aria-hidden="true" />
              <span
                className={`text-xs font-bold text-${color}-600 uppercase tracking-wide`}
              >
                {label}
              </span>
            </div>
            <p className={`text-2xl font-black text-${color}-700`}>
              â‚¹ {Math.abs(value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Ledger table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Ledger Transaction History
            </h2>
            <Breadcrumb pageName={pageName} subPageName="Ledger Book" />
          </div>
          <button type="button" className="text-slate-400 hover:text-indigo-600">
            <Download className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ref
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Debit (â‚¹)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Credit (â‚¹)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Balance (â‚¹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-indigo-600 font-semibold">
                    {row.ref}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {row.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-rose-600 text-right">
                    {row.type === "debit" ? row.amount.toLocaleString() : "â€”"}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-600 text-right">
                    {row.type === "credit" ? row.amount.toLocaleString() : "â€”"}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                    {row.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default LedgerTab;

