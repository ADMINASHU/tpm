"use client";

import { BarChart2, Clock, RefreshCw, BookOpenCheck } from "lucide-react";



// â”€â”€ Costing & Automation Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                Previous Month Electricity (â‚¹)
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
                Previous Month Rent (â‚¹)
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
              -â‚¹12,450.00
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
export default CostingTab;

