"use client";

import { Wrench } from "lucide-react";

function SpareParts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Service & Spare Kits
        </h2>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm">
          + Add Spare Kit
        </button>
      </div>
      <p className="text-slate-500 text-sm">
        Configure subsets of components meant for field repairs instead of new
        builds.
      </p>
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center py-12">
        <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">
          Spare parts catalog is currently empty.
        </p>
      </div>
    </div>
  );
}

export default SpareParts;

