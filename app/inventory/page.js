"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PlusCircle, QrCode, Search, CheckCircle2 } from "lucide-react";

const PAGE_HEADERS = {
  grn: {
    title: "Quick GRN",
    subtitle:
      "Fast goods receipt entry — generates Hex Tags for all received units.",
  },
  stock: {
    title: "Stock Overview",
    subtitle: "Live view of all raw materials and identified components.",
  },
  qc: {
    title: "Quality Control",
    subtitle:
      "Audit incoming GRNs, accept items, or process Return to Vendor (RTV).",
  },
  hex: {
    title: "Hex Tag Indexing",
    subtitle:
      "Scan unindexed tags and link them to exact technical specifications.",
  },
  tags: {
    title: "Tag Generator",
    subtitle: "Print bulk Hex Tags or specific component QR barcodes.",
  },
};

function InventoryContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "grn";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (["grn", "qc", "hex", "stock", "tags"].includes(tabFromUrl))
      setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.grn;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">{subtitle}</p>
        </div>

        {/* Tab switcher — mobile only */}
        <div className="md:hidden flex space-x-1 p-1 bg-slate-200/50 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("grn")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "grn"
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Quick GRN
          </button>
          <button
            onClick={() => setActiveTab("hex")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "hex"
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Hex Tag Indexing
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {activeTab === "grn" && <QuickGRN />}
          {activeTab === "qc" && <QualityControl />}
          {activeTab === "hex" && <HexIndexing />}
          {activeTab === "stock" && <StockOverview />}
          {activeTab === "tags" && <TagGenerator />}
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryContent />
    </Suspense>
  );
}

function QuickGRN() {
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
          <PlusCircle className="mr-2 text-indigo-600 h-6 w-6" />
          Quick GRN (Buffer Stock)
        </h2>
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
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Supplier Name
            </label>
            <input
              type="text"
              required
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Challan / Invoice No.
            </label>
            <input
              type="text"
              required
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="INV-2024-001"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item Description (General)
            </label>
            <input
              type="text"
              required
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="Transformers"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Quantity Received
            </label>
            <input
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            placeholder="Scan Hex Tag..."
            autoFocus
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center py-16">
        <QrCode className="h-12 w-12 text-slate-300 mb-4" />
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

function TagGenerator() {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900 flex items-center mb-6">
        Generate Inventory Tags
      </h2>
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
            defaultValue="50"
            className="block w-32 rounded-lg border-0 py-2.5 px-3 mb-4 shadow-sm ring-1 ring-inset ring-slate-200 text-sm"
          />
          <button className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 w-full">
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
            placeholder="Component Code"
            className="block w-full rounded-lg border-0 py-2.5 px-3 mb-4 shadow-sm ring-1 ring-inset ring-slate-200 text-sm"
          />
          <button className="bg-slate-800 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-slate-700 w-full">
            Print Direct Tags
          </button>
        </div>
      </div>
    </div>
  );
}

function QualityControl() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <CheckCircle2 className="mr-2 text-indigo-600 h-6 w-6" />
            QC Audits & RTV Processing
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Audit pending GRNs, finalize liabilities, or process Return to
            Vendor.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                GRN Ref
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Item / Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Audit Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            <tr className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-semibold text-indigo-600">
                GRN-2603-011
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 font-medium">
                Power Supply Unit{" "}
                <span className="text-slate-500">(500 Units)</span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                Global Tech
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                  Pending QC
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-bold rounded-lg hover:bg-emerald-200 transition-colors">
                    Accept All
                  </button>
                  <button className="px-3 py-1.5 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200 transition-colors">
                    Log RTV
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
