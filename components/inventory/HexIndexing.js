"use client";

import { QrCode, Search } from "lucide-react";

function HexIndexing() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <QrCode className="mr-2 text-indigo-600 h-6 w-6" />
            Hex Tag Indexing
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Scan unindexed tags and link them to exact technical specs.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            aria-label="Scan Hex Tag"
            className="block w-full pl-10 pr-3 py-2 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            placeholder="Scan Hex Tag..."
            autoFocus
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center py-16">
        <QrCode className="h-12 w-12 text-slate-300 mb-4" aria-hidden="true" />
        <h3 className="text-slate-900 font-semibold mb-1">
          Awaiting Scanner Input
        </h3>
        <p className="text-slate-500 text-sm max-w-sm">
          Please scan a printed 4-digit Hex Tag to begin indexing and assign
          technical specifications.
        </p>
      </div>
    </div>
  );
}
export default HexIndexing;

