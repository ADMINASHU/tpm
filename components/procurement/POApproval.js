"use client";

import { FileText, CheckCircle2 } from "lucide-react";

const PENDING_INDENTS = [
  { id: "IND-2024-081", dept: "Raw Material", item: "Capacitors 20uF", qty: 500, state: "Pending" },
  { id: "IND-2024-082", dept: "Production", item: "PCB Alpha-X", qty: 25, state: "Pending" },
];

function POApproval({ pageName = "Procurement" }) {
  const Breadcrumb = require("@/components/Breadcrumb").default;


  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <FileText className="mr-2 text-indigo-600 h-6 w-6" />
            Pending Indents & PO Generation
          </h2>
          <Breadcrumb pageName={pageName} subPageName="PO Approvals" />
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
            {PENDING_INDENTS.map((ind, i) => (
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
                  <button type="button" className="flex items-center bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 mr-1" aria-hidden="true" /> Split & Approve
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

export default POApproval;

