"use client";

import { CopyPlus, CheckCircle2 } from "lucide-react";

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
            <label htmlFor="req-dept" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Requesting Department
            </label>
            <select id="req-dept" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option>Production Store</option>
              <option>Raw Material Store</option>
              <option>Projects / Setup</option>
            </select>
          </div>
          <div>
            <label htmlFor="item-req" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item Required
            </label>
            <input
              id="item-req"
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. 10k Ohm Resistors"
            />
          </div>
          <div>
            <label htmlFor="qty-req" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Quantity Requested
            </label>
            <input
              id="qty-req"
              type="number"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="1000"
            />
          </div>
          <div>
            <label htmlFor="track-type" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Tracking Type Needed
            </label>
            <select id="track-type" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
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
          <button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
            Trigger Auto-Indent Batch
          </button>
        </div>
      </div>
    </div>
  );
}

export default IndentCreation;

