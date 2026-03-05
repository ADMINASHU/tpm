"use client";

import { useState } from "react";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

function QuickGRN({ pageName = "Inventory" }) {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <PlusCircle className="mr-2 text-indigo-600 h-6 w-6" aria-hidden="true" />
          Quick GRN (Buffer Stock)
        </h2>
        <Breadcrumb pageName={pageName} subPageName="Quick GRN" />
        <p className="text-sm text-slate-500 mt-1">
          Fast entry for unloading trucks. Generates Hex Tags for later
          indexing.
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 mr-3 text-emerald-600" />
          GRN Successfully Recorded! 5 Hex Tags generated.
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="supplier-name" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Supplier Name
            </label>
            <input
              id="supplier-name"
              type="text"
              required
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label htmlFor="challan-no" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Challan / Invoice No.
            </label>
            <input
              id="challan-no"
              type="text"
              required
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="INV-2024-001"
            />
          </div>
          <div>
            <label htmlFor="item-desc" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item Description (General)
            </label>
            <input
              id="item-desc"
              type="text"
              required
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="Transformers"
            />
          </div>
          <div>
            <label htmlFor="qty-received" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Quantity Received
            </label>
            <input
              id="qty-received"
              type="number"
              min="1"
              required
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="5"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Process GRN & Generate Tags
          </button>
        </div>
      </form>
    </div>
  );
}
export default QuickGRN;

