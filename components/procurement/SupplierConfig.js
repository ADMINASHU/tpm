"use client";

import { useState } from "react";
import { Users, Mail, Phone, MapPin } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

const SUPPLIERS_LIST = [
  { name: "Acme Corp", category: "Electronic Components", contact: "acme@supply.com", rating: 5, status: "Approved" },
  { name: "Global Tech", category: "PCB & Assemblies", contact: "gt@global.com", rating: 4, status: "Approved" },
  { name: "Electro Components", category: "Passive Components", contact: "info@electro.in", rating: 3, status: "On Hold" },
  { name: "Packrite Ltd", category: "Packaging Materials", contact: "pack@packrite.com", rating: 4, status: "Approved" },
];

function SupplierConfig({ pageName = "Procurement" }) {
  const [showForm, setShowForm] = useState(false);
  const stars = (n) => "â˜…".repeat(n) + "â˜†".repeat(5 - n);
  const statusColor = {
    Approved: "bg-emerald-100 text-emerald-700",
    "On Hold": "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Approved Supplier Directory
          </h2>
          <Breadcrumb pageName={pageName} subPageName="Supplier Config" />
        </div>
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
              aria-label="Supplier Name"
              placeholder="Supplier Name"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="text"
              aria-label="Category"
              placeholder="Category (e.g. PCB & Assemblies)"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="email"
              aria-label="Contact Email"
              placeholder="Contact Email"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="text"
              aria-label="Phone or GST No."
              placeholder="Phone / GST No."
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button type="button" className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl">
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
          {SUPPLIERS_LIST.map((s) => (
            <tr key={s.name} className="hover:bg-slate-50 transition-colors">
              <td className="py-3.5 font-bold text-slate-900">{s.name}</td>
              <td className="py-3.5 text-slate-500 text-xs">{s.category}</td>
              <td className="py-3.5 text-slate-500">{s.contact}</td>
              <td className="py-3.5">
                <div className="text-amber-500 font-semibold tracking-tight text-xs flex items-center gap-1">
                  {stars(s.rating)}
                  <span className="text-slate-400 text-[10px] ml-1">
                    (Q: 95% â€¢ D: {s.rating * 18}%)
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

export default SupplierConfig;

