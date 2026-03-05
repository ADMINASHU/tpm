"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";

function TagGenerator({ pageName = "Inventory" }) {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900 flex items-center mb-1">
        Generate Inventory Tags
      </h2>
      <Breadcrumb pageName={pageName} subPageName="Tag Generator" />
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
          <h3 className="font-bold text-indigo-900 mb-2">
            Bulk Empty Hex Tags
          </h3>
          <p className="text-sm text-indigo-700/80 mb-4">
            Print sheets of blank 4-digit hex QR codes for incoming GRN mapping.
          </p>
          <input
            type="number"
            aria-label="Number of bulk hex tags"
            defaultValue="50"
            className="block w-32 rounded-lg border-0 py-2.5 px-3 mb-4 shadow-sm ring-1 ring-inset ring-slate-200 text-sm"
          />
          <button type="button" className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 w-full">
            Print Empty Hex Tags
          </button>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
          <h3 className="font-bold text-slate-900 mb-2">
            Specific Component Tags
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Print labels mapped to a specific known component code.
          </p>
          <input
            type="text"
            aria-label="Component Code"
            placeholder="Component Code"
            className="block w-full rounded-lg border-0 py-2.5 px-3 mb-4 shadow-sm ring-1 ring-inset ring-slate-200 text-sm"
          />
          <button type="button" className="bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-slate-700 w-full">
            Print Direct Tags
          </button>
        </div>
      </div>
    </div>
  );
}
export default TagGenerator;

