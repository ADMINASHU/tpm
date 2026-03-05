"use client";

import { RefreshCw, MapPin } from "lucide-react";

function StockTransfer() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <RefreshCw className="mr-2 text-indigo-600 h-6 w-6" aria-hidden="true" />
          Initiate Stock Transfer
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Move components or finished goods between logical factory stores.
        </p>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="source-store" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Source Store
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
              <select id="source-store" className="block w-full pl-10 rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                <option>Raw Material Store (Bengaluru)</option>
                <option>Production Store (Bengaluru)</option>
                <option>Finished Goods (Bengaluru)</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="dest-store" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Destination Store
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
              <select id="dest-store" className="block w-full pl-10 rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                <option>Production Store (Bengaluru)</option>
                <option>Raw Material Store (Bengaluru)</option>
                <option>Finished Goods (Bengaluru)</option>
                <option>Service Center (Bengaluru)</option>
              </select>
            </div>
          </div>
          <div className="col-span-2">
            <label htmlFor="item-tx" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item to Transfer
            </label>
            <input
              id="item-tx"
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="Scan Hex Tag or search Bulk Name..."
            />
          </div>
          <div>
            <label htmlFor="qty-tx" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Quantity
            </label>
            <input
              id="qty-tx"
              type="number"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="1"
            />
          </div>
          <div>
            <label htmlFor="item-cond" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item Condition
            </label>
            <select id="item-cond" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option value="NEW">New (Pristine)</option>
              <option value="REFURBISHED">Refurbished / Repaired</option>
              <option value="FAULTY">Faulty / Rejected</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
          >
            Commit Transfer
          </button>
        </div>
      </form>
    </div>
  );
}
export default StockTransfer;

