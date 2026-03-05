"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  LineChart,
  Mail,
  Clock,
  Download,
  BookOpenCheck,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart2,
  RefreshCw,
  Settings, Users, Info, Building, Plus, Server, Activity, GitBranch, Terminal,
  Moon, Globe, ShieldCheck, ToggleLeft, ToggleRight
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { version } from "@/package.json";

const AGING_DATA = [
  {
    vendor: "Acme Corp",
    invoice: "INV-001",
    due: "0-30",
    amount: 150000,
    status: "pending",
  },
  {
    vendor: "Global Tech",
    invoice: "INV-442",
    due: "31-60",
    amount: 85000,
    status: "overdue",
  },
  {
    vendor: "Global Tech",
    invoice: "INV-410",
    due: "61-90",
    amount: 45000,
    status: "critical",
  },
  {
    vendor: "Electro Components",
    invoice: "INV-99",
    due: "90+",
    amount: 120000,
    status: "critical",
  },
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
                  ₹ {row.amount.toLocaleString()}
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

const LEDGER_ENTRIES = [
  {
    date: "2026-02-28",
    ref: "PO-1042",
    description: "Raw Material Purchase — Acme Corp",
    type: "debit",
    amount: 150000,
  },
  {
    date: "2026-02-27",
    ref: "PMT-0891",
    description: "Vendor Payment — Global Tech",
    type: "credit",
    amount: 85000,
  },
  {
    date: "2026-02-26",
    ref: "PO-1039",
    description: "Electrical Components — Electro Comp",
    type: "debit",
    amount: 45000,
  },
  {
    date: "2026-02-25",
    ref: "PMT-0889",
    description: "Vendor Payment — Acme Corp",
    type: "credit",
    amount: 60000,
  },
  {
    date: "2026-02-24",
    ref: "PO-1031",
    description: "Packaging Material — Packrite Ltd",
    type: "debit",
    amount: 22000,
  },
  {
    date: "2026-02-23",
    ref: "PMT-0882",
    description: "Advance Payment — Pacrite Ltd",
    type: "credit",
    amount: 10000,
  },
];

function LedgerTab() {
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
            icon: ArrowDownLeft,
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
            icon: BarChart2,
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
              ₹ {Math.abs(value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Ledger table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <BookOpenCheck className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
            General Ledger
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
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ref
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Debit (₹)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Credit (₹)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Balance (₹)
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
                    {row.type === "debit" ? row.amount.toLocaleString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-600 text-right">
                    {row.type === "credit" ? row.amount.toLocaleString() : "—"}
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

// ── Costing & Automation Tab ─────────────────────────────────
function CostingTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rolling Overhead */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 items-center flex gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            Rolling Overhead Estimation
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Input last month's utility/rent to calculate daily Transfer Price
            baselines.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="prev-elec" className="block text-sm font-semibold text-slate-700 mb-1">
                Previous Month Electricity (₹)
              </label>
              <input
                id="prev-elec"
                type="number"
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="e.g. 150000"
              />
            </div>
            <div>
              <label htmlFor="prev-rent" className="block text-sm font-semibold text-slate-700 mb-1">
                Previous Month Rent (₹)
              </label>
              <input
                id="prev-rent"
                type="number"
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="e.g. 300000"
              />
            </div>
            <div>
              <label htmlFor="est-units" className="block text-sm font-semibold text-slate-700 mb-1">
                Estimated Monthly Production Units
              </label>
              <input
                id="est-units"
                type="number"
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="100"
              />
            </div>
            <button type="button" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl transition-colors">
              Calculate & Apply Baseline
            </button>
          </div>
        </div>

        {/* Monthly True-Up Variance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            Monthly True-Up Validation
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Reconcile estimated product transfer prices with actual utility
            expenses.
          </p>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
            <span className="text-sm font-semibold text-amber-800">
              Current Variance (Est vs Actual)
            </span>
            <div className="text-2xl font-black text-amber-700 mt-1">
              -₹12,450.00
            </div>
          </div>
          <button type="button" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Run True-Up Reconciliation
          </button>
        </div>

        {/* Category Master */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-start">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            Category Master & Ledger Control
          </h3>
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50">
              <div>
                <h4 className="font-semibold text-slate-800">
                  Machine Maintenance
                </h4>
                <p className="text-xs text-slate-500">Exp_Maint_01</p>
              </div>
              <label htmlFor="inc-maint" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input id="inc-maint" type="checkbox" className="sr-only" defaultChecked />
                  <div className="block bg-indigo-600 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4 text-xs flex items-center justify-center"></div>
                </div>
                <div className="ml-3 text-sm font-medium text-slate-700">
                  Include in Costing
                </div>
              </label>
            </div>
            <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50">
              <div>
                <h4 className="font-semibold text-slate-800">
                  Office Tea & Snacks
                </h4>
                <p className="text-xs text-slate-500">Exp_Admin_04</p>
              </div>
              <label htmlFor="inc-tea" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input id="inc-tea" type="checkbox" className="sr-only" />
                  <div className="block bg-slate-300 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition text-xs flex items-center justify-center"></div>
                </div>
                <div className="ml-3 text-sm font-medium text-slate-700">
                  Include in Costing
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
const PAGE_HEADERS = {
  aging: {
    title: "AP Aging Report",
    subtitle: "Track overdue vendor invoices and payment obligations.",
  },
  ledger: {
    title: "Ledger Book",
    subtitle: "General ledger with running balance across all transactions.",
  },
  costing: {
    title: "Financial Costing Engine",
    subtitle:
      "Configure overheads, view variances, and control ledger categories.",
  },
};

function FinanceContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "aging";

  const { title, subtitle } = PAGE_HEADERS[tab] || PAGE_HEADERS.aging;

  return (
    <div className="flex-1 p-8">
      <Breadcrumb
        pageName="Finance"
        subPageName={title}
        subtitle={subtitle}
      />
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-end items-start">
          {tab === "aging" && (
            <button type="button" className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
              <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
              Trigger Aging Email
            </button>
          )}
        </div>

        {tab === "aging" && <AgingTab />}
        {tab === "ledger" && <LedgerTab />}
        {tab === "costing" && <CostingTab />}
      </div>
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense>
      <FinanceContent />
    </Suspense>
  );
}
