"use client";

import { CheckCircle2 } from "lucide-react";

function QualityControl() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <CheckCircle2 className="mr-2 text-indigo-600 h-6 w-6" />
            QC Audits & RTV Processing
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Audit pending GRNs, finalize liabilities, or process Return to
            Vendor.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                GRN Ref
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Item / Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Audit Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            <tr className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-semibold text-indigo-600">
                GRN-2603-011
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 font-medium">
                Power Supply Unit{" "}
                <span className="text-slate-500">(500 Units)</span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                Global Tech
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                  Pending QC
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-bold rounded-lg hover:bg-emerald-200 transition-colors">
                    Accept All
                  </button>
                  <button className="px-3 py-1.5 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200 transition-colors">
                    Log RTV
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QualityControl;

