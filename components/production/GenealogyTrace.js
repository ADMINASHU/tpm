"use client";

import { Search, Database } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

function GenealogyTrace({ pageName = "Production" }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Search className="mr-2 text-indigo-600 h-6 w-6" />
              Serial Number Genealogy
            </h2>
            <Breadcrumb pageName={pageName} subPageName="Genealogy Trace" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Trace all internal components, suppliers, and assigned operator via
            Serial Number.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            placeholder="Enter Serial Number..."
          />
        </div>
      </div>

      {/* Mock Traced Data */}
      <div className="mt-8 border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">
              Product:{" "}
              <span className="text-indigo-600">
                Model X Server (B26020001)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Manufactured on 2026-02-28 â€¢ Operator: John Doe
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            Passed QC
          </span>
        </div>
        <div className="p-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Component Traceability Tree
          </h4>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Database className="w-5 h-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">Mainboard PCBA</div>
                  <div className="font-mono text-xs text-indigo-600">
                    HX-MB-9012
                  </div>
                </div>
                <div className="text-slate-500 text-xs">
                  Supplier: Global Tech (GRN-442) â€¢ Received: 2026-02-20
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Database className="w-5 h-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">
                    Power Supply Unit
                  </div>
                  <div className="font-mono text-xs text-indigo-600">
                    HX-PSU-4411
                  </div>
                </div>
                <div className="text-slate-500 text-xs">
                  Supplier: Electro Components (GRN-391) â€¢ Received: 2026-02-15
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default GenealogyTrace;

