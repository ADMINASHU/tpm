"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CopyPlus, FileText, CheckCircle2 } from "lucide-react";

const PAGE_HEADERS = {
  indent: {
    title: "Create Indent",
    subtitle:
      "Raise material requisitions for components reaching minimum buffer levels.",
  },
  po: {
    title: "PO Gen & Approvals",
    subtitle:
      "Review approved indents and generate purchase orders from vendor catalogs.",
  },
  suppliers: {
    title: "Supplier Config",
    subtitle: "Manage approved vendor list, contacts, and supply categories.",
  },
};

function ProcurementContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "indent";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (["indent", "po", "suppliers"].includes(tabFromUrl))
      setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.indent;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">{subtitle}</p>
        </div>

        {/* Tab switcher — mobile only, desktop uses navbar dropdown */}
        <div className="md:hidden flex space-x-1 p-1 bg-slate-200/50 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("indent")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "indent"
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Create Indent
          </button>
          <button
            onClick={() => setActiveTab("po")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "po"
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            PO Gen & Approvals
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {activeTab === "indent" && <IndentCreation />}
          {activeTab === "po" && <POApproval />}
          {activeTab === "suppliers" && <SupplierConfig />}
        </div>
      </div>
    </div>
  );
}

export default function ProcurementPage() {
  return (
    <Suspense>
      <ProcurementContent />
    </Suspense>
  );
}

function IndentCreation() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <CopyPlus className="mr-2 text-indigo-600 h-6 w-6" />
          Raise Requisition (Indent)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Material requisition for components reaching minimum buffer levels.
        </p>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Requesting Department
            </label>
            <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option>Production Store</option>
              <option>Raw Material Store</option>
              <option>Projects / Setup</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item Required
            </label>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. 10k Ohm Resistors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Quantity Requested
            </label>
            <input
              type="number"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Tracking Type Needed
            </label>
            <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option>Bulk (Quantity only)</option>
              <option>Hex Tag (QR individual)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all"
          >
            Submit Indent for Approval
          </button>
        </div>
      </form>

      <div className="mt-12 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Auto-Replenishment System
        </h3>
        <p className="text-sm text-indigo-700 mb-4">
          The system monitors inventory levels and generates automatic indents
          when stock drops below minimum buffer thresholds.
        </p>

        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div>
            <p className="font-semibold text-slate-800">
              Current Deficient Items:{" "}
              <span className="text-red-600">3 SKUs</span>
            </p>
            <p className="text-xs text-slate-500">Last checked: 10 mins ago</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
            Trigger Auto-Indent Batch
          </button>
        </div>
      </div>
    </div>
  );
}

function POApproval() {
  const pendingIndents = [
    {
      id: "IND-2024-081",
      dept: "Raw Material",
      item: "Capacitors 20uF",
      qty: 500,
      state: "Pending",
    },
    {
      id: "IND-2024-082",
      dept: "Production",
      item: "PCB Alpha-X",
      qty: 25,
      state: "Pending",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <FileText className="mr-2 text-indigo-600 h-6 w-6" />
            Pending Indents & PO Generation
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review indents and automatically generate PO from pre-negotiated
            Vendor catalogs.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                Indent No
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                Item Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pendingIndents.map((ind, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-indigo-600">
                  {ind.id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 font-medium">
                  {ind.dept}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 font-semibold">
                  {ind.item}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {ind.qty}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button className="flex items-center bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Split & Approve
                    POs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupplierConfig() {
  const [showForm, setShowForm] = useState(false);
  const suppliers = [
    {
      name: "Acme Corp",
      category: "Electronic Components",
      contact: "acme@supply.com",
      rating: 5,
      status: "Approved",
    },
    {
      name: "Global Tech",
      category: "PCB & Assemblies",
      contact: "gt@global.com",
      rating: 4,
      status: "Approved",
    },
    {
      name: "Electro Components",
      category: "Passive Components",
      contact: "info@electro.in",
      rating: 3,
      status: "On Hold",
    },
    {
      name: "Packrite Ltd",
      category: "Packaging Materials",
      contact: "pack@packrite.com",
      rating: 4,
      status: "Approved",
    },
  ];
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const statusColor = {
    Approved: "bg-emerald-100 text-emerald-700",
    "On Hold": "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Approved Suppliers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm"
        >
          + Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">New Supplier</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Supplier Name"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="text"
              placeholder="Category (e.g. PCB & Assemblies)"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="email"
              placeholder="Contact Email"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="text"
              placeholder="Phone / GST No."
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl">
              Save Supplier
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <th className="pb-3">Supplier</th>
            <th className="pb-3">Category</th>
            <th className="pb-3">Contact</th>
            <th className="pb-3">Rating</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {suppliers.map((s) => (
            <tr key={s.name} className="hover:bg-slate-50 transition-colors">
              <td className="py-3.5 font-bold text-slate-900">{s.name}</td>
              <td className="py-3.5 text-slate-500 text-xs">{s.category}</td>
              <td className="py-3.5 text-slate-500">{s.contact}</td>
              <td className="py-3.5">
                <div className="text-amber-500 font-semibold tracking-tight text-xs flex items-center gap-1">
                  {stars(s.rating)}
                  <span className="text-slate-400 text-[10px] ml-1">
                    (Q: 95% • D: {s.rating * 18}%)
                  </span>
                </div>
              </td>
              <td className="py-3.5">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[s.status]}`}
                >
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
