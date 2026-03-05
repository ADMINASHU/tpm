"use client";

import { Database } from "lucide-react";

function ProductConfig() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Finished Goods Catalog
        </h2>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm">
          + Add Product Model
        </button>
      </div>
      <p className="text-slate-500 text-sm">
        Define top-level products that map to BOMs for assembly.
      </p>
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center py-12">
        <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">
          No products defined yet. Add your first manufacturing model to begin.
        </p>
      </div>
    </div>
  );
}
export default ProductConfig;

