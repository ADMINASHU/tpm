"use client";

import { Search } from "lucide-react";

function StockOverview() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <p className="text-sm font-semibold text-slate-600">
          Total Unique Items:{" "}
          <span className="font-bold text-slate-900">142</span>
        </p>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="block w-full pl-9 py-2 rounded-lg border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            placeholder="Search inventory..."
          />
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-xs">
            <th className="pb-3 px-4">Item Code</th>
            <th className="pb-3 px-4">Description</th>
            <th className="pb-3 px-4">Category</th>
            <th className="pb-3 px-4 text-right">Qty Available</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          <tr className="hover:bg-slate-50">
            <td className="py-3 px-4 font-mono font-bold text-indigo-600">
              RES-10K-001
            </td>
            <td className="py-3 px-4 font-semibold text-slate-900">
              10k Ohm Resistor 1/4W
            </td>
            <td className="py-3 px-4 text-slate-500">Passives</td>
            <td className="py-3 px-4 text-right font-bold text-emerald-600">
              5,430
            </td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-3 px-4 font-mono font-bold text-indigo-600">
              CAP-22U-002
            </td>
            <td className="py-3 px-4 font-semibold text-slate-900">
              22uF Electrolytic Cap
            </td>
            <td className="py-3 px-4 text-slate-500">Passives</td>
            <td className="py-3 px-4 text-right font-bold text-emerald-600">
              1,200
            </td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="py-3 px-4 font-mono font-bold text-indigo-600">
              IC-MCU-AT32
            </td>
            <td className="py-3 px-4 font-semibold text-slate-900">
              ATmega328P Microcontroller
            </td>
            <td className="py-3 px-4 text-slate-500">Active ICs</td>
            <td className="py-3 px-4 text-right font-bold text-amber-600">
              120
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default StockOverview;

